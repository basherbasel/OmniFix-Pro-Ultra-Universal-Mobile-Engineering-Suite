import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  Layers, 
  Zap, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  FileCode, 
  Lock, 
  Unlock, 
  HardDrive, 
  Activity, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Sliders, 
  Award, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowRight,
  Database,
  Radio,
  KeyRound
} from 'lucide-react';
import { 
  OS_ARCHITECTURE_LAYERS, 
  CORE_SECURITY_MECHANISMS, 
  CLINICAL_REPAIR_SCENARIOS, 
  OS_SECURITY_EXAM_QUESTIONS,
  ArchitectureLayer,
  SecurityMechanism,
  RepairScenario
} from '../data/osSecurityArchitectureData';
import { ConnectedDevice } from '../types';

interface OsSecurityArchitectureLabProps {
  lang: 'en' | 'ar';
  device?: ConnectedDevice;
  onNavigateToTool?: (tabId: string) => void;
  onAddLog?: (log: string) => void;
}

export function OsSecurityArchitectureLab({ 
  lang, 
  device, 
  onNavigateToTool,
  onAddLog 
}: OsSecurityArchitectureLabProps) {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'stack' | 'security-engines' | 'simulators' | 'clinical-repairs' | 'exam'>('stack');
  
  // Selected state for Layer Stack
  const [selectedLayerId, setSelectedLayerId] = useState<string>(OS_ARCHITECTURE_LAYERS[0].id);
  const selectedLayer = OS_ARCHITECTURE_LAYERS.find(l => l.id === selectedLayerId) || OS_ARCHITECTURE_LAYERS[0];

  // Selected state for Security Mechanism
  const [selectedSecId, setSelectedSecId] = useState<string>(CORE_SECURITY_MECHANISMS[0].id);
  const selectedMechanism = CORE_SECURITY_MECHANISMS.find(m => m.id === selectedSecId) || CORE_SECURITY_MECHANISMS[0];

  // Selected state for Clinical Scenario
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(CLINICAL_REPAIR_SCENARIOS[0].id);
  const selectedScenario = CLINICAL_REPAIR_SCENARIOS.find(s => s.id === selectedScenarioId) || CLINICAL_REPAIR_SCENARIOS[0];
  const [scenarioStep, setScenarioStep] = useState<number>(1);
  const [simulatedConsoleLogs, setSimulatedConsoleLogs] = useState<string[]>([
    `[SECURITY_AUDIT] Initialized diagnostic workspace for ${selectedScenario.titleEn}...`,
    `[TARGET] Ready for interactive triage execution.`
  ]);
  const [isExecutingStep, setIsExecutingStep] = useState(false);

  // Simulators State
  // 1. AVB 2.0 Simulator
  const [avbState, setAvbState] = useState<'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'>('GREEN');
  const [avbVerityDisabled, setAvbVerityDisabled] = useState<boolean>(false);
  const [avbVerificationDisabled, setAvbVerificationDisabled] = useState<boolean>(false);

  // 2. DM-Verity Block simulator
  const [corruptBlockIndex, setCorruptBlockIndex] = useState<number | null>(null);
  const [isVerityRepaired, setIsVerityRepaired] = useState<boolean>(false);

  // 3. ARB Calculator
  const [fuseArbIndex, setFuseArbIndex] = useState<number>(4);
  const [firmwareArbIndex, setFirmwareArbIndex] = useState<number>(3);

  // Exam State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [answeredCount, setAnsweredCount] = useState<number>(0);

  // Copy status
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleExecuteScenarioStep = (stepNumber: number) => {
    setIsExecutingStep(true);
    const stepObj = isAr 
      ? selectedScenario.repairStepsAr.find(s => s.step === stepNumber)
      : selectedScenario.repairStepsEn.find(s => s.step === stepNumber);

    if (!stepObj) return;

    setSimulatedConsoleLogs(prev => [
      ...prev,
      `>>> EXECUTING [STEP ${stepNumber}]: ${stepObj.cli}`,
      `[KERNEL] Applying target partition reconfiguration...`
    ]);

    setTimeout(() => {
      setSimulatedConsoleLogs(prev => [
        ...prev,
        `[SUCCESS] Step ${stepNumber} verified: ${stepObj.title}`,
        `[AUDIT] Partition parameters reconciled successfully.`
      ]);
      setIsExecutingStep(false);
      if (stepNumber < selectedScenario.repairStepsAr.length) {
        setScenarioStep(stepNumber + 1);
      } else {
        setSimulatedConsoleLogs(prev => [
          ...prev,
          `=========================================`,
          `[VERIFICATION PASS] ${isAr ? selectedScenario.verificationAr : selectedScenario.verificationEn}`,
          `=========================================`
        ]);
        if (onAddLog) {
          onAddLog(`Clinical Repair Completed: ${selectedScenario.titleEn}`);
        }
      }
    }, 900);
  };

  const handleResetScenario = () => {
    setScenarioStep(1);
    setSimulatedConsoleLogs([
      `[SECURITY_AUDIT] Initialized diagnostic workspace for ${selectedScenario.titleEn}...`,
      `[TARGET] Ready for interactive triage execution.`
    ]);
  };

  const handleAnswerSubmit = (optionIndex: number) => {
    if (showAnswerFeedback) return;
    setSelectedAnswer(optionIndex);
    setShowAnswerFeedback(true);
    const isCorrect = optionIndex === OS_SECURITY_EXAM_QUESTIONS[currentQuestionIndex].correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setAnsweredCount(prev => prev + 1);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowAnswerFeedback(false);
    if (currentQuestionIndex < OS_SECURITY_EXAM_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleRestartExam = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswerFeedback(false);
    setScore(0);
    setAnsweredCount(0);
  };

  // ARB Calculation outcome
  const arbStatus = firmwareArbIndex > fuseArbIndex 
    ? 'UPGRADE_PERMITTED' 
    : firmwareArbIndex === fuseArbIndex 
      ? 'SAME_TIER_SAFE' 
      : 'FATAL_DOWNGRADE_BRICK';

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Header Bar */}
      <header className="px-6 py-5 bg-slate-900/90 border-b border-white/5 backdrop-blur-md sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-black tracking-tight text-white">
                {isAr ? 'مختبر بنية نظم التشغيل والحمايات وطرق إصلاحها' : 'OS Architecture, Security Engines & Protection Repair Lab'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO ULTRA v5.0
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr 
                ? 'فهم عميق لسلسلة الثقة (BootROM -> TrustZone -> ABL -> dm-verity -> Init) وكيفية تشخيص وتصحيح انهيارات الحماية'
                : 'Deep engineering mastery of TrustChain, eFuses, AVB 2.0, dm-verity, ARB, Knox, and runtime repair protocols'}
            </p>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-white/5">
          {[
            { id: 'stack', labelAr: 'طبقات بنية النظام', labelEn: 'OS Architecture Stack', icon: Layers },
            { id: 'security-engines', labelAr: 'محركات الحماية والتشفير', labelEn: 'Security Engines', icon: ShieldCheck },
            { id: 'simulators', labelAr: 'المحاكيات اللحظية', labelEn: 'Live Simulators', icon: Activity },
            { id: 'clinical-repairs', labelAr: 'عيادة إصلاح الأعطال', labelEn: 'Clinical Fault Repairs', icon: Terminal },
            { id: 'exam', labelAr: 'اختبار مهندس النظم', labelEn: 'Engineer Assessment', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: OS ARCHITECTURE STACK                                              */}
        {/* ========================================================================= */}
        {activeTab === 'stack' && (
          <div className="space-y-6">
            {/* Top Overview Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider">
                  <Cpu className="w-4 h-4" />
                  {isAr ? 'سلسلة الثقة الرقمية للأجهزة الذكية (Hardware Root of Trust)' : 'Hardware Anchored Chain of Trust'}
                </div>
                <h2 className="text-xl font-black text-white">
                  {isAr ? 'تشريح متكامل لمراحل إقلاع ومكونات نظام التشغيل' : 'End-to-End Operating System Boot Sequence & Component Layers'}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isAr 
                    ? 'كل خطوة تسلم الثقة للخطوة التي تليها بعد فحص التوقيع المشفر. إذا فشل التحقق في أي مرحلة، يسقط الجهاز في وضع التعليق (Bootloop) أو الطوارئ (EDL/BROM) أو الشاشة الحمراء (Red State).'
                    : 'Each boot tier cryptographically verifies the next stage before execution jump. A failure anywhere along this path triggers a bootloop, emergency download fallback (EDL/BROM), or Red State lock.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{isAr ? 'الطبقات الأساسية' : 'TOTAL LAYERS'}</div>
                  <div className="text-lg font-black text-indigo-400">6 Stages</div>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{isAr ? 'طرق الإصلاح' : 'REPAIR PATHS'}</div>
                  <div className="text-lg font-black text-emerald-400">18+ Methods</div>
                </div>
              </div>
            </div>

            {/* Architecture Visual Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Visual Layer Selector */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">
                  {isAr ? 'تسلسل الطبقات من العتاد حتى الواجهة' : 'Boot Execution Hierarchy'}
                </h3>
                
                <div className="space-y-2.5">
                  {OS_ARCHITECTURE_LAYERS.map((layer, index) => {
                    const isSelected = layer.id === selectedLayerId;
                    return (
                      <button
                        key={layer.id}
                        onClick={() => setSelectedLayerId(layer.id)}
                        className={`w-full text-start p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                          isSelected 
                            ? 'bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                            : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/80 hover:border-white/10'
                        }`}
                      >
                        {isSelected && (
                          <div className={`absolute top-0 bottom-0 ${isAr ? 'right-0' : 'left-0'} w-1.5 bg-gradient-to-b ${layer.color}`} />
                        )}

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}>
                              0{layer.order}
                            </div>
                            <div>
                              <div className="text-[10px] font-black tracking-wider uppercase text-slate-400">
                                {layer.badge}
                              </div>
                              <div className={`text-sm font-black transition-colors ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                {isAr ? layer.nameAr.split('(')[0] : layer.nameEn.split('(')[0]}
                              </div>
                            </div>
                          </div>

                          <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
                            {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">
                          {isAr ? layer.subtitleAr : layer.subtitleEn}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Deep Layer Detailed Dossier */}
              <div className="lg:col-span-7 space-y-5">
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6">
                  {/* Layer Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-white/5">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10 mb-2">
                        {selectedLayer.badge}
                      </div>
                      <h3 className="text-xl font-black text-white">
                        {isAr ? selectedLayer.nameAr : selectedLayer.nameEn}
                      </h3>
                      <p className="text-xs text-indigo-400 font-bold mt-1">
                        {isAr ? selectedLayer.subtitleAr : selectedLayer.subtitleEn}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-slate-950 border border-white/10 text-slate-300">
                        Tier #{selectedLayer.order} / 6
                      </span>
                    </div>
                  </div>

                  {/* Core Description */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                      {isAr ? 'الوصف الهندسي وآلية العمل' : 'Engineering Principle & Execution Mechanics'}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {isAr ? selectedLayer.descriptionAr : selectedLayer.descriptionEn}
                    </p>
                  </div>

                  {/* Components Breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      {isAr ? 'المكونات الأساسية ووظائف الحماية والأعطال' : 'Core Components, Security Roles & Fault Triaging'}
                    </h4>

                    <div className="grid grid-cols-1 gap-4">
                      {selectedLayer.components.map((comp, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-black text-indigo-300">{comp.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              Subsystem
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{isAr ? 'الدور التشغيلي' : 'Operational Role'}</span>
                              <p className="text-slate-300 text-[11px] leading-relaxed">{isAr ? comp.roleAr : comp.roleEn}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                              <span className="text-[10px] font-bold text-indigo-400 uppercase">{isAr ? 'وظيفة الحماية' : 'Security Enforcement'}</span>
                              <p className="text-slate-300 text-[11px] leading-relaxed">{isAr ? comp.securityFunctionAr : comp.securityFunctionEn}</p>
                            </div>
                          </div>

                          {/* Failures & Repairs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-black text-rose-400 flex items-center gap-1.5">
                                <AlertTriangle className="w-3 h-3" />
                                {isAr ? 'أبرز الأعطال وأعراض الانهيار' : 'Failure Signatures & Symptoms'}
                              </span>
                              <ul className="space-y-1">
                                {(isAr ? comp.commonFailuresAr : comp.commonFailuresEn).map((fail, fIdx) => (
                                  <li key={fIdx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                                    <span className="text-rose-500 mt-1">•</span>
                                    <span>{fail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" />
                                {isAr ? 'أساليب الإصلاح الفعلي' : 'Clinical Repair Protocols'}
                              </span>
                              <ul className="space-y-1">
                                {(isAr ? comp.repairTechniquesAr : comp.repairTechniquesEn).map((rep, rIdx) => (
                                  <li key={rIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                                    <span className="text-emerald-500 mt-1">•</span>
                                    <span>{rep}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Low Level Microcode Insights */}
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase">
                      <Zap className="w-3.5 h-3.5" />
                      {isAr ? 'أسرار العتاد ومستويات التنفيذ المنخفضة' : 'Low-Level Hardware & Silicon Registers'}
                    </div>
                    <ul className="space-y-1.5">
                      {(isAr ? selectedLayer.lowLevelDetailsAr : selectedLayer.lowLevelDetailsEn).map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-indigo-400 mt-1">▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Diagnostic CLI Command */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        {isAr ? 'أمر الفحص التشخيصي الموصى به' : 'Recommended Low-Level Diagnostic Command'}
                      </span>
                      <button
                        onClick={() => handleCopy(selectedLayer.technicalCommandExample, selectedLayer.id)}
                        className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded-md bg-white/5 border border-white/10"
                      >
                        {copiedSnippetId === selectedLayer.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>{isAr ? 'تم النسخ' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{isAr ? 'نسخ الأمر' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 border border-white/5 overflow-x-auto">
                      {selectedLayer.technicalCommandExample}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SECURITY ENGINES                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'security-engines' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-white/10">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-white flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  {isAr ? 'محركات وأنظمة الحماية والتشفير العميقة' : 'Core Mobile Security, Cryptographic Enclaves & Access Control'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isAr 
                    ? 'دراسة تفصيلية لآليات AVB 2.0 و dm-verity و ARB و Knox و FBE و SELinux وكيفية التعامل معها'
                    : 'Exhaustive breakdown of AVB 2.0, dm-verity, ARB, Knox, FBE, and SELinux mechanisms and unbrick strategies'}
                </p>
              </div>

              {/* Selector Pills */}
              <div className="flex flex-wrap gap-2">
                {CORE_SECURITY_MECHANISMS.map(mech => (
                  <button
                    key={mech.id}
                    onClick={() => setSelectedSecId(mech.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedSecId === mech.id 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {mech.badge}
                  </button>
                ))}
              </div>
            </div>

            {/* Deep Detail Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Theory, Indicators & Bypasses */}
              <div className="lg:col-span-7 space-y-5">
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/5">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                        {selectedMechanism.badge}
                      </div>
                      <h3 className="text-xl font-black text-white">
                        {isAr ? selectedMechanism.titleAr : selectedMechanism.titleEn}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        {isAr ? selectedMechanism.shortDescAr : selectedMechanism.shortDescEn}
                      </p>
                    </div>
                  </div>

                  {/* How it Works */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      {isAr ? 'كيف يعمل المحرك برمجياً وعتادياً' : 'Operational Architecture & Execution Flow'}
                    </h4>
                    <div className="space-y-2">
                      {(isAr ? selectedMechanism.howItWorksAr : selectedMechanism.howItWorksEn).map((step, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-3 text-xs">
                          <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="text-slate-300 leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Diagnostic Indicators */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {isAr ? 'مؤشرات العطل وأعراض كشف التلاعب' : 'Diagnostic Indicators & Tamper Signatures'}
                    </h4>
                    <ul className="space-y-1.5 p-3 rounded-xl bg-rose-950/10 border border-rose-500/20">
                      {(isAr ? selectedMechanism.diagnosticIndicatorsAr : selectedMechanism.diagnosticIndicatorsEn).map((ind, idx) => (
                        <li key={idx} className="text-xs text-rose-200/80 flex items-start gap-2">
                          <span className="text-rose-500 mt-1">✕</span>
                          <span>{ind}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Vulnerabilities & Bypass Vectors */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Unlock className="w-3.5 h-3.5" />
                      {isAr ? 'نقاط الضعف ومسارات التخطي الهندسية المتبعة' : 'Vulnerabilities & Architectural Bypass Vectors'}
                    </h4>
                    <ul className="space-y-1.5 p-3 rounded-xl bg-amber-950/10 border border-amber-500/20">
                      {(isAr ? selectedMechanism.vulnerabilitiesAndBypassesAr : selectedMechanism.vulnerabilitiesAndBypassesEn).map((vuln, idx) => (
                        <li key={idx} className="text-xs text-amber-200/90 flex items-start gap-2">
                          <span className="text-amber-400 mt-1">▸</span>
                          <span>{vuln}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column: Clinical Repair Methodology & Code Snippet */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {isAr ? 'منهجية الفحص والإصلاح المعتمدة' : 'Clinical Repair Methodology'}
                    </h4>
                    <div className="space-y-2">
                      {(isAr ? selectedMechanism.repairMethodologyAr : selectedMechanism.repairMethodologyEn).map((rep, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rep}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tooling Tags */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {isAr ? 'الأدوات البرمجية المستخدمة في التعامل' : 'Associated CLI Diagnostic Toolchain'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMechanism.cliTools.map((tool, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 text-indigo-300 border border-white/10">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Real Code Snippet */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                        {selectedMechanism.codeSnippet.title}
                      </span>
                      <button
                        onClick={() => handleCopy(selectedMechanism.codeSnippet.code, selectedMechanism.id)}
                        className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded-md bg-white/5 border border-white/10"
                      >
                        {copiedSnippetId === selectedMechanism.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>{isAr ? 'تم النسخ' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{isAr ? 'نسخ الكود' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-white/5 overflow-x-auto whitespace-pre leading-relaxed">
                      {selectedMechanism.codeSnippet.code}
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <button
                    onClick={() => setActiveTab('simulators')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Activity className="w-4 h-4" />
                    <span>{isAr ? 'تجربة فحص هذا المحرك في المحاكي اللحظي' : 'Test This Mechanism in Live Simulator'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LIVE SIMULATORS                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'simulators' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  {isAr ? 'محاكيات الفحص والتشخيص اللحظي لأنظمة الحماية' : 'Interactive Security & Integrity Diagnostic Simulators'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isAr 
                    ? 'اختبار حقيقي وتفاعلي لكيفية تصرف المعالج والنواة عند حدوث تلاعب في VBMETA أو تلف البلوكات أو اختلاف ARB'
                    : 'Live sandbox demonstrating hardware & kernel responses to Merkle tree mismatches, bad sectors, and ARB index gaps'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Simulator 1: AVB 2.0 & VBMETA State Simulator */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-5 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-black text-white">
                      {isAr ? 'محاكي حالات AVB 2.0 و VBMETA' : 'AVB 2.0 & VBMETA State Simulator'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                    AVB Core
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  {isAr 
                    ? 'تغيير حالة الإقلاع لمعاينة شاشة التحذير وكيفية ترقيع ترويسة vbmeta لتخطي التحقق.'
                    : 'Toggle boot states to view bootloader warnings and inspect raw vbmeta header flags.'}
                </p>

                {/* State selector */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'GREEN', label: 'GREEN STATE', descAr: 'مقفل ورسمي', color: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' },
                    { id: 'YELLOW', label: 'YELLOW STATE', descAr: 'مفتاح مخصص', color: 'border-amber-500/50 text-amber-400 bg-amber-500/10' },
                    { id: 'ORANGE', label: 'ORANGE STATE', descAr: 'بوتلودر مفتوح', color: 'border-orange-500/50 text-orange-400 bg-orange-500/10' },
                    { id: 'RED', label: 'RED STATE', descAr: 'تالف - رفض إقلاع', color: 'border-rose-500/50 text-rose-400 bg-rose-500/10' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setAvbState(item.id as any)}
                      className={`p-2.5 rounded-xl border text-start text-xs font-bold transition-all ${
                        avbState === item.id 
                          ? item.color + ' ring-2 ring-indigo-500/40' 
                          : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <div>{item.label}</div>
                      <div className="text-[10px] font-normal opacity-80">{item.descAr}</div>
                    </button>
                  ))}
                </div>

                {/* Display Output Box */}
                <div className={`p-4 rounded-2xl border text-xs font-mono space-y-1.5 ${
                  avbState === 'GREEN' ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' :
                  avbState === 'YELLOW' ? 'bg-amber-950/20 border-amber-500/30 text-amber-300' :
                  avbState === 'ORANGE' ? 'bg-orange-950/20 border-orange-500/30 text-orange-300' :
                  'bg-rose-950/30 border-rose-500/50 text-rose-300 animate-pulse'
                }`}>
                  <div className="font-black text-sm">
                    {avbState === 'GREEN' && '✓ GREEN: Trusted boot verified. RSA-4096 OK.'}
                    {avbState === 'YELLOW' && '⚠ YELLOW: Device running custom key in eFuse.'}
                    {avbState === 'ORANGE' && '⚡ ORANGE: Bootloader unlocked. Integrity waived.'}
                    {avbState === 'RED' && '✕ RED STATE: Your device is corrupt. Will shutdown.'}
                  </div>
                  <div className="text-[11px] opacity-80">
                    Flags: {avbVerityDisabled ? 'VERITY_DISABLED (0x1)' : '0x0'} | {avbVerificationDisabled ? 'VERIFICATION_DISABLED (0x2)' : '0x0'}
                  </div>
                </div>

                {/* Patch Switches */}
                <div className="space-y-2 mt-auto pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{isAr ? 'تعطيل تحقق dm-verity' : 'Disable Verity Flag'}</span>
                    <input 
                      type="checkbox" 
                      checked={avbVerityDisabled}
                      onChange={(e) => {
                        setAvbVerityDisabled(e.target.checked);
                        if (e.target.checked && avbState === 'RED') setAvbState('ORANGE');
                      }}
                      className="rounded accent-indigo-600"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{isAr ? 'تعطيل التحقق الكامل (Verification)' : 'Disable Verification Flag'}</span>
                    <input 
                      type="checkbox" 
                      checked={avbVerificationDisabled}
                      onChange={(e) => {
                        setAvbVerificationDisabled(e.target.checked);
                        if (e.target.checked && avbState === 'RED') setAvbState('ORANGE');
                      }}
                      className="rounded accent-indigo-600"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[10px] text-indigo-300 border border-white/5">
                  fastboot flash vbmeta --disable-verity --disable-verification vbmeta.img
                </div>
              </div>

              {/* Simulator 2: DM-Verity Block Integrity Tester */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-5 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-black text-white">
                      {isAr ? 'محاكي سلامة كتل dm-verity' : 'dm-verity Merkle Tree Block Tester'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                    4KB Blocks
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  {isAr 
                    ? 'انقر على أي بلوك لإحداث تلف وهمي (Bad Sector) وشاهد كيف يكتشفه dm-verity لحظياً.'
                    : 'Click any sector block to simulate a bit flip and observe Merkle tree rejection.'}
                </p>

                {/* 16 Blocks Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 16 }).map((_, idx) => {
                    const isCorrupted = corruptBlockIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setCorruptBlockIndex(isCorrupted ? null : idx);
                          setIsVerityRepaired(false);
                        }}
                        className={`h-10 rounded-xl font-mono text-xs font-black transition-all flex flex-col items-center justify-center ${
                          isCorrupted 
                            ? 'bg-rose-600 text-white animate-bounce shadow-lg shadow-rose-600/40' 
                            : 'bg-slate-950 text-slate-400 border border-white/5 hover:border-indigo-500/50 hover:text-white'
                        }`}
                      >
                        <span>B{idx}</span>
                        <span className="text-[8px] opacity-75">{isCorrupted ? 'CORRUPT' : '4KB'}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Diagnostic Outcome */}
                <div className={`p-4 rounded-2xl border text-xs font-mono space-y-1 ${
                  corruptBlockIndex !== null && !isVerityRepaired
                    ? 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                }`}>
                  {corruptBlockIndex !== null && !isVerityRepaired ? (
                    <>
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>[KERNEL PANIC] dm-verity SHA-256 Mismatch!</span>
                      </div>
                      <div className="text-[11px] opacity-80">
                        Block #{corruptBlockIndex} (Offset 0x{corruptBlockIndex * 4096}): Bad Merkle Hash.
                      </div>
                      <div className="text-[10px] text-rose-400 pt-1">
                        Device will halt or force soft-reboot in 5 seconds.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>[INTEGRITY 100%] All 16 Blocks Match Merkle Root.</span>
                      </div>
                      <div className="text-[11px] opacity-80">
                        Root Hash: 6a35d962f913d8e980a3fe... (Valid)
                      </div>
                    </>
                  )}
                </div>

                {/* Repair Button */}
                <button
                  disabled={corruptBlockIndex === null}
                  onClick={() => {
                    setIsVerityRepaired(true);
                    setCorruptBlockIndex(null);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all mt-auto ${
                    corruptBlockIndex !== null 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إصلاح البلوك التالف وإعادة بناء شجرة الهاش' : 'Reflash Sector & Rebuild Merkle Tree'}</span>
                </button>
              </div>

              {/* Simulator 3: ARB Anti-Rollback Calculator */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-5 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-black text-white">
                      {isAr ? 'حاسبة أمان Anti-Rollback eFuse' : 'ARB eFuse Downgrade Risk Calculator'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                    QFPROM
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  {isAr 
                    ? 'حدد رقم الفيوز المحترق في المعالج ورقم الفلاشة المراد تفليشها لمعرفة ما إذا كانت آمنة أم قاتلة.'
                    : 'Configure hardware fuse index against target firmware to predict safe flashing or fatal hard brick.'}
                </p>

                {/* Inputs */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-bold">{isAr ? 'رقم فيوز المعالج المحترق (Silicon eFuse):' : 'Blown Silicon Fuse Index:'}</span>
                      <span className="font-mono text-indigo-400 font-black">Bit #{fuseArbIndex}</span>
                    </div>
                    <input 
                      type="range" 
                      min={1} 
                      max={10} 
                      value={fuseArbIndex} 
                      onChange={(e) => setFuseArbIndex(parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-bold">{isAr ? 'رقم حماية الفلاشة المراد تفليشها:' : 'Target Firmware ARB Version:'}</span>
                      <span className="font-mono text-emerald-400 font-black">Bit #{firmwareArbIndex}</span>
                    </div>
                    <input 
                      type="range" 
                      min={1} 
                      max={10} 
                      value={firmwareArbIndex} 
                      onChange={(e) => setFirmwareArbIndex(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>

                {/* Outcome Box */}
                <div className={`p-4 rounded-2xl border text-xs font-mono space-y-1 mt-auto ${
                  arbStatus === 'FATAL_DOWNGRADE_BRICK' 
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 animate-pulse' 
                    : arbStatus === 'UPGRADE_PERMITTED' 
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-300' 
                      : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                }`}>
                  <div className="font-black text-sm">
                    {arbStatus === 'FATAL_DOWNGRADE_BRICK' && '☠ FATAL BRICK: FIRMWARE < FUSE INDEX!'}
                    {arbStatus === 'UPGRADE_PERMITTED' && '⚡ UPGRADE: Silicon will blow new fuse permanently!'}
                    {arbStatus === 'SAME_TIER_SAFE' && '✓ SAFE: Exact matching security index tier.'}
                  </div>
                  <div className="text-[11px] opacity-80">
                    {arbStatus === 'FATAL_DOWNGRADE_BRICK' && (isAr ? 'المعالج سيرفض الإقلاع ويسقط فوراً في EDL 9008.' : 'BootROM will instantly abort into Qualcomm 9008 emergency.')}
                    {arbStatus === 'UPGRADE_PERMITTED' && (isAr ? 'سيتم التحديث وحرق فيوز إضافي، ولن تتمكن من الرجوع أبداً.' : 'Flash succeeds and blows new eFuse. You cannot rollback afterwards.')}
                    {arbStatus === 'SAME_TIER_SAFE' && (isAr ? 'يمكن التفليش بأمان دون حرق فيوزات ودون خطر الموت.' : 'Flashing safe. Hardware fuses remain intact and device boots.')}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[10px] text-slate-300 border border-white/5">
                  fastboot getvar anti
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CLINICAL REPAIR WORKSHOP                                           */}
        {/* ========================================================================= */}
        {activeTab === 'clinical-repairs' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-white/10">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  {isAr ? 'عيادة إصلاح أعطال الحماية ونظم التشغيل' : 'Clinical Security Fault Triage & Repair Workshop'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isAr 
                    ? 'ورشة تفاعلية لحل أشهر الأعطال المستعصية (Red State, ARB Brick, Dynamic Super Overflow) خطوة بخطوة'
                    : 'Interactive triage pipelines solving notorious catastrophic faults (Red State, ARB Brick, Fastbootd Super errors)'}
                </p>
              </div>

              {/* Scenario Switcher */}
              <div className="flex flex-wrap gap-2">
                {CLINICAL_REPAIR_SCENARIOS.map(scen => (
                  <button
                    key={scen.id}
                    onClick={() => {
                      setSelectedScenarioId(scen.id);
                      setScenarioStep(1);
                      setSimulatedConsoleLogs([
                        `[SECURITY_AUDIT] Initialized diagnostic workspace for ${scen.titleEn}...`,
                        `[TARGET] Ready for interactive triage execution.`
                      ]);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedScenarioId === scen.id 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {isAr ? scen.titleAr.split('(')[0] : scen.titleEn.split('&')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario Execution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Fault Dossier & Repair Pipeline */}
              <div className="lg:col-span-7 space-y-5">
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-5">
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {selectedScenario.severity}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {selectedScenario.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white">
                        {isAr ? selectedScenario.titleAr : selectedScenario.titleEn}
                      </h3>
                    </div>

                    <button
                      onClick={handleResetScenario}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إعادة البدء' : 'Reset'}</span>
                    </button>
                  </div>

                  {/* Symptom & Root Cause */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                      <span className="text-[10px] font-black text-rose-400 uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {isAr ? 'العرض الظاهر' : 'Observed Symptom'}
                      </span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {isAr ? selectedScenario.symptomAr : selectedScenario.symptomEn}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-1">
                      <span className="text-[10px] font-black text-indigo-400 uppercase flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {isAr ? 'السبب الجذري في نظام التشغيل' : 'OS Architectural Root Cause'}
                      </span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {isAr ? selectedScenario.rootCauseAr : selectedScenario.rootCauseEn}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Steps Pipeline */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      {isAr ? 'خطوات تنفيذ الإصلاح التفاعلي' : 'Step-by-Step Clinical Remediation Pipeline'}
                    </h4>

                    <div className="space-y-3">
                      {(isAr ? selectedScenario.repairStepsAr : selectedScenario.repairStepsEn).map((stepItem) => {
                        const isCurrent = scenarioStep === stepItem.step;
                        const isCompleted = scenarioStep > stepItem.step;

                        return (
                          <div 
                            key={stepItem.step}
                            className={`p-4 rounded-2xl border transition-all ${
                              isCurrent 
                                ? 'bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                                : isCompleted 
                                  ? 'bg-slate-950/50 border-emerald-500/30 text-slate-300' 
                                  : 'bg-slate-950/20 border-white/5 opacity-60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                                  isCompleted 
                                    ? 'bg-emerald-600 text-white' 
                                    : isCurrent 
                                      ? 'bg-indigo-600 text-white' 
                                      : 'bg-slate-800 text-slate-500'
                                }`}>
                                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepItem.step}
                                </div>
                                <div className="space-y-1">
                                  <div className="text-sm font-black text-white">
                                    {stepItem.title}
                                  </div>
                                  <div className="text-xs text-indigo-300 font-bold">
                                    {stepItem.action}
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-relaxed">
                                    {stepItem.explanation}
                                  </p>
                                </div>
                              </div>

                              {isCurrent && (
                                <button
                                  disabled={isExecutingStep}
                                  onClick={() => handleExecuteScenarioStep(stepItem.step)}
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 shrink-0 transition-all"
                                >
                                  {isExecutingStep ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      <span>{isAr ? 'جاري التنفيذ...' : 'Executing...'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="w-3.5 h-3.5" />
                                      <span>{isAr ? 'تنفيذ الأمر' : 'Run Step'}</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {/* CLI snippet */}
                            <div className="mt-2.5 p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-emerald-400 border border-white/5 overflow-x-auto">
                              {stepItem.cli}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Simulated Low-Level Terminal */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4 flex flex-col h-full">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        {isAr ? 'شاشة موجه الأوامر التشخيصي (Live CLI Terminal)' : 'Low-Level Diagnostic Console'}
                      </h4>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="flex-1 p-4 rounded-2xl bg-black font-mono text-[11px] text-slate-300 border border-white/5 space-y-1.5 overflow-y-auto max-h-[480px]">
                    {simulatedConsoleLogs.map((log, i) => (
                      <div 
                        key={i} 
                        className={
                          log.startsWith('>>>') ? 'text-indigo-400 font-bold' :
                          log.startsWith('[SUCCESS]') ? 'text-emerald-400 font-bold' :
                          log.startsWith('[VERIFICATION PASS]') ? 'text-cyan-400 font-black' :
                          log.startsWith('[SECURITY_AUDIT]') ? 'text-slate-400' :
                          'text-slate-300'
                        }
                      >
                        {log}
                      </div>
                    ))}
                  </div>

                  {/* Verification Outcome */}
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      {isAr ? 'معيار نجاح الإصلاح' : 'Expected Clinical Outcome'}
                    </span>
                    <p className="text-slate-300 font-medium">
                      {isAr ? selectedScenario.verificationAr : selectedScenario.verificationEn}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ASSESSMENT & EXAM                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'exam' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white">
                {isAr ? 'اختبار وتقييم مهندس نظم التشغيل والحماية' : 'Operating System & Security Architect Assessment'}
              </h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                {isAr 
                  ? 'اختبر مدى فهمك العميق لآليات BootROM و AVB 2.0 و ARB و Fastbootd و Knox مع شرح تفصيلي فوري لكل إجابة.'
                  : 'Test your low-level comprehension of BootROM, AVB 2.0, eFuses, and userspace fastbootd with immediate explanations.'}
              </p>

              {/* Score Bar */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="text-xs font-mono text-slate-300">
                  {isAr ? 'السؤال الحالي:' : 'Question:'} <span className="font-bold text-indigo-400">{currentQuestionIndex + 1} / {OS_SECURITY_EXAM_QUESTIONS.length}</span>
                </div>
                <div className="text-xs font-mono text-slate-300">
                  {isAr ? 'النتيجة المحققة:' : 'Score:'} <span className="font-bold text-emerald-400">{score} / {answeredCount}</span>
                </div>
              </div>
            </div>

            {/* Question Card */}
            {(() => {
              const q = OS_SECURITY_EXAM_QUESTIONS[currentQuestionIndex];
              return (
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 uppercase">
                      Level: {q.difficulty}
                    </span>
                    <span className="text-xs font-mono text-indigo-400 font-bold">
                      #{q.id}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white leading-relaxed">
                    {isAr ? q.questionAr : q.questionEn}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3 pt-2">
                    {(isAr ? q.optionsAr : q.optionsEn).map((opt, oIdx) => {
                      const isSelected = selectedAnswer === oIdx;
                      const isCorrect = oIdx === q.correctIndex;
                      let btnStyle = 'bg-slate-950 border-white/5 hover:border-white/20 text-slate-300';

                      if (showAnswerFeedback) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-200 font-bold';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={showAnswerFeedback}
                          onClick={() => handleAnswerSubmit(oIdx)}
                          className={`w-full p-4 rounded-2xl border text-start text-xs transition-all flex items-start gap-3 ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white/10 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {['A', 'B', 'C', 'D'][oIdx]}
                          </span>
                          <span className="leading-relaxed">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation */}
                  {showAnswerFeedback && (
                    <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 animate-in fade-in">
                      <div className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4" />
                        {isAr ? 'التفسير العلمي والهندسي' : 'Architectural & Engineering Explanation'}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {isAr ? q.explanationAr : q.explanationEn}
                      </p>

                      <div className="pt-2 flex justify-end">
                        {currentQuestionIndex < OS_SECURITY_EXAM_QUESTIONS.length - 1 ? (
                          <button
                            onClick={handleNextQuestion}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                          >
                            <span>{isAr ? 'السؤال التالي' : 'Next Question'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={handleRestartExam}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                          >
                            <span>{isAr ? 'إعادة الاختبار من البداية' : 'Restart Assessment'}</span>
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

      </main>
    </div>
  );
}
