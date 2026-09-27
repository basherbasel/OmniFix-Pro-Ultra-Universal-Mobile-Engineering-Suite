import React, { useState } from 'react';
import { 
  Terminal, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  Unlock, 
  Radio, 
  Flame, 
  Wrench, 
  Layers, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { realUsbService } from '../services/realUsbService';

interface ToolExecutorProps {
  device: ConnectedDevice;
  lang: 'en' | 'ar';
}

export const ToolExecutionHub: React.FC<ToolExecutorProps> = ({ device, lang }) => {
  const isAr = lang === 'ar';
  const [executing, setExecuting] = useState<boolean>(false);
  const [activeCommand, setActiveCommand] = useState<string>('');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);

  // Play audio continuity beep feedback on execution progress
  const playBeep = (freq: number = 880, duration: number = 0.1) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch {
      // Ignored if browser limits audio autoplay
    }
  };

  const runSelectedTool = async (commandKey: string) => {
    setExecuting(true);
    setActiveCommand(commandKey);
    setProgress(5);
    playBeep(980, 0.15);
    
    setConsoleLogs([
      isAr 
        ? `[*] جاري تهيئة الاتصال بالمنفذ الفعلي للجهاز: ${device.brand} ${device.model} [الوضع: ${device.mode}]...`
        : `[*] Connecting to physical target: ${device.brand} ${device.model} [Mode: ${device.mode}]...`
    ]);

    try {
      const response = await fetch('/api/master/execute-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devicePath: device.socId || "PORT_COM3",
          commandKey: commandKey,
          chipset: device.chipset,
          mode: device.mode,
          extraPayload: "PRO_SESSION_ACTIVE",
          lang: lang
        })
      });

      const data = await response.json();
      const serverLogs: string[] = data.logs || [];

      // Sequentially print logs to make the visual UI extremely professional and high-fidelity
      for (let i = 0; i < serverLogs.length; i++) {
        await new Promise((r) => setTimeout(r, 220));
        setConsoleLogs(prev => [...prev, serverLogs[i]]);
        setProgress(Math.min(100, Math.round(((i + 1) / serverLogs.length) * 95)));
        playBeep(880, 0.08);
      }

      setProgress(100);
      playBeep(1200, 0.25);
    } catch (error: any) {
      setConsoleLogs(prev => [
        ...prev, 
        isAr 
          ? `[!] فشل الاتصال والتشغيل العتادي: ${error.message}` 
          : `[!] Hardware Execution Failed: ${error.message}`
      ]);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl relative overflow-hidden my-6">
      {/* Visual background ambient glow */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            {isAr ? 'منصة العمليات الموحدة والاتصال العتادي الفعلي' : 'Universal GSM & Odin High-Speed Tool Execution Hub'}
            <span className="text-[10px] px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-mono uppercase">Master v4.2</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr ? 'تشغيل حقيقي ومباشر لكافة قوالب الفك والتصفير عتادياً بدون أخطاء' : 'Production-Ready Direct Hardware Port Executions for Fastboot, BROM, EDL, and Loke'}
          </p>
        </div>
        <div className="text-xs font-mono bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-slate-300 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>{isAr ? 'قناة الاتصال:' : 'Interface:'} <strong className="text-emerald-400">{device.brand} ({device.mode})</strong></span>
        </div>
      </div>

      {/* Grid containing master operation buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
        {/* Samsung Odin High Speed tool */}
        <button
          disabled={executing}
          onClick={() => runSelectedTool('ODIN_SAMSUNG_FRP_BYPASS')}
          className="p-4 bg-gradient-to-r from-blue-950/50 to-slate-900/90 hover:from-blue-900/70 hover:to-slate-850 border border-blue-500/30 hover:border-blue-500/60 rounded-xl text-xs font-semibold text-left transition text-blue-300 flex items-start gap-3 shadow-md shadow-blue-950/20 cursor-pointer disabled:opacity-50"
        >
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[13px]">{isAr ? 'تخطي حماية FRP أودين هاي سبيد' : 'Samsung Odin FRP Bypass'}</div>
            <div className="text-[10px] text-slate-400 mt-1 leading-normal">{isAr ? 'تصفير قفل حساب جوجل عبر بروتوكول Loke السريع' : 'Clears FRP directly via high-speed physical Loke Download Mode blocks'}</div>
          </div>
        </button>

        <button
          disabled={executing}
          onClick={() => runSelectedTool('ODIN_PIT_REPARTITION_FIX')}
          className="p-4 bg-gradient-to-r from-blue-950/50 to-slate-900/90 hover:from-blue-900/70 hover:to-slate-850 border border-blue-500/30 hover:border-blue-500/60 rounded-xl text-xs font-semibold text-left transition text-blue-300 flex items-start gap-3 shadow-md shadow-blue-950/20 cursor-pointer disabled:opacity-50"
        >
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[13px]">{isAr ? 'إصلاح وسحب الـ PIT سامسونج' : 'Odin PIT Re-Partition & Fix'}</div>
            <div className="text-[10px] text-slate-400 mt-1 leading-normal">{isAr ? 'سحب جدول PIT العتادي وتصحيح قطاعات التخزين' : 'Pulls device PIT structure index & aligns damaged memory sectors'}</div>
          </div>
        </button>

        {/* OEM Unlock Fastboot */}
        <button
          disabled={executing}
          onClick={() => runSelectedTool('FASTBOOT_OEM_UNLOCK_FORCE')}
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/30 rounded-xl text-xs font-semibold text-left transition flex items-start gap-3 cursor-pointer disabled:opacity-50"
        >
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Unlock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[13px]">{isAr ? 'فتح البوتلودر إجبارياً' : 'Force OEM Bootloader Unlock'}</div>
            <div className="text-[10px] text-slate-400 mt-1 leading-normal">{isAr ? 'إرسال أوامر فاستبوت الإجبارية لفتح الحماية' : 'Dispatches universal Fastboot unlock sequence to wipe secure lock tags'}</div>
          </div>
        </button>

        {/* Fastboot Security Wipe */}
        <button
          disabled={executing}
          onClick={() => runSelectedTool('FASTBOOT_FRP_WIPE')}
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/30 rounded-xl text-xs font-semibold text-left transition flex items-start gap-3 cursor-pointer disabled:opacity-50"
        >
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[13px]">{isAr ? 'مسح حماية FRP فاستبوت' : 'Fastboot Security FRP Wipe'}</div>
            <div className="text-[10px] text-slate-400 mt-1 leading-normal">{isAr ? 'تصفير قطاع frp و persistent بالكامل' : 'Wipes secure partitions (frp, config, persistent) directly'}</div>
          </div>
        </button>

        {/* Qualcomm EDL */}
        <button
          disabled={executing}
          onClick={() => runSelectedTool('QUALCOMM_EDL_FRP_BYPASS')}
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/30 rounded-xl text-xs font-semibold text-left transition flex items-start gap-3 cursor-pointer disabled:opacity-50"
        >
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[13px]">{isAr ? 'تخطي حماية كوالكوم EDL 9008' : 'Qualcomm EDL (9008) Bypass'}</div>
            <div className="text-[10px] text-slate-400 mt-1 leading-normal">{isAr ? 'حقن بروتوكول Sahara وفورمات قنوات الـ UFS' : 'Engages Sahara v3 handshake & writes sector wipe to active storage'}</div>
          </div>
        </button>

        {/* MediaTek SLA Bypass */}
        <button
          disabled={executing}
          onClick={() => runSelectedTool('MTK_BROM_FRP_BYPASS')}
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/30 rounded-xl text-xs font-semibold text-left transition flex items-start gap-3 cursor-pointer disabled:opacity-50"
        >
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[13px]">{isAr ? 'تخطي حمايات ميديا تيك BROM' : 'MediaTek BROM / SLA Bypass'}</div>
            <div className="text-[10px] text-slate-400 mt-1 leading-normal">{isAr ? 'تعطيل حماية Preloader SLA/DAA وتمرير الـ DA' : 'Bypasses hardware authentication checks and clears NVRAM regions'}</div>
          </div>
        </button>
      </div>

      {/* Progress Bar */}
      {executing && (
        <div className="mb-4 space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>{isAr ? 'معدل التقدم العتادي الكلي للعملية' : 'Overall Hardware Pipeline Progress'}</span>
            <span className="text-indigo-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-300 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Live execution stream terminal */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-cyan-400" />
            {isAr ? 'مستشعر تدفق قنوات العتاد والاتصال (Telemetry)' : 'Live Hardware Telemetry Terminal'}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            executing ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {executing ? (isAr ? 'جاري إرسال الحزم...' : 'Executing Tool Protocol...') : (isAr ? 'المنظومة مستقرة وجاهزة' : 'System Ready')}
          </span>
        </div>
        <pre className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl h-44 overflow-y-auto text-xs font-mono text-emerald-400 leading-relaxed shadow-inner">
          {consoleLogs.length === 0 ? (
            <span className="text-slate-600">
              {isAr ? '// حدد أي أداة من الأعلى للاتصال الفعلي بالهاتف وبدء عملية التصفير والفك تلقائياً...' : '// Select any tool above to begin real-time hardware execution...'}
            </span>
          ) : (
            consoleLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-slate-600 select-none">›</span>
                <span className={log.includes('Successfully') || log.includes('بنجاح') || log.includes('OKAY') || log.includes('SUCCESS') ? 'text-emerald-300 font-semibold' : log.includes('[!]') || log.includes('Error') ? 'text-amber-400' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))
          )}
        </pre>
      </div>
    </div>
  );
};
