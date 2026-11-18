import React, { useState } from 'react';
import { 
  Smartphone, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Layers, 
  FileCode, 
  ShieldCheck, 
  Download, 
  Cpu,
  FolderArchive,
  Sparkles
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  sonyS1ProtocolEngine, 
  SonyDeviceInfo, 
  SinFileItem, 
  SAMPLE_SONY_DEVICES, 
  SAMPLE_SIN_FILES 
} from '../services/SonyS1ProtocolEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const SonyS1Studio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [selectedDevice, setSelectedDevice] = useState<SonyDeviceInfo>(SAMPLE_SONY_DEVICES[0]);
  const [sinFiles, setSinFiles] = useState<SinFileItem[]>(SAMPLE_SIN_FILES);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Sony Xperia S1 Boot Flasher & SIN Extractor Suite v2026.9 initialized.',
    'S1 Protocol & TA Trim Area Security Controller Online.',
    'Connect Sony Xperia in Flash Mode (Hold Volume Down + Plug USB -> Green LED).'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[SONY_STUDIO] ${m}`);
  };

  const handleProbeS1 = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Connecting to Sony S1 USB endpoint...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await sonyS1ProtocolEngine.handshakeS1FlashMode(addLog);
    if (res.success) {
      setSelectedDevice(res.device);
      setCurrentDevice({
        ...device,
        brand: 'Sony',
        model: res.device.model,
        mode: 'ADB_ONLINE'
      });

      const msg = isAr 
        ? `✅ تم التعرف على هاتف ${res.device.model} (${res.device.s1RootType}) بنجاح!`
        : `✅ Sony ${res.device.model} connected via S1 Protocol!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleUnpackSin = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Unpacking Sony .SIN archive into raw partition images...');
    realUsbService.playContinuityBeep(120, 2300);

    const res = await sonyS1ProtocolEngine.unpackSinContainer('Xperia1VI_Customized_NOBA.sin', addLog);
    if (res.success) {
      setSinFiles(res.files);
      const msg = isAr 
        ? `✅ تم تفكيك واستخراج ${res.files.length} بارتشن من ملفات .SIN بنجاح!`
        : `✅ Unpacked ${res.files.length} partitions from .SIN container!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 3000);
    }

    setIsExecuting(false);
  };

  const handleEraseFrp = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Erasing Sony FRP token in TA Trim Area...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await sonyS1ProtocolEngine.eraseSonyFrp(addLog);
    if (res.success) {
      const msg = isAr 
        ? '✅ تم بنجاح تصفير قفل حساب جوجل (FRP) لهاتف سوني إكسبيريا بوضع الفلاش مود S1!'
        : '✅ Sony Xperia FRP wiped successfully!';
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
          <div className="p-3 bg-gradient-to-tr from-cyan-600 via-blue-600 to-teal-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-blue-300 to-teal-300 bg-clip-text text-transparent">
                {isAr ? 'استوديو سوني إكسبيريا وبروتوكول S1 (Sony Xperia S1 & SIN Flasher)' : 'Sony Xperia S1 Flasher & SIN Studio'}
              </h1>
              <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-mono font-bold">
                S1 Boot & TA DRM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'تفليش هواتف Sony Xperia (1, 5, 10, Pro): تفكيك ملفات .SIN، حماية مفاتيح DRM TA، وتصفير قفل FRP'
                : 'Direct S1 Boot protocol flasher, SIN v3/v4 container extractor, and TA FRP wipe'}
            </p>
          </div>
        </div>

        <button
          onClick={handleProbeS1}
          disabled={isExecuting}
          className="bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isAr ? 'قراءة S1' : 'Probe S1'}</span>
        </button>
      </div>

      {/* Success Banner */}
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
            <span className="text-xs font-bold text-cyan-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'بيانات هاتف سوني إكسبيريا' : 'Sony Xperia S1 Telemetry'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Model & Customization:</span>
                <span className="font-bold text-white">{selectedDevice.model} ({selectedDevice.customizationNumber})</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Firmware Version:</span>
                <span className="font-bold text-cyan-300">{selectedDevice.swVersion}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">S1 Root Engine:</span>
                <span className="font-bold text-white">{selectedDevice.s1RootType}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">TA DRM Status:</span>
                <span className="font-bold text-emerald-400">{selectedDevice.taStatus}</span>
              </div>
            </div>
          </div>

          {/* 1-Click Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-blue-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'عمليات سوني الفورية' : 'Sony 1-Click Operations'}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleUnpackSin}
                disabled={isExecuting}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <FolderArchive className="w-4 h-4" />
                  <span>{isAr ? 'تفكيك .SIN' : 'Unpack .SIN'}</span>
                </div>
                <span className="text-[10px] text-slate-400">{isAr ? 'استخراج بارتشنات الفلاشة' : 'Extracts raw partitions'}</span>
              </button>

              <button
                onClick={handleEraseFrp}
                disabled={isExecuting}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAr ? 'حذف قفل FRP' : 'TA FRP Erase'}</span>
                </div>
                <span className="text-[10px] text-slate-400">{isAr ? 'تصفير قطاع TA 2212' : 'Resets S1 FRP security token'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Unpacked SIN Partitions & Console */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <span className="text-xs font-bold text-slate-400 font-mono uppercase block mb-2">
              {isAr ? 'البارتشنات المفكوكة من فلاشة .SIN:' : 'Extracted SIN Partitions:'}
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {sinFiles.map((f) => (
                <div key={f.name} className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{f.name}</span>
                  </div>
                  <span className="text-cyan-300 text-[11px]">{f.sizeMb} MB</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[280px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-200">Sony S1 Protocol Stream</span>
              </div>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                S1 Root v10
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 p-2 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
              {logs.map((l, idx) => (
                <div
                  key={idx}
                  className={
                    l.includes('✅') || l.includes('SUCCESS')
                      ? 'text-emerald-400 font-bold'
                      : l.includes('SONY') || l.includes('SIN')
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
    </div>
  );
};
