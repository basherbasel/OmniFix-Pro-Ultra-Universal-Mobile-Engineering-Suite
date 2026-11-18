/**
 * DC Power Supply Boot-Sequence & Current Draw Diagnostic Engine.
 * Analyzes pre-boot leakage (before pressing power key) and post-boot current draw (mA)
 * across Apple, Qualcomm, and MediaTek architectures.
 */

export type PowerArchitecture = 'apple' | 'qualcomm' | 'mediatek';
export type BootBehavior = 'zero' | 'drops_to_zero' | 'stuck' | 'cycling';

export type PowerFaultStage =
  | 'PRE_BOOT_DEAD_SHORT'
  | 'PRE_BOOT_LEAKAGE'
  | 'NO_POWER_KEY_RESPONSE'
  | 'PMIC_WAKE_FAIL'
  | 'CPU_RAM_HANDSHAKE_STUCK'
  | 'BOOT_OS_STAGE';

export interface PowerAnalysisResult {
  stage: PowerFaultStage;
  severity: 'critical' | 'high' | 'medium' | 'low';
  fault_title: string;
  fault_title_en: string;
  suspect_rails: string[];
  suspect_components: string[];
  suspect_components_en: string[];
  action_plan: string[];
  action_plan_en: string[];
  waveform_curve: Array<{ time_s: number; current_ma: number; phase: string }>;
}

export function analyzeDcPowerDraw(
  architecture: PowerArchitecture | string,
  preBootMa: number,
  postBootMa: number,
  bootBehavior: BootBehavior | string = 'stuck'
): PowerAnalysisResult {
  const arch = (architecture || 'qualcomm').toLowerCase().trim();
  const pre = Number(preBootMa) || 0;
  const post = Number(postBootMa) || 0;
  const beh = (bootBehavior || 'stuck').toLowerCase().trim();

  // 1. Pre-Boot Leakage / Primary Short Analysis (Before pressing Power Button)
  if (pre >= 500) {
    return {
      stage: 'PRE_BOOT_DEAD_SHORT',
      severity: 'critical',
      fault_title: `قصر صريح على خط التغذية الرئيسي (سحب ${pre}mA قبل الضغط على الباور)`,
      fault_title_en: `Primary Power Rail Dead Short (${pre}mA draw before Power Key)`,
      suspect_rails: ['PP_VDD_MAIN / VPH_PWR', 'PP_BATT_VCC / VBAT'],
      suspect_components: [
        'مكثفات التصفية على خط VDD_MAIN / VPH_PWR',
        'آيسي الشحن (Hydra / SM5714 / PM8150B)',
        'مضخم إشارة الشبكة (2G/4G PA)',
      ],
      suspect_components_en: [
        'Filter MLCC capacitors on VDD_MAIN / VPH_PWR rail',
        'Charging / IF-PMIC IC (Hydra / SM5714 / PM8150B)',
        'RF Power Amplifier (2G/4G PA) connected directly to VPH_PWR',
      ],
      action_plan: [
        'افصل البوردة واضبط الباور سبلاي على 1.2V وحد أقصى للتيار 2.5A',
        'احقن الجهد على خط VDD_MAIN واستخدم الكاميرا الحرارية أو بخاخ التبريد لرصد المكون الساخن فوراً',
        'تحذير: لا تحقن أكثر من 1.5V على خطوط التغذية الرئيسية لتجنب حرق الطبقات الداخلية',
      ],
      action_plan_en: [
        'Disconnect peripherals and limit Bench DC Supply to 1.2V / 2.5A max',
        'Inject onto VDD_MAIN/VPH_PWR while inspecting with Thermal Camera or Rosin vapor',
        'Safety warning: never exceed 1.5V during low-impedance short injection',
      ],
      waveform_curve: Array.from({ length: 12 }, (_, i) => ({
        time_s: i * 0.5,
        current_ma: Math.round(pre + (i % 2 === 0 ? 15 : -10)),
        phase: 'PRE_BOOT_SHORT',
      })),
    };
  }

  if (pre >= 15) {
    return {
      stage: 'PRE_BOOT_LEAKAGE',
      severity: 'high',
      fault_title: `تسريب كهربائي قبل التشغيل (سحب ${pre}mA فور توصيل البطارية)`,
      fault_title_en: `Pre-Boot Rail Leakage (${pre}mA immediately on VBAT connect)`,
      suspect_rails: ['PP_VDD_MAIN', 'PP_1V8_ALWAYS', 'USB_CC_LINE'],
      suspect_components: [
        arch === 'apple'
          ? 'تلف أو تسريب في آيسي USB (Hydra / Tristar) — أشهر عطل آيفون'
          : 'تلف آيسي الشحن (SM5714 / BQ) أو مكثف به تسريب بسيط (مقاومة متدنية)',
        'آثار رطوبة أو أكسدة تحت آيسي الباور الرئيسي أو الشاشة',
      ],
      suspect_components_en: [
        arch === 'apple'
          ? 'Leaking Hydra / Tristar USB Controller IC'
          : 'Leaking Charging IC (SM5714/BQ) or degraded MLCC capacitor',
        'Corrosion / oxidation residue beneath Main PMIC or FPC connectors',
      ],
      action_plan: [
        'قس ممانعة خط VDD_MAIN وخط VBAT مقارنة بالقيم المرجعية',
        'تأكد من نظافة البوردة تحت الميكروسكوب من أي أكسدة بيضاء أو خضراء',
        'استخدم دخان الفلكس (Rosin Smoke) مع حقن 3.8V محدود التيار لتحديد المكون الذي يسخن ببطء',
      ],
      action_plan_en: [
        'Measure Diode Mode impedance on VDD_MAIN and VBAT against reference range',
        'Inspect board under microscope for white/green liquid oxidation',
        'Apply Rosin vapor with current-limited 3.8V injection to locate slow-heating part',
      ],
      waveform_curve: Array.from({ length: 12 }, (_, i) => ({
        time_s: i * 0.5,
        current_ma: Math.round(pre + Math.sin(i) * 4),
        phase: 'LEAKAGE_IDLE',
      })),
    };
  }

  // 2. Post-Boot Current Draw Analysis (After pressing Power Button)
  if (post < 5 || beh === 'zero') {
    return {
      stage: 'NO_POWER_KEY_RESPONSE',
      severity: 'medium',
      fault_title: 'لا توجد أي استجابة عند الضغط على زر الباور (0mA)',
      fault_title_en: 'Zero Current Response on Power Key Press (0mA)',
      suspect_rails: ['POWER_KEY_LINE', 'PP_1V8_ALWAYS', 'VRTC'],
      suspect_components: [
        'فلاتة زر الباور أو مقاومة التوالي على خط زر الباور',
        'آيسي الباور الرئيسي (PMIC) لا يخرج جهد الاستعداد 1.8V',
      ],
      suspect_components_en: [
        'Power button flex cable or series protection resistor open',
        'Main PMIC failing to generate 1.8V / VRTC standby bias',
      ],
      action_plan: [
        'قس وجود جهد 1.8V على بن زر الباور على البوردة',
        'جرب عمل قفلة (Short) مباشرة على نقاط زر الباور بالجفت لاستبعاد تلف الفلاتة',
      ],
      action_plan_en: [
        'Verify 1.8V standby voltage at motherboard Power Key pad',
        'Short Power Key pads directly with tweezers to isolate flex damage',
      ],
      waveform_curve: Array.from({ length: 12 }, (_, i) => ({
        time_s: i * 0.5,
        current_ma: i >= 4 ? post : 0,
        phase: 'NO_WAKE',
      })),
    };
  }

  if (beh === 'drops_to_zero' || (post >= 10 && post <= 85)) {
    return {
      stage: 'PMIC_WAKE_FAIL',
      severity: 'high',
      fault_title: `محاولة إقلاع فاشلة في مرحلة آيسي الباور (${post}mA ثم يعود للصفر)`,
      fault_title_en: `PMIC Buck Wake Sequence Fail (${post}mA then drops to 0mA)`,
      suspect_rails: ['PMIC_BUCK_OUT (VCORE/VPROC)', 'CLK_26MHz / 32.768kHz'],
      suspect_components: [
        'قصر في أحد خطوط الخرج الثانوية (Buck/LDO) الخارجة من آيسي الباور',
        'تلف كريستالة التوقيت (Oscillator) بجوار آيسي الباور',
        'تلف آيسي الباور الرئيسي نفسه (PMIC)',
      ],
      suspect_components_en: [
        'Secondary Buck or LDO output short causing PMIC OCP shutdown',
        'Faulty 26MHz / 32.768kHz system timing crystal near PMIC',
        'Failed Primary PMIC IC',
      ],
      action_plan: [
        'قس الممانعة على جميع الملفات المحيطة بآيسي الباور الرئيسي (PMIC) لاكتشاف أي قصر ثانوي',
        'تأكد من سلامة كريستالة التوقيت وإعادة شبلنة أو تغيير آيسي الباور',
      ],
      action_plan_en: [
        'Measure diode impedance across all Buck coils surrounding Main PMIC',
        'Verify crystal clock oscillation or reball/replace Main PMIC',
      ],
      waveform_curve: [0, 0, 18, post, post, 12, 0, 0, 0, 0, 0, 0].map((v, i) => ({
        time_s: i * 0.5,
        current_ma: v,
        phase: v > 0 ? 'PMIC_ATTEMPT' : 'SHUTDOWN',
      })),
    };
  }

  if (post >= 90 && post <= 220 && beh === 'stuck') {
    const archDetailAr =
      arch === 'apple'
        ? 'توقف السحب عند 90mA-220mA في الآيفون يشير غالباً إلى فصل بين طبقتي البوردة (Interposer) أو خلل في خطوط I2C / المعالج'
        : arch === 'qualcomm'
        ? 'توقف السحب عند 100mA-200mA في كوالكوم يشير لدخول المعالج وضع EDL 9008 التلقائي بسبب تلف الذاكرة UFS أو فصل لحام المعالج'
        : 'توقف السحب عند 90mA-220mA في ميدياتك يشير لتوقف المعالج في وضع BROM أو عدم قراءة البريلودر من eMMC/UFS';

    const archDetailEn =
      arch === 'apple'
        ? 'Stuck 90–220mA on Apple Logic Board typically indicates sandwich interposer split or I2C/AP boot fault.'
        : arch === 'qualcomm'
        ? 'Stuck 100–200mA on Qualcomm indicates automatic EDL 9008 fallback from UFS storage or CPU solder joint fault.'
        : 'Stuck 90–220mA on MediaTek points to BROM halt / Preloader failure reading eMMC/UFS.';

    return {
      stage: 'CPU_RAM_HANDSHAKE_STUCK',
      severity: 'high',
      fault_title: `توقف تسلسل الإقلاع عند مرحلة المعالج والذاكرة (${post}mA ثابت)`,
      fault_title_en: `CPU/RAM/Storage Handshake Halted (Stuck at ${post}mA)`,
      suspect_rails: ['VDD_CPU', 'VDD_DDR (RAM)', 'UFS_VCC_2V95'],
      suspect_components: [
        archDetailAr,
        'المعالج الرئيسي (CPU) أو الذاكرة العشوائية (RAM) — يحتاج Reballing',
        'الذاكرة الداخلية (NAND / UFS / eMMC)',
      ],
      suspect_components_en: [
        archDetailEn,
        'Main Application Processor (CPU) / LPDDR RAM needing BGA Reballing',
        'Internal NAND / UFS / eMMC Flash Memory',
      ],
      action_plan: [
        'وصّل الهاتف بالكمبيوتر وافحص هل يظهر منفذ (EDL 9008 / BROM / DFU)',
        'قس جهود تغذية الرام والذاكرة الداخلية حول المعالج',
      ],
      action_plan_en: [
        'Connect to PC USB scanner to check for EDL 9008 / MTK BROM / DFU enumeration',
        'Measure VDD_DDR and UFS_VCC (2.95V / 1.2V) supply rails near CPU',
      ],
      waveform_curve: [0, 0, 55, 110, post, post, post - 2, post + 1, post, post, post, post].map((v, i) => ({
        time_s: i * 0.5,
        current_ma: Math.round(v),
        phase: i < 2 ? 'STANDBY' : 'CPU_STUCK',
      })),
    };
  }

  // Normal Boot or Cycling Bootloop
  const isCycling = beh === 'cycling';
  return {
    stage: 'BOOT_OS_STAGE',
    severity: isCycling ? 'medium' : 'low',
    fault_title: isCycling
      ? `حلقة إعادة تشغيل في مرحلة تحميل النظام (${post}mA متذبذب)`
      : `سحب طبيعي لمرحلة تحميل النظام (${post}mA)`,
    fault_title_en: isCycling
      ? `OS Bootloop Cycling Pattern (${post}mA oscillating)`
      : `Normal OS Boot Current Signature (${post}mA)`,
    suspect_rails: ['LCM_BL_ANODE', 'MIPI_DSI_LANE', 'BATTERY_SWI / THM'],
    suspect_components: [
      'إذا كان الجهاز يسحب طبيعياً بدون صورة: افحص دائرة الإضاءة أو الشاشة',
      'إذا كان يعيد التشغيل على الشعار: افحص مسار BATTERY_SWI أو سوفت وير النظام',
    ],
    suspect_components_en: [
      'If normal current draw with black screen: inspect OLED/Backlight or MIPI EMI filters',
      'If rebooting on logo: check BATTERY_SWI / BAT_THM line or OS boot partition corruption',
    ],
    action_plan: [
      'افحص وجود بيانات وإضاءة على الشاشة تحت إضاءة قوية',
      'قم بتوصيل الجهاز بالحاسوب لفحص استجابة النظام أو تفليش السوفت وير',
    ],
    action_plan_en: [
      'Inspect display panel under strong light for missing backlight vs missing image',
      'Connect USB for ADB / Fastboot / Recovery log inspection',
    ],
    waveform_curve: isCycling
      ? [0, 80, 260, post, 320, 40, 80, 280, post, 290, 35, 90].map((v, i) => ({
          time_s: i * 0.5,
          current_ma: v,
          phase: 'BOOT_CYCLE',
        }))
      : [0, 60, 180, 420, Math.max(post, 680), Math.max(post, 840), post, Math.round(post * 0.85), Math.round(post * 0.72), Math.round(post * 0.65), Math.round(post * 0.62), Math.round(post * 0.6)].map((v, i) => ({
          time_s: i * 0.5,
          current_ma: v,
          phase: 'NORMAL_BOOT',
        })),
  };
}
