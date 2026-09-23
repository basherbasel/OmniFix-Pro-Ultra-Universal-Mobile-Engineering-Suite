import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Activity, 
  ShieldAlert, 
  Database, 
  CheckCircle2, 
  Search, 
  Lock, 
  Unlock, 
  Usb, 
  Clock, 
  FileSearch, 
  Settings, 
  RefreshCw,
  AlertTriangle,
  Hexagon,
  Microchip,
  Waves,
  Eye,
  Info,
  Sparkles,
  CircuitBoard,
  CpuIcon,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConnectedDevice } from '../types';
import { ApexAgentState, ApexModuleId } from '../agents/apex/types';
import { ApexEngine, INITIAL_APEX_STATE } from '../agents/apex/engine';

interface ApexAgentDashboardProps {
  device: ConnectedDevice;
  lang: 'en' | 'ar';
  onNavigate: (tabId: string) => void;
}

export const ApexAgentDashboard: React.FC<ApexAgentDashboardProps> = ({ device, lang, onNavigate }) => {
  const isAr = lang === 'ar';
  const [state, setState] = useState<ApexAgentState>(INITIAL_APEX_STATE);
  const engineRef = useRef<ApexEngine | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Advanced Telemetry Simulation
  const [telemetry, setTelemetry] = useState<number[]>(Array(20).fill(0).map(() => Math.random() * 40 + 20));

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => [...prev.slice(1), Math.random() * 40 + (state.isBusy ? 50 : 20)]);
    }, 500);
    return () => clearInterval(interval);
  }, [state.isBusy]);

  useEffect(() => {
    engineRef.current = new ApexEngine(setState);
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.logs]);

  const handleStartAgent = () => {
    if (engineRef.current && !state.isBusy) {
      engineRef.current.runPipeline(device);
    }
  };

  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.reset();
    }
  };

  const modules = Object.values(state.modules);

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-3xl text-slate-800 overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-xl perspective-2000 preserve-3d">
      {/* Top Status Bar */}
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between sticky top-0 z-20 backdrop-blur-2xl preserve-3d">
        <div className="flex items-center gap-6">
          <motion.div 
            animate={state.isBusy ? { 
              rotate: 360,
              scale: [1, 1.1, 1],
              boxShadow: ["0 0 0px rgba(99,102,241,0)", "0 0 50px rgba(99,102,241,0.6)", "0 0 0px rgba(99,102,241,0)"]
            } : {}}
            transition={{ 
              rotate: { duration: 12, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity },
              boxShadow: { duration: 2, repeat: Infinity }
            }}
            className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-800 flex items-center justify-center shadow-2xl shadow-indigo-600/40 border border-white/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <CpuIcon className="w-9 h-9 text-white relative z-10" />
          </motion.div>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                ApexAgent <span className="text-indigo-600 not-italic ml-1 opacity-80">AI</span>
              </h1>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-sm" />
                <span className="text-[11px] font-black text-indigo-600 tracking-[0.2em] uppercase">ULTRA MULTI-CORE 2.6</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-bold mt-1.5 opacity-80 uppercase tracking-widest">
              {isAr ? 'منظومة المعالجة الذكية المستقلة والتشخيص الجنائي العميق' : 'Autonomous Neural Processing & Deep Forensic Diagnostic Engine'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Advanced Telemetry Graph */}
          <div className="hidden lg:flex items-center gap-6 bg-white/60 px-6 py-4 rounded-[1.5rem] border border-slate-200 shadow-sm preserve-3d">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-[0.3em]">{isAr ? 'حمل النواة' : 'NEURAL LOAD'}</span>
              <div className="flex items-end gap-1.5 h-8 mt-2">
                {telemetry.map((val, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: `${val}%`, backgroundColor: state.isBusy ? '#4f46e5' : '#e2e8f0' }}
                    className={`w-1.5 rounded-full ${state.isBusy ? 'shadow-sm' : ''}`}
                  />
                ))}
              </div>
            </div>
            <div className="w-px h-12 bg-slate-100 mx-2" />
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-[0.3em]">LATENCY</span>
              <span className="text-lg font-mono text-emerald-600 font-black tracking-tighter mt-1">0.28 ms</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('agent-encyclopedia')}
              className="px-6 py-4 rounded-[1.5rem] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-sm group"
            >
              <BookOpen className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span>{isAr ? 'موسوعة الخبرات واللغات' : 'Skills & OS Encyclopedia'}</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-mono">4 DOMAINS</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 180, backgroundColor: "rgba(248,250,252,0.8)" }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              disabled={state.isBusy}
              className="p-4 rounded-[1.25rem] bg-slate-50 text-slate-500 transition-all border border-slate-200 disabled:opacity-20 shadow-sm"
            >
              <RefreshCw className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, translateY: -4, boxShadow: "0 20px 40px rgba(79,70,229,0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartAgent}
              disabled={state.isBusy}
              className={`px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 transition-all relative overflow-hidden group border-2 ${
                state.isBusy 
                  ? 'bg-slate-800 border-white/5 text-slate-500' 
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 text-white border-white/20'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
              {state.isBusy ? <Activity className="w-6 h-6 animate-spin relative z-10" /> : <Zap className="w-6 h-6 fill-white relative z-10" />}
              <span className="relative z-10">{isAr ? (state.isBusy ? 'جاري التحليل...' : 'بدء المعالجة') : (state.isBusy ? 'Analyzing...' : 'Initialize AI')}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden preserve-3d">
        
        {/* Left: Module Pipeline (lg:col-span-4) */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col p-10 bg-slate-50/50 relative z-10">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4">
              <Waves className="w-6 h-6 text-indigo-500" />
              {isAr ? 'تسلسل المعالجة العصبية' : 'Processing Pipeline'}
            </h2>
            <div className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black font-mono text-indigo-600 shadow-sm uppercase tracking-widest">
              Core_0x4A2
            </div>
          </div>

          <div className="space-y-12 relative flex-1 overflow-y-auto pr-4 custom-scrollbar preserve-3d">
            {/* Vertical Line */}
            <div className="absolute left-[31px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-slate-100 via-indigo-500/20 to-slate-100" />

            {modules.map((module, idx) => {
              const isActive = state.currentModule === module.id;
              const isCompleted = module.status === 'COMPLETED';
              const isProcessing = module.status === 'PROCESSING';

              return (
                <motion.div 
                  key={module.id} 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative z-10 flex gap-8 preserve-3d"
                >
                  <motion.div 
                    initial={false}
                    animate={{
                      scale: isActive || isProcessing ? 1.2 : 1,
                      z: isActive || isProcessing ? 60 : 0,
                      rotateY: isActive || isProcessing ? 15 : 0
                    }}
                    className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-all duration-700 relative overflow-hidden group shadow-lg ${
                    isCompleted 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                      : isActive || isProcessing
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-600/20'
                        : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    {isCompleted ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : isProcessing ? (
                      <Activity className="w-8 h-8 animate-spin" />
                    ) : (
                      <span className="text-lg font-black italic tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">{idx + 1}</span>
                    )}
                  </motion.div>

                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-base font-black tracking-tight transition-all duration-500 uppercase ${
                        isActive || isProcessing ? 'text-slate-900 translate-x-2' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {isAr ? module.nameAr : module.nameEn}
                      </h3>
                      <AnimatePresence>
                        {isProcessing && (
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[11px] font-black font-mono text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 shadow-sm"
                          >
                            {module.progress}%
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className={`text-xs mt-3 leading-relaxed font-bold transition-colors opacity-90 ${
                      isActive || isProcessing ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {isAr ? module.messageAr : module.messageEn}
                    </p>

                    <div className={`mt-5 h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 transition-all duration-500 ${
                      isActive || isProcessing ? 'opacity-100 scale-y-100 shadow-sm' : 'opacity-0 scale-y-0'
                    }`}>
                      <motion.div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${module.progress}%` }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 pt-10 border-t border-slate-200">
            <motion.div 
              whileHover={{ scale: 1.02, rotateX: -2, z: 20 }}
              className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 shadow-sm relative overflow-hidden group preserve-3d"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <CircuitBoard className="w-20 h-20 text-indigo-900" />
              </div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-[1rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                  <ShieldCheck className="w-7 h-7 text-indigo-600" />
                </div>
                <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">{isAr ? 'بروتوكول الحماية النشط' : 'Neural Safety Engine'}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-bold opacity-80">
                {isAr 
                  ? 'يتم تشغيل كافة العمليات في بيئة معزولة (Sandbox) مع تفعيل نظام النسخ الاحتياطي التلقائي للقطاعات الحساسة لضمان أمان الهاتف بنسبة 100%.'
                  : 'All operations isolated in secure sandbox. Mandatory automated partition snapshots active with zero-byte loss guarantee.'}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Center: Module Insight (lg:col-span-5) */}
        <div className="lg:col-span-5 border-r border-slate-200 flex flex-col p-10 bg-white relative overflow-hidden preserve-3d">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/30 blur-[150px] rounded-full -mr-[250px] -mt-[250px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4">
                <Eye className="w-6 h-6 text-indigo-500" />
                {isAr ? 'نظرة داخل نواة المحرك' : 'Neural Core Insights'}
              </h2>
              <AnimatePresence>
                {state.isBusy && (
                  <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    className="flex items-center gap-4 bg-indigo-500/15 px-5 py-2 rounded-full border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                  >
                    <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,1)]" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] italic">Live Deep Scan...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar preserve-3d">
              <AnimatePresence mode="wait">
                {state.currentModule === 'SENSORY' && (
                  <motion.div 
                    key="sensory"
                    initial={{ opacity: 0, scale: 0.9, rotateY: -20, z: -100 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0, z: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateY: 20, z: -100 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="space-y-8 preserve-3d"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <motion.div 
                        whileHover={{ translateZ: 30, backgroundColor: "rgba(255,255,255,0.05)" }}
                        className="p-6 rounded-[2rem] bg-black/60 border border-white/10 shadow-2xl group transition-all hover:border-indigo-500/50 preserve-3d"
                      >
                        <span className="text-[10px] text-slate-600 block mb-3 uppercase font-black tracking-[0.3em]">USB IDENTITY</span>
                        <span className="text-lg font-mono text-indigo-400 font-black tracking-tighter group-hover:text-indigo-300 transition-colors">{state.identification?.detectedVidPid || '0x0000:0x0000'}</span>
                      </motion.div>
                      <motion.div 
                        whileHover={{ translateZ: 30, backgroundColor: "rgba(255,255,255,0.05)" }}
                        className="p-6 rounded-[2rem] bg-black/60 border border-white/10 shadow-2xl group transition-all hover:border-indigo-500/50 preserve-3d"
                      >
                        <span className="text-[10px] text-slate-600 block mb-3 uppercase font-black tracking-[0.3em]">BUS PROTOCOL</span>
                        <span className="text-lg font-mono text-indigo-400 font-black tracking-tighter group-hover:text-indigo-300 transition-colors uppercase">{state.identification?.detectedMode || 'IDLE'}</span>
                      </motion.div>
                    </div>
                    <motion.div 
                      whileHover={{ translateZ: 50, rotateX: 2 }}
                      className="p-8 rounded-[2.5rem] bg-white/5 border border-white/20 flex items-center justify-between shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative overflow-hidden group preserve-3d"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
                      <div className="flex items-center gap-6 relative z-10">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                          className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/40 group-hover:scale-110 transition-transform shadow-[inset_0_0_20px_rgba(99,102,241,0.2)]"
                        >
                          <Microchip className="w-10 h-10" />
                        </motion.div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-black tracking-[0.3em] mb-1">{isAr ? 'المعالج المكتشف' : 'Neural CPU Identity'}</span>
                          <span className="text-2xl font-black text-white capitalize tracking-tighter group-hover:text-indigo-200 transition-colors">{state.identification?.matchedChipset || 'Detecting SoC...'}</span>
                        </div>
                      </div>
                      <div className="text-right relative z-10">
                        <span className="text-[10px] text-slate-500 block uppercase font-black tracking-[0.3em] mb-1">{isAr ? 'الدقة' : 'Probability'}</span>
                        <span className="text-3xl font-black text-emerald-400 italic bg-emerald-500/20 px-5 py-2 rounded-2xl border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]">{(state.identification?.confidence || 0) * 100}%</span>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {state.currentModule === 'SAFETY' && (
                  <motion.div 
                    key="safety"
                    initial={{ opacity: 0, scale: 0.9, rotateY: -20, z: -100 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0, z: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateY: 20, z: -100 }}
                    className="space-y-8 preserve-3d"
                  >
                    <motion.div 
                      whileHover={{ translateZ: 40 }}
                      className="p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-6 shadow-[0_40px_100px_rgba(16,185,129,0.1)] relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-transparent to-transparent animate-shimmer" />
                      <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/40 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-10 h-10 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-xl font-black text-emerald-400 uppercase italic tracking-tight">{isAr ? 'بيئة آمنة معتمدة' : 'Validation Pipeline'}</h3>
                        <p className="text-[11px] font-black text-emerald-600/80 tracking-[0.3em] uppercase mt-2">Quantum-safe entropy handshake active.</p>
                      </div>
                    </motion.div>

                    <div className="space-y-6 preserve-3d">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">{isAr ? 'سجل النسخ الاحتياطي التلقائي' : 'Snapshot Registry'}</span>
                        <Database className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {state.safety?.backupsExecuted.map((b, i) => (
                          <motion.div 
                            initial={{ x: -40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ translateZ: 30, backgroundColor: "rgba(255,255,255,0.05)" }}
                            key={i} 
                            className="p-6 rounded-[1.75rem] bg-black/60 border border-white/10 flex items-center justify-between group hover:border-indigo-500/40 transition-all shadow-2xl preserve-3d"
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-[1rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400/60 border border-white/10 group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-all">
                                <Database className="w-6 h-6" />
                              </div>
                              <div>
                                <span className="text-sm font-black font-mono text-white tracking-tight uppercase">{b.partitionName}</span>
                                <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                  <span className="text-[10px] font-mono font-black uppercase text-slate-600">OFFSET: 0x{Math.floor(Math.random()*10000).toString(16)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <span className="text-[11px] font-mono text-slate-600 font-black tracking-tighter">{(b.sizeBytes / 1024).toFixed(0)} KB</span>
                              <span className="px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black tracking-[0.2em] border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.2)]">VERIFIED</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {state.currentModule === 'FORENSIC' && (
                  <motion.div 
                    key="forensic"
                    initial={{ opacity: 0, scale: 0.9, rotateY: -20, z: -100 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0, z: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateY: 20, z: -100 }}
                    className="space-y-8 preserve-3d"
                  >
                    <motion.div 
                      whileHover={{ translateZ: 40 }}
                      className="p-8 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/30 shadow-[0_40px_100px_rgba(245,158,11,0.1)] relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-transparent pointer-events-none" />
                      <div className="flex items-center gap-5 mb-5 relative z-10">
                        <div className="w-14 h-14 rounded-[1.25rem] bg-amber-500/20 flex items-center justify-center text-amber-500 border border-amber-500/40">
                          <AlertTriangle className="w-8 h-8 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-black text-amber-500 uppercase tracking-[0.3em] italic">{isAr ? 'تشخيص الإقلاع' : 'Deep Forensic Diagnostic'}</h3>
                      </div>
                      <p className="text-sm font-mono text-slate-200 leading-relaxed bg-black/80 p-6 rounded-[1.75rem] border border-white/10 italic shadow-inner relative z-10 font-bold">
                        "{state.forensic?.bootloopDiagnosis || 'Awaiting deep partition scan...'}"
                      </p>
                    </motion.div>

                    <div className="space-y-6 preserve-3d">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">{isAr ? 'تحليل الذاكرة (Hex Intelligence)' : 'Neural Block Analysis'}</span>
                        <div className="flex items-center gap-3 bg-indigo-500/15 px-4 py-1.5 rounded-full border border-indigo-500/30">
                          <Hexagon className="w-5 h-5 text-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Hex_AI v4.2</span>
                        </div>
                      </div>
                      <motion.div 
                        whileHover={{ translateZ: 30 }}
                        className="p-8 rounded-[2.5rem] bg-black/60 border border-white/10 font-mono text-[12px] space-y-4 leading-relaxed shadow-[inset_0_2px_20px_rgba(0,0,0,0.8)] relative overflow-hidden preserve-3d"
                      >
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                          <Terminal className="w-24 h-24" />
                        </div>
                        <div className="text-slate-600 flex items-center gap-4 italic mb-4">
                          <Activity className="w-5 h-5 animate-pulse text-indigo-500" />
                          Scanning physical blocks... 0x{Math.floor(Math.random()*1000).toString(16)}...
                        </div>
                        {state.forensic?.hexAnalysis.corruptedBlocks.map((b, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="text-rose-400 flex items-center gap-4 font-black uppercase tracking-tighter bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20 shadow-[0_10px_20px_rgba(244,63,94,0.1)]"
                          >
                            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,1)] animate-pulse" />
                            CRITICAL CORRUPTION DETECTED AT {b}
                          </motion.div>
                        ))}
                        <div className="h-px w-full bg-white/5 my-5" />
                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em]">
                          <div className="text-emerald-400 italic">SHA-256 Digest: VERIFIED_OK</div>
                          <div className="text-indigo-400">INTEGRITY: 94.2%</div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {state.currentModule === 'EXECUTION' && (
                  <motion.div 
                    key="execution"
                    initial={{ opacity: 0, scale: 0.9, rotateY: -20, z: -100 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0, z: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateY: 20, z: -100 }}
                    className="space-y-8 preserve-3d"
                  >
                    <motion.div 
                      whileHover={{ translateZ: 30 }}
                      className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-transparent to-transparent pointer-events-none" />
                      <div className="flex items-center gap-4 mb-5 relative z-10">
                        <Sparkles className="w-8 h-8 text-indigo-600 shadow-sm" />
                        <span className="text-[11px] text-indigo-600 block uppercase font-black tracking-[0.3em]">{isAr ? 'الروم المطابق ذكياً' : 'Neural Firmware Match Result'}</span>
                      </div>
                      <span className="text-sm font-mono font-black text-slate-900 break-all tracking-tighter relative z-10 bg-slate-50 p-6 rounded-[1.75rem] block border border-slate-200 shadow-inner">{state.execution?.matchedFirmwareBuild || 'Awaiting final checksum match...'}</span>
                    </motion.div>

                    {/* Recommendation Card */}
                    <AnimatePresence>
                      {state.execution?.recommendedAction && !state.isBusy && state.modules.EXECUTION.status === 'COMPLETED' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                          transition={{ type: "spring", damping: 15 }}
                          className="p-8 rounded-[3rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-950 text-white shadow-[0_50px_100px_rgba(79,70,229,0.5)] border-2 border-white/30 relative overflow-hidden preserve-3d"
                        >
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                          <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/20 rounded-full blur-[120px] pointer-events-none" />
                          
                          <div className="relative z-10 space-y-7">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <motion.div 
                                  animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                  className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-2xl flex items-center justify-center border-2 border-white/40 shadow-[0_20px_40px_rgba(255,255,255,0.2)]"
                                >
                                  <Zap className="w-10 h-10 fill-white" />
                                </motion.div>
                                <div>
                                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-100/80">{isAr ? 'الحل الذكي الموصى به' : 'SMART RECOMMENDATION'}</h4>
                                  <h3 className="text-2xl font-black tracking-tight mt-1">{isAr ? state.execution.recommendedAction.labelAr : state.execution.recommendedAction.labelEn}</h3>
                                </div>
                              </div>
                              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                {isAr ? 'حماية البيانات: آمن 100%' : 'DATA PROTECTION: 100% SAFE'}
                              </div>
                            </div>
                            
                            <p className="text-sm font-bold leading-relaxed text-indigo-50 opacity-90 italic">
                              {isAr ? state.execution.recommendedAction.descriptionAr : state.execution.recommendedAction.descriptionEn}
                            </p>

                            <div className="space-y-4">
                              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.4em] ml-2">{isAr ? 'كود التخطي المولد' : 'GENERATED EXPLOIT SCRIPT'}</span>
                              <div className="p-6 rounded-[1.5rem] bg-black/40 border border-white/10 font-mono text-[10px] text-cyan-400 overflow-x-auto whitespace-pre leading-relaxed shadow-inner italic">
                                {state.execution.scriptContent}
                              </div>
                            </div>
                            
                            <motion.button
                              whileHover={{ scale: 1.03, translateY: -4, backgroundColor: "#ffffff", color: "#4338ca", boxShadow: "0 20px 40px rgba(255,255,255,0.3)" }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => onNavigate(state.execution!.recommendedAction!.tabId)}
                              className="w-full py-5 bg-white/95 text-indigo-900 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl border-b-4 border-slate-300"
                            >
                              {isAr ? 'بدء عملية فك قفل الحماية الاحترافية' : 'EXECUTE PROFESSIONAL UNLOCK'}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!state.execution?.recommendedAction && (
                      <div className="space-y-6 preserve-3d">
                        <div className="flex items-center justify-between px-2">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">{isAr ? 'سكربت الإصلاح المولد' : 'Neural Adaptation Script'}</span>
                          <Terminal className="w-6 h-6 text-slate-600" />
                        </div>
                        <motion.div 
                          whileHover={{ translateZ: 20 }}
                          className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 font-mono text-[12px] text-emerald-400 whitespace-pre overflow-x-auto leading-loose shadow-2xl font-bold custom-scrollbar"
                        >
                          {state.execution?.scriptContent || '// Initializing core logic pipelines...'}
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right: Live Console (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col bg-slate-50 border-l border-slate-200 relative z-10">
          <div className="p-6 border-b border-slate-100 bg-white/50 flex items-center justify-between backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <Terminal className="w-6 h-6 text-slate-400" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Telemetry</span>
            </div>
            <div className={`w-4 h-4 rounded-full shadow-sm ${state.isBusy ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
          </div>

          <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] space-y-6 scroll-smooth custom-scrollbar bg-slate-50 preserve-3d">
            {state.logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 italic font-black tracking-[0.3em] uppercase gap-6 opacity-30">
                <Info className="w-12 h-12" />
                <p className="text-center text-[10px]">[System_Idle] Neural Core Awaiting...</p>
              </div>
            ) : (
              state.logs.map((log, i) => (
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  key={i} 
                  className={`flex gap-5 leading-relaxed border-l-4 pl-5 py-2 transition-all rounded-r-2xl ${
                    log.type === 'error' ? 'border-rose-500 bg-rose-50' : 
                    log.type === 'success' ? 'border-emerald-500 bg-emerald-50' : 
                    log.type === 'warn' ? 'border-amber-500 bg-amber-50' : 'border-slate-300 bg-slate-100/50'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] text-slate-400 font-black mb-1.5 opacity-60 uppercase tracking-widest">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className={`font-bold break-words leading-relaxed tracking-tight
                      ${log.type === 'error' ? 'text-rose-600' : 
                        log.type === 'success' ? 'text-emerald-600' : 
                        log.type === 'warn' ? 'text-amber-600' : 'text-slate-600'}
                    `}>
                      {log.message}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          <div className="p-6 border-t border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-black font-mono text-slate-400 uppercase tracking-[0.3em]">
              <span className="flex items-center gap-4">
                <div className={`w-2 h-5 rounded-full ${state.isBusy ? 'bg-indigo-500 shadow-sm' : 'bg-slate-200'}`} />
                STATE: {state.currentModule}
              </span>
              <span className="text-[10px] opacity-30 italic font-medium">ASYNC_V2.6_ULTRA</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};
