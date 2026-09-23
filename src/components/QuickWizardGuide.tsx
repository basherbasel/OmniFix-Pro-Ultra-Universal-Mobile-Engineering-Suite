import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Smartphone, 
  RotateCcw, 
  ShieldAlert, 
  Wrench, 
  Zap, 
  BookOpen,
  CheckCircle2,
  Cpu,
  HardDrive
} from 'lucide-react';

interface QuickWizardGuideProps {
  lang: 'en' | 'ar';
  setActiveTab: (tabId: string) => void;
  onAddLog?: (level: 'info' | 'success' | 'error' | 'hex', tag: string, message: string) => void;
}

export const QuickWizardGuide: React.FC<QuickWizardGuideProps> = ({
  lang,
  setActiveTab,
  onAddLog
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeWorkflow, setActiveWorkflow] = useState<'frp' | 'unbrick' | 'ai' | 'flash' | 'forensic' | null>(null);

  const isAr = lang === 'ar';

  const workflows = [
    {
      id: 'forensic',
      titleAr: '🔬 استعادة بيانات الهواتف الميتة والمحذوفة',
      titleEn: '🔬 Dead Phone & Deleted Data Carving',
      icon: HardDrive,
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-300',
      tabTarget: 'forensic-decrypt',
      stepsAr: [
        'انتقل إلى تبويب "الاسترداد الجنائي وفك التشفير".',
        'اختر مصدر الملفات: "الملفات المحذوفة" أو "هاتف ميت / Dump".',
        'حدد نوع البيانات المستهدفة مثل الصور أو الأسماء أو قواعد البيانات.',
        'اضغط "ابدأ الاستخراج الجنائي" لفحص الذاكرة الفيزيائية واستعادتها بأمان.'
      ],
      stepsEn: [
        'Open the "Forensic & Data Recovery" workshop.',
        'Choose data source: "Deleted Files" or "Dead Phone Dump".',
        'Select target category like Photos, Contacts, or Databases.',
        'Click "Begin Physical Carving" to crawl partitions and extract lost sectors.'
      ]
    },
    {
      id: 'frp',
      titleAr: '🔓 تخطي حساب جوجل و FRP بضغطة واحدة',
      titleEn: '🔓 1-Click FRP & Google Account Bypass',
      icon: ShieldAlert,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300',
      tabTarget: 'smart-1click',
      stepsAr: [
        'قم بتوصيل الهاتف المفتوح بالكمبيوتر عبر كابل USB.',
        'اضغط على زر "قراءة بيانات الهاتف" للتأكد من التعرف على البورت.',
        'اختر الموديل أو دع النظام يكتشف المعالج تلقائياً.',
        'اضغط على زر "إزالة FRP بنقرة واحدة" لبدء كسر الحماية تلقائياً.'
      ],
      stepsEn: [
        'Connect the powered-on phone to the computer using a high-speed USB cable.',
        'Click the "Read Info" button to verify that the USB port is actively communication.',
        'Select the target brand/model, or let the auto-inspector detect the chipset.',
        'Click the "1-Click FRP Removal" action to initiate direct bootloader security bypass.'
      ]
    },
    {
      id: 'unbrick',
      titleAr: '🏥 إحياء الهواتف المعلقة والميتة (Unbrick / Dead Boot)',
      titleEn: '🏥 Dead Boot Recovery & Unbricking',
      icon: RotateCcw,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300',
      tabTarget: 'dead-boot',
      stepsAr: [
        'أدخل الهاتف في وضع الطوارئ EDL (اضغط Vol+ و Vol- معاً أثناء توصيل الكابل) أو وضع BROM.',
        'اضغط على "اتصال USB مباشر" لتأكيد ربط هاردوير WebUSB.',
        'من تبويب "إحياء الهواتف"، اختر ملف الـ Loader الآمن الخاص بجهازك.',
        'اضغط "إحياء البوت وتخطي القفل" لاسترجاع الهاتف وفتحه بأمان.'
      ],
      stepsEn: [
        'Force the phone into EDL emergency state (hold Vol+ and Vol- while inserting USB) or MTK BROM.',
        'Click "⚡ Connect USB" to pair the device with the browser-level WebUSB driver.',
        'In the "Dead Boot Recovery" panel, select the factory custom loader or XML boot file.',
        'Click "Initialize Boot Recovery" to rebuild partitions and unbrick.'
      ]
    },
    {
      id: 'ai',
      titleAr: '🧠 فحص وتشخيص الأعطال بالذكاء الاصطناعي (AI Diagnostics)',
      titleEn: '🧠 AI Guided Troubleshooting & Fault Repair',
      icon: Sparkles,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
      tabTarget: 'ai-diagnostics',
      stepsAr: [
        'اضغط على زر "التشخيص الذكي واللوج" أو انتقل إلى قسم الفحص.',
        'اكتب مظهر العطل بلهجتك الطبيعية (مثال: "الجهاز يفصل باور عند سحب 100 ملي أمبير").',
        'سيقوم الذكاء الاصطناعي فوراً بحساب ممانعات البوردة السليمة ونقاط الفحص الفولتية.',
        'اتبع الخطوات المكتوبة واللحام المناسب بدقة تامة لإصلاح الخلل.'
      ],
      stepsEn: [
        'Navigate to the "AI Diagnostics" section under the AI & Diagnostics category.',
        'Type the physical or software symptoms (e.g., "Poco X3 bootlooping, 0.05A stable draw").',
        'The AI engine instantly computes normal board resistance, test points, and voltage regulators.',
        'Follow the precise microsoldering hot-air guide and map to isolate and replace the faulty component.'
      ]
    },
    {
      id: 'flash',
      titleAr: '🌐 البحث عن الفلاشات الرسمية وتفليش الروم (Flasher)',
      titleEn: '🌐 Finding Verified Firmware & Safe Flashing',
      icon: Zap,
      color: 'from-indigo-500/20 to-pink-500/10 border-indigo-500/30 text-indigo-300',
      tabTarget: 'firmware-matching',
      stepsAr: [
        'ابحث عن رقم موديل هاتفك في "قاعدة الموديلات الشاملة" لمعرفة تفاصيل المعالج.',
        'انتقل إلى قسم "الفلاشات الرسمية المعتمدة" لتنزيل الروم الخالي من المشاكل والمطابق لجهازك.',
        'قم بتحميل الروم إلى قسم "تفليش الأنظمة" (Odin / Sahara / BROM).',
        'اضغط على "بدء تفليش الروم" وانتظر شريط التحميل الأخضر.'
      ],
      stepsEn: [
        'Find your model parameters in the "OEM Database" to determine the safe secure patch limits.',
        'Navigate to "Verified Stock ROMs" to find the secure firmware version checked with SHA-256.',
        'Click "Load into Flasher" to populate partition paths.',
        'Click "Begin Flash Stream" and wait for the green bar verification.'
      ]
    }
  ];

  const handleStartWorkflow = (wf: typeof workflows[0]) => {
    setActiveTab(wf.tabTarget);
    if (onAddLog) {
      onAddLog(
        'info',
        'GUIDE-WIZARD',
        isAr 
          ? `⚡ تم تشغيل المعالج الإرشادي السريع لـ: [${wf.titleAr}]. تم تحويل واجهة العمل للتبويب المطلوب.` 
          : `⚡ Fast Guided Wizard activated for: [${wf.titleEn}]. Switch Workspace viewport.`
      );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl transition-all duration-300">
      {/* Header Panel */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-slate-950/80 hover:bg-slate-950 flex items-center justify-between cursor-pointer border-b border-slate-800/80 select-none group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              {isAr ? '📖 دليل المساعد الإرشادي السريع (دقيقة واحدة للحل)' : '📖 Interactive One-Minute Solution Wizard'}
              <span className="px-2 py-0.2 text-[10px] font-bold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {isAr ? 'موصى به' : 'RECOMMENDED'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isAr ? 'اختر المشكلة التي تواجه الهاتف الآن، وسيقوم النظام بتوجيهك خطوة بخطوة للحل الفوري' : 'Select the exact issue of the connected phone to get dynamic step-by-step guidance'}
            </p>
          </div>
        </div>
        <div className="text-slate-400 group-hover:text-slate-200">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Workflows Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {workflows.map((wf) => {
              const WfIcon = wf.icon;
              const isActive = activeWorkflow === wf.id;
              return (
                <button
                  key={wf.id}
                  onClick={() => setActiveWorkflow(isActive ? null : (wf.id as any))}
                  className={`p-3 rounded-lg border text-right rtl:text-right ltr:text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                    isActive 
                      ? 'bg-slate-850 border-cyan-500/50 shadow-md shadow-cyan-950/20' 
                      : 'bg-slate-950/50 hover:bg-slate-850/50 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                      <WfIcon className="w-4 h-4" />
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-200 mt-2 block line-clamp-2">
                    {isAr ? wf.titleAr : wf.titleEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Workflow Steps Details Pane */}
          {activeWorkflow && (
            <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 animate-fadeIn space-y-3">
              {(() => {
                const wf = workflows.find(w => w.id === activeWorkflow)!;
                const steps = isAr ? wf.stepsAr : wf.stepsEn;
                return (
                  <>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-bold text-cyan-300">
                          {isAr ? 'خطة تتبع العطل البرمجية والفيزيائية' : 'Interactive Repair execution Plan'}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleStartWorkflow(wf)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/10 transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isAr ? 'انتقل إلى هذه الأداة وابدأ العمل فوراً' : 'Switch & Go to this Tool'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5">
                      {steps.map((stepText, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start p-2.5 rounded bg-slate-900 border border-slate-850">
                          <span className="w-5 h-5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs text-slate-300 leading-relaxed">
                            {stepText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
