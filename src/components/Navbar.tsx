import React from 'react';
import { 
  Cpu, 
  Usb, 
  ShieldAlert, 
  Activity, 
  Terminal, 
  Globe, 
  RefreshCw,
  Power,
  ChevronDown,
  Sparkles,
  Zap,
  Wrench,
  Smartphone,
  Radio,
  Flame,
  Cloud,
  Monitor,
  Database,
  RotateCcw,
  Search,
  Map as MapIcon,
  HardDrive,
  LayoutDashboard,
  Users,
  Briefcase,
  Home,
  ChevronRight,
  BookOpen,
  Unlock
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { useWorkstation } from '../context/WorkstationContext';
import { DEVICE_PRESETS } from '../data/devicePresets';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    lang,
  } = useWorkstation();

  const isAr = lang === 'ar';
  const [selectedCategory, setSelectedCategory] = React.useState<string>('smart');

  const navTabs = [
    // 1. SMART & 1-CLICK SOLUTIONS (الاستوديوهات الذكية والحلول الفورية)
    { id: 'dashboard', category: 'smart', labelEn: 'Central Command Dashboard', labelAr: 'لوحة التحكم المركزية', icon: Home, badge: 'CORE' },
    { id: 'apex-agent', category: 'smart', labelEn: 'ApexAgent AI Multi-Core', labelAr: 'الوكيل الذكي ApexAgent', icon: Cpu, badge: 'PRO v2.0' },
    { id: 'agent-encyclopedia', category: 'smart', labelEn: 'Agent Skills Encyclopedia', labelAr: 'موسوعة خبرات الوكيل الذكي', icon: BookOpen, badge: 'ENCYCLOPEDIA' },
    { id: 'smart-1click', category: 'smart', labelEn: 'Smart 1-Click Studio', labelAr: 'الاستوديو الذكي للضغط الواحدة', icon: Sparkles, badge: 'AUTO 2026' },
    { id: 'dead-boot', category: 'smart', labelEn: 'Dead Boot Recovery & Unbrick', labelAr: 'إحياء الهواتف الميتة والإنعاش', icon: RotateCcw, badge: 'UNBRICK' },
    { id: 'quantum-bypass', category: 'smart', labelEn: 'Quantum Ultra Bypass', labelAr: 'التخطي السريع والفك الفائق', icon: Zap, badge: 'ULTRA' },
    { id: 'frp', category: 'smart', labelEn: 'FRP & Account Bypass Hub', labelAr: 'تخطي الحسابات و FRP', icon: ShieldAlert, badge: 'FRP 2026' },
    { id: 'security-bypass', category: 'smart', labelEn: 'Security & KG Bypass Lab', labelAr: 'تخطي الحمايات و Knox Guard', icon: Unlock, badge: 'KG 2026' },
    { id: 'forensic-decrypt', category: 'smart', labelEn: 'Forensic & Data Recovery', labelAr: 'الاسترداد الجنائي وفك التشفير', icon: HardDrive, badge: 'FORENSIC' },

    // 2. HARDWARE DIAGNOSTICS & MICRO-SOLDERING (التشخيص والقياسات والمايكروسولدرينغ)
    { id: 'ai-diagnostics', category: 'diagnostics', labelEn: 'AI Diagnostics & Panic Log', labelAr: 'التشخيص الذكي واللوج', icon: Sparkles, badge: 'AI LOGIC' },
    { id: 'fault-repair', category: 'diagnostics', labelEn: 'Universal Fault Repair Hub', labelAr: 'مركز إصلاح كافة الأعطال', icon: Wrench, badge: 'DIAGNOSTIC' },
    { id: 'hardware-workbench', category: 'diagnostics', labelEn: 'Hardware Micro-Soldering', labelAr: 'المخططات والمايكروسولدرينغ', icon: Cpu, badge: 'SCHEMATICS' },
    { id: 'pcb-explorer', category: 'diagnostics', labelEn: 'PCB Bitmap Explorer', labelAr: 'مستعرض مسارات البوردة', icon: MapIcon, badge: 'BIT MAP' },
    { id: 'multimeter', category: 'diagnostics', labelEn: 'Precision Multimeter Studio', labelAr: 'الأفوميتر الرقمي والممانعات', icon: Activity, badge: 'DIODE MODE' },
    { id: 'ai-oscilloscope', category: 'diagnostics', labelEn: 'AI Oscilloscope 60FPS', labelAr: 'راسم الإشارات والأوسيلوسكوب', icon: Activity, badge: '2.5 GSa/s' },
    { id: 'power-lab', category: 'diagnostics', labelEn: 'Power Signature Lab', labelAr: 'محلل استهلاك التيار', icon: Zap, badge: 'POWER ANALYZER' },
    { id: 'thermal-rosin', category: 'diagnostics', labelEn: 'Thermal & Rosin Short Isolation', labelAr: 'الكاميرا الحرارية وفاحص الشورت', icon: Flame, badge: 'DC INJECT' },
    { id: 'ai-thermal-lidar', category: 'diagnostics', labelEn: 'AI Thermal LiDAR Studio', labelAr: 'الكاميرا الحرارية بالليزر والـ AI', icon: Radio, badge: 'LIDAR' },
    { id: 'voltage-bridge', category: 'diagnostics', labelEn: 'VoltageBridge V-Rail Inspector', labelAr: 'جسر الفولتيات VoltageBridge', icon: Zap, badge: 'V-RAIL' },
    { id: 'bench-controller', category: 'diagnostics', labelEn: 'Smart Bench Controller', labelAr: 'متحكم طاولة الصيانة الذكي', icon: Monitor, badge: 'BENCH' },

    // 3. FLASHING, PROGRAMMING & NETWORK (التفليش والبرمجة وإصلاح السيريال والبارتشنات)
    { id: 'flasher', category: 'advanced', labelEn: 'Multi-ROM Flasher Studio', labelAr: 'تفليش الأنظمة والرومات', icon: Zap, badge: 'MULTI-ROM' },
    { id: 'firmware-slicer', category: 'advanced', labelEn: 'Firmware Partition Slicer', labelAr: 'تقطيع وترقيع الفلاشات', icon: HardDrive, badge: 'SUPER.IMG' },
    { id: 'ufs-memory', category: 'advanced', labelEn: 'UFS & eMMC Programmer', labelAr: 'برمجية ذاكرات UFS/eMMC', icon: HardDrive, badge: 'UFS 4.0' },
    { id: 'isp-hub', category: 'advanced', labelEn: 'ISP & Test-Point Pinout Hub', labelAr: 'نقاط الـ ISP والبرمجة', icon: MapIcon, badge: 'ISP/JTAG' },
    { id: 'network', category: 'advanced', labelEn: 'NVRAM & IMEI Repair Studio', labelAr: 'إصلاح الشبكة والسيريال', icon: Radio, badge: 'NVRAM/EFS' },
    { id: 'eeprom-programmer', category: 'advanced', labelEn: 'EEPROM / TrueTone / BMS', labelAr: 'مبرمجة الشاشات والبطاريات EEPROM', icon: Cpu, badge: 'BMS/TRUETONE' },
    { id: 'esim-satellite', category: 'advanced', labelEn: 'eSIM & Satellite NTN Studio', labelAr: 'أدوات eSIM والاتصالات الفضائية', icon: Radio, badge: 'NTN 5G' },
    { id: 'localization', category: 'advanced', labelEn: 'Language & CSC Switch', labelAr: 'التعريب وتغيير CSC', icon: Globe, badge: 'CSC' },
    { id: 'device-reader', category: 'advanced', labelEn: 'Multi-Mode Telemetry Reader', labelAr: 'قارئ الهاتف بكافة الأوضاع', icon: Smartphone, badge: 'TELEMETRY' },
    { id: 'safety', category: 'advanced', labelEn: 'Anti-Brick Safety & Backup', labelAr: 'الحماية والنسخ الاحتياطي', icon: ShieldAlert, badge: 'BACKUP' },

    // 4. OEM DATABASE & EXPLOIT HUB (المراجع والمخططات وثغرات السحابة)
    { id: 'oem-database', category: 'database', labelEn: '2018-2026 OEM Master DB', labelAr: 'قاعدة الموديلات الشاملة JSON', icon: Database, badge: 'OEM 2026' },
    { id: 'cloud-security', category: 'database', labelEn: '0-Day Cloud & Exploit Hub', labelAr: 'سحابة الثغرات والتحديثات 0-Day', icon: Flame, badge: 'CLOUD 0-DAY' },
    { id: 'firmware-matching', category: 'database', labelEn: 'Verified Stock ROM Matching', labelAr: 'الفلاشات الرسمية المعتمدة', icon: ShieldAlert, badge: 'SHA-256' },
    { id: 'box-emulation', category: 'database', labelEn: 'Native Box & Dongle Tools', labelAr: 'أدوات البوكسات والدونجلات المباشرة', icon: Wrench, badge: 'BOX EMULATOR' },
    { id: 'codelab', category: 'database', labelEn: 'Native Protocol Code Lab', labelAr: 'أكواد ومكتبات البروتوكول', icon: Terminal, badge: 'PROTOCOLS' },
    { id: 'os-architecture', category: 'database', labelEn: 'OS Security Architecture Lab', labelAr: 'معمارية أمان الأنظمة TEE/FBE', icon: Monitor, badge: 'TEE/FBE' },

    // 5. BUSINESS & FORENSIC CERTIFICATION (إدارة الأعمال والشهادات الجنائية)
    { id: 'management', category: 'business', labelEn: 'Repair CRM & ERP Analytics', labelAr: 'إدارة العملاء والإحصائيات', icon: LayoutDashboard, badge: 'ERP 2026' },
    { id: 'forensic-cert', category: 'business', labelEn: 'ISO/IEC 27037 Forensic Studio', labelAr: 'الشهادات الجنائية الرقمية', icon: Briefcase, badge: 'ISO 27037' }
  ];

  const [categories, setCategories] = React.useState([
    { id: 'all', labelEn: 'All Tools', labelAr: 'كل الأدوات', icon: Smartphone, color: 'text-slate-400' },
    { id: 'smart', labelEn: '1-Click & Bypass', labelAr: 'نقرة واحدة وتخطي', icon: Sparkles, color: 'text-cyan-400' },
    { id: 'diagnostics', labelEn: 'AI & Diagnostics', labelAr: 'التشخيص الذكي', icon: Activity, color: 'text-emerald-400' },
    { id: 'advanced', labelEn: 'Programming & Network', labelAr: 'البرمجة والشبكات', icon: Cpu, color: 'text-blue-400' },
    { id: 'database', labelEn: 'Schematics & Cloud', labelAr: 'المخططات وقواعد البيانات', icon: Database, color: 'text-indigo-400' },
    { id: 'business', labelEn: 'Business & CRM', labelAr: 'إدارة الأعمال والعملاء', icon: Briefcase, color: 'text-amber-400' },
  ]);

  const filteredTabs = selectedCategory === 'all' 
    ? navTabs 
    : navTabs.filter(tab => tab.category === selectedCategory);

  const [activeTabsOrder, setActiveTabsOrder] = React.useState<string[]>([]);

  React.useEffect(() => {
    setActiveTabsOrder(filteredTabs.map(t => t.id));
  }, [selectedCategory]);

  React.useEffect(() => {
    const activeTabObj = navTabs.find(t => t.id === activeTab);
    if (activeTabObj) {
      setSelectedCategory(activeTabObj.category);
    }
  }, [activeTab]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId !== 'all') {
      const firstTabOfCategory = navTabs.find(tab => tab.category === categoryId);
      if (firstTabOfCategory) {
        setActiveTab(firstTabOfCategory.id);
      }
    }
  };

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Navigation Tabs Bar */}
      <div className="px-6 relative overflow-hidden border-b border-slate-100">
        <Reorder.Group 
          axis="x" 
          values={activeTabsOrder} 
          onReorder={setActiveTabsOrder}
          className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2 cursor-grab active:cursor-grabbing"
        >
          {/* Breadcrumb Indicator (Static) */}
          <div className="hidden lg:flex items-center gap-3 mr-8 py-2 px-5 bg-slate-50 border border-slate-200/60 rounded-2xl shrink-0 shadow-sm select-none">
            <Home className={`w-3.5 h-3.5 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`} />
            {activeTab !== 'dashboard' && (
              <>
                <ChevronRight className={`w-3 h-3 text-slate-300 ${isAr ? 'rotate-180' : ''}`} />
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] whitespace-nowrap">
                  {categories.find(c => c.id === selectedCategory)?.labelEn || 'ALL'}
                </span>
              </>
            )}
          </div>

          {activeTabsOrder.map((tabId) => {
            const tab = navTabs.find(t => t.id === tabId);
            if (!tab) return null;
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Reorder.Item
                key={tab.id}
                value={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-black rounded-xl whitespace-nowrap transition-all cursor-pointer relative group select-none ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-inner'
                    : 'text-slate-400 hover:text-slate-600 border border-transparent'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-indigo-500/5 blur-lg rounded-xl"
                  />
                )}
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="relative z-10 uppercase tracking-tighter">{isAr ? tab.labelAr : tab.labelEn}</span>
                {tab.badge && (
                  <span className={`px-2 py-0.5 text-[8px] font-black rounded-full border relative z-10 ${
                    tab.id === 'cloud-security' || tab.id === 'quantum-bypass'
                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                      : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>
    </div>
  );
};
