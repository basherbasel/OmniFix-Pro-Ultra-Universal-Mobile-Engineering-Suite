/**
 * Comprehensive Real-World Smartphone Hardware, Pinout, IC & Software Servicing Atlas.
 * Covers Apple, Samsung, Xiaomi/Redmi/POCO, Realme/Oppo, Huawei/Honor, and Infinix/Nokia.
 */

export interface UsbHardwareSignature {
  vid: string;
  pid: string;
  chipset: string;
  mode: string;
  description: string;
  descriptionEn: string;
  recommended_tools: string[];
  risk_level: 'low' | 'medium' | 'high';
}

export interface DiodeReferenceRail {
  rail_code: string;
  name_ar: string;
  name_en: string;
  min_v: number;
  max_v: number;
  short_threshold: number;
  short_suspects: string;
  open_suspects: string;
}

export interface ConnectorPinout {
  connector: string;
  pin: string;
  net: string;
  diode_v: number;
  voltage_v: number;
  notes: string;
}

export interface AtlasTestPoint {
  name: string;
  method: string;
}

export interface DeviceAtlasEntry {
  id: string;
  brand: string;
  model: string;
  board_arch: string;
  schematic_id: string;
  soc: string;
  storage: string;
  ics: Record<string, string>;
  connector_pinouts: ConnectorPinout[];
  testpoints: AtlasTestPoint[];
  software_commands: string[];
}

export interface IcFaultEntry {
  ic_part: string;
  manufacturer: string;
  function: string;
  devices: string;
  symptoms: string;
  diagnostic_steps: string[];
}

export interface UsbIdentificationResult {
  matched: boolean;
  vid: string;
  pid: string;
  chipset: string;
  mode: string;
  description: string;
  descriptionEn: string;
  recommended_tools: string[];
  risk_level: 'low' | 'medium' | 'high';
}

export interface DiodeEvaluationResult {
  rail_code: string;
  rail_name_ar?: string;
  rail_name_en?: string;
  measured_v: number;
  expected_range?: string;
  status: 'SHORT_CIRCUIT' | 'LEAKAGE_LOW' | 'OPEN_LINE' | 'HEALTHY' | 'NORMAL_RANGE';
  diagnosis: string;
  diagnosis_en: string;
  safety_note: string;
}

export const USB_HARDWARE_SIGNATURES: UsbHardwareSignature[] = [
  {
    vid: '0E8D',
    pid: '0003',
    chipset: 'MediaTek (MTK)',
    mode: 'BROM Mode (BootROM)',
    description: 'وضع البوت روم المباشر — المعالج يستجيب قبل تحميل البريلودر (مناسب لفك البوتلودر وإصلاح السوفت الميت)',
    descriptionEn: 'Direct BootROM endpoint before Preloader execution. Ideal for SLA/DAA bypass, unbrick & partition dump.',
    recommended_tools: ['mtkclient', 'SP Flash Tool', 'Pandora / UnlockTool'],
    risk_level: 'medium',
  },
  {
    vid: '0E8D',
    pid: '2000',
    chipset: 'MediaTek (MTK)',
    mode: 'Preloader VCOM Port',
    description: 'منفذ البريلودر النشط — الذاكرة الداخلية eMMC/UFS تستجيب مبدئياً',
    descriptionEn: 'Active Preloader VCOM interface with initialized DRAM & eMMC/UFS controller.',
    recommended_tools: ['SP Flash Tool', 'mtkclient --preloader'],
    risk_level: 'low',
  },
  {
    vid: '05C6',
    pid: '9008',
    chipset: 'Qualcomm Snapdragon',
    mode: 'EDL 9008 (Emergency Download)',
    description: 'وضع الطوارئ 9008 — يتطلب ملف Firehose Programmer (.elf/.mbn) لتفليش النظام أو إصلاح البوت',
    descriptionEn: 'Sahara/Firehose 9008 Emergency Download mode. Requires signed Firehose ELF programmer.',
    recommended_tools: ['QFIL', 'edl (bkerler)', 'UFI / EasyJTAG'],
    risk_level: 'high',
  },
  {
    vid: '05C6',
    pid: '9091',
    chipset: 'Qualcomm Snapdragon',
    mode: 'DIAG 9091 (Diagnostic Port)',
    description: 'منفذ التشخيص الهندسي — جاهز لقراءة/كتابة ملفات QCN وإصلاح الشبكة والـ Baseband',
    descriptionEn: 'Qualcomm Modem Diagnostic Serial Port for QCN backup/restore, NV item read, and IMEI calibration.',
    recommended_tools: ['QPST', 'QCN Tool', 'DFS CDMA'],
    risk_level: 'low',
  },
  {
    vid: '04E8',
    pid: '685D',
    chipset: 'Samsung Exynos / Qualcomm',
    mode: 'ODIN / Download Mode',
    description: 'وضع الداونلود الرسمي لأجهزة سامسونج — جاهز لتمرير الفلاشة الرباعية (BL/AP/CP/CSC)',
    descriptionEn: 'Samsung Loke/ODIN Download protocol ready for 4-file firmware & PIT partition table flashing.',
    recommended_tools: ['Odin3 v3.14.4', 'Heimdall', 'Chimera / Z3X'],
    risk_level: 'low',
  },
  {
    vid: '04E8',
    pid: '6860',
    chipset: 'Samsung Mobile Composite',
    mode: 'MTP + ADB + Modem Composite',
    description: 'وضع النظام الطبيعي مع منفذ مودم AT للتحقق من الحالة وإجراء الاختبارات',
    descriptionEn: 'Normal Samsung OS MTP/ADB/Modem AT composite interface.',
    recommended_tools: ['adb', 'AT Serial Console', 'Heimdall'],
    risk_level: 'low',
  },
  {
    vid: '05AC',
    pid: '1227',
    chipset: 'Apple Silicon (A-Series)',
    mode: 'DFU Mode (Device Firmware Update)',
    description: 'وضع DFU العميق — شاشة سوداء بالكامل مع استجابة المعالج عبر USB',
    descriptionEn: 'Deep BootROM DFU state. Screen remains black while USB accepts iBSS/iBEC payloads.',
    recommended_tools: ['iTunes / Finder', 'libimobiledevice (idevicerestore)', 'checkm8 / ipwndfu'],
    risk_level: 'medium',
  },
  {
    vid: '05AC',
    pid: '1281',
    chipset: 'Apple Silicon (A-Series)',
    mode: 'Recovery Mode',
    description: 'وضع الاسترداد — يظهر شعار الكابل والكمبيوتر على الشاشة',
    descriptionEn: 'iBoot Recovery Mode displaying restore screen.',
    recommended_tools: ['ideviceenterrecovery / irecovery -n', '3uTools', 'Finder'],
    risk_level: 'low',
  },
  {
    vid: '12D1',
    pid: '3609',
    chipset: 'Huawei HiSilicon Kirin',
    mode: 'Huawei USB COM 1.0 (Testpoint)',
    description: 'وضع التيست بوينت لمعالجات كيرين — يتطلب تمرير ملف Board Software',
    descriptionEn: 'HiSilicon Kirin hardware testpoint download port requiring Board Software / fastboot loader.',
    recommended_tools: ['IDT (Image Download Tool)', 'SigmaKey / Octoplus'],
    risk_level: 'high',
  },
  {
    vid: '18D1',
    pid: 'D00D',
    chipset: 'Google / Qualcomm / MTK',
    mode: 'Fastboot / Bootloader Mode',
    description: 'وضع الفاست بوت القياسي لتمرير صور النظام والريكفري وفتح البوتلودر',
    descriptionEn: 'Standard Android Fastboot / Bootloader flashing and anti-rollback variable inspection mode.',
    recommended_tools: ['fastboot', 'Minimal ADB & Fastboot', 'MiFlash'],
    risk_level: 'low',
  },
  {
    vid: '1782',
    pid: '4D00',
    chipset: 'Unisoc / Spreadtrum (SPD)',
    mode: 'SPRD U2S Diag / FDL Download Mode',
    description: 'وضع التفليش والتشخيص لمعالجات Unisoc — جاهز لتمرير ملفات FDL1/FDL2 وفلاشات PAC',
    descriptionEn: 'Unisoc/Spreadtrum FDL1/FDL2 flashing and NV diagnostic mode for .pac firmware packages.',
    recommended_tools: ['spd_dump (open-source)', 'ResearchDownload', 'Pandora'],
    risk_level: 'medium',
  },
  {
    vid: '22D9',
    pid: '2764',
    chipset: 'OPPO / Realme / OnePlus',
    mode: 'OPPO Qualcomm Diag / ADB Composite',
    description: 'منفذ التشخيص والتفليش لأجهزة أوبو وريلمي وون بلس',
    descriptionEn: 'OPPO/Realme/OnePlus Diagnostic & ADB composite endpoint.',
    recommended_tools: ['adb', 'edl (bkerler)', 'OFP Extractor'],
    risk_level: 'low',
  },
  {
    vid: '2717',
    pid: 'FF68',
    chipset: 'Xiaomi / Redmi / POCO',
    mode: 'Xiaomi ADB / Sideload Assistant',
    description: 'وضع المساعدة والتحديث لشاومي (Mi Assistant Sideload Mode)',
    descriptionEn: 'Xiaomi Recovery Mi Assistant & ADB Sideload protocol endpoint.',
    recommended_tools: ['adb sideload', 'MiAssistant Open Tool', 'fastboot'],
    risk_level: 'low',
  },
  {
    vid: '18D1',
    pid: '4EE7',
    chipset: 'Google Pixel (Tensor G1-G4)',
    mode: 'Google Pixel ADB / Pixel Repair Mode',
    description: 'منفذ ADB المعتمد لأجهزة جوجل بكسل وفحص شريحة الأمان Titan M2',
    descriptionEn: 'Google Pixel official ADB endpoint for OTA sideload and Titan M2 diagnostics.',
    recommended_tools: ['adb', 'fastboot', 'Android Flash Tool'],
    risk_level: 'low',
  },
];

export const DIODE_REFERENCE_RAILS: DiodeReferenceRail[] = [
  {
    rail_code: 'PP_VDD_MAIN / VPH_PWR',
    name_ar: 'خط التغذية الرئيسي للبوردة',
    name_en: 'Primary Main System Power Rail',
    min_v: 0.31,
    max_v: 0.48,
    short_threshold: 0.06,
    short_suspects: 'مكثفات التصفية على خط VDD_MAIN، آيسي الشحن، آيسي الباور PMIC، أو مضخم الشبكة PA',
    open_suspects: 'تلف ملف التغذية الرئيسي أو فصل في طبقات البوردة المزدوجة (Interposer)',
  },
  {
    rail_code: 'PP_BATT_VCC / VBAT',
    name_ar: 'موجب كونكتر البطارية',
    name_en: 'Battery Connector Positive Rail',
    min_v: 0.34,
    max_v: 0.52,
    short_threshold: 0.04,
    short_suspects: 'آيسي الشحن (BQ25890 / SM5714 / Tigris) أو دايود الحماية TVS',
    open_suspects: 'تلف فيوز البطارية أو مسار كونكتر البطارية',
  },
  {
    rail_code: 'USB_DP / USB_DM',
    name_ar: 'مسارات بيانات الشحن USB D+ / D-',
    name_en: 'USB 2.0 Differential Data Lines',
    min_v: 0.48,
    max_v: 0.69,
    short_threshold: 0.12,
    short_suspects: 'آيسي الشحن الوهمي / USB Controller (Tristar / Hydra / SM5714) أو المعالج مباشرة',
    open_suspects: 'تلف فلاتة الشحن السفلية أو مقاومات التوالي على خط الداتا',
  },
  {
    rail_code: 'USB_CC1 / USB_CC2',
    name_ar: 'مسارات تعريف الشحن السريع Type-C CC',
    name_en: 'USB Type-C Configuration Channel',
    min_v: 0.5,
    max_v: 0.74,
    short_threshold: 0.1,
    short_suspects: 'تلف متحكم Type-C نتيجة استخدام شاحن رديء أو تسرب 20V لخطوط الداتا',
    open_suspects: 'تلف سوكت الشحن Type-C أو فصل في الفلاتة',
  },
  {
    rail_code: 'LCM_BL_ANODE',
    name_ar: 'خط تغذية الإضاءة الخلفية (Backlight Anode)',
    name_en: 'Display Backlight Boost Anode',
    min_v: 0.52,
    max_v: 0.85,
    short_threshold: 0.08,
    short_suspects: 'دايود الإضاءة (Schottky Diode) أو مكثف الخرج بعد ملف الرفع (Boost Coil)',
    open_suspects: 'احتراق فيوز الإضاءة (Backlight Fuse) نتيجة تركيب شاشة بدون فصل البطارية',
  },
  {
    rail_code: 'MIPI_DSI_LANE',
    name_ar: 'خطوط بيانات الشاشة MIPI',
    name_en: 'Display MIPI DSI Differential Lanes',
    min_v: 0.4,
    max_v: 0.58,
    short_threshold: 0.09,
    short_suspects: 'تلف فلاتر EMI المزدوجة أو المعالج',
    open_suspects: 'كسر أو تلف في فلتر EMI المزدوج بجوار كونكتر الشاشة (شاشة سوداء مع صوت)',
  },
  {
    rail_code: 'I2C_SDA / I2C_SCL',
    name_ar: 'ناقل البيانات المشترك I2C',
    name_en: 'Inter-Integrated Circuit Bus (1.8V Pull-up)',
    min_v: 0.44,
    max_v: 0.66,
    short_threshold: 0.1,
    short_suspects: 'أحد الآيسيهات المتصلة بالناقل (آيسي الصوت، الحساسات، الشحن) يسحب الخط للأرضي',
    open_suspects: 'تلف مقاومة الرفع (Pull-up Resistor 2.2K/4.7K) المتصلة بجهد 1.8V',
  },
  {
    rail_code: 'VDD_SIM_1V8',
    name_ar: 'تغذية شريحة الاتصال SIM',
    name_en: 'SIM Card LDO Supply & Detect Rail',
    min_v: 0.46,
    max_v: 0.68,
    short_threshold: 0.09,
    short_suspects: 'مكثف تصفية بيت الشريحة أو آيسي الباور الفرعي للمودم',
    open_suspects: 'تلف ملامسات بيت الشريحة أو مقاومة حماية ESD بمسار SIM_DATA/RST',
  },
  {
    rail_code: 'I2S_AUDIO_CODEC',
    name_ar: 'خطوط صوت الكوديك ومضخم السماعة',
    name_en: 'Audio Codec I2S / Smart PA Output Lines',
    min_v: 0.43,
    max_v: 0.65,
    short_threshold: 0.08,
    short_suspects: 'مكبر الصوت الذكي (Smart PA) أو مكثفات خط السماعة/الجرس',
    open_suspects: 'فصل ملفات الفلترة التسلسلية بجوار كونكتر السماعة أو تلف لحام الكوديك',
  },
  {
    rail_code: 'CAM_AVDD_2V8',
    name_ar: 'تغذية حساسات الكاميرا الرئيسية 2.8V',
    name_en: 'Camera Sensor Analog 2.8V LDO Rail',
    min_v: 0.45,
    max_v: 0.67,
    short_threshold: 0.08,
    short_suspects: 'منظم الجهد LDO 2.8V الخارجي (VLDO) أو المكثف بجوار كونكتر الكاميرا',
    open_suspects: 'انقطاع مسار التمكين (CAM_LDO_EN) من المعالج أو تلف منظم الجهد',
  },
  {
    rail_code: 'NAND_VCC_2V6',
    name_ar: 'تغذية الذاكرة الداخلية UFS / NVMe NAND',
    name_en: 'NAND / UFS Core Flash Power Rail (VCC 2.5V–2.95V)',
    min_v: 0.36,
    max_v: 0.54,
    short_threshold: 0.05,
    short_suspects: 'مكثفات التصفية بجوار الذاكرة الداخلية أو شورت داخلي في شريحة UFS/NAND',
    open_suspects: 'فصل في خط التغذية القادم من PMIC LDO — يسبب بقاء الجهاز في 9008 / DFU',
  },
  {
    rail_code: 'TOUCH_SPI_CS',
    name_ar: 'خطوط اتصال شاشة اللمس SPI/I2C',
    name_en: 'Touch Digitizer SPI / I2C Data Rail',
    min_v: 0.46,
    max_v: 0.64,
    short_threshold: 0.09,
    short_suspects: 'آيسي اللمس التالف أو شورت في شريط فلاتة الشاشة',
    open_suspects: 'انقطاع مقاومة تسلسلية (0Ω/33Ω) على خط SPI أو تلف ممانعة 1.8V',
  },
  {
    rail_code: 'BAT_THERM_NTC',
    name_ar: 'حساس حرارة البطارية وخط SWI',
    name_en: 'Battery NTC Thermistor & SWI Fuel Gauge Rail',
    min_v: 0.49,
    max_v: 0.72,
    short_threshold: 0.1,
    short_suspects: 'دايود حماية ESD بجوار كونكتر البطارية أو آيسي الشحن',
    open_suspects: 'فصل مقاومة NTC (10kΩ/47kΩ) — يسبب توقف الشحن برسالة حرارة البطارية أو ريستارت كل 3 دقائق',
  },
];

export const DEVICE_MODELS_ATLAS: DeviceAtlasEntry[] = [
  {
    id: 'apple-iphone-14-pro',
    brand: 'Apple',
    model: 'iPhone 14 Pro (A2890 / A2650)',
    board_arch: 'sandwich_dual_layer',
    schematic_id: 'iphone_14_pro_board',
    soc: 'Apple A16 Bionic (APL1W10)',
    storage: 'NVMe NAND (128GB - 1TB)',
    ics: {
      'Main PMIC': '338S00843-B0 (Apple/Dialog)',
      'Charging / USB': 'SN2611A0 (Hydra) + BQ25980 (Fast Charge)',
      'Display / Touch': 'TPS65657B0 (OLED Power) + BCM15951 (Touch)',
      Audio: '338S00537 (Cirrus Logic Audio Codec) + 338S00739 (Speaker Amp)',
      'Baseband / RF': 'Qualcomm SDX65M + SDR735 + QET7100',
      'Wi-Fi / BT': '339S01134 (Murata)',
    },
    connector_pinouts: [
      { connector: 'J4500 (Battery)', pin: 'Pin 1-2', net: 'PP_BATT_VCC', diode_v: 0.395, voltage_v: 3.85, notes: 'موجب البطارية الرئيسي' },
      { connector: 'J4500 (Battery)', pin: 'Pin 3', net: 'BATTERY_SWI', diode_v: 0.54, voltage_v: 1.8, notes: 'خط بيانات نسبة الشحن — تلفه يسبب ريستارت كل 3 دقائق' },
      { connector: 'J8500 (Display)', pin: 'Pin 2', net: 'PP_DISP_ELVDD', diode_v: 0.46, voltage_v: 4.6, notes: 'تغذية إضاءة شاشة OLED الموجبة' },
      { connector: 'J8500 (Display)', pin: 'Pin 4', net: 'PP_DISP_ELVSS', diode_v: 0.62, voltage_v: -4.4, notes: 'تغذية شاشة OLED السالبة' },
      { connector: 'J6400 (Charging)', pin: 'Pin 5', net: 'USB_E75_ACC1', diode_v: 0.58, voltage_v: 3.0, notes: 'خط تعريف الكابل — متصل بآيسي Hydra' },
    ],
    testpoints: [
      { name: 'DFU Force', method: 'اضغط رفع الصوت ثم خفض الصوت ثم استمر على زر الباور 10 ثوانٍ ثم مع خفض الصوت 5 ثوانٍ' },
      { name: 'PP_VDD_MAIN Probe', method: 'نقطة القياس بجوار ملف L2700 على الطبقة العلوية' },
    ],
    software_commands: [
      'ideviceinfo -s  # قراءة بيانات الجهاز والـ UDID',
      'idevicerestore --erase --latest  # تفليش أحدث نظام iOS عبر DFU',
      'irecovery -n  # إخراج الجهاز من وضع الريكفري',
    ],
  },
  {
    id: 'apple-iphone-15-pro-max',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max (A3106 / A2849)',
    board_arch: 'sandwich_dual_layer',
    schematic_id: 'iphone_14_pro_board',
    soc: 'Apple A17 Pro (APL1V02 3nm)',
    storage: 'NVMe NAND (256GB - 1TB)',
    ics: {
      'Main PMIC': '338S00946-B1 (Apple Custom PMIC)',
      'USB-C / PD Controller': 'SN2611C0 + ACE3 USB-C PD 3.0 (338S00839)',
      'Display / Touch': 'TPS65657B1 (ProMotion 120Hz OLED Bias)',
      Audio: '338S00738 Audio Codec + Dual Smart Amps',
      'Baseband / RF': 'Qualcomm SDX70M + SDR735 + QET7100',
      'Wi-Fi / BT': '339S01232 (Wi-Fi 6E + Thread)',
    },
    connector_pinouts: [
      { connector: 'J4500 (Battery)', pin: 'Pin 1', net: 'PP_BATT_VCC', diode_v: 0.402, voltage_v: 3.88, notes: 'موجب البطارية الرئيسي' },
      { connector: 'J4500 (Battery)', pin: 'Pin 3', net: 'BATTERY_SWI', diode_v: 0.535, voltage_v: 1.8, notes: 'بيانات البطارية والحرارة — يسبب ريستارت 180 ثانية عند تلفه' },
      { connector: 'J6400 (USB-C)', pin: 'Pin A5/B5', net: 'USB_CC1 / USB_CC2', diode_v: 0.615, voltage_v: 1.65, notes: 'خطوط تفاوض Type-C المباشرة مع ACE3' },
      { connector: 'J8500 (Display)', pin: 'Pin 10', net: 'MIPI_DSI_LANE', diode_v: 0.475, voltage_v: 1.2, notes: 'تغذية بيانات الشاشة العالية السرعة' },
    ],
    testpoints: [
      { name: 'USB-C DFU Entry', method: 'استخدم كابل USB-C إلى USB-C مع ضغطة رفع الصوت ثم خفض الصوت ثم زر الباور' },
      { name: 'PP_VDD_MAIN (L2700)', method: 'نقطة فحص التغذية الرئيسية على حافة اللوحة العلوية' },
    ],
    software_commands: [
      'ideviceinfo -s  # التحقق من اتصال USB-C وقراءة رقم ECID',
      'idevicerestore --latest  # التحديث أو الاستعادة عبر DFU',
    ],
  },
  {
    id: 'apple-iphone-13-pro-max',
    brand: 'Apple',
    model: 'iPhone 13 Pro Max (A2643 / A2484)',
    board_arch: 'sandwich_dual_layer',
    schematic_id: 'iphone_14_pro_board',
    soc: 'Apple A15 Bionic (APL1W07)',
    storage: 'NVMe NAND (128GB - 1TB)',
    ics: {
      'Main PMIC': '338S00770-B0 (Dialog/Apple)',
      'Charging / USB': 'SN2611A0 (Hydra) + BQ25980',
      'Display / Touch': 'TPS65657A0 (120Hz Green/White Screen Bypass Fix)',
      'Baseband / RF': 'Qualcomm SDX60M + SDR865',
      'Wi-Fi / BT': '339S00761',
    },
    connector_pinouts: [
      { connector: 'J4500 (Battery)', pin: 'Pin 1', net: 'PP_BATT_VCC', diode_v: 0.39, voltage_v: 3.85, notes: 'موجب البطارية' },
      { connector: 'J8500 (Display)', pin: 'Pin 2', net: 'PP_DISP_ELVDD', diode_v: 0.465, voltage_v: 4.6, notes: 'جهد الشاشة الموجب — فحصه ضروري عند عطل الشاشة الخضراء/البيضاء' },
    ],
    testpoints: [
      { name: 'Green Screen VGH Bypass', method: 'معالجة فصل مسار VGH في فلاتة الشاشة (أو فحص ممانعة J8500 قبل تعديل الفلاتة)' },
    ],
    software_commands: [
      'idevicepair pair && ideviceinfo  # فحص سلامة الشهادات والبيسباند',
    ],
  },
  {
    id: 'samsung-a54-sm-a546b',
    brand: 'Samsung',
    model: 'Samsung Galaxy A54 5G (SM-A546B)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'samsung_exynos_a54_board',
    soc: 'Samsung Exynos 1380 (S5E8835 5nm)',
    storage: 'UFS 3.1 (128GB / 256GB)',
    ics: {
      'Main PMIC': 'Samsung Shannon S2MPS24 / S2MPS25',
      'IF-PMIC / Charger': 'Samsung S2MU106X01 (25W Super Fast Charger)',
      'OVP Switch': 'ET9553L / KTS1689',
      'Display Power': 'S2DOS05 (AMOLED Bias +4.6V / -4.4V)',
      'Baseband / RF': 'Exynos 5300 Modem + Qorvo QM77048 PA',
      'Audio Amp': 'TAS2564 / Cirrus CS35L41',
    },
    connector_pinouts: [
      { connector: 'HDC5000 (Battery)', pin: 'Pin 1', net: 'VBAT', diode_v: 0.405, voltage_v: 3.88, notes: 'خط البطارية الأساسي' },
      { connector: 'HDC5000 (Battery)', pin: 'Pin 2', net: 'BAT_THERM', diode_v: 0.525, voltage_v: 1.8, notes: 'خط حساس حرارة البطارية' },
      { connector: 'HDC7000 (Sub-Board)', pin: 'Pin 4', net: 'VBUS_USB_5V_9V', diode_v: 0.54, voltage_v: 9.0, notes: 'دخل الشحن من الفلاتة السفلية — يتأثر كثيراً برطوبة الفلاتة' },
      { connector: 'HDC8000 (Display)', pin: 'Pin 6', net: 'ELVDD_4P6V', diode_v: 0.47, voltage_v: 4.6, notes: 'تغذية شاشة Super AMOLED 120Hz' },
    ],
    testpoints: [
      { name: 'Odin Force Key', method: 'اضغط رفع وخفض الصوت معاً أثناء توصيل الكابل للدخول إلى Download Mode' },
      { name: 'VPH_PWR Coil', method: 'نقطة القياس على ملف L5001 بجوار S2MU106' },
    ],
    software_commands: [
      'heimdall print-pit --no-reboot  # قراءة جدول التقسيم لـ Exynos 1380',
      'heimdall flash --BOOT boot.img --VBMETA vbmeta.img  # إصلاح الإقلاع عبر ODIN',
    ],
  },
  {
    id: 'samsung-a32-sm-a325f',
    brand: 'Samsung',
    model: 'Samsung Galaxy A32 (SM-A325F)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'samsung_a325f_board',
    soc: 'MediaTek Helio G80 (MT6769V)',
    storage: 'eMMC 5.1 (64GB / 128GB)',
    ics: {
      'Main PMIC': 'MT6357CRV',
      'IF-PMIC / Charging': 'SM5714 (Silicon Mitus)',
      'OVP Protection': 'ET9553L (Over-Voltage Protection)',
      'Backlight / Display': 'LM3697 / S2DOS05 (AMOLED Power)',
      'RF Transceiver': 'MT6177MV',
      'Power Amplifier': 'SKY77643-21 / VC7643',
    },
    connector_pinouts: [
      { connector: 'HDC5000 (Battery)', pin: 'Pin 1', net: 'VBAT', diode_v: 0.415, voltage_v: 3.85, notes: 'موجب البطارية' },
      { connector: 'HDC5000 (Battery)', pin: 'Pin 2', net: 'BAT_THM', diode_v: 0.51, voltage_v: 1.8, notes: 'حساس حرارة البطارية — قطعه يوقف الشحن برسالة حرارة منخفضة' },
      { connector: 'HDC7000 (Sub-Board)', pin: 'Pin 3-4', net: 'VBUS_5V_IN', diode_v: 0.53, voltage_v: 5.0, notes: 'دخل الشحن من الفلاتة السفلية' },
      { connector: 'HDC7000 (Sub-Board)', pin: 'Pin 8', net: 'USB_CC1', diode_v: 0.61, voltage_v: 1.2, notes: 'تحديد اتجاه كابل Type-C' },
      { connector: 'HDC8000 (Display)', pin: 'Pin 12', net: 'ELVDD_4P6', diode_v: 0.475, voltage_v: 4.6, notes: 'تغذية شاشة Super AMOLED' },
    ],
    testpoints: [
      { name: 'MTK BROM TP', method: 'توصيل نقطة CLK بجوار الذاكرة مع الأرضي GND أثناء توصيل كابل USB' },
      { name: 'VBUS Testpoint', method: 'نقطة ذهبية بجوار كونكتر الفلاتة السفلية قبل آيسي OVP' },
    ],
    software_commands: [
      'python mtk.py printgpt  # قراءة جدول التقسيمات عبر BROM',
      'python mtk.py r nvram,nvdata nvram.bin,nvdata.bin  # سحب باك أب الشبكة والـ IMEI',
      'heimdall flash --BOOT boot.img --SYSTEM system.img  # التفليش عبر وضع ODIN',
    ],
  },
  {
    id: 'samsung-a24-sm-a245f',
    brand: 'Samsung',
    model: 'Samsung Galaxy A24 (SM-A245F)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'samsung_a325f_board',
    soc: 'MediaTek Helio G99 (MT6789V)',
    storage: 'UFS 2.2 (128GB)',
    ics: {
      'Main PMIC': 'MT6366W / MT6358W',
      'Sub PMIC / Charging': 'MT6375 (Charger + Fuel Gauge + Display Bias)',
      'RF Transceiver': 'MT6190MV',
      'Wi-Fi / BT': 'MT6631N',
      'Audio Amp': 'AW88264CSR',
    },
    connector_pinouts: [
      { connector: 'BATT_CON', pin: 'Pin 1', net: 'VBAT', diode_v: 0.42, voltage_v: 3.85, notes: 'خط البطارية المباشر' },
      { connector: 'SUB_FPC', pin: 'Pin 10', net: 'VBUS_USB', diode_v: 0.545, voltage_v: 9.0, notes: 'يدعم الشحن السريع 25W PD' },
      { connector: 'LCD_FPC', pin: 'Pin 6', net: 'VDD_1V8_LCD', diode_v: 0.49, voltage_v: 1.8, notes: 'تغذية منطق الشاشة' },
    ],
    testpoints: [
      { name: 'BROM Testpoint', method: 'توصيل نقطتي BROM أسفل صاج المعالج أو استخدام كابل EDL/BROM المعدل' },
    ],
    software_commands: [
      'python mtk.py da seccfg unlock  # فتح البوتلودر',
      'python mtk.py e frp  # مسح حماية FRP بأمان',
    ],
  },
  {
    id: 'samsung-a15-sm-a155f',
    brand: 'Samsung',
    model: 'Samsung Galaxy A15 / A16 (SM-A155F / A165F)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'samsung_a325f_board',
    soc: 'MediaTek Helio G99 (MT6789 6nm)',
    storage: 'UFS 2.2 (128GB / 256GB)',
    ics: {
      'Main PMIC': 'MT6366W',
      'Sub PMIC / Charger': 'MT6375 (Type-C PD + Display + Haptics)',
      'OVP Switch': 'ET9553L',
      'RF Transceiver': 'MT6190MV',
      'Audio Smart PA': 'AW88264CSR',
    },
    connector_pinouts: [
      { connector: 'HDC5000 (Battery)', pin: 'Pin 1', net: 'VBAT', diode_v: 0.418, voltage_v: 3.88, notes: 'موجب البطارية الرئيسي' },
      { connector: 'HDC7000 (Sub-Board)', pin: 'Pin 2', net: 'VBUS_USB_IN', diode_v: 0.54, voltage_v: 9.0, notes: 'دخل الشحن 25W — تحقق من فلاتة الربط السفلية' },
    ],
    testpoints: [
      { name: 'MTK VCOM / BROM TP', method: 'تلامس نقطة TP_BROM مع GND لإعادة كتابة Preloader و RPMB/FRP' },
    ],
    software_commands: [
      'python mtk.py r nvdata,nvram nvdata.img,nvram.img  # حفظ بيانات الشبكة قبل أي برمجة',
      'heimdall flash --PIT a155f.pit --BOOT boot.img  # استعادة التوزيع السليم',
    ],
  },
  {
    id: 'xiaomi-redmi-note-12-pro',
    brand: 'Xiaomi / Redmi / POCO',
    model: 'Redmi Note 12 Pro 5G (Ruby)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'xiaomi_qualcomm_mtk_board',
    soc: 'MediaTek Dimensity 1080 (MT6877V)',
    storage: 'UFS 2.2 (128GB / 256GB)',
    ics: {
      'Main PMIC': 'MT6368MW',
      'Fast Charge Pump': 'LN8000 / BQ25970 (67W Turbo Charge)',
      'Sub PMIC': 'MT6373P',
      'Audio Codec': 'MT6368 Integrated + Smart PA AW88394',
      'RF Transceiver': 'MT6190W',
    },
    connector_pinouts: [
      { connector: 'J3801 (Battery)', pin: 'Pin 1-2', net: 'VBAT_1', diode_v: 0.38, voltage_v: 3.88, notes: 'بطارية ثنائية الخلية 67W' },
      { connector: 'J3801 (Battery)', pin: 'Pin 4', net: 'BAT_ID', diode_v: 0.52, voltage_v: 1.8, notes: 'تعريف البطارية — تلفه يسبب شحن بطيء 1%' },
      { connector: 'J2501 (Display)', pin: 'Pin 15', net: 'OLED_VCI_3V3', diode_v: 0.495, voltage_v: 3.3, notes: 'تغذية شاشة Flow AMOLED' },
    ],
    testpoints: [
      { name: 'BROM Mode', method: 'الضغط على زري رفع وخفض الصوت معاً أثناء توصيل كابل USB' },
    ],
    software_commands: [
      'fastboot getvar all  # فحص حالة البوتلودر والـ Anti-Rollback',
      'python mtk.py w boot boot_patched.img  # تمرير البوت المعدل',
    ],
  },
  {
    id: 'xiaomi-redmi-note-13-pro-plus',
    brand: 'Xiaomi / Redmi / POCO',
    model: 'Redmi Note 13 Pro+ 5G (Zircon / 23090RA98G)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'xiaomi_qualcomm_mtk_board',
    soc: 'MediaTek Dimensity 7200-Ultra (MT6886 4nm)',
    storage: 'UFS 3.1 (256GB / 512GB)',
    ics: {
      'Main PMIC': 'MT6368MW + MT6373P',
      '120W HyperCharge': 'Dual NuVolta NU2115A + Xiaomi Surge P1 Chip',
      'Display Power': 'S2DOS05 AMOLED Bias',
      'Audio Amplifier': 'Dual Smart PA AW88394',
      'RF Transceiver': 'MT6195W (5G Sub-6)',
    },
    connector_pinouts: [
      { connector: 'J3801 (Battery)', pin: 'Pin 1', net: 'VBAT_DUAL_CELL', diode_v: 0.375, voltage_v: 7.76, notes: 'بطارية ثنائية الخلية للشحن 120W (4.2A+)' },
      { connector: 'J3801 (Battery)', pin: 'Pin 5', net: 'BAT_NTC_THM', diode_v: 0.515, voltage_v: 1.8, notes: 'مستشعر حرارة البطارية' },
      { connector: 'J2501 (OLED)', pin: 'Pin 4', net: 'ELVDD_4V6', diode_v: 0.48, voltage_v: 4.6, notes: 'تغذية الشاشة المنحنية 1.5K OLED' },
    ],
    testpoints: [
      { name: 'BROM VCOM Entry', method: 'إطفاء تام والضغط على زري الصوت عند توصيل USB أو توصيل TP_CLK' },
    ],
    software_commands: [
      'python mtk.py r persist persist.img  # نسخ احتياطي لحساسات البصمة والـ Mi Cloud',
      'fastboot getvar anti  # فحص مؤشر منع الرجوع Anti-Rollback قبل التفليش',
    ],
  },
  {
    id: 'xiaomi-poco-x3-pro',
    brand: 'Xiaomi / Redmi / POCO',
    model: 'POCO X3 Pro (Vayu / Bhima)',
    board_arch: 'qualcomm_flagship_board',
    schematic_id: 'xiaomi_qualcomm_mtk_board',
    soc: 'Qualcomm Snapdragon 860 (SM8150-AC)',
    storage: 'UFS 3.1 (128GB / 256GB)',
    ics: {
      'Main PMIC': 'PM8150 + PM8150B (Charging/Display) + PM8150L',
      'Fast Charger': 'SMB1390 (33W Charge Pump)',
      'Audio Codec': 'WCD9340',
      'RF Transceiver': 'SDR8150',
      'Known Common Fault': 'فصل لحام المعالج SM8150 والرام (CPU/RAM Reballing) — يسبب شاشة بيضاء/رمادية أو موت مفاجئ',
    },
    connector_pinouts: [
      { connector: 'J6500 (Battery)', pin: 'Pin 1', net: 'VBAT', diode_v: 0.39, voltage_v: 3.85, notes: 'موجب البطارية' },
      { connector: 'J5100 (LCD)', pin: 'Pin 2', net: 'LCD_BL_LED_A', diode_v: 0.56, voltage_v: 21.0, notes: 'خط أنود الإضاءة (يرتفع لـ 21V عند التشغيل)' },
      { connector: 'J5100 (LCD)', pin: 'Pin 4', net: 'VSP_5P5V', diode_v: 0.51, voltage_v: 5.5, notes: 'جهد تغذية الشاشة الموجب' },
      { connector: 'J5100 (LCD)', pin: 'Pin 6', net: 'VSN_5P5V', diode_v: 0.64, voltage_v: -5.5, notes: 'جهد تغذية الشاشة السالب' },
    ],
    testpoints: [
      { name: 'EDL 9008 Testpoints', method: 'نقطتان نحاسيتان بجوار كونكتر البطارية وأسفل صاج الـ PM8150B' },
    ],
    software_commands: [
      'edl printgpt --loader=prog_ufs_firehose_sm8150.elf  # قراءة بارتشنات UFS عبر 9008',
      'edl r lun5 modemst1,modemst2,fsg  # سحب باك أب الشبكة والـ IMEI',
    ],
  },
  {
    id: 'realme-c53-rmx3760',
    brand: 'Realme / Oppo / OnePlus',
    model: 'Realme C53 (RMX3760)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'unisoc_tiger_board',
    soc: 'Unisoc Tiger T612 (UMS9230)',
    storage: 'eMMC 5.1 (128GB)',
    ics: {
      'Main PMIC': 'SC2730G (Unisoc PMIC)',
      'Fast Charger': 'SGM41513 + Charge Pump 33W',
      'RF Transceiver': 'SR3595D',
      'Audio PA': 'AW87390',
    },
    connector_pinouts: [
      { connector: 'CON_BATT', pin: 'Pin 1', net: 'VBAT', diode_v: 0.41, voltage_v: 3.85, notes: 'موجب البطارية' },
      { connector: 'CON_LCD', pin: 'Pin 1', net: 'LEDA', diode_v: 0.58, voltage_v: 19.5, notes: 'أنود إضاءة شاشة IPS' },
    ],
    testpoints: [
      { name: 'Unisoc Diag / Download', method: 'الضغط على زر خفض الصوت أثناء توصيل كابل USB (SPRD U2S Diag)' },
    ],
    software_commands: [
      'spd_dump --wait 300 fdl fdl1.bin 0x5500 fdl fdl2.bin 0x9efffe00 read_part miscdata  # التعامل مع معالجات Unisoc',
    ],
  },
  {
    id: 'tecno-spark-20-unisoc-mtk',
    brand: 'Infinix / Tecno / itel',
    model: 'Tecno Spark 20 / Infinix Hot 40i (KJ5 / X6528)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'unisoc_tiger_board',
    soc: 'Unisoc T606 (UMS9230) / Helio G85',
    storage: 'eMMC 5.1 / UFS 2.2 (128GB - 256GB)',
    ics: {
      'Main PMIC': 'SC2730G / MT6358',
      'Charger IC': 'SGM41513 / BQ25601',
      'Backlight Boost': 'AW9962DNR (19.5V LED Boost Driver)',
      'RF Transceiver': 'SR3595D / MT6177M',
    },
    connector_pinouts: [
      { connector: 'J_BATT', pin: 'Pin 1', net: 'VBAT', diode_v: 0.405, voltage_v: 3.85, notes: 'موجب البطارية' },
      { connector: 'J_LCD', pin: 'Pin 1', net: 'LCM_LED_A', diode_v: 0.57, voltage_v: 19.5, notes: 'خط أنود الإضاءة الخلفية لشاشة LCD' },
      { connector: 'J_LCD', pin: 'Pin 3', net: 'LCD_VSP_+5V5', diode_v: 0.505, voltage_v: 5.5, notes: 'تغذية بيانات الشاشة الموجبة' },
    ],
    testpoints: [
      { name: 'Boot Key / SPD FDL', method: 'استمر بالضغط على زر خفض الصوت أثناء التوصيل (أو زري الصوت معاً لـ MTK BROM)' },
    ],
    software_commands: [
      'spd_dump --wait 300 fdl fdl1.bin 0x5500 fdl fdl2.bin 0x9efffe00 erase_part persist  # مسح FRP لمعالجات Unisoc',
      'python mtk.py r nvram,nvdata,proinfo backup/  # باك أب لملفات السيريال في إنفينكس وتكنو',
    ],
  },
  {
    id: 'infinix-gt20-pro-mtk',
    brand: 'Infinix / Tecno / itel',
    model: 'Infinix GT 20 Pro / Note 40 Pro (X6871 / X6850)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'oppo_realme_dimensity_board',
    soc: 'MediaTek Dimensity 8200 Ultimate (MT6896 4nm)',
    storage: 'UFS 3.1 (256GB)',
    ics: {
      'Main PMIC': 'MT6368 + MT6373P',
      'Fast Charge IC': 'Southchip SC8545 (45W / 70W Charge Pump)',
      'Display Power': 'TPS65633 AMOLED Bias',
      'RF Transceiver': 'MT6195W',
    },
    connector_pinouts: [
      { connector: 'J_BATT', pin: 'Pin 1', net: 'VBAT', diode_v: 0.39, voltage_v: 3.88, notes: 'موجب البطارية' },
      { connector: 'J_SUB', pin: 'Pin 6', net: 'VBUS_PD_9V', diode_v: 0.535, voltage_v: 9.0, notes: 'دخل الشحن السريع PD 3.0' },
    ],
    testpoints: [
      { name: 'MTK BROM Pin', method: 'نقطة التيست بوينت BROM بجوار الذاكرة UFS لإصلاح Dead Boot' },
    ],
    software_commands: [
      'python mtk.py da seccfg unlock  # فتح البوتلودر لأجهزة Transsion MTK',
      'python mtk.py w boot boot.img  # استعادة الإقلاع',
    ],
  },
  {
    id: 'huawei-p30-pro-vog-l29',
    brand: 'Huawei / Honor',
    model: 'Huawei P30 Pro (VOG-L29)',
    board_arch: 'sandwich_dual_layer',
    schematic_id: 'huawei_kirin_board',
    soc: 'HiSilicon Kirin 980 (Hi3680)',
    storage: 'UFS 2.1 (128GB / 256GB)',
    ics: {
      'Main PMIC': 'Hi6421V700 + Hi6422V300',
      'SuperCharge IC': 'Hi6526 (40W SuperCharge)',
      'RF Transceiver': 'Hi6363',
      'Wi-Fi / BT': 'Hi1103',
    },
    connector_pinouts: [
      { connector: 'J2001 (Battery)', pin: 'Pin 1', net: 'VBAT_SYS', diode_v: 0.375, voltage_v: 3.85, notes: 'تغذية النظام الرئيسية' },
      { connector: 'J2401 (USB/Sub)', pin: 'Pin 6', net: 'VBUS_40W', diode_v: 0.52, voltage_v: 10.0, notes: 'شحن هواوي فائق السرعة 10V/4A' },
    ],
    testpoints: [
      { name: 'Huawei USB COM 1.0', method: 'توصيل نقطة TP بجوار ريش البطارية مع الأرضي (يظهر منفذ HUAWEI USB COM 1.0 PID:3609)' },
    ],
    software_commands: [
      '# تمرير ملف Board Software عبر IDT ثم التفليش الرسمي عبر وضع Fastboot/Upgrade',
    ],
  },
  {
    id: 'google-pixel-8-pro-tensor',
    brand: 'Google',
    model: 'Google Pixel 8 Pro (GC3VE)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'google_pixel_tensor_g3',
    soc: 'Google Tensor G3 + Titan M2 Security Chip',
    storage: 'UFS 3.1 (128GB - 1TB)',
    ics: {
      'Main PMIC': 'Samsung S2MPG14 + S2MPG15 Slave PMIC',
      'Charging IC': 'MAX77759 Type-C PD & Fuel Gauge',
      'Security Element': 'Google Titan M2 (GSC)',
      'Baseband / RF': 'Samsung Exynos 5300g 5G Modem',
      'Display Power': 'S2DOS05 LTPO OLED Bias',
    },
    connector_pinouts: [
      { connector: 'J_BATT', pin: 'Pin 1', net: 'VBAT_MAIN', diode_v: 0.4, voltage_v: 3.88, notes: 'موجب البطارية' },
      { connector: 'J_DISP', pin: 'Pin 4', net: 'ELVDD_4V6', diode_v: 0.465, voltage_v: 4.6, notes: 'تغذية شاشة Super Actua OLED' },
    ],
    testpoints: [
      { name: 'Fastboot Recovery Entry', method: 'زر الباور مع خفض الصوت للدخول لوضع Fastbootd وفحص قفل OEM' },
    ],
    software_commands: [
      'fastboot getvar all  # قراءة حالة البوتلودر وإصدار Anti-Rollback',
      'adb sideload husky-ota.zip  # التحديث الآمن عبر Recovery Sideload',
    ],
  },
  {
    id: 'samsung-s24u-sm-s928b',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra 5G (SM-S928B)',
    board_arch: 'qualcomm_flagship_board',
    schematic_id: 'samsung_s24_ultra_sm8650',
    soc: 'Qualcomm Snapdragon 8 Gen 3 (SM8650)',
    storage: 'UFS 4.0 (256GB - 1TB)',
    ics: {
      'Main PMIC': 'PM8550 + PM8550VE + PM8550VS',
      'Sub PMIC / Charging': 'MAX77705 + LN8410 (45W Super Fast Charge)',
      'Display Power': 'S2DOS05 / QDM5670',
      'RF Transceiver': 'SDR875 + SDX75M',
    },
    connector_pinouts: [
      { connector: 'HDC6000 (Battery)', pin: 'Pin 1', net: 'VBAT', diode_v: 0.385, voltage_v: 3.88, notes: 'موجب البطارية الرئيسي' },
      { connector: 'HDC7000 (Sub-Board)', pin: 'Pin 3', net: 'VBUS_5V_20V', diode_v: 0.512, voltage_v: 9.0, notes: 'دخل الشحن السريع 45W PPS' },
      { connector: 'HDC8000 (OLED)', pin: 'Pin 4', net: 'VDD_1V8_OLED', diode_v: 0.42, voltage_v: 1.8, notes: 'جهد تغذية الشاشة' },
    ],
    testpoints: [
      { name: 'EDL 9008 Testpoint', method: 'نقطتان بجوار حافظة UFS في الطبقة السفلية' },
    ],
    software_commands: [
      'heimdall print-pit --no-reboot  # فحص جدول التقسيمات في وضع ODIN',
      'edl printgpt --loader=prog_ufs_firehose_sm8650.elf  # قراءة GPT عبر EDL 9008',
    ],
  },
  {
    id: 'apple-iphone-15-pro-max-a3106',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max (A3106)',
    board_arch: 'sandwich_dual_layer',
    schematic_id: 'iphone_15_pro_max_a17',
    soc: 'Apple A17 Pro (3nm APL1V02)',
    storage: 'NVMe NAND (256GB - 1TB)',
    ics: {
      'Main PMIC': 'Apple 338S00946',
      'USB-C Controller': 'ACE3 CD3217 USB-PD & DP AltMode',
      'Charger IC': 'U5800 Buck-Boost Charger',
      'Baseband': 'Qualcomm SDX70M 5G Modem',
    },
    connector_pinouts: [
      { connector: 'J5100 (Battery)', pin: 'Pin 1', net: 'PP_BATT_VCC', diode_v: 0.39, voltage_v: 3.88, notes: 'موجب البطارية الرئيسي' },
      { connector: 'J6100 (USB-C Flex)', pin: 'Pin 4', net: 'USB_CC1 / CC2', diode_v: 0.515, voltage_v: 5.0, notes: 'تعريف كابل USB-C والشحن عبر ACE3' },
      { connector: 'J5700 (OLED)', pin: 'Pin 2', net: 'PP_VDD_BOOST', diode_v: 0.445, voltage_v: 5.0, notes: 'تغذية شاشة ProMotion 120Hz' },
    ],
    testpoints: [
      { name: 'DFU Key Sequence', method: 'ضغطة سريعة رفع الصوت ثم خفض الصوت ثم استمرار الباور + خفض الصوت 5 ثوانٍ' },
    ],
    software_commands: [
      'ideviceinfo  # قراءة بيانات المعالج والشريحة التسلسلية عبر libimobiledevice',
      'irecovery -q  # قراءة CPID و ECID في وضع DFU/Recovery',
    ],
  },
  {
    id: 'samsung-a15-5g-sm-a156b',
    brand: 'Samsung',
    model: 'Galaxy A15 5G / A15 4G (SM-A156B / SM-A155F)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'infinix_tecno_helio_board',
    soc: 'MediaTek Dimensity 6100+ / Helio G99 (MT6789)',
    storage: 'UFS 2.2 (128GB / 256GB)',
    ics: {
      'Main PMIC': 'MT6358W / MT6363',
      'Charger / IF-PMIC': 'S2MU106X01 / MT6360',
      'Display Power': 'S2DOS05 AMOLED Bias (Super AMOLED 90Hz)',
      'RF Transceiver': 'MT6177M / MT6190',
    },
    connector_pinouts: [
      { connector: 'HDC5000 (Battery)', pin: 'Pin 1', net: 'VBAT_MAIN', diode_v: 0.382, voltage_v: 3.85, notes: 'موجب البطارية' },
      { connector: 'HDC7001 (Main Sub)', pin: 'Pin 4', net: 'VBUS_5V_9V', diode_v: 0.535, voltage_v: 9.0, notes: 'دخل الشحن السريع 25W عبر فلاتة الصب' },
      { connector: 'HDC6001 (AMOLED)', pin: 'Pin 6', net: 'ELVDD_4V6', diode_v: 0.47, voltage_v: 4.6, notes: 'تغذية شاشة Super AMOLED' },
    ],
    testpoints: [
      { name: 'MTK BROM Testpoint', method: 'نقطة CLK/CMD بجوار معالج MT6789 لإصلاح Dead Boot أو تخطي SEC CTRL' },
    ],
    software_commands: [
      'python mtk.py printgpt  # فحص جدول الأقسام عبر BROM المفتوح المصدر',
      'heimdall flash --BOOT boot.img --VBMETA vbmeta.img',
    ],
  },
  {
    id: 'xiaomi-14-pro-23116pn5bc',
    brand: 'Xiaomi',
    model: 'Xiaomi 14 / 14 Pro (23116PN5BC)',
    board_arch: 'qualcomm_flagship_board',
    schematic_id: 'xiaomi_14_hyperos_qcom',
    soc: 'Qualcomm Snapdragon 8 Gen 3 (SM8650)',
    storage: 'UFS 4.0 (256GB - 1TB)',
    ics: {
      'Main PMIC': 'PM8550 + PMK8550',
      'Charge Pump': 'Dual SMB1398 (120W HyperCharge)',
      'Audio Codec': 'WCD9385 + CS35L41 Dual SmartPA',
      'RF Transceiver': 'SDR875 + SDX75M',
    },
    connector_pinouts: [
      { connector: 'J3001 (Battery)', pin: 'Pin 1', net: 'VBAT_2S', diode_v: 0.38, voltage_v: 3.85, notes: 'تغذية البطارية ثنائية الخلايا' },
      { connector: 'J3102 (USB Sub)', pin: 'Pin 2', net: 'VBUS_20V_PPS', diode_v: 0.515, voltage_v: 20.0, notes: 'دخل HyperCharge حتى 120W' },
    ],
    testpoints: [
      { name: 'EDL 9008 Pads', method: 'نقطتان بجوار درع المعالج SM8650 للدخول إلى وضع Sahara 05C6:9008' },
    ],
    software_commands: [
      'edl printgpt --loader=prog_firehose_sm8650_xiaomi.elf',
      'fastboot getvar anti  # التحقق من عداد Anti-Rollback قبل التفليش',
    ],
  },
  {
    id: 'redmi-note-13-pro-5g-2312dra50g',
    brand: 'Xiaomi / Redmi',
    model: 'Redmi Note 13 Pro 5G (2312DRA50G)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'xiaomi_qualcomm_mtk_board',
    soc: 'Qualcomm Snapdragon 7s Gen 2 (SM7435)',
    storage: 'UFS 2.2 (256GB / 512GB)',
    ics: {
      'Main PMIC': 'PM7325B + PM8350C',
      'Turbo Charge IC': 'BQ25980 / SC8551 (67W)',
      'Display Bias': 'TPS65132B / AMOLED Bias',
      'RF Transceiver': 'SDR735',
    },
    connector_pinouts: [
      { connector: 'J_BATT', pin: 'Pin 1', net: 'VBAT_MAIN', diode_v: 0.39, voltage_v: 3.85, notes: 'خط البطارية الرئيسي' },
      { connector: 'J_DISP', pin: 'Pin 5', net: 'OLED_VDD_3V0', diode_v: 0.45, voltage_v: 3.0, notes: 'تغذية شاشة AMOLED 1.5K' },
    ],
    testpoints: [
      { name: 'EDL 9008 Testpoint', method: 'نقطتا EDL أسفل درع الذاكرة UFS بجوار كونكتر البطارية' },
    ],
    software_commands: [
      'edl r persist persist.img --loader=prog_firehose_sm7435.elf',
      'fastboot flash boot_ab boot.img',
    ],
  },
  {
    id: 'oneplus-12-cph2581',
    brand: 'OnePlus',
    model: 'OnePlus 12 5G (CPH2581)',
    board_arch: 'qualcomm_flagship_board',
    schematic_id: 'xiaomi_14_hyperos_qcom',
    soc: 'Qualcomm Snapdragon 8 Gen 3 (SM8650)',
    storage: 'UFS 4.0 (256GB / 512GB)',
    ics: {
      'Main PMIC': 'PM8550 + PMK8550',
      'SuperVOOC IC': 'OPPO Custom Dual Charge Pump 100W',
      'Audio PA': 'TFA9874 Dual Stereo',
      'RF Transceiver': 'SDR875 + SDX75M',
    },
    connector_pinouts: [
      { connector: 'J_BATT_2S', pin: 'Pin 1', net: 'VBAT_10V_2S', diode_v: 0.388, voltage_v: 7.74, notes: 'موجب البطارية ثنائية الخلايا SuperVOOC 100W' },
      { connector: 'J_USB_SUB', pin: 'Pin 3', net: 'VBUS_SUPERVOOC', diode_v: 0.51, voltage_v: 11.0, notes: 'دخل الشحن فائق السرعة 100W' },
    ],
    testpoints: [
      { name: 'EDL Testpoint', method: 'إزالة غطاء الجرافيت للوصول لنقطتي Qualcomm 9008 أو استخدام كابل EDL Deep Flash' },
    ],
    software_commands: [
      'fastboot --set-active=a  # التحقق من السلوث النشط قبل تفليش OxygenOS',
      'edl printgpt --loader=prog_firehose_ddr.elf',
    ],
  },
  {
    id: 'vivo-x100-pro-v2324a',
    brand: 'vivo',
    model: 'vivo X100 / X100 Pro (V2324A / V2309)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'oppo_realme_dimensity_board',
    soc: 'MediaTek Dimensity 9300 (MT6989 4nm)',
    storage: 'UFS 4.0 (256GB - 1TB)',
    ics: {
      'Main PMIC': 'MT6363 + MT6368',
      'Sub PMIC & FlashCharge': 'MT6373 + Dual SC8565 (120W FlashCharge)',
      'Imaging ISP': 'vivo V3 Custom Imaging Chip',
      'RF Transceiver': 'MT6195W',
    },
    connector_pinouts: [
      { connector: 'J1001 (Battery)', pin: 'Pin 1', net: 'VBAT_MAIN', diode_v: 0.382, voltage_v: 3.88, notes: 'موجب البطارية الرئيسي' },
      { connector: 'J2101 (Inductor)', pin: 'L2101', net: 'VSYS_3V85', diode_v: 0.355, voltage_v: 3.88, notes: 'ناقل VSYS المغذي لمعالجات MT6363/MT6368' },
    ],
    testpoints: [
      { name: 'MTK BROM Pin', method: 'زر خفض الصوت مع توصيل USB للدخول السريع إلى 0E8D:0003 BROM' },
    ],
    software_commands: [
      'python mtk.py w boot_a boot.img  # استعادة قسم الإقلاع لـ Dimensity 9300',
      'python mtk.py r nvcfg,nvdata,nvram vivo_nv_backup/',
    ],
  },
  {
    id: 'infinix-note-40-pro-4g-x6850',
    brand: 'Infinix',
    model: 'Infinix Note 40 Pro 4G (X6850)',
    board_arch: 'single_layer_shielded',
    schematic_id: 'infinix_tecno_helio_board',
    soc: 'MediaTek Helio G99 Ultimate (MT6789)',
    storage: 'UFS 2.2 (256GB)',
    ics: {
      'Main PMIC': 'MT6358W',
      'Charger & MagCharge': 'Cheetah X1 Power Management + MT6360',
      'AMOLED Bias': 'TPS65633',
      'RF Transceiver': 'MT6177M',
    },
    connector_pinouts: [
      { connector: 'J500 (Battery)', pin: 'Pin 1', net: 'VBAT', diode_v: 0.378, voltage_v: 3.82, notes: 'موجب البطارية' },
      { connector: 'L1001 (VSYS)', pin: 'Pad 1', net: 'VSYS', diode_v: 0.355, voltage_v: 3.82, notes: 'ملف VSYS الرئيسي لآيسي MT6358W' },
    ],
    testpoints: [
      { name: 'MTK BROM Testpoint', method: 'نقطة تست بوينت بجوار حافظة UFS 2.2 لإحياء الجهاز أو فك الحماية عبر mtkclient' },
    ],
    software_commands: [
      'python mtk.py e frp,persistent  # مسح حماية جوجل عبر mtkclient',
      'python mtk.py da seccfg unlock',
    ],
  },
  {
    id: 'sony-xperia-1-v-xq-dq72',
    brand: 'Sony',
    model: 'Sony Xperia 1 V (XQ-DQ72)',
    board_arch: 'qualcomm_flagship_board',
    schematic_id: 'samsung_s24_ultra_sm8650',
    soc: 'Qualcomm Snapdragon 8 Gen 2 (SM8550)',
    storage: 'UFS 4.0 (256GB / 512GB)',
    ics: {
      'Main PMIC': 'PM8550 + PM8550VE',
      'Sub PMIC / Charger': 'SMB1396 USB-PD 30W',
      'RF Transceiver': 'SDR875 + SDX70M',
      'Display Driver': '4K 120Hz OLED Power Controller',
    },
    connector_pinouts: [
      { connector: 'CN5001 (Battery)', pin: 'Pin 1', net: 'VBAT_MAIN', diode_v: 0.386, voltage_v: 3.86, notes: 'موجب البطارية الرئيسي' },
      { connector: 'CN7001 (USB-C)', pin: 'Pin 4', net: 'VBUS_PD_9V', diode_v: 0.515, voltage_v: 9.0, notes: 'دخل USB-PD' },
    ],
    testpoints: [
      { name: 'Sony Flashmode / Fastboot', method: 'زر خفض الصوت (Flashmode 0FCE:ADDE) أو رفع الصوت (Fastboot 0FCE:0DDE)' },
    ],
    software_commands: [
      'fastboot oem unlock 0xYOUR_CODE  # فتح البوتلودر الرسمي لهواتف سوني إكسبيريا',
      'newflasher  # تفليش ملفات SIN الرسمية مفتوح المصدر على أنظمة Windows/Linux',
    ],
  },
];

export const IC_FAULT_CATALOG: IcFaultEntry[] = [
  {
    ic_part: 'MT6357CRV / MT6358W / MT6366W / MT6368',
    manufacturer: 'MediaTek',
    function: 'آيسي الباور الرئيسي (PMIC)',
    devices: 'Samsung A24, A32, A15, Redmi Note 12/13 Pro, Infinix',
    symptoms: 'الجهاز لا يعمل، يسحب 40mA–75mA على الباور سبلاي عند الضغط على زر الباور ثم يعود للصفر',
    diagnostic_steps: [
      'فحص جهد الخرج VPROC و VCORE و VIO18 حول الآيسي',
      'قياس كريستالة التوقيت 26MHz بجوار الآيسي',
      'إعادة شبلنة (Reballing) أو استبدال الآيسي مع مراعاة اتجاه النقطة (Pin 1)',
    ],
  },
  {
    ic_part: 'SM5714 / S2MU106 / MAX77705',
    manufacturer: 'Silicon Mitus / Samsung / Maxim',
    function: 'آيسي الشحن وإدارة الواجهة (IF-PMIC)',
    devices: 'Samsung Galaxy A32, A54, S23/S24 Series',
    symptoms: 'علامة رطوبة في منفذ الشحن، شحن بطيء جداً (400mA)، أو عدم الإقلاع مع سحب أولي قبل الباور',
    diagnostic_steps: [
      'فحص ممانعة خطوط USB_DP و USB_DM و CC1/CC2',
      'التأكد من وصول جهد VBUS 5V إلى مكثف الدخل الخاص بـ SM5714 / S2MU106',
      'تنظيف آثار الأكسدة حول الآيسي أو استبداله',
    ],
  },
  {
    ic_part: 'SN2611A0 / Hydra / Tristar / ACE3',
    manufacturer: 'TI / Apple',
    function: 'متحكم الشحن والـ USB-C / Lightning',
    devices: 'iPhone X / 11 / 12 / 13 / 14 / 15 Series',
    symptoms: 'استنزاف البطارية والجهاز مغلق، يرفض الشحن، أو يسحب 120mA بمجرد الضغط الخفيف على الباور',
    diagnostic_steps: [
      'فحص سحب التيار على الباور سبلاي (Prompt Boot Test)',
      'قياس ممانعة خطوط Tristar/Hydra على فلاتة الشحن',
      'رفع الآيسي وتنظيف الأرجل وتركيب آيسي جديد بحرارة 340°C وهواء 40%',
    ],
  },
  {
    ic_part: 'SDR735 / SDR8150 / WTR2965 / MT6190',
    manufacturer: 'Qualcomm / MediaTek',
    function: 'معالج الترددات الراديوية (RF Transceiver)',
    devices: 'POCO X3 Pro, Samsung S-Series, Xiaomi Qualcomm & Dimensity',
    symptoms: 'لا توجد خدمة (No Service)، دائرة بحث مستمرة، أو اختفاء إصدار النطاق الأساسي Baseband',
    diagnostic_steps: [
      'طلب *#06# للتأكد من ظهور رقم IMEI',
      'فحص خطوط التغذية 1.0V و 1.8V الداخلة لآيسي الشبكة',
      'إعادة لحام أو تغيير آيسي الشبكة',
    ],
  },
  {
    ic_part: 'TPS65657B0 / S2DOS05 / TPS65633',
    manufacturer: 'TI / Samsung LSI',
    function: 'آيسي تغذية شاشات OLED / AMOLED (Bias PMIC)',
    devices: 'iPhone 13–15, Samsung Galaxy A32/A54/S24, Xiaomi OLED',
    symptoms: 'شاشة سوداء بالكامل مع عمل الاهتزاز والرنين واللمس — غياب جهد ELVDD (+4.6V) أو ELVSS (-4.4V)',
    diagnostic_steps: [
      'فحص ممانعة أرجل كونكتر الشاشة خاصة ELVDD و ELVSS',
      'قياس الجهد الموجب (+4.6V) والسالب (-4.4V) فور الضغط على زر الباور',
      'فحص المكثفات بجوار الآيسي واستبداله بحرارة 345°C وهواء 30% في حال القصر',
    ],
  },
  {
    ic_part: 'LM3697 / AW9962DNR / PM8150L Boost',
    manufacturer: 'TI / Awinic / Qualcomm',
    function: 'دائرة رفع الإضاءة الخلفية لشاشات LCD/IPS (Backlight Driver)',
    devices: 'POCO X3 Pro, Realme C53, Tecno Spark 20, Redmi IPS Models',
    symptoms: 'الصورة باهتة جداً وتظهر فقط تحت ضوء كشاف قوي — انقطاع جهد الأنود المرتفع (19V–25V)',
    diagnostic_steps: [
      'افحص فيوز الإضاءة الخلفية وتأكد من سلامة توصيل فلاتة الشاشة مع فصل البطارية أولاً',
      'قس دايود الشوتكي (Schottky Diode) وملف البوست (10µH) للتأكد من عدم تلف القطبية',
      'تأكد من وصول إشارة التمكين LCD_BL_EN (1.8V) من المعالج إلى الآيسي',
    ],
  },
  {
    ic_part: 'WCD9380 / 338S00537 / AW88264CSR',
    manufacturer: 'Qualcomm / Cirrus Logic / Awinic',
    function: 'آيسي الصوت الرئيسي ومكبر السماعة (Audio Codec & Smart PA)',
    devices: 'iPhone 12–15, Samsung Galaxy A24/A54/S24, Xiaomi Flagships',
    symptoms: 'اختفاء صوت الجرس أو سماعة المكالمات، تعطل الميكروفون أو تجمد مسجل الصوت، أو ريستارت عند الاتصال',
    diagnostic_steps: [
      'فحص ممانعة خطوط I2S و I2C بين المعالج وآيسي الصوت',
      'قياس ملفات الفلترة التسلسلية بجوار كونكتر الجرس والسماعة',
      'شبلنة (Reball) أو استبدال مضخم الصوت Smart PA إذا كان ساخناً أثناء التشغيل',
    ],
  },
  {
    ic_part: 'S2MPS24 / S2MPG14 / Hi6421V700',
    manufacturer: 'Samsung LSI / HiSilicon',
    function: 'آيسي الباور الرئيسي لمعالجات Exynos و Tensor و Kirin',
    devices: 'Samsung Galaxy A54, S24 Exynos, Google Pixel 8 Pro, Huawei P30 Pro',
    symptoms: 'تعليق عند شعار الشركة أو سحب أمبير ثابت (80mA–140mA) مع انقطاع إحدى قنوات Buck',
    diagnostic_steps: [
      'قياس ممانعة جميع ملفات البك (Buck Coils) وتأكيد عدم وجود شورت صريح أقل من 0.03V',
      'التحقق من جهد الاستعداد VIO 1.8V وإشارة PS_HOLD من المعالج',
      'استخدام كاميرا حرارية أو تبخير الراتنج عند حقن 1.0V لتحديد المكثف المسرّب قبل رفع الـ PMIC',
    ],
  },
  {
    ic_part: 'SC2730G / ET9553L',
    manufacturer: 'Unisoc / Etek',
    function: 'باور Unisoc الرئيسي ومفتاح الحماية OVP',
    devices: 'Realme C53, Tecno Spark 20, Samsung A32/A15 (ET9553L)',
    symptoms: 'انقطاع شحن تام بسبب شاحن غير أصلي (تلف OVP ET9553L) أو موت مفاجئ بعد تحديث',
    diagnostic_steps: [
      'قياس الجهد قبل وبعد آيسي OVP ET9553L للتأكد من مرور 5V نحو آيسي الشحن',
      'في حالة القصر على دخل VBUS: فك ET9553L واستبداله بقطعة أصلية للحفاظ على حماية البوردة',
    ],
  },
];

export function identifyUsbDevice(vid: string, pid: string): UsbIdentificationResult {
  const vidClean = (vid || '').trim().toUpperCase().replace(/^0X/i, '').padStart(4, '0');
  const pidClean = (pid || '').trim().toUpperCase().replace(/^0X/i, '').padStart(4, '0');
  const match = USB_HARDWARE_SIGNATURES.find((s) => s.vid === vidClean && s.pid === pidClean);
  if (match) {
    return { matched: true, ...match };
  }
  return {
    matched: false,
    vid: vidClean,
    pid: pidClean,
    chipset: 'Unknown / Generic USB',
    mode: 'Standard MTP / Composite',
    description: 'جهاز USB غير مدرج في وضعيات التفليش الهندسي الخاصة',
    descriptionEn: 'Standard USB Composite / MTP endpoint outside engineering boot modes.',
    recommended_tools: ['Device Manager / lsusb', 'ADB'],
    risk_level: 'low',
  };
}

export function evaluateDiodeReading(railCode: string, measuredV: number): DiodeEvaluationResult {
  const rail = DIODE_REFERENCE_RAILS.find((r) => r.rail_code.toLowerCase() === (railCode || '').toLowerCase());
  const val = Number(measuredV);

  if (!rail) {
    if (val < 0.05) {
      return {
        rail_code: railCode,
        measured_v: val,
        status: 'SHORT_CIRCUIT',
        diagnosis: 'قصر صريح (Short to GND) — يجب حقن جهد منخفض (1.0V - 1.5V / 2A) لتحديد المكون الساخن',
        diagnosis_en: 'Dead short to GND detected. Inject current-limited 1.0V–1.5V (2A max) with thermal camera.',
        safety_note: 'لا تحقن جهداً يتجاوز 1.5V على خطوط التغذية المنخفضة.',
      };
    }
    if (val > 1.5) {
      return {
        rail_code: railCode,
        measured_v: val,
        status: 'OPEN_LINE',
        diagnosis: 'قطع في المسار (Open Line / OL) — افحص المقاومات والملفات المتصلة بالخط',
        diagnosis_en: 'Open circuit (O.L) — inspect series resistors, inductors, or cracked solder pads.',
        safety_note: 'تأكد من وضع القطب الأحمر على الأرضي (GND) والأسود على نقطة القياس.',
      };
    }
    return {
      rail_code: railCode,
      measured_v: val,
      status: 'NORMAL_RANGE',
      diagnosis: 'القراءة ضمن النطاق الممانعي المقبول مبدئياً',
      diagnosis_en: 'Reading falls within preliminary acceptable impedance range.',
      safety_note: 'قارن القراءة مع البوردة السليمة المطابقة عند توفرها.',
    };
  }

  if (val <= rail.short_threshold) {
    return {
      rail_code: rail.rail_code,
      rail_name_ar: rail.name_ar,
      rail_name_en: rail.name_en,
      measured_v: val,
      expected_range: `${rail.min_v.toFixed(3)}V – ${rail.max_v.toFixed(3)}V`,
      status: 'SHORT_CIRCUIT',
      diagnosis: `قصر حرج على ${rail.name_ar}! المشتبه بهم: ${rail.short_suspects}`,
      diagnosis_en: `Critical Short Circuit on ${rail.name_en}. Suspects: ${rail.short_suspects}`,
      safety_note: 'افصل البطارية والشاحن فوراً واستخدم حقناً محدود التيار (1.0V-1.5V / 2A) فقط.',
    };
  }

  if (val < rail.min_v) {
    return {
      rail_code: rail.rail_code,
      rail_name_ar: rail.name_ar,
      rail_name_en: rail.name_en,
      measured_v: val,
      expected_range: `${rail.min_v.toFixed(3)}V – ${rail.max_v.toFixed(3)}V`,
      status: 'LEAKAGE_LOW',
      diagnosis: `تسريب (ممانعة منخفضة عن الحد الأدنى ${rail.min_v.toFixed(3)}V). افحص: ${rail.short_suspects}`,
      diagnosis_en: `Leakage detected (below ${rail.min_v.toFixed(3)}V floor). Inspect: ${rail.short_suspects}`,
      safety_note: 'تحقق من وجود رطوبة أو أكسدة أو مكثف مسرّب قبل فك الآيسيهات.',
    };
  }

  if (val > rail.max_v || val >= 1.5) {
    return {
      rail_code: rail.rail_code,
      rail_name_ar: rail.name_ar,
      rail_name_en: rail.name_en,
      measured_v: val,
      expected_range: `${rail.min_v.toFixed(3)}V – ${rail.max_v.toFixed(3)}V`,
      status: 'OPEN_LINE',
      diagnosis: `قطع أو ممانعة مرتفعة على ${rail.name_ar}. السبب المحتمل: ${rail.open_suspects}`,
      diagnosis_en: `Open line / high impedance on ${rail.name_en}. Probable cause: ${rail.open_suspects}`,
      safety_note: 'افحص سلامة المسار تحت الميكروسكوب وتتبع الفلاتر والمقاومات التسلسلية.',
    };
  }

  return {
    rail_code: rail.rail_code,
    rail_name_ar: rail.name_ar,
    rail_name_en: rail.name_en,
    measured_v: val,
    expected_range: `${rail.min_v.toFixed(3)}V – ${rail.max_v.toFixed(3)}V`,
    status: 'HEALTHY',
    diagnosis: `مسار سليم 100% — القيمة (${val.toFixed(3)}V) تقع ضمن النطاق المرجعي (${rail.min_v.toFixed(3)}V – ${rail.max_v.toFixed(3)}V)`,
    diagnosis_en: `Healthy rail — reading (${val.toFixed(3)}V) is within reference range (${rail.min_v.toFixed(3)}V – ${rail.max_v.toFixed(3)}V).`,
    safety_note: 'المسار سليم — انتقل لفحص الجهد التشغيلي أو تسلسل الإقلاع.',
  };
}

export function searchDeviceAtlas(query = '', brand = ''): DeviceAtlasEntry[] {
  const q = query.trim().toLowerCase();
  const b = brand.trim().toLowerCase();
  return DEVICE_MODELS_ATLAS.filter((dev) => {
    if (b && b !== 'all' && !dev.brand.toLowerCase().includes(b)) {
      return false;
    }
    if (q) {
      const haystack = `${dev.brand} ${dev.model} ${dev.soc} ${Object.values(dev.ics).join(' ')}`.toLowerCase();
      return haystack.includes(q);
    }
    return true;
  });
}
