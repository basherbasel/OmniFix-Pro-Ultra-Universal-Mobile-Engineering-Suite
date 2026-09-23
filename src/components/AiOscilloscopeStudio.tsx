import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Zap, 
  Cpu, 
  Radio, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart2, 
  Maximize2, 
  Settings,
  Volume2,
  Sliders,
  Layers,
  Sparkles,
  Terminal,
  Trophy
} from 'lucide-react';
import { motion } from 'motion/react';
import { ConnectedDevice } from '../types';
import { audioSynth } from '../utils/audioSynth';

interface SignalPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  frequency: string;
  voltagePeak: string;
  protocol: string;
  color: string;
  status: 'HEALTHY' | 'DEGRADED' | 'SHORT';
  aiReportAr: string;
  aiReportEn: string;
  generatorFunc: (t: number, noise: number) => number;
}

interface AiOscilloscopeStudioProps {
  device: ConnectedDevice;
  lang: 'en' | 'ar';
}

export const AiOscilloscopeStudio: React.FC<AiOscilloscopeStudioProps> = ({
  device,
  lang
}) => {
  const isAr = lang === 'ar';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activeSignalId, setActiveSignalId] = useState<string>('i2c-bus');
  const [timebase, setTimebase] = useState<number>(1); // Scale multiplier
  const [voltsPerDiv, setVoltsPerDiv] = useState<number>(1);
  const [noiseLevel, setNoiseLevel] = useState<number>(0.05);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [triggerMode, setTriggerMode] = useState<'AUTO' | 'SINGLE' | 'NORM'>('AUTO');

  React.useEffect(() => {
    // Automatically select signal preset based on connected device chipset
    if (device.chipset === 'qualcomm') {
      setActiveSignalId('buck-sw');
    } else if (device.chipset === 'mediatek') {
      setActiveSignalId('i2c-bus');
    } else if (device.chipset === 'samsung_exynos') {
      setActiveSignalId('mipi-dsi');
    } else {
      setActiveSignalId('usb-data');
    }
  }, [device]);

  const presets: SignalPreset[] = [
    {
      id: 'i2c-bus',
      nameAr: 'مسار بيانات I2C (SDA/SCL - PMIC Communication Bus)',
      nameEn: 'I2C Data Bus (SDA/SCL - PMIC Bus)',
      frequency: '400 kHz (Fast Mode)',
      voltagePeak: '1.8V p-p',
      protocol: 'I2C / SPMI',
      color: '#38bdf8', // Cyan
      status: 'HEALTHY',
      aiReportAr: '✓ إشارة I2C سليمة بجهد 1.8V ثابت مع حواف صعود وهبوط حادة (Sharpe Rise/Fall times). اتصالات معالج التغذية PMIC خالية من الضوضاء.',
      aiReportEn: '✓ Healthy 1.8V I2C waveform with sharp rise/fall edges. PMIC serial communication bus is clear and responsive.',
      generatorFunc: (t, noise) => {
        // Square wave with I2C start/stop condition pulses
        const pulse = Math.sin(t * 12) > 0 ? 1.8 : 0;
        return pulse + (Math.random() - 0.5) * noise;
      }
    },
    {
      id: 'mipi-dsi',
      nameAr: 'مسار شاشة MIPI DSI High-Speed Differential Lane',
      nameEn: 'MIPI DSI High-Speed Display Lane',
      frequency: '1.2 GHz Data Rate',
      voltagePeak: '1.2V p-p',
      protocol: 'MIPI DSI-2',
      color: '#a855f7', // Purple
      status: 'HEALTHY',
      aiReportAr: '✓ نمط العين (Eye Diagram) والتذبذب التفاضلي لمسارات الشاشة AMOLED سليم. لا توجد انقطاعات في كابل الفلاتة أو المقاومات الحرارية.',
      aiReportEn: '✓ Open Eye Diagram and clean differential signaling on AMOLED screen interface. No trace fractures detected.',
      generatorFunc: (t, noise) => {
        // Differential high-speed packet burst
        const burst = Math.sin(t * 40) * Math.cos(t * 3) * 0.9 + 0.6;
        return burst + (Math.random() - 0.5) * noise;
      }
    },
    {
      id: 'buck-sw',
      nameAr: 'تذبذب ملف الباور VDD_CPU Buck Switching Pulse',
      nameEn: 'VDD_CPU Buck Regulator SW Waveform',
      frequency: '2.4 MHz PWM',
      voltagePeak: '3.8V Peak',
      protocol: 'PWM Buck',
      color: '#f59e0b', // Amber
      status: 'HEALTHY',
      aiReportAr: '✓ نبضات التقطيع ملف السويتشينغ للـ PMIC تعمل بنظام PWM بجهد 3.8V ومغناطيسية مستقرة مع الحد الأدنى من الريبل (Low Ripple).',
      aiReportEn: '✓ Switching regulator coil shows clean PWM pulses at 2.4MHz with negligible voltage ripple under load.',
      generatorFunc: (t, noise) => {
        // Sawtooth / PWM pulse with ringing
        const saw = (t % 1) * 3.5;
        const ring = Math.sin(t * 30) * Math.exp(-(t % 1) * 3) * 0.4;
        return saw + ring + (Math.random() - 0.5) * noise;
      }
    },
    {
      id: 'xtal-clock',
      nameAr: 'تذبذب الكريستالة الرئيسية 38.4MHz System Crystal Oscillator',
      nameEn: '38.4MHz Main System Crystal Oscillator',
      frequency: '38.4000 MHz',
      voltagePeak: '0.8V p-p',
      protocol: 'Sine Clock',
      color: '#10b981', // Emerald
      status: 'HEALTHY',
      aiReportAr: '✓ موجة جيبية نقية Sine Wave عند تردد 38.4MHz. ساعة النظام والمعالج متزامنة بدقة عالية.',
      aiReportEn: '✓ Pure 38.4MHz sinusoidal waveform. Master system clock and CPU phase locked loop (PLL) are synchronized.',
      generatorFunc: (t, noise) => {
        // Pure sine wave
        return Math.sin(t * 20) * 0.8 + 0.9 + (Math.random() - 0.5) * noise;
      }
    },
    {
      id: 'usb-dp-dm',
      nameAr: 'مسار USB D+/D- Eye Diagram (موجة مضطربة / شورت)',
      nameEn: 'USB D+/D- Noisy Eye Diagram (Degraded Line)',
      frequency: '480 Mbps High Speed',
      voltagePeak: '0.4V p-p',
      protocol: 'USB 2.0 PHY',
      color: '#ef4444', // Red
      status: 'DEGRADED',
      aiReportAr: '⚠️ تشوه وخروش في إشارة USB D+ بجهد منخفض 0.2V مع ضوضاء عالية. السبب المحتمل: حماية OVP متضررة أو تسريب في ديودات ESD على مدخل C-Type.',
      aiReportEn: '⚠️ Jitter and attenuation on USB D+ data line (0.2V peak). Root cause: Damaged ESD protection diodes or corroded Type-C connector.',
      generatorFunc: (t, noise) => {
        // Noisy distorted wave
        return Math.sin(t * 15) * 0.3 + (Math.random() - 0.5) * (noise + 0.35) + 0.5;
      }
    }
  ];

  const currentPreset = presets.find(p => p.id === activeSignalId) || presets[0];

  // Canvas Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      if (!isFrozen) {
        time += 0.08 * timebase;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Background grid
      ctx.fillStyle = '#020617'; // Slate 950
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)'; // Slate 800

      const numGridX = 12;
      const numGridY = 8;

      for (let i = 0; i <= numGridX; i++) {
        const x = (width / numGridX) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let j = 0; j <= numGridY; j++) {
        const y = (height / numGridY) * j;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center Reference Axes
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)'; // Slate 700
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // Draw Signal Waveform
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = currentPreset.color;
      ctx.shadowColor = currentPreset.color;
      ctx.shadowBlur = 10;

      const centerY = height * 0.65;
      const scaleY = (height / 8) * voltsPerDiv;

      for (let x = 0; x < width; x++) {
        const tVal = time + (x / width) * 10 * timebase;
        const val = currentPreset.generatorFunc(tVal, noiseLevel);
        const y = centerY - val * scaleY;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // Trigger line indicator
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)'; // Yellow
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, centerY - 1.8 * scaleY);
      ctx.lineTo(width, centerY - 1.8 * scaleY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeSignalId, timebase, voltsPerDiv, noiseLevel, isFrozen, currentPreset]);

  return (
    <div className="space-y-8 perspective-1000 preserve-3d">
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden preserve-3d"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight leading-tight">
                {isAr ? 'راسم الإشارات والأوسيلوسكوب الذكي' : 'AI Oscilloscope Studio'}
              </h3>
              <span className="px-3 py-1 text-[10px] font-black font-mono rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 tracking-widest uppercase">
                2.5 GSa/s ULTRA-RES
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-black uppercase tracking-widest opacity-60">
              {isAr
                ? 'فحص ترددات ساعات المعالج، بروتوكولات I2C/SPMI، ونبضات MIPI DSI'
                : 'Inspect master CPU clock frequencies, I2C/SPMI buses, & MIPI DSI lanes'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <motion.button
            whileHover={{ scale: 1.05, translateY: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsFrozen(!isFrozen);
              audioSynth.playMultimeterBeep();
            }}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all border border-white/20 flex items-center gap-3 ${
              isFrozen
                ? 'bg-amber-600 text-white shadow-amber-600/30'
                : 'bg-emerald-600 text-white shadow-emerald-600/30'
            }`}
          >
            {isFrozen ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            <span>{isFrozen ? (isAr ? 'تشغيل المراقبة' : 'Resume Live') : (isAr ? 'تجميد اللقطة' : 'Freeze Frame')}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Grid: Waveform Canvas + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch preserve-3d">
        
        {/* Left Column: Waveform Screen (8 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 space-y-6 preserve-3d"
        >
          <div className="bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.4)] relative overflow-hidden preserve-3d">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
            
            {/* Screen Top Status Bar */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 relative z-10">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-3 text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  CH1: {currentPreset.protocol}
                </span>
                <span className="opacity-60">Timebase: {timebase}ms/div</span>
                <span className="opacity-60">Volts: {voltsPerDiv}V/div</span>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-amber-300">TRIG: {triggerMode} 1.80V</span>
                <span className="text-cyan-300">60.0 FPS</span>
              </div>
            </div>

            {/* Canvas Screen Container */}
            <div className="relative rounded-[2rem] overflow-hidden border border-white/5 bg-slate-950 shadow-inner group">
              <canvas
                ref={canvasRef}
                width={700}
                height={400}
                className="w-full h-[320px] sm:h-[400px] block opacity-90 group-hover:opacity-100 transition-opacity"
              />

              {/* On-screen Measure HUD Overlay */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 font-mono text-[10px] space-y-3 shadow-2xl z-10"
              >
                <div className="text-slate-500 font-black border-b border-white/5 pb-2 uppercase tracking-widest">{isAr ? 'قراءات الإشارة المباشرة:' : 'Live Telemetry'}</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-slate-400">Frequency:</span>
                    <strong className="text-cyan-400">{currentPreset.frequency}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-slate-400">Peak-to-Peak:</span>
                    <strong className="text-emerald-400">{currentPreset.voltagePeak}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-slate-400">Noise Level:</span>
                    <strong className="text-amber-400">{(noiseLevel * 100).toFixed(0)}%</strong>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Oscilloscope Hardware Control Knobs */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              {[
                { 
                  label: isAr ? 'مقياس الزمن' : 'Timebase', 
                  value: `${timebase.toFixed(1)}ms`,
                  onDec: () => setTimebase(prev => Math.max(0.2, prev - 0.2)),
                  onInc: () => setTimebase(prev => Math.min(5, prev + 0.2)),
                  color: 'cyan'
                },
                { 
                  label: isAr ? 'مقياس الفولت' : 'Volts/Div', 
                  value: `${voltsPerDiv.toFixed(1)}V`,
                  onDec: () => setVoltsPerDiv(prev => Math.max(0.2, prev - 0.2)),
                  onInc: () => setVoltsPerDiv(prev => Math.min(3, prev + 0.2)),
                  color: 'emerald'
                },
                { 
                  label: isAr ? 'حاقن الضوضاء' : 'Noise Inject', 
                  value: `${(noiseLevel * 100).toFixed(0)}%`,
                  onDec: () => setNoiseLevel(prev => Math.max(0, prev - 0.05)),
                  onInc: () => setNoiseLevel(prev => Math.min(0.5, prev + 0.05)),
                  color: 'amber'
                }
              ].map((knob, idx) => (
                <div key={idx} className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3 shadow-inner hover:border-white/10 transition-all">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{knob.label}</span>
                  <div className="flex items-center justify-between">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={knob.onDec}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-lg cursor-pointer transition-all"
                    >-</motion.button>
                    <span className={`text-${knob.color}-400 font-black text-[11px] font-mono`}>{knob.value}</span>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={knob.onInc}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-lg cursor-pointer transition-all"
                    >+</motion.button>
                  </div>
                </div>
              ))}

              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3 shadow-inner hover:border-white/10 transition-all">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{isAr ? 'نمط الزناد' : 'Trigger Mode'}</span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const modes: ('AUTO' | 'SINGLE' | 'NORM')[] = ['AUTO', 'SINGLE', 'NORM'];
                    const next = modes[(modes.indexOf(triggerMode) + 1) % modes.length];
                    setTriggerMode(next);
                  }}
                  className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-cyan-300 font-black text-[10px] uppercase tracking-widest rounded-xl cursor-pointer text-center border border-indigo-500/20 transition-all"
                >
                  {triggerMode}
                </motion.button>
              </div>
            </div>
          </div>

          {/* AI Signal Diagnosis Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] space-y-6 shadow-[0_40px_80px_rgba(0,0,0,0.3)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-inner">
                  <Sparkles className="w-5 h-5 animate-spin-slow" />
                </div>
                <h4 className="text-sm font-black text-white uppercase italic tracking-widest">
                  {isAr ? 'تحليل الإشارة بالذكاء الاصطناعي' : 'AI Signal Intelligence Report'}
                </h4>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic ${
                currentPreset.status === 'HEALTHY'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {currentPreset.status}
              </span>
            </div>

            <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 shadow-inner relative z-10">
              <p className="text-xs text-slate-200 leading-relaxed italic font-medium">
                {isAr ? currentPreset.aiReportAr : currentPreset.aiReportEn}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Signal Directory & Test Probes (4 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-6 preserve-3d"
        >
          <div className="bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.4)] space-y-8 relative overflow-hidden h-full preserve-3d">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
            
            <h4 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-4 border-b border-white/5 pb-6 relative z-10">
              <Radio className="w-6 h-6 text-cyan-400" />
              <span>{isAr ? 'دليل مسارات الفحص' : 'Signal Probe Directory'}</span>
            </h4>

            <div className="space-y-4 relative z-10 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {presets.map((preset, idx) => {
                const isSelected = preset.id === activeSignalId;
                return (
                  <motion.button
                    key={preset.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02, translateX: isAr ? -4 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveSignalId(preset.id);
                      audioSynth.playMultimeterBeep();
                    }}
                    className={`w-full p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-white/20 shadow-2xl shadow-indigo-600/30'
                        : 'bg-black/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                    )}
                    
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                          style={{ backgroundColor: preset.color }} 
                        />
                        <span className={`text-[11px] font-black uppercase tracking-tight leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {isAr ? preset.nameAr : preset.nameEn}
                        </span>
                      </div>
                      {isSelected && <Sparkles className="w-4 h-4 text-white/60 animate-pulse" />}
                    </div>

                    <div className={`flex items-center justify-between text-[10px] font-black uppercase tracking-widest relative z-10 ${isSelected ? 'text-white/60' : 'text-slate-500'}`}>
                      <span>Freq: <strong className={isSelected ? 'text-white' : 'text-cyan-400'}>{preset.frequency}</strong></span>
                      <span>Vpp: <strong className={isSelected ? 'text-white' : 'text-emerald-400'}>{preset.voltagePeak}</strong></span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Quick Action Info */}
            <div className="p-6 bg-cyan-500/5 rounded-[2rem] border border-cyan-500/20 space-y-3 relative z-10">
              <div className="flex items-center gap-3 text-cyan-400">
                <Terminal className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">{isAr ? 'نصيحة المهندس' : 'Technician Tip'}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                {isAr 
                  ? 'استخدم مسبار 10x لفحص كريستالات التردد العالي لتقليل سعة التحميل على الدائرة.' 
                  : 'Use 10x probe attenuation for high-frequency crystal analysis to minimize circuit loading.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
