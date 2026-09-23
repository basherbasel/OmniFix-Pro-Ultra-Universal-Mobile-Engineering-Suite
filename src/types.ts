export interface OemDeviceRecord {
  brand: string;
  model: string;
  code_name: string;
  chipset: string;
  supported_operations: string[];
}

export type ChipsetType = 
  | 'mediatek' 
  | 'qualcomm' 
  | 'samsung_exynos' 
  | 'unisoc_spd' 
  | 'hisilicon_kirin' 
  | 'apple_ios' 
  | 'google_tensor' 
  | 'generic_adb';

export type DeviceMode = 
  | 'ADB_ONLINE' 
  | 'FASTBOOT' 
  | 'FASTBOOTD' 
  | 'EDL_9008' 
  | 'MTK_BROM' 
  | 'MTK_PRELOADER' 
  | 'SAMSUNG_DOWNLOAD' 
  | 'SPD_DIAG' 
  | 'HUAWEI_COM1' 
  | 'RECOVERY_SIDELOAD' 
  | 'APPLE_DFU' 
  | 'APPLE_RECOVERY' 
  | 'ROOT' 
  | 'DISCONNECTED';

export interface WebUsbDeviceInfo {
  connected: boolean;
  isRealHardware: boolean;
  vendorIdHex: string;
  productIdHex: string;
  manufacturerName?: string;
  productName?: string;
  serialNumber?: string;
  deviceClass?: number;
  deviceProtocol?: number;
  usbVersionMajor?: number;
  transferSpeed?: string;
  endpointsCount?: number;
  baudRate?: number;
  claimedInterface?: number;
}

export interface ConnectedDevice {
  id: string;
  brand: string;
  model: string;
  marketName: string;
  chipset: ChipsetType;
  chipsetName: string;
  socId: string;
  mode: DeviceMode;
  port: string;
  vidPid: string;
  serialNumber: string;
  imei1: string;
  imei2: string;
  basebandVersion: string;
  androidVersion: string;
  securityPatch: string;
  buildNumber: string;
  bootloaderStatus: 'LOCKED' | 'UNLOCKED' | 'RELOCKED' | 'TAMPERED';
  frpStatus: 'ON' | 'OFF' | 'LOCKED';
  knoxStatus?: '0x0 (Valid)' | '0x1 (Tripped)';
  storageType: 'UFS 4.0' | 'UFS 3.1' | 'UFS 2.2' | 'eMMC 5.1' | 'NVMe';
  storageSizeGb: number;
  batteryLevel: number;
  rollbackIndex: number;
  cscCode?: string;
  carrier?: string;
  slotActive?: 'a' | 'b';
  kgStatus?: 'Prenormal' | 'Checking' | 'Completed' | 'Locked';
  rawParameters?: Record<string, string>;
  // Live Telemetry & Health Metrics
  cpuTempCelsius?: number;
  cpuUsagePercent?: number;
  ramUsagePercent?: number;
  ramTotalGb?: number;
  batteryVoltageMv?: number;
  batteryTempCelsius?: number;
  batteryCycleCount?: number;
  batteryHealth?: 'Good' | 'Fair' | 'Replace Soon' | 'Overheat';
  storageUsedGb?: number;
}

export interface FixAiDiagnosticResult {
  issue_type: 'Software Glitch' | 'Firmware Incompatibility' | 'Hardware Failure';
  root_cause: string;
  confidence_score: number;
  recommended_action: {
    software_fix?: string[];
    hardware_guide?: string;
  };
  telemetry_check?: {
    battery_ok: boolean;
    anti_rollback_ok: boolean;
    checksum_verified: boolean;
  };
  component_specs?: {
    target_ic?: string;
    diode_value?: string;
    voltage_rail?: string;
  };
}

export interface PartitionInfo {
  name: string;
  startSector: string;
  sizeMb: number;
  type: string;
  filename?: string;
  backedUp?: boolean;
  essential: boolean;
}

export interface ProtocolLogItem {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error' | 'hex' | 'raw_usb';
  tag: string;
  message: string;
  hexDump?: string;
}

export interface FirmwareFile {
  type: 'BL' | 'AP' | 'CP' | 'CSC' | 'PIT' | 'SCATTER' | 'RAWPROGRAM' | 'PATCH' | 'FIREHOSE' | 'DA' | 'PAC' | 'IPSW';
  filename: string;
  sizeBytes: number;
  md5: string;
  status: 'READY' | 'VERIFYING' | 'FLASHING' | 'COMPLETED' | 'ERROR';
}

export interface FaultRepairItem {
  id: string;
  titleAr: string;
  titleEn: string;
  category: 'BOOT' | 'SECURITY' | 'NETWORK' | 'HARDWARE' | 'SYSTEM' | 'DATA';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  supportedModes: DeviceMode[];
  supportedChipsets: ChipsetType[];
  riskAr: string;
  riskEn: string;
  protocolPipeline: {
    stepNumber: number;
    actionAr: string;
    actionEn: string;
    commandPreview?: string;
    protocolCode?: string;
  }[];
}

export interface DiagnosticIssue {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  category: 'KERNEL_PANIC' | 'BOOTLOOP' | 'STORAGE_WEAR' | 'FRP_LOCK' | 'BASEBAND_NULL' | 'PARTITION_CORRUPTION' | 'ROLLBACK_MISMATCH';
  title: string;
  description: string;
  rootCause: string;
  evidence: string;
  suggestedFix: string;
  oneClickAction?: string;
}

export interface FrpMethod {
  id: string;
  name: string;
  targetChipsets: ChipsetType[];
  supportedAndroid: string;
  modeRequired: DeviceMode;
  successRate: number;
  riskLevel: 'SAFE' | 'MODERATE' | 'HIGH';
  description: string;
  protocolSteps: string[];
}

export interface GeneratedCodeSnippet {
  language: 'cpp' | 'python' | 'rust' | 'typescript';
  title: string;
  filename: string;
  description: string;
  code: string;
}

// ---------------- REPAIR MANAGEMENT & CRM TYPES ----------------

export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'AWAITING_PARTS' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';

export interface ClientRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  totalSpent: number;
  lastVisit: string;
}

export interface RepairTicket {
  id: string;
  clientId: string;
  clientName: string;
  deviceModel: string;
  imei: string;
  faultDescription: string;
  estimatedCost: number;
  deposit: number;
  status: TicketStatus;
  priority: 'NORMAL' | 'URGENT' | 'VIP';
  createdAt: string;
  updatedAt: string;
  technicianName: string;
  partsUsed: { partId: string; name: string; cost: number }[];
  diagnosisReport?: FixAiDiagnosticResult;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'IC' | 'SCREEN' | 'FLEX' | 'BATTERY' | 'TOOL';
  stock: number;
  minStock: number;
  cost: number;
  price: number;
  compatibility: string[];
}

export interface BusinessAnalytics {
  totalRevenue: number;
  totalProfit: number;
  ticketsCompleted: number;
  averageRepairTime: number;
  topFaults: { fault: string; count: number }[];
}

// ---------------- CLOUD SECURITY & ZERO-DAY EXPLOIT TYPES ----------------

export interface CloudSecurityBulletin {
  id: string;
  cveId: string;
  titleAr: string;
  titleEn: string;
  targetBrand: string;
  affectedChipsets: ChipsetType[];
  affectedAndroidRange: string;
  vulnerabilityType: 'FRP_BYPASS' | 'AUTH_BYPASS' | 'KNOX_GUARD_ESCAPE' | 'BOOTLOADER_UNLOCK' | 'KERNEL_ROOT' | 'BASEBAND_QCN';
  zeroDayStatus: 'ACTIVE_ZERO_DAY' | 'PATCH_BYPASS_VERIFIED' | 'COMMERCIAL_GRADE';
  discoveryDate: string;
  exploitEfficiency: number; // 0 - 100%
  descriptionAr: string;
  descriptionEn: string;
  exploitPayloadCommand: string;
  patchMitigationAr: string;
  patchMitigationEn: string;
  loaderRequired?: string;
}

export interface FlashToolItem {
  id: string;
  nameAr: string;
  nameEn: string;
  brandCategory: string;
  protocol: 'ODIN_LOKE' | 'SAHARA_FIREHOSE' | 'MTK_DA_SP' | 'FASTBOOT_SPARSE' | 'APPLE_RESTORE' | 'SPD_FDL_DIAG' | 'HUAWEI_FASTBOOT';
  icon: string;
  descriptionAr: string;
  descriptionEn: string;
  supportedModes: DeviceMode[];
  supportedFiles: ('BL' | 'AP' | 'CP' | 'CSC' | 'PIT' | 'SCATTER' | 'RAWPROGRAM' | 'PATCH' | 'FIREHOSE' | 'DA' | 'PAC' | 'IPSW')[];
  defaultBaud?: number;
  supportedChips: ChipsetType[];
}

// ---------------- HARDWARE & MICRO-SOLDERING TYPES ----------------

export type HardwareCategory = 
  | 'POWER_PMIC' 
  | 'CHARGING_VBUS' 
  | 'DISPLAY_BACKLIGHT' 
  | 'BASEBAND_RF' 
  | 'AUDIO_CODEC' 
  | 'UFS_RAM_CPU' 
  | 'SHORT_CIRCUIT';

export interface MultimeterTestPoint {
  id: string;
  name: string;
  railName: string;
  location: string;
  diodeModeHealthy: string;
  diodeModeToleranceMin: number;
  diodeModeToleranceMax: number;
  voltageWorking: string;
  voltageStandby: string;
  resistanceToGnd: string;
  faultSymptomIfShort: string;
  faultSymptomIfOpen: string;
  diagramCoord: { x: number; y: number };
}

export interface BoardviewChip {
  id: string;
  designator: string;
  partNumber: string;
  roleAr: string;
  roleEn: string;
  category: HardwareCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  pinCount: number;
  packageType: string;
  commonDefects: string[];
}

export interface MicroSolderingStep {
  stepNumber: number;
  titleAr: string;
  titleEn: string;
  hotAirTemp: string;
  airFlow: string;
  solderingIronTemp?: string;
  solderPasteAlloy: string;
  stencilType: string;
  procedureAr: string;
  procedureEn: string;
  safetyWarningAr: string;
  safetyWarningEn: string;
}

export interface HardwareRepairGuide {
  id: string;
  titleAr: string;
  titleEn: string;
  category: HardwareCategory;
  symptomEn: string;
  symptomAr: string;
  affectedComponents: string[];
  boardModel: string;
  testPoints: MultimeterTestPoint[];
  boardChips: BoardviewChip[];
  microSolderingSteps: MicroSolderingStep[];
  shortIsolationGuide: {
    safeCurrentInjectionVoltage: string;
    maxCurrentLimit: string;
    rosinFluxMethodAr: string;
    rosinFluxMethodEn: string;
    thermalCameraCluesAr: string;
    thermalCameraCluesEn: string;
  };
}

// ---------------- FAULT DECISION TREE TYPES ----------------

export type FaultClassificationType = 
  | 'SOFTWARE_GLITCH' 
  | 'FIRMWARE_INCOMPATIBILITY' 
  | 'HARDWARE_FAILURE';

export interface DecisionTreeQuestion {
  id: string;
  questionAr: string;
  questionEn: string;
  subtextAr?: string;
  subtextEn?: string;
  options: {
    labelAr: string;
    labelEn: string;
    nextQuestionId?: string;
    classification?: FaultClassificationType;
    diagnosisResult?: {
      titleAr: string;
      titleEn: string;
      rootCauseAr: string;
      rootCauseEn: string;
      actionType: 'ONE_CLICK_FLASH' | 'CSC_SWITCH' | 'HARDWARE_MICRO_SOLDER' | 'EDL_RESTORE' | 'MULTIMETER_INSPECT';
      actionPayload?: string;
    };
  }[];
}

// ---------------- AUTOMATED FIRMWARE MATCHING TYPES ----------------

export interface OfficialFirmwarePackage {
  id: string;
  brand: string;
  model: string;
  marketName: string;
  regionCsc: string;
  countryName: string;
  osVersion: string;
  buildNumber: string;
  pdaVersion: string;
  cscVersion: string;
  modemVersion: string;
  binaryRollbackIndex: number;
  releaseDate: string;
  fileSizeBytes: number;
  sha256Checksum: string;
  md5Checksum: string;
  downloadMirrors: { name: string; speed: string; url: string }[];
  partitionsIncluded: string[];
  verifiedOfficial: boolean;
  notesAr: string;
  notesEn: string;
}
