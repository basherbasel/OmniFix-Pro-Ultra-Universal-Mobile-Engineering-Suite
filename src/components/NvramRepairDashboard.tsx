import React, { useState } from 'react';

interface NvramProps {
  deviceInfo: { devicePath: string; chipset: string; mode: string; friendlyName: string } | null;
  lang?: 'en' | 'ar';
}

export const NvramRepairDashboard: React.FC<NvramProps> = ({ deviceInfo, lang = 'en' }) => {
  const isAr = lang === 'ar';
  const [selectedOp, setSelectedOp] = useState<string>("BACKUP_NVRAM");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Sound continuity feedback
  const playBeep = (freq: number = 740, duration: number = 0.12) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch {}
  };

  const handleRunNvramTool = async () => {
    if (!deviceInfo) {
      alert(isAr ? "⚠️ تنبيه: الرجاء توصيل الهاتف المستهدف عبر منفذ الـ USB أولاً!" : "⚠️ Warning: Please connect a target device via USB first!");
      return;
    }

    setIsExecuting(true);
    playBeep(900, 0.15);
    setLogs([
      isAr 
        ? `[*] جاري تحضير قناة التخاطب العتادي: ${deviceInfo.friendlyName}` 
        : `[*] Target Connected: ${deviceInfo.friendlyName}`, 
      isAr 
        ? `[*] وضع الاتصال العتادي الحالي: ${deviceInfo.mode}` 
        : `[*] Current Mode: ${deviceInfo.mode}`
    ]);

    try {
      const response = await fetch('/api/master/execute-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devicePath: deviceInfo.devicePath || "PORT_COM3",
          commandKey: selectedOp,
          chipset: deviceInfo.chipset || "Universal",
          mode: deviceInfo.mode || "Normal",
          lang: lang
        })
      });

      const responseData = await response.json();
      const serverLogs: string[] = responseData.logs || [];

      // Stream logs sequentially for a premium UI look
      for (const line of serverLogs) {
        await new Promise((r) => setTimeout(r, 200));
        setLogs(prev => [...prev, line]);
        playBeep(800, 0.05);
      }
    } catch (error: any) {
      setLogs(prev => [
        ...prev, 
        isAr 
          ? `[!] خطأ في أداة معايرة وإصلاح البايسباند: ${error.message}` 
          : `[!] NVRAM Operation Error: ${error.message}`
      ]);
    } finally {
      setIsExecuting(false);
      playBeep(1100, 0.2);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/30 border border-blue-500/30 rounded-2xl p-6 text-slate-100 shadow-2xl relative overflow-hidden my-4">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-blue-400 flex items-center gap-2.5">
            📡 {isAr ? 'منصة معايرة وصيانة الشبكة والـ NVRAM والـ IMEI' : 'NVRAM, Baseband & IMEI Calibration Suite'}
            <span className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full font-mono">Pro v4.0</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'معايرة عتادية متطابقة وإصلاح ملفات الترددات والشهادات الأمنية التالفة' : 'Advanced radio frequency calibration and secure partition restoration'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
          <span className={`w-3 h-3 rounded-full ${deviceInfo ? 'bg-blue-400 animate-pulse' : 'bg-rose-500'}`}></span>
          <span className="text-xs font-mono text-slate-300">
            {deviceInfo ? deviceInfo.friendlyName : (isAr ? "بانتظار الهاتف المتصل..." : "No Device Detected")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="md:col-span-2">
          <label className="block text-xs font-mono text-slate-400 mb-2">
            {isAr ? 'اختر عملية المعايرة والإصلاح العتادي:' : 'Select Calibration Operation:'}
          </label>
          <select 
            value={selectedOp} 
            onChange={(e) => setSelectedOp(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 shadow-lg"
          >
            <option value="BACKUP_NVRAM">💾 {isAr ? 'أخذ نسخة احتياطية من الـ NVRAM وأقسام الشبكة (modemst1/2)' : 'Backup NVRAM & Security Partitions (modemst1/2)'}</option>
            <option value="RESTORE_NVRAM">📥 {isAr ? 'استرجاع الـ NVRAM من نسخة الطوارئ' : 'Restore NVRAM from Emergency Snapshot'}</option>
            <option value="REBUILD_MODEM">🛠️ {isAr ? 'إعادة بناء كود البايسباند واستقرار الشبكة' : 'Rebuild Corrupted Modem Baseband'}</option>
            <option value="FIX_BASEBAND">📶 {isAr ? 'إصلاح مشكلة Baseband Unknown والـ IMEI غير الصالح' : 'Fix Unknown Baseband & Invalid IMEI State'}</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            disabled={isExecuting || !deviceInfo}
            onClick={handleRunNvramTool}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-2xl shadow-xl shadow-blue-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/20"
          >
            {isExecuting ? (isAr ? "جاري المعايرة..." : "Executing Calibration...") : (isAr ? "تشغيل معالج إصلاح الشبكة" : "Execute NVRAM Repair")}
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5 text-xs font-mono text-slate-400">
          <span>{isAr ? 'مستشعر قنوات الشبكة والـ RF Telemetry' : 'Live NVRAM Telemetry & Execution Stream'}</span>
          <span className="text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
            {isExecuting ? (isAr ? "جاري البث..." : "Processing Stream...") : (isAr ? "المنفذ مستقر" : "Standby")}
          </span>
        </div>
        <pre className="bg-slate-950/95 border border-slate-800/90 p-4.5 rounded-xl h-44 overflow-y-auto text-xs font-mono text-blue-400 leading-relaxed shadow-inner">
          {logs.length === 0 ? (
            <span className="text-slate-600">
              {isAr ? '// حدد أي عملية إصلاح عتادية من الأعلى واضغط لتشغيل المحرك المباشر...' : '// Select a calibration operation above and click \'Execute NVRAM Repair\'...'}
            </span>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 py-0.5">
                <span className="text-slate-600 select-none">›</span>
                <span className={log.includes('Successfully') || log.includes('بنجاح') || log.includes('active') ? 'text-blue-300 font-semibold' : log.includes('Error') || log.includes('[!]') ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))
          )}
        </pre>
      </div>
    </div>
  );
};
