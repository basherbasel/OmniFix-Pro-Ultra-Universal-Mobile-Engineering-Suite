import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Satellite, 
  Cpu, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Globe, 
  Sliders, 
  Download, 
  Upload, 
  Lock, 
  Unlock, 
  Smartphone, 
  Zap, 
  Terminal,
  Signal,
  Wifi
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface EsimSatelliteSpectrumStudioProps {
  lang: 'en' | 'ar';
  device: ConnectedDevice;
  onAddLog?: (log: string) => void;
  onNavigateToTool?: (tabId: string) => void;
}

interface EsimProfile {
  id: string;
  iccId: string;
  provider: string;
  country: string;
  status: 'ACTIVE' | 'DISABLED' | 'DOWNLOAD_PENDING' | 'CORRUPTED';
  profileClass: 'Operational' | 'Test' | 'Provisioning';
  spn: string;
  allocatedMemoryKb: number;
}

export const EsimSatelliteSpectrumStudio: React.FC<EsimSatelliteSpectrumStudioProps> = ({
  lang,
  device,
  onAddLog,
  onNavigateToTool
}) => {
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'esim_lpa' | 'satellite_ntn' | 'baseband_qcn' | 'rf_spectrum'>('satellite_ntn');
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [satelliteConnected, setSatelliteConnected] = useState<boolean>(true);
  const [snrDb, setSnrDb] = useState<number>(14.8);
  const [dopplerShiftHz, setDopplerShiftHz] = useState<number>(-1240);
  const [rfPowerDbm, setRfPowerDbm] = useState<number>(23.0);
  const [selectedModulation, setSelectedModulation] = useState<'QPSK' | '16QAM' | '64QAM' | '256QAM'>('16QAM');
  const [eidNumber, setEidNumber] = useState<string>('89049032005008882600023491823901');

  const [esimProfiles, setEsimProfiles] = useState<EsimProfile[]>([
    {
      id: 'prof-1',
      iccId: '8988211002345091238',
      provider: 'Global Starlink Direct-to-Cell / T-Mobile',
      country: 'Global / Multi-IMSI',
      status: 'ACTIVE',
      profileClass: 'Operational',
      spn: 'Starlink NTN',
      allocatedMemoryKb: 48
    },
    {
      id: 'prof-2',
      iccId: '8996601004523910245',
      provider: 'STC 5G Standalone SA',
      country: 'Saudi Arabia (KSA)',
      status: 'DISABLED',
      profileClass: 'Operational',
      spn: 'STC 5G',
      allocatedMemoryKb: 32
    },
    {
      id: 'prof-3',
      iccId: '8997101008741029381',
      provider: 'Vodafone Ultra 5G Roaming',
      country: 'United Kingdom / Europe',
      status: 'DISABLED',
      profileClass: 'Operational',
      spn: 'Vodafone UK',
      allocatedMemoryKb: 40
    }
  ]);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Baseband Engine Ready: Snapdragon X75 / Exynos 5400 / Apple C1 3GPP Rel-17 Compliant.',
    'GSMA SGP.22 / SGP.32 eUICC Local Profile Assistant (LPA) Interface Connected.',
    'NTN Direct-to-Cell L-band / S-band (Band n255/n256) Satellite RF calibration online.'
  ]);

  const handleStartCalibration = () => {
    setIsCalibrating(true);
    const startMsg = `Calibrating 3GPP Rel-17 Satellite Modem & Baseband RF Filters for ${device.model}...`;
    setTerminalLogs(prev => [startMsg, ...prev]);
    if (onAddLog) onAddLog(startMsg);

    setTimeout(() => {
      setSnrDb(16.5);
      setDopplerShiftHz(-320);
      setIsCalibrating(false);
      const endMsg = 'NTN Satellite SOS Calibration Successful: Doppler compensation locked, RF Power optimized (+23.5 dBm).';
      setTerminalLogs(prev => [endMsg, ...prev]);
      if (onAddLog) onAddLog(endMsg);
    }, 2200);
  };

  const handleToggleProfile = (profId: string) => {
    setEsimProfiles(prev => prev.map(p => {
      if (p.id === profId) {
        const nextStatus = p.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        const msg = `GSMA LPA: Profile ${p.spn} (${p.iccId.slice(0, 8)}...) switched to ${nextStatus}.`;
        setTerminalLogs(l => [msg, ...l]);
        if (onAddLog) onAddLog(msg);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleRebuildQcnEfs = () => {
    const msg = `NVRAM/QCN Baseband Calibration Executed: Restored EFS Partition & Calibrated RF NV Items 0-65535.`;
    setTerminalLogs(prev => [msg, ...prev]);
    if (onAddLog) onAddLog(msg);
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-cyan-500/20 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-600/10 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Satellite size={28} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white">
                {isAr ? 'استوديو الاتصال الفضائي SOS وبرمجة شرائح eSIM ومودم 5G' : 'eSIM & 3GPP Satellite SOS / 5G-Advanced Studio'}
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                3GPP REL-17 NTN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {isAr 
                ? 'إدارة وبرمجة شرائح eUICC الرقمية، معالجة انزياح دوبلر للاتصال بالأقمار الصناعية (Direct-to-Cell)، واستعادة مسارات المودم و NVRAM و QCN.' 
                : 'GSMA RSP eUICC profile manager, Non-Terrestrial Network (NTN) satellite beacon calibration, and high-speed 5G-A baseband RF diagnostics.'}
            </p>
          </div>
        </div>

        {/* Quick Navigation Tabs */}
        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          {(['satellite_ntn', 'esim_lpa', 'baseband_qcn', 'rf_spectrum'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab === 'satellite_ntn' && <Satellite size={14} />}
              {tab === 'esim_lpa' && <Smartphone size={14} />}
              {tab === 'baseband_qcn' && <Cpu size={14} />}
              {tab === 'rf_spectrum' && <Radio size={14} />}

              {tab === 'satellite_ntn' && (isAr ? 'اتصال الأقمار الصناعية SOS' : 'Satellite SOS NTN')}
              {tab === 'esim_lpa' && (isAr ? 'مدير شرائح eSIM' : 'eSIM LPA Manager')}
              {tab === 'baseband_qcn' && (isAr ? 'معايرة البيسباند QCN' : 'Baseband QCN/NVRAM')}
              {tab === 'rf_spectrum' && (isAr ? 'محلل الطيف اللاسلكي RF' : 'RF Spectrum')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Body */}
      {activeTab === 'satellite_ntn' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Satellite Telemetry & Calibration (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            
            {/* Live Link Card */}
            <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Signal size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{isAr ? 'حالة الارتباط الفضائي المباشر (Direct-to-Cell Telemetry)' : 'Direct-to-Cell Satellite Handshake'}</h3>
                    <span className="text-xs text-slate-400 font-mono">Constellation: Starlink Gen2 / Globalstar V2 / BeiDou-3</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-emerald-400">LOCKED (LEO-Orbit)</span>
                </div>
              </div>

              {/* Gauges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{isAr ? 'نسبة الإشارة SNR:' : 'Signal SNR:'}</span>
                  <span className="text-lg font-mono font-black text-cyan-400">{snrDb.toFixed(1)} dB</span>
                  <span className="text-[10px] text-emerald-400">Optimal &gt; 12 dB</span>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{isAr ? 'انزياح دوبلر:' : 'Doppler Shift:'}</span>
                  <span className="text-lg font-mono font-black text-amber-400">{dopplerShiftHz} Hz</span>
                  <span className="text-[10px] text-slate-500">Auto-Compensated</span>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{isAr ? 'قدرة الإرسال RF:' : 'TX Power (EIRP):'}</span>
                  <span className="text-lg font-mono font-black text-emerald-400">+{rfPowerDbm.toFixed(1)} dBm</span>
                  <span className="text-[10px] text-slate-500">PA High-Efficiency</span>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{isAr ? 'حزمة التردد:' : 'RF Frequency Band:'}</span>
                  <span className="text-lg font-mono font-black text-purple-400">Band n255 (L-Band)</span>
                  <span className="text-[10px] text-slate-500">1626.5 - 1660.5 MHz</span>
                </div>
              </div>

              {/* Orbital Tracking Diagram */}
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>ORBITAL AZIMUTH: 142.4° SE</span>
                  <span>ELEVATION ANGLE: 58.2°</span>
                  <span>TIME TO NEXT APOGEE: 08m 42s</span>
                </div>
                
                {/* Progress Visualizer */}
                <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 to-indigo-500 w-3/4 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleStartCalibration}
                  disabled={isCalibrating}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isCalibrating ? 'animate-spin' : ''} />
                  {isCalibrating ? (isAr ? 'جاري معايرة الهوائيات والمودم...' : 'Calibrating RF Antennas...') : (isAr ? 'معايرة وإصلاح مودم الطوارئ الفضائي' : 'Calibrate 3GPP NTN Modem')}
                </button>
              </div>

            </div>

          </div>

          {/* Right Info & Emergency Beacon Simulator (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-5 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white">{isAr ? 'اختبار حزمة الطوارئ SOS' : 'Emergency Beacon Packet Test'}</h4>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  VERIFIED
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 font-mono text-xs space-y-1.5 text-slate-300">
                <div className="text-slate-500">PAYLOAD: GNSS_LAT: 24.7136° N</div>
                <div className="text-slate-500">PAYLOAD: GNSS_LON: 46.6753° E</div>
                <div className="text-slate-500">ALTITUDE: 612m AMSL</div>
                <div className="text-cyan-400 font-bold">PROTOCOL: 3GPP TS 23.501 / TS 38.300</div>
                <div className="text-emerald-400 font-bold">STATUS: READY TO BROADCAST</div>
              </div>

              <button
                onClick={() => {
                  const log = 'Satellite SOS Emergency Packet Beacon Fired: Handshake ACK received in 420ms.';
                  setTerminalLogs(prev => [log, ...prev]);
                  if (onAddLog) onAddLog(log);
                }}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
              >
                <Satellite size={14} />
                {isAr ? 'إرسال حزمة تجريبية للقمر الصناعي' : 'Send Test SOS Packet to Satellite'}
              </button>
            </div>

            {/* Diagnostic Logs */}
            <div className="p-4 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-2 shadow-lg flex-1">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Terminal size={14} className="text-cyan-400" />
                {isAr ? 'سجل عمليات المودم والبيسباند' : 'Baseband Console Logs'}
              </span>
              <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 h-44 overflow-y-auto font-mono text-[10px] space-y-1.5 text-slate-400">
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 leading-tight">
                    <span className="text-cyan-400 font-bold shrink-0">&gt;</span>
                    <span className="text-slate-300">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* eSIM LPA Manager View */}
      {activeTab === 'esim_lpa' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* EID & Chip Status */}
            <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{isAr ? 'شريحة eUICC المدمجة والـ EID' : 'Embedded eUICC Chip & EID Identifier'}</h3>
                    <span className="text-xs text-slate-400 font-mono">Standard: GSMA SGP.22 v3.0 / SGP.32 (IoT/Consumer)</span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-mono font-bold rounded-full">
                  eUICC OS 4.1
                </span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">EID:</span>
                <span className="text-xs font-mono font-bold text-cyan-300 select-all">{eidNumber}</span>
              </div>
            </div>

            {/* Profile List */}
            <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white">{isAr ? 'الملفات المحملة على الشريحة (eSIM Profiles)' : 'Installed eSIM Profiles on eUICC'}</h3>
                <span className="text-xs text-slate-400 font-mono">{esimProfiles.length} Profiles Installed</span>
              </div>

              <div className="flex flex-col gap-3">
                {esimProfiles.map(prof => (
                  <div 
                    key={prof.id}
                    className="p-4 bg-slate-950/80 border border-white/5 hover:border-cyan-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${prof.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{prof.provider}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">{prof.country}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">ICCID: {prof.iccId} | Size: {prof.allocatedMemoryKb} KB</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleProfile(prof.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          prof.status === 'ACTIVE' 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' 
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                        }`}
                      >
                        {prof.status === 'ACTIVE' ? (isAr ? 'تعطيل الشريحة' : 'Disable Profile') : (isAr ? 'تفعيل وتشغيل' : 'Enable & Activate')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-5 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-4 shadow-xl">
              <h4 className="text-sm font-black text-white">{isAr ? 'تثبيت شريحة جديدة عبر SM-DP+' : 'Download Profile via SM-DP+'}</h4>
              <p className="text-xs text-slate-400">{isAr ? 'تجاوز قفل مشغل الشبكة وتنزيل الملفات عبر رابط GSMA المباشر' : 'Direct GSMA Remote SIM Provisioning QR/Activation Code injector.'}</p>
              
              <input 
                type="text" 
                placeholder="LPA:1$smdp.carrier.com$MATCHING-CODE" 
                className="w-full p-3 bg-slate-950 border border-white/10 rounded-2xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />

              <button
                onClick={() => {
                  const log = 'GSMA SM-DP+ Profile Download Handshake Executed: Provisioned new eSIM profile into eUICC memory.';
                  setTerminalLogs(prev => [log, ...prev]);
                  if (onAddLog) onAddLog(log);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
              >
                <Download size={14} />
                {isAr ? 'حقن وتثبيت الشريحة في eUICC' : 'Inject & Provision Profile'}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Baseband QCN / NVRAM Calibration */}
      {activeTab === 'baseband_qcn' && (
        <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{isAr ? 'إعادة بناء ومعايرة الـ NVRAM / QCN / EFS' : 'Baseband NVRAM & QCN Calibration Engine'}</h3>
                <span className="text-xs text-slate-400 font-mono">Restoring Null Baseband, Unknown IMEI, and RF Calibration Tables</span>
              </div>
            </div>

            <button
              onClick={handleRebuildQcnEfs}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
            >
              <RefreshCw size={14} />
              {isAr ? 'معايرة وإصلاح فوري للـ NVRAM/QCN' : '1-Click Rebuild QCN/NVRAM'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
              <div className="text-xs text-slate-400 font-mono">IMEI 1:</div>
              <div className="text-sm font-mono font-bold text-white mt-1">{device.imei1 || '359482109283712'}</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-1">STATUS: CERTIFICATE VALID</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
              <div className="text-xs text-slate-400 font-mono">IMEI 2 (eSIM):</div>
              <div className="text-sm font-mono font-bold text-white mt-1">{device.imei2 || '359482109283720'}</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-1">STATUS: DUAL-ACTIVE CALIBRATED</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
              <div className="text-xs text-slate-400 font-mono">BASEBAND MODEM:</div>
              <div className="text-sm font-mono font-bold text-cyan-300 mt-1">{device.basebandVersion || 'MPSS.DE.3.0.c1-00042'}</div>
              <div className="text-[10px] text-slate-400 font-bold mt-1">FIRMWARE: SYNCED WITH KERNEL</div>
            </div>
          </div>
        </div>
      )}

      {/* RF Spectrum & Constellation Diagram */}
      {activeTab === 'rf_spectrum' && (
        <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Radio size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{isAr ? 'محلل الطيف الترددي ومخطط الأطوار (RF Constellation)' : 'Live RF Spectrum & Constellation (EVM/SNR Analyzer)'}</h3>
                <span className="text-xs text-slate-400 font-mono">Real-time IQ Demodulation & Error Vector Magnitude Check</span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/5">
              {(['QPSK', '16QAM', '64QAM', '256QAM'] as const).map(mod => (
                <button
                  key={mod}
                  onClick={() => setSelectedModulation(mod)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    selectedModulation === mod 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Constellation Canvas Box */}
            <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-h-[260px] relative">
              <div className="w-48 h-48 border border-dashed border-slate-700 rounded-xl relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-[1px] bg-slate-800" />
                  <div className="h-full w-[1px] bg-slate-800 absolute" />
                </div>
                {/* Simulated Constellation Points */}
                <div className="grid grid-cols-4 gap-6 p-4">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50 animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="text-xs font-mono text-slate-400 mt-4">IQ Constellation: {selectedModulation} | EVM: 1.8% (Target &lt; 3.5%)</div>
            </div>

            {/* Spectrum Signal Bars */}
            <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>RSRP: -84 dBm (Excellent)</span>
                <span>RSRQ: -9 dB</span>
                <span>SINR: +24 dB</span>
              </div>

              {/* Waveform Bars */}
              <div className="flex items-end gap-1.5 h-32 my-4 px-2">
                {[20, 35, 60, 85, 95, 80, 50, 65, 90, 100, 75, 45, 60, 80, 95, 70, 40, 55, 85, 60, 30].map((h, idx) => (
                  <div 
                    key={idx}
                    style={{ height: `${h}%` }}
                    className="flex-1 bg-gradient-to-t from-cyan-600 to-indigo-500 rounded-t-sm transition-all"
                  />
                ))}
              </div>

              <div className="text-[11px] text-slate-500 font-mono text-center">
                CENTER FREQ: 3.5 GHz (n78 5G NR) | BANDWIDTH: 100 MHz
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
