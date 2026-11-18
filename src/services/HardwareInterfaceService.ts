/**
 * HardwareInterfaceService - Manages browser-native hardware interfacing 
 * via WebUSB and WebSerial APIs, establishing the foundational low-level 
 * connection layer and providing a standardized base class for workstation 
 * protocol engines.
 * 
 * Supports low-level endpoints for:
 * - MediaTek BootROM (BROM) & Preloader
 * - Qualcomm EDL 9008 (Emergency Download)
 * - Samsung Odin Loke Protocol
 * - Android Fastboot / FastbootD
 * - Modem AT Commands & UART Serial Bridges
 */

import { ConnectedDevice } from '../types';
import { deviceKnowledgebaseService } from './deviceKnowledgebaseService';
import { nexusEventBus } from './NexusEcosystemEngine';
import { realUsbService } from './realUsbService';

export type HardwareProtocolType = 
  | 'FASTBOOT' 
  | 'ODIN_LOKE' 
  | 'MTK_BROM' 
  | 'MTK_PRELOADER' 
  | 'EDL_9008' 
  | 'ADB' 
  | 'DFU' 
  | 'UART_AT' 
  | 'GENERIC';

export interface HardwareEndpointInfo {
  in: number[];
  out: number[];
}

export interface HardwareDeviceDetails {
  id: string;
  name: string;
  type: 'USB' | 'SERIAL';
  productId: string;
  vendorId: string;
  connected: boolean;
  protocol?: HardwareProtocolType;
  manufacturerName?: string;
  serialNumber?: string;
  endpoints?: HardwareEndpointInfo;
}

export type ProtocolLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';
export type ProtocolLogCallback = (message: string, level: ProtocolLogLevel) => void;
export type ProtocolProgressCallback = (percentage: number, statusText: string) => void;

export interface ProtocolEngineOptions {
  vendorId?: number;
  productId?: number;
  baudRate?: number;
  timeoutMs?: number;
  onLog?: ProtocolLogCallback;
  onProgress?: ProtocolProgressCallback;
}

/**
 * Universal interface that all protocol engines implement
 */
export interface IProtocolEngine {
  readonly protocolName: string;
  readonly isConnected: boolean;
  readonly activeDevice: HardwareDeviceDetails | null;
  connect(options?: ProtocolEngineOptions): Promise<boolean>;
  disconnect(): Promise<void>;
  handshake(): Promise<boolean>;
  setLogCallback(cb: ProtocolLogCallback): void;
  setProgressCallback(cb: ProtocolProgressCallback): void;
}

/**
 * HardwareInterfaceService - Low-level physical I/O manager
 */
export class HardwareInterfaceService {
  private static instance: HardwareInterfaceService;
  private connectedUsbDevices: Map<string, any> = new Map();
  private connectedSerialPorts: Map<string, any> = new Map();

  // Known diagnostic filters for quick lookup
  public readonly KNOWN_USB_FILTERS = [
    { vendorId: 0x0E8D }, // MediaTek (BROM / Preloader / VCOM)
    { vendorId: 0x05C6 }, // Qualcomm (EDL 9008 / Diagnostics)
    { vendorId: 0x04E8 }, // Samsung Mobile (Odin / Modem)
    { vendorId: 0x18D1 }, // Google / Android (Fastboot / Recovery / ADB)
    { vendorId: 0x2717 }, // Xiaomi Inc (Fastboot / EDL)
    { vendorId: 0x22D9 }, // OPPO / OnePlus (Fastboot / Flash)
    { vendorId: 0x12D1 }, // Huawei (Fastboot / Upgrade)
    { vendorId: 0x1782 }, // Unisoc / Spreadtrum (SPD Diag)
    { vendorId: 0x05AC }  // Apple (DFU / Recovery)
  ];

  private constructor() {
    this.setupListeners();
  }

  public static getInstance(): HardwareInterfaceService {
    if (!HardwareInterfaceService.instance) {
      HardwareInterfaceService.instance = new HardwareInterfaceService();
    }
    return HardwareInterfaceService.instance;
  }

  /**
   * Checks browser compatibility for WebUSB API
   */
  public isWebUsbSupported(): boolean {
    return typeof navigator !== 'undefined' && 'usb' in navigator;
  }

  /**
   * Checks browser compatibility for WebSerial API
   */
  public isWebSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  /**
   * Listen to browser-native connection/disconnection events and publish to workstation ecosystem
   */
  private setupListeners(): void {
    if (this.isWebUsbSupported()) {
      (navigator as any).usb.addEventListener('connect', (event: any) => {
        console.log('[HardwareService] WebUSB device connected:', event.device);
        const vidHex = (event.device.vendorId || 0).toString(16).padStart(4, '0').toUpperCase();
        const pidHex = (event.device.productId || 0).toString(16).padStart(4, '0').toUpperCase();

        realUsbService.playContinuityBeep(120, 2400);

        try {
          const autoDev = deviceKnowledgebaseService.identifyAndProfileHardware(
            vidHex,
            pidHex,
            event.device.manufacturerName || 'Target Manufacturer',
            event.device.productName || 'Target Device',
            event.device.serialNumber || `USB-${vidHex}-${pidHex}`
          );

          nexusEventBus.publish('USB_DEVICE_CONNECTED', 'HARDWARE_PROGRAMMER', {
            vid: event.device.vendorId,
            pid: event.device.productId,
            mode: autoDev.mode,
            status: 'SUCCESS'
          });
        } catch {}
      });

      (navigator as any).usb.addEventListener('disconnect', (event: any) => {
        console.log('[HardwareService] WebUSB device disconnected:', event.device);
        const devId = `${event.device.vendorId}-${event.device.productId}`;
        this.connectedUsbDevices.delete(devId);

        realUsbService.playContinuityBeep(80, 1800);

        nexusEventBus.publish('USB_DEVICE_DISCONNECTED', 'HARDWARE_PROGRAMMER', {
          vid: event.device.vendorId,
          pid: event.device.productId,
          status: 'SUCCESS'
        });
      });
    }
  }

  /**
   * Converts low-level HardwareDeviceDetails into workstation ConnectedDevice
   */
  public convertToConnectedDevice(hwDetails: HardwareDeviceDetails): ConnectedDevice {
    const vidHex = hwDetails.vendorId.replace('0x', '').toUpperCase();
    const pidHex = hwDetails.productId.replace('0x', '').toUpperCase();

    return deviceKnowledgebaseService.identifyAndProfileHardware(
      vidHex,
      pidHex,
      hwDetails.manufacturerName || 'Connected OEM Target',
      hwDetails.name || 'Universal USB Diagnostic Device',
      hwDetails.serialNumber || `SN-${vidHex}-${pidHex}`
    );
  }

  /**
   * Prompts browser WebUSB selector, connects, and pairs target directly into workstation ecosystem
   */
  public async pairAndSyncWorkstationDevice(vendorId?: number): Promise<ConnectedDevice | null> {
    try {
      const hwDev = await this.requestUsbDevice(vendorId);
      const workstationDev = this.convertToConnectedDevice(hwDev);

      realUsbService.playContinuityBeep(240, 2600);
      nexusEventBus.publish('USB_DEVICE_CONNECTED', 'HARDWARE_PROGRAMMER', {
        vid: parseInt(hwDev.vendorId, 16),
        pid: parseInt(hwDev.productId, 16),
        mode: workstationDev.mode,
        status: 'SUCCESS'
      });

      return workstationDev;
    } catch (err) {
      console.warn('[HardwareService] pairAndSyncWorkstationDevice cancelled or failed:', err);
      return null;
    }
  }

  /**
   * Resolves appropriate protocol engine for a workstation ConnectedDevice
   */
  public getProtocolEngineForDevice(device: ConnectedDevice): BaseProtocolEngine | null {
    const mode = (device.mode || '').toUpperCase();

    if (mode.includes('FASTBOOT') || mode.includes('BOOTLOADER')) {
      return new FastbootProtocolEngine();
    }
    if (mode.includes('MODEM') || mode.includes('COM') || mode.includes('UART') || mode.includes('DIAG')) {
      return new SerialAtProtocolEngine();
    }
    return null;
  }

  /**
   * Identifies the protocol family based on Vendor & Product IDs
   */
  public detectTargetProtocol(vendorId: number, productId: number): HardwareProtocolType {
    if (vendorId === 0x0E8D) {
      if (productId === 0x0003) return 'MTK_BROM';
      if (productId === 0x2000) return 'MTK_PRELOADER';
      return 'MTK_BROM';
    }
    if (vendorId === 0x05C6 && productId === 0x9008) {
      return 'EDL_9008';
    }
    if (vendorId === 0x04E8 && (productId === 0x685D || productId === 0x6860)) {
      return 'ODIN_LOKE';
    }
    if (productId === 0x4EE0 || productId === 0xD00D || productId === 0x0D02) {
      return 'FASTBOOT';
    }
    if (vendorId === 0x05AC && (productId === 0x1227 || productId === 0x1281)) {
      return 'DFU';
    }
    return 'GENERIC';
  }

  /**
   * Requests connection to a physical USB device (e.g. MediaTek BROM / Odin Loke / Fastboot)
   */
  public async requestUsbDevice(vendorId?: number): Promise<HardwareDeviceDetails> {
    if (!this.isWebUsbSupported()) {
      throw new Error('WebUSB is not supported on this browser. Please use Chrome, Edge, or Opera.');
    }

    const filters = vendorId ? [{ vendorId }] : this.KNOWN_USB_FILTERS;
    
    try {
      const device = await (navigator as any).usb.requestDevice({ filters });
      
      // Open communication channel
      await device.open();
      
      // Select configuration (standard 1)
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      
      // Claim interface (standard 0)
      if (device.configuration && device.configuration.interfaces.length > 0) {
        const interfaceNumber = device.configuration.interfaces[0].interfaceNumber;
        await device.claimInterface(interfaceNumber);
      }

      const endpoints: HardwareEndpointInfo = { in: [], out: [] };
      if (device.configuration?.interfaces?.[0]?.alternate?.endpoints) {
        for (const ep of device.configuration.interfaces[0].alternate.endpoints) {
          if (ep.direction === 'in') {
            endpoints.in.push(ep.endpointNumber);
          } else if (ep.direction === 'out') {
            endpoints.out.push(ep.endpointNumber);
          }
        }
      }

      const devId = `${device.vendorId}-${device.productId}`;
      this.connectedUsbDevices.set(devId, device);

      const protocol = this.detectTargetProtocol(device.vendorId, device.productId);

      return {
        id: devId,
        name: device.productName || 'USB Diagnostic Device',
        type: 'USB',
        productId: `0x${device.productId.toString(16).toUpperCase().padStart(4, '0')}`,
        vendorId: `0x${device.vendorId.toString(16).toUpperCase().padStart(4, '0')}`,
        connected: true,
        protocol,
        manufacturerName: device.manufacturerName,
        serialNumber: device.serialNumber,
        endpoints
      };
    } catch (e: any) {
      console.error('[HardwareService:USB] Connection failed:', e);
      throw e;
    }
  }

  /**
   * Requests connection to a physical Serial/COM port (e.g. UART / PL2303 / FTDI / Modem AT)
   */
  public async requestSerialPort(baudRate: number = 115200): Promise<HardwareDeviceDetails> {
    if (!this.isWebSerialSupported()) {
      throw new Error('WebSerial is not supported on this browser. Please use Chrome, Edge, or Opera.');
    }

    try {
      const port = await (navigator as any).serial.requestPort();
      
      // Open with defined baud rate
      await port.open({ baudRate });
      
      const portId = `COM_${Math.floor(Math.random() * 900 + 100)}`;
      this.connectedSerialPorts.set(portId, port);

      const info = port.getInfo();

      return {
        id: portId,
        name: `Serial Device (Baud: ${baudRate})`,
        type: 'SERIAL',
        productId: info.usbProductId ? `0x${info.usbProductId.toString(16).toUpperCase().padStart(4, '0')}` : 'N/A',
        vendorId: info.usbVendorId ? `0x${info.usbVendorId.toString(16).toUpperCase().padStart(4, '0')}` : 'N/A',
        connected: true,
        protocol: 'UART_AT'
      };
    } catch (e: any) {
      console.error('[HardwareService:Serial] Connection failed:', e);
      throw e;
    }
  }

  /**
   * Write data to WebUSB Endpoint
   */
  public async writeUsbBulk(
    deviceId: string, 
    endpointNumber: number, 
    data: Uint8Array
  ): Promise<any> {
    const device = this.connectedUsbDevices.get(deviceId);
    if (!device) {
      throw new Error(`Device [${deviceId}] is not connected or active.`);
    }
    return await device.transferOut(endpointNumber, data);
  }

  /**
   * Read data from WebUSB Endpoint
   */
  public async readUsbBulk(
    deviceId: string, 
    endpointNumber: number, 
    length: number
  ): Promise<Uint8Array> {
    const device = this.connectedUsbDevices.get(deviceId);
    if (!device) {
      throw new Error(`Device [${deviceId}] is not connected or active.`);
    }
    const result = await device.transferIn(endpointNumber, length);
    return new Uint8Array(result.data.buffer);
  }

  /**
   * Execute standard USB Control Transfer Out
   */
  public async controlTransferOut(
    deviceId: string,
    setup: {
      requestType: 'standard' | 'class' | 'vendor';
      recipient: 'device' | 'interface' | 'endpoint' | 'other';
      request: number;
      value: number;
      index: number;
    },
    data?: Uint8Array
  ): Promise<any> {
    const device = this.connectedUsbDevices.get(deviceId);
    if (!device) {
      throw new Error(`Device [${deviceId}] is not connected.`);
    }
    return await device.controlTransferOut(setup, data);
  }

  /**
   * Execute standard USB Control Transfer In
   */
  public async controlTransferIn(
    deviceId: string,
    setup: {
      requestType: 'standard' | 'class' | 'vendor';
      recipient: 'device' | 'interface' | 'endpoint' | 'other';
      request: number;
      value: number;
      index: number;
    },
    length: number
  ): Promise<Uint8Array> {
    const device = this.connectedUsbDevices.get(deviceId);
    if (!device) {
      throw new Error(`Device [${deviceId}] is not connected.`);
    }
    const result = await device.controlTransferIn(setup, length);
    return new Uint8Array(result.data.buffer);
  }

  /**
   * Write data to WebSerial Port
   */
  public async writeSerial(portId: string, data: Uint8Array): Promise<void> {
    const port = this.connectedSerialPorts.get(portId);
    if (!port || !port.writable) {
      throw new Error(`Serial Port [${portId}] is not active or writable.`);
    }
    const writer = port.writable.getWriter();
    await writer.write(data);
    writer.releaseLock();
  }

  /**
   * Sends an AT command string over Serial and awaits string response
   */
  public async executeAtCommand(portId: string, command: string, timeoutMs: number = 3000): Promise<string> {
    const port = this.connectedSerialPorts.get(portId);
    if (!port || !port.writable || !port.readable) {
      throw new Error(`Serial Port [${portId}] is not ready.`);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const writer = port.writable.getWriter();
    await writer.write(encoder.encode(command.endsWith('\r\n') ? command : `${command}\r\n`));
    writer.releaseLock();

    const reader = port.readable.getReader();
    let accumulated = '';
    const start = Date.now();

    try {
      while (Date.now() - start < timeoutMs) {
        const { value, done } = await Promise.race([
          reader.read(),
          new Promise<{ value: undefined; done: true }>((r) => 
            setTimeout(() => r({ value: undefined, done: true }), timeoutMs)
          )
        ]);

        if (done || !value) break;
        accumulated += decoder.decode(value);
        if (accumulated.includes('OK') || accumulated.includes('ERROR')) {
          break;
        }
      }
    } finally {
      reader.releaseLock();
    }

    return accumulated;
  }

  /**
   * Get all actively connected USB and Serial device records
   */
  public getConnectedDevices(): HardwareDeviceDetails[] {
    const list: HardwareDeviceDetails[] = [];

    for (const [id, dev] of this.connectedUsbDevices.entries()) {
      list.push({
        id,
        name: dev.productName || 'USB Connected Device',
        type: 'USB',
        productId: `0x${dev.productId.toString(16).toUpperCase().padStart(4, '0')}`,
        vendorId: `0x${dev.vendorId.toString(16).toUpperCase().padStart(4, '0')}`,
        connected: true,
        protocol: this.detectTargetProtocol(dev.vendorId, dev.productId)
      });
    }

    for (const [id] of this.connectedSerialPorts.entries()) {
      list.push({
        id,
        name: `Serial COM Device (${id})`,
        type: 'SERIAL',
        productId: 'N/A',
        vendorId: 'N/A',
        connected: true,
        protocol: 'UART_AT'
      });
    }

    return list;
  }

  /**
   * Release and close a specific physical connection
   */
  public async closeDevice(deviceId: string): Promise<void> {
    const usbDev = this.connectedUsbDevices.get(deviceId);
    if (usbDev) {
      try {
        await usbDev.close();
      } catch {}
      this.connectedUsbDevices.delete(deviceId);
      return;
    }

    const serialPort = this.connectedSerialPorts.get(deviceId);
    if (serialPort) {
      try {
        await serialPort.close();
      } catch {}
      this.connectedSerialPorts.delete(deviceId);
    }
  }

  /**
   * Release and close all physical connections
   */
  public async closeAll(): Promise<void> {
    for (const [id, device] of this.connectedUsbDevices.entries()) {
      try {
        await device.close();
      } catch {}
    }
    this.connectedUsbDevices.clear();

    for (const [id, port] of this.connectedSerialPorts.entries()) {
      try {
        await port.close();
      } catch {}
    }
    this.connectedSerialPorts.clear();
    console.log('[HardwareService] All physical USB/Serial interfaces released.');
  }
}

export const hardwareInterfaceService = HardwareInterfaceService.getInstance();

/**
 * Standardized Base Class for the Workstation's Protocol Engines.
 * 
 * Provides unified abstractions for:
 * - Connection lifecycle (connect, handshake, disconnect)
 * - Low-level USB Bulk & Control I/O
 * - Low-level Serial/UART I/O & AT commands
 * - Structured logging & progress reporting
 * - Timeout handling and packet assembly
 */
export abstract class BaseProtocolEngine implements IProtocolEngine {
  public abstract readonly protocolName: string;

  protected hardwareService: HardwareInterfaceService = HardwareInterfaceService.getInstance();
  protected _activeDevice: HardwareDeviceDetails | null = null;
  protected _isConnected: boolean = false;
  protected logCallback?: ProtocolLogCallback;
  protected progressCallback?: ProtocolProgressCallback;
  protected defaultTimeoutMs: number = 5000;

  public get isConnected(): boolean {
    return this._isConnected && this._activeDevice !== null;
  }

  public get activeDevice(): HardwareDeviceDetails | null {
    return this._activeDevice;
  }

  public setLogCallback(cb: ProtocolLogCallback): void {
    this.logCallback = cb;
  }

  public setProgressCallback(cb: ProtocolProgressCallback): void {
    this.progressCallback = cb;
  }

  /**
   * Dispatches a structured log message
   */
  protected log(message: string, level: ProtocolLogLevel = 'info'): void {
    const formatted = `[${this.protocolName}] ${message}`;
    if (this.logCallback) {
      this.logCallback(formatted, level);
    } else {
      if (level === 'error') console.error(formatted);
      else if (level === 'warn') console.warn(formatted);
      else console.log(formatted);
    }
  }

  /**
   * Dispatches a percentage progress update
   */
  protected reportProgress(percentage: number, statusText: string): void {
    const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
    if (this.progressCallback) {
      this.progressCallback(clamped, statusText);
    }
  }

  /**
   * Connect to the target device via USB or Serial.
   */
  public abstract connect(options?: ProtocolEngineOptions): Promise<boolean>;

  /**
   * Execute initial protocol handshake / challenge-response.
   */
  public abstract handshake(): Promise<boolean>;

  /**
   * Safely terminate the protocol session and close interfaces.
   */
  public async disconnect(): Promise<void> {
    if (this._activeDevice) {
      this.log(`Terminating connection for ${this._activeDevice.id}...`, 'info');
      try {
        await this.hardwareService.closeDevice(this._activeDevice.id);
      } catch (err: any) {
        this.log(`Error during disconnect: ${err?.message || err}`, 'warn');
      }
      this._activeDevice = null;
    }
    this._isConnected = false;
    this.reportProgress(0, 'Disconnected');
    this.log('Session closed successfully.', 'success');
  }

  /**
   * Helper: Write bulk data to primary OUT endpoint
   */
  protected async writeBulk(data: Uint8Array, endpointIndex?: number): Promise<any> {
    if (!this._activeDevice) {
      throw new Error(`[${this.protocolName}] Cannot write: device is not connected.`);
    }
    const ep = endpointIndex ?? this._activeDevice.endpoints?.out?.[0] ?? 1;
    return await this.hardwareService.writeUsbBulk(this._activeDevice.id, ep, data);
  }

  /**
   * Helper: Read bulk data from primary IN endpoint
   */
  protected async readBulk(length: number, endpointIndex?: number): Promise<Uint8Array> {
    if (!this._activeDevice) {
      throw new Error(`[${this.protocolName}] Cannot read: device is not connected.`);
    }
    const ep = endpointIndex ?? this._activeDevice.endpoints?.in?.[0] ?? 1;
    return await this.hardwareService.readUsbBulk(this._activeDevice.id, ep, length);
  }

  /**
   * Helper: Send serial bytes
   */
  protected async writeSerial(data: Uint8Array): Promise<void> {
    if (!this._activeDevice) {
      throw new Error(`[${this.protocolName}] Cannot write serial: device is not connected.`);
    }
    return await this.hardwareService.writeSerial(this._activeDevice.id, data);
  }

  /**
   * Helper: Execute AT command string over serial interface
   */
  protected async executeAt(command: string, timeoutMs?: number): Promise<string> {
    if (!this._activeDevice) {
      throw new Error(`[${this.protocolName}] Cannot execute AT: device is not connected.`);
    }
    return await this.hardwareService.executeAtCommand(
      this._activeDevice.id, 
      command, 
      timeoutMs ?? this.defaultTimeoutMs
    );
  }

  /**
   * Utility: Sleep for specified milliseconds
   */
  protected async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Utility: Convert buffer to hex string for packet debugging
   */
  protected toHexString(bytes: Uint8Array, maxBytes: number = 32): string {
    const slice = bytes.slice(0, maxBytes);
    const hex = Array.from(slice).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
    return bytes.length > maxBytes ? `${hex} ... (${bytes.length} bytes)` : hex;
  }
}

/**
 * Concrete Implementation: Serial AT Commands Protocol Engine
 */
export class SerialAtProtocolEngine extends BaseProtocolEngine {
  public readonly protocolName: string = 'Serial-AT';

  public async connect(options?: ProtocolEngineOptions): Promise<boolean> {
    try {
      this.log('Requesting serial COM port for modem communication...', 'info');
      const dev = await this.hardwareService.requestSerialPort(options?.baudRate ?? 115200);
      this._activeDevice = dev;
      this._isConnected = true;
      this.log(`Serial port connected: ${dev.id} [Baud: ${options?.baudRate ?? 115200}]`, 'success');
      return true;
    } catch (e: any) {
      this.log(`Failed to connect serial port: ${e.message}`, 'error');
      return false;
    }
  }

  public async handshake(): Promise<boolean> {
    this.log('Sending AT probe...', 'info');
    try {
      const response = await this.executeAt('AT');
      const isOk = response.includes('OK');
      if (isOk) {
        this.log('Modem handshake verified: OK', 'success');
      } else {
        this.log(`Unexpected handshake response: ${response}`, 'warn');
      }
      return isOk;
    } catch (e: any) {
      this.log(`Handshake failed: ${e.message}`, 'error');
      return false;
    }
  }

  public async queryDeviceIdentity(): Promise<{ manufacturer: string; model: string; imei: string }> {
    const mfg = (await this.executeAt('AT+GMI')).replace(/[\r\n]|OK/g, '').trim();
    const model = (await this.executeAt('AT+GMM')).replace(/[\r\n]|OK/g, '').trim();
    const imei = (await this.executeAt('AT+GSN')).replace(/[\r\n]|OK/g, '').trim();
    return { manufacturer: mfg || 'Unknown', model: model || 'Unknown', imei: imei || 'Unknown' };
  }
}

/**
 * Concrete Implementation: Fastboot Protocol Engine
 */
export class FastbootProtocolEngine extends BaseProtocolEngine {
  public readonly protocolName: string = 'Android-Fastboot';

  public async connect(options?: ProtocolEngineOptions): Promise<boolean> {
    try {
      this.log('Requesting USB Fastboot device (VID: 0x18D1 / 0x2717)...', 'info');
      const dev = await this.hardwareService.requestUsbDevice(options?.vendorId);
      this._activeDevice = dev;
      this._isConnected = true;
      this.log(`Fastboot device claimed: ${dev.name} [${dev.vendorId}:${dev.productId}]`, 'success');
      return true;
    } catch (e: any) {
      this.log(`Fastboot claim failed: ${e.message}`, 'error');
      return false;
    }
  }

  public async handshake(): Promise<boolean> {
    try {
      this.log('Sending Fastboot getvar:version handshake...', 'info');
      const res = await this.sendCommand('getvar:version');
      const ok = res.startsWith('OKAY');
      if (ok) {
        this.log(`Fastboot handshake confirmed: ${res}`, 'success');
      }
      return ok;
    } catch (e: any) {
      this.log(`Fastboot handshake error: ${e.message}`, 'error');
      return false;
    }
  }

  public async sendCommand(cmd: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    await this.writeBulk(encoder.encode(cmd));
    const responseBytes = await this.readBulk(64);
    return decoder.decode(responseBytes);
  }
}
