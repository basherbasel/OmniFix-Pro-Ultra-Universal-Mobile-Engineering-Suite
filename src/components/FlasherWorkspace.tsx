import React, { useState } from 'react';
import { 
  Zap, 
  FileCode, 
  FolderOpen, 
  CheckCircle2, 
  Play, 
  HardDrive, 
  ShieldAlert, 
  CheckSquare, 
  Square,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { ConnectedDevice, FirmwareFile, PartitionInfo } from '../types';

interface FlasherWorkspaceProps {
  device: ConnectedDevice;
  onExecuteFlash: (protocol: string, files: FirmwareFile[], options: Record<string, boolean>) => void;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

export const FlasherWorkspace: React.FC<FlasherWorkspaceProps> = ({
  device,
  onExecuteFlash,
  isBusy,
  lang
}) => {
  const isAr = lang === 'ar';
  const [activeFlasher, setActiveFlasher] = useState<'samsung' | 'mtk' | 'qualcomm' | 'unisoc' | 'apple'>(
    device.chipset === 'mediatek' ? 'mtk' :
    device.chipset === 'qualcomm' ? 'qualcomm' :
    device.chipset === 'unisoc_spd' ? 'unisoc' :
    device.chipset === 'apple_ios' ? 'apple' : 'samsung'
  );

  // Samsung Odin Slot State
  const [samsungFiles, setSamsungFiles] = useState<{ [key: string]: string }>({
    BL: `BL_${device.model}_${device.basebandVersion || 'U1'}_REV${device.rollbackIndex}.tar.md5`,
    AP: `AP_${device.model}_${device.basebandVersion || 'U1'}_SYSTEM_SUPER.tar.md5`,
    CP: `CP_${device.model}_${device.basebandVersion || 'U1'}_MODEM.tar.md5`,
    CSC: `CSC_OXM_${device.model}_${device.cscCode || 'HOME'}.tar.md5`,
    PIT: `${device.model}_EUR_OPEN.pit`
  });

  // MediaTek Scatter Slot State
  const [mtkScatterFile, setMtkScatterFile] = useState(`MT6886_Android_scatter_UFS.txt`);
  const [mtkDaFile, setMtkDaFile] = useState(`DA_PL_MT6886_v2312.bin`);
  const [mtkAuthFile, setMtkAuthFile] = useState(`auth_sv5_bypass.auth`);

  // Qualcomm QFIL Slot State
  const [qcomFirehose, setQcomFirehose] = useState(`prog_firehose_ddr_sm8650.elf`);
  const [qcomRawProgram, setQcomRawProgram] = useState(`rawprogram0_unsparse.xml`);
  const [qcomPatch, setQcomPatch] = useState(`patch0.xml`);

  // Unisoc Slot State
  const [unisocPac, setUnisocPac] = useState(`PAC_${device.model}_T606_Stock.pac`);

  // Apple Slot State
  const [appleIpsw, setAppleIpsw] = useState(`iPhone15,2_17.5.1_21F90_Restore.ipsw`);

  React.useEffect(() => {
    const chip = device.chipset;
    if (chip === 'mediatek') {
      setActiveFlasher('mtk');
      setMtkScatterFile(`MT${device.model.replace(/\D/g, '') || '6886'}_Android_scatter_UFS.txt`);
      setMtkDaFile(`DA_PL_MT${device.model.replace(/\D/g, '') || '6886'}_v26.bin`);
    } else if (chip === 'qualcomm') {
      setActiveFlasher('qualcomm');
      setQcomFirehose(`prog_firehose_ddr_${device.model.toLowerCase() || 'sm8650'}.elf`);
    } else if (chip === 'unisoc_spd') {
      setActiveFlasher('unisoc');
      setUnisocPac(`PAC_${device.model}_SPD_Stock.pac`);
    } else if (chip === 'apple_ios') {
      setActiveFlasher('apple');
      setAppleIpsw(`${device.model}_${device.basebandVersion || '17.5.1'}_Restore.ipsw`);
    } else {
      setActiveFlasher('samsung');
    }

    setSamsungFiles({
      BL: `BL_${device.model}_${device.basebandVersion || 'U1'}_REV${device.rollbackIndex}.tar.md5`,
      AP: `AP_${device.model}_${device.basebandVersion || 'U1'}_SYSTEM_SUPER.tar.md5`,
      CP: `CP_${device.model}_${device.basebandVersion || 'U1'}_MODEM.tar.md5`,
      CSC: `CSC_OXM_${device.model}_${device.cscCode || 'HOME'}.tar.md5`,
      PIT: `${device.model}_EUR_OPEN.pit`
    });
  }, [device]);

  // Options
  const [options, setOptions] = useState({
    autoReboot: true,
    fResetTime: true,
    repartitionPit: false,
    authBypass: true,
    backupNvramFirst: true,
    skipUserdata: false,
    disableVerity: true
  });

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStartFlash = () => {
    const files: FirmwareFile[] = [];
    if (activeFlasher === 'samsung') {
      if (samsungFiles.BL) files.push({ type: 'BL', filename: samsungFiles.BL, sizeBytes: 52428800, md5: 'VALIDATED_OK', status: 'READY' });
      if (samsungFiles.AP) files.push({ type: 'AP', filename: samsungFiles.AP, sizeBytes: 5800000000, md5: 'VALIDATED_OK', status: 'READY' });
      if (samsungFiles.CP) files.push({ type: 'CP', filename: samsungFiles.CP, sizeBytes: 120000000, md5: 'VALIDATED_OK', status: 'READY' });
      if (samsungFiles.CSC) files.push({ type: 'CSC', filename: samsungFiles.CSC, sizeBytes: 450000000, md5: 'VALIDATED_OK', status: 'READY' });
    } else if (activeFlasher === 'mtk') {
      files.push({ type: 'SCATTER', filename: mtkScatterFile, sizeBytes: 45000, md5: 'OK', status: 'READY' });
      files.push({ type: 'DA', filename: mtkDaFile, sizeBytes: 1450000, md5: 'OK', status: 'READY' });
    } else if (activeFlasher === 'qualcomm') {
      files.push({ type: 'FIREHOSE', filename: qcomFirehose, sizeBytes: 850000, md5: 'OK', status: 'READY' });
      files.push({ type: 'RAWPROGRAM', filename: qcomRawProgram, sizeBytes: 120000, md5: 'OK', status: 'READY' });
    } else if (activeFlasher === 'unisoc') {
      files.push({ type: 'PAC', filename: unisocPac, sizeBytes: 3200000000, md5: 'OK', status: 'READY' });
    } else if (activeFlasher === 'apple') {
      files.push({ type: 'IPSW', filename: appleIpsw, sizeBytes: 7400000000, md5: 'OK', status: 'READY' });
    }

    onExecuteFlash(activeFlasher, files, options);
  };

  return (
    <div className="space-y-8 perspective-1000 preserve-3d pb-10">
      {/* Protocol / Brand Switcher Tabs */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-4 overflow-x-auto scrollbar-none preserve-3d">
        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveFlasher('samsung')}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border preserve-3d ${
            activeFlasher === 'samsung'
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-white/20 shadow-[0_15px_30px_rgba(6,182,212,0.3)]'
              : 'bg-black/40 text-slate-500 border-white/5 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${activeFlasher === 'samsung' ? 'bg-white animate-pulse' : 'bg-slate-700'}`} />
          <span>SAMSUNG LOKE</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveFlasher('mtk')}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border preserve-3d ${
            activeFlasher === 'mtk'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-white/20 shadow-[0_15px_30px_rgba(168,85,247,0.3)]'
              : 'bg-black/40 text-slate-500 border-white/5 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${activeFlasher === 'mtk' ? 'bg-white animate-pulse' : 'bg-slate-700'}`} />
          <span>MEDIATEK BROM</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveFlasher('qualcomm')}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border preserve-3d ${
            activeFlasher === 'qualcomm'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-white/20 shadow-[0_15px_30px_rgba(245,158,11,0.3)]'
              : 'bg-black/40 text-slate-500 border-white/5 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${activeFlasher === 'qualcomm' ? 'bg-white animate-pulse' : 'bg-slate-700'}`} />
          <span>QUALCOMM EDL</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveFlasher('unisoc')}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border preserve-3d ${
            activeFlasher === 'unisoc'
              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-white/20 shadow-[0_15px_30px_rgba(249,115,22,0.3)]'
              : 'bg-black/40 text-slate-500 border-white/5 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${activeFlasher === 'unisoc' ? 'bg-white animate-pulse' : 'bg-slate-700'}`} />
          <span>SPD / UNISOC</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveFlasher('apple')}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border preserve-3d ${
            activeFlasher === 'apple'
              ? 'bg-gradient-to-r from-blue-600 to-slate-800 text-white border-white/20 shadow-[0_15px_30px_rgba(59,130,246,0.3)]'
              : 'bg-black/40 text-slate-500 border-white/5 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${activeFlasher === 'apple' ? 'bg-white animate-pulse' : 'bg-slate-700'}`} />
          <span>APPLE IPSW</span>
        </motion.button>
      </div>

      {/* Main Flasher Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch preserve-3d">
        {/* Left 2 Cols: File Slots & Partition Config */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl space-y-8 relative overflow-hidden preserve-3d"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-transparent to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100 shadow-inner">
                <FileCode className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight leading-tight">
                  <span>
                    {activeFlasher === 'samsung' && 'Samsung 4-File Odin Engine'}
                    {activeFlasher === 'mtk' && 'MediaTek Scatter & BROM Engine'}
                    {activeFlasher === 'qualcomm' && 'Qualcomm Sahara XML Engine'}
                    {activeFlasher === 'unisoc' && 'UNISOC PAC Runtime Engine'}
                    {activeFlasher === 'apple' && 'Apple iOS Restore Engine'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-black uppercase tracking-widest opacity-60">
                  {isAr ? 'قم بتحميل الحزم الرسمية ومطابقة الحماية' : 'Direct memory partition streaming with AES-256 block verification.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'المعالج المستهدف' : 'Target SoC'}</span>
              <span className="text-sm font-black font-mono text-cyan-600 italic uppercase tracking-tighter">
                {device.chipsetName}
              </span>
            </div>
          </div>

          {/* Samsung Odin UI Slots */}
          <div className="space-y-4 relative z-10">
            {activeFlasher === 'samsung' && (
              <div className="space-y-4">
                {(['BL', 'AP', 'CP', 'CSC', 'PIT'] as const).map((slot, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={slot} 
                    className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 group hover:border-slate-300 transition-all preserve-3d shadow-inner"
                  >
                    <div className="w-16 text-center font-black font-mono py-2 px-3 rounded-xl bg-white text-cyan-600 border border-slate-200 shadow-sm tracking-tighter text-sm italic">
                      {slot}
                    </div>
                    <input
                      type="text"
                      value={samsungFiles[slot] || ''}
                      onChange={(e) => setSamsungFiles({ ...samsungFiles, [slot]: e.target.value })}
                      className="flex-1 bg-transparent font-mono text-slate-600 text-xs px-2 focus:outline-none placeholder-slate-400 italic"
                      placeholder={`Load ${slot} archive (*.tar.md5, *.pit)...`}
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 flex items-center gap-2.5 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                    >
                      <FolderOpen className="w-4 h-4 text-cyan-600" />
                      <span>{isAr ? 'استعراض' : 'Browse'}</span>
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* MTK SP Flash UI Slots */}
            {activeFlasher === 'mtk' && (
              <div className="space-y-4">
                {[
                  { id: 'SCATTER', val: mtkScatterFile, set: setMtkScatterFile, color: 'purple' },
                  { id: 'DA AGENT', val: mtkDaFile, set: setMtkDaFile, color: 'purple' },
                  { id: 'AUTH FILE', val: mtkAuthFile, set: setMtkAuthFile, color: 'purple' }
                ].map((slot, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={slot.id} 
                    className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 group hover:border-slate-300 transition-all preserve-3d shadow-inner"
                  >
                    <div className={`w-28 text-center font-black font-mono py-2 px-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shadow-sm tracking-tighter text-xs italic`}>
                      {slot.id}
                    </div>
                    <input
                      type="text"
                      value={slot.val}
                      onChange={(e) => slot.set(e.target.value)}
                      className="flex-1 bg-transparent font-mono text-slate-600 text-xs px-2 focus:outline-none placeholder-slate-400 italic"
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 flex items-center gap-2.5 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                    >
                      <FolderOpen className={`w-4 h-4 text-purple-600`} />
                      <span>{isAr ? 'استعراض' : 'Browse'}</span>
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Qualcomm QFIL Slots */}
            {activeFlasher === 'qualcomm' && (
              <div className="space-y-4">
                {[
                  { id: 'FIREHOSE', val: qcomFirehose, set: setQcomFirehose, color: 'amber' },
                  { id: 'RAWPROGRAM', val: qcomRawProgram, set: setQcomRawProgram, color: 'amber' },
                  { id: 'PATCH0.XML', val: qcomPatch, set: setQcomPatch, color: 'amber' }
                ].map((slot, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={slot.id} 
                    className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 group hover:border-slate-300 transition-all preserve-3d shadow-inner"
                  >
                    <div className={`w-28 text-center font-black font-mono py-2 px-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm tracking-tighter text-xs italic`}>
                      {slot.id}
                    </div>
                    <input
                      type="text"
                      value={slot.val}
                      onChange={(e) => slot.set(e.target.value)}
                      className="flex-1 bg-transparent font-mono text-slate-600 text-xs px-2 focus:outline-none placeholder-slate-400 italic"
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 flex items-center gap-2.5 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                    >
                      <FolderOpen className={`w-4 h-4 text-amber-600`} />
                      <span>{isAr ? 'استعراض' : 'Browse'}</span>
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Unisoc / Apple Slots */}
            {activeFlasher === 'unisoc' && (
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 group hover:border-slate-300 transition-all preserve-3d shadow-inner"
                >
                  <div className="w-28 text-center font-black font-mono py-2 px-3 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 shadow-sm tracking-tighter text-xs italic">
                    PAC FILE
                  </div>
                  <input
                    type="text"
                    value={unisocPac}
                    onChange={(e) => setUnisocPac(e.target.value)}
                    className="flex-1 bg-transparent font-mono text-slate-600 text-xs px-2 focus:outline-none placeholder-slate-400 italic"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 flex items-center gap-2.5 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                  >
                    <FolderOpen className="w-4 h-4 text-orange-600" />
                    <span>{isAr ? 'استعراض' : 'Browse'}</span>
                  </motion.button>
                </motion.div>
              </div>
            )}

            {activeFlasher === 'apple' && (
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 group hover:border-slate-300 transition-all preserve-3d shadow-inner"
                >
                  <div className="w-28 text-center font-black font-mono py-2 px-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm tracking-tighter text-xs italic">
                    IPSW FILE
                  </div>
                  <input
                    type="text"
                    value={appleIpsw}
                    onChange={(e) => setAppleIpsw(e.target.value)}
                    className="flex-1 bg-transparent font-mono text-slate-600 text-xs px-2 focus:outline-none placeholder-slate-400 italic"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 flex items-center gap-2.5 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                  >
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                    <span>{isAr ? 'استعراض' : 'Browse'}</span>
                  </motion.button>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Col: Flashing Execution & Options Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden preserve-3d"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-rose-50 via-transparent to-transparent pointer-events-none" />
          
          <div className="space-y-8 relative z-10">
            <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-[0.3em] flex items-center gap-4 border-b border-slate-100 pb-6 leading-tight">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
              <span>{isAr ? 'خيارات وتأمين التفليش' : 'Safety Protocols'}</span>
            </h4>

            {/* Checklist Options */}
            <div className="space-y-5 px-1">
              {[
                { id: 'autoReboot', label: 'Auto Reboot system', color: 'cyan' },
                { id: 'fResetTime', label: 'F. Reset Factory Time', color: 'cyan' },
                { id: 'backupNvramFirst', label: 'Auto-Backup NVRAM/EFS', color: 'emerald' },
                { id: 'authBypass', label: 'SLA/DAA Bypass Engine', color: 'purple' },
                { id: 'repartitionPit', label: 'Force Re-Partition (PIT)', color: 'amber' }
              ].map((opt) => (
                <label 
                  key={opt.id}
                  onClick={() => toggleOption(opt.id as keyof typeof options)}
                  className={`flex items-center gap-4 cursor-pointer select-none group transition-all ${
                    options[opt.id as keyof typeof options] ? `text-${opt.color}-600` : 'text-slate-400'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    options[opt.id as keyof typeof options] 
                      ? `bg-${opt.color}-600 text-white shadow-md` 
                      : 'bg-slate-100 text-slate-300 border border-slate-200'
                  }`}>
                    {options[opt.id as keyof typeof options] ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-widest italic transition-colors duration-300 ${
                    options[opt.id as keyof typeof options] ? `text-${opt.color}-600` : 'group-hover:text-slate-600'
                  }`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Binary Rollback Index Check Indicator */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-3 shadow-inner font-mono text-[10px]">
              <div className="flex justify-between items-center text-slate-400 uppercase tracking-widest font-black opacity-60">
                <span>HW Rollback Index:</span>
                <span className="text-slate-900 text-sm italic">REV {device.rollbackIndex}.0</span>
              </div>
              <div className="h-px w-full bg-slate-200" />
              <div className="flex justify-between items-center text-slate-400 uppercase tracking-widest font-black opacity-60">
                <span>Firmware Binary:</span>
                <span className="text-emerald-600 text-sm italic">REV {device.rollbackIndex}.0</span>
              </div>
              <div className="flex justify-center pt-2">
                <div className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-black tracking-[0.2em] uppercase italic flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5" />
                  SAFE_MATCH
                </div>
              </div>
            </div>
          </div>

          {/* Flash Button */}
          <div className="mt-10 relative z-10">
            <motion.button
              whileHover={{ scale: 1.02, translateY: -3, boxShadow: "0 20px 40px rgba(6,182,212,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartFlash}
              disabled={isBusy}
              className={`w-full py-6 rounded-[1.75rem] font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-5 transition-all disabled:opacity-40 border border-white/20 relative overflow-hidden group shadow-2xl ${
                isBusy
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 text-white'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
              {isBusy ? (
                <RotateCcw className="w-6 h-6 animate-spin relative z-10" />
              ) : (
                <Play className="w-6 h-6 fill-white relative z-10 shadow-glow" />
              )}
              <span className="relative z-10">
                {isBusy ? (isAr ? 'جاري التفليش...' : 'FLASHING...') : (isAr ? 'بدء تفليش النظام' : 'INITIATE FLASH')}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
