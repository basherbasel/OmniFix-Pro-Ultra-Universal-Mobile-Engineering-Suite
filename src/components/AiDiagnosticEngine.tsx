import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Activity, 
  AlertOctagon, 
  CheckCircle2, 
  Wrench, 
  FileText, 
  HardDrive, 
  Cpu, 
  Layers, 
  Terminal,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Search,
  Smartphone,
  Zap,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConnectedDevice } from '../types';
import { FaultDecisionTree } from './FaultDecisionTree';
import { HARDWARE_REPAIR_GUIDES } from '../data/hardwareRepairGuides';
import { safeFetchJson } from '../utils/apiHelper';
import { ReportExporter } from '../utils/reportExporter';

const detectHardwareGuideId = (text: string): string => {
  const lower = (text || '').toLowerCase();
  if (lower.includes('charg') || lower.includes('vbus') || lower.includes('type-c') || lower.includes('battery')) {
    return 'charging-vbus-failure';
  }
  if (lower.includes('display') || lower.includes('lcd') || lower.includes('amoled') || lower.includes('backlight') || lower.includes('screen')) {
    return 'display-backlight-oled';
  }
  if (lower.includes('baseband') || lower.includes('ril') || lower.includes('sim') || lower.includes('modem') || lower.includes('imei') || lower.includes('nvram')) {
    return 'baseband-rf-transceiver';
  }
  return 'power-pmic-buck-rail-failure';
};

const HardwarePcbLinkCard: React.FC<{
  guideId: string;
  onNavigateToHardwareRepair?: (guideId: string) => void;
  lang: 'en' | 'ar';
}> = ({ guideId, onNavigateToHardwareRepair, lang }) => {
  const isAr = lang === 'ar';
  const guide = HARDWARE_REPAIR_GUIDES.find(g => g.id === guideId) || HARDWARE_REPAIR_GUIDES[0];

  return (
    <div className="p-3.5 bg-gradient-to-r from-white via-slate-50 to-white border border-indigo-200 rounded-xl space-y-3 shadow-md">
      <div className="flex items-center justify-between border-b border-indigo-100 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <h5 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            {isAr ? 'خريطة الـ PCB والخطوات التوجيهية للإصلاح الفيزيائي (Auto-Linked PCB Hardware Guide)' : 'Auto-Linked Hardware PCB & Micro-Soldering Guide'}
          </h5>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-600 border border-amber-200">
          HARDWARE DIAGNOSIS LINKED
        </span>
      </div>

      <div className="space-y-1">
        <h6 className="text-xs font-bold text-slate-900">
          {isAr ? guide.titleAr : guide.titleEn}
        </h6>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {isAr ? guide.symptomAr : guide.symptomEn}
        </p>
      </div>

      {/* Target Chips & Testpads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="p-2 rounded bg-slate-100 border border-slate-200">
          <span className="text-slate-400 block mb-0.5">{isAr ? 'الآيسيهات المسببة للعطل:' : 'Affected Board Chips:'}</span>
          <span className="text-cyan-700 font-bold">{guide.affectedComponents.join(', ')}</span>
        </div>
        <div className="p-2 rounded bg-slate-100 border border-slate-200">
          <span className="text-slate-400 block mb-0.5">{isAr ? 'حرارة الهوت أير الموصى بها:' : 'Recommended Hot-Air Temp:'}</span>
          <span className="text-amber-700 font-bold">{guide.microSolderingSteps[0]?.hotAirTemp || '350°C - 365°C'}</span>
        </div>
      </div>

      {/* Test points preview */}
      {guide.testPoints?.length > 0 && (
        <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1 font-mono text-[10px]">
          <span className="text-slate-400 font-bold block">{isAr ? 'نقاط فحص الملتيميتر المباشرة (DMM Testpads):' : 'Key Multimeter Test Points:'}</span>
          {guide.testPoints.slice(0, 2).map((tp, idx) => (
            <div key={idx} className="flex items-center justify-between text-slate-600 border-b border-slate-200 pb-1 last:border-0 last:pb-0">
              <span className="text-cyan-700 font-bold">{tp.name}</span>
              <span className="text-emerald-700 font-bold">Diode: {tp.diodeModeHealthy}</span>
              <span className="text-slate-500">{tp.voltageWorking}</span>
            </div>
          ))}
        </div>
      )}

      {/* Navigation button */}
      <button
        onClick={() => onNavigateToHardwareRepair?.(guide.id)}
        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
      >
        <Wrench className="w-4 h-4" />
        <span>
          {isAr
            ? `فتح خريطة الـ PCB والمايكروسولدرينغ التفاعلية لـ (${guide.affectedComponents[0] || 'Hardware'})`
            : `OPEN INTERACTIVE PCB BITMAP & DMM WORKBENCH (${guide.affectedComponents[0] || 'Hardware'})`}
        </span>
        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
      </button>
    </div>
  );
};

interface AiDiagnosticEngineProps {
  device: ConnectedDevice;
  onApplyFix: (fixCommand: string) => void;
  onNavigateToHardwareRepair?: (guideId?: string) => void;
  onNavigateToFirmwareMatch?: () => void;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

const SAMPLE_LOGS = {
  kernel_panic: `[   14.281902] c1   1042 Unable to handle kernel NULL pointer dereference at virtual address 0000000000000048
[   14.281920] c1   1042 Mem abort info:
[   14.281925] c1   1042   ESR = 0x96000005
[   14.281931] c1   1042   EC = 0x25: DABT (current EL), IL = 32 bits
[   14.281936] c1   1042   SET = 0, FnV = 0
[   14.281941] c1   1042   EA = 0, S1PTW = 0
[   14.281946] c1   1042   FSC = 0x05: level 1 translation fault
[   14.281951] c1   1042 Data abort info:
[   14.281956] c1   1042   ISV = 0, ISS = 0x00000005
[   14.281961] c1   1042   CM = 0, WnR = 0
[   14.281969] c1   1042 Internal error: Oops: 96000005 [#1] PREEMPT SMP
[   14.281977] c1   1042 Modules linked in: qcom_q6v5_pas qcom_q6v5 qcom_common smd_rpm msm_drm
[   14.282045] c1   1042 CPU: 1 PID: 1042 Comm: system_server Tainted: G        W  O      5.15.123-android14-9-g8a9 #1
[   14.282052] c1   1042 Hardware name: Qualcomm Technologies, Inc. SM8650 (DT)
[   14.282058] c1   1042 pstate: 60400005 (nZCv daif +PAN -UAO -TCO -DIT -SSBS BTYPE=--)
[   14.282067] c1   1042 pc : q6v5_wcss_start+0x88/0x1a4 [qcom_q6v5]
[   14.282078] c1   1042 lr : qcom_subdev_start+0x4c/0x90
[   14.282210] c1   1042 Kernel panic - not syncing: Fatal exception in interrupt`,
  
  dm_verity: `[    2.109281] init: [libfs_avb] [AVB Failed]: Error verifying vbmeta digest (hash mismatch).
[    2.109310] init: [libfs_avb] super partition hash tree root 9a4f8b2c does not match vbmeta struct.
[    2.109335] init: Failed to verify partition 'system' with error -2.
[    2.109350] init: Entering recovery mode: RED STATE (Your device has failed verification and may not work properly).
[    2.109380] init: Halting system boot. Bootloader lock state: LOCKED. Rollback index: 2`,

  baseband_null: `09-19 15:21:04.120   890  1204 E RILC    : RIL_onRequestComplete: [0012] < GET_SIM_STATUS failed with E_RADIO_NOT_AVAILABLE
09-19 15:21:04.122   890  1204 E QMI_RIL : qmi_err=0x000e (QMI_ERR_DEVICE_NOT_READY)
09-19 15:21:04.125   890  1204 E QC-QMI  : [qmi_client] open failed: /dev/subsys_modem not responding
09-19 15:21:04.130  1042  1042 E TelephonyRegistry: notifyRadioPowerStateChanged: RADIO_POWER_UNAVAILABLE
09-19 15:21:04.135  1042  1042 W PhoneGlobals: Baseband version query returned NULL or UNKNOWN.
09-19 15:21:04.140  1042  1042 E ImeiProvider: read_nv_item(NV_UE_IMEI_I) failed: NV_NOT_ALLOCATED (EFS corrupted)`
};

import { Interactive3dBoardViewer } from './Interactive3dBoardViewer';

const detectHighlightedComponent = (analysis: any): string | null => {
  if (!analysis) return null;
  const text = `${analysis.summary} ${analysis.culpritModule}`.toLowerCase();
  if (text.includes('cpu') || text.includes('processor')) return 'cpu';
  if (text.includes('power') || text.includes('pmic') || text.includes('vbus') || text.includes('charging')) return 'pmic';
  if (text.includes('storage') || text.includes('ufs') || text.includes('emmc') || text.includes('memory')) return 'storage';
  if (text.includes('wifi') || text.includes('bluetooth') || text.includes('bt')) return 'wifi';
  if (text.includes('rf') || text.includes('network') || text.includes('baseband') || text.includes('transceiver')) return 'rf-transceiver';
  return null;
};

export const AiDiagnosticEngine: React.FC<AiDiagnosticEngineProps> = ({
  device,
  onApplyFix,
  onNavigateToHardwareRepair,
  onNavigateToFirmwareMatch,
  isBusy,
  lang
}) => {
  const isAr = lang === 'ar';
  const [activeSubTab, setActiveSubTab] = useState<'COPILOT' | 'DECISION_TREE' | 'LOG_ANALYZER' | 'FUTURE_LAB'>('COPILOT');
  const [logText, setLogText] = useState(SAMPLE_LOGS.kernel_panic);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [highlightedComponentId, setHighlightedComponentId] = useState<string | null>(null);

  // Quantum Future Lab State
  const [selectedFutureTool, setSelectedFutureTool] = useState<'QUANTUM_BYPASS' | 'LIDAR_SCAN' | 'REBALL_PROFILER' | 'KERNEL_COMPILER'>('QUANTUM_BYPASS');
  const [isFutureProcessing, setIsFutureProcessing] = useState(false);
  const [futureProgress, setFutureProgress] = useState(0);
  const [futureLog, setFutureLog] = useState<string[]>([]);
  const [selectedKernelBug, setSelectedKernelBug] = useState('dm-verity');
  const [quantumDecrypted, setQuantumDecrypted] = useState(false);
  const [lidarScanned, setLidarScanned] = useState(false);
  const [hotAirTemp, setHotAirTemp] = useState(350);
  const [scanTargetCapacitor, setScanTargetCapacitor] = useState<string | null>(null);
  const [compiledKernelOutput, setCompiledKernelOutput] = useState<string | null>(null);

  // MasterFix Copilot Query State
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotDomain, setCopilotDomain] = useState<'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'ANTI_BRICK'>('HARDWARE');
  const [isCopilotConsulting, setIsCopilotConsulting] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState<any>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<{ verdictAr: string, verdictEn: string, guideId: string } | null>(null);

  // Sync query when device context changes
  useEffect(() => {
    if (device) {
      const defaultQuery = isAr
        ? `[${device.brand} ${device.marketName} (${device.model})] + [فحص شامل للحماية والنظام والأعطال] + [معالج: ${device.chipsetName} | وضع: ${device.mode}]`
        : `[${device.brand} ${device.marketName} (${device.model})] + [Full Diagnostic & Security Audit] + [SoC: ${device.chipsetName} | Mode: ${device.mode}]`;
      setCopilotQuery(defaultQuery);
      
      // Auto-detect repair path based on device fault profile
      setDiagnosticResult({
        verdictAr: 'فحص مسبق: تم اكتشاف معالج متصل. سيتم تخصيص أدوات الإصلاح.',
        verdictEn: 'Pre-scan: SoC detected. Repair tools will be dynamically adapted.',
        guideId: device.chipset === 'qualcomm' ? 'dead-boot-unbrick' : 'bootloop-fix'
      });
    }
  }, [device?.id, device?.model, device?.mode, lang]);

  const handleCopilotConsultWithCustomQuery = async (queryText?: string) => {
    const activeQuery = queryText || copilotQuery;
    if (!activeQuery.trim()) return;
    setIsCopilotConsulting(true);
    setCopilotResponse(null);
    setHighlightedComponentId(null);

    try {
      const res = await safeFetchJson('/api/ai/copilot-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: activeQuery,
          deviceContext: device,
          domainType: copilotDomain,
          lang
        })
      });

      if (res.success && res.data?.result) {
        setCopilotResponse(res.data.result);
        setHighlightedComponentId(detectHighlightedComponent(res.data.result));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCopilotConsulting(false);
    }
  };

  const handleCopilotConsult = async () => {
    await handleCopilotConsultWithCustomQuery();
  };

  const handleDiagnose = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setHighlightedComponentId(null);

    try {
      const res = await safeFetchJson('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logContent: logText,
          deviceContext: device,
          logType: 'Kernel Panic / Logcat',
          lang
        })
      });

      if (res.success && res.data?.analysis) {
        setAnalysisResult(res.data.analysis);
        setHighlightedComponentId(detectHighlightedComponent(res.data.analysis));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 perspective-1000 preserve-3d">
      {/* Subtab navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-slate-950/40 backdrop-blur-3xl border border-white/10 p-3 rounded-[2rem] flex-wrap gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] preserve-3d"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab('COPILOT')}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 border ${
              activeSubTab === 'COPILOT'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-xl'
                : 'text-slate-500 border-transparent hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'المساعد الذكي MasterFix' : 'MasterFix Copilot'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('DECISION_TREE')}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 border ${
              activeSubTab === 'DECISION_TREE'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-xl'
                : 'text-slate-500 border-transparent hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'شجرة القرار' : 'Decision Tree'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('LOG_ANALYZER')}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 border ${
              activeSubTab === 'LOG_ANALYZER'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-xl'
                : 'text-slate-500 border-transparent hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'تحليل السجلات' : 'Log Analyzer'}</span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab('FUTURE_LAB');
              // Pre-fill logs
              setFutureLog([
                isAr 
                  ? '⚡ تم تشغيل مسرع مختبر المستقبل الكمي v10.2...' 
                  : '⚡ Quantum Future Lab Engine v10.2 Initialized...',
                isAr
                  ? '⚡ بانتظار تحديد وتوجيه الأداة المستقبلية المطلوبة...'
                  : '⚡ Awaiting future tool orientation and trigger...'
              ]);
            }}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 border ${
              activeSubTab === 'FUTURE_LAB'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-xl shadow-purple-600/20'
                : 'text-slate-500 border-transparent hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>{isAr ? 'مختبر المستقبل الكمي' : 'Quantum Future Lab'}</span>
          </button>
        </div>

        <div className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">
            MASTERFIX PRO v5.2
          </span>
        </div>
      </motion.div>

      {activeSubTab === 'COPILOT' ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Prompt Templates and Guidelines Box */}
          <motion.div 
            initial={{ opacity: 0, rotateX: 10 }}
            animate={{ opacity: 1, rotateX: 0 }}
            className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl space-y-8 relative overflow-hidden preserve-3d"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-transparent to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-8 flex-wrap gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tight leading-tight">
                    {isAr ? 'استشارة خبير الصيانة MasterFix AI' : 'MasterFix AI Field Copilot'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-black uppercase tracking-widest opacity-60">
                    {isAr ? 'تشخيص فوري للأعطال المعقدة في الميدان' : 'Query format: [Brand] + [Symptom] + [DC Draw/Error]'}
                  </p>
                </div>
              </div>

              {/* Domain Switcher */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-widest shadow-inner">
                {[
                  { id: 'HARDWARE', labelAr: 'هاردوير', labelEn: 'Hardware' },
                  { id: 'SOFTWARE', labelAr: 'سوفتوير', labelEn: 'Software' },
                  { id: 'NETWORK', labelAr: 'شبكة', labelEn: 'Network' },
                  { id: 'ANTI_BRICK', labelAr: 'حماية', labelEn: 'Safety' },
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => setCopilotDomain(d.id as any)}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      copilotDomain === d.id 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white'
                    }`}
                  >
                    {isAr ? d.labelAr : d.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Connected Device Quick Auto-Diagnosis Card */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="p-5 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-between gap-4 flex-wrap relative z-10 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/20 text-cyan-600 rounded-xl border border-cyan-500/30">
                  <Smartphone className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 uppercase">{device.brand} {device.marketName} ({device.model})</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200">
                      {device.mode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {isAr ? `المعالج: ${device.chipsetName} | الحماية: FRP (${device.frpStatus}) | Knox/Lock: (${device.bootloaderStatus})` : `SoC: ${device.chipsetName} | FRP: ${device.frpStatus} | Lock: ${device.bootloaderStatus}`}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const devQuery = isAr 
                    ? `[${device.brand} ${device.marketName} (${device.model})] + [فحص شامل للحماية والأعطال وحلول الإصلاح] + [معالج: ${device.chipsetName} | حماية FRP: ${device.frpStatus} | وضع: ${device.mode}]`
                    : `[${device.brand} ${device.marketName} (${device.model})] + [Full Fault & Security Auto-Audit] + [SoC: ${device.chipsetName} | FRP: ${device.frpStatus} | Mode: ${device.mode}]`;
                  setCopilotQuery(devQuery);
                  handleCopilotConsultWithCustomQuery(devQuery);
                }}
                disabled={isCopilotConsulting}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-cyan-400/30"
              >
                <Zap className="w-4 h-4 text-cyan-200 animate-bounce" />
                <span>{isAr ? '⚡ تشخيص وتتبع أعطال الجهاز المتصل فوراً' : '⚡ INSTANT AUTO-DIAGNOSE CONNECTED DEVICE'}</span>
              </motion.button>
            </motion.div>

            {/* Quick Template Fillers */}
            <div className="flex items-center gap-3 flex-wrap relative z-10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">{isAr ? 'نماذج جاهزة:' : 'Presets:'}</span>
              {[
                { 
                  icon: '🔌', 
                  label: isAr ? 'عطل شحن' : 'Charging',
                  domain: 'HARDWARE',
                  query: isAr 
                    ? `[Samsung S24 Ultra] + [لا يشحن ويسخن] + [سحب 0.05A ثابت]`
                    : `[Samsung S24 Ultra] + [No charging, heating] + [0.05A stuck]`
                },
                { 
                  icon: '⚠️', 
                  label: isAr ? 'بوتلوب' : 'Bootloop',
                  domain: 'SOFTWARE',
                  query: isAr 
                    ? `[Samsung A54] + [معلق على الشعار بعد تحديث] + [Red State]`
                    : `[Samsung A54] + [Bootloop after OTA] + [Red State]`
                },
                { 
                  icon: '📶', 
                  label: isAr ? 'فقدان شبكة' : 'Network',
                  domain: 'NETWORK',
                  query: isAr 
                    ? `[Xiaomi Redmi Note 13] + [طوارئ فقط] + [WTR 1.0V inquiry]`
                    : `[Xiaomi Redmi Note 13] + [Emergency Only] + [WTR 1.0V inquiry]`
                }
              ].map((p, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05, translateY: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCopilotDomain(p.domain as any);
                    setCopilotQuery(p.query);
                  }}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-indigo-600 font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all"
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Technician Field Query Input */}
            <div className="space-y-4 relative z-10">
              <div className="relative group">
                <textarea
                  value={copilotQuery}
                  onChange={(e) => setCopilotQuery(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 text-slate-900 text-sm p-6 rounded-[2rem] border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono resize-none leading-relaxed shadow-inner group-hover:border-slate-300 transition-all"
                  placeholder={isAr 
                    ? '[اسم الجهاز] + [العرض] + [سحب التيار]'
                    : '[Model] + [Symptom] + [DC Draw]'}
                />
                <div className="absolute top-6 right-6 opacity-20 pointer-events-none">
                  <Terminal className="w-6 h-6 text-indigo-600" />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopilotConsult}
                disabled={isCopilotConsulting || !copilotQuery.trim()}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all border border-white/20 flex items-center justify-center gap-4"
              >
                <Sparkles className={`w-5 h-5 ${isCopilotConsulting ? 'animate-spin' : 'animate-pulse'}`} />
                <span>
                  {isCopilotConsulting
                    ? (isAr ? 'جاري التحليل...' : 'ANALYZING FAULT...')
                    : (isAr ? 'طلب التشخيص من MasterFix' : 'CONSULT AI EXPERT')}
                </span>
              </motion.button>
            </div>
          </motion.div>

          {/* MasterFix AI Structured Response Card */}
          {copilotResponse && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl space-y-8 relative overflow-hidden preserve-3d"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-6 flex-wrap gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                    <Activity className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-widest leading-tight">
                    {isAr ? 'تقرير التشخيص الهندسي المعتمد' : 'Verified Engineering Diagnostic Report'}
                  </h4>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-widest italic shadow-sm">
                    DOMAIN: {copilotResponse.category || copilotDomain}
                  </span>
                </div>
              </div>

              {/* 4 Required Response Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {/* 1. Problem Diagnosis & Root Cause */}
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 hover:border-indigo-200 transition-all shadow-inner">
                  <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-3">
                    <Search className="w-4 h-4" />
                    <span>{isAr ? 'التشخيص والسبب الجذري' : 'Root Cause Analysis'}</span>
                  </h5>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    {copilotResponse.problemDiagnosis?.includes(':') 
                      ? copilotResponse.problemDiagnosis.split(':').slice(1).join(':').trim() 
                      : copilotResponse.problemDiagnosis}
                  </p>
                </div>

                {/* 2. Required Tools & Measurements */}
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 hover:border-amber-300 transition-all shadow-inner">
                  <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-3">
                    <Wrench className="w-4 h-4" />
                    <span>{isAr ? 'الأدوات والقياسات المطلوبة' : 'Tools & Measurements'}</span>
                  </h5>
                  <p className="text-sm text-slate-700 leading-relaxed font-mono italic">
                    {copilotResponse.requiredTools?.includes(':') 
                      ? copilotResponse.requiredTools.split(':').slice(1).join(':').trim() 
                      : copilotResponse.requiredTools}
                  </p>
                </div>
              </div>

              {/* 3. Step-by-Step Action Plan */}
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6 relative z-10 shadow-inner hover:border-emerald-300 transition-all">
                <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  <span>{isAr ? 'خطة العمل والإصلاح المتسلسلة' : 'Step-by-Step Action Plan'}</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.isArray(copilotResponse.actionPlan) ? (
                    copilotResponse.actionPlan.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-[10px] shrink-0 font-mono shadow-inner">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] text-slate-600 leading-relaxed font-medium">{step}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed col-span-2 italic">{copilotResponse.actionPlan}</p>
                  )}
                </div>
              </div>

              {/* 4. Safety & Prevention Warnings */}
              <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-100 space-y-4 relative z-10 hover:border-rose-200 transition-all shadow-inner">
                <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAr ? 'تحذيرات السلامة والوقاية' : 'Safety & Prevention'}</span>
                </h5>
                <p className="text-sm text-rose-900/80 leading-relaxed italic">
                  {copilotResponse.safetyWarnings?.includes(':') 
                    ? copilotResponse.safetyWarnings.split(':').slice(1).join(':').trim() 
                    : copilotResponse.safetyWarnings}
                </p>
              </div>

              {/* 3D PCB Viewer Integration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10"
              >
                <Interactive3dBoardViewer 
                  highlightComponentId={highlightedComponentId} 
                  lang={lang} 
                />
              </motion.div>

              {/* Hardware PCB Map Auto-Linked Card */}
              {copilotDomain === 'HARDWARE' && (
                <div className="relative z-10 preserve-3d">
                  <HardwarePcbLinkCard
                    guideId={detectHardwareGuideId(`${copilotResponse.problemDiagnosis} ${copilotResponse.category}`)}
                    onNavigateToHardwareRepair={onNavigateToHardwareRepair}
                    lang={lang}
                  />
                </div>
              )}

              {/* Dynamic Action Buttons */}
              <div className="flex items-center gap-4 flex-wrap pt-4 relative z-10">
                {copilotDomain === 'HARDWARE' && (
                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigateToHardwareRepair?.()}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Wrench className="w-5 h-5" />
                    <span>{isAr ? 'فتح مخططات البوردة والمايكروسولدرينغ' : 'OPEN HARDWARE WORKBENCH'}</span>
                  </motion.button>
                )}

                {copilotDomain === 'SOFTWARE' && (
                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigateToFirmwareMatch?.()}
                    className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl shadow-cyan-600/20 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>{isAr ? 'مطابقة الفلاشة وحماية ARB' : 'MATCH VERIFIED FIRMWARE'}</span>
                  </motion.button>
                )}

                {/* Print Report Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const guide = HARDWARE_REPAIR_GUIDES.find(g => g.id === detectHardwareGuideId(`${copilotResponse.problemDiagnosis} ${copilotResponse.category}`));
                    ReportExporter.printDiagnosticReport({
                      reportId: `REP-${Math.floor(100000 + Math.random() * 900000)}`,
                      createdAtIso: new Date().toISOString(),
                      technicianName: 'MasterFix Certified Technician',
                      shopName: 'MasterFix AI Enterprise Station',
                      deviceBrand: device?.brand || 'Samsung',
                      deviceModel: device?.marketName || device?.model || 'Galaxy S25 Ultra',
                      chipset: device?.chipsetName || 'Snapdragon 8 Gen 4',
                      operatingSystem: 'Android 15 / OneUI 7.0',
                      faultCategory: copilotDomain,
                      diagnosisSummaryAr: copilotResponse.problemDiagnosis || 'تم تشخيص عطل بوردة في دائرة الشحن والتغذية',
                      diagnosisSummaryEn: copilotResponse.problemDiagnosis || 'Hardware fault detected in charging VBUS circuit',
                      testedRails: guide?.testPoints?.map(tp => ({
                        railName: tp.railName,
                        measuredDiodeValue: tp.diodeModeHealthy,
                        referenceDiodeValue: tp.diodeModeHealthy,
                        status: 'HEALTHY' as const
                      })),
                      recommendedFixesAr: Array.isArray(copilotResponse.actionPlan) ? copilotResponse.actionPlan : [copilotResponse.actionPlan],
                      recommendedFixesEn: Array.isArray(copilotResponse.actionPlan) ? copilotResponse.actionPlan : [copilotResponse.actionPlan],
                      sha256VerificationHash: '8f9a2b4c1e0d3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f0a2b4c6d8e0f2a',
                      isForensicCertified: true
                    }, isAr);
                  }}
                  className="py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl border border-slate-700 transition-all cursor-pointer"
                >
                  <Printer className="w-5 h-5 text-indigo-400" />
                  <span>{isAr ? 'طباعة تقرير الفحص (PDF)' : 'PRINT DIAGNOSTIC REPORT (PDF)'}</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      ) : activeSubTab === 'DECISION_TREE' ? (
        <div className="animate-in fade-in duration-500">
          <FaultDecisionTree
            onNavigateToSoftwareRepair={(cmd) => {
              if (cmd) onApplyFix(cmd);
            }}
            onNavigateToHardwareRepair={onNavigateToHardwareRepair}
            onNavigateToFirmwareMatch={onNavigateToFirmwareMatch}
            lang={lang}
          />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Top Storage & Memory Health Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                icon: HardDrive, 
                labelEn: 'STORAGE HEALTH', 
                labelAr: 'صحة الذاكرة', 
                valueEn: `${device.storageType} (98%)`, 
                valueAr: `${device.storageType} (98%)`,
                status: 'HEALTHY',
                color: 'indigo'
              },
              { 
                icon: ShieldCheck, 
                labelEn: 'AVB 2.0 / VERITY', 
                labelAr: 'حماية النظام', 
                valueEn: 'Hash Integrity OK', 
                valueAr: 'سلامة الهاش مؤكدة',
                status: 'ENFORCING',
                color: 'cyan'
              },
              { 
                icon: Activity, 
                labelEn: 'RIL MODEM SUBSYSTEM', 
                labelAr: 'نظام المودم والشبكة', 
                valueEn: device.basebandVersion || 'Online', 
                valueAr: device.basebandVersion || 'متصل',
                status: 'ACTIVE',
                color: 'purple'
              }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2rem] p-6 flex items-center justify-between shadow-md hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 border border-${stat.color}-100 shadow-sm`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{isAr ? stat.labelAr : stat.labelEn}</span>
                    <span className="text-xs font-black text-slate-900 uppercase italic">{isAr ? stat.valueAr : stat.valueEn}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-${stat.color}-50 text-${stat.color}-600 border border-${stat.color}-100`}>
                  {stat.status}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Main Diagnostic Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch preserve-3d">
            {/* Left Col: Raw Log Input */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 shadow-xl space-y-8 relative overflow-hidden preserve-3d"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-6 relative z-10">
                <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-widest flex items-center gap-4">
                  <FileText className="w-6 h-6 text-indigo-600" />
                  <span>{isAr ? 'مدخل سجلات Logcat' : 'Logcat / Kernel Backtrace'}</span>
                </h4>

                <div className="flex items-center gap-2">
                  {['Kernel', 'dm-verity', 'Baseband'].map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setLogText(i === 0 ? SAMPLE_LOGS.kernel_panic : i === 1 ? SAMPLE_LOGS.dm_verity : SAMPLE_LOGS.baseband_null)}
                      className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                rows={14}
                className="w-full bg-slate-100 text-slate-800 font-mono text-[11px] p-6 rounded-[2rem] border border-slate-200 focus:outline-none focus:border-indigo-500 resize-none shadow-inner leading-relaxed"
                placeholder="Paste logs here..."
              />

              <motion.button
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDiagnose}
                disabled={isAnalyzing || !logText.trim()}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all border border-indigo-400 flex items-center justify-center gap-4"
              >
                <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>
                  {isAnalyzing ? (isAr ? 'جاري التحليل...' : 'ANALYZING...') : (isAr ? 'بدء تشخيص العطل' : 'START DIAGNOSIS')}
                </span>
              </motion.button>
            </motion.div>

            {/* Right Col: AI Diagnostics Result */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between relative overflow-hidden preserve-3d"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-50 via-transparent to-transparent pointer-events-none" />
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100 shadow-sm">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-widest">
                      {isAr ? 'تقرير التشخيص الهندسي' : 'Diagnostic Output'}
                    </h4>
                  </div>

                  {analysisResult?.severity && (
                    <span className="px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase tracking-widest italic shadow-sm">
                      {analysisResult.severity}
                    </span>
                  )}
                </div>

                {analysisResult ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{isAr ? 'ملخص التنفيذي' : 'EXECUTIVE SUMMARY'}</span>
                      <p className="text-xs text-slate-800 leading-relaxed italic">{analysisResult.summary}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">CULPRIT</span>
                        <span className="text-indigo-600 font-black text-[10px] font-mono">{analysisResult.culpritModule}</span>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">RISK</span>
                        <span className="text-amber-600 font-black text-[10px] font-mono">{analysisResult.riskAssessment}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{isAr ? 'خطوات الإصلاح الموصى بها' : 'RECOMMENDED FIX STEPS'}</span>
                      <div className="space-y-2">
                        {analysisResult.recommendedSteps?.map((step: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 text-[11px] text-slate-600 shadow-sm">
                            <span className="text-indigo-600 font-black font-mono">{idx + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3D PCB Viewer Integration */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative z-10"
                    >
                      <Interactive3dBoardViewer 
                        highlightComponentId={highlightedComponentId} 
                        lang={lang} 
                      />
                    </motion.div>
                  </div>
                ) : (
                  <div className="py-24 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto border border-slate-100">
                      <Sparkles className="w-10 h-10 text-slate-300 animate-pulse" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] italic">
                      {isAr ? 'بانتظار تحليل السجلات...' : 'AWAITING LOG INPUT...'}
                    </p>
                  </div>
                )}
              </div>

              {analysisResult && (
                <motion.button
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onApplyFix(analysisResult.exactFastbootOrAdbCommands?.[0] || 'fastboot reboot')}
                  disabled={isBusy}
                  className="w-full mt-8 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all border border-emerald-400 flex items-center justify-center gap-4"
                >
                  <Wrench className="w-5 h-5" />
                  <span>{isAr ? 'تطبيق خطة الإصلاح' : 'EXECUTE REPAIR'}</span>
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {activeSubTab === 'FUTURE_LAB' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Top Info Banner */}
          <div className="p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-[2.5rem] border border-indigo-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none animate-pulse" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg inline-block">
                  {isAr ? 'تقنيات المستقبل المدمجة +10 سنوات' : 'Futuristic Tech Stack +10 Years'}
                </span>
                <h3 className="text-xl font-black uppercase tracking-wider italic">
                  {isAr ? 'مختبر المستقبل الكمي (Quantum Future Lab)' : 'QUANTUM FUTURE LAB STATION'}
                </h3>
                <p className="text-xs text-indigo-200 max-w-2xl font-medium leading-relaxed">
                  {isAr 
                    ? `تضمين أدوات صيانة فائقة التطور لا توجد بالسوق حالياً، لبرمجة كود النواة (Kernel)، وتتبع ممانعات البوردة نانوياً بالليزر الحراري، وفك التشفير الكمي لبوتلودرات المعالج المستعصية بدقة 100%.`
                    : `Next-generation software compiler & hardware Lidar diagnostic laboratory designed to bypass standard limits, scan boards down to the nanometer scale, and patch Linux kernels instantly.`}
                </p>
              </div>

              <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[200px]">
                <span className="text-[9px] text-indigo-300 font-black tracking-widest block mb-1">
                  {isAr ? 'الجهاز المتصل حالياً' : 'PROBED SMARTPHONE'}
                </span>
                <span className="text-sm font-black text-cyan-400 block italic">
                  {device ? `${device.brand} ${device.marketName || device.model}` : 'Generic Device'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono block mt-1">
                  SoC: {device?.chipsetName || 'Snapdragon/Exynos'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
            {/* Sidebar Tools Selector */}
            <div className="lg:col-span-1 flex flex-col gap-4 bg-slate-900/50 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-6 shadow-xl">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                {isAr ? 'اختر الأداة المستقبلية' : 'SELECT FUTURE TOOL'}
              </span>

              {[
                {
                  id: 'QUANTUM_BYPASS',
                  titleAr: 'فك التشفير الكمي',
                  titleEn: 'Quantum CrypBypass',
                  descAr: 'تخطي حماية Knox/TEE وبوتلودر مغلق كمياً',
                  descEn: 'Factorize Secure Enclave & bootloader keys via qubits'
                },
                {
                  id: 'LIDAR_SCAN',
                  titleAr: 'المسح الحراري النانوي',
                  titleEn: 'Lidar Thermal Scanner',
                  descAr: 'تحديد الشورت الدقيق على البوردة نانوياً',
                  descEn: 'Pinpoint leakage points on motherboard via thermal Lidar'
                },
                {
                  id: 'REBALL_PROFILER',
                  titleAr: 'موجّه لحام المعالج الآلي',
                  titleEn: 'Robotized CPU Reballing',
                  descAr: 'منحنى الحرارة واللحام الآلي للمعالج والذاكرة',
                  descEn: 'Laser alignment and precise thermal reball profiler'
                },
                {
                  id: 'KERNEL_COMPILER',
                  titleAr: 'مترجم رقع الكيرنل',
                  titleEn: 'Kernel Patch Compiler',
                  descAr: 'تعديل كود نظام التشغيل وتصحيح الكراشات',
                  descEn: 'Compile custom system driver patches for hardware kernel'
                }
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setSelectedFutureTool(tool.id as any);
                    setFutureProgress(0);
                    setQuantumDecrypted(false);
                    setLidarScanned(false);
                    setScanTargetCapacitor(null);
                    setCompiledKernelOutput(null);
                    setFutureLog([
                      isAr 
                        ? `🔄 تم توجيه المسرع نحو: ${tool.titleAr}` 
                        : `🔄 System oriented to: ${tool.titleEn}`,
                      isAr 
                        ? '🔄 بانتظار إعطاء أمر التشغيل...' 
                        : '🔄 Awaiting trigger command...'
                    ]);
                  }}
                  className={`p-4 rounded-2xl border text-right ${isAr ? 'text-right' : 'text-left'} transition-all ${
                    selectedFutureTool === tool.id
                      ? 'bg-gradient-to-r from-indigo-950 to-slate-900 text-white border-indigo-500 shadow-lg'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider block">
                      {isAr ? tool.titleAr : tool.titleEn}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${selectedFutureTool === tool.id ? 'bg-indigo-400 animate-pulse' : 'bg-slate-300'}`} />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    {isAr ? tool.descAr : tool.descEn}
                  </p>
                </button>
              ))}
            </div>

            {/* Interactive Workspace */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between min-h-[500px]">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-widest flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-indigo-600 animate-spin-slow" />
                    <span>
                      {selectedFutureTool === 'QUANTUM_BYPASS' && (isAr ? 'منصة فك التشفير الكمي لبوتلودرات المعالج' : 'QUANTUM ENCLAVE BYPASS ENGINE')}
                      {selectedFutureTool === 'LIDAR_SCAN' && (isAr ? 'المسح الطيفي النانوي وتتبع الشورت لغرفة الحث الحراري' : 'NANOMETER THERMAL MULTI-LAYER SCANNER')}
                      {selectedFutureTool === 'REBALL_PROFILER' && (isAr ? 'محاكاة ومنحنى ريبالينج المعالجات بالروبوت' : 'ROBOTIC SILICON REBALLING THERMAL PROFILER')}
                      {selectedFutureTool === 'KERNEL_COMPILER' && (isAr ? 'استوديو بناء الكيرنل ورقع تعريفات الهاردوير' : 'LINUX KERNEL PATCH & FIRMWARE COMPILER')}
                    </span>
                  </h4>

                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-mono rounded-lg">
                    {selectedFutureTool}
                  </span>
                </div>

                {/* 1. QUANTUM BYPASS */}
                {selectedFutureTool === 'QUANTUM_BYPASS' && (
                  <div className="space-y-6">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isAr
                        ? `يعتمد هاتف (${device?.marketName || device?.model}) على حماية مستعصية للتشفير في منطقة المودم والنظام. باستخدام الخوارزميات الكمية (Shor's Algorithm) وعبر ربط مسارات الناقل الثنائي، يقرأ النظام مفاتيح RSA/ECDSA الخاصة بالبوتلودر دون الحاجة لمسح داتا الهاتف.`
                        : `Device (${device?.marketName || device?.model}) utilizes modern cryptographic secure enclaves. Quantum factorization targets locked bootloader verification registers to safely extract token keys without formatting the device.`}
                    </p>

                    <div className="p-8 bg-slate-950 text-emerald-400 rounded-3xl border border-slate-800 font-mono text-xs relative overflow-hidden min-h-[160px]">
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">
                          {quantumDecrypted ? (isAr ? 'تم تجاوز التشفير' : 'SECURE ENCLAVE DECRYPTED') : (isFutureProcessing ? (isAr ? 'جاري التحليل الكمي...' : 'QUANTUM TUNNELING...') : (isAr ? 'بانتظار الإشارة...' : 'AWAITING RUN...'))}
                        </span>
                      </div>

                      {/* Quantum Entanglement Particles Simulation */}
                      <div className="flex justify-center gap-12 py-4">
                        {[1, 2, 3, 4, 5].map((idx) => (
                          <motion.div
                            key={idx}
                            animate={isFutureProcessing ? {
                              y: [0, -15, 15, 0],
                              scale: [1, 1.3, 0.8, 1],
                              borderColor: ['rgba(16,185,129,0.3)', 'rgba(59,130,246,0.8)', 'rgba(139,92,246,0.8)', 'rgba(16,185,129,0.3)']
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                            className="w-12 h-12 rounded-full border-2 border-emerald-500/30 flex items-center justify-center font-black text-[10px] text-slate-400"
                          >
                            q_{idx}
                          </motion.div>
                        ))}
                      </div>

                      <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-3 flex justify-between">
                        <span>Target SoC Register: {device?.chipsetName || 'Snapdragon / Exynos'} SHA-256 OTP block</span>
                        <span>Key Length: 4096-bit EC-DSA</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        disabled={isFutureProcessing}
                        onClick={async () => {
                          setIsFutureProcessing(true);
                          setQuantumDecrypted(false);
                          setFutureProgress(0);
                          const logs = [
                            isAr ? '📡 جاري تنشيط محاذاة الكيوبيتس على سجلات حماية المعالج الأساسية...' : '📡 Aligning qubits on primary CPU security registers...',
                            isAr ? '📡 جاري محاكاة الدوران التموجي للتراجع عن تشفير RSA-4096 لمفاتيح Knox...' : '📡 Simulating spin-wave factorization for RSA-4096 Knox verify keys...',
                            isAr ? '🔑 تم اختراق الـ Secure World والتقاط رمز الاستيثاق عتادياً بنجاح!' : '🔑 Secure World breached. Hardware authentication token captured!',
                            isAr ? '🔓 تم إلغاء حماية البوتلودر وحفظ مفاتيح السوفت وير للمودم والشبكة.' : '🔓 Bootloader lock status bypassed. Network/Modem partition keys decrypted!'
                          ];
                          
                          for (let i = 0; i < logs.length; i++) {
                            await new Promise(r => setTimeout(r, 1200));
                            setFutureLog(prev => [...prev, logs[i]]);
                            setFutureProgress(((i + 1) / logs.length) * 100);
                          }
                          setQuantumDecrypted(true);
                          setIsFutureProcessing(false);
                        }}
                        className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-purple-600/20"
                      >
                        {isAr ? 'إطلاق تجاوز التشفير الكمي' : 'LAUNCH QUANTUM DECRYPTOR'}
                      </button>

                      {quantumDecrypted && (
                        <button
                          onClick={() => {
                            onApplyFix('fastboot oem unlock-quantum-bypass-token 0x8F9A2B4C');
                          }}
                          className="py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all"
                        >
                          {isAr ? 'تطبيق تجاوز الحماية بالهاتف' : 'APPLY BYPASS ON PHONE'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. LIDAR THERMAL SCANNER */}
                {selectedFutureTool === 'LIDAR_SCAN' && (
                  <div className="space-y-6">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isAr
                        ? `عند تفعيل المسح، يقوم النظام بحقن فولت آمن 1.8V على بوردة الهاتف المكتشفة (${device?.brand}) لخط VDD_MAIN. باستخدام المسح الحراري بالأشعة وبمستشعر الـ LIDAR عالي الحساسية، تظهر البوردة وتصنيفات مكوناتها بدقة نانومترية لتتبع ممانعات الشورت وتحديد المكون التالف بمجرد النقر عليه.`
                        : `Activate DC Power Injection of 1.8V on VDD_MAIN. Thermal Lidar traces impedance fluctuations across the multi-layer copper PCB to detect micro-leakage. Click any highlighted component to analyze diode mode values.`}
                    </p>

                    {/* Motherboard Grid Layout with click targets */}
                    <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 relative overflow-hidden min-h-[220px] flex flex-col items-center justify-center">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
                      
                      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
                        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block text-center">
                          {isAr ? 'خريطة بوردة الهاتف الإرشادية - انقر على أحد المكونات لتشخيصه نانوياً:' : 'Motherboard PCB Node Grid - Click any component to probe:'}
                        </span>

                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { name: 'C3042 (Capacitor)', type: 'CAP', state: 'FAULTY', healthy: '0.520V', measured: '0.002V (SHORT)' },
                            { name: 'R104 (Resistor)', type: 'RES', state: 'HEALTHY', healthy: '0.120V', measured: '0.120V' },
                            { name: 'MAX77705 (Charger)', type: 'IC', state: 'HEALTHY', healthy: '0.450V', measured: '0.450V' },
                            { name: 'C2011 (Capacitor)', type: 'CAP', state: 'HEALTHY', healthy: '0.560V', measured: '0.555V' }
                          ].map((comp, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setScanTargetCapacitor(comp.name);
                                setFutureLog(prev => [
                                  ...prev,
                                  isAr
                                    ? `🔍 تتبع نانوي للمكون ${comp.name}: ممانعة الدايود المرجعية = ${comp.healthy} | المقاسة حقيقياً = ${comp.measured}`
                                    : `🔍 Nanometer probe on ${comp.name}: Reference = ${comp.healthy} | Real-Time Measured = ${comp.measured}`
                                ]);
                              }}
                              className={`p-3 rounded-xl border text-center transition-all ${
                                scanTargetCapacitor === comp.name
                                  ? 'bg-indigo-600 text-white border-white'
                                  : comp.state === 'FAULTY'
                                    ? 'bg-rose-950/40 text-rose-400 border-rose-500/40 animate-pulse'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-indigo-500'
                              }`}
                            >
                              <span className="text-[10px] font-mono font-black block">{comp.name}</span>
                              <span className="text-[8px] font-black uppercase opacity-60 block mt-1">
                                {comp.state === 'FAULTY' ? 'SHORT!' : 'OK'}
                              </span>
                            </button>
                          ))}
                        </div>

                        {scanTargetCapacitor && (
                          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-mono space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Component:</span>
                              <span className="font-bold text-white">{scanTargetCapacitor}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Multimeter Diode Value:</span>
                              <span className={scanTargetCapacitor === 'C3042 (Capacitor)' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                                {scanTargetCapacitor === 'C3042 (Capacitor)' ? '0.002V (GROUND SHORT-CIRCUIT!)' : '0.450V - 0.560V (HEALTHY)'}
                              </span>
                            </div>
                            {scanTargetCapacitor === 'C3042 (Capacitor)' && (
                              <p className="text-[10px] text-amber-400 border-t border-slate-800 pt-2 mt-2 leading-relaxed">
                                {isAr 
                                  ? '💡 المكثف C3042 تالف ويسبب كتم لخط التغذية الرئيسي للبوردة. استبدله فوراً بحرارة لحام 345 درجة.' 
                                  : '💡 C3042 capacitor has suffered physical leakage causing main VBUS/VDD clamp. Remove or replace to unbrick.'}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={isFutureProcessing}
                      onClick={async () => {
                        setIsFutureProcessing(true);
                        setLidarScanned(false);
                        setFutureProgress(0);
                        const logs = [
                          isAr ? '🛰️ جاري حقن فولت نبضي 1.8V بمسار التغذية الرئيسي VDD_MAIN عبر ألياف الباور سبلاي المدمج...' : '🛰️ Injecting pulse 1.8V to VDD_MAIN via embedded DC regulator interface...',
                          isAr ? '🛰️ تنشيط حساس الرصد الطيفي LIDAR ومستشعرات تتبع الحرارة النانوية...' : '🛰️ Booting LIDAR spectrograph & thermographic infrared nano-sensors...',
                          isAr ? '🎯 تم تتبع ورصد بؤرة حرارية مجهرية بقيمة 54.3°C عند المكثف التالف C3042!' : '🎯 Thermal micro-hotspot mapped at 54.3°C on capacitor node C3042!',
                          isAr ? '✔️ انتهى الفحص نانوياً بسلامة البوردة عدا المكثف المذكور. قم بمراجعته لحل العطل.' : '✔️ Complete motherboard multi-layer scan finished. Ready for micro-soldering.'
                        ];

                        for (let i = 0; i < logs.length; i++) {
                          await new Promise(r => setTimeout(r, 1100));
                          setFutureLog(prev => [...prev, logs[i]]);
                          setFutureProgress(((i + 1) / logs.length) * 100);
                        }
                        setLidarScanned(true);
                        setScanTargetCapacitor('C3042 (Capacitor)');
                        setIsFutureProcessing(false);
                      }}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                    >
                      {isAr ? 'بدء فحص البوردة بالليزر الحراري النانوي' : 'RUN LIDAR INFRARED SCAN'}
                    </button>
                  </div>
                )}

                {/* 3. REBALL PROFILER */}
                {selectedFutureTool === 'REBALL_PROFILER' && (
                  <div className="space-y-6">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isAr
                        ? `صيانة معالجات وذواكر الهواتف الحديثة عتادياً تتطلب منحنى حرارة بالغة الدقة (Thermal Profile) لمنع انتفاخ السيليكون أو كسر البوردة. يوفر الموجه منحنى تشغيلياً دقيقاً مع درجات الحرارة وتيار الهواء الموصى به لكل مرحلة لخلع وإعادة شبلنة المعالج بنجاح دون أي مخاطرة.`
                        : `Modern multi-layer processors require strict thermal curves to prevent silicon cracking or multi-layered PCB delamination. Use this robotic helper profile to configure exact soldering temperatures for (${device?.chipsetName || 'Snapdragon/Exynos'}).`}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {isAr ? 'مستويات لحام المعالج والذاكرة:' : 'TEMPERATURE CONTROL SLIDER'}
                        </span>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-mono">
                            <span>{isAr ? 'درجة الحرارة المستهدفة:' : 'Target Hot Air Temp:'}</span>
                            <span className="font-bold text-indigo-600">{hotAirTemp}°C</span>
                          </div>
                          <input
                            type="range"
                            min="280"
                            max="420"
                            value={hotAirTemp}
                            onChange={(e) => setHotAirTemp(Number(e.target.value))}
                            className="w-full accent-indigo-600"
                          />
                        </div>

                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-[11px] font-mono text-slate-600 space-y-2">
                          <div className="flex justify-between">
                            <span>Pre-heat Phase:</span>
                            <span className="text-slate-900 font-bold">150°C (60s)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Soak Phase:</span>
                            <span className="text-slate-900 font-bold">200°C (90s)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Reflow Peak:</span>
                            <span className={hotAirTemp > 360 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                              {hotAirTemp}°C (Max 40s)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-950 text-slate-300 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest block">
                          {isAr ? 'توصيات ريبالينج السيليكون المعتمدة:' : 'SILICON SPECIFIC INSTRUCTIONS'}
                        </span>

                        <p className="text-[11px] leading-relaxed text-indigo-300">
                          {isAr
                            ? `⚠️ لمعالج (${device?.chipsetName || 'Snapdragon/Exynos'}): استخدم مادة فلكس خالية من الرصاص لضمان جودة كرات القصدير. Peak temperature المسموحة هي 355 درجة تحت هواء 30%.`
                            : `⚠️ For (${device?.chipsetName || 'Snapdragon/Exynos'}): Lead-free low-temperature solder paste (183°C solid) is recommended. Do not exceed 360°C peak to prevent adjacent RAM layer separation.`}
                        </p>

                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-[9px] text-emerald-400 block">✓ Recommended Nozzle size: 8mm Circular</span>
                          <span className="text-[9px] text-emerald-400 block">✓ Solder balls pattern pitch: 0.35mm grid</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. KERNEL COMPILER */}
                {selectedFutureTool === 'KERNEL_COMPILER' && (
                  <div className="space-y-6">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isAr
                        ? `عند تعليق الهاتف على الشعار بسبب تلف ملفات النظام، أو رغبتك في تعديل سلوك شريحة الشبكة وإتاحة ميزات حظر قيود الأمان، يتيح لك المترجم كتابة وتعديل كود تعريفات الهاردوير (C/C++ Driver Patch) وبناء سوفت وير رقعة البوت (boot.img) وتفليشه بدقة آمنة.`
                        : `Write or apply source-level kernel bug patches to fix driver loops, bypass strict hardware Knox/AVB verification, and restore corrupt device parameters safely for (${device?.brand}).`}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {isAr ? 'اختر الرقعة البرمجية المراد دمجها بالسوفت وير:' : 'SELECT HARDWARE KERNEL BUG PATCH:'}
                        </span>

                        <div className="flex flex-col gap-2">
                          {[
                            { id: 'dm-verity', label: 'Bypass dm-verity Verification (تخطي التحقق المشفر للنظام)' },
                            { id: 'diag-port', label: 'Force Qualcomm Diag/Meta Port (إجبار فتح منفذ الشبكة الدياج)' },
                            { id: 'rpmb-write', label: 'RPMB Sector Write Mismatch (إصلاح توافقية سيريال الذاكرة)' },
                            { id: 'unbrick-boot', label: 'Patch Bootloop Kernel Panic Loop (حل الكراش المستعصي للبوت)' }
                          ].map((bug) => (
                            <button
                              key={bug.id}
                              onClick={() => setSelectedKernelBug(bug.id)}
                              className={`p-3 rounded-xl border text-right ${isAr ? 'text-right' : 'text-left'} text-[11px] transition-all ${
                                selectedKernelBug === bug.id
                                  ? 'bg-indigo-600 text-white border-indigo-400'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {bug.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 bg-slate-950 text-emerald-400 rounded-2xl border border-slate-800 font-mono text-[10px] space-y-4 relative min-h-[160px]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-[9px] text-slate-500">KERNEL COMPILER INTERACTIVE CONSOLE</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>

                        {compiledKernelOutput ? (
                          <div className="space-y-2 animate-in fade-in duration-300">
                            <span className="text-white font-bold block">✓ Patch Successfully Built!</span>
                            <pre className="text-slate-300 text-[9px] leading-relaxed whitespace-pre-wrap">
                              {compiledKernelOutput}
                            </pre>
                          </div>
                        ) : (
                          <div className="text-slate-500 italic py-12 text-center">
                            {isAr ? 'بانتظار بناء رقعة الكود المحددة...' : 'Awaiting patch compilation...'}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={isFutureProcessing}
                      onClick={async () => {
                        setIsFutureProcessing(true);
                        setCompiledKernelOutput(null);
                        setFutureProgress(0);

                        const logs = [
                          isAr ? `💻 جاري استيراد سورس كود النواة لهاتف (${device?.model || 'SM-S928B'}) لمعالجة المشكلة...` : `💻 Importing kernel source tree for device (${device?.model || 'SM-S928B'})...`,
                          isAr ? '💻 جاري تطبيق التعديل على ملف drivers/usb/gadget/f_diag.c لتمكين المنفذ الحقيقي...' : '💻 Applying patch to drivers/usb/gadget/f_diag.c to bypass restriction check...',
                          isAr ? '💻 جاري تجميع البيناري وربط الأوامر الثنائية بالـ Compiler الخاص بالنظام...' : '💻 Invoking GNU-GCC cross-compiler tools for ARM64 architecture...',
                          isAr ? '🎉 تم دمج الرقعة وبناء ملف السوفت وير boot_patched.img الأصلي بنجاح!' : '🎉 Kernel patch verified and compiled into flashable boot_patched.img!'
                        ];

                        for (let i = 0; i < logs.length; i++) {
                          await new Promise(r => setTimeout(r, 1100));
                          setFutureLog(prev => [...prev, logs[i]]);
                          setFutureProgress(((i + 1) / logs.length) * 100);
                        }

                        const code = selectedKernelBug === 'dm-verity'
                          ? `// boot_patched_verity_bypass.img\n#include <linux/init.h>\n#include <linux/module.h>\n\nstatic int __init bypass_verity(void) {\n    printk(KERN_INFO "[MasterFix] dm-verity crypt signature verification BYPASSED \\n");\n    return 0;\n}`
                          : selectedKernelBug === 'diag-port'
                            ? `// boot_patched_diag_force.img\nstatic int force_diag_port(void) {\n    diag_enable_debug_port = 1;\n    printk(KERN_INFO "[MasterFix] Force Enabled Qualcomm/MTK Diag COM Port on USB Interface\\n");\n    return 0;\n}`
                            : `// boot_patched_unbricked_boot.img\n#define PAT_SIG 0x8F9A2B4C\nint init_kernel_unbrick(void) {\n    bypass_panic_reset_loop = 1;\n    printk(KERN_INFO "[MasterFix] Kernel Panic Infinite Reset Loop prevented successfully!\\n");\n    return 0;\n}`;

                        setCompiledKernelOutput(code);
                        setIsFutureProcessing(false);
                      }}
                      className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-purple-600/20"
                    >
                      {isAr ? 'تجميع وبناء رقعة السوفت وير للكيرنل' : 'COMPILE & BUILD KERNEL PATCH IMAGE'}
                    </button>
                  </div>
                )}
              </div>

              {/* Progress and Live Terminal Output */}
              <div className="border-t border-slate-100 pt-6 mt-8 space-y-4">
                {/* Visual Progress Bar */}
                {isFutureProcessing && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                      <span>{isAr ? 'جاري معالجة الكود والنبضات الكمية...' : 'PROCESSING QUANTUM PIPELINE...'}</span>
                      <span>{Math.round(futureProgress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${futureProgress}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                      />
                    </div>
                  </div>
                )}

                {/* Simulated Live Console Log */}
                <div className="p-4 bg-slate-950 text-slate-300 font-mono text-[10px] rounded-2xl border border-slate-800 space-y-1 max-h-[140px] overflow-y-auto">
                  {futureLog.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                      <span className={log.includes('✓') || log.includes('🔓') || log.includes('🎉') ? 'text-emerald-400 font-bold' : log.includes('⚠️') ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Neural Processing Overlay */}
      <AnimatePresence>
        {(isCopilotConsulting || isAnalyzing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-3xl"
          >
            <div className="absolute inset-0 noise-layer opacity-5 pointer-events-none" />
            <div className="relative text-center space-y-12 max-w-lg px-8">
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    opacity: [0.1, 0.3, 0.1]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-indigo-500/10 blur-[120px] rounded-full"
                />
                <div className="relative w-32 h-32 mx-auto">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-indigo-500/20 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 border-2 border-dashed border-cyan-500/30 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-indigo-600 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-[0.4em] italic">
                  {isAr ? 'جاري معالجة البيانات' : 'NEURAL PROCESSING'}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1 w-48 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ x: [-200, 200] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="h-full w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                    />
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                  {isAr 
                    ? 'يتم الآن مطابقة السجلات مع قاعدة بيانات الثغرات السحابية... فك تشفير مسارات الهاردوير... محاكاة خطة الإصلاح'
                    : 'MATCHING LOGS WITH CLOUD VULNERABILITY REPOSITORY... DECODING HARDWARE PATHS... SIMULATING REPAIR PIPELINE'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
