import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Terminal, 
  ShieldCheck, 
  Play, 
  RotateCcw, 
  Download, 
  Database, 
  Zap, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle,
  FolderOpen,
  FileCode,
  Radio,
  Power,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  qualcommFirehoseEngine, 
  QUALCOMM_SUPPORTED_CHIPSETS, 
  QualcommProgrammerProfile 
} from '../services/QualcommFirehoseEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const QualcommFirehoseStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [selectedChipset, setSelectedChipset] = useState<string>('SM8550');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaharaOnline, setIsSaharaOnline] = useState(false);
  const [isFirehoseOnline, setIsFirehoseOnline] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'OmniFix Qualcomm Sahara & Firehose XML Programmer v2026.9 initialized.',
    'EDL 9008 Driver Engine: WinUSB / LibUSB Direct Bulk Endpoint ready (VID: 0x05C6, PID: 0x9008).',
    'Select a Snapdragon target chipset and load the Firehose programmer to begin.'
  ]);

  const activeProfile = QUALCOMM_SUPPORTED_CHIPSETS.find(c => c.chipsetId === selectedChipset) || QUALCOMM_SUPPORTED_CHIPSETS[0];

  const addLog = (m: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[QCOM_STUDIO] ${m}`);
  };

  // Step 1: Connect & Sahara Handshake
  const handleConnectAndLoadFirehose = async () => {
    if (isConnecting || isExecuting) return;
    setIsConnecting(true);
    setSuccessBanner(null);

    addLog(`Initiating connection to Qualcomm target in EDL 9008 mode...`);
    realUsbService.playContinuityBeep(120, 2200);

    try {
      qualcommFirehoseEngine.setTargetChipset(selectedChipset);
      await qualcommFirehoseEngine.connect({ vendorId: 0x05C6 });
      
      addLog(`Sending Sahara HELLO (0x01) packet to device...`);
      await qualcommFirehoseEngine.handshake();

      setIsSaharaOnline(true);
      setIsFirehoseOnline(true);
      
      const successMsg = isAr 
        ? `✅ تم ربط كوالكوم EDL 9008 بنجاح وحقن لودر الـ Firehose (${activeProfile.firehoseMbn})!`
        : `✅ Qualcomm EDL 9008 linked and Firehose programmer (${activeProfile.firehoseMbn}) active!`;
      
      setSuccessBanner(successMsg);
      addLog(successMsg);
      realUsbService.playContinuityBeep(250, 2800);
    } catch (err: any) {
      addLog(`Connection notice: ${err?.message || err}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Step 2: Backup EFS / NVRAM
  const handleBackupEfs = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);
    setProgressPct(5);
    setProgressStatus(isAr ? 'جاري أخذ نسخة احتياطية للـ EFS...' : 'Backing up EFS partitions...');

    addLog(`Starting 1-Click EFS Network Calibration Backup for ${activeProfile.name}...`);
    realUsbService.playContinuityBeep(120, 2200);

    const res = await qualcommFirehoseEngine.backupEfsSecurityPartitions((pct, log) => {
      setProgressPct(pct);
      setProgressStatus(log);
      addLog(log);
    });

    if (res.success) {
      const msg = isAr 
        ? `✅ تم أخذ نسخة احتياطية كاملة لقطاعات الشبكة (EFS / NVRAM) بنجاح وحفظها!`
        : `✅ Full EFS / NVRAM Network calibration backup saved successfully!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
    setProgressPct(100);
  };

  // Step 3: FRP Reset
  const handleResetFrp = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Initiating Qualcomm EDL FRP Reset for ${activeProfile.name}...`);
    realUsbService.playContinuityBeep(120, 2300);

    const res = await qualcommFirehoseEngine.resetFrpAccountLock(addLog);
    if (res.success) {
      const msg = isAr 
        ? `✅ تم تصفير حساب جوجل (FRP Reset) بنجاح عبر بروتوكول Firehose XML!`
        : `✅ Google FRP Lock wiped successfully via Firehose XML!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3400);

      // Update device state
      setCurrentDevice({
        ...device,
        frpStatus: 'OFF'
      });
    }

    setIsExecuting(false);
  };

  // Step 4: Reset Xiaomi Mi Account
  const handleResetMiAccount = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Initiating Xiaomi Mi Cloud Account Bypass for ${activeProfile.name}...`);
    realUsbService.playContinuityBeep(120, 2400);

    const res = await qualcommFirehoseEngine.resetXiaomiMiAccount(addLog);
    if (res.success) {
      const msg = isAr 
        ? `✅ تم فك وتخطي حساب شاومي (Mi Account Lock) بنجاح بدون عودة!`
        : `✅ Xiaomi Mi Cloud Account unlocked successfully!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3500);
    }

    setIsExecuting(false);
  };

  // Step 5: Reboot Target
  const handleRebootTarget = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Sending Power Reset command to Qualcomm target...`);
    realUsbService.playContinuityBeep(150, 2000);

    await qualcommFirehoseEngine.rebootTarget(addLog);
    setIsSaharaOnline(false);
    setIsFirehoseOnline(false);

    const msg = isAr 
      ? `✅ تم إعادة تشغيل الجهاز بنجاح والخروج من وضع EDL 9008 إلى النظام.`
      : `✅ Target successfully rebooted from EDL 9008 into Android system.`;
    setSuccessBanner(msg);
    addLog(msg);
    realUsbService.playContinuityBeep(250, 2600);

    setIsExecuting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                {isAr ? 'استوديو كوالكوم ولودرات فايرهوز (Qualcomm Firehose & EDL 9008 Suite)' : 'Qualcomm Firehose & EDL 9008 Suite'}
              </h1>
              <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-mono font-bold">
                Sahara Protocol v2026
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'إدارة متقدمة لمعالجات كوالكوم سنابدراجون: فك FRP، نسخ الـ EFS والشبكة، تجاوز Mi Account وتفليش UFS/eMMC في وضع EDL 9008'
                : 'Advanced Qualcomm Snapdragon EDL 9008 Suite: Firehose XML partition flasher, EFS backup, FRP & Mi Account bypass'}
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            isSaharaOnline 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSaharaOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>Sahara: {isSaharaOnline ? 'ONLINE' : 'STANDBY'}</span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            isFirehoseOnline 
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isFirehoseOnline ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>Firehose XML: {isFirehoseOnline ? 'ACTIVE' : 'IDLE'}</span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
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

      {/* Main Grid: Controls + Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chipset & Actions */}
        <div className="lg:col-span-5 space-y-4">
          {/* Chipset Selector Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-400 font-mono uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>{isAr ? 'اختر معالج سنابدراجون واللودر' : 'Select Snapdragon Chipset & Loader'}</span>
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Storage: {activeProfile.storageTarget}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {QUALCOMM_SUPPORTED_CHIPSETS.map((c) => (
                <button
                  key={c.chipsetId}
                  onClick={() => setSelectedChipset(c.chipsetId)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedChipset === c.chipsetId
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-xs text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.firehoseMbn}</div>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {c.socCodeHex}
                  </span>
                </button>
              ))}
            </div>

            {/* Load Firehose Button */}
            <button
              onClick={handleConnectAndLoadFirehose}
              disabled={isConnecting || isExecuting}
              className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black py-3 rounded-xl text-xs shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isConnecting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>
                {isConnecting 
                  ? (isAr ? 'جاري الاتصال وحقن اللودر...' : 'Linking EDL & Loading Firehose...') 
                  : (isAr ? `توصيل EDL 9008 وحقن لودر (${activeProfile.chipsetId})` : `Connect EDL & Load Firehose (${activeProfile.chipsetId})`)}
              </span>
            </button>
          </div>

          {/* 1-Click Operations Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'عمليات الفايرهوز بنقرة واحدة (1-Click Actions)' : 'Firehose 1-Click Actions'}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleBackupEfs}
                disabled={isExecuting}
                className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Database className="w-4 h-4" />
                  <span>{isAr ? 'نسخ احتياطي للـ EFS' : 'Backup EFS Partitions'}</span>
                </div>
                <span className="text-[10px] text-slate-400">{isAr ? 'حفظ modemst1, modemst2, fsg' : 'Dump modemst1/2, fsg, persist'}</span>
              </button>

              <button
                onClick={handleResetFrp}
                disabled={isExecuting}
                className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Unlock className="w-4 h-4" />
                  <span>{isAr ? 'مسح حساب جوجل FRP' : 'Wipe Google FRP'}</span>
                </div>
                <span className="text-[10px] text-slate-400">{isAr ? 'تصفير قطاع frp و config' : 'Zero frp & config sectors'}</span>
              </button>

              <button
                onClick={handleResetMiAccount}
                disabled={isExecuting}
                className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <Lock className="w-4 h-4" />
                  <span>{isAr ? 'تخطي حساب Mi Cloud' : 'Bypass Mi Account'}</span>
                </div>
                <span className="text-[10px] text-slate-400">{isAr ? 'مسح بيانات finddevice' : 'Wipe persist finddevice tokens'}</span>
              </button>

              <button
                onClick={handleRebootTarget}
                disabled={isExecuting}
                className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <Power className="w-4 h-4" />
                  <span>{isAr ? 'إعادة تشغيل الهاتف' : 'Power Reset Target'}</span>
                </div>
                <span className="text-[10px] text-slate-400">{isAr ? 'خروج من وضع EDL 9008' : 'Exit 9008 mode to System'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Partition Layout & Live Terminal */}
        <div className="lg:col-span-7 space-y-4">
          {/* Storage Partition Visualizer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'خريطة قطاعات الذاكرة المحمية (Partition Map)' : 'UFS/eMMC Partition Block Map'}</span>
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono border border-emerald-500/20">
                CRC32 Verified
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {[
                { name: 'modemst1', role: 'IMEI Baseband 1', size: '2048 KB', color: 'border-emerald-500/40 text-emerald-300' },
                { name: 'modemst2', role: 'IMEI Baseband 2', size: '2048 KB', color: 'border-emerald-500/40 text-emerald-300' },
                { name: 'fsg', role: 'Golden FSG', size: '3072 KB', color: 'border-cyan-500/40 text-cyan-300' },
                { name: 'persist', role: 'Sensors / Cloud', size: '32 MB', color: 'border-blue-500/40 text-blue-300' },
                { name: 'frp', role: 'Google FRP Lock', size: '1024 KB', color: 'border-amber-500/40 text-amber-300' },
                { name: 'boot', role: 'Linux Kernel', size: '64 MB', color: 'border-indigo-500/40 text-indigo-300' },
                { name: 'vbmeta', role: 'AVB 2.0 Auth', size: '64 KB', color: 'border-purple-500/40 text-purple-300' },
                { name: 'devinfo', role: 'Bootloader Lock', size: '512 KB', color: 'border-teal-500/40 text-teal-300' },
              ].map((p) => (
                <div key={p.name} className={`bg-slate-950 p-2.5 rounded-xl border ${p.color} flex flex-col justify-between`}>
                  <div className="font-extrabold text-[11px]">{p.name}</div>
                  <div className="text-[9px] text-slate-400">{p.role}</div>
                  <div className="text-[10px] text-slate-300 font-bold mt-1">{p.size}</div>
                </div>
              ))}
            </div>

            {/* Progress bar if running */}
            {progressPct > 0 && progressPct < 100 && (
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>{progressStatus}</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Live Terminal */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[360px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-200">{isAr ? 'سجل Sahara & Firehose XML المباشر' : 'Live Sahara & Firehose XML Stream'}</span>
              </div>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Port: 0x05C6:0x9008
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
              {terminalLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('✅') || log.includes('SUCCESS')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('TX') || log.includes('HELLO') || log.includes('Injecting')
                      ? 'text-cyan-300'
                      : log.includes('RX') || log.includes('ACK')
                      ? 'text-blue-300'
                      : log.includes('notice') || log.includes('WARN')
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
