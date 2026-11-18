import React, { useState } from 'react';
import { 
  Smartphone, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Radio, 
  Sliders, 
  HardDrive, 
  Cpu, 
  Key, 
  ShieldAlert, 
  Sparkles,
  Wifi
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  appleRamdiskEngine, 
  AppleDeviceProfile, 
  SUPPORTED_APPLE_DEVICES 
} from '../services/AppleRamdiskEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const AppleRamdiskStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [selectedDevice, setSelectedDevice] = useState<AppleDeviceProfile>(SUPPORTED_APPLE_DEVICES[0]);
  const [activeStep, setActiveStep] = useState<'PWN_DFU' | 'BOOT_RAMDISK' | 'SIGNAL_BYPASS' | 'PURPLE_MODE'>('PWN_DFU');
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Apple Checkm8 Ramdisk & Purple Diag Studio v2026.9 initialized.',
    'A7-A11 Bionic SecureROM Exploit Core Ready.',
    'Connect target iPhone in DFU mode (Hold Power + Volume Down).'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[APPLE_RAMDISK] ${m}`);
  };

  const handleExecutePwnDfu = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Injecting Checkm8 Pwned DFU payload for ${selectedDevice.model}...`);
    realUsbService.playContinuityBeep(120, 2200);

    const res = await appleRamdiskEngine.sendPwnDfuExploit(selectedDevice, addLog);
    if (res.success) {
      setActiveStep('BOOT_RAMDISK');
      const msg = isAr 
        ? `✅ تم كسر حماية SecureROM (Pwned DFU) لهاتف ${selectedDevice.model} بنجاح!`
        : `✅ Pwned DFU mode active on ${selectedDevice.model}!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleBootRamdisk = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Streaming Darwin Kernel and mounting /mnt1 & /mnt2...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await appleRamdiskEngine.bootSshRamdisk(addLog);
    if (res.success) {
      setActiveStep('SIGNAL_BYPASS');
      const msg = isAr 
        ? '✅ تم إقلاع الـ Ramdisk وتشغيل سيرفر SSH Root فوق الـ USB بنجاح!'
        : '✅ SSH Ramdisk booted & root filesystem mounted successfully!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 3000);
    }

    setIsExecuting(false);
  };

  const handleBypassWithSignal = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Reading FairPlay tokens and bypassing Passcode/Activation Lock with network signal...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await appleRamdiskEngine.bypassActivationWithSignal(addLog);
    if (res.success) {
      const msg = isAr 
        ? '✅ تم بنجاح تخطي رمز القفل وحساب الآيكلود مع تشغيل المكالمات والشبكة 4G/5G بالكامل!'
        : '✅ Passcode & iCloud bypassed with full SIM & 4G/5G Cellular Signal!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3400);
    }

    setIsExecuting(false);
  };

  const handleBootPurple = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Booting device into Purple Diag Mode for SysCfg editing...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await appleRamdiskEngine.bootPurpleMode(addLog);
    if (res.success) {
      const msg = isAr 
        ? '✅ تم تحويل شاشة الآيفون إلى اللون البنفسجي (Purple Mode) وفك قفل الواي فاي وتعديل السيريال!'
        : '✅ Purple Mode online! Ready for Wi-Fi unbind & serial rewrite.';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 3200);
    }

    setIsExecuting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
                {isAr ? 'استوديو الآيفون والرام ديسك ووضع البوربل (Apple Ramdisk & Purple Diag)' : 'Apple Checkm8 Ramdisk & Purple Diag Studio'}
              </h1>
              <span className="bg-purple-500/10 text-purple-400 text-xs px-2.5 py-0.5 rounded-full border border-purple-500/20 font-mono font-bold">
                A7-A11 Bionic Exploit
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'حقن ثغرة Checkm8، إقلاع SSH Ramdisk، تخطي رمز القفل والآيكلود مع تشغيل الشبكة ووضع البوربل'
                : 'Checkm8 DFU exploit, SSH Ramdisk root tunnel, Passcode bypass with full SIM signal, and Purple Diag'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="bg-slate-950 text-purple-300 px-3 py-1.5 rounded-xl border border-slate-800">
            Baseband: {selectedDevice.basebandType}
          </span>
          <span className="bg-slate-950 text-emerald-300 px-3 py-1.5 rounded-xl border border-slate-800">
            CPID: {selectedDevice.cpidHex}
          </span>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Device Selection & Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-purple-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'اختر موديل الآيفون المستهدف' : 'Select Apple Device Target'}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUPPORTED_APPLE_DEVICES.map((d) => (
                <button
                  key={d.model}
                  onClick={() => setSelectedDevice(d)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedDevice.model === d.model
                      ? 'bg-purple-500/15 border-purple-500/50 text-purple-200 shadow-md shadow-purple-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-extrabold text-xs text-white">{d.model}</div>
                  <div className="text-[10px] text-slate-400 font-mono">SoC: {d.chipset} Bionic</div>
                </button>
              ))}
            </div>
          </div>

          {/* 1-Click Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-indigo-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'مراحل العمليات والكسر' : 'Execution Pipeline'}</span>
            </span>

            <div className="space-y-2.5">
              <button
                onClick={handleExecutePwnDfu}
                disabled={isExecuting}
                className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-xl text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="text-purple-400 font-bold text-xs">{isAr ? '1. كسر حماية DFU (Checkm8 Pwned DFU)' : '1. Pwn DFU Mode (Checkm8)'}</div>
                  <div className="text-[10px] text-slate-400">{isAr ? 'تجاوز توقيع SecureROM عبر ثغرة الـ USB' : 'SecureROM USB heap exploit'}</div>
                </div>
                <Play className="w-4 h-4 text-purple-400 fill-current" />
              </button>

              <button
                onClick={handleBootRamdisk}
                disabled={isExecuting}
                className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-violet-500/50 rounded-xl text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="text-violet-400 font-bold text-xs">{isAr ? '2. إقلاع SSH Ramdisk وتوصيل الذاكرة' : '2. Boot SSH Ramdisk'}</div>
                  <div className="text-[10px] text-slate-400">{isAr ? 'تشغيل نفق SSH وعمل Mount للبارتشنات' : 'Mounts /mnt1 & /mnt2 over USB'}</div>
                </div>
                <Play className="w-4 h-4 text-violet-400 fill-current" />
              </button>

              <button
                onClick={handleBypassWithSignal}
                disabled={isExecuting}
                className="w-full p-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-purple-600/20 text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="font-black text-xs">{isAr ? '3. تخطي القفل وتشغيل الشبكة (Passcode + Signal Bypass)' : '3. Passcode & iCloud Bypass with Signal'}</div>
                  <div className="text-[10px] text-purple-200">{isAr ? 'استرجاع ملفات التفعيل وتشغيل الـ SIM' : 'Preserves Baseband FairPlay tokens'}</div>
                </div>
                <Radio className="w-5 h-5 text-white animate-pulse" />
              </button>

              <button
                onClick={handleBootPurple}
                disabled={isExecuting}
                className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/50 rounded-xl text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="text-pink-400 font-bold text-xs">{isAr ? '4. وضع البوربل وفك قفل الواي فاي (Purple Mode)' : '4. Boot Purple Diag Mode'}</div>
                  <div className="text-[10px] text-slate-400">{isAr ? 'تعديل السيريال والـ MAC بدون فك البوردة' : 'SysCfg serial & Wi-Fi unbind'}</div>
                </div>
                <Sparkles className="w-4 h-4 text-pink-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Console */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[480px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-slate-200">{isAr ? 'سجل عمليات النواة و Apple DFU' : 'Live Apple DFU & Ramdisk Log'}</span>
            </div>
            <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Darwin Shell Online
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('CHECKM8') || l.includes('RAMDISK')
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
