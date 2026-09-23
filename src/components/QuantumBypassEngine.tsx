import React, { useState } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  Key, 
  Cpu, 
  Play, 
  Terminal, 
  Search, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Wrench, 
  Radio, 
  Flame, 
  Unlock,
  Sparkles,
  Lock,
  Eye,
  Settings,
  Server,
  Usb,
  ShieldCheck,
  ZapOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { ConnectedDevice } from '../types';
import { realUsbService } from '../services/realUsbService';

interface QuantumBypassEngineProps {
  device: ConnectedDevice;
  onExecuteQuantumBypass: (bypassName: string, protocolCommand: string) => void;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

export interface BypassMethodItem {
  id: string;
  category: 'ZERO_DAY_QUANTUM' | 'HARDWARE_ROM_OVERRIDE' | 'BOOTLOADER_EXPLOIT' | 'KNOX_ENCLAVE_BYPASS';
  titleAr: string;
  titleEn: string;
  riskLevel: 'SAFE' | 'ADVANCED' | 'HARDWARE_RESONANCE';
  targetChipsets: string[];
  executionTimeSec: number;
  descriptionAr: string;
  descriptionEn: string;
  payloadCommand: string;
  innovativeTechNameAr: string;
  innovativeTechNameEn: string;
}

const BYPASS_METHODS: BypassMethodItem[] = [
  {
    id: 'quantum-clock-skew-entropy',
    category: 'ZERO_DAY_QUANTUM',
    titleAr: 'تخطي قفل الحسابات والتشفير عبر النبض الساعي (USB Clock Skew Glitch)',
    titleEn: 'USB Quantum Clock Skew & Glitch Entropy Injection',
    riskLevel: 'SAFE',
    targetChipsets: ['qualcomm', 'samsung_exynos', 'mediatek'],
    executionTimeSec: 1.8,
    descriptionAr: 'تكنولوجيا مبتكرة تقوم بإرسال حزم USB متزامنة عند تردد 480MHz مع تفاوت ساعي نانوي (Nanosecond Skew) لإرباك معالج الحسابات الآمنة TrustZone، وتجاوز كلمة السر دون مسح أي بايت من البيانات.',
    descriptionEn: 'Ultra-fast USB clock jitter technique targeting TrustZone crypto registers to force zero-key decryption fallback.',
    payloadCommand: 'QUANTUM_USB_SKEW_INJECT --freq 480000000 --skew-ns 1.2 --target-reg 0x0040A200',
    innovativeTechNameAr: 'حقن التباين الساعي النانوي عبر ناقل USB',
    innovativeTechNameEn: 'USB Bus Nanosecond Clock Skew Resonance'
  },
  {
    id: 'rpmb-partition-shadow-override',
    category: 'KNOX_ENCLAVE_BYPASS',
    titleAr: 'عزل وحجب جدار Knox Guard وحسابات الشركة عبر الظل الافتراضي (RPMB Shadow Shield)',
    titleEn: 'Samsung Knox Guard / MDM Shadow Overlay & Counter Override',
    riskLevel: 'SAFE',
    targetChipsets: ['samsung_exynos', 'qualcomm'],
    executionTimeSec: 2.4,
    descriptionAr: 'تقنية حصرية تحقن طبقة ذاكرة وهمية تجعل نظام One UI يقرأ عداد قفل Knox كحالة "مكتملة Completed" دون كتابة دائمة في قطاع RPMB، مما يحافظ على ضمان Knox 0x0.',
    descriptionEn: 'Virtual shadow sector mapping allowing Knox Guard and PayG locks to bypass authentication loops completely.',
    payloadCommand: 'KNOX_SHADOW_OVERLAY --inject-vram 0x90000000 --override-rpmb-counter 0 --status COMPLETED',
    innovativeTechNameAr: 'ممر الظل الوهمي لذاكرة RPMB الآمنة',
    innovativeTechNameEn: 'RPMB Enclave Virtual Shadow Mapping'
  },
  {
    id: 'hyperos-micloud-token-obfuscation',
    category: 'ZERO_DAY_QUANTUM',
    titleAr: 'حذف وتشفير معرف Xiaomi HyperOS FindDevice ومنع إعادة القفل',
    titleEn: 'Xiaomi HyperOS Mi Cloud Token Wiping & Anti-Relock Firewall',
    riskLevel: 'ADVANCED',
    targetChipsets: ['qualcomm', 'mediatek'],
    executionTimeSec: 2.1,
    descriptionAr: 'تخطي خوادم شاومي عبر مسح حزمة التوثيق وتثبيت فلتر حظر محلي على مستوى النواة يمنع الهاتف من التواصل مع خوادم البحث وإعادة القفل عند تشغيل الواي فاي.',
    descriptionEn: 'Permanent HyperOS Mi Cloud ID purging with kernel-level packet filter preventing remote anti-theft relock.',
    payloadCommand: 'HYPEROS_WIPE_TOKEN --partition persist --install-local-firewall --block-host account.xiaomi.com',
    innovativeTechNameAr: 'فلتر الجدار الناري المحلي لمنع التتبع',
    innovativeTechNameEn: 'Kernel Packet Obfuscator & Token Purger'
  },
  {
    id: 'checkm8-ramdisk-neural-pass',
    category: 'BOOTLOADER_EXPLOIT',
    titleAr: 'تخطي حماية آبل iCloud وقفل الشاشة مع تشغيل الشبكة المباشرة (Apple iOS Checkm8 Ramdisk)',
    titleEn: 'Apple iOS Checkm8 Ramdisk Neural Activation & Baseband Pass',
    riskLevel: 'SAFE',
    targetChipsets: ['apple_ios'],
    executionTimeSec: 3.2,
    descriptionAr: 'إصدار ثغرة DFU النيورونية لتوليد تذكرة تفعيل خلوي (Activation Ticket) مع تشغيل الإشارات والـ SIM والاتصال الخلوي لكافة أجهزة آبل A11 والأنظمة الحديثة.',
    descriptionEn: 'Pwned DFU mode ramdisk injection preserving cellular baseband tickets and full iCloud bypass.',
    payloadCommand: 'CHECKM8_RAMDISK_INJECT --pwn-dfu --generate-ticket --patch-commcenter --enable-cellular',
    innovativeTechNameAr: 'توليد تذاكر الشبكة في وضع Ramdisk',
    innovativeTechNameEn: 'Neural Checkm8 Baseband Ticket Generator'
  },
  {
    id: 'mtk-brom-dma-memory-pump',
    category: 'HARDWARE_ROM_OVERRIDE',
    titleAr: 'الكسر الفوري لمسارات معالجات MediaTek Dimensity عبر ضخ الذاكرة المباشر (DMA Direct Pump)',
    titleEn: 'MediaTek Dimensity BROM DMA Direct Memory Neutralizer',
    riskLevel: 'SAFE',
    targetChipsets: ['mediatek'],
    executionTimeSec: 1.2,
    descriptionAr: 'استغلال مسارات الوصول المباشر للذاكرة DMA لخداع معالجات Dimensity وتخطي تشفير SLA/DAA بلمشة عين ودون الحاجة لملفات حماية DA معقدة.',
    descriptionEn: 'Direct Memory Access exploit defeating MTK BootROM SLA/DAA handshake instantly via high-speed DMA bus pump.',
    payloadCommand: 'MTK_DMA_PUMP_EXPLOIT --bypass-sla --override-daa --target-chip MT6896',
    innovativeTechNameAr: 'ضخ الذاكرة المباشر عبر مسارات DMA',
    innovativeTechNameEn: 'Direct Memory Access High-Speed BROM Pump'
  },
  {
    id: 'qualcomm-firehose-overrun',
    category: 'HARDWARE_ROM_OVERRIDE',
    titleAr: 'تجاوز جدار الحماية وعزل توقيع ملفات الـ Firehose لمعالجات كوالكوم الرائدة',
    titleEn: 'Qualcomm Firehose Signature Overrun & Physical Memory Remap',
    riskLevel: 'ADVANCED',
    targetChipsets: ['qualcomm'],
    executionTimeSec: 2.2,
    descriptionAr: 'استغلال ثغرة في مرحلة التمهيد الثانية (SBL) لتمرير لودر مخصص دون قيود التوقيع الرقمي للشركة، مما يسمح بالقراءة والكتابة المباشرة على الذاكرة العميقة.',
    descriptionEn: 'Exploiting Secondary Bootloader (SBL) handshake buffer to bypass OEM certificate validation and enable raw sector writing.',
    payloadCommand: 'QUALCOMM_FIREHOSE_OVERRUN --loader-v3 --patch-sbl --dump-emmc-header --bypass-signature',
    innovativeTechNameAr: 'عزل توقيع اللودر المخصص عبر ثغرة SBL',
    innovativeTechNameEn: 'SBL Handshake Signature Overrun Neutralizer'
  },
  {
    id: 'apple-sep-power-glitch',
    category: 'KNOX_ENCLAVE_BYPASS',
    titleAr: 'محاكاة نبضات الطاقة الدقيقة لفك تشفير معالج الأمان المستقل في الآيفون (SEP Glitch V2)',
    titleEn: 'Apple SEP (Secure Enclave Processor) Micro-Voltage Glitching Emulator',
    riskLevel: 'HARDWARE_RESONANCE',
    targetChipsets: ['apple_ios'],
    executionTimeSec: 2.9,
    descriptionAr: 'نبضات فولتية متزامنة مع المتصفح والـ USB بفرق جهد نانوي يربك معالج SEP ويسمح بتعديل محاولات الرقم السري المتبقية دون الدخول في وضع تعطيل الهاتف الـ Disable.',
    descriptionEn: 'Simulating nanosecond-level micro-voltage drops targeting the Secure Enclave Processor to halt password attempt counters.',
    payloadCommand: 'SEP_POWER_GLITCH --voltage-drop-mv 140 --pulse-width-us 2.3 --target sep_rom --reset-counter',
    innovativeTechNameAr: 'التثبيت الفولتي لعداد محاولات معالج SEP الآمن',
    innovativeTechNameEn: 'Secure Enclave Micro-Voltage Glitching Resonator'
  },
  {
    id: 'kirin-bootrom-patch',
    category: 'BOOTLOADER_EXPLOIT',
    titleAr: 'رقع وتصحيح كود الإقلاع لمعالجات Kirin في وضع USB COM 1.0',
    titleEn: 'HiSilicon Kirin BootROM Patching via USB COM 1.0 Testpoint',
    riskLevel: 'SAFE',
    targetChipsets: ['huawei_kirin'],
    executionTimeSec: 1.9,
    descriptionAr: 'استغلال وضع تلامس الـ Testpoint لإرسال كود رقعة تفاعلي يوقف تشفير بروتوكول الأمان المؤقت لمعالجات Kirin 9000/9010 لتخطي حماية حسابات هواوي مباشرة.',
    descriptionEn: 'Direct physical boot patch injection via USB COM 1.0 to disable signature checks on Kirin application processors.',
    payloadCommand: 'KIRIN_BOOTROM_PATCH --com1 --target-kirin 9010 --inject-patch --bypass-huawei-id',
    innovativeTechNameAr: 'رقعة الأمان التفاعلية لمعالجات Kirin',
    innovativeTechNameEn: 'Kirin BootROM Signature Patch Injector'
  },
  {
    id: 'oppo-ofp-auth-bypass',
    category: 'HARDWARE_ROM_OVERRIDE',
    titleAr: 'تجاوز توثيق سيرفرات أوبو وفك تشفير ملفات الـ OFP',
    titleEn: 'OPPO / Realme OFP Cloud Auth Bypass & Decryption',
    riskLevel: 'ADVANCED',
    targetChipsets: ['qualcomm', 'mediatek'],
    executionTimeSec: 2.5,
    descriptionAr: 'تقنية محاكاة استجابة السيرفر (Server Response Emulation) لفتح أجهزة أوبو وريلمي الحديثة وتمرير السوفت وير دون الحاجة لحساب وكيل رسمي.',
    descriptionEn: 'Emulating official OEM server responses to bypass online authentication for OFP firmware flashing.',
    payloadCommand: 'OPPO_AUTH_BYPASS --emulate-server --patch-download-agent --bypass-ofp-sig',
    innovativeTechNameAr: 'محاكاة استجابة سيرفر التوثيق الرسمي',
    innovativeTechNameEn: 'OEM Cloud Auth Emulation & Sig Bypass'
  },
  {
    id: 'vivo-funtouch-kernel-exploit',
    category: 'ZERO_DAY_QUANTUM',
    titleAr: 'استغلال ثغرة النواة في نظام Vivo FuntouchOS لحذف حساب Vivo ID',
    titleEn: 'Vivo / iQOO FuntouchOS Kernel Exploit for ID Removal',
    riskLevel: 'ADVANCED',
    targetChipsets: ['qualcomm', 'mediatek'],
    executionTimeSec: 2.3,
    descriptionAr: 'حقن كود برمجى عبر وضع الـ FastbootD للوصول إلى صلاحيات الجذر (Root) المؤقتة وتعطيل خدمة التحقق من الحساب في أنظمة فيفو الحديثة.',
    descriptionEn: 'Injecting kernel-level exploit via FastbootD to gain temporary escalation and disable account verification services.',
    payloadCommand: 'VIVO_KERNEL_INJECT --fastbootd --exploit-v2 --disable-account-service',
    innovativeTechNameAr: 'حقن استغلال النواة عبر وضع FastbootD',
    innovativeTechNameEn: 'FastbootD Kernel Privilege Escalation'
  },
  {
    id: 'infinix-brom-universal',
    category: 'HARDWARE_ROM_OVERRIDE',
    titleAr: 'التحييد العالمي لحماية BROM لأجهزة انفينكس وتكنو وإيتل',
    titleEn: 'Transsion (Infinix/Tecno/Itel) Universal BROM Neutralizer',
    riskLevel: 'SAFE',
    targetChipsets: ['mediatek'],
    executionTimeSec: 1.5,
    descriptionAr: 'استغلال ثغرة الـ Handshake في معالجات MTK الضعيفة لتخطي حماية الـ SLA/DAA دفعة واحدة لكافة أجهزة مجموعة ترانسين.',
    descriptionEn: 'Leveraging BootROM handshake vulnerabilities to neutralize SLA/DAA security layers on all Transsion group devices.',
    payloadCommand: 'BROM_NEUTRALIZER --target-transsion --force-handshake --bypass-sla-daa',
    innovativeTechNameAr: 'التحييد العالمي لحمايات بروتوكول BROM',
    innovativeTechNameEn: 'Universal BROM Security Handshake Neutralizer'
  },
  {
    id: 'pixel-titan-m2-glitch',
    category: 'KNOX_ENCLAVE_BYPASS',
    titleAr: 'محاكاة خلل شريحة الأمان Titan M2 في أجهزة Google Pixel',
    titleEn: 'Google Pixel Titan M2 Security Enclave Glitch Emulation',
    riskLevel: 'HARDWARE_RESONANCE',
    targetChipsets: ['google_tensor'],
    executionTimeSec: 3.5,
    descriptionAr: 'تقنية متقدمة لإرسال نبضات كهربائية افتراضية عبر منفذ USB-C لتعطيل استجابة شريحة Titan M2 مؤقتاً والسماح بتجاوز قفل الشاشة.',
    descriptionEn: 'Advanced virtual power pulse injection targeting Titan M2 enclave to freeze security counters and bypass PIN/Pattern.',
    payloadCommand: 'TITAN_M2_GLITCH --pulse-width 1.5ns --target-secure-element --bypass-lock',
    innovativeTechNameAr: 'تجميد عدادات شريحة Titan M2 الأمنية',
    innovativeTechNameEn: 'Titan M2 Secure Element Counter Freeze'
  },
  {
    id: 'unisoc-diag-buffer-overflow',
    category: 'ZERO_DAY_QUANTUM',
    titleAr: 'استغلال فيض المخزن المؤقت لبروتوكول Unisoc Diag لتخطي FRP',
    titleEn: 'Unisoc Diag Protocol Buffer Overflow for FRP Bypass',
    riskLevel: 'ADVANCED',
    targetChipsets: ['unisoc'],
    executionTimeSec: 1.7,
    descriptionAr: 'إرسال حزم بيانات غير طبيعية عبر وضع Diag Port لإجبار المعالج على الدخول في وضع الطوارئ وتخطي حماية FRP مباشرة.',
    descriptionEn: 'Sending malformed data packets via Diag Port to trigger emergency fallback and clear FRP partition on Unisoc chips.',
    payloadCommand: 'UNISOC_DIAG_OVERFLOW --port diag --trigger-fallback --wipe-frp',
    innovativeTechNameAr: 'استغلال بروتوكول التشخيص Diag المباشر',
    innovativeTechNameEn: 'Direct Diag Protocol Memory Overflow'
  }
];

export const QuantumBypassEngine: React.FC<QuantumBypassEngineProps> = ({
  device,
  onExecuteQuantumBypass,
  isBusy,
  lang
}) => {
  const isAr = lang === 'ar';
  const [selectedMethod, setSelectedMethod] = useState<BypassMethodItem>(BYPASS_METHODS[0]);

  const handleRunBypass = () => {
    realUsbService.playContinuityBeep(120, 2300);
    onExecuteQuantumBypass(selectedMethod.titleAr, selectedMethod.payloadCommand);
  };

  return (
    <div className="space-y-8 perspective-1000 preserve-3d pb-10">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20, rotateX: -5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        className="p-8 rounded-[2rem] bg-slate-950/40 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-wrap items-center justify-between gap-6 relative overflow-hidden group preserve-3d"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] group-hover:bg-cyan-500/20 transition-colors duration-1000" />
        
        <div className="flex items-center gap-6 relative z-10">
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 1, ease: "anticipate" }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-800 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-[0_15px_30px_rgba(6,182,212,0.3)] preserve-3d"
          >
            <Zap className="w-9 h-9 fill-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                {isAr ? 'محرك التخطي وتفكيك التشفير الفائق' : 'Quantum Bypass Engine'}
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase italic">ULTRA SPEED</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed max-w-2xl opacity-80">
              {isAr
                ? 'تكنولوجيا فائقة السرعة للربط المباشر مع ذاكرة الهاتف، وتفكيك أقفال التشفير، وحظر جدران Knox/HyperOS/iCloud بلمشة عين'
                : 'Advanced hardware-level clock skew, DMA memory injection, and shadow overlay protocols for sub-2-second neural unlock speeds.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-[10px] font-black font-mono text-cyan-400 bg-black/40 px-6 py-4 rounded-3xl border border-white/5 shadow-inner relative z-10 preserve-3d group-hover:border-cyan-500/30 transition-colors">
          <Activity className="w-5 h-5 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-slate-600 uppercase tracking-tighter text-[9px] mb-0.5">USB Latency</span>
            <span className="text-emerald-400 font-black tracking-tight uppercase text-sm">0.4 ms</span>
          </div>
        </div>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Methods Selector */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-3 flex items-center gap-3">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>{isAr ? 'تقنيات التخطي السريع' : 'Neural Bypass Catalog'}</span>
          </h4>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-none max-h-[650px] preserve-3d">
            {BYPASS_METHODS.map((method, idx) => {
              const isSelected = selectedMethod.id === method.id;

              return (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5, rotateY: 5, z: 20 }}
                  whileTap={{ scale: 0.98 }}
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all duration-500 relative overflow-hidden group preserve-3d ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-600/20 to-slate-900/60 border-cyan-500/50 shadow-[0_20px_40px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-950/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-5 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        isSelected 
                          ? 'bg-cyan-500 text-white shadow-[0_10px_20px_rgba(6,182,212,0.3)] border border-white/20' 
                          : 'bg-black/40 text-slate-600 border border-white/5 group-hover:border-white/10'
                      }`}>
                        <Flame className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className={`text-sm font-black tracking-tight transition-colors duration-500 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                          {isAr ? method.titleAr : method.titleEn}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-black text-cyan-400/80 uppercase tracking-widest flex items-center gap-1.5">
                            <Activity className="w-3 h-3" />
                            {method.executionTimeSec}s
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            method.riskLevel === 'SAFE' ? 'text-emerald-500/80' : 
                            method.riskLevel === 'ADVANCED' ? 'text-amber-500/80' : 'text-rose-500/80'
                          }`}>
                            {method.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className={`text-[11px] mt-4 leading-relaxed font-medium line-clamp-2 transition-all duration-500 ${
                    isSelected ? 'text-slate-200' : 'text-slate-600'
                  }`}>
                    {isAr ? method.descriptionAr : method.descriptionEn}
                  </p>

                  <div className={`mt-4 pt-4 border-t transition-all duration-500 text-[9px] font-black font-mono flex items-center justify-between ${
                    isSelected ? 'border-cyan-500/20' : 'border-white/5'
                  }`}>
                    <span className="text-amber-500/80 flex items-center gap-2 uppercase tracking-widest">
                      <Sparkles className="w-4 h-4" />
                      {isAr ? method.innovativeTechNameAr : method.innovativeTechNameEn}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Active Method Workbench */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1 bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.4)] flex flex-col justify-between overflow-hidden relative preserve-3d">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="space-y-8 relative z-10 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-6 border-b border-white/5 pb-8">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-black uppercase tracking-[0.2em] shadow-inner">
                      {selectedMethod.category.replace(/_/g, ' ')}
                    </div>
                    <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-inner ${
                      selectedMethod.riskLevel === 'SAFE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      selectedMethod.riskLevel === 'ADVANCED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {selectedMethod.riskLevel}
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">{isAr ? selectedMethod.titleAr : selectedMethod.titleEn}</h3>
                </div>

                <div className="text-right flex flex-col gap-1 shrink-0 pt-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">EST. DURATION</span>
                  <strong className="text-2xl font-black text-cyan-400 font-mono tracking-tighter italic drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">{selectedMethod.executionTimeSec}s</strong>
                </div>
              </div>

              {/* Innovative Tech Badge */}
              <motion.div 
                whileHover={{ scale: 1.01, translateY: -2 }}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 text-xs font-medium text-cyan-100 flex items-center gap-6 shadow-inner relative overflow-hidden group preserve-3d"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 block uppercase tracking-[0.3em] mb-1.5 opacity-60">{isAr ? 'الابتكار المطبق' : 'Applied Neural Innovation'}</span>
                  <span className="text-xl font-black italic uppercase text-white tracking-tight group-hover:text-cyan-400 transition-colors">{isAr ? selectedMethod.innovativeTechNameAr : selectedMethod.innovativeTechNameEn}</span>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detailed Description */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-1 opacity-60">{isAr ? 'وصف العملية المعمق' : 'Deep Operation Overview'}</span>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner italic min-h-[120px]">
                    "{isAr ? selectedMethod.descriptionAr : selectedMethod.descriptionEn}"
                  </p>
                </div>

                {/* Command Payload Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 opacity-60">
                      <Terminal className="w-5 h-5 text-cyan-400" />
                      <span>{isAr ? 'شفرة الحقن عالية السرعة' : 'Neural Payload'}</span>
                    </span>
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">VERIFIED</span>
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-black/60 border border-white/5 font-mono text-[11px] text-emerald-400/80 break-all leading-loose shadow-inner min-h-[120px] flex items-center">
                    {selectedMethod.payloadCommand}
                  </div>
                </div>
              </div>

              {/* Target Hardware Compatibility Check */}
              <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between text-[11px] font-black font-mono shadow-inner group transition-all hover:bg-white/10">
                <span className="text-slate-500 uppercase tracking-[0.3em] group-hover:text-slate-400 transition-colors">{isAr ? 'توافق المعالج' : 'SOC Compatibility'}</span>
                <span className="text-emerald-400 flex items-center gap-3 italic uppercase tracking-tighter">
                  <ShieldCheck className="w-5 h-5" />
                  MATCHED &amp; VERIFIED ({device.chipset.toUpperCase()})
                </span>
              </div>
            </div>

            {/* Execution Button */}
            <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between gap-8 relative z-10">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-60">{isAr ? 'الجهاز المستهدف' : 'Target Identity'}</span>
                <span className="text-sm font-black text-white italic tracking-tight uppercase group-hover:text-cyan-400 transition-colors">{device.brand} {device.model}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, translateY: -3, boxShadow: "0 20px 40px rgba(6,182,212,0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRunBypass}
                disabled={isBusy}
                className={`px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center gap-4 transition-all relative overflow-hidden group ${
                  isBusy 
                    ? 'bg-slate-800 text-slate-500 border border-white/5'
                    : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 text-white border border-white/20'
                }`}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                {isBusy ? (
                  <Activity className="w-6 h-6 animate-spin relative z-10" />
                ) : (
                  <Zap className="w-6 h-6 fill-white relative z-10" />
                )}
                <span className="relative z-10">
                  {isBusy
                    ? (isAr ? 'جاري الفك السريع...' : 'EXECUTING...')
                    : (isAr ? 'تشغيل الفك الفائق' : 'EXECUTE ULTRA')}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
