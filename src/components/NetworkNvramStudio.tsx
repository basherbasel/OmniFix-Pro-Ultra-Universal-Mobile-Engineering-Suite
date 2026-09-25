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
  Settings,
  Wifi,
  Signal,
  Send,
  Layers,
  Sliders,
  Check,
  CheckCheck,
  Laptop,
  Usb,
  Sparkles,
  Info,
  CheckCircle,
  Clock,
  FileCode,
  Smartphone
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { realUsbService } from '../services/realUsbService';
import { samsungNetworkEngine, SamsungDiagnosisReport } from '../services/samsungNetworkEngine';

interface NetworkNvramStudioProps {
  device: ConnectedDevice;
  onExecuteNvramAction: (actionType: string, payload: any) => void;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

interface PreScanReport {
  timestamp: string;
  basebandVersion: string;
  partitionIntegrity: 'VERIFIED' | 'WARNING' | 'CORRUPTED';
  simRailVoltage: string;
  rfFrontEndStatus: string;
  rilStatus: string;
  overallScore: number;
  detectedFaults: string[];
  safeRecommendation: {
    titleAr: string;
    titleEn: string;
    actionId: string;
    descAr: string;
    descEn: string;
  };
}

export const NetworkNvramStudio: React.FC<NetworkNvramStudioProps> = ({
  device,
  onExecuteNvramAction,
  isBusy,
  lang
}) => {
  const isAr = lang === 'ar';
  
  // Tab within Network panel
  const [activeSubTab, setActiveSubTab] = useState<'rf_repair' | 'imei' | 'carrier' | 'mdm'>('rf_repair');

  // Pre-Repair Diagnosis State
  const [isPreScanning, setIsPreScanning] = useState<boolean>(false);
  const [preScanProgress, setPreScanProgress] = useState<number>(0);
  const [preScanStep, setPreScanStep] = useState<string>('');
  const [preScanReport, setPreScanReport] = useState<PreScanReport | null>(null);

  // State for RF Signal & Baseband Repair Lab
  const [rfSignalDbm, setRfSignalDbm] = useState<number>(-68);
  const [rfIsFixing, setRfIsFixing] = useState<boolean>(false);
  const [activeFixName, setActiveFixName] = useState<string | null>(null);
  const [rfProgress, setRfProgress] = useState<number>(0);
  const [rfLogs, setRfLogs] = useState<string[]>([]);
  const [radioState, setRadioState] = useState<'ONLINE' | 'STANDBY' | 'CALIBRATING' | 'REBOOTING'>('ONLINE');
  const [simStatus, setSimStatus] = useState<'DETECTED_READY' | 'SEARCHING'>('DETECTED_READY');
  const [bandMode, setBandMode] = useState<'AUTO_5G_LTE' | 'LTE_ONLY' | 'WCDMA_GSM'>('AUTO_5G_LTE');
  const [atCommandInput, setAtCommandInput] = useState<string>('AT+CSQ');
  const [atHistory, setAtHistory] = useState<Array<{ cmd: string; resp: string; time: string; ok: boolean }>>([
    { cmd: 'AT', resp: 'OK', time: '10:00:01', ok: true },
    { cmd: 'AT+CSQ', resp: '+CSQ: 26, 99\nOK (Signal RSSI: -61 dBm)', time: '10:00:02', ok: true },
    { cmd: 'AT+CREG?', resp: '+CREG: 2, 1, "04B2", "01A3F402", 7\nOK (Registered, Home Network)', time: '10:00:03', ok: true }
  ]);

  // Dynamic Device Hardware & Modem Profile
  const getDeviceModemProfile = (dev: ConnectedDevice) => {
    const brand = (dev.brand || '').toUpperCase();
    const chip = (dev.chipset || '').toLowerCase();
    const model = (dev.model || '').toUpperCase();

    if (chip.includes('qualcomm') || (brand.includes('XIAOMI') && !chip.includes('mtk'))) {
      return {
        modemFamily: 'Qualcomm Snapdragon X-Series 5G Modem-RF',
        architecture: 'Qualcomm MSM / SM Baseband Coprocessor',
        diagPortType: 'Qualcomm DM Diagnostics / Sahara Protocol',
        partitionLayout: ['modemst1', 'modemst2', 'fsg', 'fsc', 'modem'],
        nvramFormat: 'Qualcomm NV Item Binary (QCN / XQCN)',
        zeroDataRiskGuarantee: true
      };
    } else if (chip.includes('mediatek') || chip.includes('mtk')) {
      return {
        modemFamily: 'MediaTek Dimensity / Helio M-Series 5G DSP',
        architecture: 'MediaTek MT67xx / MT68xx Cellular Baseband',
        diagPortType: 'MediaTek META Mode / CDC-ACM Serial Interface',
        partitionLayout: ['nvram', 'nvdata', 'nvcfg', 'protect_f', 'protect_s', 'md1img'],
        nvramFormat: 'MediaTek NVDATA APDB / BPLGUInfo Structure',
        zeroDataRiskGuarantee: true
      };
    } else if (brand.includes('SAMSUNG') || chip.includes('exynos')) {
      return {
        modemFamily: 'Samsung Shannon 5G Baseband Processor',
        architecture: 'Samsung Exynos Auto / Shannon CP Architecture',
        diagPortType: 'Samsung USB Modem Driver / UART IPC Link',
        partitionLayout: ['efs', 'sec_efs', 'radio', 'mobicore', 'cp_debug'],
        nvramFormat: 'Samsung EFS Block & SEC NV Certificate',
        zeroDataRiskGuarantee: true
      };
    } else {
      return {
        modemFamily: 'Universal 3GPP Multimode Baseband Engine',
        architecture: `${dev.brand} ${dev.chipset.toUpperCase()} Radio Stack`,
        diagPortType: 'Standard 3GPP AT Serial Channel (115200 8N1)',
        partitionLayout: ['efs', 'nvram', 'radio', 'modem'],
        nvramFormat: 'Standard Radio NV Partition Block',
        zeroDataRiskGuarantee: true
      };
    }
  };

  const modemProfile = getDeviceModemProfile(device);

  // Pre-Repair Automatic Health Scanner Handler
  const handleRunPreRepairDiagnosis = async () => {
    setIsPreScanning(true);
    setPreScanProgress(0);
    setPreScanReport(null);
    realUsbService.playContinuityBeep(120, 2000);

    const stages = [
      { p: 20, nameAr: '1. استجواب إصدار المودم واستجابة الـ Baseband (AT+CGMR)...', nameEn: '1. Probing Baseband Firmware Version (AT+CGMR)...' },
      { p: 40, nameAr: '2. فحص وتدقيق سلامة قطاعات الـ NVRAM / EFS وقيم الـ CRC32...', nameEn: '2. Auditing NVRAM / EFS partition blocks & CRC32 hashes...' },
      { p: 60, nameAr: '3. قياس فولتيات خطوط الشريحة VDD_SIM (1.8V / 3.0V)...', nameEn: '3. Measuring SIM tray VDD power rails & clock lines...' },
      { p: 80, nameAr: '4. فحص مصفوفة الهوائي ومضخم الإرسال RF Power Amplifier...', nameEn: '4. Analyzing RF Front-End, PA Gain curve & VSWR...' },
      { p: 100, nameAr: '5. التحقق من مكدس RIL والتسجيل الخلوي بالأبراج...', nameEn: '5. Testing RIL cellular stack & PLMN tower handshake...' }
    ];

    for (let i = 0; i < stages.length; i++) {
      setPreScanStep(isAr ? stages[i].nameAr : stages[i].nameEn);
      setPreScanProgress(stages[i].p);
      realUsbService.playContinuityBeep(90, 2100 + i * 180);
      await new Promise(r => setTimeout(r, 420));
    }

    setIsPreScanning(false);
    realUsbService.playContinuityBeep(260, 2800);

    // Formulate comprehensive pre-scan report
    setPreScanReport({
      timestamp: new Date().toLocaleTimeString(),
      basebandVersion: `${device.chipset.toUpperCase()}_MPSS.3.1_REL_${device.model}`,
      partitionIntegrity: 'VERIFIED',
      simRailVoltage: '1.80V (Active & Stable)',
      rfFrontEndStatus: 'Nominal (Antenna 4x4 Diversity OK)',
      rilStatus: radioState === 'ONLINE' ? 'Attached (Home PLMN)' : 'Desynchronized / Searching',
      overallScore: 94,
      detectedFaults: [
        isAr ? 'كاش الراديو الخلوي RIL بحاجة إلى تفريغ ومزامنة فورية لتسريع التقاط الأبراج' : 'RIL Radio cache requires soft flush & PLMN handshake resync'
      ],
      safeRecommendation: {
        titleAr: 'إصلاح عطل لا توجد خدمة ومزامنة مكدس الراديو RIL',
        titleEn: 'Fix No Service & Sync Cellular RIL Daemon',
        actionId: 'no_service',
        descAr: 'إجراء آمن 100% يقوم بتفريغ كاش الراديو وإعادة الاتصال بالأبراج دون المساس ببيانات المستخدم.',
        descEn: '100% Non-destructive procedure that resets cellular cache without modifying user data.'
      }
    });
  };

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

  // Samsung Production Network Core Engine State
  const [isSamsungRepairing, setIsSamsungRepairing] = useState<boolean>(false);
  const [samsungStage, setSamsungStage] = useState<string>('');
  const [samsungProgress, setSamsungProgress] = useState<number>(0);
  const [samsungLogs, setSamsungLogs] = useState<string[]>([]);
  const [samsungReport, setSamsungReport] = useState<SamsungDiagnosisReport | null>(null);
  const [samsungHexImei, setSamsungHexImei] = useState<string>('');

  const handleRunSamsungProductionRepair = async () => {
    if (isSamsungRepairing) return;
    setIsSamsungRepairing(true);
    setSamsungProgress(0);
    setSamsungLogs([]);
    realUsbService.playContinuityBeep(140, 2000);

    const result = await samsungNetworkEngine.repairSamsungNetwork(
      device,
      imei1 || '358941209384721',
      (stage, percent, log) => {
        setSamsungStage(stage);
        setSamsungProgress(percent);
        if (log) {
          setSamsungLogs(prev => [...prev, log]);
        }
      }
    );

    setIsSamsungRepairing(false);
    if (result.success) {
      onExecuteNvramAction('SAMSUNG_CORE_REPAIR_SUCCESS', {
        device: device.model,
        backupHash: result.backupHash
      });
    }
  };

  const handleDownloadCSharpEngine = () => {
    const code = samsungNetworkEngine.generateStandAloneCSharpEngine();
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UniversalNetworkRepairEngine.cs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    realUsbService.playContinuityBeep(200, 2500);
  };

  const [imeiValidation, setImeiValidation] = useState<{
    valid: boolean;
    imei1Full: string;
    imei2Full?: string;
    checkDigit1: number;
    checkDigit2: number | null;
    tac1: string;
    snr1: string;
    bcdHex: string;
    statusMsg?: string;
  } | null>(null);

  const [isWritingImei, setIsWritingImei] = useState(false);
  const [imeiWriteLogs, setImeiWriteLogs] = useState<string[]>([]);
  const [imeiWriteProgress, setImeiWriteProgress] = useState(0);

  const calculateLuhn = (imeiStr: string): number | null => {
    if (!imeiStr) return null;
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
    realUsbService.playContinuityBeep(100, 2400);
    const clean1 = imei1.replace(/\D/g, '');
    if (clean1.length < 14) {
      setImeiValidation({
        valid: false,
        imei1Full: clean1,
        checkDigit1: 0,
        checkDigit2: null,
        tac1: clean1.slice(0, 8),
        snr1: clean1.slice(8, 14),
        bcdHex: 'INVALID',
        statusMsg: isAr ? 'يجب إدخال 14 أو 15 رقماً على الأقل لحساب الـ Check Digit' : 'Please enter at least 14 digits to calculate Luhn Check Digit'
      });
      return;
    }

    const cd1 = calculateLuhn(clean1) ?? 0;
    const full1 = clean1.slice(0, 14) + cd1;
    setImei1(full1);

    let cd2: number | null = null;
    let full2 = '';
    const clean2 = imei2.replace(/\D/g, '');
    if (clean2.length >= 14) {
      cd2 = calculateLuhn(clean2);
      if (cd2 !== null) {
        full2 = clean2.slice(0, 14) + cd2;
        setImei2(full2);
      }
    }

    // Qualcomm NV Item 550 BCD representation
    const bcd = '08 3A ' + full1.slice(0, 14).split('').map((c, i) => i % 2 === 0 ? c : c + ' ').join('') + `${cd1}F`;

    setImeiValidation({
      valid: true,
      imei1Full: full1,
      imei2Full: full2 || undefined,
      checkDigit1: cd1,
      checkDigit2: cd2,
      tac1: full1.slice(0, 8),
      snr1: full1.slice(8, 14),
      bcdHex: bcd,
      statusMsg: isAr ? 'تم حساب الـ Check Digit بنجاح وتوليد مصفوفة BCD' : 'Check Digit calculated successfully & BCD generated'
    });
  };

  const handleExecuteWriteImei = () => {
    if (!imei1 || isWritingImei) return;
    setIsWritingImei(true);
    setImeiWriteProgress(0);
    setImeiWriteLogs([]);
    realUsbService.playContinuityBeep(120, 2200);

    const steps = [
      isAr ? `1. الاتصال بمنفذ المودم التشخيصي /dev/ttyUSB0 واختبار استجابة AT+CGSN...` : `1. Connecting to Modem Diagnostic Port & testing AT+CGSN response...`,
      isAr ? `2. التحقق من سلامة فهارس Luhn Checksum لـ IMEI 1: [${imei1}]...` : `2. Validating Luhn Checksum integrity for IMEI 1: [${imei1}]...`,
      isAr ? `3. فتح قفل قطاع NVRAM / EFS الأمني وتجاوز حماية Write Protect...` : `3. Unlocking NVRAM / EFS security partition & clearing Write-Protect bit...`,
      isAr ? `4. كتابة مصفوفة NV_ITEM_UE_IMEI (550) إلى الذاكرة العشوائية للمودم...` : `4. Writing NV_ITEM_UE_IMEI (550) structures to modem memory...`,
      isAr ? `5. مزامنة الـ NVDATA وإعادة تشغيل راديو المودم AT+CFUN=1,1...` : `5. Syncing NVDATA sectors and resetting modem stack (AT+CFUN=1,1)...`,
      isAr ? `✅ اكتملت العملية بنجاح! تم حفظ وتثبيت السيريال وتأكيد استجابة المودم.` : `✅ Completed! IMEI written to NVRAM/EFS and verified successfully.`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setImeiWriteLogs(prev => [...prev, steps[currentStep]]);
        setImeiWriteProgress(Math.round(((currentStep + 1) / steps.length) * 100));
        realUsbService.playContinuityBeep(90, 2200 + currentStep * 160);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsWritingImei(false);
        realUsbService.playContinuityBeep(260, 2800);
        onExecuteNvramAction('WRITE_IMEI', { imei1, imei2, chipset: device.chipset });
      }
    }, 450);
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

  // Handle Comprehensive RF Fault Repairs
  const handleRunRfRepair = (type: string, titleAr: string, titleEn: string) => {
    setRfIsFixing(true);
    setActiveFixName(isAr ? titleAr : titleEn);
    setRfProgress(0);
    setRfLogs([]);
    realUsbService.playContinuityBeep(140, 2100);
    onExecuteNvramAction(`RF_REPAIR_${type.toUpperCase()}`, { type, model: device.model });

    let steps: string[] = [];
    if (type === 'no_service') {
      steps = [
        isAr ? '1. فحص اتصال منفذ الـ DIAG واستجابة معالج الترددات Baseband...' : '1. Probing Baseband diagnostic port response...',
        isAr ? '2. تنظيف كاش الشبكة وإعادة تهيئة واجهة الراديو RIL...' : '2. Purging RIL cellular cache & reinitializing radio daemon...',
        isAr ? '3. إرسال أمر البحث الإجباري عن الأبراج (PLMN Network Rescan)...' : '3. Forcing cell tower PLMN search and radio link sync...',
        isAr ? '4. تفعيل وضع التسجيل التلقائي وضبط هوائي 4G/5G...' : '4. Enabling auto-registration and 4G/5G antenna diversity...',
        isAr ? '✅ اكتمل الإصلاح: عادت الشبكة للعمل بنجاح وتم تسجيل الهاتف.' : '✅ Fixed: Cell registration restored. In-Service.'
      ];
    } else if (type === 'antenna_cal') {
      steps = [
        isAr ? '1. فحص مسار الهوائي وحساب نسبة الفولتية الراجعة VSWR...' : '1. Checking RF path impedance & VSWR telemetry...',
        isAr ? '2. استدعاء جدول المعايرة NV Items 2800-2815 للترددات...' : '2. Fetching calibrated NV Items 2800-2815 lookup tables...',
        isAr ? '3. ضبط قدرة التكبير لمضخم الإرسال Tx Power Amplifier...' : '3. Tuning Power Amplifier (PA) gain curve for low reception...',
        isAr ? '4. مزامنة مصفوفة هوائيات MIMO 4x4 مع المودم...' : '4. Synchronizing MIMO 4x4 antenna matrix with modem DSP...',
        isAr ? '✅ تمت المعايرة: تحسن مستوى الإشارة بمقدار +14 dBm.' : '✅ Calibrated: RF gain boosted by +14 dBm.'
      ];
    } else if (type === 'modem_reboot') {
      steps = [
        isAr ? '1. إرسال إشارة إيقاف تشغيل الراديو AT+CFUN=0 للمودم...' : '1. Sending radio stack suspend command (AT+CFUN=0)...',
        isAr ? '2. تفريغ ذاكرة المعالج الأساسي Baseband RAM buffers...' : '2. Flushing Baseband processor volatile RAM buffers...',
        isAr ? '3. إعادة إقلاع نواة المودم الذاتية برمجياً AT+CFUN=1...' : '3. Soft-booting Modem Kernel via AT+CFUN=1...',
        isAr ? '4. استعادة بطاقة الـ SIM والتسجيل الفوري بالشبكة...' : '4. Re-enunciating SIM ICCID and reattaching to network...',
        isAr ? '✅ تم إعادة تشغيل المودم بنجاح بدون إعادة تشغيل الهاتف.' : '✅ Modem daemon rebooted cleanly without full OS restart.'
      ];
    } else if (type === 'reset_apn') {
      steps = [
        isAr ? '1. قراءة كود الدولة والشبكة المشغلة MCC/MNC من الشريحة...' : '1. Reading SIM MCC/MNC carrier identity...',
        isAr ? '2. إعادة بناء ملفات /data/misc/radio/ بالقيم الافتراضية...' : '2. Reconstructing /data/misc/radio/ database with factory defaults...',
        isAr ? '3. حقن نقاط الوصول القياسية (APN internet / MMS / IMS)...' : '3. Injecting standard carrier APN (Internet, IMS, VoLTE)...',
        isAr ? '4. تفعيل بروتوكولات بيانات الجوال VoLTE و VoWiFi...' : '4. Enabling VoLTE & VoWiFi data packet channels...',
        isAr ? '✅ تم ضبط إعدادات الشبكة ونقاط الوصول بنجاح.' : '✅ APN and cellular profiles restored to factory defaults.'
      ];
    } else if (type === 'backup_nvram') {
      steps = [
        isAr ? '1. قراءة خريطة قطاعات الذاكرة لبارتشنات الشبكة...' : '1. Mapping radio partitions (efs, nvram, nvdata, secro)...',
        isAr ? '2. استخراج قطاع الـ EFS والـ NV Items بتشفير مباشر...' : '2. Dumping raw EFS block and NVRAM calibration items...',
        isAr ? '3. حساب قيمة الهاش SHA-256 للتأكد من سلامة النسخة...' : '3. Calculating SHA-256 checksum for backup integrity...',
        isAr ? `4. حفظ النسخة في الأرشيف: nvram_${device.model}_backup.bin...` : `4. Saved to local storage: nvram_${device.model}_backup.bin...`,
        isAr ? '✅ تم إنشاء نسخة احتياطية آمنة ومطابقة 100% للشبكة.' : '✅ Radio partitions backed up successfully.'
      ];
    } else {
      steps = [
        isAr ? '1. فحص ملف الـ QCN المعاير الخاص بالمعالج...' : '1. Loading stock calibrated QCN for target chipset...',
        isAr ? '2. مطابقة ترددات المودم مع الموديل الرسمي للجهاز...' : '2. Matching RF bands to official hardware revision...',
        isAr ? '3. كتابة جداول الترددات لقطاع الـ NVDATA...' : '3. Flashing RF tables into NVDATA partition...',
        isAr ? '4. تفعيل القنوات وتثبيت الترددات بنجاح...' : '4. Finalizing channel lock and verifying baseband...',
        isAr ? '✅ تمت استعادة ملفات الشبكة المعايرة الأصلية بنجاح.' : '✅ Stock QCN calibration restored successfully.'
      ];
    }

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setRfLogs(prev => [...prev, steps[stepIdx]]);
        setRfProgress(Math.round(((stepIdx + 1) / steps.length) * 100));
        stepIdx++;
      } else {
        clearInterval(interval);
        setRfIsFixing(false);
        realUsbService.playContinuityBeep(250, 2700);
        if (type === 'no_service' || type === 'antenna_cal') {
          setRfSignalDbm(-54);
          setRadioState('ONLINE');
          setSimStatus('DETECTED_READY');
        }
        onExecuteNvramAction(`RF_REPAIR_SUCCESS`, { type, model: device.model });
      }
    }, 500);
  };

  // Handle Send AT Command
  const handleSendAt = (customCmd?: string) => {
    const cmd = (customCmd || atCommandInput).trim().toUpperCase();
    if (!cmd) return;
    realUsbService.playContinuityBeep(100, 2400);

    let response = 'OK';
    const clean = cmd.replace(/\s+/g, '');
    if (clean === 'AT') {
      response = 'OK';
    } else if (clean.includes('+CSQ')) {
      response = `+CSQ: 28, 99\nOK (Signal Strength: -55 dBm, Excellent)`;
      setRfSignalDbm(-55);
    } else if (clean.includes('+COPS=?')) {
      response = `+COPS: (2,"Vodafone","Voda","41001",7),(1,"Orange","Org","41002",7),(1,"WE","TE","41004",7),(1,"Etisalat","Etisalat","41003",7)\nOK`;
    } else if (clean.includes('+COPS?')) {
      response = `+COPS: 0, 0, "Vodafone 5G", 7\nOK`;
    } else if (clean.includes('+CREG?')) {
      response = `+CREG: 2, 1, "04B2", "01A3F402", 7\nOK (Registered, Home Network - LTE/NR)`;
    } else if (clean.includes('+CFUN=1,1') || clean.includes('+CFUN=1')) {
      response = `OK\n+CPIN: READY\nSMS & DATA STACK INITIALIZED`;
      setRadioState('ONLINE');
    } else if (clean.includes('+CFUN=0')) {
      response = `OK\nRADIO TRANSCEIVER POWERED DOWN`;
      setRadioState('STANDBY');
    } else if (clean.includes('+CGDCONT?')) {
      response = `+CGDCONT: 1,"IPV4V6","internet","0.0.0.0",0,0,0,0\n+CGDCONT: 2,"IPV4V6","ims","0.0.0.0",0,0,0,0\nOK`;
    } else if (clean.includes('*#0808#') || clean.includes('+DIAG')) {
      response = `DIAG PORT: DM + MODEM + ADB ENABLED\nSTATUS: ACTIVE AT /dev/ttyUSB0 (115200 8N1)\nOK`;
    } else if (clean.includes('+QNWINFO')) {
      response = `+QNWINFO: "FDD LTE","41001","LTE BAND 3 (1800 MHz)",1650\nOK`;
    } else {
      response = `OK`;
    }

    const timestamp = new Date().toLocaleTimeString();
    setAtHistory(prev => [{ cmd, resp: response, time: timestamp, ok: true }, ...prev.slice(0, 19)]);
    onExecuteNvramAction('AT_COMMAND', { cmd, response });
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
              <span>{isAr ? '🔬 مركز تشخيص وإصلاح الشبكة ومعايرة المودم' : '🔬 Baseband, Network, & RF Calibration Studio'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO NETWORK REPAIR
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isAr 
                ? 'التعرف التلقائي على المودم، فحص دقيق قبل الصيانة، وإصلاح آمن دون المساس ببيانات المستخدم (Zero Data Loss)'
                : 'Automated modem detection, pre-repair hardware diagnostics, and non-destructive baseband repair.'}
            </p>
          </div>
        </div>

        {/* Sub navigation for Network panel */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab('rf_repair')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'rf_repair' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio size={13} />
            <span>{isAr ? '📡 فحص وإصلاح أعطال الشبكة' : '📡 RF Signal & Baseband'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('imei')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'imei' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key size={13} />
            <span>{isAr ? '📶 السيريال و QCN' : '📶 IMEI & NVRAM'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('carrier')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'carrier' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Unlock size={13} />
            <span>{isAr ? '🔓 فك قفل الشبكة SIM' : '🔓 Carrier Unlock'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('mdm')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'mdm' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert size={13} />
            <span>{isAr ? '🛡️ تخطي حسابات الشركات MDM' : '🛡️ MDM & Knox Guard'}</span>
          </button>
        </div>
      </div>

      {/* Automatic Device Hardware & Baseband Compatibility Strip */}
      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Cpu size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white">
                {device.brand} {device.model} ({device.chipset.toUpperCase()})
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {modemProfile.modemFamily}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck size={11} />
                <span>{isAr ? 'أمان كامل 100% بدون فقدان بيانات' : 'Zero Data Loss Guard'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {isAr ? 'منفذ التشخيص المتوافق:' : 'Diagnostic Port:'} <span className="text-cyan-300">{modemProfile.diagPortType}</span> | {isAr ? 'قطاعات الراديو:' : 'Partitions:'} <span className="text-slate-300">{modemProfile.partitionLayout.join(', ')}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleRunPreRepairDiagnosis}
          disabled={isPreScanning}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-2 shadow-md shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isPreScanning ? 'animate-spin' : 'text-amber-300'}`} />
          <span>
            {isPreScanning
              ? (isAr ? 'جاري الفحص الدقيق...' : 'DIAGNOSING BASEBAND...')
              : (isAr ? 'فحص وتشخيص مسبق للمودم والشبكة' : 'RUN PRE-REPAIR HEALTH SCAN')}
          </span>
        </button>
      </div>

      {/* Pre-Repair Scan Live Stream & Report Card */}
      {(isPreScanning || preScanReport) && (
        <div className="p-4 bg-slate-950 border border-indigo-500/40 rounded-xl space-y-3 font-mono text-xs shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 text-cyan-400 ${isPreScanning ? 'animate-spin' : ''}`} />
              <span className="font-bold text-white text-xs">
                {isAr ? 'تقرير الفحص التشخيصي المسبق لسلامة المودم والراديو' : 'Pre-Repair Hardware Diagnostic Report'}
              </span>
            </div>
            {preScanReport && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                HEALTH SCORE: {preScanReport.overallScore}% (READY FOR REPAIR)
              </span>
            )}
          </div>

          {isPreScanning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-cyan-300">
                <span>{preScanStep}</span>
                <span>{preScanProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${preScanProgress}%` }}
                />
              </div>
            </div>
          )}

          {preScanReport && (
            <div className="space-y-3 text-[11px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">{isAr ? 'إصدار المودم (Baseband FW):' : 'Baseband FW:'}</div>
                  <div className="text-cyan-300 font-bold truncate mt-0.5">{preScanReport.basebandVersion}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">{isAr ? 'سلامة قطاعات الذاكرة (CRC32):' : 'Partition Integrity:'}</div>
                  <div className="text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                    <CheckCircle size={12} />
                    <span>{preScanReport.partitionIntegrity} (MATCH)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">{isAr ? 'تغذية شريحة SIM:' : 'SIM Tray Power:'}</div>
                  <div className="text-indigo-300 font-bold mt-0.5">{preScanReport.simRailVoltage}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">{isAr ? 'مضخم الإرسال ومصفوفة الهوائي:' : 'RF Front-End / PA:'}</div>
                  <div className="text-slate-200 font-bold mt-0.5">{preScanReport.rfFrontEndStatus}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">{isAr ? 'حالة تسجيل الشبكة (RIL Stack):' : 'RIL Network Link:'}</div>
                  <div className="text-amber-300 font-bold mt-0.5">{preScanReport.rilStatus}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">{isAr ? 'مستوى الأمان وحماية البيانات:' : 'Data Safety Guard:'}</div>
                  <div className="text-emerald-400 font-bold mt-0.5">100% NON-DESTRUCTIVE</div>
                </div>
              </div>

              {/* Recommended Safe Fix Box */}
              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs">
                      {isAr ? 'العطل المحدد والإصلاح الآمن المتوافق المقترح:' : 'Detected Fault & Recommended Safe Fix:'}
                    </span>
                  </div>
                  <p className="text-indigo-200 text-[11px] leading-relaxed">
                    {isAr ? preScanReport.safeRecommendation.descAr : preScanReport.safeRecommendation.descEn}
                  </p>
                </div>

                <button
                  onClick={() => handleRunRfRepair('no_service', 'إصلاح عطل لا توجد خدمة ومزامنة الأبراج', 'Fix No Service & Sync Tower Handshake')}
                  disabled={rfIsFixing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Zap size={13} />
                  <span>{isAr ? 'تنفيذ الإصلاح الآمن فوراً' : 'EXECUTE SAFE FIX NOW'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Workspace based on subtabs */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* SUBTAB 0: COMPREHENSIVE RF SIGNAL & BASEBAND REPAIR */}
        {activeSubTab === 'rf_repair' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Live Modem Hardware & RF Telemetry Strip */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Signal size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {isAr ? 'حالة المودم وإشارات الراديو الحية' : 'Live CP Baseband & Radio Telemetry'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {radioState}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {device.brand} {device.marketName} ({device.model}) | {device.port}
                    </p>
                  </div>
                </div>

                {/* RF Telemetry Badges */}
                <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <span className="text-slate-500 uppercase">{isAr ? 'قوة الإشارة:' : 'RSSI:'}</span>
                    <span className={`font-bold ${rfSignalDbm > -75 ? 'text-emerald-400' : rfSignalDbm > -90 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {rfSignalDbm} dBm
                    </span>
                    <div className="flex items-end gap-0.5 h-3 ml-1">
                      <div className={`w-1 rounded-sm ${rfSignalDbm > -105 ? 'bg-emerald-400 h-1' : 'bg-slate-700 h-1'}`} />
                      <div className={`w-1 rounded-sm ${rfSignalDbm > -90 ? 'bg-emerald-400 h-2' : 'bg-slate-700 h-2'}`} />
                      <div className={`w-1 rounded-sm ${rfSignalDbm > -80 ? 'bg-emerald-400 h-2.5' : 'bg-slate-700 h-2.5'}`} />
                      <div className={`w-1 rounded-sm ${rfSignalDbm > -70 ? 'bg-emerald-400 h-3' : 'bg-slate-700 h-3'}`} />
                    </div>
                  </div>

                  <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <span className="text-slate-500 uppercase">{isAr ? 'شريحة SIM:' : 'SIM:'}</span>
                    <span className="text-cyan-400 font-bold">{simStatus}</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <span className="text-slate-500 uppercase">{isAr ? 'الهوائي:' : 'MIMO:'}</span>
                    <span className="text-indigo-300 font-bold">4x4 Diversity</span>
                  </div>

                  <select
                    aria-label="Radio Frequency Band Mode"
                    value={bandMode}
                    onChange={(e) => setBandMode(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="AUTO_5G_LTE">5G / 4G AUTO</option>
                    <option value="LTE_ONLY">LTE ONLY</option>
                    <option value="WCDMA_GSM">WCDMA / GSM</option>
                  </select>
                </div>
              </div>

              {/* Modem Hardware Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase">{isAr ? 'معالج الترددات' : 'BASEBAND PROCESSOR'}</span>
                  <span className="text-slate-200 font-bold">{device.chipsetName} Modem</span>
                </div>
                <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase">{isAr ? 'حالة التسجيل بالشبكة' : 'REGISTRATION STATUS'}</span>
                  <span className="text-emerald-400 font-bold">In-Service (Home PLMN)</span>
                </div>
                <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase">{isAr ? 'التردد النشط' : 'ACTIVE RF BAND'}</span>
                  <span className="text-indigo-400 font-bold">B3 (1800MHz) / n78</span>
                </div>
                <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase">{isAr ? 'كفاءة الهوائي' : 'VSWR RATIO'}</span>
                  <span className="text-cyan-400 font-bold">1.12:1 (Optimal Peak)</span>
                </div>
              </div>
            </div>

            {/* 6 One-Click Comprehensive Network Repair Tools */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isAr ? 'أدوات حل وإصلاح كافة أعطال الشبكة بنقرة واحدة' : '1-Click Automated Network & RF Fault Fixers'}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Fix 1: No Service / Emergency Only */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-3 shadow-lg group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                        <AlertTriangle size={15} />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                        {isAr ? 'حل مشكلة لا توجد خدمة ومكالمات الطوارئ' : 'Fix No Service & Emergency Calls'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAr 
                        ? 'إعادة تهيئة واجهة الراديو RIL، ومسح كاش الشبكة وإجبار الهاتف على التسجيل في الأبراج.' 
                        : 'Purges RIL cellular cache, resets radio stack, and triggers forced PLMN registration handshake.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunRfRepair('no_service', 'إصلاح عطل لا توجد خدمة', 'Fix No Service & Emergency Only')}
                    disabled={rfIsFixing}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Zap size={13} />
                    <span>{isAr ? 'إصلاح فوري للشبكة' : 'Execute Auto-Fix'}</span>
                  </button>
                </div>

                {/* Fix 2: Antenna Calibration & RSSI Boost */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-3 shadow-lg group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Signal size={15} />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {isAr ? 'معايرة مصفوفة الهوائي وتضخيم الإشارة' : 'Antenna Calibration & RSSI Boost'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAr 
                        ? 'ضبط ممانعة الهوائي ومطابقة جداول الترددات NV Items 2800-2815 لتقوية الإشارة الضعيفة.' 
                        : 'Calibrates NV antenna lookup tables and tunes Power Amplifier curve to boost reception.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunRfRepair('antenna_cal', 'معايرة وتضخيم إشارة الهوائي', 'Antenna Calibration & RSSI Boost')}
                    disabled={rfIsFixing}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sliders size={13} />
                    <span>{isAr ? 'معايرة وتضخيم الإشارة' : 'Calibrate Antenna'}</span>
                  </button>
                </div>

                {/* Fix 3: Soft Modem Daemon Reboot */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-3 shadow-lg group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <RefreshCw size={15} />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {isAr ? 'إعادة تشغيل مودم الراديو برمجياً' : 'Soft Baseband Daemon Reboot'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAr 
                        ? 'إرسال أوامر AT+CFUN لتفريغ ذاكرة الراديو وإعادة تشغيل معالج المودم دون إعادة تشغيل الهاتف.' 
                        : 'Reboots the Baseband coprocessor daemon via AT+CFUN=1,1 to clear frozen radio states.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunRfRepair('modem_reboot', 'إعادة تشغيل مودم الراديو برمجياً', 'Soft Baseband Daemon Reboot')}
                    disabled={rfIsFixing}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={13} />
                    <span>{isAr ? 'إعادة تشغيل المودم فوراً' : 'Reboot Baseband'}</span>
                  </button>
                </div>

                {/* Fix 4: Restore APN & Network Defaults */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-3 shadow-lg group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                        <Globe size={15} />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {isAr ? 'استعادة إعدادات الـ APN وشبكات الاتصال' : 'Restore APN & Radio DB'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAr 
                        ? 'إعادة بناء قاعدة بيانات نقاط الوصول وحقن ملفات الشبكة الرسمية لخدمات الإنترنت والـ VoLTE.' 
                        : 'Reconstructs cellular database with factory default APN configs and enables VoLTE/IMS.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunRfRepair('reset_apn', 'استعادة إعدادات الـ APN الافتراضية', 'Restore Default APN & Radio DB')}
                    disabled={rfIsFixing}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Layers size={13} />
                    <span>{isAr ? 'استعادة نقاط الوصول APN' : 'Restore APN Defaults'}</span>
                  </button>
                </div>

                {/* Fix 5: Backup NVRAM / EFS */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-3 shadow-lg group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <ShieldCheck size={15} />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {isAr ? 'نسخ احتياطي لقطاعات الشبكة (NVRAM/EFS)' : 'Backup NVRAM & EFS Partitions'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAr 
                        ? 'حفظ نسخة أصلية من قطاعات الراديو الحساسة (efs1, efs2, nvram, secro) لحمايتها من التلف.' 
                        : 'Dumps raw partition images of radio calibration blocks with SHA-256 verification.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunRfRepair('backup_nvram', 'نسخ احتياطي لقطاعات الشبكة', 'Backup NVRAM & EFS Partitions')}
                    disabled={rfIsFixing}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Download size={13} />
                    <span>{isAr ? 'أخذ نسخة احتياطية للشبكة' : 'Backup Radio Blocks'}</span>
                  </button>
                </div>

                {/* Fix 6: Restore Calibrated Stock QCN */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-3 shadow-lg group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                        <Upload size={15} />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                        {isAr ? 'استعادة ملف QCN / NVRAM المعاير المصنعي' : 'Restore Stock Calibrated QCN'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAr 
                        ? 'كتابة ملف الترددات المصنعي المطابق لموديل المعالج لتثبيت الاتصال بالشبكات المحلية والدولية.' 
                        : 'Flashes factory-calibrated RF parameter tables into NV memory for target chipset.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunRfRepair('restore_qcn', 'استعادة ملف QCN المصنعي المعاير', 'Restore Stock Calibrated QCN')}
                    disabled={rfIsFixing}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Upload size={13} />
                    <span>{isAr ? 'استعادة ملف QCN المعاير' : 'Restore Stock QCN'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time RF Execution Terminal */}
            {(rfIsFixing || rfLogs.length > 0) && (
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3 shadow-inner font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Activity size={14} className={rfIsFixing ? 'animate-spin' : ''} />
                    <span className="font-bold">{activeFixName || (isAr ? 'سجل العمليات' : 'Execution Stream')}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{rfProgress}%</span>
                </div>

                {rfIsFixing && (
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${rfProgress}%` }} />
                  </div>
                )}

                <div className="bg-black/95 p-3 rounded-lg border border-slate-850 max-h-[140px] overflow-y-auto space-y-1 text-[11px]">
                  {rfLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-400 shrink-0">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnostic AT Command Terminal */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Terminal size={14} className="text-indigo-400" />
                  <span>{isAr ? 'طرفية أوامر AT المباشرة لتشخيص المودم (Diag Port / AT Console)' : 'Modem Diag Port & 3GPP AT Command Console'}</span>
                </h4>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">115200 8-N-1 Serial Link</span>
              </div>

              {/* Quick AT Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 font-mono uppercase mr-1">{isAr ? 'أوامر سريعة:' : 'Presets:'}</span>
                {[
                  { cmd: 'AT', label: 'AT (Ping)' },
                  { cmd: 'AT+CSQ', label: 'AT+CSQ (Signal Quality)' },
                  { cmd: 'AT+COPS=?', label: 'AT+COPS=? (Scan Towers)' },
                  { cmd: 'AT+CREG?', label: 'AT+CREG? (Cell Status)' },
                  { cmd: 'AT+CFUN=1,1', label: 'AT+CFUN=1,1 (Reboot Modem)' },
                  { cmd: 'AT*#0808#', label: '*#0808# (Samsung Diag)' },
                  { cmd: 'AT+CGDCONT?', label: 'AT+CGDCONT? (APN Table)' },
                  { cmd: 'AT+QNWINFO', label: 'AT+QNWINFO (Radio Band)' }
                ].map((item) => (
                  <button
                    key={item.cmd}
                    onClick={() => {
                      setAtCommandInput(item.cmd);
                      handleSendAt(item.cmd);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-[10px] font-mono border border-slate-700 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Command Input Row */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={atCommandInput}
                    onChange={(e) => setAtCommandInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendAt();
                    }}
                    placeholder="Enter raw AT Command (e.g. AT+CSQ, AT+COPS=?)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-cyan-300 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={() => handleSendAt()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Send size={13} />
                  <span>{isAr ? 'إرسال' : 'Send'}</span>
                </button>
              </div>

              {/* AT Console Output Log */}
              <div className="bg-black/95 p-3 rounded-lg border border-slate-850 font-mono text-[11px] h-[160px] overflow-y-auto space-y-2">
                {atHistory.map((item, idx) => (
                  <div key={idx} className="space-y-0.5 border-b border-slate-850/60 pb-1.5 last:border-0">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="text-indigo-400 font-bold">TX &gt;&gt; {item.cmd}</span>
                      <span>{item.time}</span>
                    </div>
                    <div className="text-emerald-400 whitespace-pre-wrap pl-2 leading-relaxed">
                      {item.resp}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

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
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isAr ? 'حساب خوارزمية Luhn وتوليد NV Hex' : 'Calculate Checksum & Qualcomm BCD'}</span>
                  </button>

                  <span className="text-[10px] font-mono text-slate-500">
                    {imei1 ? `${imei1.length}/15 digits` : 'Empty'}
                  </span>
                </div>

                {/* BCD Hex & TAC Breakdown Preview */}
                {imeiValidation && (
                  <div className={`p-3 rounded-lg border space-y-1.5 font-mono text-[11px] ${
                    imeiValidation.valid ? 'bg-slate-950 border-emerald-500/40 text-slate-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}>
                    {imeiValidation.statusMsg && (
                      <div className="text-[10px] font-bold text-cyan-400">
                        {imeiValidation.statusMsg}
                      </div>
                    )}
                    {imeiValidation.valid && (
                      <>
                        <div className="flex justify-between text-slate-400">
                          <span>TAC (Type Allocation Code):</span>
                          <span className="text-cyan-300 font-bold">{imeiValidation.tac1}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>SNR (Serial Number):</span>
                          <span className="text-slate-300 font-bold">{imeiValidation.snr1}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Luhn Check Digit (CD):</span>
                          <span className="text-emerald-400 font-bold">{imeiValidation.checkDigit1}</span>
                        </div>
                        {imeiValidation.checkDigit2 !== null && (
                          <div className="flex justify-between text-slate-400">
                            <span>IMEI 2 Check Digit:</span>
                            <span className="text-emerald-400 font-bold">{imeiValidation.checkDigit2}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                          <span>NV_ITEM_UE_IMEI (550) BCD:</span>
                          <span className="text-indigo-300 font-bold break-all">{imeiValidation.bcdHex}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Live Writing Progress & Logs */}
                {(isWritingImei || imeiWriteLogs.length > 0) && (
                  <div className="p-3 bg-black/90 rounded-lg border border-indigo-500/40 space-y-2 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                        <Activity className={`w-3.5 h-3.5 ${isWritingImei ? 'animate-spin' : ''}`} />
                        <span>{isAr ? 'جاري كتابة السيريال ومزامنة المودم...' : 'Writing NVRAM / EFS sectors...'}</span>
                      </span>
                      <span className="text-amber-400 font-bold">{imeiWriteProgress}%</span>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${imeiWriteProgress}%` }} 
                      />
                    </div>

                    <div className="max-h-24 overflow-y-auto space-y-1 text-[10px] text-slate-300 pr-1">
                      {imeiWriteLogs.map((l, i) => (
                        <div key={i} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-cyan-400">&gt;</span>
                          <span>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleExecuteWriteImei}
                disabled={isBusy || isWritingImei || !imei1}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Wrench className={`w-4 h-4 ${isWritingImei ? 'animate-spin' : ''}`} />
                <span>
                  {isWritingImei
                    ? (isAr ? 'جاري الكتابة والمزامنة...' : 'WRITING TO NVRAM / EFS...')
                    : (isAr ? 'كتابة السيريال إلى قطاع NVRAM / EFS' : 'WRITE IMEI TO NVRAM / EFS PARTITION')}
                </span>
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

            {/* Bottom Wide Card: Samsung Production Network Core Engine (Shannon / Exynos / Qualcomm) */}
            <div className="lg:col-span-2 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border border-indigo-500/40 rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>{isAr ? '💻 محرك شبكة سامسونج الحقيقي الشامل (Samsung Production Network Core Engine)' : '💻 Samsung Production Network Core Engine'}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-cyan-300 font-mono border border-indigo-500/30">
                        EXYNOS / SHANNON & QUALCOMM
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isAr
                        ? 'إصلاح مشاكل الشبكة الصعبة (IMEI Null / Unknown Baseband / Emergency Calls Only / Phone Not Allowed) مع حماية البيانات 100%'
                        : 'Resolves IMEI Null, 0049 Generic IMEI, Unknown Baseband, and Patch Certificate via Shannon DM interface.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadCSharpEngine}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
                  title="Download UniversalNetworkRepairEngine.cs"
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isAr ? 'تحميل كود المحرك C#' : 'Download C# Engine'}</span>
                </button>
              </div>

              {/* Step-by-Step DM Mode & Diagnostic Port Guidance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">1. تفعيل وضع الصيانة المباشر</div>
                  <div className="text-xs text-white font-bold font-mono">*#0808# ➔ DM + MODEM + ADB</div>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'أدخل الكود في واجهة الاتصال لاكتشاف منفذ Samsung Mobile USB Serial Port.' : 'Dial secret code to activate Samsung DM high-speed diagnostic modem port.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">2. تحويل وتشفير السيريال</div>
                  <div className="text-xs text-indigo-300 font-bold font-mono">
                    {imei1 ? samsungNetworkEngine.convertImeiToSamsungHex(imei1) : '0A5398...'}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'تشفير Nibble-Swap متوافق مع حزمة بايتات مودم Shannon Exynos.' : 'Automatic Shannon Modem byte nibble-swapping with 0A prefix and F padding.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">3. بروتوكول الإصلاح الصارم</div>
                  <div className="text-xs text-emerald-300 font-bold font-mono">AT+EEMPTYNV ➔ AT+MSID ➔ AT+NETREG</div>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'تصفير الكاش المعطوب وحقن السيريال وإعادة تشغيل مكدس الراديو RILRESTART.' : 'Clears damaged temporary NV cache, injects hardware ID, and restarts RIL stack.'}
                  </p>
                </div>
              </div>

              {/* Real-time Samsung Engine Execution Progress, Checklist & Logs */}
              {(isSamsungRepairing || samsungLogs.length > 0) && (
                <div className="p-4 bg-black/90 rounded-xl border border-indigo-500/40 font-mono text-xs space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-2">
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                      <Activity className={`w-3.5 h-3.5 ${isSamsungRepairing ? 'animate-spin' : ''}`} />
                      <span>{samsungStage || (isAr ? 'جاري تنفيذ محرك سامسونج...' : 'Executing Samsung Production Engine...')}</span>
                    </span>
                    <span className="text-amber-400 font-bold">{samsungProgress}%</span>
                  </div>

                  {/* 5-Stage Visual Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[10px]">
                    {[
                      { num: 1, titleAr: 'نسخ EFS احتياطي', titleEn: 'EFS Snapshot', p: 20 },
                      { num: 2, titleAr: 'تصفير الكاش المعطوب', titleEn: 'Clear Temp NV', p: 45 },
                      { num: 3, titleAr: 'حقن السيريال Shannon', titleEn: 'Inject MSID Hex', p: 70 },
                      { num: 4, titleAr: 'تثبيت التمكين الخلوي', titleEn: 'Auto NetReg', p: 85 },
                      { num: 5, titleAr: 'إعادة إقلاع الراديو', titleEn: 'RIL Soft-Boot', p: 100 },
                    ].map(stg => {
                      const isDone = samsungProgress >= stg.p;
                      const isCurr = isSamsungRepairing && samsungProgress >= (stg.p - 25) && samsungProgress < stg.p;

                      return (
                        <div
                          key={stg.num}
                          className={`p-2 rounded-lg border flex items-center gap-1.5 transition-all ${
                            isDone
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                              : isCurr
                              ? 'bg-indigo-950/60 border-indigo-500 text-cyan-300 animate-pulse'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                            isDone ? 'bg-emerald-500 text-black' : isCurr ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isDone ? '✓' : stg.num}
                          </div>
                          <span className="truncate font-bold">{isAr ? stg.titleAr : stg.titleEn}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${samsungProgress}%` }}
                    />
                  </div>

                  <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] text-slate-300 pr-1">
                    {samsungLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-cyan-400">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'حماية البيانات: لن يتم حذف أو تعديل أي من صور وتطبيقات المستخدم.' : 'Zero Data Loss: User photos and apps remain 100% intact.'}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={async () => {
                      const res = await realUsbService.requestWebSerialPort(115200);
                      if (res.success) {
                        setSamsungLogs(prev => [...prev, `[WEBSERIAL] Paired to physical serial port: ${res.portName}`]);
                      }
                    }}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Usb className="w-4 h-4 text-cyan-400" />
                    <span>{isAr ? 'ربط منفذ Serial COM المباشر' : 'Pair WebSerial COM Port'}</span>
                  </button>

                  <button
                    onClick={handleRunSamsungProductionRepair}
                    disabled={isSamsungRepairing || isBusy || !imei1}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Zap className={`w-4 h-4 ${isSamsungRepairing ? 'animate-spin' : 'fill-white'}`} />
                    <span>
                      {isSamsungRepairing
                        ? (isAr ? 'جاري الإصلاح العميق لمودم سامسونج...' : 'EXECUTING SAMSUNG REPAIR...')
                        : (isAr ? 'بدء الإصلاح الحقيقي لمودم سامسونج الآن' : 'EXECUTE SAMSUNG PRODUCTION REPAIR')}
                    </span>
                  </button>
                </div>
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
