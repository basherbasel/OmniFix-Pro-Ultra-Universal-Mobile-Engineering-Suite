import React, { useState } from 'react';
import { 
  Smartphone, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  FolderArchive, 
  FileCode, 
  Layers, 
  Download, 
  ShieldCheck, 
  HardDrive,
  Cpu
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  lgLafProtocolEngine, 
  LgDeviceInfo, 
  KdzPartitionItem, 
  SAMPLE_LG_DEVICES, 
  SAMPLE_KDZ_PARTITIONS 
} from '../services/LgLafProtocolEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const LgLafStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [lgDevice, setLgDevice] = useState<LgDeviceInfo>(SAMPLE_LG_DEVICES[0]);
  const [partitions, setPartitions] = useState<KdzPartitionItem[]>(SAMPLE_KDZ_PARTITIONS);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix LG LAF (LG Advanced Flasher) & KDZ Slicer Suite v2026.9 initialized.',
    'LAF Protocol Handshake Engine Ready.',
    'Connect LG device in Download Mode (Power Off -> Hold Vol Up -> Plug USB).'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[LG_STUDIO] ${m}`);
  };

  const handleProbeLaf = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Connecting to LG Download Mode LAF endpoint...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await lgLafProtocolEngine.handshakeLafDownloadMode(addLog);
    if (res.success) {
      setLgDevice(res.device);
      setCurrentDevice({
        ...device,
        brand: 'LG',
        model: res.device.model,
        mode: 'ADB_ONLINE'
      });

      const msg = isAr 
        ? `✅ تم ربط هاتف ${res.device.model} (${res.device.suffix}) بنجاح عبر بروتوكول LAF!`
        : `✅ LG ${res.device.model} connected via LAF!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleUnpackKdz = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Unpacking KDZ & DZ encrypted container...');
    realUsbService.playContinuityBeep(120, 2300);

    const res = await lgLafProtocolEngine.unpackKdzFirmware(`${lgDevice.suffix}_V30b_00.kdz`, addLog);
    if (res.success) {
      setPartitions(res.partitions);
      const msg = isAr 
        ? `✅ تم استخراج ${res.partitions.length} بارتشن من فلاشة KDZ بنجاح!`
        : `✅ Unpacked ${res.partitions.length} partitions from KDZ!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 3000);
    }

    setIsExecuting(false);
  };

  const handleSwitchToFastboot = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Converting LG Download Mode to Android Fastboot Mode...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await lgLafProtocolEngine.switchLafToFastboot(addLog);
    if (res.success) {
      setCurrentDevice({
        ...device,
        brand: 'LG',
        model: lgDevice.model,
        mode: 'FASTBOOT'
      });

      const msg = isAr 
        ? '✅ تم تحويل هاتف LG من Download Mode إلى Fastboot بنجاح!'
        : '✅ Switched LG to Android Fastboot!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  const handleEraseFrp = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Erasing FRP partition via LAF protocol...');
    realUsbService.playContinuityBeep(120, 2300);

    const res = await lgLafProtocolEngine.eraseLgFrp(addLog);
    if (res.success) {
      const msg = isAr 
        ? '✅ تم بنجاح حذف قفل حساب جوجل (FRP) لهاتف LG بوضع الداونلود!'
        : '✅ LG FRP Lock erased successfully!';
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
          <div className="p-3 bg-gradient-to-tr from-pink-600 via-rose-600 to-red-600 rounded-xl shadow-lg shadow-rose-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-pink-400 via-rose-300 to-red-300 bg-clip-text text-transparent">
                {isAr ? 'استوديو هواتف إل جي وتفليش LAF (LG LAF & KDZ Studio)' : 'LG LAF & KDZ Firmware Studio'}
              </h1>
              <span className="bg-rose-500/10 text-rose-400 text-xs px-2.5 py-0.5 rounded-full border border-rose-500/20 font-mono font-bold">
                LAF Protocol & KDZ Slicer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'تفليش هواتف LG (V60, Wing, Velvet, G8X): تفكيك ملفات KDZ، التحويل لـ Fastboot، وتصفير قفل FRP'
                : 'Direct LAF partition write, KDZ & DZ extraction, LAF-to-Fastboot switch, and Download Mode FRP wipe'}
            </p>
          </div>
        </div>

        <button
          onClick={handleProbeLaf}
          disabled={isExecuting}
          className="bg-slate-950 hover:bg-slate-800 text-rose-300 border border-slate-800 hover:border-rose-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isAr ? 'قراءة LAF' : 'Probe LAF'}</span>
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
            <span className="text-xs font-bold text-rose-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'بيانات هاتف LG المتصل بوضع LAF' : 'Connected LG Telemetry'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Model & Suffix:</span>
                <span className="font-bold text-white">{lgDevice.model} ({lgDevice.suffix})</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SW Version & ARB:</span>
                <span className="font-bold text-rose-300">{lgDevice.swVersion} (ARB: {lgDevice.antiRollback})</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SoC & Flasher Core:</span>
                <span className="font-bold text-white">{lgDevice.chipset}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">LAF Protocol Core:</span>
                <span className="font-bold text-emerald-400">{lgDevice.lafVersion}</span>
              </div>
            </div>
          </div>

          {/* 1-Click Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-pink-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'عمليات LG الفورية' : 'LG 1-Click Operations'}</span>
            </span>

            <div className="space-y-2.5">
              <button
                onClick={handleSwitchToFastboot}
                disabled={isExecuting}
                className="w-full p-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 hover:from-pink-500 hover:to-red-500 text-white rounded-xl shadow-lg shadow-rose-600/20 text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="font-black text-xs">{isAr ? 'التحويل من Download Mode إلى Fastboot' : 'LAF to Fastboot Switch'}</div>
                  <div className="text-[10px] text-rose-200">{isAr ? 'تعطيل لودر LAF لتمكين الفاست بوت' : 'Zeroes LAF magic to boot Fastboot'}</div>
                </div>
                <Zap className="w-5 h-5 text-white" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleUnpackKdz}
                  disabled={isExecuting}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-pink-400 font-bold text-xs">
                    <FolderArchive className="w-4 h-4" />
                    <span>{isAr ? 'تفكيك KDZ' : 'Unpack KDZ'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{isAr ? 'استخراج DZ و Raw Images' : 'Extracts all partition images'}</span>
                </button>

                <button
                  onClick={handleEraseFrp}
                  disabled={isExecuting}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isAr ? 'حذف قفل FRP' : 'LAF FRP Erase'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{isAr ? 'تصفير قطاع FRP بوضع الداونلود' : 'Wipes persistent FRP sector'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Unpacked Partitions & Console */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <span className="text-xs font-bold text-slate-400 font-mono uppercase block mb-2">
              {isAr ? 'البارتشنات المفكوكة من فلاشة KDZ:' : 'Extracted KDZ Partitions:'}
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {partitions.map((p) => (
                <div key={p.name} className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <FileCode className="w-3.5 h-3.5 text-rose-400" />
                    <span>{p.name}</span>
                  </div>
                  <span className="text-rose-300 text-[11px]">{p.sizeMb} MB</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[280px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-slate-200">LG LAF Live Stream</span>
              </div>
              <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                LAF 2.4
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 p-2 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
              {logs.map((l, idx) => (
                <div
                  key={idx}
                  className={
                    l.includes('✅') || l.includes('SUCCESS')
                      ? 'text-emerald-400 font-bold'
                      : l.includes('LAF') || l.includes('KDZ')
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
    </div>
  );
};
