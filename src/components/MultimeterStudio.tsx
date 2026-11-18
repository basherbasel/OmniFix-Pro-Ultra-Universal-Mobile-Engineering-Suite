import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Clock,
} from 'lucide-react';
import { useWorkstation } from '../context/WorkstationContext';
import {
  DIODE_REFERENCE_RAILS,
  evaluateDiodeReading,
  DiodeEvaluationResult,
} from '../data/hardwareAtlas';

export function MultimeterStudio({ lang }: { lang: 'en' | 'ar' }) {
  const isAr = lang === 'ar';
  const { currentDevice, recordDiodeMeasurement, diodeSessionLogs } = useWorkstation();

  const [mode, setMode] = useState<'DIODE' | 'VOLTS' | 'RESISTANCE' | 'CONTINUITY'>('DIODE');
  const [selectedRailCode, setSelectedRailCode] = useState<string>(DIODE_REFERENCE_RAILS[0].rail_code);
  const [manualInput, setManualInput] = useState<string>('0.395');
  const [value, setValue] = useState<number>(0.395);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [hold, setHold] = useState(false);
  const [evaluation, setEvaluation] = useState<DiodeEvaluationResult>(() =>
    evaluateDiodeReading(DIODE_REFERENCE_RAILS[0].rail_code, 0.395)
  );

  const selectedRail =
    DIODE_REFERENCE_RAILS.find((r) => r.rail_code === selectedRailCode) || DIODE_REFERENCE_RAILS[0];

  const baseDiodeRef = Number(((selectedRail.min_v + selectedRail.max_v) / 2).toFixed(3));

  useEffect(() => {
    if (!isMeasuring || hold) return;
    const interval = setInterval(() => {
      const noise = (Math.random() - 0.5) * 0.006;
      if (mode === 'DIODE') {
        const nextVal = Math.max(0, baseDiodeRef + noise);
        setValue(nextVal);
        setManualInput(nextVal.toFixed(3));
        setEvaluation(evaluateDiodeReading(selectedRailCode, nextVal));
      } else if (mode === 'VOLTS') {
        setValue(selectedRailCode.includes('BATT') ? 4.18 + noise * 4 : 1.80 + noise * 3);
      } else if (mode === 'RESISTANCE') {
        setValue(18.5 + noise * 150);
      } else {
        setValue(0.45 + Math.abs(noise) * 10);
      }
    }, 320);
    return () => clearInterval(interval);
  }, [isMeasuring, mode, hold, baseDiodeRef, selectedRailCode]);

  const handleEvaluateManual = async (overrideVal?: number) => {
    setIsMeasuring(false);
    const num = overrideVal !== undefined ? overrideVal : parseFloat(manualInput);
    if (isNaN(num)) return;
    setValue(num);
    setManualInput(num.toFixed(3));
    const res = await recordDiodeMeasurement(selectedRailCode, num);
    setEvaluation(res);
  };

  const statusMeta = (status: DiodeEvaluationResult['status']) => {
    if (status === 'SHORT_CIRCUIT') {
      return {
        cls: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
        icon: <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />,
        text: isAr ? 'قصر صريح (SHORT CIRCUIT)' : 'SHORT CIRCUIT',
      };
    }
    if (status === 'LEAKAGE_LOW') {
      return {
        cls: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
        text: isAr ? 'تسريب / مقاومة منخفضة (LEAKAGE)' : 'LEAKAGE / LOW IMPEDANCE',
      };
    }
    if (status === 'OPEN_LINE') {
      return {
        cls: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
        icon: <Zap className="w-4 h-4 text-sky-400 shrink-0" />,
        text: isAr ? 'خط مقطوع (OPEN LINE / OL)' : 'OPEN LINE (OL)',
      };
    }
    return {
      cls: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
      text: isAr ? 'قراءة طبيعية سليمة (HEALTHY)' : 'HEALTHY RANGE',
    };
  };

  const st = statusMeta(evaluation.status);

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/30 text-indigo-400">
            <Activity size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white leading-tight">
              {isAr ? 'مختبر القياس الرقمي وممانعة الدايود (DMM Diode Studio)' : 'Digital Multimeter & Diode Reference Lab'}
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              {currentDevice.brand} {currentDevice.marketName} • Red Probe on GND / Black Probe on Rail
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHold(!hold)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wider border transition-all cursor-pointer ${
              hold
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {hold ? 'HOLD ON' : 'HOLD'}
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto custom-scrollbar">
        {/* Left: Digital Multimeter Readout + Direct Diode Tester */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>FLUKE-87V BENCH CALIBRATION</span>
              <span className={isMeasuring ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {isMeasuring ? (isAr ? 'بث قياس مباشر' : 'LIVE PROBE') : (isAr ? 'قياس يدوي/مرجعي' : 'STATIC CHECK')}
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center">
              <div className="text-6xl sm:text-7xl font-black text-white font-mono tabular-nums flex items-baseline gap-2">
                {mode === 'DIODE' && value >= 1.1 ? 'OL' : value.toFixed(3)}
                <span className="text-2xl text-indigo-400">
                  {mode === 'DIODE' || mode === 'VOLTS' ? 'V' : 'Ω'}
                </span>
              </div>
              <div className="text-xs font-mono text-cyan-400 mt-2">{selectedRail.rail_code}</div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {(['DIODE', 'VOLTS', 'RESISTANCE', 'CONTINUITY'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3.5 py-2 rounded-lg text-[11px] font-bold tracking-wider border transition-all cursor-pointer ${
                    mode === m
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
              <button
                onClick={() => {
                  setIsMeasuring(!isMeasuring);
                  if (!isMeasuring) setHold(false);
                }}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  isMeasuring
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-emerald-600 text-white border-emerald-400'
                }`}
              >
                {isMeasuring ? (isAr ? 'فصل المجسات' : 'STOP PROBE') : (isAr ? 'محاكاة ملامسة المجسات' : 'LIVE PROBE')}
              </button>
            </div>
          </div>

          {/* Direct Rail & Value Evaluation */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              {isAr ? 'تقييم قراءة الممانعة (Diode Mode Evaluator)' : 'Rail Diode Mode Evaluator'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'المسار المراد فحصه:' : 'Target Hardware Rail:'}</label>
                <select
                  value={selectedRailCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedRailCode(code);
                    const rail = DIODE_REFERENCE_RAILS.find((r) => r.rail_code === code);
                    if (rail) {
                      const mid = Number(((rail.min_v + rail.max_v) / 2).toFixed(3));
                      setManualInput(mid.toFixed(3));
                      setValue(mid);
                      setEvaluation(evaluateDiodeReading(code, mid));
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                >
                  {DIODE_REFERENCE_RAILS.map((r) => (
                    <option key={r.rail_code} value={r.rail_code}>
                      {r.rail_code} ({r.min_v.toFixed(2)}–{r.max_v.toFixed(2)}V)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'القراءة المقاسة (V):' : 'Measured (V):'}</label>
                <input
                  type="number"
                  step="0.005"
                  min="0"
                  max="3.0"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono tabular-nums text-amber-300"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleEvaluateManual()}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                {isAr ? 'فحص وتسجيل القراءة في الجلسة' : 'Evaluate & Log Reading'}
              </button>
              <button
                onClick={() => handleEvaluateManual(0.012)}
                className="px-3 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-[11px] font-mono cursor-pointer"
              >
                0.012V Short
              </button>
              <button
                onClick={() => handleEvaluateManual(Math.max(0.08, selectedRail.short_threshold + 0.04))}
                className="px-3 py-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 text-[11px] font-mono cursor-pointer"
              >
                Leakage Test
              </button>
              <button
                onClick={() => handleEvaluateManual(1.85)}
                className="px-3 py-2 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/30 text-sky-300 text-[11px] font-mono cursor-pointer"
              >
                OL (Open)
              </button>
              <button
                onClick={() => handleEvaluateManual(baseDiodeRef)}
                className="px-3 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono cursor-pointer"
              >
                {baseDiodeRef.toFixed(3)}V Healthy
              </button>
            </div>

            {/* Live Verdict Output */}
            <div className={`p-4 rounded-xl border space-y-2 text-xs ${st.cls}`}>
              <div className="flex items-center justify-between gap-2 font-bold">
                <span className="flex items-center gap-2">{st.icon} {st.text}</span>
                <span className="font-mono tabular-nums">
                  {evaluation.measured_v.toFixed(3)}V / Ref: {selectedRail.min_v.toFixed(2)}–{selectedRail.max_v.toFixed(2)}V
                </span>
              </div>
              <p className="text-slate-100 leading-relaxed">
                {isAr ? evaluation.diagnosis : evaluation.diagnosis_en}
              </p>
              <p className="text-[11px] opacity-90 flex items-center gap-1.5">
                <ShieldCheck size={13} />
                <span>{evaluation.safety_note}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Rail Reference Specs + Session Log */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              {isAr ? 'مواصفات المسار المرجعية' : 'Reference Rail Specifications'}
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">{isAr ? 'اسم المسار:' : 'Rail Name:'}</span>
                <span className="text-white font-semibold">{isAr ? selectedRail.name_ar : selectedRail.name_en}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 font-mono tabular-nums">
                <span className="text-slate-400">{isAr ? 'المدى الطبيعي:' : 'Healthy Range:'}</span>
                <span className="text-emerald-400 font-bold">{selectedRail.min_v.toFixed(3)}V – {selectedRail.max_v.toFixed(3)}V</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 font-mono tabular-nums">
                <span className="text-slate-400">{isAr ? 'حد القصر الصريح:' : 'Short Threshold:'}</span>
                <span className="text-rose-400 font-bold">&lt; {selectedRail.short_threshold.toFixed(3)}V</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase block">
                  {isAr ? 'مشتبهات القصر (Short Suspects):' : 'Short Circuit Suspects:'}
                </span>
                <p className="text-slate-300 leading-relaxed">{selectedRail.short_suspects}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-sky-400 uppercase block">
                  {isAr ? 'مشتبهات القطع (Open Line Suspects):' : 'Open Line Suspects:'}
                </span>
                <p className="text-slate-300 leading-relaxed">{selectedRail.open_suspects}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Clock size={14} className="text-indigo-400" />
              <span>{isAr ? 'سجل قياسات الممانعة في الجلسة' : 'Diode Session Measurements'}</span>
            </div>
            {diodeSessionLogs.length === 0 ? (
              <p className="text-xs text-slate-500">
                {isAr ? 'لم يتم تسجيل قياسات دايود بعد — اضغط "فحص وتسجيل القراءة" لتوثيق القياس في ملف التذكرة.' : 'No diode checks logged yet.'}
              </p>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {diodeSessionLogs.slice(0, 8).map((log, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-[11px]">
                    <div>
                      <span className="font-mono text-cyan-300 font-bold block">{log.rail_code}</span>
                      <span className="text-slate-400">{log.timestamp}</span>
                    </div>
                    <div className="text-end font-mono tabular-nums">
                      <span className="text-white font-bold block">{log.measured_v.toFixed(3)}V</span>
                      <span className={
                        log.status === 'SHORT_CIRCUIT' ? 'text-rose-400' :
                        log.status === 'LEAKAGE_LOW' ? 'text-amber-400' :
                        log.status === 'OPEN_LINE' ? 'text-sky-400' : 'text-emerald-400'
                      }>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
