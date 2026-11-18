import React, { useState } from 'react';
import { 
  Layers, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Sliders, 
  HardDrive, 
  Scissors, 
  Trash2, 
  Plus, 
  FileCode,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  fastbootdLogicalEngine, 
  LogicalPartitionInfo, 
  DEFAULT_LOGICAL_PARTITIONS 
} from '../services/FastbootdLogicalEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const FastbootdLogicalStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [partitions, setPartitions] = useState<LogicalPartitionInfo[]>(DEFAULT_LOGICAL_PARTITIONS);
  const [selectedPartition, setSelectedPartition] = useState<LogicalPartitionInfo>(DEFAULT_LOGICAL_PARTITIONS[0]);
  const [gsiImageName, setGsiImageName] = useState<string>('system-arm64-ab-vanilla.img');
  const [activeSlot, setActiveSlot] = useState<'a' | 'b'>('a');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isFastbootdActive, setIsFastbootdActive] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix FastbootD & Dynamic Partitions (Super.img) Studio v2026.9 initialized.',
    `Connected Device: ${device.brand} ${device.marketName} (${device.model}) | Bootloader: ${device.bootloaderStatus}`,
    'FastbootD Userspace mode allows direct modification and resizing of dynamic logical sub-partitions.'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[FASTBOOTD_STUDIO] ${m}`);
  };

  const handleRebootToFastbootD = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Transitioning target device to FastbootD (Userspace Recovery)...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await fastbootdLogicalEngine.rebootToFastbootD(addLog);
    if (res.success) {
      setIsFastbootdActive(true);
      setCurrentDevice({
        ...device,
        mode: 'FASTBOOTD'
      });

      const msg = isAr 
        ? '✅ تم الدخول إلى وضع FastbootD (Userspace) وفتح حماية قطاع Super.img بنجاح!'
        : '✅ Entered FastbootD mode! Super partition unlocked.';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleFlashGsi = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Initiating 1-Click GSI Flash for ${gsiImageName} on slot _${activeSlot}...`);
    realUsbService.playContinuityBeep(120, 2400);

    const res = await fastbootdLogicalEngine.flashGsiSystemImage(gsiImageName, activeSlot, addLog);
    if (res.success) {
      const msg = isAr 
        ? `✅ تم بنجاح تفليش نظام GSI (${gsiImageName}) وضبط أحجام البارتشنات وتعطيل AVB!`
        : `✅ GSI (${gsiImageName}) flashed and dynamic partitions re-aligned successfully!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  const handleResize = async (newSizeMb: number) => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    const res = await fastbootdLogicalEngine.resizeLogicalPartition(selectedPartition.name, newSizeMb, addLog);
    if (res.success) {
      const updated = partitions.map((p) => {
        if (p.name === selectedPartition.name) {
          return { ...p, sizeMb: newSizeMb, sizeBytes: newSizeMb * 1024 * 1024 };
        }
        return p;
      });
      setPartitions(updated);
      setSelectedPartition(prev => ({ ...prev, sizeMb: newSizeMb, sizeBytes: newSizeMb * 1024 * 1024 }));

      const msg = isAr 
        ? `✅ تم تعديل حجم ${selectedPartition.name} إلى ${newSizeMb} MB بنجاح!`
        : `✅ Resized ${selectedPartition.name} to ${newSizeMb} MB!`;
      setSuccessBanner(msg);
    }

    setIsExecuting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-cyan-600 via-teal-600 to-emerald-600 rounded-xl shadow-lg shadow-teal-500/20">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
                {isAr ? 'استوديو البارتشنات الديناميكية و FastbootD (Super.img Studio)' : 'FastbootD & Dynamic Partitions (Super.img) Studio'}
              </h1>
              <span className="bg-teal-500/10 text-teal-400 text-xs px-2.5 py-0.5 rounded-full border border-teal-500/20 font-mono font-bold">
                Android 10-15 Dynamic
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'إدارة وتقسيم قطاع Super.img وتفليش رومات GSI وتعديل أحجام system و vendor و product بوضع FastbootD'
                : 'Directly manage, resize, and flash logical sub-partitions inside Super.img and install GSI ROMs in FastbootD'}
            </p>
          </div>
        </div>

        {/* State Badge & Reboot Action */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono text-xs ${
            isFastbootdActive 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isFastbootdActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>FastbootD: {isFastbootdActive ? 'ONLINE' : 'STANDBY'}</span>
          </div>

          <button
            onClick={handleRebootToFastbootD}
            disabled={isExecuting}
            className="bg-slate-950 hover:bg-slate-800 text-teal-300 border border-slate-800 hover:border-teal-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'الدخول لوضع FastbootD' : 'Reboot to FastbootD'}</span>
          </button>
        </div>
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
        {/* Left: Dynamic Partition Matrix */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-teal-400 font-mono text-xs font-bold uppercase">
              <Layers className="w-4 h-4" />
              <span>{isAr ? 'البارتشنات المنطقية داخل قطاع Super' : 'Logical Partitions in Super.img'}</span>
            </div>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setActiveSlot('a')}
                className={`px-3 py-1 rounded-lg font-mono font-bold cursor-pointer transition-all ${
                  activeSlot === 'a' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Slot _A (Active)
              </button>
              <button
                onClick={() => setActiveSlot('b')}
                className={`px-3 py-1 rounded-lg font-mono font-bold cursor-pointer transition-all ${
                  activeSlot === 'b' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Slot _B
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {partitions.map((p) => {
              const isSelected = selectedPartition.name === p.name;
              return (
                <div
                  key={p.name}
                  onClick={() => setSelectedPartition(p)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-500/15 border-teal-500/50 text-teal-200 shadow-md shadow-teal-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-white flex items-center gap-1.5 font-mono">
                      <HardDrive className="w-4 h-4 text-teal-400" />
                      {p.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.sizeMb} MB</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">{p.groupName}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      p.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* GSI Flasher Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? 'تفليش روم GSI عام بنقرة واحدة (1-Click GSI Flasher)' : '1-Click Generic System Image (GSI) Flasher'}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={gsiImageName}
                onChange={(e) => setGsiImageName(e.target.value)}
                className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-cyan-300"
              />
              <button
                onClick={handleFlashGsi}
                disabled={isExecuting}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black py-2.5 rounded-lg text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isAr ? 'تفليش GSI فوراً' : 'Flash GSI System'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Partition Detail & Terminal */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <span className="text-xs font-bold text-teal-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4" />
              <span>{isAr ? 'تعديل سعة البارتشن المنطقي' : 'Resize Logical Partition'}</span>
            </span>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-300 font-mono">
                <span>Selected: <strong className="text-white">{selectedPartition.name}</strong></span>
                <span className="text-teal-400 font-bold">{selectedPartition.sizeMb} MB</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[1024, 2048, 3072, 4096, 5120, 6144].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleResize(size)}
                    disabled={isExecuting}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 rounded-lg font-mono text-xs text-slate-300 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {size / 1024} GB ({size}M)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Console */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] h-48 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-bold text-slate-200">FastbootD Stream</span>
              </div>
              <span className="text-[9px] text-teal-400 bg-teal-500/10 px-1.5 py-0.2 rounded border border-teal-500/20">
                Super Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 text-slate-400">
              {logs.slice(-5).map((l, idx) => (
                <div key={idx} className={l.includes('✅') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
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
