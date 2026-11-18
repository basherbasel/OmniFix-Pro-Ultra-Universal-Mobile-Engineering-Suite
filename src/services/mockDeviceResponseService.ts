import { ConnectedDevice, DeviceMode, ChipsetType } from '../types';

export interface PartitionTableItem {
  name: string;
  sizeMb: number;
  type: string;
  flashStatus: 'NORMAL' | 'PROTECTED' | 'CORRUPTED';
  essential: boolean;
}

export interface ExtendedHardwareTelemetry {
  memorySpecs: {
    technology: string; // e.g. UFS 4.0 Dual-Lane
    healthPercent: number; // e.g. 98%
    smartStatus: 'EXCELLENT' | 'NORMAL' | 'WARNING' | 'CRITICAL';
    readSpeedMb: number;
    writeSpeedMb: number;
    badSectorsCount: number;
    partitionTable: PartitionTableItem[];
  };
  securityEnclave: {
    frpStatus: 'ON' | 'OFF' | 'LOCKED';
    googleAccountBound: boolean;
    iCloudStatus: 'CLEAN' | 'LOST_MODE' | 'MDM_ENROLLED' | 'OFF';
    kgState: 'Prenormal' | 'Checking' | 'Completed' | 'Locked';
    miCloudBound: boolean;
    bootloaderState: 'LOCKED' | 'UNLOCKED' | 'RELOCKED' | 'TAMPERED';
    antiRollbackIndex: number;
    knoxWarranty: '0x0 (Valid)' | '0x1 (Tripped)';
    avbVerifiedBootState: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
    trustZoneState: 'ACTIVE_SECURE' | 'TAMPERED' | 'BYPASSED';
  };
  powerAndSensors: {
    vbusVoltageV: number;
    chargingCurrentMa: number;
    vccMainVoltageV: number;
    batteryCellMv: number;
    batteryTempC: number;
    batteryHealthPercent: number;
    batteryCycles: number;
    typeCDiodeImpedanceOhms: { dp: number; dn: number; cc1: number; cc2: number };
  };
  rfModem: {
    imei1: string;
    imei2: string;
    basebandFirmware: string;
    efsHash: string;
    simState: 'INSERTED_ACTIVE' | 'NO_SIM' | 'ESIM_PROVISIONED';
  };
}

export class MockDeviceResponseService {
  private static instance: MockDeviceResponseService;

  private constructor() {}

  public static getInstance(): MockDeviceResponseService {
    if (!MockDeviceResponseService.instance) {
      MockDeviceResponseService.instance = new MockDeviceResponseService();
    }
    return MockDeviceResponseService.instance;
  }

  /**
   * Generates comprehensive hardware and software telemetry responses for connected Android/iOS target
   */
  public generateFullTelemetryResponse(baseDevice: ConnectedDevice): ExtendedHardwareTelemetry {
    const isIos = baseDevice.chipset === 'apple_ios' || baseDevice.brand.toLowerCase().includes('apple');
    const isSamsung = baseDevice.brand.toLowerCase().includes('samsung');
    const isXiaomi = baseDevice.brand.toLowerCase().includes('xiaomi') || baseDevice.brand.toLowerCase().includes('poco') || baseDevice.brand.toLowerCase().includes('redmi');

    // 1. Memory Partition Table
    let partitions: PartitionTableItem[] = [];
    if (isIos) {
      partitions = [
        { name: 'iBoot', sizeMb: 32, type: 'Bootloader', flashStatus: 'PROTECTED', essential: true },
        { name: 'SecureEnclave', sizeMb: 64, type: 'Crypto Vault', flashStatus: 'PROTECTED', essential: true },
        { name: 'SystemOS (AP)', sizeMb: 24576, type: 'AP Flash', flashStatus: 'NORMAL', essential: true },
        { name: 'DataVolume', sizeMb: 220000, type: 'APFS Encrypted', flashStatus: 'NORMAL', essential: false },
        { name: 'SysCfg', sizeMb: 16, type: 'Hardware Serial Map', flashStatus: 'PROTECTED', essential: true },
        { name: 'BasebandFirmware', sizeMb: 128, type: 'Modem Firmware', flashStatus: 'NORMAL', essential: true },
        { name: 'NVRAM_BB', sizeMb: 16, type: 'RF Calibration', flashStatus: 'PROTECTED', essential: true }
      ];
    } else {
      partitions = [
        { name: 'boot_a', sizeMb: 64, type: 'Android Boot Kernel', flashStatus: 'NORMAL', essential: true },
        { name: 'boot_b', sizeMb: 64, type: 'Android Boot Kernel B', flashStatus: 'NORMAL', essential: true },
        { name: 'dtbo', sizeMb: 8, type: 'Device Tree Overlay', flashStatus: 'NORMAL', essential: false },
        { name: 'vbmeta', sizeMb: 4, type: 'AVB 2.0 Security Header', flashStatus: 'PROTECTED', essential: true },
        { name: 'super.img', sizeMb: 8192, type: 'Dynamic System/Vendor/Product', flashStatus: 'NORMAL', essential: true },
        { name: 'userdata', sizeMb: 230000, type: 'FBE Encrypted F2FS', flashStatus: 'NORMAL', essential: false },
        { name: 'persistent', sizeMb: 16, type: 'FRP Lock Sector', flashStatus: 'PROTECTED', essential: true },
        { name: 'frp', sizeMb: 8, type: 'Google FRP Sector', flashStatus: 'PROTECTED', essential: true },
        { name: 'efs / nvram', sizeMb: 32, type: 'Modem IMEI & Radio Calibration', flashStatus: 'PROTECTED', essential: true },
        { name: 'param', sizeMb: 16, type: 'Samsung Boot Param', flashStatus: 'NORMAL', essential: false },
        { name: 'persist', sizeMb: 64, type: 'Xiaomi Mi Account & Sensors', flashStatus: 'PROTECTED', essential: true }
      ];
    }

    // 2. Memory specs
    const tech = isIos ? 'NVMe High-Speed Bus' : (baseDevice.storageType || 'UFS 4.0 Dual-Lane');
    const readSpeed = isIos ? 4800 : (baseDevice.storageType === 'UFS 4.0' ? 4200 : 2100);
    const writeSpeed = isIos ? 3200 : (baseDevice.storageType === 'UFS 4.0' ? 2800 : 1200);

    return {
      memorySpecs: {
        technology: tech,
        healthPercent: 98,
        smartStatus: 'EXCELLENT',
        readSpeedMb: readSpeed,
        writeSpeedMb: writeSpeed,
        badSectorsCount: 0,
        partitionTable: partitions
      },
      securityEnclave: {
        frpStatus: baseDevice.frpStatus || 'ON',
        googleAccountBound: baseDevice.frpStatus === 'ON',
        iCloudStatus: isIos ? 'CLEAN' : 'OFF',
        kgState: isSamsung ? (baseDevice.kgStatus || 'Checking') : 'Completed',
        miCloudBound: isXiaomi,
        bootloaderState: baseDevice.bootloaderStatus || 'LOCKED',
        antiRollbackIndex: baseDevice.rollbackIndex || 1,
        knoxWarranty: isSamsung ? (baseDevice.knoxStatus || '0x0 (Valid)') : '0x0 (Valid)',
        avbVerifiedBootState: baseDevice.bootloaderStatus === 'UNLOCKED' ? 'ORANGE' : 'GREEN',
        trustZoneState: 'ACTIVE_SECURE'
      },
      powerAndSensors: {
        vbusVoltageV: 5.14,
        chargingCurrentMa: 1850,
        vccMainVoltageV: 4.18,
        batteryCellMv: baseDevice.batteryVoltageMv || 4215,
        batteryTempC: baseDevice.batteryTempCelsius || 31.4,
        batteryHealthPercent: 98,
        batteryCycles: baseDevice.batteryCycleCount || 112,
        typeCDiodeImpedanceOhms: { dp: 485, dn: 482, cc1: 520, cc2: 518 }
      },
      rfModem: {
        imei1: baseDevice.imei1 || '358941209384721',
        imei2: baseDevice.imei2 || '358941209384722',
        basebandFirmware: baseDevice.basebandVersion || 'SHANNON_5500_MODEM_V4.2',
        efsHash: '0x8F9A22BC001192',
        simState: 'INSERTED_ACTIVE'
      }
    };
  }

  /**
   * Return predefined Android & iPhone hardware preset objects for quick pairing simulations
   */
  public getPresetDeviceProfiles(): ConnectedDevice[] {
    return [
      {
        id: 'samsung-s25-ultra',
        brand: 'Samsung',
        model: 'SM-S938B',
        marketName: 'Galaxy S25 Ultra 5G',
        chipset: 'qualcomm',
        chipsetName: 'Qualcomm Snapdragon 8 Elite (Gen 4)',
        socId: '0x001980E100000000',
        mode: 'ADB_ONLINE',
        port: 'COM4 (Samsung Android Composite USB Port)',
        vidPid: '04E8:6860',
        serialNumber: 'R5CW10A98ZY',
        imei1: '358941209384721',
        imei2: '358941209384722',
        basebandVersion: 'S938BXXU1AXB4_MODEM',
        androidVersion: '15',
        securityPatch: '2026-02-01',
        buildNumber: 'UP1A.231005.007.S938BXXU1AXB4',
        bootloaderStatus: 'LOCKED',
        frpStatus: 'ON',
        knoxStatus: '0x0 (Valid)',
        storageType: 'UFS 4.0',
        storageSizeGb: 512,
        batteryLevel: 88,
        rollbackIndex: 1,
        cscCode: 'KSA',
        carrier: 'STC Saudi Telecom',
        slotActive: 'a',
        kgStatus: 'Checking',
        cpuTempCelsius: 32.5,
        cpuUsagePercent: 6,
        ramUsagePercent: 38,
        ramTotalGb: 12,
        batteryVoltageMv: 4210,
        batteryTempCelsius: 31.2,
        batteryCycleCount: 64,
        batteryHealth: 'Good',
        storageUsedGb: 112
      },
      {
        id: 'iphone-16-pro-max',
        brand: 'Apple',
        model: 'A3296',
        marketName: 'iPhone 16 Pro Max',
        chipset: 'apple_ios',
        chipsetName: 'Apple A18 Pro Bionic (6-Core CPU + 6-Core GPU)',
        socId: '0x8130000000000000',
        mode: 'APPLE_DFU',
        port: 'USB (Apple Mobile Device DFU Interface)',
        vidPid: '05AC:1227',
        serialNumber: 'DX3J9281KL9Q',
        imei1: '359281029384019',
        imei2: '359281029384020',
        basebandVersion: '4.02.01-QUALCOMM_X75',
        androidVersion: 'iOS 18.2',
        securityPatch: '2026-01-15',
        buildNumber: '22C152',
        bootloaderStatus: 'LOCKED',
        frpStatus: 'ON',
        storageType: 'NVMe',
        storageSizeGb: 1024,
        batteryLevel: 94,
        rollbackIndex: 2,
        carrier: 'eSIM Global',
        cpuTempCelsius: 29.8,
        cpuUsagePercent: 4,
        ramUsagePercent: 28,
        ramTotalGb: 8,
        batteryVoltageMv: 4280,
        batteryTempCelsius: 29.5,
        batteryCycleCount: 42,
        batteryHealth: 'Good',
        storageUsedGb: 215
      },
      {
        id: 'xiaomi-15-pro',
        brand: 'Xiaomi',
        model: '24101PNB7C',
        marketName: 'Xiaomi 15 Pro (HyperOS 2.0)',
        chipset: 'qualcomm',
        chipsetName: 'Qualcomm Snapdragon 8 Elite',
        socId: '0x001980E100000000',
        mode: 'EDL_9008',
        port: 'COM7 (Qualcomm HS-USB QDLoader 9008)',
        vidPid: '05C6:9008',
        serialNumber: 'XM15PRO982103',
        imei1: '869281049201938',
        imei2: '869281049201939',
        basebandVersion: 'MPSS.DE.1.0-00129',
        androidVersion: '15',
        securityPatch: '2026-02-01',
        buildNumber: 'HyperOS 2.0.12.0.VNCCNXM',
        bootloaderStatus: 'LOCKED',
        frpStatus: 'ON',
        storageType: 'UFS 4.0',
        storageSizeGb: 256,
        batteryLevel: 76,
        rollbackIndex: 1,
        cpuTempCelsius: 34.1,
        cpuUsagePercent: 8,
        ramUsagePercent: 42,
        ramTotalGb: 16,
        batteryVoltageMv: 4120,
        batteryTempCelsius: 33.0,
        batteryCycleCount: 88,
        batteryHealth: 'Good',
        storageUsedGb: 98
      },
      {
        id: 'pixel-9-pro',
        brand: 'Google',
        model: 'G1MNW',
        marketName: 'Google Pixel 9 Pro',
        chipset: 'google_tensor',
        chipsetName: 'Google Tensor G4 + Titan M2 Security Subsystem',
        socId: '0x0009821000000000',
        mode: 'FASTBOOTD',
        port: 'USB (Android Bootloader Interface)',
        vidPid: '18D1:4EE0',
        serialNumber: 'PX9PRO8210392',
        imei1: '352910293847281',
        imei2: '352910293847282',
        basebandVersion: 'g5300g-240821',
        androidVersion: '15',
        securityPatch: '2026-02-05',
        buildNumber: 'AP2A.240805.005',
        bootloaderStatus: 'LOCKED',
        frpStatus: 'ON',
        storageType: 'UFS 3.1',
        storageSizeGb: 256,
        batteryLevel: 92,
        rollbackIndex: 3,
        cpuTempCelsius: 30.2,
        cpuUsagePercent: 5,
        ramUsagePercent: 32,
        ramTotalGb: 16,
        batteryVoltageMv: 4240,
        batteryTempCelsius: 29.8,
        batteryCycleCount: 35,
        batteryHealth: 'Good',
        storageUsedGb: 64
      }
    ];
  }
}

export const mockDeviceResponseService = MockDeviceResponseService.getInstance();
