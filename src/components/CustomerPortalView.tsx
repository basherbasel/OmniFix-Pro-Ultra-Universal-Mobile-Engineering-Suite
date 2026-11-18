import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Smartphone,
  ShieldCheck,
  Wrench,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { QrMatrixSvg } from './QrMatrixSvg';

interface PortalEvent {
  id: number;
  event_type: string;
  details: string;
  created_at: string;
}

interface PortalCaseData {
  case_token: string;
  device_model: string;
  reported_issue: string;
  workflow_stage: string;
  diagnosis_summary: string;
  estimated_cost: number;
  received_at: string;
  events: PortalEvent[];
}

interface CustomerPortalViewProps {
  token: string;
  lang?: 'en' | 'ar';
  onBackToWorkstation?: () => void;
}

const STAGES = [
  { id: 'received', ar: 'تم الاستلام', en: 'Received' },
  { id: 'diagnosing', ar: 'الفحص المخبري', en: 'Lab Diagnosis' },
  { id: 'board_surgery', ar: 'صيانة الهاردوير', en: 'Board Repair' },
  { id: 'software_flashing', ar: 'البرمجة والنظام', en: 'Software/Flash' },
  { id: 'qa_testing', ar: 'اختبار الجودة', en: 'QA Testing' },
  { id: 'ready_for_pickup', ar: 'جاهز للتسليم', en: 'Ready' },
];

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  token,
  lang = 'ar',
  onBackToWorkstation,
}) => {
  const isAr = lang === 'ar';
  const [portal, setPortal] = useState<PortalCaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPortal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/portal/${encodeURIComponent(token)}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || (isAr ? 'التذكرة غير موجودة' : 'Ticket not found'));
      } else {
        setPortal(json.portal);
      }
    } catch {
      setError(isAr ? 'تعذر الاتصال بخادم المتابعة' : 'Unable to reach tracking server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortal();
  }, [token]);

  const activeStageIndex = portal
    ? Math.max(0, STAGES.findIndex((s) => s.id === portal.workflow_stage))
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white">
                {isAr ? 'بوابة متابعة صيانة العميل المباشرة' : 'Customer Live Repair Tracking Portal'}
              </h1>
              <p className="text-xs font-mono text-slate-400">Token: {token}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadPortal}
              className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'تحديث' : 'Refresh'}</span>
            </button>
            {onBackToWorkstation && (
              <button
                onClick={onBackToWorkstation}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isAr ? 'العودة لمحطة العمل' : 'Back to Workstation'}</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs font-mono text-slate-400">
            {isAr ? 'جاري تحميل حالة التذكرة من المختبر...' : 'Loading case status from lab...'}
          </div>
        ) : error || !portal ? (
          <div className="p-8 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-bold text-rose-200">{error}</p>
          </div>
        ) : (
          <>
            {/* Device Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              <div className="sm:col-span-9 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-black text-white">{portal.device_model}</h2>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="text-slate-400 font-bold">{isAr ? 'الشكوى المسجلة: ' : 'Reported Issue: '}</span>
                  {portal.reported_issue}
                </p>
                {portal.diagnosis_summary && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-emerald-200">
                    <span className="font-bold text-emerald-400 block mb-0.5">
                      {isAr ? 'النتيجة الهندسية للفحص:' : 'Technical Diagnosis Summary:'}
                    </span>
                    {portal.diagnosis_summary}
                  </div>
                )}
                <div className="flex flex-wrap gap-4 text-xs font-mono tabular-nums pt-1">
                  <div>
                    <span className="text-slate-400">{isAr ? 'التكلفة التقديرية: ' : 'Estimated Cost: '}</span>
                    <span className="text-amber-300 font-black">{portal.estimated_cost} EGP/SAR</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{isAr ? 'تاريخ الاستلام: ' : 'Received: '}</span>
                    <span className="text-slate-200">{new Date(portal.received_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="sm:col-span-3 flex flex-col items-center justify-center">
                <QrMatrixSvg
                  value={typeof window !== 'undefined' ? `${window.location.origin}/?portal=${portal.case_token}` : portal.case_token}
                  size={108}
                />
                <span className="text-[10px] font-mono text-slate-400 mt-1.5">{portal.case_token}</span>
              </div>
            </div>

            {/* Workflow Stepper */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-400" />
                <span>{isAr ? 'مراحل الصيانة المخبرية' : 'Lab Repair Stage Progress'}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {STAGES.map((st, idx) => {
                  const done = idx <= activeStageIndex;
                  const current = idx === activeStageIndex;
                  return (
                    <div
                      key={st.id}
                      className={`p-2.5 rounded-xl border text-center space-y-1 ${
                        current
                          ? 'bg-emerald-600/20 border-emerald-400 text-emerald-200'
                          : done
                          ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-200'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 mx-auto ${done ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span className="text-[11px] font-bold block">{isAr ? st.ar : st.en}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Event Log Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'السجل الزمني للفحوصات والإجراءات' : 'Chronological Lab Event Log'}</span>
              </h3>
              <div className="space-y-2">
                {portal.events.map((ev) => (
                  <div key={ev.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] text-cyan-400 uppercase block">{ev.event_type}</span>
                      <p className="text-slate-200">{ev.details}</p>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0 tabular-nums">
                      {new Date(ev.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
