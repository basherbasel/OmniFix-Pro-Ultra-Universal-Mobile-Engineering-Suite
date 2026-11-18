import React from 'react';
import { useWorkstation } from '../../context/WorkstationContext';
import { ChipsetType } from '../../types';
import { CentralDashboard } from '../CentralDashboard';
import { ApexAgentDashboard } from '../ApexAgentDashboard';
import { AiDiagnosticEngine } from '../AiDiagnosticEngine';
import { SmartUsbOneClickStudio } from '../SmartUsbOneClickStudio';
import { SamsungOdinFlasherStudio } from '../SamsungOdinFlasherStudio';
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
import { NextGenPredictiveWorkspace } from '../NextGenPredictiveWorkspace';
import { VoltageBridge } from '../VoltageBridge';
import { DeviceManager } from '../devices/DeviceManager';

import { BoxCoreAIWorkspace } from '../BoxCoreAIWorkspace';
import { NexusEcosystemArchitecture } from '../NexusEcosystemArchitecture';
import { UniversalSoCProtocolEngineWorkspace } from '../UniversalSoCProtocolEngineWorkspace';
import { PureSoftwareUsbEngineStudio } from '../PureSoftwareUsbEngineStudio';
import { MasterSystemPromptStudio } from '../MasterSystemPromptStudio';
import { MediaTekProToolStudio } from '../MediaTekProToolStudio';
import { AllChipsetsProStudio } from '../AllChipsetsProStudio';
import { UnifiedCoreCppStudio } from '../UnifiedCoreCppStudio';
import { FrpOemLockStudio } from '../FrpOemLockStudio';
import { QualcommFirehoseStudio } from '../QualcommFirehoseStudio';
import { BootloopVerityRepairStudio } from '../BootloopVerityRepairStudio';
import { KnoxMdmBypassStudio } from '../KnoxMdmBypassStudio';
import { UnisocSpdStudio } from '../UnisocSpdStudio';
import { RepairTicketBarcodeStudio } from '../RepairTicketBarcodeStudio';
import { SamsungPitEditorStudio } from '../SamsungPitEditorStudio';
import { PayloadDumperStudio } from '../PayloadDumperStudio';
import { FastbootdLogicalStudio } from '../FastbootdLogicalStudio';
import { AppleRamdiskStudio } from '../AppleRamdiskStudio';
import { XiaomiSideloadStudio } from '../XiaomiSideloadStudio';
import { HuaweiKirinStudio } from '../HuaweiKirinStudio';
import { FirmwareHexCarverStudio } from '../FirmwareHexCarverStudio';
import { RawSerialSnifferStudio } from '../RawSerialSnifferStudio';
import { GoogleTensorPixelStudio } from '../GoogleTensorPixelStudio';
import { OppoOfpExtractorStudio } from '../OppoOfpExtractorStudio';
import { LgLafStudio } from '../LgLafStudio';
import { AppleSysCfgStudio } from '../AppleSysCfgStudio';
import { SonyS1Studio } from '../SonyS1Studio';
import { VivoAuthStudio } from '../VivoAuthStudio';
import { MsmDeepFlashStudio } from '../MsmDeepFlashStudio';
import { RpmbEmmcHealthStudio } from '../RpmbEmmcHealthStudio';
import { TranssionMtkStudio } from '../TranssionMtkStudio';
import { AppleBasebandStudio } from '../AppleBasebandStudio';
import { SamsungExynosStudio } from '../SamsungExynosStudio';
import { HuaweiHarmonyStudio } from '../HuaweiHarmonyStudio';

export function ToolCanvas() {
  const { 
    activeTab, 
    lang, 
    currentDevice, 
    deviceTelemetry,
    connectDevice,
    isBusy, 
    setIsBusy, 
    setActiveTab, 
    addLog,
    apexDiagnostic
  } = useWorkstation();

  const handleApplyFix = (fix: any) => {
    addLog(`Applying Fix: ${typeof fix === 'string' ? fix : JSON.stringify(fix)}`);
  };

  const normalizedTab = (activeTab || 'dashboard').toString().toLowerCase().trim();

  switch (normalizedTab) {
    case 'dashboard':
      return <CentralDashboard lang={lang} onNavigate={setActiveTab} />;

    case 'ecosystem':
    case 'nexus-ecosystem':
      return <NexusEcosystemArchitecture device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'universal-soc':
    case 'soc-engine':
    case 'universal-platform':
      return <UniversalSoCProtocolEngineWorkspace device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'pure-software-usb':
    case 'normal-cable':
    case 'dongleless':
      return <PureSoftwareUsbEngineStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'mtk-pro-tool':
    case 'mtkclient':
    case 'kamakiri':
      return <MediaTekProToolStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'all-chipsets':
    case 'chipsets-pro':
      return <AllChipsetsProStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'unified-core':
    case 'cpp-core':
    case 'winusb-serial':
      return <UnifiedCoreCppStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'frp-oem-lock':
    case 'frp-reset':
    case 'oem-unlock':
    case 'frp-bypass':
      return <FrpOemLockStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'qualcomm-firehose':
    case 'qualcomm-edl':
    case 'firehose':
    case 'edl-programmer':
      return <QualcommFirehoseStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'bootloop-verity':
    case 'dm-verity':
    case 'anti-rollback':
    case 'arb-fix':
      return <BootloopVerityRepairStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'knox-mdm':
    case 'knox-guard':
    case 'mdm-bypass':
    case 'payjoy':
      return <KnoxMdmBypassStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'unisoc-spd':
    case 'unisoc':
    case 'spreadtrum':
    case 'spd-fdl':
      return <UnisocSpdStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'repair-ticket':
    case 'ticket-barcode':
    case 'invoice':
      return <RepairTicketBarcodeStudio device={currentDevice} lang={lang} />;

    case 'samsung-pit':
    case 'pit-editor':
    case 're-partition':
      return <SamsungPitEditorStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'payload-dumper':
    case 'payload-slicer':
    case 'boot-patcher':
      return <PayloadDumperStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'fastbootd':
    case 'fastbootd-logical':
    case 'super-partitions':
    case 'gsi-flasher':
      return <FastbootdLogicalStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'apple-ramdisk':
    case 'checkm8':
    case 'purple-mode':
    case 'ios-passcode':
      return <AppleRamdiskStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'xiaomi-sideload':
    case 'xiaomi':
    case 'mi-account':
    case 'poco':
      return <XiaomiSideloadStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'huawei-kirin':
    case 'kirin':
    case 'huawei':
    case 'usb-com-1':
    case 'huawei-harmony':
    case 'harmonyos':
      return <HuaweiHarmonyStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'hex-carver':
    case 'hex-inspector':
    case 'firmware-carver':
      return <FirmwareHexCarverStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'serial-sniffer':
    case 'raw-serial':
    case 'com-sniffer':
      return <RawSerialSnifferStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'google-pixel':
    case 'pixel':
    case 'tensor':
    case 'titan-m2':
      return <GoogleTensorPixelStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'oppo-ofp':
    case 'realme-ofp':
    case 'oneplus-ops':
    case 'ofp-extractor':
      return <OppoOfpExtractorStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'lg-laf':
    case 'lg':
    case 'kdz':
      return <LgLafStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'apple-syscfg':
    case 'syscfg':
    case 'wifi-unbind':
      return <AppleSysCfgStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'sony-s1':
    case 'sony':
    case 'xperia':
    case 'sin-flasher':
      return <SonyS1Studio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'vivo-auth':
    case 'vivo':
    case 'iqoo':
    case 'bbk':
      return <VivoAuthStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'msm-deepflash':
    case 'msm':
    case 'deep-testing':
    case 'oneplus-msm':
      return <MsmDeepFlashStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'rpmb-health':
    case 'emmc-health':
    case 'ufs-health':
    case 'rpmb':
      return <RpmbEmmcHealthStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'transsion-mtk':
    case 'infinix':
    case 'tecno':
    case 'itel':
      return <TranssionMtkStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'apple-baseband':
    case 'modem-panic':
    case 'bb-eeprom':
      return <AppleBasebandStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'samsung-exynos':
    case 'exynos':
    case 'shannon-cp':
      return <SamsungExynosStudio device={currentDevice} lang={lang} onAddLog={addLog} />;

    case 'master-prompt':
    case 'ai-system-prompt':
      return <MasterSystemPromptStudio lang={lang} onAddLog={addLog} />;

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

    case 'odin':
    case 'samsung-odin':
      return (
        <SamsungOdinFlasherStudio
          device={currentDevice}
          lang={lang}
          isBusy={isBusy}
          onAddLog={addLog}
          onExecuteFlash={(p) => addLog(`Executing Samsung Flash: ${p}`)}
        />
      );

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
    case 'network-rf':
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
    case 'device-manager':
      return (
        <div className="space-y-8">
          <DeviceManager />
          <MultiModeDeviceReader 
            device={currentDevice} 
            lang={lang} 
            isBusy={isBusy}
            onSwitchDeviceMode={(newMode) => {
              connectDevice({ ...currentDevice, mode: newMode });
              addLog(`Device Mode switched to: ${newMode}`);
            }}
            onReadDeviceDeepInfo={(mode) => addLog(`Reading deep telemetry for mode: ${mode}`)}
            onExecuteAdbCommand={(cmd) => addLog(`Executing Shell Command: ${cmd}`)}
          />
        </div>
      );

    case 'hardware-workbench':
      return <HardwareMicroSolderingEngine device={currentDevice} lang={lang} />;

    case 'voltage-bridge':
      return <VoltageBridge device={currentDevice} lang={lang} />;

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

            connectDevice({
              ...currentDevice,
              id: `oem-${(record.code_name || record.model).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              model: record.code_name || record.model,
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

    case 'next-gen-workspace':
    case 'predictive-workspace':
    case 'predictive-platform':
      return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <NextGenPredictiveWorkspace isAr={lang === 'ar'} />
        </div>
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
