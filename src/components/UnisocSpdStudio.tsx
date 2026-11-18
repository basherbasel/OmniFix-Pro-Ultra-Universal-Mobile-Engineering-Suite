import React, { useState } from 'react';
import { 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Play, 
  RotateCcw, 
  Zap, 
  CheckCircle2, 
  HardDrive, 
  Radio, 
  Power, 
  Sliders,
  FolderOpen
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  unisocSpdEngine, 
  UNISOC_SUPPORTED_CHIPSETS, 
  UnisocChipsetProfile 
} from '../services/UnisocSpdEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const UnisocSpdStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [selectedChipId, setSelectedChipId] = useState<string>('T606');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isBslConnected, setIsBslConnected] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Unisoc / Spreadtrum BSL & HDLC Programmer Suite v2026.9 initialized.',
    'BSL Direct COM/USB Engine Ready (VID: 0x1782, PID: 0x4D00).',
    'Select a Unisoc SoC (Tiger T606, T612, T616, SC9863A) and initiate the FDL sequence.'
  ]);

  const activeChipset = UNISOC_SUPPORTED_CHIPSETS.find(c => c.id === selectedChipId) || UNISOC_SUPPORTED_CHIPSETS[0];

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[UNISOC_STUDIO] ${m}`);
  };

  const handleConnectBsl = async () => {
    if (isConnecting || isExecuting) return;
    setIsConnecting(true);
    setSuccessBanner(null);

    addLog(`Connecting to Unisoc target (Hold Volume Down)...`);
    realUsbService.playContinuityBeep(120, 2200);

    try {
      unisocSpdEngine.setTargetChipset(selectedChipId);
      await unisocSpdEngine.connect();
      await unisocSpdEngine.handshake();
      setIsBslConnected(true);

      const msg = isAr 
        ? `✅ تم ربط معالج ${activeChipset.name} بنجاح وتحميل FDL1 و FDL2 في الذاكرة!`
        : `✅ Unisoc ${activeChipset.name} linked and FDL1/FDL2 online!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    } catch (e: any) {
      addLog(`Notice: ${e.message || e}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleResetFrp = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Initiating Unisoc FRP Wipe for ${activeChipset.name}...`);
    realUsbService.playContinuityBeep(120, 2300);

    const res = await unisocSpdEngine.resetUnisocFrp(addLog);
    if (res.success) {
      const msg = isAr 
        ? '✅ تم بنجاح حذف حساب جوجل (FRP) لمعالج يونيسوك وحفظ بيانات الـ prodnv!'
        : '✅ Unisoc FRP removed successfully! Calibration preserved.';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);

      setCurrentDevice({
        ...device,
        frpStatus: 'OFF'
      });
    }

    setIsExecuting(false);
  };

  const handleSafeFormat = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Initiating Safe Factory Reset for ${activeChipset.name}...`);
    realUsbService.playContinuityBeep(120, 2400);

    const res = await unisocSpdEngine.safeFactoryReset(addLog);
    if (res.success) {
      const msg = isAr 
        ? '✅ تم عمل فورمات آمن وإزالة قفل الشاشة بدون مسح السيريال والشبكة!'
        : '✅ Safe factory reset completed! Screen lock removed.';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  const handleReboot = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    await unisocSpdEngine.rebootTarget(addLog);
    setIsBslConnected(false);
    setIsExecuting(false);
    realUsbService.playContinuityBeep(200, 2600);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-amber-600 via-orange-600 to-red-600 rounded-xl shadow-lg shadow-orange-500/20">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-red-400 bg-clip-text text-transparent">
                {isAr ? 'استوديو يونيسوك وبروتوكول FDL (Unisoc Spreadtrum BSL Suite)' : 'Unisoc Spreadtrum BSL & FDL Suite'}
              </h1>
              <span className="bg-orange-500/10 text-orange-400 text-xs px-2.5 py-0.5 rounded-full border border-orange-500/20 font-mono font-bold">
                Tiger & SC9863A Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'دعم هواتف الفئة الاقتصادية (Realme C, Infinix, Tecno, Itel, Nokia): تفليش PAC، فك FRP، وفورمات آمن'
                : 'Full Spreadtrum BSL support: FDL1/FDL2 stage loaders, PAC flasher, FRP wipe & safe format'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            isBslConnected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isBslConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>FDL2: {isBslConnected ? 'ACTIVE' : 'STANDBY'}</span>
          </div>
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
        {/* Left: Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-orange-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4" />
              <span>{isAr ? 'اختر معالج يونيسوك المستهدف' : 'Select Target Unisoc SoC'}</span>
            </span>

            <div className="space-y-2">
              {UNISOC_SUPPORTED_CHIPSETS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChipId(c.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedChipId === c.id
                      ? 'bg-orange-500/15 border-orange-500/50 text-orange-200 shadow-md shadow-orange-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-xs text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Architecture: {c.socFamily}</div>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {c.defaultStorage}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleConnectBsl}
              disabled={isConnecting || isExecuting}
              className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-black py-3 rounded-xl text-xs shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isConnecting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>
                {isConnecting 
                  ? (isAr ? 'جاري الاتصال بوضع BSL وحقن FDL...' : 'Connecting BSL & Loading FDL...') 
                  : (isAr ? `توصيل وحقن FDL لمعالج (${activeChipset.id})` : `Connect & Inject FDL (${activeChipset.id})`)}
              </span>
            </button>
          </div>

          {/* 1-Click Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'عمليات يونيسوك السريعة (1-Click Actions)' : 'Unisoc 1-Click Operations'}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleResetFrp}
                disabled={isExecuting}
                className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-orange-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-orange-400 font-bold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>{isAr ? 'مسح حساب جوجل FRP' : 'Wipe Google FRP'}</span>
                </div>
                <span className="text-[10px] text-slate-400">{isAr ? 'تصفير قطاع persist' : 'Zero persist sector'}</span>
              </button>

              <button
                onClick={handleSafeFormat}
                disabled={isExecuting}
                className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <HardDrive className="w-4 h-4" />
                  <span>{isAr ? 'فورمات آمن بدون فقد السيريال' : 'Safe Factory Reset'}</span>
                </div>
                <span className="text-[10px] text-slate-400">{isAr ? 'حماية قطاع prodnv والـ IMEI' : 'Preserves prodnv & IMEI'}</span>
              </button>
            </div>

            <button
              onClick={handleReboot}
              disabled={isExecuting}
              className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 rounded-xl text-xs text-rose-400 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Power className="w-4 h-4" />
              <span>{isAr ? 'إعادة تشغيل الهاتف إلى النظام' : 'Reboot Target to Android'}</span>
            </button>
          </div>
        </div>

        {/* Right: Terminal */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[440px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-slate-200">{isAr ? 'سجل بروتوكول Unisoc BSL المباشر' : 'Live Unisoc BSL Stream'}</span>
            </div>
            <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Port: 0x1782:0x4D00
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('FDL1') || l.includes('FDL2') || l.includes('Baudrate')
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
