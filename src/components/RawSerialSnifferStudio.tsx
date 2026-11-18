import React, { useState } from 'react';
import { 
  Cable, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Send, 
  Trash2, 
  Sliders, 
  HardDrive, 
  Sparkles,
  Radio,
  Cpu
} from 'lucide-react';
import { 
  rawSerialSnifferEngine, 
  SerialPacketLog 
} from '../services/RawSerialSnifferEngine';
import { realUsbService } from '../services/realUsbService';
import { ConnectedDevice } from '../types';

interface Props {
  device: ConnectedDevice;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const RawSerialSnifferStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const isAr = lang === 'ar';

  const [baudRate, setBaudRate] = useState<number>(115200);
  const [commandInput, setCommandInput] = useState<string>('ATI');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [portName, setPortName] = useState<string>('Not Connected');
  const [packets, setPackets] = useState<SerialPacketLog[]>([]);

  const handleConnect = async () => {
    const res = await rawSerialSnifferEngine.connectSerialPort(baudRate, (pkt) => {
      setPackets(prev => [pkt, ...prev.slice(0, 100)]);
    });
    if (res.success) {
      setIsConnected(true);
      setPortName(res.portName);
    }
  };

  const handleSend = async (customCmd?: string) => {
    const textToSend = customCmd || commandInput;
    if (!textToSend.trim()) return;
    await rawSerialSnifferEngine.transmitBytes(textToSend.trim(), (pkt) => {
      setPackets(prev => [pkt, ...prev.slice(0, 100)]);
    });
  };

  const handleSendHex = async (hexStr: string) => {
    const clean = hexStr.replace(/\s+/g, '');
    const bytes = new Uint8Array(clean.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
    await rawSerialSnifferEngine.transmitBytes(bytes, (pkt) => {
      setPackets(prev => [pkt, ...prev.slice(0, 100)]);
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Cable className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                {isAr ? 'محلل ومراقب حزم السيريال والـ USB المباشر (Raw Serial / USB Sniffer)' : 'Raw Serial & USB Packet Sniffer Studio'}
              </h1>
              <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-mono font-bold">
                WebSerial 8-N-1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'مراقبة حزم البايتات واستقبال واستجابة أوامر AT و EDL Sahara و BROM handshake في الوقت الفعلي'
                : 'Real-time bidirectional serial sniffer for AT commands, Sahara packets, and BROM handshake frames'}
            </p>
          </div>
        </div>

        {/* Port Status & Connect */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-cyan-300"
          >
            <option value={9600}>9600 bps</option>
            <option value={57600}>57600 bps</option>
            <option value={115200}>115200 bps (Standard)</option>
            <option value={921600}>921600 bps (High Speed BROM)</option>
            <option value={1500000}>1.5 Mbps (Fast Flash)</option>
          </select>

          <button
            onClick={handleConnect}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isConnected ? portName : (isAr ? 'فتح منفذ السيريال' : 'Open Serial Port')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Control & Packet Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Macros & Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-cyan-400 font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Send className="w-4 h-4" />
              <span>{isAr ? 'إرسال أوامر AT وباينري مخصصة' : 'Transmit Custom Payload'}</span>
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="ATI / AT+DEV / SAHARA_HELLO"
                className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-xs text-white flex-1"
              />
              <button
                onClick={() => handleSend()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAr ? 'إرسال' : 'Send'}</span>
              </button>
            </div>

            {/* Quick Macro Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold">
                {isAr ? 'حزم بروتوكولات جاهزة (One-Click Protocol Frames):' : 'Pre-built Protocol Frames:'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSendHex('01 00 00 00 30 00 00 00 02 00 00 00')}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-mono text-cyan-300 cursor-pointer"
                >
                  Sahara Hello (0x01)
                </button>
                <button
                  onClick={() => handleSendHex('A0 0A 50 05')}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-mono text-amber-300 cursor-pointer"
                >
                  MTK BROM Handshake
                </button>
                <button
                  onClick={() => handleSendHex('7E 00 00 00 00 00 00 7E')}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-mono text-orange-300 cursor-pointer"
                >
                  Unisoc HDLC Frame
                </button>
                <button
                  onClick={() => handleSend('AT+DEV\r\n')}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-mono text-emerald-300 cursor-pointer"
                >
                  AT+DEV Query
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Packet Log */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs h-[480px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-slate-200">{isAr ? 'موجز الحزم (Live TX/RX Stream)' : 'Live Packet Stream'}</span>
            </div>
            <button 
              onClick={() => setPackets([])}
              className="text-slate-500 hover:text-white p-1 rounded cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-300">
            {packets.length === 0 && (
              <div className="text-center text-slate-600 py-12">
                No serial packets captured yet. Send a command or connect a port.
              </div>
            )}
            {packets.map((pkt) => (
              <div
                key={pkt.id}
                className={`p-2.5 rounded-xl border font-mono text-[11px] ${
                  pkt.direction === 'TX'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                    : pkt.direction === 'RX'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] opacity-75 mb-1">
                  <span className="font-bold font-mono">[{pkt.direction}] {pkt.timestamp}</span>
                  <span>{pkt.byteLength} Bytes</span>
                </div>
                {pkt.hexString && (
                  <div className="text-cyan-300 truncate font-bold">HEX: {pkt.hexString}</div>
                )}
                <div className="text-slate-200">ASCII: "{pkt.asciiString}"</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
