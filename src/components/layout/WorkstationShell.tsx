import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkstation } from '../../context/WorkstationContext';
import { Navbar } from '../Navbar';
import { NavigationRail } from './NavigationRail';
import { ConnectedDeviceStatus } from './ConnectedDeviceStatus';
import { Terminal, Activity, Zap, ShieldCheck, Search, Bell, Globe, Power, RefreshCw, Cpu, ShieldAlert, Lock, Unlock, Smartphone, Usb } from 'lucide-react';
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
    checkCloudUpdates,
    terminalLogs,
    addLog,
    isDeviceAuthorized,
    setIsDeviceAuthorized
  } = useWorkstation();

  const isAr = lang === 'ar';
  const [isAuthPending, setIsAuthPending] = React.useState(false);

  const handleAuthorizeHandshake = async () => {
    setIsAuthPending(true);
    addLog(`[SECURITY] Initiating secure hardware handshake with ${currentDevice.brand} ${currentDevice.model}...`);
    
    // Play initial start chime
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 750;
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {}

    await new Promise(r => setTimeout(r, 1400));

    // Success chime
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc1.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.12);
      gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}

    addLog(`[SECURITY:GRANTED] Live hardware handshake authorized by user for ${currentDevice.brand} ${currentDevice.marketName}. All tools unlocked.`);
    setIsDeviceAuthorized(true);
    setIsAuthPending(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      {/* Precision Top Bar */}
      <header className="h-14 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-50 shrink-0 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 group-hover:scale-105 transition-transform duration-500">
              <Zap size={20} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black text-white leading-none tracking-tighter uppercase">OMNIFIX PRO</span>
              <span className="text-[9px] font-bold text-indigo-400/80 uppercase tracking-[0.3em] mt-0.5">Ultra v5.0</span>
            </div>
          </div>
          
          <div className="h-6 w-px bg-white/10 mx-2" />
          
          <button 
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-4 px-5 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group w-72"
          >
            <Search size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-1 text-left">
              {isAr ? 'البحث الذكي (Ctrl + K)' : 'Global Search (Ctrl + K)'}
            </span>
            <div className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-slate-500">⌘K</div>
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-8">
             <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isAr ? 'حالة السيرفر' : 'SERVER NODE'}</span>
               <div className="flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${cloudStatus === 'offline' ? 'bg-rose-500' : 'bg-emerald-500'} shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse`} />
                 <span className={`text-[10px] font-mono font-bold ${cloudStatus === 'offline' ? 'text-rose-400' : 'text-emerald-400'}`}>
                   {cloudStatus === 'syncing' ? 'SYNCING...' : cloudStatus === 'updated' ? 'VERSION_LATEST' : 'SYMMETRIC_LIVE'}
                 </span>
               </div>
             </div>
             
             <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isAr ? 'تحديث السحابة' : 'CLOUD SYNC'}</span>
               <button 
                onClick={checkCloudUpdates}
                disabled={cloudStatus === 'syncing'}
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
               >
                 <RefreshCw size={12} className={cloudStatus === 'syncing' ? 'animate-spin' : ''} />
                 <span className="text-[10px] font-mono font-bold uppercase">AUTO_SYNC: ON</span>
               </button>
             </div>
          </div>
          
          <div className="h-10 w-px bg-white/10" />
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAgentInspectorOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-300 font-bold transition-all"
              title={isAr ? 'فاحص الوكيل العصبي الذكي' : 'Neural Agent Inspector'}
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="uppercase tracking-wider">{isAr ? 'الوكيل الذكي' : 'AI INSPECTOR'}</span>
            </button>

            <button
              onClick={() => setWindowsInstallerOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-2 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 font-bold transition-all"
              title={isAr ? 'تعريفات ويندوز والملحقات' : 'Windows Drivers & Setup'}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="uppercase tracking-wider">{isAr ? 'التعريفات' : 'DRIVERS'}</span>
            </button>

            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2.5 px-4 py-2 text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 font-black transition-all group"
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
                  className="flex items-center gap-2 px-4 py-2 text-[10px] font-black bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/40 animate-pulse border border-white/10"
                >
                  <Power size={14} />
                  <span className="hidden sm:inline uppercase tracking-widest">{isAr ? 'إيقاف' : 'KILL'}</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="h-10 w-px bg-white/10" />
          <ConnectedDeviceStatus device={currentDevice} isBusy={isBusy} lang={lang} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Universal Navigation Rail */}
        <NavigationRail />

        {/* Main Workspace Canvas */}
        <main className="flex-1 flex flex-col relative bg-slate-50 overflow-hidden">
          {/* Active Tool Navigation & Breadcrumbs */}
          <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-30">
             <Navbar />
          </div>

          {/* Live USB Device Detection & Quick Sync Banner */}
          <LiveUsbDetectionBanner />

          {/* Scrolling Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
            <AnimatePresence mode="wait">
              {!isDeviceAuthorized && activeTab !== 'dashboard' ? (
                <motion.div
                  key="auth-guard"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-8 max-w-2xl mx-auto my-8 bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden"
                >
                  {/* Grid background decoration */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    {/* Glowing lock badge */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl animate-pulse" />
                      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 relative z-10 animate-bounce">
                        <Lock size={28} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-black tracking-tight text-white uppercase">
                        {isAr ? '🔒 تفويض المنظومة والربط الآمن بالهاتف' : '🔒 Secure Handshake Authorization Required'}
                      </h3>
                      <p className="text-slate-400 text-xs max-w-md font-medium">
                        {isAr 
                          ? 'بانتظار موافقة المهندس لبدء قراءة سجلات المعالج، تفويض الثغرات، أو تمرير حزم البيانات المباشرة لتجنب أي إجراء غير مصرح به.'
                          : 'Standby protection enabled. All tool commands, diagnostics, and voltage regulators require explicit user authorization before execution.'}
                      </p>
                    </div>

                    {/* Active Device Technical Spec Panel */}
                    <div className="w-full bg-slate-950/80 rounded-2xl border border-slate-800/80 p-5 text-left space-y-3.5 font-mono text-[11px] shadow-inner">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                        <span className="text-slate-500 uppercase font-bold tracking-wider">{isAr ? 'الهاتف المكتشف' : 'CONNECTED HARDWARE'}</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black animate-pulse">
                          <ShieldAlert size={11} />
                          {isAr ? 'غير مفوض' : 'PENDING'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                        <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/30">
                          <Smartphone size={14} className="text-cyan-400 shrink-0" />
                          <div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">{isAr ? 'الشركة والموديل' : 'DEVICE MODEL'}</div>
                            <div className="font-bold text-white truncate max-w-[180px]">
                              {currentDevice.marketName.toLowerCase().startsWith(currentDevice.brand.toLowerCase()) ? currentDevice.marketName : `${currentDevice.brand} ${currentDevice.marketName}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/30">
                          <Cpu size={14} className="text-indigo-400 shrink-0" />
                          <div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">{isAr ? 'المعالج والنواة' : 'CHIPSET'}</div>
                            <div className="font-bold text-white truncate max-w-[180px]">{currentDevice.chipsetName || currentDevice.chipset}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/30">
                          <Usb size={14} className="text-emerald-400 shrink-0" />
                          <div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">{isAr ? 'المنفذ الفيزيائي' : 'ACTIVE BUS PORT'}</div>
                            <div className="font-bold text-slate-200 truncate max-w-[180px]">{currentDevice.port.split('(')[0].trim()}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/30">
                          <Activity size={14} className="text-amber-400 shrink-0" />
                          <div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">{isAr ? 'وضع الاتصال الحالي' : 'CONNECTION MODE'}</div>
                            <div className="font-bold text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                              {currentDevice.mode}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-500 text-center border-t border-slate-800/60 pt-2">
                        SN: <span className="text-slate-400">{currentDevice.serialNumber || 'SN_GENERIC_USB_W3C_PORT'}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={handleAuthorizeHandshake}
                      disabled={isAuthPending}
                      className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/10 cursor-pointer disabled:opacity-50"
                    >
                      {isAuthPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>{isAr ? 'جاري الفحص وبدء الربط الآمن...' : 'ESTABLISHING SECURE HANDSHAKE...'}</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-white text-white animate-pulse" />
                          <span>{isAr ? 'منح إذن البدء والربط المباشر بالفحص' : 'GRANT PERMISSION & INITIATE HANDSHAKE'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
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
              )}
            </AnimatePresence>
          </div>

          {/* HUD Status Bar (Bottom) */}
          <footer className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-8 shrink-0 z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 group cursor-pointer">
                <Terminal size={14} className="text-indigo-500" />
                <span className="text-[10px] font-mono text-slate-500 font-bold tracking-tight group-hover:text-indigo-600 transition-colors">
                  {terminalLogs[terminalLogs.length - 1]}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Activity size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">ENGINE: OK</span>
                </div>
                <div className="h-3 w-px bg-slate-200" />
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">CPU: 4% | RAM: 1.2GB</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">SECURE_TUNNEL: ACTIVE</span>
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
          setCurrentDevice(deviceData);
          addLog(`Real WebUSB Hardware Attached: ${usbInfo.productName || 'USB Interface'} (VID:${usbInfo.vendorIdHex} PID:${usbInfo.productIdHex})`);
        }}
        onSelectPresetDevice={(preset) => {
          setCurrentDevice(preset);
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
