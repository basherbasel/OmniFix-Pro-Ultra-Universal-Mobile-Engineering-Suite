import React, { useState } from 'react';
import { 
  Smartphone, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Globe, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  Unlock, 
  Layers,
  Sparkles
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  huaweiKirinEngine, 
  HuaweiHarmonyInfo, 
  SAMPLE_HUAWEI_DEVICES 
} from '../services/HuaweiKirinEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const HuaweiHarmonyStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [huaweiDevice, setHuaweiDevice] = useState<HuaweiHarmonyInfo>(SAMPLE_HUAWEI_DEVICES[0]);
  const [targetRegion, setTargetRegion] = useState('C432 (Europe Global / hw-eu)');
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Huawei Kirin & HarmonyOS 4.2 / NEXT Studio v2026.9 initialized.',
    'HUAWEI USB COM 1.0 & OEMINFO Security Engine Online.',
    'Connect Huawei device via TestPoint to trigger HUAWEI USB COM 1.0.'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[HUAWEI_STUDIO] ${m}`);
  };

  const handleProbeHuawei = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Connecting to HUAWEI USB COM 1.0 interface...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await huaweiKirinEngine.probeHuaweiDevice(addLog);
    if (res.success) {
      setHuaweiDevice(res.device);
      setCurrentDevice({
        ...device,
        brand: 'Huawei',
        model: res.device.model,
        mode: 'HUAWEI_COM1'
      });

      const msg = isAr 
        ? `✅ تم التعرف على هاتف ${res.device.model} ومعالج ${res.device.soc} بنجاح!`
        : `✅ Huawei ${res.device.model} connected!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleRemoveHuaweiId = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Removing Huawei ID and Cloud Activation Lock...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await huaweiKirinEngine.removeHuaweiId(addLog);
    if (res.success) {
      setHuaweiDevice(prev => ({ ...prev, huaweiIdStatus: 'CLEAN_UNLOCKED' }));
      const msg = isAr 
        ? '✅ تم بنجاح حذف حساب هواوي آي دي (Huawei ID) وتخطي الحماية السحابية!'
        : '✅ Huawei ID Cloud Lock removed successfully!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  const handleRebrandRegion = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Writing new OEMINFO region table: ${targetRegion}...`);
    realUsbService.playContinuityBeep(120, 2300);

    const res = await huaweiKirinEngine.convertToGlobal(targetRegion, addLog);
    if (res.success) {
      setHuaweiDevice(prev => ({ ...prev, oemInfoRegion: targetRegion }));
      const msg = isAr 
        ? `✅ تم بنجاح تحويل منطقة الهاتف (Rebrand) إلى ${targetRegion} وتفعيل خدمات جوجل/العالمية!`
        : `✅ Converted to ${targetRegion} successfully!`;
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
          <div className="p-3 bg-gradient-to-tr from-rose-600 via-red-600 to-amber-600 rounded-xl shadow-lg shadow-red-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-rose-400 via-red-300 to-amber-300 bg-clip-text text-transparent">
                {isAr ? 'استوديو هواوي كيرين وهارموني أو إس (Huawei Kirin & HarmonyOS Studio)' : 'Huawei Kirin & HarmonyOS 4.2 Suite'}
              </h1>
              <span className="bg-red-500/10 text-red-400 text-xs px-2.5 py-0.5 rounded-full border border-red-500/20 font-mono font-bold">
                USB COM 1.0 & OEMINFO Rebrand
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'دعم هواتف Pura 70, Mate 60, Nova 12 (معالجات Kirin 9010/9000s): حذف Huawei ID، تحويل المنطقة OEMINFO إلى النسخة العالمية، وتخطي FRP'
                : 'Huawei ID cloud wipe, OEMINFO region rebrand to Global C432, and Kirin USB COM 1.0 TestPoint flasher'}
            </p>
          </div>
        </div>

        <button
          onClick={handleProbeHuawei}
          disabled={isExecuting}
          className="bg-slate-950 hover:bg-slate-800 text-red-300 border border-slate-800 hover:border-red-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isAr ? 'قراءة Huawei COM 1.0' : 'Probe Huawei COM'}</span>
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
            <span className="text-xs font-bold text-red-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'بيانات معالج كيرين ونظام هارموني' : 'Kirin & HarmonyOS Telemetry'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Model & Chipset:</span>
                <span className="font-bold text-white">{huaweiDevice.model}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">OS & Framework:</span>
                <span className="font-bold text-red-300">{huaweiDevice.osVersion}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Huawei ID Status:</span>
                <span className={`font-bold ${huaweiDevice.huaweiIdStatus === 'CLEAN_UNLOCKED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {huaweiDevice.huaweiIdStatus}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">OEMINFO Region:</span>
                <span className="font-bold text-cyan-300">{huaweiDevice.oemInfoRegion}</span>
              </div>
            </div>
          </div>

          {/* 1-Click Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'عمليات هواوي الفورية' : 'Huawei 1-Click Operations'}</span>
            </span>

            <div className="space-y-2.5">
              <button
                onClick={handleRemoveHuaweiId}
                disabled={isExecuting}
                className="w-full p-3.5 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl shadow-lg shadow-red-600/20 text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="font-black text-xs">{isAr ? 'حذف حساب هواوي آي دي (Remove Huawei ID)' : '1-Click Remove Huawei ID'}</div>
                  <div className="text-[10px] text-rose-100">{isAr ? 'تصفير الحساب السحابي عبر USB COM 1.0 بدون تفليش' : 'Wipes persistent cloud token in oeminfo'}</div>
                </div>
                <Unlock className="w-5 h-5 text-white" />
              </button>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'تحويل المنطقة (OEMINFO Rebrand):' : 'Convert OEMINFO Region:'}</span>
                </label>
                <div className="flex gap-2">
                  <select 
                    value={targetRegion}
                    onChange={(e) => setTargetRegion(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 outline-none font-mono"
                  >
                    <option value="C432 (Europe Global / hw-eu)">C432 (Europe Global / hw-eu)</option>
                    <option value="C636 (Asia Pacific / hw-meaf)">C636 (Asia Pacific / hw-meaf)</option>
                    <option value="C185 (Middle East & Africa / hw-meaf)">C185 (Middle East & Africa / hw-meaf)</option>
                    <option value="C10 (Russia & CIS / hw-ru)">C10 (Russia & CIS / hw-ru)</option>
                  </select>
                  <button
                    onClick={handleRebrandRegion}
                    disabled={isExecuting}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isAr ? 'تحويل' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Console */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[420px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-rose-400" />
              <span className="font-bold text-slate-200">Huawei Kirin USB COM Live Stream</span>
            </div>
            <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              COM 1.0 (PID:3609)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('HUAWEI') || l.includes('OEMINFO')
                    ? 'text-rose-300'
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
