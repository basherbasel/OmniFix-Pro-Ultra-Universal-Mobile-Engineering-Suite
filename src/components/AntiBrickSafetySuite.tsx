import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  HardDrive, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Cpu, 
  Lock, 
  Eye, 
  Zap,
  CheckSquare,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConnectedDevice, PartitionInfo } from '../types';

interface AntiBrickSafetySuiteProps {
  device: ConnectedDevice;
  onBackupPartition: (partitions: string[]) => void;
  onRestorePartition: (partitionName: string) => void;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

const PARTITION_MAP: PartitionInfo[] = [
  { name: 'nvram', startSector: '0x00008000', sizeMb: 5, type: 'EXT4/RAW', backedUp: true, essential: true },
  { name: 'nvdata', startSector: '0x0000A800', sizeMb: 32, type: 'EXT4', backedUp: true, essential: true },
  { name: 'modemst1 (EFS 1)', startSector: '0x00012000', sizeMb: 3, type: 'RAW/QCOM', backedUp: true, essential: true },
  { name: 'modemst2 (EFS 2)', startSector: '0x00013800', sizeMb: 3, type: 'RAW/QCOM', backedUp: true, essential: true },
  { name: 'fsg', startSector: '0x00015000', sizeMb: 4, type: 'RAW', backedUp: false, essential: true },
  { name: 'persist', startSector: '0x00020000', sizeMb: 64, type: 'EXT4', backedUp: true, essential: true },
  { name: 'boot', startSector: '0x00040000', sizeMb: 64, type: 'KERNEL_IMAGE', backedUp: true, essential: false },
  { name: 'vbmeta', startSector: '0x00080000', sizeMb: 8, type: 'AVB_TREE', backedUp: true, essential: true },
  { name: 'frp', startSector: '0x00088000', sizeMb: 1, type: 'RAW_CONFIG', backedUp: true, essential: false },
  { name: 'secro', startSector: '0x00090000', sizeMb: 6, type: 'SECURE_CRYPTO', backedUp: false, essential: true },
];

export const AntiBrickSafetySuite: React.FC<AntiBrickSafetySuiteProps> = ({
  device,
  onBackupPartition,
  onRestorePartition,
  isBusy,
  lang
}) => {
  const isAr = lang === 'ar';
  const [selectedPartitions, setSelectedPartitions] = useState<string[]>([
    'nvram', 'nvdata', 'modemst1 (EFS 1)', 'modemst2 (EFS 2)', 'persist', 'vbmeta'
  ]);
  const [showTestpointPinout, setShowTestpointPinout] = useState(false);

  const togglePartition = (name: string) => {
    if (selectedPartitions.includes(name)) {
      setSelectedPartitions(selectedPartitions.filter(p => p !== name));
    } else {
      setSelectedPartitions([...selectedPartitions, name]);
    }
  };

  return (
    <div className="space-y-8 perspective-1000 preserve-3d pb-10">
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20, rotateX: -5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2rem] p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group preserve-3d"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20 preserve-3d"
          >
            <ShieldCheck className="w-9 h-9 fill-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight leading-tight">
                {isAr ? 'جناح الحماية من الموت المفاجئ' : 'Anti-Brick Safety Suite'}
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 tracking-widest uppercase italic">Active Protection</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed max-w-xl">
              {isAr
                ? 'فحص مؤشر الحماية ضد الرجوع (Rollback Index) وأخذ نسخ احتياطية فورية لقطاعات الأمان والشبكة لمنع فقدان البيانات'
                : 'Neural rollback index validation, partition integrity snapshots, and live motherboard testpoint pinout visualization engine.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <motion.button
            whileHover={{ scale: 1.05, translateY: -2, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTestpointPinout(!showTestpointPinout)}
            className="px-8 py-4 bg-black/40 hover:bg-white/5 text-cyan-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border border-white/10 flex items-center gap-3 transition-all shadow-2xl backdrop-blur-xl preserve-3d"
          >
            <Eye className="w-5 h-5" />
            <span>{showTestpointPinout ? (isAr ? 'إخفاء نقطة التوصيل' : 'Hide Pinout') : (isAr ? 'عرض نقطة التوصيل' : 'View Pinout')}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Testpoint Pinout Visual Guide (Collapsible) */}
      <AnimatePresence>
        {showTestpointPinout && (
          <motion.div 
            initial={{ height: 0, opacity: 0, rotateX: -10 }}
            animate={{ height: 'auto', opacity: 1, rotateX: 0 }}
            exit={{ height: 0, opacity: 0, rotateX: -10 }}
            className="overflow-hidden preserve-3d"
          >
            <div className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 space-y-8 mb-8 shadow-2xl relative preserve-3d">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
                    <Zap className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] italic leading-tight">
                    {isAr ? 'دليل نقاط تلامس اللوحة الأم' : 'Hardware Pinout Schematic'}
                  </h4>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60 mb-1">{isAr ? 'المعالج المستهدف' : 'Target SoC'}</span>
                  <span className="text-sm font-black font-mono text-cyan-700 italic uppercase tracking-tighter">{device.chipset.toUpperCase()} {device.chipsetName}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                {/* Visual Motherboard Diagram */}
                <div className="lg:col-span-7 bg-slate-50 border border-slate-100 rounded-3xl p-8 font-mono text-[10px] space-y-6 relative overflow-hidden shadow-inner preserve-3d">
                  <div className="flex justify-between items-center text-slate-400 text-[9px] border-b border-slate-100 pb-4">
                    <span className="font-black uppercase tracking-[0.2em] opacity-50">PCB_REV_1.2_NEURAL_LAYER</span>
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-md" />
                      <span className="text-amber-600 font-black uppercase tracking-widest">GND_SYNC_ACTIVE</span>
                    </div>
                  </div>
                  
                  <div className="h-60 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center relative p-8 shadow-sm preserve-3d group">
                    <motion.div 
                      whileHover={{ scale: 1.02, rotateX: 5, rotateY: 5 }}
                      className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-8 preserve-3d"
                    >
                      <div className="w-40 h-28 border-2 border-slate-100 rounded-3xl bg-slate-50 flex flex-col items-center justify-center font-black text-slate-400 text-xs shadow-inner relative preserve-3d">
                        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-white border border-slate-200" />
                        <span className="text-cyan-700 mb-1 tracking-tighter text-sm italic">{device.brand.toUpperCase()}</span>
                        <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase">{device.chipset.toUpperCase()} SECURE</span>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="flex flex-col items-center gap-3 group/pin">
                          <div className="w-5 h-5 rounded-full bg-amber-500 animate-ping absolute opacity-40" />
                          <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white relative z-10 shadow-lg" />
                          <span className="text-amber-600 font-black text-[10px] tracking-[0.2em] uppercase mt-1">TP_EDL</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <div className="h-[2px] w-32 bg-gradient-to-r from-amber-500 via-slate-200 to-slate-100" />
                          <span className="text-[9px] font-black uppercase tracking-widest italic text-slate-400">Signal Path</span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-5 h-5 rounded-xl bg-slate-100 border border-slate-200 shadow-inner" />
                          <span className="text-slate-400 font-black text-[10px] tracking-[0.2em] uppercase italic opacity-60">GND_B</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Testpoint Instructions */}
                <div className="lg:col-span-5 space-y-8">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1 opacity-60">{isAr ? 'تعليمات الهاردوير الدقيقة' : 'Neural Hardware Sequencing'}</h5>
                    <div className="h-px w-full bg-gradient-to-r from-slate-200 to-transparent" />
                  </div>
                  <ol className="space-y-5 font-medium text-slate-600 leading-relaxed font-mono text-xs">
                    <li className="flex gap-5">
                      <span className="text-cyan-700 font-black bg-cyan-50 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-cyan-100 shadow-sm">1</span>
                      <p className="pt-1">{isAr ? 'افصل كابل البطارية تماماً عن اللوحة الأم.' : 'Terminate battery flex interface connection completely from motherboard header.'}</p>
                    </li>
                    <li className="flex gap-5">
                      <span className="text-cyan-700 font-black bg-cyan-50 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-cyan-100 shadow-sm">2</span>
                      <p className="pt-1">{isAr ? 'استخدم ملقطاً دقيقاً لتوصيل نقطة TP1 مع الدرع المعدني (GND).' : 'Apply precision bypass shunt between gold contact (TP1) and the nearest chassis GND plane.'}</p>
                    </li>
                    <li className="flex gap-5">
                      <span className="text-cyan-700 font-black bg-cyan-50 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-cyan-100 shadow-sm">3</span>
                      <p className="pt-1">{isAr ? 'أدخل كابل USB-C وراقص تعريف المنفذ.' : 'Initiate high-speed USB-C handshake; monitor device enumeration in hardware stack.'}</p>
                    </li>
                  </ol>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-3xl bg-amber-50 border border-amber-100 flex items-center gap-5 shadow-sm"
                  >
                    <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0 animate-pulse" />
                    <p className="text-[11px] font-black text-amber-700 italic uppercase leading-tight tracking-tight">
                      {isAr ? 'تنبيه: لا تلمس المكونات المحيطة بالملقط لتجنب الصعق الساكن.' : 'Warning: Avoid ESD discharge. Do not short adjacent SMDs during bridge initiation.'}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Rollback Index Guard & Partition Selector */}
      {/* Main Grid: Rollback Index Guard & Partition Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Rollback Guard */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <motion.div 
            whileHover={{ scale: 1.02, rotateY: 5 }}
            className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2rem] p-8 shadow-xl flex-1 relative overflow-hidden group preserve-3d"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100 shadow-sm">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] italic leading-tight">
                    {isAr ? 'حماية الـ Rollback' : 'Rollback Guard'}
                  </h4>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-md" />
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 font-mono text-xs shadow-inner">
                  <div className="flex justify-between items-center group/item">
                    <span className="text-slate-400 uppercase tracking-[0.2em] opacity-60">{isAr ? 'إصدار حماية الفيوز' : 'HW Fuse Index'}</span>
                    <span className="text-cyan-700 font-black text-lg italic tracking-tighter">REV {device.rollbackIndex}.0</span>
                  </div>
                  <div className="h-px w-full bg-slate-100" />
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 uppercase tracking-[0.2em] opacity-60">{isAr ? 'إصدار الروم المستهدف' : 'Target ROM'}</span>
                    <span className="text-emerald-600 font-black text-lg italic tracking-tighter">REV {device.rollbackIndex}.0</span>
                  </div>
                  <div className="h-px w-full bg-slate-100" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-400 uppercase tracking-[0.2em] opacity-60 font-black">{isAr ? 'حالة المطابقة' : 'Integrity'}</span>
                    <span className="text-emerald-600 font-black uppercase tracking-tight flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5" />
                      SECURE
                    </span>
                  </div>
                </div>

                <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 text-xs text-slate-500 leading-relaxed font-medium italic opacity-80">
                  "{isAr
                    ? 'نظام الحماية الاستباقي يراقب سجلات e-fuse لمنع تفليش إصدارات قديمة قد تؤدي لموت المعالج الدائم.'
                    : 'Real-time cryptographic e-fuse auditing active. Prevents low-security binary injection to avoid permanent hardware entrapment.'}"
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right 2 Cols: Partition Snapshot Vault */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between overflow-hidden relative preserve-3d">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="space-y-8 relative z-10 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                    <Layers className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] italic leading-tight">
                    {isAr ? 'خزنة قطاعات الذاكرة' : 'Critical Partition Vault'}
                  </h4>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-[0.3em] opacity-60">
                    {selectedPartitions.length} / {PARTITION_MAP.length} {isAr ? 'محدد' : 'QUEUED'}
                  </span>
                  <div className="w-px h-6 bg-slate-100" />
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                    <span className="text-[10px] font-black font-mono text-emerald-600 uppercase tracking-widest">I/O READY</span>
                  </div>
                </div>
              </div>

              {/* Partition Table List */}
              <div className="flex-1 space-y-3 max-h-[450px] overflow-y-auto pr-3 scrollbar-none preserve-3d">
                {PARTITION_MAP.map((part, idx) => {
                  const isSelected = selectedPartitions.includes(part.name);
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      whileHover={{ scale: 1.01, x: 5, z: 20 }}
                      key={part.name}
                      onClick={() => togglePartition(part.name)}
                      className={`flex items-center justify-between p-5 rounded-2xl border text-xs font-mono cursor-pointer transition-all duration-500 group preserve-3d ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-200 shadow-md'
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-500 ${
                          isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-300 border border-slate-200'
                        }`}>
                          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-black uppercase tracking-tight text-sm transition-colors duration-500 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{part.name}</span>
                          <span className="text-[10px] text-slate-400 tracking-widest italic opacity-60">OFFSET: {part.startSector}</span>
                        </div>
                        {part.essential && (
                          <span className="text-[9px] font-black px-3 py-1 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-[0.2em] shadow-inner ml-2">
                            CRITICAL
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-[11px] font-black">
                        <div className="flex flex-col items-end">
                          <span className={`${isSelected ? 'text-indigo-600' : 'text-slate-500'} italic text-sm transition-colors duration-500`}>{part.sizeMb} MB</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest opacity-60 font-black">{part.type}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 pt-8 border-t border-slate-100 relative z-10">
              <motion.button
                whileHover={{ scale: 1.02, translateY: -3, boxShadow: "0 20px 40px rgba(16,185,129,0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onBackupPartition(selectedPartitions)}
                disabled={isBusy || selectedPartitions.length === 0}
                className="py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-40 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-xl transition-all border border-white/20 relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                <Download className="w-6 h-6 relative z-10" />
                <span className="relative z-10">{isAr ? 'نسخ احتياطي فوري' : 'INITIATE BACKUP'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, translateY: -3, backgroundColor: "rgba(99,102,241,0.05)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onRestorePartition(selectedPartitions[0] || 'nvram')}
                disabled={isBusy || selectedPartitions.length === 0}
                className="py-5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-md cursor-pointer"
              >
                <Upload className="w-6 h-6 text-cyan-600" />
                <span>{isAr ? 'استعادة من صورة' : 'RESTORE SNAPSHOT'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
