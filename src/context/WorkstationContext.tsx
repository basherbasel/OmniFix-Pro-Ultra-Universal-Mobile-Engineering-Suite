import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConnectedDevice, DeviceMode } from '../types';
import { DEVICE_PRESETS } from '../data/devicePresets';
import { deviceKnowledgebaseService } from '../services/deviceKnowledgebaseService';

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
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['[SYSTEM] OmniFix Pro Ultra Engine Initialized...', '[CLOUD] Connection to Neural-Hub Established.']);

  const addLog = (log: string) => setTerminalLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${log}`]);
  const clearLogs = () => setTerminalLogs([]);

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
    addLog('Initiating Real WebUSB Hardware Discovery...');
    setIsBusy(true);
    try {
      if (typeof navigator !== 'undefined' && 'usb' in navigator) {
        const res = await (navigator as any).usb.requestDevice({ filters: [] });
        if (res) {
          addLog(`[WEBUSB:SUCCESS] Device linked: ${res.productName || 'USB Target'} (VID: 0x${res.vendorId.toString(16)})`);
        }
      } else {
        addLog('WebUSB API not supported in this browser. Please use Chrome/Edge.');
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
      isDeviceAuthorized, setIsDeviceAuthorized
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
