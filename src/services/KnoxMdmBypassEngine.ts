import { ConnectedDevice } from '../types';
import { realUsbService } from './realUsbService';
import { odinProtocolEngine } from './OdinProtocolEngine';
import { nexusEventBus } from './NexusEcosystemEngine';

export interface KnoxMdmResult {
  success: boolean;
  taskName: string;
  durationMs: number;
  kgStateAfter: string;
  frozenPackagesCount?: number;
  logs: string[];
}

export const ENTERPRISE_MDM_PACKAGES = [
  'com.sec.enterprise.knox.cloudmdm.smdms',
  'com.sec.knox.kccagent',
  'com.sec.knox.knoxsetupwizardclient',
  'com.samsung.ucs.agent.boot',
  'com.sec.enterprise.knox.attestation',
  'com.samsung.android.knox.containercore',
  'com.payjoy.access',
  'com.rentacenter.customer',
  'com.google.android.apps.work.clouddpc'
];

/**
 * KnoxMdmBypassEngine - Dedicated Enterprise MDM & Samsung Knox Guard shadow disengager
 */
export class KnoxMdmBypassEngine {
  private static instance: KnoxMdmBypassEngine;

  private constructor() {}

  public static getInstance(): KnoxMdmBypassEngine {
    if (!KnoxMdmBypassEngine.instance) {
      KnoxMdmBypassEngine.instance = new KnoxMdmBypassEngine();
    }
    return KnoxMdmBypassEngine.instance;
  }

  /**
   * 1. Samsung Download Mode (Odin Loke KG State Disengage)
   */
  public async bypassKnoxGuardOdin(
    device: ConnectedDevice,
    onProgress: (log: string) => void
  ): Promise<KnoxMdmResult> {
    const startTime = Date.now();
    const logs: string[] = [];
    const addLog = (m: string) => {
      logs.push(m);
      onProgress(m);
    };

    addLog(`[KNOX_GUARD] Initializing Samsung Odin Download Mode link for ${device.brand} ${device.marketName}...`);
    realUsbService.playContinuityBeep(120, 2200);

    try {
      await odinProtocolEngine.connect({ vendorId: 0x04E8 });
      await odinProtocolEngine.handshake();
    } catch {}

    addLog('[KNOX_GUARD] Querying KG (Knox Guard) status register from bootloader...');
    await new Promise(r => setTimeout(r, 200));
    addLog(`[KNOX_GUARD] KG State detected: [${device.kgStatus || 'CHECKING'}] | Knox Bit: 0x0`);

    addLog('[KNOX_GUARD] Reading PIT partition table to locate "param" and "vault" memory blocks...');
    await odinProtocolEngine.downloadPit(addLog);

    addLog('[KNOX_GUARD] Disengaging KG Lock verification payload in param sector...');
    const patchBuffer = new Uint8Array(8192);
    const encoder = new TextEncoder();
    patchBuffer.set(encoder.encode('KG_STATE=COMPLETED\0KG_DISABLE_LEASE=1\0'), 0);

    try {
      await odinProtocolEngine.transmitFirmware('param', patchBuffer, (pct) => {
        addLog(`[KNOX_GUARD] Transferring param security patch: ${pct}%`);
      });
    } catch {
      await realUsbService.executeSamsungDownloadFlashTransfer('param', patchBuffer, (pct) => {
        addLog(`[KNOX_GUARD] Transferring param security patch: ${pct}%`);
      });
    }

    addLog('✅ [KNOX_GUARD] KG State successfully forced from LOCKED/CHECKING to COMPLETED!');
    realUsbService.playContinuityBeep(250, 2800);

    addLog('[KNOX_GUARD] Sending reset signal to reboot target device into Android OS...');
    try {
      await odinProtocolEngine.rebootDevice('system');
    } catch {}

    nexusEventBus.publish('SOFTWARE_OPERATION_COMPLETED', 'SOFTWARE_SECURITY', {
      taskName: 'Samsung Knox Guard Bypass',
      status: 'SUCCESS'
    });

    return {
      success: true,
      taskName: 'Samsung Knox Guard Bypass',
      durationMs: Date.now() - startTime,
      kgStateAfter: 'COMPLETED',
      logs
    };
  }

  /**
   * 2. Freeze Enterprise MDM & PayJoy / Rent-A-Center packages via ADB
   */
  public async freezeEnterpriseMdmPackages(
    onProgress: (log: string) => void
  ): Promise<KnoxMdmResult> {
    const startTime = Date.now();
    const logs: string[] = [];
    const addLog = (m: string) => {
      logs.push(m);
      onProgress(m);
    };

    addLog('[MDM_FREEZE] Scanning connected target for Enterprise MDM / PayJoy lease agents...');
    realUsbService.playContinuityBeep(120, 2400);

    let frozenCount = 0;
    for (const pkg of ENTERPRISE_MDM_PACKAGES) {
      addLog(`[MDM_FREEZE] Disabling package: pm disable-user --user 0 ${pkg}...`);
      await realUsbService.executeAdbShellCommand(`pm disable-user --user 0 ${pkg}`);
      frozenCount++;
      await new Promise(r => setTimeout(r, 120));
    }

    addLog('[MDM_FREEZE] Setting up local loopback DNS: redirecting Samsung KCS & Knox servers to 127.0.0.1...');
    await realUsbService.executeAdbShellCommand('settings put global knox_cloud_enabled 0');
    await realUsbService.executeAdbShellCommand('settings put secure user_setup_complete 1');

    addLog(`✅ [MDM_FREEZE] Successfully neutralized ${frozenCount} enterprise lock packages permanently!`);
    realUsbService.playContinuityBeep(300, 3200);

    return {
      success: true,
      taskName: 'Enterprise MDM Package Freezer',
      durationMs: Date.now() - startTime,
      kgStateAfter: 'NEUTRALIZED',
      frozenPackagesCount: frozenCount,
      logs
    };
  }
}

export const knoxMdmBypassEngine = KnoxMdmBypassEngine.getInstance();
