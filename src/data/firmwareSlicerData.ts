export interface SlicedPartition {
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
  sha256: string;
  purposeEn: string;
  purposeAr: string;
  isPatchable: boolean;
  patchTypes?: ('magisk' | 'kernelsu' | 'disable-verity' | 'twrp-inject' | 'imei-repair')[];
  riskLevel: 'safe' | 'moderate' | 'critical';
  flashCommand: string;
}

export interface FirmwareContainerProfile {
  id: string;
  title: string;
  brand: string;
  model: string;
  containerType: 'samsung-tar' | 'android-payload' | 'xiaomi-fastboot' | 'mtk-scatter' | 'unisoc-pac' | 'apple-ipsw';
  totalSizeFormatted: string;
  totalSizeBytes: number;
  osVersion: string;
  securityPatchDate: string;
  partitions: SlicedPartition[];
}

export const SAMPLE_FIRMWARE_CONTAINERS: FirmwareContainerProfile[] = [
  {
    id: 'samsung-s24u-ap',
    title: 'Samsung Galaxy S24 Ultra (SM-S928B) - AP Container (One UI 6.1)',
    brand: 'Samsung',
    model: 'SM-S928B',
    containerType: 'samsung-tar',
    totalSizeFormatted: '6.85 GB',
    totalSizeBytes: 7355383808,
    osVersion: 'Android 14 (One UI 6.1 U2)',
    securityPatchDate: '2024-06-01',
    partitions: [
      {
        name: 'boot.img.lz4',
        sizeBytes: 67108864,
        sizeFormatted: '64 MB',
        sha256: '9f23e41b238a01f928e4827c8192837491029384756102938475610293847561',
        purposeEn: 'Linux Kernel & Android Ramdisk. Required for Magisk/KernelSU root patching.',
        purposeAr: 'نواة لينكس والرام ديسك. الملف الأساسي المطلوب لترقيع الروت عبر Magisk و KernelSU.',
        isPatchable: true,
        patchTypes: ['magisk', 'kernelsu'],
        riskLevel: 'moderate',
        flashCommand: 'fastboot flash boot boot_patched.img'
      },
      {
        name: 'init_boot.img.lz4',
        sizeBytes: 8388608,
        sizeFormatted: '8 MB',
        sha256: '38a9018471920394857201928374650192837465019283746501928374650192',
        purposeEn: 'Android 13+ GKI Generic Kernel Ramdisk init. Target partition for modern Magisk patching.',
        purposeAr: 'ملف الرام ديسك لأجهزة أندرويد 13 فما فوق. يتم ترقيعه مباشرة للروت دون لمس الكيرنل.',
        isPatchable: true,
        patchTypes: ['magisk', 'kernelsu'],
        riskLevel: 'moderate',
        flashCommand: 'fastboot flash init_boot init_boot_patched.img'
      },
      {
        name: 'vbmeta.img.lz4',
        sizeBytes: 4096,
        sizeFormatted: '4 KB',
        sha256: '7c82019482710394857291029384756102938475610293847561029384756102',
        purposeEn: 'AVB 2.0 Verity Root Descriptor. Contains partition signature hashes and rollback flags.',
        purposeAr: 'واصف أمان AVB 2.0. يحتوي على بصمات التحقق من النظام ومؤشرات الحظر.',
        isPatchable: true,
        patchTypes: ['disable-verity'],
        riskLevel: 'critical',
        flashCommand: 'fastboot --disable-verity --disable-verification flash vbmeta vbmeta_disabled.img'
      },
      {
        name: 'recovery.img.lz4',
        sizeBytes: 71303168,
        sizeFormatted: '68 MB',
        sha256: '1029384756102938475610293847561029384756102938475610293847561029',
        purposeEn: 'Stock Android Recovery environment. Replaced when installing TWRP / OrangeFox.',
        purposeAr: 'بيئة الريكفري الرسمي. يتم استبدالها عند تركيب ريكفري معدل مثل TWRP.',
        isPatchable: true,
        patchTypes: ['twrp-inject'],
        riskLevel: 'moderate',
        flashCommand: 'fastboot flash recovery recovery_twrp.img'
      },
      {
        name: 'dtbo.img.lz4',
        sizeBytes: 16777216,
        sizeFormatted: '16 MB',
        sha256: '4958201928374650192837465019283746501928374650192837465019283746',
        purposeEn: 'Device Tree Blob Overlay. Pinmux, GPIO, and hardware configuration tables.',
        purposeAr: 'شجرة الأجهزة والعتاد. مسؤولة عن تعريف الشاشة، المنافذ، والحساسات.',
        isPatchable: false,
        riskLevel: 'safe',
        flashCommand: 'fastboot flash dtbo dtbo.img'
      },
      {
        name: 'super.img.lz4',
        sizeBytes: 6710886400,
        sizeFormatted: '6.25 GB',
        sha256: '5829103948572019283746501928374650192837465019283746501928374650',
        purposeEn: 'Dynamic partition container holding system, vendor, product, and odm images.',
        purposeAr: 'الحاوية الديناميكية الضخمة التي تجمع أقسام النظام والروم الأساسي.',
        isPatchable: true,
        patchTypes: ['disable-verity'],
        riskLevel: 'critical',
        flashCommand: 'fastboot flash super super.img'
      }
    ]
  },
  {
    id: 'xiaomi-14-payload',
    title: 'Xiaomi 14 / HyperOS Global - payload.bin OTA Package',
    brand: 'Xiaomi',
    model: '23127PN0CG',
    containerType: 'android-payload',
    totalSizeFormatted: '5.92 GB',
    totalSizeBytes: 6356729856,
    osVersion: 'HyperOS 1.0 (Android 14)',
    securityPatchDate: '2024-05-01',
    partitions: [
      {
        name: 'boot.img',
        sizeBytes: 67108864,
        sizeFormatted: '64 MB',
        sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
        purposeEn: 'Qualcomm Snapdragon 8 Gen 3 Kernel & initial ramdisk.',
        purposeAr: 'نواة معالج سنابدراجون 8 الجيل الثالث والرام ديسك الأولي.',
        isPatchable: true,
        patchTypes: ['magisk', 'kernelsu'],
        riskLevel: 'moderate',
        flashCommand: 'fastboot flash boot_a boot.img && fastboot flash boot_b boot.img'
      },
      {
        name: 'init_boot.img',
        sizeBytes: 8388608,
        sizeFormatted: '8 MB',
        sha256: 'f5e4d3c2b1a09876543210fedcba9876543210fedcba9876543210fedcba9876',
        purposeEn: 'Android 14 Generic Kernel Ramdisk. Recommended for Magisk rooting.',
        purposeAr: 'ملف الرام ديسك المستقل لنظام أندرويد 14. يُفضل لترقيع الروت دون تعديل النواة.',
        isPatchable: true,
        patchTypes: ['magisk', 'kernelsu'],
        riskLevel: 'moderate',
        flashCommand: 'fastboot flash init_boot_a init_boot.img && fastboot flash init_boot_b init_boot.img'
      },
      {
        name: 'vbmeta.img',
        sizeBytes: 8192,
        sizeFormatted: '8 KB',
        sha256: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
        purposeEn: 'Main Android Verified Boot Descriptor.',
        purposeAr: 'واصف الحماية الأساسي AVB للنظام.',
        isPatchable: true,
        patchTypes: ['disable-verity'],
        riskLevel: 'critical',
        flashCommand: 'fastboot --disable-verity --disable-verification flash vbmeta vbmeta.img'
      },
      {
        name: 'vbmeta_system.img',
        sizeBytes: 4096,
        sizeFormatted: '4 KB',
        sha256: 'aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899',
        purposeEn: 'System sub-partition cryptographic verification table.',
        purposeAr: 'جدول التحقق التشفيري الخاص بقسم النظام System.',
        isPatchable: true,
        patchTypes: ['disable-verity'],
        riskLevel: 'moderate',
        flashCommand: 'fastboot --disable-verity --disable-verification flash vbmeta_system vbmeta_system.img'
      },
      {
        name: 'modem.img',
        sizeBytes: 209715200,
        sizeFormatted: '200 MB',
        sha256: '99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa',
        purposeEn: 'Snapdragon X75 5G Modem baseband firmware and RF calibration.',
        purposeAr: 'فيرموير مودم 5G ومعايرات شبكات الاتصال.',
        isPatchable: false,
        riskLevel: 'safe',
        flashCommand: 'fastboot flash modem_a modem.img && fastboot flash modem_b modem.img'
      }
    ]
  },
  {
    id: 'redmi-note13-mtk',
    title: 'Redmi Note 13 Pro 4G (MT6789 Dimensity) - MTK Scatter Factory',
    brand: 'Xiaomi / Redmi',
    model: '23117RA68G',
    containerType: 'mtk-scatter',
    totalSizeFormatted: '4.78 GB',
    totalSizeBytes: 5132517376,
    osVersion: 'MIUI 14 (Android 13)',
    securityPatchDate: '2024-03-01',
    partitions: [
      {
        name: 'preloader_mt6789.bin',
        sizeBytes: 524288,
        sizeFormatted: '512 KB',
        sha256: 'aa11bb22cc33dd44ee55ff6677889900aa11bb22cc33dd44ee55ff6677889900',
        purposeEn: 'MediaTek hardware preloader. Handles DRAM init and USB VCOM handshake.',
        purposeAr: 'المحمل التمهيدي لمعالجات ميدياتك. مسؤول عن اتصال الـ VCOM وتهيئة الرام.',
        isPatchable: false,
        riskLevel: 'critical',
        flashCommand: 'python -m mtk wl preloader_mt6789.bin'
      },
      {
        name: 'boot.img',
        sizeBytes: 67108864,
        sizeFormatted: '64 MB',
        sha256: 'bb22cc33dd44ee55ff6677889900aa11bb22cc33dd44ee55ff6677889900aa11',
        purposeEn: 'Kernel and Magisk root partition.',
        purposeAr: 'كيرنل النظام والروت.',
        isPatchable: true,
        patchTypes: ['magisk', 'kernelsu'],
        riskLevel: 'moderate',
        flashCommand: 'fastboot flash boot boot.img'
      },
      {
        name: 'nvram.bin',
        sizeBytes: 5242880,
        sizeFormatted: '5 MB',
        sha256: 'cc33dd44ee55ff6677889900aa11bb22cc33dd44ee55ff6677889900aa11bb22',
        purposeEn: 'Critical device calibration, IMEI 1/2, WiFi MAC, Bluetooth address.',
        purposeAr: 'قسم المعايرة الحرج؛ يحتوي على السيريال IMEI وماكواي فاي والبلوتوث.',
        isPatchable: true,
        patchTypes: ['imei-repair'],
        riskLevel: 'critical',
        flashCommand: 'python -m mtk w nvram nvram.bin'
      },
      {
        name: 'vbmeta.img',
        sizeBytes: 4096,
        sizeFormatted: '4 KB',
        sha256: 'dd44ee55ff6677889900aa11bb22cc33dd44ee55ff6677889900aa11bb22cc33',
        purposeEn: 'MediaTek Android Verified Boot descriptor.',
        purposeAr: 'واصف الحماية التشفيري لميدياتك AVB 2.0.',
        isPatchable: true,
        patchTypes: ['disable-verity'],
        riskLevel: 'critical',
        flashCommand: 'fastboot --disable-verity --disable-verification flash vbmeta vbmeta.img'
      }
    ]
  }
];

export interface PatchHistoryEntry {
  id: string;
  partitionName: string;
  patchType: string;
  originalSize: string;
  patchedSize: string;
  timestamp: string;
  sha256Patched: string;
  downloadUrl: string;
}
