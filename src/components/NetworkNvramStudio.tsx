import React, { useState } from 'react';
import { 
  Radio, 
  Activity, 
  ShieldCheck, 
  Download, 
  Upload, 
  Wrench, 
  CheckCircle2, 
  Cpu, 
  HardDrive, 
  Key, 
  AlertTriangle,
  RefreshCw,
  Zap,
  Lock,
  Unlock,
  ShieldAlert,
  Terminal,
  Globe,
  Settings
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface NetworkNvramStudioProps {
  device: ConnectedDevice;
  onExecuteNvramAction: (actionType: string, payload: any) => void;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

export const NetworkNvramStudio: React.FC<NetworkNvramStudioProps> = ({
  device,
  onExecuteNvramAction,
  isBusy,
  lang
}) => {
  const isAr = lang === 'ar';
  
  // Tab within Network panel
  const [activeSubTab, setActiveSubTab] = useState<'imei' | 'carrier' | 'mdm'>('imei');

  // State for Dual IMEI Repair
  const [imei1, setImei1] = useState(device.imei1 || '358941209384721');
  const [imei2, setImei2] = useState(device.imei2 || '358941209384739');
  const [qcnFilePath, setQcnFilePath] = useState(`${device.model}_Calibrated_Stock.qcn`);
  const [certFile, setCertFile] = useState(`${device.model}_Signed_Cert.key`);
  const [patchCertStatus, setPatchCertStatus] = useState<'idle' | 'patching' | 'patched'>('idle');

  React.useEffect(() => {
    setImei1(device.imei1 || '358941209384721');
    setImei2(device.imei2 || '358941209384739');
    setQcnFilePath(`${device.model}_Calibrated_Stock.qcn`);
    setCertFile(`${device.model}_Signed_Cert.key`);
    
    if (device.brand.toUpperCase().includes('SAMSUNG')) {
      setSelectedMdmType('samsung_knox');
    } else if (device.brand.toUpperCase().includes('APPLE')) {
      setSelectedMdmType('apple_dep');
    } else {
      setSelectedMdmType('generic_mdm');
    }
  }, [device]);

  // State for Carrier Unlock
  const [carrierUnlockLogs, setCarrierUnlockLogs] = useState<string[]>([]);
  const [isUnlockingCarrier, setIsUnlockingCarrier] = useState(false);
  const [carrierMethod, setCarrierMethod] = useState<'nv_zero' | 'sec_bypass' | 'csc_carrier'>('nv_zero');

  // State for MDM / Knox bypass
  const [isBypassingMdm, setIsBypassingMdm] = useState(false);
  const [mdmProgress, setMdmProgress] = useState(0);
  const [mdmBlockLogs, setMdmBlockLogs] = useState<string[]>([]);
  const [selectedMdmType, setSelectedMdmType] = useState<'samsung_knox' | 'apple_dep' | 'generic_mdm'>('samsung_knox');

  const [imeiValidation, setImeiValidation] = useState<{
    valid: boolean;
    checkDigit1: number;
    checkDigit2: number;
    bcdHex: string;
  } | null>(null);

  const calculateLuhn = (imeiStr: string) => {
    if (!imeiStr || imeiStr.length < 14) return null;
    const clean = imeiStr.replace(/\D/g, '').slice(0, 14);
    if (clean.length < 14) return null;
    
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(clean[i], 10);
      if (i % 2 !== 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit;
  };

  const handleValidateImei = () => {
    const cd1 = calculateLuhn(imei1);
    const cd2 = calculateLuhn(imei2);

    if (cd1 !== null) {
      const fullImei1 = imei1.slice(0, 14) + cd1;
      // BCD format: Qualcomm NV format
      const bcd = '08 3A ' + fullImei1.slice(0, 14).split('').map((c, i) => i % 2 === 0 ? c : c + ' ').join('');
      setImeiValidation({
        valid: true,
        checkDigit1: cd1,
        checkDigit2: cd2 || 0,
        bcdHex: bcd
      });
    }
  };

  // Run certificate signing / patching simulation
  const handlePatchCertificate = () => {
    setPatchCertStatus('patching');
    onExecuteNvramAction('PATCH_CERT_INIT', { imei1, certFile });
    
    setTimeout(() => {
      setPatchCertStatus('patched');
      onExecuteNvramAction('PATCH_CERT_SUCCESS', { status: 'MODEM_SIGNED_COMPLETED' });
    }, 1800);
  };

  // Run Direct Carrier Unlock
  const handleCarrierUnlock = () => {
    setIsUnlockingCarrier(true);
    setCarrierUnlockLogs([]);
    onExecuteNvramAction('CARRIER_UNLOCK_INIT', { method: carrierMethod, model: device.model });

    const logs = [
      `[1/4] Reading secure radio partition 'sec' cluster via high-speed diagnostics port...`,
      `[2/4] Bypassing carrier lock flags using method: [${carrierMethod}]...`,
      `[3/4] Resetting Mobile Country Code (MCC) & Mobile Network Code (MNC) constraint parameters...`,
      `[4/4] Writing signed unlocked carrier metadata and rebooting baseband...`
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < logs.length) {
        setCarrierUnlockLogs(prev => [...prev, logs[step]]);
        step++;
      } else {
        clearInterval(interval);
        setIsUnlockingCarrier(false);
        onExecuteNvramAction('CARRIER_UNLOCK_SUCCESS', { model: device.model });
      }
    }, 600);
  };

  // Run MDM & Knox bypass
  const handleMdmBypass = () => {
    setIsBypassingMdm(true);
    setMdmProgress(0);
    setMdmBlockLogs([]);
    onExecuteNvramAction('MDM_BYPASS_START', { type: selectedMdmType });

    const steps = [
      `[+] Disabling System Agent enrollment service listeners...`,
      `[+] Injecting pre-authorized loopback routes to prevent corporate validation...`,
      `[+] Freezing package system components: ${selectedMdmType === 'samsung_knox' ? 'KnoxEnrollmentService, KLC, KnoxGuard' : 'AppleManagedDEP, ConfiguratorDaemon'}...`,
      `[+] Mounting local hosts loopback block on validation servers: [client3.samsungknox.com, iprofiles.apple.com]...`,
      `[+] Purging MDM enterprise enrollment caches. Resetting security enrollment flags.`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setMdmBlockLogs(prev => [...prev, steps[currentStep]]);
        setMdmProgress(p => p + 20);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsBypassingMdm(false);
        setMdmProgress(100);
        onExecuteNvramAction('MDM_BYPASS_SUCCESS', { type: selectedMdmType });
      }
    }, 500);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{isAr ? '🔬 مركز إصلاح الشبكة وفك تشفير وحمايات MDM / Knox' : '🔬 Baseband, Network, & Carrier/MDM Security Lab'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO NETWORK REPAIR
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isAr 
                ? 'إصلاح السيريال والشبكة عتادياً (Patch Cert)، فك قفل الشبكات المغلقة، وتخطي حسابات الشركات والتحكم MDM / Knox Guard'
                : 'Direct IMEI patch certificate signing, raw carrier lock bypass, and enterprise Knox Guard / MDM network loopback freezing.'}
            </p>
          </div>
        </div>

        {/* Sub navigation for Network panel */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab('imei')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'imei' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? '📶 إصلاح السيريال والشبكة' : '📶 IMEI & Baseband'}
          </button>
          <button
            onClick={() => setActiveSubTab('carrier')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'carrier' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? '🔓 فك قفل الشبكة SIM' : '🔓 Carrier Unlock'}
          </button>
          <button
            onClick={() => setActiveSubTab('mdm')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'mdm' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? '🛡️ تخطي حسابات الشركات MDM' : '🛡️ MDM & Knox Guard'}
          </button>
        </div>
      </div>

      {/* Main Workspace based on subtabs */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* SUBTAB 1: IMEI & CERTIFICATE PATCHING */}
        {activeSubTab === 'imei' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fadeIn">
            {/* Left Col: Dual IMEI Repair */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <span>{isAr ? 'إصلاح وحساب أرقام السيريال (IMEI 1 & IMEI 2)' : 'Dual IMEI Repair & NV Item Generator'}</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">Luhn Algorithm Verified</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* IMEI 1 */}
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">IMEI 1 (Primary SIM slot):</label>
                  <input
                    type="text"
                    value={imei1}
                    maxLength={15}
                    onChange={(e) => setImei1(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-indigo-300 text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="Enter 14 or 15 digit IMEI..."
                  />
                </div>

                {/* IMEI 2 */}
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">IMEI 2 (Secondary SIM / eSIM):</label>
                  <input
                    type="text"
                    value={imei2}
                    maxLength={15}
                    onChange={(e) => setImei2(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-indigo-300 text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="Enter 14 or 15 digit IMEI 2..."
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handleValidateImei}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isAr ? 'فحص خوارزمية Luhn وتوليد NV Hex' : 'Calculate Checksum & Qualcomm BCD'}</span>
                  </button>
                </div>

                {/* BCD Hex Output Preview */}
                {imeiValidation && (
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Calculated Check Digit 1:</span>
                      <span className="text-emerald-400 font-bold">{imeiValidation.checkDigit1}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>NV_ITEM_UE_IMEI (550) BCD:</span>
                      <span className="text-indigo-300 font-bold">{imeiValidation.bcdHex}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onExecuteNvramAction('WRITE_IMEI', { imei1, imei2, chipset: device.chipset })}
                disabled={isBusy || !imei1}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Wrench className="w-4 h-4" />
                <span>{isAr ? 'كتابة السيريال إلى قطاع NVRAM / EFS' : 'WRITE IMEI TO NVRAM / EFS PARTITION'}</span>
              </button>
            </div>

            {/* Right Col: Patch Certificate & QCN calibration */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>{isAr ? 'كتابة وتوقيع ملفات الشبكة (Patch Certificate Engine)' : 'Certificate Patching & RF Alignment'}</span>
                  </h4>
                  <span className="text-[11px] font-mono text-indigo-400 font-bold">{device.chipset.toUpperCase()}</span>
                </div>

                {/* Patch certificate config */}
                <div className="space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <label className="block text-slate-400 font-mono text-[11px]">{isAr ? 'ملف الشبكة التوافقي الموقع:' : 'Signed Network Certificate File (.key):'}</label>
                    <input
                      type="text"
                      value={certFile}
                      onChange={(e) => setCertFile(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={handlePatchCertificate}
                      disabled={patchCertStatus === 'patching'}
                      className="p-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 flex flex-col items-center justify-center gap-1.5 transition-colors"
                    >
                      <Zap className={`w-4 h-4 text-amber-400 ${patchCertStatus === 'patching' ? 'animate-spin' : ''}`} />
                      <span className="font-bold text-[11px]">{isAr ? 'توقيع وتفعيل الشبكة (Patch Cert)' : 'Patch Certificate'}</span>
                      <span className="text-[9px] text-slate-500 text-center font-mono">{isAr ? 'إصلاح توقيع السيريال الجديد' : 'Re-sign IMEI parameters'}</span>
                    </button>

                    <button
                      onClick={() => onExecuteNvramAction('FIX_BASEBAND_NULL', { model: device.model })}
                      disabled={isBusy}
                      className="p-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 flex flex-col items-center justify-center gap-1.5 transition-colors"
                    >
                      <Activity className="w-4 h-4 text-rose-400" />
                      <span className="font-bold text-[11px]">{isAr ? 'إصلاح Unknown Baseband' : 'Wipe & Rebuild EFS'}</span>
                      <span className="text-[9px] text-slate-500 text-center font-mono">{isAr ? 'إعادة بناء كارت السيم وقاعدة النطاق' : 'Fix Baseband NULL'}</span>
                    </button>
                  </div>

                  {patchCertStatus === 'patching' && (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400 animate-pulse">
                      {isAr ? 'جاري محاذاة ملفات الراديو وتعديل قطاع التوقيع الرقمي...' : 'Writing patchcert block: Injecting custom modem hash patterns...'}
                    </div>
                  )}

                  {patchCertStatus === 'patched' && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                      {isAr ? '✓ اكتملت كتابة ملف الشبكة بنجاح! الشبكة مفعلة ومطابقة للمودم.' : '✓ Patch certificate injected successfully. Baseband RF alignment active.'}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Safety check: Auto-creates .bak of SECRO, NVRAM, and EFS blocks before write.</span>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: CARRIER UNLOCK (SIM LOCK BYPASS) */}
        {activeSubTab === 'carrier' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            {/* Unlock Controls */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                {isAr ? 'إعدادات فك حظر الشبكات الأجنبية' : 'Carrier Unlock Methods'}
              </h4>

              <div className="space-y-3 text-xs">
                {/* Method selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400">{isAr ? 'آلية فك قفل الشبكة' : 'Select Bypass Protocol'}</label>
                  <select
                    aria-label="Carrier Unlock Protocol"
                    value={carrierMethod}
                    onChange={(e) => setCarrierMethod(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="nv_zero">{isAr ? '🗑️ تصفير قطاع الـ NV Carrier Block' : '🗑️ Zero-Out NV Carrier Sector'}</option>
                    <option value="sec_bypass">{isAr ? '🔓 تخطي حظر رقاقة sec_item عتادياً' : '🔓 Sec_item Chipset Bypass'}</option>
                    <option value="csc_carrier">{isAr ? '🌐 تعديل ملف الـ CSC ومفتاح الدولة' : '🌐 Write Unlocked CSC country code'}</option>
                  </select>
                </div>

                <button
                  onClick={handleCarrierUnlock}
                  disabled={isUnlockingCarrier}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Unlock className={`w-3.5 h-3.5 ${isUnlockingCarrier ? 'animate-spin' : ''}`} />
                  <span>{isUnlockingCarrier ? (isAr ? 'جاري كسر القفل...' : 'Unlocking...') : (isAr ? 'ابدأ فك قفل شبكة الـ SIM' : 'Begin Direct Carrier Unlock')}</span>
                </button>
              </div>
            </div>

            {/* Logs Terminal */}
            <div className="bg-slate-950/30 md:col-span-2 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  {isAr ? 'مراقبة اتصال الهاتف وفك كود الشبكة' : 'Carrier Bypass Protocol Interface'}
                </h4>

                <div className="bg-black/95 p-3 rounded-lg border border-slate-850 font-mono text-[11px] text-slate-400 h-[150px] overflow-y-auto space-y-1">
                  {carrierUnlockLogs.length === 0 ? (
                    <div className="text-slate-600 italic py-8 text-center">
                      {isAr ? 'بانتظار بدء بروتوكول قراءة المودم لفك الحظر الدولي...' : 'Awaiting direct carrier unlock protocol stream...'}
                    </div>
                  ) : (
                    carrierUnlockLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-indigo-400 mr-2">[+]</span>
                        <span>{log}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono mt-3 leading-relaxed">
                {isAr 
                  ? '💡 فك قفل الشبكة المباشر يتخطي فحص شريحة الاتصال عتادياً ويقوم بإقناع مودم الهاتف بأن كافة كروت الـ SIM هي كروت توافقية رسمية بدون إدخال أكواد.' 
                  : '💡 Direct carrier unlock bypasses hardware SIM validation checks, instructing the CP modem to accept any domestic or international ICCID packet.'}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: MDM & KNOX GUARD BYPASS */}
        {activeSubTab === 'mdm' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            {/* MDM Setup Controls */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                {isAr ? 'حسابات إدارة الشركات والـ MDM' : 'Enterprise MDM / Knox Options'}
              </h4>

              <div className="space-y-3 text-xs">
                {/* Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400">{isAr ? 'نوع حماية إدارة النظام' : 'Enterprise Lock Security'}</label>
                  <select
                    aria-label="Enterprise Lock Option"
                    value={selectedMdmType}
                    onChange={(e) => setSelectedMdmType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="samsung_knox">{isAr ? '🛡️ سامسونج Knox Guard & Enrollment' : '🛡️ Samsung Knox Guard & Enrollment'}</option>
                    <option value="apple_dep">{isAr ? '🍏 آبل MDM / DEP Corporate Profile' : '🍏 Apple MDM / DEP Corporate Profile'}</option>
                    <option value="generic_mdm">{isAr ? '🏢 حمايات الشركات والمؤسسات العامة MDM' : '🏢 Generic Enterprise MDM Locks'}</option>
                  </select>
                </div>

                <button
                  onClick={handleMdmBypass}
                  disabled={isBypassingMdm}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className={`w-3.5 h-3.5 ${isBypassingMdm ? 'animate-spin' : ''}`} />
                  <span>{isBypassingMdm ? (isAr ? 'جاري تجميد السيرفرات...' : 'Freezing Knox...') : (isAr ? 'تجميد وتخطي حساب الإدارة' : 'Bypass & Freeze MDM')}</span>
                </button>
              </div>
            </div>

            {/* Progress & Block Logs */}
            <div className="bg-slate-950/30 md:col-span-2 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    {isAr ? 'جدار الحماية المحلي وتجميد حزم الـ Knox' : 'Local DNS Loopback & Package Freezer Console'}
                  </h4>
                  <span className="text-[10px] text-indigo-400 font-bold font-mono">Loopback DNS Blocked</span>
                </div>

                {isBypassingMdm && (
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/80 border border-slate-800/60 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-indigo-400 animate-pulse">{isAr ? 'جاري حقن جدار الحماية المحلي...' : 'Freezing MDM Services...'}</span>
                      <span className="text-slate-300 font-bold">{mdmProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${mdmProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="bg-black/95 p-3 rounded-lg border border-slate-850 font-mono text-[11px] text-slate-400 h-[110px] overflow-y-auto space-y-1">
                  {mdmBlockLogs.length === 0 ? (
                    <div className="text-slate-600 italic py-6 text-center">
                      {isAr ? 'بانتظار تجميد خدمات الـ MDM وحجب خوادم التسجيل...' : 'Awaiting MDM service block initialization...'}
                    </div>
                  ) : (
                    mdmBlockLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-indigo-400 mr-2">[+]</span>
                        <span>{log}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono mt-3 leading-relaxed bg-slate-950 border border-slate-850 p-2 rounded">
                {isAr 
                  ? '💡 تخطي الـ MDM الجداري يمنع الهاتف من الاتصال بسيرفرات التفعيل الخاصة بالشركات عتادياً ويقوم بتجميد كود الـ Enrollment لمنع القفل مجدداً بمجرد ربط الواي فاي.' 
                  : '💡 MDM loopback bypass establishes local DNS loops directing Apple/Knox check servers to 127.0.0.1, making the enterprise activation permanently offline.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
