export interface DiagnosticReportData {
  reportId: string;
  createdAtIso: string;
  technicianName: string;
  shopName: string;
  deviceBrand: string;
  deviceModel: string;
  imeiOrSerial?: string;
  chipset: string;
  operatingSystem: string;
  faultCategory: string;
  diagnosisSummaryAr: string;
  diagnosisSummaryEn: string;
  testedRails?: Array<{
    railName: string;
    measuredDiodeValue: string;
    referenceDiodeValue: string;
    status: 'HEALTHY' | 'SHORT' | 'OPEN' | 'DEGRADED';
  }>;
  recommendedFixesAr: string[];
  recommendedFixesEn: string[];
  sha256VerificationHash: string;
  isForensicCertified?: boolean;
}

export class ReportExporter {
  /**
   * Generates a printable HTML document and triggers browser print
   */
  public static printDiagnosticReport(data: DiagnosticReportData, isAr: boolean = false): void {
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      alert(isAr ? 'تعذر فتح نافذة الطباعة. يرجى السماح بالمطالبات المنبثقة (Popups).' : 'Could not open print window. Please allow popups.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <title>${isAr ? 'تقرير تشخيص صيانة هاتف - MasterFix AI' : 'MasterFix AI Diagnostic & Forensic Report'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
          
          body {
            font-family: ${isAr ? "'Cairo', sans-serif" : "system-ui, -apple-system, sans-serif"};
            background-color: #ffffff;
            color: #0f172a;
            margin: 0;
            padding: 40px;
            font-size: 13px;
            line-height: 1.6;
          }

          .header-table {
            width: 100%;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }

          .title {
            font-size: 22px;
            font-weight: 800;
            color: #1e3a8a;
            margin: 0;
          }

          .subtitle {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
          }

          .section-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }

          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #1e293b;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 6px;
            margin-bottom: 12px;
          }

          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }

          .data-label {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
            display: block;
          }

          .data-value {
            font-size: 13px;
            color: #0f172a;
            font-weight: 700;
          }

          .mono {
            font-family: 'JetBrains Mono', monospace;
          }

          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          table.data-table th, table.data-table td {
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
            text-align: ${isAr ? 'right' : 'left'};
          }

          table.data-table th {
            background-color: #f1f5f9;
            font-size: 11px;
            color: #334155;
          }

          .badge-healthy { color: #16a34a; font-weight: 700; }
          .badge-short { color: #dc2626; font-weight: 700; }
          .badge-degraded { color: #d97706; font-weight: 700; }

          .footer-box {
            margin-top: 40px;
            border-top: 1px dashed #cbd5e1;
            padding-top: 20px;
            font-size: 10px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .signature-space {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
          }

          .signature-line {
            width: 200px;
            border-top: 1px solid #0f172a;
            text-align: center;
            padding-top: 5px;
            font-size: 11px;
            font-weight: 600;
          }

          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td>
              <h1 class="title">${isAr ? '📌 MasterFix AI - تقرير فحص وصيانة هاتف' : '📌 MasterFix AI - Smartphone Diagnostic Report'}</h1>
              <div class="subtitle">${data.shopName} | ${isAr ? 'مختبر الصيانة والتحقيق الهيكلي المعتمد' : 'Certified Engineering & Forensic Laboratory'}</div>
            </td>
            <td style="text-align: ${isAr ? 'left' : 'right'}; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b;">
              <div><strong>REPORT ID:</strong> ${data.reportId}</div>
              <div><strong>DATE:</strong> ${data.createdAtIso.split('T')[0]}</div>
              ${data.isForensicCertified ? `<div style="color: #2563eb; font-weight: bold;">ISO/IEC 27037 CERTIFIED</div>` : ''}
            </td>
          </tr>
        </table>

        <!-- DEVICE & TECHNICIAN METRICS -->
        <div class="section-box">
          <div class="section-title">${isAr ? '📱 بيانات الجهاز والمهندس المسؤول' : '📱 Device & Engineer Metadata'}</div>
          <div class="grid-2">
            <div>
              <span class="data-label">${isAr ? 'الشركة والموديل:' : 'Brand & Model:'}</span>
              <span class="data-value">${data.deviceBrand} ${data.deviceModel}</span>
            </div>
            <div>
              <span class="data-label">${isAr ? 'المعالج والنظام:' : 'Chipset & OS:'}</span>
              <span class="data-value">${data.chipset} (${data.operatingSystem})</span>
            </div>
            <div>
              <span class="data-label">${isAr ? 'فئة العطل المفحوص:' : 'Fault Category:'}</span>
              <span class="data-value">${data.faultCategory}</span>
            </div>
            <div>
              <span class="data-label">${isAr ? 'المهندس المسؤول:' : 'Lead Technician:'}</span>
              <span class="data-value">${data.technicianName}</span>
            </div>
          </div>
        </div>

        <!-- DIAGNOSIS SUMMARY -->
        <div class="section-box">
          <div class="section-title">${isAr ? '🔍 ملخص التشخيص والتحليل الاصطناعي' : '🔍 AI Diagnostic Summary'}</div>
          <p style="font-size: 13px; color: #1e293b; margin: 0;">
            ${isAr ? data.diagnosisSummaryAr : data.diagnosisSummaryEn}
          </p>
        </div>

        <!-- TESTED POWER RAILS & DIODE VALUES -->
        ${data.testedRails && data.testedRails.length > 0 ? `
          <div class="section-box">
            <div class="section-title">${isAr ? '⚡ قياسات الممانعة ومسارات التغذية (Diode Mode Test Points)' : '⚡ Diode Mode Measurements & Power Rails'}</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>${isAr ? 'اسم المسار / القناة' : 'Power Rail Name'}</th>
                  <th>${isAr ? 'القيمة المقاسة' : 'Measured Value'}</th>
                  <th>${isAr ? 'القيمة المرجعية السليمة' : 'Reference Range'}</th>
                  <th>${isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                ${data.testedRails.map(rail => `
                  <tr>
                    <td class="mono"><strong>${rail.railName}</strong></td>
                    <td class="mono">${rail.measuredDiodeValue}</td>
                    <td class="mono">${rail.referenceDiodeValue}</td>
                    <td>
                      <span class="${rail.status === 'HEALTHY' ? 'badge-healthy' : rail.status === 'SHORT' ? 'badge-short' : 'badge-degraded'}">
                        ${rail.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <!-- RECOMMENDED REPAIR STEPS -->
        <div class="section-box">
          <div class="section-title">${isAr ? '🛠️ خطوات الإصلاح الموصى بها هنيسياً' : '🛠️ Recommended Hardware Repair Pipeline'}</div>
          <ol style="margin: 0; padding-right: 20px; padding-left: 20px;">
            ${(isAr ? data.recommendedFixesAr : data.recommendedFixesEn).map(fix => `
              <li style="margin-bottom: 6px; font-weight: 600; color: #334155;">${fix}</li>
            `).join('')}
          </ol>
        </div>

        <!-- SIGNATURES -->
        <div class="signature-space">
          <div class="signature-line">${isAr ? 'توقيع المهندس الفاحص' : 'Technician Signature'}</div>
          <div class="signature-line">${isAr ? 'ختم المعتمد / المركز' : 'Stamp & Approval'}</div>
        </div>

        <!-- FOOTER & SHA256 HASH -->
        <div class="footer-box">
          <div>
            <div><strong>MasterFix Enterprise Core v2.4.0</strong></div>
            <div>SHA-256 Audit Hash: <span class="mono">${data.sha256VerificationHash}</span></div>
          </div>
          <div>Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
