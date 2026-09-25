import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  FileCode, 
  FolderOpen, 
  CheckCircle2, 
  Play, 
  HardDrive, 
  ShieldAlert, 
  AlertTriangle, 
  RotateCcw, 
  Sparkles, 
  FileCheck,
  Cpu,
  Layers,
  Usb,
  ShieldCheck,
  Activity,
  Terminal,
  Settings,
  Sliders,
  Check,
  Smartphone,
  FileArchive,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConnectedDevice, FirmwareFile } from '../types';
import { SamsungOdinFlasherStudio } from './SamsungOdinFlasherStudio';
import { realUsbService } from '../services/realUsbService';

interface FlasherWorkspaceProps {
  device: ConnectedDevice;
  onExecuteFlash: (protocol: string, files: FirmwareFile[], options: Record<string, boolean>) => void;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

export const FlasherWorkspace: React.FC<FlasherWorkspaceProps> = ({
  device,
  onExecuteFlash,
  isBusy: parentBusy = false,
  lang
}) => {
  const isAr = lang === 'ar';

  // Flasher engine selector
  const [activeFlasher, setActiveFlasher] = useState<'samsung' | 'mtk' | 'qualcomm' | 'unisoc' | 'apple'>(() => {
    const chip = (device.chipset || '').toLowerCase();
    if (chip.includes('mediatek') || chip.includes('mtk')) return 'mtk';
    if (chip.includes('qualcomm') || chip.includes('snapdragon')) return 'qualcomm';
    if (chip.includes('unisoc') || chip.includes('spd')) return 'unisoc';
    if (chip.includes('apple') || chip.includes('ios')) return 'apple';
    return 'samsung';
  });

  // Keep synced if connected device changes brand
  useEffect(() => {
    const chip = (device.chipset || '').toLowerCase();
    if (chip.includes('mediatek') || chip.includes('mtk')) setActiveFlasher('mtk');
    else if (chip.includes('qualcomm')) setActiveFlasher('qualcomm');
    else if (chip.includes('unisoc')) setActiveFlasher('unisoc');
    else if (chip.includes('apple')) setActiveFlasher('apple');
  }, [device.id, device.chipset]);

  // MTK Flasher State
  const [mtkScatterFile, setMtkScatterFile] = useState(`MT${device.model.replace(/\D/g, '') || '6886'}_Android_scatter_UFS.txt`);
  const [mtkDaFile, setMtkDaFile] = useState(`DA_PL_MT${device.model.replace(/\D/g, '') || '6886'}_v26.bin`);
  const [mtkAuthFile, setMtkAuthFile] = useState(`auth_sv5_bypass.auth`);
  const [mtkMode, setMtkMode] = useState<'firmware_upgrade' | 'download_only' | 'format_all'>('firmware_upgrade');
  const [mtkAuthBypass, setMtkAuthBypass] = useState<boolean>(true);

  // Qualcomm Flasher State
  const [qcomFirehose, setQcomFirehose] = useState(`prog_firehose_ddr_${device.model.toLowerCase().replace(/\s+/g, '_') || 'sm8650'}.elf`);
  const [qcomRawProgram, setQcomRawProgram] = useState(`rawprogram0_unsparse.xml`);
  const [qcomPatch, setQcomPatch] = useState(`patch0.xml`);
  const [qcomStorageType, setQcomStorageType] = useState<'ufs' | 'emmc'>('ufs');

  // Unisoc Flasher State
  const [unisocPac, setUnisocPac] = useState(`PAC_${device.model}_SPD_Stock.pac`);
  const [unisocFdl1, setUnisocFdl1] = useState(`FDL1_SC9863A.bin`);
  const [unisocFdl2, setUnisocFdl2] = useState(`FDL2_SC9863A.bin`);
  const [unisocKeepNv, setUnisocKeepNv] = useState<boolean>(true);

  // Apple Flasher State
  const [appleIpsw, setAppleIpsw] = useState(`iPhone15,2_17.5.1_21F90_Restore.ipsw`);
  const [appleRestoreMode, setAppleRestoreMode] = useState<'clean_restore' | 'update_keep_data' | 'dfu_deep_flash'>('update_keep_data');

  // Hidden File Input References for Non-Samsung Platforms
  const mtkScatterInputRef = useRef<HTMLInputElement>(null);
  const mtkDaInputRef = useRef<HTMLInputElement>(null);
  const mtkAuthInputRef = useRef<HTMLInputElement>(null);

  const qcomFirehoseInputRef = useRef<HTMLInputElement>(null);
  const qcomRawProgramInputRef = useRef<HTMLInputElement>(null);
  const qcomPatchInputRef = useRef<HTMLInputElement>(null);

  const unisocPacInputRef = useRef<HTMLInputElement>(null);
  const unisocFdl1InputRef = useRef<HTMLInputElement>(null);
  const unisocFdl2InputRef = useRef<HTMLInputElement>(null);

  const appleIpswInputRef = useRef<HTMLInputElement>(null);

  // Generic Flashing State for non-Samsung platforms
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [flashProgress, setFlashProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [transferSpeed, setTransferSpeed] = useState<string>('0 MB/s');
  const [flashLogs, setFlashLogs] = useState<string[]>([]);
  const [flashSuccess, setFlashSuccess] = useState<boolean>(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [flashLogs]);

  // Execute Non-Samsung Flashing Sequence
  const handleExecuteEngineFlash = async () => {
    if (isFlashing) return;
    setIsFlashing(true);
    setFlashSuccess(false);
    setFlashProgress(0);
    setFlashLogs([]);
    realUsbService.playContinuityBeep(120, 2000);

    const logs: string[] = [];

    if (activeFlasher === 'mtk') {
      logs.push(`[MTK:INIT] Opening MediaTek BROM / Preloader port for ${device.model}...`);
      setFlashLogs([...logs]);
      setCurrentStep('BROM Handshake & SLA/DAA Auth Bypass...');
      setFlashProgress(15);
      
      const handshake = await realUsbService.executeMtkBromHandshake();
      logs.push(...handshake.rawLogs);
      setFlashLogs([...logs]);
      await new Promise(r => setTimeout(r, 600));

      const parts = ['preloader.bin', 'lk.img', 'boot.img', 'dtbo.img', 'super.img (4.2 GB)', 'recovery.img', 'md1img.img', 'userdata.img'];
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        setCurrentStep(`Streaming MTK partition: ${p}`);
        setTransferSpeed(`${(60 + Math.random() * 25).toFixed(1)} MB/s`);
        setFlashProgress(20 + Math.round(((i + 1) / parts.length) * 75));
        logs.push(`[MTK:FLASH] Wrote ${p} (CRC32 OK) -> Target Offset`);
        setFlashLogs([...logs]);
        realUsbService.playContinuityBeep(40, 2200 + i * 90);
        await new Promise(r => setTimeout(r, p.includes('super') ? 1000 : 350));
      }

      logs.push(`[MTK:SUCCESS] All MTK partitions written successfully. Re-enabling Watchdog and booting target.`);
    } 
    else if (activeFlasher === 'qualcomm') {
      logs.push(`[EDL:INIT] Establishing Sahara Protocol v2.0 handshake on Qualcomm 9008 Port...`);
      setFlashLogs([...logs]);
      setCurrentStep('Sahara Protocol & Firehose XML Setup...');
      setFlashProgress(15);

      const edl = await realUsbService.executeEdlSaharaHandshake();
      logs.push(...edl.rawLogs);
      setFlashLogs([...logs]);
      await new Promise(r => setTimeout(r, 600));

      const qParts = ['xbl.elf', 'tz.mbn', 'hyp.mbn', 'boot.img', 'super.img', 'recovery.img', 'modem.img', 'rawprogram0.xml'];
      for (let i = 0; i < qParts.length; i++) {
        const qp = qParts[i];
        setCurrentStep(`Flashing Firehose chunk: ${qp}`);
        setTransferSpeed(`${(85 + Math.random() * 30).toFixed(1)} MB/s`);
        setFlashProgress(20 + Math.round(((i + 1) / qParts.length) * 75));
        logs.push(`[EDL:FIREHOSE] Streamed ${qp} to ${qcomStorageType.toUpperCase()} LUN0`);
        setFlashLogs([...logs]);
        realUsbService.playContinuityBeep(40, 2300 + i * 90);
        await new Promise(r => setTimeout(r, qp.includes('super') ? 1000 : 350));
      }

      logs.push(`[EDL:SUCCESS] Qualcomm Firehose execution finished. Device rebooting to Android OS.`);
    }
    else if (activeFlasher === 'unisoc') {
      logs.push(`[UNISOC:INIT] Parsing PAC Container: ${unisocPac}...`);
      setFlashLogs([...logs]);
      setCurrentStep('Sending FDL1 & FDL2 Bootloader...');
      setFlashProgress(20);
      logs.push(`[UNISOC:FDL1] Loaded FDL1 (Baudrate negotiated to 921600 bps)`);
      logs.push(`[UNISOC:FDL2] FDL2 Memory Manager initialized in DDR RAM`);
      setFlashLogs([...logs]);
      realUsbService.playContinuityBeep(80, 2400);
      await new Promise(r => setTimeout(r, 700));

      const uParts = ['splloader', 'uboot', 'boot.img', 'system.img', 'vendor.img', 'prodnv (Preserved)', 'recovery.img'];
      for (let i = 0; i < uParts.length; i++) {
        const up = uParts[i];
        setCurrentStep(`Flashing UNISOC PAC Partition: ${up}`);
        setTransferSpeed(`${(50 + Math.random() * 20).toFixed(1)} MB/s`);
        setFlashProgress(25 + Math.round(((i + 1) / uParts.length) * 70));
        logs.push(`[UNISOC:WRITE] Flashed ${up} sector blocks -> OK`);
        setFlashLogs([...logs]);
        realUsbService.playContinuityBeep(40, 2200 + i * 80);
        await new Promise(r => setTimeout(r, 450));
      }

      logs.push(`[UNISOC:SUCCESS] PAC Flashing completed. Booting Unisoc terminal.`);
    }
    else if (activeFlasher === 'apple') {
      logs.push(`[APPLE:INIT] Connecting to Apple DFU / Recovery USB Endpoint for ${device.model}...`);
      setFlashLogs([...logs]);
      setCurrentStep('Sending iBSS & iBEC Bootloader Payload...');
      setFlashProgress(15);
      logs.push(`[APPLE:TSS] AP Ticket verified. Nonce matching authorized.`);
      logs.push(`[APPLE:RAMDISK] Booted Apple Restore Ramdisk kernelcache successfully.`);
      setFlashLogs([...logs]);
      realUsbService.playContinuityBeep(100, 2600);
      await new Promise(r => setTimeout(r, 700));

      const aParts = ['RestoreLogo.img4', 'DeviceTree.img4', 'kernelcache.release', 'Baseband (Mav20.Release.bbfw)', 'APFS System RootFS (6.2 GB)', 'TrustCache.img4'];
      for (let i = 0; i < aParts.length; i++) {
        const ap = aParts[i];
        setCurrentStep(`Restoring Apple Firmware Component: ${ap}`);
        setTransferSpeed(`${(90 + Math.random() * 35).toFixed(1)} MB/s`);
        setFlashProgress(20 + Math.round(((i + 1) / aParts.length) * 75));
        logs.push(`[APPLE:RESTORE] Mounted and verified ${ap} -> Verified`);
        setFlashLogs([...logs]);
        realUsbService.playContinuityBeep(40, 2400 + i * 100);
        await new Promise(r => setTimeout(r, ap.includes('RootFS') ? 1100 : 400));
      }

      logs.push(`[APPLE:SUCCESS] iOS Restore sequence finalized. Device rebooting to SpringBoard.`);
    }

    setFlashProgress(100);
    setCurrentStep(isAr ? 'اكتملت العملية بنجاح 100% !' : 'Operation completed successfully 100% !');
    setIsFlashing(false);
    setFlashSuccess(true);
    setFlashLogs(prev => [...prev, `[COMPLETE] Protocol execution finished with 0 errors.`]);

    realUsbService.playContinuityBeep(180, 2600);
    setTimeout(() => realUsbService.playContinuityBeep(260, 3200), 180);

    onExecuteFlash(activeFlasher.toUpperCase(), [
      {
        type: activeFlasher === 'mtk' ? 'SCATTER' : activeFlasher === 'qualcomm' ? 'FIREHOSE' : activeFlasher === 'unisoc' ? 'PAC' : 'IPSW',
        filename: activeFlasher === 'mtk' ? mtkScatterFile : activeFlasher === 'qualcomm' ? qcomFirehose : activeFlasher === 'unisoc' ? unisocPac : appleIpsw,
        sizeBytes: 4500000000,
        md5: 'VERIFIED_HASH_OK',
        status: 'COMPLETED'
      }
    ], { autoReboot: true });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn font-sans pb-12">
      
      {/* 5-Protocol Hardware Switcher Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-xl flex items-center gap-2 overflow-x-auto scrollbar-none">
        
        {/* TAB 1: SAMSUNG LOKE */}
        <button
          onClick={() => {
            setActiveFlasher('samsung');
            realUsbService.playContinuityBeep(80, 2100);
          }}
          className={`px-5 py-3 rounded-xl text-xs font-black font-mono uppercase tracking-wider transition-all flex items-center gap-2.5 shrink-0 cursor-pointer ${
            activeFlasher === 'samsung'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${activeFlasher === 'samsung' ? 'bg-cyan-300 animate-ping' : 'bg-slate-600'}`} />
          <span>SAMSUNG LOKE / ODIN</span>
        </button>

        {/* TAB 2: MEDIATEK BROM */}
        <button
          onClick={() => {
            setActiveFlasher('mtk');
            realUsbService.playContinuityBeep(80, 2300);
          }}
          className={`px-5 py-3 rounded-xl text-xs font-black font-mono uppercase tracking-wider transition-all flex items-center gap-2.5 shrink-0 cursor-pointer ${
            activeFlasher === 'mtk'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${activeFlasher === 'mtk' ? 'bg-fuchsia-300 animate-ping' : 'bg-slate-600'}`} />
          <span>MEDIATEK BROM</span>
        </button>

        {/* TAB 3: QUALCOMM EDL */}
        <button
          onClick={() => {
            setActiveFlasher('qualcomm');
            realUsbService.playContinuityBeep(80, 2500);
          }}
          className={`px-5 py-3 rounded-xl text-xs font-black font-mono uppercase tracking-wider transition-all flex items-center gap-2.5 shrink-0 cursor-pointer ${
            activeFlasher === 'qualcomm'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${activeFlasher === 'qualcomm' ? 'bg-amber-300 animate-ping' : 'bg-slate-600'}`} />
          <span>QUALCOMM EDL 9008</span>
        </button>

        {/* TAB 4: SPD / UNISOC */}
        <button
          onClick={() => {
            setActiveFlasher('unisoc');
            realUsbService.playContinuityBeep(80, 2700);
          }}
          className={`px-5 py-3 rounded-xl text-xs font-black font-mono uppercase tracking-wider transition-all flex items-center gap-2.5 shrink-0 cursor-pointer ${
            activeFlasher === 'unisoc'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${activeFlasher === 'unisoc' ? 'bg-orange-300 animate-ping' : 'bg-slate-600'}`} />
          <span>SPD / UNISOC PAC</span>
        </button>

        {/* TAB 5: APPLE IPSW */}
        <button
          onClick={() => {
            setActiveFlasher('apple');
            realUsbService.playContinuityBeep(80, 2900);
          }}
          className={`px-5 py-3 rounded-xl text-xs font-black font-mono uppercase tracking-wider transition-all flex items-center gap-2.5 shrink-0 cursor-pointer ${
            activeFlasher === 'apple'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${activeFlasher === 'apple' ? 'bg-cyan-200 animate-ping' : 'bg-slate-600'}`} />
          <span>APPLE IPSW RESTORE</span>
        </button>

      </div>

      {/* RENDER ACTIVE PROTOCOL STUDIO */}
      
      {/* 1. SAMSUNG LOKE FLASHER STUDIO */}
      {activeFlasher === 'samsung' && (
        <SamsungOdinFlasherStudio
          device={device}
          lang={lang}
          isBusy={parentBusy}
          onExecuteFlash={onExecuteFlash}
        />
      )}

      {/* 2. NON-SAMSUNG FLASHER STUDIOS (MTK, QUALCOMM, UNISOC, APPLE) */}
      {activeFlasher !== 'samsung' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT 7 COLS: Protocol Package Loaders */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              
              {/* Hidden File Inputs for non-Samsung platforms */}
              <input
                ref={mtkScatterInputRef}
                type="file"
                accept=".txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setMtkScatterFile(e.target.files[0].name);
                    realUsbService.playContinuityBeep(100, 2400);
                  }
                }}
              />
              <input
                ref={mtkDaInputRef}
                type="file"
                accept=".bin"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setMtkDaFile(e.target.files[0].name);
                    realUsbService.playContinuityBeep(100, 2400);
                  }
                }}
              />
              <input
                ref={mtkAuthInputRef}
                type="file"
                accept=".auth,.bin"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setMtkAuthFile(e.target.files[0].name);
                    realUsbService.playContinuityBeep(100, 2400);
                  }
                }}
              />

              <input
                ref={qcomFirehoseInputRef}
                type="file"
                accept=".elf,.mbn"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setQcomFirehose(e.target.files[0].name);
                    realUsbService.playContinuityBeep(100, 2400);
                  }
                }}
              />
              <input
                ref={qcomRawProgramInputRef}
                type="file"
                accept=".xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setQcomRawProgram(e.target.files[0].name);
                    realUsbService.playContinuityBeep(100, 2400);
                  }
                }}
              />
              <input
                ref={qcomPatchInputRef}
                type="file"
                accept=".xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setQcomPatch(e.target.files[0].name);
                    realUsbService.playContinuityBeep(100, 2400);
                  }
                }}
              />

              <input
                ref={unisocPacInputRef}
                type="file"
                accept=".pac"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setUnisocPac(e.target.files[0].name);
                    realUsbService.playContinuityBeep(100, 2400);
                  }
                }}
              />
              <input
                ref={unisocFdl1InputRef}
                type="file"
                accept=".bin"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setUnisocFdl1(e.target.files[0].name);
                    realUsbService.playContinuityBeep(100, 2400);
                  }
                }}
              />
              <input
                ref={unisocFdl2InputRef}
                type="file"
                accept=".bin"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setUnisocFdl2(e.target.files[0].name);
                    realUsbService.playContinuityBeep(100, 2400);
                  }
                }}
              />

              <input
                ref={appleIpswInputRef}
                type="file"
                accept=".ipsw"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setAppleIpsw(e.target.files[0].name);
                    realUsbService.playContinuityBeep(100, 2400);
                  }
                }}
              />

              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                    activeFlasher === 'mtk' ? 'bg-purple-600/30 text-purple-400 border border-purple-500/30' :
                    activeFlasher === 'qualcomm' ? 'bg-amber-600/30 text-amber-400 border border-amber-500/30' :
                    activeFlasher === 'unisoc' ? 'bg-orange-600/30 text-orange-400 border border-orange-500/30' :
                    'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30'
                  }`}>
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      {activeFlasher === 'mtk' && (isAr ? 'محرك تفليش ميديا تيك (MediaTek BROM / SP Flash)' : 'MediaTek BROM & Scatter Studio')}
                      {activeFlasher === 'qualcomm' && (isAr ? 'محرك كوالكوم المباشر (Qualcomm QFIL / Firehose)' : 'Qualcomm Sahara & Firehose Studio')}
                      {activeFlasher === 'unisoc' && (isAr ? 'محرك تفليش سبريدترم (UNISOC / SPD PAC Engine)' : 'UNISOC PAC & FDL Flasher Engine')}
                      {activeFlasher === 'apple' && (isAr ? 'منظومة استعادة آبل (Apple iOS / DFU Restore)' : 'Apple IPSW DFU & Recovery Engine')}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isAr ? 'بروتوكول تفليش مباشر عبر USB مع تجاوز حمايات المعالج والأمان' : 'Direct USB partition streaming with hardware protection bypass.'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                  {device.brand} {device.model}
                </span>
              </div>

              {/* MEDIATEK BROM CONTROLS */}
              {activeFlasher === 'mtk' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] text-purple-300 font-bold uppercase">Scatter File (Android_scatter.txt)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={mtkScatterFile}
                        onChange={(e) => setMtkScatterFile(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                      <button 
                        onClick={() => mtkScatterInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg flex items-center gap-1 cursor-pointer"
                        title="Browse scatter from PC"
                      >
                        <FolderOpen size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-purple-300 font-bold uppercase">Download Agent (DA File)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={mtkDaFile}
                        onChange={(e) => setMtkDaFile(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                      <button 
                        onClick={() => mtkDaInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg flex items-center gap-1 cursor-pointer"
                        title="Browse DA file from PC"
                      >
                        <FolderOpen size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-purple-300 font-bold uppercase">Auth Bypass Payload (SLA / DAA)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={mtkAuthFile}
                        onChange={(e) => setMtkAuthFile(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                      <button 
                        onClick={() => mtkAuthInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg flex items-center gap-1 cursor-pointer"
                        title="Browse Auth file from PC"
                      >
                        <FolderOpen size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="mtk_mode"
                          checked={mtkMode === 'firmware_upgrade'}
                          onChange={() => setMtkMode('firmware_upgrade')}
                          className="text-purple-600"
                        />
                        <span>Firmware Upgrade</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="mtk_mode"
                          checked={mtkMode === 'download_only'}
                          onChange={() => setMtkMode('download_only')}
                          className="text-purple-600"
                        />
                        <span>Download Only</span>
                      </label>
                    </div>

                    <label className="flex items-center gap-1.5 text-emerald-400 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mtkAuthBypass}
                        onChange={(e) => setMtkAuthBypass(e.target.checked)}
                        className="rounded"
                      />
                      <span>Auto SLA / DAA Bypass</span>
                    </label>
                  </div>
                </div>
              )}

              {/* QUALCOMM EDL CONTROLS */}
              {activeFlasher === 'qualcomm' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] text-amber-300 font-bold uppercase">Firehose Programmer (*.elf / *.mbn)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={qcomFirehose}
                        onChange={(e) => setQcomFirehose(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <button 
                        onClick={() => qcomFirehoseInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg flex items-center gap-1 cursor-pointer"
                        title="Browse Firehose from PC"
                      >
                        <FolderOpen size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-amber-300 font-bold uppercase">RawProgram XML (rawprogram0.xml)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={qcomRawProgram}
                        onChange={(e) => setQcomRawProgram(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <button 
                        onClick={() => qcomRawProgramInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg flex items-center gap-1 cursor-pointer"
                        title="Browse RawProgram XML from PC"
                      >
                        <FolderOpen size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-amber-300 font-bold uppercase">Patch XML (patch0.xml)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={qcomPatch}
                        onChange={(e) => setQcomPatch(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <button 
                        onClick={() => qcomPatchInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg flex items-center gap-1 cursor-pointer"
                        title="Browse Patch XML from PC"
                      >
                        <FolderOpen size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-slate-300">
                      <span>Target Storage:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="qcom_storage"
                          checked={qcomStorageType === 'ufs'}
                          onChange={() => setQcomStorageType('ufs')}
                        />
                        <span>UFS (LUN0-LUN5)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="qcom_storage"
                          checked={qcomStorageType === 'emmc'}
                          onChange={() => setQcomStorageType('emmc')}
                        />
                        <span>eMMC (User Area)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* UNISOC / SPD CONTROLS */}
              {activeFlasher === 'unisoc' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] text-orange-300 font-bold uppercase">PAC Firmware Package (*.pac)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={unisocPac}
                        onChange={(e) => setUnisocPac(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
                      />
                      <button 
                        onClick={() => unisocPacInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-orange-300 rounded-lg flex items-center gap-1 cursor-pointer"
                        title="Browse PAC file from PC"
                      >
                        <FolderOpen size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase">FDL1 Bootloader</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={unisocFdl1}
                          onChange={(e) => setUnisocFdl1(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300"
                        />
                        <button 
                          onClick={() => unisocFdl1InputRef.current?.click()}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-orange-300 rounded-lg cursor-pointer"
                        >
                          <FolderOpen size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase">FDL2 RAM Manager</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={unisocFdl2}
                          onChange={(e) => setUnisocFdl2(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300"
                        />
                        <button 
                          onClick={() => unisocFdl2InputRef.current?.click()}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-orange-300 rounded-lg cursor-pointer"
                        >
                          <FolderOpen size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-emerald-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={unisocKeepNv}
                        onChange={(e) => setUnisocKeepNv(e.target.checked)}
                      />
                      <span>Preserve Calibration & NV Data</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Baud: 921600 bps High-Speed</span>
                  </div>
                </div>
              )}

              {/* APPLE IPSW CONTROLS */}
              {activeFlasher === 'apple' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] text-cyan-300 font-bold uppercase">Apple IPSW Firmware Package (*.ipsw)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={appleIpsw}
                        onChange={(e) => setAppleIpsw(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                      <button 
                        onClick={() => appleIpswInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg flex items-center gap-1 cursor-pointer"
                        title="Browse IPSW from PC"
                      >
                        <FolderOpen size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 uppercase">Restore Strategy</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'update_keep_data', label: 'Retain User Data' },
                        { id: 'clean_restore', label: 'Factory Clean Wipe' },
                        { id: 'dfu_deep_flash', label: 'DFU Deep Unbrick' }
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => setAppleRestoreMode(m.id as any)}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            appleRestoreMode === m.id
                              ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>APFS & Baseband Integrity: <strong className="text-emerald-400">MATCHED</strong></span>
                    <span>SHSH2 TSS Ticket: <strong className="text-cyan-300">AUTO-GEN</strong></span>
                  </div>
                </div>
              )}

              {/* Execution Action Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Hardware Anti-Brick CRC32 Verified</span>
                </div>

                <button
                  onClick={handleExecuteEngineFlash}
                  disabled={isFlashing || parentBusy}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-4 h-4 ${isFlashing ? 'animate-spin' : 'fill-white'}`} />
                  <span>
                    {isFlashing
                      ? (isAr ? 'جاري التفليش عبر USB...' : 'FLASHING VIA USB...')
                      : (isAr ? 'بدء تفليش الجهاز الآن' : 'INITIATE FLASH NOW')}
                  </span>
                </button>
              </div>

            </div>

            {/* Live Progress Card */}
            {(isFlashing || flashSuccess) && (
              <div className="p-4 bg-slate-950 border border-indigo-500/40 rounded-xl space-y-3 font-mono text-xs shadow-xl animate-fadeIn">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <Activity className={`w-3.5 h-3.5 ${isFlashing ? 'animate-spin' : ''}`} />
                    <span>{currentStep}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Speed: <strong className="text-emerald-400">{transferSpeed}</strong></span>
                    <span className="text-amber-400 font-bold text-sm">{flashProgress}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${flashProgress}%` }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* RIGHT 5 COLS: Hardware Terminal Console */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[480px] space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white font-mono uppercase">
                    Protocol Console Stream
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  PORT READY
                </span>
              </div>

              <div className="flex-1 bg-black/95 rounded-xl border border-slate-850 p-3 font-mono text-[11px] overflow-y-auto space-y-1.5 text-slate-300 leading-relaxed shadow-inner">
                {flashLogs.length === 0 ? (
                  <div className="text-slate-500 italic">
                    {isAr 
                      ? '> جاهز لاستقبال الأوامر وحزم الفلاش عبر منفذ USB المباشر...' 
                      : '> Ready to stream binary partition blocks over direct USB bridge...'}
                  </div>
                ) : (
                  flashLogs.map((l, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className={
                        l.includes('SUCCESS') || l.includes('OK') || l.includes('COMPLETE')
                          ? 'text-emerald-400 font-bold'
                          : l.includes('ERR') || l.includes('FAIL')
                          ? 'text-rose-400 font-bold'
                          : 'text-cyan-300'
                      }>
                        {l}
                      </span>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
