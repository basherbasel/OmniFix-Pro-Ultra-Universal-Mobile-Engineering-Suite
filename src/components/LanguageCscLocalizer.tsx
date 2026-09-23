import React, { useState } from 'react';
import { safeFetchJson } from '../utils/apiHelper';
import { 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  FileCode, 
  Layers, 
  Zap, 
  Check, 
  Copy, 
  Play,
  Languages
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface LanguageCscLocalizerProps {
  device: ConnectedDevice;
  onExecuteLocalize: (actionType: string, payload: any) => void;
  isBusy: boolean;
  lang: 'en' | 'ar';
}

const CSC_REGIONS = [
  { code: 'XSG', country: 'United Arab Emirates (UAE)', region: 'Middle East', callRecording: true },
  { code: 'KSA', country: 'Saudi Arabia', region: 'Middle East', callRecording: false },
  { code: 'EGY', country: 'Egypt', region: 'Middle East / Africa', callRecording: true },
  { code: 'INS', country: 'India', region: 'Asia', callRecording: true },
  { code: 'TUR', country: 'Turkey', region: 'Europe / ME', callRecording: false },
  { code: 'EUX', country: 'European Union (Open)', region: 'Europe', callRecording: false },
  { code: 'SER', country: 'Russia (CIS)', region: 'CIS', callRecording: true },
  { code: 'MID', country: 'Iraq', region: 'Middle East', callRecording: true },
];

const SAMPLE_ENGLISH_XML = `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="app_name">System Settings</string>
  <string name="battery_status">Battery Level: %1$s</string>
  <string name="advanced_network">Mobile Networks &amp; 5G</string>
  <string name="security_patch">Security Patch Level</string>
  <string name="developer_mode">Developer Options</string>
  <string name="sim_status">SIM Card Status</string>
</resources>`;

export const LanguageCscLocalizer: React.FC<LanguageCscLocalizerProps> = ({
  device,
  onExecuteLocalize,
  isBusy,
  lang
}) => {
  const isAr = lang === 'ar';
  const [selectedCsc, setSelectedCsc] = useState('XSG');
  const [xmlInput, setXmlInput] = useState(SAMPLE_ENGLISH_XML);
  const [targetLanguage, setTargetLanguage] = useState('Arabic');
  const [targetCode, setTargetCode] = useState('ar');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedXml, setTranslatedXml] = useState('');
  const [copied, setCopied] = useState(false);

  const handleTranslateXml = async () => {
    setIsTranslating(true);
    setTranslatedXml('');
    try {
      const res = await safeFetchJson('/api/ai/translate-strings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xmlStrings: xmlInput,
          targetLanguage,
          targetLanguageCode: targetCode
        })
      });
      if (res.success && res.data?.result?.translatedXml) {
        setTranslatedXml(res.data.result.translatedXml);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopyTranslated = () => {
    navigator.clipboard.writeText(translatedXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{isAr ? 'محرك التعريب وتفعيل اللغات وتغيير رمز CSC' : 'Language Localization & CSC Region Switcher'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                ZERO-DATA-LOSS
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تفعيل جميع اللغات الخفية داخل نظام أندرويد بدون روت، وترجمة حزم framework-res.apk، وتغيير كود CSC لتفعيل تسجيل المكالمات'
                : 'Auto-enable hidden locales via ADB, translate framework XML resources with AI, and switch Samsung CSC without formatting.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400">Current CSC:</span>
          <span className="text-cyan-300 font-bold">{device.cscCode || 'XSG'}</span>
        </div>
      </div>

      {/* Main Grid: CSC Switcher on Left, XML AI Translation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Col: No-Wipe CSC Region Switcher & Hidden Languages */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'تغيير كود CSC بدون فورمات' : 'Samsung & Xiaomi CSC Region Switcher'}</span>
              </h4>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">Native Call Recording</span>
            </div>

            <p className="text-xs text-slate-400">
              {isAr
                ? 'اختر المنطقة المراد التحويل إليها لتفعيل ميزات مثل تسجيل المكالمات الأصلي وإلغاء قيود الشبكة:'
                : 'Select target sales code to enable native features like auto call recording and unbranded firmware feeds:'}
            </p>

            {/* Region Selector Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {CSC_REGIONS.map((region) => {
                const isSelected = selectedCsc === region.code;
                return (
                  <div
                    key={region.code}
                    onClick={() => setSelectedCsc(region.code)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {region.code}
                      </span>
                      {region.callRecording && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Call Rec
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">{region.country}</p>
                  </div>
                );
              })}
            </div>

            {/* Hidden Languages Enabler Box */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                {isAr ? 'تفعيل جميع اللغات الخفية بدون روت (All Languages Enabler):' : 'One-Click Global Locale Activation (No Root):'}
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Injects `CHANGE_CONFIGURATION` permission into system settings provider via ADB and forces Arabic, Persian, and multilingual fonts.
              </p>
              <button
                onClick={() => onExecuteLocalize('ENABLE_ALL_LOCALES', { model: device.model })}
                disabled={isBusy}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs font-mono font-bold transition-colors"
              >
                {isAr ? 'تفعيل اللغات الخفية عبر ADB' : 'ENABLE ALL HIDDEN LOCALES'}
              </button>
            </div>
          </div>

          <button
            onClick={() => onExecuteLocalize('SWITCH_CSC', { targetCsc: selectedCsc, preserveData: true })}
            disabled={isBusy}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>{isAr ? `تغيير المنطقة إلى ${selectedCsc} بدون فورمات` : `SWITCH CSC REGION TO ${selectedCsc}`}</span>
          </button>
        </div>

        {/* Right Col: AI Framework XML Translator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'مترجم ملفات framework-res.apk بالذكاء الاصطناعي' : 'AI APK Framework Strings Translator'}</span>
              </h4>

              <div className="flex items-center gap-1">
                <select
                  value={targetLanguage}
                  onChange={(e) => {
                    setTargetLanguage(e.target.value);
                    setTargetCode(e.target.value === 'Arabic' ? 'ar' : e.target.value === 'Persian' ? 'fa' : 'tr');
                  }}
                  className="bg-slate-800 text-[11px] font-mono text-slate-200 border border-slate-700 rounded px-2 py-0.5"
                >
                  <option value="Arabic">Arabic (values-ar)</option>
                  <option value="Persian">Persian (values-fa)</option>
                  <option value="Turkish">Turkish (values-tr)</option>
                  <option value="Russian">Russian (values-ru)</option>
                  <option value="French">French (values-fr)</option>
                </select>
              </div>
            </div>

            <textarea
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              rows={6}
              className="w-full bg-slate-950 text-slate-200 font-mono text-xs p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="Paste original strings.xml..."
            />

            <button
              onClick={handleTranslateXml}
              disabled={isTranslating || !xmlInput.trim()}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isTranslating ? 'TRANSLATING WITH GEMINI...' : `AI TRANSLATE TO ${targetLanguage.toUpperCase()}`}</span>
            </button>

            {/* Output translated XML */}
            {translatedXml && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Output values-{targetCode}/strings.xml:</span>
                  <button
                    onClick={handleCopyTranslated}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={translatedXml}
                  rows={6}
                  className="w-full bg-black text-emerald-400 font-mono text-xs p-2.5 rounded-lg border border-slate-800 focus:outline-none resize-none"
                />
              </div>
            )}
          </div>

          <button
            onClick={() => onExecuteLocalize('INJECT_FRAMEWORK_PATCH', { targetLanguage, translatedXml })}
            disabled={isBusy || !translatedXml}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isAr ? 'حقن التعريب في النظام framework-res' : 'INJECT TRANSLATION TO SYSTEM APK'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
