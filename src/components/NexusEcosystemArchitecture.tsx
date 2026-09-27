import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  QrCode, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Database, 
  Box, 
  FileText, 
  Send, 
  Download, 
  Wrench, 
  Share2, 
  Camera, 
  Sliders, 
  PackageCheck,
  Flame,
  Binary
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { nexusEventBus, RepairEvent, MaintenanceTicket, InventoryItem } from '../services/NexusEcosystemEngine';
import { realUsbService } from '../services/realUsbService';

interface Props {
  device?: ConnectedDevice | null;
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const NexusEcosystemArchitecture: React.FC<Props> = ({ device, lang = 'ar', onAddLog }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'eventbus' | 'software' | 'programmer' | 'hardware' | 'ticket'>('architecture');
  const [ticket, setTicket] = useState<MaintenanceTicket>(nexusEventBus.getActiveTicket());
  const [events, setEvents] = useState<RepairEvent[]>(nexusEventBus.getEventHistory());
  const [inventory, setInventory] = useState<InventoryItem[]>(nexusEventBus.getInventoryCatalog());
  const [simulating, setSimulating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = nexusEventBus.subscribe((evt) => {
      setEvents([...nexusEventBus.getEventHistory()]);
      setTicket({ ...nexusEventBus.getActiveTicket() });
      setInventory([...nexusEventBus.getInventoryCatalog()]);
    });
    return () => unsubscribe();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Event Trigger Simulations
  const handleSimulatePowerShort = () => {
    setSimulating(true);
    nexusEventBus.publish('POWER_SUPPLY_READOUT', 'HARDWARE_PROGRAMMER', {
      voltageV: 4.2,
      currentAmp: 2.85,
      isShort: true,
      shortLocation: 'Short in PMIC VBUS Capacitor C2411 (2.85A @ 4.2V)'
    });
    nexusEventBus.publish('THERMAL_HOTSPOT_CAPTURED', 'HARDWARE_PROGRAMMER', {
      thermalTempC: 68.4,
      hotspotComponent: 'PMIC PM8350B (U2100_VBUS_IN)'
    });
    triggerToast(lang === 'ar' ? 'تم رصد شورت كهربائي وتوليد قراءة حرارية تلقائية لكرت الصيانة!' : 'DC Power short & thermal hotspot logged to Ticket!');
    if (onAddLog) onAddLog('EventBus: Published POWER_SUPPLY_READOUT (is_short=true, amp=2.85)');
    setTimeout(() => setSimulating(false), 600);
  };

  const handleSimulateUfsHealthScan = () => {
    setSimulating(true);
    nexusEventBus.publish('MEMORY_HEALTH_SCANNED', 'HARDWARE_PROGRAMMER', {
      ufsHealthPercent: 96,
      lifeUsedEmmc: 5
    });
    triggerToast(lang === 'ar' ? 'تم فحص صحة الذاكرة UFS 3.1 وتحديث كرت الصيانة!' : 'UFS 3.1 Memory Health Scanned & Logged!');
    if (onAddLog) onAddLog('EventBus: Published MEMORY_HEALTH_SCANNED (UFS Health: 96%)');
    setTimeout(() => setSimulating(false), 600);
  };

  const handleSimulateTrueToneEeprom = () => {
    setSimulating(true);
    nexusEventBus.publish('EEPROM_CALIBRATED', 'HARDWARE_PROGRAMMER', {
      trueToneTransferred: true,
      bmsHealthCalibratedPct: 98
    });
    triggerToast(lang === 'ar' ? 'تم نسخ بيانات TrueTone ومعايرة صحة البطارية تلقائياً!' : 'TrueTone & BMS Battery Health Calibrated!');
    if (onAddLog) onAddLog('EventBus: Published EEPROM_CALIBRATED (TrueTone & BMS Sync)');
    setTimeout(() => setSimulating(false), 600);
  };

  const handleSimulateAntiBrickEfsBackup = () => {
    setSimulating(true);
    nexusEventBus.publish('SOFTWARE_OPERATION_COMPLETED', 'SOFTWARE_SECURITY', {
      taskName: 'Anti-Rollback (ARB) Match & Auto EFS / NVRAM Backup',
      status: 'SUCCESS',
      backupPath: `EFS_BACKUP_${ticket.ticketId}_${Date.now()}.bin`
    });
    triggerToast(lang === 'ar' ? 'تم إجراء الفحص الوقائي وسحب احتياطي EFS تلقائياً!' : 'Anti-Brick ARB pre-check & EFS Backup completed!');
    if (onAddLog) onAddLog('EventBus: Published SOFTWARE_OPERATION_COMPLETED (EFS Backup)');
    setTimeout(() => setSimulating(false), 600);
  };

  const handleSimulateInventoryDeduction = (sku: string) => {
    setSimulating(true);
    nexusEventBus.publish('INVENTORY_AUTO_DEDUCTED', 'WORKSHOP_ERP', {
      inventoryItemSku: sku
    });
    triggerToast(lang === 'ar' ? 'تم خصم القطعة تلقائياً من المخزن وإضافتها لفاتورة الكرت!' : 'Inventory item auto-deducted & added to Ticket!');
    if (onAddLog) onAddLog(`EventBus: Published INVENTORY_AUTO_DEDUCTED (SKU: ${sku})`);
    setTimeout(() => setSimulating(false), 600);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                {lang === 'ar' ? 'منظومة الصيانة الموحدة - Nexus Repair OS' : 'Nexus Ecosystem Repair Architecture'}
              </h1>
              <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-mono font-bold">
                ZeroMQ IPC EventBus
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ar' 
                ? 'ربط تلقائي شامل بين محرك السوفتوير، برمجة الذواكر والشاشات، محطة العتاد الذكية، وإدارة مركز الصيانة ERP'
                : 'Unified Event Bus orchestrating Software Unlocks, Memory/EEPROM Programmers, Hardware Bench & ERP Tickets'}
            </p>
          </div>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
          {[
            { id: 'architecture', labelEn: 'Ecosystem Architecture', labelAr: 'المعمارية الموحدة', icon: Layers },
            { id: 'eventbus', labelEn: 'Central Event Bus', labelAr: 'ناقل الأحداث', icon: Activity },
            { id: 'software', labelEn: 'Software & Security', labelAr: 'السوفتوير والحمايات', icon: Cpu },
            { id: 'programmer', labelEn: 'Memory & EEPROM', labelAr: 'الذواكر والبرمجة', icon: HardDrive },
            { id: 'hardware', labelEn: 'Hardware Bench Telemetry', labelAr: 'محطة العتاد', icon: Zap },
            { id: 'ticket', labelEn: 'Workshop ERP Ticket', labelAr: 'كرت الصيانة ERP', icon: QrCode },
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

      {/* Main Interactive Views */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Ecosystem Architecture Visual Diagram */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-6">
              <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                {lang === 'ar' ? 'معمارية المنظومة الموحدة (Unified Ecosystem Architecture)' : 'Unified Ecosystem Topology'}
              </span>
              <h2 className="text-lg font-extrabold text-white mt-2">
                {lang === 'ar' ? 'ربط الناقل المركزي للأحداث (Centralized Event Bus Engine)' : 'Central Event Bus Inter-Engine Communication'}
              </h2>
            </div>

            {/* Visual Engine Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Node 1: Software & Security */}
              <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-5 hover:border-cyan-400 transition-all shadow-lg group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Engine #1
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  {lang === 'ar' ? '1. طبقة السوفتوير وتجاوز الحمايات' : '1. Software & Security Engine'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ar' 
                    ? 'Qualcomm Firehose, MTK BROM/DA, Unisoc FDL, Apple Checkm8, Samsung Odin/EUB' 
                    : 'Universal Chipset Manager & Anti-Brick Safety Line with Auto EFS/NVRAM Backups'}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-cyan-300 font-mono">
                  <span>Anti-Rollback (ARB) Check</span>
                  <span className="text-emerald-400">PASSED</span>
                </div>
              </div>

              {/* Node 2: Memory & Hardware Programmer */}
              <div className="bg-slate-950/80 border border-blue-500/30 rounded-xl p-5 hover:border-blue-400 transition-all shadow-lg group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Engine #2
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  {lang === 'ar' ? '2. طبقة برمجة الذواكر والشاشات' : '2. Memory & EEPROM Programmer'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ar' 
                    ? 'UFS 2.1/3.1/4.0 LUNs, eMMC BGA 153/254, RPMB Clear, TrueTone EEPROM & BMS Battery Sync' 
                    : 'BGA Direct SCSI LUNs, Extended CSD Timing Repair & JCID/QianLi EEPROM Telemetry'}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-blue-300 font-mono">
                  <span>UFS 3.1 Memory Health</span>
                  <span className="text-emerald-400">98% GOOD</span>
                </div>
              </div>

              {/* Node 3: Hardware Bench IoT Telemetry */}
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-5 hover:border-amber-400 transition-all shadow-lg group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Engine #3
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  {lang === 'ar' ? '3. محطة العتاد الذكية (IoT Telemetry)' : '3. Hardware Station IoT Telemetry'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ar' 
                    ? 'Smart DC Power Supply (V/A) Signature Profiling, Thermal Hotspot Pinpointing & Multimeter' 
                    : 'Live Serial USB DC Power Curve Graph, Thermal Rosin Imaging & Boardview Overlay'}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-300 font-mono">
                  <span>DC Power Signature</span>
                  <span className="text-amber-400 font-bold">2.85A VBUS Short</span>
                </div>
              </div>
            </div>

            {/* Event Bus Bus Core Overlay Bar */}
            <div className="mt-6 bg-gradient-to-r from-cyan-950 via-slate-950 to-indigo-950 border border-cyan-500/40 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-cyan-300 font-mono">
                    {lang === 'ar' ? 'الناقل المركزي للأحداث (Central Event Bus - ZeroMQ / IPC)' : 'Central Event Bus Core (ZeroMQ Broadcast)'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'ar' ? 'يستقبل القراءات تلقائياً من كافة الأجهزة وينشئ تحديثات فورية لكرت الصيانة الرقمي' : 'Zero-polling instant broadcast linking all engines to the Workshop ERP Ticket'}
                  </p>
                </div>
              </div>

              {/* Action Simulation Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSimulatePowerShort}
                  disabled={simulating}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'ar' ? 'محاكاة شورت Power Supply' : 'Simulate Power Short'}</span>
                </button>
                <button
                  onClick={handleSimulateUfsHealthScan}
                  disabled={simulating}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                  <span>{lang === 'ar' ? 'فحص UFS Health' : 'Scan UFS Health'}</span>
                </button>
                <button
                  onClick={handleSimulateAntiBrickEfsBackup}
                  disabled={simulating}
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'ar' ? 'سحب EFS Backup' : 'Backup EFS Security'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Connected Ticket Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
              <img src={ticket.qrCodeUrl} alt="QR Ticket" className="w-16 h-16 rounded-lg border border-slate-700 bg-white p-1" />
              <div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {ticket.ticketId}
                </span>
                <h4 className="text-sm font-bold text-white mt-1">{ticket.clientName}</h4>
                <p className="text-xs text-slate-400">{ticket.deviceModel}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{lang === 'ar' ? 'حالة كرت الصيانة' : 'Ticket Status'}</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-300">{ticket.status}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-1">IMEI: {ticket.imei}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{lang === 'ar' ? 'قراءات العتاد و السوفت' : 'Hardware & Memory Telemetry'}</span>
              <p className="text-xs text-emerald-400 font-mono font-semibold">{ticket.memoryHealthStatus}</p>
              <p className="text-xs text-amber-400 font-mono font-semibold">{ticket.hardwarePowerLogs[0]?.signature || 'Normal Power'}</p>
            </div>

            <div className="flex flex-col justify-between items-end">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono">{lang === 'ar' ? 'إجمالي التكلفة' : 'Total Repair Cost'}</span>
                <div className="text-lg font-extrabold text-cyan-400">${ticket.totalCost.toFixed(2)}</div>
              </div>
              <button
                onClick={() => setActiveTab('ticket')}
                className="bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all mt-2"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'عرض الكرت الكامل ERP' : 'View Full Ticket'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Central Event Bus Monitor Tab */}
      {activeTab === 'eventbus' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? 'بث أحداث الناقل المركزي (Central Event Bus Stream)' : 'Central Event Bus Broadcast Stream'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'مراقبة فورية لكافة الأحداث المنقولة بين وحدات المحرك وكرت الصيانة' : 'Live real-time ZeroMQ/IPC broadcast messages published across system engines'}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              IPC BUS ACTIVE
            </span>
          </div>

          {/* Event Stream Terminal Feed */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-96 overflow-y-auto space-y-2">
            {events.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                {lang === 'ar' ? 'لا توجد أحداث مبثوثة حالياً. انقر على أزرار المحاكاة لبث حدث!' : 'No events in memory buffer. Click trigger buttons to publish live events!'}
              </div>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-start justify-between gap-3 hover:border-slate-700 transition-all">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                      {evt.timestamp}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{evt.type}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                          {evt.sourceEngine}
                        </span>
                      </div>
                      <pre className="text-[11px] text-slate-400 mt-1 whitespace-pre-wrap font-sans">
                        {JSON.stringify(evt.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{evt.id}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Software & Security Engine View */}
      {activeTab === 'software' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? 'محرك السوفتوير والحمايات الشامل (Universal Chipset & Security Engine)' : 'Universal Chipset & Security Engine'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'دعم كافة بروتوكولات التفليش وخط الأمان الوقائي Anti-Brick مع السحب التلقائي لأقسام الحماية' : 'Qualcomm Firehose, MTK BROM, Unisoc FDL, Checkm8 & Anti-Brick Pipeline'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSimulateAntiBrickEfsBackup}
              disabled={simulating}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تشغيل خط حماية Anti-Brick & EFS Backup' : 'Run Anti-Brick & EFS Backup'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <Box className="w-4 h-4" />
                <span>{lang === 'ar' ? 'مكتبة الشريحة الموحدة (Universal Chipset Protocols)' : 'Supported Protocol Engines'}</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center justify-between p-2 bg-slate-900/80 rounded border border-slate-800">
                  <span>Qualcomm Firehose XML Direct Bulk Channel</span>
                  <span className="text-emerald-400 font-mono">SAHARA v2.0 READY</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-slate-900/80 rounded border border-slate-800">
                  <span>MediaTek BROM / DA Bypass & Auth Patch</span>
                  <span className="text-emerald-400 font-mono">SLA/DAA BYPASSED</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-slate-900/80 rounded border border-slate-800">
                  <span>Apple Checkm8 DFU & Ramdisk Exploitation</span>
                  <span className="text-cyan-400 font-mono font-semibold">CHECKM8 EXPLOIT READY</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-slate-900/80 rounded border border-slate-800">
                  <span>Samsung Odin PIT & EUB Mode Flasher</span>
                  <span className="text-emerald-400 font-mono">LOKE PROTOCOL SYNC</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === 'ar' ? 'خط الأمان الوقائي (Anti-Brick Protection Pipeline)' : 'Anti-Brick Protection Pipeline'}</span>
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>1. Anti-Rollback (ARB) Protection Index</span>
                    <span className="text-emerald-400">INDEX MATCHED (v4)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Verifies bootloader ARB fuses before writing custom vendor images.</p>
                </div>
                <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>2. Automatic EFS, NVRAM, SEC_EFS Backup</span>
                    <span className="text-cyan-400 font-mono">AUTO-SAVED TO TICKET</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Stores partition dumps directly inside client's maintenance ticket archive.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memory & EEPROM Programmer View */}
      {activeTab === 'programmer' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? 'طبقة برمجة الذواكر والشاشات (eMMC / UFS & EEPROM Layer)' : 'eMMC / UFS & Display EEPROM Programmer'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'التعامل المباشر مع ذواكر BGA ومعايرة بيانات TrueTone والبطارية BMS' : 'Direct BGA LUN Partitioning, RPMB Wiping, JCID/QianLi EEPROM Telemetry'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateUfsHealthScan}
                disabled={simulating}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
              >
                <HardDrive className="w-4 h-4" />
                <span>{lang === 'ar' ? 'فحص صحة الذاكرة UFS' : 'Scan UFS Memory'}</span>
              </button>
              <button
                onClick={handleSimulateTrueToneEeprom}
                disabled={simulating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
              >
                <Sliders className="w-4 h-4" />
                <span>{lang === 'ar' ? 'معايرة TrueTone & BMS' : 'Calibrate TrueTone/BMS'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* UFS / eMMC BGA Direct Storage Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <span>{lang === 'ar' ? 'برمجة ذواكر eMMC / UFS (BGA 153/254/297)' : 'eMMC / UFS BGA Memory Controller'}</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-200">UFS 3.1 Direct LUN Partition Configuration</div>
                    <div className="text-[11px] text-slate-400">LUN0 (BOOT_A) | LUN1 (BOOT_B) | LUN2 (USERDATA)</div>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">HEALTH: 98%</span>
                </div>
                <div className="p-3 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-200">RPMB (Replay Protected Memory Block)</div>
                    <div className="text-[11px] text-slate-400">Clears RPMB key binding for clean SoC swapping</div>
                  </div>
                  <span className="text-cyan-400 font-mono font-bold">RPMB UNLOCKED</span>
                </div>
              </div>
            </div>

            {/* Display TrueTone & Battery BMS EEPROM Sync */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>{lang === 'ar' ? 'معايرة الشاشات والبطاريات (JCID / QianLi)' : 'Display & Battery EEPROM Relocation'}</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-200">TrueTone & Touch IC EEPROM Relocation</div>
                    <div className="text-[11px] text-slate-400">Reads display cover code and writes to new panel</div>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">EEPROM MATCHED</span>
                </div>
                <div className="p-3 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-200">Battery BMS Health Data Recalibration</div>
                    <div className="text-[11px] text-slate-400">Resets cycle count and restores 100% capacity log</div>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">BMS CALIBRATED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Telemetry & Thermal Workbench */}
      {activeTab === 'hardware' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? 'محطة العتاد الذكية (Smart Hardware Station Telemetry)' : 'Smart Hardware Bench IoT Telemetry'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'قراءات مباشرة لمزود الطاقة DC والكاميرا الحرارية والمتر الرقمي' : 'Live Serial USB Power Signature Curves, Thermal Hotspot Pinpointing & Multimeter Data'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSimulatePowerShort}
              disabled={simulating}
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>{lang === 'ar' ? 'محاكاة شورت وتحديد العطل' : 'Trigger DC Power Short'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Power Signature Profiling Curve */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'منحنى سحب التيار (Power Signature Profile)' : 'Live Power Signature Curve'}</span>
                </h4>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  4.2V / 2.85A Short
                </span>
              </div>

              {/* Simulated Oscilloscope Waveform */}
              <div className="h-32 bg-slate-900 border border-slate-800 rounded-lg p-3 relative flex items-end gap-1 overflow-hidden">
                {[20, 25, 22, 95, 98, 92, 88, 94, 96, 91, 85, 30, 25, 20].map((val, idx) => (
                  <div 
                    key={idx}
                    className={`flex-1 transition-all rounded-t ${val > 80 ? 'bg-gradient-to-t from-amber-600 to-red-500' : 'bg-cyan-500'}`}
                    style={{ height: `${val}%` }}
                  />
                ))}
                <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400">
                  VBUS Short Spike Detected (Capacitive Leak C2411)
                </div>
              </div>
            </div>

            {/* Thermal Camera & PCB Hotspot Map */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'التصوير الحراري الذكي (Thermal Camera)' : 'Thermal Rosin Hotspot Map'}</span>
                </h4>
                <span className="text-[11px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  68.4°C Hotspot
                </span>
              </div>

              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-100">Hotspot Component: PMIC PM8350B (U2100)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Boardview Pin: U2100_VBUS_IN (Main power rail short)</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-red-400">68.4°C</div>
                  <span className="text-[10px] text-slate-400">OVER-TEMP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workshop ERP Ticket & Inventory Management */}
      {activeTab === 'ticket' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? 'محرك إدارة مركز الصيانة والمخزن (Workshop ERP Engine)' : 'Workshop ERP Ticket & Smart Inventory'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'التتبع الآلي لرحلة الجهاز وإدارة قطع الغيار التوافقية وإصدار الفواتير' : 'Automated Ticket Lifecycle, WhatsApp Client Notifications & Cross-Compatible ICs'}
                </p>
              </div>
            </div>
            <button
              onClick={() => triggerToast(lang === 'ar' ? 'تم إرسال إشعار WhatsApp للعميل بنجاح!' : 'WhatsApp Client Notification Sent!')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إرسال تحديث للعميل عبر WhatsApp' : 'Send WhatsApp Update'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ticket Card Details */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 md:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <img src={ticket.qrCodeUrl} alt="QR Code" className="w-12 h-12 rounded border bg-white p-0.5" />
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400">{ticket.ticketId}</span>
                    <h4 className="text-sm font-bold text-white">{ticket.clientName}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">{ticket.clientPhone}</span>
                  <div className="text-xs text-emerald-400 font-bold">{ticket.status}</div>
                </div>
              </div>

              {/* Hardware Telemetry Logged to Ticket */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-300">{lang === 'ar' ? 'السجل التلقائي لقراءات الجهاز:' : 'Automated Hardware Logs:'}</h5>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-xs font-mono space-y-1">
                  <div className="text-amber-400">⚡ Power Supply: {ticket.hardwarePowerLogs[0]?.signature}</div>
                  <div className="text-emerald-400">💾 Memory Status: {ticket.memoryHealthStatus}</div>
                  <div className="text-blue-400">📱 EEPROM TrueTone: {ticket.eepromStatus}</div>
                  <div className="text-red-400">🔥 Thermal Camera: {ticket.thermalHotspots[0]?.component} ({ticket.thermalHotspots[0]?.tempCelsius}°C)</div>
                </div>
              </div>

              {/* Used Spare Parts */}
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold text-slate-300">{lang === 'ar' ? 'قطع الغيار المأخوذة من المخزن:' : 'Spare Parts Deducted:'}</h5>
                <div className="space-y-1">
                  {ticket.usedSpareParts.map((part, idx) => (
                    <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-200">{lang === 'ar' ? part.nameAr : part.nameEn} ({part.sku})</span>
                      <span className="text-cyan-400 font-mono font-bold">${part.cost.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Smart Inventory & Compatible IC Search */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'ar' ? 'إدارة المخزن والقطع التوافقية' : 'Smart Inventory & Interchangeable ICs'}</span>
              </h4>

              <div className="space-y-2 text-xs">
                {inventory.map((item) => (
                  <div key={item.sku} className="p-2.5 bg-slate-900 rounded border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{lang === 'ar' ? item.nameAr : item.nameEn}</span>
                      <span className="text-cyan-400 font-mono font-bold">${item.unitPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Stock: <strong className="text-emerald-400">{item.stockQty} Qty</strong></span>
                      <button
                        onClick={() => handleSimulateInventoryDeduction(item.sku)}
                        className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded text-[10px] font-bold transition-all"
                      >
                        {lang === 'ar' ? 'خصم وإضافة للكرت' : 'Deduct & Add'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
