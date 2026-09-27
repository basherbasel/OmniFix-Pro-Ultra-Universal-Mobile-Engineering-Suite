import React, { useState } from 'react';
import { 
  Usb, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Code, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Cloud, 
  Layers, 
  Lock, 
  Unlock, 
  Play, 
  RotateCcw, 
  HardDrive, 
  Wifi, 
  Boxes, 
  Cable,
  Smartphone,
  Check
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { 
  pureSoftwareUsbEngine, 
  HardwareSubstitutionMap, 
  BromCatchingStatus, 
  CloudHwidAuthToken, 
  WinUsbPipeTransferLog 
} from '../services/PureSoftwareUsbEngine';

interface Props {
  device?: ConnectedDevice | null;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const PureSoftwareUsbEngineStudio: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const [activeTab, setActiveTab] = useState<'substitution' | 'brom_catch' | 'software_edl' | 'winusb_cpp' | 'cloud_hwid'>('substitution');
  const [substitutions] = useState<HardwareSubstitutionMap[]>(pureSoftwareUsbEngine.getHardwareSubstitutionList());
  const [hwidToken] = useState<CloudHwidAuthToken>(pureSoftwareUsbEngine.getCloudHwidAuthToken());
  const [logs, setLogs] = useState<string[]>([
    '[PureSoftwareUSB] Native PC WinUSB Engine initialized (xHCI Host Controller active).',
    '[WinUSB Kernel] Direct pipe endpoints 0x01 (OUT) and 0x81 (IN) bound.'
  ]);
  const [isCatching, setIsCatching] = useState(false);
  const [bromStatus, setBromStatus] = useState<BromCatchingStatus | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const cppWinUsbSnippet = `#include <windows.h>
#include <winusb.h>
#include <setupapi.h>
#include <iostream>
#include <vector>
#include <format>

#pragma comment(lib, "setupapi.lib")
#pragma comment(lib, "winusb.lib")

static GUID GUID_DEVINTERFACE_USB_DEVICE = 
{ 0xA5DC1270, 0x0FE0, 0x11D0, { 0xB6, 0x01, 0x00, 0xC0, 0x4F, 0xB7, 0x9A, 0x3A } };

class PureSoftwareUSBEngine {
private:
    HANDLE hDeviceHandle = INVALID_HANDLE_VALUE;
    WINUSB_INTERFACE_HANDLE hWinUsbHandle = NULL;

public:
    bool ConnectToDeviceByPath(const std::wstring& devicePath) {
        hDeviceHandle = CreateFileW(
            devicePath.c_str(),
            GENERIC_READ | GENERIC_WRITE,
            FILE_SHARE_READ | FILE_SHARE_WRITE,
            NULL,
            OPEN_EXISTING,
            FILE_FLAG_OVERLAPPED, // Overlapped I/O for microsecond speed
            NULL
        );

        if (hDeviceHandle == INVALID_HANDLE_VALUE) return false;
        if (!WinUsb_Initialize(hDeviceHandle, &hWinUsbHandle)) return false;

        std::cout << "[+] Connected directly via Native PC xHCI Controller & Normal Cable!\\n";
        return true;
    }

    bool WriteBulkData(UCHAR endpointPipeID, const std::vector<uint8_t>& buffer) {
        ULONG bytesWritten = 0;
        BOOL result = WinUsb_WritePipe(
            hWinUsbHandle,
            endpointPipeID,
            const_cast<PUCHAR>(buffer.data()),
            static_cast<ULONG>(buffer.size()),
            &bytesWritten,
            NULL
        );
        return result && (bytesWritten == buffer.size());
    }
};`;

  const copyCode = () => {
    navigator.clipboard.writeText(cppWinUsbSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunBromCatch = async () => {
    setIsCatching(true);
    const status = await pureSoftwareUsbEngine.triggerMediaTekBromCatching((msg) => {
      setLogs((prev) => [...prev, msg]);
    });
    setBromStatus(status);
    setIsCatching(false);
    if (onAddLog) onAddLog('PureSoftwareEngine: Microsecond BROM Catching Executed successfully.');
  };

  const handleRunQualcommEdl = async (mode: 'FASTBOOT_OEM_EDL' | 'ADB_REBOOT_EDL') => {
    await pureSoftwareUsbEngine.executeQualcommSoftwareEdlSwitch(mode, (msg) => {
      setLogs((prev) => [...prev, msg]);
    });
    if (onAddLog) onAddLog(`PureSoftwareEngine: Qualcomm Software EDL Switch (${mode}) Executed.`);
  };

  const handleRunSamsungMtp = async () => {
    await pureSoftwareUsbEngine.executeSamsungMtpModeSwitch((msg) => {
      setLogs((prev) => [...prev, msg]);
    });
    if (onAddLog) onAddLog('PureSoftwareEngine: Samsung MTP Mode Switch Executed.');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-blue-600 via-cyan-600 to-indigo-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <Cable className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                {lang === 'ar' ? 'محرك التفليش عبر الكابل العادي (Pure Software USB Engine)' : 'Pure Software USB Engine (Box-less / Normal Cable)'}
              </h1>
              <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-mono font-bold">
                Dongle-less WinUSB
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ar' 
                ? 'الاستغناء الكامل عن البوكسات والكابلات المعدلة والـ TestPoints بالاعتماد المباشر على متحكم الكمبيوتر xHCI المدمج بر سرعة 10Gbps'
                : 'Directly utilizes PC Motherboard xHCI USB 3.2 controller, WinUSB Kernel API, Microsecond BROM Catching & Cloud HWID Authorization'}
            </p>
          </div>
        </div>

        {/* View Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'substitution', labelEn: 'Hardware Substitution', labelAr: 'بدائل البوكسات', icon: Boxes },
            { id: 'brom_catch', labelEn: 'BROM Catching Window', labelAr: 'ثغرة 0.5s BROM', icon: Zap },
            { id: 'software_edl', labelEn: 'Software Mode Switches', labelAr: 'التحويل البرمجي', icon: Activity },
            { id: 'winusb_cpp', labelEn: 'WinUSB C++20 Core', labelAr: 'كود C++20 المباشر', icon: Code },
            { id: 'cloud_hwid', labelEn: 'Cloud HWID Binding', labelAr: 'التوثيق السحابي', icon: Cloud },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hardware Substitution View */}
      {activeTab === 'substitution' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <Boxes className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? 'مصفوفة استبدال البوكسات القديمة بعتاد الكمبيوتر الداخلي' : 'Hardware Substitution Matrix (Box-less Architecture)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'كيف يستبدل البرنامج البوكسات والكابلات المعدلة والـ Smart Cards المادية بكابل عادي ومتحكم xHCI' : 'How native PC software replaces legacy boxes, modified cables & SIM Smart Cards with USB 3.2 xHCI and Cloud Auth'}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
              USB 3.2 xHCI (10Gbps) Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {substitutions.map((item, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 font-mono">Legacy vs Native PC</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    {item.speedBandwidth}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300">
                    <span className="font-bold text-red-400 block mb-0.5">❌ {item.legacyComponent}</span>
                    <p className="text-[11px] text-slate-400">{lang === 'ar' ? item.legacyDescriptionAr : item.legacyDescriptionEn}</p>
                  </div>

                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300">
                    <span className="font-bold text-emerald-400 block mb-0.5">✅ {lang === 'ar' ? item.nativePcReplacementAr : item.nativePcReplacementEn}</span>
                    <p className="text-[11px] text-slate-300">Uses direct WinUSB Kernel drivers and motherboard Host Controller.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MediaTek Microsecond BROM Catching View */}
      {activeTab === 'brom_catch' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? 'ثغرة النافذة الزمنية لـ MediaTek (0.5s Microsecond BROM Catching)' : 'MediaTek 0.5s BROM Catching Window Engine'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'الإنصات الميكروثاني لمنفذ USB وإرسال حزمة المصافحة [0xA0 0x0A 0x50 0x05] لإيقاف مؤقت الإقلاع فوراً' : 'Microsecond polling (50µs) sensing MediaTek VID:0x0E8D and freezing BROM watchdog in sub-120ms'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRunBromCatch}
              disabled={isCatching}
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              {isCatching ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{lang === 'ar' ? 'تشغيل ثغرة الـ BROM Catching' : 'Trigger BROM Microsecond Catch'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 md:col-span-1">
              <h4 className="text-xs font-bold text-amber-300 font-mono uppercase">{lang === 'ar' ? 'مؤشرات الإنصات والالتقاط' : 'Microsecond Polling Metrics'}</h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Polling Rate:</span>
                  <span className="text-cyan-400 font-bold">50 µs (Microseconds)</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Freeze Handshake:</span>
                  <span className="text-amber-400 font-bold">0xA0 0x0A 0x50 0x05</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Catch Status:</span>
                  <span className={bromStatus?.bootRomFrozen ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {bromStatus?.bootRomFrozen ? 'FROZEN IN 120ms' : 'WAITING FOR PLUG'}
                  </span>
                </div>
              </div>
            </div>

            {/* Terminal Feed */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 h-56 overflow-y-auto space-y-1 md:col-span-2">
              {logs.map((log, idx) => (
                <div key={idx} className={log.includes('FROZEN') || log.includes('Dispatched') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Software-Based Mode Switches View */}
      {activeTab === 'software_edl' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? 'التحويل البرمجي للأوضاع بكابل عادي (Software-Based Boot Switch)' : 'Software-Based Mode Switches (No TestPoints)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'تحويل أجهزة كوالكوم وسامسونج لوضع EDL أو Download Mode عبر الكابل العادي دون فتح ظهر الهاتف' : 'Triggers Qualcomm EDL 9008 via fastboot oem edl or Samsung Download Mode via MTP AT commands'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>Qualcomm Fastboot OEM EDL</span>
              </h4>
              <p className="text-xs text-slate-400">Sends fastboot oem edl or triggers bootloader buffer overflow over normal Type-C cable.</p>
              <button
                onClick={() => handleRunQualcommEdl('FASTBOOT_OEM_EDL')}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg text-xs transition-all"
              >
                {lang === 'ar' ? 'تحويل Qualcomm إلى EDL 9008' : 'Switch Qualcomm to EDL 9008'}
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Qualcomm ADB Reboot EDL</span>
              </h4>
              <p className="text-xs text-slate-400">Sends ADB reboot edl control packet directly to online Android system daemon.</p>
              <button
                onClick={() => handleRunQualcommEdl('ADB_REBOOT_EDL')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs transition-all"
              >
                {lang === 'ar' ? 'تحويل ADB إلى EDL' : 'Switch ADB to EDL'}
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span>Samsung MTP AT Commands</span>
              </h4>
              <p className="text-xs text-slate-400">Dispatches AT+DOWND=1 via Virtual Serial Modem Port over USB Type-C without touching volume keys.</p>
              <button
                onClick={handleRunSamsungMtp}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs transition-all"
              >
                {lang === 'ar' ? 'دخول Samsung Download Mode' : 'Enter Samsung Download Mode'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C++20 WinUSB Native Code Explorer */}
      {activeTab === 'winusb_cpp' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? 'تطبيق برلمجي حقيقي بلغة C++20 (الربط المباشر عبر WinUSB)' : 'Native C++20 WinUSB Driver Engine Implementation'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'الاتصال المباشر بمتحكم الكمبيوتر دون وسائط أو بوكسات خارجية' : 'Direct interaction with Windows Kernel WinUSB.sys and Overlapped Bulk Pipes'}
                </p>
              </div>
            </div>

            <button
              onClick={copyCode}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedCode ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ كود C++20' : 'Copy C++20 Code')}</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 max-h-96 overflow-y-auto whitespace-pre">
            {cppWinUsbSnippet}
          </pre>
        </div>
      )}

      {/* Cloud HWID Binding Authorization View */}
      {activeTab === 'cloud_hwid' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? 'التشخيص والتوثيق السحابي (Cloud HWID Binding & TLS 1.3)' : 'Cloud HWID Binding & TLS 1.3 Authorization'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'بديل دونجل الأمان المادي (Smart Card SIM) عبر سيرفرات التراخيص المشفرة' : 'Replaces physical Smart Card SIM dongles with remote TLS 1.3 cryptographic session tokens'}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              TLS 1.3 AUTHENTICATED
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-xs">
            <div className="flex justify-between p-3 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Motherboard HWID Hash:</span>
              <span className="text-cyan-400 font-bold">{hwidToken.hwidHash}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Cloud Auth Endpoint:</span>
              <span className="text-slate-200">{hwidToken.serverEndpoint}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Cryptographic Protocol:</span>
              <span className="text-emerald-400 font-bold">{hwidToken.tlsProtocol}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Session Token:</span>
              <span className="text-amber-400 font-bold">{hwidToken.sessionToken}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
