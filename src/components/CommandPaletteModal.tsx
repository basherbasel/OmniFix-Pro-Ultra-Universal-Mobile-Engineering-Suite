import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Cpu, 
  ShieldAlert, 
  Zap, 
  Wrench, 
  Database, 
  Terminal, 
  Globe, 
  Activity, 
  Smartphone, 
  RotateCcw,
  Flame,
  ArrowRight,
  HardDrive,
  LayoutDashboard,
  Layers,
  ShieldCheck,
  Scissors,
  Award,
  Satellite,
  Radio,
  Gauge,
  Tv,
  X
} from 'lucide-react';
import { useWorkstation } from '../context/WorkstationContext';
import { ConnectedDevice } from '../types';
import { DEVICE_PRESETS } from '../data/devicePresets';

export const CommandPaletteModal: React.FC = () => {
  const {
    lang,
    setActiveTab: onSelectTab,
    setCurrentDevice: onSelectDevice,
    isCommandPaletteOpen: isOpen,
    setCommandPaletteOpen,
    setUsbModalOpen,
    setWindowsInstallerOpen
  } = useWorkstation();

  const onClose = () => setCommandPaletteOpen(false);
  const onOpenUsbModal = () => setUsbModalOpen(true);
  const onOpenWindowsInstaller = () => setWindowsInstallerOpen(true);

  const isAr = lang === 'ar';
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    {
      id: 'dashboard',
      titleAr: 'لوحة التحكم المركزية (Central Command Dashboard)',
      titleEn: 'Central Command Dashboard',
      subtitleAr: 'الوصول السريع لكافة الأدوات والمهام الرئيسية',
      subtitleEn: 'Quick access to all core tools and tasks',
      icon: LayoutDashboard,
      color: 'text-indigo-600',
      tabId: 'dashboard'
    },
    {
      id: 'os-security-lab',
      titleAr: 'مختبر بنية نظم التشغيل والحمايات وطرق إصلاحها (OS & Security Architecture Lab)',
      titleEn: 'OS Architecture, Security Engines & Protection Repair Lab',
      subtitleAr: 'تشريح كامل لـ BootROM, AVB 2.0, dm-verity, ARB, Knox, eFuses وطرق التخطي والإنعاش',
      subtitleEn: 'Deep dive into BootROM, TrustZone, AVB 2.0, dm-verity, ARB & recovery pipelines',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      tabId: 'os-security-lab'
    },
    {
      id: 'firmware-slicer',
      titleAr: 'استوديو تقطيع الفلاشات واستخراج البارتشنات الفوري (Firmware Slicer & Kernel Lab)',
      titleEn: 'Universal Firmware Partition Slicer & Kernel Patcher',
      subtitleAr: 'استخراج boot.img, init_boot, vbmeta فورياً من فلاشات 10GB بدون تحميل كامل مع ترقيع Magisk/KernelSU',
      subtitleEn: 'Carve target partitions in seconds without full 10GB downloads + Magisk & AVB patching',
      icon: Scissors,
      color: 'text-cyan-400',
      tabId: 'firmware-slicer'
    },
    {
      id: 'security-bypass',
      titleAr: 'استوديو السوفت وير المتقدم وتخطي الحمايات والتوثيق (Security & KG Bypass Lab)',
      titleEn: 'Advanced Software Flasher & Security Bypass Studio (2026)',
      subtitleAr: 'تخطي Knox Guard / MDM، توثيق كوالكوم VIP Sahara، معالجات Dimensity BROM DMA، ورام ديسك آبل iOS 18',
      subtitleEn: 'Knox Guard / MDM shadow unlock, Qualcomm Sahara VIP auth bypass, MediaTek Dimensity BROM DMA, Apple iOS Ramdisk',
      icon: Zap,
      color: 'text-cyan-400',
      tabId: 'security-bypass'
    },
    {
      id: 'smart-bench',
      titleAr: 'طاولة الصيانة الذكية وتحليل منحنى إقلاع الباور (Smart Hardware Bench & Boot Curve)',
      titleEn: 'Smart Hardware Bench & Boot Curve Diagnostic Station',
      subtitleAr: 'تحكم متزامن مع كاوية JBC/Aixun الذكية، الهوت إير، راسم نبضات الباور سبلاي، وحوض الألتراسونيك',
      subtitleEn: 'IoT sync with precision soldering irons, hot-air station, 12-second live boot waveform analyzer & chemical bath',
      icon: Gauge,
      color: 'text-amber-400',
      tabId: 'smart-bench'
    },
    {
      id: 'eeprom-programmer',
      titleAr: 'استوديو برمجة TrueTone والبطارية BMS وبصمة الوجه (TrueTone & Battery BMS Studio)',
      titleEn: 'TrueTone, Battery BMS & Face ID Cryptokey Programmer',
      subtitleAr: 'استعادة التروتون، تصفير دورات البطارية (100% Health)، تخطي رسالة القطعة غير الأصلية، وترميم Face ID',
      subtitleEn: 'EEPROM data transfer for TrueTone, 100% Battery BMS health reset, non-genuine part warning bypass & Dot Projector restore',
      icon: Tv,
      color: 'text-violet-400',
      tabId: 'eeprom-programmer'
    },
    {
      id: 'thermal-lidar',
      titleAr: 'استوديو التصوير الحراري بالليزر وتحديد الشورت (AI Thermal LiDAR Studio)',
      titleEn: 'AI Thermal LiDAR & Micro-Short Triangulation Studio',
      subtitleAr: 'فحص مصفوفة الأشعة تحت الحمراء وعزل التسريب الميكروي وحقن الفولتية الآمنة VCC_MAIN',
      subtitleEn: 'High-precision IR thermal matrix, micro-leakage triangulation (<0.02mA) & calibrated DC injection',
      icon: Flame,
      color: 'text-red-400',
      tabId: 'thermal-lidar'
    },
    {
      id: 'satellite-ntn',
      titleAr: 'استوديو الاتصال الفضائي SOS وبرمجة شرائح eSIM ومودم 5G (eSIM & Satellite SOS Studio)',
      titleEn: 'eSIM & 3GPP Satellite SOS / 5G-Advanced Studio',
      subtitleAr: 'إدارة شرائح eUICC، معالجة انزياح دوبلر الفضائي، ومعايرة QCN/NVRAM',
      subtitleEn: 'GSMA SGP.22 eUICC LPA manager, 3GPP Rel-17 NTN satellite modem calibration & QCN rebuild',
      icon: Satellite,
      color: 'text-cyan-400',
      tabId: 'satellite-ntn'
    },
    {
      id: 'forensic-cert',
      titleAr: 'استوديو الفحص الجنائي وشهادات الجودة المعتمدة (Forensic QA Certificate Studio)',
      titleEn: 'Forensic Inspection & Lab QA Certificate Studio',
      subtitleAr: 'فحص معايير الجودة الـ 14 وطباعة وتصدير شهادات مخبرية معتمدة برمز QR وتوقيع رسمي',
      subtitleEn: '14-point pre/post repair inspection checklist & printable lab certificates with QR tracking',
      icon: Award,
      color: 'text-amber-400',
      tabId: 'forensic-cert'
    },
    {
      id: 'smart-1click',
      titleAr: 'الاستوديو الذكي ضغطة واحدة (Smart 1-Click Studio)',
      titleEn: 'Smart 1-Click Studio',
      subtitleAr: 'إصلاح وتفكيك وفك حسابات تلقائي بضغط زر',
      subtitleEn: 'Auto FRP, Unbrick, Repair in 1-Click',
      icon: Sparkles,
      color: 'text-amber-400',
      tabId: 'smart-1click'
    },
    {
      id: 'dead-boot',
      titleAr: 'إحياء الهواتف الميتة (Dead Boot & Emergency Unbrick)',
      titleEn: 'Dead Boot & Emergency Unbrick',
      subtitleAr: 'استعادة BROM, EDL 9008, و FDL1 الميتة',
      subtitleEn: 'Restore BROM, EDL 9008 & FDL1 dead devices',
      icon: RotateCcw,
      color: 'text-rose-400',
      tabId: 'dead-boot'
    },
    {
      id: 'quantum-bypass',
      titleAr: 'التخطي السريع Quantum Ultra Bypass',
      titleEn: 'Quantum Ultra Bypass',
      subtitleAr: 'فك FRP وسيريال وسحابة بسرعة 0.4 ثانية',
      subtitleEn: 'Ultra-fast 0.4ms FRP & Account bypass',
      icon: Zap,
      color: 'text-cyan-400',
      tabId: 'quantum-bypass'
    },
    {
      id: 'ai-oscilloscope',
      titleAr: 'راسم الإشارات والأوسيلوسكوب (AI Oscilloscope & Signal Logic)',
      titleEn: 'AI Oscilloscope & Signal Logic Analyzer',
      subtitleAr: 'فحص ترددات I2C, MIPI, PWM بالساعة والجراف التفاعلي 60FPS',
      subtitleEn: 'Live 60FPS oscilloscope for I2C, MIPI, PWM & clock rails',
      icon: Activity,
      color: 'text-purple-400',
      tabId: 'ai-oscilloscope'
    },
    {
      id: 'thermal-rosin',
      titleAr: 'الكاميرا الحرارية وفاحص الشورت بالراتنج (Thermal & Rosin)',
      titleEn: 'Thermal Imaging & Rosin Short Isolation Workbench',
      subtitleAr: 'كشف المكثفات المحروقة بحقن الفولت المباشر وتبخير الدخان',
      subtitleEn: 'Isolate shorted SMD capacitors with DC injection & rosin vapor',
      icon: Flame,
      color: 'text-rose-500',
      tabId: 'thermal-rosin'
    },
    {
      id: 'voltage-bridge',
      titleAr: 'موديول جسر الفولتية VoltageBridge (تفتيش جهود V-Rail للمعالجات)',
      titleEn: 'VoltageBridge V-Rail & Multimeter Inspector',
      subtitleAr: 'مقارنة جهود التشغيل لـ Snapdragon, Kirin, Dimensity ببيانات الملتيميتر',
      subtitleEn: 'Cross-reference V-Nominal power rails for Snapdragon, Kirin & Dimensity',
      icon: Zap,
      color: 'text-amber-400',
      tabId: 'hardware-workbench'
    },
    {
      id: 'ufs-memory',
      titleAr: 'برمجية ذاكرات الـ UFS 4.0 / eMMC ونقاط لحام الـ ISP',
      titleEn: 'UFS 4.0 & eMMC Memory Programmer Studio',
      subtitleAr: 'فحص نسبة استهلاك الذاكرة Wear-out ومفاتيح RPMB ومخططات الـ BGA',
      subtitleEn: 'NAND wear-out estimation, RPMB key verification & BGA 254/153 ISP pinouts',
      icon: HardDrive,
      color: 'text-indigo-400',
      tabId: 'ufs-memory'
    },
    {
      id: 'hardware-workbench',
      titleAr: 'مخططات الـ PCB والمايكروسولدرينغ (Hardware Workbench)',
      titleEn: 'Hardware & Micro-Soldering Workbench',
      subtitleAr: 'خرائط بيتماپ تفاعلية وقياسات الملتيميتر والدايود',
      subtitleEn: 'Interactive PCB bitmap, diode drops & DMM',
      icon: Cpu,
      color: 'text-indigo-400',
      tabId: 'hardware-workbench'
    },
    {
      id: 'cloud-security',
      titleAr: 'سحابة الثغرات العالمية Live 0-Day Exploit Hub',
      titleEn: 'Live 0-Day Exploit Hub',
      subtitleAr: 'تحديثات الحمايات والثغرات الفورية لعام 2026',
      subtitleEn: 'Real-time security patch & exploit sync',
      icon: Flame,
      color: 'text-amber-500',
      tabId: 'cloud-security'
    },
    {
      id: 'oem-database',
      titleAr: 'قاعدة بيانات الموديلات OEM (JSON Registry)',
      titleEn: '2018-2026 OEM Device Registry',
      subtitleAr: 'تصفح مواصفات ومسارات البوت لـ +1000 موديل',
      subtitleEn: 'Search 1000+ device bootpaths & chipset specs',
      icon: Database,
      color: 'text-emerald-400',
      tabId: 'oem-database'
    },
    {
      id: 'flasher',
      titleAr: 'تفليش الرومات والأنظمة (Multi-ROM Flasher Studio)',
      titleEn: 'Multi-ROM Flasher Studio',
      subtitleAr: 'تفليش Odin, Fastboot, MTK SP Flash, EDL Sahara لجميع الأجهزة',
      subtitleEn: 'Flash Odin, Fastboot, MTK Scatter, EDL XML firmwares',
      icon: Zap,
      color: 'text-cyan-500',
      tabId: 'flasher'
    },
    {
      id: 'network',
      titleAr: 'إصلاح الشبكة والسيريال (NVRAM & IMEI Studio)',
      titleEn: 'NVRAM & IMEI Studio',
      subtitleAr: 'إعادة بناء QCN, NVRAM, وكتابة السيريال وموديم Qualcomm/MTK',
      subtitleEn: 'QCN/NVRAM calibration, baseband repair & dual-SIM IMEI patch',
      icon: Activity,
      color: 'text-blue-500',
      tabId: 'network'
    },
    {
      id: 'agent-encyclopedia',
      titleAr: 'موسوعة خبرات الوكيل الذكي واللغات (Skills Encyclopedia)',
      titleEn: 'Agent Skills Encyclopedia',
      subtitleAr: '17 وحدة هندسية شاملة للهاردوير والسوفتوير والبروتوكولات والأكواد',
      subtitleEn: '17 deep engineering dossiers across hardware, software & protocols',
      icon: Cpu,
      color: 'text-violet-500',
      tabId: 'agent-encyclopedia'
    },
    {
      id: 'box-emulation',
      titleAr: 'محاكي البوكسات والدونجلات المباشرة (Native Box Emulation)',
      titleEn: 'Native Box & Dongle Tools',
      subtitleAr: 'محاكاة بروتوكولات Z3X, Octoplus, Chimera, UFI, Pandora, Medusa Pro',
      subtitleEn: 'Native virtual engine for Z3X, Octoplus, Chimera & Pandora boxes',
      icon: Wrench,
      color: 'text-emerald-500',
      tabId: 'box-emulation'
    },
    {
      id: 'codelab',
      titleAr: 'مختبر أكواد ومكتبات البروتوكول (Native Protocol Code Lab)',
      titleEn: 'Native Protocol Code Lab',
      subtitleAr: 'أكواد جاهزة بلغات C++, Python, Rust لبروتوكولات USB و BROM',
      subtitleEn: 'Production-ready protocol drivers in C++, Python, Rust & TypeScript',
      icon: Terminal,
      color: 'text-amber-500',
      tabId: 'codelab'
    },
    {
      id: 'localization',
      titleAr: 'التعريب وتغيير منطقة CSC (Language & CSC Switcher)',
      titleEn: 'Language & CSC Switcher',
      subtitleAr: 'تغيير كود الدولة ومطابقة CSC وتفعيل تسجيل المكالمات تلقائياً',
      subtitleEn: 'CSC region modification, call recording activation & XML localization',
      icon: Globe,
      color: 'text-indigo-400',
      tabId: 'localization'
    },
    {
      id: 'safety',
      titleAr: 'حماية مضاد الطوب والنسخ الاحتياطي (Anti-Brick Suite)',
      titleEn: 'Anti-Brick & Partition Suite',
      subtitleAr: 'أخذ نسخ احتياطية فورية لقطاعات NVRAM, EFS, VBMETA, Persist الحساسة',
      subtitleEn: 'Automated safeguard backups for critical EFS, persist & radio partitions',
      icon: ShieldAlert,
      color: 'text-rose-500',
      tabId: 'safety'
    },
    {
      id: 'device-reader',
      titleAr: 'قارئ التيليميتري بكافة الأوضاع (Multi-Mode Telemetry)',
      titleEn: 'Multi-Mode Telemetry Reader',
      subtitleAr: 'قراءة بيانات الهاتف في ADB, Fastboot, EDL, DFU, BROM ومطابقة الحماية',
      subtitleEn: 'Comprehensive device inspection across ADB, Fastboot, EDL 9008 & BROM',
      icon: Smartphone,
      color: 'text-teal-400',
      tabId: 'device-reader'
    }
  ];

  const filteredActions = quickActions.filter(act => 
    act.titleAr.toLowerCase().includes(query.toLowerCase()) ||
    act.titleEn.toLowerCase().includes(query.toLowerCase()) ||
    act.subtitleAr.toLowerCase().includes(query.toLowerCase()) ||
    act.subtitleEn.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDevices = DEVICE_PRESETS.filter(dev => 
    dev.marketName.toLowerCase().includes(query.toLowerCase()) ||
    dev.model.toLowerCase().includes(query.toLowerCase()) ||
    dev.brand.toLowerCase().includes(query.toLowerCase()) ||
    dev.chipset.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-start justify-center pt-16 px-4 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden space-y-0 animate-in fade-in zoom-in duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-cyan-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAr
                ? 'ابحث عن عطل، موديل، ثغرة FRP، مخطط PCB، أو أداة تفليش... (Ctrl + K)'
                : 'Search repair task, OEM model, FRP exploit, PCB bitmap or command... (Ctrl + K)'
            }
            className="w-full bg-transparent text-slate-900 text-sm focus:outline-none placeholder:text-slate-400 font-sans"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Quick Tools Section */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2">
              {isAr ? 'الأدوات والأقسام السريعة' : 'QUICK WORKSTATION MODULES'}
            </span>

            {filteredActions.length > 0 ? (
              filteredActions.map((act) => {
                const IconComponent = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => {
                      onSelectTab(act.tabId);
                      onClose();
                    }}
                    className="w-full p-3 rounded-xl bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all flex items-center justify-between group cursor-pointer text-right rtl:text-right ltr:text-left shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-slate-50 border border-slate-100 ${act.color.replace('text-', 'text-opacity-80 text-')}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                          {isAr ? act.titleAr : act.titleEn}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          {isAr ? act.subtitleAr : act.subtitleEn}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors rtl:rotate-180 shrink-0" />
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 px-2 py-1">{isAr ? 'لا توجد أدوات مطابقة' : 'No matching tools'}</p>
            )}
          </div>

          {/* Preset Devices Quick Selector */}
          {filteredDevices.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2">
                {isAr ? 'اختيار هاتف مستهدف فوراً (Target OEM Devices)' : 'SELECT TARGET OEM DEVICE'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredDevices.slice(0, 4).map((dev) => (
                  <button
                    key={dev.id}
                    onClick={() => {
                      onSelectDevice(dev);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-200 transition-all flex items-center justify-between cursor-pointer text-left rtl:text-right shadow-sm"
                  >
                    <div>
                      <span className="text-xs font-bold text-cyan-700 block">
                        {dev.brand} {dev.marketName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {dev.model} | {dev.chipsetName}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white text-emerald-700 border border-slate-100 shadow-inner">
                      {dev.mode}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick System Controls */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs px-2 text-slate-400">
            <button
              onClick={() => {
                onOpenUsbModal();
                onClose();
              }}
              className="hover:text-cyan-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-600" />
              <span>{isAr ? 'ربط جهاز WebUSB مباشر' : 'Connect Raw WebUSB Device'}</span>
            </button>

            <button
              onClick={() => {
                onOpenWindowsInstaller();
                onClose();
              }}
              className="hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isAr ? 'تعاريف ويندوز وبكج التثبيت' : 'Windows Setup & Drivers'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
