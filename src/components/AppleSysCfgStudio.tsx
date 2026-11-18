import React, { useState } from 'react';
import { 
  Smartphone, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Wifi, 
  Bluetooth, 
  Edit3, 
  Save, 
  ShieldCheck, 
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  appleSysCfgEngine, 
  SysCfgData, 
  SAMPLE_SYSCFG_DATA 
} from '../services/AppleSysCfgEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const AppleSysCfgStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';

  const [syscfg, setSyscfg] = useState<SysCfgData>(SAMPLE_SYSCFG_DATA);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Apple Purple Mode & SysCfg NAND Reprogrammer v2026.9 initialized.',
    'A7-A11 Checkm8 USB Diag Serial Driver Online.',
    'Put device into Purple Diagnostic Mode to read/edit SysCfg and unbind Wi-Fi.'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[SYSCFG_STUDIO] ${m}`);
  };

  const handleReadSysCfg = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Reading SysCfg parameters from NAND via Diag port...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await appleSysCfgEngine.readSysCfg(addLog);
    if (res.success) {
      setSyscfg(res.syscfg);
      const msg = isAr 
        ? `✅ تم قراءة بيانات SysCfg لهاتف (${res.syscfg.regulatoryModel}) بنجاح!`
        : `✅ SysCfg data read successfully for ${res.syscfg.regulatoryModel}!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleUnbindWifi = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Unbinding Wi-Fi IC in NAND SysCfg (Fix Error 4013)...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await appleSysCfgEngine.unbindWifi(addLog);
    if (res.success) {
      setSyscfg(prev => ({ ...prev, wifiUnbound: true }));
      const msg = isAr 
        ? '✅ تم فك ارتباط الواي فاي بنجاح (Wi-Fi Unbind)! يمكنك الآن تغيير آيسي الواي فاي دون الحاجة لمبرمجة هاردوير.'
        : '✅ Wi-Fi Unbound successfully in SysCfg!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  const handleWriteSysCfg = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Writing updated SysCfg to NAND memory...');
    realUsbService.playContinuityBeep(120, 2300);

    const res = await appleSysCfgEngine.writeSysCfg(syscfg, addLog);
    if (res.success) {
      const msg = isAr 
        ? '✅ تم حفظ وكتابة بيانات SysCfg في ذاكرة الـ NAND بنجاح!'
        : '✅ SysCfg written to NAND successfully!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 3000);
    }

    setIsExecuting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                {isAr ? 'استوديو برمجة السيس كونفج والوضع الأرجواني (Apple Purple Mode & SysCfg Studio)' : 'Apple Purple Mode & SysCfg NAND Studio'}
              </h1>
              <span className="bg-purple-500/10 text-purple-400 text-xs px-2.5 py-0.5 rounded-full border border-purple-500/20 font-mono font-bold">
                A7-A11 Diag Port & Wi-Fi Unbind
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'فك ارتباط الواي فاي (Wi-Fi Unbind)، تعديل السيريال والمنطقة (Region)، وتغيير بيانات الـ NAND بدون فك المازربورد'
                : 'SysCfg reader/writer, 1-Click Wi-Fi Unbind (Fix Error 4013), and serial number reprogrammer for A7-A11'}
            </p>
          </div>
        </div>

        <button
          onClick={handleReadSysCfg}
          disabled={isExecuting}
          className="bg-slate-950 hover:bg-slate-800 text-purple-300 border border-slate-800 hover:border-purple-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isAr ? 'قراءة SysCfg' : 'Read SysCfg'}</span>
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
        {/* Left: SysCfg Parameters Editor */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-purple-400 font-mono uppercase flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                <span>{isAr ? 'محرر سجلات الـ NAND SysCfg' : 'NAND SysCfg Registers'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{syscfg.regulatoryModel}</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 text-[10px] block uppercase font-bold mb-1">Serial Number (SrNm):</label>
                <input
                  type="text"
                  value={syscfg.serialNumber}
                  onChange={(e) => setSyscfg({ ...syscfg, serialNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-purple-300 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] block uppercase font-bold mb-1">Model / Region (Mod#):</label>
                  <input
                    type="text"
                    value={syscfg.modelRegion}
                    onChange={(e) => setSyscfg({ ...syscfg, modelRegion: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block uppercase font-bold mb-1">Main Logic Board (MLB#):</label>
                  <input
                    type="text"
                    value={syscfg.mlbSerial}
                    onChange={(e) => setSyscfg({ ...syscfg, mlbSerial: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] block uppercase font-bold mb-1">Wi-Fi MAC (WFil):</label>
                  <input
                    type="text"
                    value={syscfg.wifiMac}
                    onChange={(e) => setSyscfg({ ...syscfg, wifiMac: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block uppercase font-bold mb-1">Bluetooth MAC (BTMb):</label>
                  <input
                    type="text"
                    value={syscfg.btMac}
                    onChange={(e) => setSyscfg({ ...syscfg, btMac: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleWriteSysCfg}
                  disabled={isExecuting}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isAr ? 'كتابة وحفظ في الـ NAND' : 'Write to NAND'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 1-Click Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-fuchsia-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'عمليات آبل الأرجوانية السريعة' : 'Purple Mode 1-Click Tools'}</span>
            </span>

            <button
              onClick={handleUnbindWifi}
              disabled={isExecuting}
              className="w-full p-3.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-purple-600/20 text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
            >
              <div>
                <div className="font-black text-xs">{isAr ? 'فك ارتباط الواي فاي (Wi-Fi Unbind 1-Click)' : '1-Click Wi-Fi Unbind'}</div>
                <div className="text-[10px] text-purple-200">{isAr ? 'إصلاح Error 4013 وتغيير آيسي الواي فاي بدون مبرمجة' : 'Fix Error 4013 & enable Wi-Fi IC swap'}</div>
              </div>
              <Wifi className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Right: Console */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[480px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-slate-200">Apple Diag Live Stream</span>
            </div>
            <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Purple Port
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('PURPLE') || l.includes('SYSCFG')
                    ? 'text-purple-300'
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
