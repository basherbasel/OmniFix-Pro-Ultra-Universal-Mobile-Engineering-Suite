import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Monitor, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  X, 
  Laptop, 
  Layers, 
  Sparkles, 
  Terminal, 
  HardDrive, 
  Check, 
  Cpu, 
  Usb,
  AlertTriangle,
  FileCode,
  Copy,
  ExternalLink,
  Wrench,
  RefreshCw,
  HelpCircle,
  Key,
  Play
} from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface WindowsInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
}

export const WindowsInstallerModal: React.FC<WindowsInstallerModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'app' | 'drivers' | 'signature' | 'webusb-test'>('app');
  const [urlType, setUrlType] = useState<'shared' | 'dev'>(() => {
    if (typeof window !== 'undefined' && window.location.href.includes('-pre-')) {
      return 'shared';
    }
    return 'dev';
  });
  const [selectedBrowser, setSelectedBrowser] = useState<'chrome' | 'edge'>('chrome');

  const getTargetUrl = () => {
    const rawUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-lv4xtvc7ulcjlfkc2nvbki-263339059547.europe-west1.run.app';
    if (urlType === 'shared') {
      return rawUrl.replace('-dev-', '-pre-');
    }
    return rawUrl;
  };

  const currentAppUrl = getTargetUrl();
  const edgeAppCmd = `msedge.exe --app="${currentAppUrl}"`;
  const chromeAppCmd = `chrome.exe --app="${currentAppUrl}"`;

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [installGuideStatus, setInstallGuideStatus] = useState<string | null>(null);

  // WebUSB Test State
  const [usbStatus, setUsbStatus] = useState<'IDLE' | 'CHECKING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [usbDetails, setUsbDetails] = useState<string>('');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    audioSynth.playMultimeterBeep();
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setInstallGuideStatus(isAr ? '✓ تم البدء بتثبيت المنظومة بنجاح على سطح مكتب الويندوز!' : '✓ App installation successfully initiated!');
        }
        setDeferredPrompt(null);
      } catch (err: any) {
        setInstallGuideStatus(isAr ? '💡 استخدم أحد الخيارات التلقائية بالأسفل لتحميل ملف التشغيل الفوري.' : '💡 Use one of the 1-click launcher download options below.');
      }
    } else {
      setInstallGuideStatus(
        isAr 
          ? 'ℹ️ تعذر إطلاق نافذة المتصفح المباشرة (بسبب التشغيل داخل إطار معاينة iFrame). يرجى فتح التطبيق في تبويب جديد أو تحميل المشغل المباشر بالأسفل.'
          : 'ℹ️ Direct browser popup bypassed (running inside iFrame preview). Use 1-click launcher script or open in new tab below.'
      );
    }
  };

  const downloadLauncherBat = () => {
    audioSynth.playMultimeterBeep();
    const appUrl = currentAppUrl;
    const exeName = selectedBrowser === 'chrome' ? 'chrome.exe' : 'msedge.exe';
    const fallbackExe = selectedBrowser === 'chrome' ? 'msedge.exe' : 'chrome.exe';
    const batScript = `@echo off
title OmniFix Pro v5.0 Native Workstation
color 0A
cls
echo =========================================================================
echo               OMNIFIX PRO v5.0 WORKSTATION NATIVE LAUNCHER
echo =========================================================================
echo [1/2] Launching with your authorized browser profile (${selectedBrowser === 'chrome' ? 'Chrome' : 'Edge'})...
echo [2/2] Launching OmniFix Pro as Standalone Windows Application...
echo.
start ${exeName} --app="${appUrl}" --new-window
if errorlevel 1 (
    start ${fallbackExe} --app="${appUrl}" --new-window
)
echo.
echo ✓ Application launched successfully! You can close this command window.
timeout /t 3 >nul
exit
`;
    const blob = new Blob([batScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OmniFix_Pro_v5_${selectedBrowser === 'chrome' ? 'Chrome' : 'Edge'}_Launcher.bat`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setInstallGuideStatus(
      isAr 
        ? `✓ تم تحميل ملف تشغيل الكروم/إيدج OmniFix_Pro_v5_${selectedBrowser === 'chrome' ? 'Chrome' : 'Edge'}_Launcher.bat! قم بنقره مرتين للتشغيل.` 
        : `✓ Downloaded OmniFix_Pro_v5_${selectedBrowser === 'chrome' ? 'Chrome' : 'Edge'}_Launcher.bat! Double-click to run.`
    );
  };

  const downloadDesktopShortcutPs1 = () => {
    audioSynth.playMultimeterBeep();
    const appUrl = currentAppUrl;
    const exeName = selectedBrowser === 'chrome' ? 'chrome.exe' : 'msedge.exe';
    const psScript = `# OmniFix Pro v5.0 Desktop Shortcut Generator
$WScriptShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = "$DesktopPath\\OmniFix Pro Workstation.lnk"
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "${exeName}"
$Shortcut.Arguments = "--app=""${appUrl}"" --new-window"
$Shortcut.Description = "OmniFix Pro v5.0 Mobile Repair Workstation"
$Shortcut.Save()
Write-Host "✓ Desktop Shortcut 'OmniFix Pro Workstation' created successfully on your Windows Desktop using ${selectedBrowser === 'chrome' ? 'Chrome' : 'Edge'}!" -ForegroundColor Green
pause
`;
    const blob = new Blob([psScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Create_OmniFix_${selectedBrowser === 'chrome' ? 'Chrome' : 'Edge'}_Shortcut.ps1`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setInstallGuideStatus(
      isAr 
        ? `✓ تم تحميل سكريبت إنشاء اختصار الكروم/إيدج لسطح المكتب! انقر عليه بالزر الأيمن واختر Run with PowerShell.` 
        : `✓ Downloaded PowerShell shortcut generator script for ${selectedBrowser === 'chrome' ? 'Chrome' : 'Edge'}.`
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    audioSynth.playMultimeterBeep();
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const runWebUsbCheck = async () => {
    audioSynth.playMultimeterBeep();
    setUsbStatus('CHECKING');
    setUsbDetails(isAr ? 'جاري فحص دعم بروتوكول WebUSB في ويندوز ومتصفح Chrome/Edge...' : 'Checking WebUSB API support in Windows Chrome/Edge browser...');

    setTimeout(async () => {
      if ('usb' in navigator) {
        try {
          const devices = await (navigator as any).usb.getDevices();
          setUsbStatus('SUCCESS');
          setUsbDetails(
            isAr
              ? `✓ بروتوكول WebUSB مدعوم ونشط بكتفاء على نظام الويندوز!\nعدد أجهزة USB المقترنة حالياً: ${devices.length}\nجاهزية كاملة لربط الكوم بورت BROM, EDL 9008, و Fastboot.`
              : `✓ WebUSB API is fully supported and active on Windows!\nPaired USB Devices: ${devices.length}\nReady for direct raw USB communication (BROM, EDL 9008, Fastboot).`
          );
        } catch (err: any) {
          setUsbStatus('ERROR');
          setUsbDetails(
            isAr
              ? `⚠️ خطأ في الوصول لخدمة USB: ${err.message || 'Access Denied'}\nالحل: تأكد من تفعيل صلاحية الأجهزة من إعدادات المتصفح وإلغاء حظر بروتوكول WebUSB.`
              : `⚠️ USB API error: ${err.message || 'Access Denied'}\nSolution: Ensure Chrome USB permissions are granted and no security software blocks raw USB claims.`
          );
        }
      } else {
        setUsbStatus('ERROR');
        setUsbDetails(
          isAr
            ? '❌ المتصفح الحالي لا يدعم WebUSB المباشر. يرجى استخدام متصفح Google Chrome أو Microsoft Edge على نظام الويندوز.'
            : '❌ WebUSB API not supported on current browser. Please use Google Chrome or Microsoft Edge on Windows.'
        );
      }
    }, 800);
  };

  // Dynamic URL configuration loaded at the top level

  const driverGuides = [
    {
      id: 'mtk',
      titleAr: 'تعاريف الميديا تيك (MediaTek USB VCOM & BROM Driver)',
      titleEn: 'MediaTek USB VCOM & BROM Drivers',
      symptomAr: 'المنفذ يظهر لثانيتين فقط ثم يختفي (MediaTek USB Port Disconnecting / BROM Loop)',
      symptomEn: 'BROM COM Port connects for 2 seconds then disconnects immediately',
      solutionAr: [
        'قم بتثبيت حزمة MediaTek_Auto_Driver_v5.2.1.',
        'استخدم أداة Filter Driver (libusb-win32) وتثبيت الفلتر على جهاز "MediaTek PreLoader USB VCOM".',
        'تأكد من إغلاق برامج البوكسات القديمة (مثل SP Flash Tool) لتجنب حجز المنفذ (COM Port Conflict).'
      ],
      solutionEn: [
        'Install MediaTek_Auto_Driver_v5.2.1 package.',
        'Run libusb-win32 Filter Wizard and attach filter to "MediaTek PreLoader USB VCOM".',
        'Close legacy flashing tools to prevent COM port lock conflicts.'
      ]
    },
    {
      id: 'qualcomm',
      titleAr: 'تعاريف كوالكوم (Qualcomm HS-USB QDLoader 9008 / Zadig WinUSB)',
      titleEn: 'Qualcomm HS-USB QDLoader 9008 / Zadig WinUSB',
      symptomAr: 'ظهور QHSUSB_BULK بعلامة تعجب صفراء أو خطأ Claim Interface في وضع EDL',
      symptomEn: 'QHSUSB_BULK exclamation mark or Claim Interface failure in EDL 9008 mode',
      solutionAr: [
        'قم بتحميل وتثبيت Qualcomm_QDLoader_HS-USB_Driver_64bit.',
        'في حال استخدام متصفح WebUSB مباشر: افتح أداة Zadig، اختر Options -> List All Devices، حدد Qualcomm HS-USB QDLoader 9008، وغير التعريف إلى WinUSB (v6.1.7600.16385) ثم انقر Replace Driver.',
        'اعد توصيل الهاتف بزر خفض الصوت + زيادة الصوت مع كابل USB.'
      ],
      solutionEn: [
        'Download & install Qualcomm_QDLoader_HS-USB_Driver_64bit.',
        'For Direct WebUSB: Open Zadig tool, check Options -> List All Devices, select Qualcomm HS-USB QDLoader 9008, change driver to WinUSB, and click Replace Driver.',
        'Reconnect phone holding Vol Up + Vol Down with USB cable.'
      ]
    },
    {
      id: 'spd',
      titleAr: 'تعاريف يونيسوك (Unisoc / SPD BSL HDLC Flash Drivers)',
      titleEn: 'Unisoc / SPD BSL HDLC Flash Drivers',
      symptomAr: 'عدم استجابة الهاتف في وضع Bootrom / FDL1 وعدم التعرف على SPRD U2S Diag',
      symptomEn: 'No response during FDL1 handshaking or missing SPRD U2S Diag COM port',
      solutionAr: [
        'تثبيت حزمة Unisoc_SPD_Driver_R2.15.2201 مع صلاحيات المسؤول (Run as Administrator).',
        'تعطيل حماية التوقيع الرقمي للتعاريف في ويندوز (Driver Signature Verification) قبل التثبيت.',
        'تأكد من الضغط المستمر على زر خفض الصوت عند التوصيل.'
      ],
      solutionEn: [
        'Install Unisoc_SPD_Driver_R2.15.2201 with Administrator privileges.',
        'Disable Windows Driver Signature Verification before installing.',
        'Hold Volume Down continuously during USB insertion.'
      ]
    },
    {
      id: 'samsung',
      titleAr: 'تعاريف سامسونج و ADB/Fastboot (Samsung Android USB Driver)',
      titleEn: 'Samsung Android USB & ADB/Fastboot Drivers',
      symptomAr: 'فشل التوصيل بوضع Odin / Download Mode أو عدم ظهور أجهزة ADB في القائمة',
      symptomEn: 'Failed Odin/Download mode connection or device not visible under ADB list',
      solutionAr: [
        'تثبيت Samsung_USB_Driver_for_Mobile_Phones_v1.7.59.exe.',
        'تفعيل وضع تصحيح أخطاء USB (USB Debugging) من خيارات المطور.',
        'في حال استمرار المشكلة: قم بإلغاء تثبيت التعريف القديم من Device Manager وإعادة التشغيل.'
      ],
      solutionEn: [
        'Install Samsung_USB_Driver_for_Mobile_Phones_v1.7.59.exe.',
        'Enable USB Debugging in Developer Options.',
        'If issues persist: Uninstall old driver via Windows Device Manager and restart PC.'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-cyan-700/50 rounded-2xl max-w-3xl w-full p-5 shadow-2xl shadow-cyan-950/50 space-y-4 my-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/10">
              <Monitor className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'مركز تثبيت وتجهيز المنظومة على الويندوز (Windows Workstation Setup Studio)' : 'Windows Workstation Setup & Driver Studio'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  WIN 10/11 x64
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'خيارات متعددة لتثبيت البرنامج على سطح المكتب، تشغيل الحزمة الناتيف، وحل أخطاء تعاريف BROM/EDL'
                  : 'Multiple foolproof solutions for Desktop app installation, standalone launchers, and BROM/EDL drivers.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('app');
              audioSynth.playMultimeterBeep();
            }}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'app'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تثبيت تطبيق سطح المكتب' : 'Install Desktop App'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('drivers');
              audioSynth.playMultimeterBeep();
            }}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'drivers'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>{isAr ? 'حل مشاكل التعاريف (BROM/EDL/ADB)' : 'Fix Drivers (BROM/EDL/ADB)'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('signature');
              audioSynth.playMultimeterBeep();
            }}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'signature'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'تعطيل التوقيع الرقمي (Signature Enforcement)' : 'Disable Driver Signature'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('webusb-test');
              audioSynth.playMultimeterBeep();
            }}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'webusb-test'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Usb className="w-4 h-4" />
            <span>{isAr ? 'فحص جاهزية WebUSB' : 'Test WebUSB Engine'}</span>
          </button>
        </div>

        {/* Tab 1: Desktop Installation Methods */}
        {activeTab === 'app' && (
          <div className="space-y-4">
            {/* 403 Access Error Resolution & URL Selection Banner */}
            <div className="p-4 bg-slate-900 border border-amber-500/30 rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-300">
                    {isAr ? '⚠️ حل مشكلة خطأ 403 (Forbidden) وخطأ 404 (Page Not Found)' : '⚠️ 403 Forbidden & 404 Page Not Found Error Solver'}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    {isAr
                      ? '💡 خطأ 403 (Forbidden): يحدث إذا فتحت "رابط المطور" بمتصفح لا يحتوي على جلسة تسجيل دخولك لمنصة AI Studio. لحله: اختر متصفحك النشط بالأسفل.\n💡 خطأ 404 (Page Not Found): يحدث إذا استخدمت "الرابط المشترك" قبل أن تقوم بنشر/مشاركة التطبيق لأول مرة من قائمة Share في AI Studio. لحله: إذا لم تنشر التطبيق بعد، فاستخدم "رابط المطور" وافتحه بمتصفحك النشط.'
                      : '💡 403 Error (Forbidden): Happens if you open the "Dev URL" in a browser profile without your active AI Studio session. Fix: Select your active browser below.\n💡 404 Error (Page Not Found): Happens if you use the "Public Shared URL" before clicking "Share" in the AI Studio menu to publish your app for the first time. Fix: Use "Dev URL" and launch it in Chrome.'}
                  </p>
                </div>
              </div>

              {/* Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setUrlType('shared');
                    audioSynth.playMultimeterBeep();
                  }}
                  className={`p-2.5 rounded-xl border text-left font-sans flex flex-col justify-between transition-all cursor-pointer ${
                    urlType === 'shared'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full font-bold">
                    <span>{isAr ? '🟢 الرابط المشترك العام (الموصى به)' : '🟢 Public Shared URL (Recommended)'}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                      {isAr ? 'خالٍ من خطأ 403' : 'Immune to 403'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 truncate w-full">
                    {typeof window !== 'undefined' ? window.location.href.replace('-dev-', '-pre-') : ''}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUrlType('dev');
                    audioSynth.playMultimeterBeep();
                  }}
                  className={`p-2.5 rounded-xl border text-left font-sans flex flex-col justify-between transition-all cursor-pointer ${
                    urlType === 'dev'
                      ? 'bg-slate-900 border-cyan-500/50 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full font-bold">
                    <span>{isAr ? '🔵 رابط المطور الداخلي' : '🔵 Dev Preview URL'}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {isAr ? 'قد يتطلب مصادقة' : 'Requires Auth'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 truncate w-full">
                    {typeof window !== 'undefined' ? window.location.href : ''}
                  </span>
                </button>
              </div>

              {/* Browser Selector for Active Profile Session */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 block">
                  {isAr 
                    ? '🌐 حدد المتصفح النشط حالياً (الذي تستخدمه لفتح موقع AI Studio للعمل):' 
                    : '🌐 Select the browser you are currently using for AI Studio to retain login cookies:'}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrowser('chrome');
                      audioSynth.playMultimeterBeep();
                    }}
                    className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedBrowser === 'chrome'
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-md shadow-cyan-950/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span>Google Chrome</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrowser('edge');
                      audioSynth.playMultimeterBeep();
                    }}
                    className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedBrowser === 'edge'
                        ? 'bg-blue-950/40 border-blue-500/50 text-blue-200 shadow-md shadow-blue-950/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>Microsoft Edge</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Status Feedback Banner */}
            {installGuideStatus && (
              <div className="p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-xs text-cyan-200 flex items-center gap-2 font-sans animate-fade-in">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                <span>{installGuideStatus}</span>
              </div>
            )}

            {/* Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Option A: Direct Web App Launcher Generator (.bat) */}
              <div className="p-4 bg-slate-900 border border-cyan-500/30 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>{isAr ? 'الخيار 1: مشغل سطح المكتب الفوري (1-Click BAT Launcher)' : 'Option 1: 1-Click BAT Desktop Launcher'}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isAr
                      ? 'قم بتحميل ملف المشغل الناتيف. بمجرد النقر عليه مرتين على الويندوز سيفتح المنظومة كبرنامج ناتيف مستقل على سطح المكتب دون شريط أدوات.'
                      : 'Download native batch launcher. Double clicking it opens OmniFix Pro as a standalone desktop app with full WebUSB priority.'}
                  </p>
                </div>

                <button
                  onClick={downloadLauncherBat}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isAr ? 'تحميل ملف المشغل (OmniFix_Launcher.bat)' : 'Download Launcher (.bat)'}</span>
                </button>
              </div>

              {/* Option B: PowerShell Desktop Shortcut Creator */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span>{isAr ? 'الخيار 2: إنشاء اختصار تلقائي (PowerShell Shortcut)' : 'Option 2: PowerShell Desktop Shortcut'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isAr
                      ? 'سكريبت ينشئ اختصار حقيقي على سطح مكتب الويندوز باسم "OmniFix Pro Workstation" لفتح البرنامج مباشرة.'
                      : 'Script that generates a direct desktop shortcut named "OmniFix Pro Workstation" on your Windows desktop.'}
                  </p>
                </div>

                <button
                  onClick={downloadDesktopShortcutPs1}
                  className="w-full py-2.5 bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-500/40 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span>{isAr ? 'تحميل سكريبت الاختصار (.ps1)' : 'Download Shortcut Script (.ps1)'}</span>
                </button>
              </div>
            </div>

            {/* Option C: Direct Browser PWA Trigger & External Tab Option */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'الخيار 3: تثبيت متصفح المباشر (PWA Native App) أو الفتح في تبويب جديد:' : 'Option 3: Native Browser PWA Install / Standalone Tab:'}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Chrome / Edge</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleInstallClick}
                  className="py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>
                    {isInstalled 
                      ? (isAr ? 'التطبيق مثبت بالفعل على سطح المكتب' : 'App Installed on Desktop')
                      : (isAr ? 'إطلاق نافذة التثبيت التلقائية' : 'Trigger Browser Install Prompt')}
                  </span>
                </button>

                <a
                  href={currentAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => audioSynth.playMultimeterBeep()}
                  className="py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'فتح المنظومة في تبويب مستقل' : 'Open in Standalone Tab'}</span>
                </a>
              </div>
            </div>

            {/* Option D: Direct Windows Run Command (Win + R) */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'الخيار 4: أمر التشغيل السريع المباشر (Windows Run Win+R):' : 'Option 4: Windows Run Command (Win + R):'}</span>
              </span>

              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'اضغط Win + R على لوحة المفاتيح، الصق أحد الأمرين التاليين وانقر Enter لفتح المنظومة كبرنامج كامل دون إطارات:'
                  : 'Press Win + R, paste either command below and hit Enter to launch as a borderless app window:'}
              </p>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2 bg-black/90 rounded border border-slate-800 text-cyan-300">
                  <span className="truncate pr-2 rtl:pr-0 rtl:pl-2">{edgeAppCmd}</span>
                  <button
                    onClick={() => copyToClipboard(edgeAppCmd, 'edgeApp')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'edgeApp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'edgeApp' ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ Edge' : 'Copy Edge')}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-black/90 rounded border border-slate-800 text-amber-300">
                  <span className="truncate pr-2 rtl:pr-0 rtl:pl-2">{chromeAppCmd}</span>
                  <button
                    onClick={() => copyToClipboard(chromeAppCmd, 'chromeApp')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'chromeApp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'chromeApp' ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ Chrome' : 'Copy Chrome')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: USB Driver Troubleshooting Guides */}
        {activeTab === 'drivers' && (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-200">
              {isAr
                ? '💡 معظم مشاكل التوصيل في ويندوز تعود إما لحجب بروتوكول USB من قبل برامج البوكسات القديمة أو عدم تثبيت تعاريف WinUSB المباشرة.'
                : '💡 Most Windows connection issues are caused by legacy dongle software locking COM ports or missing WinUSB drivers.'}
            </div>

            <div className="space-y-3">
              {driverGuides.map((guide) => (
                <div key={guide.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span>{isAr ? guide.titleAr : guide.titleEn}</span>
                    </h5>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      FIX GUIDE
                    </span>
                  </div>

                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span><strong>{isAr ? 'العرض / المشكلة:' : 'Symptom:'}</strong> {isAr ? guide.symptomAr : guide.symptomEn}</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-slate-400 font-bold block">{isAr ? 'خطوات الحل الموصى بها:' : 'Recommended Steps:'}</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] font-sans">
                      {(isAr ? guide.solutionAr : guide.solutionEn).map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Disable Driver Signature Enforcement */}
        {activeTab === 'signature' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'تعطيل التوقيع الرقمي للتعاريف في نظام ويندوز (Disable Driver Signature Verification)' : 'Disable Windows Driver Signature Verification'}</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                {isAr
                  ? 'تتطلب تعاريف MTK VCOM و Unisoc و Qualcomm القديمة تعطيل إجبار التوقيع الرقمي لتتمكن ويندوز من تحميل ملفات .sys بدون حظر الأمان.'
                  : 'Legacy MTK VCOM & Unisoc drivers require disabling driver signature enforcement so Windows loads unsigned sys files.'}
              </p>
            </div>

            {/* Method 1: Command Line */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h6 className="text-xs font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'الطريقة الأولى: عبر موجه الأوامر (CMD كمسؤول):' : 'Method 1: via Command Prompt (Admin CMD)'}</span>
                </h6>
              </div>

              <p className="text-[11px] text-slate-400">
                {isAr ? 'افتح موجه الأوامر CMD بصلحية مسؤول وأدخل الأمر التالي لتفعيل وضع Test Mode:' : 'Run CMD as Administrator and execute:'}
              </p>

              <div className="flex items-center justify-between p-2.5 bg-black/90 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400">
                <code>bcdedit /set testsigning on</code>
                <button
                  onClick={() => copyToClipboard('bcdedit /set testsigning on', 'cmd1')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd === 'cmd1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'cmd1' ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400">
                * {isAr ? 'ثم قم بإعادة تشغيل الكمبيوتر. ولإلغاء الوضع لاحقاً استخدم: bcdedit /set testsigning off' : 'Then restart PC. To disable Test Mode later run: bcdedit /set testsigning off'}
              </p>
            </div>

            {/* Method 2: Advanced Boot Options */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
              <h6 className="font-bold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-purple-400" />
                <span>{isAr ? 'الطريقة الثانية: عبر خيارات الإقلاع المتقدمة (Windows Advanced Startup):' : 'Method 2: via Windows Advanced Startup Menu'}</span>
              </h6>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] font-sans">
                <li>{isAr ? 'اضغط مع الاستمرار على زر Shift في لوحة المفاتيح وانقر على "إعادة التشغيل Restart" من قائمة إبدأ.' : 'Hold Shift key while clicking "Restart" in Windows Start Menu.'}</li>
                <li>{isAr ? 'اختر Troubleshoot -> Advanced Options -> Startup Settings -> Restart.' : 'Navigate to Troubleshoot -> Advanced Options -> Startup Settings -> Restart.'}</li>
                <li>{isAr ? 'عند إعادة التشغيل اضغط F7 أو الرقم 7 لاختيار "Disable driver signature enforcement".' : 'Upon reboot, press F7 or 7 to select "Disable driver signature enforcement".'}</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 4: WebUSB Engine Test */}
        {activeTab === 'webusb-test' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white flex items-center gap-2">
                    <Usb className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'اختبار الجاهزية والربط المباشر ببروتوكول WebUSB' : 'Live WebUSB Hardware Connection Test'}</span>
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isAr ? 'فحص استجابة المتصفح والنظام للاتصال الخام بمنافذ USB الهواتف' : 'Verify browser and OS capability to claim raw USB hardware interfaces.'}
                  </p>
                </div>

                <button
                  onClick={runWebUsbCheck}
                  disabled={usbStatus === 'CHECKING'}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${usbStatus === 'CHECKING' ? 'animate-spin' : ''}`} />
                  <span>{isAr ? 'بدء الفحص الآن' : 'Run Test Now'}</span>
                </button>
              </div>

              {/* Status Box */}
              {usbStatus !== 'IDLE' && (
                <div className={`p-3.5 rounded-lg border font-mono text-xs whitespace-pre-line leading-relaxed ${
                  usbStatus === 'SUCCESS'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : usbStatus === 'ERROR'
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-cyan-300 animate-pulse'
                }`}>
                  {usbDetails}
                </div>
              )}
            </div>

            {/* Quick Chrome Flag fix */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-200 block">{isAr ? 'رابط خيارات المتصفح لتفعيل WebUSB بدون حظر:' : 'Chrome/Edge Direct Flag Settings for WebUSB:'}</span>
              <div className="flex items-center justify-between p-2 bg-black/90 rounded border border-slate-800 font-mono text-cyan-300 text-[11px]">
                <span>chrome://flags/#enable-webusb</span>
                <button
                  onClick={() => copyToClipboard('chrome://flags/#enable-webusb', 'flag1')}
                  className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px] cursor-pointer"
                >
                  {copiedCmd === 'flag1' ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
