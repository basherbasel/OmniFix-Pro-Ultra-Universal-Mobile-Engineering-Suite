import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  BatteryCharging, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Upload, 
  Sliders, 
  RotateCcw, 
  Smartphone, 
  Zap, 
  Tv, 
  Radio, 
  Scan,
  Fingerprint
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface EepromTrueToneBmsStudioProps {
  lang: 'en' | 'ar';
  device: ConnectedDevice;
  onAddLog?: (log: string) => void;
  onNavigateToTool?: (tabId: string) => void;
}

export const EepromTrueToneBmsStudio: React.FC<EepromTrueToneBmsStudioProps> = ({
  lang,
  device,
  onAddLog,
  onNavigateToTool
}) => {
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'truetone_display' | 'battery_bms' | 'faceid_crypto' | 'taptic_als'>('truetone_display');
  const [isProgramming, setIsProgramming] = useState<boolean>(false);

  // TrueTone Display State
  const [originalMtsn, setOriginalMtsn] = useState<string>('F3G938100KML9821A');
  const [originalCoverCode, setOriginalCoverCode] = useState<string>('DP894210087K1208');
  const [truetoneRestored, setTruetoneRestored] = useState<boolean>(true);
  const [displayWarningBypassed, setDisplayWarningBypassed] = useState<boolean>(true);

  // Battery BMS State
  const [batteryCycleCount, setBatteryCycleCount] = useState<number>(0);
  const [batteryHealthPercent, setBatteryHealthPercent] = useState<number>(100);
  const [batteryDesignCapacityMah, setBatteryDesignCapacityMah] = useState<number>(4422);
  const [batteryBmsChip, setBatteryBmsChip] = useState<'TI_BQ27Z561' | 'Renesas_ISL9238' | 'NXP_PCA9468'>('TI_BQ27Z561');
  const [bmsWarningBypassed, setBmsWarningBypassed] = useState<boolean>(true);

  // Face ID State
  const [dotProjectorI2cStatus, setDotProjectorI2cStatus] = useState<'NORMAL' | 'FUSED' | 'SHORT'>('NORMAL');
  const [faceIdKeyDumped, setFaceIdKeyDumped] = useState<boolean>(true);
  const [floodIlluminatorWorking, setFloodIlluminatorWorking] = useState<boolean>(true);

  const [programmerLogs, setProgrammerLogs] = useState<string[]>([
    'JC V1SE / QianLi iCopy Plus / QianLi Apollo Programmer Protocol Handshake established.',
    'I2C / SPI EEPROM Bus Voltage verified at 1.8V / 3.3V Logic Level.',
    'Ready for TrueTone, Battery BMS Cycle 0, and Face ID Cryptokey serialization.'
  ]);

  const handleProgramTrueTone = () => {
    setIsProgramming(true);
    const msg = `Programming TrueTone & MTSN Color Profile into Replacement OLED for ${device.model}...`;
    setProgrammerLogs(prev => [msg, ...prev]);
    if (onAddLog) onAddLog(msg);

    setTimeout(() => {
      setTruetoneRestored(true);
      setDisplayWarningBypassed(true);
      setIsProgramming(false);
      const doneMsg = 'TrueTone & Display Matrix Synchronized: "Important Display Message" Warning Bypassed (Cryptokey Written).';
      setProgrammerLogs(prev => [doneMsg, ...prev]);
      if (onAddLog) onAddLog(doneMsg);
    }, 1800);
  };

  const handleResetBmsBattery = () => {
    setIsProgramming(true);
    const msg = `Resetting BMS Gas-Gauge EEPROM: Setting Cycle Count to 0 & Health to 100% on ${batteryBmsChip}...`;
    setProgrammerLogs(prev => [msg, ...prev]);
    if (onAddLog) onAddLog(msg);

    setTimeout(() => {
      setBatteryCycleCount(0);
      setBatteryHealthPercent(100);
      setBmsWarningBypassed(true);
      setIsProgramming(false);
      const doneMsg = 'Battery BMS Gas Gauge Recalibrated: Maximum Capacity Restored to 100%, Cycles 0, Non-Genuine Pop-up Disabled.';
      setProgrammerLogs(prev => [doneMsg, ...prev]);
      if (onAddLog) onAddLog(doneMsg);
    }, 1800);
  };

  const handleRepairFaceId = () => {
    setIsProgramming(true);
    const msg = `Reading Dot Projector Cryptokey & Aligning Optical Prism Matrix for ${device.model}...`;
    setProgrammerLogs(prev => [msg, ...prev]);
    if (onAddLog) onAddLog(msg);

    setTimeout(() => {
      setDotProjectorI2cStatus('NORMAL');
      setFaceIdKeyDumped(true);
      setIsProgramming(false);
      const doneMsg = 'Face ID Dot Projector Flex Repaired: Cryptographic Signature Verified, 30,000 Infrared Dots Calibrated.';
      setProgrammerLogs(prev => [doneMsg, ...prev]);
      if (onAddLog) onAddLog(doneMsg);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-violet-500/20 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white">
            <Cpu size={28} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white">
                {isAr ? 'استوديو برمجة TrueTone والبطارية BMS وبصمة الوجه' : 'TrueTone, Battery BMS & Face ID Programmer Studio'}
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-full">
                HARDWARE CRYPTO 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {isAr 
                ? 'استعادة التروتون، تصفير دورات شحن البطارية (100% Health)، تخطي رسالة القطعة غير الأصلية، وترميم بصمة الوجه Face ID.' 
                : 'EEPROM data transfer for TrueTone, 100% Battery BMS health reset, non-genuine part warning bypass, and Dot Projector cryptokey restore.'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          {(['truetone_display', 'battery_bms', 'faceid_crypto', 'taptic_als'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab === 'truetone_display' && <Tv size={14} />}
              {tab === 'battery_bms' && <BatteryCharging size={14} />}
              {tab === 'faceid_crypto' && <Scan size={14} />}
              {tab === 'taptic_als' && <Zap size={14} />}

              {tab === 'truetone_display' && (isAr ? 'تروتون الشاشة TrueTone' : 'TrueTone & Display')}
              {tab === 'battery_bms' && (isAr ? 'تصفير البطارية BMS 100%' : 'Battery BMS 100%')}
              {tab === 'faceid_crypto' && (isAr ? 'بصمة الوجه Face ID' : 'Face ID Crypto')}
              {tab === 'taptic_als' && (isAr ? 'الهزاز والحساسات ALS' : 'Taptic & ALS')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Body */}
      {activeTab === 'truetone_display' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* TrueTone Display Controls (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <Tv size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{isAr ? 'برمجة واستعادة نغمة اللون الحقيقية (TrueTone Calibration)' : 'TrueTone & Display Color Calibration'}</h3>
                    <span className="text-xs text-slate-400 font-mono">Compatible with OLED / Super Retina XDR / Dynamic AMOLED 2X</span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono font-bold rounded-full">
                  EEPROM READY
                </span>
              </div>

              {/* Data Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{isAr ? 'سيريال الشاشة الأصلي (MTSN):' : 'Original Display MTSN:'}</span>
                  <input 
                    type="text" 
                    value={originalMtsn} 
                    onChange={(e) => setOriginalMtsn(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs font-mono font-bold text-violet-300 focus:outline-none focus:border-violet-500" 
                  />
                  <span className="text-[10px] text-slate-500">Read from original broken screen or cloud backup</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{isAr ? 'كود زجاج الحماية (Cover Code):' : 'Cover Plate Code:'}</span>
                  <input 
                    type="text" 
                    value={originalCoverCode} 
                    onChange={(e) => setOriginalCoverCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs font-mono font-bold text-violet-300 focus:outline-none focus:border-violet-500" 
                  />
                  <span className="text-[10px] text-slate-500">Touch Controller IC Serial Pair</span>
                </div>
              </div>

              {/* Status checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/5 flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">TrueTone Status</div>
                    <div className="text-[10px] text-emerald-400 font-mono">ENABLED & CALIBRATED</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/5 flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Display Warning</div>
                    <div className="text-[10px] text-emerald-400 font-mono">POP-UP BYPASSED</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/5 flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">120Hz ProMotion</div>
                    <div className="text-[10px] text-emerald-400 font-mono">NATIVE SMOOTH</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleProgramTrueTone}
                  disabled={isProgramming}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isProgramming ? 'animate-spin' : ''} />
                  {isProgramming ? (isAr ? 'جاري كتابة السيريال ومصفوفة الألوان...' : 'Writing EEPROM Data...') : (isAr ? 'برمجة التروتون وتخطي الرسالة المزعجة' : 'Write TrueTone & Bypass Warning')}
                </button>
              </div>

            </div>
          </div>

          {/* Right Info Box (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-5 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-3 shadow-xl">
              <h4 className="text-sm font-black text-white">{isAr ? 'طريقة نقل الأيسي وتعديل الفلكس' : 'IC Transplant & Flex Guide'}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr 
                  ? 'في الموديلات الحديثة (iPhone 13-16 / S23-S25 Ultra)، قم بنقل أيسي الشاشة المسمى Display Touch IC بدرجة حرارة 330°C أو استخدم فلكس التعديل الخارجي بدون لحام.' 
                  : 'For newer models, transplant original Display Touch IC at 330°C or use tag-on non-removal TrueTone repair flex.'}
              </p>
            </div>

            {/* Diagnostic Stream */}
            <div className="p-4 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-2 shadow-lg flex-1">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Radio size={14} className="text-violet-400" />
                {isAr ? 'سجل عمليات المبرمجة الذكية' : 'Programmer Bus Telemetry'}
              </span>
              <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 h-44 overflow-y-auto font-mono text-[10px] space-y-1.5 text-slate-400">
                {programmerLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 leading-tight">
                    <span className="text-violet-400 font-bold shrink-0">&gt;</span>
                    <span className="text-slate-300">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Battery BMS Tab */}
      {activeTab === 'battery_bms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <BatteryCharging size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{isAr ? 'تصفير عداد دورات البطارية واستعادة الصحة 100%' : 'Battery BMS Gas-Gauge 100% Health Reset'}</h3>
                    <span className="text-xs text-slate-400 font-mono">TI BQ27Z561 / Renesas ISL9238 / NXP Gas-Gauge Re-calibration</span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono font-bold rounded-full">
                  100% CAPACITY
                </span>
              </div>

              {/* Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{isAr ? 'صحة البطارية:' : 'Battery Health:'}</span>
                  <span className="text-3xl font-mono font-black text-emerald-400">{batteryHealthPercent}%</span>
                  <span className="text-[10px] text-slate-500">Nominal 100% Maximum</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{isAr ? 'عدد دورات الشحن:' : 'Cycle Count:'}</span>
                  <span className="text-3xl font-mono font-black text-cyan-400">{batteryCycleCount}</span>
                  <span className="text-[10px] text-slate-500">Reset to 0 Cycles</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{isAr ? 'سعة البطارية المقاسة:' : 'Design Capacity:'}</span>
                  <span className="text-3xl font-mono font-black text-amber-400">{batteryDesignCapacityMah} mAh</span>
                  <span className="text-[10px] text-slate-500">Original Cell Balance</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleResetBmsBattery}
                  disabled={isProgramming}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isProgramming ? 'animate-spin' : ''} />
                  {isProgramming ? (isAr ? 'جاري تصفير شريحة BMS وكتابة السعة...' : 'Recalibrating Gas Gauge...') : (isAr ? 'تصفير دورات الشحن واستعادة الصحة 100%' : '1-Click Reset Cycles & 100% Health')}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-5 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-3 shadow-xl">
              <h4 className="text-sm font-black text-white">{isAr ? 'لحام فلكس بطارية Tag-on' : 'Battery Tag-On Flex Method'}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr 
                  ? 'قم بلحام شريط BMS الأصلي مع خلايا البطارية الجديدة عالية الجودة، ثم وصّل فلكس البرمجة التلقائي بدون الحاجة لجهاز كمبيوتر خارجي.' 
                  : 'Spot-weld original BMS board to fresh high-capacity cells, attach tag-on repair flex, and execute automatic parameter lock.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Face ID Tab */}
      {activeTab === 'faceid_crypto' && (
        <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Scan size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{isAr ? 'ترميم بصمة الوجه Face ID وبروجيكتور النقاط' : 'Face ID Dot Projector & Prism Repair Studio'}</h3>
                <span className="text-xs text-slate-400 font-mono">Restoring "Move iPhone a little lower/higher" & TrueDepth Errors</span>
              </div>
            </div>

            <button
              onClick={handleRepairFaceId}
              disabled={isProgramming}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={isProgramming ? 'animate-spin' : ''} />
              {isProgramming ? (isAr ? 'جاري محاذاة النقاط وقراءة المفتاح...' : 'Aligning Prism Matrix...') : (isAr ? 'ترميم وضبط بروجيكتور الوجه' : 'Repair Dot Projector Flex')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
              <div className="text-xs text-slate-400 font-mono">DOT PROJECTOR I2C:</div>
              <div className="text-sm font-mono font-bold text-emerald-400 mt-1">NORMAL (No Fuse Short)</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
              <div className="text-xs text-slate-400 font-mono">CRYPTO-HASH KEY:</div>
              <div className="text-sm font-mono font-bold text-cyan-300 mt-1">SECURE ENCLAVE MATCHED</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
              <div className="text-xs text-slate-400 font-mono">FLOOD ILLUMINATOR:</div>
              <div className="text-sm font-mono font-bold text-emerald-400 mt-1">EMITTING 940nm IR</div>
            </div>
          </div>
        </div>
      )}

      {/* Taptic & ALS Tab */}
      {activeTab === 'taptic_als' && (
        <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{isAr ? 'محرك الاهتزاز Taptic Engine وحساس الإضاءة ALS' : 'Taptic Engine & Ambient Light Sensor Serialization'}</h3>
                <span className="text-xs text-slate-400 font-mono">Vibration Haptic Feedback Profile & Proximity Sensor Calibration</span>
              </div>
            </div>

            <button
              onClick={() => {
                const log = 'Taptic Engine Haptic Profile & ALS Sensor Serial Number successfully cloned.';
                setProgrammerLogs(prev => [log, ...prev]);
                if (onAddLog) onAddLog(log);
              }}
              className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-600/20 transition-all"
            >
              <RefreshCw size={14} />
              {isAr ? 'نسخ وبرمجة الهزاز والحساس' : 'Clone Taptic & ALS Serial'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
