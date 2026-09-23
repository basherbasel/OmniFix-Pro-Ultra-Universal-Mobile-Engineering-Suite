import React from 'react';
import { 
  Smartphone, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  Battery, 
  Lock, 
  Unlock, 
  Radio, 
  Terminal,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Activity,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import { ConnectedDevice, DeviceMode } from '../types';

interface DeviceHeaderCardProps {
  device: ConnectedDevice;
  onRebootToMode: (mode: DeviceMode) => void;
  onReadInfo: () => void;
  onOpenSmartAgent?: () => void;
  onOpenDiagnostics?: () => void;
  onTriggerDiagnostic?: (type: 'LOGCAT' | 'KERNEL' | 'MEMORY' | 'THERMAL') => void;
  lang: 'en' | 'ar';
}

export const DeviceHeaderCard: React.FC<DeviceHeaderCardProps> = ({
  device,
  onRebootToMode,
  onReadInfo,
  onOpenSmartAgent,
  onOpenDiagnostics,
  onTriggerDiagnostic,
  lang
}) => {
  const isAr = lang === 'ar';

  const getModeBadgeColor = (mode: DeviceMode) => {
    switch (mode) {
      case 'EDL_9008': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MTK_BROM': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SAMSUNG_DOWNLOAD': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'FASTBOOT':
      case 'FASTBOOTD': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SPD_DIAG': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'HUAWEI_COM1': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'APPLE_DFU':
      case 'APPLE_RECOVERY': return 'bg-slate-100 text-slate-700 border-slate-300';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const isBatterySafe = device.batteryLevel >= 20;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, rotateX: 5 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-2xl p-5 shadow-xl perspective-1000 preserve-3d"
    >
      {/* Top Row: Device Identity & Security Status */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Device Identity */}
        <div className="flex items-start gap-4">
          <motion.div 
            whileHover={{ rotateY: 180, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 border border-slate-200 flex items-center justify-center text-cyan-600 shrink-0 shadow-inner relative group"
          >
            <div className="absolute inset-0 bg-cyan-400/5 blur-xl group-hover:bg-cyan-400/10 transition-colors rounded-full" />
            <Smartphone className="w-8 h-8 relative z-10" />
          </motion.div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
                {device.marketName.toLowerCase().startsWith(device.brand.toLowerCase()) ? device.marketName : `${device.brand} ${device.marketName}`}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                {device.model}
              </span>
              <motion.span 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`text-[11px] font-mono px-3 py-1 rounded-full border shadow-sm ${getModeBadgeColor(device.mode)}`}
              >
                ● {device.mode}
              </motion.span>
            </div>

            {/* Sub-specifications Bar */}
            <div className="flex items-center gap-4 mt-2 flex-wrap text-[11px] text-slate-500 font-mono">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded border border-slate-100">
                <Cpu className="w-3.5 h-3.5 text-cyan-600" />
                <span className="text-slate-300">{device.chipsetName}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/5">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300">{device.storageType} {device.storageSizeGb}GB</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/5">
                <Battery className={`w-3.5 h-3.5 ${isBatterySafe ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`} />
                <span className={isBatterySafe ? 'text-emerald-300' : 'text-rose-400 font-bold'}>{device.batteryLevel}%</span>
              </div>
              {device.cscCode && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/5">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300">CSC: {device.cscCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Security, Rollback Index & Actions */}
        <div className="flex items-center gap-3 flex-wrap self-end lg:self-center">
          {/* Security Badges Group */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
            <div className={`px-2.5 py-1.5 rounded-md text-[10px] font-black tracking-tighter flex items-center gap-1.5 border transition-all ${
              device.bootloaderStatus === 'UNLOCKED' 
                ? 'bg-amber-100 text-amber-700 border-amber-200'
                : 'bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}>
              {device.bootloaderStatus === 'UNLOCKED' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>BL: {device.bootloaderStatus}</span>
            </div>

            <div className={`px-2.5 py-1.5 rounded-md text-[10px] font-black tracking-tighter flex items-center gap-1.5 border transition-all ${
              device.frpStatus === 'ON' || device.frpStatus === 'LOCKED'
                ? 'bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>FRP: {device.frpStatus}</span>
            </div>

            <div className="px-2.5 py-1.5 rounded-md text-[10px] font-black tracking-tighter flex items-center gap-1.5 bg-white border border-slate-200 text-cyan-700 shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-600" />
              <span>ARB: {device.rollbackIndex}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenDiagnostics && (
              <motion.button
                whileHover={{ scale: 1.05, translateY: -2, boxShadow: "0 10px 20px rgba(16,185,129,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenDiagnostics}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer border border-emerald-400"
              >
                <Activity className="w-4 h-4 animate-pulse text-emerald-100" />
                <span>{isAr ? '🩺 فحص وتشخيص وإصلاح الأعطال' : '🩺 Deep Diagnostic & Repair'}</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReadInfo}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 transition-all shadow-sm"
            >
              <Terminal className="w-4 h-4 text-cyan-600" />
              <span>{isAr ? 'قراءة البيانات' : 'Read Info'}</span>
            </motion.button>

            {onOpenSmartAgent && (
              <motion.button
                whileHover={{ scale: 1.05, translateY: -2, boxShadow: "0 10px 20px rgba(79,70,229,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenSmartAgent}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer border border-indigo-500"
              >
                <Sparkles className="w-4 h-4 animate-pulse text-indigo-100" />
                <span>{isAr ? 'العميل الذكي' : 'AI Agent Inspector'}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {[
          { label: isAr ? 'المعالج' : 'CPU Load', val: `${device.cpuUsagePercent || 15}%`, sub: `${device.cpuTempCelsius || 34.5}°C`, icon: Cpu, color: 'text-cyan-600', bg: 'bg-cyan-50', pct: device.cpuUsagePercent || 15 },
          { label: isAr ? 'البطارية' : 'Battery', val: `${device.batteryVoltageMv || 4150}mV`, sub: `${device.batteryCycleCount || 120} cyc`, icon: Battery, color: isBatterySafe ? 'text-emerald-600' : 'text-rose-600', bg: isBatterySafe ? 'bg-emerald-50' : 'bg-rose-50', pct: device.batteryLevel },
          { label: isAr ? 'الرام' : 'RAM', val: `${device.ramUsagePercent || 45}%`, sub: `${device.ramTotalGb || 8}GB Total`, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50', pct: device.ramUsagePercent || 45 },
          { label: isAr ? 'التخزين' : 'Storage', val: `${device.storageUsedGb || 64}GB`, sub: `${device.storageSizeGb}GB Cap`, icon: HardDrive, color: 'text-purple-600', bg: 'bg-purple-50', pct: Math.round(((device.storageUsedGb || 64) / device.storageSizeGb) * 100) },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ translateZ: 20, scale: 1.02 }}
            className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden group shadow-sm"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-50 blur-2xl rounded-full -mr-8 -mt-8" />
            <div className="flex items-center gap-3 relative z-10">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} border border-slate-100 shadow-sm`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-black text-slate-900">{stat.val}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{stat.sub}</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden mt-1 relative z-10 border border-slate-200 p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stat.pct}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${stat.bg.replace('bg-', 'from-')}-500 to-white/50`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mode Switching Quick Bar */}
      <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{isAr ? 'فحص تلقائي فائق' : 'Extreme Auto-Inspect'}</p>
            <div className="flex items-center gap-2 mt-1">
              {['LOGCAT', 'KERNEL', 'MEMORY', 'THERMAL'].map((type) => (
                <button
                  key={type}
                  onClick={() => onTriggerDiagnostic?.(type as any)}
                  className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-slate-600 border border-slate-200 transition-all shadow-sm"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          {[
            { mode: 'EDL_9008', label: 'EDL', color: 'hover:bg-amber-50 hover:text-amber-700' },
            { mode: 'FASTBOOT', label: 'FB', color: 'hover:bg-blue-50 hover:text-blue-700' },
            { mode: 'SAMSUNG_DOWNLOAD', label: 'ODIN', color: 'hover:bg-cyan-50 hover:text-cyan-700' },
            { mode: 'MTK_BROM', label: 'BROM', color: 'hover:bg-purple-50 hover:text-purple-700' },
            { mode: 'ADB_ONLINE', label: 'SYS', color: 'hover:bg-emerald-50 hover:text-emerald-700' },
          ].map((m) => (
            <button
              key={m.mode}
              onClick={() => onRebootToMode(m.mode as DeviceMode)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-500 transition-all ${m.color} border border-transparent hover:border-slate-200`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

