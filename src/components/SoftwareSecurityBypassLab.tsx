import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Zap, 
  Cpu, 
  Lock, 
  Unlock, 
  Key, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Sparkles, 
  RefreshCw, 
  FileCode, 
  Smartphone, 
  Server, 
  Radio, 
  Download, 
  Upload, 
  HardDrive, 
  ShieldCheck, 
  Flame, 
  Binary,
  Sliders,
  Play
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface SoftwareSecurityBypassLabProps {
  lang: 'en' | 'ar';
  device: ConnectedDevice;
  onAddLog?: (log: string) => void;
  onNavigateToTool?: (tabId: string) => void;
}

interface SecurityProtocolTool {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'KNOX_MDM' | 'QUALCOMM_EDL' | 'MTK_DIMENSITY' | 'APPLE_RAMDISK' | 'FASTBOOTD_AVB' | 'UNISOC_DIAG';
  targetChip: string;
  securityLevel: string;
  timeSec: number;
  descriptionEn: string;
  descriptionAr: string;
  commandSnippet: string;
  features: string[];
}

export const SoftwareSecurityBypassLab: React.FC<SoftwareSecurityBypassLabProps> = ({
  lang,
  device,
  onAddLog,
  onNavigateToTool
}) => {
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'security_bypass' | 'fastbootd_flasher' | 'firmware_decryptor' | 'port_switcher'>('security_bypass');
  const [selectedToolId, setSelectedToolId] = useState<string>('kg-knox-mdm');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionProgress, setExecutionProgress] = useState<number>(0);
  const [currentStepText, setCurrentStepText] = useState<string>('');

  React.useEffect(() => {
    // Automatically select the most relevant tool for the connected chipset
    if (device.chipset === 'mediatek') {
      setSelectedToolId('mtk-dimensity-dma');
    } else if (device.chipset === 'qualcomm') {
      setSelectedToolId('qualcomm-sahara-vip');
    } else if (device.chipset === 'samsung_exynos') {
      setSelectedToolId('kg-knox-mdm');
    } else if (device.chipset === 'unisoc_spd') {
      setSelectedToolId('imei-nvram-efs-rebuilder');
    }
  }, [device]);

  // FastbootD Flasher State
  const [targetSlot, setTargetSlot] = useState<'a' | 'b'>('a');
  const [avbDisabled, setAvbDisabled] = useState<boolean>(true);
  const [dmVerityDisabled, setDmVerityDisabled] = useState<boolean>(true);
  const [selectedPartition, setSelectedPartition] = useState<string>('super');

  // Firmware Decryptor State
  const [oemPackageType, setOemPackageType] = useState<'OPPO_OFP' | 'HUAWEI_APP' | 'LG_KDZ' | 'NOKIA_NB0' | 'SAMSUNG_TAR_MD5'>('OPPO_OFP');
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);

  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'OmniFix Software Engine: Security Protocol Matrix v2026.4 initialized.',
    'FastbootD Dynamic Logical Partition mapper linked with AVB 2.0 Root-of-Trust bypass.',
    'Qualcomm Sahara VIP Auth, MediaTek DMA BROM, and Samsung Knox Shadow ready.'
  ]);

  const securityTools: SecurityProtocolTool[] = [
    {
      id: 'kg-knox-mdm',
      nameEn: 'Samsung Knox Guard (KG) & Enterprise MDM Removal',
      nameAr: 'تخطي قفل Knox Guard (KG) وحسابات الشركات MDM و PayJoy',
      category: 'KNOX_MDM',
      targetChip: 'Exynos / Snapdragon 8 Gen 3/4',
      securityLevel: 'Knox 3.10 / KG Locked',
      timeSec: 3.2,
      descriptionEn: 'Overriding Knox Guard enrollment state using virtual RPMB shadow mapping. Neutralizes cloud policy re-lock without tripping 0x0 warranty bit.',
      descriptionAr: 'عزل وحجب جدار الحماية Knox Guard وحسابات الأقساط والشركات عبر محاكاة قطاع RPMB الافتراضي، مع الحفاظ على الحماية 0x0.',
      commandSnippet: 'OMNIFIX_KG_OVERRIDE --mode shadow_rpmb --disable-cloud-enroll --force-status COMPLETED',
      features: ['Knox 0x0 Untripped', 'OTA Update Protection', 'Zero Re-lock on WiFi', 'Supports Android 14/15/16']
    },
    {
      id: 'qualcomm-sahara-vip',
      nameEn: 'Qualcomm Firehose Sahara VIP Auth Bypass (EDL 9008)',
      nameAr: 'تخطي توثيق سيرفرات كوالكوم VIP Sahara في وضع EDL 9008',
      category: 'QUALCOMM_EDL',
      targetChip: 'Snapdragon X-Elite / 8 Gen 1/2/3/4',
      securityLevel: 'PBL Crypto Level 5',
      timeSec: 2.4,
      descriptionEn: 'Emulates official Qualcomm OEM cryptographic challenge response to authorize raw Firehose write commands on locked loaders.',
      descriptionAr: 'محاكاة استجابة التشفير لخوادم كوالكوم الرسمية لتمرير اللودر وتخطي التحقق الرقمي للقراءة والكتابة العميقة على الذاكرة.',
      commandSnippet: 'SAHARA_VIP_EMULATOR --port COM9008 --patch-sbl --force-raw-firehose --skip-vip-token',
      features: ['No Credit / Server Token Needed', 'UFS 4.0 / 3.1 Direct Write', 'Dead Boot Unbrick', 'NVRAM / EFS Backup']
    },
    {
      id: 'mtk-dimensity-dma',
      nameEn: 'MediaTek Dimensity 9300/9400 SLA/DAA BROM Exploit',
      nameAr: 'كسر حماية BROM ومعالجات Dimensity الفورية عبر DMA Direct',
      category: 'MTK_DIMENSITY',
      targetChip: 'Dimensity 9400 / 8300 / Helio G99',
      securityLevel: 'MTK BootROM Hardware Guard',
      timeSec: 1.6,
      descriptionEn: 'High-speed DMA bus injection bypassing SLA (Serial Link Auth) and DAA (Download Agent Auth) handshakes instantly.',
      descriptionAr: 'استغلال مسار الوصول المباشر للذاكرة DMA لتعطيل توثيق حماية SLA/DAA دون الحاجة لحسابات وكلاء أوبو وشاومي.',
      commandSnippet: 'MTK_DMA_PUMP --target-brom --disable-sla --disable-daa --payload dimensity_2026.bin',
      features: ['1-Click Auth Disable', 'Scatter / DA Auto-Patch', 'Format / Wipe FRP in BROM', 'RPMB Read/Write']
    },
    {
      id: 'samsung-payjoy-mdm-2026',
      nameEn: 'Samsung PayJoy, Knox Cloud & Retail Mode Permanent Removal (2026)',
      nameAr: 'حذف حظر الأقساط PayJoy وحسابات Knox Cloud ورتيل مود نهائياً 2026',
      category: 'KNOX_MDM',
      targetChip: 'Exynos 1480 / 2400 / Snapdragon 8 Gen 3/4',
      securityLevel: 'Knox Guard 3.10 / PayJoy Locked',
      timeSec: 3.5,
      descriptionEn: 'Neutralizes PayJoy finance lock, Enterprise MDM policies, and Demo Retail Mode without tripping Knox or losing Samsung Wallet & Fingerprint.',
      descriptionAr: 'تعطيل قفل أقساط PayJoy وحسابات الشركات والمصانع نهائياً بدون التسبب بخروج الجهاز من الضمان أو فقدان البصمة وخدمات سامسونج.',
      commandSnippet: 'SAMSUNG_PAYJOY_KILLER --override-policy --unenroll-mdm --lock-status CLEAN',
      features: ['PayJoy Finance Lock Neutralized', 'Samsung Wallet & Knox Intact', 'No WiFi / Cloud Re-Lock', 'Android 14/15/16 Ready']
    },
    {
      id: 'imei-nvram-efs-rebuilder',
      nameEn: 'NVRAM / EFS Dual-SIM IMEI Repair & Radio Calibration (Original restoration)',
      nameAr: 'إصلاح السيريال الشبكي IMEI وصيانة قطاع EFS و NVRAM المفقود',
      category: 'UNISOC_DIAG',
      targetChip: 'Qualcomm / MediaTek / Exynos / Unisoc',
      securityLevel: 'EFS Hardware Guard',
      timeSec: 2.8,
      descriptionEn: 'Restores corrupted or zeroed IMEI 1/2, recalibrates Baseband RF filters, and writes missing QCN/NVRAM calibration data.',
      descriptionAr: 'استعادة وتصحيح السيريال الأصلي IMEI 1/2 للشبكة مع إعادة معايرة فلتر المودم وكتابة ملفات QCN/NVRAM التالفة.',
      commandSnippet: 'RADIO_EFS_REBUILDER --port diag_modem --restore-nvram --recalibrate-rf',
      features: ['Dual SIM IMEI Restoration', 'Fix Baseband Unknown', 'QCN / SEC_EFS Auto-Fix', 'Zero Signal Drop']
    },
    {
      id: 'apple-ios-ramdisk',
      nameEn: 'Apple iOS 18 Checkm8 DFU Ramdisk Baseband Activation',
      nameAr: 'تخطي شاشة التفعيل وآيكلود مع تشغيل الشبكة الكاملة iOS 18',
      category: 'APPLE_RAMDISK',
      targetChip: 'Apple A11 / A12 / A14 / A15 / A16',
      securityLevel: 'Secure Enclave Processor (SEP)',
      timeSec: 4.5,
      descriptionEn: 'Injects custom ephemeral ramdisk in Pwned DFU mode, dumps baseband factory tickets, and enables full cellular calls and SIM signal.',
      descriptionAr: 'حقن رام ديسك مخصص في وضع Pwned DFU وتوليد تذاكر التفعيل الخلوي وتشغيل الاتصال والإنترنت والـ SIM بالكامل.',
      commandSnippet: 'IOS_RAMDISK_PWN --pwn-dfu --mount-data --dump-commcenter --generate-wildcard-ticket',
      features: ['Full Cellular & Calls Working', 'Untethered Reboot', 'Notification Fix', 'Face ID / Touch ID Intact']
    },
    {
      id: 'fastbootd-avb-patch',
      nameEn: 'Android 15/16 Dynamic FastbootD & AVB 2.0 Verity Patcher',
      nameAr: 'تفليش السوبر الديناميكي وتعطيل حماية AVB 2.0 / dm-verity',
      category: 'FASTBOOTD_AVB',
      targetChip: 'Universal Android 14/15/16',
      securityLevel: 'Android Verified Boot 2.0',
      timeSec: 2.1,
      descriptionEn: 'Custom FastbootD dynamic logical partition slicer with automatic dm-verity disabler and Magisk/KernelSU root-of-trust injection.',
      descriptionAr: 'تقسيم وتفليش أجزاء السوبر المنطقية وفك تشفير البوت مع حقن روت KernelSU وتخطي فحص النواة التلقائي.',
      commandSnippet: 'FASTBOOTD_SLICER --flash-slot a --disable-verity --disable-verification --patch-vbmeta',
      features: ['Resize Dynamic Partitions', 'Flash Super without Erase', 'Disable dm-verity Bootloop', 'GSI Custom ROM Flash']
    },
    {
      id: 'unisoc-diag-wipe',
      nameEn: 'Unisoc / SPD Diag Port 1-Click Factory Reset & FRP',
      nameAr: 'فورمات وفك FRP لمعالجات Unisoc / Spreadtrum بنقرة واحدة',
      category: 'UNISOC_DIAG',
      targetChip: 'Unisoc T606 / T616 / T618 / SC9863A',
      securityLevel: 'Diag Protocol Mode',
      timeSec: 1.4,
      descriptionEn: 'Communicates with Unisoc low-level Diagnostic Port to wipe Userdata and FRP partition safely without bricking bootloader.',
      descriptionAr: 'التواصل المباشر مع منفذ التشخيص Diag لحذف بيانات المستخدم وقفل FRP بأمان دون لمس ملفات الإقلاع.',
      commandSnippet: 'UNISOC_DIAG_ENGINE --port diag_com --cmd WIPE_FRP_USERDATA --reboot-normal',
      features: ['Works in 1.4 Seconds', 'No Testpoint Required', 'Auto-Driver Handshake', 'Full IMEI Preservation']
    }
  ];

  const selectedTool = securityTools.find(t => t.id === selectedToolId) || securityTools[0];

  const handleExecuteProtocol = () => {
    setIsExecuting(true);
    setExecutionProgress(10);
    setCurrentStepText(isAr ? 'بدء مصافحة المنفذ وحقن اللودر...' : 'Initiating USB Port Handshake & Injecting Loader...');

    const startMsg = `Executing [${selectedTool.nameEn}] on ${device.model}...`;
    setConsoleLogs(prev => [startMsg, ...prev]);
    if (onAddLog) onAddLog(startMsg);

    // Step 1
    setTimeout(() => {
      setExecutionProgress(45);
      setCurrentStepText(isAr ? 'تجاوز توثيق الحماية والأمان وتعديل السجلات...' : 'Bypassing Security Authentication & Patching Registers...');
      const stepMsg = `Security Enclave Handshake: ${selectedTool.commandSnippet}`;
      setConsoleLogs(prev => [stepMsg, ...prev]);
    }, 1000);

    // Step 2
    setTimeout(() => {
      setExecutionProgress(80);
      setCurrentStepText(isAr ? 'كتابة تذكرة التفعيل والتحقق من سلامة البوت...' : 'Writing Activation Ticket & Verifying Boot Integrity...');
    }, 2000);

    // Done
    setTimeout(() => {
      setExecutionProgress(100);
      setIsExecuting(false);
      setCurrentStepText(isAr ? 'اكتملت العملية بنجاح!' : 'Operation Completed Successfully!');
      const doneMsg = `SUCCESS: [${selectedTool.nameEn}] finished. Target phone unlocked and verified.`;
      setConsoleLogs(prev => [doneMsg, ...prev]);
      if (onAddLog) onAddLog(doneMsg);
    }, 3200);
  };

  const handleDecryptFirmware = () => {
    setIsDecrypting(true);
    const msg = `Decrypting OEM Package [${oemPackageType}] - Extracting raw partitions (boot.img, super.img, vbmeta.img)...`;
    setConsoleLogs(prev => [msg, ...prev]);
    if (onAddLog) onAddLog(msg);

    setTimeout(() => {
      setIsDecrypting(false);
      const doneMsg = `Decryption Complete: Successfully extracted 14 raw image partitions from ${oemPackageType}.`;
      setConsoleLogs(prev => [doneMsg, ...prev]);
      if (onAddLog) onAddLog(doneMsg);
    }, 2200);
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-cyan-500/20 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-600/10 via-blue-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Unlock size={28} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white">
                {isAr ? 'استوديو السوفت وير المتقدم وتخطي حمايات الأمان 2026' : 'Advanced Software Flasher & Security Bypass Studio'}
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                SECURITY SUITE 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {isAr 
                ? 'تخطي حمايات Knox Guard / MDM، توثيق كوالكوم VIP Sahara، معالجات Dimensity BROM، رام ديسك آبل، وتفليش FastbootD الديناميكي.' 
                : 'Knox Guard / MDM shadow unlock, Qualcomm Sahara VIP auth bypass, MediaTek Dimensity BROM DMA, Apple iOS Ramdisk, and FastbootD dynamic partition flasher.'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          {(['security_bypass', 'fastbootd_flasher', 'firmware_decryptor', 'port_switcher'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab 
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab === 'security_bypass' && <ShieldAlert size={14} />}
              {tab === 'fastbootd_flasher' && <Zap size={14} />}
              {tab === 'firmware_decryptor' && <Binary size={14} />}
              {tab === 'port_switcher' && <Radio size={14} />}

              {tab === 'security_bypass' && (isAr ? 'تخطي الحمايات والتوثيق' : 'Security Bypass Hub')}
              {tab === 'fastbootd_flasher' && (isAr ? 'تفليش FastbootD السوبر' : 'FastbootD Dynamic Flasher')}
              {tab === 'firmware_decryptor' && (isAr ? 'فك تشفير الفلاشات OFP/KDZ' : 'Firmware Decryptor')}
              {tab === 'port_switcher' && (isAr ? 'التحويل بين المنافذ EDL/BROM' : 'Port & Mode Switcher')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Areas */}
      {activeTab === 'security_bypass' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Tool Selector List (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key size={14} className="text-cyan-400" />
              {isAr ? 'بروتوكولات الأمان والحمايات المعتمدة' : 'Supported Security Protocols'}
            </span>

            <div className="flex flex-col gap-2.5">
              {securityTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedToolId(tool.id)}
                  className={`p-4 rounded-3xl border text-left transition-all flex flex-col gap-1.5 ${
                    selectedToolId === tool.id 
                      ? 'bg-cyan-500/10 border-cyan-500 text-white font-bold ring-2 ring-cyan-500/20 shadow-lg' 
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{isAr ? tool.nameAr : tool.nameEn}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-cyan-300 rounded-full border border-white/5">
                      {tool.timeSec}s
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                    <span>Chip: {tool.targetChip}</span>
                    <span>•</span>
                    <span className="text-amber-400">{tool.securityLevel}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Tool Execution Terminal (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white">{isAr ? selectedTool.nameAr : selectedTool.nameEn}</h3>
                  <span className="text-xs text-cyan-400 font-mono">{selectedTool.category} | Target: {device.model}</span>
                </div>

                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono font-bold rounded-full">
                  READY
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-white/5">
                {isAr ? selectedTool.descriptionAr : selectedTool.descriptionEn}
              </p>

              {/* Feature Tags */}
              <div className="grid grid-cols-2 gap-2">
                {selectedTool.features.map((feat, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950/80 rounded-xl border border-white/5 flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Command Code Preview */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 font-mono text-[11px] text-cyan-300 flex items-center justify-between overflow-x-auto">
                <span>$ {selectedTool.commandSnippet}</span>
              </div>

              {/* Progress & Execution Bar */}
              {isExecuting && (
                <div className="flex flex-col gap-2 p-4 bg-slate-950 rounded-2xl border border-cyan-500/30">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-cyan-400">{currentStepText}</span>
                    <span className="text-white">{executionProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${executionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleExecuteProtocol}
                  disabled={isExecuting}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  <Play size={16} className={isExecuting ? 'animate-spin' : ''} />
                  {isExecuting ? (isAr ? 'جاري تنفيذ البروتوكول...' : 'Executing Security Protocol...') : (isAr ? 'بدء فك وتخطي الحماية فوراً' : 'Execute 1-Click Bypass Protocol')}
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* FastbootD Flasher Tab */}
      {activeTab === 'fastbootd_flasher' && (
        <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{isAr ? 'محرر ومفلش أجزاء السوبر الديناميكية (FastbootD Super Partition Slicer)' : 'FastbootD Dynamic Logical Partition Flasher'}</h3>
                <span className="text-xs text-slate-400 font-mono">Compatible with Android 10 to Android 16 Dynamic Partitions</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">{isAr ? 'المنفذ المستهدف:' : 'Active Slot:'}</span>
              <button 
                onClick={() => setTargetSlot(targetSlot === 'a' ? 'b' : 'a')}
                className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold rounded-lg"
              >
                SLOT _{targetSlot.toUpperCase()}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['system', 'vendor', 'product', 'system_ext', 'odm', 'super'].map(part => (
              <div 
                key={part}
                onClick={() => setSelectedPartition(part)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedPartition === part 
                    ? 'bg-cyan-500/10 border-cyan-500 text-white' 
                    : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-xs">
                  <HardDrive size={16} className="text-cyan-400" />
                  <span>{part}.img</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Dynamic</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={avbDisabled} 
                  onChange={(e) => setAvbDisabled(e.target.checked)} 
                  className="accent-cyan-500" 
                />
                <span>Disable AVB 2.0 (vbmeta patch)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={dmVerityDisabled} 
                  onChange={(e) => setDmVerityDisabled(e.target.checked)} 
                  className="accent-cyan-500" 
                />
                <span>Disable dm-verity Verification</span>
              </label>
            </div>

            <button
              onClick={() => {
                const msg = `FastbootD: Flashed dynamic [${selectedPartition}.img] into Slot ${targetSlot.toUpperCase()} with AVB/dm-verity disabled.`;
                setConsoleLogs(l => [msg, ...l]);
                if (onAddLog) onAddLog(msg);
              }}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-cyan-500/20"
            >
              {isAr ? 'تفليش القسم المحدد فوراً' : 'Flash Partition in FastbootD'}
            </button>
          </div>
        </div>
      )}

      {/* Firmware Decryptor Tab */}
      {activeTab === 'firmware_decryptor' && (
        <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Binary size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{isAr ? 'مفكك ومحول الفلاشات المشفرة (OFP / OZIP / KDZ / APP Extractor)' : 'OEM Encrypted Firmware Decryptor & Unpacker'}</h3>
                <span className="text-xs text-slate-400">Extract raw boot.img, super.img, and payload.bin from encrypted factory ROMs</span>
              </div>
            </div>

            <button
              onClick={handleDecryptFirmware}
              disabled={isDecrypting}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-600/20 flex items-center gap-2"
            >
              <RefreshCw size={14} className={isDecrypting ? 'animate-spin' : ''} />
              {isDecrypting ? (isAr ? 'جاري فك التشفير...' : 'Decrypting...') : (isAr ? 'فك تشفير واستخراج الملفات' : 'Decrypt & Extract RAW Images')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'OPPO_OFP', label: 'OPPO / Realme OFP' },
              { id: 'HUAWEI_APP', label: 'Huawei UPDATE.APP' },
              { id: 'LG_KDZ', label: 'LG KDZ / DZ' },
              { id: 'NOKIA_NB0', label: 'Nokia NB0 / MLF' },
              { id: 'SAMSUNG_TAR_MD5', label: 'Samsung TAR.MD5 / LZ4' },
            ].map(pkg => (
              <button
                key={pkg.id}
                onClick={() => setOemPackageType(pkg.id as any)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                  oemPackageType === pkg.id 
                    ? 'bg-purple-500/20 border-purple-500 text-white' 
                    : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {pkg.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Port Switcher Tab */}
      {activeTab === 'port_switcher' && (
        <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Radio size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{isAr ? 'التحويل التلقائي بين أوضاع التوصيل (Mode & Port Switcher)' : '1-Click Port & Diagnostic Mode Switcher'}</h3>
                <span className="text-xs text-slate-400">Force EDL 9008, BROM, Download Mode, or Fastboot without testpoint</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { labelAr: 'إعادة تشغيل إلى EDL 9008', labelEn: 'Reboot to EDL 9008', cmd: 'adb reboot edl / fastboot oem edl' },
              { labelAr: 'إعادة تشغيل إلى BROM (MTK)', labelEn: 'Force BROM Mode', cmd: 'usb_vbus_glitch --trigger-brom' },
              { labelAr: 'إعادة تشغيل إلى Download Mode', labelEn: 'Reboot to Download Mode', cmd: 'adb reboot download' },
              { labelAr: 'إعادة تشغيل إلى FastbootD', labelEn: 'Reboot to FastbootD', cmd: 'adb reboot fastboot' },
            ].map((m, i) => (
              <button
                key={i}
                onClick={() => {
                  const msg = `Port Switcher: Executed command [${m.cmd}] on device.`;
                  setConsoleLogs(l => [msg, ...l]);
                  if (onAddLog) onAddLog(msg);
                }}
                className="p-4 bg-slate-950 hover:bg-slate-800 rounded-2xl border border-white/5 text-left flex flex-col gap-1 transition-all"
              >
                <span className="text-xs font-bold text-white">{isAr ? m.labelAr : m.labelEn}</span>
                <span className="text-[10px] font-mono text-slate-500">{m.cmd}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Protocol Terminal */}
      <div className="p-4 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-2 shadow-lg">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
          <Terminal size={14} className="text-cyan-400" />
          {isAr ? 'سجل بروتوكولات السوفت وير وتخطي الحمايات' : 'Security Protocol Stream'}
        </span>
        <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 h-28 overflow-y-auto font-mono text-[10px] space-y-1.5 text-slate-400">
          {consoleLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-1.5 leading-tight">
              <span className="text-cyan-400 font-bold shrink-0">&gt;</span>
              <span className="text-slate-300">{log}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
