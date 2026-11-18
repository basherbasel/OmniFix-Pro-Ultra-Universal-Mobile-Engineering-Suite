import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Cpu, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Radio, 
  Briefcase,
  AlertTriangle,
  Flame,
  Globe,
  Smartphone
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { knoxMdmBypassEngine, ENTERPRISE_MDM_PACKAGES } from '../services/KnoxMdmBypassEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const KnoxMdmBypassStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [activeMode, setActiveMode] = useState<'KNOX_GUARD_ODIN' | 'ENTERPRISE_MDM_ADB'>('KNOX_GUARD_ODIN');
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [localKgStatus, setLocalKgStatus] = useState<string>(device.kgStatus || 'CHECKING');

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Samsung Knox Guard & Enterprise MDM Neutralizer v2026.9 initialized.',
    `Target: ${device.brand} ${device.marketName} (${device.model}) | Mode: ${device.mode}`,
    `Knox Bit: ${device.knoxStatus || '0x0'} | KG State: ${device.kgStatus || 'CHECKING'}`
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[KNOX_MDM] ${m}`);
  };

  const handleExecute = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Initiating operation: ${activeMode} for ${device.brand} ${device.marketName}...`);
    realUsbService.playContinuityBeep(120, 2200);

    if (activeMode === 'KNOX_GUARD_ODIN') {
      const res = await knoxMdmBypassEngine.bypassKnoxGuardOdin(device, addLog);
      if (res.success) {
        setLocalKgStatus('Completed');
        setCurrentDevice({
          ...device,
          kgStatus: 'Completed'
        });

        const msg = isAr 
          ? '✅ تم بنجاح تعطيل Knox Guard وتجاوز قفل الـ KG Locked في وضع Download Mode!'
          : '✅ Samsung Knox Guard successfully disengaged and KG state forced to COMPLETED!';
        setSuccessBanner(msg);
        addLog(msg);
        realUsbService.playContinuityBeep(300, 3200);
      }
    } else if (activeMode === 'ENTERPRISE_MDM_ADB') {
      const res = await knoxMdmBypassEngine.freezeEnterpriseMdmPackages(addLog);
      if (res.success) {
        const msg = isAr 
          ? `✅ تم بنجاح تجميد ${res.frozenPackagesCount} حزمة MDM وتقسيط (PayJoy/Rent-A-Center) وتفعيل جدار الحماية المحلي!`
          : `✅ Successfully neutralized ${res.frozenPackagesCount} Enterprise & PayJoy lease packages!`;
        setSuccessBanner(msg);
        addLog(msg);
        realUsbService.playContinuityBeep(300, 3400);
      }
    }

    setIsExecuting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/20">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
                {isAr ? 'أداة تخطي Knox Guard و MDM الشركات والتقسيط' : 'Samsung Knox Guard & Enterprise MDM Suite'}
              </h1>
              <span className="bg-purple-500/10 text-purple-400 text-xs px-2.5 py-0.5 rounded-full border border-purple-500/20 font-mono font-bold">
                Knox Vault Shield 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'تعطيل قفل Knox Guard (KG Locked)، إزالة تطبيقات تقسيط الأجهزة (PayJoy / Rent-A-Center) وتجميد خدمات MDM'
                : 'Disengages Knox Guard (KG Locked: Prenormal/Checking), freezes PayJoy & Rent-A-Center lease MDM agents'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="bg-slate-950 text-purple-300 px-3 py-1.5 rounded-xl border border-slate-800">
            Knox Bit: {device.knoxStatus || '0x0'}
          </span>
          <span className={`px-3 py-1.5 rounded-xl border font-bold ${
            localKgStatus === 'COMPLETED' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            KG State: {localKgStatus}
          </span>
        </div>
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
        {/* Left Options */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-purple-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'اختر نوع الحماية المراد تجاوزها' : 'Select Protection to Disengage'}</span>
            </span>

            <div className="space-y-2.5 text-xs">
              <label
                onClick={() => setActiveMode('KNOX_GUARD_ODIN')}
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  activeMode === 'KNOX_GUARD_ODIN'
                    ? 'bg-purple-500/15 border-purple-500/50 text-purple-200 shadow-md shadow-purple-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-extrabold text-xs">
                  <input
                    type="radio"
                    name="knoxMode"
                    checked={activeMode === 'KNOX_GUARD_ODIN'}
                    onChange={() => {}}
                    className="accent-purple-500"
                  />
                  <span>{isAr ? 'سامسونج Knox Guard (وضع Download Mode)' : 'Samsung Knox Guard (Odin Download Mode)'}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 pl-5">
                  {isAr 
                    ? 'تعديل قطاع الـ Param وكسر إشارة KG State من Prenormal/Checking إلى Completed.'
                    : 'Patches param sector and forces KG State from Checking/Locked to Completed.'}
                </p>
              </label>

              <label
                onClick={() => setActiveMode('ENTERPRISE_MDM_ADB')}
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  activeMode === 'ENTERPRISE_MDM_ADB'
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-200 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-extrabold text-xs">
                  <input
                    type="radio"
                    name="knoxMode"
                    checked={activeMode === 'ENTERPRISE_MDM_ADB'}
                    onChange={() => {}}
                    className="accent-indigo-500"
                  />
                  <span>{isAr ? 'تجميد تطبيقات التقسيط والشركات (PayJoy / MDM Freezer)' : 'Enterprise MDM & PayJoy Freezer (ADB)'}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 pl-5">
                  {isAr 
                    ? 'تجميد حزم KLC و KnoxEnrollment و PayJoy مع توجيه سيرفرات التحقق محلياً لمنع القفل مجدداً.'
                    : 'Freezes 9 MDM packages and points Knox cloud auth servers to 127.0.0.1.'}
                </p>
              </label>
            </div>

            {/* Packages List Preview */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[10px] font-mono text-slate-400">
              <span className="text-purple-400 font-bold block">{isAr ? 'الحزم المستهدفة للتعطيل:' : 'Targeted Enterprise Packages:'}</span>
              <div className="max-h-24 overflow-y-auto space-y-0.5 text-slate-400">
                {ENTERPRISE_MDM_PACKAGES.map((p) => (
                  <div key={p}>• {p}</div>
                ))}
              </div>
            </div>

            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black py-3.5 rounded-xl text-xs shadow-xl shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>
                {isExecuting 
                  ? (isAr ? 'جاري كسر القفل...' : 'Disengaging...') 
                  : (isAr ? 'تعطيل الحماية وتجميد MDM بنقرة واحدة' : '1-CLICK DISENGAGE MDM / KG')}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Console */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[420px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-slate-200">{isAr ? 'سجل عمليات Knox & MDM المباشر' : 'Live Knox & MDM Execution Log'}</span>
            </div>
            <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              KG Engine Online
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('COMPLETED') || l.includes('Successfully')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('Disabling') || l.includes('Transferring') || l.includes('Disengaging')
                    ? 'text-cyan-300'
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
