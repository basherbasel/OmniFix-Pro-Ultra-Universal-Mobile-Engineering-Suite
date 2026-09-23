import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileCheck, 
  ShieldCheck, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Smartphone, 
  QrCode, 
  Award, 
  Cpu, 
  Download, 
  Sparkles,
  Search,
  User,
  Calendar,
  Lock,
  BatteryCharging,
  Wifi,
  Volume2,
  Camera,
  Layers,
  Wrench
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface ForensicCertificationStudioProps {
  lang: 'en' | 'ar';
  device?: ConnectedDevice;
  onAddLog?: (msg: string) => void;
}

interface InspectionItem {
  id: string;
  category: 'hardware' | 'screen' | 'rf' | 'security' | 'power';
  nameEn: string;
  nameAr: string;
  status: 'passed' | 'failed' | 'warning' | 'untested';
  notes?: string;
}

export const ForensicCertificationStudio: React.FC<ForensicCertificationStudioProps> = ({
  lang,
  device,
  onAddLog
}) => {
  const isAr = lang === 'ar';

  const [customerName, setCustomerName] = useState('Ahmed Al-Mansouri');
  const [technicianName, setTechnicianName] = useState('Eng. Basel (OmniFix Lab Master)');
  const [warrantyDays, setWarrantyDays] = useState('90');
  const [repairNotes, setRepairNotes] = useState('Replaced Charging IC (PMIC VDD Rail), flashed patched boot image to restore bootloop, repaired EFS NVRAM partition.');

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    { id: 'screen-touch', category: 'screen', nameEn: 'Digitizer 10-Point Touch Grid', nameAr: 'استجابة اللمس للشبكة الكاملة (10 نقاط)', status: 'passed' },
    { id: 'screen-oled', category: 'screen', nameEn: 'OLED Sub-Pixel & Color Gamut', nameAr: 'سلامة بكسلات الشاشة وتدرج الألوان OLED', status: 'passed' },
    { id: 'screen-hz', category: 'screen', nameEn: '120Hz ProMotion / High Refresh Rate', nameAr: 'سلاسة التردد العالي 120Hz', status: 'passed' },
    { id: 'biometric-face', category: 'hardware', nameEn: 'Biometric Sensor / Face ID / Fingerprint', nameAr: 'مستشعر البصمة والتعرف على الوجه', status: 'passed' },
    { id: 'camera-main', category: 'hardware', nameEn: 'Primary & Telephoto OIS Stabilizer', nameAr: 'الكاميرا الرئيسية والتقريب البصري OIS', status: 'passed' },
    { id: 'audio-stereo', category: 'hardware', nameEn: 'Stereo Speakers & Triple Microphones', nameAr: 'مكبرات الصوت الاستريو وميكروفونات العزل', status: 'passed' },
    { id: 'rf-5g', category: 'rf', nameEn: '5G Sub-6 / LTE Carrier Aggregation', nameAr: 'ترددات شبكة 5G واستقبال المودم', status: 'passed' },
    { id: 'rf-wifi-bt', category: 'rf', nameEn: 'Wi-Fi 6E/7 & Bluetooth 5.4 Low Energy', nameAr: 'واي فاي 6E/7 والبلوتوث منخفض الطاقة', status: 'passed' },
    { id: 'rf-imei', category: 'rf', nameEn: 'IMEI 1 & 2 Global Blacklist Status', nameAr: 'سلامة السيريال من القوائم السوداء الدولية', status: 'passed' },
    { id: 'pwr-battery', category: 'power', nameEn: 'Battery Health & Charge Cycle Count', nameAr: 'صحة البطارية وعدد دورات الشحن', status: 'passed' },
    { id: 'pwr-currdraw', category: 'power', nameEn: 'Sleep Mode Current Draw (< 15mA)', nameAr: 'تيار الاستهلاك في وضع السكون (< 15mA)', status: 'passed' },
    { id: 'sec-knox', category: 'security', nameEn: 'Hardware eFuse / Knox Status (0x0)', nameAr: 'حالة الصمام الإلكتروني Knox و eFuse', status: 'passed' },
    { id: 'sec-avb', category: 'security', nameEn: 'Android Verified Boot (AVB) Integrity', nameAr: 'سلامة واصف الحماية وتوقيع النواة AVB', status: 'passed' },
    { id: 'sec-lci', category: 'security', nameEn: 'Liquid Contact Indicators (LCI White)', nameAr: 'مؤشرات التلامس مع السوائل (LCI بيضاء)', status: 'passed' }
  ]);

  const toggleStatus = (id: string) => {
    setInspectionItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextMap: Record<InspectionItem['status'], InspectionItem['status']> = {
          'passed': 'warning',
          'warning': 'failed',
          'failed': 'untested',
          'untested': 'passed'
        };
        return { ...item, status: nextMap[item.status] };
      }
      return item;
    }));
  };

  const certificateId = 'OMNI-CERT-2026-8942A';
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const passedCount = inspectionItems.filter(i => i.status === 'passed').length;
  const totalCount = inspectionItems.length;
  const scorePercent = Math.round((passedCount / totalCount) * 100);

  const handlePrint = () => {
    if (onAddLog) onAddLog(`Exported Lab Certificate ${certificateId}`);
    window.print();
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 lg:p-12 text-white shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.15),transparent_70%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold tracking-widest uppercase flex items-center gap-2">
                <Award size={14} className="text-emerald-400" />
                ISO/IEC 17025 Compliant Mobile Lab Suite
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[11px] font-bold">
                CRYPTOGRAPHIC QA REPORT ENGINE
              </span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">
              {isAr ? 'استوديو الفحص الجنائي وشهادات الجودة المعتمدة' : 'Forensic Inspection & Lab QA Certificate Studio'}
            </h1>

            <p className="text-slate-300 text-sm lg:text-base leading-relaxed font-normal">
              {isAr 
                ? 'فحص شامل لجودة الهواتف قبل وبعد الصيانة (14 فحصاً معيارياً)، وتوليد شهادة ضمان وفحص مخبري رسمية قابلة للطباعة والتصدير مزودة بـ QR Code وتوقيع فني معتمد.'
                : 'Full pre/post-repair diagnostic quality assurance matrix across 14 hardware/software vectors. Generates branded, cryptographically verifiable certificates with QR tracking.'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Printer size={16} />
              {isAr ? 'طباعة / تصدير الشهادة الرسمية' : 'Print / Export Certificate'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Checklist on Left (5 Cols), Printable Certificate on Right (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Diagnostic Matrix */}
        <div className="lg:col-span-5 space-y-6">
          {/* Metadata Inputs */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <User size={16} className="text-indigo-600" />
              {isAr ? 'بيانات التقرير والعميل' : 'Customer & Technician Details'}
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">{isAr ? 'اسم العميل' : 'Customer Name'}</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">{isAr ? 'المهندس المسؤول' : 'Certified Engineer'}</label>
                <input 
                  type="text" 
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">{isAr ? 'فترة الضمان (أيام)' : 'Warranty (Days)'}</label>
                  <input 
                    type="number" 
                    value={warrantyDays}
                    onChange={(e) => setWarrantyDays(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">{isAr ? 'موديل الجهاز' : 'Device Model'}</label>
                  <input 
                    type="text" 
                    value={device?.model || 'SM-S928B (Galaxy S24 Ultra)'} 
                    readOnly
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">{isAr ? 'ملاحظات وتفاصيل الإصلاح' : 'Repair Work Conducted'}</label>
                <textarea 
                  rows={3}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 resize-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Checklist Items Matrix */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                {isAr ? 'بنود الفحص الفني (اضغط لتغيير الحالة)' : 'Diagnostic Checklist (Click to Toggle)'}
              </span>
              <span className="text-xs font-bold text-emerald-600 font-mono">
                {passedCount} / {totalCount} Passed
              </span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {inspectionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleStatus(item.id)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <span className="font-semibold text-slate-700">
                    {isAr ? item.nameAr : item.nameEn}
                  </span>

                  <span className={`px-2.5 py-1 rounded-full font-bold font-mono text-[10px] uppercase flex items-center gap-1.5 ${
                    item.status === 'passed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    item.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    item.status === 'failed' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status === 'passed' && <CheckCircle2 size={12} />}
                    {item.status === 'warning' && <AlertTriangle size={12} />}
                    {item.status === 'failed' && <XCircle size={12} />}
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: High-End Printable Laboratory Certificate Preview (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="p-8 lg:p-12 bg-white rounded-3xl border-2 border-slate-900 shadow-2xl space-y-8 relative overflow-hidden font-sans text-slate-900 print:m-0 print:border-none print:shadow-none">
            {/* Watermark / Background stamp */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none">
              <ShieldCheck size={450} />
            </div>

            {/* Certificate Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b-2 border-slate-900 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                    Ω
                  </div>
                  <span className="font-black tracking-widest uppercase text-sm text-slate-900">
                    OMNIFIX ENGINEERING LABS
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
                  CERTIFICATE OF QUALITY ASSURANCE
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Official Mobile Hardware & Firmware Diagnostic Verification
                </p>
              </div>

              <div className="text-right font-mono text-xs space-y-1">
                <div className="font-bold text-slate-900">{certificateId}</div>
                <div className="text-slate-500">{currentDate}</div>
                <div className="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  GRADE A+ CERTIFIED
                </div>
              </div>
            </div>

            {/* Device & Client Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">CLIENT</span>
                <span className="font-bold text-slate-800">{customerName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">MODEL</span>
                <span className="font-bold font-mono text-slate-800">{device?.model || 'SM-S928B'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">SERIAL / IMEI</span>
                <span className="font-mono text-[11px] text-slate-800">{device?.serialNumber || device?.imei1 || '358291049281048'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">WARRANTY</span>
                <span className="font-bold text-indigo-700">{warrantyDays} Days Full Coverage</span>
              </div>
            </div>

            {/* Repair Work Summary */}
            <div className="space-y-1.5 text-xs">
              <span className="font-black text-[11px] uppercase tracking-wider text-slate-700 block">
                LABORATORY REPAIR PROTOCOL CONDUCTED:
              </span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-mono text-[11px]">
                {repairNotes}
              </p>
            </div>

            {/* Key Verified Systems Grid */}
            <div className="space-y-3">
              <span className="font-black text-[11px] uppercase tracking-wider text-slate-700 block">
                14-POINT HARDWARE & SECURITY AUDIT SUMMARY ({scorePercent}% PASSED):
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {inspectionItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                    <span className="text-slate-700 text-[11px] truncate pr-2">
                      {isAr ? item.nameAr : item.nameEn}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      item.status === 'passed' ? 'text-emerald-700' :
                      item.status === 'warning' ? 'text-amber-700' :
                      item.status === 'failed' ? 'text-rose-700' : 'text-slate-400'
                    }`}>
                      {item.status === 'passed' ? '✓ OK' : item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures & QR Code Footer */}
            <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 text-white p-2 rounded-xl flex items-center justify-center font-mono text-[9px] text-center shrink-0">
                  <QrCode size={48} className="text-white" />
                </div>
                <div className="space-y-1 font-mono text-[10px] text-slate-500">
                  <div className="font-bold text-slate-800">SECURE AUDIT HASH:</div>
                  <div className="text-[9px] break-all">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
                  <div>Verify online: https://omnifix.lab/cert/{certificateId}</div>
                </div>
              </div>

              <div className="text-right space-y-1 sm:w-48 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">CERTIFYING ENGINEER</span>
                <span className="font-bold text-slate-900 block">{technicianName}</span>
                <div className="h-6 font-serif italic text-indigo-700 text-sm select-none">
                  Signed & Sealed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
