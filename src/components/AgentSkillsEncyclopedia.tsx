import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Terminal, 
  Wrench, 
  Zap, 
  Globe, 
  Search, 
  Code, 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  ExternalLink, 
  Play, 
  Activity, 
  Flame, 
  Smartphone,
  ChevronRight,
  ChevronDown,
  HardDrive,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  Award,
  CheckSquare,
  Square,
  X,
  SlidersHorizontal,
  GraduationCap,
  Terminal as TerminalIcon
} from 'lucide-react';
import { 
  AGENT_SKILLS_ENCYCLOPEDIA, 
  SKILL_DOMAINS_INFO, 
  SKILL_QUIZ_QUESTIONS,
  AgentSkillItem, 
  SkillDomain,
  SkillQuizQuestion
} from '../data/agentSkillsEncyclopedia';

interface AgentSkillsEncyclopediaProps {
  lang: 'en' | 'ar';
  onNavigateToTool?: (tabId: string) => void;
}

type EncyclopediaViewMode = 'library' | 'code-lab' | 'quiz';

export const AgentSkillsEncyclopedia: React.FC<AgentSkillsEncyclopediaProps> = ({ 
  lang, 
  onNavigateToTool 
}) => {
  const isAr = lang === 'ar';
  
  // Navigation View Mode
  const [viewMode, setViewMode] = useState<EncyclopediaViewMode>('library');

  // Filter States
  const [selectedDomain, setSelectedDomain] = useState<SkillDomain | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(AGENT_SKILLS_ENCYCLOPEDIA[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Completed steps checklist tracker: Record<skillId, Set<stepIndex>>
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});

  // Interactive AI Consultation Simulator
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isSimulatingAi, setIsSimulatingAi] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    skillTitle: string;
    adviceAr: string;
    adviceEn: string;
    code: string;
    stepsAr: string[];
    stepsEn: string[];
  } | null>(null);

  // Code Sandbox State
  const [selectedSandboxSkillId, setSelectedSandboxSkillId] = useState<string>(AGENT_SKILLS_ENCYCLOPEDIA[0].id);
  const [isExecutingSandbox, setIsExecutingSandbox] = useState(false);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Filter skills based on domain, level, and search query
  const filteredSkills = useMemo(() => {
    return AGENT_SKILLS_ENCYCLOPEDIA.filter(skill => {
      const matchesDomain = selectedDomain === 'all' || skill.category === selectedDomain;
      const matchesLevel = selectedLevel === 'all' || skill.level === selectedLevel;
      const q = searchQuery.toLowerCase().trim();
      
      if (!q) return matchesDomain && matchesLevel;

      const matchesText = 
        skill.titleAr.toLowerCase().includes(q) ||
        skill.titleEn.toLowerCase().includes(q) ||
        skill.descriptionAr.toLowerCase().includes(q) ||
        skill.descriptionEn.toLowerCase().includes(q) ||
        skill.tags.some(t => t.toLowerCase().includes(q)) ||
        skill.chipsetsOrLanguages.some(c => c.toLowerCase().includes(q)) ||
        skill.codeSnippet.language.toLowerCase().includes(q);

      return matchesDomain && matchesLevel && matchesText;
    });
  }, [selectedDomain, selectedLevel, searchQuery]);

  const toggleStepCompleted = (skillId: string, stepIndex: number) => {
    setCompletedSteps(prev => {
      const current = prev[skillId] || [];
      const updated = current.includes(stepIndex)
        ? current.filter(i => i !== stepIndex)
        : [...current, stepIndex];
      return { ...prev, [skillId]: updated };
    });
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunAiConsultation = (skill: AgentSkillItem) => {
    setIsSimulatingAi(true);
    setAiPromptInput(skill.aiTroubleshootingPrompt);

    setTimeout(() => {
      setAiResponse({
        skillTitle: isAr ? skill.titleAr : skill.titleEn,
        adviceAr: `استجابة الوكيل الذكي ApexAgent [وحدة الخبرة: ${skill.titleAr}]:\nبناءً على المعمارية الهندسية، تم تحديد خطة العمل بدقة 99.8%. لا يوجد خطر فقدان بيانات إذا تم الالتزام بتسلسل الأوامر أدناه.`,
        adviceEn: `ApexAgent AI Response [Expertise Unit: ${skill.titleEn}]:\nDeterministic architecture sequence synthesized at 99.8% precision. Zero data loss guaranteed under strict adherence to the execution block below.`,
        code: skill.codeSnippet.code,
        stepsAr: skill.practicalStepsAr,
        stepsEn: skill.practicalStepsEn
      });
      setIsSimulatingAi(false);
    }, 850);
  };

  const handleCustomAiQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput.trim()) return;

    setIsSimulatingAi(true);
    setTimeout(() => {
      const foundSkill = AGENT_SKILLS_ENCYCLOPEDIA.find(s => 
        aiPromptInput.toLowerCase().includes(s.tags[0].toLowerCase()) || 
        aiPromptInput.toLowerCase().includes(s.chipsetsOrLanguages[0].toLowerCase())
      ) || AGENT_SKILLS_ENCYCLOPEDIA[0];

      setAiResponse({
        skillTitle: isAr ? foundSkill.titleAr : foundSkill.titleEn,
        adviceAr: `تحليل ApexAgent للاستفسار: "${aiPromptInput}"\nتمت مراجعة قاعدة بيانات الأنظمة والمخططات. الإجراء الموصى به يعتمد على عزل المسار المصاب واستخدام البروتوكول البرمجي الأدنى لضمان عدم حدوث Hard Brick.`,
        adviceEn: `ApexAgent AI Analysis for Query: "${aiPromptInput}"\nSynthesized across OEM schema and low-level protocols. Safe isolated execution recommended with zero-voltage leak guarantee.`,
        code: foundSkill.codeSnippet.code,
        stepsAr: foundSkill.practicalStepsAr,
        stepsEn: foundSkill.practicalStepsEn
      });
      setIsSimulatingAi(false);
    }, 950);
  };

  // Run Sandbox Emulation
  const runSandboxExecution = (skill: AgentSkillItem) => {
    setIsExecutingSandbox(true);
    setSandboxLogs([
      `[INIT] Launching virtual isolated runtime for ${skill.codeSnippet.language.toUpperCase()}...`,
      `[MEMORY] Allocating safe sandbox memory buffer: 64MB zero-copy heap.`,
      `[PROBE] Target Silicon ID: Verified. Bus clock locked at 480Mbps.`
    ]);

    setTimeout(() => {
      setSandboxLogs(prev => [
        ...prev,
        `[EXEC] Parsing instructions for: "${skill.codeSnippet.title}"`,
        `[PAYLOAD] Transmitting handshake verification packets...`,
        `[USB-BULK] Streaming 1024-byte block sequences without pipe stall.`
      ]);
    }, 500);

    setTimeout(() => {
      setSandboxLogs(prev => [
        ...prev,
        `[STATUS] Return Code: 0x00000000 (STATUS_SUCCESS)`,
        `[RESULT] Execution verified! Telemetry asserts 100% operational fidelity.`,
        `[READY] Device returned to quiescent state.`
      ]);
      setIsExecutingSandbox(false);
    }, 1200);
  };

  // Calculate Quiz Score
  const quizScore = useMemo(() => {
    let score = 0;
    SKILL_QUIZ_QUESTIONS.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  }, [quizAnswers]);

  const selectedSandboxSkill = useMemo(() => {
    return AGENT_SKILLS_ENCYCLOPEDIA.find(s => s.id === selectedSandboxSkillId) || AGENT_SKILLS_ENCYCLOPEDIA[0];
  }, [selectedSandboxSkillId]);

  return (
    <div className="p-6 lg:p-10 space-y-10 bg-slate-50/40 min-h-screen">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 lg:p-12 text-white shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.18),transparent_70%)]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] font-bold tracking-widest uppercase flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                ApexAgent Neural Brain v5.2
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
                17 CLINICAL MODULES & POLYGLOT
              </span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">
              {isAr ? 'موسوعة خبرات وكيل الذكاء الاصطناعي الشاملة' : 'ApexAgent Comprehensive Engineering Encyclopedia'}
            </h1>

            <p className="text-slate-300 text-sm lg:text-base leading-relaxed font-normal">
              {isAr 
                ? 'المرجع الأكبر والمهندس الذكي المدمج: إتقان شامل لصيانة الهواتف سوفت وير وهارد وير، وهندسة البرمجيات المنخفضة، والتعامل مع كافة لغات البرمجة (C, C++, Rust, Python, Assembly, Bash, Go) وكافة أنظمة التشغيل (AOSP, iOS SecureROM, Linux Kernel, Windows NT).'
                : 'The supreme intelligence repository for mobile phone engineering: Comprehensive mastery of Mobile Software, Micro-soldering Hardware, Tooling & Protocol Engineering, and all Programming Languages (C, C++, Rust, Python, ARM64 Assembly, Bash, Go) across Android, iOS, Linux, and Windows NT.'}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">
                  {isAr ? 'المجالات الرئيسية' : 'SKILL DOMAINS'}
                </span>
                <span className="text-xl font-black text-indigo-400 font-mono mt-0.5 block">4 Core Fields</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">
                  {isAr ? 'الوحدات الهندسية' : 'ACTIVE MODULES'}
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">17 Architect Units</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">
                  {isAr ? 'لغات البرمجة' : 'SUPPORTED LANGUAGES'}
                </span>
                <span className="text-xl font-black text-cyan-400 font-mono mt-0.5 block">C, Rust, Py, Go, ASM</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">
                  {isAr ? 'الأنظمة والمنصات' : 'TARGET PLATFORMS'}
                </span>
                <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">AOSP / iOS / Linux</span>
              </div>
            </div>
          </div>

          {/* Quick AI Question Simulator Widget */}
          <div className="w-full lg:w-[380px] bg-slate-900/90 rounded-3xl border border-white/10 p-5 space-y-3.5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black uppercase text-indigo-300 tracking-wider">
                  {isAr ? 'استشارة فورية للوكيل' : 'Live Agent Query'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">READY</span>
            </div>

            <form onSubmit={handleCustomAiQuery} className="space-y-2.5">
              <textarea
                value={aiPromptInput}
                onChange={(e) => setAiPromptInput(e.target.value)}
                placeholder={isAr 
                  ? 'اكتب سؤالك الهندسي (سوفت وير، هارد وير، كود C أو بايثون، استخراج ملفات...)'
                  : 'Ask any hardware/software repair question, C/Rust code snippet, partition carve...'}
                className="w-full h-20 p-3 bg-slate-950/80 rounded-xl border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
              />
              <button
                type="submit"
                disabled={isSimulatingAi || !aiPromptInput.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
              >
                {isSimulatingAi ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>{isAr ? 'جاري المعالجة العصبية...' : 'Neural Processing...'}</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>{isAr ? 'استشارة الوكيل الذكي' : 'Consult ApexAgent'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main View Mode Selector (Tabs) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 rounded-2xl">
          <button
            onClick={() => setViewMode('library')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              viewMode === 'library'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={16} />
            <span>{isAr ? 'مكتبة المهارات والموسوعة' : 'Skills Library & Dossiers'}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-mono">
              {AGENT_SKILLS_ENCYCLOPEDIA.length}
            </span>
          </button>

          <button
            onClick={() => setViewMode('code-lab')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              viewMode === 'code-lab'
                ? 'bg-white text-cyan-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TerminalIcon size={16} />
            <span>{isAr ? 'مختبر الأكواد والمحاكي' : 'Code Lab & Emulation'}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-cyan-100 text-cyan-700 text-[10px] font-mono">
              Live
            </span>
          </button>

          <button
            onClick={() => setViewMode('quiz')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              viewMode === 'quiz'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap size={16} />
            <span>{isAr ? 'مركز اختبار وتقييم الخبرات' : 'Technician Certification Exam'}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-mono">
              {SKILL_QUIZ_QUESTIONS.length} Qs
            </span>
          </button>

          {onNavigateToTool && (
            <button
              onClick={() => onNavigateToTool('os-security-lab')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500 transition-all ml-1"
            >
              <Layers size={16} />
              <span>{isAr ? 'مختبر بنية نظم التشغيل والحمايات' : 'OS & Security Lab'}</span>
            </button>
          )}
        </div>

        {viewMode === 'library' && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>{isAr ? `عرض ${filteredSkills.length} من أصل ${AGENT_SKILLS_ENCYCLOPEDIA.length} مهارة` : `Showing ${filteredSkills.length} of ${AGENT_SKILLS_ENCYCLOPEDIA.length} modules`}</span>
          </div>
        )}
      </div>

      {/* AI Consultation Response Modal / Banner (if active) */}
      <AnimatePresence>
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 lg:p-8 rounded-3xl bg-slate-900 border-2 border-indigo-500/40 text-white shadow-2xl space-y-6 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-black block">
                    {isAr ? 'تحليل هندسي مباشر من ApexAgent' : 'Synthesized ApexAgent Solution'}
                  </span>
                  <h3 className="text-xl font-black">{aiResponse.skillTitle}</h3>
                </div>
              </div>

              <button
                onClick={() => setAiResponse(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <X size={14} />
                <span>{isAr ? 'إغلاق' : 'Dismiss'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4">
                <h4 className="text-xs font-black uppercase text-indigo-300 tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  {isAr ? 'خطوات التنفيذ الميدانية المعتمدة' : 'Clinical Execution Steps'}
                </h4>
                <div className="space-y-2">
                  {(isAr ? aiResponse.stepsAr : aiResponse.stepsEn).map((st, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed">
                      <span className="w-5 h-5 rounded-md bg-indigo-500/30 text-indigo-300 font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-cyan-300 tracking-wider flex items-center gap-2">
                    <Code size={16} className="text-cyan-400" />
                    {isAr ? 'الكود المولد للعملية' : 'Synthesized Protocol Payload'}
                  </h4>
                  <button
                    onClick={() => handleCopyCode('ai-response-code', aiResponse.code)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-mono font-bold text-slate-300 transition-colors"
                  >
                    {copiedId === 'ai-response-code' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedId === 'ai-response-code' ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الكود' : 'Copy Code')}
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-black/80 border border-white/10 font-mono text-xs text-emerald-400 overflow-x-auto max-h-64 custom-scrollbar whitespace-pre leading-relaxed shadow-inner">
                  {aiResponse.code}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODE 1: SKILLS LIBRARY */}
      {/* ========================================================================= */}
      {viewMode === 'library' && (
        <div className="space-y-8">
          {/* Domain Selectors & Filters */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Domain Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedDomain('all')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                    selectedDomain === 'all'
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {isAr ? 'كافة المهارات (17)' : 'All 4 Domains (17)'}
                </button>

                {(Object.keys(SKILL_DOMAINS_INFO) as SkillDomain[]).map((dom) => {
                  const info = SKILL_DOMAINS_INFO[dom];
                  const isSelected = selectedDomain === dom;
                  return (
                    <button
                      key={dom}
                      onClick={() => setSelectedDomain(dom)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>{isAr ? info.titleAr : info.titleEn}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {info.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث بالمعالج، اللغة (C, Rust)، أو الحماية...' : 'Search chip, language, protocol, tool...'}
                  className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Level Quick Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0">
                {isAr ? 'المستوى الهندسي:' : 'Filter Level:'}
              </span>
              {['all', 'Architect', 'Master', 'Expert', 'Advanced'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1 rounded-xl font-mono text-[11px] font-semibold transition-all shrink-0 ${
                    selectedLevel === lvl
                      ? 'bg-indigo-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {lvl === 'all' ? (isAr ? 'جميع المستويات' : 'All Levels') : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Main Skills Grid */}
          <div className="grid grid-cols-1 gap-6">
            {filteredSkills.map((skill) => {
              const isExpanded = expandedSkillId === skill.id;
              const domainInfo = SKILL_DOMAINS_INFO[skill.category];
              const stepsDone = completedSteps[skill.id] || [];
              const totalSteps = skill.practicalStepsAr.length;
              const progressPct = Math.round((stepsDone.length / totalSteps) * 100);

              return (
                <motion.div
                  key={skill.id}
                  layout
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                    isExpanded 
                      ? 'bg-white border-indigo-200 shadow-2xl ring-2 ring-indigo-500/10' 
                      : 'bg-white/90 hover:bg-white border-slate-200 shadow-sm hover:shadow-lg'
                  }`}
                >
                  {/* Card Header (Always visible) */}
                  <div 
                    onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                    className="p-6 lg:p-8 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-6 select-none"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${domainInfo.color} flex items-center justify-center text-white shadow-md shrink-0 p-3`}>
                        {skill.category === 'software-repair' && <Terminal size={24} />}
                        {skill.category === 'hardware-repair' && <Wrench size={24} />}
                        {skill.category === 'software-engineering' && <Zap size={24} />}
                        {skill.category === 'languages-and-os' && <Globe size={24} />}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white font-mono text-[10px] font-black uppercase tracking-wider">
                            {skill.badge}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-100 uppercase">
                            LEVEL: {skill.level}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {isAr ? domainInfo.titleAr : domainInfo.titleEn}
                          </span>
                        </div>

                        <h3 className="text-lg lg:text-xl font-black text-slate-900">
                          {isAr ? skill.titleAr : skill.titleEn}
                        </h3>

                        <p className="text-slate-500 text-xs leading-relaxed max-w-4xl font-normal line-clamp-2">
                          {isAr ? skill.descriptionAr : skill.descriptionEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 self-end lg:self-center">
                      {/* Interactive Step Progress Indicator */}
                      {stepsDone.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-mono text-emerald-700 font-bold">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>{stepsDone.length}/{totalSteps} ({progressPct}%)</span>
                        </div>
                      )}

                      <div className="hidden sm:flex flex-wrap gap-1.5 max-w-[200px] justify-end">
                        {skill.chipsetsOrLanguages.slice(0, 3).map((chip, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono">
                            {chip}
                          </span>
                        ))}
                      </div>

                      <button
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isExpanded 
                            ? 'bg-indigo-600 text-white rotate-90 shadow-md' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detailed Dossier */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-slate-100 p-6 lg:p-8 space-y-8 bg-slate-50/50"
                      >
                        {/* Tags row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
                            {isAr ? 'الوسوم والتقنيات:' : 'Keywords & Tech:'}
                          </span>
                          {skill.tags.map((tag, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-sm">
                              #{tag}
                            </span>
                          ))}
                          <div className="h-4 w-px bg-slate-200 mx-2" />
                          {skill.chipsetsOrLanguages.map((chip, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-mono font-bold">
                              {chip}
                            </span>
                          ))}
                        </div>

                        {/* Principles vs Steps Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Principles */}
                          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                            <div className="flex items-center gap-2.5 text-indigo-600">
                              <BookOpen size={18} />
                              <h4 className="text-xs font-black uppercase tracking-wider">
                                {isAr ? 'الأسس والمبادئ الهندسية العميقة' : 'Engineering Core Foundations'}
                              </h4>
                            </div>
                            <ul className="space-y-2.5">
                              {(isAr ? skill.principlesAr : skill.principlesEn).map((pr, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                  <span>{pr}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Practical Steps with Interactive Checklist */}
                          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                            <div className="flex items-center justify-between text-emerald-600">
                              <div className="flex items-center gap-2.5">
                                <CheckCircle2 size={18} />
                                <h4 className="text-xs font-black uppercase tracking-wider">
                                  {isAr ? 'خطوات العمل الميداني (قائمة تدقيق تفاعلية)' : 'Clinical Execution Steps (Interactive Checklist)'}
                                </h4>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                {stepsDone.length}/{totalSteps} {isAr ? 'مكتمل' : 'Done'}
                              </span>
                            </div>

                            <ol className="space-y-2">
                              {(isAr ? skill.practicalStepsAr : skill.practicalStepsEn).map((st, idx) => {
                                const isChecked = stepsDone.includes(idx);
                                return (
                                  <li 
                                    key={idx} 
                                    onClick={() => toggleStepCompleted(skill.id, idx)}
                                    className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer select-none leading-relaxed ${
                                      isChecked 
                                        ? 'bg-emerald-50 text-emerald-800 line-through opacity-80' 
                                        : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <button className="mt-0.5 text-slate-400 hover:text-emerald-600 shrink-0">
                                      {isChecked ? (
                                        <CheckSquare size={16} className="text-emerald-600" />
                                      ) : (
                                        <Square size={16} />
                                      )}
                                    </button>
                                    <span>{st}</span>
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        </div>

                        {/* Code Snippet Box with copy and direct sandbox button */}
                        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white space-y-3 shadow-xl">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2.5">
                              <FileCode className="text-cyan-400" size={18} />
                              <div>
                                <span className="text-xs font-black text-slate-200 uppercase tracking-wider block">
                                  {skill.codeSnippet.title}
                                </span>
                                <span className="text-[10px] font-mono text-cyan-400 uppercase">
                                  Language: {skill.codeSnippet.language.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSandboxSkillId(skill.id);
                                  setViewMode('code-lab');
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-bold transition-all border border-cyan-500/30"
                              >
                                <Play size={12} />
                                <span>{isAr ? 'محاكاة في المختبر' : 'Run in Sandbox'}</span>
                              </button>

                              <button
                                onClick={() => handleCopyCode(skill.id, skill.codeSnippet.code)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-slate-200 transition-colors"
                              >
                                {copiedId === skill.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                <span>{copiedId === skill.id ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الكود' : 'Copy Code')}</span>
                              </button>
                            </div>
                          </div>

                          <div className="font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed p-2 custom-scrollbar max-h-64">
                            {skill.codeSnippet.code}
                          </div>

                          <p className="text-[11px] text-slate-400 italic pt-1 border-t border-white/5">
                            {isAr ? skill.codeSnippet.descriptionAr : skill.codeSnippet.descriptionEn}
                          </p>
                        </div>

                        {/* Case Study Card */}
                        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                          <div className="flex items-center gap-2 text-amber-700">
                            <AlertTriangle size={16} />
                            <h5 className="text-xs font-black uppercase tracking-wider">
                              {isAr ? 'حالة دراسية واقعية وحلها المعتمد' : 'Real-World Clinical Case Study'}
                            </h5>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-white border border-amber-200/50 space-y-1">
                              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">
                                {isAr ? 'العطل / المشكلة' : 'SYMPTOM'}
                              </span>
                              <p className="text-slate-700 leading-relaxed font-medium">
                                {isAr ? skill.caseStudy.problemAr : skill.caseStudy.problemEn}
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white border border-emerald-200/50 space-y-1">
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
                                {isAr ? 'الحل الهندسي المحقق' : 'ENGINEERING FIX'}
                              </span>
                              <p className="text-slate-700 leading-relaxed font-medium">
                                {isAr ? skill.caseStudy.solutionAr : skill.caseStudy.solutionEn}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Footer: AI Simulation & Tool Jumper */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                          <button
                            onClick={() => handleRunAiConsultation(skill)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/30"
                          >
                            <Sparkles size={15} />
                            <span>{isAr ? 'تشغيل استشارة الذكاء الاصطناعي لهذه المهارة' : 'Run ApexAgent AI Diagnostic on this Skill'}</span>
                          </button>

                          {onNavigateToTool && skill.relatedTabId && (
                            <button
                              onClick={() => onNavigateToTool(skill.relatedTabId)}
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all"
                            >
                              <span>{isAr ? `الانتقال المباشر لأداة المنصة (${skill.relatedTabId})` : `Open Linked OmniFix Tool (${skill.relatedTabId})`}</span>
                              <ExternalLink size={14} className="text-slate-500" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CODE LAB & EMULATION SANDBOX */}
      {/* ========================================================================= */}
      {viewMode === 'code-lab' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                  BARE-METAL SCRIPTING & PROTOCOL LABORATORY
                </span>
                <h3 className="text-2xl font-black">
                  {isAr ? 'مختبر الأكواد ومحاكي التنفيذ الحي' : 'Live Code & Protocol Sandbox'}
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  {isAr 
                    ? 'اختر أي كود من وحدات الموسوعة (C, Rust, Python, Go, ARM64, Bash) لاختبار تسلسل الحزم ومحاكاة الاستجابة الحية لمنفذ الهاتف.'
                    : 'Select any snippet across the 17 modules to simulate low-level packet handshakes and live endpoint responses.'}
                </p>
              </div>

              {/* Skill Selector for Sandbox */}
              <select
                value={selectedSandboxSkillId}
                onChange={(e) => {
                  setSelectedSandboxSkillId(e.target.value);
                  setSandboxLogs([]);
                }}
                className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 max-w-sm"
              >
                {AGENT_SKILLS_ENCYCLOPEDIA.map((sk) => (
                  <option key={sk.id} value={sk.id}>
                    [{sk.codeSnippet.language.toUpperCase()}] {isAr ? sk.titleAr : sk.titleEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Code Viewer Panel */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <FileCode size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{selectedSandboxSkill.codeSnippet.title}</h4>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      Syntax: {selectedSandboxSkill.codeSnippet.language} | Level: {selectedSandboxSkill.level}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyCode('sandbox-active-code', selectedSandboxSkill.codeSnippet.code)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-mono text-slate-300 transition-colors"
                >
                  {copiedId === 'sandbox-active-code' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedId === 'sandbox-active-code' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="font-mono text-xs text-emerald-400 bg-black/60 p-4 rounded-2xl overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar max-h-96">
                {selectedSandboxSkill.codeSnippet.code}
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-400 italic">
                  {isAr ? selectedSandboxSkill.codeSnippet.descriptionAr : selectedSandboxSkill.codeSnippet.descriptionEn}
                </p>

                <button
                  onClick={() => runSandboxExecution(selectedSandboxSkill)}
                  disabled={isExecutingSandbox}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-600/30 disabled:opacity-50 transition-all shrink-0"
                >
                  {isExecutingSandbox ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>{isAr ? 'جاري المحاكاة...' : 'Simulating...'}</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      <span>{isAr ? 'بدء المحاكاة الحية' : 'Run Sandbox Simulation'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Virtual Terminal Output */}
            <div className="lg:col-span-5 bg-black border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <TerminalIcon size={16} className="text-emerald-400" />
                    <span className="text-xs font-mono font-bold uppercase text-slate-300">
                      VIRTUAL TTY / USB STREAM
                    </span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="font-mono text-[11px] space-y-2 min-h-64 max-h-96 overflow-y-auto custom-scrollbar p-2">
                  {sandboxLogs.length === 0 ? (
                    <div className="text-slate-500 italic p-4 text-center">
                      {isAr 
                        ? 'اضغط على "بدء المحاكاة الحية" لتنفيذ الكود ومراقبة سجلات الحزم وحالة المنفذ.' 
                        : 'Click "Run Sandbox Simulation" to watch low-level packet dispatch.'}
                    </div>
                  ) : (
                    sandboxLogs.map((log, idx) => (
                      <div 
                        key={idx} 
                        className={`leading-relaxed ${
                          log.includes('CRITICAL') || log.includes('ALERT')
                            ? 'text-rose-400 font-bold'
                            : log.includes('SUCCESS') || log.includes('READY')
                            ? 'text-emerald-400 font-bold'
                            : log.includes('EXEC') || log.includes('USB')
                            ? 'text-cyan-300'
                            : 'text-slate-300'
                        }`}
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedSandboxSkill.relatedTabId && onNavigateToTool && (
                <button
                  onClick={() => onNavigateToTool(selectedSandboxSkill.relatedTabId)}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <span>{isAr ? `فتح في أداة ${selectedSandboxSkill.relatedTabId}` : `Open in ${selectedSandboxSkill.relatedTabId}`}</span>
                  <ExternalLink size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: TECHNICIAN CERTIFICATION QUIZ */}
      {/* ========================================================================= */}
      {viewMode === 'quiz' && (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 text-white space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Award size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-black block">
                  APEXAGENT CERTIFIED HARDWARE & SOFTWARE ENGINEER
                </span>
                <h3 className="text-2xl font-black">
                  {isAr ? 'اختبار تقييم الخبرات الهندسية الشامل' : 'Comprehensive Engineering Competency Exam'}
                </h3>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              {isAr 
                ? 'اختبار حقيقي معد للمهندسين والفنيين لاختبار المعرفة العميقة في بروتوكولات EDL, قياسات الممانعة VPH, أوامر أسمبلي ARM64, وتشفير AVB 2.0.'
                : 'Rigorous real-world examination testing bare-metal Qualcomm Sahara protocols, VPH diode mode impedances, ARM64 opcodes, and AVB 2.0 cryptography.'}
            </p>

            {quizSubmitted && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                    {isAr ? 'نتيجة الاختبار النهائية' : 'Examination Result'}
                  </span>
                  <p className="text-2xl font-black text-white font-mono mt-0.5">
                    {quizScore} / {SKILL_QUIZ_QUESTIONS.length} ({Math.round((quizScore / SKILL_QUIZ_QUESTIONS.length) * 100)}%)
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black uppercase">
                    {quizScore >= 5 ? (isAr ? 'مؤهل - درجة مهندس كبير' : 'Master Engineer') : (isAr ? 'بحاجة لمزيد من المراجعة' : 'Requires Review')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {SKILL_QUIZ_QUESTIONS.map((q, idx) => {
              const selectedOption = quizAnswers[q.id];
              const isAnswered = selectedOption !== undefined;
              const isCorrect = selectedOption === q.correctIndex;

              return (
                <div 
                  key={q.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    quizSubmitted
                      ? isCorrect
                        ? 'bg-emerald-50/60 border-emerald-300 shadow-sm'
                        : 'bg-rose-50/60 border-rose-300 shadow-sm'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-mono text-[10px] font-bold uppercase">
                        Question #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                        DOMAIN: {q.category}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900">
                      {isAr ? q.questionAr : q.questionEn}
                    </h4>

                    <div className="grid grid-cols-1 gap-2.5 pt-2">
                      {(isAr ? q.optionsAr : q.optionsEn).map((opt, optIdx) => {
                        const isChosen = selectedOption === optIdx;
                        let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';

                        if (isChosen) {
                          btnStyle = 'bg-indigo-600 text-white border-indigo-600 shadow-md';
                        }

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                          } else if (isChosen && !isCorrect) {
                            btnStyle = 'bg-rose-600 text-white border-rose-600';
                          } else {
                            btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                            className={`p-3.5 rounded-2xl border text-xs text-left transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle2 size={16} className="text-white shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-1 mt-3">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">
                          {isAr ? 'التفسير العلمي والهندسي' : 'Scientific Explanation'}
                        </span>
                        <p className="text-slate-600 leading-relaxed font-medium">
                          {isAr ? q.explanationAr : q.explanationEn}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between pt-4">
              {!quizSubmitted ? (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length < SKILL_QUIZ_QUESTIONS.length}
                  className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-black uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <Award size={18} />
                  <span>{isAr ? 'تسليم الاختبار واعتماد النتيجة' : 'Submit & Grade Exam'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-black uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  <span>{isAr ? 'إعادة الاختبار' : 'Retake Exam'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
