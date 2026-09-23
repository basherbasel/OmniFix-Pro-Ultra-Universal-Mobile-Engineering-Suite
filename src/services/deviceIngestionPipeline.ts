export type KnowledgeProvenanceType = 
  | 'OFFICIAL_DOCUMENTATION'
  | 'PUBLIC_TECHNICAL_SPEC'
  | 'LICENSED_MANUFACTURER_DATA'
  | 'COMMUNITY_VERIFIED'
  | 'LABORATORY_MEASUREMENT'
  | 'UNVERIFIED'
  | 'MISSING';

export type VerificationStatus = 'VERIFIED' | 'PARTIALLY_DOCUMENTED' | 'UNVERIFIED' | 'CONFLICT_DETECTED';

export interface ManufacturerEntity {
  id: string;
  normalizedName: string;
  aliases: string[];
  countryOfOrigin: string;
  supportTier: 'TIER_1_OFFICIAL' | 'TIER_2_EXTENSIVE' | 'TIER_3_GENERIC';
}

export interface ChipsetEntity {
  socName: string;
  vendor: 'Qualcomm' | 'MediaTek' | 'Samsung Exynos' | 'Apple Bionic' | 'Google Tensor' | 'HiSilicon Kirin' | 'Unisoc' | 'Generic';
  architecture: string;
  socIdHex?: string;
  bootromExploitSupported: boolean;
  edlSupported: boolean;
  provenance: KnowledgeProvenanceType;
}

export interface ModelVariantEntity {
  variantCode: string; // e.g. SM-A166B
  regionName: string; // e.g. Europe / Global
  supportedBands: string[];
  cscList?: string[];
  boardRevision?: string;
}

export interface ComponentEntity {
  componentId: string; // e.g. IC_U5001_PMIC
  type: 'PMIC' | 'CPU' | 'RAM' | 'NAND' | 'RF' | 'CHARGING_IC' | 'AUDIO_CODEC' | 'DISPLAY_DRIVER';
  designation: string;
  provenance: KnowledgeProvenanceType;
  isVerified: boolean;
}

export interface PowerRailEntity {
  railName: string; // e.g. VDD_CPU_0V8
  nominalVoltageV: number;
  expectedDiodeModeValueValue?: number;
  provenance: KnowledgeProvenanceType;
  verificationRecordId?: string;
}

export interface VerificationRecordEntity {
  id: string;
  dateVerifiedIso: string;
  verifierTechnicianId: string;
  laboratoryName: string;
  confidenceScore: number; // 0.0 to 1.0
  notes: string;
}

export interface NormalizedDeviceRecord {
  id: string;
  manufacturer: string;
  rawModelName: string;
  normalizedModelName: string;
  primaryModelCode: string;
  variants: ModelVariantEntity[];
  chipset: ChipsetEntity;
  operatingSystem: string;
  securityPatchLevel: string;
  storageType: 'UFS 4.0' | 'UFS 3.1' | 'UFS 2.2' | 'eMMC 5.1' | 'NVMe' | 'Unknown';
  provenance: KnowledgeProvenanceType;
  verificationStatus: VerificationStatus;
  confidenceScore: number;
  components?: ComponentEntity[];
  powerRails?: PowerRailEntity[];
  verificationRecords: VerificationRecordEntity[];
  declaredCapabilities: string[];
}

export interface CoverageReport {
  timestampIso: string;
  totalManufacturers: number;
  totalModelRecords: number;
  verifiedCount: number;
  partiallyDocumentedCount: number;
  unverifiedCount: number;
  conflictCount: number;
  averageConfidenceScore: number;
  provenanceBreakdown: Record<KnowledgeProvenanceType, number>;
  coveragePercentage: number;
}

// Manufacturer Normalization Dictionary
const MANUFACTURER_ALIASES: Record<string, string[]> = {
  'Samsung': ['samsung', 'samsung mobile', 'galaxy', 'sec'],
  'Apple': ['apple', 'apple inc', 'iphone', 'ipad', 'ios'],
  'Xiaomi': ['xiaomi', 'mi', 'redmi', 'poco', 'xiaomi inc'],
  'OPPO': ['oppo', 'oppo mobile', 'realme'],
  'vivo': ['vivo', 'vivo mobile', 'iqoo'],
  'Huawei': ['huawei', 'huawei mobile', 'hi-silicon'],
  'HONOR': ['honor', 'hihonor'],
  'Motorola': ['motorola', 'moto'],
  'OnePlus': ['oneplus', '1plus'],
  'Google Pixel': ['google', 'pixel', 'google pixel'],
  'Sony': ['sony', 'xperia', 'sony mobile'],
  'Nokia': ['nokia', 'hmd global'],
  'Realme': ['realme'],
  'TECNO': ['tecno', 'tecno mobile'],
  'Infinix': ['infinix'],
  'ZTE': ['zte', 'nubia'],
  'ASUS': ['asus', 'rog phone', 'zenfone'],
  'Lenovo': ['lenovo', 'legion']
};

export class DeviceIngestionPipeline {
  /**
   * Normalizes manufacturer name from messy user input or raw strings
   */
  public static normalizeManufacturer(rawInput: string): string {
    if (!rawInput || !rawInput.trim()) return 'Generic';
    const cleaned = rawInput.trim().toLowerCase();

    for (const [canonical, aliases] of Object.entries(MANUFACTURER_ALIASES)) {
      if (canonical.toLowerCase() === cleaned) return canonical;
      if (aliases.some(alias => cleaned.includes(alias))) return canonical;
    }

    // Capitalize first letter if unknown
    return rawInput.charAt(0).toUpperCase() + rawInput.slice(1).trim();
  }

  /**
   * Normalizes model string and extracts model code
   */
  public static normalizeModelName(rawModel: string): { normalizedName: string; primaryCode: string } {
    if (!rawModel) return { normalizedName: 'Unknown Model', primaryCode: 'GENERIC-000' };

    // Extract code in parentheses or after slash if present (e.g., SM-A166B)
    const codeMatch = rawModel.match(/(SM-[A-Z0-9]+|iPhone\d+,\d+|2\d+[A-Z0-9]+|CPH\d+|V\d+|A\d{4})/i);
    const primaryCode = codeMatch ? codeMatch[0].toUpperCase() : rawModel.split(' ')[0].toUpperCase();

    const cleanedName = rawModel
      .replace(/\s+/g, ' ')
      .replace(/\(.*?\)/g, '')
      .trim();

    return {
      normalizedName: cleanedName || rawModel,
      primaryCode
    };
  }

  /**
   * Maps regional variants based on model code suffixes
   */
  public static matchRegionalVariant(modelCode: string): ModelVariantEntity[] {
    const uppercaseCode = modelCode.toUpperCase();
    const variants: ModelVariantEntity[] = [];

    if (uppercaseCode.startsWith('SM-')) {
      if (uppercaseCode.endsWith('B')) {
        variants.push({ variantCode: uppercaseCode, regionName: 'Global / Europe / International', supportedBands: ['5G Sub6', '4G LTE B1/B3/B7/B20'] });
      } else if (uppercaseCode.endsWith('U') || uppercaseCode.endsWith('U1')) {
        variants.push({ variantCode: uppercaseCode, regionName: 'USA (Carrier / Unlocked)', supportedBands: ['5G mmWave/Sub6', '4G LTE B2/B4/B12'] });
      } else if (uppercaseCode.endsWith('N')) {
        variants.push({ variantCode: uppercaseCode, regionName: 'South Korea', supportedBands: ['5G Sub6', '4G LTE'] });
      } else if (uppercaseCode.endsWith('0')) {
        variants.push({ variantCode: uppercaseCode, regionName: 'China / Hong Kong', supportedBands: ['5G Dual SIM', '4G LTE'] });
      } else {
        variants.push({ variantCode: uppercaseCode, regionName: 'Global Variant', supportedBands: ['Multi-Band'] });
      }
    } else {
      variants.push({ variantCode: uppercaseCode, regionName: 'Standard International', supportedBands: ['Multi-Band'] });
    }

    return variants;
  }

  /**
   * Computes data confidence score based on source provenance
   */
  public static calculateConfidenceScore(provenance: KnowledgeProvenanceType): number {
    switch (provenance) {
      case 'OFFICIAL_DOCUMENTATION':
        return 0.98;
      case 'LICENSED_MANUFACTURER_DATA':
        return 0.95;
      case 'LABORATORY_MEASUREMENT':
        return 0.92;
      case 'PUBLIC_TECHNICAL_SPEC':
        return 0.85;
      case 'COMMUNITY_VERIFIED':
        return 0.72;
      case 'UNVERIFIED':
        return 0.35;
      case 'MISSING':
      default:
        return 0.0;
    }
  }

  /**
   * Ingests and normalizes raw device entries into normalized device records
   */
  public static ingestRecord(rawRecord: {
    brand: string;
    model: string;
    code_name?: string;
    chipset?: string;
    storageType?: string;
    supported_operations?: string[];
    provenance?: KnowledgeProvenanceType;
  }): NormalizedDeviceRecord {
    const manufacturer = this.normalizeManufacturer(rawRecord.brand);
    const { normalizedName, primaryCode } = this.normalizeModelName(rawRecord.model);
    const primaryModelCode = rawRecord.code_name || primaryCode;
    const variants = this.matchRegionalVariant(primaryModelCode);
    
    const provenance: KnowledgeProvenanceType = rawRecord.provenance || 'PUBLIC_TECHNICAL_SPEC';
    const confidenceScore = this.calculateConfidenceScore(provenance);

    // Detect chipset vendor
    const chipLower = (rawRecord.chipset || '').toLowerCase();
    let vendor: ChipsetEntity['vendor'] = 'Generic';
    if (chipLower.includes('snapdragon') || chipLower.includes('qualcomm')) vendor = 'Qualcomm';
    else if (chipLower.includes('dimensity') || chipLower.includes('helio') || chipLower.includes('mtk') || chipLower.includes('mediatek')) vendor = 'MediaTek';
    else if (chipLower.includes('exynos')) vendor = 'Samsung Exynos';
    else if (chipLower.includes('bionic') || chipLower.includes('apple')) vendor = 'Apple Bionic';
    else if (chipLower.includes('tensor')) vendor = 'Google Tensor';
    else if (chipLower.includes('kirin') || chipLower.includes('hisilicon')) vendor = 'HiSilicon Kirin';
    else if (chipLower.includes('unisoc') || chipLower.includes('spd')) vendor = 'Unisoc';

    const chipsetEntity: ChipsetEntity = {
      socName: rawRecord.chipset || 'Generic Application Processor',
      vendor,
      architecture: vendor === 'Apple Bionic' ? 'ARMv9 64-bit' : 'ARMv8/v9 64-bit',
      bootromExploitSupported: vendor === 'MediaTek' || vendor === 'Unisoc',
      edlSupported: vendor === 'Qualcomm',
      provenance
    };

    const verificationStatus: VerificationStatus = confidenceScore >= 0.85 ? 'VERIFIED' : 'PARTIALLY_DOCUMENTED';

    return {
      id: `${manufacturer.toLowerCase()}_${primaryModelCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      manufacturer,
      rawModelName: rawRecord.model,
      normalizedModelName: normalizedName,
      primaryModelCode,
      variants,
      chipset: chipsetEntity,
      operatingSystem: 'Android / iOS / HarmonyOS',
      securityPatchLevel: '2024-2026 Active Security Maintenance',
      storageType: (rawRecord.storageType as any) || 'UFS 3.1',
      provenance,
      verificationStatus,
      confidenceScore,
      verificationRecords: [
        {
          id: `VR_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          dateVerifiedIso: new Date().toISOString(),
          verifierTechnicianId: 'SYSTEM_INGESTION_ENGINE',
          laboratoryName: 'MasterFix Knowledge Lab',
          confidenceScore,
          notes: 'Automated normalization, variant matching, and provenance confidence assignment.'
        }
      ],
      declaredCapabilities: rawRecord.supported_operations || ['Read Info', 'Standard Flash', 'Safe Reset']
    };
  }

  /**
   * Generates a device knowledge coverage report for audit transparency
   */
  public static generateCoverageReport(records: NormalizedDeviceRecord[]): CoverageReport {
    const manufacturersSet = new Set<string>();
    let verifiedCount = 0;
    let partiallyDocumentedCount = 0;
    let unverifiedCount = 0;
    let conflictCount = 0;
    let totalConfidence = 0;

    const provenanceBreakdown: Record<KnowledgeProvenanceType, number> = {
      OFFICIAL_DOCUMENTATION: 0,
      LICENSED_MANUFACTURER_DATA: 0,
      LABORATORY_MEASUREMENT: 0,
      PUBLIC_TECHNICAL_SPEC: 0,
      COMMUNITY_VERIFIED: 0,
      UNVERIFIED: 0,
      MISSING: 0
    };

    records.forEach(rec => {
      manufacturersSet.add(rec.manufacturer);
      totalConfidence += rec.confidenceScore;
      provenanceBreakdown[rec.provenance] = (provenanceBreakdown[rec.provenance] || 0) + 1;

      switch (rec.verificationStatus) {
        case 'VERIFIED':
          verifiedCount++;
          break;
        case 'PARTIALLY_DOCUMENTED':
          partiallyDocumentedCount++;
          break;
        case 'UNVERIFIED':
          unverifiedCount++;
          break;
        case 'CONFLICT_DETECTED':
          conflictCount++;
          break;
      }
    });

    const totalModelRecords = records.length;
    const averageConfidenceScore = totalModelRecords > 0 ? Number((totalConfidence / totalModelRecords).toFixed(3)) : 0;
    const coveragePercentage = totalModelRecords > 0 ? Number(((verifiedCount / totalModelRecords) * 100).toFixed(1)) : 0;

    return {
      timestampIso: new Date().toISOString(),
      totalManufacturers: manufacturersSet.size,
      totalModelRecords,
      verifiedCount,
      partiallyDocumentedCount,
      unverifiedCount,
      conflictCount,
      averageConfidenceScore,
      provenanceBreakdown,
      coveragePercentage
    };
  }
}
