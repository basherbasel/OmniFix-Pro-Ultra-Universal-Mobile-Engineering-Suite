import { HardwareRepairGuide } from '../types';

export const HARDWARE_REPAIR_GUIDES: HardwareRepairGuide[] = [
  {
    id: 'charging-vbus-failure',
    titleAr: 'عطل دائرة الشحن ومنفذ Type-C وخط VBUS وتفاوض الشحن السريع',
    titleEn: 'Charging Circuit, Type-C CC Lines, VBUS & Fast Charge PMIC Faults',
    category: 'CHARGING_VBUS',
    symptomAr: 'الهاتف لا يشحن نهائياً، أو يشحن ببطء شديد (0.1A)، أو يسخن منفذ الشحن، أو لا يتعرف على الكمبيوتر عبر USB.',
    symptomEn: 'Device does not charge, draws 0.00A or stuck at 0.10A, excessive heat at port, or USB PC communication fails.',
    affectedComponents: ['BQ25890H', 'MAX77705', 'S2MU106', 'SMB1396', 'Type-C Receptacle', 'OVP Mosfet'],
    boardModel: 'Universal Flagship / Midrange Architecture (Qualcomm & Exynos)',
    testPoints: [
      {
        id: 'tp-vbus-in',
        name: 'TP_VBUS_5V_IN',
        railName: 'VBUS_USB_IN',
        location: 'Capacitor C4012 near Type-C Sub-board / Main FPC connector',
        diodeModeHealthy: '0.520V ~ 0.580V',
        diodeModeToleranceMin: 0.480,
        diodeModeToleranceMax: 0.650,
        voltageWorking: '5.10V / 9.05V (QC/PD)',
        voltageStandby: '0.00V (Unplugged)',
        resistanceToGnd: '> 150 kΩ',
        faultSymptomIfShort: 'Short to GND (0.000V in diode) -> Burnt OVP IC or Sub-board capacitor. Charger cuts out immediately.',
        faultSymptomIfOpen: 'Open Line (OL) -> Broken Type-C pin, fractured FPC flex cable, or blown series protection filter.',
        diagramCoord: { x: 18, y: 78 }
      },
      {
        id: 'tp-cc1-pd',
        name: 'TP_CC1_NEGOTIATE',
        railName: 'USB_CC1_LINE',
        location: 'Testpad TP402 adjacent to Charge Controller',
        diodeModeHealthy: '0.620V ~ 0.690V',
        diodeModeToleranceMin: 0.580,
        diodeModeToleranceMax: 0.750,
        voltageWorking: '1.68V (Active PD negotiation)',
        voltageStandby: '0.00V',
        resistanceToGnd: '> 200 kΩ',
        faultSymptomIfShort: 'Fast charge (9V/20V) fails; phone only charges in slow 500mA legacy mode.',
        faultSymptomIfOpen: 'No reverse plug orientation detection or OTG failure.',
        diagramCoord: { x: 26, y: 82 }
      },
      {
        id: 'tp-vsys-vbat',
        name: 'TP_VSYS_OUT',
        railName: 'VSYS / VBAT_SENSE',
        location: 'Large Inductor L4001 (Charging Coil)',
        diodeModeHealthy: '0.380V ~ 0.440V',
        diodeModeToleranceMin: 0.340,
        diodeModeToleranceMax: 0.490,
        voltageWorking: '3.70V - 4.35V (Battery Level)',
        voltageStandby: '3.85V',
        resistanceToGnd: '> 80 kΩ',
        faultSymptomIfShort: 'Full motherboard dead short. Battery drains immediately or triggers protection BMS shutoff.',
        faultSymptomIfOpen: 'Charge IC heats up to 90°C without power transferring to battery.',
        diagramCoord: { x: 38, y: 65 }
      },
      {
        id: 'tp-bat-therm',
        name: 'TP_BAT_THERM_NTC',
        railName: 'BAT_TEMP_SENSE',
        location: 'Battery Connector Pin 3 / R4015 Thermistor',
        diodeModeHealthy: '0.610V ~ 0.670V',
        diodeModeToleranceMin: 0.550,
        diodeModeToleranceMax: 0.720,
        voltageWorking: '1.80V (Reference pull-up)',
        voltageStandby: '1.80V',
        resistanceToGnd: '10 kΩ NTC',
        faultSymptomIfShort: 'Warning: "Charging paused. Battery temperature too low" or too high.',
        faultSymptomIfOpen: 'Phone refuses to charge with yellow triangle warning icon.',
        diagramCoord: { x: 48, y: 72 }
      }
    ],
    boardChips: [
      {
        id: 'chip-ovp',
        designator: 'U4001',
        partNumber: 'ET9530L (OVP Switch)',
        roleAr: 'حماية مسار الفولت العالي من الارتفاع المفاجئ (Over-Voltage Protection)',
        roleEn: 'Over-Voltage & Surge Protection Switch',
        category: 'CHARGING_VBUS',
        x: 15,
        y: 72,
        width: 12,
        height: 10,
        color: '#38bdf8',
        pinCount: 12,
        packageType: 'WLCSP-12',
        commonDefects: ['Short to ground on VBUS_IN', 'Failure to pass voltage to VBUS_OUT', 'Burnt silicone casing']
      },
      {
        id: 'chip-charger-ic',
        designator: 'U4002',
        partNumber: 'MAX77705 / BQ25890H',
        roleAr: 'معالج الشحن الرئيسي وإدارة بروتوكول USB-PD و QC4+',
        roleEn: 'Main Switching Charger & USB Type-C PD Controller',
        category: 'CHARGING_VBUS',
        x: 32,
        y: 60,
        width: 18,
        height: 16,
        color: '#06b6d4',
        pinCount: 42,
        packageType: 'BGA-42',
        commonDefects: ['False charging (shows icon but percentage drops)', 'Hot to touch upon plugging cable', 'No OTG 5V boost output']
      }
    ],
    microSolderingSteps: [
      {
        stepNumber: 1,
        titleAr: 'إزالة الغطاء المعدني (Shielding Can) وعزل الكاميرات والقطع الحساسة',
        titleEn: 'Shield Can Removal & Thermal Masking',
        hotAirTemp: '340°C - 350°C',
        airFlow: '30%',
        solderPasteAlloy: 'Low-Melt Bismuth Sn42/Bi58 (138°C) for frame desoldering',
        stencilType: 'N/A (Desoldering)',
        procedureAr: 'استخدم شريط الكابتون (Kapton Tape) والفويل العازل لتغطية معالج CPU وذاكرة UFS المجاورة لحمايتها من الحرارة الزائدة أثناء فك الشيلد.',
        procedureEn: 'Apply high-temp polyimide Kapton tape and heat sinks over adjacent SoC and UFS chips to prevent thermal dissipation damage.',
        safetyWarningAr: 'تحذير: لا ترفع درجة الهواء فوق 350°C بالقرب من الرام والذاكرة لتفادي انفصال كرات القصدير (Underfilled SoC popcorning).',
        safetyWarningEn: 'Warning: Keep nozzle moving constantly. Do not focus stationary heat near epoxy-underfilled CPU.'
      },
      {
        stepNumber: 2,
        titleAr: 'رفع شريحة الشحن BQ/MAX المتضررة وتنظيف وسادات اللحام (Pads)',
        titleEn: 'Faulty IC Desoldering & Pad Wick Cleaning',
        hotAirTemp: '365°C - 375°C',
        airFlow: '40%',
        solderingIronTemp: '350°C',
        solderPasteAlloy: 'Sn63/Pb37 Leaded Solder for pad leveling',
        stencilType: 'AMAOE BGA Reballing Stencil (0.12mm thickness)',
        procedureAr: 'ضع كمية مناسبة من الفلاكس الممتاز (Amtech NC-559-V2). عند ذوبان القصدير ارفع الآيسي بلطف بملقط دقيق، ثم نظف البادات بشيلد نحاسي مفرغ (Desoldering Wick).',
        procedureEn: 'Apply premium tacky flux (Amtech NC-559). Nudge gently; when solder liquefies, lift vertically with fine titanium tweezers. Clean PCB pads using copper wick.',
        safetyWarningAr: 'احذر خدش طبقة السولدر ماسك الخضراء حتى لا تتلامس الخطوط مع الأرضي.',
        safetyWarningEn: 'Ensure zero mechanical pulling force before solder is fully molten to prevent ripped PCB pads.'
      },
      {
        stepNumber: 3,
        titleAr: 'شبلنة الآيسي الجديد (Reballing) وتثبيته على البوردة',
        titleEn: 'IC Reballing & Precision Board Alignment',
        hotAirTemp: '320°C (for Stencil) / 360°C (for Board Soldering)',
        airFlow: '25% - 35%',
        solderPasteAlloy: 'Mechanic Sn63/Pb37 183°C Solder Paste (Type 4 or 5)',
        stencilType: 'Custom Magnetic Stencil 0.12mm',
        procedureAr: 'امسح معجون القصدير في ثقوب الشبلونة، سخن بهدوء لتكوين كرات متساوية 100%، ثم ركب الآيسي على البوردة مع محاذاة نقطة التوجيه (Dot Pin 1).',
        procedureEn: 'Squeegee solder paste into stencil apertures, heat gently until uniform spheres form. Align Pin 1 dot with PCB silk screen markings and solder down.',
        safetyWarningAr: 'تأكد من عودة الآيسي إلى مكانه بفعل الشد السطحي للقصدير (Surface Tension Self-Centering) قبل إيقاف الحرارة.',
        safetyWarningEn: 'Watch for the component to settle and gently tap it with tweezers to verify liquid ball cohesion.'
      }
    ],
    shortIsolationGuide: {
      safeCurrentInjectionVoltage: '1.20V - 1.80V (Do NOT inject 5V on raw motherboard rails!)',
      maxCurrentLimit: '2.50 Amperes',
      rosinFluxMethodAr: 'قم بتبخير صمغ الراتنج (Rosin Smoke) برأس الكاوية لتكوين طبقة بيضاء رقيقة فوق الدائرة. عند حقن التيار من الباور سبلاي، سيذوب الراتنج فوراً فوق المكثف أو الآيسي المسبب للشورت.',
      rosinFluxMethodEn: 'Atomize solid Rosin flux over the component zone to coat it with frosty white residue. Inject DC voltage; the defective shorted capacitor or IC will melt the frosty rosin instantly.',
      thermalCameraCluesAr: 'استخدم الكاميرا الحرارية لرصد نقطة الانبعاث الحراري الأولية (Primary Hotspot) في الأجزاء الأولى من الثانية لتجنب سخونة القطع المجاورة بالحث.',
      thermalCameraCluesEn: 'Capture the initial thermal spike within the first 500ms using a thermal imager to identify the exact culprit rather than secondary heat sinks.'
    }
  },
  {
    id: 'power-pmic-buck-rail-failure',
    titleAr: 'عطل دائرة الباور الرئيسية (Main PMIC) وملفات البك (Buck Coils) واختناق الإقلاع',
    titleEn: 'Main Power PMIC, Buck Switching Regulators & VDD_MAIN Short-Circuit',
    category: 'POWER_PMIC',
    symptomAr: 'الهاتف ميت تماماً (Dead Boot)، سحب تيار ثابت على الباور سبلاي (Stuck on 0.05A - 0.18A)، أو شورت مباشر على مسار البطارية VBAT/VDD_MAIN.',
    symptomEn: 'Completely dead phone, frozen DC power supply current (stuck at 0.05A to 0.18A on power key), or dead short on main power rail.',
    affectedComponents: ['Qualcomm PM8150 / PM8550', 'MediaTek MT6359P', 'Exynos Shannon S2MPS', 'Apple Main PMIC', 'Buck Inductors (LDO / VDD_CORE)'],
    boardModel: 'Multi-SoC Power Tree Reference Architecture',
    testPoints: [
      {
        id: 'tp-vdd-main',
        name: 'TP_VDD_MAIN / VPH_PWR',
        railName: 'VPH_PWR_SYSTEM',
        location: 'Capacitor Bank C1008 adjacent to Primary PMIC',
        diodeModeHealthy: '0.410V ~ 0.470V',
        diodeModeToleranceMin: 0.380,
        diodeModeToleranceMax: 0.520,
        voltageWorking: '3.80V - 4.20V',
        voltageStandby: '3.80V',
        resistanceToGnd: '> 45 kΩ',
        faultSymptomIfShort: 'Total dead device. Power supply trips immediately upon connecting battery terminal.',
        faultSymptomIfOpen: 'No secondary power generation. PMIC completely unpowered.',
        diagramCoord: { x: 52, y: 38 }
      },
      {
        id: 'tp-vdd-core-buck',
        name: 'TP_BUCK_0.8V_CORE',
        railName: 'VDD_CORE_CPU_LOWER',
        location: 'Coil L1003 (Low Resistance CPU Power Rail)',
        diodeModeHealthy: '0.080V ~ 0.140V (Low Diode Normal)',
        diodeModeToleranceMin: 0.060,
        diodeModeToleranceMax: 0.180,
        voltageWorking: '0.75V - 0.85V (Dynamic Frequency Scaling)',
        voltageStandby: '0.00V',
        resistanceToGnd: '15 Ω ~ 45 Ω (Normal CPU Resistance)',
        faultSymptomIfShort: 'True short (0.000V & 0.0Ω) indicates damaged CPU core silicon or cracked decoupling MLCC under SoC.',
        faultSymptomIfOpen: 'CPU never receives core logic power; device stays in 9008/BROM or dead state.',
        diagramCoord: { x: 62, y: 32 }
      },
      {
        id: 'tp-vreg-l18-io',
        name: 'TP_VREG_L18_1.8V',
        railName: 'VDD_1V8_ALWAYS_ON',
        location: 'Testpoint TP18 near RTC Crystal (32.768 kHz)',
        diodeModeHealthy: '0.480V ~ 0.530V',
        diodeModeToleranceMin: 0.440,
        diodeModeToleranceMax: 0.580,
        voltageWorking: '1.80V Constant',
        voltageStandby: '1.80V',
        resistanceToGnd: '> 60 kΩ',
        faultSymptomIfShort: 'Power button does nothing; PMIC cannot initialize state machine logic.',
        faultSymptomIfOpen: 'I2C communication bus lines frozen at 0V; device fails to boot to bootloader.',
        diagramCoord: { x: 44, y: 28 }
      },
      {
        id: 'tp-ps-hold',
        name: 'TP_PS_HOLD_CPU',
        railName: 'AP_PS_HOLD_IN',
        location: 'Resistor R1045 connecting AP SoC to PMIC',
        diodeModeHealthy: '0.510V ~ 0.570V',
        diodeModeToleranceMin: 0.470,
        diodeModeToleranceMax: 0.620,
        voltageWorking: '1.80V (Must remain HIGH for continuous power)',
        voltageStandby: '0.00V',
        resistanceToGnd: '> 100 kΩ',
        faultSymptomIfShort: 'Phone powers on momentarily while holding power key, then shuts down instantly when released.',
        faultSymptomIfOpen: 'AP fails to latch power tree; PMIC cycles into reboot loop every 3 seconds.',
        diagramCoord: { x: 58, y: 48 }
      }
    ],
    boardChips: [
      {
        id: 'chip-main-pmic',
        designator: 'U1000',
        partNumber: 'PM8150 / MT6359P',
        roleAr: 'وحدة إدارة وتوزيع الطاقة المركزية (Master PMIC)',
        roleEn: 'Master System Power Management Integrated Circuit',
        category: 'POWER_PMIC',
        x: 48,
        y: 24,
        width: 22,
        height: 22,
        color: '#818cf8',
        pinCount: 156,
        packageType: 'BGA-156',
        commonDefects: ['Short on VPH_PWR rail', 'Absence of VDD_1V8_RTC voltage', 'Overheating under 0.15A idle draw']
      },
      {
        id: 'chip-sub-pmic',
        designator: 'U1200',
        partNumber: 'PMI8150 / MT6360',
        roleAr: 'وحدة إدارة طاقة العرض والملحقات والشحن الثانوي (Secondary PMIC)',
        roleEn: 'Secondary PMIC / Display & Haptics Driver',
        category: 'POWER_PMIC',
        x: 74,
        y: 35,
        width: 16,
        height: 14,
        color: '#a855f7',
        pinCount: 88,
        packageType: 'BGA-88',
        commonDefects: ['Display bias rail breakdown (+5V/-5V)', 'Flashlight LED driver failure']
      }
    ],
    microSolderingSteps: [
      {
        stepNumber: 1,
        titleAr: 'فحص ممانعات ملفات البك (Buck Coils) قبل رفع الآيسي',
        titleEn: 'Pre-Desoldering Diode Verification on all Buck Inductors',
        hotAirTemp: 'Off (Cold Diagnostics)',
        airFlow: '0%',
        solderPasteAlloy: 'N/A',
        stencilType: 'N/A',
        procedureAr: 'ضع المجس الأحمر على الأرضي GND والمجس الأسود على طرف كل ملف حول الآيسي. إذا كان الممانعة 0.000V على مسار 1.8V أو VPH فهناك شورت صريح يتطلب الحقن.',
        procedureEn: 'Probe all major coils in diode mode with red probe on ground. Identify whether short is on primary power rail (VPH) or low-voltage core logic.',
        safetyWarningAr: 'ملفات VDD_CORE بطبيعتها تعطي ممانعة منخفضة (0.070V - 0.120V) بسبب بنية المعالج ولا تعني شورت.',
        safetyWarningEn: 'SoC core voltage rails naturally present low resistance (15-40Ω). Do not mistake normal core resistance for a dead short.'
      },
      {
        stepNumber: 2,
        titleAr: 'إزالة PMIC وشبلنته بدقة متناهية مع ضبط سماكة القصدير',
        titleEn: 'PMIC Removal & High-Density Reballing',
        hotAirTemp: '370°C - 380°C',
        airFlow: '45%',
        solderingIronTemp: '360°C',
        solderPasteAlloy: 'Mechanic 183°C Middle-Melt Alloy',
        stencilType: 'High-Precision Black Stencil 0.12mm',
        procedureAr: 'استخدم فوهة هواء متوسطة، وزع الحرارة بشكل دائري حول الباكج لمدة 30-40 ثانية حتى تلين كرات اللحام تحت الآيسي، ثم ارفعه رأسياً دون لمس المكثفات المحيطة.',
        procedureEn: 'Circle hot air around the PMIC uniformly for 35 seconds. Lift with vacuum pen or curved tweezers. Clean the motherboard pads smoothly.',
        safetyWarningAr: 'احذر تسريب الحرارة إلى المعالج في الجهة المقابلة للبوردة (Dual-Sided PCB). ضع مشتت حراري على الوجه الخلفي.',
        safetyWarningEn: 'If CPU is on the reverse side of the PCB, affix copper tape and thermal dissipation pads to protect against CPU ball bridging.'
      }
    ],
    shortIsolationGuide: {
      safeCurrentInjectionVoltage: '1.00V - 1.20V (Never inject full VBAT on secondary rails!)',
      maxCurrentLimit: '3.00 Amperes',
      rosinFluxMethodAr: 'عند حقن 1.2V على خط VPH_PWR، راقب ذوبان الراتنج. المكثف المتفحم أو الآيسي المضروب سيتحول لونه من الأبيض المعتم إلى الشفاف خلال ثانية واحدة.',
      rosinFluxMethodEn: 'Inject 1.2V at VPH_PWR rail; the offending decoupling capacitor or broken LDO inside the PMIC will melt the white frost in <1 second.',
      thermalCameraCluesAr: 'المكثفات التالفة عادة ما تظهر كبقعة حرارة حمراء دائرية مركزة جداً لا تتجاوز 1 ملم.',
      thermalCameraCluesEn: 'Shorted multilayer ceramic capacitors (MLCC) appear as pinpoint 1mm extreme hotspots compared to diffused IC heat distribution.'
    }
  },
  {
    id: 'display-backlight-amoled-failure',
    titleAr: 'عطل إضاءة الشاشة (Backlight Boost) وجهود تشغيل شاشات AMOLED (+5V / -5V / 1.8V)',
    titleEn: 'Display Backlight, AMOLED Bias Power (+5V/-5V) & Touch IC Circuit',
    category: 'DISPLAY_BACKLIGHT',
    symptomAr: 'الهاتف يعمل ويرن لكن الشاشة سوداء تماماً، أو إضاءة خافتة جداً تظهر فقط تحت ضوء كشاف (Loss of Backlight)، أو اللمس متوقف.',
    symptomEn: 'Phone rings and vibrates but screen is completely dark, dim ghost image visible under flashlight, or unresponsive touch digitizer.',
    affectedComponents: ['Backlight Driver IC', 'Boost Diode (Schottky)', 'Boost Inductor (10µH / 22µH)', 'AMOLED Bias PMIC (S2DOS05 / TPS65633)', 'FPC Display Connector'],
    boardModel: 'OLED / IPS Display Power Stage',
    testPoints: [
      {
        id: 'tp-vsp-pos-5v',
        name: 'TP_VSP_+4.6V_ELVDD',
        railName: 'DISPLAY_AVDD_+4.6V',
        location: 'Capacitor C2040 next to Display FPC Pin 12',
        diodeModeHealthy: '0.490V ~ 0.560V',
        diodeModeToleranceMin: 0.450,
        diodeModeToleranceMax: 0.610,
        voltageWorking: '+4.60V to +5.00V (When Screen On)',
        voltageStandby: '0.00V (Screen Sleep)',
        resistanceToGnd: '> 90 kΩ',
        faultSymptomIfShort: 'Screen stays pitch black; OLED panel cannot illuminate organic diode matrix.',
        faultSymptomIfOpen: 'Intermittent screen flicker or vertical color lines.',
        diagramCoord: { x: 82, y: 70 }
      },
      {
        id: 'tp-vsn-neg-5v',
        name: 'TP_VSN_-4.4V_ELVSS',
        railName: 'DISPLAY_AVEE_-4.4V',
        location: 'Capacitor C2042 (Negative Charge Pump Output)',
        diodeModeHealthy: '0.510V ~ 0.580V',
        diodeModeToleranceMin: 0.470,
        diodeModeToleranceMax: 0.630,
        voltageWorking: '-4.40V to -4.80V Negative Bias',
        voltageStandby: '0.00V',
        resistanceToGnd: '> 90 kΩ',
        faultSymptomIfShort: 'Bias PMIC shuts down automatically due to OCP (Over-Current Protection). No display.',
        faultSymptomIfOpen: 'Distorted grayscale contrast and inverted colors.',
        diagramCoord: { x: 86, y: 74 }
      },
      {
        id: 'tp-led-anode',
        name: 'TP_BACKLIGHT_ANODE_BOOST',
        railName: 'LCM_LED_ANODE_25V',
        location: 'Cathode of Schottky Diode D2001 (IPS LCD Only)',
        diodeModeHealthy: '0.540V ~ 0.600V',
        diodeModeToleranceMin: 0.490,
        diodeModeToleranceMax: 0.680,
        voltageWorking: '20.0V - 32.0V High Voltage Boost',
        voltageStandby: '3.80V (VBAT Pass-through)',
        resistanceToGnd: '> 200 kΩ',
        faultSymptomIfShort: 'Blown backlight coil with visible smoke; burning smell on motherboard.',
        faultSymptomIfOpen: 'Backlight fails completely; dark display with image visible under external light.',
        diagramCoord: { x: 80, y: 58 }
      }
    ],
    boardChips: [
      {
        id: 'chip-oled-pmic',
        designator: 'U2001',
        partNumber: 'TPS65633 / S2DOS05',
        roleAr: 'مولد جهود التغذية الموجبة والسالبة لشاشات AMOLED',
        roleEn: 'Triple-Output AMOLED Display Bias Power IC',
        category: 'DISPLAY_BACKLIGHT',
        x: 78,
        y: 62,
        width: 14,
        height: 12,
        color: '#f59e0b',
        pinCount: 16,
        packageType: 'QFN-16',
        commonDefects: ['Short on VSN negative charge pump rail', 'Cracked ceramic boost inductor', 'Blown output filter capacitor']
      }
    ],
    microSolderingSteps: [
      {
        stepNumber: 1,
        titleAr: 'فحص ملامسات كونكتر الشاشة (Display FPC Connector)',
        titleEn: 'FPC Connector Pin Inspection & Burn Check',
        hotAirTemp: 'Off',
        airFlow: '0%',
        solderPasteAlloy: 'N/A',
        stencilType: 'N/A',
        procedureAr: 'افحص كونكتر الشاشة تحت الميكروسكوب للتأكد من عدم وجود كربون أو تفحم على أسنان التغذية العالية (+5V و -5V أو خط الأنود 25V).',
        procedureEn: 'Inspect FPC pins under stereo microscope for carbonization, corrosion, or bent pins caused by improper battery connection order.',
        safetyWarningAr: 'افصل البطارية دائماً قبل نزع أو تركيب فلاتة الشاشة لتفادي احتراق آيسي الإضاءة بسبب شرارة الفولت العالي.',
        safetyWarningEn: 'Always disconnect battery before plugging/unplugging display flex to prevent instant inductive blow-out of boost diode.'
      },
      {
        stepNumber: 2,
        titleAr: 'استبدال ملف البوست والشوتكي دايود (Boost Coil & Diode)',
        titleEn: 'Boost Inductor & Schottky Diode Replacement',
        hotAirTemp: '360°C',
        airFlow: '35%',
        solderingIronTemp: '350°C',
        solderPasteAlloy: 'Sn63/Pb37',
        stencilType: 'N/A (Discretes)',
        procedureAr: 'في شاشات LCD، احتراق الدايود أو ملف 10µH هو السبب في 90% من انقطاع الإضاءة. ارفع القطعة التالفة وركب دايود شوتكي جديد بنفس القطبية (Cathode Bar Marking).',
        procedureEn: 'Replace the 10µH/22µH boost inductor and Schottky diode. Pay critical attention to the cathode stripe orientation marking on the diode.',
        safetyWarningAr: 'تركيب الدايود بالعكس سيتسبب في قفل مسار VBAT مع الأرضي واحتراق الآيسي فوراً.',
        safetyWarningEn: 'Reversing diode polarity will cause catastrophic short between VBAT and GND upon power-on.'
      }
    ],
    shortIsolationGuide: {
      safeCurrentInjectionVoltage: '3.00V on VSP (+5V Rail) / 1.00V on VSN (-4.4V Rail)',
      maxCurrentLimit: '1.50 Amperes',
      rosinFluxMethodAr: 'بخر الراتنج حول كونكتر الشاشة وآيسي التغذية، ثم احقن الفولت على المكثف المشتبه به لمشاهدة التبخر.',
      rosinFluxMethodEn: 'Coat the display power stage with rosin; inject voltage on the suspect filter capacitor.',
      thermalCameraCluesAr: 'المكثفات السيراميكية على مسار VSP غالباً ما تعطب وتسبب حرارة شديدة بجوار كونكتر الشاشة.',
      thermalCameraCluesEn: 'Decoupling ceramic capacitors on high-voltage output filter lines are prone to dielectric breakdown and intense pinpoint heating.'
    }
  },
  {
    id: 'baseband-rf-transceiver-failure',
    titleAr: 'عطل معالج الإشارة والشبكة (RF Transceiver / WTR) ومضخمات الطاقة (PA)',
    titleEn: 'Baseband RF Transceiver (WTR5975/MT6177), RFFE Bus & PA Signal Loss',
    category: 'BASEBAND_RF',
    symptomAr: 'لا توجد خدمة (No Service)، طوارئ فقط (Emergency Calls Only)، اختفاء إصدار البيسباند (Baseband Unknown)، أو سحب عالي عند محاولة الاتصال.',
    symptomEn: 'No Service, Emergency Calls Only, Baseband version showing Unknown, or massive current spike during cellular call attempts.',
    affectedComponents: ['Qualcomm WTR5975 / SDR865 / SDR735', 'MediaTek MT6177 / MT6190', 'Skyworks / Qorvo Power Amplifier Modules', 'RF Front-End PMIC (SDR PMIC)'],
    boardModel: '5G / LTE Multi-Band RF Section',
    testPoints: [
      {
        id: 'tp-vreg-rf-1p0',
        name: 'TP_VREG_SDR_1.0V',
        railName: 'VDD_RF_ANALOG_1V0',
        location: 'LDO Output Capacitor C3010 next to WTR Transceiver',
        diodeModeHealthy: '0.420V ~ 0.480V',
        diodeModeToleranceMin: 0.390,
        diodeModeToleranceMax: 0.520,
        voltageWorking: '1.00V Clean Analog Power',
        voltageStandby: '0.00V (Flight Mode)',
        resistanceToGnd: '> 50 kΩ',
        faultSymptomIfShort: 'Baseband DSP crashes on boot; phone reports "Baseband: UNKNOWN".',
        faultSymptomIfOpen: 'Transceiver cannot synthesize local oscillator RF frequencies; complete zero signal bars.',
        diagramCoord: { x: 30, y: 22 }
      },
      {
        id: 'tp-rffe-clk',
        name: 'TP_RFFE1_CLK_AP',
        railName: 'RF_FRONT_END_CLK',
        location: 'Series Resistor R3020 (RFFE Bus)',
        diodeModeHealthy: '0.510V ~ 0.560V',
        diodeModeToleranceMin: 0.470,
        diodeModeToleranceMax: 0.600,
        voltageWorking: '1.80V Square Wave Logic (26MHz / 52MHz)',
        voltageStandby: '0.00V',
        resistanceToGnd: '> 100 kΩ',
        faultSymptomIfShort: 'All Power Amplifier (PA) modules on RFFE bus stop communicating; radio disabled.',
        faultSymptomIfOpen: 'Band switching fails (device works on 2G but fails on 4G/5G).',
        diagramCoord: { x: 22, y: 28 }
      }
    ],
    boardChips: [
      {
        id: 'chip-rf-transceiver',
        designator: 'U3000',
        partNumber: 'WTR5975 / SDR865',
        roleAr: 'معالج الإرسال والاستقبال اللاسلكي RF وتحويل الترددات',
        roleEn: 'RF Transceiver & Intermediate Frequency Synthesizer',
        category: 'BASEBAND_RF',
        x: 24,
        y: 18,
        width: 16,
        height: 16,
        color: '#ec4899',
        pinCount: 144,
        packageType: 'BGA-144',
        commonDefects: ['Internal analog rail short', 'Cold solder joints after phone drops', 'Unknown baseband error']
      }
    ],
    microSolderingSteps: [
      {
        stepNumber: 1,
        titleAr: 'إعادة التسخين مع الفلاكس (Reflow) أو الرفع والشبلنة (Reball)',
        titleEn: 'WTR/SDR Transceiver Reflow & Reball Procedure',
        hotAirTemp: '365°C',
        airFlow: '35%',
        solderingIronTemp: '350°C',
        solderPasteAlloy: 'Sn63/Pb37 183°C',
        stencilType: 'Qualcomm SDR/WTR Dedicated BGA Stencil',
        procedureAr: 'نظراً لصغر حجم نقاط الآيسي وحساسيتها للصدمات، فإن سقوط الهاتف غالباً ما يسبب انفصال كرات اللحام. قم بشبلنة الآيسي أو استبداله بآيسي جديد أصلي.',
        procedureEn: 'Mechanical drops cause cracked micro-balls under WTR. Remove, reball with 0.12mm stencil, or replace with genuine new IC.',
        safetyWarningAr: 'احذر تسخين فلاتر SAW وكريستالة 38.4MHz المجاورة بحرارة مباشرة مفرطة.',
        safetyWarningEn: 'Avoid directing direct high-heat blast onto delicate ceramic SAW filters and TCXO 38.4MHz reference clock crystal.'
      }
    ],
    shortIsolationGuide: {
      safeCurrentInjectionVoltage: '1.00V on Analog RF Rails',
      maxCurrentLimit: '1.50 Amperes',
      rosinFluxMethodAr: 'بخر الراتنج فوق قسم الشبكة RF. عند حقن 1.0V على مسار التغذية، سيظهر الآيسي أو المكثف المعطوب فوراً.',
      rosinFluxMethodEn: 'Apply rosin smoke over RF shielding area; inject 1.0V into analog supply pin.',
      thermalCameraCluesAr: 'مضخمات الطاقة (PA) تسخن بشدة عند محاولة إجراء مكالمة هاتفية إذا كانت متضررة داخلياً.',
      thermalCameraCluesEn: 'Damaged power amplifier (PA) modules exhibit immediate thermal runaways during cellular transmit bursts.'
    }
  },
  {
    id: 'flagship-2026-pmic-diode-reference',
    titleAr: 'قواعد بيانات ممانعة الملتيميتر لأجهزة الفلاج شيب 2026 (Samsung S26 / iPhone 16 Pro / Snapdragon 8 Gen 4-5 / A18-A19 Pro)',
    titleEn: '2026 Flagship Multimeter Diode Mode Master Reference (Galaxy S26, iPhone 16/17 Pro, Snapdragon 8 Gen 4/5, A18/A19)',
    category: 'POWER_PMIC',
    symptomAr: 'شورت صريح أو تسريب بالمايكرو أمبير (Micro-Leakage) على خطوط المعالج وذاكرة UFS 4.0 و شريحة AI NPU.',
    symptomEn: 'Full short circuit, micro-leakage current draw (15mA - 120mA) on CPU Cores, UFS 4.0 Storage, or AI Acceleration Cores.',
    affectedComponents: ['Qualcomm PM8550 / PM8650 / PM8750', 'Apple PMU A18/A19 Pro', 'Samsung Exynos S2MU005 PMIC', 'MediaTek MT6368 PMIC', 'UFS 4.0 NAND Controller'],
    boardModel: '2026 Ultra-High Density Multi-Layer Stacked Motherboard Architecture',
    testPoints: [
      {
        id: 'tp-vdd-cpu-core-2026',
        name: 'TP_VDD_CPU_SUPERCORE_0V8',
        railName: 'VDD_CPU_PRIME_CORE',
        location: 'Buck Coil L1001 near Main AP Processor / PM8750 PMIC',
        diodeModeHealthy: '0.045V ~ 0.085V',
        diodeModeToleranceMin: 0.035,
        diodeModeToleranceMax: 0.120,
        voltageWorking: '0.78V - 0.92V Dynamic Voltage Scaling (DVS)',
        voltageStandby: '0.00V',
        resistanceToGnd: '12 Ω ~ 28 Ω (Very Low Natural Resistance for Prime Cores)',
        faultSymptomIfShort: '0.000V in diode mode -> Direct CPU silicon die junction breakdown. Board dead.',
        faultSymptomIfOpen: 'Open Line -> Fractured BGA solder ball under CPU or blown PMIC inductor.',
        diagramCoord: { x: 50, y: 40 }
      },
      {
        id: 'tp-vdd-ufs4-1p8',
        name: 'TP_VDD_UFS_4P0_1V8',
        railName: 'VDD_UFS_LOGIC_1V8',
        location: 'Capacitor C2005 adjacent to UFS 4.0 Storage BGA',
        diodeModeHealthy: '0.380V ~ 0.440V',
        diodeModeToleranceMin: 0.350,
        diodeModeToleranceMax: 0.480,
        voltageWorking: '1.80V Constant Power',
        voltageStandby: '1.80V',
        resistanceToGnd: '> 85 kΩ',
        faultSymptomIfShort: 'Storage controller fails to initialize; device stuck in EDL/BROM mode or logo bootloop.',
        faultSymptomIfOpen: 'Device reports "Storage Corrupted" or "UFS Device Read Error".',
        diagramCoord: { x: 65, y: 55 }
      },
      {
        id: 'tp-vcca-display-120hz',
        name: 'TP_VCCA_OLED_AMOLED_4V6',
        railName: 'VCCA_OLED_BIAS_4V6',
        location: 'Filter Capacitor C5008 on OLED Display FPC Socket',
        diodeModeHealthy: '0.520V ~ 0.580V',
        diodeModeToleranceMin: 0.480,
        diodeModeToleranceMax: 0.620,
        voltageWorking: '4.60V High Efficiency OLED Bias Supply',
        voltageStandby: '0.00V',
        resistanceToGnd: '> 180 kΩ',
        faultSymptomIfShort: 'Black screen, display flickers once then shuts down; phone still vibrates on boot.',
        faultSymptomIfOpen: 'Complete black screen without touch response backlight.',
        diagramCoord: { x: 35, y: 70 }
      },
      {
        id: 'tp-vbus-pd3-20v',
        name: 'TP_VBUS_PD3_FASTCHARGE_20V',
        railName: 'VBUS_TYPE_C_PD3_IN',
        location: 'Input Filter Mosfet Q4002 / Type-C Connector Line',
        diodeModeHealthy: '0.540V ~ 0.610V',
        diodeModeToleranceMin: 0.500,
        diodeModeToleranceMax: 0.680,
        voltageWorking: '5.0V / 9.0V / 15.0V / 20.0V PPS Fast Charging Input',
        voltageStandby: '0.00V',
        resistanceToGnd: '> 220 kΩ',
        faultSymptomIfShort: 'Charger triggers overcurrent shutdown immediately upon insertion.',
        faultSymptomIfOpen: 'Phone charges only at standard 5V 500mA slow USB speed.',
        diagramCoord: { x: 20, y: 80 }
      }
    ],
    boardChips: [
      {
        id: 'chip-pmic-flagship-2026',
        designator: 'U1000',
        partNumber: 'PM8750 / Apple PMU A19 Pro',
        roleAr: 'معالج الطاقة الرئيسي لأجهزة الفلاج شيب وإدارة الفولتيات الدقيقة',
        roleEn: 'Main Power Management IC & Precision Dynamic Buck Regulators',
        category: 'POWER_PMIC',
        x: 48,
        y: 35,
        width: 18,
        height: 18,
        color: '#6366f1',
        pinCount: 220,
        packageType: 'WLCSP-220',
        commonDefects: ['Buck rail short circuit due to water ingress', 'Thermal degradation under high-power gaming/AI processing', 'Missing 1.8V PMIC EN signal']
      }
    ],
    microSolderingSteps: [
      {
        stepNumber: 1,
        titleAr: 'فصل وتثبيت الطبقات المزدوجة (Stacked Motherboard Interposer Split)',
        titleEn: 'Double-Decker Stacked Motherboard Separation & Reballing Procedure',
        hotAirTemp: '280°C - 310°C (Preheating Plate: 180°C)',
        airFlow: '30%',
        solderingIronTemp: '360°C',
        solderPasteAlloy: 'Low-Melt Sn42/Bi58 (138°C) for Interposer or Medium-Melt Sn64/Bi35/Ag1 (158°C)',
        stencilType: '2026 Precision Stacked Board Middle Layer Stencil',
        procedureAr: 'استخدم منصة التسخين السفلي (Preheating Station) على درجة 180°C، ثم ارفع البوردة العلوية بحرص بدون الضغط على معالج النظام.',
        procedureEn: 'Use lower preheater platform at 180°C; gently separate the upper RF logic board once interposer solder melts.',
        safetyWarningAr: 'تجنب تحريك الشريحة السفلية أفقياً أثناء انصهار السولدر لتفادي تداخل كرات المعالج الرئيسية.',
        safetyWarningEn: 'Never apply horizontal shear stress while interposer balls are molten to prevent CPU ball bridges.'
      }
    ],
    shortIsolationGuide: {
      safeCurrentInjectionVoltage: '0.80V on CPU Buck Rails / 1.80V on Logic Rails',
      maxCurrentLimit: '3.00 Amperes',
      rosinFluxMethodAr: 'بخر الراتنج بدقة فوق مكثفات التصفية المجاورة لآيسي الباور والمعالج، ثم احقن الفولت المباشر.',
      rosinFluxMethodEn: 'Coat decoupling capacitor array around main PMIC with rosin; inject 0.8V into affected buck line.',
      thermalCameraCluesAr: 'الكاميرا الحرارية ستكشف نقطة التبخر السريعة فور انبعاث الحرارة من المكثف التالف.',
      thermalCameraCluesEn: 'Thermal imaging camera immediately highlights microscopic shorted MLCC capacitors.'
    }
  }
];

