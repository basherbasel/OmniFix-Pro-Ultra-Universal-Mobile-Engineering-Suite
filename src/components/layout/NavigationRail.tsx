import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Activity, 
  Cpu, 
  Database, 
  Briefcase,
  Settings,
  Usb,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkstation } from '../../context/WorkstationContext';

export function NavigationRail() {
  const { 
    lang, 
    activeTab, 
    setActiveTab, 
    requestUsbConnection, 
    isBusy, 
    setUsbModalOpen,
    setWindowsInstallerOpen 
  } = useWorkstation();
  const isAr = lang === 'ar';

  const categories = [
    { id: 'dashboard', targetTab: 'dashboard', labelEn: 'Dashboard', labelAr: 'الرئيسية', icon: LayoutDashboard },
    { id: 'cloud-security', targetTab: 'cloud-security', labelEn: 'Cloud Intel', labelAr: 'ذكاء السحابة', icon: Globe },
    { id: 'smart', targetTab: 'smart-1click', labelEn: '1-Click', labelAr: 'نقرة واحدة', icon: Sparkles },
    { id: 'diagnostics', targetTab: 'ai-diagnostics', labelEn: 'AI Logic', labelAr: 'منطق الذكاء', icon: Activity },
    { id: 'advanced', targetTab: 'flasher', labelEn: 'Pro Tools', labelAr: 'أدوات برو', icon: Cpu },
    { id: 'database', targetTab: 'oem-database', labelEn: 'Resources', labelAr: 'المصادر', icon: Database },
    { id: 'business', targetTab: 'management', labelEn: 'Business', labelAr: 'الأعمال', icon: Briefcase },
  ];

  return (
    <aside className="w-16 lg:w-20 bg-slate-900 border-r border-white/5 flex flex-col items-center py-6 gap-6 z-50 shrink-0">
      <div className="flex flex-col gap-4 w-full px-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id || activeTab === cat.targetTab ||
            (cat.id === 'smart' && ['smart-1click', 'apex-agent', 'agent-encyclopedia', 'os-security-lab', 'os-architecture', 'dead-boot', 'frp', 'quantum-bypass', 'security-bypass', 'software-bypass', 'software-lab', 'icloud', 'forensic-decrypt'].includes(activeTab)) ||
            (cat.id === 'diagnostics' && ['ai-diagnostics', 'fault-repair', 'ai-oscilloscope', 'thermal-rosin', 'thermal-lidar', 'ai-thermal-lidar', 'smart-bench', 'bench-controller'].includes(activeTab)) ||
            (cat.id === 'advanced' && ['flasher', 'firmware-slicer', 'partition-slicer', 'network', 'satellite-ntn', 'esim-satellite', 'eeprom-programmer', 'truetone-bms', 'ufs-memory', 'localization', 'safety', 'device-reader', 'pcb-explorer', 'power-lab', 'isp-hub', 'multimeter'].includes(activeTab)) ||
            (cat.id === 'database' && ['oem-database', 'firmware-matching', 'hardware-workbench', 'box-emulation', 'codelab', 'box-core-ai'].includes(activeTab)) ||
            (cat.id === 'business' && ['management', 'forensic-cert', 'qa-certificate'].includes(activeTab)) ||
            (cat.id === 'cloud-security' && ['cloud-security'].includes(activeTab));

          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.targetTab)}
              className="relative group flex flex-col items-center gap-1 py-3 w-full rounded-2xl transition-all"
            >
              {isActive && (
                <motion.div 
                  layoutId="railActive"
                  className="absolute inset-0 bg-indigo-500/10 border-r-2 border-indigo-500 rounded-none"
                />
              )}
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                <Icon size={22} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-tighter transition-all ${isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                {isAr ? cat.labelAr : cat.labelEn}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-4 w-full px-2">
        <button 
          onClick={() => {
            setUsbModalOpen(true);
            requestUsbConnection();
          }}
          disabled={isBusy}
          className={`relative group flex flex-col items-center gap-1 py-3 w-full rounded-2xl transition-all ${isBusy ? 'animate-pulse' : ''}`}
        >
          <div className={`p-2 rounded-xl transition-all ${isBusy ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-white bg-white/5'}`}>
            <Usb size={22} />
          </div>
          <span className="text-[7px] font-black uppercase tracking-tighter text-slate-500">USB CONNECT</span>
          
          <div className={`absolute ${isAr ? 'right-full mr-4' : 'left-full ml-4'} px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[100] shadow-xl border border-white/10`}>
            {isAr ? 'فحص وربط منفذ USB حقيقي' : 'Initiate Real USB Handshake & Selector'}
          </div>
        </button>

        <button 
          onClick={() => setWindowsInstallerOpen(true)}
          className="relative group p-3 text-slate-500 hover:text-white transition-colors flex justify-center"
        >
          <Settings size={20} />
          <div className={`absolute ${isAr ? 'right-full mr-4' : 'left-full ml-4'} px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[100] shadow-xl border border-white/5`}>
            {isAr ? 'تعريفات ويندوز وإعدادات النظام' : 'Windows Drivers & Setup'}
          </div>
        </button>
      </div>
    </aside>
  );
}
