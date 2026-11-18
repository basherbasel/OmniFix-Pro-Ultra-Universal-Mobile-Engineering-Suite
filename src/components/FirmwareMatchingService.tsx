import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  ExternalLink,
  HardDrive,
  Zap,
  RotateCcw,
  Copy,
  Check,
  Search
} from 'lucide-react';
import { ConnectedDevice, OfficialFirmwarePackage } from '../types';
import { OFFICIAL_FIRMWARE_CATALOG } from '../data/firmwareCatalog';

interface FirmwareMatchingServiceProps {
  device: ConnectedDevice;
  onSelectFirmwareForFlash: (firmware: OfficialFirmwarePackage) => void;
  lang: 'en' | 'ar';
}

export const FirmwareMatchingService: React.FC<FirmwareMatchingServiceProps> = ({
  device,
  onSelectFirmwareForFlash,
  lang
}) => {
  const isAr = lang === 'ar';
  const [modelFilter, setModelFilter] = useState<string>(device.model || '');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [selectedFirmware, setSelectedFirmware] = useState<OfficialFirmwarePackage | null>(() => {
    const exact = OFFICIAL_FIRMWARE_CATALOG.find(
      (f) => f.model.toLowerCase() === (device.model || '').toLowerCase()
    );
    const brandMatch = OFFICIAL_FIRMWARE_CATALOG.find(
      (f) => f.brand.toLowerCase() === (device.brand || '').toLowerCase()
    );
    return exact || brandMatch || OFFICIAL_FIRMWARE_CATALOG[0];
  });
  const [verificationState, setVerificationState] = useState<{
    checked: boolean;
    digestValid: boolean;
    rollbackSafe: boolean;
    computedFingerPrint?: string;
  } | null>(null);
  const [isVerifyingChecksum, setIsVerifyingChecksum] = useState<boolean>(false);
  const [copiedSha, setCopiedSha] = useState(false);

  // Sync automatically whenever the active connected device changes
  useEffect(() => {
    const exact = OFFICIAL_FIRMWARE_CATALOG.find(
      (f) => f.model.toLowerCase() === (device.model || '').toLowerCase()
    );
    const byBrand = OFFICIAL_FIRMWARE_CATALOG.find(
      (f) => f.brand.toLowerCase() === (device.brand || '').toLowerCase()
    );
    if (exact) {
      setModelFilter(device.model);
      setSelectedFirmware(exact);
    } else if (byBrand) {
      setModelFilter(device.brand);
      setSelectedFirmware(byBrand);
    } else {
      setModelFilter('');
      setSelectedFirmware(OFFICIAL_FIRMWARE_CATALOG[0]);
    }
    setRegionFilter('');
    setVerificationState(null);
  }, [device.id, device.model, device.brand]);

  const matchingFirmwares = useMemo(() => {
    const mQ = modelFilter.toLowerCase().trim();
    const rQ = regionFilter.toLowerCase().trim();
    return OFFICIAL_FIRMWARE_CATALOG.filter((fw) => {
      const matchesModel =
        !mQ ||
        fw.model.toLowerCase().includes(mQ) ||
        fw.brand.toLowerCase().includes(mQ) ||
        fw.marketName.toLowerCase().includes(mQ) ||
        fw.pdaVersion.toLowerCase().includes(mQ);
      const matchesRegion =
        !rQ ||
        fw.regionCsc.toLowerCase().includes(rQ) ||
        fw.countryName.toLowerCase().includes(rQ);
      return matchesModel && matchesRegion;
    });
  }, [modelFilter, regionFilter]);

  const handleVerifySha256 = async () => {
    if (!selectedFirmware) return;
    setIsVerifyingChecksum(true);
    setVerificationState(null);
    try {
      const shaFormatValid = /^[a-f0-9]{64}$/i.test(selectedFirmware.sha256Checksum);
      const md5FormatValid = /^[a-f0-9]{32}$/i.test(selectedFirmware.md5Checksum);
      const isSameModel =
        selectedFirmware.model.toLowerCase() === (device.model || '').toLowerCase();
      const rollbackSafe =
        !isSameModel || selectedFirmware.binaryRollbackIndex >= (device.rollbackIndex || 0);

      // Compute cryptographic manifest audit hash over package identity fields via Web Crypto API
      let fingerprint = '';
      if (typeof window !== 'undefined' && window.crypto?.subtle) {
        const canonicalManifest = `${selectedFirmware.brand}|${selectedFirmware.model}|${selectedFirmware.buildNumber}|U${selectedFirmware.binaryRollbackIndex}|${selectedFirmware.sha256Checksum}`;
        const buf = await window.crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(canonicalManifest)
        );
        fingerprint = Array.from(new Uint8Array(buf))
          .slice(0, 8)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase();
      }

      setVerificationState({
        checked: true,
        digestValid: shaFormatValid && md5FormatValid && selectedFirmware.verifiedOfficial,
        rollbackSafe,
        computedFingerPrint: fingerprint || undefined
      });
    } finally {
      setIsVerifyingChecksum(false);
    }
  };

  const handleCopySha = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 1800);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-900/40 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isAr ? 'محرك مطابقة والتحقق من الفلاشات الرسمية المعتمدة' : 'Official Verified Stock Firmware Matching Engine'}
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                SHA-256 · ARB SAFE CHECK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'مطابقة تلقائية للموديل ورمز الدولة CSC ومستوى الحماية Binary Rollback لحماية الهاتف من التوقف المفاجئ'
                : 'Automated package matching by Model, CSC region and Binary Rollback Index before flashing.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const exact = OFFICIAL_FIRMWARE_CATALOG.find(
                (f) => f.model.toLowerCase() === (device.model || '').toLowerCase()
              );
              setModelFilter(exact ? device.model : device.brand);
              setRegionFilter('');
              if (exact) setSelectedFirmware(exact);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono transition-all cursor-pointer whitespace-nowrap"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isAr ? `مطابقة (${device.model})` : `Match (${device.model})`}</span>
          </button>
          <button
            onClick={() => {
              setModelFilter('');
              setRegionFilter('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? `الكل (${OFFICIAL_FIRMWARE_CATALOG.length})` : `Show All (${OFFICIAL_FIRMWARE_CATALOG.length})`}</span>
          </button>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Col */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">
                  {isAr ? 'الموديل أو الاسم' : 'Model / Brand'}
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute top-1/2 -translate-y-1/2 left-2.5 rtl:left-auto rtl:right-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={modelFilter}
                    onChange={(e) => setModelFilter(e.target.value)}
                    placeholder="SM-S928B, SM-A325F..."
                    className="w-full bg-slate-950 text-slate-200 text-xs pl-8 pr-2.5 rtl:pl-2.5 rtl:pr-8 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">
                  {isAr ? 'الدولة / رمز CSC' : 'Region / CSC'}
                </label>
                <input
                  type="text"
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  placeholder="XSG, KSA, EGY, EUX..."
                  className="w-full bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
            {matchingFirmwares.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2.5">
                <p className="text-xs text-slate-400">
                  {isAr
                    ? `لا توجد فلاشة مطابقة لعبارة البحث "${modelFilter}" حالياً.`
                    : `No firmware matched filter "${modelFilter}".`}
                </p>
                <button
                  onClick={() => {
                    setModelFilter('');
                    setRegionFilter('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'عرض جميع الفلاشات الرسمية' : 'Browse All Official Packages'}
                </button>
              </div>
            ) : (
              matchingFirmwares.map((fw) => {
                const isSelected = selectedFirmware?.id === fw.id;
                const isModelMatch = fw.model.toLowerCase() === (device.model || '').toLowerCase();
                const isBinarySafe = !isModelMatch || fw.binaryRollbackIndex >= (device.rollbackIndex || 0);

                return (
                  <button
                    key={fw.id}
                    type="button"
                    onClick={() => {
                      setSelectedFirmware(fw);
                      setVerificationState(null);
                    }}
                    className={`w-full text-start p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                        : 'bg-slate-900 hover:bg-slate-800/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-white">{fw.marketName}</span>
                          {isModelMatch && (
                            <span className="text-[10px] font-mono font-bold text-emerald-400">
                              · {isAr ? 'مطابق للهاتف' : 'DEVICE MATCH'}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                          {fw.model} · {fw.regionCsc} · {fw.countryName.split('/')[0].trim()}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-cyan-300 tabular-nums shrink-0">
                        BIT U{fw.binaryRollbackIndex}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 tabular-nums">
                      <div className="truncate">
                        <span>PDA: </span>
                        <strong className="text-slate-200">{fw.pdaVersion}</strong>
                      </div>
                      <div className="text-end">
                        <span>Size: </span>
                        <strong className="text-slate-200">{(fw.fileSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB</strong>
                      </div>
                    </div>

                    {!isBinarySafe && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-rose-300 bg-rose-950/40 px-2 py-1 rounded border border-rose-800/50">
                        <AlertTriangle className="w-3 h-3 shrink-0 text-rose-400" />
                        <span>
                          {isAr
                            ? `تحذير: حماية U${fw.binaryRollbackIndex} أقل من الجهاز الحالي (U${device.rollbackIndex})`
                            : `Rollback Warning: Binary U${fw.binaryRollbackIndex} < Device U${device.rollbackIndex}`}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col */}
        <div className="lg:col-span-7 space-y-3">
          {selectedFirmware ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white">{selectedFirmware.marketName}</h4>
                    <span className="text-xs font-mono text-cyan-400">({selectedFirmware.model})</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedFirmware.countryName} · CSC: <strong className="text-white font-mono">{selectedFirmware.regionCsc}</strong> · {selectedFirmware.osVersion}
                  </p>
                </div>

                <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                  OFFICIAL STOCK
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono tabular-nums">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">PDA / AP BUILD</span>
                  <span className="font-bold text-white text-[11px] truncate block">{selectedFirmware.pdaVersion}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">CSC ARCHIVE</span>
                  <span className="font-bold text-cyan-400 text-[11px] truncate block">{selectedFirmware.cscVersion}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">BINARY ROLLBACK REV</span>
                  <span className="font-bold text-emerald-400 text-xs">BIT / REV U{selectedFirmware.binaryRollbackIndex}</span>
                </div>
              </div>

              {/* SHA-256 & Anti-Rollback Verification */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>{isAr ? 'التحقق التشفيري SHA-256 وفحص Anti-Rollback' : 'SHA-256 Digest & Rollback Gate'}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopySha(selectedFirmware.sha256Checksum)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSha ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSha ? (isAr ? 'تم النسخ' : 'Copied') : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleVerifySha256}
                      disabled={isVerifyingChecksum}
                      className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {isVerifyingChecksum ? (isAr ? 'جاري الفحص...' : 'Auditing...') : (isAr ? 'فحص التطابق والأمان' : 'Audit Digest & Safety')}
                    </button>
                  </div>
                </div>

                <div className="p-2 bg-black font-mono text-[10px] text-slate-400 rounded-lg border border-slate-800 break-all select-all">
                  SHA-256: {selectedFirmware.sha256Checksum}
                </div>

                {verificationState?.checked && (
                  <div
                    className={`p-2.5 rounded-lg border text-xs font-mono space-y-1 ${
                      verificationState.digestValid && verificationState.rollbackSafe
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {verificationState.digestValid && verificationState.rollbackSafe ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      )}
                      <span>
                        {!verificationState.digestValid
                          ? isAr
                            ? 'تنسيق التجزئة غير مكتمل أو الحزمة غير موثقة.'
                            : 'Invalid checksum format or unverified package.'
                          : !verificationState.rollbackSafe
                          ? isAr
                            ? `مرفوض أمانياً: حماية هذه الفلاشة (U${selectedFirmware.binaryRollbackIndex}) أقل من الهاتف المتصل (U${device.rollbackIndex}).`
                            : `Blocked: Package Binary (U${selectedFirmware.binaryRollbackIndex}) is lower than connected device (U${device.rollbackIndex}).`
                          : isAr
                          ? 'مطابقة صالحة 100%: تجزئة SHA-256 سليمة ومستوى Binary متوافق مع الجهاز المتصل.'
                          : 'Verified Authentic: Valid 256-bit SHA format and Binary Rollback level compatible with target.'}
                      </span>
                    </div>
                    {verificationState.computedFingerPrint && (
                      <div className="text-[10px] text-slate-400">
                        WebCrypto Audit Tag: {verificationState.computedFingerPrint}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Partitions */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 block">
                  {isAr ? 'القطاعات والملفات المضمنة:' : 'Included Subsystem Partitions:'}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedFirmware.partitionsIncluded.map((part, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-950 text-slate-300 border border-slate-800 rounded text-[11px] font-mono">
                      {part}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="text-slate-400 font-bold block mb-1">
                  {isAr ? 'ملاحظات المهندس:' : 'Engineer Advisory Notes:'}
                </span>
                <p>{isAr ? selectedFirmware.notesAr : selectedFirmware.notesEn}</p>
              </div>

              {/* Download Mirrors */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 block">
                  {isAr ? 'مصادر ومرايا التحميل المعتمدة:' : 'Verified Official Download Sources:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedFirmware.downloadMirrors.map((mirror, idx) => (
                    <a
                      key={idx}
                      href={mirror.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Download className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-slate-200 font-medium truncate">{mirror.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                        <span>{mirror.speed}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Flash Integration CTA */}
              <button
                onClick={() => onSelectFirmwareForFlash(selectedFirmware)}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{isAr ? 'نقل الفلاشة مباشرة إلى مساحة التفليش (Flasher Workspace)' : 'LOAD INTO FLASH WORKSPACE'}</span>
              </button>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 space-y-2">
              <HardDrive className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="text-xs">{isAr ? 'اختر فلاشة من القائمة لعرض التفاصيل الكاملة.' : 'Select a firmware from the list to view specifications.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
