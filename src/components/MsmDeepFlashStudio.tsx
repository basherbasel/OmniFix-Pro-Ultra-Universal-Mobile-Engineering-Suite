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
  Sliders, 
  Cpu, 
  Unlock,
  KeyRound
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  msmDeepFlashEngine, 
  MsmDeviceInfo, 
  SAMPLE_MSM_DEVICES 
} from '../services/MsmDeepFlashEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const MsmDeepFlashStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [selectedDevice, setSelectedDevice] = useState<MsmDeviceInfo>(SAMPLE_MSM_DEVICES[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix OnePlus / Realme / Oppo MSM Deep Flash Tool v2026.9 initialized.',
    'Project ID & Deep Testing Authorization Bridge Online.',
    'Connect OnePlus/Realme/Oppo in EDL 9008 (Hold Vol Up + Vol Down + Plug USB).'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[MSM_STUDIO] ${m}`);
  };

  const handleProbeMsm = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Connecting to MSM EDL 9008 protocol...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await msmDeepFlashEngine.handshakeMsmEDL(addLog);
    if (res.success) {
      setSelectedDevice(res.device);
      setCurrentDevice({
        ...device,
        brand: res.device.brand,
        model: res.device.marketingName,
        mode: 'EDL_9008'
      });

      const msg = isAr 
        ? `✅ تم التعرف على هاتف ${res.device.marketingName} (Project #${res.device.projectNo}) بنجاح!`
        : `✅ Connected: ${res.device.marketingName} (Project #${res.device.projectNo})!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleDeepTesting = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Injecting Deep Testing Authorization token...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await msmDeepFlashEngine.enableDeepTesting(addLog);
    if (res.success) {
      setSelectedDevice(prev => ({ ...prev, deepTestingStatus: 'DEEP_TESTING_APPROVED' }));
      const msg = isAr 
        ? '✅ تم بنجاح تفعيل فحص العمق (Deep Testing) وتمكين تفليش الفاست بوت!'
        : '✅ Deep Testing Unlocked successfully!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  const handlePatchOrange = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Patching Orange State bootloader warning banner...');
    realUsbService.playContinuityBeep(120, 2300);

    const res = await msmDeepFlashEngine.patchOrangeState(addLog);
    if (res.success) {
      setSelectedDevice(prev => ({ ...prev, orangeState: 'PATCHED_CLEAN' }));
      const msg = isAr 
        ? '✅ تم بنجاح إزالة شاشة التحذير الصفراء (Orange State Warning) نهائياً!'
        : '✅ Orange State warning removed cleanly!';
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
          <div className="p-3 bg-gradient-to-tr from-amber-600 via-orange-600 to-red-600 rounded-xl shadow-lg shadow-orange-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-red-300 bg-clip-text text-transparent">
                {isAr ? 'استوديو ون بلس وريلمي MSM (OnePlus & Realme MSM Deep Flash Studio)' : 'OnePlus & Realme MSM Deep Flash Suite'}
              </h1>
              <span className="bg-orange-500/10 text-orange-400 text-xs px-2.5 py-0.5 rounded-full border border-orange-500/20 font-mono font-bold">
                Project ID & Deep Testing
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'تخطي حماية Deep Testing لفتح البوتلودر، تبديل Project ID للتحويل بين الروم الصيني والعالمي، وإزالة شاشة Orange State'
                : 'Project ID modifier, Deep Testing token injector, and Orange State bootloader warning remover'}
            </p>
          </div>
        </div>

        <button
          onClick={handleProbeMsm}
          disabled={isExecuting}
          className="bg-slate-950 hover:bg-slate-800 text-orange-300 border border-slate-800 hover:border-orange-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isAr ? 'قراءة MSM EDL' : 'Probe MSM EDL'}</span>
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
        {/* Left: Telemetry & Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-orange-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'بيانات هاتف ون بلس / ريلمي' : 'OnePlus/Realme Telemetry'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Model & Project ID:</span>
                <span className="font-bold text-white">{selectedDevice.marketingName} (#{selectedDevice.projectNo})</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Region & Subsystem:</span>
                <span className="font-bold text-orange-300">{selectedDevice.regionCode}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">UFS Storage Memory:</span>
                <span className="font-bold text-white">{selectedDevice.ufsVendor}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Deep Testing Status:</span>
                <span className={`font-bold ${selectedDevice.deepTestingStatus === 'DEEP_TESTING_APPROVED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedDevice.deepTestingStatus}
                </span>
              </div>
            </div>
          </div>

          {/* 1-Click Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'عمليات MSM الفورية' : 'MSM 1-Click Operations'}</span>
            </span>

            <div className="space-y-2.5">
              <button
                onClick={handleDeepTesting}
                disabled={isExecuting}
                className="w-full p-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white rounded-xl shadow-lg shadow-orange-600/20 text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="font-black text-xs">{isAr ? 'تفعيل Deep Testing لفتح البوتلودر' : '1-Click Deep Testing Unlock'}</div>
                  <div className="text-[10px] text-orange-200">{isAr ? 'كتابة توكن التحقق في opporeserve2' : 'Injects official unlock token into opporeserve2'}</div>
                </div>
                <KeyRound className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={handlePatchOrange}
                disabled={isExecuting}
                className="w-full p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="text-emerald-400 font-bold text-xs">{isAr ? 'إزالة شاشة التحذير الصفراء (Patch Orange State)' : 'Patch Orange State Warning'}</div>
                  <div className="text-[10px] text-slate-400">{isAr ? 'تعديل كود ABL لمنع تأخير الـ 5 ثواني عند الإقلاع' : 'NOPs unlocked bootloader warning in ABL'}</div>
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
              <Terminal className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-slate-200">MSM Deep Flash Live Stream</span>
            </div>
            <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Sahara v3
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('MSM') || l.includes('DEEP')
                    ? 'text-orange-300'
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
