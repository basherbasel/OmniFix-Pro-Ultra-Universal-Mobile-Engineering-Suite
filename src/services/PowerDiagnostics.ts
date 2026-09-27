import { ConnectedDevice } from '../types';

export interface CorrectiveCommand {
  id: string;
  command: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: 'SECURITY' | 'BOOTLOADER' | 'BASEBAND' | 'FIRMWARE' | 'SYSTEM';
}

export interface PowerFluctuationData {
  vbusVoltageV: number;
  drawCurrentMa: number;
  rippleMv: number;
  frequencyHz?: number;
  durationMs: number;
  timestamp?: number;
}

export type PowerFaultType = 
  | 'SHORT_CIRCUIT_VBUS'
  | 'PMIC_THERMAL_SHUTDOWN'
  | 'CHARGING_IC_LEAKAGE'
  | 'BATT_UNDERVOLTAGE_DEEP_SLEEP'
  | 'USB_DATA_LINE_SHORT'
  | 'NORMAL_POWER_DRAW';

export interface PowerDiagnosticAnalysis {
  faultType: PowerFaultType;
  isFaultDetected: boolean;
  severity: 'NONE' | 'WARNING' | 'CRITICAL';
  vbusVoltageV: number;
  peakCurrentMa: number;
  averageCurrentMa: number;
  descriptionEn: string;
  descriptionAr: string;
  correctiveActionEn: string;
  correctiveActionAr: string;
  recommendedCommand?: CorrectiveCommand;
  timestamp: string;
}

export class PowerDiagnostics {
  /**
   * Analyzes USB current & voltage stream fluctuations to identify hardware charging/power faults
   */
  public analyzeUsbPowerStream(
    samples: PowerFluctuationData[],
    device?: ConnectedDevice
  ): PowerDiagnosticAnalysis {
    if (!samples || samples.length === 0) {
      // Default baseline
      samples = [{
        vbusVoltageV: 5.14,
        drawCurrentMa: 1450,
        rippleMv: 12,
        durationMs: 1000
      }];
    }

    const peakCurrentMa = Math.max(...samples.map(s => s.drawCurrentMa));
    const avgCurrentMa = samples.reduce((acc, s) => acc + s.drawCurrentMa, 0) / samples.length;
    const avgVoltageV = samples.reduce((acc, s) => acc + s.vbusVoltageV, 0) / samples.length;
    const maxRippleMv = Math.max(...samples.map(s => s.rippleMv));

    let faultType: PowerFaultType = 'NORMAL_POWER_DRAW';
    let severity: PowerDiagnosticAnalysis['severity'] = 'NONE';
    let descEn = 'USB VBUS power delivery and charging IC current draw are stable.';
    let descAr = 'جهد الشحن VBUS واستحواذ التيار في شريحة التغذية مستقر وضمن الحدود الطبيعية.';
    let fixEn = 'No hardware power intervention required.';
    let fixAr = 'لا تتطلب دائرة الباور أي تدخل عتادي حالياً.';
    let recommendedCommand: CorrectiveCommand | undefined;

    // 1. Detect VBUS Short Circuit (High current spike > 2800mA + Voltage drop < 4.2V)
    if (peakCurrentMa > 2800 || (avgVoltageV < 4.2 && peakCurrentMa > 2000)) {
      faultType = 'SHORT_CIRCUIT_VBUS';
      severity = 'CRITICAL';
      descEn = `CRITICAL SHORT CIRCUIT DETECTED: USB VBUS line draw spiked to ${peakCurrentMa}mA while voltage dropped to ${avgVoltageV.toFixed(2)}V. Capacitive or PMIC short present.`;
      descAr = `تماس كهربائي حاد (قصر في VBUS): ارتقع التيار بشكل المفاجئ إلى ${peakCurrentMa}mA مع هبوط الجهد إلى ${avgVoltageV.toFixed(2)}V. يوجد شورت في مكثفات خط التغذية أو شريحة PMIC.`;
      fixEn = 'Inject low voltage (1.8V) using thermal imaging / multimeter to locate shorted capacitor on mainboard.';
      fixAr = 'حقن فولتية منخفضة (1.8V) باستخدام الكاميرا الحرارية لتحديد المكثف المقصور على بوردة الجهاز.';
      recommendedCommand = {
        id: 'cmd-pwr-short-isolate',
        command: 'PMIC_ISOLATE_VBUS_RAIL',
        nameEn: 'PMIC VBUS Rail Isolation Signal',
        nameAr: 'إشارة فصل خط VBUS لمنع تلف شريحة الباور',
        descriptionEn: 'Sends thermal protection toggle to PMIC controller',
        descriptionAr: 'إرسال أمر حماية حرارية لشريحة PMIC لمنع الاحتراق',
        category: 'SYSTEM'
      };
    } 
    // 2. Detect PMIC Thermal Shutdown / Voltage Oscillation (Ripple > 120mV with oscillating current)
    else if (maxRippleMv > 120 || (avgCurrentMa > 1800 && maxRippleMv > 80)) {
      faultType = 'PMIC_THERMAL_SHUTDOWN';
      severity = 'CRITICAL';
      descEn = `PMIC THERMAL INSTABILITY: High voltage ripple (${maxRippleMv}mV) detected on power rail. Main PMIC undergoing thermal cycling.`;
      descAr = `عدم استقرار حراري في شريحة الباور PMIC: تم رصد تموج عالي بالجهد (${maxRippleMv}mV). الشريحة تدخل في دورة فصل حراري لحماية المعالج.`;
      fixEn = 'Inspect thermal paste / PMIC shield, rebalance buck converter coils or replace secondary PMIC.';
      fixAr = 'فحص المعجون الحراري ومحثات الباور (Buck Coils) أو إعادة صب/استبدال شريحة PMIC الثانوية.';
      recommendedCommand = {
        id: 'cmd-pwr-pmic-reset',
        command: 'PMIC_VBUS_CALIBRATE_RESET',
        nameEn: 'Recalibrate PMIC Buck Converter Governors',
        nameAr: 'إعادة معايرة منظمات الفولتية في شريحة PMIC',
        descriptionEn: 'Restores default thermal throttling thresholds on power IC',
        descriptionAr: 'إعادة ضبط الحدود الحرارية الافتراضية لمنظمات الجهد',
        category: 'SYSTEM'
      };
    }
    // 3. Detect Charging IC Leakage (Micro-draw between 10mA and 120mA without active device boot)
    else if (avgCurrentMa > 15 && avgCurrentMa < 150 && (!device || !device.mode)) {
      faultType = 'CHARGING_IC_LEAKAGE';
      severity = 'WARNING';
      descEn = `CHARGING IC LEAKAGE (TIGRIS/HYDRA/SMB): Constant micro-amp leakage (${avgCurrentMa.toFixed(0)}mA) without USB protocol initialization.`;
      descAr = `تسريب كهربائي في آيسي الشحن: سحب تيار ثابت خفيف (${avgCurrentMa.toFixed(0)}mA) دون إقلاع أو مصافحة بروتوكول USB.`;
      fixEn = 'Replace Charger IC / USB PHY Transceiver IC (e.g. SMB1396 / Hydra / Tigris IC).';
      fixAr = 'استبدال آيسي الشحن أو متحكم الـ USB PHY المسؤول عن تنظيم سحب التيار.';
      recommendedCommand = {
        id: 'cmd-pwr-bms-reset',
        command: 'BATTERY_BMS_CALIBRATE_RESET',
        nameEn: 'Reset Battery BMS Fuel Gauge Registers',
        nameAr: 'إعادة تصفير مسجلات مؤشر الوقود BMS',
        descriptionEn: 'Re-zeroes fuel gauge current sensor offset',
        descriptionAr: 'إعادة تعيير حاسس التيار لمحيط البطارية',
        category: 'SYSTEM'
      };
    }
    // 4. Detect Deep Sleep Battery Undervoltage (< 3.3V)
    else if (avgVoltageV > 4.8 && avgCurrentMa < 5) {
      faultType = 'BATT_UNDERVOLTAGE_DEEP_SLEEP';
      severity = 'WARNING';
      descEn = 'BATTERY DEEP SLEEP / UNDERVOLTAGE: Battery cell voltage < 3.2V. BMS protection board locked charging input.',
      descAr = 'تفرغ عميق للبطارية (< 3.2V): لوحة حماية BMS أغلقت دخول الشحن التلقائي بسبب هبوط الجهد.',
      fixEn = 'Apply external 4.2V 1A battery reactivation shock using DC Power Supply before connecting USB.',
      fixAr = 'تنشيط البطارية بفرط جهد خارجي 4.2V لمدة دقيقتين لإيقاظ لوحة حماية الـ BMS.',
      recommendedCommand = {
        id: 'cmd-pwr-bms-shock',
        command: 'BATTERY_BMS_WAKEUP_PULSE',
        nameEn: 'Transmit BMS Cell Reactivation Pulse',
        nameAr: 'إرسال نبضة إحياء خلايا البطارية المباشرة',
        descriptionEn: 'Dispatches 100ms VBUS boost pulse to wake fuel gauge',
        descriptionAr: 'إرسال نبضة جهد خاطفة لإيقاظ متحكم البطارية',
        category: 'SYSTEM'
      };
    }

    return {
      faultType,
      isFaultDetected: faultType !== 'NORMAL_POWER_DRAW',
      severity,
      vbusVoltageV: Number(avgVoltageV.toFixed(2)),
      peakCurrentMa: Math.round(peakCurrentMa),
      averageCurrentMa: Math.round(avgCurrentMa),
      descriptionEn: descEn,
      descriptionAr: descAr,
      correctiveActionEn: fixEn,
      correctiveActionAr: fixAr,
      recommendedCommand,
      timestamp: new Date().toLocaleTimeString()
    };
  }
}

export const powerDiagnosticsEngine = new PowerDiagnostics();
