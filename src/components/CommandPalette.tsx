import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Search, 
  Cpu, 
  Command, 
  CornerDownLeft, 
  X, 
  ShieldAlert, 
  Play, 
  Layers, 
  Unlock, 
  RefreshCw, 
  Settings, 
  Wrench,
  Zap
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  device: ConnectedDevice | null;
  lang?: 'en' | 'ar';
}

interface CommandItem {
  id: string;
  category: 'Odin' | 'Fastboot' | 'MediaTek' | 'ADB' | 'System';
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  icon: React.ReactNode;
  shortcut?: string;
  actionKey: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose, 
  device, 
  lang = 'ar' 
}) => {
  const isAr = lang === 'ar';
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Audio feedback helper
  const playBeep = (freq: number = 880, duration: number = 0.15) => {
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

  const commands: CommandItem[] = [
    {
      id: 'odin-frp',
      category: 'Odin',
      titleEn: 'Samsung Odin FRP Bypass',
      titleAr: 'تخطي حماية سامسونج FRP أودين',
      descEn: 'Clears Google account locks via high-speed physical Loke Download Mode blocks',
      descAr: 'تصفير قفل حساب جوجل عبر بروتوكول Loke السريع',
      icon: <Layers className="w-4 h-4 text-blue-400" />,
      shortcut: '⌥O',
      actionKey: 'ODIN_SAMSUNG_FRP_BYPASS'
    },
    {
      id: 'odin-pit',
      category: 'Odin',
      titleEn: 'Odin PIT Re-Partition & Fix',
      titleAr: 'إصلاح وسحب الـ PIT سامسونج',
      descEn: 'Pulls device PIT structure index & aligns damaged memory sectors',
      descAr: 'سحب جدول PIT العتادي وتصحيح قطاعات التخزين التالفة',
      icon: <Wrench className="w-4 h-4 text-blue-400" />,
      shortcut: '⌥P',
      actionKey: 'ODIN_PIT_REPARTITION_FIX'
    },
    {
      id: 'fastboot-unlock',
      category: 'Fastboot',
      titleEn: 'Force OEM Bootloader Unlock',
      titleAr: 'فتح البوتلودر إجبارياً',
      descEn: 'Dispatches universal Fastboot unlock sequence to wipe secure lock tags',
      descAr: 'إرسال أوامر فاستبوت الإجبارية لفتح الحماية العتادية للبوتلودر',
      icon: <Unlock className="w-4 h-4 text-indigo-400" />,
      shortcut: '⌥U',
      actionKey: 'FASTBOOT_OEM_UNLOCK_FORCE'
    },
    {
      id: 'fastboot-frp',
      category: 'Fastboot',
      titleEn: 'Fastboot Security FRP Wipe',
      titleAr: 'مسح حماية FRP فاستبوت',
      descEn: 'Wipes secure partitions (frp, config, persistent) directly',
      descAr: 'تصفير قطاع frp و persistent بالكامل عبر بروتوكول فاستبوت',
      icon: <ShieldAlert className="w-4 h-4 text-indigo-400" />,
      shortcut: '⌥F',
      actionKey: 'FASTBOOT_FRP_WIPE'
    },
    {
      id: 'mtk-bypass',
      category: 'MediaTek',
      titleEn: 'MediaTek BROM / SLA Bypass',
      titleAr: 'تخطي حمايات ميديا تيك BROM',
      descEn: 'Bypasses hardware authentication checks and clears NVRAM regions',
      descAr: 'تعطيل حماية Preloader SLA/DAA وتمرير الـ DA العتادي',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      shortcut: '⌥M',
      actionKey: 'MTK_BROM_FRP_BYPASS'
    },
    {
      id: 'adb-reboot',
      category: 'ADB',
      titleEn: 'ADB Reboot Recovery',
      titleAr: 'إعادة الإقلاع لوضع الريكفري',
      descEn: 'Sends low-level adb reboot command to push device to recovery',
      descAr: 'إرسال أمر إعادة تشغيل الهاتف ليدخل وضع الريكفري الرسمي لغرض التفليش',
      icon: <RefreshCw className="w-4 h-4 text-emerald-400" />,
      shortcut: '⌥R',
      actionKey: 'REBOOT_RECOVERY'
    },
    {
      id: 'adb-sideload',
      category: 'ADB',
      titleEn: 'ADB Sideload OTA Firmware',
      titleAr: 'تثبيت التحديث وإصلاح الـ Sideload',
      descEn: 'Flashes official system update.zip packages from recovery workstation',
      descAr: 'إرسال وتفليش ملفات الروم والتحديثات المضغوطة لتصحيح أخطاء النظام',
      icon: <CornerDownLeft className="w-4 h-4 text-emerald-400" />,
      shortcut: '⌥S',
      actionKey: 'ADB_SIDELOAD_RECOVERY'
    }
  ];

  // Filter commands based on search
  const filteredCommands = commands.filter(cmd => {
    const term = search.toLowerCase();
    return (
      cmd.titleEn.toLowerCase().includes(term) ||
      cmd.titleAr.includes(term) ||
      cmd.category.toLowerCase().includes(term) ||
      cmd.descEn.toLowerCase().includes(term) ||
      cmd.descAr.includes(term)
    );
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
      playBeep(950, 0.1);
    }
  }, [isOpen]);

  // Keyboard navigation within the palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
        playBeep(600, 0.04);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
        playBeep(600, 0.04);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          triggerCommand(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        playBeep(400, 0.15);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  const triggerCommand = async (cmd: CommandItem) => {
    onClose();
    playBeep(1200, 0.25);
    
    // Simulate direct command execution in the workstation
    const mockNotification = document.createElement('div');
    mockNotification.className = "fixed bottom-5 right-5 bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/40 text-slate-100 p-4 rounded-xl shadow-2xl z-[9999] animate-fadeIn max-w-sm flex flex-col gap-2";
    
    const title = isAr ? `جاري تشغيل: ${cmd.titleAr}` : `Executing: ${cmd.titleEn}`;
    const targetDev = device ? `${device.brand} (${device.mode})` : (isAr ? 'منفذ COM3 الافتراضي' : 'Default COM3 Port');

    mockNotification.innerHTML = `
      <div class="flex items-center gap-2.5">
        <span class="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-indigo-400 opacity-75"></span>
        <div class="p-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded text-indigo-400 font-bold text-xs uppercase tracking-wider">
          ${cmd.category}
        </div>
        <span class="text-xs font-extrabold text-slate-100">${title}</span>
      </div>
      <div class="text-[10px] text-slate-400 leading-normal">
        ${isAr ? `توجيه الأمر المباشر إلى [${targetDev}]...` : `Routing native command blocks to [${targetDev}]...`}
      </div>
      <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
        <div class="bg-indigo-500 h-full w-0 animate-progressFull duration-[3000ms]"></div>
      </div>
    `;

    document.body.appendChild(mockNotification);
    
    // Auto remove notification after 3 seconds
    setTimeout(() => {
      mockNotification.classList.add('animate-fadeOut');
      setTimeout(() => mockNotification.remove(), 500);
    }, 3500);

    // Call the global endpoint if needed
    try {
      await fetch('/api/master/execute-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandKey: cmd.actionKey,
          devicePath: device?.socId || 'PORT_COM3',
          lang: lang
        })
      });
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex items-start justify-center pt-[12vh] p-4 animate-fadeIn">
      {/* Container Box */}
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden shadow-indigo-950/50">
        
        {/* Search header bar */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-indigo-400 shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={isAr ? "ابحث عن بروتوكول أو أمر تخطي... (مثال: Odin, Fastboot, Recovery)" : "Search protocols, bypass paths, utilities... (e.g., Odin, BROM, Sideload)"}
            className="w-full bg-transparent text-slate-100 font-sans text-sm focus:outline-none placeholder-slate-500"
          />
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-96 overflow-y-auto p-2 space-y-0.5">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => triggerCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r from-indigo-950/70 to-slate-900/90 border border-indigo-500/40 text-slate-100' 
                      : 'border border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300' : 'bg-slate-900/90 border border-slate-800 text-slate-400'}`}>
                      {cmd.icon}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs sm:text-[13px] text-slate-100 truncate">
                          {isAr ? cmd.titleAr : cmd.titleEn}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase border ${isSelected ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                          {cmd.category}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[420px]">
                        {isAr ? cmd.descAr : cmd.descEn}
                      </div>
                    </div>
                  </div>

                  {/* Hotkey badges */}
                  {cmd.shortcut && (
                    <div className="hidden sm:flex items-center gap-1">
                      <span className="px-2 py-1 bg-slate-950 text-slate-500 rounded text-[10px] font-mono border border-slate-800">
                        {cmd.shortcut}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <Cpu className="w-8 h-8 text-slate-700 animate-spin" />
              <span>{isAr ? "لم نجد أي بروتوكول مطابق لبحثك..." : "No matching repair protocol found..."}</span>
            </div>
          )}
        </div>

        {/* Action instruction footer */}
        <div className="bg-slate-950/80 px-4 py-3.5 border-t border-slate-850 text-[10px] text-slate-500 flex items-center justify-between font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-400 font-bold">↑↓</span>
              <span>{isAr ? "للتنقل" : "Navigate"}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400 font-bold">Enter</span>
              <span>{isAr ? "للتشغيل" : "Execute"}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-400 font-bold">ESC</span>
              <span>{isAr ? "للإغلاق" : "Close"}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Command className="w-3.5 h-3.5" />
            <span>+ K</span>
          </div>
        </div>

      </div>
    </div>
  );
};
