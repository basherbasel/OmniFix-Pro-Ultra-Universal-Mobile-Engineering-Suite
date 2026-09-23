import { DecisionTreeQuestion } from '../types';

export const FAULT_DECISION_TREE_QUESTIONS: Record<string, DecisionTreeQuestion> = {
  root: {
    id: 'root',
    questionAr: 'ما هي الأعراض الأولية التي تظهر على الهاتف عند توصيله أو محاولة تشغيله؟',
    questionEn: 'What is the primary symptom exhibited by the device when powered on or plugged into USB?',
    subtextAr: 'حدد السلوك الفيزيائي أو البرمجي الظاهر لتشغيل خوارزمية التشخيص الذكية',
    subtextEn: 'Select the primary observation to activate the heuristic classification engine',
    options: [
      {
        labelAr: 'الهاتف ميت تماماً / شاشة سوداء / لا يستجيب لزر الباور (No Power / Black Screen)',
        labelEn: 'Completely dead / Black screen / No response to power button',
        nextQuestionId: 'q_dead_phone'
      },
      {
        labelAr: 'الهاتف يعلق على شعار الشركة أو يعيد التشغيل باستمرار (Bootloop / Stuck on Logo)',
        labelEn: 'Device stuck on boot logo or bootlooping infinitely',
        nextQuestionId: 'q_bootloop'
      },
      {
        labelAr: 'الهاتف يعمل لكن مع فقدان وظيفة محددة (الشبكة، الشحن، الشاشة سوداء مع صوت، اللمس)',
        labelEn: 'Device boots into OS, but specific subsystem fails (No Baseband, No Charge, Dark Screen, Touch)',
        nextQuestionId: 'q_functional_loss'
      },
      {
        labelAr: 'الهاتف مقفل بحساب (FRP / Mi Account / Knox Guard) أو شاشة قفل',
        labelEn: 'Device locked by Google FRP, Mi Account, Knox Guard, or Lockscreen PIN',
        nextQuestionId: 'q_lock_security'
      }
    ]
  },

  q_dead_phone: {
    id: 'q_dead_phone',
    questionAr: 'عند توصيل الهاتف بالكمبيوتر أو الباور سبلاي (DC Power Supply)، ما هي القراءة؟',
    questionEn: 'When connecting the device to DC Power Supply or PC USB port, what is the behavior?',
    options: [
      {
        labelAr: 'يتعرف الكمبيوتر على منفذ طوارئ (Qualcomm 9008 / MTK BROM / SPD Diag / DFU)',
        labelEn: 'PC recognizes emergency diagnostic port (Qualcomm 9008 / MTK BROM / DFU)',
        classification: 'SOFTWARE_GLITCH',
        diagnosisResult: {
          titleAr: 'تلف برمجي في منطقة الإقلاع الأولي (Hardbrick / Bootloader Crash)',
          titleEn: 'Low-Level Bootloader Failure / Hardbrick State',
          rootCauseAr: 'المعالج سليم ويدخل وضع التنزيل الإجباري. مساحة الذاكرة boot/sbl معطوبة وتحتاج إعادة كتابة فيرموير كامل.',
          rootCauseEn: 'SoC hardware is operational and broadcasting emergency handshake. Boot partition is corrupt.',
          actionType: 'EDL_RESTORE',
          actionPayload: 'flash_emergency_edl'
        }
      },
      {
        labelAr: 'الباور سبلاي يصفر أو يفصل فوراً (Short-Circuit / صفر فولت على خط البطارية)',
        labelEn: 'Power supply trips instantly (Short Circuit / 0.00V on VBAT)',
        classification: 'HARDWARE_FAILURE',
        diagnosisResult: {
          titleAr: 'شورت فيزيائي صريح على مسار VDD_MAIN أو VBAT أو آيسي الشحن OVP',
          titleEn: 'Direct Low-Ohmic Short on VDD_MAIN or Charging Circuit',
          rootCauseAr: 'مكثف سيراميكي متفحم أو انهيار في دائرة موسفت الشحن أو PMIC الرئيسي.',
          rootCauseEn: 'Dielectric breakdown in MLCC filter capacitor or blown switching regulator MOSFET.',
          actionType: 'HARDWARE_MICRO_SOLDER',
          actionPayload: 'charging-vbus-failure'
        }
      },
      {
        labelAr: 'سحب تيار ضعيف وثابت عند الضغط على الباور (Stuck at 0.05A - 0.12A)',
        labelEn: 'Current frozen at 0.05A - 0.12A when pressing Power Key',
        classification: 'HARDWARE_FAILURE',
        diagnosisResult: {
          titleAr: 'انقطاع مسار PS_HOLD أو تعطل كريستالة التردد RTC أو انقطاع كرات تحت المعالج',
          titleEn: 'Missing AP_PS_HOLD signal, RTC Clock Failure or Cold Solder under CPU',
          rootCauseAr: 'الـ PMIC يخرج الجهود الأولية ولكن المعالج لا يمسك خط الطاقة (PS_HOLD failure).',
          rootCauseEn: 'PMIC generates standby rails but Application Processor fails to assert PS_HOLD line.',
          actionType: 'MULTIMETER_INSPECT',
          actionPayload: 'power-pmic-buck-rail-failure'
        }
      }
    ]
  },

  q_bootloop: {
    id: 'q_bootloop',
    questionAr: 'ما هي الرسالة المكتوبة على الشاشة أو السلوك عند الدخول إلى وضع الريكفري أو الفاست بوت؟',
    questionEn: 'What message or behavior appears on screen or when entering Fastboot / Recovery?',
    options: [
      {
        labelAr: 'رسالة تحذيرية: Red State / dm-verity corruption / Your device is corrupted',
        labelEn: 'Warning message: Red State / dm-verity corruption / Device corrupted',
        classification: 'FIRMWARE_INCOMPATIBILITY',
        diagnosisResult: {
          titleAr: 'فشل حماية التحقق من سلامة النظام (AVB 2.0 / dm-verity Mismatch)',
          titleEn: 'Android Verified Boot Signature Hash Conflict',
          rootCauseAr: 'تضارب بين شجرة تواقيع vbmeta.img والتعديلات التي حدثت على ملف super أو boot.',
          rootCauseEn: 'Cryptographic hash mismatch between vbmeta root cert and super partition image.',
          actionType: 'ONE_CLICK_FLASH',
          actionPayload: 'fastboot --disable-verity flash vbmeta vbmeta.img'
        }
      },
      {
        labelAr: 'الهاتف يعيد التشغيل بعد محاولة تفليش روم قديم أو روم دولة أخرى',
        labelEn: 'Reboot loop started immediately after flashing different region or older build',
        classification: 'FIRMWARE_INCOMPATIBILITY',
        diagnosisResult: {
          titleAr: 'تضارب مؤشر حماية الرجوع (Anti-Rollback ARB / Binary Rev Mismatch)',
          titleEn: 'Anti-Rollback Protection Triggered',
          rootCauseAr: 'محاولة الرجوع بروم يحتوي على Binary أقل من المسجل في قفل الحماية eFuse للأجهزة الحديثة.',
          rootCauseEn: 'Attempted downgrade beneath hardware eFuse rollback fuse index counter.',
          actionType: 'ONE_CLICK_FLASH',
          actionPayload: 'match_official_firmware_binary'
        }
      },
      {
        labelAr: 'يعيد التشغيل مع حرارة شديدة في ظهر الهاتف دون أي تحديث برمجي سابق',
        labelEn: 'Reboot loop accompanied by severe localized heating with no prior flashing',
        classification: 'HARDWARE_FAILURE',
        diagnosisResult: {
          titleAr: 'انهيار جزئي في آيسي الصوت، أو الشحن، أو تسريب في ملفات الـ PMIC',
          titleEn: 'Subsystem Thermal Runaway (Audio Codec / Charging PMIC Leakage)',
          rootCauseAr: 'شورت جزئي على خط تغذية فرعي يتسبب في إعادة تشغيل المعالج لتفادي تلف البوردة.',
          rootCauseEn: 'Partial leakage on sub-rail triggers SoC watchdog hardware reset interrupt.',
          actionType: 'HARDWARE_MICRO_SOLDER',
          actionPayload: 'power-pmic-buck-rail-failure'
        }
      }
    ]
  },

  q_functional_loss: {
    id: 'q_functional_loss',
    questionAr: 'ما هي الوظيفة المعطلة تحديداً في الهاتف؟',
    questionEn: 'Which specific functional subsystem is failing on the device?',
    options: [
      {
        labelAr: 'الشبكة والاتصال: Baseband Unknown / IMEI Null / No Service',
        labelEn: 'Cellular & Baseband: Baseband Unknown / IMEI Null / No Service',
        nextQuestionId: 'q_network_detail'
      },
      {
        labelAr: 'الشاشة: الهاتف يرن ويشعر بالاهتزاز لكن الشاشة سوداء بالكامل',
        labelEn: 'Display: Phone rings and vibrates but screen is completely dark',
        classification: 'HARDWARE_FAILURE',
        diagnosisResult: {
          titleAr: 'عطل دائرة الإضاءة (Backlight Boost) أو جهود شاشة AMOLED (+5V/-5V)',
          titleEn: 'Backlight Boost Circuit or AMOLED Triple-Rail Power Failure',
          rootCauseAr: 'احتراق دايود الشوتكي أو ملف الإضاءة أو تلف شريحة تغذية شاشات OLED.',
          rootCauseEn: 'Blown Schottky boost diode, cracked boost inductor, or shorted AMOLED PMIC rail.',
          actionType: 'HARDWARE_MICRO_SOLDER',
          actionPayload: 'display-backlight-amoled-failure'
        }
      },
      {
        labelAr: 'الشحن: علامة شحن وهمي أو حرارة عند وضع الكابل أو بطء شديد',
        labelEn: 'Charging: Fake charging icon, heat at port, or extremely slow charge',
        classification: 'HARDWARE_FAILURE',
        diagnosisResult: {
          titleAr: 'عطل آيسي الشحن BQ/MAX أو خطوط التفاوض USB CC1/CC2 أو OVP',
          titleEn: 'Main Switching Charger IC or Type-C CC Negotiation Breakdown',
          rootCauseAr: 'شريحة الشحن تعجز عن تشغيل محول الـ Buck الداخلي أو تفاوض 9V الشحن السريع.',
          rootCauseEn: 'Charge controller cannot complete PD communication or drive switching coil.',
          actionType: 'HARDWARE_MICRO_SOLDER',
          actionPayload: 'charging-vbus-failure'
        }
      }
    ]
  },

  q_network_detail: {
    id: 'q_network_detail',
    questionAr: 'هل يظهر رقم السيريال IMEI عند كتابة #06#* في لوحة الاتصال؟',
    questionEn: 'Does the IMEI serial appear when typing *#06# on dialpad?',
    options: [
      {
        labelAr: 'لا يظهر أي رقم (فارغ أو Null / 00000000000000)',
        labelEn: 'Nothing appears (Blank or Null / 00000000000000)',
        classification: 'SOFTWARE_GLITCH',
        diagnosisResult: {
          titleAr: 'تلف في قطاع تشفير الشبكة (NVRAM / EFS / QCN Corrupted)',
          titleEn: 'Corrupted NVRAM / EFS Calibration Partition Tables',
          rootCauseAr: 'فقدان ملفات المعايرة الراديوية في بارتشن modemst1/modemst2 أو nvdata.',
          rootCauseEn: 'Raw NV items in modem calibration partitions erased or corrupted.',
          actionType: 'ONE_CLICK_FLASH',
          actionPayload: 'restore_nvram_backup'
        }
      },
      {
        labelAr: 'السيريال سليم ومكتوب لكن لا توجد أي إشارة شبكة (Emergency Calls Only)',
        labelEn: 'IMEI is valid and visible, but 0 bars signal (Emergency Calls Only)',
        classification: 'HARDWARE_FAILURE',
        diagnosisResult: {
          titleAr: 'عطل آيسي الإرسال والاستقبال اللاسلكي (WTR/SDR) أو مضخم الطاقة (PA)',
          titleEn: 'RF Transceiver (WTR5975) or Front-End PA Power Amplifier Failure',
          rootCauseAr: 'انقطاع تغذية 1.0V التناظرية لآيسي الـ WTR أو تلف كرات اللحام نتيجة الصدمات.',
          rootCauseEn: 'Missing 1.0V clean analog rail or cracked BGA balls under RF transceiver.',
          actionType: 'HARDWARE_MICRO_SOLDER',
          actionPayload: 'baseband-rf-transceiver-failure'
        }
      }
    ]
  },

  q_lock_security: {
    id: 'q_lock_security',
    questionAr: 'ما هو نوع القفل النشط على الهاتف؟',
    questionEn: 'What type of security lock is active on the device?',
    options: [
      {
        labelAr: 'قفل حساب جوجل (FRP) بعد الفورمات',
        labelEn: 'Google FRP Lock after factory reset',
        classification: 'SOFTWARE_GLITCH',
        diagnosisResult: {
          titleAr: 'تخطي حماية حساب جوجل (FRP Bypass)',
          titleEn: 'Google Factory Reset Protection Lock',
          rootCauseAr: 'قفل أمان نظام أندرويد النشط في بارتشن persistent / frp.',
          rootCauseEn: 'Security flag active in persistent eMMC/UFS partition block.',
          actionType: 'ONE_CLICK_FLASH',
          actionPayload: 'frp_bypass_engine'
        }
      },
      {
        labelAr: 'رمز الشاشة / النمط مع الرغبة في الحفاظ على صور وملفات المستخدم',
        labelEn: 'Screen PIN/Pattern lock with requirement to preserve user photos/data',
        classification: 'SOFTWARE_GLITCH',
        diagnosisResult: {
          titleAr: 'إزالة قفل الشاشة بدون مسح البيانات (No Data Loss Screen Lock Bypass)',
          titleEn: 'Screen Lock Removal Without Data Loss',
          rootCauseAr: 'حذف ملفات gatekeeper.password.key و locksettings.db عبر الريكفري المخصص أو ثغرة المعالج.',
          rootCauseEn: 'Targeted removal of cryptographic lock tokens from /data/system/.',
          actionType: 'ONE_CLICK_FLASH',
          actionPayload: 'screen-lock-no-data-loss'
        }
      }
    ]
  }
};
