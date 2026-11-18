/**
 * Real-World Open-Source Repair Tooling, Mobile SoC Architecture Registry,
 * Schematic File Formats, and Complete Smartphone Electronic Circuit Blueprints.
 */

export interface OpenSourceToolEntry {
  id: string;
  name: string;
  repository: string;
  license: string;
  category: 'FLASHING_SOC' | 'SCHEMATIC_PCB' | 'LOGIC_FORENSICS' | 'FIRMWARE_UNPACK';
  supportedChipsetsOrFormats: string[];
  usbTargets: string[];
  summaryAr: string;
  summaryEn: string;
  sampleCommands: string[];
}

export interface PhoneCircuitSubsystem {
  id: string;
  category: 'POWER' | 'CHARGING' | 'DISPLAY' | 'RF_BASEBAND' | 'MEMORY' | 'AUDIO' | 'CAMERA' | 'CONNECTIVITY';
  nameAr: string;
  nameEn: string;
  primaryNets: string[];
  referenceIcs: string[];
  operatingVoltages: string;
  diodeRange: string;
  keyPassiveComponents: string[];
  failureSymptomsAr: string;
  failureSymptomsEn: string;
  diagnosticProcedureAr: string[];
  diagnosticProcedureEn: string[];
}

export interface SocProcessorSpec {
  id: string;
  vendor: 'Qualcomm' | 'MediaTek' | 'Apple' | 'Samsung Exynos' | 'Google Tensor' | 'Huawei Kirin' | 'Unisoc';
  familyName: string;
  socPartNumbers: string[];
  pairedPmics: string[];
  usbBootMode: string;
  vidPid: string;
  memorySupport: string;
  representativeDevices: string[];
  architectureNotesAr: string;
  architectureNotesEn: string;
  commonHardwareFaultsAr: string;
  commonHardwareFaultsEn: string;
}

export const OPEN_SOURCE_REPAIR_TOOLS: OpenSourceToolEntry[] = [
  {
    id: 'oss-mtkclient',
    name: 'mtkclient (BROM / Preloader Exploitation & Flasher)',
    repository: 'bkerler/mtkclient',
    license: 'GPL-3.0',
    category: 'FLASHING_SOC',
    supportedChipsetsOrFormats: ['MediaTek MT67xx / MT68xx / Dimensity', 'scatter.txt', 'DA .bin', 'preloader.bin'],
    usbTargets: ['VID:0E8D PID:0003 (BROM)', 'VID:0E8D PID:2000 (Preloader)'],
    summaryAr: 'أشهر أداة مفتوحة المصدر للوصول المباشر لذاكرة eMMC/UFS على معالجات MediaTek وتخطي SLA/DAA وقراءة وكتابة الأقسام وفك البوتلودر.',
    summaryEn: 'Premier open-source MediaTek BROM/Preloader flasher for SLA/DAA bypass, partition read/write, RPMB inspection, and bootloader unlock.',
    sampleCommands: [
      'mtk printgpt',
      'mtk r boot,vbmeta boot.img,vbmeta.img',
      'mtk e frp,persistent',
      'mtk da seccfg unlock',
    ],
  },
  {
    id: 'oss-edl',
    name: 'edl (Qualcomm Sahara / Firehose Programmer)',
    repository: 'bkerler/edl',
    license: 'GPL-3.0',
    category: 'FLASHING_SOC',
    supportedChipsetsOrFormats: ['Qualcomm Snapdragon SM/SDM/QCM', '.elf', '.mbn', 'rawprogram0.xml', 'patch0.xml'],
    usbTargets: ['VID:05C6 PID:9008 (EDL 9008)', 'VID:05C6 PID:9091 (DIAG)'],
    summaryAr: 'منفذ بروتوكول Sahara و Firehose XML لإحياء أجهزة كوالكوم الميتة وقراءة جداول LUNs والنسخ الاحتياطي لقطاعات الشبكة.',
    summaryEn: 'Open-source Qualcomm Sahara & Firehose loader supporting XML partition flashing, LUN read/write, and modem EFS backup.',
    sampleCommands: [
      'edl printgpt --loader=prog_firehose_ddr.elf',
      'edl r modemst1,modemst2,fsg efs_bak/',
      'edl e frp,persist',
    ],
  },
  {
    id: 'oss-heimdall',
    name: 'Heimdall (Samsung Loke / ODIN Protocol Flasher)',
    repository: 'Benjamin-Dobell/Heimdall',
    license: 'MIT',
    category: 'FLASHING_SOC',
    supportedChipsetsOrFormats: ['Samsung Loke / Odin', '.pit', '.img', '.lz4', 'BL/AP/CP/CSC'],
    usbTargets: ['VID:04E8 PID:685D (Samsung Download Mode)'],
    summaryAr: 'بديل Odin مفتوح المصدر المبني على libusb لتفليش أجهزة سامسونج وقراءة وتحليل ملفات PIT عبر الأنظمة المختلفة.',
    summaryEn: 'Cross-platform libusb-based open-source Samsung Download Mode utility for PIT extraction and partition flashing.',
    sampleCommands: [
      'heimdall detect',
      'heimdall print-pit --no-reboot',
      'heimdall flash --BOOT boot.img --VBMETA vbmeta.img',
    ],
  },
  {
    id: 'oss-spd-dump',
    name: 'spd_dump (Unisoc / Spreadtrum FDL Flasher)',
    repository: 'ilyakurdyukov/spreadtrum_flash',
    license: 'GPL-3.0',
    category: 'FLASHING_SOC',
    supportedChipsetsOrFormats: ['Unisoc SC9863A / Tiger T612 / T616 / T760', '.pac', 'fdl1.bin', 'fdl2.bin'],
    usbTargets: ['VID:1782 PID:4D00 (SPRD U2S Diag)'],
    summaryAr: 'أداة سطر أوامر مفتوحة المصدر لتفليش معالجات Unisoc عبر FDL1/FDL2 وقراءة وكتابة قطاعات NVDATA ومسح قفل FRP.',
    summaryEn: 'Open-source Spreadtrum/Unisoc FDL loader and partition dumper with NV calibration backup and FRP erase.',
    sampleCommands: [
      'spd_dump exec_addr 0x65015f08 fdl fdl1-dl.bin 0x65000800 fdl fdl2-dl.bin 0x9efffe00 exec',
      'spd_dump r persist r_persist.bin',
      'spd_dump e persist',
    ],
  },
  {
    id: 'oss-libimobiledevice',
    name: 'libimobiledevice + irecovery + idevicerestore',
    repository: 'libimobiledevice/libimobiledevice',
    license: 'LGPL-2.1',
    category: 'FLASHING_SOC',
    supportedChipsetsOrFormats: ['Apple iOS / iPadOS', '.ipsw', 'SHSH2 Blobs', 'iBSS/iBEC'],
    usbTargets: ['VID:05AC PID:1227 (DFU)', 'VID:05AC PID:1281 (Recovery)', 'VID:05AC PID:12A8 (Normal)'],
    summaryAr: 'المكتبة المفتوحة المصدر للتواصل مع أجهزة Apple بدون iTunes عبر بروتوكول usbmuxd وإدارة Recovery و DFU واستعادة IPSW.',
    summaryEn: 'Open-source cross-platform protocol library for iOS telemetry, Recovery/DFU control, and IPSW firmware restoration.',
    sampleCommands: [
      'ideviceinfo -s',
      'irecovery -q',
      'idevicerestore --latest firmware.ipsw',
    ],
  },
  {
    id: 'oss-checkm8-ipwndfu',
    name: 'ipwndfu / gaster (Apple BootROM checkm8 Engine)',
    repository: 'axi0mX/ipwndfu',
    license: 'MIT',
    category: 'FLASHING_SOC',
    supportedChipsetsOrFormats: ['Apple A7–A11 (S5L8960–T8015)', 'pwnedDFU', 'Ramdisk', 'SysCfg'],
    usbTargets: ['VID:05AC PID:1227 (DFU BootROM)'],
    summaryAr: 'استغلال BootROM على مستوى العتاد لإقلاع SSH Ramdisk ومعالجة أخطاء SysCfg و Wi-Fi/Baseband وفك التشفير الجنائي للأجهزة المدعومة.',
    summaryEn: 'BootROM USB heap-overflow toolkit enabling pwnedDFU state, unsigned SSH Ramdisk boot, and SysCfg inspection.',
    sampleCommands: [
      './ipwndfu -p',
      'irecovery -f iBSS.img4 && irecovery -f iBEC.img4',
    ],
  },
  {
    id: 'oss-aosp-tools',
    name: 'Android Platform Tools (adb & fastboot / fastbootd)',
    repository: 'aosp-mirror/platform_system_core',
    license: 'Apache-2.0',
    category: 'FLASHING_SOC',
    supportedChipsetsOrFormats: ['All Android OEMs', 'ADB', 'Fastboot', 'FastbootD Logical', 'super_empty.img'],
    usbTargets: ['VID:18D1 PID:4EE7 (ADB)', 'VID:18D1 PID:D00D (Fastboot)'],
    summaryAr: 'حزمة أدوات جوجل الرسمية المفتوحة المصدر لفحص متغيرات البوتلودر وتفليش الأقسام الديناميكية والتحقق من AVB 2.0.',
    summaryEn: 'Official AOSP host tools for ADB shell telemetry, dynamic logical partition flashing in fastbootd, and AVB variable inspection.',
    sampleCommands: [
      'adb shell dumpsys battery',
      'fastboot getvar all',
      'fastboot --disable-verity --disable-verification flash vbmeta vbmeta.img',
    ],
  },
  {
    id: 'oss-openboardview',
    name: 'OpenBoardView (Multi-Format PCB BoardView Viewer)',
    repository: 'OpenBoardView/OpenBoardView',
    license: 'MIT',
    category: 'SCHEMATIC_PCB',
    supportedChipsetsOrFormats: ['.brd', '.bv', '.fz', '.asc', '.cad', '.cst'],
    usbTargets: ['Offline Interactive Net & Pin Tracing'],
    summaryAr: 'العارض القياسي مفتوح المصدر لخرائط البوردات (Bitmap / BoardView) الذي يربط الأرجل المتصلة على نفس المسار (Net Highlighting).',
    summaryEn: 'Industry-standard open-source BoardView renderer for tracing connected pads, nets, and testpoints across multi-layer PCBs.',
    sampleCommands: [
      'openboardview logicboard_820_02564.brd',
    ],
  },
  {
    id: 'oss-kicad',
    name: 'KiCad EDA (Open-Source Schematic & PCB Layout Suite)',
    repository: 'KiCad/kicad-source-mirror',
    license: 'GPL-3.0',
    category: 'SCHEMATIC_PCB',
    supportedChipsetsOrFormats: ['.kicad_sch', '.kicad_pcb', '.kicad_pro', 'Gerber RS-274X', 'BOM CSV'],
    usbTargets: ['Schematic Netlist & Design Rules'],
    summaryAr: 'بيئة تصميم وقراءة الدوائر الإلكترونية والمخططات مفتوحة المصدر مع مطابقة جدول القطع BOM ومخططات التغذية والطبقات النحاسية.',
    summaryEn: 'Full open-source EDA platform for inspecting electronic schematics, hierarchical power sheets, and copper stackups.',
    sampleCommands: [
      'kicad-cli sch export netlist mainboard.kicad_sch',
    ],
  },
  {
    id: 'oss-sigrok-pulseview',
    name: 'sigrok / PulseView (Protocol Logic Analyzer)',
    repository: 'sigrokproject/pulseview',
    license: 'GPL-3.0',
    category: 'LOGIC_FORENSICS',
    supportedChipsetsOrFormats: ['I2C', 'SPI', 'UART', 'I2S', 'MIPI RFFE', 'USB PD CC', 'SWD/JTAG'],
    usbTargets: ['USB Logic Analyzers (FX2LP / Saleae-compatible)'],
    summaryAr: 'محلل منطقي مفتوح المصدر لفك تشفير حزم الاتصال على البوردة مثل I2C الشاشة/الشحن و MIPI RFFE الشبكة للتفريق بين عطل الآيسي وعطل المعالج.',
    summaryEn: 'Open-source logic analyzer decoding live board-level I2C, SPI, I2S audio, USB-PD CC, and MIPI RFFE bus traffic.',
    sampleCommands: [
      'sigrok-cli -d fx2lafw --channels D0=SCL,D1=SDA -P i2c -c samplerate=24MHz --samples 2M',
    ],
  },
  {
    id: 'oss-payload-dumper',
    name: 'payload-dumper-go (A/B OTA Partition Slicer)',
    repository: 'ssut/payload-dumper-go',
    license: 'Apache-2.0',
    category: 'FIRMWARE_UNPACK',
    supportedChipsetsOrFormats: ['payload.bin', 'Android A/B OTA .zip', 'boot.img', 'init_boot.img', 'modem.img'],
    usbTargets: ['Firmware Extraction & Magisk/KernelSU Patching'],
    summaryAr: 'مستخرج سريع لملفات OTA الحديثة (Pixel, Xiaomi, OnePlus, Nothing) لفصل ملفات البوت والمودم بدون فك حزم ضخمة يدوياً.',
    summaryEn: 'Fast A/B OTA payload.bin unpacker extracting boot, init_boot, vbmeta, and modem images for recovery or root patching.',
    sampleCommands: [
      'payload-dumper-go -partitions boot,init_boot,vbmeta,modem payload.bin',
    ],
  },
  {
    id: 'oss-oppo-decrypt',
    name: 'oppo_decrypt (OFP & OPS Encrypted Firmware Unpacker)',
    repository: 'bkerler/oppo_decrypt',
    license: 'MIT',
    category: 'FIRMWARE_UNPACK',
    supportedChipsetsOrFormats: ['.ofp (OPPO/Realme)', '.ops (OnePlus)', 'scatter/rawprogram XML'],
    usbTargets: ['Qualcomm EDL & MediaTek BROM Firmware Prep'],
    summaryAr: 'أداة فك تشفير فلاشات أوبو وريلمي وون بلس (.ofp / .ops) لتحويلها إلى صور rawprogram/scatter جاهزة للتفليش.',
    summaryEn: 'Open-source decryptor extracting raw Qualcomm/MTK images and XML tables from encrypted .ofp and .ops packages.',
    sampleCommands: [
      'python ofp_qc_decrypt.py firmware.ofp output_dir/',
      'python opscrypto.py decrypt firmware.ops',
    ],
  },
];

export const PHONE_CIRCUIT_SUBSYSTEMS: PhoneCircuitSubsystem[] = [
  {
    id: 'CIRC_PRIMARY_PWR',
    category: 'POWER',
    nameAr: 'دائرة التغذية الرئيسية للبوردة (VBAT → VDD_MAIN / VPH_PWR / VSYS)',
    nameEn: 'Primary System Power Bus (VBAT → VDD_MAIN / VPH_PWR / VSYS)',
    primaryNets: ['PP_BATT_VCC', 'PP_VDD_MAIN', 'VPH_PWR', 'VSYS', 'BAT_NTC / THERM'],
    referenceIcs: ['Charger/IF-PMIC (SM5714, S2MU106, PMI632, MT6360)', 'Hydra / SN2611A0 (Apple)'],
    operatingVoltages: '3.70V – 4.45V DC (Always present with battery/charger attached)',
    diodeRange: '0.330V – 0.430V (VPH_PWR) | 0.360V – 0.450V (VBAT)',
    keyPassiveComponents: ['10µF–22µF MLCC Filter Caps (0402/0603)', 'Current Sense Resistor R010 (10mΩ)', 'Battery NTC Pull-up (10kΩ/100kΩ)'],
    failureSymptomsAr: 'شورت صريح قبل الضغط على زر الباور (No Power Dead Short 500mA–2A) أو تسريب بطارية مستمر وهي مغلقة.',
    failureSymptomsEn: 'Pre-boot dead short when connecting DC PSU (500mA–2A before power key) or severe overnight standby drain.',
    diagnosticProcedureAr: [
      'افصل البطارية وقس ممانعة الدايود على VBAT و VDD_MAIN قبل توصيل الشاحن.',
      'إذا كانت القراءة أقل من 0.050V احقن 1.0V محدودة بـ 2A عبر خط VDD_MAIN وراقب السخونة بالكاميرا الحرارية أو الراتنج.',
      'افحص دائماً مكثفات البوردة المحيطة بمضخمات الشبكة PA وآيسي الإضاءة لأنها متصلة مباشرة بخط VDD_MAIN.',
    ],
    diagnosticProcedureEn: [
      'Disconnect battery and measure diode mode impedance on VBAT and VDD_MAIN.',
      'If < 0.050V, inject current-limited 1.0V (max 2A) into VDD_MAIN and locate heating MLCC cap with thermal/rosin.',
      'Inspect RF Power Amplifiers and Display Bias/Backlight capacitors connected directly to VDD_MAIN.',
    ],
  },
  {
    id: 'CIRC_USB_PD_CHG',
    category: 'CHARGING',
    nameAr: 'دائرة الشحن السريع وحماية الفولت الزائد (USB-C PD / OVP / Charge Pump)',
    nameEn: 'USB-C Power Delivery, OVP Switch & Dual-Cell Charge Pump',
    primaryNets: ['VBUS_5V_20V', 'USB_CC1 / USB_CC2', 'USB_DP / USB_DM', 'CHG_SW', 'PMID'],
    referenceIcs: ['OVP (ET9553L, FPF2496, S2DOS)', 'IF-PMIC (MAX77705, S2MU106, SMB1398)', 'USB-C PD Controller (ACE3/CD3217)'],
    operatingVoltages: '5.0V Standard / 9V–20V USB-PD PPS / VCHG 8.4V Dual-Cell',
    diodeRange: '0.450V – 0.650V (USB_DP/DM & CC1/CC2) | 0.460V – 0.620V (VBUS)',
    keyPassiveComponents: ['TVS ESD Protection Diode on VBUS (5.5V/24V)', '5.1kΩ CC Pull-Down Resistors', '1µH–2.2µH Buck-Boost Switching Inductor'],
    failureSymptomsAr: 'علامة رطوبة مزيفة على USB، شحن بطيء 400mA، الشحن من جهة واحدة للكابل، أو عدم قراءة الحاسوب للهاتف.',
    failureSymptomsEn: 'False moisture alert, slow 400mA charging, one-sided Type-C cable recognition, or USB enumeration failure.',
    diagnosticProcedureAr: [
      'قس ممانعة CC1 و CC2 و DP و DM على سوكيت الشحن: اختلاف القيم بين D+ و D- يكشف تلف المسار أو آيسي الشحن/TVS.',
      'تحقق من دخول 5V قبل آيسي الحماية OVP وخروج 5V بعده (يمكن فحص مسار OVP مؤقتاً للتأكد فقط ثم تركيبه).',
      'في حال الشحن الوهمي افحص خط PMID ومسار التغذية من Sub-board FPC وفلاتة الربط.',
    ],
    diagnosticProcedureEn: [
      'Measure CC1/CC2 and DP/DM diode readings on USB port; asymmetry reveals damaged ESD diode or charger IC.',
      'Verify 5V input and output across OVP IC; replace shorted OVP rather than leaving unprotected.',
      'For fake charging, verify current sense resistor, PMID bootstrap cap, and main-to-sub FPC pins.',
    ],
  },
  {
    id: 'CIRC_PMIC_BUCK_LDO',
    category: 'POWER',
    nameAr: 'دائرة معالج الطاقة الرئيسي PMIC (مصفوفة Buck و LDO وخطوط الإقلاع)',
    nameEn: 'Main PMIC Buck Converters, LDO Matrix & Power-On Sequence',
    primaryNets: ['VDD_CPU_BIG/LIT', 'VDD_GPU', 'VDD_MODEM', 'VDDQ_LPDDR', 'VIO_1V8', 'XO_26MHz/38.4MHz', 'PS_HOLD / RESET_N'],
    referenceIcs: ['Qualcomm PM8550/PM8150', 'MediaTek MT6357/MT6358W/MT6363', 'Samsung S2MPS24', 'Apple 338S00843'],
    operatingVoltages: '0.65V–1.05V (CPU/GPU Buck) | 1.12V (DRAM) | 1.80V (VIO) | 2.85V/3.0V (LDO)',
    diodeRange: '0.025V – 0.140V (CPU/GPU Low-Impedance Buck Coils) | 0.280V – 0.450V (LDO 1.8V)',
    keyPassiveComponents: ['Shielded Ferrite Buck Inductors (0.24µH–1.0µH)', 'Quartz Crystal Oscillator (26MHz/38.4MHz/32.768kHz)', 'Hold-up Capacitors'],
    failureSymptomsAr: 'سحب أمبير ثابت 40mA–90mA ويهبط للصفر عند ترك زر الباور، أو تعليق 110mA–160mA بدون عرض.',
    failureSymptomsEn: 'Supply draws 40–90mA then drops to 0mA on release, or hangs at 110–160mA with no display.',
    diagnosticProcedureAr: [
      'افحص الممانعة حول جميع ملفات البك المحيطة بالـ PMIC (تذكر أن ممانعة أنوية CPU منخفضة طبيعياً ~0.03V–0.08V، فلا تظنها شورتاً قبل القياس بالأوم).',
      'تأكد من خروج جهد 1.8V على ملفات/مكثفات VIO ووجود نبضة الكريستالة (19.2MHz/26MHz/38.4MHz) بالأوسيلوسكوب.',
      'راقب إشارة PS_HOLD من المعالج: انقطاعها بعد 300ms يعني فشل المعالج في القراءة من الذاكرة UFS/RAM.',
    ],
    diagnosticProcedureEn: [
      'Check resistance/diode across PMIC Buck coils (note CPU cores naturally show low diode ~0.03–0.08V; verify ohmic spec).',
      'Confirm 1.8V VIO rail and 26MHz/38.4MHz/19.2MHz clock oscillation via oscilloscope.',
      'Check PS_HOLD assert signal: drop after ~300ms points to LPDDR/UFS handshake failure.',
    ],
  },
  {
    id: 'CIRC_AMOLED_BIAS',
    category: 'DISPLAY',
    nameAr: 'دائرة تغذية شاشات OLED / LTPO AMOLED ومسارات العرض MIPI-DSI',
    nameEn: 'AMOLED / LTPO OLED Power Bias & MIPI-DSI Display Interface',
    primaryNets: ['ELVDD (+4.6V)', 'ELVSS (-4.4V to -2.2V)', 'AVDD (+7.3V)', 'VDDIO_1V8', 'MIPI_DSI_CLK/DATA0-3', 'TE_SYNC'],
    referenceIcs: ['TI TPS65657B0', 'Samsung S2DOS05 / S2DOS07', 'Apple U5600 Display PMIC'],
    operatingVoltages: '+4.60V (ELVDD), -4.40V (ELVSS), +7.30V (AVDD), +1.80V (VDDIO)',
    diodeRange: '0.380V – 0.560V (Bias Rails) | 0.420V – 0.560V Symmetric (MIPI EMI Pairs)',
    keyPassiveComponents: ['4-Lane Common-Mode EMI Choke Filters', '4.7µH Boost-Inverting Inductor', '10µF 16V Output Capacitors'],
    failureSymptomsAr: 'شاشة سوداء بالكامل مع عمل الصوت والاهتزاز والكمبيوتر، أو خطوط خضراء وتقطع في اللمس.',
    failureSymptomsEn: 'Completely black OLED display with working sound/vibration/USB, or flickering green lines.',
    diagnosticProcedureAr: [
      'قس ممانعة أرجل كونكتر الشاشة: أي قيمة OL في خطوط MIPI DSI تشير غالباً لتلف فلتر EMI تسلسلي أو فصل لحام الكونكتر.',
      'افحص ظهور جهد +4.6V و -4.4V عند الضغط على الباور أثناء تركيب الشاشة السليمة (لاحظ أن بعض الشاشات لا تفعل الجهد بدون ID الشاشة).',
      'استبدل مكثفات خط AVDD (+7.3V) أو آيسي S2DOS05 في حال وجود تسريب.',
    ],
    diagnosticProcedureEn: [
      'Measure MIPI DSI pads on FPC connector; OL usually indicates open dual EMI filter choke.',
      'Check +4.6V ELVDD and -4.4V ELVSS startup with a known-good OLED panel attached (display ID handshake required).',
      'Inspect AVDD +7.3V filter capacitors or replace Display Bias IC if shorted.',
    ],
  },
  {
    id: 'CIRC_LCD_BACKLIGHT',
    category: 'DISPLAY',
    nameAr: 'دائرة رفع الإضاءة الخلفية لشاشات LCD/IPS (Backlight Boost Driver)',
    nameEn: 'IPS/LCD High-Voltage Boost Backlight Circuit (19V–26V)',
    primaryNets: ['LCM_BL_ANODE (LEDA)', 'LCM_BL_CAT1 (LEDK1)', 'LCM_BL_CAT2 (LEDK2)', 'BL_PWM / CABC', 'BL_EN (1.8V)'],
    referenceIcs: ['TI LM3697 / LM3632', 'Awinic AW9962DNR', 'Qualcomm PMI632 / PM8150L'],
    operatingVoltages: '+18V to +26V DC (Boosted Anode under load)',
    diodeRange: '0.450V – 0.650V (Anode) | 0.480V – 0.680V (Cathode) — Caution: never probe live >20V in diode mode',
    keyPassiveComponents: ['Boost Inductor 10µH (Saturation >1.5A)', 'Schottky Barrier Diode (40V/1A)', 'Backlight Fuse (Zero-Ohm)', 'Output Cap 1µF/35V'],
    failureSymptomsAr: 'صورة باهتة جداً تظهر فقط عند تسليط كشاف على الشاشة (No Backlight)، أو إضاءة تشتعل نصف ثانيه وتنطفئ.',
    failureSymptomsEn: 'Faint image visible only under flashlight, or backlight flashes briefly on boot and turns off.',
    diagnosticProcedureAr: [
      'افصل البطارية دائماً قبل فك/تركيب فلاتة LCD لأن توصيل الشاشة مع وجود شحنة يضرب فيوز الإضاءة أو الدايود فوراً.',
      'افحص الفيوز، ثم ملف البوست (10µH)، ثم الدايود الشوتكي (يجب أن يعطي 0.15V–0.25V بالاتجاه الأمامي و OL بالعكسي).',
      'إذا بقيت الفولتية على الأنود 3.8V فقط (مثل البطارية) ولم ترتفع لـ 20V فالعطل من آيسي الإضاءة أو الدايود أو إشارة BL_EN.',
    ],
    diagnosticProcedureEn: [
      'Always disconnect battery before unplugging LCD flex to avoid blowing backlight fuse or Schottky diode.',
      'Test Backlight Fuse continuity, 10µH inductor, and unidirectional Schottky diode.',
      'If Anode stays at 3.8V instead of boosting to ~20V, check BL_EN, PWM, or replace boost IC & coil.',
    ],
  },
  {
    id: 'CIRC_RF_BASEBAND',
    category: 'RF_BASEBAND',
    nameAr: 'دائرة الشبكة والبيس باند ومضخمات التردد العالي (RF Transceiver & PA)',
    nameEn: 'Cellular Baseband Modem, RFFE Bus, RF Transceiver & Power Amplifiers',
    primaryNets: ['MIPI_RFFE_CLK/DATA', 'VREG_LDO_1V0_RF', 'VREG_LDO_1V8_RF', 'VPA_APT (0.8V–3.4V)', 'BB_CLK_19.2MHz', 'RF_ANT_50Ω'],
    referenceIcs: ['Qualcomm SDR735 / SDR875 / WTR2965', 'MediaTek MT6190 / MT6177', 'Skyworks / Qorvo APT & FEMID PA'],
    operatingVoltages: '1.0V / 1.2V / 1.8V (Transceiver) | 0.8V–3.4V Adaptive (PA) | 3.85V (Main PA VDD)',
    diodeRange: '0.320V – 0.480V (RF LDOs) | 0.400V – 0.560V (MIPI RFFE Bus)',
    keyPassiveComponents: ['RF Coupler & Antenna Switch', 'Coaxial Sub-Board Cable (50Ω)', 'SAW/BAW Bandpass Filters', 'Zero-Ohm Antenna Feed Inductors'],
    failureSymptomsAr: 'لا توجد خدمة (No Service)، اختفاء إصدار البيس باند Baseband Unknown، أو إشارة وهمية/ضعيفة جداً.',
    failureSymptomsEn: 'No Service / Searching continuously, Baseband Unknown, Null IMEI, or instant call drops.',
    diagnosticProcedureAr: [
      'اطلب *#06# أولاً: إذا لم يظهر IMEI أو اختفى Baseband فالمشكلة بين المعالج/الـ PMIC وآيسي الترددات SDR/WTR أو قسم EFS.',
      'إذا ظهر IMEI سليم والهاتف يبحث عن شبكة: افحص كيبل الهوائي المحوري، التوصيلات النحاسية للغطاء، ومسار MIPI RFFE بين المعالج والـ PA.',
      'افحص عدم وجود قصر في مكثفات مضخمات الإشارة PA لأنها متصلة مباشرة بخط VPH_PWR.',
    ],
    diagnosticProcedureEn: [
      'Dial *#06# first: missing IMEI/Baseband isolates fault to Transceiver (SDR/WTR), PMIC RF LDO, or EFS partition.',
      'If IMEI is valid but stuck searching: test 50Ω coax cable, antenna spring contacts, and RFFE clock/data lines to PA.',
      'Inspect RF PA bypass caps on VPH_PWR/VDD_MAIN for hairline cracks or leakage.',
    ],
  },
  {
    id: 'CIRC_MEMORY_UFS_EMMC',
    category: 'MEMORY',
    nameAr: 'دائرة الذاكرة الداخلية UFS 3.1/4.0 و eMMC 5.1 ومسارات الـ ISP',
    nameEn: 'Non-Volatile Storage Bus (UFS M-PHY / eMMC CLK-CMD-DAT0 & RPMB)',
    primaryNets: ['UFS_VCC (2.5V–2.95V)', 'UFS_VCCQ2 (1.2V/1.8V)', 'UFS_REF_CLK', 'UFS_TX/RX_P/N', 'EMMC_CLK / CMD / DAT0'],
    referenceIcs: ['Samsung KLUDG/KLUEG UFS 3.1/4.0', 'SK Hynix H9HQ/HN8T', 'Micron / Kioxia NAND Flash'],
    operatingVoltages: 'VCC 2.50V / 2.95V (NAND Core) | VCCQ 1.20V / 1.80V (Controller I/O)',
    diodeRange: '0.350V – 0.480V (VCC/VCCQ) | 0.400V – 0.550V Symmetric (CLK / CMD / DAT0 / M-PHY)',
    keyPassiveComponents: ['22µF & 100nF Decoupling Caps beside BGA 153/254', '0Ω/22Ω Series Resistors on CLK/CMD (ISP Target Pads)'],
    failureSymptomsAr: 'الهاتف يدخل تلقائياً وضع EDL 9008 / BROM بدون شاشة، أو يعلق على الشعار مع خطأ RPMB أو تلف قطاعات الذاكرة.',
    failureSymptomsEn: 'Auto-boots straight into EDL 9008 / BROM 0x0003, hangs on boot logo, or reports SMART EOL >90% wear.',
    diagnosticProcedureAr: [
      'عند توصيل الجهاز بالحاسوب وسحب ~90mA–135mA ثابت وظهور منفذ 9008 تلقائياً، افحص جهود تغذية الذاكرة VCC 2.5V و VCCQ 1.2V.',
      'على ذواكر eMMC/ISP قس ممانعة خطوط CLK و CMD و DAT0 (قراءة OL على DAT0 تعني كسر لحام تحت BGA يتطلب Reballing).',
      'تذكر قبل استبدال ذاكرة UFS/eMMC فحص ارتباط مفتاح RPMB بالمعالج (كوالكوم/ميديا تك/آبل مقترنة).',
    ],
    diagnosticProcedureEn: [
      'Auto-EDL 9008 at ~90–135mA indicates either corrupted bootloader or dead UFS; confirm VCC (2.5V/2.95V) & VCCQ (1.2V) first.',
      'For eMMC/ISP, verify diode drops across CLK/CMD/DAT0; open DAT0 confirms cracked solder ball beneath BGA153/254.',
      'Verify RPMB key pairing rules for the target SoC before replacing storage IC.',
    ],
  },
  {
    id: 'CIRC_AUDIO_SMARTPA',
    category: 'AUDIO',
    nameAr: 'دائرة الصوت والمايكروفونات ومضخم السماعة الذكي (Codec & Smart PA)',
    nameEn: 'Audio Codec, PDM Dual-Mic Array & Boosted Class-D Smart PA',
    primaryNets: ['I2S_BCLK / LRCLK / DIN / DOUT', 'SPK_OUT_P / N', 'MIC_BIAS_1V8', 'EARPIECE_P/N', 'VBST_SPK (8.5V)'],
    referenceIcs: ['Qualcomm WCD9380/WCD9385', 'Awinic AW88264 / AW87390', 'Cirrus Logic CS35L41 (338S00537)'],
    operatingVoltages: '1.80V (Digital I/O) | 3.85V Input → 8.5V–10V (Class-D Boosted Speaker Rail)',
    diodeRange: '0.410V – 0.540V (SPK Output Pads Balanced) | 0.440V – 0.580V (I2S / Mic)',
    keyPassiveComponents: ['Matched LC Filter Coils on SPK_P/N (Ferrite Beads)', 'ESD Varistors beside Speaker Contacts'],
    failureSymptomsAr: 'اختفاء الجرس رغم سلامة السماعة، تعليق مسجل الصوت أو إعادة تشغيل عند بدء المكالمة (Audio Codec Cold Joint).',
    failureSymptomsEn: 'No loudspeaker audio with known-good speaker, frozen Voice Memos, or call-start reboot loop.',
    diagnosticProcedureAr: [
      'قس ممانعة طرفي تلامس الجرس SPK_P و SPK_N: يجب أن تكون القيمتان متماثلتين تماماً (اختلاف أو OL يكشف قطع في ملف الفلترة التسلسلي).',
      'في حالة تجميد مسجل الصوت أو رمادية أيقونة السبيكر (iPhone Loop Disease): شبلن آيسي الكوديك مع ترميم الأرجل المقطوعة أسفله.',
    ],
    diagnosticProcedureEn: [
      'Measure SPK_P and SPK_N contact pads; both must have symmetrical diode drops (OL points to blown series ferrite bead).',
      'If Voice Memos fails or speaker icon is grayed out, reball Audio Codec and run micro-jumper on broken I2S/Audio lines.',
    ],
  },
  {
    id: 'CIRC_CAMERA_MIPI_CSI',
    category: 'CAMERA',
    nameAr: 'دائرة الكاميرات والتركيز التلقائي ومانع الاهتزاز (Camera LDO & MIPI-CSI)',
    nameEn: 'Multi-Camera Power Sequencer (DVDD/AVDD/DOVDD), OIS & MIPI-CSI Lanes',
    primaryNets: ['CAM_DVDD (1.05V)', 'CAM_AVDD (2.80V)', 'CAM_DOVDD (1.80V)', 'CAM_AF_VDD (2.8V)', 'CAM_MCLK_24MHz', 'CAM_I2C_SCL/SDA'],
    referenceIcs: ['Fan53870 / WL2868C Quad Camera LDO PMIC', 'Qualcomm PMI / MT6359 Camera LDOs'],
    operatingVoltages: '1.05V (Digital Core), 1.80V (I/O), 2.80V (Analog Sensor & OIS VCM)',
    diodeRange: '0.390V – 0.530V (Analog/IO Power) | 0.430V – 0.560V (MIPI-CSI Differential Pairs)',
    keyPassiveComponents: ['Quad-Channel LDO WL2868C (Common Short Site)', 'MIPI Common-Mode Chokes', 'Decoupling Caps 2.2µF'],
    failureSymptomsAr: 'شاشة كاميرا سوداء، رسالة فشل الكاميرا Camera Failed، أو تعليق تطبيق الكاميرا بعد سقوط الجهاز.',
    failureSymptomsEn: 'Black viewfinder, "Camera Failed" popup, missing 0.5x/3x lens, or focus rattle after drop.',
    diagnosticProcedureAr: [
      'اختبر كاميرا جديدة موثوقة أولاً؛ لأن سقوط الهاتف كثيراً ما يتلف عدسة OIS الداخلية أو الكاميرا الأمامية.',
      'قس ممانعة أرجل كونكتر الكاميرا خاصة 2.8V AVDD و 1.8V DOVDD — قصر 2.8V سببه غالباً آيسي منظم الكاميرات WL2868C.',
    ],
    diagnosticProcedureEn: [
      'Rule out damaged OIS module with a known-good camera flex before soldering on board.',
      'Check 2.8V AVDD and 1.8V DOVDD on camera FPC; short on 2.8V often isolates to WL2868C multi-LDO PMIC.',
    ],
  },
  {
    id: 'CIRC_WIFI_BT_NFC',
    category: 'CONNECTIVITY',
    nameAr: 'دائرة الواي فاي والبلوتوث والـ GPS والاتصال القريب NFC',
    nameEn: 'Wi-Fi 6E/7, Bluetooth, GNSS & Secure NFC Front-End Module',
    primaryNets: ['WL_VDD_1V3/1V8/3V3', 'PCIE_WL_CLK/DATA', 'BT_UART', 'NFC_SWIO', 'WL_ANT_DIPLEXER'],
    referenceIcs: ['Qualcomm WCN7850 / WCN6856', 'MediaTek MT6639', 'Broadcom BCM4388', 'NXP SN110/SN220 NFC'],
    operatingVoltages: '1.30V / 1.80V / 3.30V (Always/Switched)',
    diodeRange: '0.350V – 0.500V (3.3V / 1.8V Supply Pads)',
    keyPassiveComponents: ['Diplexer & Ceramic 2.4/5/6GHz Antenna Filter', '38.4MHz Reference Clock Cap', 'Underfill Resin Shield'],
    failureSymptomsAr: 'الواي فاي رمادي لا يستجيب للتشغيل، نسيان الشبكات، أو استهلاك بطارية 150mA أثناء وضع الطيران.',
    failureSymptomsEn: 'Wi-Fi toggle grayed out, weak 1-bar signal right next to router, or 150mA standby leak.',
    diagnosticProcedureAr: [
      'افحص إعدادات النظام لرؤية هل عنوان MAC الخاص بالواي فاي ظاهر أم غير متاح (Unavailable).',
      'تحقق من عدم وجود قصر في تغذية 3.3V / 1.8V داخلية لآيسي Wi-Fi (كثيراً ما ينكسر لحام زوايا الآيسي أو تتأكسد مكثفات 3.3V).',
    ],
    diagnosticProcedureEn: [
      'Check Settings -> About Phone for valid Wi-Fi MAC address (unavailable indicates PCIe/bus or IC power fail).',
      'Test 3.3V and 1.8V feed caps near Wi-Fi/BT IC; corner pad cracks after drop are common on stacked PCBs.',
    ],
  },
];

export const SOC_PROCESSOR_DATABASE: SocProcessorSpec[] = [
  {
    id: 'soc-sdm-8gen3',
    vendor: 'Qualcomm',
    familyName: 'Snapdragon 8 Gen 3 / 8 Gen 2',
    socPartNumbers: ['SM8650-AB', 'SM8550-AB'],
    pairedPmics: ['PM8550', 'PM8550VE', 'PM8550VS', 'PMK8550', 'SMB1398'],
    usbBootMode: 'EDL 9008 (Sahara + Signed Firehose VIP)',
    vidPid: '05C6:9008 / 05C6:9091',
    memorySupport: 'UFS 4.0 + LPDDR5X',
    representativeDevices: ['Samsung S24 Ultra (SM-S928B)', 'Xiaomi 14 / 14 Ultra', 'OnePlus 12', 'OPPO Find X7 Ultra'],
    architectureNotesAr: 'معمارية 4nm عالية التكامل تستخدم توثيق Firehose VIP لوضع EDL 9008 ووحدة تحكم طاقة ثلاثية PM8550.',
    architectureNotesEn: '4nm flagship architecture using PM8550 multi-PMIC topology and cryptographic VIP Firehose EDL authentication.',
    commonHardwareFaultsAr: 'شورت على مكثفات MAX77705/SMB1398 في مسار الشحن 45W–120W أو فصل لحام المعالج السندويتش بعد السقوط.',
    commonHardwareFaultsEn: 'Shorted 45W–120W dual charge-pump caps or cracked LPDDR5X PoP solder pads after severe impact.',
  },
  {
    id: 'soc-sdm-mid',
    vendor: 'Qualcomm',
    familyName: 'Snapdragon 7+ Gen 2 / 860 / 685 / 695',
    socPartNumbers: ['SM7475', 'SM8150', 'SM6225', 'SM6375'],
    pairedPmics: ['PM8150', 'PM8150L', 'PM6150', 'PMI632'],
    usbBootMode: 'EDL 9008 (Testpoint Short to 1.8V/GND)',
    vidPid: '05C6:9008',
    memorySupport: 'UFS 2.2 / UFS 3.1 + LPDDR4X/5',
    representativeDevices: ['POCO F5', 'POCO X3 Pro', 'Redmi Note 12/13 (4G/5G)', 'Samsung A23/A52s'],
    architectureNotesAr: 'معالجات فئة متوسطة وعليا معروفة بسهولة فحصها وتشخيصها عبر edl/QFIL وبنقاط التيست بوينت المباشرة.',
    architectureNotesEn: 'Widely serviced Snapdragon SoCs with accessible PCB EDL 9008 testpoints and clear PMI/PM8150 buck-boost topology.',
    commonHardwareFaultsAr: 'موت مفاجئ في POCO X3 Pro بسبب إجهاد لحام CPU/RAM الخالي من الرصاص (يحل بالـ Reballing المحترف) أو تلف PMI632 للشحن.',
    commonHardwareFaultsEn: 'PoP CPU/RAM cold solder joints on heavily thermally stressed boards (POCO X3 Pro) and PMI632 no-charge faults.',
  },
  {
    id: 'soc-mtk-dimensity',
    vendor: 'MediaTek',
    familyName: 'Dimensity 9300 / 8200 / 7200 / 1080',
    socPartNumbers: ['MT6989', 'MT6896', 'MT6886', 'MT6877V'],
    pairedPmics: ['MT6363', 'MT6373', 'MT6368', 'MT6360'],
    usbBootMode: 'MTK BROM (0x0003) / Preloader VCOM (0x2000)',
    vidPid: '0E8D:0003 / 0E8D:2000',
    memorySupport: 'UFS 3.1 / UFS 4.0 + LPDDR5',
    representativeDevices: ['OPPO Reno 11/12', 'Vivo X100', 'Redmi Note 13 Pro+ 5G', 'Realme GT Neo / 11 Pro'],
    architectureNotesAr: 'تعتمد منظومة PMIC رقمية عبر ناقل SPMI وتتطلب في الموديلات الأحدث تخطي حماية V6 SLA أو استخدام Preloader معدل.',
    architectureNotesEn: 'Uses SPMI multi-PMIC link (MT6363/MT6373); newer Dimensity models employ V6 BROM restrictions requiring preloader exploits.',
    commonHardwareFaultsAr: 'شورت على خط VPROC/VSYS في MT6363 أو فقدان NVRAM/IMEI بعد تفليش خاطئ بدون أخذ نسخة NVRAM احتياطية.',
    commonHardwareFaultsEn: 'VPROC buck coil shorts on MT6363/68 or NVRAM corruption causing Null IMEI after mismatched scatter flash.',
  },
  {
    id: 'soc-mtk-helio',
    vendor: 'MediaTek',
    familyName: 'Helio G99 / G88 / G85 / G80',
    socPartNumbers: ['MT6789', 'MT6769H', 'MT6768'],
    pairedPmics: ['MT6358W', 'MT6357CRV', 'MT6366W', 'SGM41511'],
    usbBootMode: 'BROM Open Exploit (mtkclient / Kamakiri)',
    vidPid: '0E8D:0003 / 0E8D:2000',
    memorySupport: 'eMMC 5.1 / UFS 2.2 + LPDDR4X',
    representativeDevices: ['Samsung Galaxy A24 / A32 / A15', 'Infinix Note 40 Pro', 'Tecno Camon 30', 'Redmi Note 13 4G'],
    architectureNotesAr: 'أكثر معالجات الفئة المتوسطة انتشاراً في العالم؛ يدعم بالكامل القراءة والكتابة عبر BROM المفتوح المصدر mtkclient.',
    architectureNotesEn: 'Ubiquitous 4G workhorse SoC fully supported by open-source mtkclient BROM/Preloader exploits and ISP testpoints.',
    commonHardwareFaultsAr: 'تلف ملف الإقلاع Preloader أو توقف عن الشحن بسبب آيسي OVP ET9553L، أو فقدان Baseband في Galaxy A24 (Item 550 RIL crash).',
    commonHardwareFaultsEn: 'Preloader wipe during bad flash, blown ET9553L OVP IC, or Galaxy A24/A15 Baseband RIL NVRAM corruption.',
  },
  {
    id: 'soc-apple-silicon',
    vendor: 'Apple',
    familyName: 'Apple A17 Pro / A16 Bionic / A15 Bionic',
    socPartNumbers: ['T8130 (A17 Pro)', 'T8120 (A16)', 'T8110 (A15)'],
    pairedPmics: ['338S00946', '338S00843', 'SN2611A0 / ACE3 USB-C PD'],
    usbBootMode: 'DFU (0x1227) & Recovery (0x1281)',
    vidPid: '05AC:1227 / 05AC:1281',
    memorySupport: 'PCIe NVMe NAND (Encrypted per-UID / SysCfg paired)',
    representativeDevices: ['iPhone 15 Pro Max', 'iPhone 14 Pro / Pro Max', 'iPhone 13 Pro / 13'],
    architectureNotesAr: 'بوردة مزدوجة الطبقات (Sandwich Interposer) مع ربط تشفيري للبطارية BMS والشاشة TrueTone و LiDAR و Baseband.',
    architectureNotesEn: 'Dual-layer interposer logic board architecture featuring cryptographic component pairing (BMS, OLED TrueTone, Baseband).',
    commonHardwareFaultsAr: 'فصل نقاط التلامس الوسطية بين الطبقتين بعد السقوط (لا شبكة / لا واي فاي)، أو قصر على مكثفات PP_VDD_MAIN أو ذبذبة إعادة التشغيل كل 180 ثانية (Panic Full).',
    commonHardwareFaultsEn: 'Mid-layer interposer pad separation (No Service/Wi-Fi), PP_VDD_MAIN MLCC shorts, or 3-minute thermal I2C sensor panic.',
  },
  {
    id: 'soc-samsung-exynos',
    vendor: 'Samsung Exynos',
    familyName: 'Exynos 2400 / 1480 / 1380 / 1280',
    socPartNumbers: ['S5E9945', 'S5E8845', 'S5E8835', 'S5E8825'],
    pairedPmics: ['S2MPS24', 'S2MPS26', 'S2MU106', 'S2DOS05'],
    usbBootMode: 'Samsung Loke/ODIN Download Mode + Exynos EUB BootROM',
    vidPid: '04E8:685D / 04E8:1234',
    memorySupport: 'UFS 3.1 / UFS 4.0 + LPDDR5',
    representativeDevices: ['Samsung Galaxy A54 5G', 'Galaxy A55 5G', 'Galaxy S24/S24+ (Exynos)', 'Galaxy A33/A53'],
    architectureNotesAr: 'يدعم وضع التحميل السريع ODIN بالإضافة لوضع الصيانة EUB الطارئ عبر نقاط التيست بوينت في البوردة.',
    architectureNotesEn: 'Supports Loke/ODIN flashing and hardware EUB emergency recovery mode triggered by Exynos board testpoints.',
    commonHardwareFaultsAr: 'رسالة الرطوبة في فلاتة الشحن (S2MU106 / شريطة الشحن)، أو فصل لحام المعالج بعد حرارة عالية، أو تلف EFS بعد تعديل خاطئ.',
    commonHardwareFaultsEn: 'Moisture warning on USB port (sub-board FPC / S2MU106), EFS certificate corruption, or OLED Bias S2DOS05 no-display.',
  },
  {
    id: 'soc-google-tensor',
    vendor: 'Google Tensor',
    familyName: 'Google Tensor G3 / G4',
    socPartNumbers: ['GS301', 'GS401'],
    pairedPmics: ['S2MPG14', 'S2MPG15', 'MAX77759', 'Titan M2 (GSC)'],
    usbBootMode: 'Fastboot / FastbootD Dynamic + Rescue OTA Sideload',
    vidPid: '18D1:4EE0 / 18D1:D00D',
    memorySupport: 'UFS 3.1 + LPDDR5X',
    representativeDevices: ['Google Pixel 8 / 8 Pro', 'Google Pixel 9 / 9 Pro'],
    architectureNotesAr: 'معالج مبني بتعاون Samsung LSI مع شريحة أمان مستقلة Titan M2 تتحكم في مفاتيح الفك والحماية ومؤشر AVB.',
    architectureNotesEn: 'Samsung-LSI co-designed SoC paired with Titan M2 discrete security chip handling Verified Boot and Anti-Rollback.',
    commonHardwareFaultsAr: 'تعليق Bootloop بعد فشل تحديث OTA (يعالج غالباً عبر Fastboot Slot Switch أو Rescue Sideload) أو تلف منفذ الشحن MAX77759.',
    commonHardwareFaultsEn: 'A/B slot bootloops following failed OTA (recoverable via slot switching / sideload) and MAX77759 USB-PD charging failures.',
  },
  {
    id: 'soc-huawei-kirin',
    vendor: 'Huawei Kirin',
    familyName: 'HiSilicon Kirin 9000S / 990 / 980 / 710',
    socPartNumbers: ['Hi36A0', 'Hi3690', 'Hi3680', 'Hi6260'],
    pairedPmics: ['Hi6421V700 / Hi6421V800', 'Hi6526 40W–66W Charger', 'Hi6363 RF'],
    usbBootMode: 'Huawei USB COM 1.0 Hardware Testpoint',
    vidPid: '12D1:3609',
    memorySupport: 'UFS 2.1 / 3.0 / 3.1 + LPDDR4X/5',
    representativeDevices: ['Huawei P30 Pro', 'Mate 30 / 40 Pro', 'Pura 70 / Mate 60 Series', 'Honor 9X / P30 Lite'],
    architectureNotesAr: 'يتطلب فحصاً وإحياءً عبر قصر نقطة USB COM 1.0 مع الأرضي وتمرير ملف Board Software لفك قفل النظام أو استعادة التبويت.',
    architectureNotesEn: 'Requires grounding TP_USB_COM1 to trigger VID:12D1 PID:3609 for IDT Board Software / Fastboot bootloader staging.',
    commonHardwareFaultsAr: 'فقدان الشبكة والواي فاي بسبب Hi6363/Hi1103 أو شورت في دائرة الشحن السريع Hi6526 (SuperCharge 40W–66W).',
    commonHardwareFaultsEn: 'SuperCharge Hi6526 VBUS input shorts or Hi6363 RF transceiver cold solder joints causing No Service.',
  },
  {
    id: 'soc-unisoc-tiger',
    vendor: 'Unisoc',
    familyName: 'Unisoc Tiger T616 / T612 / T606 / T760',
    socPartNumbers: ['UMS9230', 'UMS9230H', 'UMS9620'],
    pairedPmics: ['SC2730G', 'SC2731', 'SGM41511'],
    usbBootMode: 'SPRD U2S Diag / FDL1 & FDL2 Download',
    vidPid: '1782:4D00',
    memorySupport: 'eMMC 5.1 / UFS 2.2',
    representativeDevices: ['Realme C53 / C55 / Note 50', 'Samsung Galaxy A03 (T606)', 'Tecno Spark Go / Motorola Moto G14'],
    architectureNotesAr: 'يدعم التفليش الكامل بملفات .pac المفتوحة والمدعومة بأداة spd_dump لحذف قفل FRP وتصليح البوت والـ NV.',
    architectureNotesEn: 'Fully serviceable over SPRD U2S Diag via open-source spd_dump with FDL1/FDL2 stages for .pac firmware & persist/FRP.',
    commonHardwareFaultsAr: 'توقف الشاشة والإضاءة الخلفية 19.5V بسبب تسريب أو فتح مسار، أو موت مفاجئ بعد تحديث هوائي (يُحيا عبر FDL1/FDL2).',
    commonHardwareFaultsEn: 'LCD 19.5V boost diode/coil open lines and soft-bricked partitions easily revived via FDL1/FDL2 + PAC restore.',
  },
];
