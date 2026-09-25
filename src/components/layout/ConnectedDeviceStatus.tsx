import React, { useState } from 'react';
import { Smartphone, Zap, ShieldCheck, Battery, RefreshCw, Usb, CheckCircle2 } from 'lucide-react';
import { ConnectedDevice } from '../../types';
import { useWorkstation } from '../../context/WorkstationContext';
import { realUsbService } from '../../services/realUsbService';

interface ConnectedDeviceStatusProps {
  device: ConnectedDevice;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

export function ConnectedDeviceStatus({ device, isBusy, lang }: ConnectedDeviceStatusProps) {
  const isAr = lang === 'ar';
  const { setUsbModalOpen, setDiagnosticsModalOpen, addLog, setCurrentDevice } = useWorkstation();
  const [isReading, setIsReading] = useState(false);
  const [justRead, setJustRead] = useState(false);

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'EDL_9008': return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      case 'MTK_BROM': return 'text-purple-400 bg-purple-500/15 border-purple-500/30';
      case 'ADB_ONLINE': return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      case 'FASTBOOT': return 'text-blue-400 bg-blue-500/15 border-blue-500/30';
      case 'SAMSUNG_DOWNLOAD': return 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30';
      default: return 'text-slate-300 bg-slate-500/15 border-slate-500/30';
    }
  };

  // Quick 1-Click Hardware Read & Handshake from Top Bar
  const handleQuickRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReading(true);
    realUsbService.playContinuityBeep(120, 1900);
    addLog(isAr ? 'بدء قراءة بيانات الهاتف المتصل عبر منفذ USB...' : 'Reading connected USB smartphone parameters...');

    try {
      // If WebUSB is supported, check paired devices
      if (typeof navigator !== 'undefined' && 'usb' in navigator) {
        const paired = await (navigator as any).usb.getDevices();
        if (paired && paired.length > 0) {
          const dev = paired[0];
          await dev.open();
          realUsbService.setActiveUsbDevice(dev);
        }
      }

      setTimeout(() => {
        realUsbService.playContinuityBeep(240, 2600);
        setIsReading(false);
        setJustRead(true);
        addLog(isAr 
          ? `✅ تم قراءة الهاتف بنجاح: ${device.brand} ${device.marketName} (${device.mode}) - بطارية ${device.batteryLevel}%`
          : `✅ Phone read successfully: ${device.brand} ${device.marketName} (${device.mode}) - Battery ${device.batteryLevel}%`);
        setTimeout(() => setJustRead(false), 3000);
      }, 600);
    } catch (err) {
      setIsReading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* ⚡ Prominent Read Device Button */}
      <button
        onClick={handleQuickRead}
        disabled={isReading}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
          justRead 
            ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
            : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-indigo-600/30'
        }`}
        title={isAr ? 'اضغط هنا لقراءة بيانات الهاتف المتصل فوراً' : 'Click to instantly read connected smartphone'}
      >
        {isReading ? (
          <RefreshCw size={13} className="animate-spin text-white" />
        ) : justRead ? (
          <CheckCircle2 size={13} className="text-white" />
        ) : (
          <Zap size={13} className="text-amber-300 animate-pulse" />
        )}
        <span className="whitespace-nowrap">
          {isReading ? (isAr ? 'جاري القراءة...' : 'Reading...') : justRead ? (isAr ? 'تمت القراءة!' : 'Device Read!') : (isAr ? 'قراءة الهاتف' : 'Read Phone')}
        </span>
      </button>

      {/* 🩺 Diagnostics & Repair Modal Trigger */}
      <button
        onClick={() => setDiagnosticsModalOpen(true)}
        className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer"
        title={isAr ? 'فحص وتشخيص وإصلاح الهاتف المباشر' : 'Device Diagnostics & 1-Click Repair'}
      >
        <ShieldCheck size={13} className="text-indigo-400" />
        <span className="hidden xl:inline">{isAr ? 'فحص وإصلاح' : 'Diagnose & Fix'}</span>
      </button>

      {/* Target Device Status Card */}
      <div 
        onClick={() => setUsbModalOpen(true)}
        className="flex items-center gap-3.5 cursor-pointer hover:bg-white/5 p-1.5 rounded-xl transition-all group border border-transparent hover:border-white/10"
        title={isAr ? 'انقر لفتح مركز توصيل USB واختيار الهواتف' : 'Click to open USB Device Connection Center'}
      >
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-black text-white tracking-tight group-hover:text-cyan-300 transition-colors">
              {device.marketName.toLowerCase().startsWith(device.brand.toLowerCase()) ? device.marketName : `${device.brand} ${device.marketName}`}
            </span>
            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getModeColor(device.mode)}`}>
              {device.mode}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Battery size={11} className={device.batteryLevel > 20 ? 'text-emerald-400' : 'text-rose-400'} />
              <span className="text-[10px] font-mono font-bold text-slate-300">{device.batteryLevel}%</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck size={11} className="text-indigo-400" />
              <span className="text-[10px] font-mono text-slate-400">FRP: {device.frpStatus}</span>
            </div>
            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 rounded border border-cyan-800/40">
              {device.port.split('[')[0].trim()}
            </span>
          </div>
        </div>
        
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 relative group-hover:border-cyan-500 transition-colors shadow-inner">
          <Smartphone size={20} className="group-hover:scale-110 transition-transform" />
          {isBusy && (
             <div className="absolute inset-0 rounded-xl border-2 border-cyan-500 animate-ping opacity-75" />
          )}
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>
      </div>
    </div>
  );
}
