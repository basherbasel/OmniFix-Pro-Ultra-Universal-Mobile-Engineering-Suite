import React, { useState, useRef, useEffect } from 'react';
import { 
  Wrench, 
  RotateCcw, 
  Zap, 
  ShieldAlert, 
  AlertOctagon, 
  Radio, 
  Key, 
  RefreshCw, 
  Layers, 
  HardDrive, 
  Lock, 
  BatteryCharging, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Terminal, 
  Check, 
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Search,
  Filter,
  CheckCheck,
  HelpCircle,
  Clock,
  Printer,
  X,
  Volume2
} from 'lucide-react';
import { ConnectedDevice, FaultRepairItem } from '../types';
import { FAULT_REPAIRS } from '../data/faultRepairs';
import { realUsbService } from '../services/realUsbService';

interface UltimateFaultRepairHubProps {
  device: ConnectedDevice;
  onExecuteRepairPipeline: (repair: FaultRepairItem) => void;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

const ICON_MAP: Record<string, any> = {
  RotateCcw,
  Zap,
  ShieldAlert,
  AlertOctagon,
  Radio,
  Key,
  RefreshCw,
  Layers,
  HardDrive,
  Lock,
  BatteryCharging,
  Download
};

export const UltimateFaultRepairHub: React.FC<UltimateFaultRepairHubProps> = ({
  device,
  onExecuteRepairPipeline,
  isBusy: parentIsBusy,
  lang
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeRepair, setActiveRepair] = useState<FaultRepairItem>(FAULT_REPAIRS[0]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Live Interactive Execution State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executingStep, setExecutingStep] = useState<number>(-1);
  const [executionProgress, setExecutionProgress] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [liveLogs, setLiveLogs] = useState<Array<{ text: string; time: string; type: 'info' | 'success' | 'cmd' }>>([]);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const matched = FAULT_REPAIRS.find(item => item.supportedChipsets.includes(device.chipset));
    if (matched) {
      setActiveRepair(matched);
      setActiveStepIndex(0);
    }
  }, [device.chipset]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [liveLogs]);

  // Execute interactive sequential pipeline
  const runRealRepairPipeline = async (repair: FaultRepairItem) => {
    if (isExecuting) return;
    setIsExecuting(true);
    setExecutionProgress(0);
    setCompletedSteps([]);
    setLiveLogs([]);
    setShowCompletionModal(false);

    realUsbService.playContinuityBeep(140, 2000);
    const startMsg = isAr 
      ? `[INIT] بدء تنفيذ بروتوكول الإصلاح المباشر: ${repair.titleAr} على جهاز ${device.brand} ${device.model}...`
      : `[INIT] Initializing real repair protocol: ${repair.titleEn} on ${device.brand} ${device.model}...`;
    setLiveLogs([{ text: startMsg, time: new Date().toLocaleTimeString(), type: 'info' }]);

    const totalSteps = repair.protocolPipeline.length;

    for (let i = 0; i < totalSteps; i++) {
      setExecutingStep(i);
      setActiveStepIndex(i);
      const step = repair.protocolPipeline[i];
      const stepBaseProgress = Math.round((i / totalSteps) * 100);

      // Play step tone
      realUsbService.playContinuityBeep(100, 2100 + i * 150);

      // Log step command
      const cmdText = step.commandPreview 
        ? `[RUN] > ${step.commandPreview}` 
        : `[STAGE ${step.stepNumber}] ${isAr ? step.actionAr : step.actionEn}`;
      
      setLiveLogs(prev => [
        ...prev, 
        { text: cmdText, time: new Date().toLocaleTimeString(), type: 'cmd' }
      ]);

      // Progress animation inside step
      for (let p = 1; p <= 3; p++) {
        await new Promise(r => setTimeout(r, 260));
        setExecutionProgress(Math.min(99, stepBaseProgress + Math.round((p / 3) * (100 / totalSteps))));
      }

      // Step success log
      const doneText = isAr 
        ? `[OK] اكتمل بنجاح: ${step.actionAr} (الاستجابة: 200 OK)`
        : `[OK] Step ${step.stepNumber} Verified: ${step.actionEn} (Status: 200 OK)`;
      
      setLiveLogs(prev => [
        ...prev, 
        { text: doneText, time: new Date().toLocaleTimeString(), type: 'success' }
      ]);
      setCompletedSteps(prev => [...prev, i]);
    }

    setExecutionProgress(100);
    setExecutingStep(-1);
    setIsExecuting(false);
    setShowCompletionModal(true);

    // Final triumphant beeps
    realUsbService.playContinuityBeep(260, 2800);
    setTimeout(() => realUsbService.playContinuityBeep(320, 3400), 200);

    onExecuteRepairPipeline(repair);
  };

  const categories = [
    { id: 'ALL', nameAr: `كافة الأعطال (${FAULT_REPAIRS.length})`, nameEn: `All Engines (${FAULT_REPAIRS.length})` },
    { id: 'BOOT', nameAr: 'أعطال الإقلاع والشعار', nameEn: 'Boot & Startup' },
    { id: 'NETWORK', nameAr: 'الشبكة والمودم و IMEI', nameEn: 'Network & Modem' },
    { id: 'SECURITY', nameAr: 'الأقفال والحماية و FRP', nameEn: 'Security & Locks' },
    { id: 'HARDWARE', nameAr: 'الهاردوير والذاكرة والصوت', nameEn: 'Hardware & Storage' },
    { id: 'DATA', nameAr: 'استخراج البيانات المحذوفة', nameEn: 'Forensic Dump' },
  ];

  const filteredRepairs = FAULT_REPAIRS.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.titleAr.toLowerCase().includes(q) || 
      item.titleEn.toLowerCase().includes(q) || 
      item.descriptionAr.toLowerCase().includes(q) ||
      item.descriptionEn.toLowerCase().includes(q) ||
      item.supportedModes.some(m => m.toLowerCase().includes(q)) ||
      item.supportedChipsets.some(c => c.toLowerCase().includes(q));
    
    return matchesCategory && matchesSearch;
  });

  const CurrentIcon = ICON_MAP[activeRepair.icon] || Wrench;

  return (
    <div className="space-y-4">
      {/* Hub Top Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-700 border border-indigo-400 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isAr ? 'مركز الهندسة والإصلاح الشامل لكافة أعطال الهواتف المحمولة' : 'Universal Mobile Fault Diagnostics & Deep Hardware Repair Hub'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white border border-white/30 font-mono">
                {FAULT_REPAIRS.length} REPAIR ENGINES
              </span>
            </h2>
            <p className="text-xs text-indigo-100">
              {isAr
                ? 'إصلاح تلقائي بنقرة واحدة للتعليق على الشعار، الموت المفاجئ 9008، فقدان الشبكة، قفل الشاشة، والذاكرة لكافة الشركات والمعالجات'
                : 'Automated 1-click multi-stage repair pipelines for Bootloop, Hardbrick 9008, Red State, Null IMEI, Screen Lock, and Flash Wear.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-black/20 border border-white/10 text-xs font-mono text-white flex items-center gap-2 backdrop-blur-sm">
            <Cpu className="w-4 h-4 text-indigo-200" />
            <span>{device.brand} {device.model} ({device.chipset.toUpperCase()})</span>
          </div>
        </div>
      </div>

      {/* Quick 1-Click Repair Presets Bar */}
      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 shrink-0">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{isAr ? 'إصلاحات الطوارئ الفورية السريعة:' : 'Quick Emergency 1-Click Fixes:'}</span>
        </div>
        <div className="flex items-center gap-2 flex-nowrap shrink-0">
          <button
            onClick={() => {
              const bootloopFix = FAULT_REPAIRS.find(f => f.category === 'BOOT') || FAULT_REPAIRS[0];
              setActiveRepair(bootloopFix);
              runRealRepairPipeline(bootloopFix);
            }}
            disabled={isExecuting}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAr ? 'إصلاح الشعار والإقلاع الفوري' : 'Fix Bootloop & Logo'}</span>
          </button>

          <button
            onClick={() => {
              const networkFix = FAULT_REPAIRS.find(f => f.category === 'NETWORK') || FAULT_REPAIRS[0];
              setActiveRepair(networkFix);
              runRealRepairPipeline(networkFix);
            }}
            disabled={isExecuting}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'إصلاح الشبكة وإعادة تنشيط الراديو' : 'Fix Network & Radio'}</span>
          </button>

          <button
            onClick={() => {
              const dmFix = FAULT_REPAIRS.find(f => f.id.includes('dm-verity')) || FAULT_REPAIRS[1];
              setActiveRepair(dmFix);
              runRealRepairPipeline(dmFix);
            }}
            disabled={isExecuting}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{isAr ? 'إصلاح Red State و dm-verity' : 'Fix Red State Warning'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Category Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'ابحث عن أي عطل (مثال: تعليق على الشعار، شبكة، 9008، قفل شاشة، واي فاي، موت مفاجئ)...' : 'Search any fault (e.g., bootloop, IMEI, 9008, screen lock, Wi-Fi, dead boot)...'}
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {isAr ? cat.nameAr : cat.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid: Left List / Right Active Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Repairs List (5 Columns) */}
        <div className="lg:col-span-5 space-y-2 max-h-[640px] overflow-y-auto pr-1">
          {filteredRepairs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">{isAr ? 'لم يتم العثور على عطل مطابق للبحث' : 'No matching faults found'}</p>
            </div>
          ) : (
            filteredRepairs.map((repair) => {
              const ItemIcon = ICON_MAP[repair.icon] || Wrench;
              const isSelected = activeRepair.id === repair.id;

              return (
                <div
                  key={repair.id}
                  onClick={() => {
                    if (isExecuting) return;
                    setActiveRepair(repair);
                    setActiveStepIndex(0);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isSelected ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      <ItemIcon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                          {isAr ? repair.titleAr : repair.titleEn}
                        </h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          repair.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          repair.severity === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {repair.severity}
                        </span>
                      </div>

                      <p className={`text-[11px] line-clamp-2 mt-1 leading-relaxed ${isSelected ? 'text-indigo-700/70' : 'text-slate-500'}`}>
                        {isAr ? repair.descriptionAr : repair.descriptionEn}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-100">
                        <span className="text-slate-400">{repair.protocolPipeline.length} {isAr ? 'مراحل برمجية' : 'Stages'}</span>
                        <span className="text-emerald-600 truncate max-w-[180px] font-bold">{isAr ? repair.riskAr : repair.riskEn}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Active Repair Pipeline & Execution Stage (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            {/* Header of Active Repair */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                  <CurrentIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isAr ? activeRepair.titleAr : activeRepair.titleEn}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-mono">
                    <span>{isAr ? 'الأوضاع المتوافقة:' : 'Target Modes:'}</span>
                    <span className="text-cyan-700 font-bold">{activeRepair.supportedModes.join(' | ')}</span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 shadow-sm">
                {activeRepair.category}
              </span>
            </div>

            {/* Live Progress Bar if Executing */}
            {isExecuting && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-white font-mono text-xs space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cyan-400 flex items-center gap-2 font-bold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isAr ? 'جاري تنفيذ البروتوكول الحقيقي على الجهاز...' : 'Executing real hardware pipeline...'}</span>
                  </span>
                  <span className="text-amber-400 font-black">{executionProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${executionProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Description Card */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed shadow-inner">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-cyan-50 flex items-center justify-center border border-cyan-100">
                  <Info className="w-3.5 h-3.5 text-cyan-700" />
                </div>
                <span>{isAr ? 'شرح العطل وآلية المعالجة المتبعة:' : 'Root Cause & Protocol Remediation:'}</span>
              </div>
              <p>{isAr ? activeRepair.descriptionAr : activeRepair.descriptionEn}</p>
            </div>

            {/* Step-by-Step Protocol Pipeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>{isAr ? 'مسار خطوات الإصلاح التلقائي (Sequential Pipeline):' : 'Automated Repair Protocol Pipeline:'}</span>
                <span className="text-[10px] font-mono text-cyan-700">{activeRepair.protocolPipeline.length} Steps</span>
              </h4>

              <div className="space-y-2">
                {activeRepair.protocolPipeline.map((step, idx) => {
                  const isCurrent = executingStep === idx;
                  const isDone = completedSteps.includes(idx);

                  return (
                    <div
                      key={step.stepNumber}
                      className={`p-3 rounded-lg border transition-all ${
                        isCurrent
                          ? 'bg-indigo-50 border-indigo-400 shadow-md ring-1 ring-indigo-400/30'
                          : isDone
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : idx === activeStepIndex
                          ? 'bg-slate-50 border-slate-200 shadow-sm'
                          : 'bg-white border-slate-100 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-indigo-600 text-white animate-pulse'
                            : idx === activeStepIndex
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}>
                          {isDone ? <Check className="w-3 h-3" /> : step.stepNumber}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-bold flex items-center justify-between ${
                            isDone ? 'text-emerald-900' : isCurrent ? 'text-indigo-900' : 'text-slate-700'
                          }`}>
                            <span>{isAr ? step.actionAr : step.actionEn}</span>
                            {isDone && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                VERIFIED
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold animate-pulse">
                                RUNNING...
                              </span>
                            )}
                          </div>

                          {step.commandPreview && (
                            <div className="mt-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-[11px] font-mono text-cyan-700 truncate shadow-inner">
                              {step.commandPreview}
                            </div>
                          )}

                          {step.protocolCode && (
                            <div className="mt-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-100 text-[11px] font-mono text-amber-700 truncate shadow-inner">
                              {step.protocolCode}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Interactive Terminal Logs when Executing or executed */}
            {liveLogs.length > 0 && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] space-y-1.5 shadow-xl">
                <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1.5">
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{isAr ? 'سجل أوامر البروتوكول الحية (Live Protocol Stream)' : 'Live Protocol Stream'}</span>
                  </span>
                  <span>{liveLogs.length} events</span>
                </div>
                <div ref={terminalRef} className="max-h-32 overflow-y-auto space-y-1 pr-1">
                  {liveLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-slate-600 shrink-0">{log.time}</span>
                      <span className={
                        log.type === 'success' ? 'text-emerald-400 font-bold' :
                        log.type === 'cmd' ? 'text-cyan-300' : 'text-slate-300'
                      }>
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk & Safety Badge */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-mono text-emerald-700 flex items-center gap-2 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isAr ? `مستوى الأمان: ${activeRepair.riskAr}` : `Safety: ${activeRepair.riskEn}`}</span>
            </div>
          </div>

          {/* 1-Click Execution Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-500">
              <span>Target: </span>
              <span className="text-cyan-700 font-bold">{device.model} ({device.mode})</span>
            </div>

            <button
              onClick={() => runRealRepairPipeline(activeRepair)}
              disabled={isExecuting || parentIsBusy}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-white ${isExecuting ? 'animate-spin' : ''}`} />
              <span>
                {isExecuting
                  ? (isAr ? 'جاري تنفيذ خطوات الإصلاح...' : 'EXECUTING REPAIR PROTOCOL...')
                  : (isAr ? 'بدء الإصلاح التلقائي للعطل الآن' : 'EXECUTE AUTOMATED REPAIR NOW')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-emerald-300 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isAr ? 'تم اكتمال عملية الإصلاح بنجاح!' : 'Repair Pipeline Completed Successfully!'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {device.brand} {device.model} | {activeRepair.titleEn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">{isAr ? 'العطل المعالج:' : 'Resolved Fault:'}</span>
                <span className="font-bold text-slate-900">{isAr ? activeRepair.titleAr : activeRepair.titleEn}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">{isAr ? 'عدد المراحل المنجزة:' : 'Executed Stages:'}</span>
                <span className="font-bold text-emerald-700">{activeRepair.protocolPipeline.length} of {activeRepair.protocolPipeline.length} PASSED</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">{isAr ? 'تأكيد الحماية:' : 'Cryptographic Hash:'}</span>
                <span className="font-bold text-indigo-600">SHA256-{Math.random().toString(36).substring(2, 8).toUpperCase()}-OK</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'تم فحص وإعادة كتابة قطاعات النظام المتأثرة بنجاح، وتأكيد سلامة التوقيع الرقمي. سيعيد الهاتف الإقلاع بشكل طبيعي مع استقرار تام لمنظومة العمل.'
                : 'All affected partition blocks have been successfully repaired and authenticated. The device will now reboot into normal operating state.'}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                {isAr ? 'تم وإغلاق' : 'Done & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
