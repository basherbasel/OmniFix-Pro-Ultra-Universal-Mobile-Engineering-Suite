export interface RepairStep {
  id: string;
  symptom: string;
  commands: string[];
  reliability: number; // 0.0 - 1.0
  safetyWarning: string;
}

export const EXPERT_SOLUTION_LIBRARY: Record<string, RepairStep[]> = {
  'bootloop': [
    {
      id: 'bootloop-dm-verity',
      symptom: 'dm-verity / AVB 2.0 corruption',
      commands: ['fastboot --disable-verity --disable-verification flash vbmeta vbmeta.img', 'fastboot reboot'],
      reliability: 0.99,
      safetyWarning: 'Matches vbmeta to device binary version only'
    },
    {
      id: 'bootloop-cache-wipe',
      symptom: 'system_server crashing',
      commands: ['fastboot erase cache', 'fastboot erase metadata', 'fastboot reboot'],
      reliability: 0.95,
      safetyWarning: 'Data loss in /cache and /metadata'
    }
  ],
  'frp': [
    {
      id: 'frp-adb-bypass',
      symptom: 'FRP lock active',
      commands: ['adb shell pm uninstall -k --user 0 com.google.android.gms', 'adb reboot'],
      reliability: 0.9,
      safetyWarning: 'Requires USB Debugging to be enabled'
    },
    {
      id: 'frp-edl-reset',
      symptom: 'FRP lock active (EDL mode)',
      commands: ['edl-tool --wipe-partition config', 'edl-tool --wipe-partition frp'],
      reliability: 0.95,
      safetyWarning: 'May lock device temporarily if Knox is active'
    }
  ],
  'network': [
    {
      id: 'network-nvram-restore',
      symptom: 'Unknown Baseband / No SIM',
      commands: ['mtk-client --restore-nvram nvram.bin', 'fastboot reboot'],
      reliability: 0.85,
      safetyWarning: 'Only restore valid NVRAM dumps matching the IMEI'
    }
  ],
  'hard-brick': [
    {
      id: 'hard-brick-edl',
      symptom: 'Device dead (EDL 9008)',
      commands: ['edl-tool --loader prog_firehose.elf --xml rawprogram0.xml', 'fastboot reboot'],
      reliability: 0.92,
      safetyWarning: 'Strictly match loader ELF with device SoC ID'
    }
  ]
};
