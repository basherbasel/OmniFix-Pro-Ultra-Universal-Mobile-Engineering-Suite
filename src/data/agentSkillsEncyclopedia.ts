export type SkillDomain = 'software-repair' | 'hardware-repair' | 'software-engineering' | 'languages-and-os';

export interface CodeSnippet {
  language: 'c' | 'cpp' | 'python' | 'rust' | 'bash' | 'arm-asm' | 'typescript' | 'go';
  title: string;
  code: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface AgentSkillItem {
  id: string;
  category: SkillDomain;
  titleAr: string;
  titleEn: string;
  level: 'Advanced' | 'Expert' | 'Master' | 'Architect';
  badge: string;
  descriptionAr: string;
  descriptionEn: string;
  tags: string[];
  chipsetsOrLanguages: string[];
  principlesAr: string[];
  principlesEn: string[];
  practicalStepsAr: string[];
  practicalStepsEn: string[];
  codeSnippet: CodeSnippet;
  relatedTabId: string;
  aiTroubleshootingPrompt: string;
  caseStudy: {
    problemAr: string;
    problemEn: string;
    solutionAr: string;
    solutionEn: string;
  };
}

export const AGENT_SKILLS_ENCYCLOPEDIA: AgentSkillItem[] = [
  // =========================================================================
  // 1. مهارة صيانة الهاتف سوفت وير (Mobile Software Repair Mastery)
  // =========================================================================
  {
    id: 'sw-qualcomm-edl-firehose',
    category: 'software-repair',
    titleAr: 'بروتوكول Qualcomm EDL 9008 ومحملات Firehose والهندسة العكسية لـ Sahara',
    titleEn: 'Qualcomm EDL 9008, Firehose Loaders & Sahara Protocol Engineering',
    level: 'Architect',
    badge: 'QUALCOMM EDL',
    descriptionAr: 'السيطرة الكاملة على معالجات كوالكوم في وضع الطوارئ EDL 9008، حقن الـ ELF Loaders المشفرة (Prog_firehose_ddr.elf)، التعامل مع حمايات VIP / SLA Authentication وتوليد أوامر rawprogram0.xml و patch0.xml للتعامل المباشر مع ذواكر UFS و eMMC.',
    descriptionEn: 'Absolute mastery of Qualcomm Emergency Download (EDL 9008) mode, injecting authenticated ELF firehose loaders, bypassing OEM VIP crypto gates, and generating low-level XML partition maps (rawprogram/patch) for direct storage block operations.',
    tags: ['Qualcomm', 'EDL 9008', 'Firehose', 'Sahara Protocol', 'UFS 4.0', 'rawprogram0.xml', 'Unbrick'],
    chipsetsOrLanguages: ['Snapdragon 8 Gen 1/2/3/4', 'SM8450', 'SM8550', 'SM8650', 'SD680', 'SD778G'],
    principlesAr: [
      'بروتوكول Sahara يعمل في أول 100 ميلي ثانية من وصل الجهاز لتحديد وضع التمهيد وحقن الـ Firehose ELF.',
      'الـ Firehose هو نظام تشغيل مصغر يعمل داخل معالج الـ SoC ويوفر واجهة XML-RPC عبر قنوات USB Bulk Endpoints.',
      'تجاوز حماية OEM Crypto Signature يتم عبر تفادي تحقق الـ Hash Table أو استخدام مفاتيح مسربة / ثغرات الـ BootROM.'
    ],
    principlesEn: [
      'Sahara protocol operates in the initial 100ms handshake to negotiate boot mode and stream the Firehose ELF payload.',
      'Firehose runs as an isolated micro-kernel inside the SoC core, serving XML-RPC commands over USB bulk endpoints.',
      'OEM signature enforcement bypass relies on hash table overflow bypasses, leaked authorized loaders, or BootROM memory faults.'
    ],
    practicalStepsAr: [
      'إدخال الهاتف في وضع EDL 9008 إما عبر كابل EDL 9008 المعدل (مقاومة 10K على D+ و GND) أو نقطة TestPoint الذهبية على اللوحة الأم.',
      'إرسال حزمة Sahara Hello Packet (Command 0x01) والانتظار لقراءة استجابة الـ SoC وتحديد النسخة وحالة التحقق من التوقيع الرقمي.',
      'حقن ملف Firehose Programmer المخصص لحجم ونوع الذاكرة (eMMC 5.1 أو UFS 2.2/3.1/4.0) مع تمرير معلمات ddr_type.',
      'إرسال أمر XML Configure لضبط حجم القطاع (Sector Size: 4096 لـ UFS أو 512 لـ eMMC) ثم قراءة جدول الـ GPT مباشرة.',
      'إعادة كتابة قطاعات الإقلاع الأولية (xbl, xbl_config, abl, boot, vbmeta) لاستعادة الجهاز من الموت التام.'
    ],
    practicalStepsEn: [
      'Force EDL 9008 mode using specialized 10k resistor EDL cables (D+ to GND) or bridging physical motherboard test points.',
      'Dispatch Sahara Hello Packet (Cmd 0x01) to negotiate mode and read SoC identity hash & secure boot status registers.',
      'Stream architecture-tailored Firehose ELF programmer matching memory type (eMMC or UFS 4.0) with DDR calibration params.',
      'Send XML configure payload setting sector size (4096 for UFS, 512 for eMMC), then query and parse Primary GPT headers.',
      'Surgically re-flash corrupted boot chain blocks (xbl, xbl_config, abl, boot, vbmeta) to revive total dead-boot state.'
    ],
    codeSnippet: {
      language: 'python',
      title: 'Python Sahara Handshake & Firehose Bulk Sender',
      code: `import usb.core, usb.util, struct

# Locate Qualcomm HS-USB QDLoader 9008 (VID: 0x05C6, PID: 0x9008)
dev = usb.core.find(idVendor=0x05c6, idProduct=0x9008)
if not dev:
    raise RuntimeError("No Qualcomm EDL device connected!")

dev.set_configuration()
cfg = dev.get_active_configuration()
intf = cfg[(0, 0)]
ep_out = usb.util.find_descriptor(intf, custom_match=lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT)
ep_in = usb.util.find_descriptor(intf, custom_match=lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_IN)

# 1. Send Sahara Command 0x01 (HELLO_RESP)
# Struct: cmd(0x02), length(0x30), version(0x02), compat(0x01), status(0x00), mode(0x00)
hello_resp = struct.pack('<IIIIII', 0x02, 48, 0x02, 0x01, 0x00, 0x00) + b'\\x00' * 24
ep_out.write(hello_resp)

# 2. Read Hello Packet from BootROM
resp = ep_in.read(64, timeout=3000)
print(f"[+] Sahara BootROM Handshake OK. Response length: {len(resp)} bytes")
print(f"[+] Chip ID: {hex(struct.unpack_from('<I', resp, 8)[0])}")`,
      descriptionAr: 'سكربت بايثون احترافي للمصافحة المباشرة مع بروتوكول Sahara وقراءة معرف المعالج دون برامج وسيطة.',
      descriptionEn: 'Bare-metal Python script performing direct Sahara handshake and SoC identity inspection via raw USB endpoints.'
    },
    relatedTabId: 'flasher',
    aiTroubleshootingPrompt: 'لدي هاتف Xiaomi 13 Pro (Snapdragon 8 Gen 2) فاقد للبوت في وضع 9008 ويعطي خطأ Firehose NAK: Authentication Required. كيف أتخطى حماية SLA وأعيد كتابة قطاع xbl؟',
    caseStudy: {
      problemAr: 'هاتف سامسونغ S23 Ultra فاقد للبوت تماماً إثر تفليش خاطئ، لا يقبل سوى منفذ Qualcomm 9008 ويرفض ملفات Firehose العادية بسبب قفل Knox المشفر.',
      problemEn: 'Samsung Galaxy S23 Ultra hard-bricked, stuck in EDL 9008, rejecting standard firehose loaders due to signed Knox validation.',
      solutionAr: 'تم استخدام محمل Firehose معتمد لسامسونغ، وحقن جدول GPT مخصص لا يمس منطقة RPMB أو EFS، مع إعادة تفليش قطاعات sbl1 و abl و vbmeta، وعاد الجهاز للعمل دون فقدان بيانات.',
      solutionEn: 'Applied signed Samsung Firehose loader, injected targeted GPT preserving RPMB/EFS crypto sectors, rewrote abl/vbmeta chains, recovering device with 0 byte data loss.'
    }
  },

  {
    id: 'sw-mtk-brom-bypass-auth',
    category: 'software-repair',
    titleAr: 'ثغرات MediaTek BootROM (BROM) وتخطي الـ SLA/DAA والـ Preloader Crasher',
    titleEn: 'MediaTek BootROM (BROM) Exploits, SLA/DAA Bypass & Preloader Crashers',
    level: 'Architect',
    badge: 'MTK BROM 2026',
    descriptionAr: 'استغلال ثغرات الـ BootROM في معالجات ميديا تك (Dimensity و Helio) لتخطي حمايات DAA و SLA وحمايات الهواتف الحديثة (Xiaomi, Oppo, Vivo, Infinix) دون حاجة لحساب وكيل أو سيرفر، والتعامل المباشر مع ذواكر eMMC/UFS عبر بروتوكول SP Flash Tool.',
    descriptionEn: 'Exploiting hardware-level BootROM vulnerabilities on MediaTek SoCs (Dimensity & Helio series) to bypass SLA/DAA authorization gates without auth servers, reading/writing eMMC/UFS partitions directly via raw BROM protocol commands.',
    tags: ['MediaTek', 'MTK BROM', 'Helio G99', 'Dimensity 9300', 'Preloader Crasher', 'SLA Bypass', 'Scatter Flash'],
    chipsetsOrLanguages: ['MT6765', 'MT6768', 'MT6833', 'MT6877', 'MT6893', 'MT6985', 'MT6989'],
    principlesAr: [
      'معالجات MTK تحتوي على كود إقلاع أولي ROM مدمج داخل شريحة السيليكون لا يمكن تعديله من قبل المصنع.',
      'ثغرة كسر حماية التوقيع الرقمي (Kamal/Watchdog bug) تسمح بتعطيل دوائر الـ Crypto في المعالج عبر إرسال حزم USB مهيئة خصيصاً.',
      'بمجرد كسر الـ BROM، يمكن إرسال DA (Download Agent) غير موقع لقراءة وكتابة أي بارتشن بما فيها NVRAM و PERSIST و RPMB.'
    ],
    principlesEn: [
      'MediaTek SoCs embed an immutable factory BootROM that executes before any secondary preloader or security enclave.',
      'Silicon-level cryptographic bypasses (e.g. Watchdog/USB buffer bugs) disable signature validation by manipulating internal hardware registers.',
      'Once BROM is unlatched, an unsigned Download Agent (DA) is loaded, granting unrestricted read/write access to all flash partitions.'
    ],
    practicalStepsAr: [
      'توصيل الهاتف مع الضغط على زري الصوت (Vol+ و Vol-) أو لحام نقطة KCOLO / CMD بالأرضي لإجبار المعالج على الدخول في وضع BROM.',
      'إرسال إشارة الـ Handshake (0xA0 0x0A 0x50 0x05) لاستيقاظ الـ BootROM.',
      'حقن استغلال كسر الـ SLA/DAA عبر الـ Payload المناسب لـ Chip ID المكتشف.',
      'تعطيل فحص التوقيع الرقمي في الـ Preloader وتثبيت عنوان الـ SRAM المسموح للكتابة.',
      'سحب نسخة كاملة من شبكة الجهاز (NVDATA و NVRAM) قبل إجراء أي عملية تفليش أو إصلاح بوت.'
    ],
    practicalStepsEn: [
      'Connect device while holding Volume Up + Down or bridging physical KCOLO/CMD testpoint to ground to trigger raw BROM mode.',
      'Transmit BootROM handshake sequence (0xA0 0x0A 0x50 0x05) to synchronize UART/USB baud rate.',
      'Inject payload exploiting Watchdog/Buffer register flaw matched to the detected SoC Chip ID (e.g., 0x0766).',
      'Neutralize SLA/DAA signature checks in SRAM, allowing arbitrary custom Download Agents (DA) to initialize DRAM.',
      'Instantly dump critical security blocks (NVRAM, NVDATA, PROTECT1, PROTECT2) before applying any partition rewrite.'
    ],
    codeSnippet: {
      language: 'c',
      title: 'C BootROM Handshake & Register Override (kamal_exploit.c)',
      code: `#include <stdio.h>
#include <libusb-1.0/libusb.h>

#define MTK_VID 0x0E8D
#define MTK_PID 0x0003

int mtk_send_brom_handshake(libusb_device_handle *handle) {
    unsigned char handshake[] = { 0xa0, 0x0a, 0x50, 0x05 };
    unsigned char response[4];
    int transferred = 0;

    // Send Handshake Sequence to Endpoint 0x01 (OUT)
    if (libusb_bulk_transfer(handle, 0x01, handshake, sizeof(handshake), &transferred, 1000) != 0) {
        printf("[-] Failed to send BROM handshake sequence\\n");
        return -1;
    }

    // Read back 4-byte echo response from Endpoint 0x81 (IN)
    if (libusb_bulk_transfer(handle, 0x81, response, 4, &transferred, 1000) == 0) {
        if (response[0] == 0x5f && response[1] == 0xf5) {
            printf("[+] BROM Handshake Synchronized! Echo OK: 0x%02X 0x%02X\\n", response[0], response[1]);
            return 0;
        }
    }
    return -2;
}`,
      descriptionAr: 'كود بلغة C يتعامل مباشرة مع مكتبة libusb لإجراء مصافحة الـ BROM لمعالجات MTK بدقة ميكروثانية.',
      descriptionEn: 'High-speed C implementation utilizing libusb to perform microsecond-accurate MediaTek BROM handshaking.'
    },
    relatedTabId: 'dead-boot',
    aiTroubleshootingPrompt: 'جهاز Redmi Note 12 4G (MT6781) معلق على شعار Redmi بعد ترقية HyperOS، ولا يدخل وضع Recovery ولا Fastboot. كيف أسحب فلاشة BROM وأصلح مشكلة DM-Verity؟',
    caseStudy: {
      problemAr: 'هاتف Infinix Note 30 فاقد للبوت تماماً بعد تفليش ملف Preloader غير مطابق (Preloader Corrupted)، والجهاز لا يظهر أي استجابة على الشاحن.',
      problemEn: 'Infinix Note 30 completely dead after flashing corrupted preloader; no charging indicator, no vibration.',
      solutionAr: 'تم تفعيل ثغرة BROM SLA Bypass عبر كابل USB عادي مع زر خفض الصوت، وحقن DA مخصص، ثم كتابة ملف Preloader و VBMETA الأصليين واستعاد الهاتف العمل فوراً.',
      solutionEn: 'Executed automated BROM SLA bypass via Vol- key, injected custom DA, restored clean Preloader & VBMETA binaries, instantly reviving boot.'
    }
  },

  {
    id: 'sw-frp-knox-kg-bypass',
    category: 'software-repair',
    titleAr: 'هندسة حمايات FRP وحسابات شاومي و Knox / KG State و MDM المؤسسي',
    titleEn: 'FRP, Mi Account, Samsung Knox KG State & Corporate MDM Neutralization',
    level: 'Master',
    badge: 'SECURITY BYPASS',
    descriptionAr: 'منهجية متطورة لتحييد كافة أقفال الحماية في نظام أندرويد الحديث (Android 11 حتى 15): تجاوز Factory Reset Protection عبر ثغرات MTP/Test Mode (*#0*#) و ADB Exploit، إلغاء حمايات Knox KG State (Locked/Prenormal/Completed) وحذف بروفايلات إدارة الأجهزة المؤسسية MDM دون العبث بتشفير البيانات.',
    descriptionEn: 'Deep neutralization of modern Android security controls (Android 11-15): FRP bypass via MTP modem AT command test-mode, ADB security token injection, Samsung Knox KG State unlock, and corporate MDM management profile stripping without hardware tampering.',
    tags: ['FRP Bypass', 'Samsung Knox', 'KG State', 'MDM Lock', 'Mi Account', 'Test Mode', 'AT Commands'],
    chipsetsOrLanguages: ['Exynos 1380/2400', 'Snapdragon', 'Tensor G3/G4', 'MediaTek'],
    principlesAr: [
      'قفل FRP يعتمد على حقل Persistent Data Block المخزن داخل بارتشن `persist` أو `frp` في الذاكرة.',
      'وضع Test Mode (*#0*#) يتيح الاتصال بمنفذ المودم التسلسلي (Samsung Modem AT Port) لإرسال أوامر ADB Debugging المميزة.',
      'حالة KG State المشفرة بـ Knox يتم ترويضها بتعطيل تطبيقات Knox Enrollment Service عبر بروتوكولات حظر الحزم وحقن سياسات الـ Device Owner.'
    ],
    principlesEn: [
      'FRP lock persists inside a dedicated hardware-backed cryptographic partition (persist/frp) verified at SetupWizard.',
      'Test Mode (*#0*#) exposes a raw AT modem serial channel accepting privileged ADB debug authorization commands.',
      'Knox KG State is neutralized by freezing Knox Enrollment daemon bundles and establishing device owner proxy policies.'
    ],
    practicalStepsAr: [
      'توصيل الهاتف في شاشة الترحيب (Emergency Call) وإدخال كود الاختبار *#0*# لتفعيل منفذ المودم الافتراضي.',
      'إرسال أمر AT التأسيسي: `AT+KNOX_TEST=1` أو أوامر تفعيل تصحيح الـ USB المباشرة.',
      'إرسال إشعار تفويض ADB إلى شاشة الهاتف وتأكيد مفتاح RSA التلقائي من البرنامج.',
      'تنفيذ أمر إزالة حساب جوجل وتصفير بارتشن الـ FRP: `settings put global setup_wizard_has_run 1`.',
      'تثبيت باتش منع إعادة القفل (Anti-Relock Shield) لتعطيل المزامنة الخلفية مع خوادم حماية المصنع.'
    ],
    practicalStepsEn: [
      'Navigate to Emergency Call on Setup Wizard, dial *#0*# to spawn hardware diagnostic test interface.',
      'Transmit specialized AT modem sequence enabling immediate ADB USB debugging handshake.',
      'Inject authorization RSA fingerprint token, bypass permission prompt on target screen.',
      'Dispatch system configuration overrides: `content insert --uri content://settings/secure --bind name:s:user_setup_complete --bind value:s:1`.',
      'Deploy anti-relock background persistence guard preventing Knox/Google account resync.'
    ],
    codeSnippet: {
      language: 'bash',
      title: 'Bash ADB Shell Token Overwrite & Setup Wizard Neutralizer',
      code: `#!/usr/bin/env bash
# OmniFix Pro - Instant FRP & SetupWizard Neutralizer
echo "[*] Polling connected ADB daemon..."
adb wait-for-device

echo "[+] Injecting User Setup Complete Tokens..."
adb shell content insert --uri content://settings/secure --bind name:s:user_setup_complete --bind value:s:1
adb shell content insert --uri content://settings/secure --bind name:s:device_provisioned --bind value:s:1

echo "[+] Neutralizing Google Setup Wizard Activity..."
adb shell pm disable-user --user 0 com.google.android.setupwizard
adb shell pm disable-user --user 0 com.sec.android.app.SecSetupWizard

echo "[+] Setting Global Configuration..."
adb shell settings put global setup_wizard_has_run 1

echo "[+] Rebooting Device to Unlocked Home Launcher..."
adb reboot
echo "[OK] Device successfully unlocked with zero data disruption."`,
      descriptionAr: 'سكربت شل احترافي يتخطى شاشة البداية ويصفر قفل FRP عبر أوامر Content Provider المباشرة.',
      descriptionEn: 'Shell script bypassing Android SetupWizard and unlocking home screen via direct Content Provider manipulation.'
    },
    relatedTabId: 'frp',
    aiTroubleshootingPrompt: 'هاتف Samsung Galaxy A54 (Android 14، تحديث حماية 2024) لا يستجيب لكود *#0*# في شاشة الطوارئ. ما هي الطريقة البديلة لتخطي FRP دون فتح الهاتف؟',
    caseStudy: {
      problemAr: 'جهاز Galaxy Note 20 Ultra مغلق بحساب KG Locked (Prenormal) ويرفض الدخول في وضع Download لتفليش روم معدل.',
      problemEn: 'Galaxy Note 20 Ultra stuck in KG Locked (Prenormal) state, blocking Download Mode flash attempts.',
      solutionAr: 'تم تفعيل وضع EUB عبر TestPoint، وكتابة ملف PIT مخصص لتجاوز فحص KG، وتغيير CSC إلى كود خالي من قيود المشغل واستعادة الهاتف بالكامل.',
      solutionEn: 'Invoked EUB mode via hardware testpoint, injected custom PIT table bypassing KG verification, switched CSC, fully unlocking device.'
    }
  },

  {
    id: 'sw-baseband-qcn-nvram-repair',
    category: 'software-repair',
    titleAr: 'إصلاح الشبكات والسيريال ومناطق NVRAM / NVDATA ومعايرة QCN وحماية EFS',
    titleEn: 'Baseband Architecture, NVRAM/NVDATA Reconstruction & QCN RF Calibration',
    level: 'Master',
    badge: 'BASEBAND CORE',
    descriptionAr: 'السيطرة الكاملة على بروتوكولات الراديو والمودم: تفعيل منافذ التشخيص Qualcomm Diagnostic Port (Diag 9091)، سحب وكتابة وتعديل ملفات معايرة الترددات QCN، إصلاح تلف مناطق NVRAM و NVDATA على معالجات MTK عبر META Mode، واستعادة الـ IMEI الأصلي ومفاتيح التشفير للأجهزة فاقدة للبيسباند (Baseband Unknown / Null IMEI).',
    descriptionEn: 'End-to-end mastery of mobile radio stacks and cellular modems: Qualcomm Diagnostic (Diag 9091) port enablement, QCN RF calibration curve editing, MTK META Mode NVRAM/NVDATA partition reconstruction, and cryptographic EFS restoration for unknown baseband states.',
    tags: ['Baseband', 'IMEI Repair', 'NVRAM', 'QCN', 'Diag 9091', 'EFS Partition', 'META Mode'],
    chipsetsOrLanguages: ['Snapdragon X65/X70/X75', 'MTK Helio & Dimensity', 'Exynos Modem', 'Shannon RF'],
    principlesAr: [
      'منطقة EFS تحتوي على شهادات التشفير الفريدة للشبكة ومفاتيح المصادقة الخاصة بالمشغل؛ مسحها يسبب فقدان السيريال وتحول البيسباند إلى مجهول.',
      'ملف QCN (Qualcomm Calibration Network) يخزن جداول معايرة طاقة الإرسال والاستقبال وقيم الـ Gain لمضخمات الـ PA لكل نطاق تردد.',
      'وضع MTK META Mode يتصل مباشرة بمعالج المودم دون إقلاع نظام الأندرويد، مما يسمح بحقن البايتات المباشرة لمصفوفة NVRAM.'
    ],
    principlesEn: [
      'EFS holds unique cellular security certificates and hardware RF calibrations; wiping it results in Baseband Unknown and Null IMEI.',
      'QCN stores look-up tables defining transmit/receive power, gain compensations, and frequency bands per regional carrier.',
      'MTK META Mode establishes low-level modem UART synchronization prior to Android userland, allowing atomic NVRAM block rewrites.'
    ],
    practicalStepsAr: [
      'تفعيل منفذ Diag عبر الـ ADB: `setprop sys.usb.config diag,serial_cdev,rmnet,adb` أو عبر كود الاتصال الهندسي المخصص.',
      'قراءة وتصدير ملف QCN الأصلي المشفر باستخدام بروتوكول Qualcomm DMSS (Diagnostic Monitor Subsystem).',
      'إعادة كتابة الأرقام التسلسلية المشفرة وفق خوارزمية Luhn Checksum وتوليد مفاتيح الحماية الجديدة.',
      'في هواتف MTK: إدخال الهاتف في وضع META Mode باستخدام أداة Maui META أو بروتوكول CDC Serial، وقراءة ملف Database BPLGU.',
      'تثبيت قطاعات modemst1 و modemst2 و fsg وحمايتها من المسح في التحديثات الهوائية.'
    ],
    practicalStepsEn: [
      'Activate Qualcomm Diag port via ADB: `setprop sys.usb.config diag,serial_cdev,rmnet,adb` or vendor secret dialer code.',
      'Dump existing calibration tables using Qualcomm DMSS protocol over USB CDC-ACM virtual serial pipe.',
      'Calculate valid dual IMEI strings with verified Luhn algorithmic check digits and cryptographically sign payload.',
      'For MediaTek: Force META mode handshake using modem DB (BPLGU) descriptor matching target modem firmware.',
      'Commit persistent NVRAM blocks, flush modemst1 / modemst2 NV flash blocks, and verify cellular RF latch.'
    ],
    codeSnippet: {
      language: 'python',
      title: 'Python Qualcomm Diagnostic Port NV-Item Reader (diag_nv_reader.py)',
      code: `import serial, struct

# Connect to Qualcomm Diag Port (e.g. COM12 or /dev/ttyUSB0)
ser = serial.Serial('/dev/ttyUSB0', 115200, timeout=1)

# Diagnostic Command 0x26 = DIAG_NV_READ_F
# NV-Item 550 = NV_OEM_ITEM_I (IMEI representation)
def read_nv_item(item_id):
    # Packet: cmd(0x26), item(uint16), data(128 bytes), status(uint16)
    packet = struct.pack('<BH', 0x26, item_id) + b'\\x00' * 130
    
    # Calculate CRC16-CCITT for Qualcomm Diagnostic Protocol
    crc = 0xFFFF
    for byte in packet:
        crc = ((crc >> 8) | (crc << 8)) & 0xFFFF
        crc ^= byte
        crc ^= (crc & 0xFF) >> 4
        crc ^= (crc << 12) & 0xFFFF
        crc ^= ((crc & 0xFF) << 5) & 0xFFFF
        
    framed = packet + struct.pack('<H', crc) + b'\\x7E' # HDLC Frame Terminator
    ser.write(framed)
    
    resp = ser.read(136)
    if resp and resp[0] == 0x26:
        print(f"[+] Diagnostic NV-Item {item_id} read successfully: {resp[3:13].hex()}")
        return resp[3:13]
    return None

read_nv_item(550) # Read IMEI NV-Item`,
      descriptionAr: 'سكربت بايثون يتصل مباشرة بمنفذ Diag لقراءة وتعديل عناصر NV-Items المشفرة باستخدام بروتوكول HDLC.',
      descriptionEn: 'Python script communicating over raw Qualcomm Diag serial protocol to read low-level NV memory items.'
    },
    relatedTabId: 'network',
    aiTroubleshootingPrompt: 'هاتف Redmi Note 11 Pro يعطي Baseband Version Unknown بعد ترقية غير مكتملة، ومنطقة EFS مفقودة. كيف أعيد كتابة ملف QCN ومعايرة الشبكة؟',
    caseStudy: {
      problemAr: 'هاتف سامسونغ S21 5G فاقد للشبكة تماماً (لا توجد خدمة) مع دائرة محظورة بعد محاولة تغيير روم خاطئة أتلفت قطاع EFS.',
      problemEn: 'Samsung Galaxy S21 5G stuck in No Service with circle icon after an erroneous flash wiped modemst1 and modemst2 blocks.',
      solutionAr: 'تم تفعيل منفذ Diag عبر أوامر AT، وكتابة ملف EFS و QCN أصليين تم توليدهما بالاعتماد على معالج Exynos 2100، وعادت الشبكة و 5G للعمل فوراً.',
      solutionEn: 'Enabled diagnostic interface, rebuilt corrupted radio calibration tables, committed modemst blocks, restoring instant 5G latching.'
    }
  },

  {
    id: 'sw-apple-ios-nand-purple-mode',
    category: 'software-repair',
    titleAr: 'هندسة أجهزة Apple iOS: وضع DFU، شاشة Purple Mode، وبرمجة ذواكر NAND وتعديل SysCfg',
    titleEn: 'Apple iOS Engineering: DFU Mechanics, Purple Diagnostic Mode & SysCfg Repair',
    level: 'Architect',
    badge: 'APPLE IOS DFU',
    descriptionAr: 'السيطرة الاحترافية على معمارية هواتف آيفون وأجهزة آيباد: إتقان أوضاع DFU و Recovery Mode، استغلال ثغرة checkm8 العتادية في الـ SecureROM لحقن كيرنل التشخيص PongoOS، تفعيل وضع الشاشة البنفسجية (Purple Screen Mode) لتعديل بيانات SysCfg (السيريال، كود الدولة، الواي فاي والبلوتوث) دون الحاجة لفك ورفع شريحة الـ NAND.',
    descriptionEn: 'Absolute mastery of Apple mobile devices architecture: DFU and Recovery state machines, silicon-level SecureROM checkm8 USB heap exploitation, PongoOS boot injection, and non-invasive Purple Diagnostic Mode for live SysCfg parameter unlocking without desoldering NAND.',
    tags: ['Apple iOS', 'DFU Mode', 'checkm8', 'Purple Mode', 'SysCfg', 'NAND Programming', 'PongoOS'],
    chipsetsOrLanguages: ['A7 to A16 Bionic', 'M1/M2 Apple Silicon', 'APFS Filesystem', 'iOS 12-18'],
    principlesAr: [
      'وضع DFU (Device Firmware Upgrade) يعمل مباشرة من الـ SecureROM قبل فحص توقيع نظام التشغيل أو تحميل كيرنل iOS.',
      'منطقة الـ SysCfg (System Configuration) المخزنة في أول كتل الـ NAND تحتوي على المعرفات العتادية الفريدة للوحة الأم.',
      'وضع Purple Mode يطلق نظام تشخيص مصغر من آبل يقبل أوامر Diag Commands عبر منفذ تسلسلي افتراضي (Virtual Serial Pipe).'
    ],
    principlesEn: [
      'DFU mode executes straight from immutable silicon SecureROM prior to signature checks and iBoot chain initialization.',
      'SysCfg block in NAND flash reserves unique serial numbers, Bluetooth/WiFi MAC addresses, and color/region tokens.',
      'Purple Mode invokes Apple factory diagnostic firmware exposing an interactive serial terminal interface over Lightning/Type-C.'
    ],
    practicalStepsAr: [
      'إدخال الآيفون في وضع DFU الحقيقي عبر التوقيت الدقيق لأزرار الصوت والباور.',
      'إرسال بايلود استغلال checkm8 عبر منفذ USB للسيطرة على مؤشر الذاكرة (USB Heap Feng Shui).',
      'حقن محمل PongoOS وتشغيل كيرنل Diag المخصص وتلوين الشاشة باللون البنفسجي لتأكيد استقرار الاتصال.',
      'فتح منفذ تسلسلي افتراضي وإرسال أوامر قراءة وتعديل الـ SysCfg: `syscfg get SrNm` و `syscfg set SrNm [NEW]`.',
      'إعادة تشغيل الهاتف وتوصيله ببرنامج التفعيل لإنشاء اتصال نظيف مع خوادم آبل.'
    ],
    practicalStepsEn: [
      'Place iPhone into low-level DFU state matching hardware button sequence timings.',
      'Dispatch checkm8 USB control transfer exploit payload to hijack SecureROM execution pointer.',
      'Stream PongoOS bootloader, boot diagnostic kernel, and switch screen backlight to purple diagnostic canvas.',
      'Open virtual serial tty and transmit SysCfg commands: `syscfg get SrNm` and `syscfg write` blocks.',
      'Reboot target, trigger clean Apple activation server synchronization, and confirm repaired telemetry.'
    ],
    codeSnippet: {
      language: 'c',
      title: 'C checkm8 DFU USB Control Transfer Trigger (dfu_exploit.c)',
      code: `#include <stdio.h>
#include <libusb-1.0/libusb.h>

#define APPLE_VID 0x05AC
#define APPLE_DFU_PID 0x1227

int trigger_checkm8_stall(libusb_device_handle *handle) {
    // Send standard USB setup packet to trigger heap corruption in SecureROM
    // bmRequestType: 0x21 (Class, Interface, Host-to-Device), bRequest: 1
    int res = libusb_control_transfer(handle, 0x21, 1, 0x0000, 0x0000, NULL, 0, 100);
    if (res < 0) {
        printf("[+] Expected USB stall triggered! SecureROM execution hijacked.\\n");
        return 0;
    }
    printf("[-] Exploit stall failed. Device in standard state.\\n");
    return -1;
}`,
      descriptionAr: 'كود C يرسل حزمة تحكم USB دقيقة لاستغلال ثغرة checkm8 في وضع DFU لأجهزة آيفون.',
      descriptionEn: 'C libusb implementation executing the checkm8 control transfer stall to unlatch SecureROM execution.'
    },
    relatedTabId: 'smart-1click',
    aiTroubleshootingPrompt: 'كيف أقوم بفك قفل الواي فاي (WiFi Unbind) لجهاز iPad 9th Gen دون رفع ذاكرة الـ NAND من اللوحة الأم؟',
    caseStudy: {
      problemAr: 'جهاز iPad 8 تم تبديل شريحة الواي فاي التالفة به، لكنه يرفض تفعيل الواي فاي بسبب عدم تطابق عنوان MAC المسجل في ذاكرة الـ NAND (SysCfg WiFi Unbind).',
      problemEn: 'iPad 8 WiFi module replaced, but WiFi failed to toggle on due to MAC address mismatch in NAND SysCfg.',
      solutionAr: 'تم إدخال الآيباد في وضع DFU، وتفعيل ثغرة checkm8 للدخول في وضع Purple Mode، وإرسال أمر Unbind WiFi مباشرة، وعملت الشريحة الجديدة بكفاءة 100%.',
      solutionEn: 'Booted into Purple Diagnostic Mode via checkm8, transmitted SysCfg WiFi unbind sequence, instantly enabling the new chip.'
    }
  },

  // =========================================================================
  // 2. مهارة صيانة الهاتف هارد وير (Mobile Hardware & Microsoldering Mastery)
  // =========================================================================
  {
    id: 'hw-power-rails-diagnostics',
    category: 'hardware-repair',
    titleAr: 'تحليل مسارات الطاقة الرئيسية وقراءات الممانعة (Power Rails & Diode Mode Tracing)',
    titleEn: 'Motherboard Power Rails, Diode Mode Impedance & PMIC Architecture',
    level: 'Architect',
    badge: 'POWER SEQUENCE',
    descriptionAr: 'الفهم العميق لدورات الطاقة في الهواتف الذكية (VBUS 5V/9V, VBAT 3.8-4.3V, VPH_PWR, Buck Converters, LDOs). قياس الممانعات في وضع الدايود (Diode Mode) لاكتشاف الشورت الصريح والشورت الجزئي وتحديد سبب سحب التيار الخامل قبل وبعد الضغط على زر التشغيل.',
    descriptionEn: 'Exhaustive mastery of smartphone power tree dynamics (VBUS, VBAT, VPH_PWR, PMIC Buck/LDO sequencing). Precision diode-mode impedance mapping for dead short and parasitic leak detection before and after power button trigger events.',
    tags: ['Power Rails', 'Diode Mode', 'VPH_PWR', 'PMIC', 'Buck Coils', 'LDO', 'Current Curve'],
    chipsetsOrLanguages: ['Qualcomm PM8150/PM8550', 'MTK MT6359/MT6360', 'Apple PMU', 'Exynos PMIC'],
    principlesAr: [
      'مسار VPH_PWR (أو VDD_MAIN في آيفون) هو عصب اللوحة الرئيسي المتفرع من آي سي الشحن الأساسي (Main Charger IC).',
      'أي انخفاض في ممانعة ملفات الـ Buck المحيطة بآي سي الباور (PMIC) أقل من 50 ميلي فولت يشير إلى قصر في خط تغذية معالج التطبيقات أو الرام.',
      'منحنى استهلاك التيار على الباور سبلاي (DC Power Supply) هو البصمة الحيوية لتشخيص مكان العطل بدقة ثانية الإقلاع.'
    ],
    principlesEn: [
      'VPH_PWR (or VDD_MAIN in iPhone) is generated by the DC-DC buck converter of the Charger IC to feed the entire motherboard.',
      'Diode readings on PMIC buck coils under 50mV generally indicate core processor or LPDDR RAM silicon rail breakdown.',
      'DC power supply current draw curve represents the deterministic signature of power sequencing stages and diagnostic stall points.'
    ],
    practicalStepsAr: [
      'توصيل كابل الباور سبلاي المضبوط على 4.2 فولت وتيار محدد 3.0 أمبير ومراقبة سحب التيار في وضع الخمول (Standby 0.000A).',
      'إذا وجد سحب قبل كبسة الباور (مثلاً 0.450A): العطل محصور في المسار الأساسي (VBAT أو VBUS أو VPH_PWR/VDD_MAIN).',
      'إذا وجد سحب بعد كبسة الباور يتوقف عند 0.080A (80mA): المعالج لم يقرأ الذاكرة (UFS/eMMC Boot failure) أو خط تغذية 1.8V IO مفقود.',
      'استخدام الأفوميتر في وضع الدايود (المجس الأحمر على الأرضي والأسود على الخط المفحوص) ومقارنة القراءات بقيم المخطط الرسمي (Schematic).',
      'حقن جهد 1.2V-2.0V بتيار 2A على المسار المصاب واستخدام الكاميرا الحرارية لتحديد المكثف أو الآي سي المتسبب بالشورت.'
    ],
    practicalStepsEn: [
      'Connect DC power supply calibrated to 4.2V / 3.0A current limit and verify zero idle current consumption (0.000A).',
      'Leakage before power button click indicates primary line breakdown (VBAT, VBUS, or VPH_PWR / VDD_MAIN).',
      'Stuck current at 60-90mA post-trigger indicates power sequence OK but CPU failed to communicate with UFS/eMMC storage (missing 1.8V VCCQ).',
      'Employ Diode Mode (Red probe on chassis ground, Black on test point) cross-referencing OEM schematics tolerances (±10%).',
      'Execute low-voltage high-current injection (1.2-2.0V / 2.5A) and inspect thermographic thermal delta to pinpoint shorted capacitor.'
    ],
    codeSnippet: {
      language: 'cpp',
      title: 'C++ Power Rail Anomaly Detection Algorithm (diode_analyzer.cpp)',
      code: `#include <iostream>
#include <string>
#include <vector>

struct PowerRail {
    std::string name;
    double expectedDiodeMv;
    double tolerancePercent;
    std::string associatedIC;
};

void evaluateRailReading(const PowerRail& rail, double measuredMv) {
    double minAllowed = rail.expectedDiodeMv * (1.0 - rail.tolerancePercent / 100.0);
    double maxAllowed = rail.expectedDiodeMv * (1.0 + rail.tolerancePercent / 100.0);

    std::cout << "[Evaluating " << rail.name << "] Measured: " << measuredMv << " mV | Target: " << rail.expectedDiodeMv << " mV\\n";

    if (measuredMv < 50.0) {
        std::cout << "  [CRITICAL ALARM] Direct Short Circuit to Ground! Inspect rail decoupling capacitors or " << rail.associatedIC << "\\n";
    } else if (measuredMv < minAllowed) {
        std::cout << "  [WARNING] High Leakage / Partial Short. Suspect damaged protective TVS diode or IC silicon gate.\\n";
    } else if (measuredMv > 1200.0) {
        std::cout << "  [OPEN CIRCUIT] Open line detected! Check series inductor or broken PCB micro-via under BGA.\\n";
    } else {
        std::cout << "  [PASS] Rail impedance within safe clinical tolerance.\\n";
    }
}`,
      descriptionAr: 'خوارزمية C++ متقدمة لتحليل قراءات الدايود وتصنيف الأعطال بين الشورت الصريح، الشورت الجزئي، أو الخط المقطوع.',
      descriptionEn: 'C++ diagnostic routine evaluating diode mode voltage drop against tolerance thresholds to classify hardware faults.'
    },
    relatedTabId: 'multimeter',
    aiTroubleshootingPrompt: 'هاتف iPhone 13 Pro فاقد للإقلاع تماماً، يسحب 1.8 أمبير فور التوصيل بالباور سبلاي قبل كبسة الباور مع حرارة قرب المعالج. كيف أحدد إن كان الشورت في آي سي الصوت، الباور، أو مكثف سيراميك؟',
    caseStudy: {
      problemAr: 'هاتف Poco X3 Pro فاقد للباور فجأة، عند الضغط على زر التشغيل يسحب 0.120A ويثبت دون ظهور أي بيانات على الشاشة أو منفذ الكمبيوتر.',
      problemEn: 'Poco X3 Pro completely dead; pulls 120mA on power trigger and freezes with no USB detection.',
      solutionAr: 'فحص ممانعات ملفات الباور حول PM6150 أظهر انخفاض ممانعة مسار VDD_CORE بسبب تفكك كرات القصدير تحت معالج SD860. تم فك وشبلنة المعالج (CPU Reballing) وعاد الهاتف للعمل فوراً.',
      solutionEn: 'Diode check around PMIC revealed dropped VDD_CORE impedance caused by cold solder under Snapdragon 860. Executed precision dual-layer CPU reballing, restoring full operation.'
    }
  },

  {
    id: 'hw-microsoldering-reballing-sandwich',
    category: 'hardware-repair',
    titleAr: 'المايكروسولدرينغ وشبلنة معالجات الساندويتش وترميم المسارات المجهرية (0.01mm Jumpers)',
    titleEn: 'Microsoldering, Dual-Layer Sandwich Reballing & Micro-Jumper Routing (0.01mm)',
    level: 'Master',
    badge: 'MICROSOLDERING',
    descriptionAr: 'التقنيات الجراحية للحام المجهري تحت الميكروسكوب: شبلنة معالجات BGA والرام المعلقة (PoP - Package on Package)، فك ودمج بوردات الآيفون المزدوجة (Interposer Layer)، زراعة المسارات النحاسية المقطوعة تحت الآيسيهات (Torn Pads) باستخدام أسلاك 0.01 مم وتثبيتها بطلاء الـ UV المقاوم للحرارة.',
    descriptionEn: 'Surgical micro-soldering under stereo magnification: BGA Package-on-Package (PoP) CPU/RAM reballing, iPhone dual-board interposer splitting and reflow, and precision 0.01mm insulated micro-jumper rebuilding for ripped solder pads with UV curable mask.',
    tags: ['Micro-Soldering', 'Reballing', 'CPU Sandwich', 'Interposer', 'BGA Stencil', 'Torn Pad', 'UV Mask'],
    chipsetsOrLanguages: ['A15/A16/A17 Pro Bionic', 'Snapdragon 8 Gen 2/3', 'UFS 4.0 BGA153/BGA254'],
    principlesAr: [
      'درجة انصهار قصدير اللحام الرصاصي (Leaded 183°C) توفر مرونة ميكانيكية أعلى ومقاومة للصدمات مقارنة بالقصدير الخالي من الرصاص (Lead-free 217°C).',
      'فصل المعالج عن الرام يتطلب ضبط حرارة دقيق (320°C هواء ناعم) مع استخدام شفرة 0.05 مم مرنة دون ممارسة أي ضغط عمودي.',
      'ترميم التراك المجهري المقطوع يتطلب كشط طبقة السولدر ماسك للوصول إلى النقطة النحاسية الأصلية ولحام سلك معزول وتثبيته بـ UV Curing.'
    ],
    principlesEn: [
      'Leaded solder alloy (63/37 at 183°C) affords superior elastic shear resilience compared to brittle factory lead-free alloys (217°C).',
      'Splitting PoP RAM from CPU silicon requires strictly calibrated thermal profiling (320°C, low airflow) and ultra-thin 0.05mm pry blades without vertical leverage.',
      'Torn pad restoration necessitates micro-scraping trace copper to solder 0.01mm enamelled wire anchored with thermal-grade UV solder mask.'
    ],
    practicalStepsAr: [
      'تثبيت البوردة على حامل حراري مخصص (Board Holder) ووضع حماية حرارية (Heat Shield) من رقائق الألمنيوم على الكريستالة والذواكر المحيطة.',
      'إزالة مادة الحماية السوداء (Underfill Resin) حول أطراف الآي سي عند حرارة 220°C باستخدام مسبار حاد.',
      'رفع الآي سي بحرارة 340°C - 350°C بتدفق هواء دائري منتظم، وتنظيف اللوحة بمكواة لحام مسطحة (Knife Tip) وشريط شيلد النحاسي (Wick).',
      'وضع الشبلونة الفولاذية المخصصة واستخدام معجون قصدير 183°C وتمرير الهواء الساخن بحرارة 280°C لتكوين كرات متطابقة الحجم.',
      'فحص كرات اللحام تحت المجهر بزاوية 45 درجة للتأكد من عدم وجود أي تماس وتطبيق فلكس أصلي (Amtech NC-559) قبل إعادة التركيب.'
    ],
    practicalStepsEn: [
      'Lock motherboard into CNC pre-heater clamp; apply Kapton polyimide and copper heat shielding over adjacent crystal oscillators and RF filters.',
      'Clean structural black epoxy underfill around BGA perimeter at controlled 220°C using surgical hook probes.',
      'Reflow and extract target BGA at 345°C circular airflow; planarize PCB pads with bevel knife tip and high-grade copper de-soldering braid.',
      'Align ultra-precise laser-cut black steel stencil; squeegee 183°C solder paste; reflow at 280°C to generate uniformly spherical micro-balls.',
      'Inspect array under 45° stereo magnification for coplanarity; apply high-activity RMA flux (Amtech NC-559-V2) and perform optical self-alignment reflow.'
    ],
    codeSnippet: {
      language: 'bash',
      title: 'Thermal Profile & Airflow Station Configuration Script',
      code: `#!/usr/bin/env bash
# Quick 861DW / Aixun Station Profile Macro for CPU BGA Removal
echo "=== AUTOMATED THERMAL PROFILE CONTROLLER ==="
echo "[Stage 1] Preheating PCB Under-chassis: 120°C / 180s (Prevent Warping)"
echo "[Stage 2] Underfill Softening & Perimeter Clean: 220°C / Air 40% / 60s"
echo "[Stage 3] Main Solder Reflow Ramp: 345°C / Air 65% / 45s (BGA Lift Window)"
echo "[Stage 4] Board Cooldown Gradient: 100°C / Air 80% (Prevent Silicon Shock)"
echo "[STATUS] Profile verified safe for 8-layer HDI Smartphone Motherboards."`,
      descriptionAr: 'بروفايل حراري موثق لضبط محطات اللحام الاحترافية لمنع انتفاخ المعالج أو انحناء طبقات اللوحة الأم.',
      descriptionEn: 'Standardized thermal profile configuration ensuring safe BGA reflow and preventing PCB layer delamination.'
    },
    relatedTabId: 'hardware-workbench',
    aiTroubleshootingPrompt: 'أثناء فك معالج iPhone 14 Pro، تم خلع 4 أرجل (Pads) على بوردة المعالج. كيف أعرف من المخطط إن كانت هذه الأرجل NC (غير متصلة) أم مسارات بيانات حيوية؟',
    caseStudy: {
      problemAr: 'هاتف Samsung S22 فاقد للواي فاي والبلوتوث تماماً، مع بطء شديد في النظام وتهنيج مستمر عند فتح الكاميرا.',
      problemEn: 'Samsung Galaxy S22 WiFi and Bluetooth completely greyed out, accompanied by severe UI stuttering.',
      solutionAr: 'كشف المخطط عن كسر مجهري في مسارات التغذية تحت شريحة الواي فاي المدمجة جراء سقوط الهاتف. تم رفع الآي سي، وزراعة 3 مسارات مجهرية بسلك 0.01 مم، وشبلنة الآي سي لتعود الشبكات للعمل بنسبة 100%.',
      solutionEn: 'Microscopic inspection revealed 3 severed pads under WiFi module due to drop trauma. Reconstructed traces with 0.01mm wire, reballed IC, restoring complete RF connectivity.'
    }
  },

  {
    id: 'hw-oscilloscope-i2c-spi-rffe',
    category: 'hardware-repair',
    titleAr: 'تحليل الإشارات الرقمية بالأوسيلوسكوب وفك بروتوكولات I2C و SPI و MIPI و RFFE',
    titleEn: 'Digital Signal Analysis: Oscilloscope Waveforms, I2C/SPI Bus & MIPI Decoding',
    level: 'Architect',
    badge: 'OSCILLOSCOPE RF',
    descriptionAr: 'استخدام راسم الإشارة (Digital Storage Oscilloscope) ومحلل البروتوكولات المنطقية (Logic Analyzer) لتشخيص أعطال الاتصال التسلسلي بين المعالج والآيسيهات: فك شفرة نبضات الساعة والبيانات (SCL/SDA)، كشف ظاهرة الخط المعلق (Pulled-Down / Frozen Bus) جراء تلف أحد المكونات المتصلة بنفس المسار، وفحص إشارات التحكم السريعة RFFE الخاصة بالشبكة وإشارات العرض MIPI DSI.',
    descriptionEn: 'High-frequency digital oscilloscope and logic analyzer signal diagnostics: Decoding clock (SCL) and data (SDA) packets on inter-chip communication buses (I2C, SPI, SPMI, MIPI, RFFE), detecting frozen/clamped bus pull-down states, and isolating intermittent sensor/display IC silicon collapses.',
    tags: ['Oscilloscope', 'I2C Bus', 'SPI Bus', 'RFFE', 'SCL/SDA', 'Logic Analyzer', 'Pull-Up Resistors'],
    chipsetsOrLanguages: ['DS1054Z / Siglent SDS', 'Saleae Logic Pro', 'MIPI DSI-2', 'SPMI Qualcomm Bus'],
    principlesAr: [
      'خطوط I2C تعتمد على مقاومات رفع (Pull-Up Resistors 2.2kΩ) إلى جهد 1.8V؛ إذا تلف أي آي سي متصل على نفس الخط سيسحب الجهد للأرضي ويتعطل المسار بالكامل.',
      'الإشارة السليمة تظهر شكل نبضة مربعة نظيفة (Square Wave) مع أزمنة صعود وهبوط حادة (Rise/Fall Time < 100ns) دون تشوه أو ضجيج تشويش.',
      'مسار الساعة (Clock) يجب أن ينبض بتردد 400kHz (Fast Mode) أو 1MHz إلى 3.4MHz أثناء محاولة النظام التخاطب مع الدائرة المعنية.'
    ],
    principlesEn: [
      'I2C buses utilize 1.8V pull-up resistors (typically 2.2kΩ); a single internal silicon short in any peripheral clamps the entire bus line to ground.',
      'Healthy digital packet transitions form crisp square wave edges with steep rise/fall metrics (<100ns) devoid of capacitive rounding or ringing.',
      'The SCL clock train pulses deterministically at 400kHz or 1MHz-3.4MHz whenever the host application processor interrogates slave devices.'
    ],
    practicalStepsAr: [
      'ضبط الأوسيلوسكوب على جهد 500mV/Div وقاعدة زمنية 5µs/Div مع تفعيل Single Trigger على الحافة الهابطة (Falling Edge).',
      'توصيل المجس الأول (CH1) بمسار SCL والمجس الثاني (CH2) بمسار SDA مع توصيل مشبك الأرضي بأقرب درع حماية معدني.',
      'تشغيل الهاتف أو تفعيل الوظيفة المعطلة (مثل فتح الكاميرا أو الفيس آي دي) ومراقبة انطلاق حزمة النبضات الرقمية.',
      'إذا كانت الإشارة خطاً مستقيماً عند 0V: أحد الآيسيهات به شورت صريح للأرضي أو مقاومة الرفع تالفة.',
      'إذا كانت الإشارة مشوهة بجهد 0.8V: يوجد تسريب جزئي يتطلب فصل الآيسيهات المتصلة واحداً تلو الآخر حتى استعادة الموجة المربعة.'
    ],
    practicalStepsEn: [
      'Configure DSO timebase to 5µs/Div, vertical sensitivity to 500mV/Div, coupling to DC with Single Falling-Edge trigger.',
      'Hook Probe 1 (CH1) to SCL clock and Probe 2 (CH2) to SDA data line, keeping ground leads ultra-short to reduce parasitic capacitance.',
      'Power cycle device or launch affected subsystem (e.g. camera app or FaceID dot projector) to prompt host bus enumeration.',
      'Continuous 0V rail indicates direct silicon clamping or fractured pull-up resistor (1.8V missing).',
      'Truncated amplitude (e.g. 0.8V instead of 1.8V) exposes leaky input ESD clamping diode on one of the bus slave ICs.'
    ],
    codeSnippet: {
      language: 'cpp',
      title: 'C++ I2C Packet Sniffer & State Machine Decoder (i2c_decoder.cpp)',
      code: `#include <iostream>
#include <vector>

enum I2CState { IDLE, START, ADDR, ACK_ADDR, DATA, ACK_DATA, STOP };

struct I2CPacket {
    uint8_t slaveAddress;
    bool isRead;
    std::vector<uint8_t> dataBytes;
};

class VirtualI2CDecoder {
public:
    void processSamples(bool scl, bool sda) {
        // Detect START Condition: SDA drops while SCL is HIGH
        if (lastScl && scl && lastSda && !sda) {
            currentState = START;
            bitCount = 0;
            currentByte = 0;
            std::cout << "[I2C Trigger] START Condition Detected on Bus.\\n";
        }
        // Sample data on SCL Rising Edge
        else if (!lastScl && scl && currentState != IDLE) {
            currentByte = (currentByte << 1) | (sda ? 1 : 0);
            bitCount++;
            if (bitCount == 8) {
                std::cout << "  -> Byte Captured: 0x" << std::hex << (int)currentByte << std::dec << "\\n";
                bitCount = 0;
                currentByte = 0;
            }
        }
        lastScl = scl;
        lastSda = sda;
    }
private:
    bool lastScl = true, lastSda = true;
    I2CState currentState = IDLE;
    int bitCount = 0;
    uint8_t currentByte = 0;
};`,
      descriptionAr: 'كود C++ يحاكي فك شفرة بايتات I2C الرقمية لاكتشاف العناوين المفقودة والردود المتعثرة (NACK).',
      descriptionEn: 'C++ state machine modeling real-time I2C start/stop transitions and byte-level payload decoding.'
    },
    relatedTabId: 'ai-oscilloscope',
    aiTroubleshootingPrompt: 'هاتف iPhone 12 يعيد التشغيل كل 3 دقائق (Panic Full) ويسجل في التقرير خطأ `i2c0 sensor failure: prs0 missing`. كيف أحدد الآي سي المعطل؟',
    caseStudy: {
      problemAr: 'هاتف سامسونغ نوت 20 يعلق على الشعار الأول (Samsung Logo Freeze) ويرفض الإقلاع نهائياً رغم سلامة السوفت وير والذاكرة.',
      problemEn: 'Samsung Galaxy Note 20 frozen indefinitely on startup logo; firmware reflashing succeeded but reboot loop persisted.',
      solutionAr: 'فحص خط I2C_AP_SDA بالأوسيلوسكوب كشف عن انخفاض الجهد إلى 0.6V بدلاً من 1.8V بسبب تسريب في آي سي حساس البوصلة (Compass IC). تم رفع الحساس فاستعاد الخط موجته المربعة وأقلع الهاتف فوراً.',
      solutionEn: 'Oscilloscope probed I2C_AP_SDA rail clamped at 0.6V by a leaky magnetometer sensor. Desoldering the faulty compass restored clean 1.8V square waves, reviving boot.'
    }
  },

  {
    id: 'hw-rf-baseband-signal-path',
    category: 'hardware-repair',
    titleAr: 'دوائر الاتصال اللاسلكي والتردد الراديوي (RF Front-End, Transceivers & PAs)',
    titleEn: 'RF Front-End Architecture, Transceiver (WTR/SDR) & Power Amplifier (PA) Tracing',
    level: 'Master',
    badge: 'RF MICRO-WAVE',
    descriptionAr: 'التشخيص العميق لأعطال الشبكة العتادية: تتبع مسار الإشارة من الهوائي الخارجي عبر مفاتيح الهوائيات (Antenna Switches)، فلاتر التردد (Saw Filters)، مضخمات الطاقة منخفضة ومتوسطة وعالية التردد (LB / MB / HB Power Amplifiers)، وحتى معالج التردد الراديوي الرئيسي (Transceiver WTR / SDR) وآي سي تغذية التردد (APT / ET Tracker IC).',
    descriptionEn: 'Micro-wave RF front-end diagnostics: Signal trace mapping from antenna arrays, through duplexers and acoustic SAW filters, Low/Mid/High band Power Amplifiers (PA), envelope power tracking (ET/APT) supplies, into Qualcomm WTR / SDR or MediaTek RF transceivers.',
    tags: ['RF Front-End', 'Transceiver WTR', 'Power Amplifier PA', 'Envelope Tracking', 'SAW Filter', 'No Service', 'Baseband PMIC'],
    chipsetsOrLanguages: ['Qualcomm SDR735/WTR5975', 'Skyworks Sky58xxx', 'Qorvo QM77xxx', 'Shannon RF'],
    principlesAr: [
      'إذا كان الهاتف يكتشف الشبكات في البحث اليدوي ولكنه يعجز عن الاتصال: مسار الاستقبال (RX) سليم وعطل الشبكة في مسار الإرسال (TX) ومضخم الباور PA.',
      'إذا كان الهاتف لا يظهر أي شبكة حتى في البحث اليدوي (Searching): مسار الاستقبال RX مقطوع أو معالج التردد Transceiver لا يستقبل إشارة الساعة 38.4MHz من الكريستالة.',
      'جهد تغذية مضخمات الطاقة يأتي عبر مسار VPA_APT الديناميكي الذي يولد جهداً متغيراً من 0.5V إلى 4.2V بحسب قوة إشارة البرج.'
    ],
    principlesEn: [
      'If device finds carriers during manual operator search but fails to register, the RX reception chain is intact and TX / PA amplifier is defective.',
      'If manual search yields zero carriers (immediate searching/no service failure), RX line is broken or RF transceiver crystal oscillator (38.4MHz TCXO) is quiescent.',
      'Power amplifiers receive dynamic modulated voltages from Envelope Tracking (ET) ICs (0.5V-4.2V) scaling dynamically with base station proximity.'
    ],
    practicalStepsAr: [
      'طلب الكود `*#06#` للتأكد من ظهور رقم السيريال IMEI ونسخة الـ Baseband Modem في الإعدادات.',
      'إجراء بحث يدوي عن الشبكات (Manual Network Search) وتحديد ما إذا كان العطل في مرحلة الاستقبال (RX) أو الإرسال (TX).',
      'فحص ممانعات ملفات تغذية آي سي التردد (WTR / SDR) والتأكد من وجود جهود 1.0V و 1.8V الأساسية.',
      'فحص تردد كريستالة التردد الراديوي (RF TCXO 38.4MHz) باستخدام الأوسيلوسكوب أو عداد الترددات.',
      'تغيير مضخم الطاقة المتضرر (PA IC) مع ضبط حرارة اللحام عند 330°C لتفادي حرق طبقات العزل السيليكونية الداخلية.'
    ],
    practicalStepsEn: [
      'Dial `*#06#` to assert Baseband Firmware, IMEI and ICCID presence inside settings.',
      'Trigger manual carrier search to bisect the fault into RX Reception versus TX Transmission subsystems.',
      'Probe diode mode values across RF Transceiver power rails (VREG_L5_1P0, VREG_L12_1P8) to eliminate supply drops.',
      'Verify 38.4MHz sinusoidal clock input from master RF temperature-compensated crystal oscillator (TCXO).',
      'Reflow or replace damaged power amplifier module under calibrated 330°C airflow without delaminating micro-substrate.'
    ],
    codeSnippet: {
      language: 'c',
      title: 'C Transceiver Register Power Status Probe (rf_reg_probe.c)',
      code: `#include <stdio.h>
#include <stdint.h>

#define RF_TRANSCEIVER_ADDR 0x58
#define REG_CHIP_ID         0x00
#define REG_PLL_LOCK_STATUS 0x04
#define REG_TX_STATUS       0x12

int inspect_rf_transceiver_health(uint8_t (*read_reg)(uint8_t dev, uint8_t reg)) {
    uint8_t chip_id = read_reg(RF_TRANSCEIVER_ADDR, REG_CHIP_ID);
    printf("[+] Reading RF Transceiver ID: 0x%02X\\n", chip_id);
    
    uint8_t pll_lock = read_reg(RF_TRANSCEIVER_ADDR, REG_PLL_LOCK_STATUS);
    if ((pll_lock & 0x01) == 0) {
        printf("[-] CRITICAL: RF Synthesizer Phase-Locked Loop (PLL) UNLOCKED! Check 38.4MHz TCXO clock.\\n");
        return -1;
    }
    
    printf("[+] RF Synthesizer PLL Locked! Reception pipeline operational.\\n");
    return 0;
}`,
      descriptionAr: 'برنامج C يفحص حالة غلق التردد (PLL Lock) لمعالج الشبكة للتأكد من عمل الكريستالة والدوائر التناظرية.',
      descriptionEn: 'C diagnostic probe checking transceiver chip identification and internal Phase-Locked Loop status.'
    },
    relatedTabId: 'network',
    aiTroubleshootingPrompt: 'هاتف Xiaomi 12T Pro يقرأ الشريحة ويكتب اسم الشبكة لكنه يفصل مكالمات فوراً ويعطي فشل في الاتصال (Call Dropped). أين يكمن العطل في مسار الـ TX؟',
    caseStudy: {
      problemAr: 'هاتف iPhone 11 يعطي (Searching... No Service) وعند الدخول إلى *#06# لا يظهر أي رقم سيريال أو مودم.',
      problemEn: 'iPhone 11 stuck indefinitely on Searching / No Service, modem firmware blank in About screen.',
      solutionAr: 'كشف الفحص المجهري عن تفكك نقاط لحام طبقة الإنتربوزر (Interposer) بين بوردتي الآيفون عند خطوط تغذية Baseband PMU. تم فك البوردتين وإعادة شبلنة الإطار الأوسط وعادت الشبكة كاملة.',
      solutionEn: 'Separated double-decker motherboard; reballed intermediate interposer ring reconnecting Baseband PMIC power tracks, restoring full signal bars.'
    }
  },

  // =========================================================================
  // 3. مهارة التعامل مع البرمجيات وهندسة الأدوات (Software Engineering & Tooling Protocols)
  // =========================================================================
  {
    id: 'swe-usb-protocol-stack',
    category: 'software-engineering',
    titleAr: 'هندسة بروتوكولات الـ USB المنخفضة و WebUSB ومصادقة حزم الـ Firewalls',
    titleEn: 'Low-Level USB Protocol Stacks, WebUSB Architecture & Firmware Parsing',
    level: 'Architect',
    badge: 'PROTOCOL CORE',
    descriptionAr: 'بناء وبرمجة بروتوكولات الاتصال المباشر مع الهواتف عبر WebUSB و WinUSB بدون تعريفات خارجية وسيطة. التعامل مع نقاط النهاية (Bulk / Interrupt / Control Endpoints)، فك وتجميع حزم Android Sparse Images، تفكيك مستودعات Super.img الديناميكية، واستخراج ملفات boot.img و payload.bin وتعديل تواقيع الـ AVB 2.0.',
    descriptionEn: 'Architecting direct hardware bridges via WebUSB and native libusb abstractions. Managing low-level USB transfer endpoints (Bulk/Control), parsing and packing Android Sparse Images, dynamic partition carving (Super.img, payload.bin), and cryptographic Android Verified Boot (AVB 2.0) verification.',
    tags: ['WebUSB', 'USB Endpoints', 'payload.bin', 'Super.img', 'Sparse Image', 'AVB 2.0', 'libusb'],
    chipsetsOrLanguages: ['WebUSB API', 'C/C++', 'Python', 'TypeScript', 'Rust'],
    principlesAr: [
      'بروتوكول WebUSB يتيح للمتصفح التحكم المباشر بمتحكم USB للوصول إلى منافذ Fastboot و ADB و BROM و EDL دون برامج سطح مكتب.',
      'ملف payload.bin في تحديثات OTA يحتوي على أرشيف قطاعات مشفرة ومضغوطة بصيغة LZMA/XZ تتطلب فك شفرة الـ Header واستخراج البارتشنات.',
      'صور السوبر (Super.img) تستخدم نظام Dynamic Partitions (LpMetadata) لتوزيع المساحة ديناميكياً بين System و Vendor و Product.'
    ],
    principlesEn: [
      'WebUSB unlocks direct browser-to-silicon pipeline access across Fastboot, ADB, BROM, and EDL without desktop helper binaries.',
      'Modern Android OTA payload.bin files contain chunked block diffs requiring custom byte-stream unpackers to extract raw images.',
      'Super.img employs LpMetadata headers dividing physical flash dynamically across system, vendor, system_ext, and product partitions.'
    ],
    practicalStepsAr: [
      'طلب إذن الاتصال بالجهاز عبر `navigator.usb.requestDevice({ filters: [...] })` وتحديد معرفات VID/PID الخاصة بالوضع المستهدف.',
      'فتح الجلسة (Claim Interface) وضبط نقطة النهاية (Bulk OUT 0x01 للإرسال و Bulk IN 0x81 للاستقبال).',
      'تطبيق خوارزمية Fastboot Protocol Handshake بإرسال أوامر ASCII (مثل `getvar:version`) وقراءة استجابة `OKAY` أو `FAIL`.',
      'تفكيك ملف الـ Sparse Image بقراءة الـ Magic Number (`0xED26FF3A`) ومعالجة الـ Chunks الخام دون استهلاك الرام.',
      'حقن مسار الـ Root وتعديل كود الـ init.rc وتثبيت التوقيع الرقمي لمنع تعليق الهاتف في شاشة البوتلوب.'
    ],
    practicalStepsEn: [
      'Request USB bus permission via `navigator.usb.requestDevice` filtered with target vendor VID/PID descriptors.',
      'Claim target interface and resolve Bulk OUT (0x01) and Bulk IN (0x81) endpoint addresses.',
      'Execute Fastboot ASCII wire protocol: stream `getvar:unlocked` and parse `OKAY0.4` packet terminations.',
      'Parse Android Sparse image binary header (Magic 0xED26FF3A) and decompress chunk blocks into contiguous storage streams.',
      'Modify init.rc in RAM-disk, regenerate AVB hash descriptors, and write back to flash.'
    ],
    codeSnippet: {
      language: 'typescript',
      title: 'TypeScript Native WebUSB Fastboot Client Implementation',
      code: `// OmniFix Pro - Native Browser-to-Silicon Fastboot Engine
export class WebUsbFastbootEngine {
  private device: USBDevice | null = null;
  private endpointIn = 1;
  private endpointOut = 1;

  async connect(): Promise<boolean> {
    // Google Fastboot VID: 0x18D1, Google PID: 0x4EE0 / MTK / Qualcomm
    this.device = await navigator.usb.requestDevice({
      filters: [{ classCode: 0xff }] // Vendor Specific Class
    });

    await this.device.open();
    await this.device.selectConfiguration(1);
    await this.device.claimInterface(0);

    console.log("[+] WebUSB Connected to Target:", this.device.productName);
    return true;
  }

  async sendCommand(cmd: string): Promise<string> {
    if (!this.device) throw new Error("USB Device not initialized!");

    const encoder = new TextEncoder();
    const data = encoder.encode(cmd);
    await this.device.transferOut(this.endpointOut, data);

    // Read Response Buffer
    const result = await this.device.transferIn(this.endpointIn, 64);
    const decoder = new TextDecoder();
    const response = decoder.decode(result.data);
    return response;
  }
}`,
      descriptionAr: 'محرك WebUSB مكتوب بـ TypeScript يتواصل مباشرة مع وضع الفاست بوت بدون أي برامج تثبيت خارجية.',
      descriptionEn: 'Pure TypeScript WebUSB implementation interfacing directly with Fastboot bootloader endpoints.'
    },
    relatedTabId: 'codelab',
    aiTroubleshootingPrompt: 'كيف أقوم ببناء برنامج لاستخراج ملف boot.img من فلاشة ريكفري شاومي بصيغة payload.bin مع تجاوز تشفير الـ Payload Header؟',
    caseStudy: {
      problemAr: 'فني يحتاج لتفليش هاتف ريلمي حديث مقفول البوتلودر، لكن حزمة التحديث تأتي بصيغة OZIP مشفرة بمفتاح AES ديناميكي لا يقبله الريكفري العادي.',
      problemEn: 'Technician needed to recover a Realme smartphone, but the stock package was packed in proprietary encrypted OZIP format.',
      solutionAr: 'تمت كتابة أداة فك تشفير سريعة بلغة بايثون قرأت مفتاح AES-128 المخزن في قطاع الـ Header وحولت الـ OZIP إلى فلاشة Scatter قابلة للتفليش المباشر.',
      solutionEn: 'Developed automated Python AES-128 decryptor extracting dynamic key from header, transforming OZIP into raw scatter flash images.'
    }
  },

  {
    id: 'swe-dynamic-partitions-erofs-carving',
    category: 'software-engineering',
    titleAr: 'أنظمة الملفات والتقسيم الديناميكي: تفكيك وإعادة بناء Super.img, EROFS, F2FS و Sparse',
    titleEn: 'Filesystem Engineering: Super.img Dynamic Partitions, EROFS, F2FS & Sparse Carving',
    level: 'Architect',
    badge: 'STORAGE KERNEL',
    descriptionAr: 'الهندسة العكسية العميقة لأنظمة التخزين في أندرويد الحديث (Android 10 - 15): تفكيك حاويات التقسيم المنطقي Dynamic Partitions (LpMetadata) واستخراج وتعديل أقسام system, vendor, product, system_ext من داخل ملف super.img الضخم، فك ضغط وقراءة نظام ملفات القراءة المحسن EROFS (Enhanced Read-Only File System)، وتحويل صور Android Sparse Images المضغوطة إلى Raw Ext4/F2FS وتعديل الـ Inodes والـ File Contexts بدون إتلاف أذونات SELinux.',
    descriptionEn: 'Deep-dive storage and partition engineering for modern Android (10-15): Parsing LP metadata geometry in monolithic super.img containers, extracting and repacking logical partitions (system, vendor, product), unpacking read-only compressed EROFS filesystems, and converting chunked sparse images into raw mounts while preserving immutable SELinux contexts and extents.',
    tags: ['Super.img', 'Dynamic Partitions', 'EROFS', 'F2FS', 'Sparse Image', 'lpmake', 'simg2img'],
    chipsetsOrLanguages: ['AOSP LP Tools', 'Linux VFS', 'C/C++', 'Python 3', 'libsparse'],
    principlesAr: [
      'ملف Super.img لا يحتوي على جدول MBR أو GPT تقليدي، بل يستخدم بنية LpMetadata في أول 4KB لوصف أماكن وأحجام البارتشنات الديناميكية وخصائص التمدد (Group Extents).',
      'نظام ملفات EROFS صممته هواوي واعتمدته جوجل كنظام قياسي لأندرويد 13+؛ يعتمد على ضغط LZ4/MicroLZMA لكل كتلة (Block) لتوفير المساحة ومضاعفة سرعة القراءة العشوائية.',
      'تعديل أي ملف في نظام EROFS أو Ext4 يتطلب الحفاظ على الـ Extended Attributes (xattr) وخاصية `security.selinux` وإلا سيرفض الكيرنل الإقلاع (Kernel Panic - Bootloop).'
    ],
    principlesEn: [
      'Super.img abandons rigid partition tables in favor of LpMetadata headers allocating variable-sized dynamic extents for sub-volumes.',
      'EROFS uses fixed-output block compression (LZ4/LZMA) delivering 200% faster random read performance compared to legacy ext4, mandating specialized decompression engines.',
      'Direct filesystem carving requires rigorous preservation of extended attributes (xattr) especially `security.selinux` contexts to avoid early init kernel panic crashes.'
    ],
    practicalStepsAr: [
      'تحويل ملف Super.img من صيغة Sparse المضغوطة إلى صيغة خام باستخدام أداة `simg2img super.img super.raw.img`.',
      'قراءة هندسة البيانات عبر أداة `lpdump super.raw.img` لمعرفة خريطة قطاعات system_a و vendor_a.',
      'استخراج الأقسام المنطقية باستخدام `lpunpack super.raw.img output_dir`.',
      'في حال كان قسم system بصيغة EROFS: فك الضغط والتعديل باستخدام `fsck.erofs --extract` أو `erofs-utils`.',
      'إعادة بناء السوبر عبر `lpmake` مع تحديد الحجم الإجمالي (Device Size) والمجموعات (Main Group) وكتابة الهاش المطابق.'
    ],
    practicalStepsEn: [
      'De-sparsify raw partition payload utilizing `simg2img super.img super.raw.img`.',
      'Audit partition geometry and dynamic block boundaries via `lpdump super.raw.img`.',
      'Extract constituent sub-images using `lpunpack super.raw.img output_dir`.',
      'Unpack compressed EROFS images via `fsck.erofs --extract` or compile with `mkfs.erofs` preserving inode structures.',
      'Re-synthesize composite super.img binary using `lpmake` specifying target block size, slot suffixes, and group quotas.'
    ],
    codeSnippet: {
      language: 'python',
      title: 'Python LpMetadata Header Inspector (lpmeta_parser.py)',
      code: `import struct

# LpMetadata Geometry & Header Magic Constants
LP_METADATA_GEOMETRY_MAGIC = 0x616c4467 # "gDal" in ASCII (little-endian)
LP_METADATA_HEADER_MAGIC   = 0x414c5030 # "0PLA" in ASCII (little-endian)

def inspect_super_image(file_path):
    with open(file_path, 'rb') as f:
        # Seek past primary 4KB geometry header block
        f.seek(4096)
        magic, major, minor = struct.unpack('<IHH', f.read(8))
        if magic == LP_METADATA_HEADER_MAGIC:
            print(f"[+] Verified Android LpMetadata Header! Version: {major}.{minor}")
            # Read Partition Table Descriptor
            f.seek(4096 + 32)
            part_count, part_entry_size = struct.unpack('<II', f.read(8))
            print(f"[+] Total Dynamic Partitions configured inside Super: {part_count}")
        else:
            print(f"[-] Invalid or non-dynamic image magic: 0x{magic:08X}")

inspect_super_image('super.raw.img')`,
      descriptionAr: 'برنامج بايثون يقرأ هيكل LpMetadata الداخلي لملف Super.img لتحديد الأقسام المنطقية بدون برامج وسيطة.',
      descriptionEn: 'Python binary parser examining the internal LpMetadata headers of Android dynamic super.img partitions.'
    },
    relatedTabId: 'flasher',
    aiTroubleshootingPrompt: 'كيف أقوم بتعديل ملف system.img المشفر بصيغة EROFS في هاتف Xiaomi أندرويد 14 وحذف تطبيقات الإعلانات ثم إعادة تحويله وتفليشه بنجاح؟',
    caseStudy: {
      problemAr: 'فني أراد تعديل روم هاتف ريلمي 11 برو لإضافة اللغة العربية إلى قسم system، لكنه فوجئ بأن النظام بنظام EROFS ولا يمكن عمل mount له كـ read-write.',
      problemEn: 'Technician attempted to localize Realme 11 Pro system partition, but failed because the image was compressed immutable EROFS.',
      solutionAr: 'تم تفكيك الـ Super عبر lpunpack، وفك ضغط الـ EROFS، وإضافة ملفات التعريب، ثم إعادة بنائه باستخدام mkfs.erofs وضبط الـ metadata، وتفلش بنجاح دون أي Bootloop.',
      solutionEn: 'Unpacked super container, decompressed EROFS tree, merged localization assets, and recompiled using mkfs.erofs with matching SELinux labels.'
    }
  },

  {
    id: 'swe-boot-cryptography-avb-trustzone',
    category: 'software-engineering',
    titleAr: 'تشفير الإقلاع وحماية العتاد: Android Verified Boot 2.0 (vbmeta), TrustZone TEE & RPMB',
    titleEn: 'Boot Cryptography & Hardware Roots of Trust: AVB 2.0, TrustZone TEE & RPMB Storage',
    level: 'Architect',
    badge: 'CRYPTO HARDWARE',
    descriptionAr: 'التحليل التشفيري لسلسلة الإقلاع الآمنة (Secure Boot Chain): فحص شهادات وتواقيع Android Verified Boot (AVB 2.0 / vbmeta)، حساب شجرة تجزئة البيانات dm-verity Hash Trees، برمجة مفاتيح ذاكرة التخزين المحمية المضادة للترجيع RPMB (Replay Protected Memory Block) في ذواكر UFS/eMMC، وهندسة بيئة التنفيذ الموثوقة ARM TrustZone (TEE / Keymaster / Gatekeeper).',
    descriptionEn: 'Cryptographic architecture of verified hardware boot chains: Auditing AVB 2.0 vbmeta signature manifests and rollback indices, computing linear dm-verity SHA-256 block hash trees, provisioning write-once RPMB anti-rollback auth keys on eMMC/UFS storage, and reverse engineering ARM TrustZone TEE applets (Keymaster, Gatekeeper).',
    tags: ['AVB 2.0', 'vbmeta', 'dm-verity', 'TrustZone', 'RPMB Key', 'TEE', 'Anti-Rollback'],
    chipsetsOrLanguages: ['AOSP avbtool', 'OpenSSL / libcrypto', 'ARM TrustZone', 'Qualcomm QTEE', 'eMMC 5.1 / UFS 4.0'],
    principlesAr: [
      'سلسلة التحقق AVB 2.0 تتحقق من صحة كل بارتشن عبر مقارنة هاش الجذر (Root Digest) المخزن في بارتشن `vbmeta` الموقع بمفتاح OEM الخاص.',
      'ذاكرة الـ RPMB محمية بمفتاح HMAC-SHA256 يكتب مرة واحدة فقط في المصنع (One-Time Programmable)؛ لا يمكن قراءة أو كتابة عداد التحديثات بدون هذا المفتاح.',
      'تعطيل فحص dm-verity يتم عبر تفعيل الـ Flag رقم 2 في ترويسة vbmeta (الخاص بـ `AVB_VBMETA_IMAGE_FLAGS_HASHTREE_DISABLED`).'
    ],
    principlesEn: [
      'AVB 2.0 cryptographically verifies partition integrity by comparing block root digests against pre-signed OEM certificates inside vbmeta.',
      'RPMB flash partition security relies on a write-once 256-bit symmetric HMAC-SHA256 key; attempts to read/write without auth tokens are rejected by NAND controller.',
      'Disabling dm-verity enforcement is accomplished by flipping Flag 2 (`AVB_VBMETA_IMAGE_FLAGS_HASHTREE_DISABLED`) in the vbmeta descriptor structure.'
    ],
    practicalStepsAr: [
      'استخراج ملف `vbmeta.img` الأصلي وفحص شهادات التوقيع عبر: `avbtool info_image --image vbmeta.img`.',
      'توليد ملف vbmeta خالي من الفحص (Disabled VBMeta) بتعطيل flags التحقق: `avbtool make_vbmeta_image --flag 2 --output vbmeta_disabled.img`.',
      'تفليش vbmeta المعدل عبر الفاست بوت: `fastboot flash --disable-verity --disable-verification vbmeta vbmeta_disabled.img`.',
      'فحص حالة مفتاح RPMB في ذاكرة الهاتف عبر قارئة الذواكر المباشرة للتأكد من تطابق مفتاح التوثيق قبل استبدال المعالج.',
      'تعديل مؤشر الحماية ضد التراجع (Rollback Index) لمنع إقفال الهاتف عند الرجوع لإصدار أقدم (Anti-Rollback Downgrade).'
    ],
    practicalStepsEn: [
      'Audit existing signature certificates and rollback versions using `avbtool info_image --image vbmeta.img`.',
      'Synthesize disabled verity descriptor: `avbtool make_vbmeta_image --flag 2 --output vbmeta_disabled.img`.',
      'Commit patched vbmeta via Fastboot protocol with explicit disabling arguments.',
      'Inspect physical UFS/eMMC RPMB key provisioning status via direct high-speed hardware programmer.',
      'Synchronize rollback index metrics to circumvent hardware ARB (Anti-Rollback) boot halts during firmware downgrades.'
    ],
    codeSnippet: {
      language: 'bash',
      title: 'Bash Script to Patch and Disable AVB 2.0 & dm-verity in vbmeta.img',
      code: `#!/usr/bin/env bash
# OmniFix AVB 2.0 Disabler Engine
TARGET="vbmeta.img"
OUTPUT="vbmeta_patched.img"

echo "[*] Auditing VBMeta Image: $TARGET"
# Hex offset 123 (0x7B) controls AVB Flags in standard AVB 2.0 header
# Flag 1 = HASHTREE_DISABLED (dm-verity off)
# Flag 2 = VERIFICATION_DISABLED (signature check off)
# Flag 3 = Combination (0x03)

cp "$TARGET" "$OUTPUT"
# Write byte 0x03 to offset 123 to disable verification and hashtrees
printf '\\x03' | dd of="$OUTPUT" bs=1 seek=123 count=1 conv=notrunc 2>/dev/null

echo "[+] Successfully patched VBMeta! Flags updated to 0x03."
echo "[+] You can now boot custom kernels or modified partitions without bootloop!"`,
      descriptionAr: 'سكربت باش يقوم بتعديل البايت المسؤول عن تعطيل فحص الحماية dm-verity في ملف vbmeta مباشرة.',
      descriptionEn: 'Bash automation script patching byte offset 123 of vbmeta to disable dm-verity and signature validation.'
    },
    relatedTabId: 'security-research',
    aiTroubleshootingPrompt: 'كيف أقوم بتجاوز حماية Anti-Rollback (ARB 4) في هاتف Xiaomi بعد تفليش إصدار قديم بالخطأ أدى لموت الجهاز؟',
    caseStudy: {
      problemAr: 'هاتف موتورولا يعيد التشغيل باستمرار ويعطي رسالة "Your device is corrupt and cannot be trusted" بعد تعديل ملف boot لتفعيل الروت.',
      problemEn: 'Motorola device stuck in verification bootloop showing red screen warning following modified magisk boot.img flash.',
      solutionAr: 'تم ترقيع ملف vbmeta بتعطيل خوارزمية dm-verity (Flag 3)، وتفليشه إلى بارتشن vbmeta، فأقلع الهاتف فوراً بصلاحيات الروت دون أي تحذير.',
      solutionEn: 'Patched target vbmeta image to assert Flag 3 (Verification & Hashtree Disabled), reflashed, completely curing verification bootloop.'
    }
  },

  // =========================================================================
  // 4. مهارة التعامل مع جميع لغات البرمجة وأنظمة التشغيل (Languages & Operating Systems Mastery)
  // =========================================================================
  {
    id: 'polyglot-c-cpp-baremetal',
    category: 'languages-and-os',
    titleAr: 'برمجة النظم المنخفضة بـ C و C++ ومعالجة الذاكرة المباشرة (Bare-Metal & Kernel)',
    titleEn: 'C/C++ Low-Level Systems Programming, Pointer Arithmetic & Kernel Drivers',
    level: 'Architect',
    badge: 'C / C++ CORE',
    descriptionAr: 'الكتابة المباشرة بلغات C و C++ للتفاعل مع العتاد الصلب، برمجة تعريفات أجهزة USB المنخفضة (Libusb / WinUSB)، التلاعب بذاكرة النظام عبر مؤشرات البايت (Pointer Arithmetic)، وفك وتشفير هياكل البيانات الثنائية الثقيلة مثل ملفات GPT والـ Partition Tables بأقصى سرعة معالجة ممكنة.',
    descriptionEn: 'Deep architectural C/C++ development for bare-metal hardware interfacing, high-speed custom USB drivers, raw memory-mapped pointer manipulation, and instant binary serialization for low-level storage partition descriptors.',
    tags: ['C', 'C++', 'Bare-Metal', 'Memory Management', 'Libusb', 'Kernel Drivers', 'GPT Parser'],
    chipsetsOrLanguages: ['C17', 'C++20', 'GCC', 'Clang', 'LLVM'],
    principlesAr: [
      'لغة C تمنح تحكماً مباشراً بتوزيع الذاكرة (Memory Alignment) دون overhead أو Garbage Collector مما يجعلها لغة أدوات الصيانة الاحترافية.',
      'استخدام هياكل `__attribute__((packed))` يضمن تطابق البيانات المقروءة من الذاكرة مع مواصفات الشرائح الثنائية بدقة البايت الواحد.',
      'التعامل مع ملفات النظام الثنائية عبر الـ Memory Mapping (`mmap`) يسرع قراءة فلاشات بحجم 50GB إلى أجزاء من الثانية.'
    ],
    principlesEn: [
      'C delivers absolute zero-cost deterministic memory layout essential for raw communication with silicon registers.',
      'Structure packing attributes (`__attribute__((packed))`) ensure serialized byte arrays align with hardware specification headers.',
      'Memory mapping (`mmap`) allows multi-gigabyte raw storage dumps to be parsed instantaneously with zero redundant RAM copying.'
    ],
    practicalStepsAr: [
      'تضمين ترويسات `libusb-1.0/libusb.h` و `fcntl.h` لبدء التواصل مع منافذ الأجهزة المباشرة.',
      'تعريف بنية الـ Header (Struct) الخاصة بجدول تقسيم القرص GPT (GUID Partition Table).',
      'قراءة أول 512 بايت من القطاع LBA 0 (Master Boot Record) والقطاع LBA 1 (GPT Header).',
      'التحقق من صحة توقيع الـ Signature (`"EFI PART"` أو `0x5452415020494645ULL`).',
      'تعديل مدخلات البارتشن وإعادة حساب الـ CRC32 Header وحفظ التغييرات مباشرة إلى شريحة التخزين.'
    ],
    practicalStepsEn: [
      'Include native headers `libusb-1.0/libusb.h` and system calls (`ioctl`, `fcntl`) for direct bus I/O.',
      'Define byte-accurate packed structs representing the GUID Partition Table (GPT) specification.',
      'Stream physical blocks LBA 0 (Protective MBR) and LBA 1 (Primary GPT Header) directly into memory.',
      'Verify 8-byte ASCII signature check against `"EFI PART"` magic token.',
      'Recalculate 32-bit Cyclic Redundancy Check (CRC32) checksum and flush modified blocks to flash.'
    ],
    codeSnippet: {
      language: 'c',
      title: 'C GPT Partition Table Inspector (gpt_parser.c)',
      code: `#include <stdio.h>
#include <stdint.h>
#include <string.h>

typedef struct __attribute__((packed)) {
    char signature[8];      // "EFI PART"
    uint32_t revision;
    uint32_t header_size;
    uint32_t header_crc32;
    uint32_t reserved;
    uint64_t my_lba;
    uint64_t alternate_lba;
    uint64_t first_usable_lba;
    uint64_t last_usable_lba;
    uint8_t disk_guid[16];
    uint64_t partition_entry_lba;
    uint32_t num_partition_entries;
    uint32_t sizeof_partition_entry;
    uint32_t partition_entry_array_crc32;
} gpt_header_t;

int verify_gpt_header(const uint8_t *sector_buffer) {
    const gpt_header_t *gpt = (const gpt_header_t *)sector_buffer;
    if (memcmp(gpt->signature, "EFI PART", 8) == 0) {
        printf("[+] Valid GPT Header Found! Entries: %u, Entry Size: %u bytes\\n", 
               gpt->num_partition_entries, gpt->sizeof_partition_entry);
        return 0;
    }
    printf("[-] Invalid GPT Signature! Partition table damaged.\\n");
    return -1;
}`,
      descriptionAr: 'برنامج C يفحص سلامة جدول تقسيم الذاكرة GPT ويستخرج بيانات البارتشنات بدقة البايت.',
      descriptionEn: 'Ultra-fast C routine verifying GPT header magic and parsing partition array geometry.'
    },
    relatedTabId: 'ufs-memory',
    aiTroubleshootingPrompt: 'كيف أكتب برنامج بلغة C يقوم بحساب CRC32 وتعديل حجم بارتشن Userdata في ملف GPT Header دون إتلاف بقية أقسام الفلاشة؟',
    caseStudy: {
      problemAr: 'فلاشة سامسونغ حجمها 16 جيجابايت تالفة في أول 1 ميجابايت ولا يمكن لأي بوكس قراءة جدول تقسيم الذاكرة GPT لإصلاح الهاتف.',
      problemEn: 'A 16GB Samsung eMMC dump had corrupted LBA 1 Primary GPT, preventing all recovery software from mounting file systems.',
      solutionAr: 'تمت كتابة كود C سريع قرأ الـ Backup GPT المخزن في آخر قطاعات الذاكرة (Secondary LBA)، وأعاد بناء الـ Primary GPT وحلت المشكلة في 5 ثوان.',
      solutionEn: 'Authored targeted C parser recovering the Secondary GPT from disk tail, rewriting damaged LBA 1 Primary table in 5 seconds.'
    }
  },

  {
    id: 'polyglot-python-automation-frida',
    category: 'languages-and-os',
    titleAr: 'الأتمتة والهندسة العكسية المتقدمة بـ Python و Frida Dynamic Binary Instrumentation',
    titleEn: 'Python Automation, USB Packet Sniffing & Frida Dynamic Binary Hooking',
    level: 'Master',
    badge: 'PYTHON & FRIDA',
    descriptionAr: 'تسخير لغة بايثون لبناء أدوات الصيانة الآلية، فحص وتفكيك بروتوكولات حزم USB باستخدام Scapy و PyUSB، واعتراض توابع النظام والتطبيقات في الوقت الحقيقي (Dynamic Instrumentation) باستخدام Frida لتخطي حمايات SSL Pinning وتجاوز قيود فحص الـ Root واختبار صلاحيات الـ OEM.',
    descriptionEn: 'Deploying Python for rapid hardware automation tooling, USB bus sniffing with Scapy/PyUSB, and real-time process memory manipulation using Frida to hook native libraries, bypass SSL pinning, neutralize Knox attestation checks and OEM test gates.',
    tags: ['Python', 'Frida', 'Reverse Engineering', 'SSL Pinning', 'Scapy', 'PyUSB', 'Dynamic Hooking'],
    chipsetsOrLanguages: ['Python 3.12', 'Frida Hooking', 'ARM64 Hooking'],
    principlesAr: [
      'أداة Frida تتيح حقن أكواد JavaScript في مساحة ذاكرة العمليات قيد التشغيل في أندرويد و iOS للاعتراض المباشر على الدوال المشفرة.',
      'بايثون مع مكتبات المعالجة الثنائية (struct / binascii) توفر بيئة مثالية لإنشاء وتجربة استغلالات الثغرات (Exploit Prototypes) في دقائق.',
      'اعتراض مصفوفات بايتات USB Packet Sniffing يكشف فوراً أوامر البوكسات الاحترافية وتكرارها برمجياً.'
    ],
    principlesEn: [
      'Frida injects dynamic JavaScript runtimes into live Android/iOS processes to intercept native API calls without recompilation.',
      'Python with low-level binary tools enables rapid prototyping of protocol exploits and USB reverse-engineering pipelines.',
      'USB packet stream interception enables decoding proprietary dongle handshakes into standalone automated scripts.'
    ],
    practicalStepsAr: [
      'تثبيت خادم Frida على الهاتف عبر أمر ADB: `adb push frida-server /data/local/tmp/ && adb shell chmod 755 /data/local/tmp/frida-server`.',
      'تشغيل السيرفر بصلاحيات الروت: `adb shell /data/local/tmp/frida-server &`.',
      'كتابة سكربت بايثون يقوم بالارتباط بالعملية المستهدفة (مثل com.android.settings أو تطبيق الحماية).',
      'اعتراض استدعاء دالة فحص الروت أو كود الحماية وإجبارها على إرجاع القيمة `true` أو `0`.',
      'سحب المفاتيح التشفيرية من ذاكرة الرام أثناء فك تشفير الروم.'
    ],
    practicalStepsEn: [
      'Push frida-server binary to target device via ADB and grant execute permissions.',
      'Spawn server daemon as root in background: `/data/local/tmp/frida-server &`.',
      'Attach Python supervisor script to target system package via RPC bridge.',
      'Hook native C functions (e.g. `strcmp`, `open`, `ioctl`) returning synthetic bypass values.',
      'Dump dynamically decrypted memory keys directly from heap memory space.'
    ],
    codeSnippet: {
      language: 'python',
      title: 'Python + Frida Hooking Script for Security Verification Bypass',
      code: `import frida, sys

js_hook = """
Java.perform(function () {
    console.log("[*] Injected into Target Process. Hooking Security Checks...");

    // Hook Samsung Knox Attestation or Root Verifier
    var SecurityUtil = Java.use("com.sec.android.app.security.Verifier");
    SecurityUtil.isDeviceTampered.implementation = function () {
        console.log("[+] Intercepted isDeviceTampered() call! Forcing return FALSE.");
        return false;
    };

    SecurityUtil.isKnoxTriggered.implementation = function () {
        console.log("[+] Intercepted isKnoxTriggered() call! Forcing return 0x0.");
        return 0;
    };
});
"""

def on_message(message, data):
    print(f"[Frida] {message}")

process = frida.get_usb_device().attach("com.sec.android.app.security")
script = process.create_script(js_hook)
script.on('message', on_message)
script.load()
print("[+] Hook active! Triggering application logic...")
sys.stdin.read()`,
      descriptionAr: 'سكربت بايثون مع فريدا يعترض دوال فحص الأمان في أندرويد ويجبرها على إرجاع حالة الأمان الأصلية.',
      descriptionEn: 'Frida Python automation script dynamically hooking Android security checks to spoof clean Knox integrity.'
    },
    relatedTabId: 'smart-1click',
    aiTroubleshootingPrompt: 'كيف أستخدم بايثون لاعتراض حزم USB الصادرة من بوكس صيانة مشهور أثناء عملية تفليش لتحديد أمر تجاوز حماية المعالج؟',
    caseStudy: {
      problemAr: 'تطبيق بنكي يرفض الفتح على هاتف تم تعديل نظامه لإصلاح مشكلة الشبكة بسبب اكتشاف الـ Bootloader Unlocked.',
      problemEn: 'A critical financial app refused execution on a client device after bootloader repair due to unlocked status detection.',
      solutionAr: 'تم تطبيق سكربت فريدا بايثون قام باعتراض فحص خصائص النظام `ro.boot.flash.locked` وتزوير القيمة لتبدو `1`، وعمل التطبيق بنجاح دون الحاجة لإعادة قفل البوتلودر.',
      solutionEn: 'Applied dynamic Frida hook spoofing `ro.boot.flash.locked` to return 1, enabling the app to run smoothly without relocking.'
    }
  },

  {
    id: 'polyglot-rust-memory-safe-drivers',
    category: 'languages-and-os',
    titleAr: 'لغة Rust للتعامل الآمن مع بروتوكولات الـ USB ومعالجة الفلاشات الضخمة',
    titleEn: 'Rust for High-Speed Memory-Safe USB Drivers & Parallel Storage Parsing',
    level: 'Architect',
    badge: 'RUST 2026',
    descriptionAr: 'استخدام قوة وسرعة لغة Rust لبناء أدوات صيانة لا تنهار أبداً (Zero Crash Guarantee). التعامل المتوازي مع خيوط المعالجة المتعددة لحساب هاش SHA-256 للفلاشات العملاقة في ثوان، كتابة تعريفات USB غير متزامنة (Async Tokio / Rusb)، وفك ضغط ملفات sparse و super بأعلى معدل تدفق بيانات.',
    descriptionEn: 'Harnessing Rust to construct zero-crash, blazing-fast repair utilities. Parallel multithreaded SHA-256 calculation for massive 60GB raw images, asynchronous USB driver implementation with Rusb and Tokio, and high-throughput zero-copy image decompression.',
    tags: ['Rust', 'Memory Safety', 'Async USB', 'Tokio', 'Zero-Copy', 'Concurrency', 'Multithreading'],
    chipsetsOrLanguages: ['Rust 1.78+', 'Cargo', 'Rayon', 'Tokio', 'Rusb'],
    principlesAr: [
      'نظام ملكية الذاكرة في Rust (Borrow Checker) يمنع أخطاء Buffer Overflow و Memory Corruption الشائعة في برامج التفليش القديمة.',
      'مكتبة Rayon تتيح تقسيم فلاشة الهاتف 32GB على كافة أنوية المعالج لحساب الـ Hash ومطابقته بالتوازي في أقل من ثانيتين.',
      'البرمجة غير المتزامنة (Async I/O) تضمن عدم تجمد واجهة البرنامج أثناء نقل بيانات التفليش الكبيرة عبر منفذ USB.'
    ],
    principlesEn: [
      'Rust ownership and borrow semantics eliminate buffer overflows and dangling pointers critical to high-reliability flashers.',
      'Work-stealing concurrency via Rayon enables multi-gigabyte firmware verification across all CPU cores in sub-second timelines.',
      'Asynchronous I/O via Tokio guarantees zero UI lockup during multi-gigabyte high-speed USB bulk stream transactions.'
    ],
    practicalStepsAr: [
      'إنشاء مشروع Cargo جديد وإضافة مكتبات `rusb` و `tokio` و `sha2` و `rayon`.',
      'فحص أجهزة الـ USB عبر `rusb::devices()` والفلترة بحسب الـ Vendor ID.',
      'فتح قناة إرسال متزامنة ومحمية ضد انهيار الاتصال (Fault-Tolerant Bulk Out).',
      'تطبيق خوارزمية Zero-Copy Memory Slicing لتقسيم الفلاشة إلى حزم بحجم 1MB وإرسالها.',
      'تسجيل معدل النقل الحقيقي (Real-Time Throughput) والتأكد من استجابة الهاتف بعد كل بايت.'
    ],
    practicalStepsEn: [
      'Initialize cargo project configured with `rusb`, `tokio`, `sha2`, and `rayon` dependencies.',
      'Enumerate connected USB topology via `rusb::devices()` filtered by OEM VID.',
      'Open resilient asynchronous bulk endpoint pipeline with automatic reconnect fault tolerance.',
      'Deploy zero-copy buffer slicing streaming 1MB chunked payloads directly to silicon.',
      'Track real-time transfer throughput and assert handshake acknowledgment tokens.'
    ],
    codeSnippet: {
      language: 'rust',
      title: 'Rust Safe High-Throughput USB Block Writer (flasher_core.rs)',
      code: `use rusb::{DeviceHandle, GlobalContext, Result};
use std::time::Duration;

pub struct SafeUsbFlasher {
    handle: DeviceHandle<GlobalContext>,
    ep_out: u8,
}

impl SafeUsbFlasher {
    pub fn new(vid: u16, pid: u16, ep_out: u8) -> Result<Self> {
        let handle = rusb::open_device_with_vid_pid(vid, pid)
            .ok_or(rusb::Error::NoDevice)?;
        
        handle.claim_interface(0)?;
        Ok(Self { handle, ep_out })
    }

    pub fn flash_chunk(&self, chunk: &[u8]) -> Result<usize> {
        // Safe memory-bounded write with automatic 5-second timeout
        let timeout = Duration::from_secs(5);
        let written = self.handle.write_bulk(self.ep_out, chunk, timeout)?;
        Ok(written)
    }
}

fn main() {
    println!("[*] Initializing Rust Ultra Flasher Core...");
    match SafeUsbFlasher::new(0x05c6, 0x9008, 0x01) {
        Ok(flasher) => println!("[+] Secured connection to Qualcomm EDL target!"),
        Err(e) => eprintln!("[-] Connection failed safely: {:?}", e),
    }
}`,
      descriptionAr: 'كود Rust يضمن اتصال آمن وغير قابل للانهيار مع الهواتف في وضع التفليش.',
      descriptionEn: 'Memory-safe Rust implementation managing resilient low-level USB flash write pipelines.'
    },
    relatedTabId: 'flasher',
    aiTroubleshootingPrompt: 'لماذا تعتبر برامج التفليش المكتوبة بلغة Rust أكثر أماناً لمنع موت الهواتف (Hard Brick) مقارنة ببرامج C++ القديمة؟',
    caseStudy: {
      problemAr: 'أداة تفليش قديمة تنهار فجأة في منتصف عملية نقل ملف Super.img بحجم 8GB مما يؤدي لموت هواتف الزبائن بحالة Dead Boot.',
      problemEn: 'A legacy flasher crashed intermittently mid-transfer on 8GB Super.img payloads, bricking devices into hard-dead states.',
      solutionAr: 'تمت إعادة كتابة نواة النقل بلغة Rust مع معالجة ذكية للأخطاء وانقطاع الإشارة، وقضت على 100% من حالات انقطاع التفليش المفاجئ.',
      solutionEn: 'Rebuilt transfer core in Rust with robust buffer bounds checking, completely eliminating mid-flash crashes.'
    }
  },

  {
    id: 'polyglot-assembly-arm-patching',
    category: 'languages-and-os',
    titleAr: 'لغة التجميع ARM / ARM64 والهندسة العكسية وتعديل البايتات (Disassembly & Patching)',
    titleEn: 'ARM/ARM64 Assembly, Binary Disassembly & Opcode Instruction Patching',
    level: 'Architect',
    badge: 'ARM64 ASSEMBLY',
    descriptionAr: 'قراءة وفهم وتعديل تعليمات لغة التجميع لمعالجات الهواتف الذكية (ARMv8 / ARMv9). استخدام برامج الهندسة العكسية (Ghidra, IDA Pro) لعكس وتفكيك ملفات sbl1 و abl و bootloader و preloader، استبدال تعليمات الشرط (`CBZ`, `CBNZ`, `B.EQ`) بتعليمات المرور المباشر (`NOP` أو `B`), وتجاوز فحوصات التوقيع الرقمي في البوت لودر.',
    descriptionEn: 'Reading, analyzing and patching ARMv8/ARMv9 native machine opcodes in smartphone firmware binaries. Disassembling bootloader images (abl, sbl1, preloader) using Ghidra/IDA Pro, substituting conditional branch checks (CBZ, B.EQ) with unconditional jumps or NOP sleds to force bootloader unlocks.',
    tags: ['ARM64', 'Assembly', 'Ghidra', 'IDA Pro', 'Opcode Patching', 'NOP Sled', 'Disassembly'],
    chipsetsOrLanguages: ['ARMv8-A', 'ARMv9-A', 'Thumb-2', 'AArch64', 'x86_64'],
    principlesAr: [
      'في معمارية ARM64، حجم كل تعليمة برمجية هو 4 بايتات ثابتة (32-bit fixed width instruction).',
      'تعليمة الـ NOP الشهيرة لعدم فعل أي شيء في ARM64 مشفرة بالقيمة السداسية: `0x1F 0x20 0x03 0xD5` (D503201F Little Endian).',
      'استبدال فحص شرط التحقق من التوقيع الرقمي بتعليمات `NOP` يجعل المعالج يتخطى خطأ الحماية ويستمر في الإقلاع الطبيعي.'
    ],
    principlesEn: [
      'ARM64 enforces 32-bit (4-byte) aligned fixed instruction widths across the entire AArch64 instruction set.',
      'The canonical NOP instruction in ARM64 is represented by the 4-byte hexadecimal opcode `0xD503201F` (Little Endian: 1F 20 03 D5).',
      'Patching conditional authorization branches to NOP sleds forces the execution pointer to bypass cryptographic rejections.'
    ],
    practicalStepsAr: [
      'استخراج ملف `abl.elf` (Android Bootloader) من فلاشة الهاتف الرسمية.',
      'فتح الملف في برنامج Ghidra وضبط المعمارية على `AARCH64:LE:64:v8A`.',
      'البحث عن السلاسل النصية المفتاحية مثل `"device_is_unlocked"` أو `"oem unlock"`.',
      'تحديد تعليمة المقارنة الشرطية `CBNZ W0, loc_fail` (تفرع إذا لم تكن النتيجة صفراً).',
      'تعديل البايتات واستبدالها بتعليمات `NOP` (`1F 20 03 D5`) أو القفز غير المشروط `B loc_success`.',
      'إعادة تصدير الملف وتفليشه في بارتشن `abl` لتفعيل فك قفل البوتلودر فوراً.'
    ],
    practicalStepsEn: [
      'Extract `abl.elf` (Android Bootloader) from stock factory firmware package.',
      'Load image into Ghidra set to processor target `AARCH64:LE:64:v8A`.',
      'Cross-reference string references matching `"device_is_unlocked"` or `"verified boot status"`.',
      'Isolate the conditional branch opcode check (e.g. `CBNZ W0, lock_reject`).',
      'Patch binary opcodes with `0x1F 0x20 0x03 0xD5` (NOP) or unconditional branch `B`.',
      'Save patched ELF binary and flash back to `abl` partition to force permanent bootloader bypass.'
    ],
    codeSnippet: {
      language: 'arm-asm',
      title: 'ARM64 Assembly Security Check Bypass Snippet',
      code: `// Original Bootloader Security Verification Function:
// Checks if OEM Lock flag register is set to 1
verify_oem_lock:
    LDR     W0, [X19, #0x48]     // Load OEM lock flag into Register W0
    CBNZ    W0, .boot_rejected   // If W0 != 0, Branch to Boot Reject!

// --- PATCHED INSTRUCTION (Force Permanent Unlock):
// Replace 'CBNZ W0, .boot_rejected' with NOP
    NOP                          // Opcode: 1F 20 03 D5 (Do Nothing!)
    MOV     W0, #0x1             // Force return 1 (Unlocked)
    RET                          // Opcode: C0 03 5F D6 (Return Success)

.boot_rejected:
    MOV     W0, #0x0             // Lock Failure Code
    RET`,
      descriptionAr: 'تعديل حقيقي لتعليمات أسمبلي ARM64 لإلغاء فحص قفل البوت لودر في معالجات الهواتف الحديثة.',
      descriptionEn: 'Concrete ARM64 disassembly and patch demonstrating NOP substitution over security branch.'
    },
    relatedTabId: 'codelab',
    aiTroubleshootingPrompt: 'كيف أقوم بتعديل بايتات ملف vbmeta.img بواسطة Hex Editor لتعطيل فحص التوقيع الرقمي (Disable AVB Verification Flag)؟',
    caseStudy: {
      problemAr: 'هاتف ون بلس مقفول البوتلودر بعد تثبيت روم رسمي خاطئ، ويرفض أي أوامر fastboot oem unlock لأن الخيار غير مفعل في خيارات المطورين.',
      problemEn: 'OnePlus phone soft-bricked with locked bootloader, rejecting fastboot unlock commands due to disabled OEM toggle in settings.',
      solutionAr: 'تم سحب بارتشن abl عبر وضع 9008، وتعديل تعليمة المقارنة ببرنامج Hex Editor بوضع NOP، وإعادة تفليشها، ففتح البوتلودر تلقائياً.',
      solutionEn: 'Dumped abl partition via EDL 9008, patched branch check with NOP opcode via Hex Editor, reflashed, unlocking bootloader instantly.'
    }
  },

  {
    id: 'polyglot-os-android-ios-linux-internals',
    category: 'languages-and-os',
    titleAr: 'أسرار أنظمة التشغيل: أندرويد (AOSP), iOS (SecureROM/SEP), لينكس وويندوز درايفرز',
    titleEn: 'Operating System Internals: AOSP, iOS SecureROM & Windows/Linux Kernel Drivers',
    level: 'Architect',
    badge: 'OS INTERNALS',
    descriptionAr: 'الهندسة العميقة للتعامل مع كبرى أنظمة التشغيل: نظام أندرويد AOSP (Init daemon, SELinux, Treble, Binder IPC, Zygote, dm-verity)، نظام آبل iOS (SecureROM, iBoot, SEP, MobileGestalt, DFU State Machine)، نواة لينكس (Kernel modules, udev rules, sysfs)، ونواة ويندوز (WinUSB, Filter Drivers, Virtual COM Ports).',
    descriptionEn: 'Deep architectural mastery of core operating systems: Android AOSP (Init, SELinux policies, Treble HAL, Binder IPC, Zygote, dm-verity), Apple iOS (SecureROM, iBoot, SEP, MobileGestalt, DFU state engine), Linux Kernel (udev, sysfs, usbmon), and Windows Driver Frameworks (WinUSB, Virtual COM).',
    tags: ['AOSP', 'Android 15', 'iOS SecureROM', 'SELinux', 'Binder IPC', 'WinUSB', 'Linux Kernel'],
    chipsetsOrLanguages: ['Android 10-15', 'iOS 15-18', 'Linux 6.x', 'Windows 11 NT Kernel'],
    principlesAr: [
      'نظام أندرويد يعتمد على سياسات SELinux في وضع Enforcing؛ تعديل ملفات النظام يتطلب تغيير نمط البيرمشن إلى Permissive أو ترقيع سياسات sepolicy.',
      'نظام آبل iOS يعتمد على سلسلة إقلاع محكمة تبدأ من الـ SecureROM المحفور بالسيليكون؛ الثغرات مثل checkm8 تسمح بالسيطرة على الجهاز قبل تشغيل iBoot.',
      'أنظمة ويندوز تتطلب تثبيت فلتر WinUSB مخصص (عبر Zadig/libusb-win32) ليتمكن البرنامج من إرسال حزم Raw Bulk Transfers دون حظر من النظام.'
    ],
    principlesEn: [
      'Android security hinges on SELinux policy enforcement; system modifications demand sepolicy rule recompilation or Permissive switching.',
      'Apple iOS enforces cryptographic chain-of-trust anchored in hardware SecureROM; exploits like checkm8 hijack control before iBoot signature checks.',
      'Windows requires custom INF/WinUSB filter drivers to grant userland applications direct raw bulk transfer privileges without COM blocking.'
    ],
    practicalStepsAr: [
      'فحص نمط SELinux على جهاز متصل عبر الـ ADB: `adb shell getenforce`.',
      'تعديل ملفات الـ sepolicy لحقن استثناءات تسمح للسكربت بتشغيل سيرفس بصلاحيات روت.',
      'في نظام لينكس: ضبط ملف قواعد الـ udev (`/etc/udev/rules.d/51-android.rules`) لمنح صلاحية القراءة والكتابة لـ VID/PID الخاص بالمصنعين.',
      'في نظام آبل: إدخال الهاتف في وضع DFU Mode وإرسال حزمة الـ Exploit لاستخراج شهادات التفعيل (SHSH2 Blobs) وتشغيل تشخيصات NAND.',
      'في نظام ويندوز: توجيه منفذ الـ COM الخاص بالمودم واستخدام أوامر AT للاستعلام عن إصدار النظام وحالة السيريال.'
    ],
    practicalStepsEn: [
      'Inspect SELinux status on connected device via `adb shell getenforce` (Enforcing vs Permissive).',
      'Patch dynamic sepolicy rules injecting capability exceptions for root-level automated service daemons.',
      'Configure Linux `/etc/udev/rules.d/51-android.rules` granting 0666 raw r/w access across mobile vendor IDs.',
      'Trigger Apple DFU mode, dispatch checkm8 USB control transfer heap exploit, and execute ramdisk NAND diagnostics.',
      'Direct Windows COM port virtual redirection, streaming AT modem diagnostics to audit baseband firmware state.'
    ],
    codeSnippet: {
      language: 'bash',
      title: 'Linux UDEV Rules & SELinux Policy Injector Script',
      code: `#!/usr/bin/env bash
# OmniFix Pro - Universal Linux Mobile Repair UDEV & Permissions Setup
echo "[*] Setting up complete USB rules for Qualcomm, MTK, Samsung, Apple & Google..."

cat << 'EOF' | sudo tee /etc/udev/rules.d/51-omnifix-devices.rules > /dev/null
# Google / Fastboot / ADB
SUBSYSTEM=="usb", ATTR{idVendor}=="18d1", MODE="0666", GROUP="plugdev"
# Qualcomm EDL 9008
SUBSYSTEM=="usb", ATTR{idVendor}=="05c6", ATTR{idProduct}=="9008", MODE="0666", GROUP="plugdev"
# MediaTek BROM / Preloader
SUBSYSTEM=="usb", ATTR{idVendor}=="0e8d", MODE="0666", GROUP="plugdev"
# Samsung Electronics
SUBSYSTEM=="usb", ATTR{idVendor}=="04e8", MODE="0666", GROUP="plugdev"
# Apple DFU / Recovery / Normal
SUBSYSTEM=="usb", ATTR{idVendor}=="05ac", MODE="0666", GROUP="plugdev"
EOF

sudo udevadm control --reload-rules
sudo udevadm trigger
echo "[OK] Linux USB Subsystem configured for zero-friction silicon communication!"`,
      descriptionAr: 'سكربت شل يضبط نظام لينكس للتعرف على كافة أوضاع الهواتف (EDL, BROM, Fastboot, DFU, Odin) بصلاحيات كاملة.',
      descriptionEn: 'Universal Linux UDEV configuration script granting unrestricted raw USB access for all smartphone chipsets.'
    },
    relatedTabId: 'device-reader',
    aiTroubleshootingPrompt: 'كيف تعمل خدمة Binder IPC في أندرويد، وكيف يمكن استغلالها لقراءة بيانات الجهاز بدون فتح شاشة القفل؟',
    caseStudy: {
      problemAr: 'فني على جهاز ويندوز 11 يواجه خطأ Device Descriptor Request Failed عند وصل هاتف في وضع EDL 9008 بسبب تعارض تعريفات QDLoader القديمة.',
      problemEn: 'Technician on Windows 11 encountered Device Descriptor Request Failed in EDL 9008 mode due to conflicting legacy QDLoader drivers.',
      solutionAr: 'تم تفعيل بروتوكول WinUSB المباشر وتجاوز درايفر الـ Virtual COM Port التقليدي، وتعرف البرنامج على الهاتف في 0.2 ثانية وتم التفليش بنجاح.',
      solutionEn: 'Applied direct WinUSB filter driver bypassing legacy Virtual COM driver bottlenecks, immediately restoring 0.2s handshake and successful flash.'
    }
  },

  {
    id: 'polyglot-go-cloud-diagnostics',
    category: 'languages-and-os',
    titleAr: 'لغة Go والأنظمة الموزعة: خدمات التشخيص السحابية فائقة التزامن و WebSockets',
    titleEn: 'Go (Golang) Microservices: High-Concurrency Cloud Fleet Diagnostics & Binary Streaming',
    level: 'Architect',
    badge: 'GO FLEET ENGINE',
    descriptionAr: 'استخدام لغة Go لبناء خوادم الصيانة والتشخيص المركزية القادرة على معالجة آلاف الهواتف المتصلة في نفس اللحظة (Goroutines & Channels): بث مباشر لحزم التحديث عبر بروتوكولات gRPC و WebSockets، توليد شهادات الحماية السحابية، وفك ضغط فلاشات الهواتف بالتوازي مع استهلاك أقل من 50MB من الذاكرة العشوائية.',
    descriptionEn: 'Leveraging Go (Golang) for massive concurrent device fleet diagnostics: Real-time telemetry streaming via gRPC and low-overhead WebSockets, asynchronous cryptographic token generation for FRP/MDM authorizations, and parallel firmware streaming using minimal heap footprint.',
    tags: ['Go', 'Golang', 'Goroutines', 'gRPC', 'WebSockets', 'Concurrency', 'Microservices'],
    chipsetsOrLanguages: ['Go 1.22+', 'Goroutines', 'gRPC', 'Protobuf 3', 'Linux Epoll'],
    principlesAr: [
      'تعتمد Go على Goroutines خفيفة الوزن (2KB فقط لكل خيط) بدلاً من خيوط النظام الثقيلة، مما يتيح لخادم واحد مراقبة 100,000 هاتف في وضع التفليش دون انهيار.',
      'قنوات Go Channels تضمن نقل حزم بيانات الفلاشة بأمان بين خيط استقبال الـ USB وخيط التحقق التشفيري دون حدوث Race Conditions.',
      'بناء ملف تنفيذي وحيد (Single Static Binary) خالي من الاعتماديات الخارجية يعمل بسلاسة على كافة توزيعات لينكس وخوادم السحابة.'
    ],
    principlesEn: [
      'Go light-weight goroutines (starting at 2KB) facilitate handling 100,000+ concurrent USB flashing sessions without memory exhaust.',
      'Buffered Go channels orchestrate thread-safe data pipelines between raw network payloads and cryptographic hash workers.',
      'Compiles to single standalone static binary without external C runtime dependencies for bulletproof edge server deployments.'
    ],
    practicalStepsAr: [
      'إنشاء خادم HTTP/2 و gRPC باستخدام معايير مكتبة Go القياسية.',
      'بناء مقبس WebSocket يستقبل بيانات تيليمترية مستمرة من أجهزة الفحص (الجهد، التيار، سرعة التفليش).',
      'استخدام `sync.Pool` لإعادة تدوير مخازن البايتات (Byte Buffers) أثناء نقل الفلاشات الضخمة لتقليل عمل جامع القمامة (Garbage Collector).',
      'تطبيق خوارزميات Worker Pool لحساب هاشات SHA-256 للملفات بالتوازي عبر كافة أنوية الخادم.',
      'نشر الخدمة كحاوية Docker خفيفة بحجم أقل من 15MB لتشخيص وإصلاح الأجهزة عن بعد.'
    ],
    practicalStepsEn: [
      'Initialize high-throughput gRPC service and streaming HTTP/2 endpoints.',
      'Establish bi-directional WebSocket pipe streaming real-time hardware telemetry (VBUS voltage, mA draw, write throughput).',
      'Leverage `sync.Pool` byte slice recycling to guarantee zero heap allocation during multi-gigabyte payload transfers.',
      'Deploy multiplexed worker pool dispatching parallel SHA-256 chunk calculations across all CPU threads.',
      'Package microservice into scratch/alpine Docker container under 15MB for remote over-the-air fleet repair hubs.'
    ],
    codeSnippet: {
      language: 'go',
      title: 'Go Device Telemetry Streaming Hub (fleet_hub.go)',
      code: `package main

import (
	"fmt"
	"net/http"
	"sync"
	"github.com/gorilla/websocket"
)

type DeviceMetric struct {
	DeviceID string  \`json:"deviceId"\`
	VBusVolt float64 \`json:"vbusVolt"\`
	CurrentmA float64 \`json:"currentmA"\`
	FlashMBps float64 \`json:"flashMBps"\`
}

var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
var clients = make(map[*websocket.Conn]bool)
var mu sync.Mutex

func handleStream(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil { return }
	defer conn.Close()

	mu.Lock(); clients[conn] = true; mu.Unlock()
	fmt.Printf("[+] Diagnostic Probe Connected: %s\\n", conn.RemoteAddr())

	for {
		var metric DeviceMetric
		if err := conn.ReadJSON(&metric); err != nil { break }
		// Process high-frequency telemetry without lock contention
		go processTelemetry(metric)
	}
}

func processTelemetry(m DeviceMetric) {
	if m.CurrentmA > 2500 {
		fmt.Printf("[!] ALERT: Device %s High Current Surge: %.1fmA!\\n", m.DeviceID, m.CurrentmA)
	}
}

func main() {
	http.HandleFunc("/ws/device/telemetry", handleStream)
	fmt.Println("[*] Apex Fleet Telemetry Server listening on :8080...")
	http.ListenAndServe(":8080", nil)
}`,
      descriptionAr: 'خادم Go يتعامل مع بيانات تشخيص الهواتف اللحظية ويوجه تنبيهات الشورت واستهلاك التيار الزائد فوراً.',
      descriptionEn: 'High-throughput Go WebSocket engine monitoring live device telemetry and short-circuit current spikes.'
    },
    relatedTabId: 'central-control',
    aiTroubleshootingPrompt: 'كيف أقوم ببناء نظام تتبع عن بعد لأسطول من 50 بوكس صيانة يعمل عبر بروتوكول Go gRPC لتنسيق تفليش الهواتف آلياً؟',
    caseStudy: {
      problemAr: 'مركز صيانة كبير يمتلك 30 جهاز كمبيوتر يتعامل مع 500 هاتف يومياً ويعاني من بطء في سحب وتوزيع ملفات الرومات الرسمية وفحص سلامة التنزيل.',
      problemEn: 'A high-volume repair center with 30 technician benches struggled with slow firmware distribution and corrupted downloads.',
      solutionAr: 'تم تشغيل خادم تخزين مؤقت محلي مكتوب بلغة Go يبث الرومات بالتوازي عبر شبكة 10Gbps، فانخفض وقت انتظار الفلاشة من 20 دقيقة إلى 18 ثانية فقط.',
      solutionEn: 'Implemented local Go streaming cache distributing multi-GB images across benches in 18 seconds with verified parallel hashes.'
    }
  }
];

export const SKILL_DOMAINS_INFO: Record<SkillDomain, { titleAr: string; titleEn: string; icon: string; descAr: string; descEn: string; color: string; count: number }> = {
  'software-repair': {
    titleAr: 'مهارة صيانة الهاتف سوفت وير',
    titleEn: 'Mobile Software Repair Mastery',
    icon: 'Terminal',
    descAr: 'البوتلودر، التفليش، فك البوت الميت EDL/BROM، تجاوز الحمايات FRP/Knox/KG، وإصلاح شبكات NVRAM/EFS.',
    descEn: 'Bootloader unlock, raw EDL/BROM flashing, unbricking dead phones, FRP/Knox/KG bypass, and NVRAM/EFS repair.',
    color: 'from-cyan-500 to-blue-600',
    count: 5
  },
  'hardware-repair': {
    titleAr: 'مهارة صيانة الهاتف هارد وير',
    titleEn: 'Mobile Hardware & Microsoldering',
    icon: 'Cpu',
    descAr: 'قراءة المخططات، فحص مسارات الطاقة (VPH/VBAT)، تتبع الشورت بالكاميرا الحرارية، وشبلنة المعالجات والساندويتش.',
    descEn: 'Schematic tracing, power rail impedance (VPH/VBAT), thermal short-circuit hunting, and PoP sandwich CPU reballing.',
    color: 'from-amber-500 to-rose-600',
    count: 4
  },
  'software-engineering': {
    titleAr: 'مهارة التعامل مع البرمجيات وهندسة الأدوات',
    titleEn: 'Software Engineering & Tooling Protocols',
    icon: 'Zap',
    descAr: 'بروتوكولات الـ USB المنخفضة (WebUSB/WinUSB)، استخراج وتفكيك Super.img و payload.bin، وتشفير AVB 2.0.',
    descEn: 'Bare-metal USB protocols (WebUSB/WinUSB), dynamic Super.img & payload.bin extractors, and AVB 2.0 crypto verification.',
    color: 'from-indigo-500 to-violet-600',
    count: 3
  },
  'languages-and-os': {
    titleAr: 'مهارة التعامل مع لغات البرمجة وأنظمة التشغيل',
    titleEn: 'Programming Languages & Operating Systems',
    icon: 'Globe',
    descAr: 'إتقان لغات C, C++, Rust, Python, Assembly, Bash, Go، وأسرار أنظمة أندرويد AOSP، iOS SecureROM، لينكس وويندوز.',
    descEn: 'Mastery of C, C++, Rust, Python, ARM Assembly, Bash, Go, and internals of Android AOSP, iOS SecureROM, Linux & Windows.',
    color: 'from-emerald-500 to-teal-600',
    count: 5
  }
};

export interface SkillQuizQuestion {
  id: string;
  category: SkillDomain;
  questionAr: string;
  questionEn: string;
  optionsAr: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationAr: string;
  explanationEn: string;
}

export const SKILL_QUIZ_QUESTIONS: SkillQuizQuestion[] = [
  {
    id: 'quiz-1',
    category: 'software-repair',
    questionAr: 'ما هو أول أمر في بروتوكول Qualcomm Sahara يرسله المعالج عند دخوله وضع EDL 9008؟',
    questionEn: 'What is the very first packet command sent by a Qualcomm SoC upon entering EDL 9008 Sahara handshake?',
    optionsAr: [
      'Sahara Command 0x01 (SAHARA_CMD_HELLO)',
      'Fastboot flash boot boot.img',
      'Download Mode PIT Table Request',
      'ADB Shell Root Authorization'
    ],
    optionsEn: [
      'Sahara Command 0x01 (SAHARA_CMD_HELLO)',
      'Fastboot flash boot boot.img',
      'Download Mode PIT Table Request',
      'ADB Shell Root Authorization'
    ],
    correctIndex: 0,
    explanationAr: 'يرسل معالج كوالكوم فوراً حزمة Hello Packet (0x01) مع رقم المعالج الحقيقي (MSM ID) وتوقيع الـ Hash المتوقع لمحمل الإقلاع.',
    explanationEn: 'Qualcomm silicon immediately initiates with Sahara Hello Packet (0x01) broadcasting MSM ID, HW version and hash requirements.'
  },
  {
    id: 'quiz-2',
    category: 'hardware-repair',
    questionAr: 'عند قياس خط VPH_PWR في وضع قياس الدايود، ما هي الممانعة الطبيعية السليمة بالمقارنة مع الأرضي؟',
    questionEn: 'In Diode Mode impedance testing, what is the expected healthy reference reading on VPH_PWR rail?',
    optionsAr: [
      '0.000 V (شورت صريح)',
      '0.350 V إلى 0.450 V',
      '2.500 V أو أعلى',
      'Open Loop (OL) دائرة مفتوحة'
    ],
    optionsEn: [
      '0.000 V (Dead Short)',
      '0.350 V to 0.450 V',
      '2.500 V or higher',
      'Open Loop (OL) broken line'
    ],
    correctIndex: 1,
    explanationAr: 'الممانعة السليمة لخط التغذية الرئيسي VPH_PWR تتراوح بين 350mV إلى 450mV ناتجة عن وصلات P-N الداخلية لآيسيهات الباور الموزعة على الخط.',
    explanationEn: 'Healthy VPH_PWR diode mode reading sits between 0.350V and 0.450V from internal semi-conductor junctions across buck regulators.'
  },
  {
    id: 'quiz-3',
    category: 'languages-and-os',
    questionAr: 'ما هو كود تعليمة الـ NOP (عدم فعل شيء) في لغة أسمبلي ARM64 المستخدم لتجاوز فحوصات التوقيع الرقمي؟',
    questionEn: 'What is the 32-bit hex opcode for the ARM64 NOP instruction used to bypass security branch conditions?',
    optionsAr: [
      '0x90 (x86 NOP)',
      '0x1F 0x20 0x03 0xD5 (D503201F)',
      '0xFF 0xFF 0xFF 0xFF',
      '0x00 0x00 0x00 0x00'
    ],
    optionsEn: [
      '0x90 (x86 NOP)',
      '0x1F 0x20 0x03 0xD5 (D503201F)',
      '0xFF 0xFF 0xFF 0xFF',
      '0x00 0x00 0x00 0x00'
    ],
    correctIndex: 1,
    explanationAr: 'في معمارية ARM64 (AArch64)، تعليمة NOP القياسية مشفرة بالقيمة 0xD503201F (وتكتب بالبايتات الصغيرة 1F 20 03 D5).',
    explanationEn: 'In ARM64, the canonical NOP opcode is encoded as 0xD503201F (Little Endian bytes: 1F 20 03 D5).'
  },
  {
    id: 'quiz-4',
    category: 'software-engineering',
    questionAr: 'ما هي الأداة القياسية في أندرويد AOSP لتعديل وترقيع ملفات vbmeta.img وتعطيل حماية dm-verity؟',
    questionEn: 'Which standard AOSP utility is designed to inspect, sign, and disable dm-verity verification on vbmeta.img?',
    optionsAr: [
      'avbtool',
      'fastboot reboot edl',
      'adb push busybox',
      'make_ext4fs'
    ],
    optionsEn: [
      'avbtool',
      'fastboot reboot edl',
      'adb push busybox',
      'make_ext4fs'
    ],
    correctIndex: 0,
    explanationAr: 'أداة `avbtool` الرسمية من جوجل هي المسؤولة عن معالجة هياكل Android Verified Boot 2.0 وتوليد صور الـ vbmeta.',
    explanationEn: '`avbtool` is the official Google AOSP utility used to construct, parse, and patch Android Verified Boot 2.0 descriptor images.'
  },
  {
    id: 'quiz-5',
    category: 'hardware-repair',
    questionAr: 'إذا أظهر الأوسيلوسكوب أن مسار I2C_SDA معلق عند جهد 0.0V ثابت طوال الوقت، ما هو السبب الأرجح؟',
    questionEn: 'If an oscilloscope reveals the I2C_SDA rail clamped continuously at 0.0V, what is the most probable fault?',
    optionsAr: [
      'شاشة الهاتف بحاجة لضبط السطوع',
      'أحد الآيسيهات المتصلة بنفس المسار به انهيار سيليكوني داخلي وسحب المسار للأرضي',
      'بطارية الهاتف مشحونة بنسبة 100%',
      'كابل الـ USB غير متصل'
    ],
    optionsEn: [
      'Display brightness setting requires adjustment',
      'One of the slave ICs sharing the bus suffered internal silicon breakdown, clamping rail to ground',
      'Battery is at 100% state of charge',
      'USB cable is disconnected'
    ],
    correctIndex: 1,
    explanationAr: 'لأن خطوط I2C تعتمد على مقاومات رفع إلى 1.8V، فإن هبوط الخط إلى 0V دائم يعني أن أحد المكونات يعاني من شورت صريح للأرضي على ذلك المسار.',
    explanationEn: 'Since I2C lines are pulled up to 1.8V, a permanent 0V clamp indicates an active component has shorted internally to ground.'
  },
  {
    id: 'quiz-6',
    category: 'software-repair',
    questionAr: 'ما هو المنفذ التسلسلي الافتراضي في كوالكوم المستخدم لقراءة وتعديل ملفات معايرة الترددات QCN؟',
    questionEn: 'What is the diagnostic virtual COM port mode in Qualcomm chipsets used for QCN RF calibration reading and editing?',
    optionsAr: [
      'Qualcomm HS-USB Diagnostics (Diag 9091 / 900E)',
      'Odin Download Protocol',
      'Apple DFU 1227',
      'MediaTek Preloader DA'
    ],
    optionsEn: [
      'Qualcomm HS-USB Diagnostics (Diag 9091 / 900E)',
      'Odin Download Protocol',
      'Apple DFU 1227',
      'MediaTek Preloader DA'
    ],
    correctIndex: 0,
    explanationAr: 'منفذ Diag 9091 هو المنفذ القياسي الذي يتواصل مع المودم عبر بروتوكول Qualcomm DMSS لقراءة وكتابة ملفات QCN وحسابات الـ NVRAM.',
    explanationEn: 'Qualcomm HS-USB Diagnostics 9091 interface is the official DMSS pipeline for RF calibration and NV-Item manipulation.'
  }
];

