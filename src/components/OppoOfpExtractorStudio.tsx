import React, { useState } from 'react';
import { 
  FileArchive, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Lock, 
  Unlock, 
  Layers, 
  FileCode, 
  Download,
  Sparkles,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  oppoOfpExtractorEngine, 
  OfpPartitionFile, 
  SAMPLE_OFP_PARTITIONS 
} from '../services/OppoOfpExtractorEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const OppoOfpExtractorStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';

  const [partitions, setPartitions] = useState<OfpPartitionFile[]>(SAMPLE_OFP_PARTITIONS);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Oppo / Realme / OnePlus .OFP & .OPS AES Decryptor v2026.9 initialized.',
    'Qualcomm MSM & MediaTek Dimensity OFP Crypto Engine Ready.',
    'Select or drop any ColorOS / OxygenOS encrypted .ofp file to unpack raw images.'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[OFP_STUDIO] ${m}`);
  };

  const handleDecrypt = async () => {
    if (isDecrypting) return;
    setIsDecrypting(true);
    setSuccessBanner(null);

    addLog('Loading AES key table and decrypting OFP container...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await oppoOfpExtractorEngine.decryptOfpContainer('Realme_GT5_Pro_RMX3820_OFP.ofp', addLog);
    if (res.success) {
      setPartitions(res.partitions);
      const msg = isAr 
        ? `✅ تم فك تشفير وتفريغ ${res.partitions.length} بارتشن من ملف OFP بنجاح!`
        : `✅ Decrypted & unpacked ${res.partitions.length} partitions from .ofp file!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsDecrypting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 via-green-600 to-teal-600 rounded-xl shadow-lg shadow-green-500/20">
            <Unlock className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 via-green-300 to-teal-300 bg-clip-text text-transparent">
                {isAr ? 'مفكك ومستخرج فلاشات أوبو وريلمي (Oppo / Realme .OFP Decryptor)' : 'Oppo & Realme OFP / OPS Decryptor'}
              </h1>
              <span className="bg-green-500/10 text-green-400 text-xs px-2.5 py-0.5 rounded-full border border-green-500/20 font-mono font-bold">
                AES-128-CBC Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'فك تشفير فلاشات .ofp و .ops المشفرة واستخراج ملفات super.img و boot.img لتحويلها لفلاشة Fastboot'
                : 'Unpack encrypted ColorOS / OxygenOS .ofp firmware into flashable raw and sparse images'}
            </p>
          </div>
        </div>

        <button
          onClick={handleDecrypt}
          disabled={isDecrypting}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-6 py-3 rounded-xl text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isDecrypting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <FileArchive className="w-4 h-4" />}
          <span>{isAr ? 'فك تشفير ملف .ofp' : 'Decrypt & Unpack .ofp'}</span>
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
        {/* Left: Unpacked Partitions */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-green-400 font-mono uppercase flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>{isAr ? 'البارتشنات المفكوكة من ملف الـ OFP' : 'Decrypted Raw Partitions'}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Format: Android Sparse / Raw</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {partitions.map((p) => (
              <div
                key={p.name}
                className="p-3.5 rounded-xl border bg-slate-950 border-slate-800 text-slate-300 flex justify-between items-center"
              >
                <div>
                  <div className="font-extrabold text-xs text-white flex items-center gap-1.5 font-mono">
                    <FileCode className="w-4 h-4 text-green-400" />
                    {p.name}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Crypto: {p.encryption}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-emerald-400 font-bold block">{p.sizeMb} MB</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Console */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[420px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-green-400" />
              <span className="font-bold text-slate-200">{isAr ? 'سجل فك تشفير OFP' : 'Live OFP Decryptor Log'}</span>
            </div>
            <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
              AES-128
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('OFP')
                    ? 'text-green-300'
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
