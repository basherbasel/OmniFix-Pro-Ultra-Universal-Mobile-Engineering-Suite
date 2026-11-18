import React, { useState } from 'react';
import { 
  Smartphone, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Radio, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Wrench,
  Sparkles
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  appleBasebandEngine, 
  BasebandDiagnosis, 
  SAMPLE_BB_DIAGNOSIS 
} from '../services/AppleBasebandEngine';
import { realUsbService } from '../services/realUsbService';
import { useWorkstation } from '../context/WorkstationContext';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const AppleBasebandStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';

  const [diagnosis, setDiagnosis] = useState<BasebandDiagnosis>(SAMPLE_BB_DIAGNOSIS);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    'OmniFix Apple Baseband EEPROM & Modem Panic Studio v2026.9 initialized.',
    'MobileGestalt & Panic Abort Parser Online.',
    'Connect iPhone in Diagnostics or Normal Mode to inspect Baseband PMIC & EEPROM.'
  ]);

  const addLog = (m: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);
    if (onAddLog) onAddLog(`[BASEBAND_STUDIO] ${m}`);
  };

  const handleProbeBaseband = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Inspecting iPhone Baseband hardware & measuring voltages...');
    realUsbService.playContinuityBeep(120, 2200);

    const res = await appleBasebandEngine.probeBaseband(addLog);
    if (res.success) {
      setDiagnosis(res.diagnosis);
      const msg = isAr 
        ? `✅ تم فحص مودم البيسباند (${res.diagnosis.modemFirmware}) بنجاح!`
        : `✅ Baseband inspected (${res.diagnosis.modemFirmware})!`;
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(250, 2800);
    }

    setIsExecuting(false);
  };

  const handleRepairChecksum = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSuccessBanner(null);

    addLog('Recalculating and flashing Baseband EEPROM checksum...');
    realUsbService.playContinuityBeep(120, 2400);

    const res = await appleBasebandEngine.repairEepromChecksum(addLog);
    if (res.success) {
      setDiagnosis(prev => ({ ...prev, bbEepromStatus: 'CALIBRATION_OK' }));
      const msg = isAr 
        ? '✅ تم بنجاح إصلاح Checksum الـ EEPROM! تم حل مشكلة "جاري البحث..." وتعطل المودم.'
        : '✅ Baseband EEPROM Checksum restored successfully!';
      setSuccessBanner(msg);
      addLog(msg);
      realUsbService.playContinuityBeep(300, 3200);
    }

    setIsExecuting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-rose-600 via-red-600 to-amber-600 rounded-xl shadow-lg shadow-red-500/20">
            <Radio className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-rose-400 via-red-300 to-amber-300 bg-clip-text text-transparent">
                {isAr ? 'مختبر البيسباند والـ EEPROM لآيفون (Apple Baseband & Modem Panic Lab)' : 'Apple Baseband EEPROM & Modem Studio'}
              </h1>
              <span className="bg-red-500/10 text-red-400 text-xs px-2.5 py-0.5 rounded-full border border-red-500/20 font-mono font-bold">
                Modem Panic & SPI EEPROM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'تشخيص أعطال الشبكة ومودم كوالكوم في آيفون: قراءة خطوط فولت الـ PMIC، فحص سجلات Panic، وإصلاح Checksum الـ EEPROM'
                : 'Diagnoses No Service / Searching, parses Baseband Panic logs, and repairs SPI EEPROM calibration checksum'}
            </p>
          </div>
        </div>

        <button
          onClick={handleProbeBaseband}
          disabled={isExecuting}
          className="bg-slate-950 hover:bg-slate-800 text-red-300 border border-slate-800 hover:border-red-500/50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isAr ? 'فحص البيسباند' : 'Probe Baseband'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3.5 text-xs text-emerald-200 flex items-center justify-between shadow-lg shadow-emerald-950/30 animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{successBanner}</span>
          </div>
          <button 
            onClick={() => setSuccessBanner(null)} 
            className="text-emerald-400 hover:text-white px-2 py-1 rounded text-[11px] font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Telemetry & Voltages */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-red-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Activity className="w-4 h-4" />
              <span>{isAr ? 'بيانات مودم كوالكوم وفولتات الـ PMIC' : 'Modem Subsystem & Voltages'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Model & Modem IC:</span>
                <span className="font-bold text-white">{diagnosis.deviceModel}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Modem Firmware:</span>
                <span className="font-bold text-rose-300">{diagnosis.modemFirmware}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">BB_PMU_LDO1 (1.8V):</span>
                <span className="font-bold text-emerald-400">{diagnosis.bbPmuRailVoltages.bbPmuLdo1} V (Normal)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">BB_PMU_LDO2 (0.85V):</span>
                <span className="font-bold text-emerald-400">{diagnosis.bbPmuRailVoltages.bbPmuLdo2} V (Normal)</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <span className="text-slate-500 block text-[10px]">Panic Log Reason:</span>
              <p className="text-amber-300 text-[11px]">{diagnosis.panicLogTrace}</p>
              <div className="pt-1">
                <span className="text-slate-500 block text-[10px]">Hardware Prescription:</span>
                <p className="text-cyan-300 font-bold text-[11px]">{diagnosis.recommendedHardwareFix}</p>
              </div>
            </div>
          </div>

          {/* 1-Click Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'إصلاح الـ EEPROM والشبكة الفوري' : '1-Click Baseband EEPROM Tools'}</span>
            </span>

            <button
              onClick={handleRepairChecksum}
              disabled={isExecuting}
              className="w-full p-3.5 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl shadow-lg shadow-red-600/20 text-left transition-all cursor-pointer flex justify-between items-center disabled:opacity-50"
            >
              <div>
                <div className="font-black text-xs">{isAr ? 'إصلاح وتصحيح Checksum الـ EEPROM' : '1-Click Recalculate EEPROM Checksum'}</div>
                <div className="text-[10px] text-rose-100">{isAr ? 'إصلاح عطل جاري البحث (Searching) وتلف بيانات المودم' : 'Fixes searching / no modem firmware panic'}</div>
              </div>
              <ShieldCheck className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Right: Console */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[420px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-rose-400" />
              <span className="font-bold text-slate-200">Apple Baseband Diag Live Stream</span>
            </div>
            <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              SDX65 PMU
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('✅') || l.includes('SUCCESS')
                    ? 'text-emerald-400 font-bold'
                    : l.includes('BB_') || l.includes('Panic')
                    ? 'text-rose-300'
                    : 'text-slate-300'
                }
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
