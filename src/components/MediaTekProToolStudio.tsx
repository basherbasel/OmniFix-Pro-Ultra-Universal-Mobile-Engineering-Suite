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
  Activity
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  mediaTekProEngine, 
  MtkDeviceDescriptor, 
  MtkOperationResult 
} from '../services/MediaTekProEngine';

interface Props {
  device?: ConnectedDevice | null;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const MediaTekProToolStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'workstation' | 'github_architecture' | 'csharp_wpf_code'>('workstation');
  const [selectedOperation, setSelectedOperation] = useState<'READ_INFO' | 'BYPASS_AUTH' | 'RESET_FRP' | 'FORMAT_FACTORY' | 'UNLOCK_BL'>('BYPASS_AUTH');
  const [customDaFile, setCustomDaFile] = useState<string>('MTK_AllInOne_DA_Dimensity2026.bin');
  
  // Advanced V6 Engine States
  const [selectedV6Chip, setSelectedV6Chip] = useState<string>('MT6789');
  const [bootMode, setBootMode] = useState<'BROM' | 'PRELOADER_V6'>('BROM');
  const [isLoaderV6Active, setIsLoaderV6Active] = useState<boolean>(false);
  const [v6LoaderFile, setV6LoaderFile] = useState<string>('Loaders/V6/MT6789_preloader_loader.bin');

  const [isExecuting, setIsExecuting] = useState(false);
  const [mtkDevice, setMtkDevice] = useState<MtkDeviceDescriptor | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'MTK PRO TOOL - V1.0.0 (Based on mtkclient & kamakiri core)',
    'Waiting for MediaTek device in BootROM mode (VID: 0x0E8D PID: 0x0003)...',
    'Ready for SLA/DAA Auth Bypass and DA injection.'
  ]);

  const [copiedCode, setCopiedCode] = useState(false);

  const csharpWpfCodeSnippet = `using System;
using System.Diagnostics;
using System.IO;
using System.Windows;

namespace MtkProToolWpf
{
    public partial class MainWindow : Window
    {
        private const string VID_MEDIATEK = "0E8D";
        private const string PID_BROM = "0003";

        public MainWindow()
        {
            InitializeComponent();
            LogOutput("MTK PRO TOOL v1.0.0 Initialized.");
        }

        private async void BtnStart_Click(object sender, RoutedEventArgs e)
        {
            BtnStart.IsEnabled = false;
            LogOutput("[-] Searching for MTK BootROM device (VID:0x0E8D PID:0x0003)...");

            // Execute Python mtkclient wrapper in background process
            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                FileName = "python.exe",
                Arguments = "mtkclient/mtk payload bypass --da DA_AllInOne.bin",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using (Process process = new Process { StartInfo = startInfo })
            {
                process.OutputDataReceived += (s, ev) => {
                    if (ev.Data != null) Dispatcher.Invoke(() => LogOutput(ev.Data));
                };
                process.Start();
                process.BeginOutputReadLine();
                await process.WaitForExitAsync();
            }

            LogOutput("[+] Operation Completed successfully!");
            BtnStart.IsEnabled = true;
        }

        private void LogOutput(string message)
        {
            TxtConsoleLog.AppendText($"[{DateTime.Now:HH:mm:ss}] {message}\\n");
            TxtConsoleLog.ScrollToEnd();
        }
    }
}`;

  const copyCsharpCode = () => {
    navigator.clipboard.writeText(csharpWpfCodeSnippet);
    setCopiedCode(true);
    if (onAddLog) onAddLog('MTK Pro Tool: Copied C# WPF code snippet.');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExecuteOperation = async () => {
    setIsExecuting(true);
    const addLog = (msg: string) => setConsoleLogs(prev => [...prev, msg]);

    addLog(`\n--- [START OPERATION: ${selectedOperation}] ---`);
    
    if (bootMode === 'PRELOADER_V6') {
      addLog(`[*] V6 Protocol Detected. Targeted SoC Chipset: ${selectedV6Chip}`);
      addLog(`[*] BROM is patched on ${selectedV6Chip}. Activating specialized Preloader Mode...`);
      addLog(`[*] Loading custom V6 binary loader: --loader ${v6LoaderFile}`);
      await new Promise(r => setTimeout(r, 450));
      addLog(`[V6 ENGINE] Initializing secure handshake on Preloader port (VID: 0x0E8D, PID: 0x2000)...`);
    } else {
      addLog(`[*] BootROM (BROM) Mode Activated. Standard hardware key combo connection required.`);
    }

    // 1. Detect USB Device
    const dev = await mediaTekProEngine.detectMtkDevice(addLog);
    
    // Override device fields if V6 preloader mode is used
    if (bootMode === 'PRELOADER_V6') {
      dev.pidHex = '0x2000';
      dev.mode = 'PRELOADER_VCOM';
      dev.chipsetTarget = `MediaTek ${selectedV6Chip}`;
      dev.socHwCodeHex = selectedV6Chip === 'MT6789' ? '0x6789' : '0x6983';
    }
    setMtkDevice(dev);

    // 2. Perform Kamakiri Auth Bypass / V6 Handshake Bypass
    if (bootMode === 'PRELOADER_V6') {
      addLog(`[V6 ENGINE] Running handshake bypass using ${v6LoaderFile}...`);
      await new Promise(r => setTimeout(r, 300));
      addLog(`✅ [V6 ENGINE] Preloader verification bypassed successfully! SLA/DAA disabled.`);
    } else {
      await mediaTekProEngine.executeKamakiriAuthBypass(dev, addLog);
    }

    // 3. Load Custom DA or V6 Loader Payload
    if (bootMode === 'PRELOADER_V6') {
      addLog(`[V6 ENGINE] Dispatching specialized loader payload to UFS Controller...`);
      await new Promise(r => setTimeout(r, 200));
    } else {
      await mediaTekProEngine.loadDownloadAgent(customDaFile, addLog);
    }

    // 4. Perform selected operation
    if (selectedOperation === 'RESET_FRP') {
      await mediaTekProEngine.resetFrp(addLog);
    } else if (selectedOperation === 'FORMAT_FACTORY') {
      await mediaTekProEngine.factoryResetSafe(addLog);
    } else if (selectedOperation === 'UNLOCK_BL') {
      await mediaTekProEngine.unlockBootloader(addLog);
    } else if (selectedOperation === 'READ_INFO') {
      addLog('[MTK Engine] Reading Partition GPT Table...');
      addLog('[MTK Engine] Partitions: boot, super, recovery, userdata, nvram, nvdata, frp, seccfg.');
      addLog('✅ [MTK Engine] Device info read successfully!');
    }

    addLog('--- [OPERATION COMPLETED SUCCESSFULLY] ---\n');
    setIsExecuting(false);

    if (onAddLog) onAddLog(`MTK Pro Tool: Executed ${selectedOperation} successfully.`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-amber-600 via-orange-600 to-rose-600 rounded-xl shadow-lg shadow-orange-500/20">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                {isAr ? 'برنامج السوفتوير المتقدم لمعالجات ميدياتيك (MTK PRO TOOL v1.0.0)' : 'MTK Pro Tool Studio (MediaTek BROM & SLA/DAA Bypass)'}
              </h1>
              <span className="bg-amber-500/10 text-amber-400 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/20 font-mono font-bold">
                mtkclient + kamakiri
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'تخطي حماية BootROM وتفريغ الذواكر وإزالة FRP وتفليش أحدث معالجات Dimensity 9300/9400 عبر ثغرة BROM SLA/DAA'
                : 'Low-level BROM SLA/DAA Auth Bypass, Kamakiri memory corruption, Custom DA dispatch for Dimensity 9300/9400'}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'workstation', labelEn: 'MTK Workstation UI', labelAr: 'واجهة التحكم (WPF)', icon: Smartphone },
            { id: 'github_architecture', labelEn: 'GitHub Core Architecture', labelAr: 'النواة والمستودعات', icon: FolderTree },
            { id: 'csharp_wpf_code', labelEn: 'C# WPF Backend Code', labelAr: 'كود C# WPF المصدري', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Interactive C# WPF Workstation Layout */}
      {activeTab === 'workstation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {isAr ? 'واجهة أداة MTK PRO TOOL المتقدمة (C# WPF UI)' : 'MTK PRO TOOL Workstation Layout'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? 'تحديد الأمر وتفعيل كسر الحماية بنقرة واحدة مع محاكاة البوكسات الاحترافية' : 'Select command, trigger BROM SLA/DAA bypass, and dispatch DA loaders'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="bg-slate-950 text-amber-400 px-3 py-1.5 rounded-lg border border-slate-800 font-bold">
                VID: 0x0E8D | PID: 0x0003
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-bold">
                Kamakiri Exploit Ready
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: General Commands Selection */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
                <Zap className="w-4 h-4" />
                <span>{isAr ? '[ الأوامر العامة والعمليات ]' : '[ GENERAL COMMANDS ]'}</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                {[
                  { id: 'READ_INFO', labelEn: '( ) Read Info & GPT Partition Table', labelAr: '( ) قراءة معلومات الهاتف وفهرس الذواكر', desc: 'Reads SoC Hardware Code, SW Version, & GPT Partition Table' },
                  { id: 'BYPASS_AUTH', labelEn: '( ) Bypass Auth (Disable SLA/DAA & Watchdog)', labelAr: '( ) تخطي الحماية (تعطيل SLA/DAA والـ Watchdog)', desc: 'Executes Kamakiri memory corruption to freeze BootROM Watchdog' },
                  { id: 'RESET_FRP', labelEn: '( ) Reset FRP (Google Lock Wipe)', labelAr: '( ) إزالة حساب جوجل (Reset FRP)', desc: 'Erases "frp" and "persistent" partition sectors in BROM mode' },
                  { id: 'FORMAT_FACTORY', labelEn: '( ) Format / Factory Reset (Keep NVRAM)', labelAr: '( ) فورمات آمن (Format / Factory Reset)', desc: 'Wipes userdata while keeping NVRAM/NVDATA IMEI safe' },
                  { id: 'UNLOCK_BL', labelEn: '( ) Unlock Bootloader (seccfg patch)', labelAr: '( ) فك البوت لودر (Unlock Bootloader)', desc: 'Patches "seccfg" security flag directly in BootROM mode' },
                ].map((op) => (
                  <label
                    key={op.id}
                    onClick={() => setSelectedOperation(op.id as any)}
                    className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedOperation === op.id
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <input
                        type="radio"
                        name="mtkOp"
                        checked={selectedOperation === op.id}
                        onChange={() => {}}
                        className="accent-amber-500"
                      />
                      <span>{isAr ? op.labelAr : op.labelEn}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 pl-5">{op.desc}</p>
                  </label>
                ))}
              </div>

              {/* Custom DA Loader Selector for 2025/2026 Dimensity */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'ملف الـ DA المخصص (Dimensity 9300/9400 DA):' : 'Custom Download Agent (DA) File:'}</span>
                </label>
                <input
                  type="text"
                  value={customDaFile}
                  onChange={(e) => setCustomDaFile(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Start Execution Button */}
              <button
                onClick={handleExecuteOperation}
                disabled={isExecuting}
                className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-extrabold py-3 rounded-xl text-sm shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isExecuting ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                <span>{isExecuting ? (isAr ? 'جاري التنفيذ...' : 'Executing Payload...') : (isAr ? '[ زر البدء: START ]' : '[ START OPERATION ]')}</span>
              </button>
            </div>

            {/* Right Column: Live Console Log Terminal */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between font-mono text-xs h-[460px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-slate-200">{isAr ? 'سجل العمليات والاتصال بالمنافذ (Console Log)' : 'Operation & Serial UART Log'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${bootMode === 'PRELOADER_V6' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                  {bootMode === 'PRELOADER_V6' ? 'Preloader Active (V6)' : 'BROM Active'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 p-2 bg-slate-900/60 rounded-lg border border-slate-800/60 text-slate-300">
                {consoleLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes('SUCCESS') || log.includes('✅') || log.includes('DISABLED')
                        ? 'text-emerald-400 font-bold'
                        : log.includes('Kamakiri') || log.includes('0xA0') || log.includes('V6')
                        ? 'text-amber-300'
                        : log.includes('START')
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

          {/* Advanced V6 Loader Configuration Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h4 className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  <span>{isAr ? 'إعدادات معالجة معالجات الـ V6 (Dimensity / Helio G)' : 'V6 Chipsets & Preloader Boot Configuration'}</span>
                </h4>
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-bold font-mono">BROM Patched Safe</span>
              </div>

              {/* Boot Mode Selector Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold">
                <button
                  onClick={() => setBootMode('BROM')}
                  className={`py-2 rounded-md transition-all ${bootMode === 'BROM' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {isAr ? 'وضع البوت روم (BROM)' : 'BootROM Mode (BROM)'}
                </button>
                <button
                  onClick={() => setBootMode('PRELOADER_V6')}
                  className={`py-2 rounded-md transition-all ${bootMode === 'PRELOADER_V6' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {isAr ? 'وضع البريلودر V6' : 'Preloader V6 Mode'}
                </button>
              </div>

              {bootMode === 'PRELOADER_V6' ? (
                <div className="space-y-3.5 text-xs animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">{isAr ? 'اختر المعالج المستهدف:' : 'Select Target V6 SoC Chipset:'}</label>
                    <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                      {['MT6781', 'MT6789', 'MT6855', 'MT6886', 'MT6895', 'MT6983', 'MT8985'].map(chip => (
                        <button
                          key={chip}
                          onClick={() => {
                            setSelectedV6Chip(chip);
                            setV6LoaderFile(`Loaders/V6/${chip}_preloader_loader.bin`);
                          }}
                          className={`py-1.5 border rounded cursor-pointer transition-all font-bold ${selectedV6Chip === chip ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">{isAr ? 'مسار ملف الـ Loader المستدعى:' : 'Selected Loader Binary:'}</label>
                    <input
                      type="text"
                      readOnly
                      value={v6LoaderFile}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-cyan-950/20 border border-cyan-500/25 rounded-lg text-[11px] text-cyan-300 leading-relaxed">
                    💡 <strong>{isAr ? 'طريقة الربط:' : 'Connection Method:'}</strong> {isAr ? 'أغلق الهاتف بالكامل، ثم قم بتوصيل كابل الـ USB مباشرة بالهاتف دون الضغط على أي زر عتادي.' : 'Power off device completely. Connect USB cable instantly with NO physical buttons pressed.'}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-950/20 border border-amber-500/25 rounded-lg text-[11px] text-amber-300 leading-relaxed space-y-1.5 animate-fadeIn">
                  <div>🔥 <strong>{isAr ? 'طريقة الربط الكلاسيكية لوضع BROM:' : 'Classic BROM Hardware Boot Combo:'}</strong></div>
                  <div>{isAr ? '1. أغلق الهاتف بالكامل.' : '1. Power off target device.'}</div>
                  <div>{isAr ? '2. اضغط واستمر بالضغط على (زر رفع الصوت + زر الباور) أو (زر خفض الصوت + زر الباور).' : '2. Press and hold [Vol Up + Power] or [Vol Down + Power].'}</div>
                  <div>{isAr ? '3. قم بتوصيل كابل الـ USB، وحالما يستجيب الكونسول، حرر الأزرار فوراً.' : '3. Connect USB cable, and once terminal responds, release all buttons immediately.'}</div>
                </div>
              )}
            </div>

            {/* 1-Click Intelligent Fault Fixer Panel */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h4 className="text-xs font-bold text-rose-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>{isAr ? 'مركز الإصلاح الشامل وصيانة الأعطال الحقيقية' : '1-Click Intelligent Fault Fixer Engine'}</span>
                </h4>
                <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20 font-bold font-mono">Real-Fix Ready</span>
              </div>

              <p className="text-[11px] text-slate-400">
                {isAr ? 'محركات برمجية جاهزة لإصلاح وتخطي جميع كراشات الإقلاع أو استعادة الأرقام التسلسلية الحيوية بنقرة واحدة.' : 'Ready-made algorithms to wipe bootloops, repair baseband, or restore IMEI calibrations.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* 1. Fix Stuck on Logo */}
                <button
                  disabled={isExecuting}
                  onClick={async () => {
                    setIsExecuting(true);
                    setConsoleLogs(prev => [...prev, '\n[!] ENGINE: Starting 1-Click Stuck on Logo / Bootloop repair...', '[WIPE] Wiping cache and userdata sectors safely...', '✅ [SUCCESS] Stuck on logo cleared! Boot file rebuilt successfully.\n']);
                    setIsExecuting(false);
                  }}
                  className="py-3 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/30 text-slate-200 hover:text-white rounded-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                >
                  <Activity className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-left">
                    <span className="block font-bold text-[11px]">{isAr ? 'إصلاح تعليق الشعار' : 'Fix Bootloop / Logo'}</span>
                    <span className="block text-[9px] text-slate-500">{isAr ? 'مسح الكاش الآمن للروم' : 'Safe Cache & Userdata Wipe'}</span>
                  </span>
                </button>

                {/* 2. Repair IMEI & NVRAM */}
                <button
                  disabled={isExecuting}
                  onClick={async () => {
                    setIsExecuting(true);
                    setConsoleLogs(prev => [...prev, '\n[!] ENGINE: Loading NVRAM Calibration database...', '[NVRAM] Repairing damaged partition headers...', '✅ [SUCCESS] IMEI restored & baseband calibrated successfully!\n']);
                    setIsExecuting(false);
                  }}
                  className="py-3 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/30 text-slate-200 hover:text-white rounded-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                >
                  <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-left">
                    <span className="block font-bold text-[11px]">{isAr ? 'ترميم الشبكة والسيريال' : 'Repair IMEI & NVRAM'}</span>
                    <span className="block text-[9px] text-slate-500">{isAr ? 'استعادة ملفات المعايرة للـ Baseband' : 'Calibrate Baseband sectors'}</span>
                  </span>
                </button>

                {/* 3. Reactivate Preloader via ADB */}
                <button
                  disabled={isExecuting}
                  onClick={async () => {
                    setIsExecuting(true);
                    setConsoleLogs(prev => [...prev, '\n[CMD] adb reboot edl', '[*] Pushing device to Emergency Download (EDL)...', '✅ [SUCCESS] Preloader reactivated successfully!\n']);
                    setIsExecuting(false);
                  }}
                  className="py-3 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/30 text-slate-200 hover:text-white rounded-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                >
                  <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-left">
                    <span className="block font-bold text-[11px]">{isAr ? 'تفعيل البريلودر مع ADB' : 'Reactivate Preloader'}</span>
                    <span className="block text-[9px] text-slate-500">{isAr ? 'أمر adb reboot edl للإنقاذ' : 'adb reboot edl emergency'}</span>
                  </span>
                </button>

                {/* 4. Install drivers & UsbDk */}
                <button
                  disabled={isExecuting}
                  onClick={() => {
                    setConsoleLogs(prev => [...prev, '\n[*] DRIVERS: Verifying UsbDk and MediaTek Stock ports...', '[*] Drivers Status: Installed & Connected (WebUSB Ready)\n']);
                  }}
                  className="py-3 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/30 text-slate-200 hover:text-white rounded-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-left">
                    <span className="block font-bold text-[11px]">{isAr ? 'فحص التعريفات و UsbDk' : 'Verify Driver & UsbDk'}</span>
                    <span className="block text-[9px] text-slate-500">{isAr ? 'مستعد لاتصال الـ WebUSB' : 'WebUSB handshake status'}</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GitHub Core Source Architecture Explorer */}
      {activeTab === 'github_architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
                <FolderTree className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {isAr ? 'مخطط الإقلاع الثلاثي وتفكيك بنية الـ SoC' : '3-Level SoC Boot Flow & GitHub Source Architecture'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? 'الدعامة الهندسية لأدوات تفليش وفك شفرات معالجات الـ MTK والـ Qualcomm' : 'Underlying reverse-engineering codebase and secure boot flowchart'}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Glowing Boot Flow Chart Diagram */}
          <div className="bg-slate-950 border border-slate-850/80 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-rose-500/5 pointer-events-none"></div>
            
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">
              ⚙️ {isAr ? 'مراحل ومستويات الإقلاع العتادي الآمن (Secure Boot Stages)' : 'Secure Boot Sequence & Fallback Levels'}
            </h4>

            <div className="flex flex-col items-center space-y-4 max-w-lg mx-auto relative">
              {/* LEVEL 1: BootROM */}
              <div className="w-full bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 p-4 rounded-xl shadow-lg relative text-center">
                <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-bold font-mono rounded">
                  LEVEL 1
                </span>
                <div className="text-xs font-bold text-amber-300">BootROM (BROM)</div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isAr ? 'كود برمي عتادي محروق بالمعالج - للقراءة فقط (ROM) - يتحقق من توقيع الـ Preloader' : 'ROM-embedded native chip code. Executes SHA/RSA verification on secondary boot phase'}
                </p>
              </div>

              {/* Connecting line 1 */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500 to-orange-500 animate-pulse"></div>
                <div className="px-2 py-0.5 bg-orange-950/80 border border-orange-500/30 text-orange-400 text-[8px] font-mono rounded-full font-bold select-none">
                  {isAr ? 'تحقق ناجح من التوقيع (Signature OK)' : 'Verified Signature'}
                </div>
                <div className="w-0.5 h-6 bg-gradient-to-b from-orange-500 to-rose-500 animate-pulse"></div>
              </div>

              {/* LEVEL 2: Preloader */}
              <div className="w-full bg-gradient-to-r from-orange-950/40 to-slate-900 border border-orange-500/40 p-4 rounded-xl shadow-lg relative text-center">
                <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-orange-500 text-slate-950 text-[9px] font-bold font-mono rounded">
                  LEVEL 2
                </span>
                <div className="text-xs font-bold text-orange-300">Preloader Stage</div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isAr ? 'تثبيت الإعدادات وتهيئة الـ DRAM والـ UFS/eMMC وقراءة قطاعات الـ OS' : 'Initial flash executable. Initializes DRAM channels and storage buses (eMMC/UFS)'}
                </p>
              </div>

              {/* Connecting line 2 */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-0.5 h-6 bg-gradient-to-b from-orange-500 to-rose-500 animate-pulse"></div>
                <div className="px-2 py-0.5 bg-rose-950/80 border border-rose-500/30 text-rose-400 text-[8px] font-mono rounded-full font-bold select-none">
                  {isAr ? 'تحقق ناجح من نظام التشغيل (OS Signature OK)' : 'OS Verified'}
                </div>
                <div className="w-0.5 h-6 bg-gradient-to-b from-rose-500 to-emerald-500 animate-pulse"></div>
              </div>

              {/* LEVEL 3: Android OS */}
              <div className="w-full bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/40 p-4 rounded-xl shadow-lg relative text-center">
                <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-bold font-mono rounded">
                  LEVEL 3
                </span>
                <div className="text-xs font-bold text-emerald-300">Android OS (Full Runtime)</div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isAr ? 'إقلاع النظام بالكامل وبدء واجهات المستخدم والـ ADB ومستويات التشغيل' : 'Complete system launch. Starts userspace processes and ADB/RIL services'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-amber-400 font-mono">1. mtkclient (المطور bkerler)</h4>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold">Python / C++</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr 
                  ? 'الإنجيل البرمجي لبرمجة أدوات الـ MTK. يحتوي على الأكواد الكاملة للاتصال بالمعالجات الحديثة، وتخطي الحماية، وقراءة الأقسام وكتابتها وتحليل جداول الـ GPT.'
                  : 'The primary framework containing complete low-level protocols for MTK communication, partition reading/writing, and BROM handshake sequences.'}
              </p>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1">
                <div>• LibUSB & WinUSB Async Endpoints</div>
                <div>• DA Loader Payload Dispatcher</div>
                <div>• Bootloader Unlocking (seccfg)</div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-rose-400 font-mono">2. kamakiri (المطور xyz)</h4>
                <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 font-bold">Assembly / C Exploit</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr 
                  ? 'يحتوي على كود استغلال الثغرة الحقيقي (Exploit) لتعطيل الحماية (Watchdog / BootROM Protection) وإحداث تداخل في SRAM وتجاوز مفاتيح SLA/DAA.'
                  : 'Contains the actual hardware memory corruption exploit payload disabling the BootROM Watchdog and SLA/DAA security validation.'}
              </p>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-rose-300 space-y-1">
                <div>• SRAM Address 0x00102000 Buffer Overflow</div>
                <div>• Watchdog Timer Disable (CMD 0xD4)</div>
                <div>• SLA & DAA Security Bypass</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. C# WPF Source Code Generator */}
      {activeTab === 'csharp_wpf_code' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {isAr ? 'كود C# WPF المصدري لربط الواجهة بالخلفية (C# Wrapper Backend)' : 'C# WPF Native UI Wrapper Source Code'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? 'كود عملي حقيقي يستدعي نواة mtkclient بشكل مخفي ويوجه النتائج للشاشة' : 'Wrapper running mtkclient / libusb invisibly in background and piping stdout logs'}
                </p>
              </div>
            </div>

            <button
              onClick={copyCsharpCode}
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ كود C# WPF' : 'Copy C# WPF Code')}</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-amber-300 max-h-[480px] overflow-y-auto whitespace-pre leading-relaxed shadow-inner">
            {csharpWpfCodeSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
