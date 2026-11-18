import React, { useState } from 'react';
import { 
  Smartphone, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  ShieldAlert, 
  Cpu, 
  Radio, 
  Download, 
  Save, 
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  xiaomiSideloadEngine, 
  XiaomiDeviceTelemetry, 
  SAMPLE_XIAOMI_DEVICES 
} from '../services/XiaomiSideloadEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const XiaomiSideloadStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [targetDevice, setTargetDevice] = useState<XiaomiDeviceTelemetry>(SAMPLE_XIAOMI_DEVICES[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Xiaomi Mi Assistant Sideload & HyperOS/MIUI Security Suite v2026.9 initialized.',
    'Sideload Recovery 5.0 Daemon Ready.',
    'Connect Xiaomi / Redmi / POCO in Recovery Mode (Connect with MIAssistant).'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[XIAOMI_STUDIO] ${m}`);
  };

  const handleProbeDevice = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Probing Xiaomi device over Sideload USB endpoint...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await xiaomiSideloadEngine.probeRecoverySideload(addLog);
    if (res.success) {
      setTargetDevice(res.device);
      const msg = isAr 
        ? `✅ تم التعرف على هاتف ${res.device.marketName} (${res.device.codename}) بنجاح!`
        : `✅ Xiaomi ${res.device.marketName} identified successfully!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleResetMiAccount = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Initiating Mi Account & FRP Reset for ${targetDevice.marketName}...`);
    realUsbService.playContinuityBeep(120, 2400);

    const res = await xiaomiSideloadEngine.resetMiAccountSideload(targetDevice.codename, addLog);
    if (res.success) {
      setTargetDevice(prev => ({ ...prev, findDeviceStatus: 'OFF' }));
      const msg = isAr 
        ? '✅ تم بنجاح حذف حساب شاومي (Mi Account) وقفل FRP وإيقاف العثور على الجهاز دون فتح البوت لودر!'
        : '✅ Mi Account & FRP removed permanently via Sideload!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  const handleRebootEdl = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Sending Fastboot to EDL reboot command...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await xiaomiSideloadEngine.rebootFastbootToEdl(addLog);
    if (res.success) {
      setCurrentDevice({
        ...device,
        mode: 'EDL_9008',
        port: 'Qualcomm HS-USB QDLoader 9008 [COM3]'
      });

      const msg = isAr 
        ? '✅ تم تحويل الهاتف من Fastboot إلى وضع كوالكوم EDL 9008 بنجاح!'
        : '✅ Device rebooted to Qualcomm EDL 9008!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 3000);
    }

    setIsExecuting(false);
  };

  const handleBackupQcn = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Reading dual-SIM calibration & generating QCN for ${targetDevice.codename}...`);
    realUsbService.playContinuityBeep(120, 2400);

    const res = await xiaomiSideloadEngine.backupQcnModem(targetDevice.codename, addLog);
    if (res.success) {
      const msg = isAr 
        ? `✅ تم سحب نسخة احتياطية لملف الشبكة والسيريال (${res.qcnFileName}) بنجاح!`
        : `✅ QCN Dual-SIM calibration saved as ${res.qcnFileName}!`;
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
          <div className="p-3 bg-gradient-to-tr from-amber-600 via-orange-600 to-red-600 rounded-xl shadow-lg shadow-orange-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-red-400 bg-clip-text text-transparent">
                {isAr ? 'استوديو شاومي وسايد لود (Xiaomi Sideload & HyperOS Pro)' : 'Xiaomi Sideload & HyperOS/MIUI Security Suite'}
              </h1>
              <span className="bg-orange-500/10 text-orange-400 text-xs px-2.5 py-0.5 rounded-full border border-orange-500/20 font-mono font-bold">
                Recovery 5.0 & Diag
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'فك حساب Mi Account بوضع السايد لود بدون فتح البوت لودر، التحويل لـ EDL 9008 وسحب ملفات QCN للشبكة'
                : 'Mi Account & FRP reset in Sideload Mode (BL Locked), Fastboot-to-EDL reboot, and QCN calibration'}
            </p>
          </div>
        </div>

        <button
          onClick={handleProbeDevice}
          disabled={isExecuting}
          className="bg-slate-950 hover:bg-slate-800 text-orange-400 border border-slate-800 hover:border-orange-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isAr ? 'قراءة بيانات السايد لود' : 'Probe Sideload'}</span>
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
        {/* Left: Device Telemetry & Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-orange-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'معلومات جهاز شاومي المتصل' : 'Connected Xiaomi Telemetry'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'الموديل والتسمية:' : 'Model & Codename:'}</span>
                <span className="font-bold text-white">{targetDevice.marketName} ({targetDevice.codename})</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'إصدار النظام والمنطقة:' : 'OS & Region:'}</span>
                <span className="font-bold text-orange-300">{targetDevice.miuiVersion} [{targetDevice.region}]</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'حالة البوت لودر:' : 'Bootloader Lock:'}</span>
                <span className={`font-bold ${targetDevice.bootloaderLocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {targetDevice.bootloaderLocked ? 'LOCKED' : 'UNLOCKED'}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'حساب شاومي (Find Device):' : 'Find Device Cloud:'}</span>
                <span className={`font-bold ${targetDevice.findDeviceStatus === 'ON' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {targetDevice.findDeviceStatus === 'ON' ? 'ACTIVATED (ON)' : 'CLEAN (OFF)'}
                </span>
              </div>
            </div>
          </div>

          {/* 1-Click Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'عمليات شاومي السريعة' : 'Xiaomi 1-Click Operations'}</span>
            </span>

            <div className="space-y-2.5">
              <button
                onClick={handleResetMiAccount}
                disabled={isExecuting}
                className="w-full p-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white rounded-xl shadow-lg shadow-orange-600/20 text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
              >
                <div>
                  <div className="font-black text-xs">{isAr ? 'حذف حساب Mi Account و FRP (وضع السايد لود)' : '1-Click Mi Account & FRP Reset (Sideload)'}</div>
                  <div className="text-[10px] text-amber-200">{isAr ? 'يعمل بدون الحاجة لفتح البوت لودر (Recovery 5.0)' : 'Works on Locked Bootloader'}</div>
                </div>
                <Zap className="w-5 h-5 text-white" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleRebootEdl}
                  disabled={isExecuting}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <Cpu className="w-4 h-4" />
                    <span>{isAr ? 'التحويل من Fastboot إلى EDL' : 'Fastboot to EDL 9008'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{isAr ? 'إرسال أمر oem edl المباشر' : 'Direct EDL cable emulation'}</span>
                </button>

                <button
                  onClick={handleBackupQcn}
                  disabled={isExecuting}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Radio className="w-4 h-4" />
                    <span>{isAr ? 'سحب ملف شبكة QCN' : 'Backup Dual-SIM QCN'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{isAr ? 'حفظ السيريال 1 و 2 ومعايرة RF' : 'Preserves IMEI1/2 & NV items'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Console */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[460px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-slate-200">{isAr ? 'سجل عمليات Xiaomi Sideload المباشر' : 'Live Xiaomi Sideload Stream'}</span>
            </div>
            <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Recovery 5.0
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('MI_ACCOUNT') || l.includes('QCN')
                    ? 'text-orange-300'
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
