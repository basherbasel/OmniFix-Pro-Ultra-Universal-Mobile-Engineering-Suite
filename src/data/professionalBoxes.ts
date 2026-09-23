export interface ProfessionalBox {
  id: string;
  name: string;
  vendor: string;
  version: string;
  licenseStatus: 'ACTIVATED_PRO' | 'HARDWARE_DONGLE_READY';
  supportedBrands: string[];
  icon: string;
  descriptionAr: string;
  descriptionEn: string;
  featuredProtocols: {
    nameAr: string;
    nameEn: string;
    modeRequired: string;
    targetChipset: string;
    actionCommand: string;
  }[];
}

export const PROFESSIONAL_BOXES: ProfessionalBox[] = [
  {
    id: 'unlocktool-engine',
    name: 'UnlockTool Native Protocol Engine',
    vendor: 'UnlockTool Digital Team',
    version: '2026.09.18-PRO',
    licenseStatus: 'ACTIVATED_PRO',
    supportedBrands: ['Samsung', 'Xiaomi', 'Apple', 'Oppo', 'Vivo', 'Realme', 'Tecno', 'Infinix', 'Huawei'],
    icon: 'Unlock',
    descriptionAr: 'المحرك البرمجي المباشر لأداة UnlockTool: تفليش وتفكيك حمايات سامسونج Knox و FRP أونلاين، وشاومي HyperOS، وميدياتك BROM SLA، وآبل Checkm8.',
    descriptionEn: 'Direct native UnlockTool protocol engine for Samsung Knox, HyperOS MiCloud, MTK SLA, and Apple Ramdisk.',
    featuredProtocols: [
      {
        nameAr: 'تخطي سامسونج MTP / Emergency Call *#0*# FRP',
        nameEn: 'Samsung MTP Emergency *#0*# Direct FRP Erase',
        modeRequired: 'ADB_ONLINE / MTP',
        targetChipset: 'Universal Samsung',
        actionCommand: 'UNLOCKTOOL_SEC_MTP_FRP_BYPASS --port MTP_CDC --auth-swat'
      },
      {
        nameAr: 'فك قفل شاومي HyperOS MiCloud مع Anti-Relock',
        nameEn: 'Xiaomi HyperOS Mi Cloud Bypass & Anti-Relock Token Wiping',
        modeRequired: 'FASTBOOT / EDL_9008',
        targetChipset: 'Qualcomm / MediaTek',
        actionCommand: 'UNLOCKTOOL_MI_HYPEROS_WIPE_PERSIST --disable-finddevice'
      },
      {
        nameAr: 'تخطى حماية BROM SLA/DAA لهواتف أوبو وفيفو وريلمي',
        nameEn: 'Oppo/Vivo/Realme MTK BROM Auth & SLA Handshake Neutralizer',
        modeRequired: 'MTK_BROM',
        targetChipset: 'MediaTek Dimensity / Helio',
        actionCommand: 'UNLOCKTOOL_MTK_DISABLE_SLA --load-custom-da DA_UT_v7.bin'
      }
    ]
  },
  {
    id: 'chimeratool-engine',
    name: 'ChimeraTool Hardware Service Engine',
    vendor: 'Chimera Mobile Utilities',
    version: '39.82.1102',
    licenseStatus: 'ACTIVATED_PRO',
    supportedBrands: ['Samsung', 'Huawei', 'Honor', 'Xiaomi', 'BBK Group'],
    icon: 'ShieldAlert',
    descriptionAr: 'شفرة Chimera الاحترافية المباشرة لإصلاح المعرفات والشبكة (Patch Cert & IMEI Repair)، ومعالجة Knox Guard، وتفليش هواوي Kirin COM 1.0.',
    descriptionEn: 'Native ChimeraTool protocols for IMEI calibration, Patch Cert, Knox Guard repair, and Huawei Kirin COM 1.0 servicing.',
    featuredProtocols: [
      {
        nameAr: 'إصلاح السيريال وتصليح شهادة الشبكة Patch Cert',
        nameEn: 'Samsung Exynos / Qualcomm IMEI Repair & Network Patch Cert',
        modeRequired: 'ADB_ONLINE / DIAG',
        targetChipset: 'Exynos / Qualcomm',
        actionCommand: 'CHIMERA_SEC_IMEI_REPAIR --write-cert --patch-cert-v3'
      },
      {
        nameAr: 'إصلاح وقفل/فك Knox Guard وحالة RPMB',
        nameEn: 'Samsung Knox Guard / KG Locked State Rebuild',
        modeRequired: 'SAMSUNG_DOWNLOAD / Odin',
        targetChipset: 'Exynos / Qualcomm',
        actionCommand: 'CHIMERA_KG_REPAIR_RPMB --state COMPLETED'
      },
      {
        nameAr: 'تفليش هواوي Kirin عبر تست بوينت USB COM 1.0',
        nameEn: 'Huawei HiSilicon Kirin COM 1.0 Testpoint Bootloader Direct Inject',
        modeRequired: 'HUAWEI_COM1',
        targetChipset: 'HiSilicon Kirin',
        actionCommand: 'CHIMERA_HISI_COM1_INJECT --xloader kirin9000s.bin'
      }
    ]
  },
  {
    id: 'z3x-octopus-engine',
    name: 'Z3X Samsung Tool Pro & Octopus Suite',
    vendor: 'Z3X & Octoplus Team',
    version: '45.12 PRO',
    licenseStatus: 'HARDWARE_DONGLE_READY',
    supportedBrands: ['Samsung', 'LG', 'Sony', 'ZTE'],
    icon: 'Cpu',
    descriptionAr: 'البوكس المباشر والفعلي لصيانة أجهزة سامسونج: قراءة الأكواد، فك التشفير المباشر للشرائح العالمية، تغيير رمز CSC بدون مسح البيانات، وتصليح EFS.',
    descriptionEn: 'Direct Z3X & Octoplus Box suite for Samsung direct SIM unlock, CSC switching without data wipe, and EFS restoration.',
    featuredProtocols: [
      {
        nameAr: 'قراءة أكواد فك التشفير وقفل الشبكة Direct Unlock',
        nameEn: 'Samsung Read Unlock Codes & Permanent Network SIM Unlock',
        modeRequired: 'ADB_ONLINE / DIAG',
        targetChipset: 'Exynos / Qualcomm',
        actionCommand: 'Z3X_SEC_READ_CODES_ONLINE --calc-nck --direct-unlock'
      },
      {
        nameAr: 'تغيير CSC ورمز الدولة بدون مسح البيانات',
        nameEn: 'Instant CSC Change & Sales Code Switching (No Data Wipe)',
        modeRequired: 'ADB_ONLINE',
        targetChipset: 'Universal Samsung',
        actionCommand: 'Z3X_CSC_SWITCH --target-csc XSG --keep-data'
      }
    ]
  },
  {
    id: 'pandora-amt-engine',
    name: 'Pandora Box & AMT Native Suite',
    vendor: 'Pandora & AMT Software',
    version: '7.4.0',
    licenseStatus: 'ACTIVATED_PRO',
    supportedBrands: ['MediaTek Universal', 'Unisoc SPD', 'Qualcomm'],
    icon: 'Zap',
    descriptionAr: 'أداة Pandora الفعلية لعمليات الذاكرة منخفضة المستوى: قراءة وكتابة قطاعات RPMB، واستخراج الفلاشات، وتصليح IMEI لمعالجات MTK و SPD.',
    descriptionEn: 'Direct Pandora Box low-level BROM & SPD engine for RPMB partition read/write and memory dumping.',
    featuredProtocols: [
      {
        nameAr: 'قراءة وكتابة قطاعات RPMB لمعالجات ميدياتك',
        nameEn: 'MTK BROM Direct RPMB Partition Read/Write & Clean',
        modeRequired: 'MTK_BROM',
        targetChipset: 'MediaTek All Chips',
        actionCommand: 'PANDORA_MTK_RPMB_IO --op WRITE --block-size 512'
      },
      {
        nameAr: 'حذف FRP وحساب أوبو وفيفو بضغطة واحدة',
        nameEn: 'Oppo / Vivo / Realme One-Click Account & FRP Erase',
        modeRequired: 'MTK_BROM / EDL_9008',
        targetChipset: 'Qualcomm / MediaTek',
        actionCommand: 'PANDORA_BBK_ONE_CLICK_UNLOCK --clear-user-data'
      }
    ]
  },
  {
    id: 'ufi-easyjtag-engine',
    name: 'UFI Box & EasyJTAG Hardware Inspector',
    vendor: 'UFI & Z3X JTAG Team',
    version: '2.1.0',
    licenseStatus: 'HARDWARE_DONGLE_READY',
    supportedBrands: ['eMMC', 'UFS 2.1 / 3.1 / 4.0', 'NVMe'],
    icon: 'Radio',
    descriptionAr: 'استوديو فحص ومعايرة الذاكرة الصلبة المباشر eMMC/UFS: فحص نسبة الاهتراء (Health Smart Report)، ومخططات توصيل ISP Pinout، وإصلاح البلوكات المعطوبة.',
    descriptionEn: 'Direct eMMC & UFS hardware memory inspector with Health SMART report, ISP pinouts, and bad block repair.',
    featuredProtocols: [
      {
        nameAr: 'فحص صحة ونسبة اهتراء الذاكرة UFS Health / eMMC Wear',
        nameEn: 'UFS / eMMC Hardware Health & Wear Smart Report',
        modeRequired: 'EDL_9008 / BROM',
        targetChipset: 'Universal Storage',
        actionCommand: 'UFI_STORAGE_READ_HEALTH_SMART --check-life-span'
      },
      {
        nameAr: 'استخراج وتفريغ الذاكرة الجنائي (Full Forensic Dump)',
        nameEn: 'Full Physical Partition Binary Forensic Dump',
        modeRequired: 'EDL_9008 / BROM / DFU',
        targetChipset: 'Universal',
        actionCommand: 'UFI_DUMP_FULL_EMMC --out-file /dumps/user_data_raw.bin'
      }
    ]
  },
  {
    id: 'miracle-infinity-engine',
    name: 'Miracle Power Tool & Infinity BEST Suite',
    vendor: 'Miracle Team & Infinity Box',
    version: '3.98 PRO',
    licenseStatus: 'ACTIVATED_PRO',
    supportedBrands: ['Nokia', 'Google Pixel', 'OnePlus', 'Motorola', 'Infinix', 'Tecno', 'Sony'],
    icon: 'Terminal',
    descriptionAr: 'منظومة Miracle & Infinity الفعلية الشاملة لأجهزة نوكيا، وجوجل بكسل، وون بلس، وموتورولا: تفليش الحزم المغلقة، وتفكيك حماية نوكيا HMD، واسترجاع المعرفات.',
    descriptionEn: 'Miracle & Infinity BEST native suite for Nokia HMD, Google Pixel Tensor, OnePlus, and Motorola EDL flashing & security repair.',
    featuredProtocols: [
      {
        nameAr: 'تخطي حماية وقفل حساب نوكيا HMD Account & FRP',
        nameEn: 'Nokia HMD Security Token & FRP Reset Protocol',
        modeRequired: 'EDL_9008 / FASTBOOT',
        targetChipset: 'Qualcomm / MediaTek / Unisoc',
        actionCommand: 'MIRACLE_NOKIA_HMD_TOKEN_BYPASS --auth-online --reset-frp'
      },
      {
        nameAr: 'إصلاح وتفليش أجهزة جوجل بكسل Tensor Pixel Bootloader',
        nameEn: 'Google Pixel Tensor Bootloader Unlock & Factory Flashing',
        modeRequired: 'FASTBOOT / ADB',
        targetChipset: 'Google Tensor G1/G2/G3/G4',
        actionCommand: 'INFINITY_PIXEL_FLASH_SLOT_A_B --reboot-fastbootd'
      }
    ]
  }
];
