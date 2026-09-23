import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, 
  Trash2, 
  Copy, 
  Download, 
  Pause, 
  Play, 
  Send, 
  Layers, 
  Cpu, 
  Check, 
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ProtocolLogItem } from '../types';

interface LiveConsoleTerminalProps {
  logs: ProtocolLogItem[];
  onClearLogs: () => void;
  onSendCommand: (cmd: string) => void;
  isExecuting: boolean;
  lang: 'en' | 'ar';
}

export const LiveConsoleTerminal: React.FC<LiveConsoleTerminalProps> = ({
  logs,
  onClearLogs,
  onSendCommand,
  isExecuting,
  lang
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showHexOnly, setShowHexOnly] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Collapsed by default for a neat, smooth and clean look
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current && !isCollapsed) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isCollapsed]);

  // Auto-expand terminal when active operations are running
  useEffect(() => {
    if (isExecuting) {
      setIsCollapsed(false);
    }
  }, [isExecuting]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || isExecuting) return;
    onSendCommand(commandInput.trim());
    setCommandInput('');
  };

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.tag}] ${l.message}${l.hexDump ? '\nHEX: ' + l.hexDump : ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.tag}] [${l.level.toUpperCase()}] ${l.message}${l.hexDump ? '\nHEX: ' + l.hexDump : ''}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnifix_protocol_log_${new Date().toISOString().slice(0,19).replace(/[:T]/g, '_')}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = showHexOnly ? logs.filter(l => l.hexDump || l.level === 'hex' || l.level === 'raw_usb') : logs;

  const getLogColor = (level: ProtocolLogItem['level']) => {
    switch (level) {
      case 'success': return 'text-emerald-600';
      case 'error': return 'text-rose-600 font-semibold';
      case 'warn': return 'text-amber-600';
      case 'hex':
      case 'raw_usb': return 'text-cyan-700 font-mono';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className={`bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-2xl flex flex-col transition-all duration-500 ease-in-out relative preserve-3d ${
      isCollapsed ? 'h-[52px]' : 'h-[320px] lg:h-[420px]'
    }`}>
      {/* Terminal Header */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="bg-white/40 px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-2 text-xs select-none cursor-pointer hover:bg-white/60 transition-colors relative z-10"
      >
        <div className="flex items-center gap-3 font-mono text-slate-600">
          <Terminal className="w-4 h-4 text-cyan-600" />
          <span className="font-black text-slate-900 uppercase italic tracking-tight">LIVE PROTOCOL CONSOLE</span>
          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest hidden sm:inline opacity-60">| WinUSB / Direct COM / Sahara Buffer</span>
          {isExecuting && (
            <span className="flex items-center gap-2 text-[9px] text-cyan-700 font-black uppercase tracking-widest animate-pulse bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100 italic">
              ● TX/RX ACTIVE
            </span>
          )}
          {isCollapsed && (
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg animate-pulse border border-slate-100 italic">
              {lang === 'ar' ? '▼ انقر لتوسيع نافذة الأوامر واللوج' : '▼ Click to expand logs & terminal'}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!isCollapsed && (
            <>
              <button
                onClick={() => setShowHexOnly(!showHexOnly)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black font-mono border transition-all flex items-center gap-2 uppercase tracking-widest ${
                  showHexOnly 
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-600/20' 
                    : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-sm'
                }`}
                title="Toggle Hex Packet View"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>RAW HEX</span>
              </button>

              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`p-2 rounded-xl transition-all border ${!autoScroll ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-inner' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-900 shadow-sm'}`}
                title={autoScroll ? 'Pause autoscroll' : 'Resume autoscroll'}
              >
                {autoScroll ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={handleCopyLogs}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-200 shadow-sm"
                title="Copy Logs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleExportLogs}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-200 shadow-sm"
                title="Export .LOG file"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={onClearLogs}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-400 hover:text-rose-600 transition-all border border-slate-200 shadow-sm"
                title="Clear Console"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-200 shadow-sm"
            title={isCollapsed ? 'Expand Terminal' : 'Collapse Terminal'}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4 text-cyan-600" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      {!isCollapsed && (
        <div className="flex-1 p-5 overflow-y-auto font-mono text-xs space-y-2 bg-slate-950/95 selection:bg-cyan-500/30 selection:text-white relative">
          <div className="absolute inset-0 bg-scan-line opacity-[0.03] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none opacity-30" />
          
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 italic py-12 text-center font-black uppercase tracking-widest opacity-50 relative z-10">
              {lang === 'ar' ? 'بانتظار تلقي أوامر البروتوكول وحزم الـ USB...' : 'Awaiting USB low-level protocol packets and serial frames...'}
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="leading-relaxed hover:bg-white/5 px-2 py-1 rounded-lg transition-colors relative z-10 group flex items-start gap-4">
                <span className="text-slate-600 select-none opacity-40 group-hover:opacity-100 transition-opacity font-bold">[{log.timestamp}]</span>
                <span className="text-cyan-600 font-black select-none italic group-hover:text-cyan-400 transition-colors">[{log.tag}]</span>
                <span className={`${getLogColor(log.level)} opacity-90 group-hover:opacity-100 transition-opacity`}>{log.message}</span>
                {log.hexDump && (
                  <div className="absolute top-full left-0 w-full z-20 mt-1">
                    <div className="text-[11px] text-cyan-400 bg-slate-900 p-4 rounded-2xl border border-slate-800 overflow-x-auto whitespace-pre font-mono shadow-2xl italic">
                      {log.hexDump}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      )}

      {/* Direct Interactive Command Input */}
      {!isCollapsed && (
        <form onSubmit={handleSend} className="bg-white border-t border-slate-100 p-3 flex items-center gap-3 relative z-10">
          <div className="text-cyan-600 font-mono text-xs pl-3 flex items-center">
            <ChevronRight className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder={
              lang === 'ar'
                ? 'أدخل أمر مباشر (مثال: fastboot getvar all, adb reboot edl, AT+DEVINFO)...'
                : 'Execute direct protocol/CLI command (e.g., fastboot getvar all, adb shell, AT+DEVINFO)...'
            }
            className="flex-1 bg-transparent text-xs font-mono font-black text-slate-900 placeholder-slate-300 focus:outline-none uppercase tracking-tight italic"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!commandInput.trim() || isExecuting}
            className="px-5 py-2 bg-slate-100 hover:bg-cyan-600 hover:text-white disabled:opacity-40 text-slate-600 rounded-xl text-[10px] font-black font-mono transition-all flex items-center gap-2 border border-slate-200 uppercase tracking-widest shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>SEND</span>
          </motion.button>
        </form>
      )}
    </div>
  );
};
