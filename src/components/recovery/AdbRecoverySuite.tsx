import React, { useState } from 'react';
import { 
  Terminal, 
  RefreshCw, 
  Download, 
  Smartphone, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  FileCode,
  HardDrive
} from 'lucide-react';
import { ConnectedDevice } from '../../types';

interface AdbRecoverySuiteProps {
  device: ConnectedDevice | null;
  lang?: 'en' | 'ar';
}

export const AdbRecoverySuite: React.FC<AdbRecoverySuiteProps> = ({ device, lang = 'ar' }) => {
  const isAr = lang === 'ar';
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [otaFileName, setOtaFileName] = useState<string>('ota_update_system_2026.zip');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    isAr 
      ? 'جاهز للاستماع لأوامر الـ ADB والتعافي (Recovery)...' 
      : 'Ready for ADB and recovery diagnostic commands...'
  ]);

  // Audio feedback helper
  const playBeep = (freq: number = 880, duration: number = 0.15) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch {}
  };

  const handleRebootRecovery = async () => {
    setIsExecuting(true);
    setActiveStep('reboot');
    setProgress(0);
    playBeep(700, 0.2);

    const initialLogs = [
      isAr 
        ? `[*] جاري بدء عملية إعادة التشغيل إلى وضع الريكفري...` 
        : `[*] Initializing reboot sequence to Android Recovery Mode...`,
      `[CMD] adb reboot recovery`
    ];
    setLogs(initialLogs);

    try {
      const response = await fetch('/api/master/execute-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandKey: 'REBOOT_RECOVERY',
          devicePath: device?.socId || 'PORT_COM3',
          lang: lang
        })
      });

      const data = await response.json();
      const serverLogs = data.logs || [];

      // Stream logs sequentially
      for (let i = 0; i < serverLogs.length; i++) {
        await new Promise(r => setTimeout(r, 180));
        setLogs(prev => [...prev, serverLogs[i]]);
        setProgress(Math.round(((i + 1) / serverLogs.length) * 100));
        playBeep(850, 0.05);
      }
    } catch (e: any) {
      setLogs(prev => [...prev, `[!] Error: ${e.message}`]);
    } finally {
      setIsExecuting(false);
      setActiveStep(null);
      playBeep(1200, 0.25);
    }
  };

  const handleSideloadUpdate = async () => {
    setIsExecuting(true);
    setActiveStep('sideload');
    setProgress(0);
    playBeep(750, 0.2);

    const initialLogs = [
      isAr 
        ? `[*] جاري تحضير حزمة التحديث البرمجي [${otaFileName}] للبث السريع...` 
        : `[*] Preparing OTA system package [${otaFileName}] for high-speed streaming...`,
      `[CMD] adb sideload ${otaFileName}`
    ];
    setLogs(initialLogs);

    try {
      const response = await fetch('/api/master/execute-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandKey: 'ADB_UPDATE_SIDELOAD',
          devicePath: device?.socId || 'PORT_COM3',
          lang: lang
        })
      });

      const data = await response.json();
      const serverLogs = data.logs || [];

      // Stream logs sequentially with progress updates
      for (let i = 0; i < serverLogs.length; i++) {
        await new Promise(r => setTimeout(r, 220));
        setLogs(prev => [...prev, serverLogs[i]]);
        setProgress(Math.round(((i + 1) / serverLogs.length) * 100));
        playBeep(900, 0.04);
      }
    } catch (e: any) {
      setLogs(prev => [...prev, `[!] Sideload Failure: ${e.message}`]);
    } finally {
      setIsExecuting(false);
      setActiveStep(null);
      playBeep(1300, 0.3);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.zip';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        setOtaFileName(file.name);
        playBeep(1000, 0.1);
        setLogs(prev => [
          ...prev, 
          isAr 
            ? `[+] تم تحميل الحزمة يدوياً بنجاح: ${file.name} (${Math.round(file.size / 1024 / 1024)} ميجابايت)` 
            : `[+] OTA file loaded successfully: ${file.name} (${Math.round(file.size / 1024 / 1024)} MB)`
        ]);
      }
    };
    fileInput.click();
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 text-slate-100 shadow-2xl relative overflow-hidden my-6">
      {/* Decorative light reflection */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-emerald-400 flex items-center gap-2.5">
            <Smartphone className="w-5 h-5" />
            {isAr ? 'حزمة استرداد وإصلاح الـ ADB Recovery & Sideload' : 'ADB Recovery & Firmware Sideload Suite'}
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono uppercase">OTA Engine v3.1</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'تنفيذ أوامر استرداد الريكفري وبث حزم التحديثات والترميم الرسمية للنظام' : 'Execute official OTA restoration, recovery booting, and system sideload updates'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl">
          <span className={`w-2.5 h-2.5 rounded-full ${device ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
          <span className="text-xs font-mono text-slate-300">
            {device ? `${device.brand} (${device.mode})` : (isAr ? 'غير متصل' : 'No Device')}
          </span>
        </div>
      </div>

      {/* Tool settings & File uploader */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block">
              {isAr ? '1. حزمة التحديث المستهدفة (OTA Package):' : '1. Target OTA Update Package:'}
            </span>
            <div className="flex items-center justify-between gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <FileCode className="w-5 h-5 text-indigo-400 shrink-0" />
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-semibold text-slate-200 truncate">{otaFileName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {selectedFile ? `${Math.round(selectedFile.size / 1024 / 1024)} MB | Local Zip` : `Defensive Recovery Image`}
                  </div>
                </div>
              </div>
              <button
                disabled={isExecuting}
                onClick={triggerFileInput}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-[11px] font-mono rounded cursor-pointer transition-colors"
              >
                {isAr ? 'تصفح' : 'Browse'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-3.5">
          <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block">
            {isAr ? '2. تشغيل الأوامر العتادية:' : '2. Trigger Diagnostics:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Reboot Recovery Button */}
            <button
              disabled={isExecuting || !device}
              onClick={handleRebootRecovery}
              className="py-3.5 px-4 bg-gradient-to-r from-slate-900 to-slate-850 hover:from-slate-850 hover:to-slate-800 border border-slate-800 hover:border-emerald-500/20 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${activeStep === 'reboot' ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'إعادة الإقلاع للريكفري' : 'Reboot Recovery'}</span>
            </button>

            {/* Sideload OTA Button */}
            <button
              disabled={isExecuting || !device}
              onClick={handleSideloadUpdate}
              className="py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/20 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 shadow-lg shadow-emerald-950/40"
            >
              <Download className={`w-3.5 h-3.5 ${activeStep === 'sideload' ? 'animate-bounce' : ''}`} />
              <span>{isAr ? 'تثبيت التحديث Sideload' : 'Apply Update (Sideload)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Monitor */}
      {isExecuting && (
        <div className="mb-5 space-y-1.5 animate-fadeIn">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>{activeStep === 'reboot' ? (isAr ? 'جاري إعادة التشغيل...' : 'Rebooting device...') : (isAr ? 'جاري بث ونقل الفلاشة...' : 'Sideloading OTA package...')}</span>
            </span>
            <span className="text-emerald-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-950 border border-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Terminal Output Console */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>ADB Terminal Console Logs</span>
          </span>
          <span className="text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            {isExecuting ? (isAr ? 'بث نشط...' : 'Active Session') : (isAr ? 'مستعد' : 'Standby')}
          </span>
        </div>
        <pre className="bg-slate-950/95 border border-slate-800/90 rounded-xl p-4 h-48 overflow-y-auto text-xs font-mono text-emerald-400 leading-relaxed shadow-inner">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2.5 py-0.5">
              <span className="text-slate-600 select-none">›</span>
              <span className={log.includes('successfully') || log.includes('اكتمل') || log.includes('[+]') ? 'text-emerald-300 font-semibold' : log.includes('Error') || log.includes('[!]') ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {log}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};
