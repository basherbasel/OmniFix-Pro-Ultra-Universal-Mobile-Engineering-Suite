import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  Settings, 
  ShieldCheck, 
  ChevronRight, 
  Waves,
  RefreshCw,
  MoreVertical,
  Maximize2
} from 'lucide-react';
import { useWorkstation } from '../context/WorkstationContext';

export function MultimeterStudio({ lang }: { lang: 'en' | 'ar' }) {
  const { currentDevice } = useWorkstation();
  const [mode, setMode] = useState<'VOLTS' | 'DIODE' | 'RESISTANCE' | 'CONTINUITY'>('DIODE');
  const [value, setValue] = useState<number>(0.455);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [hold, setHold] = useState(false);

  // Compute reference diode voltage dynamically depending on connected hardware chipset
  const baseDiodeRef = 
    currentDevice.chipset === 'samsung_exynos' ? 0.450 :
    currentDevice.chipset === 'qualcomm' ? 0.385 :
    currentDevice.chipset === 'mediatek' ? 0.320 : 0.420;

  useEffect(() => {
    let interval: any;
    if (isMeasuring && !hold) {
      interval = setInterval(() => {
        // Simulating fluctuations based on mode
        let noise = (Math.random() - 0.5) * 0.005;
        if (mode === 'DIODE') setValue(baseDiodeRef + noise);
        if (mode === 'VOLTS') setValue(3.85 + noise * 10);
        if (mode === 'RESISTANCE') setValue(15.2 + noise * 50);
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isMeasuring, mode, hold, baseDiodeRef]);

  const toggleMeasure = () => {
    setIsMeasuring(!isMeasuring);
    if (!isMeasuring) setHold(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/30 text-indigo-400">
            <Activity size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white leading-tight">
              {lang === 'ar' ? 'مختبر القياس الرقمي المتكامل' : 'Integrated Digital Multimeter Lab'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Fluke-Next AI Simulation Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setHold(!hold)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest border transition-all ${hold ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-lg shadow-amber-500/10' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
            HOLD
          </button>
          <button className="p-2 text-slate-500 hover:text-white transition-colors">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Display Card */}
          <div className="md:col-span-2 bg-slate-900 border-4 border-slate-800 rounded-[3rem] p-1 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-rose-500/5 opacity-50" />
            <div className="bg-slate-950 rounded-[2.8rem] p-10 h-full flex flex-col items-center justify-center gap-8 relative">
              
              {/* Top Mode Indicators */}
              <div className="flex gap-4">
                {['DC', 'AC', 'AUTO', 'REL'].map(tag => (
                  <span key={tag} className="text-[10px] font-black text-slate-700 tracking-tighter">{tag}</span>
                ))}
              </div>

              {/* Main Numbers */}
              <div className="flex flex-col items-center">
                <motion.div 
                  key={mode + value}
                  initial={{ opacity: 0.5, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-8xl font-black text-white font-mono flex items-baseline gap-2 tracking-tighter"
                >
                  {isMeasuring ? value.toFixed(3) : '0.000'}
                  <span className="text-3xl text-indigo-500">
                    {mode === 'DIODE' ? 'V' : mode === 'VOLTS' ? 'V' : 'kΩ'}
                  </span>
                </motion.div>
                <div className="flex items-center gap-2 mt-4">
                   <div className={`w-3 h-3 rounded-full animate-pulse ${isMeasuring ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                     {isMeasuring ? (lang === 'ar' ? 'جاري القياس' : 'LIVE SAMPLING') : (lang === 'ar' ? 'وضع الاستعداد' : 'STANDBY MODE')}
                   </span>
                </div>
              </div>

              {/* Mode Visualizer */}
              <div className="w-full flex justify-center gap-2 pt-8 border-t border-slate-900">
                 {['VOLTS', 'DIODE', 'RESISTANCE', 'CONTINUITY'].map(m => (
                   <button 
                     key={m}
                     onClick={() => setMode(m as any)}
                     className={`px-4 py-2 rounded-xl text-[9px] font-black tracking-widest transition-all ${mode === m ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-slate-600 hover:text-slate-400'}`}
                   >
                     {m}
                   </button>
                 ))}
              </div>
            </div>
          </div>

          {/* Side Controls */}
          <div className="space-y-6 flex flex-col justify-center">
             <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'التحكم اليدوي' : 'Probes Control'}</h3>
                <button 
                  onClick={toggleMeasure}
                  className={`w-full py-6 rounded-2xl font-black text-lg shadow-2xl transition-all ${isMeasuring ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'}`}
                >
                  {isMeasuring ? (lang === 'ar' ? 'فصل' : 'DISCONNECT') : (lang === 'ar' ? 'توصيل' : 'CONNECT')}
                </button>
                <p className="text-[9px] text-slate-600 text-center leading-relaxed">
                  {lang === 'ar' ? 'تأكد من توصيل الكابلات بمنافذ COM و V/Ω المناسبة' : 'Ensure probes are connected to correct COM & V/Ω ports'}
                </p>
             </div>

             <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'مقارنة الممانعة' : 'Diode Reading Lab'}</h3>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-bold">
                     <span className="text-slate-500">{lang === 'ar' ? 'القيمة المرجعية' : 'Ref Value'}</span>
                     <span className="text-emerald-400">{baseDiodeRef.toFixed(3)}V</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-bold">
                     <span className="text-slate-500">{lang === 'ar' ? 'الانحراف' : 'Tolerance'}</span>
                     <span className="text-indigo-400">±0.005V</span>
                   </div>
                   <div className="pt-2 border-t border-slate-800">
                      <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                         <ShieldCheck size={14} className="text-emerald-500" />
                         <span className="text-[10px] font-bold text-emerald-300">PASS: VALUE VALID</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
