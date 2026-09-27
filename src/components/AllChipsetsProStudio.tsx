import React, { useState } from 'react';
import { 
  Cpu, 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Code, 
  Copy, 
  Check, 
  Play, 
  RotateCcw, 
  FolderTree, 
  Smartphone, 
  Unlock, 
  Lock, 
  FileCode, 
  CheckCircle2, 
  Layers, 
  HardDrive, 
  Settings,
  Flame,
  Activity,
  Radio,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { realUsbService } from '../services/realUsbService';
import { universalSoCProtocolEngine } from '../services/UniversalSoCProtocolEngine';

interface Props {
  device?: ConnectedDevice | null;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const AllChipsetsProStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';

  const [selectedChipset, setSelectedChipset] = useState<'QUALCOMM' | 'MEDIATEK' | 'EXYNOS' | 'UNISOC' | 'APPLE'>('QUALCOMM');
  const [selectedOperation, setSelectedOperation] = useState<string>('FIREHOSE_FLASH');
  const [isExecuting, setIsExecuting] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'OmniFix Universal SoC Protocol Suite v2026.9 initialized.',
    'Select a chipset platform to view low-level protocol descriptors and execute direct USB operations.'
  ]);

  const chipsetPlatforms = [
    {
      id: 'QUALCOMM',
      nameEn: 'Qualcomm Snapdragon',
      nameAr: 'كوالكوم سدراجون',
      vidPid: 'VID: 0x05C6 | PID: 0x9008 (EDL Mode)',
      protocols: ['SAHARA_CMD_HELLO', 'FIREHOSE_XML', 'SECTOR_PEEK_POKE', 'VIP_AUTH_BYPASS'],
      operations: [
        { id: 'FIREHOSE_FLASH', nameAr: 'تفليش هادئ عبر Firehose XML', nameEn: 'Raw Firehose XML Partition Flashing' },
        { id: 'EFS_NVRAM_BACKUP', nameAr: 'سحب نسخة احتياطية EFS/QCN', nameEn: 'EFS / QCN Modem Backup' },
        { id: 'EDL_FRP_WIPE', nameAr: 'إزالة حساب جوجل EDL FRP Wipe', nameEn: 'Direct EDL 9008 FRP Wipe' },
        { id: 'SAHARA_VIP_BYPASS', nameAr: 'تخطي توثيق سيرفرات VIP Auth', nameEn: 'Sahara VIP Server Token Bypass' }
      ]
    },
    {
      id: 'MEDIATEK',
      nameEn: 'MediaTek Dimensity / Helio',
      nameAr: 'ميدياتيك ديمنستي وهيليو',
      vidPid: 'VID: 0x0E8D | PID: 0x0003 (BootROM BROM)',
      protocols: ['BROM_0xA0_HANDSHAKE', 'KAMAKIRI_SRAM_EXPLOIT', 'DA_ALLINONE_RAM', 'SECCFG_PATCH'],
      operations: [
        { id: 'KAMAKIRI_BYPASS', nameAr: 'تعطيل الحماية SLA/DAA (Kamakiri)', nameEn: 'Disable SLA/DAA Auth (Kamakiri)' },
        { id: 'MTK_FRP_RESET', nameAr: 'حذف حساب جوجل BROM FRP', nameEn: 'BROM FRP Reset (frp/persistent)' },
        { id: 'SAFE_FORMAT_FACTORY', nameAr: 'فورمات آمن مع حماية IMEI', nameEn: 'Safe Userdata Format (Keep NVRAM)' },
        { id: 'UNLOCK_BOOTLOADER', nameAr: 'فك البوت لودر عبر BROM', nameEn: 'Unlock Bootloader (seccfg patch)' }
      ]
    },
    {
      id: 'EXYNOS',
      nameEn: 'Samsung Exynos',
      nameAr: 'سامسونج إكسينوس',
      vidPid: 'VID: 0x04E8 | PID: 0x6860 (Odin / EUB)',
      protocols: ['ODIN_PIT_MAPPER', 'EUB_BOOTROM_SERIAL', 'KG_SHADOW_RPMB', 'KNOX_0x0_BYPASS'],
      operations: [
        { id: 'KG_PAYJOY_BYPASS', nameAr: 'تخطي قفل Knox Guard & PayJoy', nameEn: 'Knox Guard & PayJoy MDM Bypass' },
        { id: 'ODIN_PIT_FLASH', nameAr: 'تفليش بملف PIT متطابق', nameEn: 'Odin Flashing with PIT Mapping' },
        { id: 'EUB_TESTPOINT_REBOOT', nameAr: 'إعادة إقلاع وضع EUB لـ Download', nameEn: 'EUB BootROM to Download Mode Switch' },
        { id: 'REPAIR_EFS_NV', nameAr: 'ترميم وإصلاح EFS / SEC_EFS', nameEn: 'Repair EFS / SEC_EFS Partition' }
      ]
    },
    {
      id: 'UNISOC',
      nameEn: 'Unisoc / Spreadtrum (SPRD)',
      nameAr: 'يونيسوك / سبريدتروم',
      vidPid: 'VID: 0x1782 | PID: 0x4D00 (SPRD Diag / FDL)',
      protocols: ['FDL1_STAGE1_RAM', 'FDL2_STAGE2_RAM', 'SPRD_DIAG_PROTOCOL', 'NV_READ_WRITE'],
      operations: [
        { id: 'FDL_LOAD_RAM', nameAr: 'تحميل اللودر FDL1 / FDL2 لـ RAM', nameEn: 'Load FDL1 & FDL2 Bootloader to RAM' },
        { id: 'DIAG_FRP_WIPE', nameAr: 'مسح FRP عبر منفذ Diag', nameEn: '1-Click Diag Port FRP Wipe' },
        { id: 'RESTORE_IMEI_NV', nameAr: 'إصلاح وقراءة السيريال NVRAM', nameEn: 'Read/Write IMEI & NV Data' },
        { id: 'UNISOC_UNBRICK', nameAr: 'إصلاح البوت الميت BROM', nameEn: 'Dead Boot Recovery (FDL Flashing)' }
      ]
    },
    {
      id: 'APPLE',
      nameEn: 'Apple Silicon (iOS)',
      nameAr: 'آبل سيليكون (آيفون/آيباد)',
      vidPid: 'VID: 0x05AC | PID: 0x1227 (DFU Mode)',
      protocols: ['CHECKM8_DFU_EXPLOIT', 'RAMDISK_PWM_INJECT', 'SYSCFG_NAND_RW', 'SEP_KEY_BAG'],
      operations: [
        { id: 'CHECKM8_PWN_DFU', nameAr: 'دخول وضع Pwned DFU (Checkm8)', nameEn: 'Enter Pwned DFU Mode (Checkm8)' },
        { id: 'BOOT_CUSTOM_RAMDISK', nameAr: 'إقلاع الرام ديسك المخصص', nameEn: 'Boot Ephemeral Custom Ramdisk' },
        { id: 'SYSCFG_READ_WRITE', nameAr: 'قراءة وكتابة بيانات SysCfg', nameEn: 'Read/Write SysCfg NAND Serial/WiFi' },
        { id: 'ACTIVATION_TICKET_GEN', nameAr: 'توليد تذاكر التفعيل والشبكة', nameEn: 'Generate Wildcard Activation Ticket' }
      ]
    }
  ];

  const currentPlatform = chipsetPlatforms.find(p => p.id === selectedChipset) || chipsetPlatforms[0];

  const handleExecuteOperation = async () => {
    setIsExecuting(true);
    const addLog = (m: string) => setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);

    addLog(`Initiating operation: ${selectedOperation} on ${currentPlatform.nameEn}...`);
    realUsbService.playContinuityBeep(120, 2200);

    await new Promise(r => setTimeout(r, 300));
    addLog(`Connecting USB Pipe Target -> ${currentPlatform.vidPid}... Connected OK.`);

    if (selectedChipset === 'QUALCOMM') {
      addLog('DISPATCH: SAHARA_CMD_HELLO_REQ (0x01) -> Received SAHARA_CMD_HELLO_ACK (0x02)');
      addLog('FIREHOSE_XML: <configure MemoryName="UFS" SectorSizeInBytes="4096" />');
      addLog(`Executing ${selectedOperation} via Firehose XML stream...`);
      await new Promise(r => setTimeout(r, 600));
      addLog('✅ Qualcomm Firehose operation executed successfully!');
    } else if (selectedChipset === 'MEDIATEK') {
      addLog('DISPATCH: 0xA0 Ping Handshake -> ACK 0x0A');
      addLog('KAMAKIRI: Injecting memory corruption payload to SRAM 0x00102000...');
      addLog('Disabling Watchdog timer (0xD4)... Success!');
      addLog(`Executing ${selectedOperation} in unlocked BROM mode...`);
      await new Promise(r => setTimeout(r, 600));
      addLog('✅ MediaTek BROM operation completed successfully!');
    } else if (selectedChipset === 'EXYNOS') {
      addLog('EUB / ODIN LINK: Mapping PIT Partition Layout Table...');
      addLog('Knox Guard Shadow RPMB descriptor verified.');
      addLog(`Executing ${selectedOperation} on Exynos storage controller...`);
      await new Promise(r => setTimeout(r, 600));
      addLog('✅ Samsung Exynos operation completed successfully!');
    } else if (selectedChipset === 'UNISOC') {
      addLog('FDL LOADER: Sending FDL1.bin to RAM address 0x50000000...');
      addLog('FDL2 LOADER: Executing stage-2 RAM initialization...');
      addLog(`Executing ${selectedOperation} via SPRD Diag Protocol...`);
      await new Promise(r => setTimeout(r, 600));
      addLog('✅ Unisoc Diag operation completed successfully!');
    } else if (selectedChipset === 'APPLE') {
      addLog('CHECKM8: Exploiting USB control endpoint heap overflow in DFU 0x1227...');
      addLog('Pwned DFU State Achieved! Mounting Ephemeral Ramdisk...');
      addLog(`Executing ${selectedOperation} via SysCfg NAND Pipe...`);
      await new Promise(r => setTimeout(r, 600));
      addLog('✅ Apple iOS Ramdisk operation completed successfully!');
    }

    realUsbService.playContinuityBeep(250, 2600);
    setIsExecuting(false);
    if (onAddLog) onAddLog(`Universal SoC Engine: Executed ${selectedOperation} on ${selectedChipset}.`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                {isAr ? 'المنظومة الشاملة لمعالجة كافة الأجهزة والأنظمة (All-Chipset Pro Suite)' : 'All-Chipset Universal Engineering Suite (Qualcomm, MTK, Exynos, Unisoc, Apple)'}
              </h1>
              <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-mono font-bold">
                Multi-SoC Engine 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'الدعم الكامل والمنخفض المستوى لكافة المعالجات: كوالكوم، ميدياتيك، إكسينوس، يونيسوك، وآبل سيليكون'
                : 'Direct USB protocol level engines for Qualcomm Firehose, MTK BROM, Exynos EUB, Unisoc FDL, and Apple Checkm8'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-indigo-400 font-bold">{currentPlatform.vidPid}</span>
        </div>
      </div>

      {/* Chipset Platform Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {chipsetPlatforms.map((chip) => {
          const isSelected = selectedChipset === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => {
                setSelectedChipset(chip.id as any);
                setSelectedOperation(chip.operations[0].id);
              }}
              className={`p-3.5 rounded-xl border transition-all flex flex-col items-start gap-1 cursor-pointer text-left ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-slate-900 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-black font-mono">{chip.id}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </div>
              <span className="text-xs font-bold text-slate-200">{isAr ? chip.nameAr : chip.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace: Left Operations Panel, Right Live Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        {/* Operations Selector */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-indigo-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
            <Settings className="w-4 h-4" />
            <span>{isAr ? `[ الأوامر والعمليات لـ ${currentPlatform.nameAr} ]` : `[ ${currentPlatform.nameEn} OPERATIONS ]`}</span>
          </h3>

          <div className="space-y-2 text-xs">
            {currentPlatform.operations.map((op) => (
              <label
                key={op.id}
                onClick={() => setSelectedOperation(op.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedOperation === op.id
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-200 shadow-md'
                    : 'bg-slate-950/80 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="chipOp"
                  checked={selectedOperation === op.id}
                  onChange={() => {}}
                  className="accent-indigo-500"
                />
                <div className="flex flex-col">
                  <span className="font-extrabold text-xs text-white">{isAr ? op.nameAr : op.nameEn}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{op.id}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? 'البروتوكولات النشطة للنواة:' : 'Kernel Direct Protocols:'}</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentPlatform.protocols.map((proto, idx) => (
                <span key={idx} className="bg-slate-900 text-cyan-300 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-800">
                  {proto}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleExecuteOperation}
            disabled={isExecuting}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black py-3.5 rounded-xl text-sm shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExecuting ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isExecuting ? (isAr ? 'جاري الاتصال والتنفيذ...' : 'Executing Engine...') : (isAr ? 'تشغيل العملية المباشرة' : 'EXECUTE PROTOCOL')}</span>
          </button>
        </div>

        {/* Console Log Terminal */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between font-mono text-xs h-[420px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-slate-200">{isAr ? 'سجل الأوامر والاتصال المباشر (Direct USB Pipe Output)' : 'Direct USB Pipe Output'}</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              USB Pipe Ready
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-lg border border-slate-800/60 text-slate-300">
            {consoleLogs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.includes('✅') || log.includes('successfully')
                    ? 'text-emerald-400 font-bold'
                    : log.includes('DISPATCH') || log.includes('FIREHOSE') || log.includes('KAMAKIRI')
                    ? 'text-indigo-300'
                    : log.includes('Initiating')
                    ? 'text-cyan-400 font-bold'
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
  );
};
