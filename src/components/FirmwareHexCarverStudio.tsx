import React, { useState, useEffect, useRef } from 'react';
import { 
  Binary, 
  Upload, 
  Search, 
  CheckCircle2, 
  Terminal, 
  Download, 
  FileCode, 
  Layers, 
  ShieldCheck, 
  Scissors, 
  Play, 
  RotateCcw,
  Sparkles,
  Zap,
  HardDrive,
  Copy,
  Check
} from 'lucide-react';
import { 
  firmwareHexCarverEngine, 
  BinaryMagicInspection 
} from '../services/FirmwareHexCarverEngine';
import { realUsbService } from '../services/realUsbService';
import { ConnectedDevice } from '../types';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const FirmwareHexCarverStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentBuffer, setCurrentBuffer] = useState<ArrayBuffer | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('boot_sample.img');
  const [inspection, setInspection] = useState<BinaryMagicInspection | null>(null);
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [hexRows, setHexRows] = useState<Array<{ offsetHex: string; hexBytes: string[]; ascii: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Real Binary Hex Carver & Magic Header Inspector v2026.9 initialized.',
    'Web Crypto SHA-256 Digest engine online.',
    'Drop any .img, .bin, .pit, .pac, or .elf firmware file to inspect live hex offsets and carve partitions.'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[HEX_STUDIO] ${m}`);
  };

  // Create initial demo sample binary if none loaded
  useEffect(() => {
    const demoSize = 1024 * 64; // 64KB
    const demoBuf = new ArrayBuffer(demoSize);
    const demoView = new Uint8Array(demoBuf);

    // Write "ANDROID!" magic
    const magicStr = 'ANDROID!';
    for (let i = 0; i < magicStr.length; i++) {
      demoView[i] = magicStr.charCodeAt(i);
    }
    // Write kernel size = 32KB
    new DataView(demoBuf).setUint32(8, 32768, true);
    // Write ramdisk size = 16KB
    new DataView(demoBuf).setUint32(16, 16384, true);

    loadBuffer(demoBuf, 'sample_android_boot.img');
  }, []);

  const loadBuffer = async (buffer: ArrayBuffer, fileName: string) => {
    setIsProcessing(true);
    setCurrentBuffer(buffer);
    setCurrentFileName(fileName);
    setCurrentOffset(0);

    const insp = await firmwareHexCarverEngine.inspectBinaryBuffer(buffer, fileName);
    setInspection(insp);

    const rows = firmwareHexCarverEngine.generateHexDumpSlice(buffer, 0, 32);
    setHexRows(rows);

    addLog(`Loaded & Inspected [${fileName}] (${(buffer.byteLength / 1024).toFixed(1)} KB) -> Format: ${insp.format}`);
    realUsbService.playContinuityBeep(120, 2400);
    setIsProcessing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const buf = event.target?.result as ArrayBuffer;
      if (buf) {
        loadBuffer(buf, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleScrollOffset = (deltaBytes: number) => {
    if (!currentBuffer) return;
    const nextOffset = Math.max(0, Math.min(currentBuffer.byteLength - 16, currentOffset + deltaBytes));
    setCurrentOffset(nextOffset);
    const rows = firmwareHexCarverEngine.generateHexDumpSlice(currentBuffer, nextOffset, 32);
    setHexRows(rows);
  };

  const copySha = () => {
    if (!inspection) return;
    navigator.clipboard.writeText(inspection.sha256);
    setCopiedSha(true);
    realUsbService.playContinuityBeep(100, 2600);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 rounded-xl shadow-lg shadow-emerald-500/20">
            <Binary className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                {isAr ? 'مستعرض ومحلل الباينري والهكس لايف (Live Binary Hex Carver & Magic Inspector)' : 'Live Binary Hex Carver & Magic Header Inspector'}
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold">
                Real-Time Hex Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'فحص سحري لرؤوس الفلاشات وتوليد تشفير SHA-256 حقيقي واستعراض البايتات واستخراج قطاعات البوت والـ PIT'
                : 'Inspect raw magic signatures (ANDROID!, CrAU, AVB0, 0x12349876, ELF) and carve offsets live in browser'}
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>{isAr ? 'رفع ملف فلاشة أو باينري' : 'Load Binary File'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: File Telemetry & Hex Dump */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Metadata & Offsets */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'نتائج الفحص والتحقق' : 'Magic & Integrity Report'}</span>
            </span>

            {inspection && (
              <div className="space-y-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Detected Format:</span>
                  <span className="font-extrabold text-emerald-300 text-sm">{inspection.format}</span>
                  <span className="text-slate-400 block text-[11px] mt-1">{inspection.description}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Magic Header:</span>
                  <div className="text-cyan-300 text-xs font-bold truncate">HEX: {inspection.magicHex}</div>
                  <div className="text-amber-300 text-xs font-bold truncate">ASCII: "{inspection.magicAscii}"</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase">
                    <span>SHA-256 Checksum:</span>
                    <button onClick={copySha} className="text-emerald-400 hover:text-white cursor-pointer flex items-center gap-1">
                      {copiedSha ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSha ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-300 break-all bg-slate-900 p-1.5 rounded font-mono">
                    {inspection.sha256}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detected Offsets Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-teal-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4" />
              <span>{isAr ? 'القطاعات والـ Offsets المكتشفة' : 'Discovered Partitions'}</span>
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {inspection?.detectedOffsets.map((off, idx) => (
                <div
                  key={idx}
                  onClick={() => handleScrollOffset(off.offsetDecimal - currentOffset)}
                  className="p-2.5 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-teal-500/40 cursor-pointer transition-all flex justify-between items-center text-xs font-mono"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-teal-400" />
                      {off.name}
                    </div>
                    <span className="text-[10px] text-slate-500">{off.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-teal-300 font-bold block">{off.offsetHex}</span>
                    <span className="text-[10px] text-slate-400">{off.sizeMb} MB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Hex Viewer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
              <Binary className="w-4 h-4" />
              <span>{currentFileName} — Offset: 0x{currentOffset.toString(16).toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScrollOffset(-512)}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono text-slate-300 cursor-pointer"
              >
                -512B
              </button>
              <button
                onClick={() => handleScrollOffset(512)}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono text-slate-300 cursor-pointer"
              >
                +512B
              </button>
              <button
                onClick={() => handleScrollOffset(4096)}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono text-slate-300 cursor-pointer"
              >
                +4KB
              </button>
            </div>
          </div>

          {/* Hex Table */}
          <div className="overflow-x-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[12px] leading-relaxed max-h-[460px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="text-slate-500 border-b border-slate-800/80 sticky top-0 bg-slate-950 text-[11px]">
                <tr>
                  <th className="pb-2 text-cyan-400">Offset</th>
                  <th className="pb-2 text-slate-400">00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F</th>
                  <th className="pb-2 text-amber-400 pl-4">ASCII Decode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {hexRows.map((row) => (
                  <tr key={row.offsetHex} className="hover:bg-slate-900/80 transition-colors">
                    <td className="py-1 text-cyan-400/80 font-bold select-none pr-4">{row.offsetHex}</td>
                    <td className="py-1 text-slate-200">
                      <div className="flex gap-1.5 flex-wrap">
                        {row.hexBytes.slice(0, 8).map((b, i) => (
                          <span key={i} className={b === '00' ? 'text-slate-600' : 'text-emerald-300 font-bold'}>{b}</span>
                        ))}
                        <span className="text-slate-700 mx-1">|</span>
                        {row.hexBytes.slice(8, 16).map((b, i) => (
                          <span key={i} className={b === '00' ? 'text-slate-600' : 'text-emerald-300 font-bold'}>{b}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-1 text-amber-300 pl-4 font-mono select-all tracking-wider text-[11px]">
                      {row.ascii}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
