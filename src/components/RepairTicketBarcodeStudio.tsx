import React, { useState, useEffect } from 'react';
import {
  Printer,
  QrCode,
  FileText,
  Plus,
  Eye,
  Save,
  X,
  RefreshCw,
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { useWorkstation } from '../context/WorkstationContext';
import { QrMatrixSvg } from './QrMatrixSvg';
import { CustomerPortalView } from './CustomerPortalView';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
}

export const RepairTicketBarcodeStudio: React.FC<Props> = ({ device, lang = 'ar' }) => {
  const isAr = lang === 'ar';
  const workstationStationId = 'OMNI-WS-NODE-01';
  const { activeCaseId, setActiveCaseId } = useWorkstation();

  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseToken, setSelectedCaseToken] = useState<string>('case-ip14p-short-4821');
  const [customerName, setCustomerName] = useState('سارة عبد الرحمن');
  const [customerPhone, setCustomerPhone] = useState('+201119876543');
  const [deviceModelStr, setDeviceModelStr] = useState(`${device.brand} ${device.marketName} (${device.model})`);
  const [faultDescription, setFaultDescription] = useState('قصر صريح على خط التغذية الرئيسي VDD_MAIN');
  const [repairAction, setRepairAction] = useState('حقن جهد آمن 1.2V / 2A وعزل المكثف التالف + اختبار الجودة');
  const [cost, setCost] = useState('2400');
  const [currency, setCurrency] = useState('EGP');
  const [warrantyDays, setWarrantyDays] = useState('30');
  const [workflowStage, setWorkflowStage] = useState<string>('diagnosing');
  const [isSaving, setIsSaving] = useState(false);
  const [showPortalPreview, setShowPortalPreview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadCases = async () => {
    try {
      const res = await fetch('/api/cases');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json?.success && Array.isArray(json.cases)) {
        setCases(json.cases);
        const match = json.cases.find((c: any) => c.id === activeCaseId) || json.cases[0];
        if (match) applyCaseToForm(match);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'err',
        text: isAr ? `تعذر تحميل سجل التذاكر: ${err?.message || 'خطأ اتصال'}` : `Failed to load cases: ${err?.message || 'Connection error'}`,
      });
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const syncConnectedDeviceToForm = () => {
    const label = device.marketName.toLowerCase().startsWith(device.brand.toLowerCase())
      ? `${device.marketName} (${device.model})`
      : `${device.brand} ${device.marketName} (${device.model})`;
    setDeviceModelStr(label);
    setStatusMessage({
      type: 'ok',
      text: isAr ? `تم مزامنة الجهاز المتصل: ${label}` : `Synced connected device: ${label}`,
    });
  };

  const applyCaseToForm = (c: any) => {
    setActiveCaseId(c.id);
    setSelectedCaseToken(c.case_token);
    setCustomerName(c.customer_name || '');
    setCustomerPhone(c.customer_phone || '');
    setDeviceModelStr(c.device_model || `${device.brand} ${device.marketName}`);
    setFaultDescription(c.reported_issue || '');
    setRepairAction(c.diagnosis_summary || (isAr ? 'قيد الفحص المخبري متعدد الوسائط' : 'In multimodal diagnostics'));
    setCost(String(c.estimated_cost || 0));
    setWorkflowStage(c.workflow_stage || 'received');
  };

  const handleCreateNewCase = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    const syncedDeviceLabel = deviceModelStr.trim() || `${device.brand} ${device.marketName} (${device.model})`;
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName || 'عميل جديد',
          customer_phone: customerPhone,
          device_model: syncedDeviceLabel,
          serial_imei: device.imei1 || '',
          reported_issue: faultDescription,
          estimated_cost: Number(cost) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success || !json.case) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }
      await loadCases();
      applyCaseToForm(json.case);
      setStatusMessage({
        type: 'ok',
        text: isAr ? `تم إنشاء تذكرة جديدة برمز ${json.case.case_token}` : `Created ticket ${json.case.case_token}`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'err',
        text: isAr ? `فشل إنشاء التذكرة: ${err?.message}` : `Failed creating case: ${err?.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStageUpdate = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/cases/${activeCaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_stage: workflowStage,
          diagnosis_summary: repairAction,
          estimated_cost: Number(cost) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }
      await loadCases();
      setStatusMessage({
        type: 'ok',
        text: isAr ? 'تم حفظ تحديث الحالة بنجاح' : 'Case status saved cleanly',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'err',
        text: isAr ? `فشل حفظ التحديث: ${err?.message}` : `Failed saving update: ${err?.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const portalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?portal=${selectedCaseToken}`
      : `/?portal=${selectedCaseToken}`;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400">
            <QrCode className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">
              {isAr ? 'استوديو تذاكر الصيانة وبوابة QR المباشرة للعملاء' : 'Repair Ticket, Persisted Cases & Customer QR Portal'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'ربط التذكرة بملف الحالة الحقيقي في الخادم وتوليد رمز QR لبوابة متابعة العميل المباشرة'
                : 'Linked to persisted repair cases with verifiable Customer Tracking Portal QR code'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPortalPreview(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{isAr ? 'معاينة بوابة العميل QR' : 'Preview Customer Portal'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isAr ? 'طباعة التذكرة' : 'Print Ticket'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Case Selector & Form */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-teal-400 font-mono uppercase flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{isAr ? 'تحديد أو إنشاء تذكرة حالة' : 'Select or Create Case Ticket'}</span>
            </span>

            {cases.length > 0 && (
              <select
                value={activeCaseId}
                onChange={(e) => {
                  const found = cases.find((c) => c.id === Number(e.target.value));
                  if (found) applyCaseToForm(found);
                }}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-300"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} — {c.case_token} ({c.customer_name})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'رمز التتبع (Token):' : 'Portal Token:'}</label>
              <input
                type="text"
                readOnly
                value={selectedCaseToken}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-cyan-300"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'اسم العميل:' : 'Customer Name:'}</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'رقم الهاتف:' : 'Phone:'}</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'التكلفة التقديرية:' : 'Estimated Cost:'}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-2/3 bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono tabular-nums text-emerald-400 font-bold"
                />
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-1/3 bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-center text-slate-300"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'الشكوى / العطل المبلغ عنه:' : 'Reported Issue:'}</label>
              <input
                type="text"
                value={faultDescription}
                onChange={(e) => setFaultDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'التشخيص والإجراء الهندسي:' : 'Technical Diagnosis & Action:'}</label>
              <input
                type="text"
                value={repairAction}
                onChange={(e) => setRepairAction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-cyan-200"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'مدة الضمان (أيام):' : 'Warranty (Days):'}</label>
              <input
                type="number"
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'مرحلة العمل الحالية:' : 'Workflow Stage:'}</label>
              <select
                value={workflowStage}
                onChange={(e) => setWorkflowStage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              >
                <option value="received">{isAr ? 'تم الاستلام (received)' : 'Received'}</option>
                <option value="diagnosing">{isAr ? 'الفحص المخبري (diagnosing)' : 'Diagnosing'}</option>
                <option value="board_surgery">{isAr ? 'صيانة البوردة (board_surgery)' : 'Board Surgery'}</option>
                <option value="software_flashing">{isAr ? 'التفليش والبرمجة (software_flashing)' : 'Software Flashing'}</option>
                <option value="qa_testing">{isAr ? 'اختبار الجودة (qa_testing)' : 'QA Testing'}</option>
                <option value="ready_for_pickup">{isAr ? 'جاهز للتسليم (ready_for_pickup)' : 'Ready for Pickup'}</option>
              </select>
            </div>
          </div>

          {statusMessage && (
            <div className={`px-3 py-2 rounded-lg text-xs font-mono border ${
              statusMessage.type === 'err'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            }`}>
              {statusMessage.text}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={handleSaveStageUpdate}
              disabled={isSaving}
              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ تحديث الحالة في الخادم' : 'Update Case on Server'}</span>
            </button>
            <button
              onClick={syncConnectedDeviceToForm}
              type="button"
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              title={isAr ? 'مزامنة موديل الهاتف المتصل حالياً إلى التذكرة' : 'Sync active connected phone model into ticket'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? 'مزامنة الهاتف' : 'Sync Device'}</span>
            </button>
            <button
              onClick={handleCreateNewCase}
              disabled={isSaving}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'فتح تذكرة جديدة' : 'Create New Case'}</span>
            </button>
          </div>
        </div>

        {/* Printable Ticket Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 font-sans space-y-4 print:w-full print:max-w-none print:shadow-none print:border-none print:p-0">
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-950">OMNIFIX PRO WORKSTATION</h2>
                <p className="text-[10px] text-slate-500 font-mono">SCIENTIFIC REPAIR TICKET & QR TRACKER</p>
              </div>
              <div className="text-end font-mono">
                <span className="text-xs font-black text-emerald-700 uppercase block">{workflowStage}</span>
                <span className="text-[10px] text-slate-500">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-200">
              <div className="h-8 flex items-center justify-center gap-1 font-mono tracking-widest text-base font-black text-slate-900">
                ||| | |||| || ||| |||| | ||| | ||
              </div>
              <span className="font-mono text-xs tracking-wider text-slate-700 font-bold">{selectedCaseToken}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">{isAr ? 'العميل:' : 'Customer:'}</span>
                <span className="font-bold text-slate-900">{customerName}</span>
                <span className="text-[10px] text-slate-500 font-mono block">{customerPhone}</span>
              </div>
              <div className="text-end">
                <span className="text-[10px] text-slate-500 block font-bold">{isAr ? 'الجهاز:' : 'Device:'}</span>
                <span className="font-bold text-slate-900">{deviceModelStr}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-b border-slate-200 pb-3">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">{isAr ? 'الشكوى:' : 'Issue:'}</span>
                <span className="font-semibold text-slate-800">{faultDescription}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">{isAr ? 'التشخيص / الإجراء المخبري:' : 'Diagnosis / Work:'}</span>
                <span className="font-bold text-teal-700">{repairAction}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">{isAr ? 'فترة الضمان:' : 'Warranty:'}</span>
                <span className="font-bold text-slate-800">{warrantyDays} {isAr ? 'يوم' : 'Days'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 text-xs">{isAr ? 'التكلفة التقديرية / الإجمالي:' : 'Total Amount:'}</span>
              <span className="text-lg font-black text-emerald-700 font-mono tabular-nums">{cost} {currency}</span>
            </div>

            {/* Real Scannable QR Matrix */}
            <div className="pt-2 flex items-center justify-between gap-3 text-[10px] text-slate-600 font-mono border-t border-slate-200">
              <div className="space-y-1 min-w-0">
                <p className="font-bold text-slate-900">{isAr ? 'امسح الكود لمتابعة الصيانة حياً:' : 'Scan QR for Live Repair Status:'}</p>
                <p className="truncate text-slate-500">{portalUrl}</p>
                <p>Station: {workstationStationId}</p>
              </div>
              <QrMatrixSvg value={portalUrl} size={86} className="shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* In-App Customer Portal Preview Modal */}
      {showPortalPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowPortalPreview(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>{isAr ? 'إغلاق المعاينة' : 'Close Preview'}</span>
              </button>
            </div>
            <CustomerPortalView
              token={selectedCaseToken}
              lang={lang}
              onBackToWorkstation={() => setShowPortalPreview(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
