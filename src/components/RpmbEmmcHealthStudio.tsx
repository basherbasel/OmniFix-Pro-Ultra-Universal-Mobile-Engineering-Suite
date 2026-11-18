import React, { useState } from 'react';
import { 
  HardDrive, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Gauge, 
  Microscope,
  Cable,
  Sparkles
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  rpmbEmmcHealthEngine, 
  StorageHealthInfo, 
  SAMPLE_STORAGE_HEALTH 
} from '../services/RpmbEmmcHealthEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const RpmbEmmcHealthStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';

  const [health, setHealth] = useState<StorageHealthInfo>(SAMPLE_STORAGE_HEALTH);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix eMMC / UFS Health & RPMB Cryptographic Studio v2026.9 initialized.',
    'Extended CSD & JEDEC JESD220 Health Protocol Online.',
    'Connect phone via USB Bootloader or ISP Hardware Adapter (VCC, VCCQ, CLK, CMD, DAT0).'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[RPMB_STUDIO] ${m}`);
  };

  const handleProbeHealth = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Reading Extended CSD health registers...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await rpmbEmmcHealthEngine.probeStorageHealth(addLog);
    if (res.success) {
      setHealth(res.health);
      const msg = isAr 
        ? `✅ تم قراءة صحة ذاكرة (${res.health.storageType} - ${res.health.vendor}) بنجاح!`
        : `✅ Health read for ${res.health.storageType} (${res.health.vendor})!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleVerifyRpmb = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Verifying RPMB Key HMAC SHA-256 with SoC Hardware Keystore...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await rpmbEmmcHealthEngine.verifyRpmbKey(addLog);
    if (res.success) {
      const msg = isAr 
        ? '✅ مفتاح الـ RPMB متطابق 100% مع معالج الهاتف! الأمان ومانع الرجوع سليم تماماً.'
        : '✅ RPMB Key verified 100% matched with CPU Keystore!';
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
          <div className="p-3 bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 rounded-xl shadow-lg shadow-teal-500/20">
            <HardDrive className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                {isAr ? 'مختبر فحص صحة الذاكرة ومفتاح RPMB (eMMC / UFS Health & RPMB Lab)' : 'eMMC / UFS Health & RPMB Key Studio'}
              </h1>
              <span className="bg-teal-500/10 text-teal-400 text-xs px-2.5 py-0.5 rounded-full border border-teal-500/20 font-mono font-bold">
                Extended CSD & Wear Out 0-100%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'فحص نسبة استهلاك خلايا الذاكرة (SLC/MLC)، قراءة CID و Serial، ومطابقة مفتاح الـ RPMB المشفر مع المعالج'
                : 'Direct Extended CSD register probe, SLC/MLC wear out estimation, CID reader, and RPMB HMAC key analyzer'}
            </p>
          </div>
        </div>

        <button
          onClick={handleProbeHealth}
          disabled={isExecuting}
          className="bg-slate-950 hover:bg-slate-800 text-teal-300 border border-slate-800 hover:border-teal-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isAr ? 'قراءة صحة الذاكرة' : 'Probe Memory Health'}</span>
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
        {/* Left: Memory Life & RPMB Gauges */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-teal-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Activity className="w-4 h-4" />
              <span>{isAr ? 'بيانات صحة شرائح الذاكرة (JEDEC JESD220)' : 'Memory Health Telemetry'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Type & Manufacturer:</span>
                <span className="font-bold text-white">{health.storageType} ({health.vendor})</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Pre-EOL Wear Status:</span>
                <span className="font-bold text-emerald-400">{health.preEolInfo}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SLC Life Used (Type A):</span>
                <span className="font-bold text-teal-300">{health.deviceLifeTimeEstA}% Used</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MLC Life Used (Type B):</span>
                <span className="font-bold text-teal-300">{health.deviceLifeTimeEstB}% Used</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 block text-[10px] mb-1">eMMC/UFS CID (Card Identification Data):</span>
              <span className="font-bold text-slate-300 break-all">{health.cid}</span>
            </div>
          </div>

          {/* 1-Click Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'فحص ومطابقة مفتاح RPMB المشفر' : 'RPMB Cryptographic Verification'}</span>
            </span>

            <button
              onClick={handleVerifyRpmb}
              disabled={isExecuting}
              className="w-full p-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl shadow-lg shadow-teal-600/20 text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
            >
              <div>
                <div className="font-black text-xs">{isAr ? 'مطابقة مفتاح الـ RPMB مع المعالج' : '1-Click Verify RPMB HMAC SHA-256 Key'}</div>
                <div className="text-[10px] text-teal-200">{isAr ? 'التأكد من سلامة التشفير وعدم تلف مفتاح الأمان' : 'Verifies TrustZone hardware key binding'}</div>
              </div>
              <ShieldCheck className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Right: Console */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[420px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-slate-200">Memory Extended CSD Live Stream</span>
            </div>
            <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              JESD220
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('EXT_CSD') || l.includes('RPMB')
                    ? 'text-teal-300'
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
