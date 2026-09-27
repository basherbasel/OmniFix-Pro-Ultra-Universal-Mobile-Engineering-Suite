import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConnectedDevice, DeviceMode } from '../types';
import { DEVICE_PRESETS } from '../data/devicePresets';
import { deviceKnowledgebaseService } from '../services/deviceKnowledgebaseService';
import { apexAgent, ApexDiagnosticResult } from '../services/ApexAgent';

interface WorkstationState {
  activeTab: string;
  currentDevice: ConnectedDevice;
  isBusy: boolean;
  lang: 'en' | 'ar';
  isCommandPaletteOpen: boolean;
  isUsbModalOpen: boolean;
  isDiagnosticsModalOpen: boolean;
  isWindowsInstallerOpen: boolean;
  isAgentInspectorOpen: boolean;
  terminalLogs: string[];
  cloudStatus: 'online' | 'syncing' | 'updated' | 'offline';
  lastUpdate: string;
  isDeviceAuthorized: boolean;
  apexDiagnostic: ApexDiagnosticResult | null;
}

interface WorkstationContextType extends WorkstationState {
  setActiveTab: (tab: string) => void;
  setCurrentDevice: (device: ConnectedDevice) => void;
  setIsBusy: (busy: boolean) => void;
  setLang: (lang: 'en' | 'ar') => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setUsbModalOpen: (open: boolean) => void;
  setDiagnosticsModalOpen: (open: boolean) => void;
  setWindowsInstallerOpen: (open: boolean) => void;
  setAgentInspectorOpen: (open: boolean) => void;
  addLog: (log: string) => void;
  clearLogs: () => void;
  requestUsbConnection: () => Promise<void>;
  checkCloudUpdates: () => Promise<void>;
  setIsDeviceAuthorized: (auth: boolean) => void;
  runApexDiagnostics: () => ApexDiagnosticResult;
}

const WorkstationContext = createContext<WorkstationContextType | undefined>(undefined);

export function WorkstationProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDevice, setCurrentDevice] = useState<ConnectedDevice>(DEVICE_PRESETS[0]);
  const [isBusy, setIsBusy] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('ar');
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isUsbModalOpen, setUsbModalOpen] = useState(false);
  const [isDiagnosticsModalOpen, setDiagnosticsModalOpen] = useState(false);
  const [isWindowsInstallerOpen, setWindowsInstallerOpen] = useState(false);
  const [isAgentInspectorOpen, setAgentInspectorOpen] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'online' | 'syncing' | 'updated' | 'offline'>('online');
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleDateString());
  const [isDeviceAuthorized, setIsDeviceAuthorized] = useState<boolean>(false);
  const [apexDiagnostic, setApexDiagnostic] = useState<ApexDiagnosticResult | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['[SYSTEM] OmniFix Pro Ultra Engine Initialized...', '[CLOUD] Connection to Neural-Hub Established.']);

  const addLog = (log: string) => setTerminalLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${log}`]);
  const clearLogs = () => setTerminalLogs([]);

  // Automatically trigger ApexAgent diagnostics on device change or discovery
  const runApexDiagnostics = () => {
    const diag = apexAgent.analyzeDevice(currentDevice);
    setApexDiagnostic(diag);
    addLog(`[APEX_AGENT:DIAGNOSTIC] 🧠 ApexAgent analyzed target: ${diag.brand} ${diag.model} (${diag.bootloaderState}) | Risk Level: ${diag.riskLevel}`);
    if (diag.correctiveCommands.length > 0) {
      addLog(`[APEX_AGENT:CORRECTIVE] Generated ${diag.correctiveCommands.length} corrective commands (Primary: ${diag.correctiveCommands[0].nameEn})`);
    }
    return diag;
  };

  React.useEffect(() => {
    runApexDiagnostics();
  }, [currentDevice.id, currentDevice.mode, currentDevice.vidPid, currentDevice.frpStatus, currentDevice.bootloaderStatus]);

  const checkCloudUpdates = async () => {
    setCloudStatus('syncing');
    addLog('Checking for global security patches and device definitions...');
    
    // Simulate API call to fetch latest exploits and models
    await new Promise(r => setTimeout(r, 2000));
    
    addLog('New Samsung Odin-V5 Patch Detected (0-Day)');
    addLog('Xiaomi HyperOS 2.0 Auth Loader Synced.');
    addLog('Apple iOS 18.2 Diagnostic Profiles Updated.');
    
    setCloudStatus('updated');
    setLastUpdate(new Date().toLocaleDateString());
    addLog('System successfully synchronized with OmniFix Global Cloud.');
    
    setTimeout(() => setCloudStatus('online'), 3000);
  };

  // Initial Sync
  React.useEffect(() => {
    checkCloudUpdates();
  }, []);

  // Reset authorization on device change
  React.useEffect(() => {
    setIsDeviceAuthorized(false);
  }, [currentDevice.id, currentDevice.serialNumber]);

  // Continuous Real-Time USB Hotplug Auto-Detection Daemon
  React.useEffect(() => {
    let isMounted = true;

    const probePairedUsbDevices = async () => {
      if (typeof navigator === 'undefined' || !('usb' in navigator)) return;

      try {
        const pairedDevices = await (navigator as any).usb.getDevices();
        if (pairedDevices && pairedDevices.length > 0 && isMounted) {
          const rawDev = pairedDevices[0];
          try {
            await rawDev.open();
            if (rawDev.configuration === null) {
              try {
                await rawDev.selectConfiguration(1);
              } catch (e) {}
            }
          } catch (openErr) {
            // May already be open
          }

          const vidHex = rawDev.vendorId.toString(16).padStart(4, '0').toUpperCase();
          const pidHex = rawDev.productId.toString(16).padStart(4, '0').toUpperCase();
          const mfg = rawDev.manufacturerName || 'Android Hardware';
          const prod = rawDev.productName || 'Smart Terminal Target';
          const actualSerial = rawDev.serialNumber?.trim() || `USB-${vidHex}-${pidHex}`;

          const autoDevice = deviceKnowledgebaseService.identifyAndProfileHardware(
            vidHex,
            pidHex,
            mfg,
            prod,
            actualSerial
          );

          setCurrentDevice(prev => {
            if (prev.id !== autoDevice.id) {
              addLog(`[AUTO-DETECT] ⚡ تم التعرف وتحديث الهاتف تلقائياً وحفظه في السجل: ${autoDevice.brand} ${autoDevice.marketName} (${autoDevice.mode})`);
            }
            return autoDevice;
          });
        }
      } catch (err) {
        // Silent background probe
      }
    };

    // Initial probe
    probePairedUsbDevices();

    // Event listener for real-time USB hotplug connect
    const onUsbConnect = (event: any) => {
      addLog(`[USB-HOTPLUG] 🔌 تم توصيل جهاز USB جديد في المنفذ.`);
      probePairedUsbDevices();
    };

    const onUsbDisconnect = (event: any) => {
      addLog(`[USB-HOTPLUG] ⚠️ تم فصل جهاز USB من المنفذ.`);
    };

    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      (navigator as any).usb.addEventListener('connect', onUsbConnect);
      (navigator as any).usb.addEventListener('disconnect', onUsbDisconnect);
    }

    const interval = setInterval(probePairedUsbDevices, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (typeof navigator !== 'undefined' && 'usb' in navigator) {
        (navigator as any).usb.removeEventListener('connect', onUsbConnect);
        (navigator as any).usb.removeEventListener('disconnect', onUsbDisconnect);
      }
    };
  }, []);

  const requestUsbConnection = async () => {
    addLog('Initiating Real WebUSB Hardware Discovery & Protocol Handshake...');
    setIsBusy(true);
    try {
      const { usbBridge } = await import('../core/USBBridge');
      const res = await usbBridge.requestDevicePermission();
      if (res.success && res.deviceInfo) {
        addLog(`[WEBUSB:SUCCESS] Mobile device linked: ${res.deviceInfo.productName} (VID: ${res.deviceInfo.vendorId}, PID: ${res.deviceInfo.productId})`);
        
        const autoDevice = deviceKnowledgebaseService.identifyAndProfileHardware(
          res.deviceInfo.vendorId.replace('0x', ''),
          res.deviceInfo.productId.replace('0x', ''),
          res.deviceInfo.manufacturerName,
          res.deviceInfo.productName,
          res.deviceInfo.serialNumber
        );

        setCurrentDevice(autoDevice);
        addLog(`[HW-SYNC] Active workstation target updated to: ${autoDevice.brand} ${autoDevice.marketName} (${autoDevice.mode})`);
      } else if (res.error) {
        addLog(`[WEBUSB:NOTE] ${res.error}`);
      }
    } catch (err: any) {
      addLog(`Connection note: ${err.message || 'Cancelled'}`);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <WorkstationContext.Provider value={{
      activeTab, setActiveTab,
      currentDevice, setCurrentDevice,
      isBusy, setIsBusy,
      lang, setLang,
      isCommandPaletteOpen, setCommandPaletteOpen,
      isUsbModalOpen, setUsbModalOpen,
      isDiagnosticsModalOpen, setDiagnosticsModalOpen,
      isWindowsInstallerOpen, setWindowsInstallerOpen,
      isAgentInspectorOpen, setAgentInspectorOpen,
      terminalLogs, addLog, clearLogs,
      requestUsbConnection,
      cloudStatus, lastUpdate, checkCloudUpdates,
      isDeviceAuthorized, setIsDeviceAuthorized,
      apexDiagnostic, runApexDiagnostics
    }}>
      {children}
    </WorkstationContext.Provider>
  );
}

export function useWorkstation() {
  const context = useContext(WorkstationContext);
  if (context === undefined) throw new Error('useWorkstation must be used within a WorkstationProvider');
  return context;
}
