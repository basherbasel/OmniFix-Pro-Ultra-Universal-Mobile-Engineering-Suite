import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  Trash2, 
  Play, 
  Square, 
  Download, 
  Settings,
  AlertCircle,
  Thermometer,
  Gauge
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface PowerDataPoint {
  time: number;
  current: number; // in mA
  voltage: number; // in V
}

export function PowerSignatureLab({ lang }: { lang: 'en' | 'ar' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [data, setData] = useState<PowerDataPoint[]>([]);
  const [currentLimit, setCurrentLimit] = useState(2000); // 2A
  const [voltageSet, setVoltageSet] = useState(4.2); // 4.2V VBAT
  
  // Real-time values
  const [liveAmps, setLiveAmps] = useState(0);
  const [liveVolts, setLiveVolts] = useState(4.2);
  const [liveTemp, setLiveTemp] = useState(28.4);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        // Simulate phone boot current signature
        const time = data.length;
        let newCurrent = 0;
        
        if (time < 10) newCurrent = 50 + Math.random() * 20; // Pre-boot
        else if (time < 30) newCurrent = 200 + Math.random() * 100; // Bootloader
        else if (time < 60) newCurrent = 800 + Math.random() * 400; // Kernel / OS Loading
        else newCurrent = 300 + Math.random() * 50; // Idle
        
        const newDataPoint = { time, current: newCurrent, voltage: voltageSet - (newCurrent/5000) };
        setData(prev => [...prev.slice(-50), newDataPoint]);
        setLiveAmps(newCurrent);
        setLiveVolts(newDataPoint.voltage);
        setLiveTemp(28.4 + (newCurrent / 1000) * 5);
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isRecording, data, voltageSet]);

  const clearData = () => {
    setData([]);
    setLiveAmps(0);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans">
      {/* Top Header Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <Zap size={20} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white leading-tight">
              {lang === 'ar' ? 'محلل استهلاك الطاقة المتقدم' : 'Advanced Power Signature Lab'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">DC Power Supply Analysis Engine v3.0</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              isRecording 
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40' 
              : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isRecording ? <Square size={14} /> : <Play size={14} />}
            {isRecording ? (lang === 'ar' ? 'إيقاف' : 'STOP') : (lang === 'ar' ? 'بدء التحليل' : 'START ANALYSIS')}
          </button>
          <button onClick={clearData} className="p-2 text-slate-500 hover:text-white transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar">
        {/* Real-time Meters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{lang === 'ar' ? 'التيار المباشر' : 'Current (Amps)'}</label>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-amber-400 font-mono">{(liveAmps / 1000).toFixed(3)}</span>
                <span className="text-sm font-bold text-slate-500">A</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{lang === 'ar' ? 'الجهد المباشر' : 'Voltage (Volts)'}</label>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-emerald-400 font-mono">{liveVolts.toFixed(2)}</span>
                <span className="text-sm font-bold text-slate-500">V</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Thermometer size={10} /> {lang === 'ar' ? 'الحرارة' : 'Temp'}
                </label>
                <div className="text-sm font-bold text-white font-mono">{liveTemp.toFixed(1)}°C</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Gauge size={10} /> {lang === 'ar' ? 'الاستهلاك' : 'Power'}
                </label>
                <div className="text-sm font-bold text-white font-mono">{((liveAmps * liveVolts) / 1000).toFixed(2)}W</div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Settings size={14} className="text-indigo-400" />
              {lang === 'ar' ? 'إعدادات مجهز الطاقة' : 'Power Bench Config'}
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500">{lang === 'ar' ? 'تحديد الجهد (V)' : 'Set Voltage'}</span>
                <span className="text-indigo-400">{voltageSet.toFixed(1)}V</span>
              </div>
              <input 
                type="range" min="0" max="5.5" step="0.1" 
                value={voltageSet} onChange={(e) => setVoltageSet(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500">{lang === 'ar' ? 'تحديد الأمبير (OCP)' : 'OCP Current Limit'}</span>
                <span className="text-rose-400">{(currentLimit/1000).toFixed(1)}A</span>
              </div>
              <input 
                type="range" min="500" max="5000" step="100" 
                value={currentLimit} onChange={(e) => setCurrentLimit(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div className="bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 flex items-start gap-2">
              <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-rose-300 leading-relaxed font-medium">
                {lang === 'ar' 
                  ? 'تنبيه: سحب أمبير يتجاوز 1.5A أثناء الإقلاع قد يشير إلى شورت في خط VCC_MAIN.' 
                  : 'Warning: Current draw exceeding 1.5A during early boot indicates a potential short on VCC_MAIN.'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Chart Lab */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl h-[450px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-emerald-400" />
                  {lang === 'ar' ? 'بصمة استهلاك تيار الإقلاع' : 'Boot Power Signature Graph'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                  LIVE 50Hz SAMPLING
                </span>
              </div>
              <button className="p-2 text-slate-500 hover:text-white transition-colors">
                <Download size={18} />
              </button>
            </div>

            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis 
                    domain={[0, 2000]} 
                    stroke="#475569" 
                    fontSize={10} 
                    tickFormatter={(v) => `${v}mA`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                    itemStyle={{ color: '#fbbf24' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="current" 
                    stroke="#fbbf24" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCurrent)" 
                    animationDuration={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fault Comparison & Database */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{lang === 'ar' ? 'بصمات الأعطال المسجلة' : 'Fault Signature Database'}</h4>
              <div className="space-y-2">
                {[
                  { label: lang === 'ar' ? 'إقلاع طبيعي (S26U)' : 'Normal Boot (S26U)', value: '350-1200mA', color: 'bg-emerald-500' },
                  { label: lang === 'ar' ? 'شورت كامل (Dead Short)' : 'Dead Short', value: '> 2500mA', color: 'bg-rose-500' },
                  { label: lang === 'ar' ? 'توقف على شعار (Boot Loop)' : 'Boot Loop', value: '200-400mA Sync', color: 'bg-amber-500' },
                  { label: lang === 'ar' ? 'تسريب بسيط (Leakage)' : 'Minor Leakage', value: '10-80mA Idle', color: 'bg-blue-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-6 rounded-full ${item.color}`} />
                      <span className="text-xs font-bold text-slate-300">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-white transition-colors">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{lang === 'ar' ? 'تحليل الحالة التلقائي' : 'AI Diagnostic Insights'}</h4>
              <div className="flex items-start gap-4 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Activity size={20} className="text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white mb-1">{lang === 'ar' ? 'نمط استهلاك غير مستقر' : 'Unstable Consumption Pattern'}</div>
                  <p className="text-[10px] text-indigo-300/80 leading-relaxed">
                    {lang === 'ar' 
                      ? 'يظهر الرسم البياني تذبذباً عند سحب 400mA. قد يشير هذا إلى خلل في خطوط الـ Buck التابعة لآيسي الباور الثانوي.' 
                      : 'The graph shows oscillation at 400mA. This typically suggests a malfunction in the secondary PMIC Buck regulators or RAM initializing phase.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
