import React, { useState } from 'react';
import { 
  HardDrive, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  Activity, 
  Binary, 
  Zap, 
  Search, 
  RefreshCw, 
  FileCode, 
  Download, 
  Wrench, 
  Sparkles, 
  Radio, 
  Database,
  Lock,
  Unlock,
  Maximize2
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { audioSynth } from '../utils/audioSynth';

interface UfsMemoryProgrammerStudioProps {
  device: ConnectedDevice;
  lang: 'en' | 'ar';
}

export interface UfsLunPartition {
  lunIndex: number;
  name: string;
  sizeGb: number;
  rawType: string;
  filesystem: string;
  status: 'MOUNTED' | 'LOCKED' | 'CORRUPTED' | 'RAW';
  purposeAr: string;
  purposeEn: string;
}

export interface IspPinoutPoint {
  pinName: string;
  signalType: string;
  requiredVoltage: string;
  wireColorHex: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const UFS_PINOUT_PACKAGES = [
  {
    id: 'bga-254-ufs31',
    name: 'UFS 3.1 BGA-254 (Samsung KLUEG / SK Hynix)',
    type: 'UFS 3.1 + LPDDR5 PoP',
    voltageVcc: '3.3V',
    voltageVccq2: '1.2V',
    pinouts: [
      { pinName: 'VCC (3.3V)', signalType: 'Power Rail', requiredVoltage: '3.3V DC', wireColorHex: '#ef4444', descriptionAr: 'تغذية ناند الذاكرة الرئيسية', descriptionEn: 'Main NAND Flash power supply' },
      { pinName: 'VCCQ2 (1.2V)', signalType: 'Logic I/O', requiredVoltage: '1.2V DC', wireColorHex: '#f59e0b', descriptionAr: 'تغذية منطق الإشارة عالية السرعة', descriptionEn: 'High-speed logic signal power rail' },
      { pinName: 'UFS_TX0_P / N', signalType: 'Tx Lane 0', requiredVoltage: 'Differential High-Speed', wireColorHex: '#06b6d4', descriptionAr: 'مسار إرسال البيانات المزدوج رقم 0', descriptionEn: 'Differential data transmission lane 0' },
      { pinName: 'UFS_RX0_P / N', signalType: 'Rx Lane 0', requiredVoltage: 'Differential High-Speed', wireColorHex: '#3b82f6', descriptionAr: 'مسار استقبال البيانات المزدوج رقم 0', descriptionEn: 'Differential data reception lane 0' },
      { pinName: 'UFS_RST_N', signalType: 'Reset Line', requiredVoltage: '1.8V Pulse', wireColorHex: '#a855f7', descriptionAr: 'خط إعادة ضبط الشريحة (سحب لمقاومة 10K)', descriptionEn: 'Chip hardware reset trigger line' },
      { pinName: 'GND (Common Ground)', signalType: 'Ground', requiredVoltage: '0V / GND', wireColorHex: '#64748b', descriptionAr: 'أرضي البوردة المشترك', descriptionEn: 'Common PCB chassis ground' }
    ]
  },
  {
    id: 'bga-153-emmc51',
    name: 'eMMC 5.1 BGA-153 (SanDisk / Micron / Samsung)',
    type: 'eMMC 5.1 Legacy NAND',
    voltageVcc: '3.3V',
    voltageVccq2: '1.8V',
    pinouts: [
      { pinName: 'VCC (3.3V)', signalType: 'Power Rail', requiredVoltage: '3.3V DC', wireColorHex: '#ef4444', descriptionAr: 'تغذية الـ eMMC الكهرومغناطيسية', descriptionEn: 'eMMC core voltage supply' },
      { pinName: 'VCCQ (1.8V)', signalType: 'I/O Bus Voltage', requiredVoltage: '1.8V DC', wireColorHex: '#f59e0b', descriptionAr: 'تغذية ناقل البيانات والبروتوكول', descriptionEn: 'I/O bus logic voltage rail' },
      { pinName: 'CLK (Clock 200MHz)', signalType: 'HS200 Clock', requiredVoltage: '1.8V Peak', wireColorHex: '#10b981', descriptionAr: 'خط نبضات الساعة (يربط بمقاومة 100Ω)', descriptionEn: 'High-speed clock bus (requires 100Ω inline resistor)' },
      { pinName: 'CMD (Command)', signalType: 'Control Line', requiredVoltage: '1.8V Logic', wireColorHex: '#eab308', descriptionAr: 'خط الأوامر والعناوين', descriptionEn: 'Command and register address line' },
      { pinName: 'DAT0 (Data Line 0)', signalType: 'Data Bit 0', requiredVoltage: '1.8V Logic', wireColorHex: '#06b6d4', descriptionAr: 'مسار البيانات الرئيسي لنقل الفلاشات', descriptionEn: 'Primary data line for ISP dumping' },
      { pinName: 'GND', signalType: 'Ground', requiredVoltage: '0V / GND', wireColorHex: '#64748b', descriptionAr: 'أرضي مشترك', descriptionEn: 'Common ground' }
    ]
  }
];

export const INITIAL_LUNS: UfsLunPartition[] = [
  { lunIndex: 0, name: 'LUN0 (Boot 1)', sizeGb: 0.032, rawType: 'UFS Boot Partition A', filesystem: 'RAW / GUID', status: 'MOUNTED', purposeAr: 'يحتوي على لودر الإقلاع الأولي XBL / Primary Bootloader', purposeEn: 'Primary bootloader executable (XBL / ABL)' },
  { lunIndex: 1, name: 'LUN1 (Boot 2)', sizeGb: 0.032, rawType: 'UFS Boot Partition B', filesystem: 'RAW / GUID', status: 'MOUNTED', purposeAr: 'نسخة البوت الاحتياطية للطوارئ (Backup Bootloader)', purposeEn: 'Backup emergency bootloader image' },
  { lunIndex: 2, name: 'LUN2 (RPMB Key)', sizeGb: 0.016, rawType: 'Replay Protected Memory', filesystem: 'ENCRYPTED_RPMB', status: 'LOCKED', purposeAr: 'منطقة مفاتيح التشفير المحمية ضد التلاعب (Rollback & Knox)', purposeEn: 'Replay protected key store (Anti-rollback / Knox)' },
  { lunIndex: 3, name: 'LUN3 (System / Vendor)', sizeGb: 64.0, rawType: 'Android System & Vendor', filesystem: 'EROFS / EXT4', status: 'MOUNTED', purposeAr: 'ملفات النظام والتطبيقات الرسمية وشجرة البرامج', purposeEn: 'Android OS partition tree & vendor drivers' },
  { lunIndex: 4, name: 'LUN4 (Userdata & Data)', sizeGb: 440.0, rawType: 'User Encrypted Storage', filesystem: 'F2FS (FBE Encrypted)', status: 'MOUNTED', purposeAr: 'بيانات المستخدم، الصور، والملفات المشفرة بـ FBE', purposeEn: 'User file storage & File-Based Encryption data' }
];

export const UfsMemoryProgrammerStudio: React.FC<UfsMemoryProgrammerStudioProps> = ({
  device,
  lang
}) => {
  const isAr = lang === 'ar';
  
  const [activeTab, setActiveTab] = useState<'health' | 'pinouts' | 'hex-dump' | 'partitions'>('health');
  const [selectedBgaPackageId, setSelectedBgaPackageId] = useState<string>('bga-254-ufs31');
  const [isReadingHealth, setIsReadingHealth] = useState<boolean>(false);
  const [healthScore, setHealthScore] = useState<number>(92); // 92% healthy
  const [lifetimeEstA, setLifetimeEstA] = useState<string>('0x01 (0% - 10% device life used)');
  const [lifetimeEstB, setLifetimeEstB] = useState<string>('0x01 (0% - 10% device life used)');
  const [slcHealth, setSlcHealth] = useState<string>('0x01 (NORMAL_SLC_HEALTH)');
  const [rpmbStatus, setRpmbStatus] = useState<string>('PROVISIONED_AND_VALID');
  const [activeLunIdx, setActiveLunIdx] = useState<number>(0);

  React.useEffect(() => {
    // Automatically select package bga-153-emmc51 for older chipsets, else bga-254-ufs31
    if (device.chipset === 'unisoc_spd' || device.brand.toUpperCase() === 'INFINIX' || device.brand.toUpperCase() === 'TECNO') {
      setSelectedBgaPackageId('bga-153-emmc51');
    } else {
      setSelectedBgaPackageId('bga-254-ufs31');
    }
  }, [device]);
  
  // Simulated Hex Dump Viewer Data
  const [hexOffset, setHexOffset] = useState<string>('0x00000000');
  
  const selectedBga = UFS_PINOUT_PACKAGES.find(p => p.id === selectedBgaPackageId) || UFS_PINOUT_PACKAGES[0];

  const handleScanMemoryHealth = () => {
    audioSynth.playMultimeterBeep();
    setIsReadingHealth(true);
    setTimeout(() => {
      setIsReadingHealth(false);
      setHealthScore(88);
      setLifetimeEstA('0x01 (0% - 10% used)');
      setLifetimeEstB('0x02 (10% - 20% used)');
      setSlcHealth('0x01 (HEALTHY)');
      setRpmbStatus('PROVISIONED_VALID_KEY');
      audioSynth.playShortCircuitAlarm();
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/20">
            <HardDrive className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {isAr ? 'برمجية واختبار ذاكرات الـ UFS 4.0 / eMMC ووصلات الـ ISP (UFS Programmer Studio)' : 'UFS 4.0 & eMMC Memory Programmer Studio'}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                UFS 4.0 / eMMC 5.1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'فحص نسبة استهلاك شرائح الذاكرة (Health & Wear-Out)، قراءة مفاتيح الـ RPMB، ومخططات توصيل السلاك المباشرة ISP BGA 254/153'
                : 'Analyze memory lifetime estimation, RPMB key integrity, partition structures, and ISP pinout wiring.'}
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={handleScanMemoryHealth}
          disabled={isReadingHealth}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isReadingHealth ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'فحص صحة الذاكرة والـ RPMB' : 'Scan Memory Health & RPMB'}</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => {
            setActiveTab('health');
            audioSynth.playMultimeterBeep();
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'health'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isAr ? 'تحليل صحة واستهلاك الذاكرة (NAND Lifetime)' : 'Memory Lifetime & Health'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('pinouts');
            audioSynth.playMultimeterBeep();
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'pinouts'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isAr ? 'مخططات لحام نقاط الـ ISP (BGA Pinouts)' : 'ISP & BGA Pinout Wiring'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('partitions');
            audioSynth.playMultimeterBeep();
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'partitions'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{isAr ? 'إدارة تقسيمات الـ LUNs والبارتيشن' : 'LUNs & Partition Table'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('hex-dump');
            audioSynth.playMultimeterBeep();
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'hex-dump'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Binary className="w-4 h-4" />
          <span>{isAr ? 'مستعرض الهيكس والدامب الحي (Hex Viewer)' : 'HEX Dump Viewer'}</span>
        </button>
      </div>

      {/* Tab 1: Memory Health & Lifetime Wear-Out */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Health Score Gauge Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 shadow-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isAr ? 'مؤشر سلامة الذاكرة العام' : 'Overall Memory Health'}</span>
              <div className="relative w-28 h-28 flex items-center justify-center my-1">
                <div className="w-full h-full rounded-full border-8 border-slate-800 border-t-emerald-500 border-r-emerald-500 flex items-center justify-center">
                  <span className="text-2xl font-mono font-bold text-emerald-400">{healthScore}%</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isAr ? 'حالة ممتازة (HEALTHY)' : 'HEALTHY NAND'}
              </span>
            </div>

            {/* Lifetime Estimation A/B */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg col-span-1 md:col-span-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-slate-800 pb-2">
                {isAr ? 'سجل تقدير عمر الخلايا التراكمي (UFS Health Descriptor Log):' : 'UFS Health Descriptor Log:'}
              </span>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">{isAr ? 'عمر خلايا الجهاز A (Lifetime Estimation A):' : 'Device Lifetime Est A:'}</span>
                  <span className="text-cyan-300 font-bold">{lifetimeEstA}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">{isAr ? 'عمر خلايا الجهاز B (Lifetime Estimation B):' : 'Device Lifetime Est B:'}</span>
                  <span className="text-indigo-300 font-bold">{lifetimeEstB}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">{isAr ? 'سلامة خلايا الـ SLC Buffer (Pre-SLC Health):' : 'SLC Health Index:'}</span>
                  <span className="text-emerald-400 font-bold">{slcHealth}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">{isAr ? 'حالة منطقة الـ RPMB (Knox / Rollback Key):' : 'RPMB Provision State:'}</span>
                  <span className="text-amber-300 font-bold">{rpmbStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Memory Diagnostic Summary */}
          <div className="p-4 bg-slate-900 border border-indigo-500/30 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>{isAr ? 'تقرير فحص الذاكرة الذكي (UFS Memory AI Diagnosis):' : 'UFS Memory AI Diagnostic Report:'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {isAr
                ? '✓ شريحة الذاكرة تعمل بكفاءة عالية ولم تتجاوز 10% من دورة الاستهلاك الكلية (TBW Endurance). مفتاح التشفير RPMB سليم وموثق. لا توجد حاجة للاستبدال أو تغيير شريحة الـ UFS.'
                : '✓ Memory IC operates at high integrity under 10% cumulative TBW endurance. RPMB hardware key verified. No chip replacement required.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: ISP & BGA Pinout Wiring */}
      {activeTab === 'pinouts' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>{isAr ? 'اختر نوع الشريحة والباكيج (BGA Package Type):' : 'Select BGA Chip Package Type:'}</span>
              </span>

              <div className="flex items-center gap-2">
                {UFS_PINOUT_PACKAGES.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      setSelectedBgaPackageId(pkg.id);
                      audioSynth.playMultimeterBeep();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedBgaPackageId === pkg.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {pkg.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Pinouts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedBga.pinouts.map((pin, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      <span 
                        className="w-3 h-3 rounded-full border border-white/20 shrink-0" 
                        style={{ backgroundColor: pin.wireColorHex }} 
                      />
                      {pin.pinName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-cyan-300 border border-slate-800">
                      {pin.requiredVoltage}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {isAr ? pin.descriptionAr : pin.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Partitions & LUNs Manager */}
      {activeTab === 'partitions' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <tr>
                  <th className="p-3 font-bold">{isAr ? 'البارتيشن / LUN' : 'LUN Partition'}</th>
                  <th className="p-3 font-bold">{isAr ? 'الحجم (GB)' : 'Size (GB)'}</th>
                  <th className="p-3 font-bold">{isAr ? 'نوع الملفات' : 'Filesystem'}</th>
                  <th className="p-3 font-bold">{isAr ? 'الوصف والاستخدام' : 'Partition Purpose'}</th>
                  <th className="p-3 font-bold text-center">{isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {INITIAL_LUNS.map(lun => (
                  <tr key={lun.lunIndex} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-bold text-cyan-300">{lun.name}</td>
                    <td className="p-3 text-white">{lun.sizeGb} GB</td>
                    <td className="p-3 text-indigo-300">{lun.filesystem}</td>
                    <td className="p-3 font-sans text-slate-300 text-xs">{isAr ? lun.purposeAr : lun.purposeEn}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        lun.status === 'MOUNTED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {lun.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: HEX Dump Viewer */}
      {activeTab === 'hex-dump' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Binary className="w-4 h-4" />
              <span>{isAr ? 'مستعرض بيانات الذاكرة الخام (Raw NAND Binary Dump):' : 'Raw NAND Binary Hex Inspector:'}</span>
            </div>
            <span className="text-[10px] text-slate-500">Offset: 0x00000000 - 0x00000040</span>
          </div>

          <div className="p-3 bg-black/90 border border-slate-800 rounded-xl text-emerald-400 overflow-x-auto space-y-1 text-[11px]">
            <div>00000000: 7F 45 4C 46 02 01 01 00 00 00 00 00 00 00 00 00  .ELF............</div>
            <div>00000100: 03 00 3E 00 01 00 00 00 80 18 00 00 00 00 00 00  ..&gt;.............</div>
            <div>00000200: 58 42 4C 5F 42 4F 4F 54 5F 48 45 41 44 45 52 00  XBL_BOOT_HEADER.</div>
            <div>00000300: 51 43 4F 4D 5F 53 45 43 55 52 45 5F 42 4F 4F 54  QCOM_SECURE_BOOT</div>
          </div>
        </div>
      )}
    </div>
  );
};
