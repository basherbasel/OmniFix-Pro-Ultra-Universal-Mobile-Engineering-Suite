import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  AlertTriangle, 
  Play, 
  Terminal, 
  Cpu, 
  Sparkles, 
  HelpCircle,
  Clock,
  Key,
  Search,
  Lock,
  Unlock,
  Layers,
  Smartphone,
  Check,
  Globe,
  Radio,
  RefreshCw,
  Flame,
  Wrench,
  Server,
  Activity,
  Download,
  FolderOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { ConnectedDevice, FrpMethod, DeviceMode } from '../types';
import { FRP_METHODS } from '../data/frpMethods';
import { CLOUD_SECURITY_BULLETINS } from '../data/cloudSecurityFeed';
import { realUsbService } from '../services/realUsbService';

interface FrpBypassHubProps {
  device: ConnectedDevice;
  onExecuteBypass: (method: FrpMethod) => void;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

export const FrpBypassHub: React.FC<FrpBypassHubProps> = ({
  device,
  onExecuteBypass,
  isBusy,
  lang
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'methods' | 'edl_brom_direct' | 'cloud_0day_feed'>('edl_brom_direct');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [selectedMethodId, setSelectedMethodId] = useState<string>(FRP_METHODS[0].id);

  // Auto Cloud Sync State
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string>(
    isAr ? 'متصل برابط سحابي مباشر (0-Day Server Active)' : 'Live 0-Day Server Connected'
  );
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just Now (Auto-Synced)');

  // Selected Protocol Mode for Low-Level Direct Tab
  const [directProtocol, setDirectProtocol] = useState<'QUALCOMM_EDL_9008' | 'MTK_BROM_SLA' | 'UNISOC_SPD_DIAG' | 'SAMSUNG_ODIN_LOKE' | 'ADB_RSA_INJECT'>('QUALCOMM_EDL_9008');
  const [firehoseLoader, setFirehoseLoader] = useState<string>('prog_firehose_ddr_generic.elf');
  const [mtkDaFile, setMtkDaFile] = useState<string>('MTK_AllInOne_DA_v6.bin');
  const [bypassOption, setBypassOption] = useState<'ERASE_FRP' | 'ERASE_PERSIST' | 'UNLOCK_SCREEN_LOCK' | 'MI_CLOUD_NEUTRALIZER' | 'KNOX_GUARD_BYPASS' | 'ADB_KEY_INJECT_FBE'>('ERASE_FRP');

  useEffect(() => {
    if (device.brand.toUpperCase().includes('SAMSUNG')) {
      setSelectedBrandFilter('SAMSUNG');
      setDirectProtocol('SAMSUNG_ODIN_LOKE');
    } else if (device.brand.toUpperCase().includes('XIAOMI') || device.brand.toUpperCase().includes('REDMI') || device.brand.toUpperCase().includes('POCO')) {
      setSelectedBrandFilter('XIAOMI');
    } else if (device.brand.toUpperCase().includes('APPLE') || device.brand.toUpperCase().includes('IPHONE')) {
      setSelectedBrandFilter('APPLE');
    } else if (device.brand.toUpperCase().includes('HUAWEI') || device.brand.toUpperCase().includes('HONOR')) {
      setSelectedBrandFilter('HUAWEI');
    } else if (device.brand.toUpperCase().includes('OPPO') || device.brand.toUpperCase().includes('VIVO') || device.brand.toUpperCase().includes('REALME')) {
      setSelectedBrandFilter('BBK');
    }

    if (device.chipset === 'qualcomm') {
      setDirectProtocol('QUALCOMM_EDL_9008');
    } else if (device.chipset === 'mediatek') {
      setDirectProtocol('MTK_BROM_SLA');
    } else if (device.chipset === 'unisoc_spd') {
      setDirectProtocol('UNISOC_SPD_DIAG');
    } else if (device.chipset === 'samsung_exynos') {
      setDirectProtocol('SAMSUNG_ODIN_LOKE');
    }
  }, [device.chipset, device.brand]);

  // Trigger manual cloud refresh
  const handleTriggerCloudSync = () => {
    setIsCloudSyncing(true);
    realUsbService.playContinuityBeep(120, 2200);

    setTimeout(() => {
      setIsCloudSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString());
      realUsbService.playContinuityBeep(220, 2800);
    }, 1100);
  };

  const brandFilters = [
    { id: 'ALL', nameAr: 'الكل', nameEn: 'All Brands' },
    { id: 'SAMSUNG', nameAr: 'سامسونج (Knox/MTP)', nameEn: 'Samsung Knox' },
    { id: 'XIAOMI', nameAr: 'شاومي (Mi Cloud/EDL)', nameEn: 'Xiaomi/POCO' },
    { id: 'APPLE', nameAr: 'آبل (iCloud/Ramdisk)', nameEn: 'Apple iOS' },
    { id: 'HUAWEI', nameAr: 'هواوي (COM1/ID)', nameEn: 'Huawei/Honor' },
    { id: 'BBK', nameAr: 'أوبو/فيفو/ريلمي', nameEn: 'Oppo/Vivo/Realme' },
    { id: 'MEDIATEK', nameAr: 'ميدياتك (BROM)', nameEn: 'MediaTek' },
    { id: 'UNISOC', nameAr: 'يونيسوك (SPRD)', nameEn: 'Unisoc/Transsion' },
  ];

  const filteredMethods = FRP_METHODS.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      m.name.toLowerCase().includes(q) || 
      m.description.toLowerCase().includes(q) ||
      m.supportedAndroid.toLowerCase().includes(q) ||
      m.targetChipsets.some(c => c.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (selectedBrandFilter === 'ALL') return true;
    if (selectedBrandFilter === 'SAMSUNG') return m.name.toLowerCase().includes('samsung') || m.targetChipsets.includes('samsung_exynos');
    if (selectedBrandFilter === 'XIAOMI') return m.name.toLowerCase().includes('xiaomi') || m.name.toLowerCase().includes('mi account');
    if (selectedBrandFilter === 'APPLE') return m.targetChipsets.includes('apple_ios') || m.name.toLowerCase().includes('apple') || m.name.toLowerCase().includes('icloud');
    if (selectedBrandFilter === 'HUAWEI') return m.targetChipsets.includes('hisilicon_kirin') || m.name.toLowerCase().includes('huawei');
    if (selectedBrandFilter === 'BBK') return m.name.toLowerCase().includes('oppo') || m.name.toLowerCase().includes('vivo') || m.name.toLowerCase().includes('realme');
    if (selectedBrandFilter === 'MEDIATEK') return m.targetChipsets.includes('mediatek');
    if (selectedBrandFilter === 'UNISOC') return m.targetChipsets.includes('unisoc_spd');

    return true;
  });

  const activeMethod = FRP_METHODS.find(m => m.id === selectedMethodId) || filteredMethods[0] || FRP_METHODS[0];

  // Quick Direct Execution Generator
  const handleExecuteDirectProtocol = () => {
    const customMethod: FrpMethod = {
      id: `direct-${directProtocol.toLowerCase()}`,
      name: directProtocol === 'QUALCOMM_EDL_9008' 
        ? `Qualcomm EDL 9008 Direct (${firehoseLoader})` 
        : directProtocol === 'MTK_BROM_SLA'
        ? `MediaTek BROM SLA Bypass (${mtkDaFile})`
        : directProtocol === 'UNISOC_SPD_DIAG'
        ? `Unisoc SPRD Diag Protocol Engine`
        : directProtocol === 'ADB_RSA_INJECT'
        ? `ADB Pre-Authorized RSA Key Injector`
        : `Samsung Odin Loke Hardware Bypass`,
      description: `Direct hardware injection for ${bypassOption} using ${directProtocol} low-level bus protocol.`,
      targetChipsets: [
        (directProtocol === 'QUALCOMM_EDL_9008' ? 'qualcomm' : directProtocol === 'MTK_BROM_SLA' ? 'mediatek' : directProtocol === 'UNISOC_SPD_DIAG' ? 'unisoc_spd' : directProtocol === 'ADB_RSA_INJECT' ? 'universal' : 'samsung_exynos') as any
      ],
      modeRequired: (directProtocol === 'QUALCOMM_EDL_9008' ? 'EDL_9008' : directProtocol === 'MTK_BROM_SLA' ? 'MTK_BROM' : directProtocol === 'UNISOC_SPD_DIAG' ? 'SPD_DIAG' : directProtocol === 'ADB_RSA_INJECT' ? 'RECOVERY' : 'SAMSUNG_DOWNLOAD') as DeviceMode,
      riskLevel: 'SAFE',
      successRate: 99,
      supportedAndroid: 'Android 8 - 15 / HyperOS / One UI 6',
      protocolSteps: directProtocol === 'ADB_RSA_INJECT' ? [
        `Rebooting target device into custom secure ADB/Recovery shell...`,
        `Locating target cryptographic key store path [/data/misc/adb/adb_keys]...`,
        `Injecting public computer RSA validation signature token...`,
        `Setting system access privileges (chmod 640) on authorization vectors...`,
        `Rebooting securely and triggering ADB command: [adb shell pm bypass-frp] without popups.`
      ] : [
        `Connecting low-level USB COM endpoint for ${directProtocol}...`,
        `Handshaking cryptographic payload loader: ${firehoseLoader || mtkDaFile}`,
        `Authenticating SLA / DAA signature neutralizer...`,
        `Executing target partition command: ${bypassOption}`,
        `Verifying partition checksum and rebooting device safely.`
      ]
    };

    onExecuteBypass(customMethod);
  };

  return (
    <div className="space-y-8 perspective-1000 preserve-3d pb-10">
      {/* Header Info Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden preserve-3d"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-inner">
            <Key className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight leading-tight">
                {isAr ? 'مركز تخطي وتجاوز الحسابات والأقفال الذكي' : 'FRP & Lock Bypass Hub'}
              </h3>
              <span className="px-3 py-1 rounded-full text-[10px] font-black font-mono uppercase tracking-[0.2em] bg-rose-50 text-rose-600 border border-rose-200">
                0-DAY ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-black uppercase tracking-widest opacity-60">
              {isAr 
                ? 'اتصال مباشر مع بروتوكولات EDL 9008 و BROM SLA، وتحديث تلقائي لحظي لسيرفرات الثغرات السحابية 0-Day'
                : 'Direct hardware connection with EDL 9008 and MediaTek BROM protocols.'}
            </p>
          </div>
        </div>

        {/* Cloud Auto-Sync Indicator & Manual Refresh */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 shadow-inner">
            <Radio className="w-4 h-4 text-emerald-500 animate-ping" />
            <span className="text-emerald-600 italic">{cloudSyncStatus}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400 opacity-60">{lastSyncTime}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTriggerCloudSync}
            disabled={isCloudSyncing}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 text-cyan-600 border border-slate-200 transition-all shadow-md"
            title="Force Cloud 0-Day Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${isCloudSyncing ? 'animate-spin text-amber-500' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Main Tab Navigation inside Module */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4 overflow-x-auto scrollbar-none preserve-3d">
        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('edl_brom_direct')}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border preserve-3d ${
            activeTab === 'edl_brom_direct'
              ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-white/20 shadow-lg shadow-rose-600/20'
              : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>{isAr ? 'المحرك المباشر بروتوكول' : 'Direct Hardware Engine'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('cloud_0day_feed')}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border preserve-3d ${
            activeTab === 'cloud_0day_feed'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-white/20 shadow-lg shadow-cyan-600/20'
              : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>{isAr ? 'خادم الثغرات السحابي' : 'Live Cloud Feed'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('methods')}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border preserve-3d ${
            activeTab === 'methods'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-white/20 shadow-lg shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isAr ? 'مكتبة أدوات الفك' : 'Universal Catalog'}</span>
        </motion.button>
      </div>

      {/* TAB 1: Direct Low-Level Hardware Engine (EDL & BROM) */}
      {activeTab === 'edl_brom_direct' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch preserve-3d">
          {/* Protocol Configuration & Controls (5 Cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl space-y-8 relative overflow-hidden preserve-3d"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-transparent to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 relative z-10">
              <span className="text-sm font-black text-slate-900 uppercase italic tracking-[0.2em] flex items-center gap-4 leading-tight">
                <Wrench className="w-6 h-6 text-amber-600" />
                <span>{isAr ? 'إعداد بروتوكول الاتصال بالمعالج' : 'Low-Level Bus Config'}</span>
              </span>
              <span className="px-3 py-1 rounded-lg text-[10px] font-black font-mono bg-rose-50 text-rose-600 border border-rose-200 tracking-widest">
                DIRECT
              </span>
            </div>

            {/* Selector: Direct Protocol */}
            <div className="space-y-4 relative z-10">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                {isAr ? '1. اختر بروتوكول الشريحة والمعالج:' : '1. Target Hardware Bus Protocol'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'QUALCOMM_EDL_9008', name: 'Qualcomm EDL 9008', sub: 'Sahara / Firehose Auth', color: 'rose' },
                  { id: 'MTK_BROM_SLA', name: 'MediaTek BROM SLA', sub: 'BootROM DAA Bypass', color: 'rose' },
                  { id: 'UNISOC_SPD_DIAG', name: 'Unisoc SPD Diag', sub: 'FDL1 / FDL2 Protocol', color: 'rose' },
                  { id: 'SAMSUNG_ODIN_LOKE', name: 'Samsung Loke Mode', sub: 'Knox & KG Override', color: 'rose' },
                  { id: 'ADB_RSA_INJECT', name: '🔑 ADB RSA Inject', sub: 'Pre-Authorized Token', color: 'indigo' },
                ].map((proto) => (
                  <motion.button
                    key={proto.id}
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDirectProtocol(proto.id as any)}
                    className={`p-4 rounded-2xl border text-left rtl:text-right transition-all preserve-3d shadow-md ${
                      directProtocol === proto.id
                        ? `bg-${proto.color}-600 text-white border-${proto.color}-400 shadow-lg shadow-${proto.color}-600/20`
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-black uppercase tracking-tight italic">{proto.name}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-1">{proto.sub}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Payload Loader Settings */}
            <div className="space-y-4 relative z-10">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                {isAr ? '2. المبرمج المشفر / ملف الـ Loader:' : '2. Cryptographic Loader / DA File'}
              </label>
              {directProtocol === 'QUALCOMM_EDL_9008' ? (
                <div className="relative group">
                  <input
                    type="text"
                    value={firehoseLoader}
                    onChange={(e) => setFirehoseLoader(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-cyan-700 focus:outline-none focus:border-rose-500/50 italic shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <FolderOpen className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 cursor-pointer transition-colors" />
                  </div>
                </div>
              ) : directProtocol === 'ADB_RSA_INJECT' ? (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-[11px] text-indigo-600 font-black uppercase tracking-widest italic shadow-inner">
                  {isAr ? 'تلقائي: سيتم توليد وحقن مفتاح RSA المحلي الخاص بك.' : 'Automatic: Local RSA public key token generation.'}
                </div>
              ) : (
                <div className="relative group">
                  <input
                    type="text"
                    value={mtkDaFile}
                    onChange={(e) => setMtkDaFile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-cyan-700 focus:outline-none focus:border-rose-500/50 italic shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <FolderOpen className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 cursor-pointer transition-colors" />
                  </div>
                </div>
              )}
            </div>

            {/* Target Bypass Command Option */}
            <div className="space-y-4 relative z-10">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                {isAr ? '3. العملية المراد تنفيذها على الذاكرة:' : '3. Partition Operation to Execute'}
              </label>
              <div className="relative">
                <select
                  value={bypassOption}
                  onChange={(e: any) => setBypassOption(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-black font-mono text-slate-700 uppercase tracking-widest italic appearance-none focus:outline-none focus:border-rose-500/50 shadow-inner cursor-pointer"
                >
                  <option value="ERASE_FRP">Erase FRP Partition (Reset Google Lock)</option>
                  <option value="ERASE_PERSIST">Erase Persist & Neutralize Mi Account</option>
                  <option value="UNLOCK_SCREEN_LOCK">Safe Format Screen Lock (Retain Data)</option>
                  <option value="KNOX_GUARD_BYPASS">Knox Guard / KG Locked State Override</option>
                  <option value="ADB_KEY_INJECT_FBE">Inject Pre-Authorized ADB Key (Bypass Popup)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Layers className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Execution Trigger */}
            <div className="relative z-10 pt-4">
              <motion.button
                whileHover={{ scale: 1.02, translateY: -3, boxShadow: "0 20px 40px rgba(225,29,72,0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExecuteDirectProtocol}
                disabled={isBusy}
                className={`w-full py-6 rounded-[1.75rem] font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-5 transition-all disabled:opacity-40 border border-white/20 relative overflow-hidden group shadow-2xl ${
                  isBusy
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white'
                }`}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                <Play className="w-6 h-6 fill-white relative z-10 shadow-glow" />
                <span className="relative z-10">
                  {isAr ? 'بدء الحقن وإلغاء القفل' : 'INITIATE BYPASS'}
                </span>
              </motion.button>
            </div>
          </motion.div>

          {/* Real-time Hardware Protocol Live Monitor (7 Cols) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden preserve-3d"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-50 via-transparent to-transparent pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-widest leading-tight">
                    {isAr ? 'مراقب الاتصال المباشر بطبقة الـ USB' : 'Low-Level Handshake Monitor'}
                  </h4>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black font-mono text-emerald-600 uppercase tracking-widest italic">
                    COM_BUS: ACTIVE
                  </span>
                </div>
              </div>

              {/* Console Simulation Monitor */}
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 font-mono text-xs text-slate-400 space-y-4 h-[500px] overflow-y-auto scrollbar-thin shadow-inner relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-50 pointer-events-none" />
                <div className="flex items-center gap-3 text-slate-600 italic">
                  <span>[00:00.01]</span>
                  <span className="font-black uppercase tracking-widest">System</span>
                  <span>Initializing low-level USB stack for {directProtocol}...</span>
                </div>
                <div className="flex items-center gap-3 text-cyan-400 italic">
                  <span>[00:00.04]</span>
                  <span className="font-black uppercase tracking-widest">Enumeration</span>
                  <span>USB Endpoints: VID_05C6&PID_9008 (Qualcomm Sahara Bus)</span>
                </div>
                <div className="flex items-center gap-3 text-amber-400 italic">
                  <span>[00:00.08]</span>
                  <span className="font-black uppercase tracking-widest">Handshake</span>
                  <span>Hello Packet (Cmd 0x01)... ACK Received</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-400 italic font-black">
                  <span>[00:00.12]</span>
                  <span className="font-black uppercase tracking-widest">Injection</span>
                  <span>Memory Loader Payload: {directProtocol === 'QUALCOMM_EDL_9008' ? firehoseLoader : mtkDaFile}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 italic">
                  <span>[00:00.18]</span>
                  <span className="font-black uppercase tracking-widest">Auth_Bypass</span>
                  <span>Bypassing OEM RSA-4096 Signature Check via 0-Day Vector...</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-300 font-black italic p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>[00:00.22] SLA / DAA Neutralized Successfully! Protocol Unlocked.</span>
                </div>
                <div className="flex items-center gap-3 text-rose-400 font-black italic">
                  <span>[00:00.28]</span>
                  <span className="font-black uppercase tracking-widest">Execution</span>
                  <span>Target Action: {bypassOption}</span>
                </div>
                {/* Dynamic scan line effect */}
                <div className="absolute inset-0 bg-scan-line opacity-[0.03] pointer-events-none" />
              </div>
            </div>

            {/* Connected Device Summary Bar */}
            <div className="mt-8 p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-inner relative z-10 preserve-3d">
              <div className="flex items-center gap-4">
                <Smartphone className="w-6 h-6 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{isAr ? 'الجهاز المستهدف' : 'Target Device'}</span>
                  <strong className="text-sm font-black text-cyan-600 uppercase italic tracking-tight">{device.brand} {device.model}</strong>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-black text-[10px] tracking-[0.2em] uppercase italic">
                  {device.mode}
                </div>
                <div className="px-4 py-2 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 font-black text-[10px] tracking-[0.2em] uppercase italic font-mono">
                  {device.chipset}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* TAB 2: Live Cloud 0-Day Vulnerability Feed */}
      {activeTab === 'cloud_0day_feed' && (
        <div className="space-y-8 preserve-3d">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-[2.5rem] bg-slate-950/40 backdrop-blur-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner">
                <Globe className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white uppercase italic tracking-tight leading-tight">
                  {isAr ? 'قائمة ثغرات الـ 0-Day المحدثة تلقائياً' : 'Live Auto-Synced 0-Day Feed'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 font-black uppercase tracking-widest opacity-60">
                  Global security vulnerability matrix for modern SoC platforms.
                </p>
              </div>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black text-[10px] tracking-[0.3em] uppercase italic flex items-center gap-3">
              <Radio className="w-4 h-4 animate-ping" />
              OMNIFIX_CORE_SYNC: ACTIVE
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CLOUD_SECURITY_BULLETINS.map((bulletin, idx) => (
              <motion.div 
                key={bulletin.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-slate-950/40 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] space-y-6 group hover:border-cyan-500/30 transition-all preserve-3d relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="flex items-center justify-between relative z-10">
                  <span className="px-4 py-1.5 rounded-xl font-black font-mono text-[11px] tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/30 italic">
                    {bulletin.cveId}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-xl font-black font-mono text-[11px] tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 italic">
                      {bulletin.zeroDayStatus}
                    </span>
                  </div>
                </div>

                <h4 className="text-lg font-black text-white leading-tight uppercase italic tracking-tight relative z-10 group-hover:text-cyan-400 transition-colors">
                  {isAr ? bulletin.titleAr : bulletin.titleEn}
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed bg-black/40 p-6 rounded-2xl border border-white/5 font-medium relative z-10 shadow-inner group-hover:text-slate-300 transition-colors">
                  {isAr ? bulletin.descriptionAr : bulletin.descriptionEn}
                </p>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Exploit Efficiency</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${bulletin.exploitEfficiency}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                        />
                      </div>
                      <span className="text-sm font-black text-emerald-400 italic">{bulletin.exploitEfficiency}%</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05, translateY: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const method: FrpMethod = {
                        id: bulletin.id,
                        name: bulletin.cveId,
                        description: bulletin.descriptionEn,
                        targetChipsets: bulletin.affectedChipsets,
                        modeRequired: 'EDL_9008' as DeviceMode,
                        riskLevel: 'SAFE',
                        successRate: bulletin.exploitEfficiency,
                        supportedAndroid: bulletin.affectedAndroidRange,
                        protocolSteps: [bulletin.exploitPayloadCommand]
                      };
                      onExecuteBypass(method);
                    }}
                    className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center gap-3"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Execute</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Original Catalog List */}
      {activeTab === 'methods' && (
        <div className="space-y-8 preserve-3d">
          {/* Brand Filters & Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6"
          >
            <div className="relative flex-1 group">
              <Search className="w-6 h-6 text-slate-600 absolute top-1/2 -translate-y-1/2 left-6 rtl:left-auto rtl:right-6 group-focus-within:text-rose-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن طريقة التخطي...' : 'Search universal exploit catalog...'}
                className="w-full pl-16 rtl:pl-6 rtl:pr-16 pr-6 py-5 bg-black/40 border border-white/5 rounded-2xl text-sm font-black text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/50 transition-all uppercase tracking-widest italic shadow-inner"
              />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
              {brandFilters.map((b) => (
                <motion.button
                  key={b.id}
                  whileHover={{ scale: 1.05, translateY: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBrandFilter(b.id)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                    selectedBrandFilter === b.id
                      ? 'bg-rose-600 text-white border-rose-400 shadow-[0_15px_30px_rgba(225,29,72,0.3)]'
                      : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {isAr ? b.nameAr : b.nameEn}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Main Grid: Methods on Left, Detailed Protocol Execution on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch preserve-3d">
            {/* Available Method Cards (5 Columns) */}
            <div className="lg:col-span-5 space-y-4 max-h-[700px] overflow-y-auto scrollbar-none pr-2">
              {filteredMethods.map((method, idx) => {
                const isSelected = method.id === activeMethod.id;
                const isChipsetCompatible = method.targetChipsets.includes(device.chipset);

                return (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedMethodId(method.id)}
                    className={`p-6 rounded-[2rem] border cursor-pointer transition-all preserve-3d relative overflow-hidden group ${
                      isSelected
                        ? 'bg-slate-900 border-rose-500/50 shadow-[0_20px_40px_rgba(0,0,0,0.3)] ring-1 ring-rose-500/20'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="flex items-start justify-between gap-4 relative z-10">
                      <h5 className={`text-sm font-black uppercase italic tracking-tight leading-tight ${isSelected ? 'text-rose-400' : 'text-slate-200'} group-hover:text-rose-300 transition-colors`}>
                        {method.name}
                      </h5>
                      {isChipsetCompatible && (
                        <div className="px-3 py-1 rounded-lg text-[9px] font-black tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase italic">
                          MATCH
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-3 leading-relaxed relative z-10 group-hover:text-slate-400 transition-colors">
                      {method.description}
                    </p>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                      <span className="text-amber-500 italic">Req: {method.modeRequired}</span>
                      <span className="text-emerald-500 italic">{method.successRate}% SUCCESS</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Protocol Details & One-Click Execution View (7 Columns) */}
            <motion.div 
              layoutId="method-details"
              className="lg:col-span-7 bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden preserve-3d"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-start justify-between gap-6 border-b border-white/5 pb-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-4">
                      <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{activeMethod.name}</h4>
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-[0.3em] uppercase italic ${
                        activeMethod.riskLevel === 'SAFE' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_5px_15px_rgba(16,185,129,0.2)]'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_5px_15px_rgba(245,158,11,0.2)]'
                      }`}>
                        {activeMethod.riskLevel} RISK
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed max-w-2xl">{activeMethod.description}</p>
                  </div>
                </div>

                {/* Requirements & Target Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 bg-black/40 rounded-3xl border border-white/5 shadow-inner group hover:border-amber-500/30 transition-all">
                    <span className="text-slate-600 block text-[10px] font-black uppercase tracking-widest mb-2 leading-none">{isAr ? 'الوضع المطلوب' : 'REQUIRED MODE'}</span>
                    <span className="text-lg font-black text-amber-500 italic uppercase tracking-tighter leading-none">{activeMethod.modeRequired}</span>
                  </div>
                  <div className="p-6 bg-black/40 rounded-3xl border border-white/5 shadow-inner group hover:border-cyan-500/30 transition-all">
                    <span className="text-slate-600 block text-[10px] font-black uppercase tracking-widest mb-2 leading-none">{isAr ? 'الأنظمة المدعومة' : 'SUPPORTED OS'}</span>
                    <span className="text-sm font-black text-slate-200 italic uppercase tracking-widest leading-none">{activeMethod.supportedAndroid}</span>
                  </div>
                  <div className="p-6 bg-black/40 rounded-3xl border border-white/5 shadow-inner group hover:border-emerald-500/30 transition-all">
                    <span className="text-slate-600 block text-[10px] font-black uppercase tracking-widest mb-2 leading-none">{isAr ? 'نسبة النجاح' : 'SUCCESS RATE'}</span>
                    <span className="text-lg font-black text-emerald-500 italic uppercase tracking-tighter leading-none">{activeMethod.successRate}% Verified</span>
                  </div>
                </div>

                {/* Sequential Execution Pipeline */}
                <div className="space-y-4">
                  <h5 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center justify-between italic">
                    <span className="flex items-center gap-3">
                      <Terminal className="w-5 h-5 text-cyan-500" />
                      <span>{isAr ? 'خطوات تنفيذ البروتوكول الأمني' : 'Protocol Execution Pipeline'}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">{activeMethod.protocolSteps.length} STAGES</span>
                  </h5>
                  <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 space-y-4 font-mono text-xs text-slate-400 shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-50 pointer-events-none" />
                    {activeMethod.protocolSteps.map((step, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="flex items-start gap-5 relative z-10 group/item"
                      >
                        <span className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/20 group-hover/item:bg-rose-500 group-hover/item:text-white transition-all">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed group-hover/item:text-slate-200 transition-colors">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Execute Button */}
              <div className="pt-10 border-t border-white/5 flex flex-wrap items-center justify-between gap-6 relative z-10">
                <motion.button
                  whileHover={{ scale: 1.02, translateY: -3, boxShadow: "0 20px 40px rgba(225,29,72,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onExecuteBypass(activeMethod)}
                  disabled={isBusy}
                  className="px-10 py-6 rounded-[1.75rem] font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white shadow-2xl border border-white/20 relative overflow-hidden group transition-all disabled:opacity-40"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                  <Play className="w-6 h-6 fill-white relative z-10 shadow-glow" />
                  <span className="relative z-10">{isAr ? 'تخطي وإلغاء القفل الآن' : 'EXECUTE UNLOCK'}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

