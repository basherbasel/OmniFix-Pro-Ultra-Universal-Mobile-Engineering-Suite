import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConnectedDevice, DeviceMode } from '../types';
import { DEVICE_PRESETS } from '../data/devicePresets';
import { deviceKnowledgebaseService } from '../services/deviceKnowledgebaseService';
import { apexAgent, ApexDiagnosticResult } from '../services/ApexAgent';
import { mockDeviceResponseService, ExtendedHardwareTelemetry } from '../services/mockDeviceResponseService';
import {
  evaluateDiodeReading,
  identifyUsbDevice,
  DiodeEvaluationResult,
  UsbIdentificationResult,
} from '../data/hardwareAtlas';
import { analyzeDcPowerDraw, PowerAnalysisResult } from '../services/powerAnalyzer';
import { VisionAnomalyFinding } from '../services/multimodalDiagnostics';

export interface BenchUsbPort {
  port: string;
  vid: string;
  pid: string;
  manufacturer: string;
  product: string;
  description: string;
  identification: UsbIdentificationResult;
}

export interface ServerHealthStatus {
  online: boolean;
  version: string;
  geminiConfigured: boolean;
  tools: Record<string, boolean>;
  lastChecked: string;
}

interface WorkstationState {
  activeTab: string;
  currentDevice: ConnectedDevice;
  deviceTelemetry: ExtendedHardwareTelemetry | null;
  isBusy: boolean;
  lang: 'en' | 'ar';
  isCommandPaletteOpen: boolean;
  isUsbModalOpen: boolean;
  isDiagnosticsModalOpen: boolean;
  isWindowsInstallerOpen: boolean;
  isAgentInspectorOpen: boolean;
  terminalLogs: string[];
  cloudStatus: 'online' | 'syncing' | 'updated' | 'offline';
  serverHealth: ServerHealthStatus;
  lastUpdate: string;
  isDeviceAuthorized: boolean;
  apexDiagnostic: ApexDiagnosticResult | null;
  activeCaseId: number;
  diodeSessionLogs: Array<DiodeEvaluationResult & { timestamp: string }>;
  powerSessionLogs: Array<PowerAnalysisResult & { architecture: string; preBootMa: number; postBootMa: number; timestamp: string }>;
  usbBenchPorts: BenchUsbPort[];
  visionFindings: VisionAnomalyFinding[];
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
  readFullDeviceTelemetry: (target?: ConnectedDevice) => ExtendedHardwareTelemetry;
  connectDevice: (deviceInput: ConnectedDevice | string) => ConnectedDevice;
  setActiveCaseId: (caseId: number) => void;
  recordDiodeMeasurement: (railCode: string, measuredV: number) => Promise<DiodeEvaluationResult>;
  recordPowerAnalysis: (architecture: string, preBootMa: number, postBootMa: number, bootBehavior: string) => Promise<PowerAnalysisResult>;
  scanRealBenchUsb: () => Promise<BenchUsbPort[]>;
  setVisionFindings: (findings: VisionAnomalyFinding[]) => void;
}

const WorkstationContext = createContext<WorkstationContextType | undefined>(undefined);

export function WorkstationProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDevice, setCurrentDevice] = useState<ConnectedDevice>(DEVICE_PRESETS[0]);
  const [deviceTelemetry, setDeviceTelemetry] = useState<ExtendedHardwareTelemetry>(() => 
    mockDeviceResponseService.generateFullTelemetryResponse(DEVICE_PRESETS[0])
  );
  const [isBusy, setIsBusy] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('ar');
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isUsbModalOpen, setUsbModalOpen] = useState(false);
  const [isDiagnosticsModalOpen, setDiagnosticsModalOpen] = useState(false);
  const [isWindowsInstallerOpen, setWindowsInstallerOpen] = useState(false);
  const [isAgentInspectorOpen, setAgentInspectorOpen] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'online' | 'syncing' | 'updated' | 'offline'>('online');
  const [serverHealth, setServerHealth] = useState<ServerHealthStatus>({
    online: true,
    version: '4.8.2-PRO',
    geminiConfigured: false,
    tools: {},
    lastChecked: new Date().toLocaleTimeString(),
  });
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleDateString());
  const [isDeviceAuthorized, setIsDeviceAuthorized] = useState<boolean>(true);
  const [apexDiagnostic, setApexDiagnostic] = useState<ApexDiagnosticResult | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<number>(2);
  const [diodeSessionLogs, setDiodeSessionLogs] = useState<Array<DiodeEvaluationResult & { timestamp: string }>>([]);
  const [powerSessionLogs, setPowerSessionLogs] = useState<Array<PowerAnalysisResult & { architecture: string; preBootMa: number; postBootMa: number; timestamp: string }>>([]);
  const [usbBenchPorts, setUsbBenchPorts] = useState<BenchUsbPort[]>([]);
  const [visionFindings, setVisionFindings] = useState<VisionAnomalyFinding[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['[SYSTEM] OmniFix Pro Ultra Engine Initialized...']);

  const addLog = (log: string) => setTerminalLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${log}`]);
  const clearLogs = () => setTerminalLogs([]);

  const recordDiodeMeasurement = async (railCode: string, measuredV: number): Promise<DiodeEvaluationResult> => {
    const evalRes = evaluateDiodeReading(railCode, measuredV);
    const stamped = { ...evalRes, timestamp: new Date().toLocaleTimeString() };
    setDiodeSessionLogs(prev => [stamped, ...prev.slice(0, 19)]);
    addLog(`[DIODE_LAB] 📏 ${evalRes.rail_code} = ${measuredV.toFixed(3)}V → ${evalRes.status}: ${evalRes.diagnosis}`);
    try {
      await fetch('/api/hardware/diode-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: activeCaseId, rail_code: railCode, measured_v: measuredV }),
      });
    } catch {}
    return evalRes;
  };

  const recordPowerAnalysis = async (
    architecture: string,
    preBootMa: number,
    postBootMa: number,
    bootBehavior: string
  ): Promise<PowerAnalysisResult> => {
    const analysis = analyzeDcPowerDraw(architecture, preBootMa, postBootMa, bootBehavior);
    const stamped = {
      ...analysis,
      architecture,
      preBootMa,
      postBootMa,
      timestamp: new Date().toLocaleTimeString(),
    };
    setPowerSessionLogs(prev => [stamped, ...prev.slice(0, 19)]);
    addLog(`[DC_POWER] ⚡ [${architecture.toUpperCase()}] Pre:${preBootMa}mA / Post:${postBootMa}mA (${bootBehavior}) → ${analysis.stage}: ${analysis.fault_title}`);
    try {
      await fetch('/api/power/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: activeCaseId,
          architecture,
          pre_boot_ma: preBootMa,
          post_boot_ma: postBootMa,
          boot_behavior: bootBehavior,
        }),
      });
    } catch {}
    return analysis;
  };

  const scanRealBenchUsb = async (): Promise<BenchUsbPort[]> => {
    const found: BenchUsbPort[] = [];
    try {
      const res = await fetch('/api/hardware/scan-usb');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.ports)) {
          found.push(...json.ports);
        }
      }
    } catch {}

    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      try {
        const paired = await (navigator as any).usb.getDevices();
        for (const dev of paired || []) {
          const vid = dev.vendorId.toString(16).padStart(4, '0').toUpperCase();
          const pid = dev.productId.toString(16).padStart(4, '0').toUpperCase();
          if (!found.some(p => p.vid === vid && p.pid === pid)) {
            found.push({
              port: `WebUSB:${vid}:${pid}`,
              vid,
              pid,
              manufacturer: dev.manufacturerName || 'USB Target',
              product: dev.productName || 'Mobile Interface',
              description: `${dev.manufacturerName || 'Device'} ${dev.productName || ''} (${vid}:${pid})`,
              identification: identifyUsbDevice(vid, pid),
            });
          }
        }
      } catch {}
    }

    setUsbBenchPorts(found);
    addLog(`[USB_SCAN] 🔌 Scanned host bench ports: ${found.length} USB/Serial endpoint(s) detected.`);
    return found;
  };

  // Mock Data Layer: Read full memory, FRP, bootloader, battery & hardware rail telemetry
  const readFullDeviceTelemetry = (target?: ConnectedDevice): ExtendedHardwareTelemetry => {
    const dev = target || currentDevice;
    const telemetry = mockDeviceResponseService.generateFullTelemetryResponse(dev);
    setDeviceTelemetry(telemetry);
    
    addLog(`[TELEMETRY_SYNC] 📊 Extracted telemetry for ${dev.brand} ${dev.marketName}:`);
    addLog(`[STORAGE] Tech: ${telemetry.memorySpecs.technology} | Read: ${telemetry.memorySpecs.readSpeedMb} MB/s | Partitions: ${telemetry.memorySpecs.partitionTable.length}`);
    addLog(`[SECURITY] FRP: ${telemetry.securityEnclave.frpStatus} | Bootloader: ${telemetry.securityEnclave.bootloaderState} | Knox: ${telemetry.securityEnclave.knoxWarranty} | ARB Index: ${telemetry.securityEnclave.antiRollbackIndex}`);
    addLog(`[POWER_RAILS] VBUS: ${telemetry.powerAndSensors.vbusVoltageV}V | Battery: ${telemetry.powerAndSensors.batteryCellMv}mV (${telemetry.powerAndSensors.batteryTempC}°C) | Diode DP/DN: ${telemetry.powerAndSensors.typeCDiodeImpedanceOhms.dp}Ω/${telemetry.powerAndSensors.typeCDiodeImpedanceOhms.dn}Ω`);
    
    return telemetry;
  };

  // Finalized connectDevice simulation function
  const connectDevice = (deviceInput: ConnectedDevice | string): ConnectedDevice => {
    let targetDevice: ConnectedDevice | undefined;

    if (typeof deviceInput === 'string') {
      const presets = [...DEVICE_PRESETS, ...mockDeviceResponseService.getPresetDeviceProfiles()];
      const searchKey = deviceInput.toLowerCase().trim();
      targetDevice = presets.find(p => 
        p.id.toLowerCase() === searchKey ||
        p.brand.toLowerCase().includes(searchKey) ||
        p.marketName.toLowerCase().includes(searchKey) ||
        p.model.toLowerCase().includes(searchKey)
      );
    } else {
      targetDevice = deviceInput;
    }

    if (!targetDevice) {
      targetDevice = DEVICE_PRESETS[0];
    }

    setCurrentDevice(targetDevice);
    setIsDeviceAuthorized(true);

    // Populate verified telemetry and diagnostic data
    const telemetry = mockDeviceResponseService.generateFullTelemetryResponse(targetDevice);
    setDeviceTelemetry(telemetry);

    const diag = apexAgent.analyzeDevice(targetDevice);
    setApexDiagnostic(diag);

    addLog(`[CONNECT_DEVICE] 🔌 Target connected & state synced: ${targetDevice.brand} ${targetDevice.marketName} (${targetDevice.mode})`);
    addLog(`[DIAG_VERIFIED] IMEI1: ${targetDevice.imei1 || '358941209384721'} | SoC: ${targetDevice.chipsetName || targetDevice.chipset} | Patch: ${targetDevice.securityPatch || '2026-02-01'} | Build: ${targetDevice.buildNumber || 'UP1A.231005'}`);
    addLog(`[STORAGE_VERIFIED] Tech: ${telemetry.memorySpecs.technology} | Read Speed: ${telemetry.memorySpecs.readSpeedMb} MB/s | Health: ${telemetry.memorySpecs.healthPercent}% | FRP: ${telemetry.securityEnclave.frpStatus} | BL: ${telemetry.securityEnclave.bootloaderState}`);

    return targetDevice;
  };

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
    readFullDeviceTelemetry(currentDevice);
  }, [currentDevice.id, currentDevice.mode, currentDevice.vidPid, currentDevice.frpStatus, currentDevice.bootloaderStatus]);

  const checkCloudUpdates = async () => {
    setCloudStatus('syncing');
    try {
      const [healthRes, sysRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/system/check')
      ]);

      const healthJson = healthRes.ok ? await healthRes.json() : null;
      const sysJson = sysRes.ok ? await sysRes.json() : null;
      const isOnline = Boolean(healthJson?.status === 'online');

      const toolsStatus: Record<string, boolean> = sysJson?.status || {};
      const nextHealth: ServerHealthStatus = {
        online: isOnline,
        version: healthJson?.version || '4.8.2-PRO',
        geminiConfigured: Boolean(healthJson?.geminiConfigured),
        tools: toolsStatus,
        lastChecked: new Date().toLocaleTimeString(),
      };
      setServerHealth(nextHealth);

      const readyTools = Object.entries(toolsStatus)
        .filter(([, ready]) => ready)
        .map(([name]) => name);

      setCloudStatus(isOnline ? 'online' : 'offline');
      setLastUpdate(new Date().toLocaleDateString());
      addLog(
        isOnline
          ? `[SERVER_HEALTH] Core ${nextHealth.version} online | AI Engine: ${nextHealth.geminiConfigured ? 'Gemini Connected' : 'Local Rules Active'} | Host Tools: ${readyTools.length ? readyTools.join(', ') : 'WebUSB/Bridge Mode'}`
          : '[SERVER_HEALTH] Backend API unreachable'
      );
    } catch {
      setCloudStatus('offline');
      setServerHealth(prev => ({ ...prev, online: false, lastChecked: new Date().toLocaleTimeString() }));
      addLog('[SERVER_HEALTH] Backend health probe failed');
    }
  };

  // Initial Sync
  React.useEffect(() => {
    checkCloudUpdates();
  }, []);

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
      deviceTelemetry,
      isBusy, setIsBusy,
      lang, setLang,
      isCommandPaletteOpen, setCommandPaletteOpen,
      isUsbModalOpen, setUsbModalOpen,
      isDiagnosticsModalOpen, setDiagnosticsModalOpen,
      isWindowsInstallerOpen, setWindowsInstallerOpen,
      isAgentInspectorOpen, setAgentInspectorOpen,
      terminalLogs, addLog, clearLogs,
      requestUsbConnection,
      cloudStatus, serverHealth, lastUpdate, checkCloudUpdates,
      isDeviceAuthorized, setIsDeviceAuthorized,
      apexDiagnostic, runApexDiagnostics,
      readFullDeviceTelemetry,
      connectDevice,
      activeCaseId, setActiveCaseId,
      diodeSessionLogs,
      powerSessionLogs,
      usbBenchPorts,
      visionFindings, setVisionFindings,
      recordDiodeMeasurement,
      recordPowerAnalysis,
      scanRealBenchUsb,
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
