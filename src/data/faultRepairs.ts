import { FaultRepairItem } from '../types.ts';

export const FAULT_REPAIRS: FaultRepairItem[] = [
  // 1. BOOT & STARTUP ENGINES
  {
    id: 'bootloop-fix',
    titleAr: 'إصلاح إعادة التشغيل المتكرر والتعليق على الشعار (Bootloop Fix)',
    titleEn: 'Bootloop & Stuck on Logo Recovery',
    category: 'BOOT',
    severity: 'HIGH',
    descriptionAr: 'معالجة انهيار ملفات الإقلاع Dalvik-Cache والـ System Server وتلف بارتشن Metadata بدون مسح بيانات المستخدم.',
    descriptionEn: 'Repairs corrupted init scripts, Dalvik VM bytecode cache, and clean-rebuilds metadata partition to revive stuck devices.',
    icon: 'RotateCcw',
    supportedModes: ['FASTBOOT', 'ADB_ONLINE', 'EDL_9008', 'MTK_BROM', 'SAMSUNG_DOWNLOAD'],
    supportedChipsets: ['qualcomm', 'mediatek', 'samsung_exynos', 'unisoc_spd'],
    riskAr: 'آمن تماماً (لا يحذف بيانات المستخدم الشخصية)',
    riskEn: 'Safe - Retains user photos and contacts',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'فحص البارتشنات وتحديد ملف الإقلاع التالف',
        actionEn: 'Analyze boot partition checksum and filesystem dirty bit',
        commandPreview: 'fastboot getvar has-slot:boot && fastboot getvar current-slot'
      },
      {
        stepNumber: 2,
        actionAr: 'مسح وإعادة بناء ذاكرة التخزين المؤقت Dalvik و Cache',
        actionEn: 'Wipe /cache and reconstruct Dalvik bytecode trees',
        commandPreview: 'fastboot erase cache && fastboot erase metadata'
      },
      {
        stepNumber: 3,
        actionAr: 'حقن نواة الإقلاع الأصلية (Stock Boot.img / DTBO) المناسبة لرقم التوجيه',
        actionEn: 'Flash clean stock boot.img & dtbo.img matched to OS version',
        commandPreview: 'fastboot flash boot stock_boot.img'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة تفعيل السيكتورات وإعادة التشغيل للنظام الطبيعي',
        actionEn: 'Sync block journal and reboot to System',
        commandPreview: 'fastboot reboot'
      }
    ]
  },
  {
    id: 'dead-boot-unbrick',
    titleAr: 'إصلاح الموت المفاجئ والشاشة السوداء (Hardbrick & Dead Boot Unbrick)',
    titleEn: 'Hardbrick & Dead Boot Low-Level Recovery',
    category: 'BOOT',
    severity: 'CRITICAL',
    descriptionAr: 'إنعاش الهواتف الميتة بالكامل (الشاشة سوداء ولا تستجيب للأزرار) عبر منافذ الطوارئ EDL 9008 و MTK BROM.',
    descriptionEn: 'Emergency low-level unbrick for completely unresponsive devices via Qualcomm Sahara/Firehose and MediaTek BROM.',
    icon: 'Zap',
    supportedModes: ['EDL_9008', 'MTK_BROM', 'HUAWEI_COM1', 'SPD_DIAG'],
    supportedChipsets: ['qualcomm', 'mediatek', 'hisilicon_kirin', 'unisoc_spd'],
    riskAr: 'إصلاح جذري منخفض المستوى مع نسخ احتياطي تلقائي للـ EFS',
    riskEn: 'Low-level hardware protocol recovery with auto security backup',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'إرسال مصافحة Handshake وكسر حماية التوقيع الرقمي (SLA / DAA Auth Bypass)',
        actionEn: 'Send Sahara / BROM handshake and disable SLA/DAA crypto challenge',
        protocolCode: 'TX: 0xA0 0x0A 0x50 0x05 -> ACK: 0x5F'
      },
      {
        stepNumber: 2,
        actionAr: 'حقن مبرمج الذاكرة المتطابق (Firehose ELF / MTK DA Agent)',
        actionEn: 'Inject matched DDR RAM Loader and initialize Flash Memory Controller',
        protocolCode: 'prog_firehose_ddr.elf / MTK_AllInOne_DA.bin'
      },
      {
        stepNumber: 3,
        actionAr: 'إعادة بناء جدول التقسيم الأساسي (GPT Primary & Backup Tables)',
        actionEn: 'Write and align Master Boot Record & GUID Partition Table',
        commandPreview: 'qdl --storage ufs --program rawprogram0.xml --patch patch0.xml'
      },
      {
        stepNumber: 4,
        actionAr: 'كتابة قطاعات البوت لودر الأولية (xbl, abl, sbl1, tz, hyp, pmic)',
        actionEn: 'Flash secondary bootloader chains and reboot device into Fastboot',
        commandPreview: 'fastboot continue'
      }
    ]
  },
  {
    id: 'dm-verity-red-state',
    titleAr: 'إصلاح أخطاء حماية الإقلاع (dm-verity / Red State / AVB 2.0 Corrupted)',
    titleEn: 'dm-verity & Android Verified Boot 2.0 Corrupted Fix',
    category: 'SECURITY',
    severity: 'HIGH',
    descriptionAr: 'إصلاح رسائل الخطأ الحمراء والصفراء (Your device has failed verification / Red State / dm-verity hash mismatch).',
    descriptionEn: 'Fixes boot verification trap when system signature digest fails against vbmeta cryptographic keys.',
    icon: 'ShieldAlert',
    supportedModes: ['FASTBOOT', 'FASTBOOTD', 'EDL_9008', 'MTK_BROM'],
    supportedChipsets: ['qualcomm', 'mediatek', 'samsung_exynos', 'unisoc_spd'],
    riskAr: 'آمن جداً - يعيد الجهاز للعمل فوراً',
    riskEn: 'Very safe - restores normal boot verification flags',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قراءة مفاتيح التشفير ومؤشر الحماية ضد الرجوع (AVB Rollback Index)',
        actionEn: 'Read AVB 2.0 header and check Anti-Rollback Fuse Index',
        commandPreview: 'fastboot getvar avb_version && fastboot getvar rollback_index'
      },
      {
        stepNumber: 2,
        actionAr: 'توليد ملف vbmeta أصلي خالي من قيود التحقق (Disabled-Verity Flags)',
        actionEn: 'Generate clean vbmeta binary with verification flags bypass',
        commandPreview: 'fastboot --disable-verity --disable-verification flash vbmeta vbmeta.img'
      },
      {
        stepNumber: 3,
        actionAr: 'مطابقة شجرة التجزئة لقطاعات system / vendor / product',
        actionEn: 'Align hashtree root digests across super partition blocks',
        commandPreview: 'fastboot flash vbmeta_system vbmeta_system.img'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة التشغيل وإزالة الشاشة التحذيرية الحمراء بشكل دائم',
        actionEn: 'Clear boot warning flags and trigger normal boot',
        commandPreview: 'fastboot reboot'
      }
    ]
  },
  {
    id: 'qualcomm-crashdump-fix',
    titleAr: 'إصلاح وضع الانهيار لكوالكوم (Qualcomm CrashDump Mode Recovery)',
    titleEn: 'Qualcomm CrashDump & RAMDump Mode Fix',
    category: 'HARDWARE',
    severity: 'HIGH',
    descriptionAr: 'معالجة شاشة CrashDump Mode الناتجة عن تعارض ملفات المودم أو الذاكرة أو تلف بارتشن modemst أو boot.',
    descriptionEn: 'Resolves Qualcomm Subsystem fatal crash and CrashDump screen by refreshing modem firmware and DSP registers.',
    icon: 'AlertOctagon',
    supportedModes: ['EDL_9008', 'FASTBOOT'],
    supportedChipsets: ['qualcomm'],
    riskAr: 'آمن - يحافظ على بارتشنات المعايرة الأصلية',
    riskEn: 'Safe - preserves calibrated NV items',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'استخراج سجل العطل (DDR CrashDump Log) وتحديد سبب التوقف',
        actionEn: 'Extract crash register offsets and locate kernel subsystem culprit',
        protocolCode: 'Sahara Memory Dump read 0x80000000 -> 0x80040000'
      },
      {
        stepNumber: 2,
        actionAr: 'إعادة تفليش قطاعات الـ DSP وحساسات النواة (dsp, devcfg, hyp, tz)',
        actionEn: 'Flash pristine DSP and trustzone cryptographic microcode',
        commandPreview: 'fastboot flash devcfg devcfg.img && fastboot flash dsp dsp.img'
      },
      {
        stepNumber: 3,
        actionAr: 'إعادة ضبط قطاع modemst1 و modemst2 بدون فقدان السيريال',
        actionEn: 'Reconstruct modem baseband buffers and clear panic flag in persist',
        commandPreview: 'fastboot flash modem NON-HLOS.bin'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة إقلاع الهاتف وخروجه من وضع الانهيار بنجاح',
        actionEn: 'Reboot device out of CrashDump state into standard OS',
        commandPreview: 'fastboot reboot'
      }
    ]
  },
  {
    id: 'fastboot-recovery-loop',
    titleAr: 'إصلاح تعليق الهاتف في الفاست بوت أو الريكفري (Fastboot & Recovery Loop)',
    titleEn: 'Fastboot Loop & Stuck in Recovery Repair',
    category: 'BOOT',
    severity: 'MEDIUM',
    descriptionAr: 'حل مشكلة إقلاع الهاتف تلقائياً إلى شاشة Fastboot أو Android Recovery بسبب تعليق علم boot-once أو تلف misc partition.',
    descriptionEn: 'Fixes automatic boot to bootloader caused by corrupted misc/BCB partition flags or inactive A/B slot.',
    icon: 'RefreshCw',
    supportedModes: ['FASTBOOT', 'ADB_ONLINE', 'EDL_9008'],
    supportedChipsets: ['qualcomm', 'mediatek', 'samsung_exynos', 'unisoc_spd', 'generic_adb'],
    riskAr: 'آمن وفوري (يستغرق 10 ثوانٍ)',
    riskEn: 'Instant & Safe - executes in under 10 seconds',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'فحص سجلات الإقلاع Boot Control Block (BCB) في بارتشن misc',
        actionEn: 'Inspect bootloader control block flags and command parameter in misc',
        commandPreview: 'fastboot getvar current-slot && fastboot getvar slot-successful:a'
      },
      {
        stepNumber: 2,
        actionAr: 'مسح أوامر الريكفري العالقة من بارتشن misc',
        actionEn: 'Zero-out lingering boot-recovery commands in misc partition',
        commandPreview: 'fastboot erase misc'
      },
      {
        stepNumber: 3,
        actionAr: 'التبديل إلى السلوت النشط السليم (Active Slot Switching A/B)',
        actionEn: 'Switch to healthy boot slot and mark slot as bootable',
        commandPreview: 'fastboot --set-active=a'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة تشغيل الهاتف والإقلاع الطبيعي لنظام أندرويد',
        actionEn: 'Reboot directly to main system OS',
        commandPreview: 'fastboot reboot'
      }
    ]
  },

  // 2. NETWORK & BASEBAND & IMEI ENGINES
  {
    id: 'samsung-a24-mtk-baseband-fix',
    titleAr: 'إصلاح البيسباند والتعليق لسامسونج A24 و MediaTek (Galaxy A24 A245F / A14 / A15 / A16 Baseband & NVData Repair)',
    titleEn: 'Samsung Galaxy A24 (A245F) & MTK Helio G99 Baseband & Unknown Modem Fix',
    category: 'NETWORK',
    severity: 'HIGH',
    descriptionAr: 'حل مشكلة اختفاء البيسباند (Unknown Baseband)، السيريال Null، والتعليق الشديد لهواتف سامسونج معالجات ميديا تيك (مثل Galaxy A24 A245F Helio G99) عبر تفليش ملفات الـ PIT والـ CP المخصصة، روم الكومبينيشن الإصلاحي، وتصفير الـ NVData.',
    descriptionEn: 'Resolves Unknown Baseband, Null IMEI, and severe system lag on Samsung MediaTek devices (Galaxy A24 A245F Helio G99) by flashing dedicated PIT & CP modem binaries, Combination Repair Firmware, and server-side NVData reconstruction.',
    icon: 'Radio',
    supportedModes: ['SAMSUNG_DOWNLOAD', 'MTK_BROM', 'ADB_ONLINE', 'SPD_DIAG'],
    supportedChipsets: ['mediatek', 'samsung_exynos', 'qualcomm'],
    riskAr: 'حل جذري نهائي لإعادة تقسيم الفولديرات التالفة وضخ ملفات الشبكة الرسمية',
    riskEn: 'Definitive fix: re-partitions corrupt folders and injects official modem firmware',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'تفليش ملف الـ PIT واستخراج ملف المودم CP المنفصل عبر Odin / Loke مع Re-Partition',
        actionEn: 'Flash PIT repartition table and separate CP modem package via Odin / Loke with Re-Partition enabled',
        commandPreview: 'heimdall flash --PIT a245f.pit --CP CP_A245FXXU4.tar.md5 --repartition'
      },
      {
        stepNumber: 2,
        actionAr: 'تفليش فريموير الكومبينيشن أو المودم الإصلاحي (A245F Combination / Repair CP Firmware)',
        actionEn: 'Flash Combination Repair Firmware or engineered CP Modem to revive Baseband response',
        commandPreview: 'heimdall flash --CP COMBINATION_A245F_CP.tar.md5'
      },
      {
        stepNumber: 3,
        actionAr: 'تصفير قطاع NVData عبر أداة البوكس (Wipe NVData) وضخ ملفات الشبكة عبر سيرفر CPID',
        actionEn: 'Execute Wipe NVData, repair security registers, and inject clean network profile via CPID Server',
        protocolCode: 'MTK_BROM: ERASE_NVDATA 0x08000000 0x02000000 -> CPID_INJECT_CERT()'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة التشغيل والتأكد من ظهور رقم إصدار البيسباند والسيريال الرسمي',
        actionEn: 'Reboot device, verify Baseband version string, and restore official IMEI status',
        commandPreview: 'adb shell getprop gsm.version.baseband'
      }
    ]
  },
  {
    id: 'baseband-imei-fix',
    titleAr: 'إصلاح فقدان الشبكة والسيريال (Unknown Baseband / Null IMEI / No Service)',
    titleEn: 'Unknown Baseband & Null IMEI Radio Recovery',
    category: 'NETWORK',
    severity: 'HIGH',
    descriptionAr: 'معالجة مشكلة عدم قراءة الشريحة، واختفاء رقم السيريال، وعطل إصدار النطاق الأساسي غير معروف (Baseband Unknown).',
    descriptionEn: 'Restores missing IMEI, null baseband, and broken cellular RF tables by rebuilding EFS / NVRAM / NVDATA.',
    icon: 'Radio',
    supportedModes: ['SPD_DIAG', 'EDL_9008', 'MTK_BROM', 'ADB_ONLINE', 'SAMSUNG_DOWNLOAD'],
    supportedChipsets: ['qualcomm', 'mediatek', 'samsung_exynos', 'unisoc_spd'],
    riskAr: 'يتم عمل نسخة احتياطية إجبارية قبل أي تعديل',
    riskEn: 'Mandatory auto-backup created prior to writing',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قراءة وفحص حالة متحكم الشبكة (RIL Daemon & Baseband Processor)',
        actionEn: 'Query RIL status and check modem power state via AT Diagnostic',
        commandPreview: 'AT+CPIN? -> Check SIM detection response'
      },
      {
        stepNumber: 2,
        actionAr: 'مسح القطاعات التالفة وإعادة بناء هيكل EFS / NVRAM المتوافق',
        actionEn: 'Erase damaged NV blocks and regenerate structure',
        commandPreview: 'fastboot erase modemst1 && fastboot erase modemst2'
      },
      {
        stepNumber: 3,
        actionAr: 'كتابة ومعايرة السيريال والـ Checksum بخوارزمية Luhn و BCD Hex',
        actionEn: 'Write calibrated IMEI 1 / IMEI 2 and compute Luhn checksum',
        protocolCode: 'NV_ITEM_UE_IMEI 550 Write [08 3A 35 89 ...]'
      },
      {
        stepNumber: 4,
        actionAr: 'حقن ملف QCN / NVDATA الأصلي وتفعيل ترددات 4G / 5G',
        actionEn: 'Restore calibrated RF bands and restart cellular modem radio',
        commandPreview: 'AT+CFUN=1,1'
      }
    ]
  },
  {
    id: 'wifi-bluetooth-crash-fix',
    titleAr: 'إصلاح توقف الواي فاي والبلوتوث (Wi-Fi / BT NV Data Corrupted & MAC Zero)',
    titleEn: 'Wi-Fi & Bluetooth MAC Address & Calibration Repair',
    category: 'NETWORK',
    severity: 'MEDIUM',
    descriptionAr: 'إصلاح مشكلة عدم تشغيل مفتاح Wi-Fi، وظهور MAC Address: 02:00:00:00:00:00، أو إعادة تشغيل الهاتف عند فتح البلوتوث.',
    descriptionEn: 'Restores factory Wi-Fi/BT MAC NV items and recalibrates RF FEM (Front-End Module) frequency tables in persist/nvram.',
    icon: 'Radio',
    supportedModes: ['ADB_ONLINE', 'EDL_9008', 'MTK_BROM', 'FASTBOOT'],
    supportedChipsets: ['qualcomm', 'mediatek', 'samsung_exynos', 'unisoc_spd'],
    riskAr: 'آمن تماماً',
    riskEn: 'Safe - resets NV configuration keys',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قراءة عناوين MAC الحالية من بارتشن persist / nvdata',
        actionEn: 'Read WLAN/BT calibration offsets in persist/wlan_mac.bin',
        commandPreview: 'adb shell getprop ro.boot.wifimac'
      },
      {
        stepNumber: 2,
        actionAr: 'توليد وتعيين عنوان MAC أصلي فريد متوافق مع معايير IEEE OUI',
        actionEn: 'Synthesize genuine IEEE MAC address and generate wlan_mac.bin',
        protocolCode: 'WLAN_MAC: 48:2C:67:89:AB:CD | BT_MAC: 48:2C:67:89:AB:CE'
      },
      {
        stepNumber: 3,
        actionAr: 'حقن ملف المعايرة وضبط الصلاحيات 0644 في بارتشن persist',
        actionEn: 'Flash calibrated persist and apply strict SELinux file contexts',
        commandPreview: 'fastboot flash persist persist_clean.img'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة تشغيل الهاتف وتفعيل راديو الواي فاي فائق السرعة Wi-Fi 6/7',
        actionEn: 'Restart wireless subsystem and verify Wi-Fi link speed',
        commandPreview: 'fastboot reboot'
      }
    ]
  },

  // 3. SECURITY & LOCKS
  {
    id: 'screen-lock-no-data-loss',
    titleAr: 'إزالة قفل الشاشة بدون حذف البيانات (Screen Lock Bypass Without Data Loss)',
    titleEn: 'Pattern/PIN Lock Removal Without Data Wipe',
    category: 'SECURITY',
    severity: 'MEDIUM',
    descriptionAr: 'حذف ملفات كلمات المرور (locksettings.db, gesture.key, password.key) عبر منافذ المعالج بدون المساس بالصور والملفات.',
    descriptionEn: 'Bypasses lockscreen PIN/Pattern by patching locksettings provider in data partition without formatting userdata.',
    icon: 'Key',
    supportedModes: ['EDL_9008', 'MTK_BROM', 'RECOVERY_SIDELOAD', 'ADB_ONLINE'],
    supportedChipsets: ['qualcomm', 'mediatek', 'unisoc_spd', 'samsung_exynos'],
    riskAr: 'يحافظ على كافة البيانات والملفات بنسبة 100%',
    riskEn: '100% data preservation on supported models and encryption states',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قراءة حالة التشفير (FBE - File Based Encryption / FDE)',
        actionEn: 'Inspect userdata encryption superblock and security keyslot',
        commandPreview: 'adb shell getprop ro.crypto.state'
      },
      {
        stepNumber: 2,
        actionAr: 'تركيب بارتشن userdata للقراءة والتعديل في وضع الطوارئ',
        actionEn: 'Mount userdata partition block via raw protocol driver',
        protocolCode: 'Mount /dev/block/bootdevice/by-name/userdata -> /data'
      },
      {
        stepNumber: 3,
        actionAr: 'حذف ملفات المفاتيح المشفرة (locksettings.db, gatekeeper.pattern.key)',
        actionEn: 'Remove lock credentials database files and reset gatekeeper auth flag',
        commandPreview: 'rm /data/system/locksettings.db*'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة التشغيل وتخطي واجهة القفل مباشرة للشاشة الرئيسية',
        actionEn: 'Reboot device into launcher with lockscreen disabled',
        commandPreview: 'fastboot reboot'
      }
    ]
  },
  {
    id: 'knox-kg-prenormal-unlock',
    titleAr: 'إلغاء قفل الحماية المقيدة (Knox Guard & KG Prenormal & MDM Unlock)',
    titleEn: 'Knox Guard, KG Locked & Enterprise MDM Unlock',
    category: 'SECURITY',
    severity: 'HIGH',
    descriptionAr: 'فك قيود حماية سامسونج KG Locked / Prenormal وإزالة إشعار الإدارة المدارية (MDM / Knox Cloud Services).',
    descriptionEn: 'Removes Knox Guard lock, KG status Prenormal/Locked, and enterprise corporate enrollment restrictions.',
    icon: 'Lock',
    supportedModes: ['SAMSUNG_DOWNLOAD', 'EDL_9008', 'ADB_ONLINE'],
    supportedChipsets: ['samsung_exynos', 'qualcomm', 'mediatek'],
    riskAr: 'آمن - بدون التأثير على سريال الهاتف',
    riskEn: 'Safe - permanent Knox profile unlink',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قراءة حالة KG State و Knox Warranty Bit من ذاكرة الـ RPMB',
        actionEn: 'Read KG Status register from RPMB secure partition',
        commandPreview: 'Loke Protocol: Read KG Status -> [KG: PRENORMAL / LOCKED]'
      },
      {
        stepNumber: 2,
        actionAr: 'تصفير عداد وتطبيق بروتوكول إلغاء الارتباط بخوادم Knox Guard',
        actionEn: 'Inject KG state patch to reset state to [KG: COMPLETED]',
        protocolCode: 'ODIN Loke Frame: Write PARAM / PERSISTENT KG Unlink Key'
      },
      {
        stepNumber: 3,
        actionAr: 'تعطيل خدمات MDM والتحكم الإداري عن بُعد (Remote Device Manager)',
        actionEn: 'Disable enterprise device policy controller packages',
        commandPreview: 'pm disable-user --user 0 com.samsung.android.knox.kpu'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة التشغيل وفتح كافة صلاحيات الهاتف وتفليش الرومات المعدلة',
        actionEn: 'Reboot device with all bootloader & flashing restrictions lifted',
        commandPreview: 'fastboot reboot'
      }
    ]
  },

  // 4. HARDWARE & MEMORY & SENSORS
  {
    id: 'touch-sensor-fix',
    titleAr: 'إصلاح توقف اللمس والحساسات والكاميرا بعد التحديث (Touch & Sensor Fix)',
    titleEn: 'Touch Screen & Sensor Firmware Calibration Fix',
    category: 'HARDWARE',
    severity: 'MEDIUM',
    descriptionAr: 'معالجة توقف شاشة اللمس أو عدم استجابة حساس التقارب والبصمة والكاميرا بعد تفليش روم غير متطابق أو بعد التحديث.',
    descriptionEn: 'Restores unresponsive touch digitizer, fingerprint scanner, and camera sensors by flashing vendor firmware.',
    icon: 'Layers',
    supportedModes: ['FASTBOOT', 'FASTBOOTD', 'ADB_ONLINE', 'EDL_9008', 'MTK_BROM'],
    supportedChipsets: ['qualcomm', 'mediatek', 'samsung_exynos', 'unisoc_spd'],
    riskAr: 'آمن - يحافظ على ملفات النظام الأساسية',
    riskEn: 'Safe - patches driver firmware without touching user data',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قراءة معرف شاشة اللمس ومتحكم الـ IC (Goodix, Synaptics, FocalTech, Novatek)',
        actionEn: 'Detect Touch IC controller hardware ID and SPI bus status',
        commandPreview: 'adb shell dmesg | grep -i touch'
      },
      {
        stepNumber: 2,
        actionAr: 'حقن وتحديث فيرموير شاشة اللمس (Touch FW Binary) المناسب للموديل',
        actionEn: 'Flash matched vendor_boot.img and calibrate digitizer controller',
        commandPreview: 'fastboot flash vendor_boot vendor_boot.img'
      },
      {
        stepNumber: 3,
        actionAr: 'إعادة معايرة حساس البصمة وحساس التقارب في بارتشن persist',
        actionEn: 'Reset fingerprint and optical proximity sensor offsets in persist',
        commandPreview: 'fastboot flash dtbo dtbo.img'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة التشغيل وتفعيل استجابة اللمس التلقائية',
        actionEn: 'Reboot system and verify touch responsiveness',
        commandPreview: 'fastboot reboot'
      }
    ]
  },
  {
    id: 'emmc-ufs-health-repair',
    titleAr: 'فحص وإصلاح تلف خلايا الذاكرة الداخلية (eMMC / UFS Health Repair & TRIM)',
    titleEn: 'eMMC / UFS Flash Memory Wear & Bad Sector Repair',
    category: 'HARDWARE',
    severity: 'CRITICAL',
    descriptionAr: 'فحص نسبة استهلاك الذاكرة الداخلية (Wear Level Type A/B)، إعادة تعيين البلوكات التالفة، وتشغيل محرك TRIM لتسريع الهاتف.',
    descriptionEn: 'Deep hardware diagnostics for UFS/eMMC lifecycle health, bad sector remapping, and storage controller integrity.',
    icon: 'HardDrive',
    supportedModes: ['EDL_9008', 'MTK_BROM', 'FASTBOOT', 'ADB_ONLINE'],
    supportedChipsets: ['qualcomm', 'mediatek', 'samsung_exynos', 'unisoc_spd'],
    riskAr: 'إصلاح وصيانة تخزينية متقدمة',
    riskEn: 'Advanced storage controller maintenance',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قراءة سجلات Health Descriptor لشرائح الذاكرة (Pre-EOL & Lifetime Estimation)',
        actionEn: 'Query UFS Health Descriptor (DEVICE_LIFE_TIME_EST_A & B)',
        protocolCode: 'UFS Health Check: Device Lifetime 0x01 (Normal: 0-10% used)'
      },
      {
        stepNumber: 2,
        actionAr: 'عزل البلوكات التالفة وإعادة توجيه البيانات للبلوكات الاحتياطية (Bad Sector Remapping)',
        actionEn: 'Remap worn flash NAND blocks to reserve pool and verify ECC parity',
        commandPreview: 'adb shell fstrim -v /data'
      },
      {
        stepNumber: 3,
        actionAr: 'تنظيف وتفريغ الكاش المنخفض وتطبيق تسريع I/O على قطاعات النظام',
        actionEn: 'Execute low-level flash TRIM command to restore read/write speed',
        commandPreview: 'adb shell fstrim -v /system && adb shell fstrim -v /cache'
      },
      {
        stepNumber: 4,
        actionAr: 'التحقق من استقرار النظام وتجاوز أخطاء القراءة والكتابة I/O Errors',
        actionEn: 'Benchmark sequential I/O and verify zero filesystem errors',
        commandPreview: 'fastboot getvar all'
      }
    ]
  },
  {
    id: 'battery-pmic-calibrate',
    titleAr: 'معايرة طاقة البطارية وإصلاح الشحن الوهمي (Battery Calibration & PMIC Reset)',
    titleEn: 'Battery Fuel Gauge & PMIC Power Reset',
    category: 'HARDWARE',
    severity: 'MEDIUM',
    descriptionAr: 'حل مشكلة إغلاق الهاتف المفاجئ عند نسبة 20% أو تفريغ الشحن السريع بعد التحديث وإعادة ضبط شريحة PMIC.',
    descriptionEn: 'Calibrates battery fuel gauge chip (Coulomb counter) and resets PMIC registers to fix fast battery drain.',
    icon: 'BatteryCharging',
    supportedModes: ['ADB_ONLINE', 'FASTBOOT', 'SPD_DIAG', 'EDL_9008'],
    supportedChipsets: ['qualcomm', 'mediatek', 'samsung_exynos', 'unisoc_spd', 'generic_adb'],
    riskAr: 'آمن تماماً',
    riskEn: '100% safe hardware power cycle',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قراءة قراءات مقياس الوقود (Fuel Gauge Register & Battery Health)',
        actionEn: 'Read battery microvolts, temperature, and charge cycle counter',
        commandPreview: 'adb shell dumpsys battery'
      },
      {
        stepNumber: 2,
        actionAr: 'حذف ملف المعايرة الإحصائي التالف batterystats.bin',
        actionEn: 'Purge corrupted batterystats.bin and runtime history',
        commandPreview: 'adb shell dumpsys batterystats --reset'
      },
      {
        stepNumber: 3,
        actionAr: 'إعادة ضبط شريحة الطاقة PMIC ومتحكم الشحن السريع',
        actionEn: 'Send power management IC software reset sequence',
        commandPreview: 'adb shell setprop persist.vendor.power.calibrate 1'
      },
      {
        stepNumber: 4,
        actionAr: 'تطبيق المعايرة وإظهار النسبة الحقيقية لمستوى شحن البطارية',
        actionEn: 'Apply calibrated voltage curve and sync system battery gauge',
        commandPreview: 'adb reboot'
      }
    ]
  },
  {
    id: 'audio-codec-mic-fix',
    titleAr: 'إصلاح اختفاء الصوت والميكروفون وسماعة المكالمات (Audio Codec DSP Fix)',
    titleEn: 'Audio Codec IC & Microphone / Speaker DSP Calibration',
    category: 'HARDWARE',
    severity: 'MEDIUM',
    descriptionAr: 'إصلاح تعطل الصوت أثناء المكالمات، وتوقف الميكروفون عن التسجيل، أو عدم استجابة سماعة الأذن بعد التحديث.',
    descriptionEn: 'Calibrates Audio DSP ALSA registers and resets Qualcomm WCD9385 / Cirrus Logic audio amplifier gains.',
    icon: 'AlertOctagon',
    supportedModes: ['ADB_ONLINE', 'FASTBOOT', 'EDL_9008'],
    supportedChipsets: ['qualcomm', 'mediatek', 'samsung_exynos', 'apple_ios'],
    riskAr: 'آمن تماماً',
    riskEn: 'Safe - resets digital audio mixer pathways',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'فحص استجابة شريحة الصوت (Audio Codec I2C / SoundWire Bus)',
        actionEn: 'Query ALSA sound card list and probe WCD codec driver',
        commandPreview: 'adb shell cat /proc/asound/cards'
      },
      {
        stepNumber: 2,
        actionAr: 'إعادة تعيين قنوات الصوت ومسار مكبر الصوت الرقمي Smart PA',
        actionEn: 'Reset audio calibration tables in /vendor/etc/audio_policy_configuration.xml',
        commandPreview: 'adb shell setprop vendor.audio.reset.dsp 1'
      },
      {
        stepNumber: 3,
        actionAr: 'إعادة تفليش قطاع dsp.img و dtbo.img للمطابقة الدقيقة مع الهاردوير',
        actionEn: 'Flash clean stock dsp partition',
        commandPreview: 'fastboot flash dsp dsp.img'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة التشغيل وتفعيل الصوت المحيطي وسماعة المكالمات بنقاء كامل',
        actionEn: 'Reboot and test microphone / ear-speaker output',
        commandPreview: 'fastboot reboot'
      }
    ]
  },
  {
    id: 'neural-core-bypass-2026',
    titleAr: 'تخطي حماية النواة العصبية (iPhone 17 Neural Core Bypass)',
    titleEn: 'iPhone 17 Pro Max Neural Core & SEP Bypass',
    category: 'SECURITY',
    severity: 'CRITICAL',
    descriptionAr: 'تخطي حماية معالج الذكاء الاصطناعي (Neural Engine) وحماية الـ SEP لأجهزة آيفون 17 لفك أقفال المالك وتنشيط الأجهزة.',
    descriptionEn: 'Advanced bypass for A19 Pro Neural Engine and Secure Enclave Processor (SEP) to handle iCloud & Activation locks.',
    icon: 'Cpu',
    supportedModes: ['APPLE_DFU', 'RECOVERY_SIDELOAD'],
    supportedChipsets: ['apple_ios'],
    riskAr: 'يتطلب خبرة عالية في التعامل مع أوضاع DFU',
    riskEn: 'Expert-level DFU protocol manipulation',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'استغلال ثغرة الـ Bootrom عبر منفذ USB-C 4.0',
        actionEn: 'Execute Bootrom exploit chain via USB-C 4.0/Thunderbolt',
        protocolCode: 'USB_REQ_A19_PRO_EXPLOIT: 0x21 0x01 0x0000 0x0000'
      },
      {
        stepNumber: 2,
        actionAr: 'تعطيل تحقق الـ SEP ونظام التشغيل الآمن (RTOS)',
        actionEn: 'Disable SEP verification and Secure RTOS signature checks',
        protocolCode: 'PATCH_SEP_VERIFY -> 0x00 (BYPASS)'
      },
      {
        stepNumber: 3,
        actionAr: 'تخطي شاشة التنشيط وحذف ملف الـ Setup.app وهمياً',
        actionEn: 'Simulate Setup.app completion and bypass Activation records',
        commandPreview: 'ios_tool --bypass-activation --model A3400'
      },
      {
        stepNumber: 4,
        actionAr: 'تنشيط الخدمات السحابية وإعادة التشغيل للنظام الكامل',
        actionEn: 'Restart SpringBoard and enable full cellular/iCloud services',
        commandPreview: 'ios_tool --reboot'
      }
    ]
  },
  {
    id: 'knox-v2026-unlink',
    titleAr: 'فك ارتباط حماية Knox 2026 (Samsung S26 Cloud Unlink)',
    titleEn: 'Galaxy S26 Ultra Knox Guard 2026 Permanent Unlink',
    category: 'SECURITY',
    severity: 'HIGH',
    descriptionAr: 'إزالة دائمة لحماية Knox Guard v5.0 المعتمدة على السحابة لأجهزة سامسونج S26 وما بعدها.',
    descriptionEn: 'Permanent cloud-side unlinking of Knox Guard v5.0 for S26 Ultra series using deep-level RPMB patch.',
    icon: 'ShieldAlert',
    supportedModes: ['EDL_9008', 'SAMSUNG_DOWNLOAD'],
    supportedChipsets: ['qualcomm', 'samsung_exynos'],
    riskAr: 'آمن تماماً ولا يغير السيريال',
    riskEn: '100% safe, non-invasive serial retention',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قراءة سجلات RPMB المشفرة وتحديد مفتاح الارتباط السحابي',
        actionEn: 'Read RPMB secure storage keys and identify Cloud Unlink Token',
        protocolCode: 'RX: 0x51 0x22 -> TOKEN_HASH: 0xAF...01'
      },
      {
        stepNumber: 2,
        actionAr: 'توليد شهادة فك ارتباط وهمية مصدق عليها برمجياً',
        actionEn: 'Synthesize virtual unlink certificate with hardware-signed hash',
        protocolCode: 'TX: 0x4B 0x01 [CERT_DATA...]'
      },
      {
        stepNumber: 3,
        actionAr: 'تصفير عدادات الحماية وإعادة ضبط مصنع شامل للـ Persistence',
        actionEn: 'Factory reset persistence storage and zero-out KG counters',
        commandPreview: 'samsung_tool --reset-kg-v5 --model SM-S948B'
      },
      {
        stepNumber: 4,
        actionAr: 'تخطي واجهة الإعداد وتفعيل النظام بدون طلب حساب سامسونج',
        actionEn: 'Bypass setup wizard and enable OS without Samsung Account prompt',
        commandPreview: 'samsung_tool --reboot'
      }
    ]
  },
  // 5. DATA EXTRACTION
  {
    id: 'emergency-data-dump',
    titleAr: 'سحب واستخراج البيانات المحذوفة والصور من الهواتف المعطلة (Forensic Data Dump)',
    titleEn: 'Emergency Data Extraction & Physical Forensic Dump',
    category: 'DATA',
    severity: 'MEDIUM',
    descriptionAr: 'سحب الصور، والفيديوهات، والأسماء، والرسائل، ونسخ تطبيق واتساب من الهواتف ذات الشاشات المكسورة أو المتعطلة.',
    descriptionEn: 'Extracts critical user files, WhatsApp databases, and contacts directly from raw storage partitions in low-level modes.',
    icon: 'Download',
    supportedModes: ['EDL_9008', 'MTK_BROM', 'ADB_ONLINE', 'RECOVERY_SIDELOAD'],
    supportedChipsets: ['qualcomm', 'mediatek', 'samsung_exynos', 'unisoc_spd'],
    riskAr: 'للقراءة فقط (Read-Only) بدون أي خطر على الهاتف',
    riskEn: 'Read-only physical memory dump - zero risk',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قراءة وتحديد قطاع userdata ومسار مجلد المستخدم الداخلي /data/media/0',
        actionEn: 'Locate userdata sector address and mount virtual forensic container',
        protocolCode: 'EDL Raw Sector Read: /dev/block/bootdevice/by-name/userdata'
      },
      {
        stepNumber: 2,
        actionAr: 'استخراج مجلد الصور والفيديوهات (DCIM, Pictures, Downloads)',
        actionEn: 'Stream photos, videos, and document directories to PC storage',
        commandPreview: 'adb pull /sdcard/DCIM/ ./Extracted_Data/DCIM/'
      },
      {
        stepNumber: 3,
        actionAr: 'سحب قواعد بيانات جهات الاتصال ورسائل واتساب (Contacts & msgstore.db)',
        actionEn: 'Extract SQLite database containers for contacts and messaging apps',
        commandPreview: 'adb pull /data/data/com.whatsapp/databases/ ./Extracted_Data/WhatsApp/'
      },
      {
        stepNumber: 4,
        actionAr: 'تجهيز تقرير الاستخراج وحفظ كافة البيانات في مجلد مؤمن ومضغوط على الكمبيوتر',
        actionEn: 'Package extracted files into encrypted backup archive on PC',
        commandPreview: 'Extraction complete -> Saved to /OmniFix_Vault/Backup.tar'
      }
    ]
  },
  {
    id: 'arb-rollback-bypass',
    titleAr: 'تخطي حماية منع الرجوع للإصدار الأقدم (Anti-Rollback / ARB Bypass)',
    titleEn: 'Anti-Rollback (ARB) Index Bypass & Downgrade',
    category: 'BOOT',
    severity: 'CRITICAL',
    descriptionAr: 'تجاوز حماية الـ ARB التي تمنع تفليش إصدارات حماية قديمة (Downgrade) لتجنب موت الجهاز.',
    descriptionEn: 'Bypasses eFuse-based Anti-Rollback mechanisms to allow safe firmware downgrades to previous security levels.',
    icon: 'ShieldAlert',
    supportedModes: ['EDL_9008', 'MTK_BROM', 'HUAWEI_COM1'],
    supportedChipsets: ['qualcomm', 'mediatek', 'hisilicon_kirin'],
    riskAr: 'عالي الخطورة - يتطلب مبرمج ذاكرة متطابق',
    riskEn: 'High Risk - requires precise binary matching',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قراءة قيمة الـ ARB الحالية من معالج الجهاز (SMC / Fuse Read)',
        actionEn: 'Query current ARB index from hardware security module fuses',
        commandPreview: 'fastboot getvar anti'
      },
      {
        stepNumber: 2,
        actionAr: 'تعديل سجلات الإقلاع (xbl, abl) لإخفاء قيمة الحماية عن المعالج',
        actionEn: 'Patch secondary bootloader binaries to suppress ARB index check',
        protocolCode: 'HEX_PATCH: find 0x41 0x52 0x42 replace 0x00 0x00 0x00'
      },
      {
        stepNumber: 3,
        actionAr: 'تفليش الروم القديم مع استثناء بارتشنات الحماية الحساسة',
        actionEn: 'Flash target legacy firmware excluding anti-rollback partitions',
        commandPreview: 'fastboot flash system system.img'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة التشغيل بنجاح على الإصدار الأقدم',
        actionEn: 'Reboot to legacy OS version with ARB check neutralized',
        commandPreview: 'fastboot reboot'
      }
    ]
  },
  {
    id: 'felica-nfc-fix',
    titleAr: 'إصلاح وتعريف شريحة NFC والـ FeliCa (NFC / FeliCa Region Switch)',
    titleEn: 'NFC & FeliCa (Osaifu-Keitai) Region & HW Fix',
    category: 'HARDWARE',
    severity: 'MEDIUM',
    descriptionAr: 'تفعيل خدمات الدفع الإلكتروني (NFC) وتغيير المنطقة لتفعيل الـ FeliCa للأجهزة الموجهة لليابان أو العكس.',
    descriptionEn: 'Enables FeliCa (Japan) or standard NFC by patching SEC_CONFIG and regional calibration blobs.',
    icon: 'Radio',
    supportedModes: ['ADB_ONLINE', 'EDL_9008', 'ROOT'],
    supportedChipsets: ['qualcomm', 'samsung_exynos', 'apple_ios'],
    riskAr: 'آمن - يحافظ على الـ IMEI',
    riskEn: 'Safe - preserves cellular identity',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'فحص معرف منطقة الـ NFC في بارتشن الـ EFS / NVRAM',
        actionEn: 'Identify NFC controller SKU and regional SKU in EFS/NVRAM',
        commandPreview: 'adb shell getprop ro.boot.hardware.sku'
      },
      {
        stepNumber: 2,
        actionAr: 'حقن ملفات المعايرة الإقليمية (NFC Firmware Blobs) المطلوبة',
        actionEn: 'Write regional-specific NFC calibration and firmware images',
        commandPreview: 'fastboot flash nfc nfc_region_jp.img'
      },
      {
        stepNumber: 3,
        actionAr: 'تفعيل محفظة Osaifu-Keitai وتجاوز قيود الـ Google Pay',
        actionEn: 'Initialize FeliCa secure element and sync with system keystore',
        commandPreview: 'adb shell setprop persist.vendor.nfc.config 1'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة التشغيل وتفعيل الدفع عبر الهاتف بنجاح',
        actionEn: 'Reboot and verify NFC tap-to-pay functionality',
        commandPreview: 'adb reboot'
      }
    ]
  },
  {
    id: 'faceid-touchid-repair',
    titleAr: 'إصلاح ومزامنة مستشعر البصمة والوجه (FaceID / TouchID Crypto Alignment)',
    titleEn: 'Biometric Sensor Cryptographic Pairing & Fix',
    category: 'SECURITY',
    severity: 'HIGH',
    descriptionAr: 'إعادة ربط مستشعر البصمة (Fingerprint) أو الـ FaceID برمجياً بعد الاستبدال أو فقدان البيانات المشفرة.',
    descriptionEn: 'Re-aligns biometric sensor crypto-tokens with the Secure Enclave / TrustZone after hardware repair.',
    icon: 'ShieldCheck',
    supportedModes: ['ADB_ONLINE', 'APPLE_DFU', 'EDL_9008'],
    supportedChipsets: ['apple_ios', 'qualcomm', 'samsung_exynos', 'mediatek'],
    riskAr: 'يتطلب اتصالاً بسيرفرات التوثيق الرسمية في بعض الحالات',
    riskEn: 'May require cloud-side validation for certain security chips',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قراءة الرقم التسلسلي للمستشعر (Sensor Unique ID) ومطابقته مع الـ Logic Board',
        actionEn: 'Query biometric hardware serial and verify matching in SEP/TZ keys',
        commandPreview: 'adb shell cat /sys/class/fingerprint/fp_id'
      },
      {
        stepNumber: 2,
        actionAr: 'توليد طلب مزامنة جديد (Handshake Request) لشريحة الحماية',
        actionEn: 'Generate new crypto-pairing request to Secure Enclave / TrustZone',
        protocolCode: 'SEC_BIO_PAIR: 0xFD 0x01 [SERIAL_HASH]'
      },
      {
        stepNumber: 3,
        actionAr: 'حقن كود المزامنة (Alignment Token) في بارتشن الـ Persist / Secure Storage',
        actionEn: 'Inject alignment blob to persistent secure storage',
        commandPreview: 'fastboot flash persist persist_aligned.img'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة التشغيل واختبار استجابة المستشعر الحيوية',
        actionEn: 'Reboot and perform biometric enrollment test',
        commandPreview: 'fastboot reboot'
      }
    ]
  },
  {
    id: 'ufs-partition-resize',
    titleAr: 'تعديل مساحة البارتشنات وتوسيع الذاكرة (UFS Partition Resize & LUN Management)',
    titleEn: 'UFS Partition Resizing & Storage LUN Expansion',
    category: 'HARDWARE',
    severity: 'CRITICAL',
    descriptionAr: 'توسيع مساحة بارتشن الـ System أو الـ Userdata برمجياً عبر دمج المساحات الفارغة وإعادة تقسيم الـ LUNs.',
    descriptionEn: 'Advanced resizing of dynamic super partitions and logical unit (LUN) reallocation for storage optimization.',
    icon: 'Maximize2',
    supportedModes: ['EDL_9008', 'MTK_BROM', 'FASTBOOTD'],
    supportedChipsets: ['qualcomm', 'mediatek', 'samsung_exynos'],
    riskAr: 'خطورة متوسطة - يتطلب مراجعة دقيقة لجدول التقسيم GPT',
    riskEn: 'Medium Risk - requires precise GPT alignment',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قراءة جدول التقسيم (GPT) وتحليل المساحات غير المخصصة (Unallocated Space)',
        actionEn: 'Parse Master GPT and locate unmapped storage sectors',
        commandPreview: 'fastboot getvar partition-size:userdata'
      },
      {
        stepNumber: 2,
        actionAr: 'تعديل ملف الـ Rawprogram الخاص بالـ EDL ليعكس المساحات الجديدة',
        actionEn: 'Generate updated rawprogram.xml with expanded sector offsets',
        protocolCode: 'XML_EDIT: <program size_in_kb="NEW_SIZE" ... />'
      },
      {
        stepNumber: 3,
        actionAr: 'كتابة جدول التقسيم الجديد (GPT Write) وإعادة تهيئة البارتشنات المتأثرة',
        actionEn: 'Flash updated GPT and perform quick-format on target partitions',
        commandPreview: 'qdl --storage ufs --program rawprogram_resized.xml'
      },
      {
        stepNumber: 4,
        actionAr: 'التحقق من المساحة الكلية داخل النظام وإعادة التشغيل',
        actionEn: 'Verify total available storage in OS and trigger final reboot',
        commandPreview: 'adb shell df -h /data'
      }
    ]
  },
  {
    id: 'water-damage-corrosion-deox',
    titleAr: 'إصلاح أضرار السوائل والأكسدة وعزل الشورت (Ultrasonic & Low-V Short Isolation)',
    titleEn: 'Liquid Damage Deoxidation, Ultrasonic Cleaning & Safe Short Isolation',
    category: 'HARDWARE',
    severity: 'CRITICAL',
    descriptionAr: 'بروتوكول علمي آمن لإزالة الأملاح والأكسدة تحت آيسيات BGA بالمنظف الأيوني (IPA 99.9%) وعزل مكثفات الشورت بحقن جهد محدود.',
    descriptionEn: 'Scientific protocol for stripping electrolytic corrosion under BGA ICs and isolating shorted MLCC caps using current-limited injection.',
    icon: 'Droplets',
    supportedModes: ['DISCONNECTED', 'ADB_ONLINE', 'APPLE_DFU', 'EDL_9008'],
    supportedChipsets: ['apple_ios', 'qualcomm', 'mediatek', 'samsung_exynos', 'unisoc_spd', 'hisilicon_kirin', 'google_tensor'],
    riskAr: 'تحذير حرج: لا تقم بتوصيل البطارية أو الشاحن قبل تنظيف الأكسدة وقياس ممانعة VDD_MAIN',
    riskEn: 'CRITICAL: Never connect battery or charger before ultrasonic flux wash and VDD_MAIN diode check',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'فصل البطارية فوراً وفحص خطوط الطاقة الأساسية (VBAT / VPH_PWR / VDD_MAIN) بوضع الدايود',
        actionEn: 'Disconnect battery immediately and measure diode drop on VBAT / VPH_PWR / VDD_MAIN',
        protocolCode: 'DMM_DIODE: Red -> GND | Black -> VDD_MAIN (Healthy: 0.340V - 0.520V)'
      },
      {
        stepNumber: 2,
        actionAr: 'تنظيف الأكسدة بمحلول كحول أيزوبروبيل نقي IPA 99.9% أو حوض الموجات فوق الصوتية (Ultrasonic)',
        actionEn: 'Dissolve electrolytic mineral bridges using 99.9% IPA & ultrasonic bath, then dry at 65°C',
        protocolCode: 'IPA_ULTRASONIC: 40kHz / 180s -> Hot Air Dry 65°C 10m'
      },
      {
        stepNumber: 3,
        actionAr: 'حقن جهد منخفض آمن على المسار المقصر: 1.0V كحد أقصى للـ Buck و 3.8V/2.5A لخط VDD_MAIN مع الراتنج',
        actionEn: 'Inject safe current-limited DC voltage (max 1.0V on Buck, 3.8V/2.5A on VDD_MAIN) over rosin flux',
        protocolCode: 'PSU_INJECT: VDD_MAIN <= 3.80V @ 2.50A | CPU_BUCK <= 0.90V @ 2.00A'
      },
      {
        stepNumber: 4,
        actionAr: 'استبدال المكثف التالف وإعادة بناء المسارات المتآكلة (Micro-Jumper) بسلك معزول 0.01mm وطلاء UV Mask',
        actionEn: 'Replace shorted MLCC capacitor, restore corroded pads with 0.01mm enamel wire, and cure UV solder mask',
        protocolCode: 'UV_CURING: 395nm LED 30s -> Re-verify Diode Drop > 0.340V'
      }
    ]
  },
  {
    id: 'three-minute-panic-thermistor',
    titleAr: 'إصلاح ريستارت 3 دقائق وتقارير Kernel Panic / Thermistor (iOS & Android)',
    titleEn: '3-Minute Reboot Loop, Panic-Full Parser & NTC Thermistor Calibration',
    category: 'HARDWARE',
    severity: 'HIGH',
    descriptionAr: 'تشخيص أسباب إعادة التشغيل كل 180 ثانية (i2c0/i2c2 Missing Sensor، فشل خط البطارية SWI/GasGauge، أو تلف مقاومة الحراري NTC).',
    descriptionEn: 'Diagnose 180-second thermal/watchdog resets via panic logs (missing I2C sensors, battery SWI gas gauge data, or drifted NTC thermistors).',
    icon: 'Thermometer',
    supportedModes: ['ADB_ONLINE', 'APPLE_RECOVERY', 'APPLE_DFU'],
    supportedChipsets: ['apple_ios', 'qualcomm', 'mediatek', 'samsung_exynos', 'google_tensor'],
    riskAr: 'استبدال فلاتة الشحن أو البطارية بأخرى غير أصلية قد يسبب فقدان خط بيانات I2C للمستشعر',
    riskEn: 'Aftermarket charge/power flex cables often lack thermal sensor telemetry I2C lines',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'استخراج سجل الأعطال panic-full أو kernel last_kmsg لتحديد اسم الحساس المفقود (Prs0 / TG0B / mic1)',
        actionEn: 'Pull panic-full logs or Android last_kmsg to pinpoint failing I2C/SWI sensor index',
        commandPreview: 'idevicecrashreport -e ./panic_logs && adb shell cat /sys/fs/pstore/console-ramoops-0'
      },
      {
        stepNumber: 2,
        actionAr: 'قراءة قيم مستشعرات الحرارة ومقاومة BAT_THERM (القراءة السليمة ~10kΩ عند 25°C / دايود 0.55V)',
        actionEn: 'Inspect battery thermistor values & BAT_THERM diode drop (~10kΩ at 25°C / 0.55V diode)',
        commandPreview: 'adb shell dumpsys battery && dumpsys thermalservice'
      },
      {
        stepNumber: 3,
        actionAr: 'فحص خطي الـ I2C SDA/SCL (1.8V Pull-up) وفصل فلاتة الشحن أو الفلاش للاختبار المعزول',
        actionEn: 'Measure I2C 1.8V pull-up resistors and isolate charging port / proximity flex to confirm culprit',
        protocolCode: 'I2C_CHECK: SDA/SCL Diode 0.420V - 0.520V | Pull-Up 1.80V'
      },
      {
        stepNumber: 4,
        actionAr: 'تبديل الفلاتة الأصلية أو تعويض مقاومة الـ NTC 10kΩ والتأكد من ثبات الجهاز لأكثر من 10 دقائق',
        actionEn: 'Replace OEM flex assembly or 10kΩ NTC thermistor and run 10-minute stability burn-in',
        protocolCode: 'VERIFY_UPTIME: > 600s without Watchdog Reset'
      }
    ]
  },
  {
    id: 'false-moisture-usb-cc-fix',
    titleAr: 'إصلاح إنذار الرطوبة الدائم وأعطال الشحن السريع (USB-C CC1/CC2 & SBU Moisture)',
    titleEn: 'Persistent Type-C Moisture Alert & USB-PD CC1/CC2 Resistance Repair',
    category: 'HARDWARE',
    severity: 'MEDIUM',
    descriptionAr: 'معالجة رسالة "تم اكتشاف رطوبة في منفذ USB" الناتجة عن تسريب طفيف بين أرجل VBUS و CC1/CC2/SBU في منفذ Type-C أو آيسي الحماية OVP.',
    descriptionEn: 'Resolve persistent moisture detected warnings caused by conductive carbon/oxide bridges across USB-C CC1/CC2/SBU pins or MUIC/OVP ICs.',
    icon: 'Usb',
    supportedModes: ['ADB_ONLINE', 'SAMSUNG_DOWNLOAD', 'DISCONNECTED'],
    supportedChipsets: ['samsung_exynos', 'qualcomm', 'mediatek', 'google_tensor', 'unisoc_spd', 'apple_ios'],
    riskAr: 'تنظيف المنفذ بأدوات معدنية حادة قد يكسر لسان Type-C أو يقصر خط CC2 مع VBUS 20V',
    riskEn: 'Metal tools inside Type-C port can short CC2 directly to VBUS, destroying PMIC/SoC',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'قياس ممانعة أرجل CC1 و CC2 و SBU1/SBU2 بوضع الدايود مقارنة بالقيم المرجعية (0.55V ~ 0.72V)',
        actionEn: 'Measure diode drops on CC1, CC2, and SBU1/SBU2 pins against healthy reference (0.55V - 0.72V)',
        protocolCode: 'USB_C_PINOUT: CC1/CC2 = 0.620V | D+/D- = 0.580V | SBU = 0.650V'
      },
      {
        stepNumber: 2,
        actionAr: 'تنظيف قاعدة المنفذ من الداخل بكحول IPA 99% وفرشاة ناعمة غير موصلة وفحص وجود أي تفحم كربوني',
        actionEn: 'Flush Type-C receptacle with 99% IPA and non-conductive ESD brush to strip conductive residue',
        commandPreview: 'adb shell dumpsys usb'
      },
      {
        stepNumber: 3,
        actionAr: 'فحص دايودات الحماية ESD ورفعها مؤقتاً أو تغيير سوكيت الشحن إذا ثبت وجود تسريب تحته',
        actionEn: 'Test ESD/TVS diodes on CC/SBU lines; replace Type-C connector or MUIC/Water-Detect IC (S2MU106/PM8550B)',
        protocolCode: 'CC_LEAK_ISOLATION: Desolder D_ESD -> Re-check CC resistance > 100kΩ'
      },
      {
        stepNumber: 4,
        actionAr: 'اختبار تفاوض الشحن السريع USB-PD (9V/15V/20V) ونقل البيانات OTG عبر الكابل',
        actionEn: 'Verify USB-PD fast charge negotiation (9V/15V) and USB 2.0/3.x data enumeration',
        commandPreview: 'adb shell cat /sys/class/power_supply/usb/voltage_now'
      }
    ]
  },
  {
    id: 'sim-not-detected-power-rail',
    titleAr: 'إصلاح عطل لا توجد بطاقة SIM وفقدان فولتية VDD_SIM 1.8V / 3.0V',
    titleEn: 'SIM Card Not Detected & VDD_SIM 1.8V/3.0V Dual-Voltage Rail Repair',
    category: 'NETWORK',
    severity: 'HIGH',
    descriptionAr: 'تتبع خطوط قارئ الشريحة الستة (SIM_VCC, SIM_RST, SIM_CLK, SIM_DATA, SIM_DET) وتشخيص عطل التغذية المتبادلة 1.8V/3.0V من آيسي الباور.',
    descriptionEn: 'Trace all 6 SIM tray lines (SIM_VCC, RST, CLK, DATA, DET) and diagnose missing 1.8V/3.0V PMIC LDO handshakes.',
    icon: 'Cpu',
    supportedModes: ['ADB_ONLINE', 'DISCONNECTED'],
    supportedChipsets: ['qualcomm', 'mediatek', 'samsung_exynos', 'apple_ios', 'unisoc_spd', 'hisilicon_kirin'],
    riskAr: 'اختفاء الإيمي IMEI تماماً (*#06# فارغ) يعني أن العطل في المعالج/البيسباند وليس بيت الشريحة',
    riskEn: 'If IMEI is also Null (*#06# empty), prioritize Baseband PMIC/NVRAM before replacing SIM slot',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'التحقق من وجود رقم IMEI وإصدار Baseband أولاً للتفريق بين عطل بيت الشريحة وعطل المودم',
        actionEn: 'Verify IMEI and Baseband version first to isolate SIM tray faults from Baseband failure',
        commandPreview: 'adb shell getprop gsm.version.baseband && getprop gsm.sim.state'
      },
      {
        stepNumber: 2,
        actionAr: 'قياس ممانعة أرجل بيت الشريحة الستة بوضع الدايود (SIM_VCC سليم 0.480V - 0.650V، و GND = 0.000V)',
        actionEn: 'Probe all 6 SIM socket pins in diode mode (VCC healthy 0.480V-0.650V, CLK/RST/DATA 0.450V-0.620V)',
        protocolCode: 'SIM_DIODE: VCC=0.560V | RST=0.510V | CLK=0.510V | IO=0.520V'
      },
      {
        stepNumber: 3,
        actionAr: 'فحص سويتش الإحساس (SIM_DETECT Pin) عند إدخال بيت الشريحة ومراقبة نبضة VDD_SIM_1V8 على الأوسيلوسكوب',
        actionEn: 'Verify mechanical SIM_DETECT switch polarity and capture PMIC 1.8V/3.0V poll burst on boot',
        protocolCode: 'SCOPE_POLL: 1.80V pulse (200ms) upon SIM insertion -> drops if CLK/IO missing'
      },
      {
        stepNumber: 4,
        actionAr: 'إعادة لحام مقاومات التوازي (Pull-up) أو استبدال آيسي التبديل / إعادة شبلنة PMIC خط LDO_SIM',
        actionEn: 'Restore broken series/pull-up resistors or reball PMIC LDO_SIM controller',
        protocolCode: 'REPAIR_VERIFY: SIM_STATE=READY & Carrier IMS Registered'
      }
    ]
  },
  {
    id: 'backlight-vs-display-diagnostics',
    titleAr: 'تفريق وتشخيص أعطال الشاشة السوداء: عطل الإضاءة Backlight أم انعدام البيانات OLED/MIPI',
    titleEn: 'Black Screen Isolation: Backlight Boost vs OLED Bias & MIPI DSI Data Diagnostics',
    category: 'HARDWARE',
    severity: 'HIGH',
    descriptionAr: 'منهجية فحص علمية للتفرقة بين فقدان إضاءة LCD Boost (16V-28V)، وفقدان جهود AMOLED ELVDD/ELVSS (-4.4V / +4.6V)، وانقطاع خطوط البيانات MIPI.',
    descriptionEn: 'Systematic isolation between LCD LED Boost (16-28V), AMOLED ELVDD/ELVSS (+4.6V/-4.4V) bias failures, and broken MIPI DSI filter coils.',
    icon: 'Monitor',
    supportedModes: ['DISCONNECTED', 'ADB_ONLINE'],
    supportedChipsets: ['apple_ios', 'qualcomm', 'mediatek', 'samsung_exynos', 'unisoc_spd', 'hisilicon_kirin', 'google_tensor'],
    riskAr: 'فحص سوكيت الشاشة تحت الجهد قد يحرق ملف الـ Backlight أو كونكتور الشاشة عند تركيب الشاشة والبطارية متصلة',
    riskEn: 'Hot-plugging a display flex with battery connected frequently blows backlight anode coil or OLED bias IC',
    protocolPipeline: [
      {
        stepNumber: 1,
        actionAr: 'فحص الجهاز بكشاف جانبي والتأكد من استقبال المكالمات أو قراءة النظام via ADB لتأكيد أن البوردة مقلعة',
        actionEn: 'Check image with side flashlight & verify OS boot via ADB / current draw (active UI > 300mA)',
        commandPreview: 'adb shell dumpsys display | grep mScreenState'
      },
      {
        stepNumber: 2,
        actionAr: 'قياس خطوط MIPI DSI (5 أزواج تفاضلية) عبر ملفات EMI: القيمة السليمة 0.350V - 0.520V متطابقة على كل خط',
        actionEn: 'Diode-probe all MIPI DSI differential pairs across EMI chokes (must match closely 0.350V-0.520V)',
        protocolCode: 'MIPI_DSI: All D0..D3 +/- & CLK +/- matched within ±0.030V'
      },
      {
        stepNumber: 3,
        actionAr: 'في شاشات LCD فحص خط الأنود LED_A (شورت أو دايود الدائود Schottky وملف البوست 18V-25V)',
        actionEn: 'For LCD: verify Backlight Boost Inductor, Schottky diode cathode, and LED_A anode (18V-25V under load)',
        protocolCode: 'LCD_BOOST: VIN=3.8V -> VOUT_ANODE=18V-26V (with LCD plugged)'
      },
      {
        stepNumber: 4,
        actionAr: 'في شاشات AMOLED/OLED قياس فولتيات ELVDD (+4.6V) و ELVSS (-4.4V) و AVDD (+7.3V) فور تفعيل خط TE/SWIRE',
        actionEn: 'For AMOLED/OLED: verify TPS65657 / S2DOS05 generates ELVDD +4.6V, ELVSS -4.4V, and AVDD +7.3V',
        protocolCode: 'OLED_BIAS: ELVDD=+4.60V | ELVSS=-4.40V | VCI=3.0V | VDDIO=1.8V'
      }
    ]
  }
];

