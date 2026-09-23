import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Zap, 
  Cpu, 
  Eye, 
  Sliders, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Power,
  BarChart2,
  Volume2,
  Droplet
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { audioSynth } from '../utils/audioSynth';

interface ThermalHotspot {
  id: string;
  nameAr: string;
  nameEn: string;
  chipset: string;
  normalTemp: number; // °C
  shortedTemp: number; // °C
  xRatio: number; // 0..1 on PCB
  yRatio: number; // 0..1 on PCB
  rosinEvaporated: boolean;
  solutionAr: string;
  solutionEn: string;
}

interface ThermalRosinCameraStudioProps {
  device: ConnectedDevice;
  lang: 'en' | 'ar';
}

export const ThermalRosinCameraStudio: React.FC<ThermalRosinCameraStudioProps> = ({
  device,
  lang
}) => {
  const isAr = lang === 'ar';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // DC Power Supply Controls
  const [powerOutput, setPowerOutput] = useState<boolean>(false);
  const [injectionVolts, setInjectionVolts] = useState<number>(4.2);
  const [currentLimit, setCurrentLimit] = useState<number>(5.0);
  const [palette, setPalette] = useState<'IRONBOW' | 'RAINBOW' | 'LAVA' | 'GRAY'>('IRONBOW');
  const [rosinMode, setRosinMode] = useState<boolean>(true); // Smoke/Rosin overlay

  // Hotspots on current PCB
  const [hotspots, setHotspots] = useState<ThermalHotspot[]>([
    {
      id: 'cap-c8021',
      nameAr: 'المكثف C8021 على مسار VDD_MAIN (Short to GND)',
      nameEn: 'Capacitor C8021 on VDD_MAIN (Short to GND)',
      chipset: 'Power Rail Bypass Cap',
      normalTemp: 28,
      shortedTemp: 118,
      xRatio: 0.45,
      yRatio: 0.38,
      rosinEvaporated: false,
      solutionAr: 'إزالة المكثف C8021 المتفحم وتغييره بمكثف 10uF 10V B-Case. يعود السحب إلى 0mA قبل الباور.',
      solutionEn: 'Remove shorted capacitor C8021 and replace with 10uF 10V 0402 SMD. Standby current returns to 0mA.'
    },
    {
      id: 'ic-pmic-primary',
      nameAr: 'آيسي الباور الرئيسي PM8350 Primary PMIC',
      nameEn: 'Primary PM8350 Power Management IC',
      chipset: 'PM8350 PMIC',
      normalTemp: 34,
      shortedTemp: 82,
      xRatio: 0.62,
      yRatio: 0.52,
      rosinEvaporated: false,
      solutionAr: 'حرارة مرتفعة ثانوية بسبب شورت المكثف. قم بتغيير المكثف C8021 أولاً قبل رفع الآيسي.',
      solutionEn: 'Secondary heat dissipation due to C8021 rail short. Replace C8021 first before reballing PMIC.'
    }
  ]);

  const [activeSpotId, setActiveSpotId] = useState<string>('cap-c8021');
  const selectedHotspot = hotspots.find(h => h.id === activeSpotId) || hotspots[0];

  // Calculated current draw
  const liveCurrentAmps = powerOutput ? (selectedHotspot.shortedTemp > 80 ? 3.85 : 0.04) : 0;
  const liveWatts = (injectionVolts * liveCurrentAmps).toFixed(1);
  const liveTemp = powerOutput ? selectedHotspot.shortedTemp : selectedHotspot.normalTemp;

  // Sound effect when DC power toggles
  useEffect(() => {
    if (powerOutput) {
      if (selectedHotspot.shortedTemp > 80) {
        audioSynth.playShortCircuitAlarm();
      } else {
        audioSynth.playMultimeterBeep();
      }
    }
  }, [powerOutput, activeSpotId]);

  // Thermal Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark PCB Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Draw PCB Tracks & Grid Lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;

      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw PCB IC Components
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(w * 0.2, h * 0.2, 120, 90); // CPU
      ctx.fillRect(w * 0.55, h * 0.45, 80, 80); // PMIC

      ctx.strokeStyle = '#334155';
      ctx.strokeRect(w * 0.2, h * 0.2, 120, 90);
      ctx.strokeRect(w * 0.55, h * 0.45, 80, 80);

      // Heat gradient rendering for active hotspots
      hotspots.forEach(spot => {
        const spotX = w * spot.xRatio;
        const spotY = h * spot.yRatio;

        const currentSpotTemp = powerOutput ? spot.shortedTemp : spot.normalTemp;
        const radius = powerOutput ? (currentSpotTemp / 100) * 80 : 20;

        // Radial Thermal Gradient
        const grad = ctx.createRadialGradient(spotX, spotY, 2, spotX, spotY, radius);

        if (palette === 'IRONBOW') {
          grad.addColorStop(0, powerOutput ? 'rgba(255, 255, 255, 0.95)' : 'rgba(168, 85, 247, 0.5)');
          grad.addColorStop(0.3, powerOutput ? 'rgba(239, 68, 68, 0.85)' : 'rgba(59, 130, 246, 0.3)');
          grad.addColorStop(0.7, powerOutput ? 'rgba(245, 158, 11, 0.6)' : 'rgba(16, 185, 129, 0.1)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else if (palette === 'LAVA') {
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.4, '#ef4444');
          grad.addColorStop(0.8, '#7c2d12');
          grad.addColorStop(1, 'transparent');
        } else {
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.5, '#06b6d4');
          grad.addColorStop(1, 'transparent');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(spotX, spotY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Rosin Smoke Layer (تبخير الراتنج)
        if (rosinMode) {
          if (powerOutput && spot.shortedTemp > 90) {
            // Smoke particles rising
            ctx.fillStyle = 'rgba(241, 245, 249, 0.45)';
            for (let p = 0; p < 8; p++) {
              const smokeY = spotY - ((frame * 2 + p * 12) % 60);
              const smokeX = spotX + Math.sin(frame * 0.1 + p) * 10;
              const smokeR = 4 + (spotY - smokeY) * 0.2;
              ctx.beginPath();
              ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            // White rosin coating
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.beginPath();
            ctx.arc(spotX, spotY, 22, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Selection Target Ring
        if (spot.id === activeSpotId) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(spotX, spotY, 28, 0, Math.PI * 2);
          ctx.stroke();

          // Crosshair
          ctx.beginPath();
          ctx.moveTo(spotX - 35, spotY);
          ctx.lineTo(spotX + 35, spotY);
          ctx.moveTo(spotX, spotY - 35);
          ctx.lineTo(spotX, spotY + 35);
          ctx.stroke();
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [powerOutput, palette, rosinMode, hotspots, activeSpotId]);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border border-rose-900/40 rounded-xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Flame className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isAr ? 'الكاميرا الحرارية وفاحص الشورت بالراتنج (Thermal Imaging & Rosin Short Isolation Workbench)' : 'Thermal Imaging & Rosin Short Isolation Workbench'}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                DC INJECTION 30V/10A
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'كشف وتسليط الضوء على القطع المحروقة والمكثفات المسببة للشورت بحقن الفولت المباشر وتبخير الدخان'
                : 'Isolate shorted capacitors & burned chips using direct DC voltage injection & Rosin smoke evaporation.'}
            </p>
          </div>
        </div>

        {/* DC Power Supply Toggle */}
        <button
          onClick={() => setPowerOutput(!powerOutput)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
            powerOutput
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{powerOutput ? (isAr ? 'إيقاف حقن الفولت (DC OFF)' : 'POWER OFF (DC STOP)') : (isAr ? 'تشغيل حقن الفولت (DC ON)' : 'POWER ON (DC INJECT)')}</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Thermal Screen Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 shadow-2xl relative">
            {/* Top Thermal HUD Stats */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] font-mono text-slate-300 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span>MAX TEMP: <strong className={liveTemp > 80 ? 'text-rose-400 font-bold text-sm animate-pulse' : 'text-emerald-400'}>{liveTemp.toFixed(1)}°C</strong></span>
                <span>AMPS DRAW: <strong className={liveCurrentAmps > 1 ? 'text-amber-400 font-bold' : 'text-slate-400'}>{liveCurrentAmps.toFixed(2)}A</strong></span>
                <span>POWER: <strong className="text-cyan-400">{liveWatts}W</strong></span>
              </div>

              {/* Palette Controls */}
              <div className="flex items-center gap-1.5">
                {(['IRONBOW', 'LAVA', 'GRAY'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPalette(p)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      palette === p ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Viewport */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <canvas
                ref={canvasRef}
                width={700}
                height={380}
                className="w-full h-[320px] sm:h-[380px] block"
              />

              {/* Rosin Vapor Toggle Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2 flex items-center gap-2">
                <Droplet className={`w-4 h-4 ${rosinMode ? 'text-cyan-400' : 'text-slate-500'}`} />
                <button
                  onClick={() => setRosinMode(!rosinMode)}
                  className="text-[11px] font-bold text-white cursor-pointer"
                >
                  {isAr ? 'تبخير الدخان (Rosin Smoke): ' : 'Rosin Vapor: '}
                  <strong className={rosinMode ? 'text-emerald-400' : 'text-slate-500'}>
                    {rosinMode ? 'ACTIVE' : 'OFF'}
                  </strong>
                </button>
              </div>
            </div>
          </div>

          {/* AI Solution & Diagnosis Box */}
          <div className="p-4 bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-950 border border-rose-500/40 rounded-xl space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>{isAr ? 'تشخيص الشورت والحل الهندسي التلقائي (Short-Circuit AI Solution):' : 'AI Short-Circuit Diagnostic Solution:'}</span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {isAr ? selectedHotspot.solutionAr : selectedHotspot.solutionEn}
            </p>
          </div>
        </div>

        {/* Right Column: DC Power Controls & Hotspots (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* DC Power Controls Box */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'حاقن الفولت DC Power Supply:' : 'DC Power Supply Controls:'}</span>
            </h4>

            <div className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>{isAr ? 'الفولتية المحقونة (Voltage):' : 'Injected Volts:'}</span>
                  <span className="text-amber-300 font-bold">{injectionVolts.toFixed(1)}V DC</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={12.0}
                  step={0.1}
                  value={injectionVolts}
                  onChange={(e) => setInjectionVolts(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>{isAr ? 'حد التيار (Current Limit):' : 'Ampere Limit:'}</span>
                  <span className="text-cyan-300 font-bold">{currentLimit.toFixed(1)}A</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={10.0}
                  step={0.5}
                  value={currentLimit}
                  onChange={(e) => setCurrentLimit(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Hotspots Directory */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>{isAr ? 'نقاط الحرارة المكتشفة على البوردة:' : 'Detected Board Hotspots:'}</span>
            </h4>

            <div className="space-y-2">
              {hotspots.map(spot => (
                <button
                  key={spot.id}
                  onClick={() => {
                    setActiveSpotId(spot.id);
                    audioSynth.playMultimeterBeep();
                  }}
                  className={`w-full p-3 rounded-xl border text-right rtl:text-right ltr:text-left transition-all cursor-pointer ${
                    spot.id === activeSpotId
                      ? 'bg-slate-950 border-rose-500/60 shadow-lg shadow-rose-950/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-white block mb-1">
                    {isAr ? spot.nameAr : spot.nameEn}
                  </span>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Chip: <strong className="text-cyan-300">{spot.chipset}</strong></span>
                    <span>Temp: <strong className="text-rose-400">{spot.shortedTemp}°C</strong></span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
