import React, { useState } from 'react';
import { 
  FileArchive, 
  Cpu, 
  Terminal, 
  Download, 
  CheckCircle2, 
  Zap, 
  Scissors, 
  Copy, 
  Check, 
  Play, 
  RotateCcw, 
  Layers, 
  FileCode,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  payloadDumperEngine, 
  ExtractedPayloadPartition, 
  SAMPLE_PAYLOAD_PARTITIONS 
} from '../services/PayloadDumperEngine';
import { fastbootController } from '../services/FastbootController';
import { realUsbService } from '../services/realUsbService';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const PayloadDumperStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';

  const [partitions, setPartitions] = useState<ExtractedPayloadPartition[]>(SAMPLE_PAYLOAD_PARTITIONS);
  const [selectedPartition, setSelectedPartition] = useState<ExtractedPayloadPartition>(SAMPLE_PAYLOAD_PARTITIONS[0]);
  const [activePatch, setActivePatch] = useState<'MAGISK' | 'KERNELSU' | 'DISABLE_VERITY'>('MAGISK');
  const [isDumping, setIsDumping] = useState(false);
  const [isPatching, setIsPatching] = useState(false);
  const [fastbootCommand, setFastbootCommand] = useState<string>('fastboot flash boot magisk_patched_boot.img');
  const [copied, setCopied] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Android OTA payload.bin Slicer & Magisk/KernelSU Patcher v2026.9 initialized.',
    'Protobuf DeltaArchiveManifest Parser ready.',
    'Select or drop any OTA payload.bin file to extract partition images in seconds.'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[PAYLOAD_STUDIO] ${m}`);
  };

  const handleParsePayload = async () => {
    if (isDumping || isPatching) return;
    setIsDumping(true);
    setSuccessBanner(null);

    const res = await payloadDumperEngine.parsePayloadBin('OnePlus_OxygenOS_14_FullOTA_payload.bin', 2684354560, addLog);
    if (res.success) {
      setPartitions(res.partitions);
      setSelectedPartition(res.partitions[0]);
      const msg = isAr 
        ? `✅ تم فك واستخراج ${res.partitions.length} بارتشن من ملف الـ payload.bin بنجاح!`
        : `✅ Parsed ${res.partitions.length} partitions from payload.bin successfully!`;
      setSuccessBanner(msg);
      addLog(msg);
    }

    setIsDumping(false);
  };

  const handlePatch = async () => {
    if (isDumping || isPatching) return;
    setIsPatching(true);
    setSuccessBanner(null);

    const res = await payloadDumperEngine.patchBootImage(selectedPartition.name, activePatch, addLog);
    if (res.success) {
      setFastbootCommand(res.fastbootCmd);
      const updated = partitions.map((p) => {
        if (p.name === selectedPartition.name) {
          return {
            ...p,
            patchedState: activePatch === 'MAGISK' ? 'MAGISK_ROOTED' : activePatch === 'KERNELSU' ? 'KERNELSU_ROOTED' : 'VBMETA_DISABLED'
          } as ExtractedPayloadPartition;
        }
        return p;
      });
      setPartitions(updated);

      const msg = isAr 
        ? `✅ تم بنجاح ترقيع ${selectedPartition.name} بحزمة ${activePatch} وتجهيز أمر الـ Fastboot!`
        : `✅ Patched ${selectedPartition.name} with ${activePatch} successfully!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsPatching(false);
  };

  const handleFlashDirectFastboot = async () => {
    addLog(`Executing Fastboot Direct Flash: ${fastbootCommand}...`);
    realUsbService.playContinuityBeep(120, 2200);

    try {
      await fastbootController.connect();
      await fastbootController.handshake();
      await fastbootController.executeFastbootCommand(fastbootCommand.replace('fastboot ', ''), addLog);
      addLog('✅ [FASTBOOT] Patched image flashed successfully to target slot!');
      realUsbService.playContinuityBeep(250, 3000);
    } catch (e: any) {
      addLog(`Notice: ${e.message || e}`);
    }
  };

  const copyFastboot = () => {
    navigator.clipboard.writeText(fastbootCommand);
    setCopied(true);
    realUsbService.playContinuityBeep(100, 2600);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-rose-600 via-pink-600 to-purple-600 rounded-xl shadow-lg shadow-pink-500/20">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-rose-400 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                {isAr ? 'مستخرج الفلاشات ومعدل البوت (Payload.bin & Boot Patcher)' : 'OTA Payload.bin Slicer & Kernel Root Patcher'}
              </h1>
              <span className="bg-pink-500/10 text-pink-400 text-xs px-2.5 py-0.5 rounded-full border border-pink-500/20 font-mono font-bold">
                Protobuf Delta Slicer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'فك حزم payload.bin لهواتف (OnePlus, Xiaomi, Pixel, Motorola) واستخراج وترقيع boot.img و vbmeta في المتصفح'
                : 'Extract boot.img, init_boot, vbmeta from OTA payload.bin in seconds & patch with Magisk/KernelSU'}
            </p>
          </div>
        </div>

        <button
          onClick={handleParsePayload}
          disabled={isDumping}
          className="bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black px-6 py-3 rounded-xl text-xs shadow-lg shadow-rose-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isDumping ? <RotateCcw className="w-4 h-4 animate-spin" /> : <FileArchive className="w-4 h-4" />}
          <span>{isAr ? 'تحليل وفك ملف payload.bin' : 'Parse & Extract payload.bin'}</span>
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
        {/* Left: Extracted Partitions */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-pink-400 font-mono uppercase flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>{isAr ? 'البارتشنات المستخرجة' : 'Extracted Partition Images'}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Format: Android Sparse / Raw</span>
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
                      ? 'bg-pink-500/15 border-pink-500/50 text-pink-200 shadow-md shadow-pink-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-white flex items-center gap-1.5 font-mono">
                      <FileCode className="w-4 h-4 text-pink-400" />
                      {p.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.sizeMb} MB</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500 truncate max-w-[120px]">{p.hashSha256.slice(0, 12)}...</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      p.patchedState !== 'STOCK' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.patchedState}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fastboot Flasher Command Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block font-mono">
              {isAr ? 'أمر التفليش التلقائي عبر Fastboot:' : 'Generated Fastboot Command:'}
            </span>
            <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <code className="text-xs text-emerald-400 font-mono flex-1 truncate">{fastbootCommand}</code>
              <button
                onClick={copyFastboot}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 cursor-pointer transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleFlashDirectFastboot}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isAr ? 'تفليش فوري عبر Fastboot' : 'Flash via Fastboot'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Patcher Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <span className="text-xs font-bold text-pink-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'اختر نوع الترقيع والروت' : 'Select Root / Patch Engine'}</span>
            </span>

            <div className="space-y-2.5 text-xs">
              {[
                {
                  id: 'MAGISK',
                  name: 'Magisk v28.1 (Systemless Root)',
                  descAr: 'حقن ثنائيات الروت داخل الـ Ramdisk بدون المساس بنظام السيستم.',
                  descEn: 'Patches boot.img ramdisk with Magisk binaries for systemless root.'
                },
                {
                  id: 'KERNELSU',
                  name: 'KernelSU GKI (Kernel-Level Root)',
                  descAr: 'دمج كود KernelSU مباشرة في نواة اللينكس (أكثر تخفياً من البنوك).',
                  descEn: 'Injects KernelSU GKI driver into boot kernel for stealth root.'
                },
                {
                  id: 'DISABLE_VERITY',
                  name: 'Disable DM-Verity & AVB 2.0',
                  descAr: 'تعطيل قفل التحقق vbmeta للسماح بتفليش الرومات المعدلة و GSI.',
                  descEn: 'Disables AVB verification flags to permit custom GSI / ROM boots.'
                }
              ].map((pt) => (
                <label
                  key={pt.id}
                  onClick={() => setActivePatch(pt.id as any)}
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    activePatch === pt.id
                      ? 'bg-pink-500/15 border-pink-500/50 text-pink-200 shadow-md shadow-pink-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-extrabold text-xs">
                    <input
                      type="radio"
                      name="patchType"
                      checked={activePatch === pt.id}
                      onChange={() => {}}
                      className="accent-pink-500"
                    />
                    <span>{pt.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 pl-5">
                    {isAr ? pt.descAr : pt.descEn}
                  </p>
                </label>
              ))}
            </div>

            <button
              onClick={handlePatch}
              disabled={isPatching}
              className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black py-3.5 rounded-xl text-xs shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isPatching ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>
                {isPatching 
                  ? (isAr ? 'جاري الترقيع...' : 'Patching...') 
                  : (isAr ? `ترقيع ${selectedPartition.name} بنقرة واحدة` : `1-CLICK PATCH ${selectedPartition.name}`)}
              </span>
            </button>
          </div>

          {/* Console */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] h-44 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-pink-400" />
                <span className="font-bold text-slate-200">Slicer Stream</span>
              </div>
              <span className="text-[9px] text-pink-400 bg-pink-500/10 px-1.5 py-0.2 rounded border border-pink-500/20">
                CrAU Active
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
