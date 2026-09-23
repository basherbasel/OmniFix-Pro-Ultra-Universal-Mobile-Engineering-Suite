import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Activity, 
  Target, 
  Layers, 
  Zap, 
  Camera, 
  Eye, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Sliders, 
  Maximize2, 
  Thermometer, 
  Crosshair, 
  Cpu, 
  ShieldCheck,
  Microscope,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface AiThermalLidarStudioProps {
  lang: 'en' | 'ar';
  device: ConnectedDevice;
  onAddLog?: (log: string) => void;
  onNavigateToTool?: (tabId: string) => void;
}

interface ThermalHotspot {
  id: string;
  name: string;
  rail: string;
  x: number; // %
  y: number; // %
  temp: number; // °C
  healthyTemp: number; // °C
  leakageCurrentMa: number;
  severity: 'CRITICAL' | 'WARNING' | 'NOMINAL';
  suspectComponent: string;
  actionAr: string;
  actionEn: string;
}

export const AiThermalLidarStudio: React.FC<AiThermalLidarStudioProps> = ({
  lang,
  device,
  onAddLog,
  onNavigateToTool
}) => {
  const isAr = lang === 'ar';

  const [activePalette, setActivePalette] = useState<'ironbow' | 'rainbow' | 'lava' | 'grayscale' | 'glow'>('ironbow');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(75);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isInjectingVoltage, setIsInjectingVoltage] = useState<boolean>(false);
  const [injectedVoltage, setInjectedVoltage] = useState<number>(1.2);
  const [currentLimitAmp, setCurrentLimitAmp] = useState<number>(2.0);
  const [measuredCurrentMa, setMeasuredCurrentMa] = useState<number>(420);
  const [selectedSpot, setSelectedSpot] = useState<ThermalHotspot | null>(null);
  const [ambientTemp, setAmbientTemp] = useState<number>(24.6);
  const [maxPeakTemp, setMaxPeakTemp] = useState<number>(68.4);
  const [inspectionMode, setInspectionMode] = useState<'thermal_overlay' | 'pcb_trace' | 'rosin_vapor' | '3d_gradient'>('thermal_overlay');
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<string[]>([
    'Thermal Engine Initialized: InfiRay T2L / Seek Compact Pro Emulation Active (384x288 IR Matrix).',
    'Laser Triangulation Sensor calibrated at 0.05mm spatial resolution.',
    'Ready for VCC_MAIN and PMIC sub-rail voltage injection analysis.'
  ]);

  const [hotspots, setHotspots] = useState<ThermalHotspot[]>([
    {
      id: 'spot-1',
      name: 'U2800 - Primary Buck PMIC Output',
      rail: 'VCC_MAIN / VBAT_SYS',
      x: 48,
      y: 36,
      temp: 68.4,
      healthyTemp: 31.0,
      leakageCurrentMa: 385,
      severity: 'CRITICAL',
      suspectComponent: 'Capacitor C2842 (0402 10uF 6.3V High-Leakage Short)',
      actionAr: 'رفع المكثف C2842 وتنظيف المسار بمادة الفلكس وإعادة قياس الممانعة بالدايود (القيمة الطبيعية 0.380V).',
      actionEn: 'De-solder MLCC Capacitor C2842, clean pad with flux, and verify diode mode reading (target: 0.380V).'
    },
    {
      id: 'spot-2',
      name: 'U3100 - RF Transceiver Core Supply',
      rail: 'VDD_RF_1P8',
      x: 62,
      y: 65,
      temp: 47.8,
      healthyTemp: 29.5,
      leakageCurrentMa: 92,
      severity: 'WARNING',
      suspectComponent: 'LDO Filter Inductor L3102 / S515 RF IC Input',
      actionAr: 'فحص ممانعة التغذية على L3102 وعزل مسار التغذية لحصر الخلل بين الأيسي والفلتر.',
      actionEn: 'Inspect impedance at L3102 and isolate power trace to differentiate between RF IC and capacitor breakdown.'
    },
    {
      id: 'spot-3',
      name: 'U1000 - AP SoC Core SRAM Rail',
      rail: 'VDD_CPU_LITTLE',
      x: 32,
      y: 42,
      temp: 34.2,
      healthyTemp: 32.0,
      leakageCurrentMa: 15,
      severity: 'NOMINAL',
      suspectComponent: 'Core CPU Power Domain (Normal Standby)',
      actionAr: 'المسار سليم ويعمل ضمن المعدل الطبيعي لاستهلاك تيار الاستعداد.',
      actionEn: 'Trace is nominal and operating within normal standby current draw tolerances.'
    }
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render simulated thermal canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw PCB Base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw PCB Grid Traces
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Board Outline and Copper Shapes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 20, width - 60, height - 40);

    // IC Chips on board
    const chips = [
      { x: 120, y: 80, w: 90, h: 90, label: 'AP SoC / DRAM' },
      { x: 240, y: 70, w: 70, h: 60, label: 'PMIC Main' },
      { x: 230, y: 160, w: 60, h: 80, label: 'UFS 4.0' },
      { x: 310, y: 150, w: 75, h: 65, label: '5G RF Transceiver' },
      { x: 70, y: 200, w: 50, h: 45, label: 'Audio Codec' },
    ];

    chips.forEach(chip => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(chip.x, chip.y, chip.w, chip.h);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(chip.x, chip.y, chip.w, chip.h);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(chip.label, chip.x + 4, chip.y + 16);
    });

    // Draw Thermal Gradients if mode is thermal
    if (inspectionMode === 'thermal_overlay' || inspectionMode === '3d_gradient') {
      hotspots.forEach(spot => {
        const spotX = (spot.x / 100) * width;
        const spotY = (spot.y / 100) * height;
        const radius = spot.severity === 'CRITICAL' ? 85 : spot.severity === 'WARNING' ? 55 : 30;

        const gradient = ctx.createRadialGradient(spotX, spotY, 2, spotX, spotY, radius);

        if (activePalette === 'ironbow') {
          if (spot.severity === 'CRITICAL') {
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            gradient.addColorStop(0.2, 'rgba(254, 240, 138, 0.85)');
            gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.7)');
            gradient.addColorStop(0.8, 'rgba(147, 51, 234, 0.35)');
            gradient.addColorStop(1, 'rgba(30, 27, 75, 0)');
          } else if (spot.severity === 'WARNING') {
            gradient.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
            gradient.addColorStop(0.4, 'rgba(249, 115, 22, 0.7)');
            gradient.addColorStop(0.8, 'rgba(168, 85, 247, 0.3)');
            gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
          } else {
            gradient.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
            gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
          }
        } else if (activePalette === 'lava') {
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          gradient.addColorStop(0.3, 'rgba(234, 88, 12, 0.8)');
          gradient.addColorStop(0.7, 'rgba(185, 28, 28, 0.5)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else if (activePalette === 'rainbow') {
          gradient.addColorStop(0, 'rgba(255, 0, 0, 0.9)');
          gradient.addColorStop(0.3, 'rgba(255, 255, 0, 0.75)');
          gradient.addColorStop(0.6, 'rgba(0, 255, 0, 0.5)');
          gradient.addColorStop(0.85, 'rgba(0, 255, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(0, 0, 255, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          gradient.addColorStop(0.5, 'rgba(148, 163, 184, 0.6)');
          gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(spotX, spotY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Target crosshair
        ctx.strokeStyle = spot.severity === 'CRITICAL' ? '#f43f5e' : '#eab308';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(spotX, spotY, 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(spotX - 16, spotY);
        ctx.lineTo(spotX + 16, spotY);
        ctx.moveTo(spotX, spotY - 16);
        ctx.lineTo(spotX, spotY + 16);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText(`${spot.temp.toFixed(1)}°C`, spotX + 18, spotY + 4);
      });
    }

    if (inspectionMode === 'rosin_vapor') {
      // Draw simulated white rosin melted spot
      hotspots.filter(s => s.severity === 'CRITICAL').forEach(spot => {
        const spotX = (spot.x / 100) * width;
        const spotY = (spot.y / 100) * height;
        ctx.fillStyle = 'rgba(248, 250, 252, 0.35)';
        ctx.fillRect(30, 20, width - 60, height - 40);

        // Melted hole (transparent reveal)
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(spotX, spotY, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Solder flux bubble
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(spotX, spotY, 36, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

  }, [activePalette, inspectionMode, hotspots]);

  const handleStartLaserScan = () => {
    setIsScanning(true);
    const newLog = `Laser LiDAR Micro-Profiling Initiated: Sweeping 10,000 reference points across ${device.model}...`;
    setDiagnosticsLogs(prev => [newLog, ...prev]);
    if (onAddLog) onAddLog(newLog);

    setTimeout(() => {
      setIsScanning(false);
      const doneLog = 'LiDAR Triangulation Completed: Pinpointed 1 severe thermal bottleneck and 1 moderate RF rail imbalance.';
      setDiagnosticsLogs(prev => [doneLog, ...prev]);
      if (onAddLog) onAddLog(doneLog);
    }, 2000);
  };

  const handleToggleVoltageInjection = () => {
    const newState = !isInjectingVoltage;
    setIsInjectingVoltage(newState);
    if (newState) {
      setMeasuredCurrentMa(Math.floor(injectedVoltage * 350 + Math.random() * 40));
      const log = `DC Voltage Injection ENGAGED: Injected ${injectedVoltage}V @ ${currentLimitAmp}A Max to VCC_MAIN.`;
      setDiagnosticsLogs(prev => [log, ...prev]);
      if (onAddLog) onAddLog(log);
    } else {
      setMeasuredCurrentMa(0);
      const log = 'DC Voltage Injection DISENGAGED: Power line stabilized to 0.00V.';
      setDiagnosticsLogs(prev => [log, ...prev]);
      if (onAddLog) onAddLog(log);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-red-500/20 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-600/10 via-amber-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20 text-white">
            <Flame size={28} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white">
                {isAr ? 'استوديو التصوير الحراري بالليزر وتحديد الشورت الميكروي' : 'AI Thermal LiDAR & Micro-Short Triangulation Studio'}
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                2026 NEXT-GEN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {isAr 
                ? 'فحص درجات الحرارة الدقيقة بنقاء 384x288، عزل التسريب الميكروي (0.02mA)، محاكاة حقن الفولت، والمطابقة التلقائية لمخططات البوردة.' 
                : 'High-precision 384x288 IR thermal matrix, micro-leakage triangulation (<0.02mA), calibrated DC voltage injection, and interactive PCB overlay.'}
            </p>
          </div>
        </div>

        {/* Quick telemetry pills */}
        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <div className="px-3 py-2 rounded-2xl bg-slate-800/80 border border-white/5 flex items-center gap-2 text-xs">
            <Thermometer size={16} className="text-amber-400" />
            <span className="text-slate-400">{isAr ? 'الذروة الحرارية:' : 'Max Peak:'}</span>
            <span className="font-mono font-bold text-red-400">{maxPeakTemp}°C</span>
          </div>
          <div className="px-3 py-2 rounded-2xl bg-slate-800/80 border border-white/5 flex items-center gap-2 text-xs">
            <Activity size={16} className="text-emerald-400" />
            <span className="text-slate-400">{isAr ? 'تيار السحب:' : 'Draw Current:'}</span>
            <span className="font-mono font-bold text-emerald-400">{isInjectingVoltage ? `${measuredCurrentMa} mA` : '0.0 mA'}</span>
          </div>
          <button
            onClick={handleStartLaserScan}
            disabled={isScanning}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
            {isScanning ? (isAr ? 'جاري المسح بالليزر...' : 'Scanning LiDAR...') : (isAr ? 'مسح حراري شامل' : 'Sweep LiDAR')}
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left / Center View: Canvas & Controls (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Top Canvas Bar */}
          <div className="flex items-center justify-between p-3 bg-slate-900 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 px-2">{isAr ? 'وضع العرض:' : 'View Mode:'}</span>
              {(['thermal_overlay', 'rosin_vapor', 'pcb_trace', '3d_gradient'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setInspectionMode(mode)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                    inspectionMode === mode 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                      : 'text-slate-400 hover:text-white bg-slate-800/50'
                  }`}
                >
                  {mode === 'thermal_overlay' && (isAr ? 'حراري + بوردة' : 'Thermal Overlay')}
                  {mode === 'rosin_vapor' && (isAr ? 'تبخير الروزين' : 'Rosin Vapor')}
                  {mode === 'pcb_trace' && (isAr ? 'المخطط فقط' : 'Pure PCB')}
                  {mode === '3d_gradient' && (isAr ? 'تدرج 3D' : '3D Gradient')}
                </button>
              ))}
            </div>

            {/* Palettes */}
            <div className="flex items-center gap-1">
              {(['ironbow', 'rainbow', 'lava', 'grayscale'] as const).map(pal => (
                <button
                  key={pal}
                  onClick={() => setActivePalette(pal)}
                  className={`px-2 py-1 text-[10px] font-mono uppercase rounded-lg border transition-all ${
                    activePalette === pal 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-slate-800 text-slate-500 border-transparent hover:text-slate-300'
                  }`}
                >
                  {pal}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Thermal Viewport */}
          <div className="relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center p-2 min-h-[440px]">
            <canvas 
              ref={canvasRef} 
              width={680} 
              height={420} 
              className="rounded-2xl max-w-full h-auto cursor-crosshair shadow-2xl"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = ((e.clientX - rect.left) / rect.width) * 100;
                const clickY = ((e.clientY - rect.top) / rect.height) * 100;
                
                // Find closest hotspot
                let closest = hotspots[0];
                let minDist = 9999;
                hotspots.forEach(spot => {
                  const d = Math.hypot(spot.x - clickX, spot.y - clickY);
                  if (d < minDist) {
                    minDist = d;
                    closest = spot;
                  }
                });
                if (minDist < 15) {
                  setSelectedSpot(closest);
                }
              }}
            />

            {/* Live Crosshair & Temperature HUD */}
            <div className="absolute top-6 left-6 pointer-events-none flex flex-col gap-1 bg-slate-900/90 border border-white/10 p-3 rounded-2xl backdrop-blur-md text-[11px] font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <Target size={14} className="text-red-400 animate-spin" />
                <span>IR MATRIX: 384 x 288 px</span>
              </div>
              <div className="text-slate-400">FPS: 60.0 Hz | NETD: &lt;35mK</div>
              <div className="text-amber-400 font-bold">EMISSIVITY (e): 0.95 (FR4 PCB)</div>
            </div>

            {/* Hotspots clickable tags */}
            {hotspots.map(spot => (
              <button
                key={spot.id}
                onClick={() => setSelectedSpot(spot)}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-xl transition-all ${
                  selectedSpot?.id === spot.id 
                    ? 'ring-4 ring-red-500/50 bg-red-600 text-white font-black' 
                    : spot.severity === 'CRITICAL'
                    ? 'bg-red-950/80 border-red-500/60 text-red-200 hover:scale-110'
                    : 'bg-amber-950/80 border-amber-500/60 text-amber-200 hover:scale-110'
                }`}
              >
                <Flame size={12} className="animate-bounce" />
                <span className="text-[10px] font-mono">{spot.temp}°C</span>
              </button>
            ))}
          </div>

          {/* Voltage Injection Panel */}
          <div className="p-5 bg-slate-900/80 border border-white/5 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{isAr ? 'محاكي حقن الفولت الذكي (Smart Voltage Injection)' : 'Calibrated DC Voltage Injection'}</h4>
                <p className="text-xs text-slate-400">{isAr ? 'حقن فولتية آمنة دون إتلاف معالج الـ SoC أو شرائح الذاكرة' : 'Safe low-voltage injection to illuminate shorted capacitors.'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-mono">{isAr ? 'فولتية الحقن (V):' : 'Voltage (V):'}</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0.8" 
                    max="4.2" 
                    step="0.1" 
                    value={injectedVoltage} 
                    onChange={(e) => setInjectedVoltage(parseFloat(e.target.value))}
                    className="w-24 accent-amber-500" 
                  />
                  <span className="text-xs font-mono font-bold text-amber-400">{injectedVoltage.toFixed(1)}V</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-mono">{isAr ? 'حد التيار (A):' : 'Current Limit (A):'}</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0.5" 
                    max="5.0" 
                    step="0.5" 
                    value={currentLimitAmp} 
                    onChange={(e) => setCurrentLimitAmp(parseFloat(e.target.value))}
                    className="w-24 accent-red-500" 
                  />
                  <span className="text-xs font-mono font-bold text-red-400">{currentLimitAmp.toFixed(1)}A</span>
                </div>
              </div>

              <button
                onClick={handleToggleVoltageInjection}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                  isInjectingVoltage 
                    ? 'bg-red-600 hover:bg-red-500 text-white ring-4 ring-red-500/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
                }`}
              >
                <Zap size={14} className={isInjectingVoltage ? 'fill-current' : ''} />
                {isInjectingVoltage ? (isAr ? 'إيقاف الحقن' : 'STOP INJECTION') : (isAr ? 'تفعيل الحقن' : 'INJECT DC')}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: AI Micro-Short Triangulation & Component Diagnostic Report (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Target Component Card */}
          <div className="p-5 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Microscope size={18} className="text-red-400" />
                <h3 className="text-sm font-black text-white">{isAr ? 'تحليل النقطة الحرارية المشبوهة' : 'Thermal Spot Triangulation'}</h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                AI LOCATOR
              </span>
            </div>

            {selectedSpot ? (
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-red-500/20">
                  <div className="text-[11px] font-mono text-slate-400">{isAr ? 'المسار المتأثر:' : 'Affected Power Rail:'}</div>
                  <div className="text-xs font-bold text-amber-400">{selectedSpot.rail}</div>
                  <div className="text-sm font-black text-white mt-1">{selectedSpot.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400">{isAr ? 'الحرارة المسجلة:' : 'Current Temp:'}</div>
                    <div className="text-base font-mono font-black text-red-400">{selectedSpot.temp}°C</div>
                    <div className="text-[10px] text-slate-500">ΔT: +{(selectedSpot.temp - selectedSpot.healthyTemp).toFixed(1)}°C</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400">{isAr ? 'تيار التسريب:' : 'Leakage Draw:'}</div>
                    <div className="text-base font-mono font-black text-amber-400">{selectedSpot.leakageCurrentMa} mA</div>
                    <div className="text-[10px] text-slate-500">Short Grade: High</div>
                  </div>
                </div>

                <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-300">
                    <AlertTriangle size={14} />
                    <span>{isAr ? 'المكون التالف المشتبه به:' : 'Suspect Defective Component:'}</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white mt-1">
                    {selectedSpot.suspectComponent}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 border border-white/5 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-300 mb-1">
                    {isAr ? 'بروتوكول الصيانة والإصلاح المقترح:' : 'Recommended Repair Protocol:'}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isAr ? selectedSpot.actionAr : selectedSpot.actionEn}
                  </p>
                </div>

                {onNavigateToTool && (
                  <button
                    onClick={() => onNavigateToTool('hardware-workbench')}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    <Cpu size={14} />
                    {isAr ? 'فتح مخطط المايكروسولدير والممانعات' : 'Open in Boardview & Multimeter'}
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                {isAr ? 'انقر على أي نقطة حرارية على البوردة لعرض التقرير الجنائي الدقيق.' : 'Click on any hotspot on the thermal canvas to inspect details.'}
              </div>
            )}
          </div>

          {/* Real-time Diagnostic Log stream */}
          <div className="p-4 bg-slate-900/90 border border-white/5 rounded-3xl flex flex-col gap-2 shadow-lg flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Radio size={14} className="text-emerald-400 animate-ping" />
                {isAr ? 'سجل الرصد الحراري الحي' : 'Live Thermal Telemetry'}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{diagnosticsLogs.length} events</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 h-44 overflow-y-auto font-mono text-[10px] space-y-1.5 text-slate-400">
              {diagnosticsLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-1.5 leading-tight">
                  <span className="text-red-400 font-bold shrink-0">&gt;</span>
                  <span className="text-slate-300">{log}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
