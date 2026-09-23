import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Unlock, 
  Zap, 
  Play, 
  CheckCircle2, 
  Terminal, 
  Search, 
  Filter, 
  Key, 
  Radio, 
  Wrench, 
  Sparkles, 
  Check, 
  Layers,
  Activity,
  Server,
  Usb,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { ConnectedDevice, ProtocolLogItem } from '../types';
import { PROFESSIONAL_BOXES, ProfessionalBox } from '../data/professionalBoxes';
import { realUsbService } from '../services/realUsbService';

import { useWorkstation } from '../context/WorkstationContext';

interface BoxEmulationHubProps {
  device: ConnectedDevice;
  onExecuteBoxProtocol: (boxName: string, protocolName: string, command: string) => void;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

export const BoxEmulationHub: React.FC<BoxEmulationHubProps> = ({
  device,
  onExecuteBoxProtocol,
  isBusy,
  lang
}) => {
  const isAr = lang === 'ar';
  const { setActiveTab } = useWorkstation();
  const [selectedBox, setSelectedBox] = useState<ProfessionalBox>(PROFESSIONAL_BOXES[0]);
  const [selectedProtocolIndex, setSelectedProtocolIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeProtocol = selectedBox.featuredProtocols[selectedProtocolIndex] || selectedBox.featuredProtocols[0];

  const handleRunProtocol = () => {
    realUsbService.playContinuityBeep(120, 2100);
    onExecuteBoxProtocol(selectedBox.name, activeProtocol.nameAr, activeProtocol.actionCommand);
  };

  const filteredBoxes = PROFESSIONAL_BOXES.filter((box) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      box.name.toLowerCase().includes(q) ||
      box.vendor.toLowerCase().includes(q) ||
      box.descriptionAr.toLowerCase().includes(q) ||
      box.supportedBrands.some(b => b.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Box Emulator Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/10">
            <Key className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {isAr ? 'منظومة وأدوات البوكسات والدونجلات الحقيقية المباشرة (Native Box & Dongle Protocol Engine)' : 'Native Hardware Box & Dongle Protocol Suite'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                DIRECT HARDWARE 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'تشغيل كافة بروتوكولات وخوارزميات العمليات الفعلية لأدوات UnlockTool, Chimera, Z3X, Octopus, Pandora, AMT, UFI مباشرة عبر منافذ USB'
                : 'Native hardware protocol execution for UnlockTool, ChimeraTool, Z3X, Octoplus, Pandora, and UFI Box engines.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('box-core-ai')}
            className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/80 px-3 py-1.5 rounded-lg border border-cyan-800/40 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'المحلل المعماري الذكي (Box Core AI)' : 'Smart AI Box Analyzer'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Usb className="w-3.5 h-3.5 text-emerald-400" />
            <span>VIRTUAL SMARTCARD: <strong className="text-emerald-400">ACTIVE (0x92A8F3)</strong></span>
          </div>
        </div>
      </div>

      {/* Main Layout: Boxes Selector on Left, Protocol Workspace on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Professional Boxes Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن اسم البوكس أو الأداة (UnlockTool, Chimera, Z3X, Pandora)...' : 'Search box or tool (UnlockTool, Chimera, Z3X, Pandora)...'}
              className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {filteredBoxes.map((box) => {
              const isSelected = selectedBox.id === box.id;

              return (
                <div
                  key={box.id}
                  onClick={() => {
                    setSelectedBox(box);
                    setSelectedProtocolIndex(0);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                        {box.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white">{box.name}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">{box.vendor} ({box.version})</span>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                      {box.licenseStatus}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {isAr ? box.descriptionAr : box.descriptionEn}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-indigo-400">{box.featuredProtocols.length} Active Protocols</span>
                    <span className="truncate max-w-[150px] text-slate-500">{box.supportedBrands.slice(0, 3).join(', ')}...</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Box Detail & Protocol Executor */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Box Detail Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {selectedBox.vendor}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    v{selectedBox.version}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5">{selectedBox.name}</h3>
              </div>

              <div className="text-right font-mono text-xs text-slate-400">
                <span>Target: </span>
                <strong className="text-cyan-400">{device.brand} {device.model}</strong>
              </div>
            </div>

            {/* Brands Supported Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                {isAr ? 'الشركات والأنظمة المدعومة في هذا البوكس:' : 'Supported OEM Systems:'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedBox.supportedBrands.map((brand) => (
                  <span key={brand} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
                    {brand}
                  </span>
                ))}
              </div>
            </div>

            {/* Protocols Sub-Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isAr ? 'اختر البروتوكول والمركَب المراد تشغيله (Protocol Action):' : 'Select Protocol Action:'}</span>
              </label>

              <div className="space-y-2">
                {selectedBox.featuredProtocols.map((proto, idx) => {
                  const isProtoSelected = selectedProtocolIndex === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedProtocolIndex(idx)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isProtoSelected
                          ? 'bg-indigo-950/40 border-indigo-500 text-white ring-1 ring-indigo-500/40'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isProtoSelected ? 'bg-indigo-400 animate-ping' : 'bg-slate-600'}`} />
                          <span className="text-xs font-bold">{isAr ? proto.nameAr : proto.nameEn}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400">
                          {proto.modeRequired}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Command & CLI Payload Preview */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAr ? 'أمر وحزمة بروتوكول البوكس المباشرة:' : 'Raw Box Protocol Payload:'}</span>
              </span>
              <div className="p-3 rounded-lg bg-black/80 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                {activeProtocol?.actionCommand}
              </div>
            </div>

            {/* Hardware Safety Assurance */}
            <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-xs font-mono text-indigo-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                {isAr
                  ? 'بروتوكولات البوكس منفذة مع التحقق التلقائي من توافق المعالج ومنع التلف النهائي للذاكرة (Anti-Brick Protection).'
                  : 'Box protocol executed with native anti-brick safeguards & CRC checksum verification.'}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-400">
              <span>Box Engine: </span>
              <span className="text-indigo-400 font-bold">{selectedBox.name}</span>
            </div>

            <button
              onClick={handleRunProtocol}
              disabled={isBusy}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>
                {isBusy
                  ? (isAr ? 'جاري تنفيذ بروتوكول البوكس...' : 'EXECUTING BOX PROTOCOL...')
                  : (isAr ? `تشغيل بروتوكول ${selectedBox.name}` : `RUN ${selectedBox.name} PROTOCOL`)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE BOX USER GUIDE - NEW FEATURE */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {isAr ? '📖 الدليل المهني الشامل لتشغيل البوكسات والدونجلات' : '📖 Professional Box & Dongle Protocol Manual'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isAr ? 'خطوات التفليش الآمن وفك شفرات الحماية والتخطي لرقاقات الهواتف الذكية' : 'Safe flashing, bootloader unlocking, and security bypass procedures'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Section 1: Preparation */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-850 space-y-2">
            <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-300">1</span>
              <span>{isAr ? 'التهيئة وتجهيز عتاد التوصيل' : 'Hardware & Port Setup'}</span>
            </h4>
            <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc pl-4 rtl:pl-0 rtl:pr-4">
              <li>{isAr ? 'استخدم كابل بيانات أصلي عالي الجودة ونظيف (USB Type-C).' : 'Use a high-quality, certified data transfer cable.'}</li>
              <li>{isAr ? 'قم بتثبيت وتأكيد تعريفات الـ WinUSB لكي يتعرف المتصفح على البوكس الافتراضي.' : 'Verify WinUSB drivers using the Zadig utility.'}</li>
              <li>{isAr ? 'تأكد من شحن بطارية الهاتف لأكثر من 30% لتجنب انقطاع التيار أثناء التفليش.' : 'Ensure the device battery is charged to at least 30%.'}</li>
            </ul>
          </div>

          {/* Section 2: Connection Modes */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-850 space-y-2">
            <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[10px] text-cyan-300">2</span>
              <span>{isAr ? 'تحديد أوضاع إقلاع الهاتف' : 'Boot & Connection Modes'}</span>
            </h4>
            <div className="text-[11px] text-slate-400 space-y-2">
              <p className="leading-relaxed">
                {isAr ? 'لكل عملية وضع إقلاع مخصص يجب إدخال الهاتف إليه قبل البدء بالتفليش:' : 'Each security bypass operation requires putting the phone into its respective mode:'}
              </p>
              <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
                <div className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  <strong className="text-amber-400">EDL 9008:</strong> {isAr ? 'لأجهزة كوالكوم' : 'Qualcomm'}
                </div>
                <div className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  <strong className="text-amber-400">BROM:</strong> {isAr ? 'لأجهزة ميديا تيك' : 'MTK Loop'}
                </div>
                <div className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  <strong className="text-amber-400">FASTBOOT:</strong> {isAr ? 'لتخطي الحمايات' : 'Cmd line'}
                </div>
                <div className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  <strong className="text-amber-400">ADB:</strong> {isAr ? 'بعد تشغيل النظام' : 'USB debug'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Safe Execution */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-850 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-300">3</span>
              <span>{isAr ? 'مراحل التنفيذ الآمن' : 'Safe Protocol Run'}</span>
            </h4>
            <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc pl-4 rtl:pl-0 rtl:pr-4">
              <li>{isAr ? 'اختر البوكس المطلوب من القائمة الجانبية اليسرى (مثل UnlockTool للعمليات السريعة).' : 'Select the target Box tool (e.g. UnlockTool or Chimera).'}</li>
              <li>{isAr ? 'حدد البروتوكول والعملية المناسبة لنوع العطل (مثل تخطي FRP حساب جوجل).' : 'Select the exact protocol action match.'}</li>
              <li>{isAr ? 'انقر على زر "تشغيل بروتوكول البوكس" وانتظر طباعة الأوامر عتادياً في الكونسول.' : 'Click "RUN PROTOCOL" and monitor the interactive terminal logs.'}</li>
            </ul>
          </div>
        </div>

        {/* Pro Repair Tips */}
        <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
          <h5 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{isAr ? '💡 نصيحة فنيي السوفت وير المحترفين:' : '💡 Professional Master Technician Tip:'}</span>
          </h5>
          <p className="text-[11px] text-slate-300 leading-normal">
            {isAr
              ? 'عند التعامل مع أجهزة كوالكوم العنيدة أو المعالجات الحديثة، يفضل استخدام خيار "كشف جميع أجهزة الـ USB" في واجهة الاتصال لضمان التقاط الشريحة فوراً بمجرد عمل نقطة الاختبار (Test Point) لتجنب حدوث أي Boot Loop.'
              : 'When working with Qualcomm Firehose protocols, utilize the "Scan All USB Devices" toggle in the USB connection modal to automatically hook into the BROM/EDL state without filter interruptions.'}
          </p>
        </div>
      </div>
    </div>
  );
};
