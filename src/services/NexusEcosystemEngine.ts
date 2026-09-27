import { ConnectedDevice } from '../types';
import { realUsbService } from './realUsbService';
import { apexAgent } from './ApexAgent';

/**
 * Nexus Ecosystem Architecture - Unified Repair OS Engine
 * Centralized Event Bus (ZeroMQ / IPC / WebSocket Broadcast)
 */

export type RepairEventType =
  | 'USB_DEVICE_CONNECTED'
  | 'USB_DEVICE_DISCONNECTED'
  | 'POWER_SUPPLY_READOUT'
  | 'MEMORY_HEALTH_SCANNED'
  | 'EEPROM_CALIBRATED'
  | 'SOFTWARE_OPERATION_COMPLETED'
  | 'ANTI_BRICK_CHECKED'
  | 'THERMAL_HOTSPOT_CAPTURED'
  | 'TICKET_AUTO_UPDATED'
  | 'INVENTORY_AUTO_DEDUCTED'
  | 'CLIENT_NOTIFICATION_SENT';

export interface RepairEvent {
  id: string;
  type: RepairEventType;
  timestamp: string;
  sourceEngine: 'SOFTWARE_SECURITY' | 'HARDWARE_PROGRAMMER' | 'WORKSHOP_ERP' | 'EVENT_BUS';
  payload: {
    vid?: number;
    pid?: number;
    mode?: string;
    voltageV?: number;
    currentAmp?: number;
    isShort?: boolean;
    shortLocation?: string;
    ufsHealthPercent?: number;
    lifeUsedEmmc?: number;
    trueToneTransferred?: boolean;
    bmsHealthCalibratedPct?: number;
    taskName?: string;
    status?: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
    backupPath?: string;
    backupFiles?: string[];
    thermalTempC?: number;
    hotspotComponent?: string;
    inventoryItemSku?: string;
    inventoryItemName?: string;
    ticketId?: string;
    messageAr?: string;
    messageEn?: string;
    [key: string]: any;
  };
}

export interface MaintenanceTicket {
  ticketId: string;
  qrCodeUrl: string;
  clientName: string;
  clientPhone: string;
  deviceModel: string;
  imei: string;
  status: 'RECEIVED' | 'DIAGNOSING' | 'REPAIRING' | 'TESTING' | 'COMPLETED' | 'DELIVERED';
  hardwarePowerLogs: Array<{
    timestamp: string;
    voltageV: number;
    currentAmp: number;
    isShort: boolean;
    signature: string;
  }>;
  softwareLogs: Array<{
    timestamp: string;
    action: string;
    status: string;
    efsBackupFile?: string;
  }>;
  memoryHealthStatus: string;
  eepromStatus: string;
  thermalHotspots: Array<{
    component: string;
    tempCelsius: number;
    boardviewPin: string;
  }>;
  usedSpareParts: Array<{
    sku: string;
    nameEn: string;
    nameAr: string;
    cost: number;
  }>;
  interchangeableICMatches: Array<{
    icModel: string;
    compatibleDevices: string[];
    inStockQty: number;
  }>;
  totalCost: number;
  createdDate: string;
  lastUpdated: string;
}

export interface InventoryItem {
  sku: string;
  nameEn: string;
  nameAr: string;
  category: 'DISPLAY' | 'BATTERY' | 'POWER_IC' | 'USB_PHY' | 'MEMORY_UFS' | 'TOUCH_IC';
  stockQty: number;
  unitPrice: number;
  compatibleModels: string[];
}

export type EventBusSubscriber = (event: RepairEvent) => void;

export class UnifiedEventBusService {
  private static instance: UnifiedEventBusService;
  private subscribers: Set<EventBusSubscriber> = new Set();
  private eventHistory: RepairEvent[] = [];
  private activeTicket: MaintenanceTicket;
  private inventoryCatalog: Map<string, InventoryItem> = new Map();

  private constructor() {
    this.activeTicket = this.initDefaultTicket();
    this.initDefaultInventory();
  }

  public static getInstance(): UnifiedEventBusService {
    if (!UnifiedEventBusService.instance) {
      UnifiedEventBusService.instance = new UnifiedEventBusService();
    }
    return UnifiedEventBusService.instance;
  }

  private initDefaultTicket(): MaintenanceTicket {
    return {
      ticketId: 'TCK-2026-0982',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TCK-2026-0982',
      clientName: 'أحمد محمود العلي (Ahmed Mahmoud)',
      clientPhone: '+966 55 123 4567',
      deviceModel: 'Xiaomi Redmi Note 12 / Poco X5 5G',
      imei: '864921049281034',
      status: 'DIAGNOSING',
      hardwarePowerLogs: [
        {
          timestamp: '12:15:02',
          voltageV: 4.2,
          currentAmp: 2.85,
          isShort: true,
          signature: 'VBUS Short Circuit (Capacitive Leak C2411)'
        }
      ],
      softwareLogs: [
        {
          timestamp: '12:15:20',
          action: 'EFS & NVRAM Security Backup',
          status: 'COMPLETED',
          efsBackupFile: 'NVRAM_TCK-2026-0982_SEC_BACKUP.bin'
        }
      ],
      memoryHealthStatus: 'UFS 3.1 Health: 98% (Life Used 0-10%)',
      eepromStatus: 'TrueTone Serial Matched | BMS Battery Health: 96%',
      thermalHotspots: [
        {
          component: 'PMIC PM8350B',
          tempCelsius: 68.4,
          boardviewPin: 'U2100_VBUS_IN'
        }
      ],
      usedSpareParts: [
        {
          sku: 'IC-PM8350B-ORIG',
          nameEn: 'Qualcomm PM8350B Power IC',
          nameAr: 'آيسي باور كوالكوم PM8350B الأصلي',
          cost: 18.5
        }
      ],
      interchangeableICMatches: [
        {
          icModel: 'PM8350B',
          compatibleDevices: ['Xiaomi Redmi Note 12', 'Poco X5 5G', 'Realme GT Neo 3', 'Samsung A54 5G'],
          inStockQty: 8
        },
        {
          icModel: 'SMB1396',
          compatibleDevices: ['Xiaomi Mi 11', 'Redmi K40', 'OnePlus 9R'],
          inStockQty: 14
        }
      ],
      totalCost: 45.00,
      createdDate: new Date().toLocaleDateString(),
      lastUpdated: new Date().toLocaleTimeString()
    };
  }

  private initDefaultInventory() {
    const items: InventoryItem[] = [
      {
        sku: 'IC-PM8350B-ORIG',
        nameEn: 'Qualcomm PM8350B Power Management IC',
        nameAr: 'آيسي باور كوالكوم PM8350B الأصلي',
        category: 'POWER_IC',
        stockQty: 8,
        unitPrice: 18.50,
        compatibleModels: ['Xiaomi Redmi Note 12', 'Poco X5 5G', 'Realme GT Neo 3', 'Samsung A54 5G']
      },
      {
        sku: 'IC-SMB1396-CHARGE',
        nameEn: 'Qualcomm SMB1396 Fast Charging IC',
        nameAr: 'آيسي شحن سريع SMB1396',
        category: 'POWER_IC',
        stockQty: 14,
        unitPrice: 12.00,
        compatibleModels: ['Xiaomi Mi 11', 'Redmi K40', 'OnePlus 9R', 'Realme GT']
      },
      {
        sku: 'DISP-OLED-REDMI12',
        nameEn: 'Original AMOLED Display Assembly (120Hz)',
        nameAr: 'شاشة اموليد أصلية 120Hz ريدمي نوت 12',
        category: 'DISPLAY',
        stockQty: 5,
        unitPrice: 35.00,
        compatibleModels: ['Xiaomi Redmi Note 12 4G', 'Redmi Note 12 5G']
      },
      {
        sku: 'BATT-BM5A-5000MAH',
        nameEn: 'Original 5000mAh Battery Cell (BM5A)',
        nameAr: 'بطارية أصلية 5000mAh موديل BM5A',
        category: 'BATTERY',
        stockQty: 11,
        unitPrice: 15.00,
        compatibleModels: ['Poco X5 5G', 'Redmi Note 12 Pro']
      }
    ];

    items.forEach(item => this.inventoryCatalog.set(item.sku, item));
  }

  /**
   * Subscribe to live events on the Central Event Bus
   */
  public subscribe(callback: EventBusSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Publish an event to the Central Event Bus (IPC / ZeroMQ broadcast emulator)
   */
  public publish(type: RepairEventType, sourceEngine: RepairEvent['sourceEngine'], payload: any): RepairEvent {
    const event: RepairEvent = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      timestamp: new Date().toLocaleTimeString(),
      sourceEngine,
      payload
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 100) this.eventHistory.pop();

    // Auto-update active ticket based on Event Type
    this.processEventIntoTicket(event);

    // Notify all listeners
    this.subscribers.forEach(cb => {
      try {
        cb(event);
      } catch (err) {
        console.error('[EventBus] Subscriber error:', err);
      }
    });

    return event;
  }

  /**
   * Automatically processes events to update the Maintenance Ticket
   */
  private processEventIntoTicket(event: RepairEvent) {
    const { type, payload, timestamp } = event;

    if (type === 'POWER_SUPPLY_READOUT') {
      const logStr = `${payload.voltageV || 4.2}V / ${payload.currentAmp || 0}A (${payload.isShort ? 'SHORT DETECTED' : 'NORMAL DRAW'})`;
      this.activeTicket.hardwarePowerLogs.unshift({
        timestamp,
        voltageV: payload.voltageV || 4.2,
        currentAmp: payload.currentAmp || 0,
        isShort: !!payload.isShort,
        signature: payload.shortLocation || logStr
      });
      if (payload.isShort) {
        this.activeTicket.status = 'DIAGNOSING';
      }
    } else if (type === 'SOFTWARE_OPERATION_COMPLETED') {
      this.activeTicket.softwareLogs.unshift({
        timestamp,
        action: payload.taskName || 'Software Flash',
        status: payload.status || 'COMPLETED',
        efsBackupFile: payload.backupPath
      });
    } else if (type === 'MEMORY_HEALTH_SCANNED') {
      this.activeTicket.memoryHealthStatus = `UFS / eMMC Health: ${payload.ufsHealthPercent || 98}% (Life Used: ${payload.lifeUsedEmmc || 10}%)`;
    } else if (type === 'EEPROM_CALIBRATED') {
      this.activeTicket.eepromStatus = `TrueTone: ${payload.trueToneTransferred ? 'SYNCED' : 'PENDING'} | BMS Battery: ${payload.bmsHealthCalibratedPct || 100}%`;
    } else if (type === 'THERMAL_HOTSPOT_CAPTURED') {
      this.activeTicket.thermalHotspots.unshift({
        component: payload.hotspotComponent || 'PMIC U2100',
        tempCelsius: payload.thermalTempC || 65.0,
        boardviewPin: 'VBUS_IN'
      });
    } else if (type === 'INVENTORY_AUTO_DEDUCTED') {
      if (payload.inventoryItemSku && this.inventoryCatalog.has(payload.inventoryItemSku)) {
        const item = this.inventoryCatalog.get(payload.inventoryItemSku)!;
        if (item.stockQty > 0) {
          item.stockQty -= 1;
        }
        this.activeTicket.usedSpareParts.push({
          sku: item.sku,
          nameEn: item.nameEn,
          nameAr: item.nameAr,
          cost: item.unitPrice
        });
        this.activeTicket.totalCost += item.unitPrice;
      }
    }

    this.activeTicket.lastUpdated = new Date().toLocaleTimeString();
  }

  public getActiveTicket(): MaintenanceTicket {
    return this.activeTicket;
  }

  public getEventHistory(): RepairEvent[] {
    return this.eventHistory;
  }

  public getInventoryCatalog(): InventoryItem[] {
    return Array.from(this.inventoryCatalog.values());
  }
}

export const nexusEventBus = UnifiedEventBusService.getInstance();
