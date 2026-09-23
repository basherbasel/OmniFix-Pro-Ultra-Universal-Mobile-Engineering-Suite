import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Map, 
  Search, 
  Info, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface IspPinout {
  id: string;
  model: string;
  brand: string;
  memoryType: 'EMMC' | 'UFS';
  revision: string;
  imageUrl: string;
  pins: {
    clk: string;
    cmd: string;
    dat0: string;
    vcc: string;
    vccq: string;
    gnd: string;
  };
  notesAr: string;
  notesEn: string;
}

const ISP_DATABASE: IspPinout[] = [
  {
    id: 'isp-s21u',
    model: 'SM-G998B',
    brand: 'Samsung',
    memoryType: 'UFS',
    revision: 'REV 1.0',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop', // Placeholder for actual diagram
    pins: {
      clk: 'TP_CLK_R102',
      cmd: 'TP_CMD_R103',
      dat0: 'TP_DAT0_C105',
      vcc: '2.8V (LDO1)',
      vccq: '1.8V (LDO2)',
      gnd: 'Board Chassis'
    },
    notesAr: 'تنبيه: يجب استخدام مقاومة 100 أوم على خط الـ CLK لتفادي تلف المعالج.',
    notesEn: 'Caution: Use 100 Ohm resistor on CLK line to prevent CPU damage.'
  },
  {
    id: 'isp-redmi-note10',
    model: 'M2101K7AG',
    brand: 'Xiaomi',
    memoryType: 'EMMC',
    revision: 'V2',
    imageUrl: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=2070&auto=format&fit=crop',
    pins: {
      clk: 'CLK_EMMC_P1',
      cmd: 'CMD_EMMC_P2',
      dat0: 'DAT0_EMMC_P3',
      vcc: '3.3V',
      vccq: '1.8V',
      gnd: 'Any GND Pad'
    },
    notesAr: 'يدعم التفليش المباشر عبر Mediatek SP Flash Tool في وضع الـ ISP.',
    notesEn: 'Supports direct flashing via Mediatek SP Flash Tool in ISP mode.'
  }
];

export function IspTestPointHub({ lang }: { lang: 'en' | 'ar' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIsp, setSelectedIsp] = useState<IspPinout | null>(null);

  const filteredIsp = ISP_DATABASE.filter(item => 
    item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-slate-900 font-sans text-slate-200">
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/50">
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder={lang === 'ar' ? 'بحث عن موديل...' : 'Search model...'}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredIsp.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedIsp(item)}
              className={`w-full p-4 flex items-center gap-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-all text-left ${selectedIsp?.id === item.id ? 'bg-indigo-500/10 border-r-2 border-r-indigo-500' : ''}`}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className={`p-2 rounded-lg ${item.memoryType === 'UFS' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                <Cpu size={18} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">{item.model}</div>
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{item.brand} • {item.memoryType}</div>
              </div>
              <ChevronRight size={14} className="text-slate-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
        <AnimatePresence mode="wait">
          {selectedIsp ? (
            <motion.div
              key={selectedIsp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">
                    {selectedIsp.brand} {selectedIsp.model}
                  </h2>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">
                    {selectedIsp.memoryType} {lang === 'ar' ? 'نظام البرمجة المباشرة' : 'In-System Programming Pinout'}
                  </p>
                </div>
                <div className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                  <Maximize2 size={14} />
                  {lang === 'ar' ? 'تكبير المخطط' : 'Fullscreen Diagram'}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Image Diagram Area */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="relative aspect-video rounded-2xl border border-slate-700 bg-black overflow-hidden group">
                    <img 
                      src={selectedIsp.imageUrl} 
                      alt="ISP Pinout" 
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
                      <div className="px-3 py-1 bg-black/80 backdrop-blur border border-slate-700 rounded-full text-[10px] font-bold text-indigo-400">
                        {selectedIsp.revision}
                      </div>
                      <div className="px-3 py-1 bg-black/80 backdrop-blur border border-slate-700 rounded-full text-[10px] font-bold text-emerald-400">
                        {lang === 'ar' ? 'تم التحقق' : 'VERIFIED PINOUT'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-4">
                    <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                    <p className="text-xs text-amber-200/80 leading-relaxed italic">
                      {lang === 'ar' ? selectedIsp.notesAr : selectedIsp.notesEn}
                    </p>
                  </div>
                </div>

                {/* Pin Details */}
                <div className="space-y-6">
                  <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Info size={14} className="text-indigo-400" />
                      {lang === 'ar' ? 'توصيلات الكابل' : 'ISP Jumper Specs'}
                    </h3>
                    
                    <div className="space-y-3">
                      {[
                        { label: 'CLK', value: selectedIsp.pins.clk, color: 'text-rose-400' },
                        { label: 'CMD', value: selectedIsp.pins.cmd, color: 'text-blue-400' },
                        { label: 'DAT0', value: selectedIsp.pins.dat0, color: 'text-amber-400' },
                        { label: 'VCC', value: selectedIsp.pins.vcc, color: 'text-emerald-400' },
                        { label: 'VCCQ', value: selectedIsp.pins.vccq, color: 'text-emerald-400' },
                        { label: 'GND', value: selectedIsp.pins.gnd, color: 'text-slate-400' },
                      ].map((pin, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                          <span className={`text-xs font-black ${pin.color}`}>{pin.label}</span>
                          <span className="text-xs font-mono font-bold text-slate-300">{pin.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">
                      {lang === 'ar' ? 'الأدوات المتوافقة' : 'Compatible Gear'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['Easy JTAG Plus', 'UFI Box', 'Medusa Pro II', 'MIPY Box'].map((tool, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-900 rounded-full text-[10px] font-bold text-slate-400 border border-slate-700">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
              <div className="p-8 rounded-full bg-slate-800/20 border border-slate-800 animate-pulse">
                <Map size={64} className="opacity-20" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-400">{lang === 'ar' ? 'بانتظار اختيار الموديل' : 'Awaiting Model Selection'}</h3>
                <p className="text-xs text-slate-500 mt-2">{lang === 'ar' ? 'يرجى اختيار هاتف من القائمة الجانبية لعرض نقاط الـ ISP' : 'Select a device from the sidebar to view detailed ISP diagrams'}</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
