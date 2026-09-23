import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Zap, 
  Layers, 
  Cpu, 
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { DecisionTreeQuestion, FaultClassificationType } from '../types';
import { FAULT_DECISION_TREE_QUESTIONS } from '../data/faultDecisionTreeData';

interface FaultDecisionTreeProps {
  onNavigateToSoftwareRepair?: (actionPayload?: string) => void;
  onNavigateToHardwareRepair?: (guideId?: string) => void;
  onNavigateToFirmwareMatch?: () => void;
  lang: 'en' | 'ar';
}

export const FaultDecisionTree: React.FC<FaultDecisionTreeProps> = ({
  onNavigateToSoftwareRepair,
  onNavigateToHardwareRepair,
  onNavigateToFirmwareMatch,
  lang
}) => {
  const isAr = lang === 'ar';
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('root');
  const [history, setHistory] = useState<string[]>([]);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [classification, setClassification] = useState<FaultClassificationType | null>(null);

  const currentQuestion = FAULT_DECISION_TREE_QUESTIONS[currentQuestionId] || FAULT_DECISION_TREE_QUESTIONS.root;

  const handleOptionSelect = (option: any) => {
    if (option.diagnosisResult) {
      setDiagnosisResult(option.diagnosisResult);
      setClassification(option.classification || null);
    } else if (option.nextQuestionId) {
      setHistory(prev => [...prev, currentQuestionId]);
      setCurrentQuestionId(option.nextQuestionId);
    }
  };

  const handleReset = () => {
    setCurrentQuestionId('root');
    setHistory([]);
    setDiagnosisResult(null);
    setClassification(null);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevId = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentQuestionId(prevId);
      setDiagnosisResult(null);
      setClassification(null);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl space-y-8 relative overflow-hidden preserve-3d">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shadow-inner">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tight leading-tight">
              {isAr ? 'شجرة اتخاذ القرار الذكية لتصنيف الأعطال' : 'Intelligent Dynamic Fault Classification Tree'}
            </h4>
            <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest opacity-60 block mt-1">
              {isAr ? 'تصنيف دقيق: خلل برمجي | تضارب حماية وفيرموير | عطل دوائر عتادية' : 'Categorizes issue into Software Glitch, Firmware Incompatibility, or Hardware Failure'}
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 shadow-sm"
        >
          <RotateCcw className="w-4 h-4 text-cyan-600" />
          <span>{isAr ? 'إعادة البدء' : 'Reset Wizard'}</span>
        </motion.button>
      </div>

      {/* Main Interactive Stage */}
      {!diagnosisResult ? (
        <div className="space-y-8 py-2 relative z-10">
          {/* Question Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-4 shadow-inner relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
            <span className="text-[10px] font-black font-mono text-cyan-600 uppercase tracking-[0.3em] block italic opacity-80">
              {isAr ? `المرحلة ${history.length + 1} من شجرة التشخيص` : `STAGE ${history.length + 1} OF REASONING ENGINE`}
            </span>
            <h3 className="text-xl font-black text-slate-900 leading-tight italic uppercase tracking-tight">
              {isAr ? currentQuestion.questionAr : currentQuestion.questionEn}
            </h3>
            {currentQuestion.subtextAr && (
              <p className="text-sm text-slate-500 font-medium italic opacity-80">
                {isAr ? currentQuestion.subtextAr : currentQuestion.subtextEn}
              </p>
            )}
          </motion.div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((opt, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01, x: 5 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleOptionSelect(opt)}
                className="w-full p-6 rounded-[1.75rem] bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-500 text-left rtl:text-right transition-all flex items-center justify-between group shadow-lg shadow-slate-200/50"
              >
                <div className="flex items-center gap-5">
                  <span className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-cyan-50 group-hover:text-cyan-700 text-slate-400 flex items-center justify-center text-sm font-black font-mono transition-colors shadow-inner border border-slate-200 group-hover:border-cyan-100">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-black text-slate-700 group-hover:text-slate-900 transition-colors uppercase italic tracking-tight">
                    {isAr ? opt.labelAr : opt.labelEn}
                  </span>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-cyan-600 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </motion.button>
            ))}
          </div>

          {/* Back Step Button */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleBack}
                className="text-[10px] font-black text-slate-400 hover:text-slate-900 flex items-center gap-2 uppercase tracking-[0.2em] transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180 rtl:rotate-0" />
                <span>{isAr ? 'الرجوع للخطوة السابقة' : 'Back to previous step'}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Diagnosis Conclusion Card */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 space-y-8 shadow-inner relative z-10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none opacity-30" />
          
          {/* Classification Banner */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full animate-ping ${
                classification === 'SOFTWARE_GLITCH' ? 'bg-emerald-500' :
                classification === 'FIRMWARE_INCOMPATIBILITY' ? 'bg-cyan-500' : 'bg-rose-500'
              }`} />
              <span className={`text-[11px] font-black font-mono px-4 py-1.5 rounded-xl border uppercase tracking-widest ${
                classification === 'SOFTWARE_GLITCH' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-100' :
                classification === 'FIRMWARE_INCOMPATIBILITY' ? 'bg-cyan-50 text-cyan-700 border-cyan-100 shadow-sm shadow-cyan-100' :
                'bg-rose-50 text-rose-700 border-rose-100 shadow-sm shadow-rose-100'
              }`}>
                {classification === 'SOFTWARE_GLITCH' ? (isAr ? 'SOFTWARE GLITCH' : 'SOFTWARE GLITCH') :
                 classification === 'FIRMWARE_INCOMPATIBILITY' ? (isAr ? 'FIRMWARE / ARB CONFLICT' : 'FIRMWARE INCOMPATIBILITY') :
                 (isAr ? 'HARDWARE CIRCUIT FAILURE' : 'HARDWARE CIRCUIT FAILURE')}
              </span>
            </div>

            <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
              Confidence: <strong className="text-emerald-600">99.4%</strong>
            </span>
          </div>

          {/* Title & Root Cause */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight leading-tight">
              {isAr ? diagnosisResult.titleAr : diagnosisResult.titleEn}
            </h3>
            <div className="p-6 rounded-[1.5rem] bg-white border border-slate-200 text-sm text-slate-600 leading-relaxed shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-600 opacity-50" />
              <strong className="text-cyan-700 block mb-2 font-black uppercase text-[10px] tracking-widest italic">{isAr ? 'السبب الجذري الهندسي (Root Cause):' : 'Engineering Root Cause:'}</strong>
              <p className="font-medium italic leading-relaxed">{isAr ? diagnosisResult.rootCauseAr : diagnosisResult.rootCauseEn}</p>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            {classification === 'SOFTWARE_GLITCH' && (
              <motion.button
                whileHover={{ scale: 1.02, translateY: -3, boxShadow: "0 20px 40px rgba(16,185,129,0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigateToSoftwareRepair?.(diagnosisResult.actionPayload)}
                className="w-full py-5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl transition-all"
              >
                <Zap className="w-5 h-5 fill-white shadow-glow" />
                <span>{isAr ? 'تشغيل مسار الإصلاح البرمجي الفوري' : 'TRIGGER AUTO-REPAIR'}</span>
              </motion.button>
            )}

            {classification === 'FIRMWARE_INCOMPATIBILITY' && (
              <motion.button
                whileHover={{ scale: 1.02, translateY: -3, boxShadow: "0 20px 40px rgba(6,182,212,0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigateToFirmwareMatch?.()}
                className="w-full py-5 bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl transition-all"
              >
                <ShieldCheck className="w-5 h-5 fill-white shadow-glow" />
                <span>{isAr ? 'مطابقة الفلاشة المتوافقة وحماية ARB' : 'FIND MATCHED FIRMWARE'}</span>
              </motion.button>
            )}

            {classification === 'HARDWARE_FAILURE' && (
              <motion.button
                whileHover={{ scale: 1.02, translateY: -3, boxShadow: "0 20px 40px rgba(99,102,241,0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigateToHardwareRepair?.(diagnosisResult.actionPayload)}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl transition-all"
              >
                <Wrench className="w-5 h-5 fill-white shadow-glow" />
                <span>{isAr ? 'فتح مخطط البوردة والمايكروسولدرينغ' : 'OPEN SCHEMATICS'}</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
