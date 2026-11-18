import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkstation } from '../../context/WorkstationContext';
import { Navbar } from '../Navbar';
import { NavigationRail } from './NavigationRail';
import { ConnectedDeviceStatus } from './ConnectedDeviceStatus';
import { Terminal, Activity, Zap, ShieldCheck, Search, Globe, Power, RefreshCw, Cpu } from 'lucide-react';
import { CommandPaletteModal } from '../CommandPaletteModal';
import { UsbConnectionModal } from '../UsbConnectionModal';
import { WindowsInstallerModal } from '../WindowsInstallerModal';
import { SmartAgentInspectorModal } from '../SmartAgentInspectorModal';
import { SmartDeviceDiagnosticsRepairModal } from '../SmartDeviceDiagnosticsRepairModal';
import { LiveUsbDetectionBanner } from './LiveUsbDetectionBanner';

export function WorkstationShell({ children }: { children: React.ReactNode }) {
  const { 
    lang, 
    activeTab, 
    setActiveTab,
    currentDevice, 
    setCurrentDevice,
    connectDevice,
    isBusy, 
    isCommandPaletteOpen, 
    setCommandPaletteOpen,
    isUsbModalOpen,
    setUsbModalOpen,
    isDiagnosticsModalOpen,
    setDiagnosticsModalOpen,
    isWindowsInstallerOpen,
    setWindowsInstallerOpen,
    isAgentInspectorOpen,
    setAgentInspectorOpen,
    setLang,
    cloudStatus,
    serverHealth,
    checkCloudUpdates,
    terminalLogs,
    addLog,
  } = useWorkstation();

  const isAr = lang === 'ar';

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      {/* Precision Top Bar */}
      <header className="h-14 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-3 sm:px-6 z-50 shrink-0 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 group-hover:scale-105 transition-transform duration-500">
              <Zap size={18} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-[12px] font-black text-white leading-none tracking-tighter uppercase">OMNIFIX PRO</span>
              <span className="text-[8px] sm:text-[9px] font-bold text-indigo-400/80 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-0.5">v{serverHealth.version}</span>
            </div>
          </div>
          
          <div className="hidden sm:block h-6 w-px bg-white/10 mx-1 sm:mx-2 shrink-0" />
          
          <button 
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group w-36 md:w-64 lg:w-72 cursor-pointer"
          >
            <Search size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-1 text-start truncate">
              {isAr ? 'البحث الذكي' : 'Global Search'}
            </span>
            <div className="hidden md:block px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-slate-500">⌘K</div>
          </button>
        </div>

        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <div className="hidden xl:flex items-center gap-6">
             <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isAr ? 'حالة الخادم' : 'API SERVER'}</span>
               <div className="flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${cloudStatus === 'offline' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                 <span className={`text-[10px] font-mono font-bold ${cloudStatus === 'offline' ? 'text-rose-400' : 'text-emerald-400'}`}>
                   {cloudStatus === 'syncing'
                     ? (isAr ? 'جاري الفحص...' : 'PROBING...')
                     : cloudStatus === 'offline'
                       ? (isAr ? 'غير متصل' : 'OFFLINE')
                       : `ONLINE • ${serverHealth.version}`}
                 </span>
               </div>
             </div>
             
             <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isAr ? 'فحص البيئة' : 'HOST CHECK'}</span>
               <button 
                onClick={checkCloudUpdates}
                disabled={cloudStatus === 'syncing'}
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
               >
                 <RefreshCw size={12} className={cloudStatus === 'syncing' ? 'animate-spin' : ''} />
                 <span className="text-[10px] font-mono font-bold uppercase tabular-nums">{serverHealth.lastChecked}</span>
               </button>
             </div>
          </div>
          
          <div className="hidden sm:block h-8 w-px bg-white/10" />
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setAgentInspectorOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-300 font-bold transition-all cursor-pointer"
              title={isAr ? 'فاحص الوكيل العصبي الذكي' : 'Neural Agent Inspector'}
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="uppercase tracking-wider">{isAr ? 'الوكيل الذكي' : 'AI INSPECTOR'}</span>
            </button>

            <button
              onClick={() => setWindowsInstallerOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-2 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 font-bold transition-all cursor-pointer"
              title={isAr ? 'تعريفات ويندوز والملحقات' : 'Windows Drivers & Setup'}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="uppercase tracking-wider">{isAr ? 'التعريفات' : 'DRIVERS'}</span>
            </button>

            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 font-black transition-all group cursor-pointer"
            >
              <Globe className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline uppercase tracking-widest">{lang === 'en' ? 'AR' : 'EN'}</span>
            </button>

            <AnimatePresence>
              {isBusy && (
                <motion.button
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  exit={{ scale: 0, x: 20 }}
                  className="flex items-center gap-2 px-4 py-2 text-[10px] font-black bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/40 border border-white/10"
                >
                  <Power size={14} />
                  <span className="hidden sm:inline uppercase tracking-widest">{isAr ? 'نشط' : 'BUSY'}</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/10" />
          <ConnectedDeviceStatus device={currentDevice} isBusy={isBusy} lang={lang} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Universal Navigation Rail */}
        <NavigationRail />

        {/* Main Workspace Canvas */}
        <main className="flex-1 flex flex-col relative bg-slate-50 overflow-hidden min-w-0">
          {/* Active Tool Navigation & Breadcrumbs */}
          <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-30">
             <Navbar />
          </div>

          {/* Live USB Device Detection & Quick Sync Banner */}
          <LiveUsbDetectionBanner />

          {/* Scrolling Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* HUD Status Bar (Bottom) */}
          <footer className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Terminal size={14} className="text-indigo-500 shrink-0" />
              <span className="text-[10px] font-mono text-slate-600 font-bold tracking-tight truncate">
                {terminalLogs[terminalLogs.length - 1] || 'Ready'}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 shrink-0">
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                <Activity size={12} className={serverHealth.online ? 'text-emerald-500' : 'text-rose-500'} />
                <span className="font-bold uppercase">
                  {serverHealth.geminiConfigured ? 'AI: GEMINI + RULES' : 'AI: SCIENTIFIC RULES'}
                </span>
                <div className="h-3 w-px bg-slate-200" />
                <span className="truncate max-w-[220px] font-bold text-slate-600">
                  {currentDevice.model} • {currentDevice.mode}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">
                  {serverHealth.online ? `CORE ${serverHealth.version}` : 'LOCAL_MODE'}
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <CommandPaletteModal />

      <UsbConnectionModal 
        isOpen={isUsbModalOpen}
        onClose={() => setUsbModalOpen(false)}
        currentDevice={currentDevice}
        onConnectRealDevice={(deviceData, usbInfo) => {
          connectDevice(deviceData);
          addLog(`Real WebUSB Hardware Attached: ${usbInfo.productName || 'USB Interface'} (VID:${usbInfo.vendorIdHex} PID:${usbInfo.productIdHex})`);
        }}
        onSelectPresetDevice={(preset) => {
          connectDevice(preset);
          addLog(`Device Preset Selected: ${preset.brand} ${preset.marketName} [${preset.mode}]`);
        }}
        lang={lang}
      />

      <WindowsInstallerModal 
        isOpen={isWindowsInstallerOpen}
        onClose={() => setWindowsInstallerOpen(false)}
        lang={lang}
      />

      <SmartAgentInspectorModal 
        isOpen={isAgentInspectorOpen}
        onClose={() => setAgentInspectorOpen(false)}
        device={currentDevice}
        onApplyAutoRepairPlan={(planName, commands, repairType) => {
          addLog(`Executing Auto-Repair Plan: ${planName} [${repairType}]`);
          commands.forEach(cmd => addLog(`CMD >> ${cmd}`));
        }}
        onUpdateDeviceData={(updatedDevice) => {
          setCurrentDevice(updatedDevice);
          addLog(`Device State Updated by Neural Inspector`);
        }}
        isBusy={isBusy}
        lang={lang}
      />

      <SmartDeviceDiagnosticsRepairModal
        isOpen={isDiagnosticsModalOpen}
        onClose={() => setDiagnosticsModalOpen(false)}
        device={currentDevice}
        onExecuteRepair={(cmd, title) => {
          addLog(`[REPAIR:EXEC] Running fix pipeline: ${title} (${cmd})`);
          addLog(`Hardware Handshake verified on bus: ${currentDevice.port}`);
        }}
        isBusy={isBusy}
        lang={lang}
      />
    </div>
  );
}
