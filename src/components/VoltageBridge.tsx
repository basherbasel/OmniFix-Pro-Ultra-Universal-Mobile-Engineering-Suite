import React, { useState } from 'react';
import { 
  Zap, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Gauge, 
  Layers, 
  Sliders, 
  Activity, 
  Sparkles, 
  Volume2, 
  ShieldAlert, 
  Radio, 
  Filter,
  RefreshCw
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { audioSynth } from '../utils/audioSynth';

export interface PowerRail {
  id: string;
  code: string;
  category: 'CPU' | 'GPU_NPU' | 'RAM_STORAGE' | 'MAIN_SYSTEM' | 'DISPLAY' | 'RF_NETWORK';
  nominalVoltage: number; // e.g. 1.80
  tolerancePercent: number; // e.g. 5%
  diodeModeDrop: number; // mV e.g. 420
  regulatorSourceAr: string;
  regulatorSourceEn: string;
  descriptionAr: string;
  descriptionEn: string;
  collapsedSymptomAr: string;
  collapsedSymptomEn: string;
}

export interface SocSeriesProfile {
  id: string;
  name: string;
  brand: string;
  architecture: string;
  primaryPmic: string;
  secondaryPmic: string;
  rails: PowerRail[];
}

interface VoltageBridgeProps {
  device: ConnectedDevice;
  lang: 'en' | 'ar';
}

export const SOC_DATABASE: SocSeriesProfile[] = [
  {
    id: 'snapdragon-8gen3',
    name: 'Snapdragon 8 Gen 3 (SM8650)',
    brand: 'Qualcomm',
    architecture: '4nm ARMv9 (Cortex-X4 / A720)',
    primaryPmic: 'PM8550 / PM8550B',
    secondaryPmic: 'PM8550VS / PM8550VE Sub-PMICs',
    rails: [
      {
        id: 'sd8g3-vdd-main',
        code: 'VDD_MAIN / VPH_PWR',
        category: 'MAIN_SYSTEM',
        nominalVoltage: 3.80,
        tolerancePercent: 10,
        diodeModeDrop: 480,
        regulatorSourceAr: 'بطارية النظام عبر آيسي الشحن BQ25980 / SMB1396',
        regulatorSourceEn: 'Main System Battery Rail via SMB1396 Charger IC',
        descriptionAr: 'مسار الفولتية الرئيسي المتصل بجميع القطع العالية الطاقة قبل الباور',
        descriptionEn: 'Main battery voltage rail feeding all primary power management circuits',
        collapsedSymptomAr: 'هاتف ميت تماماً (Dead Boot) مع سحب عالي أو شورت مباشر قبل الباور 0mA -> Short',
        collapsedSymptomEn: 'Dead device with immediate full short-circuit before power button'
      },
      {
        id: 'sd8g3-vdd-cpu-x4',
        code: 'VDD_CPU_SUPER_X4 (Buck 1)',
        category: 'CPU',
        nominalVoltage: 0.85,
        tolerancePercent: 3,
        diodeModeDrop: 180,
        regulatorSourceAr: 'PM8550 Sub-PMIC Multi-Phase Buck 1&2',
        regulatorSourceEn: 'PM8550 Sub-PMIC Multi-Phase Buck 1&2',
        descriptionAr: 'جهد التغذية النفاثة لنواة Prime Cortex-X4 العالية الأداء',
        descriptionEn: 'Core voltage rail for Prime Cortex-X4 high-performance core',
        collapsedSymptomAr: 'جمود اللوجو، إعادة تشغيل مفاجئة عند التحميل الثقيل، أو موت الخرج BROM 9008',
        collapsedSymptomEn: 'Bootloop, instant reboot under heavy load, or Qualcomm EDL 9008 mode'
      },
      {
        id: 'sd8g3-vdd-cpu-a720',
        code: 'VDD_CPU_PERF_A720 (Buck 3)',
        category: 'CPU',
        nominalVoltage: 0.78,
        tolerancePercent: 3,
        diodeModeDrop: 210,
        regulatorSourceAr: 'PM8550 Primary PMIC Buck 3',
        regulatorSourceEn: 'PM8550 Primary PMIC Buck 3',
        descriptionAr: 'جهد التغذية لمجموعة أنوية الأداء المتعددة Cortex-A720',
        descriptionEn: 'Core power supply for Cortex-A720 performance cluster',
        collapsedSymptomAr: 'توقف المعالج أثناء فتح التطبيقات، عدم اكتمال الإقلاع',
        collapsedSymptomEn: 'Freeze on app launching, kernel panic during initialization'
      },
      {
        id: 'sd8g3-vdd-gpu',
        code: 'VDD_GPU_ADRENO750',
        category: 'GPU_NPU',
        nominalVoltage: 0.72,
        tolerancePercent: 5,
        diodeModeDrop: 165,
        regulatorSourceAr: 'PM8550VS Dedicated GPU Buck Regulator',
        regulatorSourceEn: 'PM8550VS Dedicated GPU Buck Regulator',
        descriptionAr: 'مسار التغذية الخاص بمعالج الرسوميات Adreno 750',
        descriptionEn: 'Dedicated power rail for Adreno 750 Graphics Processing Unit',
        collapsedSymptomAr: 'شاشة سوداء عند تشغيل الألعاب، تعليق واجهة المستخدم مع عمل الصوت',
        collapsedSymptomEn: 'Black screen during 3D gaming, UI crash with audio continuing'
      },
      {
        id: 'sd8g3-vdd-ram-lp5x',
        code: 'VDD_LPDDR5X_1V1',
        category: 'RAM_STORAGE',
        nominalVoltage: 1.10,
        tolerancePercent: 2,
        diodeModeDrop: 390,
        regulatorSourceAr: 'PM8550 LDO 14 & Buck L3',
        regulatorSourceEn: 'PM8550 LDO 14 & Buck L3',
        descriptionAr: 'جهد تشغيل ذاكرة الرام LPDDR5X المدمجة فوق المعالج (PoP)',
        descriptionEn: 'Operating rail for package-on-package LPDDR5X RAM',
        collapsedSymptomAr: 'شاشة زرقاء/سوداء، خطأ DRAM Initialization في السيريال لوج',
        collapsedSymptomEn: 'Blue/Black screen of death, DRAM init failure in UART log'
      },
      {
        id: 'sd8g3-vreg-l18a-1v8',
        code: 'VREG_L18A_1V8_IO',
        category: 'MAIN_SYSTEM',
        nominalVoltage: 1.80,
        tolerancePercent: 2,
        diodeModeDrop: 450,
        regulatorSourceAr: 'PM8550 LDO Regulator 18A',
        regulatorSourceEn: 'PM8550 LDO Regulator 18A',
        descriptionAr: 'خط جير النظام 1.8V المغذي لبروتوكولات I2C/SPI وحساسات البصمة والشاشة',
        descriptionEn: 'Universal 1.8V I/O logic rail powering I2C, SPI & peripheral ICs',
        collapsedSymptomAr: 'توقف اللمس، عدم استجابة البصمة، خطأ في قراءة الشريحة SIM',
        collapsedSymptomEn: 'Touch screen unresponsive, fingerprint sensor failure, SIM undetected'
      },
      {
        id: 'sd8g3-vreg-rf-2v85',
        code: 'VREG_L9E_2V85_RF',
        category: 'RF_NETWORK',
        nominalVoltage: 2.85,
        tolerancePercent: 4,
        diodeModeDrop: 520,
        regulatorSourceAr: 'PM8550VE RF PMIC LDO 9E',
        regulatorSourceEn: 'PM8550VE RF PMIC LDO 9E',
        descriptionAr: 'جهد تغذية معالج الشبكة ومضخمات الصوت وموديم الـ 5G WTR7955',
        descriptionEn: 'Power supply rail for 5G Transceiver WTR7955 & RF Front-End',
        collapsedSymptomAr: 'لا توجد خدمة (No Service)، اختفاء رقم الـ IMEI والـ Baseband',
        collapsedSymptomEn: 'No Service, Null IMEI, missing baseband firmware'
      }
    ]
  },
  {
    id: 'kirin-9000',
    name: 'Kirin 9000 / 9000S (HiSilicon)',
    brand: 'Huawei / HiSilicon',
    architecture: '5nm / 7nm Maleoon GPU & Taishan Cores',
    primaryPmic: 'Hi6421 / Hi6422 PMIC',
    secondaryPmic: 'Hi6423 Sub-PMIC & Hi6526 Charger',
    rails: [
      {
        id: 'k9k-vbat-sys',
        code: 'VBAT_SYS_3V8',
        category: 'MAIN_SYSTEM',
        nominalVoltage: 3.80,
        tolerancePercent: 10,
        diodeModeDrop: 490,
        regulatorSourceAr: 'آيسي الشحن السريع Hi6526 SuperCharge',
        regulatorSourceEn: 'Hi6526 SuperCharge Power IC',
        descriptionAr: 'خط الفولتية الرئيسي الداعم لجميع الدوائر الإلكترونية في هواتف هواوي Mate/P',
        descriptionEn: 'Main battery rail powering Huawei Mate/P series motherboards',
        collapsedSymptomAr: 'موت كامل للهاتف، عدم إضاءة لمبة الشحن الحمراء',
        collapsedSymptomEn: 'Complete boot failure, red LED indicator dead'
      },
      {
        id: 'k9k-vdd-cpu-large',
        code: 'VDD_CPU_LARGE (Buck 01)',
        category: 'CPU',
        nominalVoltage: 0.82,
        tolerancePercent: 3,
        diodeModeDrop: 195,
        regulatorSourceAr: 'Hi6421 Primary PMIC Buck Channel 1',
        regulatorSourceEn: 'Hi6421 Primary PMIC Buck Channel 1',
        descriptionAr: 'جهد أنوية Taishan / Cortex-A77 العالية القوة في معالجات كيرين',
        descriptionEn: 'Core voltage for Kirin high-performance CPU cores',
        collapsedSymptomAr: 'الوقوف على شعار HUAWEI وتوقف الإقلاع عند تفعيل النواة الأولى',
        collapsedSymptomEn: 'Stuck on HUAWEI logo during primary core initialization'
      },
      {
        id: 'k9k-vdd-npu-ascend',
        code: 'VDD_NPU_ASCEND_LITE',
        category: 'GPU_NPU',
        nominalVoltage: 0.75,
        tolerancePercent: 4,
        diodeModeDrop: 175,
        regulatorSourceAr: 'Hi6422 Sub-PMIC Buck NPU',
        regulatorSourceEn: 'Hi6422 Sub-PMIC Buck NPU',
        descriptionAr: 'مسار محرك الذكاء الاصطناعي DaVinci / Ascend NPU',
        descriptionEn: 'Dedicated rail for DaVinci / Ascend Neural Processing Unit',
        collapsedSymptomAr: 'انهيار الكاميرا عند معالجة الصور الليلية أو التعرف على الوجوه',
        collapsedSymptomEn: 'Camera crash during AI night mode or facial recognition'
      },
      {
        id: 'k9k-vdd-ddr-1v2',
        code: 'VDD_DDR_1V2_PHY',
        category: 'RAM_STORAGE',
        nominalVoltage: 1.20,
        tolerancePercent: 2,
        diodeModeDrop: 410,
        regulatorSourceAr: 'Hi6421 LDO Channel 8',
        regulatorSourceEn: 'Hi6421 LDO Channel 8',
        descriptionAr: 'جهد واجهة الفيزيكال LPDDR5 للذاكرة العشوائية',
        descriptionEn: 'Physical layer power supply for Kirin LPDDR5 controller',
        collapsedSymptomAr: 'إعادة التشغيل المستمرة (Bootloop) وتوقف تفليش الروم عند 5%',
        collapsedSymptomEn: 'Infinite bootloop and flashing error at 5% stage'
      },
      {
        id: 'k9k-vldo-1v8-sys',
        code: 'VLDO_1V8_ALWAYS_ON',
        category: 'MAIN_SYSTEM',
        nominalVoltage: 1.80,
        tolerancePercent: 2,
        diodeModeDrop: 460,
        regulatorSourceAr: 'Hi6421 LDO 12 (Always-On)',
        regulatorSourceEn: 'Hi6421 LDO 12 (Always-On)',
        descriptionAr: 'جهد 1.8V الدائم الذي يغذي زر الباور وبوت روم الجهاز USB COM 1.0',
        descriptionEn: 'Always-On 1.8V powering power key trigger & USB COM 1.0 bootrom',
        collapsedSymptomAr: 'عدم التعرف على خيار USB COM 1.0 عند توصيل كابل الاختبار TestPoint',
        collapsedSymptomEn: 'USB COM 1.0 port undetected when grounding TestPoint'
      }
    ]
  },
  {
    id: 'dimensity-9300',
    name: 'Dimensity 9300 / 9200 (MediaTek)',
    brand: 'MediaTek',
    architecture: '4nm All-Big-Core (Cortex-X4 + A720)',
    primaryPmic: 'MT6368 / MT6375 PMIC',
    secondaryPmic: 'MT6315 Sub-PMIC Array',
    rails: [
      {
        id: 'mtk-vsys-3v8',
        code: 'VSYS_3V8_BUCK',
        category: 'MAIN_SYSTEM',
        nominalVoltage: 3.80,
        tolerancePercent: 8,
        diodeModeDrop: 475,
        regulatorSourceAr: 'آيسي الشحن MT6360 / MT6375 System Power',
        regulatorSourceEn: 'MT6360 / MT6375 System Power Switching Charger',
        descriptionAr: 'المسار الرئيسي المغذي لمنظومة هواتف ميديا تيك الحديثة',
        descriptionEn: 'Main system bus for MediaTek Dimensity series',
        collapsedSymptomAr: 'شورت كامل قبل الباور، انعدام الفولت على زر التشغيل',
        collapsedSymptomEn: 'Full short circuit before power, 0V on power button'
      },
      {
        id: 'mtk-vcore-proc',
        code: 'VCORE_PROC_BUCK01',
        category: 'CPU',
        nominalVoltage: 0.72,
        tolerancePercent: 3,
        diodeModeDrop: 160,
        regulatorSourceAr: 'MT6315 Dedicated Sub-PMIC Phase 1',
        regulatorSourceEn: 'MT6315 Dedicated Sub-PMIC Phase 1',
        descriptionAr: 'تغذية أنوية All-Big-Core المعالجة المركزية لـ Dimensity',
        descriptionEn: 'Main processor core supply for Dimensity All-Big-Core setup',
        collapsedSymptomAr: 'دخول تلقائي بوضع MediaTek Preloader / BROM VCOM Port',
        collapsedSymptomEn: 'Stuck in MediaTek Preloader or BROM VCOM port mode'
      },
      {
        id: 'mtk-vgpu-immortalis',
        code: 'VGPU_IMMORTALIS_G720',
        category: 'GPU_NPU',
        nominalVoltage: 0.70,
        tolerancePercent: 4,
        diodeModeDrop: 150,
        regulatorSourceAr: 'MT6315 Sub-PMIC Phase 2',
        regulatorSourceEn: 'MT6315 Sub-PMIC Phase 2',
        descriptionAr: 'تغذية كارت الشاشة Immortalis-G720 Hardware Raytracing',
        descriptionEn: 'Power rail for Immortalis-G720 GPU with Hardware Raytracing',
        collapsedSymptomAr: 'الوقوف عند فتح الألعاب الثقيلة، إعادة تشغيل فجائية',
        collapsedSymptomEn: 'Instant reset upon launching GPU-intensive applications'
      },
      {
        id: 'mtk-vio-1v8',
        code: 'VIO18_PMU',
        category: 'MAIN_SYSTEM',
        nominalVoltage: 1.80,
        tolerancePercent: 2,
        diodeModeDrop: 440,
        regulatorSourceAr: 'MT6368 PMIC LDO 2',
        regulatorSourceEn: 'MT6368 PMIC LDO 2',
        descriptionAr: 'خط جير الـ IO العام المغذي لمعالج الشاشة وذاكرة الـ UFS',
        descriptionEn: 'General I/O 1.8V rail feeding display bridge & UFS storage controller',
        collapsedSymptomAr: 'عدم قراءة ذاكرة التخزين UFS، خطأ BROM CMD Failed',
        collapsedSymptomEn: 'UFS storage communication failure, BROM CMD handshake error'
      }
    ]
  },
  {
    id: 'exynos-2400',
    name: 'Exynos 2400 / 2200 (Samsung)',
    brand: 'Samsung Exynos',
    architecture: '4nm Deca-Core Xclipse 940 GPU',
    primaryPmic: 'S2MPS22 PMIC',
    secondaryPmic: 'S2MPS23 / S2MPB03',
    rails: [
      {
        id: 'ex-vbat-sys',
        code: 'VSYS_3V8_S2MPS',
        category: 'MAIN_SYSTEM',
        nominalVoltage: 3.80,
        tolerancePercent: 10,
        diodeModeDrop: 485,
        regulatorSourceAr: 'آيسي الشحن S2MPB02 Fast Charging IC',
        regulatorSourceEn: 'S2MPB02 Fast Charging IC',
        descriptionAr: 'خط الفولتية الرئيسي لأجهزة سامسونج غالاكسي S24 / S22 Exynos',
        descriptionEn: 'Main battery distribution rail for Samsung Galaxy S-series Exynos',
        collapsedSymptomAr: 'انطفاء كامل، عدم استجابة الشاحن وعدم ظهور علامة البطارية',
        collapsedSymptomEn: 'Device unpowerable, charger animation fails to trigger'
      },
      {
        id: 'ex-vdd-cpu-cl0',
        code: 'VDD_CPU_CL0_0V8',
        category: 'CPU',
        nominalVoltage: 0.80,
        tolerancePercent: 3,
        diodeModeDrop: 185,
        regulatorSourceAr: 'S2MPS22 Primary PMIC Buck 1',
        regulatorSourceEn: 'S2MPS22 Primary PMIC Buck 1',
        descriptionAr: 'جهد تشغيل أنوية المجموعات المركزية معالج سامسونج',
        descriptionEn: 'Core voltage supply for Exynos CPU clusters',
        collapsedSymptomAr: 'تعليق الجهاز على لوجو Samsung Galaxy مع سخونة خفيفة',
        collapsedSymptomEn: 'Stuck on Samsung Galaxy boot screen with mild heating'
      },
      {
        id: 'ex-vdd-xclipse-gpu',
        code: 'VDD_XCLIPSE_AMD_GPU',
        category: 'GPU_NPU',
        nominalVoltage: 0.74,
        tolerancePercent: 4,
        diodeModeDrop: 160,
        regulatorSourceAr: 'S2MPS23 Dedicated Sub-PMIC',
        regulatorSourceEn: 'S2MPS23 Dedicated Sub-PMIC',
        descriptionAr: 'تغذية كارت شاشة RDNA3 Xclipse 940 المصممة بالتعاون مع AMD',
        descriptionEn: 'Dedicated rail for AMD RDNA3-based Xclipse 940 GPU',
        collapsedSymptomAr: 'شاشة سوداء مع عمل الاهتزاز، انهيار الشاشة أثناء تشغيل الفيديو',
        collapsedSymptomEn: 'Black screen with haptics active, video decoding crash'
      }
    ]
  }
];

export const VoltageBridge: React.FC<VoltageBridgeProps> = ({
  device,
  lang
}) => {
  const isAr = lang === 'ar';
  
  // Try matching device chipset or default to Snapdragon 8 Gen 3
  const [selectedSocId, setSelectedSocId] = useState<string>('snapdragon-8gen3');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Tested / Simulated probes state map: { railId: measuredVoltage }
  const [testedVoltages, setTestedVoltages] = useState<Record<string, number>>({});
  const [activeProbeRailId, setActiveProbeRailId] = useState<string | null>(null);

  const selectedSoc = SOC_DATABASE.find(s => s.id === selectedSocId) || SOC_DATABASE[0];

  const filteredRails = selectedSoc.rails.filter(rail => {
    const matchesCategory = activeCategory === 'ALL' || rail.category === activeCategory;
    const matchesSearch = 
      rail.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rail.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rail.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate stats
  const totalRails = selectedSoc.rails.length;
  let healthyCount = 0;
  let warningCount = 0;
  let criticalCount = 0;

  selectedSoc.rails.forEach(rail => {
    const measured = testedVoltages[rail.id];
    if (measured !== undefined) {
      const diff = Math.abs(measured - rail.nominalVoltage);
      if (measured < 0.1) {
        criticalCount++; // Short
      } else if (diff > rail.nominalVoltage * (rail.tolerancePercent / 100)) {
        warningCount++; // Voltage drop or overvoltage
      } else {
        healthyCount++; // OK
      }
    }
  });

  const handleTestProbe = (rail: PowerRail, forcedVoltage?: number) => {
    setActiveProbeRailId(rail.id);
    const measured = forcedVoltage !== undefined ? forcedVoltage : rail.nominalVoltage;
    
    setTestedVoltages(prev => ({
      ...prev,
      [rail.id]: measured
    }));

    if (measured < 0.1) {
      audioSynth.playShortCircuitAlarm();
    } else {
      audioSynth.playMultimeterBeep();
    }
  };

  const handleResetAllProbes = () => {
    setTestedVoltages({});
    setActiveProbeRailId(null);
    audioSynth.playMultimeterBeep();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isAr ? 'موديول جسر الفولتية ومطابقة جهود اللوحة الأم (VoltageBridge Inspector)' : 'VoltageBridge V-Rail & Multimeter Inspector'}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SOC POWER RAILS v5.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'اختر سلسلة معالج الجهاز لمطابقة جهود التشغيل الاسمية (V-Nominal) مع قراءات قياس الملتيميتر وكشف الشورت والهبوط في خطوط الطاقة'
                : 'Select motherboard CPU SoC series to cross-reference nominal power rails against live multimeter measurements.'}
            </p>
          </div>
        </div>

        {/* Reset / Probe Clear Control */}
        <button
          onClick={handleResetAllProbes}
          className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-amber-500/50 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAr ? 'إعادة ضبط مجسات القياس' : 'Reset Probes'}</span>
        </button>
      </div>

      {/* SoC Series Selection Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'اختر سلسلة المعالج المستهدفة (SoC Chipset Series):' : 'Select Target SoC Chipset Series:'}</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {isAr ? 'المعالج الحالي:' : 'Target SoC:'} <strong className="text-amber-400">{selectedSoc.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SOC_DATABASE.map(soc => {
            const isSelected = soc.id === selectedSocId;
            return (
              <button
                key={soc.id}
                onClick={() => {
                  setSelectedSocId(soc.id);
                  audioSynth.playMultimeterBeep();
                }}
                className={`p-3 rounded-xl border text-right rtl:text-right ltr:text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 border-amber-500/70 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400 animate-ping' : 'bg-slate-600'}`} />
                    {soc.name}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                  <div className="text-cyan-300 font-bold">{soc.primaryPmic}</div>
                  <div className="text-slate-500 truncate">{soc.architecture}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          {[
            { id: 'ALL', labelAr: 'جميع المسارات', labelEn: 'All Rails' },
            { id: 'CPU', labelAr: 'المعالج CPU', labelEn: 'CPU' },
            { id: 'GPU_NPU', labelAr: 'الرسوميات GPU/NPU', labelEn: 'GPU / NPU' },
            { id: 'RAM_STORAGE', labelAr: 'الرام والتخزين', labelEn: 'RAM & Storage' },
            { id: 'MAIN_SYSTEM', labelAr: 'الباور الرئيسي Main', labelEn: 'Main System' },
            { id: 'RF_NETWORK', labelAr: 'الشبكة RF', labelEn: 'RF Network' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث بالمسار (VDD_MAIN, Buck...)' : 'Search rail code or symptom...'}
            className="w-full bg-slate-950 text-white text-xs pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Interactive Power Rail Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
              <tr>
                <th className="p-3 font-bold">{isAr ? 'رمز مسار الطاقة (V-Rail Code)' : 'V-Rail Code'}</th>
                <th className="p-3 font-bold">{isAr ? 'الجهد الإسمي (Nominal V)' : 'Nominal V'}</th>
                <th className="p-3 font-bold">{isAr ? 'قراءة الدايود (Diode Drop)' : 'Diode Drop'}</th>
                <th className="p-3 font-bold">{isAr ? 'المصدر والمنظم (PMIC Source)' : 'Regulator Source'}</th>
                <th className="p-3 font-bold">{isAr ? 'قياس الملتيميتر الحي (Multimeter Probe)' : 'Live Multimeter Probe'}</th>
                <th className="p-3 font-bold text-center">{isAr ? 'إجراءات الاختبار' : 'Probe Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRails.length > 0 ? (
                filteredRails.map(rail => {
                  const measured = testedVoltages[rail.id];
                  const isTested = measured !== undefined;
                  
                  let statusBadge = null;
                  if (isTested) {
                    if (measured < 0.1) {
                      statusBadge = (
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 animate-bounce" />
                          {isAr ? 'شورت أرضي (0V SHORT)' : '0V SHORT TO GND'}
                        </span>
                      );
                    } else if (Math.abs(measured - rail.nominalVoltage) > rail.nominalVoltage * (rail.tolerancePercent / 100)) {
                      statusBadge = (
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          {isAr ? `هبوط جهد (${measured.toFixed(2)}V)` : `DROP (${measured.toFixed(2)}V)`}
                        </span>
                      );
                    } else {
                      statusBadge = (
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          {isAr ? `مطابق (${measured.toFixed(2)}V OK)` : `MATCH (${measured.toFixed(2)}V OK)`}
                        </span>
                      );
                    }
                  }

                  return (
                    <tr 
                      key={rail.id}
                      className={`hover:bg-slate-900/80 transition-colors ${
                        activeProbeRailId === rail.id ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      {/* Rail Code */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-amber-400 text-xs">{rail.code}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isAr ? rail.descriptionAr : rail.descriptionEn}
                        </p>
                      </td>

                      {/* Nominal Voltage */}
                      <td className="p-3 font-mono font-bold text-cyan-300 text-sm whitespace-nowrap">
                        {rail.nominalVoltage.toFixed(2)}V DC
                        <span className="text-[10px] text-slate-500 block">±{rail.tolerancePercent}%</span>
                      </td>

                      {/* Diode Drop */}
                      <td className="p-3 font-mono text-emerald-400 whitespace-nowrap">
                        {rail.diodeModeDrop} mV
                        <span className="text-[10px] text-slate-500 block">{isAr ? 'وضع الدايود' : 'Diode Drop'}</span>
                      </td>

                      {/* Regulator Source */}
                      <td className="p-3 text-slate-300 text-xs">
                        <div className="font-bold text-indigo-300">{isAr ? rail.regulatorSourceAr : rail.regulatorSourceEn}</div>
                        <span className="text-[10px] text-rose-400 block mt-0.5">
                          {isAr ? `العرض عند الانهيار: ${rail.collapsedSymptomAr}` : `Collapse Symptom: ${rail.collapsedSymptomEn}`}
                        </span>
                      </td>

                      {/* Live Multimeter Readout */}
                      <td className="p-3 font-mono">
                        {isTested ? (
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-white">{measured.toFixed(2)}V DC</div>
                            {statusBadge}
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">{isAr ? 'لم يتم الفحص بعد' : 'Not Probed Yet'}</span>
                        )}
                      </td>

                      {/* Probe Actions */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleTestProbe(rail, rail.nominalVoltage)}
                            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold border border-amber-500/40 transition-all cursor-pointer text-[11px]"
                          >
                            {isAr ? 'قياس سليم (OK)' : 'Probe OK'}
                          </button>

                          <button
                            onClick={() => handleTestProbe(rail, 0.02)}
                            className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold border border-rose-500/40 transition-all cursor-pointer text-[11px]"
                          >
                            {isAr ? 'محاكاة شورت (0V)' : 'Sim Short'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 text-xs">
                    {isAr ? 'لا توجد مسارات مطابقة للبحث' : 'No matching power rails found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Voltage Diagnosis Summary Box */}
      <div className="p-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl space-y-2 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{isAr ? 'تقرير الذكاء الاصطناعي لتحليل الفولتيات (VoltageBridge AI Diagnosis):' : 'VoltageBridge AI Power Rail Diagnostic Summary:'}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-emerald-400">OK: {healthyCount}</span>
            <span className="text-amber-400 font-bold">Warnings: {warningCount}</span>
            <span className="text-rose-400 font-bold">Shorted: {criticalCount}</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {criticalCount > 0
            ? (isAr 
                ? `⚠️ تم كشف عدد (${criticalCount}) مسار طاقة منقهر بجهد 0V شورت! يرجى الاستعانة بالكاميرا الحرارية وفاحص الراتنج لحقن V-Nominal الخاص بالمسار المحروق وفحص المكثفات المحاذية لـ PMIC.`
                : `⚠️ Detected (${criticalCount}) collapsed power rail(s) with 0V short! Use Thermal Imaging & Rosin Smoke to inject nominal voltage and isolate damaged bypass capacitors.`)
            : (isAr
                ? `✓ جميع مسارات الطاقة التي تم فحصها لمعالج (${selectedSoc.name}) تعمل ضمن حدود الفولتية الاسمية التوافقية (±5%). المكونات التابعة لـ ${selectedSoc.primaryPmic} تعمل بنكفاءة عالية.`
                : `✓ All probed power rails for (${selectedSoc.name}) operate within compliant nominal tolerance (±5%). Power delivery from ${selectedSoc.primaryPmic} is stable.`)}
        </p>
      </div>
    </div>
  );
};
