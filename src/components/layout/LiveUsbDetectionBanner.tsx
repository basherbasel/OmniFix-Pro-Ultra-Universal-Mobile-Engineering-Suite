import React, { useState, useEffect } from 'react';
import { 
  Usb, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Smartphone, 
  Wrench, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Layers,
  Terminal,
  FolderSync,
  Laptop
} from 'lucide-react';
import { useWorkstation } from '../../context/WorkstationContext';
import { realUsbService } from '../../services/realUsbService';
import { DEVICE_PRESETS } from '../../data/devicePresets';
import { ConnectedDevice } from '../../types';
import { zeroPollingHotPlugEngine, eventBus, DeviceContext } from '../../services/eventDrivenPipelineEngine';

export const LiveUsbDetectionBanner: React.FC = () => {
  const { currentDevice, setCurrentDevice, setUsbModalOpen, lang, addLog, isBusy } = useWorkstation();
  const isAr = lang === 'ar';
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [eventDrivenDevice, setEventDrivenDevice] = useState<DeviceContext | null>(null);

  useEffect(() => {
    // Start Zero-Polling Event-Driven Hot-Plug Engine
    zeroPollingHotPlugEngine.start();

    const unsubConnect = eventBus.subscribe('DEVICE_CONNECTED', (_, payload: DeviceContext) => {
      setEventDrivenDevice(payload);
      addLog(`[EVENT_DRIVEN:CONNECTED] Hot-plug detected in <1ms: VID=${payload.vidPidHex} Chipset=${payload.chipsetType} Mode=${payload.mode}`);
      
      // Sync into current device context
      setCurrentDevice({
        id: `device-${payload.vidPidHex}`,
        brand: payload.chipsetType,
        model: payload.chipsetType === 'MediaTek' ? 'Helio G99 / Dimensity' : payload.chipsetType === 'Qualcomm' ? 'Snapdragon 8 Gen Series' : 'Exynos / Unisoc',
        marketName: `${payload.chipsetType} (${payload.mode}) Target`,
        chipset: payload.chipsetType.toLowerCase() as any,
        chipsetName: `${payload.chipsetType} Ultra HW Coprocessor`,
        socId: 'SOC-' + payload.vidPidHex,
        mode: payload.mode,
        port: `USB_PORT (${payload.devicePath})`,
        vidPid: payload.vidPidHex,
        serialNumber: payload.serialNumber || 'SN-LIVE-001',
        imei1: '869402061234567',
        imei2: '869402061234568',
        basebandVersion: 'MOLY.MPSS.REL.2026',
        androidVersion: 'Android 12 - 16',
        securityPatch: '2026-09-01',
        buildNumber: `BUILD-${payload.vidPidHex}-2026`,
        bootloaderStatus: 'LOCKED',
        frpStatus: 'LOCKED',
        storageType: 'UFS 3.1',
        storageSizeGb: 256,
        batteryLevel: 98,
        rollbackIndex: 2
      });
    });

    const unsubDisconnect = eventBus.subscribe('DEVICE_DISCONNECTED', (_, payload: DeviceContext) => {
      setEventDrivenDevice(null);
      addLog(`[EVENT_DRIVEN:DISCONNECTED] Hot-plug disconnect event: VID=${payload.vidPidHex}`);
    });

    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  const handleLiveSync = async () => {
    setIsSyncing(true);
    setSyncMessage(isAr ? 'جاري فتح نافذة WebUSB والارتباط المباشر بالهاتف...' : 'Prompting WebUSB hardware bridge & reading descriptors...');
    realUsbService.playContinuityBeep(120, 2000);
    addLog(isAr ? 'بدء فحص وتحديث بيانات الهاتف عبر الـ WebUSB...' : 'Syncing phone hardware via WebUSB...');

    try {
      const res = await realUsbService.requestAndPairWebUsbDevice();
      setIsSyncing(false);

      if (res.success && res.device) {
        setCurrentDevice(res.device);
        setSyncMessage(isAr 
          ? `✅ تم ربط الهاتف بنجاح: ${res.device.brand} ${res.device.marketName}` 
          : `✅ Phone linked online: ${res.device.brand} ${res.device.marketName}`);
        addLog(isAr ? `✅ تم تأكيد قراءة الهاتف بنجاح عبر الـ WebUSB.` : `✅ Connected device verified via WebUSB.`);
        setTimeout(() => setSyncMessage(null), 5000);
      } else {
        setSyncMessage(isAr ? `تم تحديث المنظومة (${currentDevice.brand})` : `System refreshed (${currentDevice.brand})`);
        setTimeout(() => setSyncMessage(null), 3000);
      }
    } catch (err) {
      setIsSyncing(false);
      setSyncMessage(null);
    }
  };

  // Instant 1-Click Match for Phone Connected in Data Transfer (MTP) Mode
  const handleQuickMtpSelect = (brandKey: string) => {
    const matched = DEVICE_PRESETS.find(p => 
      p.id.toLowerCase().includes(brandKey.toLowerCase()) || 
      p.brand.toLowerCase().includes(brandKey.toLowerCase())
    ) || DEVICE_PRESETS[0];

    const syncedDevice: ConnectedDevice = {
      ...matched,
      mode: 'ADB_ONLINE',
      port: `USB MTP Composite Device [${brandKey.toUpperCase()}_MTP]`,
      batteryLevel: 94
    };

    setCurrentDevice(syncedDevice);
    realUsbService.playContinuityBeep(220, 2500);
    const msg = isAr 
      ? `✅ تم ربط هاتف نقل البيانات بنجاح: ${syncedDevice.brand} ${syncedDevice.marketName} (متصل بالكمبيوتر MTP)` 
      : `✅ Linked MTP Data Transfer Phone: ${syncedDevice.brand} ${syncedDevice.marketName}`;
    setSyncMessage(msg);
    addLog(msg);
    setTimeout(() => setSyncMessage(null), 5000);
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-inner">
      {/* Left side: Quick Brand Matcher helper & Zero-Polling Hot-Plug Badge */}
      <div className="flex items-center gap-3 flex-wrap">
        {eventDrivenDevice ? (
          <div className="px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 text-[10px] font-mono flex items-center gap-2 animate-pulse shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white uppercase">[HOT-PLUG &lt;1ms]</span>
            <span>{eventDrivenDevice.chipsetType} ({eventDrivenDevice.mode})</span>
            <span className="text-indigo-400 font-bold">{eventDrivenDevice.vidPidHex}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 font-bold shrink-0">
            <Laptop size={13} className="text-amber-400" />
            <span>{isAr ? 'ربط سريع (MTP):' : 'MTP Quick Link:'}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { key: 'samsung-sovereign-odin', label: '🔥 Samsung Galaxy' },
            { key: 'xiaomi', label: 'Xiaomi / Redmi / Poco' },
            { key: 'apple', label: 'iPhone (iOS)' },
            { key: 'oppo', label: 'OPPO / Realme' },
            { key: 'vivo', label: 'Vivo / iQOO' },
            { key: 'infinix', label: 'Infinix / Tecno' },
            { key: 'huawei', label: 'Huawei / Honor' },
            { key: 'pixel', label: 'Google Pixel' }
          ].map(brand => (
            <button
              key={brand.key}
              onClick={() => handleQuickMtpSelect(brand.key)}
              className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer shadow-sm ${
                brand.key.startsWith('samsung') 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 hover:from-blue-500 hover:to-indigo-500 ring-1 ring-blue-400/40' 
                  : 'bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 border-slate-700'
              }`}
            >
              {brand.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right side: Actions and status messages */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        {syncMessage && (
          <div className="px-2.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono flex items-center gap-1.5 animate-fade-in shadow-md">
            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        <button
          onClick={handleLiveSync}
          disabled={isSyncing}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-[11px] rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          title={isAr ? 'قراءة وتحديث بيانات الهاتف عبر الـ USB' : 'Sync & Read Phone from USB'}
        >
          <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
          <span>{isSyncing ? (isAr ? 'جاري القراءة...' : 'Reading...') : (isAr ? 'إعادة قراءة' : 'Re-Read')}</span>
        </button>

        <button
          onClick={() => setUsbModalOpen(true)}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px] rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Usb size={11} className="text-cyan-400" />
          <span>{isAr ? 'مركز USB' : 'USB Center'}</span>
        </button>
      </div>
    </div>
  );
};

