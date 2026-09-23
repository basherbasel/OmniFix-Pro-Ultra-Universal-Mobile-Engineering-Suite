import React, { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { ConnectedDevice, FaultRepairItem } from '../types';
import { FAULT_REPAIRS } from '../data/faultRepairs';

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
  isBusy,
  lang
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeRepair, setActiveRepair] = useState<FaultRepairItem>(FAULT_REPAIRS[0]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  React.useEffect(() => {
    const matched = FAULT_REPAIRS.find(item => item.supportedChipsets.includes(device.chipset));
    if (matched) {
      setActiveRepair(matched);
      setActiveStepIndex(0);
    }
  }, [device.chipset]);

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
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
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
                {activeRepair.protocolPipeline.map((step, idx) => (
                  <div
                    key={step.stepNumber}
                    className={`p-3 rounded-lg border transition-all ${
                      idx === activeStepIndex
                        ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                        : 'bg-white border-slate-100 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        idx === activeStepIndex ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {step.stepNumber}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold ${idx === activeStepIndex ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {isAr ? step.actionAr : step.actionEn}
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
                ))}
              </div>
            </div>

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
              onClick={() => onExecuteRepairPipeline(activeRepair)}
              disabled={isBusy}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>
                {isBusy
                  ? (isAr ? 'جاري تنفيذ خطوات الإصلاح...' : 'EXECUTING REPAIR PROTOCOL...')
                  : (isAr ? 'بدء الإصلاح التلقائي للعطل الآن' : 'EXECUTE AUTOMATED REPAIR NOW')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
