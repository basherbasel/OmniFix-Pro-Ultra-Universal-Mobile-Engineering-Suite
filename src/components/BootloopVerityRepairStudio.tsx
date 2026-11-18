import React, { useState } from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  Play, 
  Sliders, 
  FileCode,
  HardDrive,
  Flame,
  Power
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { bootloopVerityEngine } from '../services/BootloopVerityEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const BootloopVerityRepairStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [selectedAction, setSelectedAction] = useState<'DM_VERITY' | 'MTK_RED_STATE' | 'ARB_VALIDATE'>('DM_VERITY');
  const [targetFirmwareArb, setTargetFirmwareArb] = useState<number>(3);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Bootloop, DM-Verity & ARB Safety Repair Suite v2026.9 initialized.',
    `Connected Device: ${device.brand} ${device.marketName} (${device.model}) | Chipset: ${device.chipset.toUpperCase()}`,
    `Device ARB Index: [${device.rollbackIndex || 2}] | Bootloader: ${device.bootloaderStatus}`
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[VERITY_STUDIO] ${m}`);
  };

  const handleExecute = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Executing selected recovery routine: ${selectedAction}...`);
    realUsbService.playContinuityBeep(120, 2200);

    if (selectedAction === 'DM_VERITY') {
      const res = await bootloopVerityEngine.fixDmVerityFastboot(addLog);
      if (res.success) {
        const msg = isAr 
          ? '✅ تم بنجاح إصلاح خطأ DM-Verity Corrupted وحقن ترقيع vbmeta بدون قفل التحقق!'
          : '✅ DM-Verity Corrupted error repaired and patched vbmeta flashed successfully!';
        setSuccessBanner(msg);
        addLog(msg);
        realUsbService.playContinuityBeep(300, 3200);
      }
    } else if (selectedAction === 'MTK_RED_STATE') {
      const res = await bootloopVerityEngine.fixMtkRedState(addLog);
      if (res.success) {
        const msg = isAr 
          ? '✅ تم بنجاح حل مشكلة Red State لمعالجات ميدياتيك وترقيع حماية seccfg والإقلاع للنظام!'
          : '✅ MediaTek Red State error cured and seccfg patched successfully!';
        setSuccessBanner(msg);
        addLog(msg);
        realUsbService.playContinuityBeep(300, 3200);
      }
    } else if (selectedAction === 'ARB_VALIDATE') {
      const res = await bootloopVerityEngine.validateAntiRollback(device, targetFirmwareArb, addLog);
      if (res.safeToFlash) {
        const msg = isAr 
          ? `✅ مؤشر الحماية ضد التراجع (ARB ${res.targetArb}) سليم ومطابق. الفلاش آمن 100%! `
          : `✅ ARB Index matched (${res.targetArb} >= ${res.currentArb}). Flashing is safe!`;
        setSuccessBanner(msg);
      } else {
        const msg = isAr 
          ? `🚨 خطر قاتل: الروم يحتوي على ARB أقل (${res.targetArb} < ${res.currentArb}). تم إلغاء التفليش لمنع موت الهاتف!`
          : `🚨 DANGER: Target firmware has lower ARB (${res.targetArb} < ${res.currentArb}). Flashing rejected to prevent hard brick!`;
        setSuccessBanner(msg);
      }
    }

    setIsExecuting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-amber-600 via-rose-600 to-red-600 rounded-xl shadow-lg shadow-rose-500/20">
            <RotateCcw className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-amber-400 via-rose-300 to-red-400 bg-clip-text text-transparent">
                {isAr ? 'أداة إصلاح البوت لوب و DM-Verity والـ ARB' : 'Bootloop, DM-Verity & ARB Anti-Rollback Suite'}
              </h1>
              <span className="bg-rose-500/10 text-rose-400 text-xs px-2.5 py-0.5 rounded-full border border-rose-500/20 font-mono font-bold">
                AVB 2.0 Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'إصلاح التوقف على الشعار، أخطاء Red/Orange State، ترقيع حماية vbmeta وتأكيد مؤشر الحماية ضد التراجع ARB'
                : 'Fixes DM-verity corrupted, Red/Orange state bootloops, patches AVB vbmeta, and validates hardware eFuse ARB'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="bg-slate-950 text-amber-300 px-3 py-1.5 rounded-xl border border-slate-800">
            Current ARB: [{device.rollbackIndex || 2}]
          </span>
          <span className="bg-slate-950 text-cyan-300 px-3 py-1.5 rounded-xl border border-slate-800">
            Mode: {device.mode}
          </span>
        </div>
      </div>

      {/* Success / Alert Banner */}
      {successBanner && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-xl animate-in fade-in duration-300 ${
          successBanner.includes('🚨') 
            ? 'bg-rose-950/80 border border-rose-500/50 text-rose-200' 
            : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {successBanner.includes('🚨') ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="font-bold">{successBanner}</span>
          </div>
          <button 
            onClick={() => setSuccessBanner(null)} 
            className="px-2 py-1 text-slate-400 hover:text-white font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'اختر عملية الإصلاح الفورية' : 'Select Instant Fix Routine'}</span>
            </span>

            <div className="space-y-2.5 text-xs">
              {[
                {
                  id: 'DM_VERITY',
                  titleAr: 'إصلاح خطأ DM-Verity Corrupted (Fastboot vbmeta Patch)',
                  titleEn: 'Fix DM-Verity Corrupted & Orange State',
                  descAr: 'توليد وتفليش vbmeta معطل التحقق وحذف كاش الأمان لمنع إعادة التشغيل.',
                  descEn: 'Generates and flashes patched vbmeta with disabled hashtree & verification.'
                },
                {
                  id: 'MTK_RED_STATE',
                  titleAr: 'إصلاح Red State لمعالجات ميدياتيك (BROM seccfg Repair)',
                  titleEn: 'Fix MediaTek Red State & BROM Loop',
                  descAr: 'إعادة بناء جدول حماية seccfg وتصحيحLittle Kernel (LK) في وضع BootROM.',
                  descEn: 'Reconstructs seccfg security table and LK verification in BROM mode.'
                },
                {
                  id: 'ARB_VALIDATE',
                  titleAr: 'فحص مؤشر الحماية ضد التراجع (Anti-Rollback Pre-Flight Check)',
                  titleEn: 'Anti-Rollback (ARB Index) Pre-Flight Validator',
                  descAr: 'مقارنة رقم الـ eFuse في البوردة مع رقم الروم لتفادي موت الهاتف النهائي.',
                  descEn: 'Compares hardware eFuse index against ROM to prevent permanent hard brick.'
                }
              ].map((act) => (
                <label
                  key={act.id}
                  onClick={() => setSelectedAction(act.id as any)}
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedAction === act.id
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-extrabold text-xs">
                    <input
                      type="radio"
                      name="verityAction"
                      checked={selectedAction === act.id}
                      onChange={() => {}}
                      className="accent-amber-500"
                    />
                    <span>{isAr ? act.titleAr : act.titleEn}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 pl-5">
                    {isAr ? act.descAr : act.descEn}
                  </p>
                </label>
              ))}
            </div>

            {/* Target ARB Selector if ARB action */}
            {selectedAction === 'ARB_VALIDATE' && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>{isAr ? 'رقم حماية الروم المراد تفليشه (Target ROM ARB):' : 'Target Firmware ARB Index:'}</span>
                  <span className="font-mono font-bold text-amber-400">{targetFirmwareArb}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={targetFirmwareArb}
                  onChange={(e) => setTargetFirmwareArb(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            )}

            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="w-full bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-black py-3.5 rounded-xl text-xs shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>
                {isExecuting 
                  ? (isAr ? 'جاري تنفيذ الإصلاح...' : 'Executing Repair...') 
                  : (isAr ? 'تنفيذ عملية الإصلاح بنقرة واحدة' : '1-CLICK EXECUTE REPAIR')}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Live Terminal */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[420px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-200">{isAr ? 'سجل عمليات النواة و AVB 2.0 المباشر' : 'Live AVB & Bootloop Pipe Stream'}</span>
            </div>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Kernel Verity Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('MATCHED') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('🚨') || l.includes('DANGER') || l.includes('FATAL')
                    ? 'text-rose-400 font-bold'
                    : l.includes('fastboot') || l.includes('Flashing') || l.includes('Generating')
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
