import React, { useState } from 'react';
import { 
  Cpu, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Globe, 
  ShieldAlert, 
  Sliders, 
  HardDrive, 
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  huaweiKirinEngine, 
  KirinChipsetProfile, 
  KIRIN_SUPPORTED_CHIPSETS 
} from '../services/HuaweiKirinEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const HuaweiKirinStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';
  const { setCurrentDevice } = useWorkstation();

  const [selectedChipset, setSelectedChipset] = useState<KirinChipsetProfile>(KIRIN_SUPPORTED_CHIPSETS[0]);
  const [targetRegion, setTargetRegion] = useState<string>('Middle East (C185 / MEAFNAF)');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCom1Connected, setIsCom1Connected] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Huawei & Honor HiSilicon Kirin USB COM 1.0 Studio v2026.9 initialized.',
    'TestPoint & BootROM Direct Loader Core Ready.',
    'Connect Huawei / Honor device via TestPoint to trigger USB COM 1.0 (0x12D1:0x3609).'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[KIRIN_STUDIO] ${m}`);
  };

  const handleConnectUsbCom1 = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Initiating USB COM 1.0 handshake for ${selectedChipset.name}...`);
    realUsbService.playContinuityBeep(120, 2200);

    const res = await huaweiKirinEngine.handshakeUsbCom1(selectedChipset, addLog);
    if (res.success) {
      setIsCom1Connected(true);
      setCurrentDevice({
        ...device,
        brand: 'Huawei',
        chipset: 'hisilicon_kirin',
        mode: 'FASTBOOT'
      });

      const msg = isAr 
        ? `✅ تم ربط معالج ${selectedChipset.name} بوضع USB COM 1.0 وتحويل الهاتف إلى Fastboot!`
        : `✅ Kirin ${selectedChipset.name} linked & Fastboot online!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleRemoveHuaweiId = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Erasing Huawei ID & Google FRP from NVRAM sectors...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await huaweiKirinEngine.removeHuaweiIdAndFrp(addLog);
    if (res.success) {
      const msg = isAr 
        ? '✅ تم بنجاح حذف حساب هواوي (Huawei ID) وقفل FRP وتصفير الحماية بنقرة واحدة!'
        : '✅ Huawei ID & FRP permanently removed!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  const handleRebrand = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog(`Writing target OEMINFO matrix for region: ${targetRegion}...`);
    realUsbService.playContinuityBeep(120, 2300);

    const res = await huaweiKirinEngine.rebrandOeminfo(targetRegion, addLog);
    if (res.success) {
      const msg = isAr 
        ? `✅ تم بنجاح تحويل وتغيير توجيه هاتف هواوي إلى (${targetRegion}) ودعم خدمات جوجل واللغة العربية!`
        : `✅ Rebranded successfully to ${targetRegion}!`;
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
          <div className="p-3 bg-gradient-to-tr from-rose-600 via-red-600 to-amber-600 rounded-xl shadow-lg shadow-red-500/20">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-rose-400 via-red-300 to-amber-300 bg-clip-text text-transparent">
                {isAr ? 'استوديو هواوي وهونر ومعالجات كيرين (Huawei Kirin USB 1.0 Suite)' : 'Huawei & Honor Kirin USB COM 1.0 Suite'}
              </h1>
              <span className="bg-red-500/10 text-red-400 text-xs px-2.5 py-0.5 rounded-full border border-red-500/20 font-mono font-bold">
                HiSilicon BootROM & OEMINFO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'دعم معالجات Kirin 710 إلى Kirin 9000 عبر منفذ USB COM 1.0: حذف Huawei ID، فك FRP، وتحويل التوجيه Rebrand'
                : 'HiSilicon Kirin BootROM direct loaders, Huawei ID / FRP wipe, OEMINFO region change, and xloader flash'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            isCom1Connected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isCom1Connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>USB 1.0: {isCom1Connected ? 'ONLINE' : 'STANDBY'}</span>
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
        {/* Left: Chipset & Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-rose-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4" />
              <span>{isAr ? 'اختر معالج كيرين المستهدف' : 'Select Target Kirin Chipset'}</span>
            </span>

            <div className="space-y-2">
              {KIRIN_SUPPORTED_CHIPSETS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChipset(c)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedChipset.id === c.id
                      ? 'bg-rose-500/15 border-rose-500/50 text-rose-200 shadow-md shadow-rose-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-xs text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Family: {c.socFamily}</div>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    COM 1.0
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleConnectUsbCom1}
              disabled={isExecuting}
              className="w-full bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black py-3 rounded-xl text-xs shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>
                {isExecuting 
                  ? (isAr ? 'جاري الاتصال بـ USB COM 1.0 وحقن الـ xloader...' : 'Connecting USB COM 1.0...') 
                  : (isAr ? `توصيل وحقن معالج (${selectedChipset.name})` : `Connect & Inject ${selectedChipset.name}`)}
              </span>
            </button>
          </div>

          {/* 1-Click Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'عمليات هواوي الفورية' : 'Huawei 1-Click Operations'}</span>
            </span>

            <button
              onClick={handleRemoveHuaweiId}
              disabled={isExecuting}
              className="w-full p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 rounded-xl text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
            >
              <div>
                <div className="text-red-400 font-bold text-xs">{isAr ? 'حذف حساب هواوي ID وقفل FRP' : '1-Click Huawei ID & FRP Remove'}</div>
                <div className="text-[10px] text-slate-400">{isAr ? 'تصفير قطاع oeminfo وسجلات NVRAM' : 'Zeroes NVRAM item 50091 & FRP'}</div>
              </div>
              <Zap className="w-4 h-4 text-red-400" />
            </button>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 font-mono block uppercase font-bold">
                {isAr ? 'تغيير توجيه الجهاز (OEMINFO Rebranding):' : 'Target Region Rebrand:'}
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetRegion}
                  onChange={(e) => setTargetRegion(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-xs text-amber-300 flex-1"
                />
                <button
                  onClick={handleRebrand}
                  disabled={isExecuting}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-black text-xs px-3 py-2 rounded-lg cursor-pointer transition-all disabled:opacity-50 shrink-0"
                >
                  {isAr ? 'تغيير التوجيه' : 'Rebrand'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Console */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[480px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-rose-400" />
              <span className="font-bold text-slate-200">{isAr ? 'سجل بروتوكول Kirin USB COM 1.0' : 'Live Kirin BootROM Stream'}</span>
            </div>
            <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              0x12D1:0x3609
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('KIRIN') || l.includes('OEMINFO')
                    ? 'text-rose-300'
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
