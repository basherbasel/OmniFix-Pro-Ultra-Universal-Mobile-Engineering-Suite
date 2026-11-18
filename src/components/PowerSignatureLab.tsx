import React, { useState, useEffect } from 'react';
import {
  Zap,
  Activity,
  Trash2,
  Play,
  Square,
  AlertTriangle,
  ShieldCheck,
  Thermometer,
  Gauge,
  Cpu,
  CheckCircle2,
  AlertOctagon,
  Clock,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useWorkstation } from '../context/WorkstationContext';
import { analyzeDcPowerDraw, PowerAnalysisResult } from '../services/powerAnalyzer';

interface PowerDataPoint {
  time: number | string;
  current: number; // in mA
  voltage: number; // in V
  phase?: string;
}

export function PowerSignatureLab({ lang }: { lang: 'en' | 'ar' }) {
  const isAr = lang === 'ar';
  const { currentDevice, recordPowerAnalysis, powerSessionLogs } = useWorkstation();

  const inferArchitecture = (): 'apple' | 'qualcomm' | 'mediatek' => {
    const brand = (currentDevice?.brand || '').toLowerCase();
    const chip = (currentDevice?.chipset || '').toLowerCase();
    if (brand.includes('apple') || brand.includes('iphone') || chip.includes('apple')) return 'apple';
    if (chip.includes('mediatek') || chip.includes('mtk') || chip.includes('dimensity') || chip.includes('helio')) return 'mediatek';
    return 'qualcomm';
  };

  const [architecture, setArchitecture] = useState<'apple' | 'qualcomm' | 'mediatek'>(inferArchitecture);
  const [preBootMa, setPreBootMa] = useState<string>('0');
  const [postBootMa, setPostBootMa] = useState<string>('140');
  const [bootBehavior, setBootBehavior] = useState<'zero' | 'drops_to_zero' | 'stuck' | 'cycling'>('stuck');
  const [analysis, setAnalysis] = useState<PowerAnalysisResult>(() =>
    analyzeDcPowerDraw(inferArchitecture(), 0, 140, 'stuck')
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [data, setData] = useState<PowerDataPoint[]>(() =>
    analyzeDcPowerDraw(inferArchitecture(), 0, 140, 'stuck').waveform_curve.map((pt) => ({
      time: `${pt.time_s}s`,
      current: pt.current_ma,
      voltage: 4.2 - pt.current_ma / 6000,
      phase: pt.phase,
    }))
  );
  const [currentLimit, setCurrentLimit] = useState(2000); // 2A
  const [voltageSet, setVoltageSet] = useState(4.2); // 4.2V VBAT

  const [liveAmps, setLiveAmps] = useState(140);
  const [liveVolts, setLiveVolts] = useState(4.18);
  const [liveTemp, setLiveTemp] = useState(29.1);

  useEffect(() => {
    const inferred = inferArchitecture();
    setArchitecture(inferred);
  }, [currentDevice?.id, currentDevice?.brand, currentDevice?.chipset]);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setData((prev) => {
        const idx = prev.length;
        const base = Math.max(Number(postBootMa) || 0, Number(preBootMa) || 0);
        let newCurrent = base;
        if (bootBehavior === 'cycling') {
          newCurrent = idx % 4 < 2 ? Math.max(120, base) : 25;
        } else if (bootBehavior === 'drops_to_zero') {
          newCurrent = idx % 5 === 1 ? Math.max(45, base) : 0;
        } else if (bootBehavior === 'zero') {
          newCurrent = Number(preBootMa) || 0;
        } else {
          newCurrent = base + (Math.random() - 0.5) * 14;
        }
        newCurrent = Math.max(0, Math.round(newCurrent));
        const newVolts = Number((voltageSet - newCurrent / 5500).toFixed(2));
        setLiveAmps(newCurrent);
        setLiveVolts(newVolts);
        setLiveTemp(28.4 + (newCurrent / 1000) * 6.5);
        return [...prev.slice(-39), { time: `${(idx * 0.2).toFixed(1)}s`, current: newCurrent, voltage: newVolts }];
      });
    }, 220);
    return () => clearInterval(interval);
  }, [isRecording, postBootMa, preBootMa, bootBehavior, voltageSet]);

  const runAnalysis = async (
    archOverride?: 'apple' | 'qualcomm' | 'mediatek',
    preOverride?: number,
    postOverride?: number,
    behOverride?: 'zero' | 'drops_to_zero' | 'stuck' | 'cycling'
  ) => {
    const targetArch = archOverride ?? architecture;
    const targetPre = preOverride ?? (Number(preBootMa) || 0);
    const targetPost = postOverride ?? (Number(postBootMa) || 0);
    const targetBeh = behOverride ?? bootBehavior;

    if (archOverride) setArchitecture(archOverride);
    if (preOverride !== undefined) setPreBootMa(String(preOverride));
    if (postOverride !== undefined) setPostBootMa(String(postOverride));
    if (behOverride) setBootBehavior(behOverride);

    setIsRecording(false);
    setIsAnalyzing(true);
    try {
      const res = await recordPowerAnalysis(targetArch, targetPre, targetPost, targetBeh);
      setAnalysis(res);
      setData(
        res.waveform_curve.map((pt) => ({
          time: `${pt.time_s}s`,
          current: pt.current_ma,
          voltage: Number((voltageSet - pt.current_ma / 5500).toFixed(2)),
          phase: pt.phase,
        }))
      );
      const peak = Math.max(...res.waveform_curve.map((p) => p.current_ma), targetPre, targetPost);
      setLiveAmps(peak);
      setLiveVolts(Number((voltageSet - peak / 5500).toFixed(2)));
      setLiveTemp(28.4 + (peak / 1000) * 6.5);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearData = () => {
    setIsRecording(false);
    setData([]);
    setLiveAmps(0);
  };

  const severityBadge = (sev: PowerAnalysisResult['severity']) => {
    if (sev === 'critical') {
      return {
        cls: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
        icon: <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />,
        label: isAr ? 'حرج جداً (قصر/خطر)' : 'CRITICAL FAULT',
      };
    }
    if (sev === 'high') {
      return {
        cls: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
        label: isAr ? 'عطل عالي الخطورة' : 'HIGH SEVERITY',
      };
    }
    if (sev === 'medium') {
      return {
        cls: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
        icon: <Activity className="w-4 h-4 text-sky-400 shrink-0" />,
        label: isAr ? 'تتبع متوسط' : 'MEDIUM',
      };
    }
    return {
      cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
      label: isAr ? 'إقلاع طبيعي' : 'NORMAL BOOT',
    };
  };

  const sev = severityBadge(analysis.severity);

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans">
      {/* Top Header Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <Zap size={20} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white leading-tight">
              {isAr ? 'محلل تسلسل إقلاع الباور سبلاي (DC Boot-Sequence Analyzer)' : 'DC Power Supply Boot-Sequence Analyzer'}
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              {currentDevice.brand} {currentDevice.marketName} • {architecture.toUpperCase()} Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRecording ? <Square size={14} /> : <Play size={14} />}
            <span>{isRecording ? (isAr ? 'إيقاف العيّنة الحية' : 'STOP STREAM') : (isAr ? 'مراقبة حية 5Hz' : 'LIVE STREAM')}</span>
          </button>
          <button
            onClick={clearData}
            title={isAr ? 'تفريغ الرسم' : 'Clear Chart'}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto custom-scrollbar">
        {/* Left Controls & Live Meters */}
        <div className="lg:col-span-4 space-y-4">
          {/* Live Telemetry Readout */}
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  {isAr ? 'شدة التيار المسحوب' : 'Current Draw'}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-black text-amber-400 font-mono tabular-nums">{liveAmps}</span>
                  <span className="text-xs font-bold text-slate-500">mA</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  {isAr ? 'الجهد المزوّد' : 'Supply Voltage'}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-black text-emerald-400 font-mono tabular-nums">{liveVolts.toFixed(2)}</span>
                  <span className="text-xs font-bold text-slate-500">V</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono tabular-nums">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500 flex items-center gap-1"><Thermometer size={12} /> {isAr ? 'الحرارة' : 'Temp'}</span>
                <span>{liveTemp.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500 flex items-center gap-1"><Gauge size={12} /> {isAr ? 'القدرة' : 'Power'}</span>
                <span>{((liveAmps * liveVolts) / 1000).toFixed(2)}W</span>
              </div>
            </div>
          </div>

          {/* Boot-Sequence Input Form */}
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu size={14} className="text-indigo-400" />
              <span>{isAr ? 'إدخال قراءات الباور سبلاي' : 'DC Bench Readings Input'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'معمارية اللوحة:' : 'Board Architecture:'}</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['apple', 'qualcomm', 'mediatek'] as const).map((arch) => (
                    <button
                      key={arch}
                      onClick={() => setArchitecture(arch)}
                      className={`py-2 px-2 rounded-lg text-[11px] font-bold font-mono uppercase border transition-all cursor-pointer ${
                        architecture === arch
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {arch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {isAr ? 'قبل الباور (mA):' : 'Pre-Boot Draw (mA):'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    value={preBootMa}
                    onChange={(e) => setPreBootMa(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono tabular-nums text-amber-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {isAr ? 'بعد الباور (mA):' : 'Post-Boot Draw (mA):'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    value={postBootMa}
                    onChange={(e) => setPostBootMa(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono tabular-nums text-cyan-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'سلوك المؤشر:' : 'Needle Behavior:'}</label>
                <select
                  value={bootBehavior}
                  onChange={(e) => setBootBehavior(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="stuck">{isAr ? 'ثابت عند القيمة (Stuck)' : 'Stuck / Constant'}</option>
                  <option value="drops_to_zero">{isAr ? 'يرتفع ثم يعود للصفر (Drops to 0)' : 'Rises then Drops to Zero'}</option>
                  <option value="cycling">{isAr ? 'متذبذب / يعيد التشغيل (Cycling)' : 'Oscillating / Bootloop'}</option>
                  <option value="zero">{isAr ? 'لا استجابة (Zero Draw)' : 'Zero Response'}</option>
                </select>
              </div>

              <button
                onClick={() => runAnalysis()}
                disabled={isAnalyzing}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Activity size={15} />
                <span>{isAnalyzing ? (isAr ? 'جاري التحليل...' : 'Analyzing...') : (isAr ? 'تحليل البصمة الكهربائية وتسجيلها' : 'Analyze & Log Power Signature')}</span>
              </button>
            </div>

            {/* Quick Fault Presets */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                {isAr ? 'سيناريوهات أعطال مخبرية سريعة:' : 'Quick Fault Diagnostic Presets:'}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { label: isAr ? 'آيفون: شورت 620mA قبل الباور' : 'Apple: 620mA Pre-Boot Short', arch: 'apple' as const, pre: 620, post: 620, beh: 'stuck' as const },
                  { label: isAr ? 'آيفون: تسريب Hydra/Tristar (45mA)' : 'Apple: 45mA Hydra Leakage', arch: 'apple' as const, pre: 45, post: 180, beh: 'stuck' as const },
                  { label: isAr ? 'ميدياتك: فشل إقلاع PMIC (55mA ثم 0)' : 'MTK: 55mA PMIC Drop to 0', arch: 'mediatek' as const, pre: 0, post: 55, beh: 'drops_to_zero' as const },
                  { label: isAr ? 'كوالكوم: تعليق EDL/UFS (140mA ثابت)' : 'Qualcomm: 140mA EDL Stuck', arch: 'qualcomm' as const, pre: 0, post: 140, beh: 'stuck' as const },
                  { label: isAr ? 'إقلاع نظام طبيعي (780mA)' : 'Normal OS Boot (780mA)', arch: architecture, pre: 0, post: 780, beh: 'stuck' as const },
                ].map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => runAnalysis(preset.arch, preset.pre, preset.post, preset.beh)}
                    className="text-start px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{preset.label}</span>
                    <span className="font-mono text-[10px] text-amber-400 tabular-nums">{preset.pre}/{preset.post}mA</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* OCP & Voltage Safety Sliders */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">{isAr ? 'الجهد المضبوط:' : 'Bench Voltage:'}</span>
              <span className="text-indigo-400 font-bold">{voltageSet.toFixed(1)}V</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={voltageSet}
              onChange={(e) => setVoltageSet(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">{isAr ? 'حد الحماية OCP:' : 'OCP Limit:'}</span>
              <span className="text-rose-400 font-bold">{(currentLimit / 1000).toFixed(1)}A</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={currentLimit}
              onChange={(e) => setCurrentLimit(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-rose-500"
            />
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-[11px] text-amber-200">
              <ShieldCheck size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'قاعدة السلامة المخبرية: عند فحص الشورت بحقن الجهد على VPH_PWR / VDD_MAIN، لا تتجاوز 1.0V–1.5V وتيار 2.5A كحد أقصى.'
                  : 'Bench Safety Limit: For thermal short tracing on VDD_MAIN/VPH_PWR, cap injection at 1.0V–1.5V / 2.5A max.'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Scientific Verdict & Waveform Chart */}
        <div className="lg:col-span-8 space-y-5">
          {/* Scientific Analysis Verdict Card */}
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {sev.icon}
                <h3 className="text-sm font-black text-white">
                  {isAr ? analysis.fault_title : analysis.fault_title_en}
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-md border text-[11px] font-mono font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 ${sev.cls}`}>
                {sev.icon}
                <span>{sev.label} • {analysis.stage}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase block">
                  {isAr ? 'الخطوط والمكونات المشتبه بها:' : 'Suspect Rails & Components:'}
                </span>
                <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-800/70">
                  {analysis.suspect_rails.map((rail, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 font-mono text-[11px] text-cyan-300">
                      {rail}
                    </span>
                  ))}
                </div>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {(isAr ? analysis.suspect_components : analysis.suspect_components_en).map((comp, i) => (
                    <li key={i} className="leading-relaxed">{comp}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                  {isAr ? 'خطة الفحص والإصلاح الآمنة:' : 'Safe Bench Action Plan:'}
                </span>
                <ol className="space-y-1.5 text-slate-200 list-decimal list-inside">
                  {(isAr ? analysis.action_plan : analysis.action_plan_en).map((step, i) => (
                    <li key={i} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Current Signature Graph */}
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 h-[340px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" />
                <span>{isAr ? 'منحنى استهلاك تيار الإقلاع (mA Waveform)' : 'Boot Current Waveform Curve (mA)'}</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                {isRecording ? (isAr ? 'بث حي نشط' : 'LIVE SAMPLING') : `${data.length} ${isAr ? 'نقطة قياس' : 'samples'}`}
              </span>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}mA`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }}
                    itemStyle={{ color: '#fbbf24' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCurrent)"
                    animationDuration={200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Session History */}
          {powerSessionLogs.length > 0 && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Clock size={14} className="text-indigo-400" />
                <span>{isAr ? 'سجل قياسات الباور سبلاي للجلسة الحالية' : 'Session Power Analysis Ledger'}</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {powerSessionLogs.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500">{item.timestamp}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono uppercase text-cyan-300">{item.architecture}</span>
                      <span className="text-slate-200 font-semibold">{isAr ? item.fault_title : item.fault_title_en}</span>
                    </div>
                    <span className="font-mono text-amber-400 tabular-nums">
                      Pre {item.preBootMa}mA / Post {item.postBootMa}mA
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
