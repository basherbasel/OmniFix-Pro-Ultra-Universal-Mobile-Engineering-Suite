import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Activity, 
  Flame, 
  Sliders, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Power, 
  Cpu, 
  Radio, 
  Clock, 
  Waves, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Thermometer,
  Gauge,
  Wifi,
  Printer
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface SmartHardwareBenchControllerProps {
  lang: 'en' | 'ar';
  device: ConnectedDevice;
  onAddLog?: (log: string) => void;
  onNavigateToTool?: (tabId: string) => void;
}

interface BootCurvePattern {
  id: string;
  nameEn: string;
  nameAr: string;
  symptomEn: string;
  symptomAr: string;
  diagnosisEn: string;
  diagnosisAr: string;
  actionEn: string;
  actionAr: string;
  currentPeakMa: number;
  curveColor: string;
  status: 'NOMINAL' | 'FAIL_PMIC' | 'FAIL_CPU_RAM' | 'SHORT_CIRCUIT' | 'FAIL_NAND';
  points: number[];
}

export const SmartHardwareBenchController: React.FC<SmartHardwareBenchControllerProps> = ({
  lang,
  device,
  onAddLog,
  onNavigateToTool
}) => {
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'dc_power' | 'soldering_iot' | 'ultrasonic_bath'>('dc_power');
  
  // DC Power Supply State
  const [dcOutputActive, setDcOutputActive] = useState<boolean>(true);
  const [dcVoltage, setDcVoltage] = useState<number>(4.2);
  const [dcCurrentLimit, setDcCurrentLimit] = useState<number>(3.0);
  const [liveCurrentMa, setLiveCurrentMa] = useState<number>(385);
  const [selectedPatternId, setSelectedPatternId] = useState<string>('pattern-nominal');
  const [isRecordingCurve, setIsRecordingCurve] = useState<boolean>(false);

  // Soldering Station State
  const [ironPowerActive, setIronPowerActive] = useState<boolean>(true);
  const [targetIronTemp, setTargetIronTemp] = useState<number>(360);
  const [currentIronTemp, setCurrentIronTemp] = useState<number>(358);
  const [ironWattage, setIronWattage] = useState<number>(45);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(5);
  const [activePresetChannel, setActivePresetChannel] = useState<'CH1' | 'CH2' | 'CH3'>('CH2');

  // Hot Air Rework Station State
  const [hotAirActive, setHotAirActive] = useState<boolean>(false);
  const [hotAirTemp, setHotAirTemp] = useState<number>(340);
  const [hotAirFlowPercent, setHotAirFlowPercent] = useState<number>(60);

  // Ultrasonic Bath State
  const [ultrasonicActive, setUltrasonicActive] = useState<boolean>(false);
  const [ultrasonicMinutes, setUltrasonicMinutes] = useState<number>(8);
  const [ultrasonicRemainingSec, setUltrasonicRemainingSec] = useState<number>(480);
  const [ultrasonicBathTemp, setUltrasonicBathTemp] = useState<number>(48);

  const [benchLogs, setBenchLogs] = useState<string[]>([
    'Smart Bench IoT Link: Aixun T420D / Sugon 8620DX / JBC Nano Station Synced via USB CDC-ACM.',
    'DC Power Supply Rigol DP832 / Sunshine P-3005A connected with 1000Hz Waveform Sampling.',
    'Digital Ultrasonic De-oxidation Tank Linked (Dual Frequency 28kHz/40kHz Sweep).'
  ]);

  const bootPatterns: BootCurvePattern[] = [
    {
      id: 'pattern-nominal',
      nameEn: 'Healthy Android/iOS 7-Stage Boot Sequence',
      nameAr: 'تسلسل الإقلاع الطبيعي السليم (7 مراحل)',
      symptomEn: 'Normal smooth boot into OS and lockscreen.',
      symptomAr: 'إقلاع طبيعي سلس حتى واجهة القفل وشاشة النظام.',
      diagnosisEn: 'PMIC reset OK, CPU Core & RAM Handshake OK, Display MIPI & GPU OK.',
      diagnosisAr: 'استجابة الـ PMIC ممتازة، تزامن المعالج والرام سليم، وتغذية الشاشة طبيعية.',
      actionEn: 'No hardware repair required. Current stabilizes to ~120-250mA idle.',
      actionAr: 'الجهاز سليم عتادياً. التيار يستقر عند 120-250mA في وضع السكون.',
      currentPeakMa: 1250,
      curveColor: '#10b981',
      status: 'NOMINAL',
      points: [0, 80, 140, 320, 680, 1150, 1250, 840, 620, 450, 220, 150]
    },
    {
      id: 'pattern-pmic-drop',
      nameEn: 'PMIC Buck 0 Drop (Stuck at 60-80mA)',
      nameAr: 'عطل ريست أو دائرة PMIC (تعليق على 60-80mA)',
      symptomEn: 'No screen display, no vibration, won\'t turn on.',
      symptomAr: 'لا توجد إضاءة، لا يوجد اهتزاز، الهاتف لا يستجيب لزر الباور.',
      diagnosisEn: 'Power Management IC fails to generate secondary power rails (BUCK1/LDO5).',
      diagnosisAr: 'فشل أيسي الباور الرئيسي في توليد الفولتيات الثانوية أو عطل في مذبذب الكريستالة 32.768kHz.',
      actionEn: 'Check 1.8V Always-On rail, inspect crystal oscillator Y100, replace/reball main PMIC.',
      actionAr: 'فحص خط 1.8V الدائم، فحص كريستالة التوقيت Y100، وإعادة شبلنة أو تغيير أيسي الباور PMIC.',
      currentPeakMa: 75,
      curveColor: '#f59e0b',
      status: 'FAIL_PMIC',
      points: [0, 65, 75, 78, 75, 76, 75, 74, 75, 76, 75, 75]
    },
    {
      id: 'pattern-cpu-reball',
      nameEn: 'CPU / RAM Cold Solder (Oscillating 180-260mA Loop)',
      nameAr: 'فصل كرات لحام المعالج والرام (تذبذب 180-260mA)',
      symptomEn: 'Auto-restart, stuck on brand logo, or sudden crash.',
      symptomAr: 'إعادة تشغيل مستمرة، تعليق على الشعار، أو موت مفاجئ بعد السقوط.',
      diagnosisEn: 'Layer 2 Sandwich BGA fracture between Application Processor SoC and LPDDR5 RAM.',
      diagnosisAr: 'شرخ في نقاط اللحام السفلية بين طبقة المعالج AP وطبقة الرام RAM المكدسة (PoP).',
      actionEn: 'Dual-layer CPU & RAM de-solder, clean interposer pads, precision CNC reballing at 360°C.',
      actionAr: 'رفع طبقتي المعالج والرام، تنظيف مسارات البوردة، وإعادة شبلنة دقيقة باستخدام قصدير 183°C.',
      currentPeakMa: 260,
      curveColor: '#ec4899',
      status: 'FAIL_CPU_RAM',
      points: [0, 90, 180, 240, 260, 190, 250, 190, 260, 210, 260, 180]
    },
    {
      id: 'pattern-short-circuit',
      nameEn: 'Instant Hard Short to Ground (Spike 2.5A+)',
      nameAr: 'شورت صريح ومباشر على مسار VDD_MAIN (قفزة 2.5A+)',
      symptomEn: 'DC supply immediately triggers OCP protection beep.',
      symptomAr: 'صفارة حماية الشورت من الباور سبلاي فور توصيل كابل البطارية.',
      diagnosisEn: 'Full dielectric breakdown in MLCC capacitor or MOSFET on primary battery rail.',
      diagnosisAr: 'انهيار عازل داخلي لمكثف سيراميك أو موسفت تغذية على مسار البطارية الرئيسي.',
      actionEn: 'Thermal camera inspection at 1.2V / Rosin vapor smoke test to remove shorted component.',
      actionAr: 'استخدام الكاميرا الحرارية بحقن 1.2V أو تبخير الروزين لعزل المكثف المحترق.',
      currentPeakMa: 2850,
      curveColor: '#ef4444',
      status: 'SHORT_CIRCUIT',
      points: [0, 450, 1800, 2850, 2850, 2850, 2850, 2850, 2850, 2850, 2850, 2850]
    }
  ];

  const currentPattern = bootPatterns.find(p => p.id === selectedPatternId) || bootPatterns[0];

  // Timer loop for ultrasonic bath
  useEffect(() => {
    let interval: any = null;
    if (ultrasonicActive && ultrasonicRemainingSec > 0) {
      interval = setInterval(() => {
        setUltrasonicRemainingSec(prev => {
          if (prev <= 1) {
            setUltrasonicActive(false);
            const msg = 'Ultrasonic De-oxidation Cycle Completed: Board is clean and ready for heat drying.';
            setBenchLogs(l => [msg, ...l]);
            if (onAddLog) onAddLog(msg);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [ultrasonicActive, ultrasonicRemainingSec]);

  const handleApplyPreset = (channel: 'CH1' | 'CH2' | 'CH3', temp: number) => {
    setActivePresetChannel(channel);
    setTargetIronTemp(temp);
    const msg = `Smart Soldering Station: Switched to ${channel} Preset (${temp}°C) - Ready for micro-soldering.`;
    setBenchLogs(prev => [msg, ...prev]);
    if (onAddLog) onAddLog(msg);
  };

  const handleRunCurveDiagnostics = () => {
    setIsRecordingCurve(true);
    const msg = `Sampling 12-second live boot waveform from ${device.model}...`;
    setBenchLogs(prev => [msg, ...prev]);
    if (onAddLog) onAddLog(msg);

    setTimeout(() => {
      setIsRecordingCurve(false);
      const doneMsg = `Bootup Analysis Complete: Matched pattern [${currentPattern.nameEn}] with 98.4% AI confidence.`;
      setBenchLogs(prev => [doneMsg, ...prev]);
      if (onAddLog) onAddLog(doneMsg);
    }, 1800);
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-amber-500/20 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-600/10 via-orange-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
            <Gauge size={28} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white">
                {isAr ? 'منصة طاولة الصيانة الذكية وتحليل منحنى إقلاع الباور' : 'Smart Hardware Bench & Boot Curve Diagnostic Station'}
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                IoT LAB SUITE 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {isAr 
                ? 'تحكم متزامن مع كاوية اللحام الذكية (JBC/Aixun)، الهوت إير، راسم منحنى تيار الإقلاع (Waveform)، وحوض الألتراسونيك لإزالة الأكسدة.' 
                : 'IoT sync with precision soldering irons, hot-air rework station, 12-second live boot current waveform analysis, and ultrasonic chemical bath.'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          {(['dc_power', 'soldering_iot', 'ultrasonic_bath'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab === 'dc_power' && <Activity size={14} />}
              {tab === 'soldering_iot' && <Flame size={14} />}
              {tab === 'ultrasonic_bath' && <Waves size={14} />}

              {tab === 'dc_power' && (isAr ? 'منحنى إقلاع الباور سبلاي' : 'DC Boot Curve')}
              {tab === 'soldering_iot' && (isAr ? 'محطة الكاوية والهوت إير IoT' : 'Smart Soldering & Hot Air')}
              {tab === 'ultrasonic_bath' && (isAr ? 'حوض الألتراسونيك الذكي' : 'Ultrasonic Cleaner')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'dc_power' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* DC Power Supply & Waveform Graph (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            
            {/* Live Waveform Canvas Card */}
            <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{isAr ? 'راسم منحنى تيار سحب الإقلاع (Live Boot Current Waveform)' : 'Live Boot Current Waveform (0 - 12 Seconds)'}</h3>
                    <span className="text-xs text-slate-400 font-mono">1000 Samples/sec | Peak: {currentPattern.currentPeakMa} mA</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dcOutputActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                  <span className="text-xs font-mono font-bold text-slate-300">{dcOutputActive ? 'DC ACTIVE' : 'DC OFF'}</span>
                </div>
              </div>

              {/* Simulated Waveform Visualizer */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-white/5 flex flex-col gap-3 relative overflow-hidden">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                  <div className="w-full h-[1px] bg-slate-400" />
                  <div className="w-full h-[1px] bg-slate-400" />
                  <div className="w-full h-[1px] bg-slate-400" />
                  <div className="w-full h-[1px] bg-slate-400" />
                </div>

                {/* Graph Bars & Path */}
                <div className="flex items-end gap-2 h-44 z-10 px-2 pt-6">
                  {currentPattern.points.map((pt, idx) => {
                    const heightPercent = Math.min(100, Math.max(5, (pt / 3000) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {pt}mA
                        </span>
                        <div 
                          style={{ 
                            height: `${heightPercent}%`,
                            backgroundColor: currentPattern.curveColor 
                          }}
                          className="w-full rounded-t-md transition-all duration-500 shadow-lg"
                        />
                        <span className="text-[9px] font-mono text-slate-500">{idx}s</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-2">
                  <span>STAGE: 1. PMIC RESET &rarr; 2. CPU CLK &rarr; 3. RAM SYNC &rarr; 4. GPU &rarr; 5. DISPLAY MIPI</span>
                  <span className="font-bold text-amber-400">{currentPattern.status}</span>
                </div>
              </div>

              {/* Power Supply Control knobs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-mono">{isAr ? 'فولتية الخرج المحددة:' : 'Set Output Voltage:'}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-mono font-black text-amber-400">{dcVoltage.toFixed(2)} V</span>
                    <input 
                      type="range" 
                      min="3.7" 
                      max="4.5" 
                      step="0.05" 
                      value={dcVoltage} 
                      onChange={(e) => setDcVoltage(parseFloat(e.target.value))}
                      className="w-20 accent-amber-500" 
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-mono">{isAr ? 'حد تيار الحماية (OCP):' : 'Current Limit (OCP):'}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-mono font-black text-cyan-400">{dcCurrentLimit.toFixed(1)} A</span>
                    <input 
                      type="range" 
                      min="1.0" 
                      max="5.0" 
                      step="0.5" 
                      value={dcCurrentLimit} 
                      onChange={(e) => setDcCurrentLimit(parseFloat(e.target.value))}
                      className="w-20 accent-cyan-500" 
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono">{isAr ? 'حالة مخرج الطاقة:' : 'DC Power State:'}</span>
                    <div className="text-xs font-bold text-white mt-0.5">{dcOutputActive ? 'ENABLED' : 'MUTED'}</div>
                  </div>
                  <button
                    onClick={() => setDcOutputActive(!dcOutputActive)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      dcOutputActive 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Power size={18} />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: AI Curve Matching & Pattern Selector (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Pattern Selector */}
            <div className="p-5 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white">{isAr ? 'مقارنة المنحنى مع بنك الأعطال الذكي' : 'AI Boot Pattern Recognition'}</h4>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  AI MATCHER
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {bootPatterns.map(pat => (
                  <button
                    key={pat.id}
                    onClick={() => setSelectedPatternId(pat.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                      selectedPatternId === pat.id 
                        ? 'bg-amber-500/10 border-amber-500 text-white font-bold ring-2 ring-amber-500/20' 
                        : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span>{isAr ? pat.nameAr : pat.nameEn}</span>
                      <span className="font-mono text-[10px]" style={{ color: pat.curveColor }}>{pat.currentPeakMa}mA</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {isAr ? pat.symptomAr : pat.symptomEn}
                    </p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleRunCurveDiagnostics}
                disabled={isRecordingCurve}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRecordingCurve ? 'animate-spin' : ''} />
                {isRecordingCurve ? (isAr ? 'جاري فحص النبضات...' : 'Sampling Waveform...') : (isAr ? 'فحص ومطابقة عطل الباور سبلاي' : 'Match Boot Curve with AI')}
              </button>
            </div>

            {/* Diagnostic Details Box */}
            <div className="p-4 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-3 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <AlertTriangle size={16} />
                <span>{isAr ? 'التقرير التشخيصي وخطة الإصلاح:' : 'Root Cause & Repair Action:'}</span>
              </div>
              
              <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 text-xs text-slate-300 leading-relaxed">
                <div className="font-bold text-white mb-1">{isAr ? currentPattern.diagnosisAr : currentPattern.diagnosisEn}</div>
                <div className="text-[11px] text-slate-400">{isAr ? currentPattern.actionAr : currentPattern.actionEn}</div>
              </div>

              {onNavigateToTool && (
                <button
                  onClick={() => onNavigateToTool('hardware-workbench')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Cpu size={14} />
                  {isAr ? 'فتح البوردفيو ونقاط الفحص' : 'Open in Boardview Workbench'}
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Smart Soldering & Hot Air Tab */}
      {activeTab === 'soldering_iot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Smart Iron Controller (6 Cols) */}
          <div className="lg:col-span-6 p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Flame size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{isAr ? 'كاوية اللحام الذكية (JBC / Aixun IoT Link)' : 'Smart Precision Soldering Iron'}</h3>
                  <span className="text-xs text-slate-400 font-mono">Tip Type: C210-020 (Curved Micro-Jumper)</span>
                </div>
              </div>

              <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-mono font-bold rounded-full">
                {ironWattage}W POWER
              </span>
            </div>

            {/* Live Temp Display */}
            <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-slate-400 font-mono uppercase">{isAr ? 'الحرارة الحالية للسن:' : 'Live Tip Temperature:'}</span>
              <div className="text-4xl font-mono font-black text-orange-400 flex items-baseline gap-2">
                <span>{currentIronTemp}°C</span>
                <span className="text-sm text-slate-500 font-normal">/ Target: {targetIronTemp}°C</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">THERMAL RECOVERY: 0.2s</span>
            </div>

            {/* Quick Channel Presets */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleApplyPreset('CH1', 280)}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                  activePresetChannel === 'CH1' 
                    ? 'bg-orange-500 text-slate-950 font-black border-orange-400 shadow-lg shadow-orange-500/20' 
                    : 'bg-slate-950 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                <div>CH1: 280°C</div>
                <div className="text-[9px] font-normal opacity-80">{isAr ? 'البريدجات والمسارات' : 'Micro-Jumpers'}</div>
              </button>

              <button
                onClick={() => handleApplyPreset('CH2', 360)}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                  activePresetChannel === 'CH2' 
                    ? 'bg-orange-500 text-slate-950 font-black border-orange-400 shadow-lg shadow-orange-500/20' 
                    : 'bg-slate-950 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                <div>CH2: 360°C</div>
                <div className="text-[9px] font-normal opacity-80">{isAr ? 'أيسيات BGA والشبلنة' : 'BGA & SMD ICs'}</div>
              </button>

              <button
                onClick={() => handleApplyPreset('CH3', 410)}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                  activePresetChannel === 'CH3' 
                    ? 'bg-orange-500 text-slate-950 font-black border-orange-400 shadow-lg shadow-orange-500/20' 
                    : 'bg-slate-950 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                <div>CH3: 410°C</div>
                <div className="text-[9px] font-normal opacity-80">{isAr ? 'دروع الشيلد والأرضي' : 'Ground Shields'}</div>
              </button>
            </div>
          </div>

          {/* Hot Air Station Controller (6 Cols) */}
          <div className="lg:col-span-6 p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Thermometer size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{isAr ? 'محطة الهواء الساخن (Hot Air Rework Station)' : 'Precision Hot Air Station'}</h3>
                  <span className="text-xs text-slate-400 font-mono">Nozzle: 6mm Spiral Vortex Airflow</span>
                </div>
              </div>

              <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono font-bold rounded-full">
                {hotAirFlowPercent}% AIRFLOW
              </span>
            </div>

            <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-slate-400 font-mono uppercase">{isAr ? 'حرارة الهواء الساخن:' : 'Hot Air Temp:'}</span>
              <div className="text-4xl font-mono font-black text-red-400 flex items-baseline gap-2">
                <span>{hotAirTemp}°C</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">AUTO-COOLING SLEEP DOCK ACTIVE</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-mono">{isAr ? 'ضبط الحرارة:' : 'Adjust Temp:'}</span>
                <input 
                  type="range" 
                  min="200" 
                  max="450" 
                  step="5" 
                  value={hotAirTemp} 
                  onChange={(e) => setHotAirTemp(parseInt(e.target.value))}
                  className="w-full accent-red-500" 
                />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-mono">{isAr ? 'ضبط تدفق الهواء:' : 'Airflow Rate:'}</span>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  step="5" 
                  value={hotAirFlowPercent} 
                  onChange={(e) => setHotAirFlowPercent(parseInt(e.target.value))}
                  className="w-full accent-cyan-500" 
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Ultrasonic Bath Tab */}
      {activeTab === 'ultrasonic_bath' && (
        <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Waves size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{isAr ? 'حوض الألتراسونيك الذكي لإزالة الأكسدة والمياه' : 'Smart Ultrasonic Chemical De-oxidation Bath'}</h3>
                <span className="text-xs text-slate-400 font-mono">Fluid: PCB Pure IPA 99.9% / Elma Clean Flux Remover</span>
              </div>
            </div>

            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-mono font-bold rounded-full">
              40 kHz SWEEP MODE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1">
              <span className="text-xs text-slate-400 font-mono">{isAr ? 'الوقت المتبقي:' : 'Timer Remaining:'}</span>
              <div className="text-3xl font-mono font-black text-cyan-400">
                {Math.floor(ultrasonicRemainingSec / 60)}:{(ultrasonicRemainingSec % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div className="p-5 bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1">
              <span className="text-xs text-slate-400 font-mono">{isAr ? 'حرارة المحلول الكيميائي:' : 'Bath Fluid Temp:'}</span>
              <div className="text-3xl font-mono font-black text-amber-400">{ultrasonicBathTemp}°C</div>
              <span className="text-[10px] text-emerald-400">Optimal (45-55°C)</span>
            </div>

            <div className="p-5 bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2">
              <button
                onClick={() => {
                  setUltrasonicActive(!ultrasonicActive);
                  if (!ultrasonicActive && ultrasonicRemainingSec === 0) {
                    setUltrasonicRemainingSec(ultrasonicMinutes * 60);
                  }
                }}
                className={`px-6 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                  ultrasonicActive 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20' 
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
                }`}
              >
                <Waves size={14} className={ultrasonicActive ? 'animate-bounce' : ''} />
                {ultrasonicActive ? (isAr ? 'إيقاف التنظيف' : 'STOP ULTRASONIC') : (isAr ? 'بدء دورة إزالة الأكسدة' : 'START 8-MIN CYCLE')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Hardware Event Stream */}
      <div className="p-4 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-2 shadow-lg">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
          <Radio size={14} className="text-amber-400" />
          {isAr ? 'سجل أحداث طاولة الصيانة الذكية' : 'Smart Bench Hardware Event Stream'}
        </span>
        <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 h-28 overflow-y-auto font-mono text-[10px] space-y-1.5 text-slate-400">
          {benchLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-1.5 leading-tight">
              <span className="text-amber-400 font-bold shrink-0">&gt;</span>
              <span className="text-slate-300">{log}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
