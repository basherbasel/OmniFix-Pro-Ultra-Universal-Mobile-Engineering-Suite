import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  FileText, 
  Package, 
  BarChart3, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Activity,
  Printer,
  QrCode,
  Send,
  MessageSquare,
  Smartphone,
  ShieldCheck,
  Tag,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { RepairTicket, ClientRecord, InventoryItem, BusinessAnalytics, TicketStatus } from '../types';

export function ManagementStudio({ lang }: { lang: 'en' | 'ar' }) {
  const isAr = lang === 'ar';
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'tickets' | 'inventory' | 'clients' | 'label_printer' | 'customer_dispatch'>('analytics');
  
  // Selected ticket for label printing or dispatch
  const [selectedTicketId, setSelectedTicketId] = useState<string>('TCK-2026-001');
  const [dispatchStatus, setDispatchStatus] = useState<string>('ready_pickup');
  const [isDispatched, setIsDispatched] = useState<boolean>(false);

  // Tickets State
  const [tickets, setTickets] = useState<RepairTicket[]>([
    {
      id: 'TCK-2026-001',
      clientId: 'C-001',
      clientName: isAr ? 'أحمد محمد المنصوري' : 'Ahmed Mohamed Al-Mansouri',
      deviceModel: 'Galaxy S26 Ultra (SM-S938B)',
      imei: '358941209384202',
      faultDescription: isAr ? 'شورت مسار VCC_MAIN وشاشة مكسورة' : 'VCC_MAIN Short Circuit & Broken Dynamic AMOLED 2X',
      estimatedCost: 280,
      deposit: 100,
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      createdAt: '2026-09-20 10:30',
      updatedAt: '2026-09-21 14:15',
      technicianName: 'Eng. Basel Tech',
      partsUsed: [{ partId: 'PART-S26U-OLED', name: 'Original AMOLED S26 Ultra', cost: 170 }]
    },
    {
      id: 'TCK-2026-002',
      clientId: 'C-002',
      clientName: isAr ? 'سارة خالد العتيبي' : 'Sara Khaled Al-Otaibi',
      deviceModel: 'iPhone 17 Pro Max',
      imei: '351940192837420',
      faultDescription: isAr ? 'تصفير دورات البطارية وترميم TrueTone وبصمة الوجه' : 'Battery BMS Reset 100% & TrueTone EEPROM Serialization',
      estimatedCost: 195,
      deposit: 80,
      status: 'AWAITING_PARTS',
      priority: 'NORMAL',
      createdAt: '2026-09-19 16:45',
      updatedAt: '2026-09-21 09:00',
      technicianName: 'Apex Agent AI',
      partsUsed: [{ partId: 'PART-IP17PM-BMS', name: 'Original BMS Cell 4422mAh', cost: 65 }]
    },
    {
      id: 'TCK-2026-003',
      clientId: 'C-003',
      clientName: isAr ? 'محمود حسن الشريف' : 'Mahmoud Hassan Al-Sharif',
      deviceModel: 'Xiaomi 15 Ultra',
      imei: '864201940291039',
      faultDescription: isAr ? 'إحياء بعد تفليش خاطئ EDL 9008 وشهادة QA' : 'EDL 9008 Dead Boot Unbrick & 14-Point QA Certificate',
      estimatedCost: 140,
      deposit: 140,
      status: 'COMPLETED',
      priority: 'VIP',
      createdAt: '2026-09-18 11:20',
      updatedAt: '2026-09-21 11:40',
      technicianName: 'Eng. Basel Tech',
      partsUsed: []
    }
  ]);

  // Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 'PART-S26U-OLED',
      name: isAr ? 'شاشة سامسونج S26 ألترا أصلية وكالة' : 'OEM Samsung Galaxy S26 Ultra Dynamic AMOLED 2X',
      category: 'SCREEN',
      stock: 4,
      minStock: 2,
      cost: 170,
      price: 280,
      compatibility: ['Galaxy S26 Ultra']
    },
    {
      id: 'PART-IP17PM-BMS',
      name: isAr ? 'خلايا بطارية آيفون 17 برو ماكس مع شريحة TI BQ' : 'iPhone 17 Pro Max TI BQ27Z561 Battery Cell',
      category: 'BATTERY',
      stock: 12,
      minStock: 5,
      cost: 65,
      price: 130,
      compatibility: ['iPhone 17 Pro Max']
    },
    {
      id: 'PART-PMIC-SM8650',
      name: isAr ? 'أيسي باور رئيسي PM8550 كوالكوم' : 'Qualcomm PM8550 Main Power Management IC',
      category: 'IC',
      stock: 18,
      minStock: 6,
      cost: 14,
      price: 55,
      compatibility: ['Snapdragon 8 Gen 3 / Gen 4 Devices']
    },
    {
      id: 'PART-FLEX-JC-FACED',
      name: isAr ? 'فلكس ترميم بروجيكتور الوجه Face ID بدون لحام' : 'Tag-On Face ID Dot Projector Non-Removal Flex',
      category: 'FLEX',
      stock: 1,
      minStock: 3,
      cost: 12,
      price: 60,
      compatibility: ['iPhone X to 16 Pro Max']
    }
  ]);

  const analytics: BusinessAnalytics = {
    totalRevenue: 18450,
    totalProfit: 9800,
    ticketsCompleted: 184,
    averageRepairTime: 38, // mins
    topFaults: [
      { fault: isAr ? 'شورتات الباور والتسريب الحراري' : 'VCC_MAIN Short & Thermal Isolation', count: 68 },
      { fault: isAr ? 'برمجة التروتون وتصفير البطاريات 100%' : 'TrueTone & BMS 100% Reset', count: 46 },
      { fault: isAr ? 'تخطي حمايات FRP / MDM / KG' : 'FRP / MDM / KG Bypass', count: 42 },
      { fault: isAr ? 'إحياء هواتف البوت الميت EDL 9008' : 'Dead Boot & BROM Unbrick', count: 28 }
    ]
  };

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'AWAITING_PARTS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const handleSendWhatsAppNotification = () => {
    setIsDispatched(true);
    setTimeout(() => {
      setIsDispatched(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Sub-Header Tabs */}
      <div className="flex border-b border-white/5 bg-slate-900/90 backdrop-blur-xl px-4 overflow-x-auto">
        {[
          { id: 'analytics', icon: BarChart3, label: isAr ? 'لوحة أرباح وإحصائيات المحل' : 'Shop Analytics & KPIs' },
          { id: 'tickets', icon: FileText, label: isAr ? 'تذاكر الصيانة الحية' : 'Repair Tickets' },
          { id: 'label_printer', icon: Printer, label: isAr ? 'طباعة استيكر الباركود للجهاز' : 'Thermal Chassis Sticker' },
          { id: 'customer_dispatch', icon: MessageSquare, label: isAr ? 'إشعارات واتساب التلقائية' : 'WhatsApp Auto-Dispatch' },
          { id: 'inventory', icon: Package, label: isAr ? 'مخزن قطع الغيار والأرباح' : 'Spare Parts & Inventory' },
          { id: 'clients', icon: Users, label: isAr ? 'سجل العملاء والولاء' : 'Client CRM' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-4 border-b-2 transition-all text-xs font-bold whitespace-nowrap ${
              activeSubTab === tab.id 
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
        
        {/* Analytics Tab */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: isAr ? 'إجمالي إيرادات الشهر' : 'Monthly Revenue', value: `$${analytics.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: isAr ? 'صافي الأرباح المحققة' : 'Net Shop Profit', value: `$${analytics.totalProfit.toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                { label: isAr ? 'أجهزة تم تسليمها بنجاح' : 'Completed Repairs', value: `${analytics.ticketsCompleted} Units`, icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: isAr ? 'متوسط سرعة الإصلاح' : 'Avg Turnaround Time', value: `${analytics.averageRepairTime} mins`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/90 p-5 rounded-3xl border border-white/5 shadow-xl flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} border border-white/5`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
                    <div className="text-xl font-mono font-black text-white mt-0.5">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Faults & Today Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-slate-900/90 rounded-3xl border border-white/5 shadow-xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-400" />
                    {isAr ? 'أكثر الأعطال دخلاً وطلباً في المحل' : 'Most Profitable & Frequent Repair Operations'}
                  </h3>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    SHOP AI STATS
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  {analytics.topFaults.map((f, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-200">{f.fault}</span>
                        <span className="text-indigo-400 font-mono">{f.count} {isAr ? 'هاتف' : 'devices'}</span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" 
                          style={{ width: `${(f.count / 70) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-3xl border border-white/5 shadow-xl p-6 flex flex-col justify-between gap-4">
                <h3 className="text-base font-black text-white">
                  {isAr ? 'حالة طاولة الصيانة اليوم' : 'Active Workstation Flow'}
                </h3>
                
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                      <span className="text-slate-300">{isAr ? 'قيد الفحص والإصلاح' : 'In Progress'}</span>
                    </div>
                    <span className="font-mono font-bold text-blue-400">3 {isAr ? 'أجهزة' : 'units'}</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="text-slate-300">{isAr ? 'انتظار وصول قطع' : 'Awaiting Parts'}</span>
                    </div>
                    <span className="font-mono font-bold text-amber-400">2 {isAr ? 'أجهزة' : 'units'}</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="text-slate-300">{isAr ? 'جاهزة للاستلام والتسليم' : 'Ready for Pickup'}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">7 {isAr ? 'أجهزة' : 'units'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveSubTab('customer_dispatch')}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                >
                  <MessageSquare size={14} />
                  {isAr ? 'إرسال إشعارات واتساب للزبائن' : 'Open WhatsApp Dispatcher'}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* Tickets Tab */}
        {activeSubTab === 'tickets' && (
          <div className="space-y-4 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-900/90 p-4 rounded-3xl border border-white/5 shadow-xl">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={isAr ? 'بحث عن تذكرة، رقم هاتف الزبون، أو IMEI...' : 'Search ticket ID, client phone, or IMEI...'}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveSubTab('label_printer')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Printer size={14} />
                  {isAr ? 'طباعة لاصق الباركود' : 'Print Sticker'}
                </button>

                <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all">
                  <Plus size={16} />
                  {isAr ? 'استلام جهاز جديد' : 'New Repair Job'}
                </button>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-3xl border border-white/5 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" dir={isAr ? 'rtl' : 'ltr'}>
                  <thead>
                    <tr className="bg-slate-950 border-b border-white/5 text-slate-400">
                      <th className="px-6 py-4 font-mono font-bold">{isAr ? 'رقم التذكرة' : 'Ticket ID'}</th>
                      <th className="px-6 py-4 font-bold">{isAr ? 'العميل والجهاز' : 'Client & Model'}</th>
                      <th className="px-6 py-4 font-bold">{isAr ? 'العطل المسجل' : 'Diagnosed Fault'}</th>
                      <th className="px-6 py-4 font-bold">{isAr ? 'الحالة' : 'Status'}</th>
                      <th className="px-6 py-4 font-bold">{isAr ? 'التكلفة والعربون' : 'Cost / Deposit'}</th>
                      <th className="px-6 py-4 font-bold">{isAr ? 'الفني المسؤول' : 'Technician'}</th>
                      <th className="px-6 py-4 font-bold text-right">{isAr ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-indigo-400">{t.id}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{t.createdAt}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{t.clientName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{t.deviceModel}</div>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-slate-300">
                          {t.faultDescription}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          <div className="font-bold text-emerald-400">${t.estimatedCost}</div>
                          <div className="text-[10px] text-slate-500">Deposit: ${t.deposit}</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-400">
                          {t.technicianName}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => {
                              setSelectedTicketId(t.id);
                              setActiveSubTab('label_printer');
                            }}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl font-bold text-[11px] transition-all"
                          >
                            {isAr ? 'طباعة الاستيكر' : 'Sticker'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Thermal Label Sticker Printer Tab */}
        {activeSubTab === 'label_printer' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Printer size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{isAr ? 'مولد لاصق ظهر الجهاز والباركود الحراري (Chassis Thermal Sticker)' : 'Thermal Sticky Label & Barcode Generator (50x30mm / 60x40mm)'}</h3>
                    <span className="text-xs text-slate-400">Print ready high-contrast thermal labels for phone back glass tracking</span>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                >
                  <Printer size={16} />
                  {isAr ? 'طباعة عبر طابعة الباركود' : 'Send to Label Printer (ESC/POS)'}
                </button>
              </div>

              {/* Printable Thermal Sticker Preview */}
              <div className="flex justify-center p-8 bg-slate-950 rounded-3xl border border-white/5">
                <div className="w-[360px] bg-white text-slate-950 p-6 rounded-2xl shadow-2xl border-2 border-slate-300 flex flex-col gap-3 font-sans">
                  
                  {/* Sticker Header */}
                  <div className="flex items-center justify-between border-b-2 border-slate-950 pb-2">
                    <div>
                      <span className="text-xs font-black tracking-wider uppercase">OMNIFIX PRO LAB</span>
                      <div className="text-[9px] text-slate-600 font-mono">TEL: +966 50 123 4567</div>
                    </div>
                    <span className="text-sm font-black font-mono bg-slate-950 text-white px-2 py-0.5 rounded">
                      {selectedTicket.id}
                    </span>
                  </div>

                  {/* Device & Client Details */}
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-600">Client:</span>
                      <span className="font-black">{selectedTicket.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-600">Device:</span>
                      <span className="font-bold">{selectedTicket.deviceModel}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="font-bold text-slate-600">IMEI:</span>
                      <span>{selectedTicket.imei}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-600">Cost / Dep:</span>
                      <span className="font-black">${selectedTicket.estimatedCost} (Paid ${selectedTicket.deposit})</span>
                    </div>
                  </div>

                  {/* Simulated 2D DataMatrix / QR & 1D Barcode */}
                  <div className="p-2 bg-slate-100 rounded-lg flex items-center justify-between border border-slate-300 mt-1">
                    <div className="flex flex-col gap-0.5">
                      <div className="h-6 w-36 bg-slate-950 flex items-center justify-center text-[8px] text-white font-mono tracking-widest">
                        ||| | |||| || | ||| ||
                      </div>
                      <span className="text-[8px] font-mono text-center text-slate-600">{selectedTicket.id}</span>
                    </div>

                    <div className="w-12 h-12 bg-slate-950 rounded flex items-center justify-center text-white">
                      <QrCode size={36} />
                    </div>
                  </div>

                  <div className="text-[8px] text-slate-500 text-center font-mono pt-1">
                    Track repair status 24/7 by scanning QR Code
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Automated WhatsApp Notification Dispatcher */}
        {activeSubTab === 'customer_dispatch' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{isAr ? 'مرسل رسائل وتحديثات واتساب التلقائية للزبائن' : 'Automated WhatsApp & SMS Customer Notification Engine'}</h3>
                    <span className="text-xs text-slate-400">Trigger instant status updates directly to customer WhatsApp</span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono font-bold rounded-full">
                  WHATSAPP API LINKED
                </span>
              </div>

              {/* Status Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'in_diagnosis', labelAr: '1. قيد الفحص والمطابقة', labelEn: '1. Under Diagnosis' },
                  { id: 'parts_arrived', labelAr: '2. وصلت قطع الغيار الأصلية', labelEn: '2. Parts Arrived & In Rework' },
                  { id: 'ready_pickup', labelAr: '3. تم الإصلاح وجاهز للاستلام', labelEn: '3. Tested & Ready for Pickup' },
                ].map(msg => (
                  <button
                    key={msg.id}
                    onClick={() => setDispatchStatus(msg.id)}
                    className={`p-3.5 rounded-2xl text-xs font-bold border transition-all text-left ${
                      dispatchStatus === msg.id 
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isAr ? msg.labelAr : msg.labelEn}
                  </button>
                ))}
              </div>

              {/* Message Preview Box */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-white/5 flex flex-col gap-2">
                <span className="text-xs text-slate-400 font-mono">{isAr ? 'معاينة رسالة الواتساب للعميل:' : 'Customer WhatsApp Message Preview:'}</span>
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-xs text-emerald-200 leading-relaxed font-sans">
                  {isAr ? (
                    <>
                      عزيزي العميل <strong>{selectedTicket.clientName}</strong>،<br />
                      يسعدنا إعلامك بأن هاتفك (<strong>{selectedTicket.deviceModel}</strong>) - تذكرة رقم [<strong>{selectedTicket.id}</strong>] قد <strong>تم فحصه واختباره بنجاح بجميع معايير الجودة</strong>.<br />
                      المبلغ المتبقي للاستلام: <strong>${selectedTicket.estimatedCost - selectedTicket.deposit}</strong>.<br />
                      يمكنك استلام الجهاز الآن من مركز الصيانة. شكراً لثقتكم بنا!
                    </>
                  ) : (
                    <>
                      Dear <strong>{selectedTicket.clientName}</strong>,<br />
                      We are pleased to inform you that your device (<strong>{selectedTicket.deviceModel}</strong>) - Job ID [<strong>{selectedTicket.id}</strong>] has been <strong>successfully repaired & QA quality-certified</strong>.<br />
                      Remaining balance due: <strong>${selectedTicket.estimatedCost - selectedTicket.deposit}</strong>.<br />
                      Your device is packed and ready for pickup at our repair center. Thank you!
                    </>
                  )}
                </div>
              </div>

              {/* Dispatch Trigger Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSendWhatsAppNotification}
                  disabled={isDispatched}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  <Send size={16} />
                  {isDispatched ? (isAr ? 'تم إرسال الرسالة للزبون بنجاح!' : 'Dispatched to WhatsApp API!') : (isAr ? 'إرسال التنبيه عبر الواتساب فوراً' : 'Dispatch WhatsApp Alert Now')}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeSubTab === 'inventory' && (
          <div className="space-y-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center bg-slate-900/90 p-4 rounded-3xl border border-white/5 shadow-xl">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={isAr ? 'بحث في قطع الغيار والشاشات والأيسيات...' : 'Search parts, screens, ICs, SKU...'}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all">
                <Plus size={16} />
                {isAr ? 'إضافة صنف جديد للمخزن' : 'Add New Part'}
              </button>
            </div>

            <div className="bg-slate-900/90 rounded-3xl border border-white/5 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" dir={isAr ? 'rtl' : 'ltr'}>
                  <thead>
                    <tr className="bg-slate-950 border-b border-white/5 text-slate-400">
                      <th className="px-6 py-4 font-bold">{isAr ? 'اسم القطعة والتوافق' : 'Part Name & Compatibility'}</th>
                      <th className="px-6 py-4 font-mono font-bold">{isAr ? 'معرف القطعة' : 'Part ID'}</th>
                      <th className="px-6 py-4 font-bold">{isAr ? 'الكمية المتوفرة' : 'Stock Qty'}</th>
                      <th className="px-6 py-4 font-bold">{isAr ? 'سعر التكلفة' : 'Cost'}</th>
                      <th className="px-6 py-4 font-bold">{isAr ? 'سعر البيع' : 'Selling Price'}</th>
                      <th className="px-6 py-4 font-bold">{isAr ? 'هامش الربح' : 'Profit Margin'}</th>
                      <th className="px-6 py-4 font-bold text-right">{isAr ? 'التوافق' : 'Compatibility'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {inventory.map((item) => {
                      const isLowStock = item.stock <= item.minStock;
                      const profit = item.price - item.cost;
                      const marginPercent = Math.round((profit / item.price) * 100);

                      return (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-bold text-white">
                            <div>{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{item.category}</div>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-400">{item.id}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full font-mono font-bold text-[11px] ${
                              isLowStock 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {item.stock} {isAr ? 'قطع' : 'pcs'} {isLowStock && (isAr ? '(منخفض!)' : '(LOW)')}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-400">${item.cost}</td>
                          <td className="px-6 py-4 font-mono font-bold text-white">${item.price}</td>
                          <td className="px-6 py-4 font-mono">
                            <span className="text-emerald-400 font-bold">+${profit}</span>
                            <span className="text-[10px] text-slate-500 ml-1">({marginPercent}%)</span>
                          </td>
                          <td className="px-6 py-4 text-right text-slate-400 font-medium">
                            {item.compatibility.join(', ')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Clients CRM Tab */}
        {activeSubTab === 'clients' && (
          <div className="space-y-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: isAr ? 'أحمد محمد المنصوري' : 'Ahmed Mohamed Al-Mansouri', phone: '+966 50 123 4567', totalSpent: 740, repairsCount: 3, vip: true },
                { name: isAr ? 'سارة خالد العتيبي' : 'Sara Khaled Al-Otaibi', phone: '+966 55 987 6543', totalSpent: 395, repairsCount: 2, vip: false },
                { name: isAr ? 'محمود حسن الشريف' : 'Mahmoud Hassan Al-Sharif', phone: '+966 54 444 8888', totalSpent: 920, repairsCount: 5, vip: true },
              ].map((client, idx) => (
                <div key={idx} className="p-5 bg-slate-900/90 rounded-3xl border border-white/5 shadow-xl flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                      {client.name.charAt(0)}
                    </div>
                    {client.vip && (
                      <span className="px-2.5 py-0.5 text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold">
                        VIP CLIENT
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white">{client.name}</h4>
                    <span className="text-xs font-mono text-slate-400">{client.phone}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono border-t border-white/5 pt-3">
                    <span className="text-slate-400">{isAr ? 'عدد العمليات:' : 'Repairs:'} <strong className="text-white">{client.repairsCount}</strong></span>
                    <span className="text-emerald-400 font-bold">${client.totalSpent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
