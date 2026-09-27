/**
 * OmniFix Pro - Core WebUSB API Hardware Bridge Service
 * Provides direct low-level WebUSB communication for flashing & service protocols:
 * - Samsung Loke / Odin Download Mode
 * - Qualcomm EDL 9008 Sahara / Firehose
 * - MediaTek BROM / Preloader
 * - Fastboot & ADB Raw Bulk Packet Streams
 */

// Explicit WebUSB API interfaces for TypeScript compatibility
export interface WebUsbDeviceFilter {
  vendorId?: number;
  productId?: number;
  classCode?: number;
  subclassCode?: number;
  protocolCode?: number;
}

export interface PacketStreamChunk {
  data: Uint8Array;
  bytesRead: number;
  status: 'OK' | 'STALL' | 'BABBLE' | 'ERROR';
  endpoint: number;
  timestamp: number;
}

export type UsbProtocolMode = 
  | 'SAMSUNG_LOKE' 
  | 'QUALCOMM_SAHARA' 
  | 'QUALCOMM_FIREHOSE' 
  | 'MTK_BROM' 
  | 'ANDROID_FASTBOOT' 
  | 'ADB_BULK' 
  | 'GENERIC_BULK';

export class USBBridge {
  private static instance: USBBridge;
  private device: any = null;
  private selectedInterfaceNumber: number = 0;
  private inEndpointNumber: number = 1;
  private outEndpointNumber: number = 2;
  private activeProtocol: UsbProtocolMode = 'GENERIC_BULK';
  private isConnected: boolean = false;
  private onLogCallback: ((level: 'info' | 'warn' | 'error' | 'tx' | 'rx', message: string) => void) | null = null;

  // Standard OEM USB Filters for Mobile Flashing Protocols
  public static readonly OEM_USB_FILTERS: WebUsbDeviceFilter[] = [
    { vendorId: 0x04e8 }, // Samsung Electronics
    { vendorId: 0x05c6 }, // Qualcomm Inc.
    { vendorId: 0x0e8d }, // MediaTek Inc.
    { vendorId: 0x18d1 }, // Google / Android (Fastboot & ADB)
    { vendorId: 0x22b8 }, // Motorola
    { vendorId: 0x2717 }, // Xiaomi / Redmi / POCO
    { vendorId: 0x1782 }, // Unisoc / Spreadtrum
    { vendorId: 0x12d1 }, // Huawei
    { vendorId: 0x2a70 }, // OnePlus
    { vendorId: 0x22d9 }, // OPPO / Realme
    { vendorId: 0x2d95 }, // vivo
    { vendorId: 0x05ac }, // Apple Inc. (DFU / Recovery)
  ];

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): USBBridge {
    if (!USBBridge.instance) {
      USBBridge.instance = new USBBridge();
    }
    return USBBridge.instance;
  }

  /**
   * Register logger callback
   */
  public setLogger(callback: (level: 'info' | 'warn' | 'error' | 'tx' | 'rx', message: string) => void): void {
    this.onLogCallback = callback;
  }

  private log(level: 'info' | 'warn' | 'error' | 'tx' | 'rx', msg: string): void {
    if (this.onLogCallback) {
      this.onLogCallback(level, msg);
    }
  }

  /**
   * Listen for system USB disconnect/connect events
   */
  private setupEventListeners(): void {
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      const usbNav = (navigator as any).usb;
      usbNav.addEventListener('disconnect', (event: any) => {
        if (this.device && this.device === event.device) {
          this.log('warn', `USB Device disconnected: ${event.device.productName || 'Unknown Mobile Device'}`);
          this.resetState();
        }
      });

      usbNav.addEventListener('connect', (event: any) => {
        this.log('info', `USB Device attached to bus: ${event.device.productName || 'New Mobile Target'}`);
      });
    }
  }

  /**
   * Request WebUSB device permission popup from user browser
   */
  public async requestDevicePermission(customFilters?: WebUsbDeviceFilter[]): Promise<{
    success: boolean;
    deviceInfo?: {
      vendorId: string;
      productId: string;
      manufacturerName: string;
      productName: string;
      serialNumber: string;
    };
    error?: string;
  }> {
    this.log('info', 'Requesting native W3C WebUSB device permissions from browser UI...');

    if (typeof navigator === 'undefined' || !('usb' in navigator)) {
      const err = 'WebUSB API is not supported in this browser. Please use Google Chrome or Microsoft Edge.';
      this.log('error', err);
      return { success: false, error: err };
    }

    try {
      const filters = customFilters || USBBridge.OEM_USB_FILTERS;
      const device = await (navigator as any).usb.requestDevice({ filters });
      
      this.device = device;
      this.log('info', `Device permission granted for: ${device.productName || 'Mobile Target'} (VID: 0x${device.vendorId.toString(16).padStart(4, '0')}, PID: 0x${device.productId.toString(16).padStart(4, '0')})`);

      return {
        success: true,
        deviceInfo: {
          vendorId: `0x${device.vendorId.toString(16).padStart(4, '0').toUpperCase()}`,
          productId: `0x${device.productId.toString(16).padStart(4, '0').toUpperCase()}`,
          manufacturerName: device.manufacturerName || 'Mobile OEM Manufacturer',
          productName: device.productName || 'Mobile Target Endpoint',
          serialNumber: device.serialNumber || 'W3C-USB-DEVICE'
        }
      };
    } catch (e: any) {
      this.log('warn', `User cancelled or WebUSB permission rejected: ${e.message}`);
      return { success: false, error: e.message };
    }
  }

  /**
   * Open connection and claim interface for specific protocol (Samsung Loke, Qualcomm EDL, Fastboot, MTK)
   */
  public async openAndClaimInterface(targetProtocol: UsbProtocolMode = 'GENERIC_BULK'): Promise<{
    success: boolean;
    claimedInterface: number;
    inEndpoint: number;
    outEndpoint: number;
    error?: string;
  }> {
    if (!this.device) {
      const err = 'No WebUSB device selected. Call requestDevicePermission first.';
      this.log('error', err);
      return { success: false, claimedInterface: 0, inEndpoint: 0, outEndpoint: 0, error: err };
    }

    try {
      if (!this.device.opened) {
        this.log('info', 'Opening hardware USB device handle...');
        await this.device.open();
      }

      this.activeProtocol = targetProtocol;

      // Select active configuration if available
      if (this.device.configuration === null) {
        this.log('info', 'Selecting USB configuration #1...');
        await this.device.selectConfiguration(1);
      }

      // Auto-detect best interface & endpoints matching requested protocol
      const endpoints = this.detectEndpointsForProtocol(targetProtocol);
      this.selectedInterfaceNumber = endpoints.interfaceNumber;
      this.inEndpointNumber = endpoints.inEndpoint;
      this.outEndpointNumber = endpoints.outEndpoint;

      this.log('info', `Claiming USB Interface #${this.selectedInterfaceNumber} (IN: Endpoint 0x${this.inEndpointNumber.toString(16).padStart(2, '0')}, OUT: Endpoint 0x${this.outEndpointNumber.toString(16).padStart(2, '0')})...`);
      
      try {
        await this.device.claimInterface(this.selectedInterfaceNumber);
      } catch (e: any) {
        this.log('warn', `Interface #${this.selectedInterfaceNumber} claim note: ${e.message}. Attempting interface #0 fallback...`);
        this.selectedInterfaceNumber = 0;
        await this.device.claimInterface(0);
      }

      this.isConnected = true;
      this.log('info', `USB Interface successfully claimed for [${targetProtocol}]! Stream pipeline active.`);

      return {
        success: true,
        claimedInterface: this.selectedInterfaceNumber,
        inEndpoint: this.inEndpointNumber,
        outEndpoint: this.outEndpointNumber
      };
    } catch (e: any) {
      this.log('error', `Failed to open or claim WebUSB interface: ${e.message}`);
      return { success: false, claimedInterface: 0, inEndpoint: 0, outEndpoint: 0, error: e.message };
    }
  }

  /**
   * Endpoint detection logic based on Vendor IDs & Mobile Protocols
   */
  private detectEndpointsForProtocol(protocol: UsbProtocolMode): {
    interfaceNumber: number;
    inEndpoint: number;
    outEndpoint: number;
  } {
    if (!this.device || !this.device.configuration) {
      return { interfaceNumber: 0, inEndpoint: 1, outEndpoint: 2 };
    }

    const interfaces = this.device.configuration.interfaces;

    for (const iface of interfaces) {
      for (const alt of iface.alternates) {
        let inEp = 0;
        let outEp = 0;

        for (const ep of alt.endpoints) {
          if (ep.direction === 'in') {
            inEp = ep.endpointNumber;
          } else if (ep.direction === 'out') {
            outEp = ep.endpointNumber;
          }
        }

        if (inEp > 0 && outEp > 0) {
          // Check protocol matches
          if (protocol === 'SAMSUNG_LOKE' && this.device.vendorId === 0x04e8) {
            return { interfaceNumber: iface.interfaceNumber, inEndpoint: inEp, outEndpoint: outEp };
          } else if ((protocol === 'QUALCOMM_SAHARA' || protocol === 'QUALCOMM_FIREHOSE') && this.device.vendorId === 0x05c6) {
            return { interfaceNumber: iface.interfaceNumber, inEndpoint: inEp, outEndpoint: outEp };
          } else if (protocol === 'MTK_BROM' && this.device.vendorId === 0x0e8d) {
            return { interfaceNumber: iface.interfaceNumber, inEndpoint: inEp, outEndpoint: outEp };
          } else if (protocol === 'ANDROID_FASTBOOT' && alt.interfaceClass === 0xff && alt.interfaceSubclass === 0x42) {
            return { interfaceNumber: iface.interfaceNumber, inEndpoint: inEp, outEndpoint: outEp };
          } else {
            return { interfaceNumber: iface.interfaceNumber, inEndpoint: inEp, outEndpoint: outEp };
          }
        }
      }
    }

    return { interfaceNumber: 0, inEndpoint: 1, outEndpoint: 2 };
  }

  /**
   * Transfer Out (TX): Send raw Uint8Array packet to device
   */
  public async transferOut(data: Uint8Array): Promise<{
    success: boolean;
    bytesWritten: number;
    status: string;
    error?: string;
  }> {
    if (!this.device || !this.isConnected) {
      return { success: false, bytesWritten: 0, status: 'error', error: 'USB device not connected or interface unclaimed' };
    }

    try {
      this.log('tx', `TX >>> [Endpoint 0x${this.outEndpointNumber.toString(16).padStart(2, '0')}] ${data.length} bytes`);
      const res = await this.device.transferOut(this.outEndpointNumber, data);
      
      return {
        success: res.status === 'ok',
        bytesWritten: res.bytesWritten || data.length,
        status: res.status
      };
    } catch (e: any) {
      this.log('error', `TX Error: ${e.message}`);
      return { success: false, bytesWritten: 0, status: 'error', error: e.message };
    }
  }

  /**
   * Transfer In (RX): Read packet buffer from IN endpoint
   */
  public async transferIn(length: number = 512): Promise<PacketStreamChunk> {
    if (!this.device || !this.isConnected) {
      return {
        data: new Uint8Array(0),
        bytesRead: 0,
        status: 'ERROR',
        endpoint: this.inEndpointNumber,
        timestamp: Date.now()
      };
    }

    try {
      const res = await this.device.transferIn(this.inEndpointNumber, length);
      const data = res.data ? new Uint8Array(res.data.buffer) : new Uint8Array(0);
      
      this.log('rx', `RX <<< [Endpoint 0x${this.inEndpointNumber.toString(16).padStart(2, '0')}] ${data.length} bytes`);

      return {
        data,
        bytesRead: data.length,
        status: res.status === 'ok' ? 'OK' : 'ERROR',
        endpoint: this.inEndpointNumber,
        timestamp: Date.now()
      };
    } catch (e: any) {
      this.log('error', `RX Error: ${e.message}`);
      return {
        data: new Uint8Array(0),
        bytesRead: 0,
        status: 'ERROR',
        endpoint: this.inEndpointNumber,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Stream-based continuous packet reader interface
   */
  public async *createPacketInputStream(chunkSize: number = 4096, maxPackets: number = 100): AsyncGenerator<PacketStreamChunk> {
    let packetCount = 0;
    while (this.isConnected && packetCount < maxPackets) {
      const chunk = await this.transferIn(chunkSize);
      if (chunk.bytesRead > 0) {
        yield chunk;
        packetCount++;
      } else {
        await new Promise(r => setTimeout(r, 10));
      }
    }
  }

  /**
   * Release interface and close connection safely
   */
  public async releaseAndClose(): Promise<void> {
    if (this.device) {
      try {
        if (this.isConnected) {
          this.log('info', `Releasing USB Interface #${this.selectedInterfaceNumber}...`);
          await this.device.releaseInterface(this.selectedInterfaceNumber);
        }
        if (this.device.opened) {
          this.log('info', 'Closing WebUSB hardware connection...');
          await this.device.close();
        }
      } catch (e: any) {
        this.log('warn', `Release note: ${e.message}`);
      }
    }
    this.resetState();
  }

  private resetState(): void {
    this.device = null;
    this.isConnected = false;
    this.selectedInterfaceNumber = 0;
    this.inEndpointNumber = 1;
    this.outEndpointNumber = 2;
    this.log('info', 'USBBridge state reset to idle.');
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public getActiveDevice(): any {
    return this.device;
  }
}

export const usbBridge = USBBridge.getInstance();
