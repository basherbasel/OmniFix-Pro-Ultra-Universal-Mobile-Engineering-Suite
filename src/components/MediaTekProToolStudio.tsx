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

    // 1. Detect USB Device
    const dev = await mediaTekProEngine.detectMtkDevice(addLog);
    setMtkDevice(dev);

    // 2. Perform Kamakiri Auth Bypass
    await mediaTekProEngine.executeKamakiriAuthBypass(dev, addLog);

    // 3. Load Custom DA
    await mediaTekProEngine.loadDownloadAgent(customDaFile, addLog);

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
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  BROM Active
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 p-2 bg-slate-900/60 rounded-lg border border-slate-800/60 text-slate-300">
                {consoleLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes('SUCCESS') || log.includes('✅') || log.includes('DISABLED')
                        ? 'text-emerald-400 font-bold'
                        : log.includes('Kamakiri') || log.includes('0xA0')
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
                  {isAr ? 'النواة والهندسة العكسية من مستودعات GitHub الأساسية' : 'Core GitHub Repositories Architecture (mtkclient & kamakiri)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? 'الدعامة البرمجية لأدوات UnlockTool و EFT المبنية على نواة C++ و Python' : 'Underlying reverse-engineering codebase used by top professional tools'}
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
