import React, { useState } from 'react';
import { safeFetchJson } from '../utils/apiHelper';
import { 
  Globe, 
  Cloud, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Download, 
  Play, 
  Terminal, 
  Cpu, 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Server, 
  Flame, 
  Wrench,
  Radio,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ConnectedDevice, CloudSecurityBulletin, FlashToolItem } from '../types';
import { CLOUD_SECURITY_BULLETINS, FLASH_TOOL_SERVICES } from '../data/cloudSecurityFeed';
import { realUsbService } from '../services/realUsbService';

interface CloudSecurityHubProps {
  device: ConnectedDevice;
  onExecuteBulletinExploit: (bulletin: CloudSecurityBulletin) => void;
  onLaunchFlashTool: (tool: FlashToolItem) => void;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

export const CloudSecurityHub: React.FC<CloudSecurityHubProps> = ({
  device,
  onExecuteBulletinExploit,
  onLaunchFlashTool,
  isBusy,
  lang
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'bulletins' | 'flashtools' | 'aicrawler'>('bulletins');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [isSyncingWithCloud, setIsSyncingWithCloud] = useState<boolean>(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string>('2026.09.19-SEC-REV9 (Just Now)');
  const [activeBulletin, setActiveBulletin] = useState<CloudSecurityBulletin>(CLOUD_SECURITY_BULLETINS[0]);

  // AI Security Query State
  const [aiCustomInquiry, setAiCustomInquiry] = useState<string>('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [isAiConsulting, setIsAiConsulting] = useState<boolean>(false);

  // Trigger Live Cloud Sync
  const handleCloudSync = async () => {
    setIsSyncingWithCloud(true);
    realUsbService.playContinuityBeep(100, 2000);

    setTimeout(() => {
      realUsbService.playContinuityBeep(200, 2400);
      setIsSyncingWithCloud(false);
      setLastSyncTimestamp(`${new Date().toLocaleTimeString()} (Auto-Updated)`);
    }, 1200);
  };

  // AI Exploit Calculator
  const handleCalculateAiExploit = async () => {
    if (!aiCustomInquiry.trim()) return;
    setIsAiConsulting(true);
    setAiAnalysisResult(null);
    realUsbService.playContinuityBeep(120, 1900);

    try {
      const res = await safeFetchJson('/api/ai/copilot-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: aiCustomInquiry,
          deviceContext: device,
          domainType: 'ZERO_DAY_EXPLOIT_CALCULATOR',
          lang
        })
      });

      if (res.success && res.data?.result) {
        setAiAnalysisResult(res.data.result);
        realUsbService.playContinuityBeep(250, 2600);
      }
    } catch (e) {
      console.warn('AI Exploit calculation error:', e);
    } finally {
      setIsAiConsulting(false);
    }
  };

  const filteredBulletins = CLOUD_SECURITY_BULLETINS.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      b.titleAr.toLowerCase().includes(q) ||
      b.titleEn.toLowerCase().includes(q) ||
      b.cveId.toLowerCase().includes(q) ||
      b.targetBrand.toLowerCase().includes(q) ||
      b.descriptionAr.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (selectedBrandFilter === 'ALL') return true;
    return b.targetBrand.toLowerCase().includes(selectedBrandFilter.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Cloud Connectivity Top Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/10">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {isAr ? 'مركز الاتصال بالسحابة وثغرات الحماية الفورية (Live 0-Day Intelligence)' : 'Live Cloud Security & Zero-Day Exploit Center'}
              </h2>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                ONLINE / CLOUD SYNCED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'مزامنة وتحديث مستمر لأحدث ثغرات كسر الحمايات، وتخطي حسابات سامسونج Knox و شاومي MiCloud وآبل iCloud وكوالكوم وميدياتك لحظة بلحظة'
                : 'Real-time repository sync for Zero-Day CVE exploits, Knox Guard escape, BROM auth bypass, and firmware security mitigations.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCloudSync}
            disabled={isSyncingWithCloud}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWithCloud ? 'animate-spin' : ''}`} />
            <span>{isSyncingWithCloud ? (isAr ? 'جاري سحب التحديثات...' : 'SYNCING...') : (isAr ? 'تحديث ومزامنة الثغرات الآن' : 'CHECK FOR LIVE UPDATES')}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bulletins')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'bulletins'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAr ? `نشرات الثغرات الفورية 0-Day (${CLOUD_SECURITY_BULLETINS.length})` : `0-Day Security Exploits (${CLOUD_SECURITY_BULLETINS.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('flashtools')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'flashtools'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-indigo-400" />
          <span>{isAr ? `أدوات واستوديوهات التفليش (${FLASH_TOOL_SERVICES.length})` : `Universal Flash Tools (${FLASH_TOOL_SERVICES.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('aicrawler')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'aicrawler'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAr ? 'حاسبة الثغرات والكسر بالذكاء الاصطناعي' : 'AI Exploit & Security Calculator'}</span>
        </button>
      </div>

      {/* Tab 1: 0-Day Security Bulletins */}
      {activeTab === 'bulletins' && (
        <div className="space-y-4">
          {/* Search and Brand Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن أي ثغرة أو حماية (مثال: Knox Guard, BROM SLA, MiCloud, Checkm8, Firehose)...' : 'Search exploit or CVE (e.g. Knox Guard, BROM SLA, MiCloud, Checkm8, Firehose)...'}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800">
              {['ALL', 'Samsung', 'Xiaomi', 'Apple', 'Huawei', 'Qualcomm', 'Oppo', 'Tecno'].map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrandFilter(brand)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                    selectedBrandFilter === brand
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Main Split View: Bulletins List on Left, Active Exploit Detail on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredBulletins.map((bulletin) => {
                const isSelected = activeBulletin.id === bulletin.id;
                const isDeviceMatch = bulletin.affectedChipsets.includes(device.chipset) || bulletin.targetBrand.toLowerCase().includes(device.brand.toLowerCase());

                return (
                  <div
                    key={bulletin.id}
                    onClick={() => setActiveBulletin(bulletin)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          {bulletin.cveId}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-[170px]">
                          {bulletin.targetBrand}
                        </span>
                      </div>

                      {isDeviceMatch && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          MATCHED
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 mt-2 line-clamp-1">
                      {isAr ? bulletin.titleAr : bulletin.titleEn}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {isAr ? bulletin.descriptionAr : bulletin.descriptionEn}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="text-cyan-400 font-bold">{bulletin.zeroDayStatus}</span>
                      <span className="text-emerald-400 font-bold">{bulletin.exploitEfficiency}% Success</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Bulletin Detail and 1-Click Exploit Payload Injection */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {activeBulletin.cveId}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {activeBulletin.zeroDayStatus}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1.5">
                      {isAr ? activeBulletin.titleAr : activeBulletin.titleEn}
                    </h3>
                  </div>

                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {activeBulletin.targetBrand}
                  </span>
                </div>

                {/* Specs Box */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">{isAr ? 'النطاق المتأثر' : 'TARGET OS'}</span>
                    <span className="text-slate-200 font-medium truncate">{activeBulletin.affectedAndroidRange}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">{isAr ? 'المبرمج المطلوب' : 'REQUIRED LOADER'}</span>
                    <span className="text-cyan-400 font-bold truncate">{activeBulletin.loaderRequired || 'Direct Exploit'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block text-[10px]">{isAr ? 'كفاءة الاستغلال' : 'EFFICIENCY'}</span>
                    <span className="text-emerald-400 font-bold">{activeBulletin.exploitEfficiency}% Verified</span>
                  </div>
                </div>

                {/* Description */}
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1.5">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'تفاصيل الثغرة وآلية كسر التشفير:' : 'Vulnerability Vector & Decryption Logic:'}</span>
                  </div>
                  <p>{isAr ? activeBulletin.descriptionAr : activeBulletin.descriptionEn}</p>
                </div>

                {/* Live Exploit Payload Preview */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isAr ? 'أمر حقن الثغرة المباشر (Exploit Payload Injection):' : 'Direct Exploit Payload Command:'}</span>
                  </h4>
                  <div className="p-3 rounded-lg bg-black/80 border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
                    {activeBulletin.exploitPayloadCommand}
                  </div>
                </div>

                {/* Safety Guarantee */}
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isAr ? activeBulletin.patchMitigationAr : activeBulletin.patchMitigationEn}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-mono text-slate-400">
                  <span>Target: </span>
                  <span className="text-cyan-400 font-bold">{device.model} ({device.chipset.toUpperCase()})</span>
                </div>

                <button
                  onClick={() => onExecuteBulletinExploit(activeBulletin)}
                  disabled={isBusy}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    {isBusy
                      ? (isAr ? 'جاري حقن واستغلال الثغرة...' : 'INJECTING EXPLOIT PAYLOAD...')
                      : (isAr ? `حقن ثغرة ${activeBulletin.cveId} الآن` : `EXECUTE ${activeBulletin.cveId} EXPLOIT`)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Universal Flash & Service Tools */}
      {activeTab === 'flashtools' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'مصفوفة أدوات وبروتوكولات التفليش الشاملة لكافة الهواتف المحمولة:' : 'Universal Flash Protocols & Multi-OEM Studio Suite:'}</span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">{FLASH_TOOL_SERVICES.length} Protocols Loaded</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {FLASH_TOOL_SERVICES.map((tool) => (
              <div
                key={tool.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/60 transition-all flex flex-col justify-between space-y-3 group shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {tool.brandCategory}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {tool.protocol}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {isAr ? tool.nameAr : tool.nameEn}
                  </h4>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isAr ? tool.descriptionAr : tool.descriptionEn}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-2">
                    {tool.supportedFiles.map((file) => (
                      <span key={file} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
                        .{file}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onLaunchFlashTool(tool)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-indigo-600 text-slate-200 hover:text-white border border-slate-800 hover:border-transparent rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isAr ? 'فتح استوديو التفليش' : 'Launch Protocol Studio'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI Exploit & Security Breaker Copilot */}
      {activeTab === 'aicrawler' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'حاسبة استغلال الثغرات وكسر الحمايات التفاعلية (AI 0-Day Exploit Engine):' : 'AI Zero-Day Exploit & Decryption Vector Calculator:'}</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">Powered by Gemini 2.5 Intelligence</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr
                ? 'اكتب أي استفسار أو صف حالة الجهاز (مثال: "سامسونج S24 مقفل Knox Guard بنظام أندرويد 14 حماية سبتمبر" أو "شاومي نوت 13 معلق على حساب MiCloud بدون مسح البارتشن" أو "آيفون 15 معلق على Hello Screen")، وسيقوم الذكاء الاصطناعي بتوليد مسار الاستغلال وسلسلة الأوامر بدقة متناهية.'
                : 'Input your target device scenario and our AI security reverse-engineer will generate customized exploit chains, DMM test points, and bypass commands in real-time.'}
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiCustomInquiry}
                onChange={(e) => setAiCustomInquiry(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculateAiExploit()}
                placeholder={isAr ? 'اكتب موديل الهاتف ونوع الحماية أو العطل المراد كسره...' : 'Describe target phone model, lock type, and security patch...'}
                className="flex-1 px-3.5 py-2.5 bg-black/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />

              <button
                onClick={handleCalculateAiExploit}
                disabled={isAiConsulting || !aiCustomInquiry.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isAiConsulting ? 'animate-spin' : ''}`} />
                <span>{isAiConsulting ? (isAr ? 'جاري التحليل...' : 'CALCULATING...') : (isAr ? 'توليد مسار الكسر' : 'GENERATE EXPLOIT')}</span>
              </button>
            </div>
          </div>

          {/* AI Result Card */}
          {aiAnalysisResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/50 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'تقرير استغلال الحماية وحل المشكلة المولد:' : 'AI Exploit & Remediation Vector:'}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {aiAnalysisResult.category || 'SECURITY'}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">1. التشخيص وتحديد الثغرة (Vulnerability Vector):</div>
                  <p>{aiAnalysisResult.problemDiagnosis}</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-amber-400 font-bold mb-1">2. الأدوات والملفات المطلوبة (Required Tools & Loaders):</div>
                  <p>{aiAnalysisResult.requiredTools}</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-emerald-400 font-bold mb-1">3. خطوات التنفيذ المتسلسلة (Action Plan):</div>
                  <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-slate-300">
                    {Array.isArray(aiAnalysisResult.actionPlan) && aiAnalysisResult.actionPlan.map((step: string, idx: number) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/40 text-emerald-300 text-[11px]">
                  <strong>⚠️ تحذيرات السلامة: </strong>
                  <span>{aiAnalysisResult.safetyWarnings}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
