export type OsPlatform = 'android' | 'ios' | 'harmonyos' | 'embedded-linux';

export interface ArchitectureLayer {
  id: string;
  order: number;
  nameAr: string;
  nameEn: string;
  subtitleAr: string;
  subtitleEn: string;
  badge: string;
  category: 'hardware' | 'bootloader' | 'kernel' | 'security' | 'system' | 'runtime';
  color: string;
  descriptionAr: string;
  descriptionEn: string;
  components: {
    name: string;
    roleAr: string;
    roleEn: string;
    securityFunctionAr: string;
    securityFunctionEn: string;
    commonFailuresAr: string[];
    commonFailuresEn: string[];
    repairTechniquesAr: string[];
    repairTechniquesEn: string[];
  }[];
  lowLevelDetailsAr: string[];
  lowLevelDetailsEn: string[];
  technicalCommandExample: string;
}

export interface SecurityMechanism {
  id: string;
  titleAr: string;
  titleEn: string;
  badge: string;
  category: 'boot-integrity' | 'hardware-root' | 'encryption' | 'access-control' | 'anti-tamper';
  shortDescAr: string;
  shortDescEn: string;
  howItWorksAr: string[];
  howItWorksEn: string[];
  vulnerabilitiesAndBypassesAr: string[];
  vulnerabilitiesAndBypassesEn: string[];
  diagnosticIndicatorsAr: string[];
  diagnosticIndicatorsEn: string[];
  repairMethodologyAr: string[];
  repairMethodologyEn: string[];
  cliTools: string[];
  codeSnippet: {
    language: string;
    title: string;
    code: string;
  };
}

export interface RepairScenario {
  id: string;
  titleAr: string;
  titleEn: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  category: string;
  symptomAr: string;
  symptomEn: string;
  rootCauseAr: string;
  rootCauseEn: string;
  affectedPartitions: string[];
  affectedPlatforms: string[];
  detectionCommands: string[];
  expectedOutput: string;
  repairStepsAr: {
    step: number;
    title: string;
    action: string;
    cli: string;
    explanation: string;
  }[];
  repairStepsEn: {
    step: number;
    title: string;
    action: string;
    cli: string;
    explanation: string;
  }[];
  verificationAr: string;
  verificationEn: string;
}

export interface SecurityExamQuestion {
  id: number;
  questionAr: string;
  questionEn: string;
  optionsAr: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationAr: string;
  explanationEn: string;
  difficulty: 'Hard' | 'Expert' | 'Architect';
}

// =========================================================================
// 1. طبقات بنية نظام التشغيل (OS Architecture Layers)
// =========================================================================
export const OS_ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  {
    id: 'layer-silicon-pbl',
    order: 1,
    nameAr: 'طبقة السيليكون وذاكرة الإقلاع المحفورة (Silicon Hardware & BootROM / PBL)',
    nameEn: 'Silicon Hardware & Primary Bootloader (BootROM / PBL)',
    subtitleAr: 'أدنى مستوى فيزيائي محفور داخل المعالج (SoC Microcode & QFPROM)',
    subtitleEn: 'Lowest physical hardware layer burned into SoC silicon ROM',
    badge: 'STAGE 0 / SILICON',
    category: 'hardware',
    color: 'from-amber-600 to-orange-500',
    descriptionAr: 'كود الـ BootROM هو أول تعليمات تُنفذ بمجرد تدفق التيار الكهربائي إلى معالج الـ SoC. الكود مخزن في ذاكرة قراءة فقط (Masked ROM) داخل الشريحة ولا يمكن تعديله إطلاقاً. مهمته تهيئة مسجلات وحدة المعالجة المركزية، فحص مسامير التكوين (Hardware Boot Pins / Test Points)، والتحقق المشفر من توقيع المرحلة التالية (SBL/XBL) باستخدام مفتاح معتمد ومحفور في فيوزات الأمان (QFPROM eFuses).',
    descriptionEn: 'The BootROM (PBL) is the hardwired microcode executed immediately upon SoC power-up. Implemented as masked read-only silicon ROM, it initializes basic CPU registers, reads hardware strap pins (boot test points), and verifies the cryptographic signature of Stage 1 bootloader (SBL/XBL) against Root of Trust (RoT) keys burned into QFPROM eFuses.',
    components: [
      {
        name: 'Masked BootROM (PBL)',
        roleAr: 'نقطة الانطلاق الصفرية في الشريحة وتهيئة قنوات الإقلاع المبدئية (USB/UFS/eMMC/NAND).',
        roleEn: 'Zero-stage hardcoded execution point configuring initial boot peripherals (USB/UFS/eMMC/NAND).',
        securityFunctionAr: 'التحقق من توقيع شهادة XBL عبر خوارزمية RSA-2048/4096 / ECC بمقارنة بصمة المفتاح مع eFuse.',
        securityFunctionEn: 'Verifies XBL certificate signature via RSA/ECC matching against hardwired public key hash in eFuse.',
        commonFailuresAr: [
          'عدم إقلاع الجهاز وظهور منفذ كوالكوم للطوارئ Qualcomm HS-USB QDLoader 9008 أو MTK USB Port.',
          'تلف مسارات الـ CLK/CMD لذاكرة الـ UFS مما يجبر الـ BootROM على الهبوط لوضع الطوارئ USB Download.',
          'حرق فيوزات الـ Secure Boot بمفاتيح غير متطابقة (Security Mismatch Brick).'
        ],
        commonFailuresEn: [
          'Device dead boot dropping straight into Qualcomm HS-USB QDLoader 9008 or MediaTek USB Port.',
          'Missing or broken CLK/CMD lines on UFS/eMMC forcing BootROM to fallback to USB emergency download.',
          'Security Mismatch brick caused by eFuse Root of Trust public key hash collision.'
        ],
        repairTechniquesAr: [
          'إجراء توصيل نقطة الاختبار (TestPoint / ISP) لإجبار المعالج على الدخول في وضع الطوارئ EDL/BROM.',
          'حقن ملف Firehose ELF أو DA (Download Agent) موقّع بمفتاح الشركة المصنعة متطابق مع الـ HWID.',
          'فحص جهود تغذية VDD/VDDQ لذواكر الـ UFS للتأكد من وصول الطاقة قبل إعلان تلف الشريحة.'
        ],
        repairTechniquesEn: [
          'Trigger TestPoint / ISP short-to-ground forcing SoC into emergency recovery download (EDL/BROM).',
          'Inject authenticated Firehose ELF or MTK DA loader matching the hardware chip ID (HWID).',
          'Inspect VDD/VDDQ voltage rails on UFS/eMMC to verify storage IC power before declaring board failure.'
        ]
      },
      {
        name: 'QFPROM eFuses (Electronic Fuses)',
        roleAr: 'مصفوفة فيوزات سيليكونية تحترق كهربائياً مرة واحدة لتسجيل المفاتيح وحالة الأمان بشكل أبدي.',
        roleEn: 'One-Time Programmable (OTP) microscopic silicon fuses storing permanent security hashes.',
        securityFunctionAr: 'تخزين بصمة مفتاح الشركة المصنعة (OEM RoT Hash)، تفعيل Secure Boot، وتسجيل عداد مكافحة الرجوع (Rollback Counter).',
        securityFunctionEn: 'Stores OEM Root of Trust hash, enforces permanent Secure Boot, and latches Anti-Rollback (ARB) indices.',
        commonFailuresAr: [
          'محاولة تفليش إصدار حماية أقدم (Downgrade) ورفض الإقلاع بسبب عدم تطابق عداد الـ ARB eFuse.',
          'انفجار فيوز Knox Warranty Void (0x1) على أجهزة سامسونج عند تعديل الكيرنل أو الريكفري.'
        ],
        commonFailuresEn: [
          'Firmware downgrade brick due to SoC rejecting bootloader with lower ARB index than silicon fuse.',
          'Samsung Knox Warranty Void eFuse trip (0x0 to 0x1) when flashing uncertified boot/recovery.'
        ],
        repairTechniquesAr: [
          'استعلام رقم الحماية الحالي عبر Fastboot (fastboot getvar anti) ومطابقة الحماية بدقة.',
          'تفليش إصدار متساوٍ أو أعلى من الـ Binary Bootloader المسجل في الفيوز لتخطي الطوب القاتل.',
          'استخدام حلول البرمجة المباشرة بالـ UFS Socket لإصلاح البارتشنات دون محاولة مساس الفيوز المحترق.'
        ],
        repairTechniquesEn: [
          'Query current anti-rollback index via fastboot (fastboot getvar anti) to match binary level exactly.',
          'Flash equal or higher binary bootloader tier to clear the boot rejection state.',
          'Utilize direct UFS chip-off / socket programmer to flash correct binaries matching fused ARB state.'
        ]
      }
    ],
    lowLevelDetailsAr: [
      'الـ BootROM يقرأ مسار الإقلاع في الذاكرة عبر التردد 19.2MHz قبل رفع سرعة الكريستالة الرئيسية.',
      'حجم كود الـ BootROM يتراوح بين 32KB إلى 64KB من كود الـ ARM Microcode المعزول داخل الشريحة.',
      'في حال فشل قراءة أول 4KB من قطاع التمهيد في UFS بعد 3 محاولات، يفتح المعالج منفذ الـ USB Dload فوراً.'
    ],
    lowLevelDetailsEn: [
      'BootROM initiates memory reads at initial 19.2MHz baseline before PLL clocks are engaged.',
      'Code footprint is strictly confined to 32KB - 64KB isolated ARM microcode embedded on-die.',
      'If reading first 4KB boot sector from UFS fails after 3 retries, SoC immediately opens USB Dload endpoint.'
    ],
    technicalCommandExample: 'lsusb -v -d 05c6:9008 # Inspect Qualcomm EDL USB Endpoint Descriptors'
  },
  {
    id: 'layer-secondary-bootloader',
    order: 2,
    nameAr: 'طبقة محملات الإقلاع الثانوية وتأمين البيئة المعزولة (XBL / SBL & ARM TrustZone / TEE)',
    nameEn: 'Secondary Bootloader & TrustZone Execution (XBL / SBL & TEE)',
    subtitleAr: 'تهيئة الذاكرة العشوائية DDR وتأسيس العالم الآمن (Secure World vs Normal World)',
    subtitleEn: 'DDR RAM calibration, PMIC power sequencing & ARM TrustZone initialization',
    badge: 'STAGE 1 / TEE',
    category: 'bootloader',
    color: 'from-blue-600 to-indigo-600',
    descriptionAr: 'بعد تحقق الـ BootROM، يتم تحميل ملف الـ XBL (eXtensible Bootloader) أو SBL إلى ذاكرة المعالج الداخلية (L3/TCM). يقوم الـ XBL بتهيئة وحدة إدارة الطاقة (PMIC)، تدريب وتوقيت سرعات الـ LPDDR4X/LPDDR5 RAM، ثم شطر بيئة المعالج إلى عالمين معزولين عتادياً بتقنية ARM TrustZone: العالم الآمن (Secure World) الذي يشغل نظام تشغيل الأمان المصغر (QSEE / Trusty OS / Kinibi)، والعالم العادي (Normal World) المخصص لنظام أندرويد.',
    descriptionEn: 'Following BootROM verification, XBL (eXtensible Bootloader) or SBL is staged into internal L3/TCM cache. XBL orchestrates PMIC power sequencing, conducts DDR RAM timing calibration, and bisects the CPU into two hardware-isolated domains via ARM TrustZone: the Secure World running the micro-kernel (QSEE / Trusty / Kinibi) and the Normal World reserved for Android/Linux.',
    components: [
      {
        name: 'eXtensible Bootloader (XBL / xbl_config)',
        roleAr: 'تدريب الذاكرة العشوائية RAM، تشغيل حساسات الحرارة، واختبار قنوات الـ UFS 3.1/4.0 السريعة.',
        roleEn: 'RAM memory training, thermal sensor monitoring, and high-speed UFS M-PHY link configuration.',
        securityFunctionAr: 'التحقق من توقيع محمل الإقلاع الرئيسي ABL ومفاتيح نظام الأمان TrustZone TZ.mbn.',
        securityFunctionEn: 'Verifies RSA signatures of ABL (Android Bootloader) and TrustZone TZ.mbn images.',
        commonFailuresAr: [
          'انهيار تدريب الرامات (DDR Training Failure) بسبب انفصال كرات اللحام (RAM BGA crack) أسفل الـ CPU.',
          'التعليق في إعادة تشغيل لانهائية بمجرد محاولة قراءة قطاع xbl_a أو xbl_b التالف.'
        ],
        commonFailuresEn: [
          'DDR memory training crash caused by cracked solder balls underneath the CPU/RAM PoP package.',
          'Endless reboot cycle when attempting to read corrupted or checksum-mismatched xbl_a partition.'
        ],
        repairTechniquesAr: [
          'إعادة صب كرات اللحام (CPU Reballing) في حالة فشل تدريب الذاكرة العشوائية وظهور حرارة موضعية.',
          'تفليش قطاعات xbl_a و xbl_b عبر وضع EDL 9008 باستخدام ملف خام رسمي rawprogram0.xml.'
        ],
        repairTechniquesEn: [
          'SoC CPU / RAM PoP reballing when memory training aborts due to thermal/mechanical solder fatigue.',
          'Reflash xbl_a and xbl_b block partitions via EDL 9008 utilizing official rawprogram0.xml map.'
        ]
      },
      {
        name: 'ARM TrustZone & TEE (Trusted Execution Environment)',
        roleAr: 'نظام تشغيل فائق الأمان يعمل في الخلفية لمعالجة البصمة، التشفير، ومفاتيح حماية الجهاز.',
        roleEn: 'Micro-kernel operating in isolated Secure World handling biometrics, cryptography & Keymaster.',
        securityFunctionAr: 'عزل مفاتيح تشفير الذاكرة (Hardware Master Key)، حماية عدادات RPMB، وتشغيل Gatekeeper.',
        securityFunctionEn: 'Isolates hardware crypto master keys, guards RPMB storage block, and executes Gatekeeper authentication.',
        commonFailuresAr: [
          'فقدان الرقم التسلسلي IMEI وظهور Baseband Unknown عند تلف اتصال الموديم بالـ TEE.',
          'فشل فك تشفير الذاكرة وطلب إعادة تعيين المصنع (Decryption Failure / Lockscreen loop).'
        ],
        commonFailuresEn: [
          'IMEI null or Baseband Unknown when secure modem communication with TEE fails.',
          'Storage decryption crash resulting in endless "Decryption Unsuccessful / Factory Reset" prompts.'
        ],
        repairTechniquesAr: [
          'استعادة بارتشنات التشفير والمفاتيح الأساسية (persist, metadata, keymaster).',
          'إعادة بناء توقيعات الـ RPMB وتفليش روم المصنع المتطابق مع إصدار الحماية لإعادة مزامنة TEE.'
        ],
        repairTechniquesEn: [
          'Restore critical hardware key partitions (persist, metadata, keymaster).',
          'Resynchronize RPMB counters and reflash factory firmware matching exact security patch tier.'
        ]
      }
    ],
    lowLevelDetailsAr: [
      'الـ XBL يقوم بإنشاء جدول استثناءات المعالج (Exception Vector Table) في المستوى EL3 (Secure Monitor).',
      'حجم مساحة العالم الآمن TEE تُحجز في قمة الذاكرة العشوائية وتُحجب عن نظام أندرويد عبر وحدات عتادية XPU.',
      'إذا حاول الكيرنل قراءة مساحة TEE فيزيائياً، يقوم المعالج فوراً بإطلاق استثناء عتادي قاتل (Bus Fault Panic).'
    ],
    lowLevelDetailsEn: [
      'XBL instantiates processor Exception Vector Table at EL3 (Secure Monitor level).',
      'TEE memory workspace is quarantined at high DDR address, fenced by hardware XPU controllers.',
      'Any physical memory read attempt by Linux kernel into TEE space triggers instant Bus Fault Panic.'
    ],
    technicalCommandExample: 'fastboot oem device-info # Inspect secure boot & unlock state at bootloader stage'
  },
  {
    id: 'layer-abl-fastboot',
    order: 3,
    nameAr: 'طبقة محمل إقلاع أندرويد والتحقق الجذري (ABL / LK & Android Verified Boot AVB 2.0)',
    nameEn: 'Android Bootloader (ABL / Little Kernel) & AVB 2.0 Engine',
    subtitleAr: 'واجهة Fastbootd وفحص شجرة هاش VBMETA وبصمات الحماية المشفرة',
    subtitleEn: 'Fastbootd protocol, partition slotting (A/B) & VBMETA cryptographic hash tree validation',
    badge: 'STAGE 2 / ABL & AVB',
    category: 'bootloader',
    color: 'from-cyan-600 to-teal-500',
    descriptionAr: 'الـ ABL (Android Bootloader) هو محمل الإقلاع المفتوح المبني على Little Kernel (LK) أو U-Boot. هذه الطبقة هي المسؤولة عن استقبال أوامر Fastboot عبر USB، إدارة نظام الشرائح المزدوجة (A/B Slotting)، وتنفيذ محرك التحقق الصارم Android Verified Boot (AVB 2.0). يقوم الـ ABL بقراءة قطاع vbmeta.img، فحص شجرة الهاش (Merkle Tree Root Hash)، والتأكد من عدم التلاعب بأي بايت في قطاعات boot و dtbo و recovery و vendor_boot قبل تسليم التحكم للكيرنل.',
    descriptionEn: 'The ABL (Android Bootloader) is based on Little Kernel (LK) or modern U-Boot/EDK2. It exposes the USB Fastboot interface, arbitrates dynamic A/B slot allocation, and enforces Android Verified Boot (AVB 2.0). ABL reads vbmeta.img, validates cryptographic hash tree descriptors (Merkle Trees) against the hardware Root of Trust, ensuring zero modification in boot, dtbo, and vendor_boot partitions prior to jumping to Linux kernel.',
    components: [
      {
        name: 'Android Bootloader (ABL / fastbootd)',
        roleAr: 'معالجة أوامر التفليش، فك أو قفل البوتلودر، وتحديد الشريحة النشطة (Slot A أو Slot B).',
        roleEn: 'Servicing flash commands, bootloader lock/unlock policy, and active A/B slot arbitration.',
        securityFunctionAr: 'منع تفليش البارتشنات غير الموقعة في حالة القفل (Locked State) ومنع تعديل vbmeta.',
        securityFunctionEn: 'Blocks flashing uncertified images when bootloader is locked and enforces vbmeta integrity.',
        commonFailuresAr: [
          'التعليق في شاشة Fastboot Mode أو Fastbootd بسبب تلف الشريحة النشطة (Bootloop to Fastboot).',
          'رسالة الخطأ: "Your device is corrupt. It cannot be trusted and will not boot" (Red State).'
        ],
        commonFailuresEn: [
          'Device trapped in Fastboot Mode due to corrupted active slot boot header.',
          'Corrupted device panic: "Your device is corrupt. It cannot be trusted and will not boot" (Red State).'
        ],
        repairTechniquesAr: [
          'التبديل إلى الشريحة السليمة عبر أمر: fastboot --set-active=b (أو a).',
          'تفليش قطاعات البوت والريكفري الأصلية المتوافقة مع الـ VBMETA لإلغاء حالة الفساد Red State.',
          'استخدام أمر تفليش vbmeta مع تعطيل التحقق: fastboot flash vbmeta --disable-verity --disable-verification vbmeta.img.'
        ],
        repairTechniquesEn: [
          'Toggle to intact redundant slot using: fastboot --set-active=b (or a).',
          'Flash stock boot/vendor_boot/dtbo images aligned with stock VBMETA hashes to clear Red State.',
          'Flash vbmeta with verification bypass flags: fastboot flash vbmeta --disable-verity --disable-verification vbmeta.img.'
        ]
      },
      {
        name: 'VBMETA & Merkle Tree Hash Validator',
        roleAr: 'جدول الهاشات المشفر والشهادات الرقمية لكافة بارتشنات النظام.',
        roleEn: 'Cryptographic hash tables and digital certificates covering all OS block images.',
        securityFunctionAr: 'حساب SHA-256 Merkle Hash لكل بلوك 4KB واكتشاف أي تعديل غير مصرح به فوراً.',
        securityFunctionEn: 'Computes SHA-256 Merkle root across 4KB blocks, instantly halting boot if 1-bit mismatch occurs.',
        commonFailuresAr: [
          'انهيار الإقلاع بسبب عمل روت غير مطابق أو تعديل ملفات النظام بدون ترقيع الـ VBMETA.',
          'رسالة: "dm-verity corruption - your device cannot be trusted".'
        ],
        commonFailuresEn: [
          'Boot halt caused by manual rooting or system partition edits without patching VBMETA descriptors.',
          'Error banner: "dm-verity corruption - your device cannot be trusted".'
        ],
        repairTechniquesAr: [
          'توليد ملف vbmeta معدل باستخدام أداة avbtool الرسمية مع إزالة علامات التحقق.',
          'إعادة تفليش الروم الكامل مع ملف vbmeta الأصلي لاستعادة حالة الإقلاع الآمن Green State.'
        ],
        repairTechniquesEn: [
          'Generate patched vbmeta via official Google avbtool with disabled verity descriptors.',
          'Reflash full stock factory package including original vbmeta to restore Green State boot.'
        ]
      }
    ],
    lowLevelDetailsAr: [
      'حالات أمان AVB تنقسم إلى: Green (رسمي ومقفل)، Yellow (موقّع بمفتاح مخصص)، Orange (مفتوح البوتلودر)، Red (تالف ويرفض الإقلاع).',
      'في وضع الـ Red State، يرفض الـ ABL تحميل الكيرنل إلى الذاكرة ويعرض شاشة التحذير لمدة 5 إلى 30 ثانية قبل الإغلاق.',
      'الـ ABL ينقل معايير الإقلاع (Boot Parameters) إلى الكيرنل عبر بنية ATAGS أو شجرة العتاد DTB (Device Tree Blob).'
    ],
    lowLevelDetailsEn: [
      'AVB security states include: Green (locked stock), Yellow (custom root key), Orange (unlocked), Red (corrupt - halts boot).',
      'In Red State, ABL refuses to jump execution to kernel RAM offset, showing warning before powering down.',
      'ABL passes boot arguments and memory layout to Linux kernel via Device Tree Blob (DTB / bootconfig).'
    ],
    technicalCommandExample: 'avbtool info_image --image vbmeta.img # Dump hash descriptors and rollback indexes'
  },
  {
    id: 'layer-kernel-dmverity',
    order: 4,
    nameAr: 'طبقة نواة لينكس وفحص كتل التخزين (Linux Kernel & dm-verity Runtime Protection)',
    nameEn: 'Linux Kernel Space & dm-verity Runtime Block Verification',
    subtitleAr: 'إدارة الذاكرة، تعريفات القطع، تطبيق سياسات SELinux، وفحص سلامة البلوكات اللحظي',
    subtitleEn: 'Process scheduling, MMU paging, SELinux enforcement, and live storage block integrity',
    badge: 'STAGE 3 / KERNEL',
    category: 'kernel',
    color: 'from-emerald-600 to-green-500',
    descriptionAr: 'عند إقلاع نواة لينكس (Kernel)، يتم تهيئة معالج الذاكرة (MMU)، تشغيل تعريفات الرقاقات (I2C, SPI, UFS, PMIC)، وتركيب القرص الافتراضي (initramfs). في هذه المرحلة، يقوم موديول النواة dm-verity بربط بارتشنات النظام (system, vendor, product) كأجهزة كتل للقراءة فقط، والتحقق المستمر من كل بلوك بسعة 4096 بايت قبل قراءته إلى الذاكرة بمطابقته مع شجرة الهاش المخزنة. أي اختلاف يؤدي فوراً إلى توقف النواة (Kernel Panic) لمنع البرمجيات الخبيثة.',
    descriptionEn: 'As the Linux kernel boots, it initializes virtual memory (MMU), mounts device drivers (I2C, SPI, UFS, PMIC), and unpacks initramfs. Crucially, the dm-verity kernel driver transparently mounts dynamic partitions (system, vendor, product) as read-only block devices, validating each 4096-byte sector against its precomputed Merkle tree before granting read access. Any cryptographic inconsistency immediately raises a Kernel Panic to thwart unauthorized persistence.',
    components: [
      {
        name: 'Linux Kernel Core (vmlinux / Image.gz)',
        roleAr: 'المحرك البرمجي الأساسي لإدارة المعالج، الاتصال بالقطع الفيزيائية، وتطبيق جدران الحماية.',
        roleEn: 'Central operating system engine arbitrating hardware access, threading, and security policies.',
        securityFunctionAr: 'عزل مساحة الذاكرة بين العمليات، ومنع تجاوز صلاحيات المستخدم العادي لمستوى الجذر.',
        securityFunctionEn: 'Enforces kernel memory isolation, KASLR (Kernel Address Space Layout Randomization), and UID boundaries.',
        commonFailuresAr: [
          'التعليق على شعار الشركة الأول (Bootloop on first splash logo) بسبب Kernel Panic.',
          'انهيار قراءة تعريف الشاشة أو دائرة الإضاءة مما يتسبب في شاشة سوداء مع صوت إقلاع طبيعي.'
        ],
        commonFailuresEn: [
          'Stuck on primary brand logo (Kernel Panic early boot freeze).',
          'Display driver probe failure causing black screen while device vibrates normally on boot.'
        ],
        repairTechniquesAr: [
          'استخراج سجل انهيار النواة (pstore/console-ramoops أو last_kmsg) لمعرفة السطر المتسبب في الانهيار.',
          'تفليش قطاع boot.img و vendor_boot.img الأصليين لاستعادة النواة والتعريفات السليمة.'
        ],
        repairTechniquesEn: [
          'Dump kernel crash logs via pstore/console-ramoops or last_kmsg to locate failing driver module.',
          'Reflash clean stock boot.img and vendor_boot.img to reinstate factory kernel binaries.'
        ]
      },
      {
        name: 'dm-verity (Device Mapper Verity)',
        roleAr: 'محرك التحقق العتادي اللحظي من سلامة كل قطاع تخزين أثناء قراءة تطبيقات النظام.',
        roleEn: 'Real-time block-level transparent cryptographic verification for all system storage reads.',
        securityFunctionAr: 'حظر أي تعديل على ملفات النظام المحمية وإطلاق إعادة تشغيل إجبارية عند التلاعب.',
        securityFunctionEn: 'Detects unauthorized block modifications on read-only partitions, triggering kernel restart.',
        commonFailuresAr: [
          'إعادة تشغيل مستمرة بعد الوصول لشاشة أندرويد الرئيسية (Soft Reboots).',
          'فشل إقلاع النظام بعد تثبيت تطبيقات روت غير متوافقة في مسار /system.'
        ],
        commonFailuresEn: [
          'Continuous reboot loop shortly after displaying Android lockscreen (Soft Reboots).',
          'OS boot failure following incompatible root tools attempting direct writes to /system.'
        ],
        repairTechniquesAr: [
          'تعطيل التحقق عبر تمرير معلمة androidboot.veritymode=disabled في كونسول الإقلاع.',
          'إعادة بناء شجرة الهاش للبارتشن المعدل باستخدام أداة veritysetup أو lpmake.'
        ],
        repairTechniquesEn: [
          'Disable dm-verity check via androidboot.veritymode=disabled kernel boot parameter.',
          'Rebuild partition Merkle tree with veritysetup or repack logical images via lpmake.'
        ]
      }
    ],
    lowLevelDetailsAr: [
      'شجرة Merkle Tree تقسم مساحة البارتشن إلى طبقات من الهاشات، حيث يمثل جذر الشجرة (Root Hash) 32 بايت فقط تُحفظ في VBMETA.',
      'إذا تعطل بلوك واحد في الـ Flash Memory بسبب التآكل الفيزيائي (Bad Block)، يعتبره dm-verity اختراقاً أمنياً ويرفض الإقلاع.',
      'تقنية FEC (Forward Error Correction) المدمجة تسمح للنواة بتصحيح ما يصل إلى 4 بايتات تالفة لكل 512 بايت تلقائياً.'
    ],
    lowLevelDetailsEn: [
      'Merkle tree compresses gigabytes of partition blocks into a single 32-byte Root Hash stored in VBMETA.',
      'If a single physical storage block degrades due to NAND wear, dm-verity treats it as tampering and halts.',
      'Integrated FEC (Forward Error Correction) allows kernel to autonomously recover up to 4 corrupted bytes per 512-byte block.'
    ],
    technicalCommandExample: 'veritysetup status /dev/mapper/system # Query dm-verity active verification status'
  },
  {
    id: 'layer-dynamic-super-partitions',
    order: 5,
    nameAr: 'طبقة البارتشنات الديناميكية ونظام الملفات (Dynamic Super Partition & dm-linear Storage)',
    nameEn: 'Dynamic Partitions (Super.img), dm-linear & Filesystem Layout',
    subtitleAr: 'تجميع system, vendor, product, odm داخل حاوية مرنة واحدة بإدارة Device Mapper',
    subtitleEn: 'Consolidation of system, vendor, product into unified super container via dm-linear',
    badge: 'STAGE 4 / SUPER STORAGE',
    category: 'system',
    color: 'from-purple-600 to-violet-500',
    descriptionAr: 'منذ أندرويد 10، ألغت الشركات التقسيم الثابت لذواكر التخزين واستبدلته بحاوية ديناميكية عملاقة تُدعى super.img. داخل هذه الحاوية، يتم توزيع البارتشنات (system, vendor, product, system_ext, odm) كأقسام منطقية (Logical Partitions) يديرها موديول dm-linear. يتيح هذا النظام تحديث النظام عبر الهواء (OTA) بمرونة دون الخوف من نفاد مساحة بارتشن معين، ولكنه جعل عمليات الإصلاح اليدوي تتطلب أدوات متقدمة مثل lpmake و simg2img.',
    descriptionEn: 'Starting with Android 10, static storage partitioning was superseded by dynamic partitions consolidated inside super.img. Managed by the kernel dm-linear driver, partitions like system, vendor, product, and odm exist as resizable logical block devices. While dynamic partitions facilitate seamless OTA updates across varying image sizes, manual repair and custom image injection necessitate specialized low-level utilities such as lpmake and simg2img.',
    components: [
      {
        name: 'Super Dynamic Container (super.img)',
        roleAr: 'الحاوية الفيزيائية الجامعة لكافة الأقسام التشغيلية للنظام.',
        roleEn: 'Physical container holding dynamic logical volumes for the entire Android framework.',
        securityFunctionAr: 'حماية مساحة التخزين من التداخل، ودعم الأمان المزدوج مع نظام A/B Slots (super_a / super_b).',
        securityFunctionEn: 'Guards partition boundaries and supports A/B redundant slot updates within dynamic pool.',
        commonFailuresAr: [
          'رسالة خطأ أثناء التفليش: "No space left on device" أو "Cannot flash logical partition in non-fastbootd mode".',
          'تلف جدول البيانات التعريفي (Metadata Header Corrupted) مما يؤدي إلى عدم تعرف النظام على الأقسام المنطقية.'
        ],
        commonFailuresEn: [
          'Flashing abort: "No space left on device" or "Cannot flash logical partition in non-fastbootd mode".',
          'Corrupted LP metadata headers causing bootloader to drop logical partition mappings.'
        ],
        repairTechniquesAr: [
          'الدخول إلى وضع Fastbootd (وليس Fastboot العادي) لتفليش الأقسام المنطقية: fastboot reboot fastboot.',
          'استخدام أداة lpunpack لاستخراج الأقسام وإعادة بنائها عبر lpmake بزيادة الحجم المخصص للحاوية.'
        ],
        repairTechniquesEn: [
          'Enter Fastbootd mode (userspace fastboot) to flash logical images: fastboot reboot fastboot.',
          'Unpack dynamic images via lpunpack and reassemble via lpmake expanding target block geometry.'
        ]
      },
      {
        name: 'Filesystems (EROFS / EXT4 / F2FS)',
        roleAr: 'هيكلة تخزين الملفات وقواعد البيانات (EROFS فائق السرعة للقراءة، و F2FS/EXT4 لبيانات المستخدم /data).',
        roleEn: 'Underlying block format: read-only compressed EROFS for system, F2FS/EXT4 for /data.',
        securityFunctionAr: 'تطبيق سمات التشفير المتقدمة (FBE - File Based Encryption) وصلاحيات المجلدات.',
        securityFunctionEn: 'Enforces File-Based Encryption (FBE) contexts and POSIX security descriptors.',
        commonFailuresAr: [
          'تلف نظام ملفات بارتشن /data وطلب رمز PIN عشوائي أو ظهور شاشة Rescue Mode.',
          'بطء شديد وتجمد الجهاز بسبب أخطاء قطاعات الـ F2FS Garbage Collection في الذواكر المستهلكة.'
        ],
        commonFailuresEn: [
          'Corrupted /data partition structure causing infinite rescue prompt or phantom PIN demands.',
          'Severe system freezes caused by F2FS garbage collection stalls on worn NAND flash.'
        ],
        repairTechniquesAr: [
          'إجراء تنسيق آمن لبارتشن البيانات مع إعادة بناء التشفير: fastboot -w.',
          'فحص سلامة الذاكرة عبر أوامر e2fsck أو fsck.f2fs من خلال وضع الريكفري.'
        ],
        repairTechniquesEn: [
          'Perform clean wipe wiping userdata and restoring crypto headers: fastboot -w.',
          'Execute filesystem consistency checks via e2fsck or fsck.f2fs in recovery shell.'
        ]
      }
    ],
    lowLevelDetailsAr: [
      'الـ Metadata داخل super.img يخزن في أول 1MB ويحتوي على جدول يربط كل قسم منطقي بكتل التخزين الفيزيائية بدقة البايت.',
      'نظام ملفات EROFS (Enhanced Read-Only File System) الذي تستخدمه جوجل وسامسونج يوفر ضغط بيانات بنسبة 30% مع تقليل زمن قراءة الكتل بنسبة 20%.',
      'في أجهزة A/B، قد تشترك الشريحتان في نفس الـ Super partition حيث يتم تخصيص أسماء مثل system_a و system_b كأقسام منطقية منفصلة.'
    ],
    lowLevelDetailsEn: [
      'Metadata table in super.img resides within initial 1MB, mapping logical sectors to physical flash blocks.',
      'Modern EROFS filesystem achieves ~30% storage compression while accelerating random reads by 20%.',
      'In A/B devices, dynamic pools contain concurrent logical slots (e.g. system_a and system_b) in one super container.'
    ],
    technicalCommandExample: 'lpunpack super.img ./extracted_partitions # Extract dynamic logical partitions'
  },
  {
    id: 'layer-init-security-framework',
    order: 6,
    nameAr: 'طبقة نظام التهيئة وحصون الحماية (Android Init, SELinux, Keymaster & Knox)',
    nameEn: 'Userspace Init, SELinux Policies, Keymaster & Knox Security Suites',
    subtitleAr: 'تشغيل الخدمات الأساسية (Zygote, SurfaceFlinger, AIDL HALs) وتطبيق التحكم الصارم في الوصول',
    subtitleEn: 'Service orchestration (Zygote, SurfaceFlinger), Mandatory Access Control & Hardware Keystore',
    badge: 'STAGE 5 / RUNTIME VAULT',
    category: 'security',
    color: 'from-rose-600 to-pink-500',
    descriptionAr: 'هذه هي قمة نظام التشغيل حيث ينفذ الكيرنل أول عملية في فضاء المستخدم: `/system/bin/init`. يقوم الـ Init بقراءة ملفات `init.rc`، تحميل سياسات SELinux في وضع Enforcing الصارم، تشغيل محركات الأجهزة (HALs عبر AIDL/HIDL)، تفعيل تشفير الملفات (FBE)، وبدء تشغيل خدمة Zygote التي تولد كافة تطبيقات أندرويد. في أجهزة سامسونج، تنشط حزمة Knox (TIMA, DEFEX, RKP) لمراقبة سلامة النواة في الوقت الحقيقي ومنع أي محاولة تعديل لصلاحيات الروت.',
    descriptionEn: 'The pinnacle userspace layer boots when the kernel executes PID 1: `/system/bin/init`. Init parses `init.rc` configuration scripts, latches SELinux into enforcing mode, bootstraps Hardware Abstraction Layers (HALs via AIDL), enables File-Based Encryption (FBE), and forks the Zygote virtual machine. On Samsung platforms, Knox runtime defenses (TIMA, DEFEX, RKP) continuously audit kernel memory structures to block privilege escalation and root persistence.',
    components: [
      {
        name: 'Android Init & Zygote Process',
        roleAr: 'المحرك الأب لكافة خدمات النظام (SystemServer) ومكتبات التشغيل وتطبيقات المستخدم.',
        roleEn: 'Grandparent process spawning SystemServer, Android runtime (ART), and app sandboxes.',
        securityFunctionAr: 'حصر صلاحيات العمليات عبر الـ Linux Capabilities ومنع وصول العمليات لمنافذ العتاد دون إذن.',
        securityFunctionEn: 'Drops root privileges via Linux Capabilities and enforces process chroot and namespace isolation.',
        commonFailuresAr: [
          'التعليق على شعار أندرويد المتحرك الثاني (Stuck on animated boot animation).',
          'انهيار خدمة SystemServer المستمر بسبب نقص ملفات الـ Framework أو أخطاء Dalvik/ART Cache.'
        ],
        commonFailuresEn: [
          'Trapped in secondary animated boot logo (Framework init loop).',
          'Continuous SystemServer crash loop triggered by corrupted framework JARs or ART cache inconsistency.'
        ],
        repairTechniquesAr: [
          'مسح الكاش الشامل (Wipe Cache / Dalvik Cache) لإجبار الـ ART على إعادة ترجمة ملفات الـ DEX.',
          'استخراج سجل logcat عبر ADB أثناء الإقلاع لاكتشاف استثناء الـ Java Crash وتصحيحه.'
        ],
        repairTechniquesEn: [
          'Clear Dalvik/ART cache via recovery menu forcing system runtime to re-optimize bytecode.',
          'Capture live early-boot logcat via ADB to isolate fatal Java runtime NullPointer exceptions.'
        ]
      },
      {
        name: 'SELinux (Security-Enhanced Linux)',
        roleAr: 'نظام التحكم الصارم في الوصول (Mandatory Access Control) المعين لكل ملف ومسار وعملية.',
        roleEn: 'Mandatory Access Control (MAC) kernel engine auditing every system call and file interaction.',
        securityFunctionAr: 'منع العمليات ذات صلاحيات الروت من اختراق العمليات الأخرى حتى لو كُسرت الحماية الأساسية.',
        securityFunctionEn: 'Confines compromised processes, preventing unauthorized file access even under UID 0.',
        commonFailuresAr: [
          'فشل إقلاع الجهاز وظهور إعادة تشغيل مفاجئة بسبب انتهاك قواعد الـ sepolicy في ملفات الروت.',
          'فشل تشغيل الواي فاي أو البلوتوث بعد تعديل النظام بسبب رفض SELinux السماح للـ HAL بقراءة التعريف.'
        ],
        commonFailuresEn: [
          'Boot halt or panic caused by unlabelled daemon violating mandatory SELinux rules.',
          'Wi-Fi or Bluetooth dead after modding due to SELinux blocking HAL daemon access to firmware files.'
        ],
        repairTechniquesAr: [
          'إصلاح تسميات الملفات الأمنية عبر أمر: restorecon -FR /vendor /system.',
          'استخراج انتهاكات الـ AVC عبر: dmesg | grep "avc: denied" وترقيع السياسات باستخدام magiskpolicy.'
        ],
        repairTechniquesEn: [
          'Restore filesystem security labels using recovery command: restorecon -FR /vendor /system.',
          'Inspect AVC audit denials via dmesg | grep "avc: denied" and inject missing allow rules with magiskpolicy.'
        ]
      },
      {
        name: 'Hardware Keymaster / KeyMint & Knox DEFEX',
        roleAr: 'إدارة تشفير كلمات المرور، شهادات الأمان، وحماية النواة في الوقت الحقيقي.',
        roleEn: 'Hardware cryptographic key storage, credential hashing, and real-time kernel integrity monitoring.',
        securityFunctionAr: 'حرق شهادة الأمان عند كشف الروت (Knox Trip 0x1) ومنع الوصول للخدمات المصرفية ومحفظة سامسونج.',
        securityFunctionEn: 'Revokes Samsung Pay / Secure Folder upon Knox 0x1 trip and prevents unauthorized kernel page writes.',
        commonFailuresAr: [
          'توقف مجلد الأمان (Secure Folder) وتطبيقات Samsung Health نهائياً بعد محاولة عمل روت.',
          'ظهور رسالة تحذير أمني "Security notice: Unauthorized actions have been detected".'
        ],
        commonFailuresEn: [
          'Permanent disablement of Secure Folder and Samsung Health following Knox trip 0x1.',
          'Persistent popup: "Security notice: Unauthorized actions have been detected. Restart your phone".'
        ],
        repairTechniquesAr: [
          'تثبيت ترقيعات Knox Patch و Magisk Modules لإخفاء حالة الـ Knox Trip عن التطبيقات العادية.',
          'تفليش روم المصنع الكامل الرسمي 4 أجزاء (BL, AP, CP, CSC) لإعادة النظام إلى وضعه النقي الخالي من التعديلات.'
        ],
        repairTechniquesEn: [
          'Deploy Knox bypass patches and Magisk Zygisk modules to spoof Knox intact state for banking apps.',
          'Flash full 4-file factory firmware (BL, AP, CP, CSC) with PIT repartition to restore virgin OS state.'
        ]
      }
    ],
    lowLevelDetailsAr: [
      'الـ SELinux يعمل في وضعين: Permissive (يسجل الانتهاكات فقط دون منعها) و Enforcing (يحظر كل عملية غير مسجلة مسبقاً).',
      'تشفير الملفات FBE يستخدم نوعين من المفاتيح: مفاتيح CE (Credential Encrypted) ومفاتيح DE (Device Encrypted) التي تسمح برنين المنبه قبل إدخال الرمز.',
      'محرك Samsung DEFEX يعمل داخل كيرنل سامسونج لمراقبة أوامر `execve` وحظر تشغيل ملفات `su` أو الأوامر المجهولة تلقائياً.'
    ],
    lowLevelDetailsEn: [
      'SELinux modes: Permissive (logs audit events without blocking) and Enforcing (strictly halts unregistered calls).',
      'File-Based Encryption (FBE) utilizes dual key tiers: Credential Encrypted (CE) and Device Encrypted (DE - unlocks early alarms).',
      'Samsung DEFEX kernel module intercepts `execve` syscalls, preemptively blocking uncertified `su` or shell binaries.'
    ],
    technicalCommandExample: 'dmesg | grep "type=1400" # Filter real-time SELinux AVC violation denials'
  }
];

// =========================================================================
// 2. آليات الحماية والأمان العميقة (Core Security & Protection Mechanisms)
// =========================================================================
export const CORE_SECURITY_MECHANISMS: SecurityMechanism[] = [
  {
    id: 'sec-avb20',
    titleAr: 'نظام الإقلاع المحقق أندرويد (Android Verified Boot - AVB 2.0)',
    titleEn: 'Android Verified Boot 2.0 (AVB 2.0 & VBMETA)',
    badge: 'AVB 2.0',
    category: 'boot-integrity',
    shortDescAr: 'سلسلة الثقة الرقمية المشفرة التي تتحقق من توقيع وسلامة كل بارتشن في النظام باستخدام شهادات RSA وشجرة Merkle Tree.',
    shortDescEn: 'Cryptographic chain of trust validating partition image integrity from bootloader through to userspace via Merkle trees.',
    howItWorksAr: [
      'يحتوي قطاع vbmeta.img على واصفات الهاش (Hash Descriptors) للبارتشنات الصغيرة، وواصفات شجرة الهاش (Hashtree Descriptors) للبارتشنات الضخمة.',
      'يقوم محمل الإقلاع ABL بالتحقق من توقيع VBMETA بمفتاح OEM العام المخزن كبصمة في الـ eFuses.',
      'يقوم الـ ABL بفحص رقم إصدار مكافحة الرجوع (Rollback Index) لمنع الرجوع إلى فلاشات أقدم تحتوي على ثغرات أمنية.',
      'إذا نجح الفحص، يسلم البوتلودر وسائط المعلمات للكيرنل عبر إعدادات dm-mod لتفعيل حماية dm-verity.'
    ],
    howItWorksEn: [
      'The vbmeta.img partition encapsulates Hash Descriptors for small images and Hashtree Descriptors for large filesystems.',
      'ABL bootloader verifies the digital signature of VBMETA against the public key hash burned into SoC eFuses.',
      'ABL verifies the Rollback Index counter stored in hardware NVRAM/eFuses to prevent security downgrade exploits.',
      'Upon successful cryptographic validation, ABL instructs the kernel via dm-mod flags to mount partitions under dm-verity.'
    ],
    vulnerabilitiesAndBypassesAr: [
      'إلغاء تفعيل التحقق بحقن علمَي `--disable-verity` و `--disable-verification` في هيدر الـ VBMETA.',
      'استبدال مفتاح الـ RoT العام بمفتاح مخصص (Custom Key) في الأجهزة التي تدعم فتح البوتلودر (Yellow State).',
      'ثغرات الـ BootROM في معالجات MTK القديمة (BROM SLA/DA Bypass) لتجاوز فحص التوقيع بالكامل.'
    ],
    vulnerabilitiesAndBypassesEn: [
      'Disabling verification by toggling `--disable-verity` and `--disable-verification` bit flags in VBMETA header.',
      'Installing custom Root of Trust keys on OEM unlock supported platforms (transitioning device to Yellow State).',
      'Low-level BootROM glitching/exploits (such as MTK Kamakiri / SLA bypass) completely skipping signature checks.'
    ],
    diagnosticIndicatorsAr: [
      'ظهور تحذير "Red State: Your device is corrupt and cannot boot".',
      'ظهور تحذير "Orange State: Your bootloader is unlocked and software integrity cannot be guaranteed".',
      'فشل أمر fastboot flash وظهور "FAILED (remote: signature verify failed)".'
    ],
    diagnosticIndicatorsEn: [
      'Warning banner: "Red State: Your device is corrupt and cannot boot".',
      'Warning banner: "Orange State: Your bootloader is unlocked and software integrity cannot be guaranteed".',
      'Fastboot failure log: "FAILED (remote: signature verify failed)".'
    ],
    repairMethodologyAr: [
      'توليد ملف vbmeta_disabled.img باستخدام أمر avbtool الرسمي.',
      'تفليش الروم الرسمي مع ملف الـ vbmeta الأصلي لإعادة تفعيل سلسلة الثقة وإلغاء حالة الـ Red State.',
      'التأكد من مطابقة الـ Security Patch Level لتجنب صراع الـ Rollback Index.'
    ],
    repairMethodologyEn: [
      'Generate patched vbmeta_disabled.img with null flags via official avbtool utility.',
      'Reflash complete certified stock ROM including stock vbmeta to rebuild Green State trust chain.',
      'Verify matching Security Patch Level to avert hardware Rollback Index rejections.'
    ],
    cliTools: ['avbtool', 'fastboot', 'edl', 'oem-unlock'],
    codeSnippet: {
      language: 'bash',
      title: 'أمر توليد وترقيع ملف VBMETA لتعطيل الفحص (Disable Verity Patch)',
      code: `# إنشاء VBMETA فارغ مع تعطيل التحقق تماماً
avbtool make_vbmeta_image \\
  --flags 2 \\
  --padding_size 4096 \\
  --output vbmeta_disabled.img

# أو تفليش الملف الحالي مع تفعيل أعلام الإلغاء عبر فاست بوت
fastboot flash vbmeta --disable-verity --disable-verification vbmeta.img`
    }
  },
  {
    id: 'sec-dm-verity',
    titleAr: 'حماية كتل التخزين الحية (Device Mapper Verity - dm-verity)',
    titleEn: 'Device Mapper Block Integrity Engine (dm-verity)',
    badge: 'DM-VERITY',
    category: 'boot-integrity',
    shortDescAr: 'نظام تشفير شفاف مدمج في نواة لينكس يفحص كل 4096 بايت في الوقت الفعلي ويكتشف أي تغيير طفيف في ملفات النظام.',
    shortDescEn: 'Transparent kernel subsystem computing live SHA-256 block hashes against a Merkle tree to detect block-level tampering.',
    howItWorksAr: [
      'يتم تنظيم البارتشن (system.img) إلى بلوكات بحجم 4KB، وحساب هاش SHA-256 لكل بلوك وتخزينه في شجرة Merkle Tree.',
      'في نهاية البارتشن، يتم تخزين جدول الهاشات وقطاع البيانات التعريفي (Verity Table).',
      'يقوم الكيرنل عند طلب قراءة أي ملف بحساب هاش البلوك ومطابقته فورياً مع الشجرة.',
      'في حال وجود أي بايت تالف، يتم استخدام تقنية تصحيح الأخطاء FEC، وإذا فشلت، يطلق الكيرنل خطأ I/O Error أو Kernel Panic.'
    ],
    howItWorksEn: [
      'Filesystem is divided into 4KB data blocks; a SHA-256 hash is computed for each block into a tiered Merkle tree.',
      'The hash table and salt descriptor are appended at the boundary of the block device.',
      'Whenever userspace reads a sector, dm-verity hashes the block and validates it up to the verified root hash.',
      'If an unrecoverable bit flip occurs and FEC cannot reconstruct it, the kernel raises an immediate I/O abort or panic.'
    ],
    vulnerabilitiesAndBypassesAr: [
      'تعديل ملف fstab داخل vendor أو boot.img وحذف وسم `verify` أو `avb`.',
      'استبدال جدول verity table بمفتاح هاش معدل مع إعادة توقيع vbmeta.',
      'تثبيت أدوات Systemless Root (مثل Magisk) التي تترك بارتشنات النظام دون تعديل وتقوم بحقن التعديلات في الذاكرة العشوائية RAM فقط.'
    ],
    vulnerabilitiesAndBypassesEn: [
      'Editing partition fstab inside vendor or ramdisk to remove `verify` and `avb` mount flags.',
      'Regenerating the Merkle tree with veritysetup and updating the root hash inside custom vbmeta.',
      'Deploying Systemless Root (such as Magisk / KernelSU) which leaves physical blocks pristine and injects mounts in RAM.'
    ],
    diagnosticIndicatorsAr: [
      'رسالة: "dm-verity verification failed... Need to check DRK first".',
      'إعادة تشغيل الجهاز التلقائية بعد 5 إلى 30 ثانية من بدء إقلاع النظام.',
      'ظهور أخطاء `EXT4-fs error` أو `EROFS error` في سجل dmesg.'
    ],
    diagnosticIndicatorsEn: [
      'Onscreen warning: "dm-verity verification failed... Need to check DRK first".',
      'Automatic reboot loop 5 to 30 seconds after initial boot animation engages.',
      'Extensive `EXT4-fs error` or `EROFS verification failed` lines in kernel dmesg stream.'
    ],
    repairMethodologyAr: [
      'تفليش البارتشن التالف (system/vendor) كملف كامل من الروم الرسمي لإعادة البلوكات الأصلية.',
      'إصلاح مفاتيح التشفير DRK (Device Root Key) في أجهزة سامسونج عبر تفليش ملف Combination ثم الروم الرسمي.',
      'ترقيع الكيرنل لتعطيل فرض التحقق الإجباري.'
    ],
    repairMethodologyEn: [
      'Reflash the degraded logical image (system/vendor) from stock factory package to overwrite corrupt sectors.',
      'Restore corrupted Samsung DRK (Device Root Key) by staging Combination firmware followed by clean multi-CSC ROM.',
      'Deploy custom patched boot image bypassing dm-verity kernel panics.'
    ],
    cliTools: ['veritysetup', 'lpmake', 'simg2img', 'fastboot'],
    codeSnippet: {
      language: 'bash',
      title: 'فحص وبناء جدول dm-verity لبارتشن النظام عبر veritysetup',
      code: `# حساب شجرة الهاش لبارتشن النظام
veritysetup format system.raw.img system.verity.img

# التحقق من سلامة البارتشن مقابل الهاش الجذري
veritysetup verify \\
  system.raw.img \\
  system.verity.img \\
  6a35d962f913d8e980... # Root Hash من VBMETA`
    }
  },
  {
    id: 'sec-anti-rollback',
    titleAr: 'حماية منع الرجوع بالإصدار (Anti-Rollback Protection - ARB)',
    titleEn: 'Anti-Rollback eFuse Downgrade Prevention (ARB)',
    badge: 'ARB DEFENSE',
    category: 'hardware-root',
    shortDescAr: 'آلية عتادية صلبة تعتمد على حرق فيوزات داخل المعالج لمنع الرجوع إلى إصدارات أقدم تحتوي على ثغرات أمنية.',
    shortDescEn: 'Hardware-enforced eFuse index system preventing software downgrades to older firmware with known vulnerabilities.',
    howItWorksAr: [
      'تحتوي فلاشات الهاتف على رقم حماية (Security Rollback Index) مدمج في محملات الإقلاع (xbl, abl, tz).',
      'عند التحديث لإصدار جديد، يكتشف النظام ارتفاع رقم الحماية ويقوم المعالج بحرق فيوز كهربائي مجهري داخل مصفوفة QFPROM.',
      'في كل عملية إقلاع، يقارن الـ BootROM رقم حماية الملف مع عدد الفيوزات المحترقة في السيليكون.',
      'إذا كان رقم حماية الفلاشة أقل من الفيوز، يرفض المعالج الإقلاع ويسقط فوراً في وضع الطوارئ EDL 9008 أو BROM.'
    ],
    howItWorksEn: [
      'Firmware packages embed a cryptographically signed Rollback Index inside bootloader binaries (xbl, abl, tz).',
      'When an incremental update elevates the security tier, hardware circuits permanently blow a microscopic fuse in QFPROM.',
      'On every power cycle, BootROM compares binary header rollback counters against the blown fuse count in silicon.',
      'If the flashing firmware carries an index lower than the blown fuse register, the SoC halts and drops to EDL 9008 / BROM.'
    ],
    vulnerabilitiesAndBypassesAr: [
      'تعديل ملف التفليش وحذف قطاعات محمل الإقلاع (xbl, abl, tz) والإبقاء على النظام فقط إذا كان الكيرنل متوافقاً.',
      'استخدام ملف Firehose أو DA خاص لا يتحقق من الـ ARB لكتابة البارتشنات في وضع الطوارئ.',
      'تفليش إصدار يحتوي على نفس رقم الحماية (Same Binary Number) حتى لو كان إصدار أندرويد أقدم.'
    ],
    vulnerabilitiesAndBypassesEn: [
      'Pruning bootloader partitions (xbl, abl, tz) from the flash package, updating only system/vendor if kernel supports it.',
      'Employing engineering Firehose ELF loaders or MTK DA bypass tools that disregard ARB constraints.',
      'Flashing an older Android version that shares the exact same Binary/Bit tier as the hardware fuse state.'
    ],
    diagnosticIndicatorsAr: [
      'موت مفاجئ للهاتف بعد التفليش وظهور منفذ Qualcomm 9008 أو MediaTek Preloader VCOM.',
      'في فاست بوت: `fastboot getvar anti` يعطي قيمة (مثلاً 4) بينما الفلاشة المراد تفليشها تحتوي على (3).',
      'في أجهزة شاومي: رسالة "The system has been destroyed".'
    ],
    diagnosticIndicatorsEn: [
      'Hard brick following flash tool execution; device presents only Qualcomm 9008 or MediaTek VCOM port.',
      'Fastboot telemetry: `fastboot getvar anti` reports index 4 while target firmware contains index 3.',
      'On Xiaomi devices: Onscreen panic "The system has been destroyed".'
    ],
    repairMethodologyAr: [
      'تحديد رقم الـ Binary الحالي في الهاتف بدقة من وضع Recovery أو Fastboot.',
      'تحميل وتفليش أحدث إصدار روم رسمي يحمل رقم حماية أعلى أو متطابق عبر EDL 9008.',
      'عدم محاولة تفليش ملفات bootloader من هواتف أخرى لتجنب حرق فيوزات إضافية عن طريق الخطأ.'
    ],
    repairMethodologyEn: [
      'Determine current Binary / Bit level accurately from Recovery screen or Fastboot headers.',
      'Download and flash latest official factory package bearing an equal or higher security bit via EDL 9008.',
      'Never flash foreign bootloader binaries to avoid accidentally blowing additional hardware eFuses.'
    ],
    cliTools: ['fastboot getvar anti', 'edl --query-anti', 'samloader', 'odin'],
    codeSnippet: {
      language: 'bash',
      title: 'استعلام رقم الحماية ARB في وضع Fastboot قبل التفليش',
      code: `# استعلام عداد الحماية في معالجات كوالكوم / شاومي
fastboot getvar anti

# استعلام البوتلودر الحالي ومعلومات الجهاز
fastboot getvar all 2>&1 | grep -E "anti|version-bootloader"`
    }
  },
  {
    id: 'sec-knox-defex',
    titleAr: 'منظومة حماية سامسونج نوكس (Samsung Knox, TIMA & DEFEX)',
    titleEn: 'Samsung Knox Security Suite, TIMA & Real-Time DEFEX',
    badge: 'SAMSUNG KNOX',
    category: 'anti-tamper',
    shortDescAr: 'منظومة حماية متكاملة تعتمد على العتاد والنواة لمراقبة سلامة النظام ومنع الروت وتأمين الحاويات المؤسسية.',
    shortDescEn: 'Hardware-anchored multi-tier security framework combining silicon eFuses, TrustZone integrity, and real-time kernel guards.',
    howItWorksAr: [
      'تعتمد على فيوز عتادي (Knox Warranty Void Bit) قيمته 0x0 في المصنع، وينحرق كهربائياً إلى 0x1 فور تفليش كود غير معتمد.',
      'تعمل حزمة TIMA (TrustZone-based Integrity Measurement) داخل العالم الآمن لفحص شفرة الكيرنل بانتظام.',
      'يراقب موديول DEFEX أوامر النظام اللحظية ويحظر أي عملية تحاول استدعاء مسار `su` أو تعديل الجداول المحمية.',
      'عند احتراق الفيوز، يتم إتلاف مفاتيح التشفير العتادية لمجلد الأمان Secure Folder ومحفظة سامسونج بشكل دائم لا يمكن التراجع عنه.'
    ],
    howItWorksEn: [
      'Anchored to a physical silicon fuse (Knox Warranty Void Bit 0x0) that trips permanently to 0x1 upon flashing custom boot/recovery.',
      'TIMA operates inside isolated TrustZone to cyclically audit kernel code pages and Page Tables against memory tampering.',
      'DEFEX kernel driver actively intercepts system execution calls, preemptively neutralizing unauthorized escalation binaries.',
      'Once the fuse trips, hardware master keys linked to Samsung Pass and Secure Folder are destroyed irreversibly.'
    ],
    vulnerabilitiesAndBypassesAr: [
      'استخدام ترقيعات Magisk Zygisk لإخفاء حالة الـ Knox Trip عن التطبيقات المصرفية العادية.',
      'تعديل كود الـ Kernel في الرومات المعدلة لتعطيل موديول DEFEX و RKP للسماح بعمل الروت.',
      'لا يمكن إعادة فيوز Knox إلى 0x0 برمجياً إطلاقاً لأنه فيوز فيزيائي محترق (يتطلب تبديل المعالج اللوحي).'
    ],
    vulnerabilitiesAndBypassesEn: [
      'Injecting Magisk Zygisk modules to spoof Knox status flags for standard consumer banking apps.',
      'Kernel source patching to excise DEFEX and RKP hooks in custom kernels, permitting root persistence.',
      'The 0x1 fuse state cannot be reset via software as it is physically severed in silicon (requires motherboard/CPU replacement).'
    ],
    diagnosticIndicatorsAr: [
      'شاشة وضع الداونلود (Download Mode) تعرض: `KNOX WARRANTY VOID: 0x1 (4)` أو `AP SWREV: B:8 K:8 S:8`.',
      'توقف فوري لتطبيق Samsung Pass والمجلد الآمن مع رسالة: "This device has been rooted".',
      'إعادة تشغيل مستمرة بسبب موديول DEFEX عند محاولة تثبيت SuperSU أو ملفات كيرنل قديمة.'
    ],
    diagnosticIndicatorsEn: [
      'Download Mode telemetry confirms: `KNOX WARRANTY VOID: 0x1` and binary counters `AP SWREV: B:8`.',
      'Immediate launch abort on Secure Folder with banner: "Unauthorized software installed. Access revoked".',
      'Bootloop triggered by DEFEX panic when outdated root binaries attempt kernel memory injections.'
    ],
    repairMethodologyAr: [
      'تفليش روم المصنع الكامل 4 ملفات (BL, AP, CP, CSC) باستخدام Odin لإعادة تفعيل استقرار النظام.',
      'تثبيت ترقيع Knox Patch في حالة الأجهزة المروتة لإعادة تشغيل تطبيقات سامسونج غير المعتمدة على المفتاح العتادي.',
      'استخدام ملف PIT أصلي لإعادة ضبط جدول التقسيم ومسح أي آثار للملفات المعدلة.'
    ],
    repairMethodologyEn: [
      'Flash certified 4-file factory firmware package (BL, AP, CP, CSC) via Odin to re-establish OS equilibrium.',
      'Apply Knox Patch module on rooted builds to restore compatible Samsung features that do not strictly require hardware keys.',
      'Execute Odin flash with official PIT file to rebuild corrupted partition partitions and clear root residues.'
    ],
    cliTools: ['odin3', 'heimdall', 'samloader', 'frija'],
    codeSnippet: {
      language: 'bash',
      title: 'فحص حالة Knox وتفليش الروم الكامل عبر Heimdall في لينكس',
      code: `# فحص اتصال الهاتف بوضع الداونلود
heimdall detect

# تفليش البارتشنات الأساسية لإلغاء التعليق
heimdall flash \\
  --BOOT boot.img \\
  --RECOVERY recovery.img \\
  --VBMETA vbmeta.img`
    }
  },
  {
    id: 'sec-fbe-encryption',
    titleAr: 'تشفير الملفات والذواكر (File-Based Encryption - FBE & Keymaster)',
    titleEn: 'File-Based Encryption (FBE) & TEE Keymaster Engine',
    badge: 'FBE CRYPTO',
    category: 'encryption',
    shortDescAr: 'نظام تشفير ملفات المستخدم في بارتشن /data باستخدام مفاتيح مشتقة عتادياً بالاشتراك مع معالج الأمان TEE ومفتاح قفل الشاشة.',
    shortDescEn: 'Multi-tiered storage encryption securing /data with hardware-bound keys generated inside ARM TrustZone Keymaster.',
    howItWorksAr: [
      'يقسم التشفير إلى نوعين: تشفير الجهاز (Device Encrypted - DE) وتشفير بيانات الاعتماد (Credential Encrypted - CE).',
      'مفاتيح الـ DE تكون متاحة فور إقلاع الهاتف لتشغيل المنبه وتلقي المكالمات قبل أن يفتح المستخدم قفل الشاشة.',
      'مفاتيح الـ CE لا تُفكك إلا بعد قيام المستخدم بإدخال كلمة المرور أو البصمة بنجاح، حيث يقوم الـ Gatekeeper في TEE باشتقاق المفتاح.',
      'تخزن الترويسات المشفرة في مسار `/data/unencrypted/key` وفي بارتشن `metadata` المنفصل.'
    ],
    howItWorksEn: [
      'FBE operates two discrete key tiers: Device Encrypted (DE) storage and Credential Encrypted (CE) storage.',
      'DE keys are unlocked immediately at boot by TEE, allowing the phone to receive incoming calls and fire alarms.',
      'CE keys remain cryptographically locked until the user inputs their passcode/biometrics, verified by TEE Gatekeeper.',
      'Keymaster encryption metadata and master salt reside inside `/data/unencrypted/` and the dedicated `metadata` partition.'
    ],
    vulnerabilitiesAndBypassesAr: [
      'لا يمكن كسر تشفير AES-256-XTS دون معرفة كلمة المرور أو وجود مفتاح الـ TEE السليم.',
      'إذا تعطلت شريحة الـ TEE أو تلف بارتشن metadata، يصبح من المستحيل استعادة البيانات المشفرة ويجب إجراء فورمات كامل.',
      'يمكن تهيئة بارتشن /data بدون تشفير (Decrypted Data) في الرومات المعدلة بتعديل ملف fstab.'
    ],
    vulnerabilitiesAndBypassesEn: [
      'AES-256-XTS payload encryption is mathematically unbreakable without the correct passcode and intact TEE Keymaster.',
      'If the TEE coprocessor desynchronizes or metadata partition corrupts, data recovery is impossible and full wipe is mandatory.',
      'Modded custom ROMs can run in decrypted state by removing `fileencryption=aes-256-xts` parameters from vendor fstab.'
    ],
    diagnosticIndicatorsAr: [
      'التعليق في شاشة تطلب كلمة مرور عشوائية بعد تفليش سوفت وير غير متطابق.',
      'رسالة: "Encryption unsuccessful - Reset phone to continue".',
      'فشل قراءة الملفات في وضع الريكفري وظهور أسماء مجلدات مشفرة برموز غير مفهومة (مثل `d0a8f9c...`).'
    ],
    diagnosticIndicatorsEn: [
      'Device boots to phantom password demand prompt after cross-region or mismatched firmware flashing.',
      'Fatal Android prompt: "Encryption unsuccessful - Reset phone to continue".',
      'Recovery environment displays garbled alphanumeric folder names (e.g. `d0a8f9c...`) due to locked CE keys.'
    ],
    repairMethodologyAr: [
      'إجراء تهيئة كاملة لبارتشن التشفير عبر فاست بوت: `fastboot -w` أو `fastboot erase userdata`.',
      'تفليش بارتشن `metadata.img` الرسمي لإعادة تهيئة هيكل التشفير ومفاتيح الـ Keymaster.',
      'التأكد من عدم دمج ريكفري معدل يحاول فك تشفير إصدار أندرويد أحدث دون دعم مكتبات التشفير المناسبة.'
    ],
    repairMethodologyEn: [
      'Execute cryptographic storage reset via fastboot: `fastboot -w` or `fastboot erase userdata`.',
      'Reflash stock `metadata.img` to reconstruct pristine Keymaster credential envelope.',
      'Ensure custom recovery builds embed up-to-date decryption libraries matching target Android SDK.'
    ],
    cliTools: ['fastboot -w', 'e2fsck', 'tune2fs', 'twrp-decrypt'],
    codeSnippet: {
      language: 'bash',
      title: 'إعادة ضبط بارتشن البيانات المشفر ومسح ترويسات التشفير التالفة',
      code: `# مسح كامل لبيانات المستخدم وإعادة تهيئة جدول التشفير
fastboot erase userdata
fastboot erase metadata

# مسح شامل مع تنسيق متوافق مع نظام الملفات
fastboot -w`
    }
  },
  {
    id: 'sec-selinux-mac',
    titleAr: 'التحكم الإجباري في الوصول (SELinux / SEAndroid Mandatory Access Control)',
    titleEn: 'SELinux / SEAndroid Mandatory Access Control (MAC)',
    badge: 'SELINUX',
    category: 'access-control',
    shortDescAr: 'نظام أمني متقدم في النواة يحدد لكل ملف وعملية سياقاً أمنياً محدداً ويحظر أي تواصل بين العمليات إلا بقاعدة صريحة.',
    shortDescEn: 'Kernel access enforcement subsystem mapping security labels to every process and node to block privilege leaks.',
    howItWorksAr: [
      'كل ملف ومجلد وعملية يحمل بطاقة أمنية (Security Context) بالشكل التالي: `u:r:domain:s0` للعمليات و `u:object_r:type:s0` للملفات.',
      'تحتوي ملفات `sepolicy` المحملة في النواة على مئات الآلاف من القواعد التي تحدد بالتفصيل ما يُسمح به فقط.',
      'أي عملية تحاول فتح ملف أو منفذ غير مسجل في السياسة تُحظر فوراً ويسجل النظام حدث إنكار (AVC Denied).',
      'يعمل الـ SELinux بشكل مستقل عن صلاحيات المستخدم، مما يعني أنه يحظر حتى مستخدم الـ Root (UID 0) إذا خالف السياسة.'
    ],
    howItWorksEn: [
      'Every file, device node, and task carries a context label: `u:r:domain:s0` for processes, `u:object_r:type:s0` for files.',
      'Compiled `sepolicy` binaries loaded into the kernel define an explicit whitelist of allowable system interactions.',
      'Any process attempting an interaction not explicitly permitted is blocked, raising an Access Vector Cache (AVC) denial.',
      'SELinux operates completely orthogonal to standard POSIX permissions, restricting even UID 0 (root) from out-of-policy actions.'
    ],
    vulnerabilitiesAndBypassesAr: [
      'التحويل المؤقت إلى وضع التساهل (Permissive Mode) عبر أمر: `setenforce 0` (يتطلب روت مع صلاحيات init).',
      'ترقيع الـ sepolicy في الذاكرة العشوائية بواسطة محرك Magiskpolicy أو KernelSU للسماح بحقن ملفات الروت.',
      'تعديل ملف boot.img وإضافة `androidboot.selinux=permissive` في معلمات سطر أوامر النواة (Kernel Cmdline).'
    ],
    vulnerabilitiesAndBypassesEn: [
      'Temporary transition to Permissive mode via shell command: `setenforce 0` (requires permissive init domain).',
      'Live memory patching of sepolicy via Magiskpolicy or KernelSU granting precise execution vectors for root daemons.',
      'Injecting `androidboot.selinux=permissive` flag into kernel cmdline inside repackaged boot.img.'
    ],
    diagnosticIndicatorsAr: [
      'التعليق في حلقة إقلاع لا نهائية فور تعديل ملفات في `/system` أو `/vendor` بسبب فقدان السياق الأمني (Security Label Mismatch).',
      'ظهور آلاف سجلات `avc: denied` في أمر `dmesg` مصحوبة بكلمة `{ read write ioctl }`.',
      'توقف مفاجئ لخدمة RIL (الاتصال الخلوي) أو البلوتوث بعد تثبيت رومات معدلة.'
    ],
    diagnosticIndicatorsEn: [
      'Bootloop following direct file modifications in `/system` due to missing or invalid filesystem security labels.',
      'Continuous stream of `avc: denied` entries in kernel dmesg containing `{ read write ioctl }` rejections.',
      'Abrupt crash of Radio Interface Layer (RIL) or Bluetooth daemon after manual modding.'
    ],
    repairMethodologyAr: [
      'إعادة تعيين تسميات الملفات الأمنية لكافة ملفات النظام عبر أمر: `restorecon -RF /system /vendor`.',
      'استخراج ملفات sepolicy الأصلية من الروم الرسمي وتفليش قطاع boot و vendor_boot لإعادة السياسات النقية.',
      'استخدام وضع Permissive المؤقت لتشخيص ما إذا كان العطل ناتجاً عن SELinux أم عطلاً برمجياً عاماً.'
    ],
    repairMethodologyEn: [
      'Recursively reinstate pristine filesystem security labels via shell command: `restorecon -RF /system /vendor`.',
      'Extract stock sepolicy bundles from official firmware and flash clean boot and vendor_boot partitions.',
      'Leverage temporary Permissive logging to ascertain whether the boot halt is strictly SELinux-induced.'
    ],
    cliTools: ['restorecon', 'chcon', 'ls -Z', 'magiskpolicy', 'audit2allow'],
    codeSnippet: {
      language: 'bash',
      title: 'استعراض وإصلاح السياق الأمني SELinux لملفات النظام',
      code: `# استعراض السياق الأمني للملفات
ls -laZ /system/bin/app_process64

# استعادة السياق الأمني الافتراضي لبارتشن vendor
restorecon -Rv /vendor

# فحص سجلات الإنكار اللحظية
dmesg | grep "avc:  denied"`
    }
  }
];

// =========================================================================
// 3. عيادة إصلاح أعطال الحماية ونظم التشغيل (Clinical Fault Repair Workshop)
// =========================================================================
export const CLINICAL_REPAIR_SCENARIOS: RepairScenario[] = [
  {
    id: 'case-dmverity-redstate',
    titleAr: 'حالة الانهيار الأحمر (Red State) وتلف فحص dm-verity',
    titleEn: 'Red State Bootloop & dm-verity Hash Collision',
    severity: 'CRITICAL',
    category: 'AVB 2.0 / dm-verity',
    symptomAr: 'الهاتف يعرض شاشة تحذير حمراء "Your device is corrupt. It cannot be trusted and will power off in 5 seconds" مع إعادة تشغيل مستمرة.',
    symptomEn: 'Device presents fatal red banner: "Your device is corrupt. It cannot be trusted and will power off in 5 seconds" in an infinite loop.',
    rootCauseAr: 'حدوث تعديل أو تلف في بايتات قطاع system أو vendor أدى لاختلاف ناتج شجرة Merkle Tree عن الهاش الجذري المخزن في VBMETA، مع إغلاق البوتلودر.',
    rootCauseEn: 'Block modification or bad sector on system/vendor resulted in Merkle tree root hash mismatch against certified VBMETA descriptor while locked.',
    affectedPartitions: ['vbmeta', 'system', 'vendor', 'boot'],
    affectedPlatforms: ['Qualcomm', 'MediaTek', 'Samsung Exynos', 'Google Tensor'],
    detectionCommands: [
      'fastboot getvar has-slot:boot',
      'fastboot getvar unlocked',
      'avbtool info_image --image vbmeta.img'
    ],
    expectedOutput: 'unlocked: no\nHashtree Descriptor:\n  Image Name: system\n  Status: Verification Mismatch (Hash Corrupted)',
    repairStepsAr: [
      {
        step: 1,
        title: 'عزل الشريحة المتضررة وفحص حالة القفل',
        action: 'تحديد الشريحة النشطة (Slot A أو B) وحالة البوتلودر',
        cli: 'fastboot getvar current-slot && fastboot getvar unlocked',
        explanation: 'التحقق مما إذا كان الجهاز على الشريحة A أو B وما إذا كان البوتلودر مفتوحاً يسمح بتجاوز الفحص.'
      },
      {
        step: 2,
        title: 'تفليش ملف VBMETA مع تعطيل التحقق',
        action: 'حقن أعلام إلغاء التفتيش لمنع النواة من إطلاق الانهيار',
        cli: 'fastboot flash vbmeta --disable-verity --disable-verification vbmeta.img',
        explanation: 'هذا الأمر يغير قيمة الـ flags في ترويسة vbmeta إلى 2، مما يجبر البوتلودر والنواة على تجاهل فحص شجرة الهاش.'
      },
      {
        step: 3,
        title: 'إعادة تفليش البارتشن التالف',
        action: 'كتابة قطاع النظام أو الكيرنل الأصلي من الروم الرسمي',
        cli: 'fastboot flash boot boot.img && fastboot flash vendor_boot vendor_boot.img',
        explanation: 'استعادة النواة ومحركات الأجهزة الأصلية المتطابقة 100% مع شهادة الأمان.'
      },
      {
        step: 4,
        title: 'إعادة تشغيل النظام وفحص الاستقرار',
        action: 'إعادة تشغيل الهاتف إلى النظام ومراقبة الإقلاع',
        cli: 'fastboot reboot',
        explanation: 'التحقق من إقلاع الهاتف وتخطي شاشة الـ Red State والدخول إلى النظام الطبيعي.'
      }
    ],
    repairStepsEn: [
      {
        step: 1,
        title: 'Slot Isolation & Lock Status Audit',
        action: 'Query active slot (A or B) and bootloader state',
        cli: 'fastboot getvar current-slot && fastboot getvar unlocked',
        explanation: 'Identify target slot and verify if bootloader allows flashing disable flags.'
      },
      {
        step: 2,
        title: 'Flash Patched VBMETA with Disabled Verity',
        action: 'Inject bypass flags into vbmeta header',
        cli: 'fastboot flash vbmeta --disable-verity --disable-verification vbmeta.img',
        explanation: 'Sets header flag to 2, instructing ABL and kernel to bypass Merkle tree enforcement.'
      },
      {
        step: 3,
        title: 'Reflash Degraded Core Partitions',
        action: 'Write clean stock boot and vendor_boot images',
        cli: 'fastboot flash boot boot.img && fastboot flash vendor_boot vendor_boot.img',
        explanation: 'Reinstate pristine stock kernel and HAL device tree blobs.'
      },
      {
        step: 4,
        title: 'System Reboot & Diagnostic Verification',
        action: 'Reboot device into userspace',
        cli: 'fastboot reboot',
        explanation: 'Confirm device bypasses the Red State panic banner and boots to home screen.'
      }
    ],
    verificationAr: 'إقلاع الجهاز وظهور شعار النظام الطبيعي دون ظهور الشاشة الحمراء، مع عمل تطبيقات النظام دون انهيارات.',
    verificationEn: 'Device powers up cleanly to launcher without the red warning dialog; system logs show stable runtime.'
  },
  {
    id: 'case-arb-downgrade-brick',
    titleAr: 'طوب محاولة الرجوع بالإصدار ورفض الـ ARB (Anti-Rollback Brick)',
    titleEn: 'Anti-Rollback Index Downgrade Mismatch & Emergency Unbrick',
    severity: 'CRITICAL',
    category: 'Hardware eFuse ARB',
    symptomAr: 'الهاتف ميت تماماً ولا يستجيب لأزرار التشغيل، وعند وصله بالكمبيوتر يظهر فقط منفذ طوارئ كوالكوم Qualcomm 9008 أو MTK VCOM.',
    symptomEn: 'Phone completely unresponsive to power keys; USB enumeration exposes solely Qualcomm 9008 or MTK VCOM port.',
    rootCauseAr: 'محاولة تفليش روم قديم يحمل رقم حماية ARB أقل من عدد الفيوزات المحترقة في الـ QFPROM، مما أدى لرفض الـ BootROM تشغيل الـ XBL/ABL.',
    rootCauseEn: 'Attempted flash of older firmware bearing a lower ARB counter than silicon eFuses; BootROM aborted XBL execution.',
    affectedPartitions: ['xbl', 'xbl_config', 'abl', 'tz', 'hyp'],
    affectedPlatforms: ['Qualcomm Snapdragon', 'MediaTek Dimensity / Helio'],
    detectionCommands: [
      'lsusb -d 05c6:9008',
      'edl --get-storage-info',
      'edl --print-qfprom'
    ],
    expectedOutput: 'Device connected in Qualcomm Emergency Download Mode (EDL 9008)\nQFPROM Anti-Rollback Row 0x00780230: 0x00000005 (Target Index: 5)',
    repairStepsAr: [
      {
        step: 1,
        title: 'تحديد رقم الـ ARB المكتوب في فيوزات المعالج',
        action: 'قراءة سجلات الـ QFPROM عبر وضع EDL للطوارئ',
        cli: 'python edl.py print-anti-rollback --loader prog_firehose_ddr.elf',
        explanation: 'معرفة رقم الحماية المحفور في فيوز المعالج لمنع تفليش أي روم أقل من هذا الرقم.'
      },
      {
        step: 2,
        title: 'تحميل الروم الرسمي المتطابق مع رقم الحماية',
        action: 'اختيار أحدث فلاشة رسمية تحمل رقم Bit مساوياً أو أعلى من الفيوز',
        cli: 'samloader -m SM-S918B -r EUX download --binary-version S918BXXU3...',
        explanation: 'الـ BootROM لن يسمح بالإقلاع إلا إذا كانت شهادة الـ XBL/ABL تحمل رقماً مساوياً أو أكبر من رقم الفيوز.'
      },
      {
        step: 3,
        title: 'تفليش قطاعات الإقلاع الأولية عبر بروتوكول Firehose',
        action: 'كتابة محملات الإقلاع الجديدة مباشرة إلى الذاكرة',
        cli: 'python edl.py qfil rawprogram0.xml patch0.xml . --loader prog_firehose_ddr.elf',
        explanation: 'كتابة ملفات xbl.elf, abl.elf, tz.mbn المتطابقة مع الحماية لإنعاش دورة إقلاع المعالج.'
      },
      {
        step: 4,
        title: 'إعادة التشغيل إلى وضع Fastboot أو الداونلود',
        action: 'إعادة ضبط المعالج والانتقال للوضع التشغيلي',
        cli: 'python edl.py reset',
        explanation: 'بمجرد تطابق الملفات مع الفيوز، ينجح الـ BootROM في تحميل الـ XBL ويضيء الجهاز شاشة الإقلاع.'
      }
    ],
    repairStepsEn: [
      {
        step: 1,
        title: 'Extract Blown Hardware ARB Silicon Register',
        action: 'Audit QFPROM anti-rollback register via emergency EDL',
        cli: 'python edl.py print-anti-rollback --loader prog_firehose_ddr.elf',
        explanation: 'Pinpoint exact hardware fuse count to ensure replacement firmware satisfies the silicon gate.'
      },
      {
        step: 2,
        title: 'Procure Matching High-Tier Factory Firmware',
        action: 'Download official package matching or exceeding the hardware bit',
        cli: 'samloader -m SM-S918B -r EUX download --binary-version S918BXXU3...',
        explanation: 'Silicon BootROM strictly requires firmware signatures bearing equal or greater security index.'
      },
      {
        step: 3,
        title: 'Stream Raw Bootloader Images via Firehose XML',
        action: 'Write verified Stage 1 and Stage 2 images to flash blocks',
        cli: 'python edl.py qfil rawprogram0.xml patch0.xml . --loader prog_firehose_ddr.elf',
        explanation: 'Program updated xbl.elf, abl.elf, tz.mbn directly to storage partitions.'
      },
      {
        step: 4,
        title: 'Trigger Hardware Core Reset',
        action: 'Reset SoC into normal execution flow',
        cli: 'python edl.py reset',
        explanation: 'Upon signature match with hardware fuses, BootROM passes control to XBL and screen lights up.'
      }
    ],
    verificationAr: 'خروج الهاتف من وضع 9008 وظهور شاشة الشحن أو Fastboot/Download mode واستعادة القدرة على الإقلاع الكامل.',
    verificationEn: 'Device disconnects from 9008 emergency port, displaying splash screen and entering fastboot/download mode.'
  },
  {
    id: 'case-dynamic-super-corruption',
    titleAr: 'تلف بيانات حاوية البارتشنات الديناميكية (Super.img LP Metadata Panic)',
    titleEn: 'Dynamic Partition Super.img Inconsistency & Loopback Repair',
    severity: 'HIGH',
    category: 'Dynamic Partitions (dm-linear)',
    symptomAr: 'فشل تفليش ملف system أو vendor وظهور خطأ: "Cannot flash logical partition in non-fastbootd mode" أو تعليق الهاتف في شاشة Fastboot.',
    symptomEn: 'Flashing failure: "Cannot flash logical partition in non-fastbootd mode" or device trapped in fastboot recovery loop.',
    rootCauseAr: 'محاولة تفليش الأقسام المنطقية في وضع فاست بوت العادي (Bootloader Fastboot) بدلاً من فضاء المستخدم (userspace fastbootd)، أو تلف جدول الـ LP Metadata داخل super.',
    rootCauseEn: 'Attempting to flash dynamic logical partitions in raw bootloader fastboot rather than userspace fastbootd, or corrupted metadata table.',
    affectedPartitions: ['super', 'system', 'vendor', 'product', 'odm'],
    affectedPlatforms: ['Android 10, 11, 12, 13, 14, 15'],
    detectionCommands: [
      'fastboot getvar is-userspace',
      'fastboot getvar dynamic-partition',
      'fastboot getvar super-partition-name'
    ],
    expectedOutput: 'is-userspace: no\ndynamic-partition: true\nsuper-partition-name: super',
    repairStepsAr: [
      {
        step: 1,
        title: 'التحويل الإجباري إلى وضع Fastbootd',
        action: 'إعادة تشغيل البوتلودر إلى بيئة الريكفري المشغلة لخدمة fastbootd',
        cli: 'fastboot reboot fastboot',
        explanation: 'الأقسام المنطقية (system, vendor) لا يمكن كتابتها إلا في وضع Fastbootd الذي يحمل تعريفات dm-linear.'
      },
      {
        step: 2,
        title: 'التحقق من الدخول إلى فضاء المستخدم',
        action: 'فحص متغير is-userspace للتأكد من جاهزية الـ Dynamic Engine',
        cli: 'fastboot getvar is-userspace',
        explanation: 'يجب أن تكون النتيجة: `is-userspace: yes`.'
      },
      {
        step: 3,
        title: 'حذف وإعادة إنشاء الأقسام المنطقية المتضررة',
        action: 'إعادة تهيئة مساحة البارتشن المنطقي داخل الـ Super',
        cli: 'fastboot delete-logical-partition system_a && fastboot create-logical-partition system_a 3221225472',
        explanation: 'إصلاح التداخل في جدول الميتاداتا وحجز كتل نظيفة لملف النظام.'
      },
      {
        step: 4,
        title: 'تفليش ملفات النظام المنطقية بالترتيب',
        action: 'كتابة ملفات system, vendor, product المنطقية',
        cli: 'fastboot flash system system.img && fastboot flash vendor vendor.img',
        explanation: 'كتابة الصور المجهزة بدقة داخل الحاوية الديناميكية.'
      }
    ],
    repairStepsEn: [
      {
        step: 1,
        title: 'Mandatory Switch to Fastbootd Mode',
        action: 'Reboot bootloader into recovery-hosted userspace fastbootd',
        cli: 'fastboot reboot fastboot',
        explanation: 'Logical partitions can only be remapped and written within the fastbootd runtime.'
      },
      {
        step: 2,
        title: 'Verify Userspace Runtime Engagement',
        action: 'Query is-userspace boot variable',
        cli: 'fastboot getvar is-userspace',
        explanation: 'Expected output confirmation: `is-userspace: yes`.'
      },
      {
        step: 3,
        title: 'Reconstruct Degraded Logical Partition Bounds',
        action: 'Delete corrupted mapping and recreate clean geometry',
        cli: 'fastboot delete-logical-partition system_a && fastboot create-logical-partition system_a 3221225472',
        explanation: 'Clears invalid LP metadata pointers and allocates pristine contiguous block extent.'
      },
      {
        step: 4,
        title: 'Flash Logical Images Sequentially',
        action: 'Stream system, vendor, product logical images',
        cli: 'fastboot flash system system.img && fastboot flash vendor vendor.img',
        explanation: 'Commit images into dynamic super pool with zero geometry conflicts.'
      }
    ],
    verificationAr: 'نجاح كتابة كافة البارتشنات دون أخطاء تفليش، وإقلاع الهاتف إلى شاشة الترحيب بسلاسة.',
    verificationEn: 'All logical block partitions written with zero write aborts; device boots smoothly to setup wizard.'
  }
];

// =========================================================================
// 4. اختبار وتقييم مهندس نظم التشغيل والحماية (Security Architecture Exam)
// =========================================================================
export const OS_SECURITY_EXAM_QUESTIONS: SecurityExamQuestion[] = [
  {
    id: 1,
    questionAr: 'ما هو الدور الجوهري لكود الـ BootROM (PBL) في أول 100 ميلي ثانية من وصل الطاقة بالمعالج؟',
    questionEn: 'What is the primary role of the BootROM (PBL) microcode within the first 100ms of SoC power-up?',
    optionsAr: [
      'تحميل كيرنل لينكس مباشرة إلى الذاكرة العشوائية DDR وتشغيل شاشة العرض.',
      'تهيئة مسجلات المعالج وفحص مسامير التمهيد والتحقق المشفر من توقيع الـ XBL بمقارنة المفتاح مع eFuse.',
      'تشفير بيانات المستخدم في بارتشن /data عبر خوارزمية AES-256-XTS.',
      'تشغيل خدمة Fastbootd واستقبال أوامر التفليش عبر منفذ USB.'
    ],
    optionsEn: [
      'Load the Linux kernel directly into DDR RAM and initialize the display subsystem.',
      'Initialize CPU registers, evaluate boot pins, and cryptographically verify XBL signature against eFuse RoT.',
      'Encrypt userdata inside /data using AES-256-XTS algorithms.',
      'Launch fastbootd userspace service and await USB flashing commands.'
    ],
    correctIndex: 1,
    explanationAr: 'كود الـ BootROM هو كود محفور عتادياً داخل السيليكون، مهمته الصفرية هي تهيئة مسجلات وحدة المعالجة المركزية، فحص أزرار أو مسامير الإقلاع (TestPoints)، والتحقق من توقيع محمل الإقلاع الأولي XBL/SBL مقابل بصمة المفتاح المحفورة في فيوزات الـ QFPROM قبل السماح له بالعمل.',
    explanationEn: 'BootROM is hardwired on-die microcode whose foundational mission is to initialize baseline CPU registers, inspect strap pins/testpoints, and verify the digital signature of Stage 1 bootloader (XBL/SBL) against QFPROM eFuses before executing it.',
    difficulty: 'Hard'
  },
  {
    id: 2,
    questionAr: 'ما الذي يحدث عند ظهور رسالة الخطأ الشهيرة "Red State: Your device is corrupt and cannot boot"؟',
    questionEn: 'What strictly triggers the fatal "Red State: Your device is corrupt and cannot boot" panic banner?',
    optionsAr: [
      'نفاد البطارية بنسبة أقل من 1%.',
      'فشل تحقق AVB 2.0 من شجرة Merkle Tree لبارتشن النظام وعدم تطابق الهاش الجذري مع VBMETA بينما البوتلودر مقفل.',
      'امتلاء ذاكرة التخزين الداخلية بنسبة 100%.',
      'تلف كابل الـ USB أثناء الشحن السريع.'
    ],
    optionsEn: [
      'Battery depletion below 1% charge threshold.',
      'AVB 2.0 Merkle tree hash mismatch against certified VBMETA descriptor while the bootloader is locked.',
      'Internal flash storage reaching 100% full capacity.',
      'USB cable defect during Fast Charging power negotiation.'
    ],
    correctIndex: 1,
    explanationAr: 'حالة الـ Red State تحدث عندما يكتشف محرك Android Verified Boot (AVB) في مرحلة محمل الإقلاع ABL أن شجرة الهاش الخاصة ببارتشنات النظام (system/vendor/boot) لا تتطابق مع التوقيع المشفر في VBMETA، وحيث إن البوتلودر في حالة القفل (Locked)، يرفض النظام الإقلاع لحماية المستخدم.',
    explanationEn: 'Red State occurs when the Android Verified Boot (AVB) engine in ABL detects that the partition Merkle tree (system/vendor/boot) fails to match certified VBMETA descriptors while the bootloader is in Locked state.',
    difficulty: 'Hard'
  },
  {
    id: 3,
    questionAr: 'لماذا يؤدي تفليش روم قديم على بعض الهواتف إلى الموت الكامل (Hard Brick) والدخول في وضع 9008 فقط؟',
    questionEn: 'Why does flashing an older firmware package cause an immediate Hard Brick dropping strictly into EDL 9008?',
    optionsAr: [
      'بسبب حماية الـ Anti-Rollback (ARB) حيث يكون رقم حماية الفلاشة أقل من عدد الفيوزات المحترقة في المعالج.',
      'بسبب انتهاء صلاحية شهادة متجر جوجل بلاي.',
      'لأن الذاكرة العشوائية RAM لا تتسع للنظام القديم.',
      'بسبب تلف حساس البصمة.'
    ],
    optionsEn: [
      'Enforcement of Anti-Rollback (ARB) where the firmware binary index is lower than the blown QFPROM eFuse count.',
      'Expiration of Google Play Store SSL certificates.',
      'DDR RAM insufficient capacity to load legacy operating systems.',
      'Physical defect in optical fingerprint sensor ribbon.'
    ],
    correctIndex: 0,
    explanationAr: 'حماية منع الرجوع (Anti-Rollback) تستخدم فيوزات إلكترونية مجهرية (eFuses) تحترق تلقائياً عند التحديث؛ فإذا حاول الفني تفليش روم قديم يحتوي على رقم حماية أقل، يرفض الـ BootROM تشغيل محمل الإقلاع ويسقط فوراً في وضع الطوارئ EDL 9008.',
    explanationEn: 'Anti-Rollback (ARB) utilizes hardware electronic fuses (eFuses) permanently blown during incremental upgrades. If a lower-index firmware is flashed, BootROM rejects execution and traps the phone in EDL 9008.',
    difficulty: 'Expert'
  },
  {
    id: 4,
    questionAr: 'في أجهزة أندرويد الحديثة (أندرويد 10 وما فوق)، ما الفرق الأساسي بين وضع Fastboot العادي ووضع Fastbootd؟',
    questionEn: 'In modern Android (Android 10+), what is the definitive distinction between Bootloader Fastboot and Fastbootd?',
    optionsAr: [
      'لا يوجد فرق؛ الاسمان لنفس البرنامج.',
      'وضع Fastbootd يعمل في فضاء المستخدم (Userspace) ويحتوي على تعريفات dm-linear للتعامل مع الأقسام المنطقية داخل super.img.',
      'وضع Fastboot العادي مخصص لهواتف سامسونج فقط بينما Fastbootd لهواتف آبل.',
      'وضع Fastbootd لا يدعم الاتصال عبر كابل الـ USB.'
    ],
    optionsEn: [
      'No difference; both designations point to the exact same software module.',
      'Fastbootd operates in userspace (recovery runtime) with dm-linear drivers to manipulate dynamic partitions in super.img.',
      'Bootloader Fastboot is exclusively for Samsung while Fastbootd is for Apple iOS.',
      'Fastbootd does not support physical USB data communication.'
    ],
    correctIndex: 1,
    explanationAr: 'وضع Fastboot الكلاسيكي يعمل داخل محمل الإقلاع ABL ولا يعرف شيئاً عن الأقسام المنطقية؛ بينما Fastbootd يعمل داخل بيئة الريكفري في فضاء المستخدم ويمتلك موديول dm-linear للتحكم في الأقسام المنطقية (system, vendor, product) داخل حاوية super.img.',
    explanationEn: 'Classic bootloader fastboot runs in ABL with zero awareness of dynamic partition mapping. Fastbootd runs in userspace recovery with active dm-linear kernel drivers capable of remapping logical partitions in super.img.',
    difficulty: 'Expert'
  },
  {
    id: 5,
    questionAr: 'ما هي النتيجة العتادية الدائمة عند تفليش ريكفري معدل أو روت على هاتف سامسونج حديث؟',
    questionEn: 'What irreversible physical hardware consequence occurs upon flashing uncertified recovery or root on a modern Samsung device?',
    optionsAr: [
      'احتراق معالج الرسوميات GPU فوراً.',
      'انفجار فيوز Knox Warranty Void في المعالج وتغير قيمته من 0x0 إلى 0x1 بشكل دائم وإتلاف مفاتيح Secure Folder.',
      'حذف الرقم التسلسلي IMEI نهائياً من الشريحة.',
      'توقف شاشة اللمس عن العمل.'
    ],
    optionsEn: [
      'Immediate physical burnout of the GPU core.',
      'Permanent electrical tripping of the Knox Warranty Void eFuse from 0x0 to 0x1, irreversibly revoking Secure Folder hardware keys.',
      'Permanent wipe of cellular IMEI from baseband EEPROM.',
      'Capacitive touch screen digitization halts permanently.'
    ],
    correctIndex: 1,
    explanationAr: 'أجهزة سامسونج تحتوي على فيوز سيليكوني فيزيائي يُدعى Knox Warranty Void. عند إقلاع الجهاز بكود غير موقّع برمجياً من سامسونج، يقوم المعالج بصعق الفيوز كهربائياً ليتحول من 0x0 إلى 0x1، وهو تلف فيزيائي دائم يمنع عمل خدمات Samsung Pass والمجلد الآمن ومحفظة سامسونج بشكل نهائي.',
    explanationEn: 'Samsung architectures incorporate an on-die silicon eFuse named Knox Warranty Void. Detecting unauthorized boot code, the hardware electrically blows the fuse from 0x0 to 0x1, permanently invalidating hardware-backed master keys for Secure Folder and Samsung Pay.',
    difficulty: 'Architect'
  }
];
