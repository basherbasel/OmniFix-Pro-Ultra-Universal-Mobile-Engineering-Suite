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

function escapeHtml(raw: string): string {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export class ReportExporter {
  public static buildHtmlDocument(data: DiagnosticReportData, isAr: boolean = false): string {
    return `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <title>${isAr ? 'تقرير تشخيص صيانة هاتف - OmniFix Pro' : 'OmniFix Pro Diagnostic & Forensic Report'}</title>
  <style>
    body {
      font-family: ${isAr ? "'Cairo', 'Segoe UI', Tahoma, sans-serif" : "system-ui, -apple-system, 'Segoe UI', sans-serif"};
      background-color: #ffffff;
      color: #0f172a;
      margin: 0;
      padding: 36px;
      font-size: 13px;
      line-height: 1.6;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 18px;
      margin-bottom: 22px;
      border-collapse: collapse;
    }
    .title {
      font-size: 21px;
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
      margin-bottom: 18px;
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
      gap: 14px;
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
      font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
      font-variant-numeric: tabular-nums;
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
      margin-top: 32px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 16px;
      font-size: 10px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .signature-space {
      margin-top: 28px;
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
      body { padding: 16px; }
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td>
        <h1 class="title">${isAr ? 'OmniFix Pro — تقرير فحص وصيانة هاتف معتمد' : 'OmniFix Pro — Smartphone Diagnostic Report'}</h1>
        <div class="subtitle">${escapeHtml(data.shopName)} | ${isAr ? 'مختبر الصيانة والتحقيق الهندسي المعتمد' : 'Certified Engineering & Forensic Laboratory'}</div>
      </td>
      <td style="text-align: ${isAr ? 'left' : 'right'}; font-family: ui-monospace, monospace; font-size: 11px; color: #64748b;">
        <div><strong>REPORT ID:</strong> ${escapeHtml(data.reportId)}</div>
        <div><strong>DATE:</strong> ${escapeHtml(data.createdAtIso.split('T')[0])}</div>
        ${data.isForensicCertified ? `<div style="color: #2563eb; font-weight: bold;">ISO/IEC 27037 VERIFIED</div>` : ''}
      </td>
    </tr>
  </table>

  <div class="section-box">
    <div class="section-title">${isAr ? 'بيانات الجهاز والمهندس المسؤول' : 'Device & Engineer Metadata'}</div>
    <div class="grid-2">
      <div>
        <span class="data-label">${isAr ? 'الشركة والموديل:' : 'Brand & Model:'}</span>
        <span class="data-value">${escapeHtml(data.deviceBrand)} ${escapeHtml(data.deviceModel)}</span>
      </div>
      <div>
        <span class="data-label">${isAr ? 'المعالج والنظام:' : 'Chipset & OS:'}</span>
        <span class="data-value">${escapeHtml(data.chipset)} (${escapeHtml(data.operatingSystem)})</span>
      </div>
      <div>
        <span class="data-label">${isAr ? 'فئة العطل المفحوص:' : 'Fault Category:'}</span>
        <span class="data-value">${escapeHtml(data.faultCategory)}</span>
      </div>
      <div>
        <span class="data-label">${isAr ? 'المهندس المسؤول:' : 'Lead Technician:'}</span>
        <span class="data-value">${escapeHtml(data.technicianName)}</span>
      </div>
      ${data.imeiOrSerial ? `<div>
        <span class="data-label">IMEI / Serial:</span>
        <span class="data-value mono">${escapeHtml(data.imeiOrSerial)}</span>
      </div>` : ''}
    </div>
  </div>

  <div class="section-box">
    <div class="section-title">${isAr ? 'ملخص التشخيص الهندسي' : 'Engineering Diagnostic Summary'}</div>
    <p style="font-size: 13px; color: #1e293b; margin: 0;">
      ${escapeHtml(isAr ? data.diagnosisSummaryAr : data.diagnosisSummaryEn)}
    </p>
  </div>

  ${data.testedRails && data.testedRails.length > 0 ? `
    <div class="section-box">
      <div class="section-title">${isAr ? 'قياسات الممانعة ومسارات التغذية (Diode Mode)' : 'Diode Mode Measurements & Power Rails'}</div>
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
              <td class="mono"><strong>${escapeHtml(rail.railName)}</strong></td>
              <td class="mono">${escapeHtml(rail.measuredDiodeValue)}</td>
              <td class="mono">${escapeHtml(rail.referenceDiodeValue)}</td>
              <td>
                <span class="${rail.status === 'HEALTHY' ? 'badge-healthy' : rail.status === 'SHORT' ? 'badge-short' : 'badge-degraded'}">
                  ${escapeHtml(rail.status)}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : ''}

  <div class="section-box">
    <div class="section-title">${isAr ? 'خطوات الإصلاح الموصى بها هندسياً' : 'Recommended Hardware Repair Pipeline'}</div>
    <ol style="margin: 0; padding-right: 20px; padding-left: 20px;">
      ${(isAr ? data.recommendedFixesAr : data.recommendedFixesEn).map(fix => `
        <li style="margin-bottom: 6px; font-weight: 600; color: #334155;">${escapeHtml(fix)}</li>
      `).join('')}
    </ol>
  </div>

  <div class="signature-space">
    <div class="signature-line">${isAr ? 'توقيع المهندس الفاحص' : 'Technician Signature'}</div>
    <div class="signature-line">${isAr ? 'الختم المعتمد / المركز' : 'Lab Stamp & Approval'}</div>
  </div>

  <div class="footer-box">
    <div>
      <div><strong>OmniFix Pro Workstation</strong></div>
      <div>SHA-256 Audit Hash: <span class="mono">${escapeHtml(data.sha256VerificationHash)}</span></div>
    </div>
    <div>Page 1 of 1</div>
  </div>
</body>
</html>`;
  }

  /**
   * Triggers download of an HTML diagnostic report directly in the browser (works inside any iframe)
   */
  public static downloadHtmlReport(data: DiagnosticReportData, isAr: boolean = false): void {
    const htmlContent = ReportExporter.buildHtmlDocument(data, isAr);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.reportId || 'diagnostic-report'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Generates a printable HTML document inside an isolated hidden iframe (zero window.open / alert)
   * and falls back to HTML file download if browser print is restricted.
   */
  public static printDiagnosticReport(data: DiagnosticReportData, isAr: boolean = false): void {
    if (typeof document === 'undefined') return;
    const htmlContent = ReportExporter.buildHtmlDocument(data, isAr);

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      iframe.setAttribute('aria-hidden', 'true');
      iframe.srcdoc = htmlContent;

      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          ReportExporter.downloadHtmlReport(data, isAr);
        } finally {
          setTimeout(() => {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
          }, 2500);
        }
      };

      document.body.appendChild(iframe);
    } catch {
      ReportExporter.downloadHtmlReport(data, isAr);
    }
  }
}
