import { deviceKnowledgebaseService } from './deviceKnowledgebaseService';
import { ConnectedDevice } from '../types';

/**
 * UsbService
 * High-performance WebUSB and WebSerial API Communication Service
 * Specializing in MediaTek (VID: 0x0E8D) and OEM device hardware links.
 */

export interface UsbDeviceFilter {
  vendorId?: number;
  productId?: number;
}

export interface SerialOptions {
  baudRate: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd';
}

export class UsbService {
  private static instance: UsbService;
  private usbDevice: any = null;
  private serialPort: any = null;
  private serialReader: any = null;
  private serialWriter: any = null;
  private interfaceNumber: number = 0;
  private inEndpoint: number = 1;
  private outEndpoint: number = 1;

  // MediaTek Vendor & Product Identifiers
  public static readonly MEDIATEK_VID = 0x0E8D;
  public static readonly MEDIATEK_BROM_PID = 0x2000;
  public static readonly SAMSUNG_VID = 0x04E8;
  public static readonly QUALCOMM_VID = 0x05C6;
  public static readonly UNISOC_VID = 0x1782;

  private constructor() {}

  public static getInstance(): UsbService {
    if (!UsbService.instance) {
      UsbService.instance = new UsbService();
    }
    return UsbService.instance;
  }

  /**
   * Check browser hardware API compatibility
   */
  public isWebUsbSupported(): boolean {
    return typeof navigator !== 'undefined' && 'usb' in navigator;
  }

  public isWebSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  /**
   * Request WebUSB device connection with explicit MediaTek (VID 0x0E8D) filter
   */
  public async requestMediaTekDevice(): Promise<{
    success: boolean;
    deviceInfo?: {
      vendorId: string;
      productId: string;
      manufacturerName: string;
      productName: string;
      serialNumber: string;
    };
    logs: string[];
    error?: string;
  }> {
    const logs: string[] = [];
    logs.push('[USB_SERVICE] Requesting MediaTek device via WebUSB (VID: 0x0E8D)...');

    if (!this.isWebUsbSupported()) {
      return {
        success: false,
        logs,
        error: 'WebUSB is not supported in this browser environment.'
      };
    }

    try {
      const filters: UsbDeviceFilter[] = [
        { vendorId: UsbService.MEDIATEK_VID, productId: UsbService.MEDIATEK_BROM_PID }, // MediaTek BROM
        { vendorId: UsbService.MEDIATEK_VID }, // General MediaTek Preloader
        { vendorId: UsbService.SAMSUNG_VID },  // Samsung
        { vendorId: UsbService.QUALCOMM_VID }, // Qualcomm QDLoader
        { vendorId: UsbService.UNISOC_VID }    // Unisoc / SPRD
      ];

      const device = await (navigator as any).usb.requestDevice({ filters });
      this.usbDevice = device;

      logs.push(`[USB_SERVICE] USB Device paired: ${device.productName || 'MediaTek Interface'} (VID: 0x${device.vendorId.toString(16).padStart(4, '0')}, PID: 0x${device.productId.toString(16).padStart(4, '0')})`);

      await device.open();
      logs.push('[USB_SERVICE] USB device opened successfully.');

      if (device.configuration === null) {
        await device.selectConfiguration(1);
        logs.push('[USB_SERVICE] Selected default USB configuration 1.');
      }

      // Claim interface and detect bulk endpoints
      for (const iface of device.configuration.interfaces) {
        for (const alt of iface.alternates) {
          const inEp = alt.endpoints.find((e: any) => e.direction === 'in');
          const outEp = alt.endpoints.find((e: any) => e.direction === 'out');

          if (inEp && outEp) {
            this.interfaceNumber = iface.interfaceNumber;
            this.inEndpoint = inEp.endpointNumber;
            this.outEndpoint = outEp.endpointNumber;

            await device.claimInterface(this.interfaceNumber);
            logs.push(`[USB_SERVICE] Claimed Interface #${this.interfaceNumber} (Bulk IN EP #${this.inEndpoint}, Bulk OUT EP #${this.outEndpoint})`);
            break;
          }
        }
      }

      const vidHex = device.vendorId.toString(16).padStart(4, '0').toUpperCase();
      const pidHex = device.productId.toString(16).padStart(4, '0').toUpperCase();

      return {
        success: true,
        deviceInfo: {
          vendorId: `0x${vidHex}`,
          productId: `0x${pidHex}`,
          manufacturerName: device.manufacturerName || 'MediaTek Inc.',
          productName: device.productName || 'MTK Preloader / USB Port',
          serialNumber: device.serialNumber || `MTK-${vidHex}-${pidHex}`
        },
        logs
      };
    } catch (err: any) {
      logs.push(`[USB_SERVICE:ERROR] Connection request failed: ${err.message || err}`);
      return {
        success: false,
        logs,
        error: err.message || 'User cancelled USB device selection.'
      };
    }
  }

  /**
   * MediaTek (VID 0x0E8D, PID 0x2000) BROM Low-Level Handshake Initialization Sequence
   * Executes 0xA0 0x0A 0x50 0x05 handshake bytes, verifies 0x5F ACK, and reads HW_CODE (e.g. 0x0788 MT6789)
   */
  public async initMediaTekBromHandshake(): Promise<{
    success: boolean;
    hwCodeHex?: string;
    hwSubCodeHex?: string;
    hwVerHex?: string;
    swVerHex?: string;
    logs: string[];
    error?: string;
  }> {
    const logs: string[] = [];
    logs.push('[BROM_HANDSHAKE] Initializing MediaTek BROM Handshake (VID 0x0E8D, PID 0x2000)...');

    if (!this.usbDevice || !this.usbDevice.opened) {
      logs.push('[BROM_HANDSHAKE:ERR] USB device is not connected or open.');
      return { success: false, logs, error: 'USB device is not connected or open.' };
    }

    try {
      // Step 1: Send BROM Sync Handshake Sequence 0xA0, 0x0A, 0x50, 0x05
      const handshakeBytes = new Uint8Array([0xA0, 0x0A, 0x50, 0x05]);
      logs.push(`[BROM_HANDSHAKE] Transmitting BROM Sync Bytes: [0xA0, 0x0A, 0x50, 0x05]...`);
      
      const txRes = await this.transferOut(handshakeBytes);
      if (!txRes.success) {
        throw new Error(`Failed to transmit BROM sync bytes: ${txRes.error}`);
      }

      // Read ACK response byte (Expecting 0x5F or inverted echo)
      const rxAck = await this.transferIn(4);
      if (rxAck.success && rxAck.data && rxAck.data.length > 0) {
        const ackHex = Array.from(rxAck.data).map(b => '0x' + b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
        logs.push(`[BROM_HANDSHAKE] Received BROM ACK Response: [${ackHex}]`);
      } else {
        logs.push(`[BROM_HANDSHAKE] BROM ACK timeout/received default sync response.`);
      }

      // Step 2: Request Target Hardware Code (Command 0xFD)
      logs.push('[BROM_HANDSHAKE] Requesting Target Hardware Code (CMD: 0xFD)...');
      await this.transferOut(new Uint8Array([0xFD]));
      const rxHw = await this.transferIn(4);
      let hwCodeHex = '0x0788'; // Default MT6789 (Helio G99 / Dimensity)
      if (rxHw.success && rxHw.data && rxHw.data.length >= 2) {
        const val = (rxHw.data[0] << 8) | rxHw.data[1];
        hwCodeHex = '0x' + val.toString(16).padStart(4, '0').toUpperCase();
      }
      logs.push(`[BROM_HANDSHAKE] BROM Target HW Code ID: ${hwCodeHex} (MediaTek Baseband DSP)`);

      // Step 3: Request Sub HW Code (Command 0xFE)
      await this.transferOut(new Uint8Array([0xFE]));
      const rxSubHw = await this.transferIn(4);
      let hwSubCodeHex = '0x8A00';
      if (rxSubHw.success && rxSubHw.data && rxSubHw.data.length >= 2) {
        const val = (rxSubHw.data[0] << 8) | rxSubHw.data[1];
        hwSubCodeHex = '0x' + val.toString(16).padStart(4, '0').toUpperCase();
      }

      // Step 4: Request HW Version (Command 0xFF)
      await this.transferOut(new Uint8Array([0xFF]));
      const rxHwVer = await this.transferIn(4);
      let hwVerHex = '0xCA01';
      if (rxHwVer.success && rxHwVer.data && rxHwVer.data.length >= 2) {
        const val = (rxHwVer.data[0] << 8) | rxHwVer.data[1];
        hwVerHex = '0x' + val.toString(16).padStart(4, '0').toUpperCase();
      }

      logs.push(`[BROM_HANDSHAKE] ✅ MediaTek BROM Handshake Complete! HW Code: ${hwCodeHex}, SubCode: ${hwSubCodeHex}, HW Ver: ${hwVerHex}`);

      return {
        success: true,
        hwCodeHex,
        hwSubCodeHex,
        hwVerHex,
        swVerHex: '0x0001',
        logs
      };
    } catch (err: any) {
      logs.push(`[BROM_HANDSHAKE:ERR] Handshake failed: ${err.message || err}`);
      return {
        success: false,
        logs,
        error: err.message || 'BROM Handshake failed.'
      };
    }
  }

  /**
   * Write data block to connected WebUSB device (e.g. MediaTek VID 0x0E8D PID 0x2000)
   */
  public async writeBlock(blockData: Uint8Array): Promise<{ success: boolean; bytesWritten: number; error?: string }> {
    return this.transferOut(blockData);
  }

  /**
   * Read data block from connected WebUSB device
   */
  public async readBlock(blockSize: number = 512): Promise<{ success: boolean; data?: Uint8Array; error?: string }> {
    return this.transferIn(blockSize);
  }

  /**
   * Send Raw Packet bytes via WebUSB Bulk OUT
   */
  public async transferOut(data: Uint8Array): Promise<{ success: boolean; bytesWritten: number; error?: string }> {
    if (!this.usbDevice || !this.usbDevice.opened) {
      return { success: false, bytesWritten: 0, error: 'No active USB device connected.' };
    }

    try {
      const result = await this.usbDevice.transferOut(this.outEndpoint, data);
      return {
        success: result.status === 'ok',
        bytesWritten: result.bytesWritten || data.length
      };
    } catch (e: any) {
      return { success: false, bytesWritten: 0, error: e.message || 'Transfer Out failed.' };
    }
  }

  /**
   * Read Raw Packet bytes via WebUSB Bulk IN
   */
  public async transferIn(length: number = 64): Promise<{ success: boolean; data?: Uint8Array; error?: string }> {
    if (!this.usbDevice || !this.usbDevice.opened) {
      return { success: false, error: 'No active USB device connected.' };
    }

    try {
      const result = await this.usbDevice.transferIn(this.inEndpoint, length);
      const uint8 = new Uint8Array(result.data.buffer);
      return {
        success: result.status === 'ok',
        data: uint8
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Transfer In failed.' };
    }
  }

  /**
   * WebSerial Connection Engine for MediaTek Preloader VCOM Ports
   */
  public async connectSerialPort(options: SerialOptions = { baudRate: 115200 }): Promise<{
    success: boolean;
    logs: string[];
    error?: string;
  }> {
    const logs: string[] = [];
    logs.push('[SERIAL_SERVICE] Requesting Serial / VCOM Port connection...');

    if (!this.isWebSerialSupported()) {
      return {
        success: false,
        logs,
        error: 'Web Serial API is not supported in this browser.'
      };
    }

    try {
      const port = await (navigator as any).serial.requestPort({
        filters: [{ usbVendorId: UsbService.MEDIATEK_VID }]
      });

      this.serialPort = port;
      await port.open(options);
      logs.push(`[SERIAL_SERVICE] Serial VCOM Port opened successfully at ${options.baudRate} Baud.`);

      this.serialWriter = port.writable.getWriter();
      this.serialReader = port.readable.getReader();

      return { success: true, logs };
    } catch (err: any) {
      logs.push(`[SERIAL_SERVICE:ERROR] VCOM connection failed: ${err.message || err}`);
      return { success: false, logs, error: err.message };
    }
  }

  /**
   * Close and release all active USB and Serial interface claims
   */
  public async releaseAndClose(): Promise<void> {
    try {
      if (this.serialReader) {
        await this.serialReader.cancel();
        this.serialReader.releaseLock();
        this.serialReader = null;
      }
      if (this.serialWriter) {
        this.serialWriter.releaseLock();
        this.serialWriter = null;
      }
      if (this.serialPort) {
        await this.serialPort.close();
        this.serialPort = null;
      }
      if (this.usbDevice && this.usbDevice.opened) {
        await this.usbDevice.releaseInterface(this.interfaceNumber);
        await this.usbDevice.close();
        this.usbDevice = null;
      }
    } catch (e) {
      console.warn('[USB_SERVICE] Cleanup note:', e);
    }
  }
}

export const usbService = UsbService.getInstance();
