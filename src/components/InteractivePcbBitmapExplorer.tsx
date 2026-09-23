import React, { useState } from 'react';
import { 
  Layers, 
  Activity, 
  Search, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Maximize2, 
  RotateCcw, 
  Compass, 
  Radio, 
  ShieldAlert, 
  ChevronRight, 
  Info, 
  Flame, 
  Wrench,
  Smartphone,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface InteractivePcbBitmapExplorerProps {
  device: ConnectedDevice;
  lang: 'en' | 'ar';
}

export interface BitmapFaultCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface BitmapTestPoint {
  id: string;
  name: string;
  railName: string;
  xPercent: number; // 0-100% position on board bitmap
  yPercent: number;
  layer: 'TOP' | 'BOTTOM';
  componentOwner: string; // e.g. U1001 (Main PMIC)
  diodeModeReading: number; // e.g. 0.425 V
  diodeMin: number;
  diodeMax: number;
  diodeNote?: string;
  voltageNominal: string; // e.g. 1.8V DC
  resistanceGnd: string; // e.g. 12.5 kΩ
  traceColor: string; // HEX color for visual trace net
  descriptionAr: string;
  descriptionEn: string;
  possibleCausesAr: string[];
  possibleCausesEn: string[];
}

export interface PcbBitmapModelData {
  modelId: string;
  modelName: string;
  brand: string;
  boardRevision: string;
  faultCategories: {
    faultId: string;
    faultNameAr: string;
    faultNameEn: string;
    testPoints: BitmapTestPoint[];
  }[];
}

const BITMAP_DATABASE: PcbBitmapModelData[] = [
  {
    modelId: 'samsung-s26u',
    modelName: 'Galaxy S26 Ultra 5G (SM-S948B)',
    brand: 'Samsung',
    boardRevision: 'MAIN_REV3.0_S8750',
    faultCategories: [
      {
        faultId: 'power-boot-2026',
        faultNameAr: 'أعطال الباور والـ Apex Engine لعام 2026',
        faultNameEn: '2026 Power Boot & Apex Engine Rails',
        testPoints: [
          {
            id: 'tp-s26-vreg-1v2',
            name: 'TP501_VDD_1V2_APEX',
            railName: 'VDD_1V2_GEN5',
            xPercent: 45,
            yPercent: 38,
            layer: 'TOP',
            componentOwner: 'U1001 (Main PMIC S8750)',
            diodeModeReading: 0.445,
            diodeMin: 0.410,
            diodeMax: 0.480,
            voltageNominal: '1.20V DC',
            resistanceGnd: '18.2 kΩ',
            traceColor: '#10b981',
            descriptionAr: 'خط التغذية الأساسي لمعالج Snapdragon 8 Gen 5. انخفاضه يسبب موت الهاتف التام.',
            descriptionEn: 'Primary 1.2V rail for Snapdragon 8 Gen 5. Low voltage causes dead boot.',
            possibleCausesAr: ['شورت في مكثفات حول المعالج', 'تلف آيسي الباور الرئيسي'],
            possibleCausesEn: ['Short on AP capacitors', 'Main PMIC failure']
          }
        ]
      }
    ]
  },
  {
    modelId: 'apple-iphone17pm',
    modelName: 'iPhone 17 Pro Max (A3400)',
    brand: 'Apple',
    boardRevision: '820-2026-A',
    faultCategories: [
      {
        faultId: 'charging-pd-2026',
        faultNameAr: 'عطل الشحن السريع وحماية Neural Core',
        faultNameEn: 'Neural Core & PD 3.1 Charging Fault',
        testPoints: [
          {
            id: 'tp-ip17-vbus',
            name: 'TP701_VBUS_PD3.1',
            railName: 'PP_VBUS_24V_MAX',
            xPercent: 32,
            yPercent: 80,
            layer: 'BOTTOM',
            componentOwner: 'U6200 (Hydra-Next PD)',
            diodeModeReading: 0.590,
            diodeMin: 0.560,
            diodeMax: 0.620,
            voltageNominal: '5.0V / 24.0V DC',
            resistanceGnd: '62.0 kΩ',
            traceColor: '#a855f7',
            descriptionAr: 'دخل الشحن المتطور PD 3.1 بقدرة 24 فولت. أي شورت هنا يمنع الشحن السريع.',
            descriptionEn: 'Advanced PD 3.1 24V charging input. Short here breaks fast charging.',
            possibleCausesAr: ['تلف منفذ USB-C أو آيسي Hydra-Next'],
            possibleCausesEn: ['USB-C port damage or Hydra-Next IC failure']
          }
        ]
      }
    ]
  },
  {
    modelId: 'samsung-s24u',
    modelName: 'Galaxy S24 Ultra 5G (SM-S928B)',
    brand: 'Samsung',
    boardRevision: 'MAIN_REV1.2_S8650',
    faultCategories: [
      {
        faultId: 'charging-power',
        faultNameAr: 'عطل عدم الشحن والسحب الوهمي (VBUS / USB-C & Fast Charge)',
        faultNameEn: 'Charging, VBUS & USB Power Delivery Fault',
        testPoints: [
          {
            id: 'tp-vbus-5v',
            name: 'TP101_VBUS_IN',
            railName: 'VBUS_5V_USB_IN',
            xPercent: 28,
            yPercent: 72,
            layer: 'TOP',
            componentOwner: 'U5001 (OVP / Load Switch)',
            diodeModeReading: 0.512,
            diodeMin: 0.480,
            diodeMax: 0.540,
            voltageNominal: '5.0V / 9.0V / 15V DC',
            resistanceGnd: '45.2 kΩ',
            traceColor: '#ef4444',
            descriptionAr: 'نقطة دخل خط الشحن VBUS القادم مباشرة من منفذ USB-C قبل آيسي الحماية OVP.',
            descriptionEn: 'Main VBUS 5V input test point directly from USB-C connector before OVP IC.',
            possibleCausesAr: ['تلف منفذ USB-C أو اتساخ الاتصالات', 'احتراق آيسي OVP U5001', 'شورت في مكثف C5012'],
            possibleCausesEn: ['Damaged USB-C port', 'Burnt OVP chip U5001', 'Short on capacitor C5012']
          },
          {
            id: 'tp-vbat-sys',
            name: 'TP102_VSYS_BAT',
            railName: 'VBAT_SYS_4V2',
            xPercent: 35,
            yPercent: 62,
            layer: 'TOP',
            componentOwner: 'U5002 (Main Charger BQ)',
            diodeModeReading: 0.385,
            diodeMin: 0.360,
            diodeMax: 0.410,
            voltageNominal: '3.8V - 4.35V DC',
            resistanceGnd: '18.4 kΩ',
            traceColor: '#f59e0b',
            descriptionAr: 'خط تغذية البطارية الرئيسي المتربط بآيسي الشحن BQ وملف الشحن L5001.',
            descriptionEn: 'Main System Battery rail output from BQ Charger IC across inductor L5001.',
            possibleCausesAr: ['تسريب بالبطارية أو الشورت المباشر في L5001', 'تلف آيسي BQ U5002'],
            possibleCausesEn: ['Battery leakage or inductor L5001 short', 'U5002 BQ Charger fault']
          },
          {
            id: 'tp-cc1-pd',
            name: 'TP103_USB_CC1',
            railName: 'USB_CC1_TYPEC',
            xPercent: 22,
            yPercent: 78,
            layer: 'BOTTOM',
            componentOwner: 'U5003 (USB PD Controller)',
            diodeModeReading: 0.640,
            diodeMin: 0.610,
            diodeMax: 0.670,
            voltageNominal: '1.2V Logic',
            resistanceGnd: '120.0 kΩ',
            traceColor: '#06b6d4',
            descriptionAr: 'خط التواصل والتحقق من الشاحن السريع Type-C Configuration Channel.',
            descriptionEn: 'USB Type-C Configuration Channel 1 for Power Delivery handshake.',
            possibleCausesAr: ['انقطاع خط CC1 يؤدي للشحن البطيء جداً 0.4A فقط'],
            possibleCausesEn: ['CC1 line open breaks fast charging handshake limit to 0.4A']
          }
        ]
      },
      {
        faultId: 'power-boot',
        faultNameAr: 'عطل الباور والموت المفاجئ (PMIC Main & Sub Voltages)',
        faultNameEn: 'Main Power & PMIC System Boot Failure',
        testPoints: [
          {
            id: 'tp-vreg-1v8',
            name: 'TP201_PMIC_VREG_1V8',
            railName: 'VDD_1V8_S2M',
            xPercent: 52,
            yPercent: 40,
            layer: 'TOP',
            componentOwner: 'U2001 (Primary PMIC SM8650)',
            diodeModeReading: 0.420,
            diodeMin: 0.390,
            diodeMax: 0.450,
            voltageNominal: '1.80V DC',
            resistanceGnd: '15.8 kΩ',
            traceColor: '#10b981',
            descriptionAr: 'فولتية التشغيل الأساسية 1.8V المغذية للمعالج وذاكرة UFS وأغلب الحساسات.',
            descriptionEn: 'System-wide 1.8V rail powering Application Processor, UFS storage, and sensors.',
            possibleCausesAr: ['انخفاض أو اختفاء الفولت يسبب توقف الهاتف على سحب 0.04A'],
            possibleCausesEn: ['Missing 1.8V causes phone stuck at 0.04A power supply boot loop']
          },
          {
            id: 'tp-cpu-vdd-core',
            name: 'TP202_CPU_VDD_CORE',
            railName: 'VDD_CPU_0V8',
            xPercent: 58,
            yPercent: 32,
            layer: 'TOP',
            componentOwner: 'U2002 (Buck Regulator Core)',
            diodeModeReading: 0.085,
            diodeMin: 0.070,
            diodeMax: 0.100,
            diodeNote: 'قيمة منخفضة طبيعية بسبب المقاومة الداخلية المنخفضة للنواة',
            voltageNominal: '0.75V - 0.92V DC',
            resistanceGnd: '8.2 Ω',
            traceColor: '#3b82f6',
            descriptionAr: 'تغذية قلب معالج Snapdragon 8 Gen 3 (تأكد من القياس بوضع الدايود الحساس).',
            descriptionEn: 'Core voltage supply to Snapdragon 8 Gen 3 AP (Naturally low diode value).',
            possibleCausesAr: ['الشورت الصريح 0.000V يعني احتراق قلب المعالج'],
            possibleCausesEn: ['0.000V dead short indicates catastrophic AP core breakdown']
          }
        ]
      }
    ]
  },
  {
    modelId: 'apple-iphone15pm',
    modelName: 'iPhone 15 Pro Max (A3106)',
    brand: 'Apple',
    boardRevision: '820-02845-A',
    faultCategories: [
      {
        faultId: 'power-charging',
        faultNameAr: 'عطل الشحن ومسارات Hydra / Tigris & VDD_MAIN',
        faultNameEn: 'iPhone 15 Pro Max VDD_MAIN & Charging Lines',
        testPoints: [
          {
            id: 'tp-vdd-main-ip15',
            name: 'TP301_VDD_MAIN',
            railName: 'PP_VDD_MAIN',
            xPercent: 44,
            yPercent: 50,
            layer: 'TOP',
            componentOwner: 'U2700 (Main PMIC A17 Pro)',
            diodeModeReading: 0.370,
            diodeMin: 0.340,
            diodeMax: 0.400,
            voltageNominal: '3.8V - 4.2V DC',
            resistanceGnd: '22.0 kΩ',
            traceColor: '#f43f5e',
            descriptionAr: 'خط التغذية الرئيسي للآيفون PP_VDD_MAIN. أي شورت هنا يمنع تشغيل الباور نهائياً.',
            descriptionEn: 'Primary system power rail PP_VDD_MAIN. Short circuit prevents device boot.',
            possibleCausesAr: ['شورت في مكثف نسيجي مجاور لآيسي الصوت أو الواي فاي'],
            possibleCausesEn: ['Shorted capacitor on sandwich board near Audio or Wi-Fi IC']
          },
          {
            id: 'tp-pp-bus-vbus',
            name: 'TP302_VBUS_TYPEC',
            railName: 'PP_VBUS_USB_TYPEC',
            xPercent: 30,
            yPercent: 82,
            layer: 'BOTTOM',
            componentOwner: 'U5200 (USB-C Retimer / PMU)',
            diodeModeReading: 0.580,
            diodeMin: 0.550,
            diodeMax: 0.610,
            voltageNominal: '5.0V / 9.0V DC',
            resistanceGnd: '55.0 kΩ',
            traceColor: '#8b5cf6',
            descriptionAr: 'دخل الشحن منفذ USB-C آيفون 15 المربوط بآيسي التايمر والـ PMU.',
            descriptionEn: 'USB-C Type-C power input connecting directly to USB Retimer U5200.',
            possibleCausesAr: ['تلف آيسي Retimer U5200 بسبب استخدام شاحن تجاري غير معتمد'],
            possibleCausesEn: ['Retimer IC U5200 damaged by uncertified fast charger']
          }
        ]
      }
    ]
  },
  {
    modelId: 'xiaomi-14u',
    modelName: 'Xiaomi 14 Ultra / Redmi Note 13 Pro+',
    brand: 'Xiaomi',
    boardRevision: 'XIAOMI_HYPER_MAIN_V2',
    faultCategories: [
      {
        faultId: 'charging-display',
        faultNameAr: 'عطل الشحن السريع 120W وإضاءة الشاشة',
        faultNameEn: 'Xiaomi Fast Charge 120W & OLED Power Rails',
        testPoints: [
          {
            id: 'tp-mi-vbus-20v',
            name: 'TP401_VBUS_120W',
            railName: 'VBUS_PUMP_20V',
            xPercent: 38,
            yPercent: 68,
            layer: 'TOP',
            componentOwner: 'U6001 (Surge P1 Charging Chip)',
            diodeModeReading: 0.490,
            diodeMin: 0.460,
            diodeMax: 0.520,
            voltageNominal: '20.0V DC (During 120W HyperCharge)',
            resistanceGnd: '38.0 kΩ',
            traceColor: '#ec4899',
            descriptionAr: 'مسار الشحن الفائق Surge P1 المخصص لمضخة الفولت 20V.',
            descriptionEn: 'Surge P1 120W charge pump high-voltage 20V input rail.',
            possibleCausesAr: ['تلف شريحة Surge P1 U6001 أو انقطاع الكيبل الفلات بين البوردتين'],
            possibleCausesEn: ['Surge P1 chip fault or main sub-board ribbon cable break']
          }
        ]
      }
    ]
  }
];

export const InteractivePcbBitmapExplorer: React.FC<InteractivePcbBitmapExplorerProps> = ({
  device,
  lang
}) => {
  const isAr = lang === 'ar';

  // Find corresponding model or default to first
  const [selectedModelId, setSelectedModelId] = useState<string>(
    BITMAP_DATABASE.find(m => m.modelId === device.id)?.modelId || BITMAP_DATABASE[0].modelId
  );

  const activeModelData = BITMAP_DATABASE.find(m => m.modelId === selectedModelId) || BITMAP_DATABASE[0];

  const [selectedFaultId, setSelectedFaultId] = useState<string>(
    activeModelData.faultCategories[0].faultId
  );

  const activeFaultCategory = activeModelData.faultCategories.find(f => f.faultId === selectedFaultId) || activeModelData.faultCategories[0];

  const [selectedTestPoint, setSelectedTestPoint] = useState<BitmapTestPoint>(
    activeFaultCategory.testPoints[0]
  );

  const [activeBoardLayer, setActiveBoardLayer] = useState<'TOP' | 'BOTTOM'>('TOP');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [meterMode, setMeterMode] = useState<'DIODE' | 'VOLTAGE' | 'RESISTANCE'>('DIODE');
  const [simulatedProbe, setSimulatedProbe] = useState<'PASS' | 'SHORT' | 'OPEN'>('PASS');

  // Dynamic DMM calculation
  const getDmmDisplay = () => {
    if (!selectedTestPoint) return { val: '0.000', unit: 'V', state: 'NORMAL' };
    if (meterMode === 'DIODE') {
      if (simulatedProbe === 'SHORT') return { val: '0.001', unit: 'V (SHORT)', state: 'SHORT' };
      if (simulatedProbe === 'OPEN') return { val: 'O.L', unit: '(OPEN)', state: 'OPEN' };
      return { val: selectedTestPoint.diodeModeReading.toFixed(3), unit: 'V (OK)', state: 'NORMAL' };
    } else if (meterMode === 'VOLTAGE') {
      if (simulatedProbe === 'SHORT') return { val: '0.00', unit: 'V (COLLAPSED)', state: 'SHORT' };
      return { val: selectedTestPoint.voltageNominal, unit: 'DC', state: 'NORMAL' };
    } else {
      if (simulatedProbe === 'SHORT') return { val: '0.2', unit: 'Ω', state: 'SHORT' };
      return { val: selectedTestPoint.resistanceGnd, unit: '', state: 'NORMAL' };
    }
  };

  const dmm = getDmmDisplay();

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-2xl space-y-4">
      {/* Header */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/10">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isAr ? 'خريطة البوردة التفاعلية ونقاط القياس (Interactive PCB Bitmap Explorer)' : 'Interactive PCB Bitmap & Measurement Explorer'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                BITMAP v2026
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'عرض تفاعلي حقيقي لمسارات البوردة، تحديد نقاط الاختبار Test Points، وقيم الفولت والمقاومة والدايود لكل عطل'
                : 'Interactive PCB trace visualization, pinouts, test points, diode mode reference values, and voltage rails.'}
            </p>
          </div>
        </div>

        {/* Board Layer & Zoom Bar */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveBoardLayer('TOP')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${activeBoardLayer === 'TOP' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              TOP LAYER
            </button>
            <button
              onClick={() => setActiveBoardLayer('BOTTOM')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${activeBoardLayer === 'BOTTOM' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              BOTTOM LAYER
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
              className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300"
              title="Zoom Out"
            >
              -
            </button>
            <span className="text-[10px] text-cyan-400 px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.2))}
              className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300"
              title="Zoom In"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Selectors Bar: Phone Model & Fault Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Model Selector */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAr ? '1. اختر موديل الهاتف والبوردة:' : '1. Select Phone Model & PCB Revision:'}</span>
          </label>
          <select
            value={selectedModelId}
            onChange={(e) => {
              setSelectedModelId(e.target.value);
              const m = BITMAP_DATABASE.find(x => x.modelId === e.target.value);
              if (m) {
                setSelectedFaultId(m.faultCategories[0].faultId);
                setSelectedTestPoint(m.faultCategories[0].testPoints[0]);
              }
            }}
            className="w-full bg-slate-900 text-xs font-mono text-slate-200 border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {BITMAP_DATABASE.map((m) => (
              <option key={m.modelId} value={m.modelId}>
                [{m.brand}] {m.modelName} ({m.boardRevision})
              </option>
            ))}
          </select>
        </div>

        {/* Fault Selector */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? '2. اختر العطل المراد تتبعه:' : '2. Select Circuit / Fault Case:'}</span>
          </label>
          <select
            value={selectedFaultId}
            onChange={(e) => {
              setSelectedFaultId(e.target.value);
              const f = activeModelData.faultCategories.find(x => x.faultId === e.target.value);
              if (f) setSelectedTestPoint(f.testPoints[0]);
            }}
            className="w-full bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {activeModelData.faultCategories.map((f) => (
              <option key={f.faultId} value={f.faultId}>
                {isAr ? f.faultNameAr : f.faultNameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Canvas + Multimeter Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bitmap Canvas Stage (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">{activeModelData.boardRevision}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300">
                {activeBoardLayer} LAYER
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">
              {activeFaultCategory.testPoints.length} Test Points Detected
            </span>
          </div>

          {/* Graphical PCB Bitmap Simulator Stage */}
          <div className="relative w-full h-80 bg-slate-950 rounded-xl border-2 border-slate-800 overflow-hidden flex items-center justify-center p-2 select-none shadow-inner">
            {/* Grid background representing PCB board substrate */}
            <div 
              style={{ transform: `scale(${zoomLevel})` }}
              className="relative w-full h-full transition-transform duration-200 flex items-center justify-center"
            >
              {/* Green/Dark PCB Substrate Body */}
              <div className="w-[90%] h-[85%] rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-emerald-950/90 border-2 border-emerald-600/40 relative shadow-2xl p-4 overflow-hidden">
                {/* Copper Traces SVG Net */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                  <path d="M 30 100 L 150 100 L 220 180 L 350 180" fill="none" stroke={selectedTestPoint?.traceColor || '#10b981'} strokeWidth="3" strokeDasharray="4 2" className="animate-pulse" />
                  <path d="M 80 200 L 200 200 L 260 120" fill="none" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="150" cy="100" r="5" fill="#f59e0b" />
                  <circle cx="220" cy="180" r="5" fill="#ef4444" />
                </svg>

                {/* SubstrateSilkscreen text */}
                <span className="absolute top-3 left-3 text-[9px] font-mono text-emerald-400/50 uppercase tracking-widest">
                  PCB_BITMAP // {activeModelData.brand.toUpperCase()} // LAYER_{activeBoardLayer}
                </span>

                {/* Simulated IC Chips on Bitmap */}
                <div className="absolute top-[25%] left-[20%] w-[25%] h-[35%] bg-slate-800/90 rounded-lg border border-slate-600 flex flex-col items-center justify-center text-[10px] font-mono text-slate-300 font-bold shadow-lg">
                  <span>MAIN PMIC</span>
                  <span className="text-[8px] text-cyan-400 font-normal">U2001</span>
                </div>

                <div className="absolute top-[20%] right-[15%] w-[30%] h-[40%] bg-slate-800/90 rounded-lg border border-slate-600 flex flex-col items-center justify-center text-[10px] font-mono text-slate-300 font-bold shadow-lg">
                  <span>SOC AP</span>
                  <span className="text-[8px] text-indigo-400 font-normal">SM8650</span>
                </div>

                <div className="absolute bottom-[15%] left-[30%] w-[35%] h-[25%] bg-slate-800/90 rounded-lg border border-slate-600 flex flex-col items-center justify-center text-[10px] font-mono text-slate-300 font-bold shadow-lg">
                  <span>CHARGER IC</span>
                  <span className="text-[8px] text-amber-400 font-normal">U5002 BQ</span>
                </div>

                {/* Render Test Points Pins on Bitmap */}
                {activeFaultCategory.testPoints
                  .filter(tp => tp.layer === activeBoardLayer)
                  .map((tp) => {
                    const isSelected = selectedTestPoint?.id === tp.id;

                    return (
                      <div
                        key={tp.id}
                        onClick={() => setSelectedTestPoint(tp)}
                        style={{
                          left: `${tp.xPercent}%`,
                          top: `${tp.yPercent}%`
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group flex flex-col items-center"
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-amber-400 ring-8 ring-amber-400/30 scale-125 z-40'
                            : 'bg-cyan-500 hover:bg-amber-300 ring-4 ring-cyan-500/20'
                        }`}>
                          <div className="w-2 h-2 rounded-full bg-slate-950 font-bold" />
                        </div>

                        {/* Tag overlay */}
                        <span className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shadow-lg transition-all ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-950/90 text-cyan-300 border border-slate-700'
                        }`}>
                          {tp.name}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Test Point Selector Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'نقاط الاختبار المتاحة في هذا المسار:' : 'Available Test Points in this Rail:'}</span>
            </span>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {activeFaultCategory.testPoints.map((tp) => {
                const isSel = selectedTestPoint?.id === tp.id;
                return (
                  <button
                    key={tp.id}
                    onClick={() => {
                      setSelectedTestPoint(tp);
                      setActiveBoardLayer(tp.layer);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      isSel
                        ? 'bg-cyan-600 text-white font-bold border-cyan-400 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{tp.name} ({tp.railName})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Live Multimeter & Technical Reference Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Multimeter Probing Display Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isAr ? 'جهاز الملتيميتر والقياسات المرجعية' : 'Multimeter Live Probe & Reference'}
                </h4>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setMeterMode('DIODE')}
                  className={`px-2 py-0.5 rounded ${meterMode === 'DIODE' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  DIODE
                </button>
                <button
                  onClick={() => setMeterMode('VOLTAGE')}
                  className={`px-2 py-0.5 rounded ${meterMode === 'VOLTAGE' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  VOLTS
                </button>
                <button
                  onClick={() => setMeterMode('RESISTANCE')}
                  className={`px-2 py-0.5 rounded ${meterMode === 'RESISTANCE' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  OHMS
                </button>
              </div>
            </div>

            {/* Main Value LCD */}
            <div className="p-3 bg-black rounded-xl border border-slate-800 font-mono flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">
                  {meterMode === 'DIODE' ? 'Diode Drop (Red Probe to GND)' : meterMode === 'VOLTAGE' ? 'DC Voltage Rail' : 'Resistance to GND'}
                </span>
                <span className={`text-2xl font-black tracking-wider ${
                  dmm.state === 'NORMAL' ? 'text-emerald-400' : 'text-rose-500 animate-pulse'
                }`}>
                  {dmm.val}
                </span>
              </div>
              <span className="text-xs font-bold text-cyan-400">{dmm.unit}</span>
            </div>

            {/* Probe Interactive Simulator Controls */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {isAr ? 'محاكاة حالة القياس على الهاتف:' : 'Simulate Hardware Probe State:'}
              </span>
              <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                <button
                  onClick={() => setSimulatedProbe('PASS')}
                  className={`py-1 rounded font-bold transition-all ${simulatedProbe === 'PASS' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
                >
                  Sane / Pass
                </button>
                <button
                  onClick={() => setSimulatedProbe('SHORT')}
                  className={`py-1 rounded font-bold transition-all ${simulatedProbe === 'SHORT' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
                >
                  Short (0.000)
                </button>
                <button
                  onClick={() => setSimulatedProbe('OPEN')}
                  className={`py-1 rounded font-bold transition-all ${simulatedProbe === 'OPEN' ? 'bg-amber-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
                >
                  O.L (Open)
                </button>
              </div>
            </div>
          </div>

          {/* Test Point Technical Card */}
          {selectedTestPoint && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                    {selectedTestPoint.name}
                  </span>
                  <span className="font-mono text-slate-300 font-bold">{selectedTestPoint.railName}</span>
                </div>

                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {selectedTestPoint.componentOwner}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block uppercase">Reference Diode</span>
                  <strong className="text-emerald-400">{selectedTestPoint.diodeModeReading.toFixed(3)} V</strong>
                  <span className="text-[9px] text-slate-500 block">Tol: {selectedTestPoint.diodeMin} - {selectedTestPoint.diodeMax}</span>
                </div>

                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block uppercase">Operating Voltage</span>
                  <strong className="text-cyan-400">{selectedTestPoint.voltageNominal}</strong>
                  <span className="text-[9px] text-slate-500 block">GND Res: {selectedTestPoint.resistanceGnd}</span>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                {isAr ? selectedTestPoint.descriptionAr : selectedTestPoint.descriptionEn}
              </p>

              {/* Possible Root Causes */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  {isAr ? 'الأسباب الشائعة للعطل في هذا المسار:' : 'Common Fault Causes on this Rail:'}
                </span>
                <ul className="space-y-1 pl-4 rtl:pl-0 rtl:pr-4 list-disc text-slate-300 text-[11px]">
                  {(isAr ? selectedTestPoint.possibleCausesAr : selectedTestPoint.possibleCausesEn).map((cause, idx) => (
                    <li key={idx}>{cause}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
