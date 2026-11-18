import React, { useState } from 'react';
import { 
  HardDrive, 
  Download, 
  Upload, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Layers, 
  Cpu, 
  Play, 
  RotateCcw, 
  Save, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  FileCode,
  Zap
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  samsungPitEngine, 
  PitPartitionEntry, 
  DEFAULT_SAMSUNG_PIT_ENTRIES 
} from '../services/SamsungPitEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const SamsungPitEditorStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';

  const [partitions, setPartitions] = useState<PitPartitionEntry[]>(DEFAULT_SAMSUNG_PIT_ENTRIES);
  const [selectedPartition, setSelectedPartition] = useState<PitPartitionEntry>(DEFAULT_SAMSUNG_PIT_ENTRIES[0]);
  const [isReading, setIsReading] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Samsung PIT (Partition Information Table) Matrix Editor v2026.9 initialized.',
    `Connected Target: ${device.brand} ${device.marketName} (${device.model}) | Mode: ${device.mode}`,
    'Ready to read hardware partition table from Odin Download Mode or edit custom offsets.'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[PIT_STUDIO] ${m}`);
  };

  const handleReadLivePit = async () => {
    if (isReading || isFlashing) return;
    setIsReading(true);
    setSuccessBanner(null);

    addLog('Querying live PIT from connected Samsung terminal...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await samsungPitEngine.dumpLiveDevicePit(device, addLog);
    if (res.success && res.entries.length > 0) {
      setPartitions(res.entries);
      setSelectedPartition(res.entries[0]);
      const msg = isAr 
        ? `✅ تم سحب وقراءة جدول التقسيمات PIT (${res.entries.length} بارتشن) بنجاح من الهاتف!`
        : `✅ Read live PIT (${res.entries.length} partitions) successfully from device!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsReading(false);
  };

  const handleFlashPit = async () => {
    if (isReading || isFlashing) return;
    setIsFlashing(true);
    setSuccessBanner(null);

    addLog('Compiling modified PIT binary and sending Re-Partition command...');
    realUsbService.playContinuityBeep(120, 2400);

    const pitBytes = samsungPitEngine.exportPitBinary(partitions);
    const res = await samsungPitEngine.flashPitToDevice(pitBytes, addLog);

    if (res.success) {
      const msg = isAr 
        ? '✅ تم بنجاح تفليش ملف الـ PIT وإعادة بناء جدول تقسيمات الذاكرة (Re-Partition) للهاتف!'
        : '✅ Modified PIT flashed and storage re-partitioned successfully!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsFlashing(false);
  };

  const handleExportPitFile = () => {
    const pitBytes = samsungPitEngine.exportPitBinary(partitions);
    const blob = new Blob([pitBytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${device.model || 'SAMSUNG'}_CUSTOM.pit`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`Exported custom PIT file: ${device.model || 'SAMSUNG'}_CUSTOM.pit`);
    realUsbService.playContinuityBeep(150, 2600);
  };

  const handleSizeChange = (sizeMb: number) => {
    const updated = partitions.map((p) => {
      if (p.id === selectedPartition.id) {
        const blockCount = Math.round((sizeMb * 1024 * 1024) / 512);
        return { ...p, sizeMb, blockCount };
      }
      return p;
    });
    setPartitions(updated);
    setSelectedPartition(prev => ({ ...prev, sizeMb, blockCount: Math.round((sizeMb * 1024 * 1024) / 512) }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-blue-600 via-cyan-600 to-teal-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <HardDrive className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                {isAr ? 'محرر ومصلح جدول التقسيمات PIT (Samsung PIT Matrix Editor)' : 'Samsung PIT Matrix & Re-Partition Editor'}
              </h1>
              <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-mono font-bold">
                Loke 0x12349876
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'سحب وتعديل وإعادة بناء جدول الـ PIT لذواكر UFS و eMMC، وتعديل أحجام البارتشنات وتفليش Re-Partition'
                : 'Dump, edit, export & flash Samsung Partition Information Table (PIT) binaries with safe Re-Partition'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleReadLivePit}
            disabled={isReading || isFlashing}
            className="bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isReading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isAr ? 'سحب الـ PIT من الجهاز' : 'Dump Live PIT'}</span>
          </button>

          <button
            onClick={handleExportPitFile}
            className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'تصدير ملف .pit' : 'Export .pit'}</span>
          </button>

          <button
            onClick={handleFlashPit}
            disabled={isReading || isFlashing}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-cyan-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isFlashing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isAr ? 'تفليش الـ PIT (Re-Partition)' : 'Flash Modified PIT'}</span>
          </button>
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

      {/* Main Grid: Partition Table & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Partition Table */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
              <Layers className="w-4 h-4" />
              <span>{isAr ? `قائمة البارتشنات (${partitions.length})` : `Partition Entries (${partitions.length})`}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Total Flash Map: 128 GB UFS LUN0</span>
          </div>

          <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Device Type</th>
                  <th className="p-2.5">Filesystem</th>
                  <th className="p-2.5">Block Start</th>
                  <th className="p-2.5">Size (MB)</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {partitions.map((p) => {
                  const isSelected = selectedPartition.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPartition(p)}
                      className={`cursor-pointer transition-all hover:bg-slate-800/50 ${
                        isSelected ? 'bg-cyan-500/15 text-cyan-200 font-bold' : ''
                      }`}
                    >
                      <td className="p-2.5 text-slate-500 font-bold">{p.id}</td>
                      <td className="p-2.5 text-white font-extrabold flex items-center gap-1.5">
                        {p.name}
                        {p.essential && <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30">EFS/SEC</span>}
                      </td>
                      <td className="p-2.5 text-slate-400">{p.deviceType}</td>
                      <td className="p-2.5 text-cyan-300">{p.partitionType}</td>
                      <td className="p-2.5 text-slate-400">0x{p.blockStart.toString(16).toUpperCase()}</td>
                      <td className="p-2.5 text-emerald-400 font-bold">{p.sizeMb.toLocaleString()} MB</td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${p.readOnly ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/10 text-emerald-300'}`}>
                          {p.readOnly ? 'LOCKED' : 'WRITABLE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Partition Detail Editor */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <span className="text-xs font-bold text-cyan-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4" />
              <span>{isAr ? 'معدل خصائص البارتشن' : 'Partition Properties'}</span>
            </span>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Partition Name</label>
                <input
                  type="text"
                  value={selectedPartition.name}
                  disabled={selectedPartition.essential}
                  onChange={(e) => {
                    const name = e.target.value.toUpperCase();
                    setPartitions(partitions.map(p => p.id === selectedPartition.id ? { ...p, name } : p));
                    setSelectedPartition(prev => ({ ...prev, name }));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-cyan-300"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Allocated Size (MB)</label>
                <input
                  type="number"
                  value={selectedPartition.sizeMb}
                  onChange={(e) => handleSizeChange(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-emerald-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="block text-[9px] text-slate-500">Block Start:</span>
                  <span className="text-white">0x{selectedPartition.blockStart.toString(16)}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500">Block Count:</span>
                  <span className="text-white">{selectedPartition.blockCount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500">Device:</span>
                  <span className="text-cyan-400">{selectedPartition.deviceType}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500">Filesystem:</span>
                  <span className="text-emerald-400">{selectedPartition.partitionType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Console */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] h-48 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-slate-200">PIT Stream</span>
              </div>
              <span className="text-[9px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                Loke Online
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
