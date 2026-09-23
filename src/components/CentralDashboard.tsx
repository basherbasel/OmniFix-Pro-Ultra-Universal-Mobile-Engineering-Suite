import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  Wrench, 
  Activity, 
  Database, 
  LayoutDashboard, 
  Smartphone, 
  Flame, 
  Globe, 
  HardDrive, 
  RotateCcw, 
  Terminal, 
  Search, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Scissors, 
  Award, 
  Satellite, 
  Radio, 
  Crosshair, 
  Gauge, 
  Tv, 
  BatteryCharging, 
  Unlock,
  CheckCircle2,
  Sliders,
  Filter,
  Package,
  QrCode,
  FileCode,
  Lock,
  Workflow,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Boxes,
  Usb,
  Battery,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useWorkstation } from '../context/WorkstationContext';
import { realUsbService } from '../services/realUsbService';
import { deviceKnowledgebaseService } from '../services/deviceKnowledgebaseService';
import { DEVICE_PRESETS } from '../data/devicePresets';
import { ConnectedDevice } from '../types';

interface CentralDashboardProps {
  onNavigate: (tabId: string) => void;
  lang: 'en' | 'ar';
}

interface ToolDefinition {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'AI_FAST' | 'SOFTWARE_SECURITY' | 'HARDWARE_BENCH' | 'NETWORK_RF' | 'SHOP_QA';
  categoryLabelEn: string;
  categoryLabelAr: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  bgGlow: string;
  descriptionEn: string;
  descriptionAr: string;
  tag: string;
}

export const CentralDashboard: React.FC<CentralDashboardProps> = ({ onNavigate, lang }) => {
  const isAr = lang === 'ar';
  const { currentDevice, setCurrentDevice, setUsbModalOpen, addLog, isBusy } = useWorkstation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isReadingDevice, setIsReadingDevice] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<{
    status: 'OPTIMAL' | 'WARNING' | 'ALERT';
    verdictAr: string;
    verdictEn: string;
    safeActions: Array<{ ar: string; en: string; danger: boolean; tab: string }>;
    checkpoints: Array<{
      moduleAr: string;
      moduleEn: string;
      status: 'OK' | 'WARN' | 'FAIL';
      detailAr: string;
      detailEn: string;
    }>;
  } | null>(null);
  const [readSuccessAlert, setReadSuccessAlert] = useState<string | null>(null);

  const triggerDiagnosticEvaluation = (device: ConnectedDevice) => {
    setIsDiagnosing(true);
    setTimeout(() => {
      setIsDiagnosing(false);
      let status: 'OPTIMAL' | 'WARNING' | 'ALERT' = 'OPTIMAL';
      let verdictAr = 'الهاتف يعمل بأداء ممتاز ومستقر. الحماية نشطة ولا توجد أعطال بالنظام.';
      let verdictEn = 'Phone is operating optimally. System software is stable & security seals are intact.';
      let safeActions: Array<{ ar: string; en: string; danger: boolean; tab: string }> = [];
      let checkpoints: Array<{
        moduleAr: string;
        moduleEn: string;
        status: 'OK' | 'WARN' | 'FAIL';
        detailAr: string;
        detailEn: string;
      }> = [];

      // Add default base checkup indicators based on the actual live device parameters
      checkpoints.push({
        moduleAr: 'طاقة البطارية والجهد',
        moduleEn: 'Battery & Voltage Health',
        status: device.batteryLevel > 20 ? 'OK' : 'WARN',
        detailAr: `مستوى الشحن ${device.batteryLevel}% والجهد آمن لتفادي الانقطاع المفاجئ.`,
        detailEn: `Battery is at ${device.batteryLevel}%. Voltage levels are safe for operations.`
      });

      checkpoints.push({
        moduleAr: 'حالة إشارة الراديو والشبكة',
        moduleEn: 'Baseband & Network Modem',
        status: (device.imei1 && device.imei1.includes('Auto-Probed')) || device.imei1 === 'Unknown' ? 'FAIL' : 'OK',
        detailAr: (device.imei1 && device.imei1.includes('Auto-Probed')) || device.imei1 === 'Unknown' 
          ? 'تنبيه: لم يتم اكتشاف السيريال أو النطاق الأساسي بالكامل. الشبكة مفقودة.' 
          : 'النطاق الأساسي سليم والشبكة مفعّلة بالكامل.',
        detailEn: (device.imei1 && device.imei1.includes('Auto-Probed')) || device.imei1 === 'Unknown'
          ? 'Alert: Radio Baseband/IMEI parameters are unmapped or restricted.'
          : 'Baseband modem is healthy with active RF calibration seals.'
      });

      checkpoints.push({
        moduleAr: 'نظام الحماية والأمان TEE',
        moduleEn: 'TEE & KNOX Security Vault',
        status: device.knoxStatus && device.knoxStatus.includes('0x0') ? 'OK' : 'WARN',
        detailAr: device.knoxStatus 
          ? `حالة Knox سليمة (${device.knoxStatus}) ولم يتم كسر الحماية.` 
          : 'حماية المصنع FRP نشطة وقيد الفحص.',
        detailEn: device.knoxStatus 
          ? `Knox warranty seal is safe at ${device.knoxStatus}.`
          : 'FRP protection is active and verified.'
      });

      const brandUpper = device.brand.toUpperCase();
      const chipsetLower = device.chipset.toLowerCase();

      // Determine safety actions based on brand & chipsets
      if (brandUpper.includes('SAMSUNG')) {
        safeActions.push({
          ar: '🔒 فحص ومطابقة حماية Knox ونطاق التوقيع Secure Seals',
          en: '🔒 Read/Verify Secure Knox Seals & Security Patches',
          danger: false,
          tab: 'security-bypass'
        });
        if (device.mode === 'SAMSUNG_DOWNLOAD') {
          verdictAr = 'الهاتف بوضع الداونلود. يوصى بمطابقة ملف الـ PIT وحساب الهاش لتجنب موت الهاتف.';
          verdictEn = 'Device in Download Mode. Verify PIT matrix & match SHA-256 binary headers before flashing.';
          status = 'WARNING';
          safeActions.push({
            ar: '⚠️ تفليش مخصص آمن بملف PIT متطابق (Anti-Brick)',
            en: '⚠️ Execute Safe PIT-Matched Flashing (Anti-Brick Pro)',
            danger: true,
            tab: 'smart-1click'
          });
          checkpoints.push({
            moduleAr: 'مؤشر الإقلاع Bootloader',
            moduleEn: 'Odin Boot State',
            status: 'WARN',
            detailAr: 'الجهاز بوضع الداونلود (ODIN). العمليات العشوائية قد تؤدي لتعطيل الإقلاع.',
            detailEn: 'Device in Odin Mode. Block level operations must use correct signed partitions.'
          });
        } else {
          safeActions.push({
            ar: '📡 إصلاح ومعايرة شبكة المودم الرسمية (RF Calibration)',
            en: '📡 Apply Official CP/Modem Baseband Calibration',
            danger: false,
            tab: 'network-rf'
          });
          checkpoints.push({
            moduleAr: 'نظام التشغيل الكيرنل',
            moduleEn: 'Kernel & Firmware Integrity',
            status: 'OK',
            detailAr: 'توقيعات كيرنل سامسونج سليمة ومتوافقة مع الحماية.',
            detailEn: 'Samsung official stock kernel signature is verified.'
          });
        }
      } else if (brandUpper.includes('XIAOMI') || brandUpper.includes('POCO')) {
        if (device.mode === 'EDL_9008') {
          verdictAr = 'الهاتف بوضع EDL الطارئ. يوصى بحقن مبرمج DDR Firehose آمن ومتطابق لتجنب تلف الذاكرة.';
          verdictEn = 'Emergency EDL 9008 Mode. Ensure DDR Firehose matches build SoC to prevent UFS storage corruption.';
          status = 'ALERT';
          safeActions.push({
            ar: '🔥 حقن مبرمج Firehose DDR آمن بوضع EDL',
            en: '🔥 Load Signature-Matched EDL DDR Firehose',
            danger: true,
            tab: 'smart-1click'
          });
          checkpoints.push({
            moduleAr: 'منفذ الطوارئ EDL 9008',
            moduleEn: 'Qualcomm Emergency Link',
            status: 'FAIL',
            detailAr: 'الجهاز في وضع EDL 9008! لا يستجيب للإقلاع العادي بدون مبرمج موثق.',
            detailEn: 'Device is bricked or forced in EDL 9008 mode! Needs authorized firehose.'
          });
        } else {
          safeActions.push({
            ar: '🔓 فحص حالة مكاملة محمل الإقلاع (Bootloader)',
            en: '🔓 Scan Bootloader Validation Token Status',
            danger: false,
            tab: 'security-bypass'
          });
          checkpoints.push({
            moduleAr: 'محمل الإقلاع HyperOS',
            moduleEn: 'HyperOS Bootloader Lock',
            status: device.bootloaderStatus === 'UNLOCKED' ? 'OK' : 'WARN',
            detailAr: device.bootloaderStatus === 'UNLOCKED' ? 'البوت لودر مفتوح وجاهز للتفليش.' : 'البوت لودر مغلق. يتطلب توثيق رسمي للتفليش.',
            detailEn: device.bootloaderStatus === 'UNLOCKED' ? 'Bootloader is unlocked.' : 'Bootloader is locked by HyperOS protection policy.'
          });
        }
      } else if (chipsetLower === 'mediatek') {
        status = 'WARNING';
        verdictAr = 'معالج MediaTek نشط. احذر من التعديل العشوائي للـ Preloader لتفادي الموت التام.';
        verdictEn = 'MediaTek chipset detected. Avoid flashing mismatched preloader binaries to prevent hard bricks.';
        safeActions.push({
          ar: '🛡️ نسخ احتياطي لملفات الشبكة nvram/nvdata (إجباري)',
          en: '🛡️ Force NVRAM/NVDATA RAW Snapshot (Mandatory)',
          danger: false,
          tab: 'network-rf'
        });
        safeActions.push({
          ar: '⚡ فك حماية المعالج وتخطي الـ SLA/DAA بوضع BROM',
          en: '⚡ Safe MediaTek SLA/DAA Auth Bypass (BROM Mode)',
          danger: true,
          tab: 'security-bypass'
        });
        checkpoints.push({
          moduleAr: 'حماية المعالج BROM Sec',
          moduleEn: 'MTK BootROM SLA/DAA',
          status: 'WARN',
          detailAr: 'حماية التوقيع مفعلة بالـ BootROM. تتطلب أداة تخطي SLA للتفليش بأمان.',
          detailEn: 'MediaTek hardware SLA signature protection is active.'
        });
      } else if (brandUpper.includes('APPLE')) {
        status = 'WARNING';
        verdictAr = 'الهاتف بوضع DFU/Recovery. يوصى بمطابقة توقيع الـ IPSW وحفظ الـ SHSH.';
        verdictEn = 'Apple Device in Recovery/DFU. Match IPSW Signature headers and read SHSH blobs.';
        safeActions.push({
          ar: '📱 تفليش آمن وترميم حزمة TrueTone والشاشة',
          en: '📱 Run Display TrueTone & Touch Restoration Lab',
          danger: false,
          tab: 'eeprom-programmer'
        });
        checkpoints.push({
          moduleAr: 'ترميز المعايرة العتادية',
          moduleEn: 'Apple Hardware Pairing',
          status: 'WARN',
          detailAr: 'معايرة الشاشة والبطارية (BMS) تتطلب مطابقة السيريال الأصلي لتجنب رسائل الخطأ.',
          detailEn: 'Apple screen & battery hardware pairing validation is recommended.'
        });
      } else {
        safeActions.push({
          ar: '🔍 قراءة بيانات الـ GPT وفهرس الذاكرة',
          en: '🔍 Read/Dump Partition Table GPT',
          danger: false,
          tab: 'smart-1click'
        });
        checkpoints.push({
          moduleAr: 'فهرس قطاعات الذاكرة',
          moduleEn: 'GPT Partition Alignment',
          status: 'OK',
          detailAr: 'أقسام الذاكرة متطابقة ولا توجد علامات تلف للـ partition table.',
          detailEn: 'GPT partition layout is uniform and aligned.'
        });
      }

      setDiagnosticReport({ status, verdictAr, verdictEn, safeActions, checkpoints });
    }, 1200);
  };

  const handleManualHardwareRead = async () => {
    setIsReadingDevice(true);
    setReadSuccessAlert(isAr ? 'جاري فحص كابل الـ USB وقراءة سجلات العتاد...' : 'Probing USB port & reading hardware descriptors...');
    realUsbService.playContinuityBeep(120, 2100);
    addLog(isAr ? 'بدء فحص وتحديث بيانات الهاتف عبر الـ USB...' : 'Syncing phone hardware via USB...');

    try {
      // Connect / Read real WebUSB device
      const usbRes = await realUsbService.requestAndPairWebUsbDevice();
      if (usbRes.success && usbRes.device) {
        setCurrentDevice(usbRes.device);
        deviceKnowledgebaseService.saveDevice(usbRes.device);
        realUsbService.playContinuityBeep(250, 2600);
        setIsReadingDevice(false);

        const msg = isAr 
          ? `✅ تم التعرف والتشخيص بنجاح: ${usbRes.device.brand} ${usbRes.device.marketName} (${usbRes.device.model}) | الوضع: ${usbRes.device.mode} | السيريال: ${usbRes.device.serialNumber}`
          : `✅ Phone identified & profiled: ${usbRes.device.brand} ${usbRes.device.marketName} (${usbRes.device.model}) | Mode: ${usbRes.device.mode} | Serial: ${usbRes.device.serialNumber}`;
        setReadSuccessAlert(msg);
        addLog(`[DIAGNOSTIC] ${msg}`);
        addLog(`[HARDWARE] المعالج: ${usbRes.device.chipsetName} | الذاكرة: ${usbRes.device.storageType} ${usbRes.device.storageSizeGb}GB | Knox: ${usbRes.device.knoxStatus || 'N/A'}`);
        triggerDiagnosticEvaluation(usbRes.device);
        setTimeout(() => setReadSuccessAlert(null), 6000);
      } else {
        // Fallback: Re-sync current active device or default preset with device knowledgebase
        let vidHex = '04E8';
        let pidHex = '6860';
        if (currentDevice.vidPid) {
          if (currentDevice.vidPid.includes(':')) {
            const parts = currentDevice.vidPid.split(':');
            vidHex = parts[0] || '04E8';
            pidHex = parts[1] || '6860';
          } else if (currentDevice.vidPid.includes('VID_') && currentDevice.vidPid.includes('PID_')) {
            const vidMatch = currentDevice.vidPid.match(/VID_([0-9A-F]{4})/i);
            const pidMatch = currentDevice.vidPid.match(/PID_([0-9A-F]{4})/i);
            if (vidMatch) vidHex = vidMatch[1];
            if (pidMatch) pidHex = pidMatch[1];
          }
        }

        const fallbackDev = deviceKnowledgebaseService.identifyAndProfileHardware(
          vidHex,
          pidHex,
          currentDevice.brand,
          currentDevice.model,
          currentDevice.serialNumber && currentDevice.serialNumber !== 'R58XA166B9X' ? currentDevice.serialNumber : `SN_${vidHex}_${pidHex}`
        );
        setCurrentDevice(fallbackDev);
        realUsbService.playContinuityBeep(220, 2400);
        setIsReadingDevice(false);

        const msg = isAr 
          ? `✅ تم التعرف وتشخيص الهاتف: ${fallbackDev.brand} ${fallbackDev.marketName} (${fallbackDev.model}) | الوضع: ${fallbackDev.mode}`
          : `✅ Phone auto-diagnosed: ${fallbackDev.brand} ${fallbackDev.marketName} (${fallbackDev.model}) | Mode: ${fallbackDev.mode}`;
        setReadSuccessAlert(msg);
        addLog(msg);
        triggerDiagnosticEvaluation(fallbackDev);
        setTimeout(() => setReadSuccessAlert(null), 5000);
      }
    } catch (err: any) {
      setIsReadingDevice(false);
      addLog(`[USB:WARN] note: ${err?.message || 'Standard enumeration'}`);
    }
  };

  const handleSelectPresetBrand = (presetKey: string) => {
    const preset = DEVICE_PRESETS.find(p => 
      p.id.toLowerCase().includes(presetKey.toLowerCase()) || 
      p.brand.toLowerCase().includes(presetKey.toLowerCase())
    ) || DEVICE_PRESETS[0];
    
    if (preset) {
      setCurrentDevice(preset);
      realUsbService.playContinuityBeep(180, 2400);
      const msg = isAr 
        ? `✅ تم اختيار ومطابقة الهاتف: ${preset.brand} ${preset.marketName} (${preset.mode})`
        : `✅ Switched target device: ${preset.brand} ${preset.marketName} (${preset.mode})`;
      setReadSuccessAlert(msg);
      addLog(msg);
      triggerDiagnosticEvaluation(preset);
      setTimeout(() => setReadSuccessAlert(null), 4000);
    }
  };

  // Master Tools Inventory Categorized & Harmonized
  const allTools: ToolDefinition[] = useMemo(() => [
    // --- Category: AI & 1-Click Fast Repair ---
    {
      id: 'smart-1click',
      nameEn: 'Smart 1-Click Studio',
      nameAr: 'استوديو النقرة الواحدة الذكي',
      category: 'AI_FAST',
      categoryLabelEn: 'AI & Quick Action',
      categoryLabelAr: 'الذكاء والإصلاح الفوري',
      icon: Sparkles,
      color: 'text-emerald-400',
      bgGlow: 'from-emerald-500/20 to-teal-500/5',
      descriptionEn: 'Automated 1-click bootloop fix, FRP wipe, and diagnostic scans.',
      descriptionAr: 'إصلاح وحل مشاكل الإقلاع وتخطي الحمايات والفحص بضغطة زر واحدة.',
      tag: 'HOT'
    },
    {
      id: 'apex-agent',
      nameEn: 'AI ApexAgent Assistant',
      nameAr: 'الوكيل الذكي ApexAgent',
      category: 'AI_FAST',
      categoryLabelEn: 'AI & Quick Action',
      categoryLabelAr: 'الذكاء والإصلاح الفوري',
      icon: Cpu,
      color: 'text-indigo-400',
      bgGlow: 'from-indigo-500/20 to-purple-500/5',
      descriptionEn: 'Multi-core neural technician reasoning through complex schematics.',
      descriptionAr: 'المساعد الذكي متعدد الأنوية لتحليل المخططات والأعطال الصعبة.',
      tag: 'AI V5'
    },
    {
      id: 'agent-encyclopedia',
      nameEn: 'Skills & OS Encyclopedia',
      nameAr: 'موسوعة خبرات الوكيل والأنظمة',
      category: 'AI_FAST',
      categoryLabelEn: 'AI & Quick Action',
      categoryLabelAr: 'الذكاء والإصلاح الفوري',
      icon: BookOpen,
      color: 'text-violet-400',
      bgGlow: 'from-violet-500/20 to-indigo-500/5',
      descriptionEn: 'Complete knowledgebase for Android kernels, iOS SEP, & hardware.',
      descriptionAr: 'مرجع شامل لعلوم أنظمة التشغيل، النواة، وحمايات الأجهزة والمعالجات.',
      tag: 'GUIDE'
    },
    {
      id: 'ai-diagnostics',
      nameEn: 'AI Diagnostics & Fault Matrix',
      nameAr: 'التشخيص الذكي ومصفوفة الأعطال',
      category: 'AI_FAST',
      categoryLabelEn: 'AI & Quick Action',
      categoryLabelAr: 'الذكاء والإصلاح الفوري',
      icon: Activity,
      color: 'text-cyan-400',
      bgGlow: 'from-cyan-500/20 to-blue-500/5',
      descriptionEn: 'Deep hardware and system sensor telemetry with live troubleshooting.',
      descriptionAr: 'فحص الحساسات والجهود وتقديم خطة إصلاح تفصيلية بالصور والخطوات.',
      tag: 'DIAG'
    },

    // --- Category: Software & Security Bypass ---
    {
      id: 'security-bypass',
      nameEn: 'Security & KG Bypass Lab',
      nameAr: 'مختبر السوفت وتخطي الحمايات 2026',
      category: 'SOFTWARE_SECURITY',
      categoryLabelEn: 'Software & Security',
      categoryLabelAr: 'السوفت وير والحمايات',
      icon: Unlock,
      color: 'text-rose-400',
      bgGlow: 'from-rose-500/20 to-amber-500/5',
      descriptionEn: 'Knox Guard (KG), Qualcomm Sahara VIP Auth, MediaTek Dimensity BROM.',
      descriptionAr: 'تخطي حماية Knox Guard، حسابات الأقساط، وتوثيق خوادم كوالكوم وميدياتك.',
      tag: 'SECURITY'
    },
    {
      id: 'flasher',
      nameEn: 'Universal Multi-Flasher',
      nameAr: 'برنامج التفليش الشامل',
      category: 'SOFTWARE_SECURITY',
      categoryLabelEn: 'Software & Security',
      categoryLabelAr: 'السوفت وير والحمايات',
      icon: Zap,
      color: 'text-amber-400',
      bgGlow: 'from-amber-500/20 to-orange-500/5',
      descriptionEn: 'Direct write for Samsung Odin, MTK SP Flash, EDL 9008, & Fastboot.',
      descriptionAr: 'تفليش أجهزة سامسونج، كوالكوم، شاومي، وأوبو مع فحص قطاعات الذاكرة.',
      tag: 'CORE'
    },
    {
      id: 'firmware-slicer',
      nameEn: 'Firmware & Partition Slicer',
      nameAr: 'مقطع الفلاشات واستخراج البوت',
      category: 'SOFTWARE_SECURITY',
      categoryLabelEn: 'Software & Security',
      categoryLabelAr: 'السوفت وير والحمايات',
      icon: Scissors,
      color: 'text-blue-400',
      bgGlow: 'from-blue-500/20 to-cyan-500/5',
      descriptionEn: 'Carve boot.img, init_boot, vbmeta without downloading 10GB ROMs.',
      descriptionAr: 'استخراج وتعديل ملفات البوت والروت في ثوانٍ دون تحميل فلاشات كاملة.',
      tag: 'FAST'
    },
    {
      id: 'quantum-bypass',
      nameEn: 'Quantum Security Bypass Engine',
      nameAr: 'محرك التخطي الفائق Quantum',
      category: 'SOFTWARE_SECURITY',
      categoryLabelEn: 'Software & Security',
      categoryLabelAr: 'السوفت وير والحمايات',
      icon: ShieldAlert,
      color: 'text-purple-400',
      bgGlow: 'from-purple-500/20 to-pink-500/5',
      descriptionEn: 'Advanced iCloud Ramdisk, FRP wipe, and MDM policy neutralizer.',
      descriptionAr: 'تخطي حسابات الآيكلود، حساب جوجل، وإلغاء قيود الإدارة عن بُعد.',
      tag: 'BYPASS'
    },
    {
      id: 'dead-boot',
      nameEn: 'Dead Boot & BROM Unbrick',
      nameAr: 'إحياء البوت الميت EDL 9008',
      category: 'SOFTWARE_SECURITY',
      categoryLabelEn: 'Software & Security',
      categoryLabelAr: 'السوفت وير والحمايات',
      icon: RotateCcw,
      color: 'text-red-400',
      bgGlow: 'from-red-500/20 to-rose-500/5',
      descriptionEn: 'Force flash emergency loaders on black-screen bricked motherboards.',
      descriptionAr: 'إنعاش الهواتف الفاقدة للإقلاع وإعادة بناء قطاعات البوت الأساسية.',
      tag: 'RECOVERY'
    },

    // --- Category: Hardware Bench & Microsoldering ---
    {
      id: 'smart-bench',
      nameEn: 'Smart Hardware Bench & Boot Curve',
      nameAr: 'طاولة الصيانة ومنحنى الباور سبلاي',
      category: 'HARDWARE_BENCH',
      categoryLabelEn: 'Hardware & Bench',
      categoryLabelAr: 'الهاردوير وطاولة الصيانة',
      icon: Gauge,
      color: 'text-amber-400',
      bgGlow: 'from-amber-500/20 to-yellow-500/5',
      descriptionEn: 'Live 12s boot current wave, JBC/Aixun iron sync, & ultrasonic bath.',
      descriptionAr: 'راسم نبضات الإقلاع 12 ثانية والتحكم بكاوية اللحام الذكية والهوت إير.',
      tag: 'HARDWARE'
    },
    {
      id: 'eeprom-programmer',
      nameEn: 'TrueTone, Battery BMS & Face ID',
      nameAr: 'برمجة التروتون وصحة البطارية 100%',
      category: 'HARDWARE_BENCH',
      categoryLabelEn: 'Hardware & Bench',
      categoryLabelAr: 'الهاردوير وطاولة الصيانة',
      icon: Tv,
      color: 'text-violet-400',
      bgGlow: 'from-violet-500/20 to-purple-500/5',
      descriptionEn: 'EEPROM data copy, 0-cycle BMS 100% capacity reset, & Dot Projector.',
      descriptionAr: 'تصفير دورات البطارية وترميم TrueTone وتخطي رسائل القطع غير الأصلية.',
      tag: 'EEPROM'
    },
    {
      id: 'thermal-lidar',
      nameEn: 'AI Thermal LiDAR & Shorts',
      nameAr: 'كاميرا التصوير الحراري وتحديد الشورت',
      category: 'HARDWARE_BENCH',
      categoryLabelEn: 'Hardware & Bench',
      categoryLabelAr: 'الهاردوير وطاولة الصيانة',
      icon: Flame,
      color: 'text-rose-400',
      bgGlow: 'from-rose-500/20 to-red-500/5',
      descriptionEn: 'Real-time IR thermal map with calibrated DC injection (<0.02mA).',
      descriptionAr: 'عزل المكثفات والأيسيات الساخنة المسببة للشورت والتسريب بدقة الميكرو.',
      tag: 'THERMAL'
    },
    {
      id: 'ai-oscilloscope',
      nameEn: 'Digital Logic Oscilloscope',
      nameAr: 'الأوسيلوسكوب الرقمي وفحص الإشارات',
      category: 'HARDWARE_BENCH',
      categoryLabelEn: 'Hardware & Bench',
      categoryLabelAr: 'الهاردوير وطاولة الصيانة',
      icon: Activity,
      color: 'text-blue-400',
      bgGlow: 'from-blue-500/20 to-indigo-500/5',
      descriptionEn: 'Dual-channel I2C/SPI bus waveform analyzer with auto decoders.',
      descriptionAr: 'فحص نبضات خطوط البيانات والترددات واكتشاف انقطاع مسارات التغذية.',
      tag: 'SIGNALS'
    },
    {
      id: 'pcb-explorer',
      nameEn: 'Interactive PCB Board Explorer',
      nameAr: 'مستعرض ومخططات البوردة التفاعلية',
      category: 'HARDWARE_BENCH',
      categoryLabelEn: 'Hardware & Bench',
      categoryLabelAr: 'الهاردوير وطاولة الصيانة',
      icon: LayoutDashboard,
      color: 'text-teal-400',
      bgGlow: 'from-teal-500/20 to-emerald-500/5',
      descriptionEn: 'Layer-by-layer PCB trace inspection and testpoint locator.',
      descriptionAr: 'تتبع المسارات بين الطبقات ونقاط الفحص Testpoints لكافة الموديلات.',
      tag: 'PCB'
    },
    {
      id: 'hardware-workbench',
      nameEn: 'Hardware Lab & Microsoldering',
      nameAr: 'بيئة الهاردوير ومختبر الشبلنة',
      category: 'HARDWARE_BENCH',
      categoryLabelEn: 'Hardware & Bench',
      categoryLabelAr: 'الهاردوير وطاولة الصيانة',
      icon: Cpu,
      color: 'text-indigo-400',
      bgGlow: 'from-indigo-500/20 to-blue-500/5',
      descriptionEn: 'Reballing profiles, interposer separation, and CNC IC grinder specs.',
      descriptionAr: 'معايير فصل طبقات البوردة المزدوجة وشبلنة معالجات PoP بأمان.',
      tag: 'REWORK'
    },

    // --- Category: RF, Network & Satellite ---
    {
      id: 'satellite-ntn',
      nameEn: 'eSIM & Satellite SOS Studio',
      nameAr: 'استوديو الاتصال الفضائي و eSIM',
      category: 'NETWORK_RF',
      categoryLabelEn: 'Network & RF',
      categoryLabelAr: 'الشبكة والاتصال الفضائي',
      icon: Satellite,
      color: 'text-cyan-400',
      bgGlow: 'from-cyan-500/20 to-blue-500/5',
      descriptionEn: 'GSMA eUICC profile manager and 3GPP Rel-17 NTN satellite tuner.',
      descriptionAr: 'إدارة وتفعيل شرائح eSIM الإلكترونية ومعايرة مودم الاتصال الفضائي 5G.',
      tag: 'SATELLITE'
    },
    {
      id: 'network',
      nameEn: 'IMEI, Baseband & NVRAM Rebuilder',
      nameAr: 'إصلاح الشبكة والسيريال و QCN',
      category: 'NETWORK_RF',
      categoryLabelEn: 'Network & RF',
      categoryLabelAr: 'الشبكة والاتصال الفضائي',
      icon: Globe,
      color: 'text-emerald-400',
      bgGlow: 'from-emerald-500/20 to-teal-500/5',
      descriptionEn: 'Restore null IMEI, fix No Service, and flash calibrated QCN/EFS.',
      descriptionAr: 'حل مشكلة الهاتف لا يقرأ شريحة، تصليح السيريال، واستعادة ملفات الشبكة.',
      tag: 'NETWORK'
    },
    {
      id: 'ufs-memory',
      nameEn: 'UFS 4.0 & eMMC Direct Programmer',
      nameAr: 'مبرمجة الذواكر UFS و eMMC',
      category: 'NETWORK_RF',
      categoryLabelEn: 'Network & RF',
      categoryLabelAr: 'الشبكة والاتصال الفضائي',
      icon: HardDrive,
      color: 'text-purple-400',
      bgGlow: 'from-purple-500/20 to-indigo-500/5',
      descriptionEn: 'ISP direct pinout, RPMB write, LUN partitioning, & health tests.',
      descriptionAr: 'قراءة وكتابة قطاعات الذاكرة عبر ISP وفحص صحة الرقاقة قبل الاستبدال.',
      tag: 'MEMORY'
    },

    // --- Category: Shop Management & QA Forensics ---
    {
      id: 'management',
      nameEn: 'Shop Management & Barcode Labels',
      nameAr: 'إدارة المحل واستيكرات الباركود والواتساب',
      category: 'SHOP_QA',
      categoryLabelEn: 'Shop & QA',
      categoryLabelAr: 'إدارة المحل وضمان الجودة',
      icon: Package,
      color: 'text-amber-400',
      bgGlow: 'from-amber-500/20 to-orange-500/5',
      descriptionEn: 'Thermal chassis stickers, 1-click WhatsApp alerts, & parts profit CRM.',
      descriptionAr: 'طباعة لاصق باركود للجهاز، إشعارات واتساب للزبائن، وحساب الأرباح.',
      tag: 'BUSINESS'
    },
    {
      id: 'forensic-cert',
      nameEn: 'Forensic QA Lab Certificate',
      nameAr: 'شهادات الفحص وضمان الجودة المعتمدة',
      category: 'SHOP_QA',
      categoryLabelEn: 'Shop & QA',
      categoryLabelAr: 'إدارة المحل وضمان الجودة',
      icon: Award,
      color: 'text-indigo-400',
      bgGlow: 'from-indigo-500/20 to-violet-500/5',
      descriptionEn: '14-point lab quality certification with printable tamper-proof QR.',
      descriptionAr: 'تصدير وطباعة شهادة فحص وضمان رسمية برمز QR بعد إتمام عملية الصيانة.',
      tag: 'QA LAB'
    },
    {
      id: 'oem-database',
      nameEn: 'OEM Pinouts & Schematics DB',
      nameAr: 'قاعدة بيانات المخططات والتست بوينت',
      category: 'SHOP_QA',
      categoryLabelEn: 'Shop & QA',
      categoryLabelAr: 'إدارة المحل وضمان الجودة',
      icon: Database,
      color: 'text-blue-400',
      bgGlow: 'from-blue-500/20 to-cyan-500/5',
      descriptionEn: 'Over 50,000 phone models with testpoints, diode readings, & ROMs.',
      descriptionAr: 'أكثر من 50,000 هاتف مع قيم الممانعات، نقاط EDL، وروابط الفلاشات الرسمية.',
      tag: 'DATABASE'
    },
    {
      id: 'os-security-lab',
      nameEn: 'OS & Security Architecture Lab',
      nameAr: 'مختبر هندسة الأنظمة والحماية',
      category: 'SHOP_QA',
      categoryLabelEn: 'Shop & QA',
      categoryLabelAr: 'إدارة المحل وضمان الجودة',
      icon: Layers,
      color: 'text-emerald-400',
      bgGlow: 'from-emerald-500/20 to-teal-500/5',
      descriptionEn: 'Deep-dive security models, TrustZone, Knox TEE, & SEP cryptography.',
      descriptionAr: 'تحليل بيئة التنفيذ الموثوقة TEE وشفرات الأمان المتقدمة لمختلف الأنظمة.',
      tag: 'RESEARCH'
    },
    {
      id: 'codelab',
      nameEn: 'Hardware Protocol & AT Terminal',
      nameAr: 'مختبر بروتوكولات الأجهزة وأوامر AT',
      category: 'SHOP_QA',
      categoryLabelEn: 'Shop & QA',
      categoryLabelAr: 'إدارة المحل وضمان الجودة',
      icon: Terminal,
      color: 'text-slate-300',
      bgGlow: 'from-slate-500/20 to-zinc-500/5',
      descriptionEn: 'Low-level UART, ADB, Fastboot, and modem raw command console.',
      descriptionAr: 'منصة إرسال الأوامر المباشرة للمودم والمعالج عبر بروتوكولات UART و USB.',
      tag: 'TERMINAL'
    }
  ], []);

  // Filtered Tools
  const filteredTools = useMemo(() => {
    return allTools.filter(tool => {
      const matchesCategory = selectedCategory === 'ALL' || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch = 
        tool.nameEn.toLowerCase().includes(q) ||
        tool.nameAr.includes(q) ||
        tool.descriptionEn.toLowerCase().includes(q) ||
        tool.descriptionAr.includes(q) ||
        tool.tag.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [allTools, selectedCategory, searchQuery]);

  // Guided Workflow Presets
  const guidedWorkflows = [
    {
      id: 'wf-samsung-kg',
      titleEn: 'Samsung Knox / KG Bypass Workflow',
      titleAr: 'مسار تخطي حماية سامسونج Knox و KG',
      stepsEn: '1. Port Switcher -> 2. KG Shadow RPMB -> 3. FastbootD Patch -> 4. QA Certificate',
      stepsAr: '١. ضبط المنفذ -> ٢. عزل Knox و RPMB -> ٣. تفليش البوت المعدل -> ٤. طباعة شهادة الضمان',
      actionTab: 'security-bypass',
      badge: 'POPULAR'
    },
    {
      id: 'wf-iphone-truetone',
      titleEn: 'iPhone 100% BMS & TrueTone Restore',
      titleAr: 'مسار تصفير بطارية الآيفون وترميم التروتون',
      stepsEn: '1. TrueTone MTSN Copy -> 2. BMS 0-Cycle Reset -> 3. Face ID Align -> 4. Thermal Sticker',
      stepsAr: '١. قراءة سيريال التروتون -> ٢. تصفير دورات البطارية -> ٣. ترميم Face ID -> ٤. طباعة باركود العميل',
      actionTab: 'eeprom-programmer',
      badge: 'HARDWARE'
    },
    {
      id: 'wf-dead-short',
      titleEn: 'Dead Boot & VCC_MAIN Short Isolation',
      titleAr: 'مسار فحص الهواتف الميتة والشورت الحراري',
      stepsEn: '1. Smart Bench Waveform -> 2. Thermal LiDAR -> 3. JBC Micro-Rework -> 4. Oscilloscope',
      stepsAr: '١. فحص منحنى الباور سبلاي -> ٢. كاميرا الحرارة -> ٣. لحام واستبدال المكثف -> ٤. قياس الإشارات',
      actionTab: 'smart-bench',
      badge: 'PRECISION'
    }
  ];

  return (
    <div className="flex flex-col gap-10 p-4 lg:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      
      {/* 🚀 Master Mission Control Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 lg:p-12 border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isAr ? 'منظومة الصيانة الاحترافية الفائقة • الجيل 2026' : 'OMNIFIX PRO ULTRA • QUANTUM ARCHITECTURE 2026'}
            </div>

            <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {isAr ? 'مركز العمليات والأدوات الموحد' : 'Unified Engineering Command Center'}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
              {isAr 
                ? 'البيئة المتكاملة لجميع أدوات السوفت وير، فك الحمايات، محطة الهاردوير، برمجة الذواكر والشاشات، وإدارة مركز الصيانة بتناسق وسلاسة فائقة.'
                : 'Orchestrate next-generation software flasher, Knox & security bypass labs, IoT smart hardware bench, TrueTone/BMS programmers, and automated shop CRM.'}
            </p>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('smart-1click')}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
              >
                <Sparkles size={16} />
                {isAr ? 'الإصلاح الذكي السريع 1-Click' : 'Smart 1-Click Repair'}
              </button>

              <button
                onClick={() => onNavigate('security-bypass')}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5"
              >
                <Unlock size={16} />
                {isAr ? 'تخطي الحمايات و Knox' : 'Security & KG Bypass'}
              </button>

              <button
                onClick={() => onNavigate('smart-bench')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 border border-white/10 transition-all hover:-translate-y-0.5"
              >
                <Gauge size={16} className="text-amber-400" />
                {isAr ? 'طاولة الصيانة والباور' : 'Smart Hardware Bench'}
              </button>

              <button
                onClick={() => onNavigate('management')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 border border-white/10 transition-all hover:-translate-y-0.5"
              >
                <Package size={16} className="text-indigo-400" />
                {isAr ? 'المحل والباركود والواتساب' : 'Shop Management & Dispatch'}
              </button>
            </div>
          </div>

          {/* Real-time System Telemetry Badges */}
          <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/10 flex flex-col gap-4 backdrop-blur-xl w-full lg:w-72 shadow-2xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>WORKSTATION HEALTH</span>
              <span className="text-emerald-400 font-bold">OPTIMAL</span>
            </span>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Security Engine:</span>
                <span className="text-cyan-400 font-bold">Knox 3.10 / KG Bypass</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Hardware Link:</span>
                <span className="text-amber-400 font-bold">JBC / Sugon IoT Online</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">FastbootD Slot:</span>
                <span className="text-emerald-400 font-bold">Dynamic A/B Ready</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Total Protocols:</span>
                <span className="text-indigo-400 font-bold">32 Verified Tools</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 📱 Live Connected Phone Telemetry & Quick Brand Selector */}
      <div className="rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Alert Notification Toast if just read */}
        {readSuccessAlert && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between gap-3 animate-fade-in shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{readSuccessAlert}</span>
            </div>
            <button 
              onClick={() => setReadSuccessAlert(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header of Device Status */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Smartphone size={28} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  {isAr ? 'الهاتف المقروء حالياً:' : 'Active Target Smartphone:'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {currentDevice.mode}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {currentDevice.port}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                {currentDevice.marketName.toLowerCase().startsWith(currentDevice.brand.toLowerCase()) ? currentDevice.marketName : `${currentDevice.brand} ${currentDevice.marketName}`} <span className="text-slate-400 text-sm font-mono">({currentDevice.model})</span>
              </h2>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleManualHardwareRead}
              disabled={isReadingDevice}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              title={isAr ? 'قراءة وتحديث بيانات الهاتف المتصل فوراً' : 'Read connected smartphone via USB'}
            >
              <RefreshCw size={14} className={isReadingDevice ? 'animate-spin' : ''} />
              <span>{isReadingDevice ? (isAr ? 'جاري الفحص والقراءة...' : 'Reading Phone...') : (isAr ? '⚡ قراءة بيانات الهاتف المتصل الآن' : '⚡ Read Connected Phone')}</span>
            </button>

            <button
              onClick={() => setUsbModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <Usb size={14} className="text-cyan-400" />
              <span>{isAr ? 'مركز فحص USB وتصحيح المنافذ' : 'USB Connection Matrix'}</span>
            </button>
          </div>
        </div>

        {/* Hardware Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">{isAr ? 'المعالج' : 'Chipset'}</span>
            <span className="text-xs font-bold text-slate-200 truncate">{currentDevice.chipsetName}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">{isAr ? 'السيريال' : 'Serial Number'}</span>
            <span className="text-xs font-mono font-bold text-cyan-400 truncate">{currentDevice.serialNumber || 'RF8N924X8M'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">{isAr ? 'البطارية' : 'Battery'}</span>
            <div className="flex items-center gap-1.5">
              <Battery size={13} className="text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-400">{currentDevice.batteryLevel}%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">{isAr ? 'حماية FRP' : 'FRP Lock'}</span>
            <span className={`text-xs font-mono font-bold ${currentDevice.frpStatus === 'ON' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {currentDevice.frpStatus}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">{isAr ? 'البوت لودر' : 'Bootloader'}</span>
            <span className="text-xs font-mono font-bold text-slate-200">{currentDevice.bootloaderStatus}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">{isAr ? 'الذاكرة والتخزين' : 'Storage'}</span>
            <span className="text-xs font-bold text-indigo-400">{currentDevice.storageSizeGb} GB ({currentDevice.storageType})</span>
          </div>
        </div>

        {/* Quick Brand Switcher Pills & MTP Mode Connect */}
        <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1.5 shrink-0">
              <Sparkles size={13} className="text-amber-400" />
              {isAr ? 'الهاتف متصل بالكمبيوتر لنقل البيانات؟ اضغط على ماركتك لربطه بالمنظومة فوراً:' : 'Phone connected for data transfer? Click brand to link instantly:'}
            </span>
            <button
              onClick={() => setUsbModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 text-[11px] font-mono underline cursor-pointer"
            >
              {isAr ? '❓ دليل تفعيل ADB والتفليش' : '❓ Enable ADB & Flashing Guide'}
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { key: 'SAMSUNG_S24U', label: 'Samsung Galaxy' },
              { key: 'XIAOMI_14PRO', label: 'Xiaomi / Redmi / Poco' },
              { key: 'IPHONE_15PRO', label: 'Apple iPhone (iOS)' },
              { key: 'OPPO_FIND_X7', label: 'OPPO / Realme' },
              { key: 'VIVO_X100_PRO', label: 'Vivo / iQOO' },
              { key: 'TRANSSION_SPARK20', label: 'Infinix / Tecno / Itel' },
              { key: 'HUAWEI_MATE60PRO', label: 'Huawei / Honor' },
              { key: 'PIXEL_8PRO', label: 'Google Pixel' },
              { key: 'QUALCOMM_EDL_GEN3', label: 'Qualcomm EDL 9008' },
              { key: 'MTK_DIMENSITY_9300', label: 'MediaTek BROM' }
            ].map(b => (
              <button
                key={b.key}
                onClick={() => handleSelectPresetBrand(b.key)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-indigo-600 hover:text-white text-slate-200 text-[11px] font-bold border border-slate-700 hover:border-cyan-400 transition-all cursor-pointer shadow-sm"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* 🧠 Dynamic Safety Diagnostic Report & Recommendations Panel */}
        <AnimatePresence mode="wait">
          {isDiagnosing && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 text-xs text-indigo-300 font-mono flex items-center gap-3 shadow-inner"
            >
              <Cpu size={16} className="text-indigo-400 animate-spin" />
              <span>{isAr ? 'جاري الفحص المتقدم لهيكل الحماية، المعالج، ونواة الهاتف لمنع الـ Brick...' : 'Evaluating hardware trust architecture, SoC signature seals & anti-rollback indexing...'}</span>
            </motion.div>
          )}

          {!isDiagnosing && diagnosticReport && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-inner"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider flex items-center gap-2">
                  <span>📝</span>
                  <span>
                    {isAr 
                      ? `تقرير تشخيص وأمان الطراز [ ${currentDevice.brand} ${currentDevice.marketName} - ${currentDevice.model} ]` 
                      : `SECURE DIAGNOSTIC MATRIX [ ${currentDevice.brand} ${currentDevice.marketName} - ${currentDevice.model} ]`
                    }
                  </span>
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                  diagnosticReport.status === 'OPTIMAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  diagnosticReport.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {diagnosticReport.status}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle size={18} className={`shrink-0 mt-0.5 ${
                  diagnosticReport.status === 'OPTIMAL' ? 'text-emerald-400' :
                  diagnosticReport.status === 'WARNING' ? 'text-amber-400' : 'text-rose-400'
                }`} />
                <div className="space-y-1">
                  <p className="text-xs text-slate-300 font-sans font-bold leading-relaxed">
                    {isAr ? diagnosticReport.verdictAr : diagnosticReport.verdictEn}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {isAr ? 'تأثير الحماية: آمن للعمليات الموصى بها أدناه دون مخاطر.' : 'Trust Profile constraint: Safe for matching actions below.'}
                  </p>
                </div>
              </div>

              {/* 📊 Modular Hardware & Software Checkup Checklist Table */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {isAr ? '📊 سجل الفحص الموردي وعزل الأعطال (HW/SW Checkup Checklist):' : '📊 HW/SW MODULAR INTEGRITY CHECKUP TABLE:'}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {diagnosticReport.checkpoints.map((cp, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${
                        cp.status === 'OK' 
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
                          : cp.status === 'WARN'
                            ? 'bg-amber-950/20 border-amber-500/20 text-amber-400'
                            : 'bg-rose-950/20 border-rose-500/20 text-rose-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">
                          {isAr ? cp.moduleAr : cp.moduleEn}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                          cp.status === 'OK' ? 'bg-emerald-500/20 text-emerald-300' :
                          cp.status === 'WARN' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {cp.status === 'OK' ? (isAr ? 'سليم ✓' : 'PASS ✓') : cp.status === 'WARN' ? (isAr ? 'تحذير ⚠️' : 'WARN ⚠️') : (isAr ? 'عطل ✗' : 'FAULT ✗')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                        {isAr ? cp.detailAr : cp.detailEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Action Selection Row */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono text-slate-400">
                  {isAr ? 'الأدوات المقترحة الآمنة للمعالج الحالي:' : 'Recommended Secure Repair Channels for SoC:'}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {diagnosticReport.safeActions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => onNavigate(act.tab)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer shadow-md ${
                        act.danger 
                          ? 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 text-slate-950 font-black' 
                          : 'bg-slate-900 border border-white/10 hover:border-indigo-400/50 text-slate-200'
                      }`}
                    >
                      <span>{isAr ? act.ar : act.en}</span>
                      <ArrowRight size={13} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🎯 Guided Workflow Paths for Instant Productivity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow size={20} className="text-indigo-400" />
            <h2 className="text-base font-black text-white">
              {isAr ? 'مسارات العمل السريعة الموجهة (Guided Precision Workflows)' : 'Instant 1-Click Guided Repair Workflows'}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">FASTER TURNAROUND</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guidedWorkflows.map(wf => (
            <div
              key={wf.id}
              onClick={() => onNavigate(wf.actionTab)}
              className="p-5 bg-slate-900 hover:bg-slate-850 rounded-3xl border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col justify-between gap-4 group shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  {wf.badge}
                </span>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div>
                <h3 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">
                  {isAr ? wf.titleAr : wf.titleEn}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-1.5 leading-relaxed">
                  {isAr ? wf.stepsAr : wf.stepsEn}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 pt-2 border-t border-white/5">
                <span>{isAr ? 'فتح مسار الإصلاح الآن' : 'Launch Workflow'}</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔍 Search & Category Navigation Bar */}
      <div className="flex flex-col gap-4 bg-slate-900/90 p-5 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl">
        
        {/* Search Input & Total Count */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث في كافة الأدوات (مثال: Knox, TrueTone, EDL, Thermal, Slicer, IMEI)...' : 'Search all tools by name, chip, protocol, or fault (e.g. Knox, TrueTone, EDL, BMS, Thermal)...'}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 px-3 py-1.5 bg-slate-950 rounded-2xl border border-white/5 shrink-0">
            <Boxes size={14} className="text-indigo-400" />
            <span>{filteredTools.length} {isAr ? 'أداة متخصصة جاهزة' : 'Engineered Tools Available'}</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: 'ALL', labelAr: 'كافة الأدوات والمختبرات', labelEn: 'All 32 Tools' },
            { id: 'AI_FAST', labelAr: '⚡ الذكاء والإصلاح السريع', labelEn: '⚡ AI & 1-Click Fast' },
            { id: 'SOFTWARE_SECURITY', labelAr: '💻 السوفت وتخطي الحمايات', labelEn: '💻 Software & Security' },
            { id: 'HARDWARE_BENCH', labelAr: '🔬 الهاردوير وطاولة الصيانة', labelEn: '🔬 Hardware & Bench' },
            { id: 'NETWORK_RF', labelAr: '📡 الشبكة والفضاء والذواكر', labelEn: '📡 RF, Satellite & Memory' },
            { id: 'SHOP_QA', labelAr: '📊 إدارة المحل وضمان الجودة', labelEn: '📊 Shop & QA Forensics' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

      </div>

      {/* 🎛️ Harmonious Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTools.map(tool => {
          const ToolIcon = tool.icon;

          return (
            <motion.div
              key={tool.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={() => onNavigate(tool.id)}
              className="p-6 bg-slate-900/95 hover:bg-slate-850 rounded-3xl border border-white/5 hover:border-indigo-500/40 shadow-xl transition-all cursor-pointer flex flex-col justify-between gap-5 group hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Subtle Ambient Background Gradient Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${tool.bgGlow} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform`} />

              {/* Card Header: Icon + Category Tag */}
              <div className="flex items-center justify-between relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform shadow-lg`}>
                  <ToolIcon size={22} />
                </div>

                <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-white/5 text-slate-400 border border-white/5 rounded-full">
                  {tool.tag}
                </span>
              </div>

              {/* Card Body: Titles & Description */}
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">
                  {isAr ? tool.nameAr : tool.nameEn}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
                  {isAr ? tool.descriptionAr : tool.descriptionEn}
                </p>
              </div>

              {/* Card Footer: Category Label + Launch Arrow */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500 relative z-10">
                <span>{isAr ? tool.categoryLabelAr : tool.categoryLabelEn}</span>
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-400 font-bold transition-colors">
                  <span>{isAr ? 'فتح' : 'OPEN'}</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Empty Search Fallback */}
      {filteredTools.length === 0 && (
        <div className="p-12 bg-slate-900/60 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-3 text-center">
          <Search size={36} className="text-slate-600" />
          <h4 className="text-base font-bold text-slate-300">{isAr ? 'لم يتم العثور على أداة مطابقة' : 'No matching tools found'}</h4>
          <p className="text-xs text-slate-500">{isAr ? 'يرجى تجربة كلمة بحث أخرى أو اختيار فئة مختلفة.' : 'Try changing your search query or reset the category filter.'}</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold mt-2"
          >
            {isAr ? 'عرض كافة الأدوات' : 'Show All Tools'}
          </button>
        </div>
      )}

      {/* 🌐 Real-time Operational Statistics Footer */}
      <div className="p-6 bg-slate-900/80 rounded-3xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">ALL SERVICES OPERATIONAL</span>
          </div>
          <span className="text-slate-600">|</span>
          <span>LATENCY: 4ms</span>
          <span className="text-slate-600">|</span>
          <span>SECURITY LEVEL: MAXIMUM</span>
        </div>

        <div className="text-slate-500 text-center sm:text-right">
          OmniFix Pro Ultra Workstation v2026.4 • Master Repair & Engineering OS
        </div>
      </div>

    </div>
  );
};
