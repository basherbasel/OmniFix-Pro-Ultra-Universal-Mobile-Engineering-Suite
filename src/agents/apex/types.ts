import { ChipsetType, DeviceMode, ConnectedDevice, PartitionInfo, DiagnosticIssue } from '../../types';

export type ApexModuleId = 'SENSORY' | 'SAFETY' | 'FORENSIC' | 'EXECUTION';

export interface ApexModuleStatus {
  id: ApexModuleId;
  nameAr: string;
  nameEn: string;
  status: 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'ERROR' | 'SKIPPED';
  progress: number;
  messageAr: string;
  messageEn: string;
}

export interface ApexIdentificationResult {
  detectedVidPid: string;
  detectedMode: DeviceMode;
  matchedBrand: string;
  matchedModel: string;
  matchedChipset: ChipsetType;
  confidence: number;
}

export interface ApexSafetyResult {
  backupsExecuted: {
    partitionName: string;
    status: 'SUCCESS' | 'FAILED';
    sizeBytes: number;
    path: string;
  }[];
  integrityCheckPassed: boolean;
  preFlightWarnings: string[];
}

export interface ApexForensicResult {
  hexAnalysis: {
    corruptedBlocks: string[];
    securityFlagsTriggered: string[];
    missingSignatures: string[];
  };
  bootloopDiagnosis: string;
  partitionTableStatus: 'HEALTHY' | 'DAMAGED' | 'REWRITTEN';
  logs: string[];
}

export interface ApexExecutionResult {
  matchedFirmwareBuild: string;
  executionScriptGenerated: boolean;
  scriptContent: string;
  protocolCommunicationStatus: 'CONNECTED' | 'DISCONNECTED' | 'STREAMING' | 'HANDSHAKE_READY' | 'IDLE';
  bytesWritten: number;
  totalBytes: number;
  recommendedAction?: {
    tabId: string;
    labelAr: string;
    labelEn: string;
    descriptionAr: string;
    descriptionEn: string;
  };
}

export interface ApexAgentState {
  currentModule: ApexModuleId;
  modules: Record<ApexModuleId, ApexModuleStatus>;
  identification?: ApexIdentificationResult;
  safety?: ApexSafetyResult;
  forensic?: ApexForensicResult;
  execution?: ApexExecutionResult;
  isBusy: boolean;
  logs: { timestamp: number; message: string; type: 'info' | 'warn' | 'error' | 'success' }[];
}
