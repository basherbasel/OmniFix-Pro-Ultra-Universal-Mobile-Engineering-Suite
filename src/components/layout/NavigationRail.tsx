import React from 'react';
import { 
  LayoutDashboard, 
  Lock,
  Layers,
  Cable,
  FileCode,
  Sparkles, 
  Activity, 
  Cpu, 
  Database, 
  Briefcase,
  Settings,
  Usb,
  Globe,
  BrainCircuit,
  RotateCcw,
  ShieldAlert,
  Printer,
  HardDrive,
  Scissors,
  Smartphone,
  Binary,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    { id: 'frp-oem-lock', targetTab: 'frp-oem-lock', labelEn: 'FRP & OEM Lock', labelAr: 'فك FRP و OEM', icon: Lock },
    { id: 'qualcomm-firehose', targetTab: 'qualcomm-firehose', labelEn: 'Qualcomm EDL', labelAr: 'كوالكوم فايرهوز', icon: Cpu },
    { id: 'unisoc-spd', targetTab: 'unisoc-spd', labelEn: 'Unisoc SPD', labelAr: 'يونيسوك FDL', icon: Cpu },
    { id: 'bootloop-verity', targetTab: 'bootloop-verity', labelEn: 'DM-Verity Fix', labelAr: 'إصلاح البوت لوب', icon: RotateCcw },
    { id: 'knox-mdm', targetTab: 'knox-mdm', labelEn: 'Knox & MDM', labelAr: 'نوكس و MDM', icon: ShieldAlert },
    { id: 'samsung-pit', targetTab: 'samsung-pit', labelEn: 'Samsung PIT', labelAr: 'جدول PIT', icon: HardDrive },
    { id: 'payload-dumper', targetTab: 'payload-dumper', labelEn: 'Payload Slicer', labelAr: 'مستخرج الفلاشات', icon: Scissors },
    { id: 'fastbootd', targetTab: 'fastbootd', labelEn: 'FastbootD', labelAr: 'فاست بوت D', icon: Layers },
    { id: 'xiaomi-sideload', targetTab: 'xiaomi-sideload', labelEn: 'Xiaomi Sideload', labelAr: 'شاومي سايدلود', icon: Smartphone },
    { id: 'huawei-kirin', targetTab: 'huawei-kirin', labelEn: 'Huawei Kirin', labelAr: 'هواوي كيرين', icon: Cpu },
    { id: 'apple-ramdisk', targetTab: 'apple-ramdisk', labelEn: 'iPhone Ramdisk', labelAr: 'آيفون رام ديسك', icon: Smartphone },
    { id: 'google-pixel', targetTab: 'google-pixel', labelEn: 'Google Pixel', labelAr: 'جوجل بكسل', icon: Smartphone },
    { id: 'oppo-ofp', targetTab: 'oppo-ofp', labelEn: 'Oppo OFP', labelAr: 'مفكك أوبو OFP', icon: Layers },
    { id: 'lg-laf', targetTab: 'lg-laf', labelEn: 'LG LAF Flasher', labelAr: 'إل جي LAF', icon: Smartphone },
    { id: 'apple-syscfg', targetTab: 'apple-syscfg', labelEn: 'SysCfg Unbind', labelAr: 'برمجة السيس كونفج', icon: Smartphone },
    { id: 'sony-s1', targetTab: 'sony-s1', labelEn: 'Sony Xperia S1', labelAr: 'سوني إكسبيريا S1', icon: Smartphone },
    { id: 'vivo-auth', targetTab: 'vivo-auth', labelEn: 'Vivo & iQOO', labelAr: 'فيفو وآيكو', icon: Smartphone },
    { id: 'msm-deepflash', targetTab: 'msm-deepflash', labelEn: 'OnePlus MSM', labelAr: 'ون بلس وريلمي MSM', icon: Smartphone },
    { id: 'rpmb-health', targetTab: 'rpmb-health', labelEn: 'eMMC/UFS RPMB', labelAr: 'صحة الذاكرة وRPMB', icon: HardDrive },
    { id: 'transsion-mtk', targetTab: 'transsion-mtk', labelEn: 'Infinix/Tecno', labelAr: 'إنفينكس وتكنو', icon: Smartphone },
    { id: 'apple-baseband', targetTab: 'apple-baseband', labelEn: 'Apple Baseband', labelAr: 'بيسباند آيفون', icon: Radio },
    { id: 'samsung-exynos', targetTab: 'samsung-exynos', labelEn: 'Samsung Exynos', labelAr: 'سامسونج إكسينوس', icon: Smartphone },
    { id: 'huawei-harmony', targetTab: 'huawei-harmony', labelEn: 'HarmonyOS', labelAr: 'هارموني OS', icon: Smartphone },
    { id: 'hex-carver', targetTab: 'hex-carver', labelEn: 'Hex Carver', labelAr: 'محلل الهكس', icon: Binary },
    { id: 'serial-sniffer', targetTab: 'serial-sniffer', labelEn: 'Serial Sniffer', labelAr: 'مراقب السيريال', icon: Cable },
    { id: 'repair-ticket', targetTab: 'repair-ticket', labelEn: 'Ticket & Barcode', labelAr: 'تذكرة وباركود', icon: Printer },
    { id: 'unified-core', targetTab: 'unified-core', labelEn: 'Unified Core', labelAr: 'النواة الموحدة C++', icon: Cable },
    { id: 'master-prompt', targetTab: 'master-prompt', labelEn: 'AI Prompt', labelAr: 'البرومبت المعماري', icon: FileCode },
    { id: 'all-chipsets', targetTab: 'all-chipsets', labelEn: 'All Chipsets', labelAr: 'كافة المعالجات', icon: Cpu },
    { id: 'normal-cable', targetTab: 'pure-software-usb', labelEn: 'Normal Cable', labelAr: 'كابل عادي', icon: Cable },
    { id: 'ecosystem', targetTab: 'nexus-ecosystem', labelEn: 'Ecosystem', labelAr: 'المنظومة الموحدة', icon: Layers },
    { id: 'universal', targetTab: 'universal-platform', labelEn: 'Next-Gen AI', labelAr: 'المنصة الذكية', icon: BrainCircuit },
    { id: 'cloud-security', targetTab: 'cloud-security', labelEn: 'Cloud Intel', labelAr: 'ذكاء السحابة', icon: Globe },
    { id: 'smart', targetTab: 'smart-1click', labelEn: '1-Click', labelAr: 'نقرة واحدة', icon: Sparkles },
    { id: 'diagnostics', targetTab: 'ai-diagnostics', labelEn: 'AI Logic', labelAr: 'منطق الذكاء', icon: Activity },
    { id: 'advanced', targetTab: 'flasher', labelEn: 'Pro Tools', labelAr: 'أدوات برو', icon: Cpu },
    { id: 'database', targetTab: 'oem-database', labelEn: 'Resources', labelAr: 'المصادر', icon: Database },
    { id: 'business', targetTab: 'management', labelEn: 'Business', labelAr: 'الأعمال', icon: Briefcase },
  ];

  return (
    <aside className="hidden md:flex w-16 lg:w-20 bg-slate-900 border-e border-white/5 flex-col items-center py-4 z-50 shrink-0 h-full overflow-hidden">
      <div className="flex-1 flex flex-col gap-1.5 w-full px-1.5 overflow-y-auto custom-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id || activeTab === cat.targetTab ||
            (cat.id === 'universal' && ['universal-platform', 'next-gen-workspace', 'predictive-workspace'].includes(activeTab)) ||
            (cat.id === 'smart' && ['smart-1click', 'apex-agent', 'agent-encyclopedia', 'os-security-lab', 'os-architecture', 'dead-boot', 'frp', 'quantum-bypass', 'security-bypass', 'software-bypass', 'software-lab', 'icloud', 'forensic-decrypt'].includes(activeTab)) ||
            (cat.id === 'diagnostics' && ['ai-diagnostics', 'fault-repair', 'ai-oscilloscope', 'thermal-rosin', 'thermal-lidar', 'ai-thermal-lidar', 'smart-bench', 'bench-controller'].includes(activeTab)) ||
            (cat.id === 'advanced' && ['flasher', 'odin', 'samsung-odin', 'firmware-slicer', 'partition-slicer', 'network', 'satellite-ntn', 'esim-satellite', 'eeprom-programmer', 'truetone-bms', 'ufs-memory', 'localization', 'safety', 'device-reader', 'pcb-explorer', 'power-lab', 'isp-hub', 'multimeter'].includes(activeTab)) ||
            (cat.id === 'database' && ['oem-database', 'firmware-matching', 'hardware-workbench', 'box-emulation', 'codelab', 'box-core-ai'].includes(activeTab)) ||
            (cat.id === 'business' && ['management', 'forensic-cert', 'qa-certificate'].includes(activeTab)) ||
            (cat.id === 'cloud-security' && ['cloud-security'].includes(activeTab));

          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.targetTab)}
              className="relative group flex flex-col items-center gap-1 py-3 w-full rounded-2xl transition-all cursor-pointer"
            >
              {isActive && (
                <motion.div 
                  layoutId="railActive"
                  className="absolute inset-0 bg-indigo-500/10 border-e-2 border-indigo-500 rounded-none"
                />
              )}
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                <Icon size={22} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-tighter transition-all text-center px-0.5 leading-tight ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {isAr ? cat.labelAr : cat.labelEn}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-3 w-full px-2">
        <button 
          onClick={() => {
            setUsbModalOpen(true);
            requestUsbConnection();
          }}
          disabled={isBusy}
          className="relative group flex flex-col items-center gap-1 py-2.5 w-full rounded-2xl transition-all cursor-pointer"
        >
          <div className={`p-2 rounded-xl transition-all ${isBusy ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white bg-white/5'}`}>
            <Usb size={20} />
          </div>
          <span className="text-[7px] font-black uppercase tracking-tighter text-slate-400">USB</span>
          
          <div className={`absolute ${isAr ? 'right-full mr-3' : 'left-full ml-3'} px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[100] shadow-xl border border-white/10`}>
            {isAr ? 'فحص وربط منفذ USB حقيقي' : 'Initiate Real USB Handshake & Selector'}
          </div>
        </button>

        <button 
          onClick={() => setWindowsInstallerOpen(true)}
          className="relative group p-2.5 text-slate-400 hover:text-white transition-colors flex justify-center cursor-pointer"
        >
          <Settings size={19} />
          <div className={`absolute ${isAr ? 'right-full mr-3' : 'left-full ml-3'} px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[100] shadow-xl border border-white/5`}>
            {isAr ? 'تعريفات ويندوز وإعدادات النظام' : 'Windows Drivers & Setup'}
          </div>
        </button>
      </div>
    </aside>
  );
}
