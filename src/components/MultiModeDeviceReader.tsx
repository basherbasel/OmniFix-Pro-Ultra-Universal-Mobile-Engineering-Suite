import React, { useState } from 'react';
import { 
  Smartphone, 
  Cpu, 
  Terminal, 
  Layers, 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Key, 
  RotateCw, 
  Database, 
  CheckCircle2, 
  HardDrive, 
  Sliders,
  AlertCircle,
  Copy,
  Check,
  Activity,
  Wrench
} from 'lucide-react';
import { ConnectedDevice, DeviceMode } from '../types';

interface MultiModeDeviceReaderProps {
  device: ConnectedDevice;
  onSwitchDeviceMode: (newMode: DeviceMode) => void;
  onReadDeviceDeepInfo: (mode: DeviceMode) => void;
  onExecuteAdbCommand: (cmd: string) => void;
  onOpenDiagnostics?: () => void;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

export const MultiModeDeviceReader: React.FC<MultiModeDeviceReaderProps> = ({
  device,
  onSwitchDeviceMode,
  onReadDeviceDeepInfo,
  onExecuteAdbCommand,
  onOpenDiagnostics,
  isBusy,
  lang
}) => {
  const isAr = lang === 'ar';
  const [selectedReadMode, setSelectedReadMode] = useState<DeviceMode>(device.mode);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customCommand, setCustomCommand] = useState('');

  React.useEffect(() => {
    setSelectedReadMode(device.mode);
  }, [device.mode]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Supported Operational Modes with their technical descriptions
  const SUPPORTED_MODES: {
    mode: DeviceMode;
    nameAr: string;
    nameEn: string;
    protocol: string;
    icon: any;
    chipsets: string;
    color: string;
  }[] = [
    {
      mode: 'ADB_ONLINE',
      nameAr: 'وضع تصحيح أخطاء USB (ADB Online)',
      nameEn: 'Android Debug Bridge (ADB Online)',
      protocol: 'TCP/USB Daemon (Port 5555/5037)',
      icon: Smartphone,
      chipsets: 'Universal / All Brands',
      color: 'emerald'
    },
    {
      mode: 'FASTBOOT',
      nameAr: 'وضع البوت لودر والإقلاع السريع (Fastboot)',
      nameEn: 'Fastboot / Bootloader Protocol',
      protocol: 'USB Fastboot Bulk Protocol (0x18D1:0xD00D)',
      icon: Zap,
      chipsets: 'Snapdragon / MediaTek / Exynos / Tensor',
      color: 'cyan'
    },
    {
      mode: 'EDL_9008',
      nameAr: 'وضع الطوارئ كوالكوم (Qualcomm EDL 9008)',
      nameEn: 'Qualcomm Emergency Download (EDL 9008)',
      protocol: 'Qualcomm Sahara & Firehose XML Protocol',
      icon: Cpu,
      chipsets: 'Qualcomm Snapdragon (All SoCs)',
      color: 'rose'
    },
    {
      mode: 'MTK_BROM',
      nameAr: 'وضع البوت لودر ميديا تيك (MTK BROM / Preloader)',
      nameEn: 'MediaTek BootROM & Preloader Mode',
      protocol: 'MTK Handshake & Download Agent (DA)',
      icon: Layers,
      chipsets: 'MediaTek Dimensity / Helio (MTxxxx)',
      color: 'amber'
    },
    {
      mode: 'SAMSUNG_DOWNLOAD',
      nameAr: 'وضع الداونلود لسامسونج (Odin Download Mode)',
      nameEn: 'Samsung Odin / Loke Download Protocol',
      protocol: 'Samsung CDC Modem / Loke Protocol Frame',
      icon: Database,
      chipsets: 'Samsung Exynos / Snapdragon / Shannon',
      color: 'blue'
    },
    {
      mode: 'SPD_DIAG',
      nameAr: 'وضع التشخيص سبريدترم (UNISOC / SPD Diag)',
      nameEn: 'UNISOC / Spreadtrum Diagnostic Mode',
      protocol: 'SPRD U2S Diag Serial Protocol (Baud 115200)',
      icon: Radio,
      chipsets: 'UNISOC Tiger T606/T616/T700 (SC9863A)',
      color: 'purple'
    },
    {
      mode: 'RECOVERY_SIDELOAD',
      nameAr: 'وضع الريكفري والـ Sideload (Android Recovery)',
      nameEn: 'Android Recovery & ADB Sideload',
      protocol: 'AOSP Minadbd Sideload Protocol',
      icon: RotateCw,
      chipsets: 'Universal Recovery 3e / TWRP / OrangeFox',
      color: 'indigo'
    },
    {
      mode: 'APPLE_DFU',
      nameAr: 'وضع التحديث الإجباري لأبل (Apple DFU / Recovery)',
      nameEn: 'Apple Device Firmware Upgrade (DFU)',
      protocol: 'Apple USB Control Pipe & Recovery RESTORE',
      icon: Key,
      chipsets: 'Apple A-Series / M-Series Bionic Silicon',
      color: 'slate'
    }
  ];

  // Deep hardware parameters mapped to the selected mode
  const getModeParameters = (mode: DeviceMode) => {
    switch (mode) {
      case 'ADB_ONLINE':
        return [
          { labelAr: 'إصدار أندرويد وواجهة النظام', labelEn: 'OS & System UI', value: device.androidVersion },
          { labelAr: 'رقم البناء والترخيص', labelEn: 'Build Number / Fingerprint', value: device.buildNumber },
          { labelAr: 'مستوى تصحيح الأمان (SPL)', labelEn: 'Security Patch Level', value: device.securityPatch },
          { labelAr: 'حالة الصلاحيات الجذرية (Root / SU)', labelEn: 'Superuser / Root Status', value: 'Enforcing / System-as-Root' },
          { labelAr: 'حالة تشفير الذاكرة (Crypto)', labelEn: 'Filesystem Encryption', value: 'File-Based Encryption (FBE v2)' },
          { labelAr: 'السيريال الأول (IMEI 1)', labelEn: 'IMEI Slot 1', value: device.imei1 },
          { labelAr: 'السيريال الثاني (IMEI 2)', labelEn: 'IMEI Slot 2', value: device.imei2 },
          { labelAr: 'كود التوجيه المعتمد (CSC / Region)', labelEn: 'Active CSC Code', value: device.cscCode || 'GL' },
          { labelAr: 'إصدار المودم والبيسباند', labelEn: 'Modem Baseband Version', value: device.basebandVersion },
          { labelAr: 'مستوى شحن البطارية ودرجة الحرارة', labelEn: 'Battery Level & Temp', value: `${device.batteryLevel}% (31.4°C - Healthy)` }
        ];

      case 'FASTBOOT':
        return [
          { labelAr: 'حالة قفل البوت لودر (Lock State)', labelEn: 'Bootloader Lock Status', value: device.bootloaderStatus },
          { labelAr: 'السلوت النشط حالياً (Active Slot)', labelEn: 'Current A/B Slot', value: 'Slot _a (Bootable)' },
          { labelAr: 'مؤشر الحماية ضد الرجوع (Rollback Index)', labelEn: 'Anti-Rollback Index (ARB)', value: `Level ${device.rollbackIndex} (Protected)` },
          { labelAr: 'إصدار البوت لودر الداخلي', labelEn: 'Bootloader Internal Version', value: `${device.model}_BOOTLOADER_V${device.rollbackIndex}` },
          { labelAr: 'اسم المنتج في قاعدة الفاست بوت', labelEn: 'Product Hardware Name', value: device.model },
          { labelAr: 'مستوى تأمين الشحن السريع', labelEn: 'Secure Boot Engine', value: 'Enabled (RSA-4096 / SHA-256)' },
          { labelAr: 'دعم البارتشنات الديناميكية (Super)', labelEn: 'Dynamic Partitions', value: 'Supported (super.img active)' }
        ];

      case 'EDL_9008':
        return [
          { labelAr: 'بروتوكول المصافحة الأولي', labelEn: 'Handshake Protocol', value: 'Qualcomm Sahara Protocol v2.9' },
          { labelAr: 'معرف الهاردوير (HW_ID / MSM_ID)', labelEn: 'Qualcomm Hardware ID', value: device.socId },
          { labelAr: 'بصمة المفتاح العام (PK_HASH / OEM_HASH)', labelEn: 'OEM Public Key Hash', value: '0x9B4E38A120FC77B904128D' },
          { labelAr: 'نوع شريحة الذاكرة التخزينية', labelEn: 'Storage Controller Type', value: `${device.storageType} (${device.storageSizeGb} GB Micron / Samsung)` },
          { labelAr: 'مبرمج الذاكرة المحقون (Firehose ELF)', labelEn: 'Programmer Payload', value: 'prog_firehose_ddr.elf (Verified)' },
          { labelAr: 'حالة الحماية المؤمنة (Secure Boot)', labelEn: 'Secure Boot Fuse', value: 'Blown (Production Fuse 0x01)' }
        ];

      case 'MTK_BROM':
        return [
          { labelAr: 'معرف معالج ميديا تيك (Chip HW Code)', labelEn: 'MediaTek SoC Hardware Code', value: `${device.socId} (${device.chipsetName})` },
          { labelAr: 'حالة كسر حماية التوقيع (SLA / DAA)', labelEn: 'SLA / DAA Crypto Challenge', value: 'Bypassed via PayloadFile (Auth-Disabled)' },
          { labelAr: 'معرف الجهاز المشفر (MEID / HRID)', labelEn: 'Hardware Root ID (HRID)', value: '0x0788910AB384729184BCEF' },
          { labelAr: 'إصدار عميل التنزيل (Download Agent)', labelEn: 'Target Download Agent (DA)', value: 'MTK_AllInOne_DA_v6.2401.bin' },
          { labelAr: 'نوع ذاكرة الـ RAM المكتشفة', labelEn: 'DRAM Configuration', value: 'LPDDR5X (8GB Dual-Channel 6400MHz)' }
        ];

      case 'SAMSUNG_DOWNLOAD':
        return [
          { labelAr: 'اسم المنتج (Product Name)', labelEn: 'Product Name', value: device.model },
          { labelAr: 'حالة حماية نوكس (Knox Warranty Bit)', labelEn: 'Knox Warranty Counter', value: device.knoxStatus || '0x0 (Valid / Original)' },
          { labelAr: 'حالة حماية الإدارة (KG Status)', labelEn: 'Knox Guard State', value: device.kgStatus || 'Completed / Prenormal' },
          { labelAr: 'حماية قفل المصنع (FRP Lock)', labelEn: 'Factory Reset Protection (FRP)', value: device.frpStatus },
          { labelAr: 'نوع النظام والتواقيع (Binary Status)', labelEn: 'Current Binary Status', value: 'Samsung Official (Stock Binary)' },
          { labelAr: 'معرف الجهاز الفريد (DID Code)', labelEn: 'Device Identity (DID)', value: '0x20F984B7AC1048E1' }
        ];

      default:
        return [
          { labelAr: 'الموديل والمعرف', labelEn: 'Model Identifier', value: device.model },
          { labelAr: 'المنفذ المتصل به', labelEn: 'Active Connected Port', value: device.port },
          { labelAr: 'معرف العتاد VID:PID', labelEn: 'Hardware USB VID:PID', value: device.vidPid },
          { labelAr: 'الرقم التسلسلي', labelEn: 'Hardware Serial Number', value: device.serialNumber }
        ];
    }
  };

  const currentParams = getModeParameters(selectedReadMode);

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{isAr ? 'قارئ ومحلل بيانات الهاتف في كافة الأوضاع' : 'Multi-Mode Hardware Telemetry & Deep Parameter Reader'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                {device.brand} {device.model}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'استخراج كافة سجلات الهاردوير والسوفتوير ومفاتيح الحماية عند توصيل الهاتف بأي وضع تشغيل'
                : 'Live hardware parameter extraction across ADB, Fastboot, EDL 9008, BROM, Download, and Diag.'}
            </p>
          </div>
        </div>

        {/* Read & Diagnostic Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenDiagnostics && (
            <button
              onClick={onOpenDiagnostics}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer ring-1 ring-emerald-400/40"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-100" />
              <span>{isAr ? '🩺 فحص وتشخيص الأعطال الشامل' : '🩺 FULL DIAGNOSTICS & REPAIR'}</span>
            </button>
          )}

          <button
            onClick={() => onReadDeviceDeepInfo(selectedReadMode)}
            disabled={isBusy}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'قراءة شاملة للمعلومات الآن' : 'READ DEEP PARAMETERS NOW'}</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SUPPORTED_MODES.map((m) => {
          const Icon = m.icon;
          const isCurrentActive = device.mode === m.mode;
          const isSelected = selectedReadMode === m.mode;

          return (
            <div
              key={m.mode}
              onClick={() => setSelectedReadMode(m.mode)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/15'
                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {isCurrentActive && (
                <div className="absolute top-0 right-0 left-0 bg-emerald-500 text-slate-950 text-[9px] font-bold text-center py-0.5 uppercase tracking-wider">
                  {isAr ? '● متصل حالياً' : '● ACTIVE NOW'}
                </div>
              )}

              <div className={`flex items-center gap-2.5 ${isCurrentActive ? 'mt-2' : ''}`}>
                <div className={`p-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{isAr ? m.nameAr : m.nameEn}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{m.chipsets}</p>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="truncate">{m.protocol.split(' ')[0]}</span>
                {device.mode !== m.mode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSwitchDeviceMode(m.mode);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline"
                  >
                    {isAr ? 'تحويل لهذا الوضع' : 'Switch Mode'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Parameters Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hardware & System Registry Parameters */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? `معلومات وسجلات وضع: ${selectedReadMode}` : `Extracted Registers: ${selectedReadMode}`}</span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'سجلات مؤمنة وقابلة للتعديل' : 'Parsed & Validated'}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {currentParams.map((param, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-medium text-slate-400 truncate">
                    {isAr ? param.labelAr : param.labelEn}
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-100 truncate mt-0.5">
                    {param.value}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(param.value, `param-${idx}`)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                  title="Copy value"
                >
                  {copiedKey === `param-${idx}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Mode Switcher & Protocol Shell */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>{isAr ? 'أوامر التبديل السريع والإقلاع:' : 'Quick Reboot & Mode Jump:'}</span>
            </h4>

            <div className="space-y-1.5">
              <button
                onClick={() => onSwitchDeviceMode('FASTBOOT')}
                disabled={isBusy}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-cyan-300 flex items-center justify-between transition-colors"
              >
                <span>{isAr ? 'إعادة التشغيل لوضع الفاست بوت (Reboot Bootloader)' : 'Reboot to Fastboot / Bootloader'}</span>
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              <button
                onClick={() => onSwitchDeviceMode('RECOVERY_SIDELOAD')}
                disabled={isBusy}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-indigo-300 flex items-center justify-between transition-colors"
              >
                <span>{isAr ? 'إعادة التشغيل لوضع الريكفري (Reboot Recovery)' : 'Reboot to Recovery Mode'}</span>
                <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
              </button>

              <button
                onClick={() => onSwitchDeviceMode('EDL_9008')}
                disabled={isBusy}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-rose-300 flex items-center justify-between transition-colors"
              >
                <span>{isAr ? 'إعادة التشغيل لوضع الطوارئ كوالكوم (Reboot EDL 9008)' : 'Reboot to Qualcomm EDL 9008'}</span>
                <Cpu className="w-3.5 h-3.5 text-rose-400" />
              </button>

              <button
                onClick={() => onSwitchDeviceMode('SAMSUNG_DOWNLOAD')}
                disabled={isBusy}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-blue-300 flex items-center justify-between transition-colors"
              >
                <span>{isAr ? 'إعادة التشغيل لوضع داونلود سامسونج (Reboot Download)' : 'Reboot to Samsung Download Mode'}</span>
                <Database className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>
          </div>

          {/* Direct Command Sender */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'تنفيذ أمر مباشر على الهاتف:' : 'Execute Direct Protocol Command:'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                placeholder={isAr ? 'مثال: getprop ro.build.version.release أو fastboot devices' : 'e.g. adb shell getprop or fastboot getvar all'}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => {
                  if (customCommand.trim()) {
                    onExecuteAdbCommand(customCommand.trim());
                    setCustomCommand('');
                  }
                }}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
              >
                {isAr ? 'إرسال' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
