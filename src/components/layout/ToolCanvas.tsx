import React from 'react';
import { useWorkstation } from '../../context/WorkstationContext';
import { ChipsetType } from '../../types';
import { CentralDashboard } from '../CentralDashboard';
import { ApexAgentDashboard } from '../ApexAgentDashboard';
import { AiDiagnosticEngine } from '../AiDiagnosticEngine';
import { SmartUsbOneClickStudio } from '../SmartUsbOneClickStudio';
import { FlasherWorkspace } from '../FlasherWorkspace';
import { DeadBootRecoveryStudio } from '../DeadBootRecoveryStudio';
import { UltimateFaultRepairHub } from '../UltimateFaultRepairHub';
import { FrpBypassHub } from '../FrpBypassHub';
import { QuantumBypassEngine } from '../QuantumBypassEngine';
import { HardwareMicroSolderingEngine } from '../HardwareMicroSolderingEngine';
import { NetworkNvramStudio } from '../NetworkNvramStudio';
import { UfsMemoryProgrammerStudio } from '../UfsMemoryProgrammerStudio';
import { AiOscilloscopeStudio } from '../AiOscilloscopeStudio';
import { ThermalRosinCameraStudio } from '../ThermalRosinCameraStudio';
import { InteractivePcbBitmapExplorer } from '../InteractivePcbBitmapExplorer';
import { PowerSignatureLab } from '../PowerSignatureLab';
import { IspTestPointHub } from '../IspTestPointHub';
import { MultimeterStudio } from '../MultimeterStudio';
import { OemDatabaseBrowser } from '../OemDatabaseBrowser';
import { FirmwareMatchingService } from '../FirmwareMatchingService';
import { QuickWizardGuide } from '../QuickWizardGuide';
import { ForensicDecryptSuite } from '../ForensicDecryptSuite';
import { ManagementStudio } from '../ManagementStudio';
import { CloudSecurityHub } from '../tools/CloudSecurityHub';
import { AgentSkillsEncyclopedia } from '../AgentSkillsEncyclopedia';
import { LanguageCscLocalizer } from '../LanguageCscLocalizer';
import { AntiBrickSafetySuite } from '../AntiBrickSafetySuite';
import { MultiModeDeviceReader } from '../MultiModeDeviceReader';
import { BoxEmulationHub } from '../BoxEmulationHub';
import { ProtocolCodeLab } from '../ProtocolCodeLab';
import { OsSecurityArchitectureLab } from '../OsSecurityArchitectureLab';
import { FirmwarePartitionSlicer } from '../FirmwarePartitionSlicer';
import { ForensicCertificationStudio } from '../ForensicCertificationStudio';
import { AiThermalLidarStudio } from '../AiThermalLidarStudio';
import { EsimSatelliteSpectrumStudio } from '../EsimSatelliteSpectrumStudio';
import { SmartHardwareBenchController } from '../SmartHardwareBenchController';
import { EepromTrueToneBmsStudio } from '../EepromTrueToneBmsStudio';
import { SoftwareSecurityBypassLab } from '../SoftwareSecurityBypassLab';

import { BoxCoreAIWorkspace } from '../BoxCoreAIWorkspace';

export function ToolCanvas() {
  const { 
    activeTab, 
    lang, 
    currentDevice, 
    setCurrentDevice,
    isBusy, 
    setIsBusy, 
    setActiveTab, 
    addLog 
  } = useWorkstation();

  const handleApplyFix = (fix: any) => {
    addLog(`Applying Fix: ${typeof fix === 'string' ? fix : JSON.stringify(fix)}`);
  };

  switch (activeTab) {
    case 'dashboard':
      return <CentralDashboard lang={lang} onNavigate={setActiveTab} />;

    case 'apex-agent':
      return <ApexAgentDashboard device={currentDevice} onNavigate={setActiveTab} lang={lang} />;

    case 'agent-encyclopedia':
      return <AgentSkillsEncyclopedia lang={lang} onNavigateToTool={setActiveTab} />;

    case 'smart':
    case 'smart-1click':
      return <SmartUsbOneClickStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'dead-boot':
      return <DeadBootRecoveryStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'quantum-bypass':
    case 'icloud':
      return (
        <QuantumBypassEngine 
          device={currentDevice} 
          lang={lang} 
          isBusy={isBusy}
          onExecuteQuantumBypass={(m) => addLog(`Executing Quantum Bypass: ${m}`)}
        />
      );

    case 'frp':
      return (
        <FrpBypassHub 
          device={currentDevice} 
          lang={lang} 
          isBusy={isBusy} 
          onExecuteBypass={(m) => addLog(`Executing FRP Bypass: ${m.name}`)} 
        />
      );

    case 'forensic-decrypt':
      return <ForensicDecryptSuite lang={lang} device={currentDevice} onAddLog={addLog} isBusy={isBusy} />;

    case 'diagnostics':
    case 'ai-diagnostics':
      return (
        <AiDiagnosticEngine 
          device={currentDevice} 
          onApplyFix={handleApplyFix} 
          lang={lang} 
          isBusy={isBusy}
          onNavigateToHardwareRepair={(id) => setActiveTab('pcb-explorer')}
        />
      );

    case 'fault-repair':
      return (
        <UltimateFaultRepairHub 
          device={currentDevice} 
          lang={lang} 
          isBusy={isBusy}
          onExecuteRepairPipeline={(p) => addLog(`Executing Repair Pipeline: ${p.id}`)}
        />
      );

    case 'ai-oscilloscope':
      return <AiOscilloscopeStudio lang={lang} device={currentDevice} />;

    case 'thermal-rosin':
      return <ThermalRosinCameraStudio lang={lang} device={currentDevice} />;

    case 'advanced':
    case 'flasher':
      return (
        <FlasherWorkspace 
          device={currentDevice} 
          lang={lang} 
          isBusy={isBusy}
          onExecuteFlash={(p) => addLog(`Executing Flash Protocol: ${p}`)}
        />
      );

    case 'network':
      return (
        <NetworkNvramStudio 
          device={currentDevice} 
          lang={lang} 
          isBusy={isBusy}
          onExecuteNvramAction={(a) => addLog(`Executing NVRAM Action: ${a}`)}
        />
      );

    case 'ufs-memory':
      return <UfsMemoryProgrammerStudio device={currentDevice} lang={lang} />;

    case 'localization':
      return (
        <LanguageCscLocalizer 
          device={currentDevice} 
          lang={lang} 
          isBusy={isBusy}
          onExecuteLocalize={(actionType, payload) => addLog(`Localization executed: ${actionType}`)}
        />
      );

    case 'safety':
      return (
        <AntiBrickSafetySuite 
          device={currentDevice} 
          lang={lang} 
          isBusy={isBusy}
          onBackupPartition={(partitions) => addLog(`Partition Backup executed: ${partitions.join(', ')}`)}
          onRestorePartition={(partitionName) => addLog(`Partition Restore executed: ${partitionName}`)}
        />
      );

    case 'device-reader':
      return (
        <MultiModeDeviceReader 
          device={currentDevice} 
          lang={lang} 
          isBusy={isBusy}
          onSwitchDeviceMode={(newMode) => {
            setCurrentDevice({ ...currentDevice, mode: newMode });
            addLog(`Device Mode switched to: ${newMode}`);
          }}
          onReadDeviceDeepInfo={(mode) => addLog(`Reading deep telemetry for mode: ${mode}`)}
          onExecuteAdbCommand={(cmd) => addLog(`Executing Shell Command: ${cmd}`)}
        />
      );

    case 'hardware-workbench':
      return <HardwareMicroSolderingEngine device={currentDevice} lang={lang} />;

    case 'pcb-explorer':
      return <InteractivePcbBitmapExplorer lang={lang} device={currentDevice} />;

    case 'power-lab':
      return <PowerSignatureLab lang={lang} />;

    case 'isp-hub':
      return <IspTestPointHub lang={lang} />;

    case 'multimeter':
      return <MultimeterStudio lang={lang} />;

    case 'database':
    case 'oem-database':
      return (
        <OemDatabaseBrowser 
          lang={lang} 
          onSelectModelToTarget={(record) => {
            const chipLower = (record.chipset || '').toLowerCase();
            let validChipset: ChipsetType = 'generic_adb';
            if (chipLower.includes('snapdragon') || chipLower.includes('qualcomm')) validChipset = 'qualcomm';
            else if (chipLower.includes('dimensity') || chipLower.includes('helio') || chipLower.includes('mtk')) validChipset = 'mediatek';
            else if (chipLower.includes('exynos')) validChipset = 'samsung_exynos';
            else if (chipLower.includes('unisoc') || chipLower.includes('spd')) validChipset = 'unisoc_spd';
            else if (chipLower.includes('kirin')) validChipset = 'hisilicon_kirin';
            else if (chipLower.includes('bionic') || chipLower.includes('apple')) validChipset = 'apple_ios';
            else if (chipLower.includes('tensor')) validChipset = 'google_tensor';

            setCurrentDevice({
              ...currentDevice,
              model: record.model,
              marketName: `${record.brand} ${record.model}`,
              brand: record.brand,
              chipset: validChipset,
              chipsetName: record.chipset || currentDevice.chipsetName
            });
            addLog(`Selected target device from OEM registry: ${record.brand} ${record.model}`);
          }}
        />
      );

    case 'firmware-matching':
      return (
        <FirmwareMatchingService 
          lang={lang} 
          device={currentDevice} 
          onSelectFirmwareForFlash={(f) => {
            setActiveTab('flasher');
            addLog(`Firmware routed to Multi-ROM Flasher: ${f.osVersion} (${f.regionCsc || f.model})`);
          }}
        />
      );

    case 'box-emulation':
      return (
        <BoxEmulationHub 
          device={currentDevice} 
          lang={lang} 
          isBusy={isBusy}
          onExecuteBoxProtocol={(boxName, protocolName, command) => 
            addLog(`Native Box Emulation [${boxName}] -> ${protocolName}: ${command}`)
          }
        />
      );

    case 'box-core-ai':
      return (
        <BoxCoreAIWorkspace 
          device={currentDevice} 
          lang={lang} 
        />
      );

    case 'codelab':
      return <ProtocolCodeLab lang={lang} />;

    case 'os-security-lab':
    case 'os-architecture':
      return (
        <OsSecurityArchitectureLab 
          lang={lang} 
          device={currentDevice}
          onNavigateToTool={setActiveTab}
          onAddLog={addLog}
        />
      );

    case 'firmware-slicer':
    case 'partition-slicer':
      return (
        <FirmwarePartitionSlicer
          lang={lang}
          device={currentDevice}
          onAddLog={addLog}
          onNavigateToTool={setActiveTab}
        />
      );

    case 'forensic-cert':
    case 'qa-certificate':
      return (
        <ForensicCertificationStudio
          lang={lang}
          device={currentDevice}
          onAddLog={addLog}
        />
      );

    case 'thermal-lidar':
    case 'ai-thermal-lidar':
      return (
        <AiThermalLidarStudio
          lang={lang}
          device={currentDevice}
          onAddLog={addLog}
          onNavigateToTool={setActiveTab}
        />
      );

    case 'satellite-ntn':
    case 'esim-satellite':
      return (
        <EsimSatelliteSpectrumStudio
          lang={lang}
          device={currentDevice}
          onAddLog={addLog}
          onNavigateToTool={setActiveTab}
        />
      );

    case 'smart-bench':
    case 'bench-controller':
      return (
        <SmartHardwareBenchController
          lang={lang}
          device={currentDevice}
          onAddLog={addLog}
          onNavigateToTool={setActiveTab}
        />
      );

    case 'eeprom-programmer':
    case 'truetone-bms':
      return (
        <EepromTrueToneBmsStudio
          lang={lang}
          device={currentDevice}
          onAddLog={addLog}
          onNavigateToTool={setActiveTab}
        />
      );

    case 'security-bypass':
    case 'software-bypass':
    case 'software-lab':
      return (
        <SoftwareSecurityBypassLab
          lang={lang}
          device={currentDevice}
          onAddLog={addLog}
          onNavigateToTool={setActiveTab}
        />
      );

    case 'quick-wizard':
      return <QuickWizardGuide lang={lang} setActiveTab={setActiveTab} />;

    case 'business':
    case 'management':
      return <ManagementStudio lang={lang} />;

    case 'cloud-security':
      return <CloudSecurityHub />;

    default:
      return <CentralDashboard lang={lang} onNavigate={setActiveTab} />;
  }
}
