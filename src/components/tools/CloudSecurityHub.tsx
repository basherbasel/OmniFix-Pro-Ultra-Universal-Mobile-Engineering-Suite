import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  Flame, 
  RefreshCw, 
  Globe, 
  Terminal, 
  Database, 
  Zap,
  Lock,
  Unlock,
  Cpu
} from 'lucide-react';
import { useWorkstation } from '../../context/WorkstationContext';

export const CloudSecurityHub: React.FC = () => {
  const { lang, cloudStatus, lastUpdate, checkCloudUpdates, terminalLogs } = useWorkstation();
  const isAr = lang === 'ar';

  const globalExploits = [
    { id: 1, company: 'Samsung', model: 'S24 Ultra / Z Fold 6', type: 'Knox Bypass', risk: 'Critical', date: '10m ago', status: 'Active' },
    { id: 2, company: 'Xiaomi', model: 'HyperOS v2.0.x', type: 'Bootloader Unlock (Patch)', risk: 'High', date: '45m ago', status: 'Verified' },
    { id: 3, company: 'Apple', model: 'iPhone 16 Series', type: 'Diagnostic Port Access', risk: 'Medium', date: '2h ago', status: 'Testing' },
    { id: 4, company: 'Qualcomm', model: 'Snapdragon 8 Gen 3', type: 'EDL Force Protocol', risk: 'Critical', date: '4h ago', status: 'Active' },
    { id: 5, company: 'Oppo/Vivo', model: 'Dimensity 9300', type: 'Auth Bypass (V5)', risk: 'High', date: '6h ago', status: 'Stable' },
  ];

  return (
    <div className="p-10 space-y-10 bg-slate-950 min-h-screen text-slate-300">
      {/* Header Hub Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <Globe className="w-3.5 h-3.5" />
            {isAr ? 'مركز الأمن السحابي العالمي' : 'GLOBAL CLOUD SECURITY HUB'}
          </motion.div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            {isAr ? 'ذكاء الثغرات اللحظي' : 'Real-time Exploit Intelligence'}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium leading-relaxed">
            {isAr ? 'مزامنة مباشرة مع سحابة OmniFix لجلب أحدث ثغرات الـ 0-Day وملفات التفليش الأمنية عالمياً.' : 'Direct synchronization with OmniFix Cloud for fetching the latest 0-Day exploits and secure firmware patches globally.'}
          </p>
        </div>

        <div className="flex items-center gap-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isAr ? 'حالة المزامنة' : 'SYNC STATUS'}</span>
            <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${cloudStatus === 'syncing' ? 'border-indigo-500 animate-spin' : 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'}`}>
              <RefreshCw className={`w-8 h-8 ${cloudStatus === 'syncing' ? 'text-indigo-400' : 'text-emerald-400'}`} />
            </div>
            <span className="text-[10px] font-black text-white uppercase mt-2">{cloudStatus}</span>
          </div>
          <div className="w-px h-20 bg-white/10" />
          <div className="space-y-2">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isAr ? 'آخر تحديث' : 'LAST SYNC'}</span>
              <span className="text-lg font-mono font-black text-white">{lastUpdate}</span>
            </div>
            <button 
              onClick={checkCloudUpdates}
              disabled={cloudStatus === 'syncing'}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              {isAr ? 'مزامنة يدوية الآن' : 'FORCE MANUAL SYNC'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Intel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Exploit Stream */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest">
               <Flame className="w-4 h-4 text-rose-500" />
               {isAr ? 'تدفق الثغرات النشطة' : 'Live Exploit Feed'}
             </div>
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">REAL-TIME DATA (0.4ms)</span>
          </div>
          
          <div className="space-y-4">
            {globalExploits.map((exploit, idx) => (
              <motion.div 
                key={exploit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group p-6 bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] rounded-[2rem] transition-all flex items-center justify-between gap-6"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${exploit.risk === 'Critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                    {exploit.risk === 'Critical' ? <ShieldAlert className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{exploit.company}</span>
                      <span className="text-white font-black tracking-tight">{exploit.model}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-200">{exploit.type}</h3>
                  </div>
                </div>
                
                <div className="hidden md:flex flex-col items-end gap-2">
                   <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{isAr ? 'الحالة' : 'STATUS'}</span>
                        <span className="text-[11px] font-mono font-bold text-emerald-400">{exploit.status}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{isAr ? 'الزمن' : 'TIMESTAMP'}</span>
                        <span className="text-[11px] font-mono font-bold text-slate-400">{exploit.date}</span>
                      </div>
                   </div>
                   <button className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-slate-400 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest">
                     {isAr ? 'تفاصيل الثغرة' : 'VIEW_TECH_RECAP'}
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global Security Telemetry */}
        <div className="lg:col-span-4 space-y-8">
           <div className="p-8 bg-indigo-600 rounded-[3rem] shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#ffffff22,transparent)]" />
              <Zap className="w-12 h-12 text-white mb-6 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="text-2xl font-black text-white mb-2 leading-none uppercase tracking-tighter">AI Neural Defense</h3>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-6">
                {isAr ? 'يقوم الوكيل الذكي بتحليل كافة الثغرات الجديدة للتأكد من سلامة ملفاتك وحماية الهاتف من الضرر الدائم.' : 'The AI agent analyzes all new exploits to ensure file integrity and prevent permanent device damage.'}
              </p>
              <div className="p-4 bg-black/20 rounded-2xl border border-white/10">
                <span className="text-[9px] font-black text-indigo-200 uppercase tracking-widest">{isAr ? 'التوصية الذكية' : 'AI RECOMMENDATION'}</span>
                <p className="text-xs font-mono font-bold text-white mt-1">SAMSUNG_KNOX_V54_STABLE</p>
              </div>
           </div>

           <div className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-6">
             <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest">
               <Terminal className="w-4 h-4 text-emerald-500" />
               {isAr ? 'سجل السحابة اللحظي' : 'Cloud Console'}
             </div>
             <div className="h-[300px] overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-2 p-4 bg-black/40 rounded-2xl border border-white/5">
                {terminalLogs.slice(-15).map((log, i) => (
                  <div key={i} className="text-slate-400">
                    <span className="text-indigo-500 font-bold">$ </span>
                    {log}
                  </div>
                ))}
                <motion.div animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-4 bg-indigo-500 inline-block ml-1" />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
