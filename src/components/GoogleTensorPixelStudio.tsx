import React, { useState } from 'react';
import { 
  Smartphone, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Radio, 
  Cpu, 
  Lock, 
  Unlock,
  Layers,
  Sparkles
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  googleTensorPixelEngine, 
  PixelTelemetry, 
  SAMPLE_PIXEL_DEVICES 
} from '../services/GoogleTensorPixelEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const GoogleTensorPixelStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [telemetry, setTelemetry] = useState<PixelTelemetry>(SAMPLE_PIXEL_DEVICES[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Google Pixel & Tensor Titan M2 Security Flasher v2026.9 initialized.',
    'Fastboot AVB 2.0 & Titan M2 Hardware Security Controller Online.',
    'Connect Google Pixel in Fastboot Mode (Power + Volume Down).'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[PIXEL_STUDIO] ${m}`);
  };

  const handleProbe = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Querying Google Pixel Fastboot device...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await googleTensorPixelEngine.probePixelFastboot(addLog);
    if (res.success) {
      setTelemetry(res.telemetry);
      setCurrentDevice({
        ...device,
        brand: 'Google',
        model: res.telemetry.model,
        chipset: 'google_tensor',
        mode: 'FASTBOOT'
      });

      const msg = isAr 
        ? `✅ تم التعرف على هاتف ${res.telemetry.model} (${res.telemetry.soc}) بنجاح!`
        : `✅ Google Pixel ${res.telemetry.model} identified!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleWipeTitanFrp = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Initiating Titan M2 FRP Erase for ${telemetry.model}...`);
    realUsbService.playContinuityBeep(120, 2400);

    const res = await googleTensorPixelEngine.wipeTitanSecurityFrp(addLog);
    if (res.success) {
      const msg = isAr 
        ? '✅ تم بنجاح حذف قفل حساب جوجل (FRP) من شريحة الأمان Titan M2 بنقرة واحدة!'
        : '✅ Google Titan M2 FRP wiped successfully!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  const handleCarrierBypass = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Executing Carrier SIM Unlock bypass for ${telemetry.model}...`);
    realUsbService.playContinuityBeep(120, 2300);

    const res = await googleTensorPixelEngine.bypassCarrierSimLock(addLog);
    if (res.success) {
      setTelemetry(prev => ({ ...prev, carrierLock: 'UNLOCKED' }));
      const msg = isAr 
        ? '✅ تم بنجاح فك قفل الشبكة والشرائح المقفلة (Verizon / AT&T / T-Mobile) وتشغيل كافة الشرائح!'
        : '✅ Carrier SIM Lock bypassed successfully!';
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
          <div className="p-3 bg-gradient-to-tr from-blue-600 via-emerald-600 to-amber-600 rounded-xl shadow-lg shadow-emerald-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
                {isAr ? 'استوديو جوجل بكسل وشريحة تايتن (Google Pixel & Titan M2 Studio)' : 'Google Pixel & Tensor Titan M2 Suite'}
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold">
                Tensor G1-G4 Titan
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'دعم هواتف Google Pixel (6, 7, 8, 9 Pro): تصفير قفل FRP Titan M2، فك قفل الشبكة Carrier Unlock وتفليش الفاست بوت'
                : 'Titan M/M2 security FRP wipe, Carrier SIM Unlock bypass (Verizon/AT&T), and Fastboot flashing'}
            </p>
          </div>
        </div>

        <button
          onClick={handleProbe}
          disabled={isExecuting}
          className="bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-emerald-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isAr ? 'قراءة بيانات البكسل' : 'Probe Pixel'}</span>
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
        {/* Left: Pixel Device Info & Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'بيانات معالج Tensor وشريحة Titan' : 'Google Pixel Telemetry'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Model & Codename:</span>
                <span className="font-bold text-white">{telemetry.model} ({telemetry.codename})</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Google SoC & Titan:</span>
                <span className="font-bold text-emerald-300">{telemetry.soc} [{telemetry.titanChip}]</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Carrier Lock Status:</span>
                <span className={`font-bold ${telemetry.carrierLock === 'UNLOCKED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {telemetry.carrierLock}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Bootloader Lock:</span>
                <span className={`font-bold ${telemetry.bootloaderState === 'LOCKED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {telemetry.bootloaderState} (Slot _{telemetry.slot})
                </span>
              </div>
            </div>
          </div>

          {/* 1-Click Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'عمليات جوجل بكسل الفورية' : 'Pixel 1-Click Operations'}</span>
            </span>

            <div className="space-y-2.5">
              <button
                onClick={handleWipeTitanFrp}
                disabled={isExecuting}
                className="w-full p-3.5 bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="font-black text-xs">{isAr ? 'تصفير قفل FRP من شريحة Titan M2' : '1-Click Titan M2 FRP Wipe'}</div>
                  <div className="text-[10px] text-emerald-200">{isAr ? 'مسح رمز حماية FRP في وضع الفاست بوت' : 'Fastboot OEM FRP Reset'}</div>
                </div>
                <ShieldCheck className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={handleCarrierBypass}
                disabled={isExecuting}
                className="w-full p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="text-amber-400 font-bold text-xs">{isAr ? 'فك قفل الشبكة والشرائح (Carrier SIM Bypass)' : 'Carrier SIM Lock Bypass'}</div>
                  <div className="text-[10px] text-slate-400">{isAr ? 'تشغيل هواتف Verizon و AT&T على كل الشبكات' : 'Works for Verizon / AT&T locked units'}</div>
                </div>
                <Radio className="w-5 h-5 text-amber-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Console */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[460px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">{isAr ? 'سجل عمليات Google Fastboot' : 'Live Pixel Fastboot Stream'}</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Titan M2
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('TITAN') || l.includes('PIXEL')
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
