import React, { useState } from 'react';
import { 
  Smartphone, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Radio, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  Unlock, 
  Layers,
  Wrench
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  samsungExynosEngine, 
  ExynosEbbInfo, 
  SAMPLE_EXYNOS_DEVICES 
} from '../services/SamsungExynosEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const SamsungExynosStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [exynosDevice, setExynosDevice] = useState<ExynosEbbInfo>(SAMPLE_EXYNOS_DEVICES[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Samsung Exynos (Shannon CP) Studio v2026.9 initialized.',
    'Exynos EBOOT & CP Modem Protocol Bridge Online.',
    'Connect Samsung Galaxy in Download Mode (Vol Down + Vol Up + Plug USB).'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[EXYNOS_STUDIO] ${m}`);
  };

  const handleProbeExynos = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Connecting to Exynos Download Mode / Shannon CP channel...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await samsungExynosEngine.probeExynosDevice(addLog);
    if (res.success) {
      setExynosDevice(res.device);
      setCurrentDevice({
        ...device,
        brand: 'Samsung',
        model: res.device.model,
        mode: 'SAMSUNG_DOWNLOAD'
      });

      const msg = isAr 
        ? `✅ تم التعرف على هاتف ${res.device.model} ومعالج ${res.device.soc} بنجاح!`
        : `✅ Samsung ${res.device.model} connected!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleRebuildEfs = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Rebuilding corrupted EFS / Sec_EFS partition...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await samsungExynosEngine.rebuildEfsPartition(addLog);
    if (res.success) {
      setExynosDevice(prev => ({ ...prev, efsStatus: 'NV_CHECKSUM_OK' }));
      const msg = isAr 
        ? '✅ تم بنجاح إصلاح بارتشن EFS وحل مشكلة إصدار النطاق الأساسي غير معروف (Baseband Unknown)!'
        : '✅ EFS Partition rebuilt & Baseband Unknown fixed!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  const handleUnlockCarrier = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Patching Shannon CP modem network policy...');
    realUsbService.playContinuityBeep(120, 2300);

    const res = await samsungExynosEngine.unlockExynosCarrier(addLog);
    if (res.success) {
      setExynosDevice(prev => ({ ...prev, carrierLockStatus: 'CP_NETWORK_UNLOCKED' }));
      const msg = isAr 
        ? '✅ تم بنجاح فك قفل الشبكة لجميع بطاقات SIM (Carrier Network Unlock)!'
        : '✅ Carrier network unlocked successfully!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                {isAr ? 'استوديو سامسونج إكسينوس ومودم شانون (Samsung Exynos & Shannon CP Studio)' : 'Samsung Exynos & Shannon CP Suite'}
              </h1>
              <span className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-0.5 rounded-full border border-blue-500/20 font-mono font-bold">
                Exynos EBOOT & Shannon CP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'إصلاح عطل Baseband Unknown لمعالجات Exynos 2400/2200/1480، إعادة بناء EFS، وفك قفل الشبكات (Carrier Unlock)'
                : 'Rebuilds corrupted EFS, fixes Baseband Unknown, and unlocks Shannon CP carrier SIM restrictions'}
            </p>
          </div>
        </div>

        <button
          onClick={handleProbeExynos}
          disabled={isExecuting}
          className="bg-slate-950 hover:bg-slate-800 text-blue-300 border border-slate-800 hover:border-blue-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isAr ? 'قراءة Exynos' : 'Probe Exynos'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3.5 text-xs text-emerald-200 flex items-center justify-between shadow-lg shadow-emerald-950/30 animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{successBanner}</span>
          </div>
          <button 
            onClick={() => setSuccessBanner(null)} 
            className="text-emerald-400 hover:text-white px-2 py-1 rounded text-[11px] font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Device Telemetry & Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-blue-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'بيانات معالج إكسينوس ومودم شانون' : 'Exynos SoC & Shannon Telemetry'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Model & Chip:</span>
                <span className="font-bold text-white">{exynosDevice.model}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SoC Architecture:</span>
                <span className="font-bold text-blue-300">{exynosDevice.soc}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">EFS Partition Health:</span>
                <span className={`font-bold ${exynosDevice.efsStatus === 'NV_CHECKSUM_OK' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {exynosDevice.efsStatus}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Carrier Status:</span>
                <span className={`font-bold ${exynosDevice.carrierLockStatus === 'CP_NETWORK_UNLOCKED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {exynosDevice.carrierLockStatus}
                </span>
              </div>
            </div>
          </div>

          {/* 1-Click Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-sky-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'عمليات إكسينوس الفورية' : 'Exynos 1-Click Operations'}</span>
            </span>

            <div className="space-y-2.5">
              <button
                onClick={handleRebuildEfs}
                disabled={isExecuting}
                className="w-full p-3.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/20 text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="font-black text-xs">{isAr ? 'إعادة بناء بارتشن EFS وحل Baseband Unknown' : '1-Click Rebuild EFS & Fix Baseband'}</div>
                  <div className="text-[10px] text-blue-100">{isAr ? 'إصلاح عطل النطاق الأساسي وتوليد ملفات NVRAM الافتراضية' : 'Restores corrupted /efs & sec_efs ext4 tables'}</div>
                </div>
                <Wrench className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={handleUnlockCarrier}
                disabled={isExecuting}
                className="w-full p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="text-emerald-400 font-bold text-xs">{isAr ? 'فك قفل الشبكة لجميع الشرائح (Carrier SIM Unlock)' : '1-Click Shannon CP Carrier Unlock'}</div>
                  <div className="text-[10px] text-slate-400">{isAr ? 'تعديل سياسة شبكة المودم في Shannon CP' : 'Patches modem.bin network lock policies'}</div>
                </div>
                <Unlock className="w-5 h-5 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Console */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[420px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-slate-200">Samsung Exynos Live Stream</span>
            </div>
            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Shannon CP
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('EXYNOS') || l.includes('EFS')
                    ? 'text-blue-300'
                    : 'text-slate-300'
                }
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
