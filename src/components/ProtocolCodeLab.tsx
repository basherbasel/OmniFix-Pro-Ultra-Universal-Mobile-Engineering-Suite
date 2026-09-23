import React, { useState } from 'react';
import { 
  Terminal, 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Cpu, 
  Layers, 
  FileCode, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { PROTOCOL_CODE_SNIPPETS } from '../data/protocolPrototypes';
import { GeneratedCodeSnippet } from '../types';

interface ProtocolCodeLabProps {
  lang: 'en' | 'ar';
}

export const ProtocolCodeLab: React.FC<ProtocolCodeLabProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [activeSnippetIndex, setActiveSnippetIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeSnippet: GeneratedCodeSnippet = PROTOCOL_CODE_SNIPPETS[activeSnippetIndex] || PROTOCOL_CODE_SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeSnippet.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeSnippet.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLanguageColor = (langType: GeneratedCodeSnippet['language']) => {
    switch (langType) {
      case 'python': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'cpp': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'rust': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'typescript': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{isAr ? 'مختبر أكواد ومكتبات البروتوكول المنخفض (Native Code Lab)' : 'Low-Level Protocol & Native Code Lab'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                PRODUCTION-READY ENGINE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'أكواد ومكتبات حقيقية بلغات (C++, Python, Rust, TypeScript) للتحكم في منافذ USB وبروتوكولات BROM / Sahara / Odin / FDL'
                : 'Native standalone protocol implementations, memory register offsets, packet headers, and WinUSB / LibUSB driver hooks.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-slate-500">Supported:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">C++20</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Python 3.11</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Rust</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">TypeScript</span>
        </div>
      </div>

      {/* Main Grid: Code Snippet Selector & Code View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Col: Snippet List */}
        <div className="lg:col-span-1 space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            {isAr ? 'الوحدات البرمجية الجاهزة:' : 'Protocol Modules:'}
          </h4>

          {PROTOCOL_CODE_SNIPPETS.map((snippet, idx) => {
            const isSelected = idx === activeSnippetIndex;
            return (
              <div
                key={idx}
                onClick={() => setActiveSnippetIndex(idx)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${getLanguageColor(snippet.language)}`}>
                    {snippet.language}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{snippet.filename}</span>
                </div>
                <h5 className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                  {snippet.title}
                </h5>
              </div>
            );
          })}
        </div>

        {/* Right 3 Cols: Code Editor / Viewer */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          {/* Code Header Bar */}
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold text-white">{activeSnippet.filename}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${getLanguageColor(activeSnippet.language)}`}>
                  {activeSnippet.language}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{activeSnippet.description}</p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1 transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="p-4 bg-black/95 font-mono text-xs text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed selection:bg-cyan-900 selection:text-white">
            <pre className="whitespace-pre">{activeSnippet.code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
