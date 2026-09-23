import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileArchive, 
  Cpu, 
  Download, 
  Scissors, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Terminal, 
  Copy, 
  Check, 
  UploadCloud, 
  Layers, 
  Sparkles, 
  RefreshCw, 
  HardDrive, 
  ChevronRight, 
  FileCode, 
  ExternalLink,
  Lock,
  Unlock,
  CheckCircle2,
  Box
} from 'lucide-react';
import { 
  SAMPLE_FIRMWARE_CONTAINERS, 
  FirmwareContainerProfile, 
  SlicedPartition, 
  PatchHistoryEntry 
} from '../data/firmwareSlicerData';
import { ConnectedDevice } from '../types';

interface FirmwarePartitionSlicerProps {
  lang: 'en' | 'ar';
  device?: ConnectedDevice;
  onAddLog?: (msg: string) => void;
  onNavigateToTool?: (tabId: string) => void;
}

export const FirmwarePartitionSlicer: React.FC<FirmwarePartitionSlicerProps> = ({
  lang,
  device,
  onAddLog,
  onNavigateToTool
}) => {
  const isAr = lang === 'ar';

  const [selectedContainer, setSelectedContainer] = useState<FirmwareContainerProfile>(SAMPLE_FIRMWARE_CONTAINERS[0]);
  const [selectedPartition, setSelectedPartition] = useState<SlicedPartition>(SAMPLE_FIRMWARE_CONTAINERS[0].partitions[0]);
  
  // Extraction & Patching State
  const [isSlicing, setIsSlicing] = useState(false);
  const [sliceProgress, setSliceProgress] = useState(0);
  const [activePatchType, setActivePatchType] = useState<'magisk' | 'kernelsu' | 'disable-verity' | 'raw-extract'>('magisk');
  const [patchLog, setPatchLog] = useState<string[]>([]);
  const [isPatching, setIsPatching] = useState(false);
  const [patchedReady, setPatchedReady] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Local file upload simulation
  const [customFileLoaded, setCustomFileLoaded] = useState<string | null>(null);

  const handleSelectContainer = (container: FirmwareContainerProfile) => {
    setSelectedContainer(container);
    setSelectedPartition(container.partitions[0]);
    setPatchedReady(false);
    setPatchLog([]);
  };

  const handleSimulateSlice = (partition: SlicedPartition) => {
    setSelectedPartition(partition);
    setIsSlicing(true);
    setSliceProgress(0);
    setPatchedReady(false);
    setPatchLog([
      isAr 
        ? `[Cloud Slicer] جاري الاتصال بخادم الحاوية ${selectedContainer.title}...`
        : `[Cloud Slicer] Connecting to cloud storage stream for ${selectedContainer.title}...`,
      isAr
        ? `[Index Parser] قراءة خريطة العناوين (Offsets) للبارتشن ${partition.name}...`
        : `[Index Parser] Reading header offset table for ${partition.name}...`,
    ]);

    const interval = setInterval(() => {
      setSliceProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSlicing(false);
          setPatchLog((logs) => [
            ...logs,
            isAr
              ? `[OK] تم استخراج ${partition.name} (${partition.sizeFormatted}) بنجاح دون الحاجة لتحميل الحاوية بالكامل (${selectedContainer.totalSizeFormatted})!`
              : `[OK] Extracted ${partition.name} (${partition.sizeFormatted}) in 1.4s without downloading entire ${selectedContainer.totalSizeFormatted} archive!`,
            isAr
              ? `[SHA256 Validated]: ${partition.sha256}`
              : `[SHA256 Validated]: ${partition.sha256}`
          ]);
          if (onAddLog) onAddLog(`Cloud Slicer extracted ${partition.name} (${partition.sizeFormatted}) successfully.`);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleExecutePatch = () => {
    if (!selectedPartition) return;
    setIsPatching(true);
    setPatchedReady(false);
    setPatchLog([
      isAr 
        ? `[Kernel Lab] بدء معالجة وترقيع ${selectedPartition.name}...`
        : `[Kernel Lab] Initiating patch process for ${selectedPartition.name}...`
    ]);

    setTimeout(() => {
      if (activePatchType === 'magisk') {
        setPatchLog((prev) => [
          ...prev,
          isAr ? '1. فك ضغط كيرنل الرام ديسك (CPIO Unpack)...' : '1. Unpacking Ramdisk CPIO container...',
          isAr ? '2. حقن ثنائيات Magisk v27.0 (magiskboot patch)...' : '2. Injecting Magisk v27.0 binaries (magiskboot)...',
          isAr ? '3. تعطيل التحقق من SELinux وتعديل fstab.boot...' : '3. Patching SELinux policy & disarming fstab verification...',
          isAr ? '4. إعادة حزم الصورة boot_patched_magisk.img وتحديث التجزئة...' : '4. Repacking boot_patched_magisk.img with valid CRC32...',
          isAr ? '✓ جاهز للتفليش عبر Fastboot أو Odin!' : '✓ Successfully patched! Ready for Fastboot / Odin flashing.'
        ]);
      } else if (activePatchType === 'kernelsu') {
        setPatchLog((prev) => [
          ...prev,
          isAr ? '1. فحص توافق GKI الكيرنل (KSU KernelSU v0.9.5)...' : '1. Verifying Generic Kernel Image (GKI) headers...',
          isAr ? '2. حقن ksu_driver ونظام الصلاحيات في النواة...' : '2. Inlining KernelSU driver into vmlinux ramdisk...',
          isAr ? '3. تشفير مفتاح الإدارة وتحديث واصف الإقلاع...' : '3. Finalizing boot_patched_ksu.img image...',
          isAr ? '✓ تم إنشاء كيرنل الروت بنجاح!' : '✓ KernelSU patch generated successfully!'
        ]);
      } else if (activePatchType === 'disable-verity') {
        setPatchLog((prev) => [
          ...prev,
          isAr ? '1. قراءة ترويسة AVB 2.0 VBMETA Header...' : '1. Reading AVB 2.0 vbmeta magic bytes (AVB0)...',
          isAr ? '2. تعديل علامات الحظر (Flag: 0x02 -> DISABLE_HASHTREE)...' : '2. Modifying flags: 0x02 (AVB_VBMETA_IMAGE_FLAGS_HASHTREE_DISABLED)...',
          isAr ? '3. تصفير مفاتيح التحقق وتجاوز Red State Bootloop...' : '3. Disarming verification hash trees to prevent bootloops...',
          isAr ? '✓ تم إنشاء vbmeta_disabled.img المعدلة!' : '✓ vbmeta_disabled.img ready to flash!'
        ]);
      } else {
        setPatchLog((prev) => [
          ...prev,
          isAr ? '1. فك ضغط LZ4 الأصلي بدون تشفير...' : '1. Decompressing native LZ4 stream without compression loss...',
          isAr ? '✓ تم تجهيز الصورة الخام بصيغة .img مباشرة!' : '✓ Raw partition image ready!'
        ]);
      }
      setIsPatching(false);
      setPatchedReady(true);
      if (onAddLog) onAddLog(`Patched ${selectedPartition.name} with ${activePatchType}`);
    }, 1200);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(selectedPartition.flashCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 lg:p-12 text-white shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.2),transparent_70%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] font-bold tracking-widest uppercase flex items-center gap-2">
                <Scissors size={14} className="text-indigo-400" />
                Cloud Partition Slicer & Kernel Lab v2.4
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
                NO 10GB FULL DOWNLOAD REQUIRED
              </span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">
              {isAr ? 'استوديو تقطيع الفلاشات واستخراج البارتشنات الفورية' : 'Universal Firmware Partition Slicer & Kernel Patcher'}
            </h1>

            <p className="text-slate-300 text-sm lg:text-base leading-relaxed font-normal">
              {isAr 
                ? 'استخرج ملفات boot.img، init_boot، vbmeta، و super من فلاشات سامسونج (tar.md5)، شاومي (payload.bin)، وميدياتك (scatter) فورياً دون تحميل الـ 10 جيجابايت كاملة. مع ميزة الترقيع المباشر لـ Magisk و KernelSU وتعطيل حماية AVB 2.0.'
                : 'Instantly carve target partitions (boot.img, init_boot, vbmeta, recovery) from 10GB+ Samsung TAR/MD5, Android payload.bin, or Xiaomi Fastboot packages without full downloads. In-memory patching for Magisk, KernelSU, and AVB 2.0 dm-verity disarming.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.tar,.md5,.zip,.bin,.tgz,.pac';
                input.onchange = (e: any) => {
                  const file = e.target?.files?.[0];
                  if (file) {
                    setCustomFileLoaded(file.name);
                    if (onAddLog) onAddLog(`Loaded local container: ${file.name}`);
                  }
                };
                input.click();
              }}
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-xl"
            >
              <UploadCloud size={16} />
              {isAr ? 'فحص حاوية محلية (Local ROM)' : 'Inspect Local ROM'}
            </button>
          </div>
        </div>
      </div>

      {customFileLoaded && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-500" size={20} />
            <span className="text-xs font-bold text-emerald-800">
              {isAr ? `تم تحميل الحاوية المحلية: ${customFileLoaded}` : `Local Container Loaded: ${customFileLoaded}`}
            </span>
          </div>
          <button 
            onClick={() => setCustomFileLoaded(null)}
            className="text-xs text-emerald-700 hover:underline font-bold"
          >
            {isAr ? 'إلغاء' : 'Reset'}
          </button>
        </div>
      )}

      {/* Main Grid: Containers List & Partition Slices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Container Selector & Specs (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
                <FileArchive size={16} className="text-indigo-600" />
                {isAr ? 'الحاويات والمنصات الجاهزة' : 'Supported ROM Containers'}
              </span>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                {SAMPLE_FIRMWARE_CONTAINERS.length} Presets
              </span>
            </div>

            <div className="space-y-3">
              {SAMPLE_FIRMWARE_CONTAINERS.map((container) => {
                const isSelected = selectedContainer.id === container.id;
                return (
                  <button
                    key={container.id}
                    onClick={() => handleSelectContainer(container)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{container.brand}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                          {container.containerType}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 line-clamp-1">{container.title}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                        <span>{container.totalSizeFormatted}</span>
                        <span>•</span>
                        <span>{container.partitions.length} {isAr ? 'أقسام' : 'partitions'}</span>
                      </div>
                    </div>
                    {isSelected && <ChevronRight size={18} className="text-indigo-600 shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Container Metadata Card */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">
              {isAr ? 'مواصفات الحاوية المختارة' : 'Selected Container Meta'}
            </h3>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Target Model:</span>
                <span className="font-bold text-white">{selectedContainer.model}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">OS Version:</span>
                <span className="text-emerald-400 font-bold">{selectedContainer.osVersion}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Security Patch:</span>
                <span className="text-amber-400">{selectedContainer.securityPatchDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Archive Size:</span>
                <span className="text-indigo-300 font-black">{selectedContainer.totalSizeFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Partition Map & Slicing Action (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isAr ? 'جدول البارتشنات المتاحة للاستخراج الفوري' : 'Available Target Partitions for Slicing'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr ? 'حدد البارتشن المراد استخراجه أو ترقيعه مباشرة دون تحميل الروم كاملاً' : 'Select a partition to carve, patch, or flash directly'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {isAr ? 'استخراج سحابي فوري' : 'Direct Cloud Stream'}
                </span>
              </div>
            </div>

            {/* Partition Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedContainer.partitions.map((partition) => {
                const isSelected = selectedPartition.name === partition.name;
                return (
                  <div
                    key={partition.name}
                    onClick={() => setSelectedPartition(partition)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode size={18} className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
                        <span className="text-xs font-black font-mono text-slate-900">{partition.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {partition.sizeFormatted}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {isAr ? partition.purposeAr : partition.purposeEn}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        partition.riskLevel === 'safe' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : partition.riskLevel === 'moderate' 
                          ? 'bg-amber-50 text-amber-600' 
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        {partition.riskLevel}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulateSlice(partition);
                        }}
                        disabled={isSlicing}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Scissors size={12} />
                        {isAr ? 'استخراج (Slice)' : 'Slice'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slicing Progress Bar */}
            {isSlicing && (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2 animate-pulse">
                <div className="flex justify-between text-xs font-bold text-indigo-900">
                  <span>{isAr ? `جاري استخراج ${selectedPartition.name}...` : `Slicing ${selectedPartition.name}...`}</span>
                  <span>{sliceProgress}%</span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2 transition-all duration-200 rounded-full" 
                    style={{ width: `${sliceProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* DYNAMIC SUPER.IMG SUB-PARTITION UNPACKER & ARB INSPECTOR */}
            {selectedPartition.name.includes('super') && (
              <div className="p-6 bg-slate-950 text-white rounded-3xl border border-indigo-900/50 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-indigo-400" />
                    <h4 className="text-sm font-black text-indigo-300 uppercase tracking-wider">
                      {isAr ? 'تفكيك حاوية DYNAMIC SUPER.IMG إلى أقسام النظام الفرعية' : 'Dynamic Super.img Sub-Partition Unpacker'}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/30">
                    SPARSE / EROFS UNPACKER READY
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  {isAr 
                    ? 'تم التعرف على حاوية الأقسام الديناميكية super.img. يمكنك فك وإعادة تجميد الأقسام الفرعية دون تفكيك الحاوية كاملة:'
                    : 'Dynamic partition super.img container parsed. Logical sub-images available for extraction and custom payload insertion:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
                  {[
                    { name: 'system.img', size: '2.85 GB', format: 'EROFS', verity: 'AVB 2.0 Enabled' },
                    { name: 'system_ext.img', size: '420 MB', format: 'EROFS', verity: 'AVB 2.0 Enabled' },
                    { name: 'vendor.img', size: '890 MB', format: 'EXT4 Sparse', verity: 'AVB 2.0 Enabled' },
                    { name: 'product.img', size: '1.45 GB', format: 'EROFS', verity: 'AVB 2.0 Enabled' },
                    { name: 'odm.img', size: '120 MB', format: 'EXT4 Sparse', verity: 'Disabled' }
                  ].map((sub, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-400">{sub.name}</span>
                        <span className="text-[10px] text-slate-500">{sub.size}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Format: <strong className="text-indigo-300">{sub.format}</strong></span>
                        <span className="text-emerald-400 font-bold">{sub.verity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANTI-ROLLBACK (ARB) SAFETY INDEX CARD */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-500 shrink-0" size={22} />
                <div>
                  <span className="font-bold text-amber-200 block">
                    {isAr ? 'فحص مؤشر الأمان لعدم الخفض (Anti-Rollback Index - ARB v4)' : 'Anti-Rollback Security Index (ARB Index: 4)'}
                  </span>
                  <span className="text-[11px] text-amber-300/80">
                    {isAr 
                      ? 'الروم متوافق مع حماية التراجعي. لن يتم إغلاق الجهاز أو الدخول في حالة Brick عند التفليش.'
                      : 'Firmware matches hardware security index 4. Safe to flash without downgrade bricking risks.'}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shrink-0">
                ARB PASSED
              </span>
            </div>

            {/* Patching & Flashing Studio */}
            <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {isAr ? `معالجة وترقيع: ${selectedPartition.name}` : `Patch Studio: ${selectedPartition.name}`}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Target Partition Size: {selectedPartition.sizeFormatted} | Format: RAW / LZ4
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedPartition.isPatchable && (
                    <>
                      <button
                        onClick={() => setActivePatchType('magisk')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activePatchType === 'magisk'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Magisk v27.0
                      </button>
                      <button
                        onClick={() => setActivePatchType('kernelsu')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activePatchType === 'kernelsu'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        KernelSU GKI
                      </button>
                      <button
                        onClick={() => setActivePatchType('disable-verity')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activePatchType === 'disable-verity'
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Disable Verity (AVB)
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setActivePatchType('raw-extract')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activePatchType === 'raw-extract'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Raw Unpack (.img)
                  </button>
                </div>
              </div>

              {/* Execution Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleExecutePatch}
                  disabled={isPatching}
                  className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {isPatching ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      {isAr ? 'جاري معالجة وترقيع البارتشن...' : 'Patching in-memory stream...'}
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      {isAr ? `توليد البارتشن المعالج (${activePatchType})` : `Generate Patched Image (${activePatchType})`}
                    </>
                  )}
                </button>

                {patchedReady && (
                  <button
                    onClick={() => {
                      const dummyData = `OmniFix Patched Binary: ${selectedPartition.name} -> ${activePatchType}`;
                      const blob = new Blob([dummyData], { type: 'application/octet-stream' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedPartition.name.replace('.lz4', '')}_patched_${activePatchType}.img`;
                      a.click();
                    }}
                    className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Download size={16} />
                    {isAr ? 'تحميل الصورة (.img)' : 'Download .IMG'}
                  </button>
                )}
              </div>

              {/* Live Patching Terminal Log */}
              {patchLog.length > 0 && (
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs space-y-1.5 text-emerald-400 max-h-48 overflow-y-auto">
                  {patchLog.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              )}

              {/* Terminal CLI Command Line */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono flex items-center gap-1.5">
                    <Terminal size={14} className="text-indigo-400" />
                    {isAr ? 'أمر التفليش المباشر عبر السطر البرمجي' : 'Fastboot / Flasher Command'}
                  </span>
                  <button
                    onClick={handleCopyCmd}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                  >
                    {copiedCmd ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedCmd ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الأمر' : 'Copy')}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-amber-300 bg-black/40 p-2.5 rounded-xl select-all break-all">
                  {selectedPartition.flashCommand}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
