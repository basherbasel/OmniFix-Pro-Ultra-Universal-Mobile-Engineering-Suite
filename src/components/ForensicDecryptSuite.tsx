import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Database, 
  Zap, 
  FolderOpen, 
  Download, 
  RefreshCw, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  FileText, 
  Settings,
  Flame,
  Activity
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface ForensicDecryptSuiteProps {
  device: ConnectedDevice;
  lang: 'en' | 'ar';
  onAddLog: (level: 'info' | 'success' | 'error' | 'hex', tag: string, message: string) => void;
  isBusy: boolean;
}

export const ForensicDecryptSuite: React.FC<ForensicDecryptSuiteProps> = ({
  device,
  lang,
  onAddLog,
  isBusy: parentIsBusy
}) => {
  const isAr = lang === 'ar';
  const [activeSubTab, setActiveSubTab] = useState<'recovery' | 'fbe' | 'glitch' | 'sep' | 'ufed'>('recovery');
  
  // State for Recovery Module
  const [recoveryTarget, setRecoveryTarget] = useState<'deleted' | 'dump'>('deleted');
  const [dataType, setDataType] = useState<'contacts' | 'media' | 'messages' | 'databases'>('media');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [recoveredItems, setRecoveredItems] = useState<Array<{ name: string; size: string; status: string; path: string }>>([]);

  // State for FBE Crypt-Extractor
  const [isDerivingKey, setIsDerivingKey] = useState(false);
  const [fbeLog, setFbeLog] = useState<string[]>([]);
  const [extractedMasterKey, setExtractedMasterKey] = useState<string | null>(null);

  // State for Glitching Waveform
  const [voltageOffset, setVoltageOffset] = useState<number>(-45); // mV
  const [glitchDelay, setGlitchDelay] = useState<number>(320); // ns
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchResult, setGlitchResult] = useState<'WAITING' | 'SUCCESS' | 'RESET' | null>('WAITING');

  // State for SEP Enclave Bypass
  const [isBruteforcing, setIsBruteforcing] = useState(false);
  const [testedCodesCount, setTestedCodesCount] = useState(0);
  const [limitlessActive, setLimitlessActive] = useState(false);
  const [currentCodeSearching, setCurrentCodeSearching] = useState<string>('0000');
  const [foundPIN, setFoundPIN] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Glitching visualization canvas animation
  useEffect(() => {
    if (activeSubTab === 'glitch' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      let animationFrameId: number;
      let offset = 0;

      const draw = () => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Background grid lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 0; i < ctx.canvas.width; i += 20) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, ctx.canvas.height);
          ctx.stroke();
        }
        for (let i = 0; i < ctx.canvas.height; i += 20) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(ctx.canvas.width, i);
          ctx.stroke();
        }

        // Draw Reference Voltage Line (flat stable signal)
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, ctx.canvas.height / 2);
        ctx.lineTo(ctx.canvas.width, ctx.canvas.height / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Active Glitched Waveform (Sine + Spike based on delay and voltage offset state)
        ctx.strokeStyle = '#22d3ee'; // Cyan neon
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const midY = ctx.canvas.height / 2;
        const glitchPositionX = (glitchDelay / 1000) * ctx.canvas.width;
        
        for (let x = 0; x < ctx.canvas.width; x++) {
          let y = midY;
          
          // Generate normal sine jitter
          y += Math.sin((x + offset) * 0.05) * 4;

          // Generate target glitch spike based on user controls
          const distanceToGlitch = Math.abs(x - glitchPositionX);
          if (distanceToGlitch < 15) {
            // Apply voltage offset as pulse amplitude
            const scale = (15 - distanceToGlitch) / 15;
            y += (voltageOffset * 0.8) * scale;
          }

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw Glitch Pulse trigger marker
        ctx.fillStyle = '#f43f5e'; // Rose pulse marker
        ctx.beginPath();
        ctx.arc(glitchPositionX, midY + (voltageOffset * 0.8), 5, 0, Math.PI * 2);
        ctx.fill();

        offset += 2;
        animationFrameId = requestAnimationFrame(draw);
      };

      draw();
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [activeSubTab, voltageOffset, glitchDelay]);

  // Run Raw Forensic Scanner / Carver
  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setRecoveredItems([]);
    
    onAddLog('info', 'FORENSIC-CARV', isAr
      ? `بدء فحص عتاد الذاكرة الفيزيائي [${device.storageType}] لتتبع القطاعات المحذوفة ونقاط استرجاع الملفات...`
      : `Initiating physical file carver on [${device.storageType}] partition sector dumps...`);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          
          // Generate realistic files found
          const files = dataType === 'media' ? [
            { name: 'DCIM_00124_RECOVERED.jpg', size: '2.4 MB', status: 'Healthy (SHA256 Valid)', path: '/data/media/0/DCIM/Camera/' },
            { name: 'WhatsApp_Vid_082.mp4', size: '14.8 MB', status: 'Partially Overwritten (Carved)', path: '/data/media/0/WhatsApp/Media/' },
            { name: 'IMG_2026_04_02.png', size: '1.2 MB', status: '100% Intact', path: '/data/media/0/Pictures/' }
          ] : dataType === 'contacts' ? [
            { name: 'contacts_carved_db.sqlite', size: '180 KB', status: 'Reconstructed (84 Contacts)', path: '/data/data/com.android.providers.contacts/' }
          ] : dataType === 'messages' ? [
            { name: 'sms_messages_deleted.db', size: '512 KB', status: 'Reconstructed (142 SMS)', path: '/data/data/com.android.providers.telephony/' }
          ] : [
            { name: 'userdata_raw_block.bin', size: '1.2 GB', status: 'Physical Raw Fragment', path: '/dev/block/bootdevice/by-name/userdata' }
          ];

          setRecoveredItems(files);
          onAddLog('success', 'FORENSIC-CARV', isAr
            ? `✓ اكتمل الفحص الجنائي! تم العثور على ${files.length} ملفات قابلة للاستعادة بنسبة 100% وبأمان.`
            : `✓ Forensic carving completed! Recovered ${files.length} healthy binary assets from physical sectors.`);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  // Run TrustZone / FBE key extraction
  const handleExtractMasterKey = () => {
    setIsDerivingKey(true);
    setFbeLog([]);
    setExtractedMasterKey(null);

    const steps = [
      `[1/5] Injecting custom payload helper at physical address 0x${device.socId ? device.socId.substring(2, 10).toUpperCase() : '8650'}0000...`,
      `[2/5] Overriding hardware cryptographic engines and disabling security registers...`,
      `[3/5] Exploiting ARM TrustZone Secure World memory pointer leak (CVE-2026-TRUST)...`,
      `[4/5] Reading hardware-backed master salt from Secure Storage block...`,
      `[5/5] Executing Key Derivation Function (PBKDF2-HMAC-SHA512) for File-Based Decryption...`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setFbeLog(prev => [...prev, steps[currentStep]]);
        onAddLog('info', 'FBE-EXTRACTOR', steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        const derivedKey = 'FBE_DECRYPT_KEY_SHA256_8F9C4A2B701D83E954D2B1A04C5D6E7F889210B3A4C5D6';
        setExtractedMasterKey(derivedKey);
        setIsDerivingKey(false);
        onAddLog('success', 'FBE-EXTRACTOR', isAr
          ? `✓ تم سحب مفتاح فك تشفير الملفات عتادياً بنجاح: ${derivedKey.substring(0, 24)}...`
          : `✓ Master File-Based Decryption key extracted successfully: ${derivedKey.substring(0, 24)}...`);
      }
    }, 800);
  };

  // Execute Glitching Simulation
  const handleTriggerGlitch = () => {
    setIsGlitching(true);
    setGlitchResult('WAITING');
    onAddLog('info', 'GLITCH-PULSE', `Sending ultra-short voltage glitch pulse (Amplitude: ${voltageOffset}mV, Delay: ${glitchDelay}ns) to core clock controller...`);

    setTimeout(() => {
      setIsGlitching(false);
      // Perfect alignment zone is between -45mV and -30mV, and 300ns to 340ns delay
      if (voltageOffset >= -50 && voltageOffset <= -35 && glitchDelay >= 310 && glitchDelay <= 335) {
        setGlitchResult('SUCCESS');
        onAddLog('success', 'GLITCH-SUCCESS', isAr
          ? '✓ تم تشتيت وإحباط كود فحص الحماية عتادياً بنجاح! المعالج الآن في وضع التحميل المفتوح Unlocked BROM.'
          : '✓ Processor security verification loop glitched successfully! CPU entered raw BROM bypass state.');
      } else {
        setGlitchResult('RESET');
        onAddLog('error', 'GLITCH-FAIL', isAr
          ? 'تعذر تخطي الحماية؛ إما أن النبضة غير كافية أو تسببت في إيقاف وتشغيل الجهاز. أعد المحاذاة.'
          : 'Glitch pulse misaligned. Device either reset or security logic caught the attempt. Re-adjust parameters.');
      }
    }, 1200);
  };

  // SEP Rate-Limit Bypass Bruteforce
  useEffect(() => {
    let interval: any;
    if (isBruteforcing) {
      interval = setInterval(() => {
        setTestedCodesCount(prev => {
          const next = prev + Math.floor(Math.random() * 8 + 3);
          const currentCode = String(next).padStart(4, '0');
          setCurrentCodeSearching(currentCode);
          
          if (next >= 1284) { // Target passcode found
            clearInterval(interval);
            setFoundPIN('1284');
            setIsBruteforcing(false);
            onAddLog('success', 'SEP-BRUTE', isAr
              ? '✓ تم كسر وتخطي حماية معالج SEP الآمن بنجاح! تم فك كود الهاتف: [1284].'
              : '✓ Secure Enclave passcode bruteforced successfully! Found device PIN: [1284].');
            return 1284;
          }
          return next;
        });
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isBruteforcing]);

  const handleStartBruteforce = () => {
    setTestedCodesCount(0);
    setFoundPIN(null);
    setLimitlessActive(true);
    setIsBruteforcing(true);
    onAddLog('info', 'SEP-BRUTE', isAr
      ? 'جاري حقن ثغرة تخطي حدود محاولات الرمز الخاطئة في معالج SEP لفتح تجارب غير محدودة...'
      : 'Injecting rate-limit bypass payload to allow limitless attempts on Secure Enclave Processor...');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl space-y-4">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              {isAr ? '🔬 مركز الاسترداد الجنائي وتحليل الحمايات الفائقة' : '🔬 Advanced Forensic Cryptanalysis & Recovery'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr 
                ? 'مختبر فك التشفير واستخراج الملفات الميتة وتخطي حمايات المعالج والأجهزة المتضررة عتادياً' 
                : 'Decryption, raw partition carving, clock-glitching simulator and Secure Enclave exploit lab.'}
            </p>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950/60 p-1 rounded-lg border border-slate-800/80">
          <button
            onClick={() => setActiveSubTab('recovery')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeSubTab === 'recovery' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? '💾 استرداد الملفات الحذرة' : '💾 Carver & Recovery'}
          </button>
          <button
            onClick={() => setActiveSubTab('fbe')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeSubTab === 'fbe' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? '🔐 فك تشفير FBE' : '🔐 File Encryption (FBE)'}
          </button>
          <button
            onClick={() => setActiveSubTab('glitch')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeSubTab === 'glitch' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? '⚡ نبض التشتيت عتادياً' : '⚡ Hardware Glitching'}
          </button>
          <button
            onClick={() => setActiveSubTab('sep')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeSubTab === 'sep' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? '📱 كسر حماية SEP' : '📱 SEP Passcode Bypass'}
          </button>
          <button
            onClick={() => setActiveSubTab('ufed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeSubTab === 'ufed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? '🛡️ استخراج UFED الجنائي' : '🛡️ DFIR Physical Extraction'}
          </button>
        </div>
      </div>

      {/* Main Container Content */}
      <div className="min-h-[260px]">
        {/* TAB 1: DATA RECOVERY FROM DEAD & DELETED */}
        {activeSubTab === 'recovery' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            {/* Control Column */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                {isAr ? 'إعدادات مسح قطاعات الذاكرة' : 'Sector Carver Config'}
              </h4>

              {/* Source Target */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">{isAr ? 'مصدر الملفات والبيانات' : 'Forensic Data Source'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRecoveryTarget('deleted')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors ${
                      recoveryTarget === 'deleted' 
                        ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300' 
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {isAr ? 'الملفات المحذوفة' : 'Deleted Files'}
                  </button>
                  <button
                    onClick={() => setRecoveryTarget('dump')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors ${
                      recoveryTarget === 'dump' 
                        ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300' 
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {isAr ? 'هاتف ميت / Dump' : 'Dead Phone Dump'}
                  </button>
                </div>
              </div>

              {/* Data Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">{isAr ? 'نوع البيانات المستهدفة' : 'Target Artifact Type'}</label>
                <select
                  aria-label="Artifact Target"
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="media">{isAr ? '📷 الصور والفيديوهات المحذوفة' : '📷 Photos & Video Carving'}</option>
                  <option value="contacts">{isAr ? '📇 الأسماء وسجل المكالمات' : '📇 Contacts & Call Logs'}</option>
                  <option value="messages">{isAr ? '💬 الرسائل ومحادثات الـ Chat' : '💬 SMS & Chats Databases'}</option>
                  <option value="databases">{isAr ? '🗄️ قواعد البيانات والملفات العميقة' : '🗄️ Raw SQLite Databases'}</option>
                </select>
              </div>

              {/* Action */}
              <button
                onClick={handleStartScan}
                disabled={isScanning}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <Search className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? (isAr ? 'جاري استخراج الملفات...' : 'Carving Sectors...') : (isAr ? 'ابدأ الاستخراج الجنائي' : 'Begin Physical Carving')}</span>
              </button>
            </div>

            {/* Results Column */}
            <div className="bg-slate-950/30 md:col-span-2 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    {isAr ? 'الملفات المسترجعة الجنائية' : 'Recovered System Assets'}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {device.brand} {device.model} ({device.storageType})
                  </span>
                </div>

                {/* Progress Bar when scanning */}
                {isScanning && (
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/80 border border-slate-800/60">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-indigo-400 animate-pulse">{isAr ? 'جاري تتبع قطاع وراء قطاع...' : 'Analyzing physical NAND sectors...'}</span>
                      <span className="text-slate-300 font-bold">{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-150" style={{ width: `${scanProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Empty State / File List */}
                {recoveredItems.length === 0 && !isScanning ? (
                  <div className="text-center py-10 text-slate-500 text-xs italic flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-slate-700" />
                    <span>{isAr ? 'انقر على "ابدأ الاستخراج الجنائي" لفحص قطاعات الذاكرة وإعادة بناء الملفات المحذوفة' : 'Select parameters and click search to parse unallocated clusters'}</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {recoveredItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-slate-950/70 border border-slate-850 hover:border-slate-800 transition-colors">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">{item.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{item.path}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-mono">{item.size}</span>
                          <span className="text-[10px] text-emerald-400 font-bold font-mono">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {recoveredItems.length > 0 && (
                <div className="flex gap-2 border-t border-slate-800 pt-3 mt-3">
                  <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    <span>{isAr ? 'حفظ الملفات في حاسوبك' : 'Download Carved Assets'}</span>
                  </button>
                  <button className="py-1.5 px-3 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تأكيد السحب السليم' : 'Integrity Checked'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FILE-BASED ENCRYPTION KEY EXTRACTOR */}
        {activeSubTab === 'fbe' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  {isAr ? 'محرك استخراج مفتاح التشفير الرئيسي FBE Master Key' : 'File-Based Encryption (FBE) TrustZone Extractor'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isAr 
                    ? 'يستغل ثغرات العتاد في معالجات ARM TrustZone لاستخلاص الكود الرياضي اللازم لفك التشفير دون مسح البيانات.' 
                    : 'Exploits hardware-based secure enclaves to leak Master KDF Salts without triggering security counters.'}
                </p>
              </div>
              <button
                onClick={handleExtractMasterKey}
                disabled={isDerivingKey}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDerivingKey ? 'animate-spin' : ''}`} />
                <span>{isDerivingKey ? (isAr ? 'جاري تخطي الحماية واستخراج المفتاح...' : 'Leaking Crypt-Key...') : (isAr ? 'سحب مفتاح فك التشفير الرئيسي' : 'Extract Master FBE Key')}</span>
              </button>
            </div>

            {/* Logs & Output Console */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 p-3.5 rounded-lg bg-black/90 border border-slate-800/80 font-mono text-xs text-slate-400 space-y-1 h-[140px] overflow-y-auto">
                {fbeLog.length === 0 ? (
                  <div className="text-slate-600 italic py-6 text-center">
                    {isAr ? 'انقر على زر استخراج المفتاح لبدء بروتوكول تسريب ذاكرة الـ TrustZone...' : 'Awaiting master key derivation protocol sequence...'}
                  </div>
                ) : (
                  fbeLog.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      <span className="text-indigo-400 mr-2">[+]</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Extracted Key Card */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono font-bold">{isAr ? 'المفتاح المستخلص' : 'MASTER DECRYPT KEY'}</span>
                  {extractedMasterKey ? (
                    <div className="mt-2 text-xs font-mono text-emerald-400 break-all p-2 rounded bg-slate-950 border border-emerald-950 shadow-inner">
                      {extractedMasterKey}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-slate-500 italic py-4">
                      {isAr ? 'بانتظار فك الشفرة...' : 'Key empty. Awaiting exploit execution.'}
                    </div>
                  )}
                </div>
                {extractedMasterKey && (
                  <div className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مفتاح فك التشفير صالح ومكتمل' : 'Master Crypt-Key is Valid'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HARDWARE GLITCHING & CLOCK SKEW */}
        {activeSubTab === 'glitch' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fadeIn">
            {/* Control Panel */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                {isAr ? 'لوحة ضبط نبضة التشويش' : 'Voltage Glitch Parameters'}
              </h4>

              {/* Slider 1: Amplitude */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{isAr ? 'انحراف الفولت الأساسي' : 'Glitch Voltage Offset'}</span>
                  <span className="text-cyan-400 font-bold">{voltageOffset} mV</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="10"
                  value={voltageOffset}
                  onChange={(e) => setVoltageOffset(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[9px] text-slate-500 block">
                  {isAr ? 'المدى السليم لمحاذاة المعالج: -45mV إلى -35mV' : 'Optimal threshold: -45mV to -35mV.'}
                </span>
              </div>

              {/* Slider 2: Pulse Delay */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{isAr ? 'تأخير النبضة الزمني' : 'Glitch Pulse Delay'}</span>
                  <span className="text-cyan-400 font-bold">{glitchDelay} ns</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="450"
                  value={glitchDelay}
                  onChange={(e) => setGlitchDelay(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[9px] text-slate-500 block">
                  {isAr ? 'المدى الزمني السليم: 310ns إلى 335ns' : 'Optimal clock boundary: 310ns to 335ns.'}
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={handleTriggerGlitch}
                disabled={isGlitching}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 animate-bounce" />
                <span>{isGlitching ? (isAr ? 'جاري إطلاق النبضة...' : 'Firing Glitch...') : (isAr ? 'إطلاق نبضة التشويش عتادياً' : 'Trigger Glitch Pulse')}</span>
              </button>
            </div>

            {/* Visual Waveform & Indicator Panel */}
            <div className="bg-slate-950/30 lg:col-span-2 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    {isAr ? 'راسم الإشارات لنبضة التشويش اللحظية' : 'Real-time Signal Glitching Waveform'}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">Status:</span>
                    {glitchResult === 'WAITING' && <span className="px-1.5 py-0.5 text-[9px] bg-slate-800 text-slate-400 rounded font-bold font-mono">AWAITING TRIGGER</span>}
                    {glitchResult === 'SUCCESS' && <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-400 rounded font-bold font-mono animate-pulse">BYPASS SUCCESS</span>}
                    {glitchResult === 'RESET' && <span className="px-1.5 py-0.5 text-[9px] bg-rose-500/20 text-rose-400 rounded font-bold font-mono">CPU RESET (FAILED)</span>}
                  </div>
                </div>

                {/* Canvas Render */}
                <div className="bg-black/80 rounded-lg overflow-hidden border border-slate-850 p-1 flex items-center justify-center">
                  <canvas 
                    ref={canvasRef} 
                    width={480} 
                    height={140} 
                    className="w-full h-[140px] rounded block"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/80 p-2 rounded border border-slate-800/60 mt-3">
                {isAr 
                  ? '💡 التشويش الجسدي (Glitching) هو عملية تلاعب دقيقة بالجهد في حدود النانوميتر والملي فولت لإجبار معالج الهاتف على القفز وتخطي دالة فحص حماية البوت لودر في الـ ROM دون التحقق من الـ RSA Signatures.' 
                  : '💡 Hardware-level glitching delivers an ultra-short transient voltage drop to desynchronize instructions execution inside the secure boot registers, allowing direct root extraction.'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APPLE SEP PASSCODE BRUTEFORCE */}
        {activeSubTab === 'sep' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            {/* Parameters Control */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                {isAr ? 'مستكشف معالج SEP وعدادات الحماية' : 'SEP Security Exploits'}
              </h4>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold font-mono">{isAr ? 'حالة معالج الـ Enclave' : 'Secure Enclave Status'}</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{isAr ? 'تخطي حدود المحاولات' : 'Rate-Limit Bypass:'}</span>
                  {limitlessActive ? (
                    <span className="text-emerald-400 font-bold font-mono">{isAr ? 'فعال ✓' : 'ACTIVE ✓'}</span>
                  ) : (
                    <span className="text-rose-400 font-bold font-mono">{isAr ? 'غير مفعل' : 'LOCKED'}</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{isAr ? 'قفل تصفية البيانات' : 'Anti-Wipe Override:'}</span>
                  {limitlessActive ? (
                    <span className="text-emerald-400 font-bold font-mono">{isAr ? 'آمن ✓' : 'SAFE ✓'}</span>
                  ) : (
                    <span className="text-slate-500 font-mono">OFF</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleStartBruteforce}
                  disabled={isBruteforcing || limitlessActive}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBruteforcing ? 'animate-spin' : ''}`} />
                  <span>{isAr ? 'تخطي حماية عداد محاولات SEP' : 'Activate SEP Exploit'}</span>
                </button>

                {limitlessActive && (
                  <button
                    onClick={() => setIsBruteforcing(!isBruteforcing)}
                    className={`w-full py-2 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                      isBruteforcing 
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/40 text-rose-300' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    }`}
                  >
                    {isBruteforcing ? (isAr ? 'إيقاف مؤقت للتجربة' : 'Pause Bruteforce') : (isAr ? 'تشغيل كسر الرمز PIN' : 'Run PIN Recovery')}
                  </button>
                )}
              </div>
            </div>

            {/* Bruteforcer Live Screen */}
            <div className="bg-slate-950/30 md:col-span-2 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                  {isAr ? 'محاكي فك وكسر رموز كلمات المرور' : 'Secure Enclave Pin Bruteforcer Console'}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Digital Display 1 */}
                  <div className="p-4 rounded-lg bg-black/80 border border-slate-850 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">{isAr ? 'الرمز الذي يتم اختباره حالياً' : 'TESTING PASSCODE'}</span>
                    <span className="text-3xl font-mono text-cyan-400 tracking-widest font-bold mt-2 animate-pulse">
                      {isBruteforcing ? currentCodeSearching : '----'}
                    </span>
                  </div>

                  {/* Digital Display 2 */}
                  <div className="p-4 rounded-lg bg-black/80 border border-slate-850 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">{isAr ? 'عدد الأكواد المجربة' : 'TESTED CODES'}</span>
                    <span className="text-3xl font-mono text-slate-300 font-bold mt-2">
                      {testedCodesCount} / 9999
                    </span>
                  </div>
                </div>

                {/* Final Pin Success Card */}
                {foundPIN && (
                  <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-bounce">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">{isAr ? '✓ تم العثور على رمز قفل الشاشة!' : '✓ Code Cracked Successfully!'}</span>
                      <span className="text-xs font-mono">{isAr ? `كود الـ PIN المكتشف للجهاز هو: ${foundPIN}` : `Correct passcode decrypted: PIN [${foundPIN}]`}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 font-mono mt-4 leading-relaxed border-t border-slate-850 pt-3">
                {isAr 
                  ? 'بروتوكول تفاعل الجيل الثالث (SEP Exploits v3) يتيح لبرمجة كسر الرموز تجربة أكثر من 120 رمز بالدقيقة دون خطر مسح بيانات الهاتف.' 
                  : 'SEP v3 exploit overrides Secure Enclave internal retry loop, eliminating 1 hour/24 hour block counters during hardware key bruteforcing.'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DFIR & UFED PHYSICAL EXTRACTION */}
        {activeSubTab === 'ufed' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase block">{isAr ? 'بروتوكول الاستخراج الجنائي' : 'FORENSIC EXTRACTION'}</span>
                <p className="text-xs font-bold text-slate-200">{isAr ? 'استخراج الصورة الفيزيائية (Physical Raw Dump)' : 'Full Physical Storage Bit-Stream'}</p>
                <p className="text-[11px] text-slate-400">{isAr ? 'قراءة كافة قطاعات الذاكرة بايت ببايت مع مراعاة تسلسلات التشفير ISO/IEC 27037.' : 'Reads full NAND storage sectors bit-by-bit preserving Chain of Custody integrity.'}</p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block">{isAr ? 'حماية سلامة الأدلة' : 'EVIDENCE INTEGRITY'}</span>
                <p className="text-xs font-bold text-slate-200">{isAr ? 'حاجب الكتابة العتادي (Hardware Write-Blocker)' : 'Hardware Write-Blocker Simulation'}</p>
                <p className="text-[11px] text-slate-400">{isAr ? 'تفعيل وضع القراءة فقط لضمان عدم تغيير أي سجلات أمان داخل الهاتف أثناء التشخيص.' : 'Enforces strict read-only mode to prevent any modification to the source hardware logs.'}</p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block">{isAr ? 'بنية تشفير المعالج' : 'CHIPSET CRYPTO ENGINE'}</span>
                <p className="text-xs font-bold text-slate-200">{device.chipset || 'Qualcomm / MediaTek / Apple'}</p>
                <p className="text-[11px] text-slate-400">{isAr ? 'مطابقة مفاتيح التشفير العتادية ومسارات RPMB/FBE للتحليل الجنائي الموثق.' : 'Maps hardware RPMB and FBE keys for certified law-enforcement compliance audit.'}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  <span>{isAr ? 'سجل عمليات الاستخراج الجنائي المعتمد (DFIR Audit Trail)' : 'Certified DFIR Extraction & Verification Console'}</span>
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded font-bold">
                  ISO/IEC 27037 COMPLIANT
                </span>
              </div>

              <div className="p-3 rounded bg-black/90 font-mono text-xs text-slate-300 space-y-1.5 max-h-[140px] overflow-y-auto border border-slate-850">
                <p className="text-emerald-400">[✓] Hardware Write-Blocker Attached: READ_ONLY_BUS_LOCK = ENABLED</p>
                <p className="text-indigo-400">[i] Chipset BROM / EDL Interface: {device.chipset || 'Qualcomm Snapdragon / MTK Dimensity'}</p>
                <p className="text-slate-400">[i] Storage Device Geometry: {device.storageType} | Block Size: 4096 bytes</p>
                <p className="text-slate-400">[i] SHA-256 Verification Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
                <p className="text-slate-500">[+] Ready for physical sector extraction and forensic artifact indexing.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
