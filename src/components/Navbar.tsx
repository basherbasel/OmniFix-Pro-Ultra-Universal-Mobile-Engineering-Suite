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
  Unlock,
  Lock,
  Layers,
  Cable,
  FileCode,
  Printer,
  Binary
} from 'lucide-react';
import { useWorkstation } from '../context/WorkstationContext';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    lang,
  } = useWorkstation();

  const isAr = lang === 'ar';
  const [selectedCategory, setSelectedCategory] = React.useState<string>('smart');
  const activeTabButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const navTabs = [
    // 1. SMART & 1-CLICK SOLUTIONS (الاستوديوهات الذكية والحلول الفورية)
    { id: 'dashboard', category: 'smart', labelEn: 'Central Command', labelAr: 'لوحة التحكم', icon: Home, badge: 'CORE' },
    { id: 'apex-agent', category: 'smart', labelEn: 'ApexAgent AI', labelAr: 'الوكيل الذكي', icon: Cpu, badge: 'PRO' },
    { id: 'agent-encyclopedia', category: 'smart', labelEn: 'Skills Encyclopedia', labelAr: 'موسوعة الوكيل', icon: BookOpen, badge: 'SKILLS' },
    { id: 'smart-1click', category: 'smart', labelEn: 'Smart 1-Click', labelAr: 'الضغط الواحدة', icon: Sparkles, badge: 'AUTO' },
    { id: 'dead-boot', category: 'smart', labelEn: 'Dead Boot Recovery', labelAr: 'إحياء الهواتف', icon: RotateCcw, badge: 'UNBRICK' },
    { id: 'quantum-bypass', category: 'smart', labelEn: 'Quantum Bypass', labelAr: 'التخطي الفائق', icon: Zap, badge: 'ULTRA', aliases: ['icloud'] },
    { id: 'frp', category: 'smart', labelEn: 'FRP Bypass Hub', labelAr: 'تخطي FRP', icon: ShieldAlert, badge: 'FRP', aliases: ['frp-bypass', 'frp-reset'] },
    { id: 'frp-oem-lock', category: 'smart', labelEn: 'FRP & OEM Lock', labelAr: 'قفل FRP و OEM', icon: Lock, badge: 'OEM' },
    { id: 'knox-mdm', category: 'smart', labelEn: 'Knox & MDM Bypass', labelAr: 'تخطي نوكس و MDM', icon: ShieldAlert, badge: 'KNOX', aliases: ['knox-guard', 'payjoy'] },
    { id: 'security-bypass', category: 'smart', labelEn: 'Security Bypass', labelAr: 'تخطي الحمايات', icon: Unlock, badge: 'SECURITY', aliases: ['software-bypass', 'software-lab'] },
    { id: 'bootloop-verity', category: 'smart', labelEn: 'DM-Verity & Bootloop', labelAr: 'إصلاح البوت لوب', icon: RotateCcw, badge: 'BOOTLOOP', aliases: ['anti-rollback', 'arb-fix'] },
    { id: 'forensic-decrypt', category: 'smart', labelEn: 'Forensic & Recovery', labelAr: 'استرداد البيانات', icon: HardDrive, badge: 'FORENSIC' },

    // 2. HARDWARE DIAGNOSTICS & MICRO-SOLDERING (التشخيص والقياسات والمايكروسولدرينغ)
    { id: 'ai-diagnostics', category: 'diagnostics', labelEn: 'AI Diagnostics', labelAr: 'التشخيص الذكي', icon: Sparkles, badge: 'AI LOGIC' },
    { id: 'fault-repair', category: 'diagnostics', labelEn: 'Fault Repair Hub', labelAr: 'مركز الأعطال', icon: Wrench, badge: 'REPAIR' },
    { id: 'hardware-workbench', category: 'diagnostics', labelEn: 'Micro-Soldering', labelAr: 'المايكروسولدرينغ', icon: Cpu, badge: 'SCHEMATICS' },
    { id: 'pcb-explorer', category: 'diagnostics', labelEn: 'PCB Bitmap Explorer', labelAr: 'مسارات البوردة', icon: MapIcon, badge: 'BIT MAP' },
    { id: 'multimeter', category: 'diagnostics', labelEn: 'Precision Multimeter', labelAr: 'الأفوميتر الرقمي', icon: Activity, badge: 'DIODE' },
    { id: 'ai-oscilloscope', category: 'diagnostics', labelEn: 'AI Oscilloscope', labelAr: 'الأوسيلوسكوب', icon: Activity, badge: '60FPS' },
    { id: 'power-lab', category: 'diagnostics', labelEn: 'Power Signature Lab', labelAr: 'محلل استهلاك التيار', icon: Zap, badge: 'POWER' },
    { id: 'thermal-rosin', category: 'diagnostics', labelEn: 'Thermal & Rosin Short', labelAr: 'الكاميرا الحرارية', icon: Flame, badge: 'THERMAL' },
    { id: 'ai-thermal-lidar', category: 'diagnostics', labelEn: 'Thermal LiDAR AI', labelAr: 'حراري ليزر', icon: Radio, badge: 'LIDAR', aliases: ['thermal-lidar'] },
    { id: 'voltage-bridge', category: 'diagnostics', labelEn: 'VoltageBridge V-Rail', labelAr: 'جسر الفولتيات', icon: Zap, badge: 'V-RAIL' },
    { id: 'bench-controller', category: 'diagnostics', labelEn: 'Smart Bench Ctrl', labelAr: 'متحكم الطاولة', icon: Monitor, badge: 'BENCH', aliases: ['smart-bench'] },

    // 3. FLASHING, PROGRAMMING & NETWORK (التفليش والبرمجة وإصلاح السيريال والبارتشنات)
    { id: 'flasher', category: 'advanced', labelEn: 'Multi-ROM Flasher', labelAr: 'تفليش الأنظمة', icon: Zap, badge: 'MULTI-ROM' },
    { id: 'odin', category: 'advanced', labelEn: 'Samsung Odin', labelAr: 'تفليش سامسونج', icon: Smartphone, badge: 'ODIN', aliases: ['samsung-odin'] },
    { id: 'samsung-pit', category: 'advanced', labelEn: 'Samsung PIT Editor', labelAr: 'جدول PIT', icon: HardDrive, badge: 'PIT', aliases: ['pit-editor', 're-partition'] },
    { id: 'qualcomm-firehose', category: 'advanced', labelEn: 'Qualcomm EDL Firehose', labelAr: 'كوالكوم فايرهوز', icon: Cpu, badge: 'EDL', aliases: ['qualcomm-edl', 'firehose', 'edl-programmer'] },
    { id: 'unisoc-spd', category: 'advanced', labelEn: 'Unisoc SPD Programmer', labelAr: 'يونيسوك FDL', icon: Cpu, badge: 'SPD', aliases: ['spreadtrum', 'spd-fdl'] },
    { id: 'huawei-kirin', category: 'advanced', labelEn: 'Huawei Kirin & Harmony', labelAr: 'هواوي كيرين', icon: Cpu, badge: 'KIRIN', aliases: ['kirin', 'huawei', 'huawei-harmony', 'harmonyos'] },
    { id: 'samsung-exynos', category: 'advanced', labelEn: 'Samsung Exynos', labelAr: 'سامسونج إكسينوس', icon: Smartphone, badge: 'EXYNOS', aliases: ['exynos', 'shannon-cp'] },
    { id: 'apple-ramdisk', category: 'advanced', labelEn: 'iPhone Ramdisk', labelAr: 'آيفون رام ديسك', icon: Smartphone, badge: 'RAMDISK', aliases: ['checkm8', 'purple-mode', 'ios-passcode'] },
    { id: 'apple-syscfg', category: 'advanced', labelEn: 'SysCfg Unbind', labelAr: 'برمجة السيس كونفج', icon: Smartphone, badge: 'SYSCFG', aliases: ['syscfg', 'wifi-unbind'] },
    { id: 'apple-baseband', category: 'advanced', labelEn: 'Apple Baseband', labelAr: 'بيسباند آيفون', icon: Radio, badge: 'BASEBAND', aliases: ['modem-panic', 'bb-eeprom'] },
    { id: 'xiaomi-sideload', category: 'advanced', labelEn: 'Xiaomi Sideload', labelAr: 'شاومي سايدلود', icon: Smartphone, badge: 'MI', aliases: ['xiaomi', 'mi-account', 'poco'] },
    { id: 'oppo-ofp', category: 'advanced', labelEn: 'Oppo OFP Extractor', labelAr: 'مفكك أوبو OFP', icon: Layers, badge: 'OFP', aliases: ['realme-ofp', 'ofp-extractor'] },
    { id: 'vivo-auth', category: 'advanced', labelEn: 'Vivo & iQOO Auth', labelAr: 'فيفو وآيكو', icon: Smartphone, badge: 'VIVO', aliases: ['vivo', 'iqoo'] },
    { id: 'lg-laf', category: 'advanced', labelEn: 'LG LAF Flasher', labelAr: 'إل جي LAF', icon: Smartphone, badge: 'LG', aliases: ['kdz'] },
    { id: 'sony-s1', category: 'advanced', labelEn: 'Sony Xperia S1', labelAr: 'سوني S1', icon: Smartphone, badge: 'SONY', aliases: ['xperia', 'sin-flasher'] },
    { id: 'google-pixel', category: 'advanced', labelEn: 'Google Pixel Tensor', labelAr: 'جوجل بكسل', icon: Smartphone, badge: 'PIXEL', aliases: ['pixel', 'tensor', 'titan-m2'] },
    { id: 'msm-deepflash', category: 'advanced', labelEn: 'OnePlus MSM DeepFlash', labelAr: 'ون بلس MSM', icon: Smartphone, badge: 'MSM', aliases: ['deep-testing'] },
    { id: 'transsion-mtk', category: 'advanced', labelEn: 'Infinix & Tecno MTK', labelAr: 'إنفينكس وتكنو', icon: Smartphone, badge: 'MTK', aliases: ['infinix', 'tecno', 'itel'] },
    { id: 'firmware-slicer', category: 'advanced', labelEn: 'Partition Slicer', labelAr: 'تقطيع الفلاشات', icon: HardDrive, badge: 'SUPER.IMG', aliases: ['partition-slicer'] },
    { id: 'payload-dumper', category: 'advanced', labelEn: 'Payload Dumper', labelAr: 'مستخرج الفلاشات', icon: HardDrive, badge: 'PAYLOAD', aliases: ['payload-slicer', 'boot-patcher'] },
    { id: 'fastbootd', category: 'advanced', labelEn: 'FastbootD Logical', labelAr: 'فاست بوت D', icon: Layers, badge: 'FASTBOOTD', aliases: ['fastbootd-logical', 'super-partitions'] },
    { id: 'ufs-memory', category: 'advanced', labelEn: 'UFS & eMMC Programmer', labelAr: 'ذاكرات UFS/eMMC', icon: HardDrive, badge: 'UFS 4.0' },
    { id: 'mtk-pro-tool', category: 'advanced', labelEn: 'MediaTek Pro MTKClient', labelAr: 'ميديا تك MTK برو', icon: Cpu, badge: 'BROM' },
    { id: 'rpmb-health', category: 'advanced', labelEn: 'eMMC/UFS RPMB Health', labelAr: 'صحة الذاكرة RPMB', icon: HardDrive, badge: 'RPMB', aliases: ['emmc-health', 'ufs-health'] },
    { id: 'isp-hub', category: 'advanced', labelEn: 'ISP Test-Point Hub', labelAr: 'نقاط الـ ISP', icon: MapIcon, badge: 'ISP/JTAG' },
    { id: 'network', category: 'advanced', labelEn: 'NVRAM & IMEI Repair', labelAr: 'إصلاح الشبكة والسيريال', icon: Radio, badge: 'NVRAM', aliases: ['network-rf'] },
    { id: 'eeprom-programmer', category: 'advanced', labelEn: 'EEPROM / TrueTone / BMS', labelAr: 'مبرمجة الشاشات والبطاريات', icon: Cpu, badge: 'EEPROM', aliases: ['truetone-bms'] },
    { id: 'esim-satellite', category: 'advanced', labelEn: 'eSIM & Satellite NTN', labelAr: 'أدوات eSIM والفضائي', icon: Radio, badge: 'eSIM', aliases: ['satellite-ntn'] },
    { id: 'localization', category: 'advanced', labelEn: 'Language & CSC Switch', labelAr: 'التعريب وتغيير CSC', icon: Globe, badge: 'CSC' },
    { id: 'device-reader', category: 'advanced', labelEn: 'Multi-Mode Reader', labelAr: 'قارئ الهاتف', icon: Smartphone, badge: 'TELEMETRY', aliases: ['device-manager'] },
    { id: 'safety', category: 'advanced', labelEn: 'Anti-Brick Safety', labelAr: 'الحماية والنسخ الاحتياطي', icon: ShieldAlert, badge: 'BACKUP' },

    // 4. OEM DATABASE & EXPLOIT HUB (المراجع والمخططات وثغرات السحابة)
    { id: 'oem-database', category: 'database', labelEn: 'OEM Master DB 2026', labelAr: 'قاعدة الموديلات', icon: Database, badge: 'OEM 2026' },
    { id: 'cloud-security', category: 'database', labelEn: '0-Day Cloud Hub', labelAr: 'سحابة الثغرات 0-Day', icon: Flame, badge: '0-DAY' },
    { id: 'firmware-matching', category: 'database', labelEn: 'Stock ROM Matching', labelAr: 'الفلاشات المعتمدة', icon: ShieldAlert, badge: 'ROM' },
    { id: 'box-emulation', category: 'database', labelEn: 'Box & Dongle Emulation', labelAr: 'محاكي البوكسات', icon: Wrench, badge: 'EMULATOR' },
    { id: 'box-core-ai', category: 'database', labelEn: 'Box Core AI Workspace', labelAr: 'الذكاء الصناعي للبوكسات', icon: Cpu, badge: 'AI BOX' },
    { id: 'codelab', category: 'database', labelEn: 'Protocol Code Lab', labelAr: 'أكواد البروتوكول', icon: Terminal, badge: 'PROTOCOLS' },
    { id: 'os-architecture', category: 'database', labelEn: 'OS Security TEE/FBE', labelAr: 'معمارية أمان الأنظمة', icon: Monitor, badge: 'TEE/FBE', aliases: ['os-security-lab'] },
    { id: 'unified-core', category: 'database', labelEn: 'Unified C++ Core', labelAr: 'النواة الموحدة C++', icon: Cable, badge: 'C++ CORE', aliases: ['cpp-core', 'winusb-serial'] },
    { id: 'all-chipsets', category: 'database', labelEn: 'All Chipsets Pro', labelAr: 'كافة المعالجات', icon: Cpu, badge: 'ALL CHIPS', aliases: ['chipsets-pro'] },
    { id: 'pure-software-usb', category: 'database', labelEn: 'Pure Software USB', labelAr: 'محاكي USB بدون كابل', icon: Cable, badge: 'USB SOFT', aliases: ['normal-cable', 'dongleless'] },
    { id: 'hex-carver', category: 'database', labelEn: 'Firmware Hex Carver', labelAr: 'محلل الهكس', icon: Binary, badge: 'HEX', aliases: ['hex-inspector'] },
    { id: 'serial-sniffer', category: 'database', labelEn: 'Raw Serial Sniffer', labelAr: 'مراقب السيريال', icon: Cable, badge: 'SNIFFER', aliases: ['com-sniffer'] },
    { id: 'master-prompt', category: 'database', labelEn: 'Master AI Prompt', labelAr: 'البرومبت المعماري', icon: FileCode, badge: 'PROMPT', aliases: ['ai-system-prompt'] },
    { id: 'nexus-ecosystem', category: 'database', labelEn: 'Nexus Ecosystem', labelAr: 'المنظومة الموحدة', icon: Layers, badge: 'NEXUS', aliases: ['ecosystem'] },
    { id: 'universal-platform', category: 'database', labelEn: 'Universal SoC Engine', labelAr: 'المنصة الذكية', icon: Cpu, badge: 'SOC ENGINE', aliases: ['universal-soc', 'soc-engine'] },
    { id: 'next-gen-workspace', category: 'database', labelEn: 'Predictive AI Lab', labelAr: 'التنبؤ الهندسي AI', icon: Sparkles, badge: 'PREDICT', aliases: ['predictive-workspace', 'predictive-platform'] },

    // 5. BUSINESS & FORENSIC CERTIFICATION (إدارة الأعمال والشهادات الجنائية)
    { id: 'management', category: 'business', labelEn: 'Repair CRM & ERP', labelAr: 'إدارة العملاء والورشة', icon: LayoutDashboard, badge: 'ERP' },
    { id: 'forensic-cert', category: 'business', labelEn: 'ISO 27037 Forensic', labelAr: 'الشهادات الجنائية', icon: Briefcase, badge: 'ISO 27037', aliases: ['qa-certificate'] },
    { id: 'repair-ticket', category: 'business', labelEn: 'Ticket & Barcode', labelAr: 'تذكرة الصيانة والباركود', icon: Printer, badge: 'TICKET', aliases: ['ticket-barcode', 'invoice'] }
  ];

  const categories = [
    { id: 'all', labelEn: 'All Tools', labelAr: 'كل الأدوات', icon: Smartphone, color: 'text-slate-400' },
    { id: 'smart', labelEn: '1-Click & Bypass', labelAr: 'نقرة واحدة وتخطي', icon: Sparkles, color: 'text-cyan-400' },
    { id: 'diagnostics', labelEn: 'AI & Diagnostics', labelAr: 'التشخيص الذكي', icon: Activity, color: 'text-emerald-400' },
    { id: 'advanced', labelEn: 'Programming & Network', labelAr: 'البرمجة والشبكات', icon: Cpu, color: 'text-blue-400' },
    { id: 'database', labelEn: 'Schematics & Cloud', labelAr: 'المخططات والقواعد', icon: Database, color: 'text-indigo-400' },
    { id: 'business', labelEn: 'Business & CRM', labelAr: 'إدارة الأعمال', icon: Briefcase, color: 'text-amber-400' },
  ];

  // Match active tab or any of its aliases
  const activeTabObj = React.useMemo(() => {
    return navTabs.find(t => t.id === activeTab) || 
           navTabs.find(t => t.aliases && t.aliases.includes(activeTab));
  }, [activeTab]);

  React.useEffect(() => {
    if (activeTabObj && selectedCategory !== 'all') {
      setSelectedCategory(activeTabObj.category);
    }
  }, [activeTabObj]);

  React.useEffect(() => {
    if (activeTabButtonRef.current && typeof activeTabButtonRef.current.scrollIntoView === 'function') {
      activeTabButtonRef.current.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  }, [activeTab]);

  const filteredTabs = React.useMemo(() => {
    if (selectedCategory === 'all') return navTabs;
    const items = navTabs.filter(tab => tab.category === selectedCategory);
    if (activeTabObj && !items.some(t => t.id === activeTabObj.id)) {
      return [activeTabObj, ...items];
    }
    return items;
  }, [selectedCategory, activeTabObj]);

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
      {/* Category Filter Pills Bar */}
      <div className="px-3 sm:px-6 pt-2 pb-1.5 border-b border-slate-100 bg-slate-50/90 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black rounded-xl whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cat.color}`} />
              <span>{isAr ? cat.labelAr : cat.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="px-3 sm:px-6 relative overflow-hidden border-b border-slate-100">
        <div
          role="tablist"
          aria-label={isAr ? 'أدوات المحطة' : 'Workstation Tools'}
          className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2"
        >
          {/* Clickable Home / Breadcrumb Indicator */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl border shrink-0 shadow-sm transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 hover:bg-indigo-50 border-slate-200 text-slate-700 hover:text-indigo-700'
            }`}
            title={isAr ? 'العودة إلى لوحة التحكم الرئيسية' : 'Return to Central Dashboard'}
          >
            <Home className={`w-3.5 h-3.5 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-500'}`} />
            {activeTab !== 'dashboard' && (
              <>
                <span className="text-[10px] font-black whitespace-nowrap">
                  {isAr ? 'لوحة التحكم' : 'Home'}
                </span>
                <ChevronRight className={`w-3 h-3 text-slate-400 ${isAr ? 'rotate-180' : ''}`} />
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider whitespace-nowrap">
                  {isAr ? (activeTabObj?.labelAr || activeTab) : (activeTabObj?.labelEn || activeTab)}
                </span>
              </>
            )}
          </button>

          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (activeTabObj && activeTabObj.id === tab.id);
            return (
              <button
                type="button"
                role="tab"
                aria-selected={Boolean(isActive)}
                ref={isActive ? activeTabButtonRef : undefined}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-[11px] font-black rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 select-none ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="uppercase tracking-tight">{isAr ? tab.labelAr : tab.labelEn}</span>
                {tab.badge && (
                  <span className={`px-2 py-0.5 text-[8px] font-black rounded-full border ${
                    tab.id === 'cloud-security' || tab.id === 'quantum-bypass'
                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                      : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
