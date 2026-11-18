import React, { useState } from 'react';
import { 
  Smartphone, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  Wifi, 
  Cpu, 
  Lock, 
  Unlock,
  Radio
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  transsionMtkEngine, 
  TranssionDeviceInfo, 
  SAMPLE_TRANSSION_DEVICES 
} from '../services/TranssionMtkEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const TranssionMtkStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [transsionDevice, setTranssionDevice] = useState<TranssionDeviceInfo>(SAMPLE_TRANSSION_DEVICES[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Transsion (Infinix / Tecno / Itel) MTK Studio v2026.9 initialized.',
    'Transsion V16 DA & PayJoy / MDM Cloud Security Controller Online.',
    'Connect device with Volume Down / Volume Up held while plugging USB.'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[TRANSSION_STUDIO] ${m}`);
  };

  const handleProbeTranssion = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Connecting to Transsion MTK BROM endpoint...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await transsionMtkEngine.probeTranssionDevice(addLog);
    if (res.success) {
      setTranssionDevice(res.device);
      setCurrentDevice({
        ...device,
        brand: res.device.brand,
        model: res.device.model,
        mode: 'MTK_BROM'
      });

      const msg = isAr 
        ? `✅ تم التعرف على هاتف ${res.device.model} بنجاح عبر DA_TRANSSION_V16!`
        : `✅ Transsion ${res.device.model} connected!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleRemoveMdm = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Removing PayJoy & Transsion MDM Cloud enrollment...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await transsionMtkEngine.removeTranssionMdm(addLog);
    if (res.success) {
      setTranssionDevice(prev => ({ ...prev, mdmStatus: 'CLEAN_UNLOCKED' }));
      const msg = isAr 
        ? '✅ تم بنجاح حذف قفل PayJoy وشركات التقسيط والـ MDM السحابي نهائياً!'
        : '✅ PayJoy / MDM Cloud Lock removed permanently!';
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

    addLog('Formatting persistent FRP block...');
    realUsbService.playContinuityBeep(120, 2300);

    const res = await transsionMtkEngine.wipeTranssionFrp(addLog);
    if (res.success) {
      setTranssionDevice(prev => ({ ...prev, frpStatus: 'CLEAN' }));
      const msg = isAr 
        ? '✅ تم بنجاح حذف حساب جوجل (FRP) ورمز الحماية بنقرة واحدة!'
        : '✅ Google FRP wiped successfully!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  const handleFixNvram = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Repairing NVRAM WARNING: ERR 0x02...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await transsionMtkEngine.repairNvramWarning(addLog);
    if (res.success) {
      setTranssionDevice(prev => ({ ...prev, nvramStatus: 'NVRAM_CALIBRATED' }));
      const msg = isAr 
        ? '✅ تم بنجاح إصلاح خطأ NVRAM ERR 0x02 واستعادة معايرة شبكة الواي فاي!'
        : '✅ NVRAM ERR 0x02 repaired successfully!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 3000);
    }

    setIsExecuting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-lime-600 via-emerald-600 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-lime-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                {isAr ? 'استوديو ترانشن وإنفينكس وتكنو (Infinix, Tecno & Itel MTK Studio)' : 'Transsion (Infinix/Tecno/Itel) MTK Suite'}
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold">
                DA V16 & PayJoy / MDM Bypass
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'دعم هواتف Infinix, Tecno, Itel: حذف قفل أقساط PayJoy و MDM السحابي، تخطي FRP، وإصلاح خطأ NVRAM 0x02'
                : 'Transsion V16 DA Loader, PayJoy/MDM Cloud unlock, FRP wipe, and NVRAM ERR 0x02 repair'}
            </p>
          </div>
        </div>

        <button
          onClick={handleProbeTranssion}
          disabled={isExecuting}
          className="bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-slate-800 hover:border-emerald-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isAr ? 'قراءة Transsion MTK' : 'Probe Transsion'}</span>
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
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'بيانات هاتف ترانشن المتصل' : 'Transsion Device Telemetry'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Model & Brand:</span>
                <span className="font-bold text-white">{transsionDevice.model}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">OS & Security:</span>
                <span className="font-bold text-emerald-300">{transsionDevice.xosHiOsVersion} ({transsionDevice.securityPatch})</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SoC Chipset:</span>
                <span className="font-bold text-white">{transsionDevice.soc}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MDM Status:</span>
                <span className={`font-bold ${transsionDevice.mdmStatus === 'CLEAN_UNLOCKED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {transsionDevice.mdmStatus}
                </span>
              </div>
            </div>
          </div>

          {/* 1-Click Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-lime-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'عمليات ترانشن الفورية' : 'Transsion 1-Click Operations'}</span>
            </span>

            <div className="space-y-2.5">
              <button
                onClick={handleRemoveMdm}
                disabled={isExecuting}
                className="w-full p-3.5 bg-gradient-to-r from-lime-600 via-emerald-600 to-teal-600 hover:from-lime-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="font-black text-xs">{isAr ? 'حذف قفل PayJoy والـ MDM السحابي' : '1-Click Remove PayJoy / MDM Cloud'}</div>
                  <div className="text-[10px] text-emerald-100">{isAr ? 'تصفير قطاع tr_carrier وحماية الأقساط' : 'Clears carrier enrollment & PayJoy locks'}</div>
                </div>
                <Lock className="w-5 h-5 text-white" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleWipeFrp}
                  disabled={isExecuting}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isAr ? 'تخطي FRP' : 'Wipe FRP'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{isAr ? 'تصفير حماية حساب جوجل' : 'Direct FRP partition wipe'}</span>
                </button>

                <button
                  onClick={handleFixNvram}
                  disabled={isExecuting}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-lime-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-lime-400 font-bold text-xs">
                    <Wifi className="w-4 h-4" />
                    <span>{isAr ? 'إصلاح NVRAM 0x02' : 'Fix NVRAM 0x02'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{isAr ? 'إصلاح تحذير الواي فاي' : 'Fixes Wi-Fi calibration'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Console */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[420px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">Transsion DA Protocol Stream</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              DA V16
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('TRANSSION') || l.includes('MDM')
                    ? 'text-emerald-300'
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
