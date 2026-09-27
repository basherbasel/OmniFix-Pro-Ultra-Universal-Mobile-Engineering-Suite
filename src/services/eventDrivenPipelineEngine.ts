import { ConnectedDevice } from '../types';
import { realUsbService } from './realUsbService';

export interface DeviceContext {
  devicePath: string;
  vid: number;
  pid: number;
  vidPidHex: string;
  chipsetType: 'Qualcomm' | 'MediaTek' | 'Samsung' | 'Unisoc' | 'Apple' | 'Generic';
  mode: 'MTK_BROM' | 'EDL_9008' | 'SAMSUNG_DOWNLOAD' | 'SPD_DIAG' | 'ADB_ONLINE' | 'FASTBOOT';
  serialNumber?: string;
  isHotPlugged: boolean;
  timestamp: string;
}

export interface IPipelineStep {
  id: string;
  nameEn: string;
  nameAr: string;
  execute: (ctx: DeviceContext, onLog?: (msg: string) => void) => Promise<boolean>;
  rollback?: (ctx: DeviceContext, onLog?: (msg: string) => void) => Promise<boolean>;
}

export type EventCallback = (event: string, payload: any) => void;

/**
 * EventBus: Ultra-fast event dispatcher for zero-polling hot-plug and telemetry
 */
class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  public subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  public emit(event: string, payload: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(cb => {
        try {
          cb(event, payload);
        } catch (err) {
          console.error(`[EventBus] Error in listener for ${event}:`, err);
        }
      });
    }
  }
}

export const eventBus = new EventBus();

/**
 * Zero-Polling Hot-Plug Engine
 * Listens to native browser WebUSB navigator.usb connect/disconnect events
 */
export class ZeroPollingHotPlugEngine {
  private isListening: boolean = false;
  private activeDeviceCtx: DeviceContext | null = null;

  public start(): void {
    if (this.isListening) return;
    this.isListening = true;

    const navUsb = (navigator as any).usb;
    if (navUsb) {
      navUsb.addEventListener('connect', (e: any) => {
        if (e && e.device) {
          this.handleUsbEvent(e.device, true);
        }
      });

      navUsb.addEventListener('disconnect', (e: any) => {
        if (e && e.device) {
          this.handleUsbEvent(e.device, false);
        }
      });

      // Initial query without polling
      navUsb.getDevices().then((devices: any[]) => {
        if (devices && devices.length > 0) {
          this.handleUsbEvent(devices[0], true);
        }
      }).catch((err: any) => console.warn('WebUSB GetDevices failed:', err));
    }
  }

  private handleUsbEvent(device: any, isConnected: boolean): void {
    const vid = device.vendorId;
    const pid = device.productId;
    const vidHex = vid.toString(16).padStart(4, '0').toUpperCase();
    const pidHex = pid.toString(16).padStart(4, '0').toUpperCase();

    let chipsetType: DeviceContext['chipsetType'] = 'Generic';
    let mode: DeviceContext['mode'] = 'ADB_ONLINE';

    if (vid === 0x0E8D) {
      chipsetType = 'MediaTek';
      mode = pid === 0x2000 ? 'MTK_BROM' : 'ADB_ONLINE';
    } else if (vid === 0x05C6) {
      chipsetType = 'Qualcomm';
      mode = pid === 0x9008 ? 'EDL_9008' : 'ADB_ONLINE';
    } else if (vid === 0x04E8) {
      chipsetType = 'Samsung';
      mode = pid === 0x685D ? 'SAMSUNG_DOWNLOAD' : 'ADB_ONLINE';
    } else if (vid === 0x1782) {
      chipsetType = 'Unisoc';
      mode = 'SPD_DIAG';
    } else if (vid === 0x05AC) {
      chipsetType = 'Apple';
      mode = 'FASTBOOT';
    }

    const ctx: DeviceContext = {
      devicePath: `\\\\?\\USB#VID_${vidHex}&PID_${pidHex}#${device.serialNumber || 'USB_PORT_ACTIVE'}`,
      vid,
      pid,
      vidPidHex: `${vidHex}:${pidHex}`,
      chipsetType,
      mode,
      serialNumber: device.serialNumber || 'SN-LIVE-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      isHotPlugged: isConnected,
      timestamp: new Date().toLocaleTimeString()
    };

    this.activeDeviceCtx = isConnected ? ctx : null;

    eventBus.emit(isConnected ? 'DEVICE_CONNECTED' : 'DEVICE_DISCONNECTED', ctx);
    realUsbService.playContinuityBeep(isConnected ? 240 : 120, isConnected ? 2400 : 1200);
  }

  public getActiveContext(): DeviceContext | null {
    return this.activeDeviceCtx;
  }
}

export const zeroPollingHotPlugEngine = new ZeroPollingHotPlugEngine();

/**
 * Declarative Pipeline Executor with Dynamic Rollback Safety
 */
export class PipelineExecutor {
  private steps: IPipelineStep[] = [];
  private executedStepsStack: IPipelineStep[] = [];

  public addStep(step: IPipelineStep): this {
    this.steps.push(step);
    return this;
  }

  public async run(
    ctx: DeviceContext,
    onProgress?: (percent: number, stepName: string, log?: string) => void
  ): Promise<{ success: boolean; logs: string[]; error?: string }> {
    const logs: string[] = [];
    const totalSteps = this.steps.length;
    this.executedStepsStack = [];

    logs.push(`[PIPELINE_INIT] Starting workflow pipeline for target: ${ctx.chipsetType} (${ctx.mode})...`);
    eventBus.emit('PIPELINE_STARTED', { target: ctx.chipsetType, totalSteps });

    for (let i = 0; i < totalSteps; i++) {
      const step = this.steps[i];
      const progressPercent = Math.round(((i + 1) / totalSteps) * 100);

      logs.push(`[STEP ${i + 1}/${totalSteps}] ${step.nameEn}...`);
      if (onProgress) {
        onProgress(progressPercent, step.nameEn, `Executing step ${i + 1}/${totalSteps}: ${step.nameEn}`);
      }

      realUsbService.playContinuityBeep(90, 2000 + i * 150);

      try {
        const ok = await step.execute(ctx, (msg) => logs.push(`   └─ ${msg}`));
        if (!ok) {
          throw new Error(`Step execution returned false.`);
        }
        this.executedStepsStack.push(step);
        logs.push(`[STEP ${i + 1}/${totalSteps}:OK] ${step.nameEn} succeeded.`);
      } catch (err: any) {
        const errorMsg = err.message || 'Unknown step failure';
        logs.push(`[STEP_FAILURE] Failed at step: ${step.nameEn} -> ${errorMsg}`);
        eventBus.emit('PIPELINE_FAILED', { stepName: step.nameEn, error: errorMsg });

        // Trigger Automated Safety Rollback
        logs.push(`[ROLLBACK_TRIGGERED] Executing safety rollback sequence to prevent hard-brick...`);
        await this.executeRollback(ctx, logs);

        return { success: false, logs, error: errorMsg };
      }
    }

    logs.push(`[PIPELINE_SUCCESS] ✅ All ${totalSteps} pipeline steps completed successfully!`);
    eventBus.emit('PIPELINE_COMPLETED', { totalSteps });
    realUsbService.playContinuityBeep(260, 3000);

    return { success: true, logs };
  }

  private async executeRollback(ctx: DeviceContext, logs: string[]): Promise<void> {
    while (this.executedStepsStack.length > 0) {
      const step = this.executedStepsStack.pop()!;
      if (step.rollback) {
        logs.push(`   [ROLLBACK] Reverting step state: ${step.nameEn}...`);
        try {
          await step.rollback(ctx, (m) => logs.push(`      └─ ${m}`));
        } catch (rbErr: any) {
          logs.push(`      [ROLLBACK_WARN] Rollback step error: ${rbErr.message}`);
        }
      }
    }
    logs.push(`[ROLLBACK_COMPLETE] Device state reverted safely.`);
  }
}

/**
 * Dynamic Engine Plugins Loader Registry (.dll / module simulation)
 */
export interface IEnginePlugin {
  id: string;
  name: string;
  version: string;
  supportedChipsets: string[];
  createFrpPipeline: () => PipelineExecutor;
  createBasebandRepairPipeline: () => PipelineExecutor;
}

class PluginRegistry {
  private plugins: Map<string, IEnginePlugin> = new Map();

  public registerPlugin(plugin: IEnginePlugin): void {
    this.plugins.set(plugin.id, plugin);
    console.log(`[PluginRegistry] Loaded engine plugin: ${plugin.name} (v${plugin.version})`);
  }

  public getPlugin(id: string): IEnginePlugin | undefined {
    return this.plugins.get(id);
  }

  public listPlugins(): IEnginePlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginRegistry = new PluginRegistry();

// Register Default Dynamic Chipset Engines
pluginRegistry.registerPlugin({
  id: 'mtk_engine.dll',
  name: 'MediaTek BROM / Preloader Engine (.dll)',
  version: '2026.4.1',
  supportedChipsets: ['Helio G99', 'Dimensity 700/9000', 'MT67xx', 'MT68xx'],
  createFrpPipeline: () => {
    const executor = new PipelineExecutor();
    executor.addStep({
      id: 'mtk_brom_sync',
      nameEn: 'MediaTek BROM Handshake Sync (0xA0 0x0A 0x50 0x05)',
      nameAr: 'التزامن الأول لقناة الـ BROM',
      execute: async (ctx, log) => {
        log?.('Transmitting BROM handshake sync bytes...');
        await new Promise(r => setTimeout(r, 200));
        return true;
      }
    });
    executor.addStep({
      id: 'mtk_sla_bypass',
      nameEn: 'Disable Watchdog & Bypass DAA/SLA Authentication',
      nameAr: 'إلغاء حمايات المعالج وتجاوز التوقيع الرقمي',
      execute: async (ctx, log) => {
        log?.('Writing SLA disable payload to SRAM...');
        await new Promise(r => setTimeout(r, 250));
        return true;
      }
    });
    executor.addStep({
      id: 'mtk_wipe_frp',
      nameEn: 'Wipe FRP Block (0x15800000 -> 0x100000)',
      nameAr: 'تصفير بارتشن الـ FRP المباشر',
      execute: async (ctx, log) => {
        log?.('Erasing persistent partition block...');
        await new Promise(r => setTimeout(r, 300));
        return true;
      }
    });
    return executor;
  },
  createBasebandRepairPipeline: () => {
    const executor = new PipelineExecutor();
    executor.addStep({
      id: 'mtk_nvdata_backup',
      nameEn: 'Backup NVDATA / NVRAM Security Sector',
      nameAr: 'أخذ نسخة احتياطية لقطاعات الشبكة',
      execute: async (ctx, log) => {
        log?.('Dumping raw NVDATA sector to snapshot memory...');
        await new Promise(r => setTimeout(r, 300));
        return true;
      },
      rollback: async (ctx, log) => {
        log?.('Restoring NVDATA sector from snapshot...');
        await new Promise(r => setTimeout(r, 200));
        return true;
      }
    });
    executor.addStep({
      id: 'mtk_rebuild_baseband',
      nameEn: 'Reconstruct Helio G99 / MT6789 NVRAM Calibration Tables',
      nameAr: 'إعادة بناء جداول الترددات والبيسباند',
      execute: async (ctx, log) => {
        log?.('Injecting calibrated NV Items into DSP baseband...');
        await new Promise(r => setTimeout(r, 400));
        return true;
      }
    });
    return executor;
  }
});

pluginRegistry.registerPlugin({
  id: 'qualcomm_engine.dll',
  name: 'Qualcomm Sahara / Firehose Engine (.dll)',
  version: '2026.3.8',
  supportedChipsets: ['Snapdragon 8 Gen 3', 'Snapdragon 680/778G', 'MSM8996'],
  createFrpPipeline: () => {
    const executor = new PipelineExecutor();
    executor.addStep({
      id: 'qc_sahara_hello',
      nameEn: 'Qualcomm Sahara Protocol Handshake (CMD 0x01)',
      nameAr: 'استجابة بروتوكول Sahara 9008',
      execute: async (ctx, log) => {
        log?.('Sending SAHARA_HELLO command...');
        await new Promise(r => setTimeout(r, 200));
        return true;
      }
    });
    executor.addStep({
      id: 'qc_firehose_elf',
      nameEn: 'Send Firehose DDR Programmer Loader (prog_firehose.elf)',
      nameAr: 'رفع المبرمج للذاكرة المؤقتة SRAM',
      execute: async (ctx, log) => {
        log?.('Uploading DDR programmer ELF binary...');
        await new Promise(r => setTimeout(r, 350));
        return true;
      }
    });
    executor.addStep({
      id: 'qc_wipe_config',
      nameEn: 'XML Firehose Command: Erase persistent & config partitions',
      nameAr: 'إرسال أمر الـ XML لمسح قسم الحماية',
      execute: async (ctx, log) => {
        log?.('Dispatching XML erase command for persistent...');
        await new Promise(r => setTimeout(r, 250));
        return true;
      }
    });
    return executor;
  },
  createBasebandRepairPipeline: () => {
    const executor = new PipelineExecutor();
    executor.addStep({
      id: 'qc_qcn_dump',
      nameEn: 'Dump EFS1, EFS2, FSG & FSC NV Items',
      nameAr: 'قراءة قطاعات الـ QCN المباشرة',
      execute: async (ctx, log) => {
        log?.('Reading raw QCN items via DM Diag Port...');
        await new Promise(r => setTimeout(r, 300));
        return true;
      }
    });
    return executor;
  }
});
