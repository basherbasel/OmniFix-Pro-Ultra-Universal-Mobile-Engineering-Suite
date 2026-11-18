import React, { useState } from 'react';
import { 
  Smartphone, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Store, 
  ShieldCheck, 
  Trash2, 
  Cpu, 
  Sparkles 
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  vivoAuthEngine, 
  VivoDeviceInfo, 
  SAMPLE_VIVO_DEVICES 
} from '../services/VivoAuthEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const VivoAuthStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [vivoDevice, setVivoDevice] = useState<VivoDeviceInfo>(SAMPLE_VIVO_DEVICES[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Vivo & iQOO OriginOS / FuntouchOS Studio v2026.9 initialized.',
    'Vivo BBK Fastboot & Demo Unlock Controller Online.',
    'Connect Vivo / iQOO in Fastboot (Hold Volume Down + Power) or EDL Mode.'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[VIVO_STUDIO] ${m}`);
  };

  const handleProbeVivo = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Connecting to Vivo BBK Fastboot endpoint...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await vivoAuthEngine.probeVivoDevice(addLog);
    if (res.success) {
      setVivoDevice(res.device);
      setCurrentDevice({
        ...device,
        brand: 'Vivo',
        model: res.device.marketingName,
        mode: 'FASTBOOT'
      });

      const msg = isAr 
        ? `✅ تم ربط هاتف ${res.device.marketingName} (${res.device.model}) بنجاح!`
        : `✅ Vivo ${res.device.marketingName} connected!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleRemoveDemo = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Removing Vivo Demo / Live Retail Mode...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await vivoAuthEngine.removeRetailDemo(addLog);
    if (res.success) {
      setVivoDevice(prev => ({ ...prev, demoStatus: 'NORMAL_CONSUMER' }));
      const msg = isAr 
        ? '✅ تم بنجاح حذف وضع العرض الديمو (Retail Demo Mode) نهائياً!'
        : '✅ Vivo Demo Mode removed permanently!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  const handleWipeFrp = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Sending Vivo BBK FRP Erase command...');
    realUsbService.playContinuityBeep(120, 2300);

    const res = await vivoAuthEngine.wipeVivoFrp(addLog);
    if (res.success) {
      setVivoDevice(prev => ({ ...prev, frpStatus: 'CLEAN' }));
      const msg = isAr 
        ? '✅ تم بنجاح تصفير قفل حساب جوجل (FRP) لهاتف فيفو بنقرة واحدة!'
        : '✅ Vivo FRP Lock wiped successfully!';
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
          <div className="p-3 bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 rounded-xl shadow-lg shadow-sky-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                {isAr ? 'استوديو هواتف فيفو وآيكو (Vivo & iQOO BBK Suite)' : 'Vivo & iQOO OriginOS / Funtouch Studio'}
              </h1>
              <span className="bg-sky-500/10 text-sky-400 text-xs px-2.5 py-0.5 rounded-full border border-sky-500/20 font-mono font-bold">
                BBK Protocol & Demo Unlock
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'دعم هواتف Vivo و iQOO: حذف قفل الديمو ووضع المحلات (Demo Mode)، وتصفير قفل FRP وحساب Vivo'
                : 'Retail Demo removal, BBK Fastboot FRP wipe, and MTK/Qualcomm auth bypass'}
            </p>
          </div>
        </div>

        <button
          onClick={handleProbeVivo}
          disabled={isExecuting}
          className="bg-slate-950 hover:bg-slate-800 text-sky-300 border border-slate-800 hover:border-sky-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isAr ? 'قراءة Vivo' : 'Probe Vivo'}</span>
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
            <span className="text-xs font-bold text-sky-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'بيانات هاتف فيفو المتصل' : 'Vivo Device Telemetry'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Model:</span>
                <span className="font-bold text-white">{vivoDevice.marketingName} ({vivoDevice.model})</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">OS System:</span>
                <span className="font-bold text-sky-300">{vivoDevice.osVersion}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SoC Chipset:</span>
                <span className="font-bold text-white">{vivoDevice.soc}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Demo Status:</span>
                <span className={`font-bold ${vivoDevice.demoStatus === 'NORMAL_CONSUMER' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {vivoDevice.demoStatus}
                </span>
              </div>
            </div>
          </div>

          {/* 1-Click Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-indigo-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'عمليات فيفو الفورية' : 'Vivo 1-Click Operations'}</span>
            </span>

            <div className="space-y-2.5">
              <button
                onClick={handleRemoveDemo}
                disabled={isExecuting}
                className="w-full p-3.5 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-sky-600/20 text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="font-black text-xs">{isAr ? 'حذف وضع الديمو والمحلات (Remove Demo Mode)' : '1-Click Remove Retail Demo Mode'}</div>
                  <div className="text-[10px] text-sky-200">{isAr ? 'إيقاف حلقة فيديوهات العرض وفتح كافة إعدادات الهاتف' : 'Removes in-store demo lock permanently'}</div>
                </div>
                <Store className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={handleWipeFrp}
                disabled={isExecuting}
                className="w-full p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="text-emerald-400 font-bold text-xs">{isAr ? 'تصفير قفل حساب جوجل (FRP Wipe)' : 'Fastboot BBK FRP Wipe'}</div>
                  <div className="text-[10px] text-slate-400">{isAr ? 'مسح رمز الحماية وحساب جوجل بنقرة واحدة' : 'fastboot bbk oem wipe_frp'}</div>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Console */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[420px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-slate-200">Vivo BBK Live Stream</span>
            </div>
            <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              BBK 2026.9
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('VIVO') || l.includes('DEMO')
                    ? 'text-sky-300'
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
