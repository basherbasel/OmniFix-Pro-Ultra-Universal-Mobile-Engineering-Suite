import React, { useState } from 'react';
import { 
  Wrench, 
  Cpu, 
  Zap, 
  Flame, 
  ShieldAlert, 
  Gauge, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Search, 
  Layers, 
  Thermometer, 
  Maximize2,
  ChevronRight,
  Activity,
  Compass,
  ArrowRight
} from 'lucide-react';
import { 
  ConnectedDevice, 
  HardwareRepairGuide, 
  MultimeterTestPoint, 
  BoardviewChip,
  HardwareCategory 
} from '../types';
import { HARDWARE_REPAIR_GUIDES } from '../data/hardwareRepairGuides';
import { InteractivePcbBitmapExplorer } from './InteractivePcbBitmapExplorer';
import { VoltageBridge } from './VoltageBridge';
import { audioSynth } from '../utils/audioSynth';

interface HardwareMicroSolderingEngineProps {
  device: ConnectedDevice;
  onSelectSoftwareRepair?: (repairId: string) => void;
  initialGuideId?: string;
  lang: 'en' | 'ar';
}

export const HardwareMicroSolderingEngine: React.FC<HardwareMicroSolderingEngineProps> = ({
  device,
  onSelectSoftwareRepair,
  initialGuideId,
  lang
}) => {
  const isAr = lang === 'ar';
  const [subTab, setSubTab] = useState<'bitmap' | 'voltage-bridge' | 'schematics'>('bitmap');
  const [selectedGuideId, setSelectedGuideId] = useState<string>(
    initialGuideId || HARDWARE_REPAIR_GUIDES[0].id
  );

  React.useEffect(() => {
    if (initialGuideId) {
      setSelectedGuideId(initialGuideId);
      const matched = HARDWARE_REPAIR_GUIDES.find(g => g.id === initialGuideId);
      if (matched) {
        if (matched.testPoints?.[0]) setSelectedTestPoint(matched.testPoints[0]);
        if (matched.boardChips?.[0]) setSelectedChip(matched.boardChips[0]);
      }
    }
  }, [initialGuideId]);
  const [activeCategory, setActiveCategory] = useState<HardwareCategory | 'ALL'>('ALL');
  const [selectedTestPoint, setSelectedTestPoint] = useState<MultimeterTestPoint | null>(
    HARDWARE_REPAIR_GUIDES[0].testPoints[0]
  );
  const [selectedChip, setSelectedChip] = useState<BoardviewChip | null>(
    HARDWARE_REPAIR_GUIDES[0].boardChips[0]
  );
  const [meterMode, setMeterMode] = useState<'DIODE' | 'VOLTAGE' | 'RESISTANCE'>('DIODE');
  const [simulatedProbeState, setSimulatedProbeState] = useState<'NORMAL' | 'SHORT' | 'OPEN'>('NORMAL');
  const [searchQuery, setSearchQuery] = useState('');

  const activeGuide = HARDWARE_REPAIR_GUIDES.find(g => g.id === selectedGuideId) || HARDWARE_REPAIR_GUIDES[0];

  const filteredGuides = HARDWARE_REPAIR_GUIDES.filter(guide => {
    const matchesCategory = activeCategory === 'ALL' || guide.category === activeCategory;
    const matchesSearch = 
      guide.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.affectedComponents.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate live probe readout based on state and selected testpoint
  const getMultimeterReading = () => {
    if (!selectedTestPoint) return { text: '---', unit: '', status: 'IDLE' };
    
    if (meterMode === 'DIODE') {
      if (simulatedProbeState === 'SHORT') {
        return { text: '0.002', unit: 'V (SHORT)', status: 'CRITICAL' };
      }
      if (simulatedProbeState === 'OPEN') {
        return { text: 'O.L', unit: '(OPEN LINE)', status: 'WARNING' };
      }
      return { 
        text: ((selectedTestPoint.diodeModeToleranceMin + selectedTestPoint.diodeModeToleranceMax) / 2).toFixed(3), 
        unit: 'V (NORMAL)', 
        status: 'HEALTHY' 
      };
    } else if (meterMode === 'VOLTAGE') {
      if (simulatedProbeState === 'SHORT') {
        return { text: '0.00', unit: 'V (COLLAPSED)', status: 'CRITICAL' };
      }
      return { text: selectedTestPoint.voltageWorking.split(' ')[0], unit: 'V DC', status: 'HEALTHY' };
    } else {
      if (simulatedProbeState === 'SHORT') {
        return { text: '0.4', unit: 'Ω (DEAD SHORT)', status: 'CRITICAL' };
      }
      return { text: selectedTestPoint.resistanceToGnd, unit: '', status: 'HEALTHY' };
    }
  };

  const reading = getMultimeterReading();

  return (
    <div className="space-y-4">
      {/* Top Banner: Hardware Engineering Suite Intro */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isAr ? 'دليل الإصلاح العتادي والمخططات التفاعلية والمايكروسولدرينغ' : 'Hardware Repair, Boardview & Micro-Soldering Guide Engine'}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                SCHEMATICS v4.8
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isAr 
                ? 'قياسات الملتيميتر في وضع الدايود والفولت، كشف الشورت بالراتنج والكاميرا الحرارية، ومعايير الشبلنة الدقيقة'
                : 'Diode mode reference drops, working voltages, Rosin/thermal short isolation, and precise BGA reballing specs.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-500 block font-mono uppercase">{isAr ? 'البوردة المستهدفة' : 'TARGET MOTHERBOARD'}</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">{device.brand} {device.model} ({device.chipset.toUpperCase()})</span>
          </div>
        </div>
      </div>

      {/* Top Navigation Tabs: Bitmap Explorer vs VoltageBridge vs Schematics Guides */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 flex-wrap">
        <button
          onClick={() => setSubTab('bitmap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'bitmap'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-200" />
          <span>{isAr ? 'الخريطة التفاعلية للبرودة والبيتماپ (Interactive PCB Bitmap)' : 'Interactive PCB Bitmap Explorer'}</span>
        </button>

        <button
          onClick={() => setSubTab('voltage-bridge')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'voltage-bridge'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-200" />
          <span>{isAr ? 'موديول جسر الفولتية وتفتيش مسارات المعالج (VoltageBridge)' : 'VoltageBridge V-Rail Inspector'}</span>
        </button>

        <button
          onClick={() => setSubTab('schematics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'schematics'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4 text-indigo-200" />
          <span>{isAr ? 'دليل إصلاح الأعطال المتقدم والمايكروسولدرينغ' : 'Schematics & Micro-Soldering Guides'}</span>
        </button>
      </div>

      {subTab === 'bitmap' ? (
        <InteractivePcbBitmapExplorer device={device} lang={lang} />
      ) : subTab === 'voltage-bridge' ? (
        <VoltageBridge device={device} lang={lang} />
      ) : (
      /* Main Split Interface */
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Fault Guides Directory (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث في الدوائر والآيسيات (PMIC, BQ, WTR...)' : 'Search circuits & ICs (PMIC, BQ, WTR)...'}
                className="w-full bg-slate-950 text-slate-200 text-xs pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
              {[
                { id: 'ALL', labelAr: 'الكل', labelEn: 'All' },
                { id: 'POWER_PMIC', labelAr: 'الباور PMIC', labelEn: 'Power' },
                { id: 'CHARGING_VBUS', labelAr: 'الشحن VBUS', labelEn: 'Charging' },
                { id: 'DISPLAY_BACKLIGHT', labelAr: 'الإضاءة', labelEn: 'Display' },
                { id: 'BASEBAND_RF', labelAr: 'الشبكة RF', labelEn: 'Baseband' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-all ${
                    activeCategory === cat.id
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {isAr ? cat.labelAr : cat.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Fault Guides List */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredGuides.map(guide => {
              const isSelected = guide.id === selectedGuideId;
              return (
                <div
                  key={guide.id}
                  onClick={() => {
                    setSelectedGuideId(guide.id);
                    setSelectedTestPoint(guide.testPoints[0] || null);
                    setSelectedChip(guide.boardChips[0] || null);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-850 border-indigo-500/80 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                      : 'bg-slate-900 hover:bg-slate-850/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white line-clamp-2">
                      {isAr ? guide.titleAr : guide.titleEn}
                    </h4>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-800 text-indigo-300 font-mono shrink-0">
                      {guide.category.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {isAr ? guide.symptomAr : guide.symptomEn}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {guide.affectedComponents.map((comp, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 text-[9px] rounded bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right Column: Interactive Boardview, Multimeter Simulator & Micro-soldering Workflows (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Interactive Motherboard Canvas & Test Point Probing Stage */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isAr ? 'مخطط البوردة التفاعلي ونقاط الفحص (Interactive Boardview & Test Points)' : 'Interactive Boardview & Component Test Stage'}
                </h4>
              </div>

              {/* Multimeter Mode Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setMeterMode('DIODE')}
                  className={`px-2 py-1 rounded ${meterMode === 'DIODE' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  DIODE (mV)
                </button>
                <button
                  onClick={() => setMeterMode('VOLTAGE')}
                  className={`px-2 py-1 rounded ${meterMode === 'VOLTAGE' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  VOLTS (V)
                </button>
                <button
                  onClick={() => setMeterMode('RESISTANCE')}
                  className={`px-2 py-1 rounded ${meterMode === 'RESISTANCE' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  OHMS (Ω)
                </button>
              </div>
            </div>

            {/* Motherboard Graphic Simulation Canvas */}
            <div className="relative w-full h-72 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 rounded-xl border-2 border-emerald-900/50 overflow-hidden shadow-inner flex items-center justify-center p-4 select-none">
              {/* Motherboard Grid Traces */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              {/* Board Silkscreen Outline */}
              <div className="absolute inset-4 rounded-xl border border-emerald-500/30 pointer-events-none" />
              <span className="absolute top-6 left-6 text-[10px] font-mono text-emerald-500/60 tracking-widest uppercase">
                PCB_LAYER_TOP // {activeGuide.boardModel}
              </span>

              {/* Render Chips on Boardview */}
              {activeGuide.boardChips.map((chip) => {
                const isSelected = selectedChip?.id === chip.id;
                return (
                  <div
                    key={chip.id}
                    onClick={() => setSelectedChip(chip)}
                    style={{
                      left: `${chip.x}%`,
                      top: `${chip.y}%`,
                      width: `${chip.width}%`,
                      height: `${chip.height}%`,
                    }}
                    className={`absolute rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all shadow-lg ${
                      isSelected
                        ? 'border-cyan-400 bg-slate-900/95 ring-2 ring-cyan-400/80 scale-105 z-20'
                        : 'border-slate-700 bg-slate-900/80 hover:border-slate-500 hover:bg-slate-850 z-10'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-white font-mono">{chip.designator}</span>
                    <span className="text-[8px] text-slate-400 font-mono truncate max-w-full px-1">{chip.partNumber}</span>
                  </div>
                );
              })}

              {/* Render Test Points on Boardview */}
              {activeGuide.testPoints.map((tp) => {
                const isSelected = selectedTestPoint?.id === tp.id;
                return (
                  <div
                    key={tp.id}
                    onClick={() => {
                      setSelectedTestPoint(tp);
                      if (simulatedProbeState === 'SHORT') {
                        audioSynth.playShortCircuitAlarm();
                      } else {
                        audioSynth.playMultimeterBeep();
                      }
                    }}
                    style={{
                      left: `${tp.diagramCoord.x}%`,
                      top: `${tp.diagramCoord.y}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group flex flex-col items-center`}
                  >
                    {/* Pulsing Target Dot */}
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-amber-500 ring-4 ring-amber-500/40 scale-125' 
                        : 'bg-emerald-500 hover:bg-amber-400 ring-2 ring-emerald-500/30'
                    }`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    {/* Tooltip Tag */}
                    <span className="mt-1 px-1.5 py-0.5 rounded bg-black/90 border border-slate-700 text-[9px] font-mono text-white whitespace-nowrap opacity-90 group-hover:opacity-100 shadow-md">
                      {tp.name}
                    </span>
                  </div>
                );
              })}

              {/* Live Digital Multimeter Display Overlay */}
              <div className="absolute bottom-4 right-4 bg-slate-950/95 border-2 border-indigo-500/60 rounded-xl p-3 shadow-2xl z-40 min-w-[200px]">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-1 mb-1.5">
                  <span className="flex items-center gap-1 text-indigo-400 font-bold">
                    <Activity className="w-3 h-3" />
                    <span>DMM PROBE LIVE</span>
                  </span>
                  <span>{meterMode}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className={`text-2xl font-mono font-black tracking-wider ${
                    reading.status === 'HEALTHY' ? 'text-emerald-400' :
                    reading.status === 'WARNING' ? 'text-amber-400' : 'text-rose-500 animate-pulse'
                  }`}>
                    {reading.text}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">{reading.unit}</span>
                </div>

                {/* Probe Simulation Switcher */}
                <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-slate-800 text-[9px] font-mono">
                  <button
                    onClick={() => setSimulatedProbeState('NORMAL')}
                    className={`py-0.5 rounded ${simulatedProbeState === 'NORMAL' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900 text-slate-400'}`}
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => setSimulatedProbeState('SHORT')}
                    className={`py-0.5 rounded ${simulatedProbeState === 'SHORT' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-900 text-slate-400'}`}
                  >
                    Short
                  </button>
                  <button
                    onClick={() => setSimulatedProbeState('OPEN')}
                    className={`py-0.5 rounded ${simulatedProbeState === 'OPEN' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-900 text-slate-400'}`}
                  >
                    O.L
                  </button>
                </div>
              </div>
            </div>

            {/* Test Point Deep Specifications Card */}
            {selectedTestPoint && (
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                      {selectedTestPoint.name}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      Rail: <strong className="text-cyan-400">{selectedTestPoint.railName}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{selectedTestPoint.location}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-mono">DIODE MODE (RED TO GND)</span>
                    <span className="font-bold text-emerald-400 font-mono">{selectedTestPoint.diodeModeHealthy}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-mono">OPERATING VOLTAGE</span>
                    <span className="font-bold text-cyan-400 font-mono">{selectedTestPoint.voltageWorking}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-mono">RESISTANCE TO GROUND</span>
                    <span className="font-bold text-amber-400 font-mono">{selectedTestPoint.resistanceToGnd}</span>
                  </div>
                </div>

                {/* Fault Symptoms If Bad */}
                <div className="text-xs space-y-1 pt-1">
                  <div className="flex items-start gap-1.5 text-rose-300 bg-rose-950/20 p-2 rounded-lg border border-rose-900/40">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                    <span><strong>{isAr ? 'في حال وجود شورت:' : 'If Shorted:'}</strong> {selectedTestPoint.faultSymptomIfShort}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-amber-300 bg-amber-950/20 p-2 rounded-lg border border-amber-900/40">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span><strong>{isAr ? 'في حال انقطاع المسار:' : 'If Open Line:'}</strong> {selectedTestPoint.faultSymptomIfOpen}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Micro-Soldering Step-by-Step Procedure & Safety Guidelines */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'خطوات المايكروسولدرينغ والحرارة والشبلنة (Micro-Soldering & BGA Stencil Guide)' : 'Micro-Soldering & BGA Stencil Execution Steps'}</span>
              </h4>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-3">
              {activeGuide.microSolderingSteps.map((step) => (
                <div key={step.stepNumber} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                        {step.stepNumber}
                      </span>
                      <h5 className="text-xs font-bold text-slate-100">
                        {isAr ? step.titleAr : step.titleEn}
                      </h5>
                    </div>

                    {/* Temperature & Stencil Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        🔥 {step.hotAirTemp} (Air: {step.airFlow})
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        ⚙️ {step.solderPasteAlloy}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr ? step.procedureAr : step.procedureEn}
                  </p>

                  <div className="flex items-start gap-1.5 text-[11px] text-amber-300 bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{isAr ? step.safetyWarningAr : step.safetyWarningEn}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Rosin & Thermal Camera Short Isolation Card */}
            <div className="p-3.5 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 rounded-xl border border-indigo-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-indigo-400" />
                  <span>{isAr ? 'دليل كشف الشورت بالراتنج وحقن الفولت الآمن' : 'Rosin Vaporization & Safe Voltage Injection Limits'}</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Max Safe: {activeGuide.shortIsolationGuide.safeCurrentInjectionVoltage} @ {activeGuide.shortIsolationGuide.maxCurrentLimit}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr ? activeGuide.shortIsolationGuide.rosinFluxMethodAr : activeGuide.shortIsolationGuide.rosinFluxMethodEn}
              </p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
