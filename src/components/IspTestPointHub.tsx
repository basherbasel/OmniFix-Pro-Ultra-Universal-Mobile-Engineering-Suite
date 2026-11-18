import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Search,
  Info,
  AlertTriangle,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { useWorkstation } from '../context/WorkstationContext';

interface IspPinSpec {
  key: 'clk' | 'cmd' | 'dat0' | 'vcc' | 'vccq' | 'gnd';
  label: string;
  pad: string;
  diodeRef: string;
  pullupResistor: string;
  color: string;
  x: number;
  y: number;
}

interface IspPinout {
  id: string;
  model: string;
  marketName: string;
  brand: string;
  soc: string;
  memoryType: 'EMMC 5.1' | 'UFS 2.2' | 'UFS 3.1' | 'UFS 4.0' | 'USB COM 1.0';
  revision: string;
  testpointNote: string;
  pins: {
    clk: string;
    cmd: string;
    dat0: string;
    vcc: string;
    vccq: string;
    gnd: string;
  };
  pinCoords: {
    clk: [number, number, string, string];
    cmd: [number, number, string, string];
    dat0: [number, number, string, string];
    vcc: [number, number, string, string];
    vccq: [number, number, string, string];
    gnd: [number, number, string, string];
  };
  notesAr: string;
  notesEn: string;
}

const ISP_DATABASE: IspPinout[] = [
  {
    id: 'isp-a325f',
    model: 'SM-A325F',
    marketName: 'Galaxy A32 4G',
    brand: 'Samsung',
    soc: 'MediaTek Helio G80 (MT6769V)',
    memoryType: 'EMMC 5.1',
    revision: 'PCB REV 0.4',
    testpointNote: 'R3012 Series CLK Resistor next to eMMC Shield',
    pins: {
      clk: 'TP_CLK (R3012 — 27Ω Series)',
      cmd: 'TP_CMD (R3014 Pull-up 10kΩ)',
      dat0: 'TP_DAT0 (L3008 Pad)',
      vcc: '2.85V (C3022 — VEMC_PMU)',
      vccq: '1.80V (C3025 — VIO18)',
      gnd: 'Main Shield Frame'
    },
    pinCoords: {
      clk: [165, 118, '0.430V', '27Ω series'],
      cmd: [215, 118, '0.455V', '10kΩ PU'],
      dat0: [265, 118, '0.440V', 'Direct line'],
      vcc: [320, 155, '0.410V', '2.85V LDO'],
      vccq: [320, 195, '0.385V', '1.80V LDO'],
      gnd: [130, 215, '0.001V', 'Board GND']
    },
    notesAr: 'افصل فلاتة البطارية قبل اللحام. يُفضل سحب خط CLK عبر مقاومة 27-47 أوم وتغذية Vcc/Vccq خارجياً بمبرمجة EasyJTAG/UFI بحد أقصى 1.8V/2.8V.',
    notesEn: 'Disconnect battery flex first. Tap CLK via 27-47Ω resistor; supply external 2.85V VCC / 1.8V VCCQ from programmer.'
  },
  {
    id: 'isp-s24u',
    model: 'SM-S928B',
    marketName: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    soc: 'Snapdragon 8 Gen 3 (SM8650-AC)',
    memoryType: 'UFS 4.0',
    revision: 'MAIN SUB PCB REV 1.2',
    testpointNote: 'EDL 9008 TestPoint Pads (FORCED_USB_BOOT) beside Battery FPC',
    pins: {
      clk: 'TX0P / TX0N Diff Pair (TP_UFS_T0)',
      cmd: 'RX0P / RX0N Diff Pair (TP_UFS_R0)',
      dat0: 'REF_CLK 19.2MHz (C5104)',
      vcc: '2.50V (PM8550 L11 — VREG_UFS_VCC)',
      vccq: '1.20V (PM8550B S4 — VREG_UFS_VCCQ2)',
      gnd: 'UFS Shield Ground'
    },
    pinCoords: {
      clk: [160, 115, '0.360V', '100Ω Diff'],
      cmd: [220, 115, '0.365V', '100Ω Diff'],
      dat0: [280, 115, '0.410V', '19.2MHz AC'],
      vcc: [330, 155, '0.405V', '2.50V PMIC'],
      vccq: [330, 198, '0.330V', '1.20V PMIC'],
      gnd: [130, 218, '0.001V', 'Chassis GND']
    },
    notesAr: 'في UFS 4.0 استخدم سلك 0.01mm بأطوال متطابقة تماماً لمسارات TX/RX. يمكنك أولاً استخدام نقطتي EDL 9008 أسفل الشيلد قبل اللجوء لـ UFS ISP.',
    notesEn: 'For UFS 4.0, keep differential TX/RX jumper wires ultra-short (<15mm) & length-matched. Check EDL 9008 TestPoints first.'
  },
  {
    id: 'isp-a155f',
    model: 'SM-A155F',
    marketName: 'Galaxy A15 4G',
    brand: 'Samsung',
    soc: 'MediaTek Helio G99 (MT6789)',
    memoryType: 'UFS 2.2',
    revision: 'REV 0.5',
    testpointNote: 'VDD18_UFS / TX0_P / RX0_P under Upper RF Can',
    pins: {
      clk: 'UFS_TX0_P / TX0_N (FL4002)',
      cmd: 'UFS_RX0_P / RX0_N (FL4003)',
      dat0: 'UFS_REF_CLK (R4011)',
      vcc: '2.95V (C4018 — VUFS_PMU)',
      vccq: '1.20V (C4021 — VUFS12)',
      gnd: 'Main Board Shield'
    },
    pinCoords: {
      clk: [165, 115, '0.370V', 'Filter FL4002'],
      cmd: [220, 115, '0.372V', 'Filter FL4003'],
      dat0: [275, 115, '0.425V', '0Ω Jumper'],
      vcc: [322, 160, '0.415V', '2.95V LDO'],
      vccq: [322, 198, '0.340V', '1.20V Buck'],
      gnd: [128, 215, '0.001V', 'Board GND']
    },
    notesAr: 'يدعم التفليش المباشر عبر كابل USB بوضع MTK BROM دون لحام إذا لم تتلف قطاعات Preloader. المسار FL4002 مخصص فقط لحالات Dead Boot.',
    notesEn: 'Supports BROM USB directly via Kamakiri if Preloader is intact. Use UFS ISP pads only on hard dead-boot cases.'
  },
  {
    id: 'isp-a546b',
    model: 'SM-A546B',
    marketName: 'Galaxy A54 5G',
    brand: 'Samsung',
    soc: 'Samsung Exynos 1380 (S5E8835)',
    memoryType: 'UFS 3.1',
    revision: 'REV 1.0',
    testpointNote: 'Exynos USB Boot TP beside CPU Shield (AP_USB_BOOT)',
    pins: {
      clk: 'UFS_TXD0_P / N (TP204)',
      cmd: 'UFS_RXD0_P / N (TP205)',
      dat0: 'UFS_CLK_19M (R2019)',
      vcc: '2.50V (C2040 — LDO19)',
      vccq: '1.20V (C2042 — BUCK6)',
      gnd: 'CPU Shield Ground'
    },
    pinCoords: {
      clk: [162, 115, '0.365V', 'Diff Pair'],
      cmd: [218, 115, '0.368V', 'Diff Pair'],
      dat0: [274, 115, '0.420V', '19.2MHz'],
      vcc: [324, 155, '0.408V', '2.50V LDO'],
      vccq: [324, 195, '0.335V', '1.20V Buck'],
      gnd: [126, 214, '0.001V', 'Ground']
    },
    notesAr: 'تنبيه: مسارات UFS 3.1 شديدة الحساسية للتشويش الكهرومغناطيسي؛ تأكد من لحام أرضي المبرمجة بالقرب من الذاكرة قبل القراءة.',
    notesEn: 'Warning: UFS 3.1 differential lanes are EMI sensitive. Always solder a short ground wire right next to the UFS IC.'
  },
  {
    id: 'isp-s21u',
    model: 'SM-G998B',
    marketName: 'Galaxy S21 Ultra',
    brand: 'Samsung',
    soc: 'Samsung Exynos 2100',
    memoryType: 'UFS 3.1',
    revision: 'REV 1.0',
    testpointNote: 'TP_CLK_R102 / TP_CMD_R103 beside PMIC',
    pins: {
      clk: 'TP_CLK_R102 (100Ω Safe Tap)',
      cmd: 'TP_CMD_R103',
      dat0: 'TP_DAT0_C105',
      vcc: '2.8V (LDO1)',
      vccq: '1.8V (LDO2)',
      gnd: 'Board Chassis'
    },
    pinCoords: {
      clk: [165, 116, '0.380V', '100Ω Resistor'],
      cmd: [218, 116, '0.385V', 'Direct TP'],
      dat0: [272, 116, '0.415V', 'Cap Pad'],
      vcc: [322, 158, '0.410V', '2.80V LDO1'],
      vccq: [322, 196, '0.370V', '1.80V LDO2'],
      gnd: [128, 214, '0.001V', 'Board GND']
    },
    notesAr: 'تنبيه: يجب استخدام مقاومة 100 أوم على خط CLK أو REF_CLK لتفادي تحميل إشارة المعالج وإتلاف الذاكرة.',
    notesEn: 'Caution: Insert a 100Ω inline resistor on the CLK line to avoid dragging down the CPU clock driver.'
  },
  {
    id: 'isp-redmi-note10',
    model: 'M2101K7AG',
    marketName: 'Redmi Note 10 (Mojito)',
    brand: 'Xiaomi',
    soc: 'Snapdragon 678 (SM6150)',
    memoryType: 'UFS 2.2',
    revision: 'V2 PCB',
    testpointNote: 'EDL 9008 2-Pin TestPoint above Battery Connector',
    pins: {
      clk: 'UFS_TX0_P (R1102)',
      cmd: 'UFS_RX0_P (R1104)',
      dat0: 'REF_CLK_19M (TP11)',
      vcc: '2.95V (C1120)',
      vccq: '1.20V (C1124)',
      gnd: 'Any GND Pad'
    },
    pinCoords: {
      clk: [166, 116, '0.385V', '0Ω Link'],
      cmd: [220, 116, '0.388V', '0Ω Link'],
      dat0: [274, 116, '0.430V', 'Clock Test'],
      vcc: [322, 158, '0.415V', '2.95V LDO'],
      vccq: [322, 196, '0.345V', '1.20V LDO'],
      gnd: [128, 214, '0.001V', 'Board GND']
    },
    notesAr: 'للجهاز نقطتا EDL 9008 واضحتان أعلى كونكتور البطارية؛ جرب التفليش via EDL أولاً قبل نزع الغطاء المعدني لخطوط UFS.',
    notesEn: 'Two exposed EDL 9008 TestPoints sit above the battery connector; always attempt EDL Firehose before hardware UFS tapping.'
  },
  {
    id: 'isp-note13pp',
    model: '2312DRA50G',
    marketName: 'Redmi Note 13 Pro+ 5G',
    brand: 'Xiaomi',
    soc: 'MediaTek Dimensity 7200-Ultra',
    memoryType: 'UFS 3.1',
    revision: 'REV 1.1',
    testpointNote: 'BROM Key Combo (Vol- + Vol+) or KCOL0 GND pad under CPU shield',
    pins: {
      clk: 'UFS_TX0P_B (TP42)',
      cmd: 'UFS_RX0P_B (TP43)',
      dat0: 'UFS_CLK_TP (R821)',
      vcc: '2.50V (C830)',
      vccq: '1.20V (C832)',
      gnd: 'RF Shield Frame'
    },
    pinCoords: {
      clk: [164, 116, '0.362V', '50Ω Trace'],
      cmd: [219, 116, '0.366V', '50Ω Trace'],
      dat0: [274, 116, '0.418V', 'Clock'],
      vcc: [322, 158, '0.402V', '2.50V'],
      vccq: [322, 196, '0.332V', '1.20V'],
      gnd: [128, 214, '0.001V', 'Board GND']
    },
    notesAr: 'في حالة قفل SLA/DAA الحديث استخدم وضع BROM مع mtkclient أو وصل نقطة KCOL0 بالأرضي لحقن البوت.',
    notesEn: 'On patched HyperOS bootloaders, ground KCOL0 pad momentarily while inserting USB to force MediaTek BROM.'
  },
  {
    id: 'isp-infinix-n30p',
    model: 'X6833B',
    marketName: 'Infinix Note 30 Pro',
    brand: 'Infinix',
    soc: 'MediaTek Helio G99 (MT6789)',
    memoryType: 'UFS 2.2',
    revision: 'MAIN V1.3',
    testpointNote: 'TP_KCOL0 + eMMC/UFS ISP Test Pads on Rear PCB Side',
    pins: {
      clk: 'TP_TX0_P (Pad 12)',
      cmd: 'TP_RX0_P (Pad 14)',
      dat0: 'TP_REFCLK (R1509)',
      vcc: '2.95V (C1520)',
      vccq: '1.20V (C1522)',
      gnd: 'Battery Negative Shield'
    },
    pinCoords: {
      clk: [165, 118, '0.375V', 'Direct TP'],
      cmd: [218, 118, '0.378V', 'Direct TP'],
      dat0: [272, 118, '0.422V', '26MHz/19MHz'],
      vcc: [322, 158, '0.410V', '2.95V'],
      vccq: [322, 196, '0.340V', '1.20V'],
      gnd: [128, 214, '0.001V', 'Board GND']
    },
    notesAr: 'يدعم القراءة والكتابة لقطاعات NVRAM و RPMB Clean عبر EasyJTAG Plus و Medusa Pro II أو مباشرة عبر USB BROM.',
    notesEn: 'Supports full NVRAM / persist / RPMB operations via EasyJTAG/Medusa or BROM USB cable.'
  },
  {
    id: 'isp-realme-c53',
    model: 'RMX3760',
    marketName: 'Realme C53',
    brand: 'Realme',
    soc: 'UNISOC Tiger T612 (UMS9230)',
    memoryType: 'EMMC 5.1',
    revision: 'REV 1.0',
    testpointNote: 'Direct eMMC ISP under SIM-side shield or Vol- USB Diag Boot',
    pins: {
      clk: 'EMMC_CLK (R501 — 22Ω)',
      cmd: 'EMMC_CMD (R502 — 10kΩ)',
      dat0: 'EMMC_D0 (R503 — Direct)',
      vcc: '2.85V (C510)',
      vccq: '1.80V (C512)',
      gnd: 'Metal Shield'
    },
    pinCoords: {
      clk: [165, 118, '0.435V', '22Ω Series'],
      cmd: [215, 118, '0.450V', '10kΩ PU'],
      dat0: [265, 118, '0.445V', 'Direct Pad'],
      vcc: [322, 158, '0.412V', '2.85V'],
      vccq: [322, 196, '0.388V', '1.80V'],
      gnd: [128, 214, '0.001V', 'Board GND']
    },
    notesAr: 'معالجات UNISOC T612 غالباً لا تحتاج للحام ISP إلا في حالة تلف الـ eMMC كلياً؛ يمكن مسح FRP وتفليش PAC عبر كابل USB.',
    notesEn: 'UNISOC T612 supports USB FDL1/FDL2 flashing directly via cable; tap eMMC ISP pads only when inspecting IC health or bad sectors.'
  },
  {
    id: 'isp-huawei-p30p',
    model: 'VOG-L29',
    marketName: 'Huawei P30 Pro',
    brand: 'Huawei',
    soc: 'HiSilicon Kirin 980',
    memoryType: 'USB COM 1.0',
    revision: 'HI3680 REV A',
    testpointNote: 'TP_BOOT (TESTPOINT -> GND with tweezers before plugging USB)',
    pins: {
      clk: 'TP_USB_COM1_BOOT (Short to GND)',
      cmd: 'D+ USB_DP (Test Pad)',
      dat0: 'D- USB_DM (Test Pad)',
      vcc: 'VBUS 5.0V / PMIC 3.8V',
      vccq: '1.80V (VIO_18)',
      gnd: 'TP_GND adjacent'
    },
    pinCoords: {
      clk: [165, 118, '0.520V', 'Boot Short TP'],
      cmd: [218, 118, '0.480V', 'USB D+'],
      dat0: [270, 118, '0.480V', 'USB D-'],
      vcc: [322, 158, '0.445V', 'VBUS / VPH'],
      vccq: [322, 196, '0.390V', '1.80V LDO'],
      gnd: [128, 214, '0.001V', 'Board GND']
    },
    notesAr: 'لا يتطلب Kirin 980 لحام UFS: قم بتوصيل نقطة TestPoint (TP_BOOT) بالأرضي بالجفت أثناء توصيل كابل USB ليظهر المنفذ (HUAWEI USB COM 1.0).',
    notesEn: 'Kirin 980 enters HUAWEI USB COM 1.0 (12D1:3609) by shorting the single TP_BOOT pad to GND with tweezers while plugging USB.'
  }
];

export function IspTestPointHub({ lang }: { lang: 'en' | 'ar' }) {
  const isAr = lang === 'ar';
  const { currentDevice } = useWorkstation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIsp, setSelectedIsp] = useState<IspPinout>(() => {
    const match = ISP_DATABASE.find(
      (i) =>
        i.model.toLowerCase() === (currentDevice.model || '').toLowerCase() ||
        i.brand.toLowerCase() === (currentDevice.brand || '').toLowerCase()
    );
    return match || ISP_DATABASE[0];
  });
  const [activePinKey, setActivePinKey] = useState<IspPinSpec['key']>('clk');
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [copiedId, setCopiedId] = useState(false);

  // Sync automatically when user switches connected device
  useEffect(() => {
    const match = ISP_DATABASE.find(
      (i) => i.model.toLowerCase() === (currentDevice.model || '').toLowerCase()
    );
    if (match) setSelectedIsp(match);
  }, [currentDevice.id, currentDevice.model]);

  const filteredIsp = ISP_DATABASE.filter(
    (item) =>
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.marketName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.soc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinRows: IspPinSpec[] = [
    {
      key: 'clk',
      label: 'CLK / TX0',
      pad: selectedIsp.pins.clk,
      diodeRef: selectedIsp.pinCoords.clk[2],
      pullupResistor: selectedIsp.pinCoords.clk[3],
      color: '#f43f5e',
      x: selectedIsp.pinCoords.clk[0],
      y: selectedIsp.pinCoords.clk[1]
    },
    {
      key: 'cmd',
      label: 'CMD / RX0',
      pad: selectedIsp.pins.cmd,
      diodeRef: selectedIsp.pinCoords.cmd[2],
      pullupResistor: selectedIsp.pinCoords.cmd[3],
      color: '#3b82f6',
      x: selectedIsp.pinCoords.cmd[0],
      y: selectedIsp.pinCoords.cmd[1]
    },
    {
      key: 'dat0',
      label: 'DAT0 / REF',
      pad: selectedIsp.pins.dat0,
      diodeRef: selectedIsp.pinCoords.dat0[2],
      pullupResistor: selectedIsp.pinCoords.dat0[3],
      color: '#f59e0b',
      x: selectedIsp.pinCoords.dat0[0],
      y: selectedIsp.pinCoords.dat0[1]
    },
    {
      key: 'vcc',
      label: 'VCC',
      pad: selectedIsp.pins.vcc,
      diodeRef: selectedIsp.pinCoords.vcc[2],
      pullupResistor: selectedIsp.pinCoords.vcc[3],
      color: '#10b981',
      x: selectedIsp.pinCoords.vcc[0],
      y: selectedIsp.pinCoords.vcc[1]
    },
    {
      key: 'vccq',
      label: 'VCCQ',
      pad: selectedIsp.pins.vccq,
      diodeRef: selectedIsp.pinCoords.vccq[2],
      pullupResistor: selectedIsp.pinCoords.vccq[3],
      color: '#06b6d4',
      x: selectedIsp.pinCoords.vccq[0],
      y: selectedIsp.pinCoords.vccq[1]
    },
    {
      key: 'gnd',
      label: 'GND',
      pad: selectedIsp.pins.gnd,
      diodeRef: selectedIsp.pinCoords.gnd[2],
      pullupResistor: selectedIsp.pinCoords.gnd[3],
      color: '#94a3b8',
      x: selectedIsp.pinCoords.gnd[0],
      y: selectedIsp.pinCoords.gnd[1]
    }
  ];

  const handleCopyPinout = () => {
    const text = `${selectedIsp.brand} ${selectedIsp.marketName} (${selectedIsp.model}) - ${selectedIsp.memoryType}\nCLK: ${selectedIsp.pins.clk}\nCMD: ${selectedIsp.pins.cmd}\nDAT0: ${selectedIsp.pins.dat0}\nVCC: ${selectedIsp.pins.vcc}\nVCCQ: ${selectedIsp.pins.vccq}\nGND: ${selectedIsp.pins.gnd}`;
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  const renderSvgDiagram = (scaleFactor: number = 1) => (
    <svg
      viewBox="0 0 460 280"
      style={{ transform: `scale(${scaleFactor})`, transformOrigin: 'center center' }}
      className="w-full h-full transition-transform duration-200 select-none"
      role="img"
      aria-label={`${selectedIsp.brand} ${selectedIsp.model} ISP Pinout Schematic`}
    >
      <defs>
        <pattern id="pcbGridIsp" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0f3d2e" strokeWidth="0.6" />
        </pattern>
      </defs>
      {/* Motherboard Substrate */}
      <rect width="460" height="280" rx="12" fill="#06221b" />
      <rect width="460" height="280" rx="12" fill="url(#pcbGridIsp)" />

      {/* PCB Copper Board Outline & Ground Pour */}
      <rect x="24" y="20" width="412" height="240" rx="14" fill="#092d24" stroke="#15803d" strokeWidth="1.5" />
      <text x="36" y="38" fill="#6ee7b7" fontSize="9" fontFamily="monospace" fontWeight="bold">
        {selectedIsp.model} // {selectedIsp.revision} · {selectedIsp.soc.split('(')[0].trim()}
      </text>

      {/* Main SoC / CPU BGA Package */}
      <rect x="65" y="65" width="90" height="90" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
      <text x="110" y="106" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontFamily="monospace" fontWeight="bold">
        AP / SoC
      </text>
      <text x="110" y="121" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
        {selectedIsp.brand.toUpperCase()}
      </text>

      {/* Storage IC (UFS / eMMC) Package */}
      <rect x="195" y="155" width="95" height="80" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
      <circle cx="206" cy="166" r="2.5" fill="#fbbf24" />
      <text x="242" y="191" textAnchor="middle" fill="#e2e8f0" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
        {selectedIsp.memoryType}
      </text>
      <text x="242" y="206" textAnchor="middle" fill="#38bdf8" fontSize="7.5" fontFamily="monospace">
        NAND / BGA153
      </text>

      {/* PMIC Power Management IC */}
      <rect x="355" y="155" width="58" height="65" rx="5" fill="#0f172a" stroke="#10b981" strokeWidth="1.2" />
      <text x="384" y="190" textAnchor="middle" fill="#34d399" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
        PMIC
      </text>

      {/* Copper Traces from Pads to Storage IC */}
      {pinRows.map((pin) => {
        const isActive = activePinKey === pin.key;
        const targetX = pin.key === 'vcc' || pin.key === 'vccq' ? 355 : pin.key === 'gnd' ? 195 : 235;
        const targetY = pin.key === 'vcc' || pin.key === 'vccq' ? 185 : 195;
        return (
          <g
            key={pin.key}
            onClick={() => setActivePinKey(pin.key)}
            className="cursor-pointer"
          >
            <line
              x1={pin.x}
              y1={pin.y}
              x2={targetX}
              y2={targetY}
              stroke={pin.color}
              strokeWidth={isActive ? 2.4 : 1.1}
              strokeDasharray={isActive ? undefined : '3 2'}
              opacity={isActive ? 1 : 0.45}
            />
            {isActive && (
              <circle
                cx={pin.x}
                cy={pin.y}
                r="14"
                fill="none"
                stroke={pin.color}
                strokeWidth="1.5"
                opacity="0.7"
              />
            )}
            <circle
              cx={pin.x}
              cy={pin.y}
              r={isActive ? 8 : 6.5}
              fill={pin.color}
              stroke="#ffffff"
              strokeWidth={isActive ? 2 : 1}
            />
            <rect
              x={pin.x - 24}
              y={pin.y - 26}
              width="48"
              height="14"
              rx="3"
              fill="#020617"
              stroke={pin.color}
              strokeWidth={isActive ? 1.2 : 0.6}
            />
            <text
              x={pin.x}
              y={pin.y - 16}
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="7.5"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {pin.label.split(' ')[0]}
            </text>
          </g>
        );
      })}

      {/* Active Pin Readout Strip */}
      <rect x="34" y="232" width="392" height="20" rx="4" fill="#020617" stroke="#1e293b" />
      {(() => {
        const activePin = pinRows.find((p) => p.key === activePinKey) || pinRows[0];
        return (
          <text x="44" y="245" fill="#e2e8f0" fontSize="8.5" fontFamily="monospace">
            SELECTED: {activePin.label} | PAD: {activePin.pad} | DIODE REF: {activePin.diodeRef} ({activePin.pullupResistor})
          </text>
        );
      })()}
    </svg>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full bg-slate-900 font-sans text-slate-200">
      {/* Sidebar List */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-e border-slate-800 flex flex-col bg-slate-900/60 shrink-0">
        <div className="p-4 border-b border-slate-800 space-y-2">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>{isAr ? 'قاعدة نقاط ISP و TestPoint' : 'ISP & TestPoint Registry'}</span>
            <span className="tabular-nums text-cyan-400 font-bold">{filteredIsp.length} {isAr ? 'جهاز' : 'Models'}</span>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder={isAr ? 'بحث بالموديل أو المعالج...' : 'Search model, brand, SoC...'}
              className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="max-h-60 lg:max-h-none lg:flex-1 overflow-y-auto custom-scrollbar">
          {filteredIsp.map((item) => {
            const isSelected = selectedIsp?.id === item.id;
            const isDeviceMatch = item.model.toLowerCase() === (currentDevice.model || '').toLowerCase();
            return (
              <button
                key={item.id}
                onClick={() => setSelectedIsp(item)}
                className={`w-full p-3.5 flex items-center gap-3 border-b border-slate-800/60 hover:bg-slate-800/40 transition-all text-start cursor-pointer ${
                  isSelected ? 'bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/40' : ''
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${item.memoryType.includes('UFS') ? 'bg-amber-500/10 text-amber-400' : item.memoryType === 'USB COM 1.0' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  <Cpu size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white truncate">{item.model}</span>
                    {isDeviceMatch && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">· ACTIVE</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {item.marketName} · {item.memoryType}
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-500 shrink-0 rtl:rotate-180" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="flex-1 overflow-y-auto p-5 lg:p-7 relative custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIsp.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="max-w-5xl mx-auto space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                  {selectedIsp.brand} {selectedIsp.marketName} ({selectedIsp.model})
                </h2>
                <p className="text-slate-400 font-mono text-xs mt-1">
                  {selectedIsp.memoryType} · {selectedIsp.soc} · {selectedIsp.revision}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPinout}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  {copiedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedId ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ التوصيلات' : 'Copy Specs')}</span>
                </button>
                <button
                  onClick={() => {
                    setZoomScale(1);
                    setIsFullscreenOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Maximize2 size={14} />
                  <span>{isAr ? 'تكبير المخطط التفاعلي' : 'Fullscreen Diagram'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive SVG PCB Pinout Canvas */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative aspect-[460/280] rounded-2xl border border-slate-700 bg-slate-950 overflow-hidden shadow-xl">
                  {renderSvgDiagram(1)}
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs font-mono text-cyan-300">
                  <span className="text-slate-400 block text-[10px] uppercase mb-1">
                    {isAr ? 'موقع نقطة الفحص على البوردة:' : 'Board Location Reference:'}
                  </span>
                  {selectedIsp.testpointNote}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-xl flex gap-3.5">
                  <AlertTriangle className="text-amber-400 shrink-0" size={18} />
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    {isAr ? selectedIsp.notesAr : selectedIsp.notesEn}
                  </p>
                </div>
              </div>

              {/* Interactive Pin Details */}
              <div className="space-y-5">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Info size={14} className="text-indigo-400" />
                    <span>{isAr ? 'نقاط اللحام والقياس (اضغط للتحديد)' : 'Jumper Pads & Diode Refs'}</span>
                  </h3>

                  <div className="space-y-2.5">
                    {pinRows.map((pin) => {
                      const isActive = activePinKey === pin.key;
                      return (
                        <button
                          key={pin.key}
                          type="button"
                          onClick={() => setActivePinKey(pin.key)}
                          className={`w-full text-start p-3 rounded-xl border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-slate-950 border-indigo-500 ring-1 ring-indigo-500/40'
                              : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black font-mono" style={{ color: pin.color }}>
                              {pin.label}
                            </span>
                            <span className="text-[11px] font-mono text-emerald-400 tabular-nums">
                              {pin.diodeRef} · {pin.pullupResistor}
                            </span>
                          </div>
                          <div className="text-xs font-mono font-bold text-slate-200 mt-1 break-all">
                            {pin.pad}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2">
                    {isAr ? 'المبرمجات المتوافقة' : 'Compatible Hardware Boxes'}
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    EasyJTAG Plus · UFI Box · Medusa Pro II · MIPI Tester Box
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Interactive Fullscreen Zoom Modal */}
      {isFullscreenOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-base font-black text-white">
                {selectedIsp.brand} {selectedIsp.marketName} ({selectedIsp.model}) — {selectedIsp.memoryType}
              </h3>
              <p className="text-xs font-mono text-slate-400">{selectedIsp.testpointNote}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomScale((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs font-mono text-cyan-300 tabular-nums px-2">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale((z) => Math.min(2.25, Number((z + 0.25).toFixed(2))))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => setZoomScale(1)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setIsFullscreenOpen(false)}
                className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <X size={16} />
                <span>{isAr ? 'إغلاق' : 'Close'}</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl aspect-[460/280]">
              {renderSvgDiagram(zoomScale)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
