import React, { useState, useEffect } from 'react';
import {
  Layers,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Compass,
  Wrench,
  Smartphone,
  Terminal,
  ShieldAlert,
  GitBranch,
  Check,
  Copy,
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { useWorkstation } from '../context/WorkstationContext';
import {
  BOARD_SCHEMATICS,
  BoardSchematic,
  SchematicComponent,
  SchematicPin,
  getSchematicForDevice,
} from '../services/schematicsEngine';
import {
  DEVICE_MODELS_ATLAS,
  DiodeEvaluationResult,
  evaluateDiodeReading,
} from '../data/hardwareAtlas';

interface InteractivePcbBitmapExplorerProps {
  device: ConnectedDevice;
  lang: 'en' | 'ar';
}

export const InteractivePcbBitmapExplorer: React.FC<InteractivePcbBitmapExplorerProps> = ({
  device,
  lang,
}) => {
  const isAr = lang === 'ar';
  const { recordDiodeMeasurement, diodeSessionLogs } = useWorkstation();

  const schematicList = Object.values(BOARD_SCHEMATICS);
  const [selectedSchematicId, setSelectedSchematicId] = useState<string>(
    () => getSchematicForDevice(device).id
  );
  const activeSchematic: BoardSchematic =
    BOARD_SCHEMATICS[selectedSchematicId] || schematicList[0];

  const [selectedPin, setSelectedPin] = useState<SchematicPin>(activeSchematic.pins[0]);
  const [selectedComponent, setSelectedComponent] = useState<SchematicComponent>(
    activeSchematic.components[0]
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeLayerView, setActiveLayerView] = useState<'ALL' | 'POWER' | 'DATA'>('ALL');
  const [measuredInput, setMeasuredInput] = useState<string>(
    activeSchematic.pins[0].diode_v.toFixed(3)
  );
  const [evalResult, setEvalResult] = useState<DiodeEvaluationResult | null>(() =>
    evaluateDiodeReading(activeSchematic.pins[0].rail, activeSchematic.pins[0].diode_v)
  );
  const [isLogging, setIsLogging] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Sync board schematic automatically when connected device changes
  useEffect(() => {
    const matched = getSchematicForDevice(device);
    setSelectedSchematicId(matched.id);
    setSelectedPin(matched.pins[0]);
    setSelectedComponent(matched.components[0]);
    setMeasuredInput(matched.pins[0].diode_v.toFixed(3));
    setEvalResult(evaluateDiodeReading(matched.pins[0].rail, matched.pins[0].diode_v));
  }, [device?.id, device?.brand, device?.chipset]);

  const handleSelectSchematic = (id: string) => {
    const sch = BOARD_SCHEMATICS[id];
    if (!sch) return;
    setSelectedSchematicId(id);
    setSelectedPin(sch.pins[0]);
    setSelectedComponent(sch.components[0]);
    setMeasuredInput(sch.pins[0].diode_v.toFixed(3));
    setEvalResult(evaluateDiodeReading(sch.pins[0].rail, sch.pins[0].diode_v));
  };

  const handlePinClick = (pin: SchematicPin) => {
    setSelectedPin(pin);
    setMeasuredInput(pin.diode_v.toFixed(3));
    setEvalResult(evaluateDiodeReading(pin.rail, pin.diode_v));
  };

  const handleEvaluateAndLog = async (overrideVal?: number) => {
    const numericVal = overrideVal !== undefined ? overrideVal : parseFloat(measuredInput);
    if (isNaN(numericVal)) return;
    setMeasuredInput(numericVal.toFixed(3));
    setIsLogging(true);
    try {
      const res = await recordDiodeMeasurement(selectedPin.rail, numericVal);
      setEvalResult(res);
    } finally {
      setIsLogging(false);
    }
  };

  // Match atlas models associated with this schematic
  const relatedAtlasModels = DEVICE_MODELS_ATLAS.filter(
    (m) => m.schematic_id === activeSchematic.id
  );
  const primaryAtlasModel = relatedAtlasModels[0] || DEVICE_MODELS_ATLAS[0];

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-5 text-slate-100">
      {/* Top Telemetry Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {isAr
                ? 'مستعرض المخططات التفاعلية والـ BoardView وتسلسل الطاقة'
                : 'Interactive SVG BoardView & Power-Sequence Schematic Engine'}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
              <span>{activeSchematic.architecture}</span>
              <span aria-hidden="true">·</span>
              <span>{activeSchematic.components.length} ICs</span>
              <span aria-hidden="true">·</span>
              <span>{activeSchematic.pins.length} Testpoints</span>
            </div>
          </div>
        </div>

        {/* Layer Filter & Zoom */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {(['ALL', 'POWER', 'DATA'] as const).map((layer) => (
              <button
                key={layer}
                onClick={() => setActiveLayerView(layer)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeLayerView === layer
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {layer === 'ALL'
                  ? isAr ? 'كل المسارات' : 'All Nets'
                  : layer === 'POWER'
                  ? isAr ? 'خطوط التغذية' : 'Power Rails'
                  : isAr ? 'بيانات / BROM / EDL' : 'Data & Boot'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, Number((z - 0.15).toFixed(2))))}
              className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
              aria-label="Zoom Out"
            >
              -
            </button>
            <span className="px-2 text-cyan-400 tabular-nums">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
              className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
              aria-label="Zoom In"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Schematic Board Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {schematicList.map((sch) => {
          const isActive = sch.id === activeSchematic.id;
          return (
            <button
              key={sch.id}
              onClick={() => handleSelectSchematic(sch.id)}
              className={`p-3 rounded-lg border text-start transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 border-cyan-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold truncate">{sch.title}</span>
                <Smartphone className="w-4 h-4 shrink-0 text-cyan-400" />
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1 truncate">
                {sch.architecture}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Split Stage: SVG BoardView (7 cols) + Live Diode Evaluator & Pin Specs (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Interactive SVG BoardView */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="font-bold truncate max-w-md">{activeSchematic.title}</span>
            </div>
            <span className="text-cyan-400 tabular-nums whitespace-nowrap shrink-0">
              {selectedPin.name}
            </span>
          </div>

          <div className="relative w-full overflow-auto bg-[#070b12] border border-slate-800 rounded-lg p-2 cursor-crosshair">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
              }}
              className="transition-transform duration-150"
            >
              <svg
                viewBox={`0 0 ${activeSchematic.width} ${activeSchematic.height}`}
                className="w-full h-auto min-w-[540px]"
              >
                <defs>
                  <pattern id="pcbGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="rgba(16, 185, 129, 0.08)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>

                {/* PCB Substrate */}
                <rect
                  x="16"
                  y="16"
                  width={activeSchematic.width - 32}
                  height={activeSchematic.height - 32}
                  rx="14"
                  fill="#0b1f18"
                  stroke="#10b981"
                  strokeOpacity="0.45"
                  strokeWidth="2"
                />
                <rect
                  x="16"
                  y="16"
                  width={activeSchematic.width - 32}
                  height={activeSchematic.height - 32}
                  rx="14"
                  fill="url(#pcbGrid)"
                />

                {/* Copper Traces */}
                {activeSchematic.traces.map((tr) => (
                  <path
                    key={tr.id}
                    d={tr.path}
                    fill="none"
                    stroke={tr.color}
                    strokeWidth={selectedPin.id === tr.fromPinId ? 3.5 : 2}
                    strokeOpacity={selectedPin.id === tr.fromPinId ? 0.95 : 0.4}
                    strokeDasharray={selectedPin.id === tr.fromPinId ? '6 3' : undefined}
                  />
                ))}

                {/* Interactive ICs & Connectors */}
                {activeSchematic.components.map((comp) => {
                  const isSel = selectedComponent.id === comp.id;
                  return (
                    <g
                      key={comp.id}
                      onClick={() => setSelectedComponent(comp)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={comp.x}
                        y={comp.y}
                        width={comp.w}
                        height={comp.h}
                        rx="6"
                        fill={comp.color}
                        fillOpacity={isSel ? 0.95 : 0.78}
                        stroke={isSel ? '#22d3ee' : '#94a3b8'}
                        strokeWidth={isSel ? 3 : 1.2}
                      />
                      <text
                        x={comp.x + comp.w / 2}
                        y={comp.y + comp.h / 2 - 6}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="12"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {comp.id}
                      </text>
                      <text
                        x={comp.x + comp.w / 2}
                        y={comp.y + comp.h / 2 + 12}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="10"
                        fontFamily="sans-serif"
                      >
                        {comp.label.slice(0, 22)}
                      </text>
                    </g>
                  );
                })}

                {/* Interactive Testpoints / Pins */}
                {activeSchematic.pins
                  .filter((p) => {
                    if (activeLayerView === 'ALL') return true;
                    const isPower =
                      p.rail.includes('VDD') ||
                      p.rail.includes('VBAT') ||
                      p.rail.includes('BL');
                    return activeLayerView === 'POWER' ? isPower : !isPower;
                  })
                  .map((pin) => {
                    const isSel = selectedPin.id === pin.id;
                    return (
                      <g
                        key={pin.id}
                        onClick={() => handlePinClick(pin)}
                        className="cursor-pointer"
                      >
                        {isSel && (
                          <circle
                            cx={pin.x}
                            cy={pin.y}
                            r="15"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeDasharray="3 2"
                          />
                        )}
                        <circle
                          cx={pin.x}
                          cy={pin.y}
                          r={isSel ? 9 : 7}
                          fill={isSel ? '#f59e0b' : '#22d3ee'}
                          stroke="#0f172a"
                          strokeWidth="2"
                        />
                        <rect
                          x={pin.x - 42}
                          y={pin.y + 12}
                          width="84"
                          height="16"
                          rx="3"
                          fill="#020617"
                          fillOpacity="0.9"
                          stroke={isSel ? '#f59e0b' : '#334155'}
                          strokeWidth="1"
                        />
                        <text
                          x={pin.x}
                          y={pin.y + 23}
                          textAnchor="middle"
                          fill={isSel ? '#fcd34d' : '#e2e8f0'}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {pin.name.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
              </svg>
            </div>
          </div>

          {/* Clickable Testpoint Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {activeSchematic.pins.map((pin) => (
              <button
                key={pin.id}
                onClick={() => handlePinClick(pin)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  selectedPin.id === pin.id
                    ? 'bg-cyan-600 text-white border-cyan-400 font-bold'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                }`}
              >
                {pin.name}
              </button>
            ))}
          </div>

          {/* Selected Component Information */}
          {selectedComponent && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs">
              <div>
                <div className="font-mono font-bold text-cyan-300">
                  {selectedComponent.id} — {selectedComponent.label}
                </div>
                <p className="text-slate-400 mt-1">
                  {isAr ? selectedComponent.role : selectedComponent.role_en}
                </p>
              </div>
              <Cpu className="w-5 h-5 text-slate-500 shrink-0" />
            </div>
          )}
        </div>

        {/* Right: Pin Telemetry & Live Diode Evaluator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Selected Pin Specification */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">
                  {isAr ? 'تفاصيل نقطة القياس (Pin / Testpoint)' : 'Selected Pin Telemetry'}
                </h4>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">{selectedPin.rail}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">
                  {isAr ? 'ممانعة الدايود المرجعية' : 'Reference Diode'}
                </span>
                <span className="text-xl font-bold text-emerald-400 tabular-nums">
                  {selectedPin.diode_v.toFixed(3)} V
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">
                  {isAr ? 'الجهد التشغيلي' : 'Operating Voltage'}
                </span>
                <span className="text-xl font-bold text-cyan-400 tabular-nums">
                  {selectedPin.volt_v.toFixed(2)} V
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="text-amber-400 font-bold block mb-1">
                {isAr ? 'دلالة التلف عند الخطأ:' : 'Fault Diagnostic Hint:'}
              </span>
              {isAr ? selectedPin.fault_hint : selectedPin.fault_hint_en}
            </div>
          </div>

          {/* Real Multimeter Diode Evaluator Input */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>
                  {isAr
                    ? 'محلل ممانعة الدايود الفعلي (Diode Mode Evaluator)'
                    : 'Live Diode-Mode Reading Evaluator'}
                </span>
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.001"
                min="0"
                max="3.5"
                value={measuredInput}
                onChange={(e) => setMeasuredInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-base font-bold text-emerald-400 tabular-nums focus:outline-none focus:border-cyan-500"
                placeholder="0.380"
              />
              <button
                onClick={() => handleEvaluateAndLog()}
                disabled={isLogging}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isAr ? 'فحص وتسجيل (V)' : 'Evaluate & Log'}
              </button>
            </div>

            {/* Quick Test Fault Presets */}
            <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono">
              <button
                onClick={() => handleEvaluateAndLog(selectedPin.diode_v)}
                className="py-1.5 rounded bg-slate-950 border border-slate-800 hover:border-emerald-500 text-emerald-400 cursor-pointer"
              >
                {isAr ? 'سليم' : 'Healthy'}
              </button>
              <button
                onClick={() => handleEvaluateAndLog(0.012)}
                className="py-1.5 rounded bg-slate-950 border border-slate-800 hover:border-rose-500 text-rose-400 cursor-pointer"
              >
                0.012V Short
              </button>
              <button
                onClick={() => handleEvaluateAndLog(0.165)}
                className="py-1.5 rounded bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-400 cursor-pointer"
              >
                0.165V Leak
              </button>
              <button
                onClick={() => handleEvaluateAndLog(1.85)}
                className="py-1.5 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-cyan-400 cursor-pointer"
              >
                O.L (Open)
              </button>
            </div>

            {/* Evaluation Verdict */}
            {evalResult && (
              <div
                className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                  evalResult.status === 'SHORT_CIRCUIT'
                    ? 'bg-rose-950/30 border-rose-700/60 text-rose-200'
                    : evalResult.status === 'LEAKAGE_LOW' || evalResult.status === 'OPEN_LINE'
                    ? 'bg-amber-950/30 border-amber-700/60 text-amber-200'
                    : 'bg-emerald-950/30 border-emerald-700/60 text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between font-mono font-bold">
                  <span className="flex items-center gap-1.5">
                    {evalResult.status === 'HEALTHY' || evalResult.status === 'NORMAL_RANGE' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{evalResult.status}</span>
                  </span>
                  {evalResult.expected_range && (
                    <span className="text-[11px] opacity-80">
                      Ref: {evalResult.expected_range}
                    </span>
                  )}
                </div>
                <p className="leading-relaxed">
                  {isAr ? evalResult.diagnosis : evalResult.diagnosis_en}
                </p>
                <div className="flex items-start gap-1.5 text-[11px] opacity-90 pt-1 border-t border-white/10">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{evalResult.safety_note}</span>
                </div>
              </div>
            )}

            {/* Recent Session Diode Logs */}
            {diodeSessionLogs.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block">
                  {isAr ? 'سجل قياسات هذه الجلسة:' : 'Session Measurements:'}
                </span>
                <div className="max-h-28 overflow-y-auto space-y-1 font-mono text-[11px]">
                  {diodeSessionLogs.slice(0, 4).map((log, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-2.5 py-1 rounded bg-slate-950 border border-slate-800"
                    >
                      <span className="truncate text-slate-300">{log.rail_code}</span>
                      <span className="tabular-nums text-cyan-400">{log.measured_v.toFixed(3)}V</span>
                      <span
                        className={
                          log.status === 'SHORT_CIRCUIT'
                            ? 'text-rose-400 font-bold'
                            : log.status === 'HEALTHY' || log.status === 'NORMAL_RANGE'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }
                      >
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Power-On Sequence Tree */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span>
              {isAr
                ? 'مخطط تسلسل الطاقة والإقلاع الهندسي (Power-On Sequence)'
                : 'Engineering Power-On Boot Sequence'}
            </span>
          </h4>
          <span className="text-xs font-mono text-slate-400">
            {activeSchematic.power_sequence.length} {isAr ? 'مراحل' : 'Stages'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {activeSchematic.power_sequence.map((st) => (
            <div
              key={st.step}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-cyan-400">0{st.step}.</span>
                <span className="text-emerald-400 font-bold truncate">{st.rail}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {st.source} → {st.target}
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                {isAr ? st.desc : st.desc_en}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Matched Atlas Model Pinouts & OSS Commands */}
      {primaryAtlasModel && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>
                  {isAr
                    ? `جدول بن آوت الكونكترات المرجعي — ${primaryAtlasModel.model}`
                    : `Connector Pinout Reference — ${primaryAtlasModel.model}`}
                </span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400">{primaryAtlasModel.soc}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-start">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-2 text-start">Connector / Pin</th>
                    <th className="py-2 px-2 text-start">Net</th>
                    <th className="py-2 px-2 text-end">Diode</th>
                    <th className="py-2 px-2 text-end">Volt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {primaryAtlasModel.connector_pinouts.map((cp, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/60">
                      <td className="py-2 px-2">
                        <div className="font-bold text-white">{cp.connector}</div>
                        <div className="text-[10px] text-slate-500">{cp.pin} · {cp.notes}</div>
                      </td>
                      <td className="py-2 px-2 text-cyan-300">{cp.net}</td>
                      <td className="py-2 px-2 text-end tabular-nums text-emerald-400">
                        {cp.diode_v.toFixed(3)}V
                      </td>
                      <td className="py-2 px-2 text-end tabular-nums text-amber-400">
                        {cp.voltage_v.toFixed(2)}V
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>
                  {isAr
                    ? 'أوامر البرمجة مفتوحة المصدر والتست بوينت (OSS Tools)'
                    : 'Open-Source Servicing Commands & Hardware Testpoints'}
                </span>
              </h4>
            </div>

            <div className="space-y-2">
              {primaryAtlasModel.testpoints.map((tp, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                >
                  <span className="font-mono font-bold text-amber-400">{tp.name}: </span>
                  <span className="text-slate-300">{tp.method}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              {primaryAtlasModel.software_commands.map((cmd, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-black border border-slate-800 font-mono text-[11px] text-emerald-300"
                >
                  <code className="truncate">{cmd}</code>
                  <button
                    onClick={() => handleCopyCommand(cmd.split('#')[0].trim())}
                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 shrink-0 cursor-pointer"
                    title="Copy command"
                  >
                    {copiedCmd === cmd.split('#')[0].trim() ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
