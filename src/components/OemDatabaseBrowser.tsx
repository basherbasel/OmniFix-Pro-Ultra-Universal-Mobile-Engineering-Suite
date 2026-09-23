import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Copy, 
  Check, 
  Cpu, 
  Terminal, 
  Smartphone, 
  Filter, 
  Layers, 
  Code, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  Download,
  Server,
  CloudLightning,
  Activity
} from 'lucide-react';
import { OEM_DEVICE_DATABASE } from '../data/oemDeviceDatabase';
import { OemDeviceRecord } from '../types';
import { DeviceIngestionPipeline } from '../services/deviceIngestionPipeline';

interface OemDatabaseBrowserProps {
  onSelectModelToTarget?: (record: OemDeviceRecord) => void;
  lang: 'en' | 'ar';
}

export const OemDatabaseBrowser: React.FC<OemDatabaseBrowserProps> = ({
  onSelectModelToTarget,
  lang
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [copiedItemCode, setCopiedItemCode] = useState<string | null>(null);

  // New Live Database States
  const [viewSource, setViewSource] = useState<'live' | 'static'>('live');
  const [liveManufacturers, setLiveManufacturers] = useState<any[]>([]);
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const brands = ['ALL', 'Samsung', 'Xiaomi', 'POCO', 'Oppo', 'Realme', 'Vivo', 'Huawei', 'OnePlus', 'Google', 'Motorola', 'Apple'];

  // Fetch Live SQLite / JSON Catalog from Express server
  useEffect(() => {
    if (viewSource !== 'live') return;
    setIsLoading(true);
    setErrorMessage(null);

    const delayDebounce = setTimeout(() => {
      fetch(`/api/devices?brand=${selectedBrand}&search=${encodeURIComponent(searchQuery)}`)
        .then(async (res) => {
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response');
          }
          if (!res.ok) throw new Error('Failed to fetch live database');
          return res.json();
        })
        .then((resData) => {
          if (resData.success) {
            setLiveManufacturers(resData.manufacturers || []);
            setDbInfo(resData.database_info);
          } else {
            throw new Error(resData.error || 'Server returned error');
          }
        })
        .catch((err) => {
          console.error('Error fetching live devices:', err);
          setErrorMessage(err.message || 'Error loading live catalog');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [viewSource, selectedBrand, searchQuery]);

  // Static Fallback Filtering
  const filteredRecords = OEM_DEVICE_DATABASE.filter((rec) => {
    const matchesBrand = selectedBrand === 'ALL' || rec.brand.toLowerCase() === selectedBrand.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesBrand;
    return matchesBrand && (
      rec.model.toLowerCase().includes(q) ||
      rec.code_name.toLowerCase().includes(q) ||
      rec.chipset.toLowerCase().includes(q) ||
      rec.supported_operations.some(op => op.toLowerCase().includes(q))
    );
  });

  // Compute Data Ingestion Coverage Statistics
  const normalizedRecords = OEM_DEVICE_DATABASE.map(rec => DeviceIngestionPipeline.ingestRecord(rec));
  const coverageReport = DeviceIngestionPipeline.generateCoverageReport(normalizedRecords);

  const handleCopyFullJson = () => {
    const targetData = viewSource === 'live' ? liveManufacturers : filteredRecords;
    navigator.clipboard.writeText(JSON.stringify(targetData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopySingleJson = (rec: OemDeviceRecord) => {
    navigator.clipboard.writeText(JSON.stringify(rec, null, 2));
    setCopiedItemCode(rec.model);
    setTimeout(() => setCopiedItemCode(null), 1500);
  };

  const handleSelectDevice = (brand: string, modelName: string, modelNumber: string, chipset: string) => {
    if (onSelectModelToTarget) {
      const record: OemDeviceRecord = {
        brand,
        model: modelName,
        code_name: modelNumber,
        chipset,
        supported_operations: [
          "FRP Bypass",
          "Factory Reset",
          "Flash Official ROM",
          "Bootloader Lock Status"
        ]
      };
      onSelectModelToTarget(record);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-2xl space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/10">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isAr ? 'قاعدة بيانات الهواتف والمعالجات لـ Apex' : 'Apex Master OEM & Chipset Database'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {viewSource === 'live' ? 'LIVE DATABASE' : `${OEM_DEVICE_DATABASE.length} RECORDS`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              {viewSource === 'live' && dbInfo
                ? `${dbInfo.description} (v${dbInfo.version})`
                : (isAr 
                    ? 'قائمة شاملة لموديلات سامسونج، شاومي، أوبو، فيفو، هواوي، آبل للتحميل والتفليش المباشر'
                    : 'Comprehensive device registry for Samsung, Xiaomi, Oppo, Vivo, Apple, Google & Motorola.')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* View Source Switcher */}
          <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => {
                setViewSource('live');
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewSource === 'live'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>{isAr ? 'قاعدة البيانات الحية' : 'Live Database'}</span>
            </button>
            <button
              onClick={() => {
                setViewSource('static');
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewSource === 'static'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? 'السجل المدمج' : 'Built-in Registry'}</span>
            </button>
          </div>

          <button
            onClick={handleCopyFullJson}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs transition-all cursor-pointer"
          >
            {copiedJson ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedJson ? (isAr ? 'تم نسخ JSON!' : 'Copied!') : (isAr ? 'نسخ JSON' : 'Copy JSON')}</span>
          </button>
        </div>
      </div>

      {/* Coverage & Data Quality Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">{isAr ? 'الشركات المصنعة' : 'MANUFACTURERS'}</span>
          <span className="text-base font-bold text-indigo-400">{coverageReport.totalManufacturers} {isAr ? 'شركات' : 'Brands'}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">{isAr ? 'الموديلات المسجلة' : 'REGISTERED MODELS'}</span>
          <span className="text-base font-bold text-slate-200">{coverageReport.totalModelRecords} {isAr ? 'سجل' : 'Models'}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">{isAr ? 'درجة الموثوقية' : 'CONFIDENCE SCORE'}</span>
          <span className="text-base font-bold text-emerald-400">{(coverageReport.averageConfidenceScore * 100).toFixed(1)}%</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">{isAr ? 'التوثيق المعتمد' : 'VERIFIED SPECS'}</span>
          <span className="text-base font-bold text-cyan-400">{coverageReport.verifiedCount} / {coverageReport.totalModelRecords}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 col-span-2 md:col-span-1">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">{isAr ? 'نسبة التغطية' : 'COVERAGE RATE'}</span>
          <span className="text-base font-bold text-amber-400">{coverageReport.coveragePercentage}%</span>
        </div>
      </div>

      {/* Brand Tabs bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {brands.map((b) => (
          <button
            key={b}
            onClick={() => setSelectedBrand(b)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
              selectedBrand === b
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            viewSource === 'live'
              ? (isAr ? 'البحث الحي في السيرفر وقاعدة البيانات المحلية (مثلاً: S24 Ultra, A18 Pro)...' : 'Search live local database (e.g., S24, Kirin)...')
              : (isAr ? 'ابحث باسم الموديل أو المعالج أو العمليات في السجل المدمج...' : 'Search built-in registry...')
          }
          className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
        />
      </div>

      {/* Database Display View */}
      {viewSource === 'live' ? (
        <div className="space-y-4">
          {isLoading && (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
              <Activity className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-xs text-slate-400 font-mono">
                {isAr ? 'جاري الاستعلام وقراءة البيانات من السيرفر...' : 'Fetching live results from local SQLite/JSON...'}
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-center text-xs text-red-400 font-mono">
              ⚠️ {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && liveManufacturers.length === 0 && (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">
              {isAr ? 'لا توجد نتائج مطابقة في قاعدة البيانات الحية.' : 'No matching models found in live database.'}
            </div>
          )}

          {!isLoading && !errorMessage && liveManufacturers.length > 0 && (
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
              {liveManufacturers.map((m: any) => (
                <div key={m.brand} className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase">{m.brand}</h4>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        {m.country}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">LIVE SYNCED</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {m.series.map((s: any) => (
                      <div key={s.name} className="bg-slate-950/80 p-3 rounded-lg border border-slate-900 space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 block border-b border-slate-900 pb-1 font-mono">
                            📂 {s.name}
                          </span>
                          <div className="space-y-2">
                            {s.models.map((model: any) => (
                              <div key={model.model_number} className="bg-slate-900/70 p-2.5 rounded border border-slate-800 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-white font-sans">{model.model_name}</span>
                                  <span className="text-[9px] font-mono text-cyan-400 bg-slate-950 px-1 rounded">
                                    {model.model_number}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                                  <Cpu className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span className="truncate">{model.chipset_vendor} {model.chipset}</span>
                                </div>

                                <button
                                  onClick={() => handleSelectDevice(m.brand, model.model_name, model.model_number, `${model.chipset_vendor} ${model.chipset}`)}
                                  className="w-full mt-2 py-1 px-2 rounded bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Smartphone className="w-3 h-3" />
                                  <span>{isAr ? 'تعيين كجهاز مستهدف' : 'Load Target Device'}</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Grid List of Device JSON Cards (Static Built-in Mode) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredRecords.map((rec, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-2.5 flex flex-col justify-between animate-fade-in"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {rec.brand}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {rec.code_name}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white">{rec.model}</h4>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{rec.chipset}</span>
                </div>

                {/* Supported Operations list */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">
                    {isAr ? 'العمليات المدعومة:' : 'Supported Operations:'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {rec.supported_operations.map((op, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-emerald-300 border border-slate-700">
                        {op}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCopySingleJson(rec)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-[10px] font-mono text-indigo-300 border border-slate-800 cursor-pointer"
                >
                  {copiedItemCode === rec.model ? <Check className="w-3 h-3 text-emerald-400" /> : <Code className="w-3 h-3" />}
                  <span>{copiedItemCode === rec.model ? 'Copied JSON' : 'JSON'}</span>
                </button>

                <button
                  onClick={() => handleSelectDevice(rec.brand, rec.model, rec.code_name, rec.chipset)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white cursor-pointer"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>{isAr ? 'تعيين كنشط' : 'Select'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
