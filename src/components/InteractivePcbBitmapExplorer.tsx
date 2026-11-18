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
  Download,
  CircuitBoard,
  BookOpen,
  Search,
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
import {
  OPEN_SOURCE_REPAIR_TOOLS,
  PHONE_CIRCUIT_SUBSYSTEMS,
  SOC_PROCESSOR_DATABASE,
  PhoneCircuitSubsystem,
} from '../data/openSourceHardwareCatalog';

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
  const [viewMode, setViewMode] = useState<'boardview' | 'circuits' | 'soc_oss'>('boardview');
  const [boardSearch, setBoardSearch] = useState<string>('');
  const [circuitFilter, setCircuitFilter] = useState<'ALL' | PhoneCircuitSubsystem['category']>('ALL');
  const [socVendorFilter, setSocVendorFilter] = useState<string>('ALL');
  const [ossSearch, setOssSearch] = useState<string>('');
  const [downloadedFile, setDownloadedFile] = useState<string | null>(null);

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
    navigator.clipboard?.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  const handleDownloadJsonPackage = (filename: string, payload: unknown) => {
    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadedFile(filename);
      setTimeout(() => setDownloadedFile(null), 2200);
    } catch {
      // ignore if DOM download unavailable in headless SSR
    }
  };

  const handleDownloadActiveSchematic = () => {
    handleDownloadJsonPackage(`${activeSchematic.id}_boardview_netlist.json`, {
      exportedAt: new Date().toISOString(),
      format: 'OmniFix-OpenBoardView-Netlist-v1',
      schematic: activeSchematic,
      matchedDeviceAtlas: relatedAtlasModels,
      circuitSubsystemsReference: PHONE_CIRCUIT_SUBSYSTEMS,
    });
  };

  const filteredSchematics = schematicList.filter((s) => {
    const q = boardSearch.trim().toLowerCase();
    if (!q) return true;
    return s.title.toLowerCase().includes(q) || s.architecture.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
  });

  const filteredCircuits = PHONE_CIRCUIT_SUBSYSTEMS.filter((c) =>
    circuitFilter === 'ALL' ? true : c.category === circuitFilter
  );

  const socVendors = ['ALL', ...Array.from(new Set(SOC_PROCESSOR_DATABASE.map((s) => s.vendor)))];

  const filteredSocs = SOC_PROCESSOR_DATABASE.filter((soc) => {
    const vendorOk = socVendorFilter === 'ALL' || soc.vendor === socVendorFilter;
    const q = ossSearch.trim().toLowerCase();
    if (!q) return vendorOk;
    return (
      vendorOk &&
      (soc.familyName.toLowerCase().includes(q) ||
        soc.vendor.toLowerCase().includes(q) ||
        soc.socPartNumbers.some((p) => p.toLowerCase().includes(q)) ||
        soc.representativeDevices.some((d) => d.toLowerCase().includes(q)))
    );
  });

  const filteredOssTools = OPEN_SOURCE_REPAIR_TOOLS.filter((t) => {
    const q = ossSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.repository.toLowerCase().includes(q) ||
      t.summaryEn.toLowerCase().includes(q) ||
      t.summaryAr.includes(ossSearch.trim()) ||
      t.supportedChipsetsOrFormats.some((f) => f.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-5 text-slate-100">
      {/* Top Telemetry Header & Primary Mode Switcher */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {isAr
                ? 'مستودع المخططات والدوائر الإلكترونية والمعالجات مفتوحة المصدر'
                : 'Open-Source Schematics, Electronic Circuits & SoC Lab'}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
              <span>{schematicList.length} BoardViews</span>
              <span aria-hidden="true">·</span>
              <span>{PHONE_CIRCUIT_SUBSYSTEMS.length} Circuits</span>
              <span aria-hidden="true">·</span>
              <span>{SOC_PROCESSOR_DATABASE.length} SoC Families</span>
              <span aria-hidden="true">·</span>
              <span>{OPEN_SOURCE_REPAIR_TOOLS.length} OSS Tools</span>
            </div>
          </div>
        </div>

        {/* Mode Tabs + Netlist Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('boardview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'boardview' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isAr ? `البورد فيو (${schematicList.length})` : `BoardView (${schematicList.length})`}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('circuits')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'circuits' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CircuitBoard className="w-3.5 h-3.5" />
              <span>{isAr ? `الدوائر (${PHONE_CIRCUIT_SUBSYSTEMS.length})` : `Circuits (${PHONE_CIRCUIT_SUBSYSTEMS.length})`}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('soc_oss')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'soc_oss' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isAr ? 'المعالجات والأدوات الحرة' : 'SoCs & OSS Tools'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadActiveSchematic}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {downloadedFile
                ? isAr ? 'تم التصدير ✓' : 'Exported ✓'
                : isAr ? 'تنزيل ملف المخطط JSON' : 'Export Netlist JSON'}
            </span>
          </button>
        </div>
      </div>

      {viewMode === 'boardview' && (
        <>
          {/* Layer Filter, Board Search & Zoom */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={boardSearch}
                onChange={(e) => setBoardSearch(e.target.value)}
                placeholder={isAr ? 'ابحث باسم الهاتف أو المعالج (مثال: S24, iPhone 15, Tensor, Helio)...' : 'Search board or chipset (e.g. S24, iPhone 15, Tensor, Helio)...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg ps-9 pe-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                {(['ALL', 'POWER', 'DATA'] as const).map((layer) => (
                  <button
                    key={layer}
                    type="button"
                    onClick={() => setActiveLayerView(layer)}
                    className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.8, Number((z - 0.15).toFixed(2))))}
                  className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
                  aria-label="Zoom Out"
                >
                  -
                </button>
                <span className="px-2 text-cyan-400 tabular-nums">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredSchematics.map((sch) => {
              const isActive = sch.id === activeSchematic.id;
              return (
                <button
                  key={sch.id}
                  type="button"
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
        </>
      )}

      {viewMode === 'circuits' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                ['ALL', 'POWER', 'CHARGING', 'DISPLAY', 'RF_BASEBAND', 'MEMORY', 'AUDIO', 'CAMERA', 'CONNECTIVITY'] as const
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCircuitFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    circuitFilter === cat
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? (isAr ? 'جميع الدوائر' : 'All Circuits') : cat}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                handleDownloadJsonPackage('smartphone_electronic_circuits_blueprint.json', {
                  exportedAt: new Date().toISOString(),
                  subsystems: PHONE_CIRCUIT_SUBSYSTEMS,
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 text-xs font-bold cursor-pointer hover:border-cyan-500"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تنزيل مرجع الدوائر JSON' : 'Export Circuits JSON'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCircuits.map((circ) => (
              <div
                key={circ.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">{circ.category}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {isAr ? circ.nameAr : circ.nameEn}
                    </h4>
                  </div>
                  <div className="text-end font-mono text-[11px] shrink-0">
                    <div className="text-emerald-400 font-bold">{circ.diodeRange}</div>
                    <div className="text-amber-400">{circ.operatingVoltages}</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400">
                    {isAr ? 'الخطوط الرئيسية (Nets):' : 'Primary Nets:'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {circ.primaryNets.map((net) => (
                      <span
                        key={net}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300"
                      >
                        {net}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[11px] text-slate-400 mb-1 font-semibold">
                      {isAr ? 'الآيسيهات المرجعية:' : 'Reference ICs:'}
                    </div>
                    <div className="font-mono text-[11px] text-slate-200 leading-relaxed">
                      {circ.referenceIcs.join(' · ')}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[11px] text-slate-400 mb-1 font-semibold">
                      {isAr ? 'العناصر المساعدة:' : 'Key Passives:'}
                    </div>
                    <div className="font-mono text-[11px] text-slate-200 leading-relaxed">
                      {circ.keyPassiveComponents.join(' · ')}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/40 text-xs text-rose-200">
                  <span className="font-bold text-rose-400">{isAr ? 'أعراض التلف: ' : 'Failure Symptoms: '}</span>
                  {isAr ? circ.failureSymptomsAr : circ.failureSymptomsEn}
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-emerald-400">
                    {isAr ? 'خطوات الفحص والإصلاح الهندسي:' : 'Diagnostic Procedure:'}
                  </div>
                  <ol className="space-y-1 text-xs text-slate-300 list-decimal list-inside">
                    {(isAr ? circ.diagnosticProcedureAr : circ.diagnosticProcedureEn).map((step, i) => (
                      <li key={i} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'soc_oss' && (
        <div className="space-y-5">
          {/* Search & Vendor Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={ossSearch}
                onChange={(e) => setOssSearch(e.target.value)}
                placeholder={isAr ? 'ابحث في المعالجات أو الأدوات مفتوحة المصدر (mtkclient, edl, A17, SM8650, OpenBoardView)...' : 'Search SoCs or open-source tools (mtkclient, edl, SM8650, OpenBoardView)...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg ps-9 pe-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {socVendors.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSocVendorFilter(v)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    socVendorFilter === v
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {v === 'ALL' ? (isAr ? 'كل المعالجات' : 'All SoCs') : v}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile SoCs Architecture Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>
                  {isAr
                    ? `قاعدة بيانات معالجات الهواتف والـ PMICs وأوضاع البوت (${filteredSocs.length})`
                    : `Mobile SoC Architecture, PMICs & Boot Modes (${filteredSocs.length})`}
                </span>
              </h4>
              <button
                type="button"
                onClick={() =>
                  handleDownloadJsonPackage('mobile_socs_and_oss_tools_registry.json', {
                    exportedAt: new Date().toISOString(),
                    socs: SOC_PROCESSOR_DATABASE,
                    openSourceTools: OPEN_SOURCE_REPAIR_TOOLS,
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold cursor-pointer hover:border-cyan-500"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? 'تصدير سجل المعالجات والأدوات JSON' : 'Export Registry JSON'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredSocs.map((soc) => (
                <div key={soc.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                    <div>
                      <span className="text-[11px] font-mono text-amber-400 font-bold">{soc.vendor}</span>
                      <h5 className="text-sm font-bold text-white">{soc.familyName}</h5>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {soc.vidPid}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">SoC Models:</span>
                      <span className="text-slate-200">{soc.socPartNumbers.join(', ')}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Paired PMICs:</span>
                      <span className="text-emerald-300">{soc.pairedPmics.join(', ')}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300">
                    <span className="text-cyan-400 font-semibold">{isAr ? 'وضع البوت و USB: ' : 'USB Boot Mode: '}</span>
                    <span className="font-mono">{soc.usbBootMode}</span>
                    <span className="text-slate-500"> · {soc.memorySupport}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr ? soc.architectureNotesAr : soc.architectureNotesEn}
                  </p>
                  <p className="text-xs text-amber-200 bg-amber-950/20 border border-amber-800/40 rounded-lg p-2">
                    {isAr ? soc.commonHardwareFaultsAr : soc.commonHardwareFaultsEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Open-Source Repair Software & Schematic Viewers */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>
                {isAr
                  ? `البرمجيات والأدوات مفتوحة المصدر لصيانة الهواتف وقراءة المخططات (${filteredOssTools.length})`
                  : `Open-Source Mobile Servicing & Schematic Tooling (${filteredOssTools.length})`}
              </span>
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredOssTools.map((tool) => (
                <div key={tool.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                    <div>
                      <h5 className="text-sm font-bold text-white">{tool.name}</h5>
                      <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                        {tool.repository} · {tool.license}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 shrink-0">
                      {tool.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr ? tool.summaryAr : tool.summaryEn}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {tool.supportedChipsetsOrFormats.map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {tool.sampleCommands.map((cmd, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black border border-slate-800 font-mono text-[11px] text-emerald-300"
                      >
                        <code className="truncate">{cmd}</code>
                        <button
                          type="button"
                          onClick={() => handleCopyCommand(cmd)}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 shrink-0 cursor-pointer"
                          title="Copy command"
                        >
                          {copiedCmd === cmd ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
