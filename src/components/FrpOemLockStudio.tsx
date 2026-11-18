import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Key, 
  Settings, 
  Radio,
  FileCode,
  HardDrive,
  Check,
  Flame
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { frpOemLockEngine } from '../services/FrpOemLockEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const FrpOemLockStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [activeTab, setActiveTab] = useState<'frp_unlock' | 'oem_lock_unlock'>('frp_unlock');
  const [selectedFrpMethod, setSelectedFrpMethod] = useState<string>('SAMSUNG_DOWNLOAD_LOKE');
  const [selectedOemMethod, setSelectedOemMethod] = useState<'FASTBOOT_OEM_UNLOCK' | 'MTK_SECCFG_PATCH' | 'SAMSUNG_KNOX_BL_PATCH' | 'XIAOMI_MIUI_TOKEN_UNLOCK'>('SAMSUNG_KNOX_BL_PATCH');
  const [isExecuting, setIsExecuting] = useState(false);
  const [localFrpStatus, setLocalFrpStatus] = useState<string>(device.frpStatus || 'ON');
  const [localBlStatus, setLocalBlStatus] = useState<string>(device.bootloaderStatus || 'LOCKED');
  const [operationSuccessNotice, setOperationSuccessNotice] = useState<string | null>(null);

  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'OmniFix FRP & OEM Lock Bypass Engine v2026.9 initialized.',
    `Connected Target: ${device.brand} ${device.marketName} (${device.model}) | Mode: ${device.mode}`,
    `FRP Status: ${device.frpStatus || 'ON'} | Bootloader State: ${device.bootloaderStatus || 'LOCKED'}`
  ]);

  // Synchronize local states when device changes
  useEffect(() => {
    setLocalFrpStatus(device.frpStatus || 'ON');
    setLocalBlStatus(device.bootloaderStatus || 'LOCKED');
    setOperationSuccessNotice(null);

    // Auto-detect optimal FRP & OEM method based on current device mode
    if (device.mode === 'SAMSUNG_DOWNLOAD') {
      setSelectedFrpMethod('SAMSUNG_DOWNLOAD_LOKE');
      setSelectedOemMethod('SAMSUNG_KNOX_BL_PATCH');
    } else if (device.mode === 'FASTBOOT' || device.mode === 'FASTBOOTD') {
      setSelectedFrpMethod('FASTBOOT');
      setSelectedOemMethod('FASTBOOT_OEM_UNLOCK');
    } else if (device.mode === 'MTK_BROM' || device.mode === 'MTK_PRELOADER') {
      setSelectedFrpMethod('MTK_BROM');
      setSelectedOemMethod('MTK_SECCFG_PATCH');
    } else if (device.mode === 'EDL_9008') {
      setSelectedFrpMethod('QUALCOMM_EDL');
    } else {
      setSelectedFrpMethod('SAMSUNG_MTP');
    }
  }, [device.id, device.mode, device.frpStatus, device.bootloaderStatus]);

  const handleExecuteFrpUnlock = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setOperationSuccessNotice(null);

    const addLog = (m: string) => setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);

    addLog(`Initiating FRP Bypass Method: ${selectedFrpMethod} for ${device.brand} ${device.marketName}...`);
    realUsbService.playContinuityBeep(120, 2000);

    let res;
    if (selectedFrpMethod === 'SAMSUNG_MTP') {
      res = await frpOemLockEngine.executeSamsungMtpFrpReset(device, addLog);
    } else if (selectedFrpMethod === 'SAMSUNG_DOWNLOAD_LOKE') {
      res = await frpOemLockEngine.executeSamsungDownloadOdinFrpReset(device, addLog);
    } else if (selectedFrpMethod === 'FASTBOOT') {
      res = await frpOemLockEngine.executeFastbootFrpWipe(addLog);
    } else if (selectedFrpMethod === 'MTK_BROM') {
      res = await frpOemLockEngine.executeMtkBromFrpWipe(addLog);
    } else if (selectedFrpMethod === 'QUALCOMM_EDL') {
      res = await frpOemLockEngine.executeQualcommEdlFrpWipe(addLog);
    }

    if (res?.success) {
      setLocalFrpStatus('OFF');
      const updatedDevice: ConnectedDevice = {
        ...device,
        frpStatus: 'OFF'
      };
      setCurrentDevice(updatedDevice);
      
      const successMsg = isAr 
        ? `✅ تم بنجاح فك وتصفير حساب جوجل (FRP BYPASS) للجهاز ${device.brand} ${device.marketName} وإعادة تشغيله!`
        : `✅ Google FRP Lock successfully removed and device rebooted into Android system!`;
      
      setOperationSuccessNotice(successMsg);
      addLog(successMsg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
    if (onAddLog) onAddLog(`FrpOemLockStudio: Executed FRP Reset (${selectedFrpMethod}).`);
  };

  const handleExecuteOemUnlock = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setOperationSuccessNotice(null);

    const addLog = (m: string) => setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);

    addLog(`Initiating OEM Bootloader Unlock Protocol: ${selectedOemMethod}...`);
    realUsbService.playContinuityBeep(120, 2200);

    const res = await frpOemLockEngine.executeOemBootloaderUnlock(device, selectedOemMethod, addLog);

    if (res?.success) {
      setLocalBlStatus('UNLOCKED');
      const updatedDevice: ConnectedDevice = {
        ...device,
        bootloaderStatus: 'UNLOCKED'
      };
      setCurrentDevice(updatedDevice);

      const successMsg = isAr 
        ? `✅ تم بنجاح فك قفل البوت لودر والمصنع (BOOTLOADER UNLOCKED) للهاتف!`
        : `✅ OEM Bootloader unlocked successfully! Device security flags patched.`;

      setOperationSuccessNotice(successMsg);
      addLog(successMsg);
      realUsbService.playContinuityBeep(300, 3400);
    }

    setIsExecuting(false);
    if (onAddLog) onAddLog(`FrpOemLockStudio: Executed OEM Bootloader Unlock (${selectedOemMethod}).`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 rounded-xl shadow-lg shadow-emerald-500/20">
            <Unlock className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                {isAr ? 'أداة فك حساب جوجل وقفل المصنع (FRP & OEM Lock Bypass Suite)' : 'Google FRP & OEM Lock Bypass Suite'}
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold">
                1-Click Unlock 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'تخطي حماية حساب جوجل (Google FRP) وفك قفل البوت لودر والمصنع (OEM Unlock) لجميع الشركات والمعالجات'
                : 'Universal Google FRP Reset & OEM Bootloader Unlocker for Samsung, Xiaomi, Oppo, Vivo, Moto, MTK, Qualcomm'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('frp_unlock')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'frp_unlock'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{isAr ? 'فك حساب جوجل (Google FRP Reset)' : 'Google FRP Unlock'}</span>
          </button>

          <button
            onClick={() => setActiveTab('oem_lock_unlock')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'oem_lock_unlock'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Unlock className="w-4 h-4" />
            <span>{isAr ? 'فك قفل البوت لودر والمصنع (OEM Unlock)' : 'OEM Bootloader Unlock'}</span>
          </button>
        </div>
      </div>

      {/* Target Device Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <span className="font-extrabold text-white">{device.brand} {device.marketName} ({device.model})</span>
          {device.chipsetName && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {device.chipsetName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 font-mono flex-wrap">
          <span className="bg-slate-950 text-cyan-300 px-2.5 py-1 rounded border border-slate-800">
            Mode: {device.mode}
          </span>
          <span className={`px-2.5 py-1 rounded border font-bold flex items-center gap-1.5 ${
            localFrpStatus === 'OFF' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {localFrpStatus === 'OFF' && <Check className="w-3.5 h-3.5" />}
            FRP: {localFrpStatus === 'OFF' ? 'OFF (BYPASSED)' : 'ON'}
          </span>
          <span className={`px-2.5 py-1 rounded border font-bold flex items-center gap-1.5 ${
            localBlStatus === 'UNLOCKED' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            {localBlStatus === 'UNLOCKED' && <Check className="w-3.5 h-3.5" />}
            BL: {localBlStatus === 'UNLOCKED' ? 'UNLOCKED' : 'LOCKED'}
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {operationSuccessNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3.5 text-xs text-emerald-200 flex items-center justify-between shadow-lg shadow-emerald-950/30 animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{operationSuccessNotice}</span>
          </div>
          <button 
            onClick={() => setOperationSuccessNotice(null)}
            className="text-emerald-400 hover:text-white px-2 py-1 rounded text-[11px] font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Step-by-Step Interactive Guide Box */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase font-mono mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? '📋 دليل خطوات الاستخدام الحقيقي لكل أداة وطريقة:' : '📋 Step-by-Step Hardware Procedure Guide:'}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px] text-slate-300">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold font-mono">1. تجهيز الاتصال:</span>
            <p className="text-slate-400 text-[10px]">وصل الهاتف بكابل USB أصلي. إذا كان سامسونج، افتح مكالمة الطوارئ واطلب <code className="text-cyan-300 font-mono">*#0*#</code> لدخول قائمة الاختبار.</p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-teal-400 font-bold font-mono">2. تحديد وضع الميدياتيك BROM:</span>
            <p className="text-slate-400 text-[10px]">لهواتف MediaTek (مثل A32 4G)، أطفئ الهاتف بالكامل ثم اضغط زري الصوت (+ -) مع توصيل الكابل لربط BROM Port.</p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold font-mono">3. وضع EDL 9008 لكوالكوم:</span>
            <p className="text-slate-400 text-[10px]">لهواتف Qualcomm Snapdragon، استخدم كابل EDL المباشر أو نقاط التست بوينت (Testpoint) للدخول المباشر لوضع 9008.</p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-blue-400 font-bold font-mono">4. التنفيذ وتوليد النواة:</span>
            <p className="text-slate-400 text-[10px]">اضغط "حذف حساب جوجل" أو "فك قفل البوت لودر" وسيتم مسح قطاع الحماية حقيقياً مع إعادة تشغيل الهاتف تلقائياً.</p>
          </div>
        </div>
      </div>

      {/* Tab 1: FRP Reset Panel */}
      {activeTab === 'frp_unlock' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>{isAr ? '[ طرق إزالة حساب جوجل FRP ]' : '[ GOOGLE FRP METHODS ]'}</span>
              </h3>
              {device.mode === 'SAMSUNG_DOWNLOAD' && (
                <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded font-mono border border-cyan-500/20">
                  {isAr ? 'موصى به: Odin High-Speed' : 'Recommended: Odin Mode'}
                </span>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { 
                  id: 'SAMSUNG_DOWNLOAD_LOKE', 
                  labelAr: 'سامسونج Odin High-Speed Mode (Loke Protocol)', 
                  labelEn: 'Samsung Odin High-Speed Mode (Loke)', 
                  desc: 'Bypasses Google FRP directly via high-speed physical Odin Download Mode blocks',
                  recommended: device.mode === 'SAMSUNG_DOWNLOAD'
                },
                { 
                  id: 'SAMSUNG_MTP', 
                  labelAr: 'سامسونج MTP *#0*# Test Mode (ADB Enable)', 
                  labelEn: 'Samsung MTP *#0*# Emergency Test Mode', 
                  desc: 'Enables ADB & clears FRP in 1-Click via MTP AT commands',
                  recommended: device.mode === 'ADB_ONLINE' || device.mode === 'ROOT'
                },
                { 
                  id: 'MTK_BROM', 
                  labelAr: 'ميدياتيك BootROM (MTK BROM SLA Bypass Wipe)', 
                  labelEn: 'MediaTek BROM SLA/DAA Exploit FRP Wipe', 
                  desc: 'Direct memory corruption wipe on MTK devices (Helio G80/G99/Dimensity)',
                  recommended: device.chipset === 'mediatek' && (device.mode === 'MTK_BROM' || device.mode === 'MTK_PRELOADER')
                },
                { 
                  id: 'FASTBOOT', 
                  labelAr: 'فاستبوت عام (Fastboot Universal FRP Wipe)', 
                  labelEn: 'Universal Fastboot FRP Partition Wipe', 
                  desc: 'Erases frp, persistent, and config partitions',
                  recommended: device.mode === 'FASTBOOT'
                },
                { 
                  id: 'QUALCOMM_EDL', 
                  labelAr: 'كوالكوم EDL 9008 (Qualcomm Sahara Firehose)', 
                  labelEn: 'Qualcomm EDL 9008 Sector Erase', 
                  desc: 'Zeroes frp and config sectors in EDL mode',
                  recommended: device.mode === 'EDL_9008'
                },
              ].map((m) => (
                <label
                  key={m.id}
                  onClick={() => setSelectedFrpMethod(m.id)}
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedFrpMethod === m.id
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-extrabold text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="frpMethod"
                        checked={selectedFrpMethod === m.id}
                        onChange={() => {}}
                        className="accent-emerald-500"
                      />
                      <span>{isAr ? m.labelAr : m.labelEn}</span>
                    </div>
                    {m.recommended && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                        {isAr ? 'متطابق مع الوضع' : 'MATCHED'}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 pl-5">{m.desc}</p>
                </label>
              ))}
            </div>

            <button
              onClick={handleExecuteFrpUnlock}
              disabled={isExecuting}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black py-3.5 rounded-xl text-sm shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isExecuting ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isExecuting ? (isAr ? 'جاري فك FRP...' : 'Unlocking FRP...') : (isAr ? 'حذف حساب جوجل بنقرة واحدة' : '1-CLICK REMOVE FRP')}</span>
            </button>
          </div>

          {/* Console Output Log */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between font-mono text-xs h-[440px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">{isAr ? 'سجل العمليات والـ Pipe Logs' : 'Live FRP Operation Log'}</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                FRP Engine Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-lg border border-slate-800/60 text-slate-300">
              {consoleLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('✅') || log.includes('SUCCESS')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('Executing') || log.includes('Injecting') || log.includes('Commencing')
                      ? 'text-cyan-300'
                      : log.includes('WARNING') || log.includes('WARN')
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: OEM Unlock Panel */}
      {activeTab === 'oem_lock_unlock' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-teal-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Key className="w-4 h-4" />
              <span>{isAr ? '[ بروتوكولات فك البوت لودر والمصنع ]' : '[ OEM UNLOCK PROTOCOLS ]'}</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { 
                  id: 'SAMSUNG_KNOX_BL_PATCH', 
                  labelAr: 'Samsung Vault OEM Lock Disengage', 
                  labelEn: 'Samsung Vault OEM Lock Disengage', 
                  desc: 'Disengages OEM Vault Lock in Download Mode',
                  recommended: device.brand === 'Samsung' && device.mode === 'SAMSUNG_DOWNLOAD'
                },
                { 
                  id: 'MTK_SECCFG_PATCH', 
                  labelAr: 'MediaTek BROM seccfg Security Patch', 
                  labelEn: 'MediaTek BROM seccfg Patch', 
                  desc: 'Patches seccfg security flag in BootROM mode (Helio / Dimensity)',
                  recommended: device.chipset === 'mediatek'
                },
                { 
                  id: 'FASTBOOT_OEM_UNLOCK', 
                  labelAr: 'Fastboot OEM & Flashing Unlock', 
                  labelEn: 'Fastboot OEM & Flashing Unlock', 
                  desc: 'Executes fastboot oem unlock & flashing unlock',
                  recommended: device.mode === 'FASTBOOT'
                },
                { 
                  id: 'XIAOMI_MIUI_TOKEN_UNLOCK', 
                  labelAr: 'Xiaomi HyperOS / MIUI Instant Token Unlock', 
                  labelEn: 'Xiaomi Token Unlocker (Skip Wait Time)', 
                  desc: 'Bypasses 168-hour unlock delay timer',
                  recommended: device.brand === 'Xiaomi'
                },
              ].map((m) => (
                <label
                  key={m.id}
                  onClick={() => setSelectedOemMethod(m.id as any)}
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedOemMethod === m.id
                      ? 'bg-teal-500/15 border-teal-500/50 text-teal-200 shadow-md shadow-teal-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-extrabold text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="oemMethod"
                        checked={selectedOemMethod === m.id}
                        onChange={() => {}}
                        className="accent-teal-500"
                      />
                      <span>{isAr ? m.labelAr : m.labelEn}</span>
                    </div>
                    {m.recommended && (
                      <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-mono">
                        {isAr ? 'موصى به' : 'RECOMMENDED'}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 pl-5">{m.desc}</p>
                </label>
              ))}
            </div>

            <button
              onClick={handleExecuteOemUnlock}
              disabled={isExecuting}
              className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-black py-3.5 rounded-xl text-sm shadow-xl shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isExecuting ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Unlock className="w-5 h-5 fill-current" />}
              <span>{isExecuting ? (isAr ? 'جاري فك البوت لودر...' : 'Unlocking Bootloader...') : (isAr ? 'فك قفل البوت لودر والمصنع' : 'UNLOCK BOOTLOADER / OEM')}</span>
            </button>
          </div>

          {/* Console Output Log */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between font-mono text-xs h-[440px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-slate-200">{isAr ? 'سجل عمليات فك البوت لودر' : 'OEM Unlock Operation Log'}</span>
              </div>
              <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                BL Engine Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-lg border border-slate-800/60 text-slate-300">
              {consoleLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('✅') || log.includes('UNLOCKED')
                      ? 'text-teal-400 font-bold'
                      : log.includes('Executing') || log.includes('Patching')
                      ? 'text-cyan-300'
                      : 'text-slate-300'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
