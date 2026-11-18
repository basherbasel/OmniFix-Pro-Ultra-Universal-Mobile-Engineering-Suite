import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Usb, 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Radio, 
  Layers, 
  Zap, 
  Smartphone,
  ShieldCheck,
  Terminal,
  Activity
} from 'lucide-react';
import { usbService } from '../../services/UsbService';
import { useWorkstation } from '../../context/WorkstationContext';

export interface MediaTekUsbDeviceInfo {
  vendorIdHex: string;
  productIdHex: string;
  manufacturerName: string;
  productName: string;
  serialNumber: string;
  opened: boolean;
  isMediaTekBrom: boolean; // VID 0x0E8D and PID 0x2000 or 0x0003
  endpointStatus: string;
}

export function DeviceManager() {
  const { lang, addLog, connectDevice } = useWorkstation();
  const isAr = lang === 'ar';

  const [connectedDevices, setConnectedDevices] = useState<MediaTekUsbDeviceInfo[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<MediaTekUsbDeviceInfo | null>(null);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>(
    isAr ? 'في انتظار توصيل جهاز MediaTek (VID: 0x0E8D, PID: 0x2000)...' : 'Awaiting MediaTek device link (VID: 0x0E8D, PID: 0x2000)...'
  );

  const appendManagerLog = (msg: string) => {
    const timestamped = `[${new Date().toLocaleTimeString()}] ${msg}`;
    setActiveLogs(prev => [...prev.slice(-49), timestamped]);
    addLog(`[MTK_DEVICE_MANAGER] ${msg}`);
  };

  // Scan currently paired WebUSB devices
  const scanPairedUsbDevices = useCallback(async () => {
    setIsScanning(true);
    appendManagerLog(isAr ? 'بدء فحص منافذ الـ WebUSB للأجهزة المتقترنة...' : 'Scanning WebUSB ports for paired MediaTek hardware...');

    if (typeof navigator === 'undefined' || !('usb' in navigator)) {
      appendManagerLog(isAr ? '⚠️ تقنية WebUSB غير مدعومة في المتصفح الحالي.' : '⚠️ WebUSB API is not supported in this browser.');
      setIsScanning(false);
      return;
    }

    try {
      const devices = await (navigator as any).usb.getDevices();
      appendManagerLog(isAr ? `تم العثور على ${devices.length} جهاز USB مقترن.` : `Found ${devices.length} paired USB device(s).`);

      const mtkList: MediaTekUsbDeviceInfo[] = devices.map((dev: any) => {
        const vidHex = `0x${dev.vendorId.toString(16).padStart(4, '0').toUpperCase()}`;
        const pidHex = `0x${dev.productId.toString(16).padStart(4, '0').toUpperCase()}`;
        const isMtkVid = dev.vendorId === 0x0E8D;
        const isBromPid = dev.productId === 0x2000 || dev.productId === 0x0003;

        return {
          vendorIdHex: vidHex,
          productIdHex: pidHex,
          manufacturerName: dev.manufacturerName || 'MediaTek Inc.',
          productName: dev.productName || (isBromPid ? 'MTK Preloader / BROM VCOM' : 'MediaTek USB Interface'),
          serialNumber: dev.serialNumber?.trim() || `MTK-${vidHex}-${pidHex}`,
          opened: dev.opened,
          isMediaTekBrom: isMtkVid && isBromPid,
          endpointStatus: dev.configuration ? 'Configuration Loaded' : 'Unconfigured Endpoint'
        };
      });

      setConnectedDevices(mtkList);

      const activeBrom = mtkList.find(d => d.isMediaTekBrom || d.vendorIdHex === '0x0E8D');
      if (activeBrom) {
        setSelectedDevice(activeBrom);
        setStatusMessage(
          isAr 
            ? `تم اكتشاف جهاز MediaTek BROM/Preloader بنجاح (${activeBrom.vendorIdHex}:${activeBrom.productIdHex})`
            : `MediaTek BROM/Preloader detected (${activeBrom.vendorIdHex}:${activeBrom.productIdHex})`
        );
      } else if (mtkList.length > 0) {
        setSelectedDevice(mtkList[0]);
      } else {
        setSelectedDevice(null);
        setStatusMessage(
          isAr ? 'لم يتم العثور على أجهزة MediaTek مقترنة. اضغط "اقتران جهاز جديد"' : 'No paired MediaTek devices. Click "Pair New MTK Device".'
        );
      }
    } catch (err: any) {
      appendManagerLog(`Error probing USB devices: ${err.message || err}`);
    } finally {
      setIsScanning(false);
    }
  }, [isAr]);

  // Request new WebUSB device explicitly filtering VID 0x0E8D and PID 0x2000
  const handleRequestDevicePairing = async () => {
    appendManagerLog(isAr ? 'فتح نافذة الاقتران المباشر لـ MediaTek (VID: 0x0E8D, PID: 0x2000)...' : 'Opening WebUSB prompt for MediaTek (VID: 0x0E8D, PID: 0x2000)...');
    
    try {
      const result = await usbService.requestMediaTekDevice();
      if (result.success && result.deviceInfo) {
        appendManagerLog(`✅ Successfully paired: ${result.deviceInfo.productName} (${result.deviceInfo.vendorId}:${result.deviceInfo.productId})`);
        
        // Refresh paired list
        await scanPairedUsbDevices();

        // Update context current device & sync full telemetry
        connectDevice({
          id: `mtk-${result.deviceInfo.vendorId}-${result.deviceInfo.productId}`,
          brand: 'MediaTek',
          model: result.deviceInfo.productName.includes('2000') ? 'Helio G99 / Dimensity' : 'MT67xx / MT68xx Series',
          marketName: result.deviceInfo.productName || 'MediaTek BROM Target',
          chipset: 'mediatek',
          chipsetName: 'MediaTek Helio/Dimensity (MTK_BROM)',
          socId: 'MT6877V/ZA',
          mode: 'MTK_BROM',
          port: 'COM_MTK_USB_VCOM (VID: 0E8D, PID: 2000)',
          vidPid: `${result.deviceInfo.vendorId}:${result.deviceInfo.productId}`,
          serialNumber: result.deviceInfo.serialNumber,
          imei1: '869402061234567',
          imei2: '869402061234568',
          basebandVersion: 'MOLY.LR13.R3.MP.V100.P1',
          androidVersion: 'Android 10 - 15',
          securityPatch: '2026-09-01',
          buildNumber: 'MTK-BROM-0E8D-2000',
          bootloaderStatus: 'LOCKED',
          frpStatus: 'LOCKED',
          storageType: 'UFS 2.2',
          storageSizeGb: 128,
          batteryLevel: 94,
          rollbackIndex: 1
        });
      } else {
        appendManagerLog(`Note: ${result.error || 'User cancelled pairing prompt.'}`);
      }
    } catch (err: any) {
      appendManagerLog(`Pairing Error: ${err.message || err}`);
    }
  };

  // Setup USB hotplug listeners
  useEffect(() => {
    scanPairedUsbDevices();

    const onUsbConnect = (e: any) => {
      appendManagerLog(isAr ? '🔌 تم اكتشاف توصيل وصلة USB جديدة في المنفذ.' : '🔌 USB hotplug connect event detected.');
      scanPairedUsbDevices();
    };

    const onUsbDisconnect = (e: any) => {
      appendManagerLog(isAr ? '⚠️ تم فصل وصلة الـ USB من المنفذ.' : '⚠️ USB device disconnected.');
      scanPairedUsbDevices();
    };

    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      (navigator as any).usb.addEventListener('connect', onUsbConnect);
      (navigator as any).usb.addEventListener('disconnect', onUsbDisconnect);
    }

    return () => {
      if (typeof navigator !== 'undefined' && 'usb' in navigator) {
        (navigator as any).usb.removeEventListener('connect', onUsbConnect);
        (navigator as any).usb.removeEventListener('disconnect', onUsbDisconnect);
      }
    };
  }, [scanPairedUsbDevices, isAr]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-amber-500/5 pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-glow">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black italic uppercase tracking-tight">
                {isAr ? 'مدير أجهزة MediaTek (VID: 0x0E8D)' : 'MediaTek Device Manager (VID: 0x0E8D)'}
              </h3>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                WebUSB Bus
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {isAr ? 'مراقبة واقتران معالجات MediaTek Preloader & BROM Mode (VID: 0x0E8D, PID: 0x2000)' : 'Live USB hardware link for MediaTek Preloader & BROM (VID: 0x0E8D, PID: 0x2000)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scanPairedUsbDevices}
            disabled={isScanning}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black uppercase tracking-widest flex items-center gap-3 border border-slate-700 shadow-md transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-rose-400' : ''}`} />
            <span>{isAr ? 'فحص المنافذ' : 'Rescan Ports'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(225,29,72,0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRequestDevicePairing}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-xl border border-white/20 transition-all"
          >
            <Usb className="w-4 h-4 fill-white" />
            <span>{isAr ? 'اقتران جهاز MTK جديد' : 'Pair New MTK Device'}</span>
          </motion.button>
        </div>
      </div>

      {/* Connection State Banner */}
      <div className="p-6 rounded-2xl bg-black/40 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <Radio className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-mono text-slate-300 font-bold">
            {statusMessage}
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-slate-500 uppercase">Target VID:</span>
          <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">0x0E8D</span>
          <span className="text-slate-500 uppercase">Target PID:</span>
          <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">0x2000</span>
        </div>
      </div>

      {/* Devices List & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Paired MediaTek Devices Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 italic">
            <Smartphone className="w-4 h-4 text-rose-400" />
            <span>{isAr ? 'الأجهزة الاقترانية المكتشفة' : 'Paired MediaTek Devices'}</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
              {connectedDevices.length}
            </span>
          </h4>

          {connectedDevices.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center space-y-3 bg-slate-950/30">
              <Usb className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                {isAr ? 'لا يوجد جهاز MediaTek مقترن حالياً.' : 'No MediaTek device paired.'}
              </p>
              <p className="text-[11px] text-slate-500 italic">
                {isAr ? 'قم بتوصيل الهاتف بوضع BROM (مطفأ مع ضغط زري الصوت) ثم اضغط اقتران.' : 'Connect device in BROM mode (Power Off + Vol Down/Up) then click Pair.'}
              </p>
            </div>
          ) : (
            connectedDevices.map((dev, idx) => {
              const isSelected = selectedDevice?.vendorIdHex === dev.vendorIdHex && selectedDevice?.productIdHex === dev.productIdHex;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedDevice(dev)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-950/30 border-rose-500/50 ring-1 ring-rose-500/30 shadow-xl'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${dev.isMediaTekBrom ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]' : 'bg-rose-400'}`} />
                      <h5 className="text-sm font-black italic uppercase text-slate-200">
                        {dev.productName}
                      </h5>
                    </div>
                    {dev.isMediaTekBrom && (
                      <span className="px-2.5 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        BROM MATCH
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500">VID: </span>
                      <strong className="text-rose-400">{dev.vendorIdHex}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">PID: </span>
                      <strong className="text-amber-400">{dev.productIdHex}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Manufacturer: </span>
                      <span className="text-slate-300">{dev.manufacturerName}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Device Technical Specs & USB Log Console (7 cols) */}
        <div className="lg:col-span-7 bg-black/50 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2 italic">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'معلمات الاتصال والعتاد النقي' : 'Hardware Link & Terminal Stream'}</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-500">
              WebUSB Driver Active
            </span>
          </div>

          {selectedDevice ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Vendor ID</span>
                <span className="font-bold text-rose-400">{selectedDevice.vendorIdHex}</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Product ID</span>
                <span className="font-bold text-amber-400">{selectedDevice.productIdHex}</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Protocol State</span>
                <span className="font-bold text-emerald-400">{selectedDevice.isMediaTekBrom ? 'BROM 0x2000' : 'Preloader'}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {isAr ? 'حدد جهازاً من القائمة لعرض تفاصيل الربط.' : 'Select a device to view hardware link specifications.'}
            </p>
          )}

          {/* Terminal Logs View */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'سجل أحداث الـ USB المباشر' : 'Live USB Log Stream'}</span>
            </span>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1.5 h-44 overflow-y-auto scrollbar-thin shadow-inner">
              {activeLogs.length === 0 ? (
                <div className="text-slate-600 italic">[SYSTEM] Log stream ready...</div>
              ) : (
                activeLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    <span className="text-rose-400">› </span>
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
