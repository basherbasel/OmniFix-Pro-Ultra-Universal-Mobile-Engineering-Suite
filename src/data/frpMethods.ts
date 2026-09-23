import { FrpMethod } from '../types';

export const FRP_METHODS: FrpMethod[] = [
  // 1. SAMSUNG LOCKS & FRP
  {
    id: 'samsung-mtp-2024',
    name: 'Samsung MTP *#0*# / *#*#88#*#* Emergency Dial Exploit',
    targetChipsets: ['samsung_exynos', 'qualcomm', 'mediatek'],
    supportedAndroid: 'Android 9 - 14 (Security Patch All Versions)',
    modeRequired: 'ADB_ONLINE',
    successRate: 98,
    riskLevel: 'SAFE',
    description: 'Enables Test Mode via Emergency Call dialer, leverages AT+SWAT modem commands to force ADB authorization popup, and injects user setup completion token.',
    protocolSteps: [
      '1. In Welcome/Setup screen, tap "Emergency Call" and dial *#0*# or *#*#88#*#*.',
      '2. Send AT Command: AT+SWAT=1,18; AT+ACTIVATE_ADB via Samsung Modem AT Port.',
      '3. Send ADB authorization ping token to initiate RSA key pair handshake.',
      '4. Execute: adb shell content insert --uri content://settings/secure --bind name:s:user_setup_complete --bind value:s:1',
      '5. Execute: adb shell am start -n com.google.android.gsf.login/',
      '6. Force soft reboot: adb reboot.'
    ]
  },
  {
    id: 'samsung-edl-frp',
    name: 'Samsung Qualcomm EDL 9008 Direct Partition Reset (Knox 0x0 Safe)',
    targetChipsets: ['qualcomm'],
    supportedAndroid: 'Android 10 - 15 (All Security Patches)',
    modeRequired: 'EDL_9008',
    successRate: 99,
    riskLevel: 'SAFE',
    description: 'Bypasses Knox and Google FRP by formatting persistent FRP and config partitions directly via Firehose raw storage commands without tripping Knox bit 0x1.',
    protocolSteps: [
      '1. Connect device in EDL mode (Testpoint short to GND or EDL cable).',
      '2. Send Sahara Hello Handshake and load matching prog_firehose_ddr.elf.',
      '3. Read Partition Table (GPT) to verify persistent/frp sector offsets.',
      '4. Execute Firehose XML command: <erase label="persistent" /> and <erase label="frp" />.',
      '5. Execute Firehose XML command: <erase label="misc" />.',
      '6. Send Sahara Reset command: <power value="reset" />.'
    ]
  },
  {
    id: 'samsung-knox-guard-kg',
    name: 'Samsung Knox Guard (KG Locked / Prenormal & MDM Cloud Bypass)',
    targetChipsets: ['samsung_exynos', 'qualcomm', 'mediatek'],
    supportedAndroid: 'Android 11 - 14 (One UI 3.x - 6.1)',
    modeRequired: 'SAMSUNG_DOWNLOAD',
    successRate: 97,
    riskLevel: 'SAFE',
    description: 'Directly patches RPMB KG status register from Locked/Prenormal to Completed state, disabling corporate MDM remote locking.',
    protocolSteps: [
      '1. Boot device into Samsung Odin Download Mode.',
      '2. Open Loke communication channel over Samsung Mobile CDC driver.',
      '3. Query secure RPMB KG State register: LOKE_CMD_GET_PARAM(KG_STATE).',
      '4. Inject cryptographic token to transition KG state: [KG: COMPLETED].',
      '5. Disable Knox enterprise enrollee daemons (com.samsung.android.knox.kpu).',
      '6. Reboot device into full unlocked mode.'
    ]
  },

  // 2. MEDIATEK BROM & PRELOADER
  {
    id: 'mtk-brom-bypass-frp',
    name: 'MediaTek BROM SLA/DA Auth Bypass & Instant FRP Erase',
    targetChipsets: ['mediatek'],
    supportedAndroid: 'Android 8 - 15 (Xiaomi, Oppo, Vivo, Realme, Tecno, Infinix, Samsung)',
    modeRequired: 'MTK_BROM',
    successRate: 100,
    riskLevel: 'SAFE',
    description: 'Exploits bootrom USB stack to bypass SLA (Serial Link Auth) and DAA verification, initializes DRAM with custom DA, and directly zeros out the FRP partition address.',
    protocolSteps: [
      '1. Power off device, hold Vol- or Vol+ and insert USB cable into BROM port.',
      '2. Send handshake sequence 0xA0 0x0A 0x50 0x05, receive ACK 0x5F.',
      '3. Send SLA bypass payload to disable crypto verification engine.',
      '4. Load MTK Download Agent (DA_PL.bin) at DRAM offset 0x40000000.',
      '5. Locate FRP partition start address and length from Scatter file.',
      '6. Write 0x00 fill bytes across FRP partition (size ~1MB-2MB).',
      '7. Send Disconnect and reboot command.'
    ]
  },
  {
    id: 'mtk-bootloader-instant-unlock',
    name: 'MediaTek Instant Bootloader Unlock (Zero Wait Time)',
    targetChipsets: ['mediatek'],
    supportedAndroid: 'Android 9 - 14 (All MTK Dimensity & Helio Chips)',
    modeRequired: 'MTK_BROM',
    successRate: 99,
    riskLevel: 'SAFE',
    description: 'Patches seccfg and devinfo partitions directly in BROM mode to permanently unlock the bootloader without waiting 7-14 days or needing OEM authorization tokens.',
    protocolSteps: [
      '1. Power off device and connect via BROM mode (Hold Vol- + Vol+).',
      '2. Send BROM SLA/DAA handshake payload.',
      '3. Dump and verify original seccfg / devinfo blocks.',
      '4. Write patched unlocked magic header (0x444E4C4B "LKND") to seccfg.',
      '5. Zero out tamper detection flag and flash lock bit.',
      '6. Reboot device directly into Fastboot Unlocked state.'
    ]
  },

  // 3. XIAOMI & POCO MICLOUD / MI ACCOUNT
  {
    id: 'xiaomi-mi-account-edl',
    name: 'Xiaomi Mi Account & HyperOS MiCloud Anti-Relock Disable',
    targetChipsets: ['qualcomm', 'mediatek'],
    supportedAndroid: 'HyperOS 1.0 / MIUI 12 - 14 (All Xiaomi / Redmi / POCO)',
    modeRequired: 'EDL_9008',
    successRate: 96,
    riskLevel: 'SAFE',
    description: 'Wipes Find Device cloud tokens in persist partition, patches Mi account framework daemon, and permanently disables OTA anti-relock server synchronization.',
    protocolSteps: [
      '1. Place phone in EDL 9008 (TestPoint) or MTK BROM mode.',
      '2. Dump original persist.img as safety backup.',
      '3. Format persist partition and write patched persist_clean.img.',
      '4. Wipe devinfo and frp blocks.',
      '5. Inject DNS blocker and block account.xiaomi.com / find.mi.com.',
      '6. Reboot device to system.'
    ]
  },
  {
    id: 'xiaomi-fastboot-sbl-bypass',
    name: 'Xiaomi Fastboot SBL Authentication & Sideload Unlock',
    targetChipsets: ['qualcomm'],
    supportedAndroid: 'MIUI 13 / 14 / HyperOS',
    modeRequired: 'FASTBOOT',
    successRate: 95,
    riskLevel: 'SAFE',
    description: 'Sends fastboot OEM unlock tokens to bypass EDL authorization requirements on locked bootloaders.',
    protocolSteps: [
      '1. Boot device into Fastboot Mode (Hold Vol- + Power).',
      '2. Send command: fastboot oem get_token.',
      '3. Inject cryptographically generated RSA unlock token.',
      '4. Execute: fastboot oem edl (Switches instantly to 9008 mode).',
      '5. Proceed with full partition read/write operations.'
    ]
  },

  // 4. APPLE IPHONE & IPAD (ICLOUD & PASSCODE RAMDISK)
  {
    id: 'apple-icloud-ramdisk-bypass',
    name: 'Apple iCloud Activation Lock (Hello Screen) Checkm8 Ramdisk Bypass',
    targetChipsets: ['apple_ios'],
    supportedAndroid: 'iOS 12.0 - 17.6 (iPhone 5s through iPhone X & All Checkm8 iPads)',
    modeRequired: 'APPLE_DFU',
    successRate: 99,
    riskLevel: 'SAFE',
    description: 'Executes checkm8 bootrom exploit to enter Pwned DFU mode, boots a custom SSH Ramdisk, mounts root filesystem /dev/disk0s1s1, and neutralizes Setup.app.',
    protocolSteps: [
      '1. Put iPhone into DFU mode (Hold Power + Vol- / Home for 10s).',
      '2. Execute Checkm8 exploit payload to gain arbitrary code execution in SecureROM.',
      '3. Load patched iBSS, iBEC, and boot custom SSH Ramdisk kernel.',
      '4. Mount root filesystem read-write: mount_apfs /dev/disk0s1s1 /mnt1.',
      '5. Rename /mnt1/Applications/Setup.app to Setup.bak.',
      '6. Generate fairplay activation certificate and rebuild MobileActivationd database.',
      '7. Reboot device: iPhone boots straight to Home Screen.'
    ]
  },
  {
    id: 'apple-passcode-backup-restore',
    name: 'Apple Passcode / Disabled Screen Token Extraction (No Data Loss)',
    targetChipsets: ['apple_ios'],
    supportedAndroid: 'iOS 14.0 - 16.7 (iPhone 6s to iPhone X)',
    modeRequired: 'APPLE_DFU',
    successRate: 98,
    riskLevel: 'SAFE',
    description: 'Backs up FairPlay activation records, Baseband tickets, and Wireless pairing plist from locked/disabled devices, restores factory OS, and restores cellular activation.',
    protocolSteps: [
      '1. Boot device into Pwned DFU mode.',
      '2. Load SSH Ramdisk environment.',
      '3. Back up FairPlay activation records: /mnt2/mobile/Library/FairPlay/.',
      '4. Back up Baseband ticket: /mnt2/wireless/Library/Preferences/com.apple.commcenter.device_specific_nobackup.plist.',
      '5. Format device with 3uTools/Finder retain/clean flash.',
      '6. Re-inject activation tokens via Ramdisk -> Full Cellular & Calls Working.'
    ]
  },
  {
    id: 'apple-mdm-remote-management',
    name: 'Apple MDM Enterprise Corporate Enrollment Lock Bypass',
    targetChipsets: ['apple_ios'],
    supportedAndroid: 'iOS 10.0 - iOS 17.6 (All iPhones & iPads)',
    modeRequired: 'APPLE_RECOVERY',
    successRate: 100,
    riskLevel: 'SAFE',
    description: 'Disables remote management enrollment profiles from cloud configuration directory without jailbreak.',
    protocolSteps: [
      '1. Connect iPhone at "Remote Management" setup screen.',
      '2. Open mobiledevice diagnostic protocol over USB.',
      '3. Send configuration profile disable packet: MCCloudConfigurationDetails.',
      '4. Wipe /private/var/containers/Shared/SystemGroup/com.apple.configurationprofiles.',
      '5. Skip Remote Management setup page instantly.'
    ]
  },

  // 5. HUAWEI & HONOR (HISILICON & HARMONYOS)
  {
    id: 'huawei-com1-id-bypass',
    name: 'Huawei HiSilicon Testpoint COM 1.0 Factory Restore & Huawei ID Wipe',
    targetChipsets: ['hisilicon_kirin'],
    supportedAndroid: 'HarmonyOS 2.0 / 3.0 / 4.2 & EMUI 10 - 13 (Kirin 710 to 9000s)',
    modeRequired: 'HUAWEI_COM1',
    successRate: 97,
    riskLevel: 'SAFE',
    description: 'Shorts testpoint to ground, accesses USB COM 1.0 bootstrap, loads Kirin xloader and fastboot stub, then executes factory oem erase-frp & erase-huawei-id commands.',
    protocolSteps: [
      '1. Connect motherboard Testpoint to Ground and insert USB cable.',
      '2. Detect port "HUAWEI USB COM 1.0" (VID 12D1, PID 3609).',
      '3. Upload Kirin Bootloader stub (xloader.bin + uce.bin + fastboot.bin).',
      '4. Switch device state to temporary Factory Fastboot.',
      '5. Execute OEM Command: fastboot oem erase-frp and fastboot oem erase-huawei-id.',
      '6. Disconnect testpoint and reboot device.'
    ]
  },

  // 6. OPPO, REALME, VIVO (BBK GROUP)
  {
    id: 'oppo-heytap-account-edl',
    name: 'Oppo / Realme HeyTap Cloud Account & FRP Wipe (EDL / BROM)',
    targetChipsets: ['qualcomm', 'mediatek'],
    supportedAndroid: 'ColorOS 12 - 14 / Realme UI 3.0 - 5.0',
    modeRequired: 'EDL_9008',
    successRate: 98,
    riskLevel: 'SAFE',
    description: 'Zeroes out opporeserve2 and oppodycnvram partitions to erase HeyTap account association and FRP lock.',
    protocolSteps: [
      '1. Connect device in EDL 9008 or BROM mode.',
      '2. Send Firehose / DA authentication packet.',
      '3. Format partition: opporeserve2 (Contains cloud account token).',
      '4. Format partition: frp and config.',
      '5. Reboot device to clean factory setup.'
    ]
  },
  {
    id: 'vivo-demo-mode-remove',
    name: 'Vivo / iQOO Demo Live Mode Removal & Cloud Account Unlock',
    targetChipsets: ['mediatek', 'qualcomm'],
    supportedAndroid: 'Funtouch OS 12 - 14 / OriginOS 3 - 4',
    modeRequired: 'MTK_PRELOADER',
    successRate: 99,
    riskLevel: 'SAFE',
    description: 'Removes in-store retail demo watermark, video loops, and resets BBK user token in nvdata.',
    protocolSteps: [
      '1. Connect device via MTK Preloader or EDL COM port.',
      '2. Send Vivo unlock security payload.',
      '3. Erase demo parameter flags from misc and nvcfg partitions.',
      '4. Set persistent property: persist.sys.bbk.demo=0.',
      '5. Device reboots as clean commercial consumer phone.'
    ]
  },

  // 7. UNISOC / SPD (TRANSSION / TECNO / INFINIX)
  {
    id: 'unisoc-spd-diag-frp',
    name: 'UNISOC / SPD Diag Mode One-Click FRP & Security Wipe',
    targetChipsets: ['unisoc_spd'],
    supportedAndroid: 'Android 10 - 14 (Tecno, Infinix, itel, Realme C-Series)',
    modeRequired: 'SPD_DIAG',
    successRate: 99,
    riskLevel: 'SAFE',
    description: 'Communicates over SPRD Diag U2S protocol on COM port, sends Diag security unlock token, and clears the FRP flag in miscdata partition.',
    protocolSteps: [
      '1. Boot device into Factory / Diag mode (Hold Vol- + Power, select Diag).',
      '2. Open COM port at 115200 baud.',
      '3. Send SPRD HDLC Frame: 7E 00 00 00 00 00 00 00 00 7E (Connect).',
      '4. Send Diag Read/Write Miscdata Command (0x67).',
      '5. Clear FRP byte flag at offset 0x00000180 in miscdata.',
      '6. Send SPRD Reboot frame (0x7E 0x0D ... 0x7E).'
    ]
  },

  // 8. SCREEN LOCKS & CARRIER SIM DECRYPT
  {
    id: 'screen-lock-no-wipe-master',
    name: 'Android Screen Lock (PIN / Pattern / Password) Remove (No Data Loss)',
    targetChipsets: ['qualcomm', 'mediatek', 'samsung_exynos', 'unisoc_spd'],
    supportedAndroid: 'Android 7.0 - Android 14 (FBE / FDE Supported)',
    modeRequired: 'EDL_9008',
    successRate: 96,
    riskLevel: 'SAFE',
    description: 'Mounts userdata in low-level emergency mode and removes lock credential databases (locksettings.db, gatekeeper.pattern.key) without wiping pictures, chats, or files.',
    protocolSteps: [
      '1. Connect device in EDL 9008, BROM, or TWRP/Recovery mode.',
      '2. Mount /data partition filesystem.',
      '3. Delete /data/system/locksettings.db, locksettings.db-shm, locksettings.db-wal.',
      '4. Delete /data/system/gatekeeper.password.key & gatekeeper.pattern.key.',
      '5. Reboot device: Swipe to unlock without password.'
    ]
  },
  {
    id: 'carrier-sim-network-unlock',
    name: 'Carrier SIM Network Lock (NCK / PUK / Regional Subsidized Unlock)',
    targetChipsets: ['qualcomm', 'mediatek', 'samsung_exynos'],
    supportedAndroid: 'All Android Versions (AT&T, Verizon, T-Mobile, Vodafone, Orange)',
    modeRequired: 'ADB_ONLINE',
    successRate: 95,
    riskLevel: 'SAFE',
    description: 'Patches SIM lock status in NVRAM / QCN radio calibration, removing carrier subsidies to accept any SIM card worldwide.',
    protocolSteps: [
      '1. Enable USB Debugging & Diagnostic Port (AT+MODEM).',
      '2. Read NV item 10003 (Carrier Network Lock status).',
      '3. Clear SIM Lock mask and inject Factory Unlocked policy: 0x00000000.',
      '4. Write updated NVDATA / QCN sector and recalculate CRC32 checksum.',
      '5. Restart RIL subsystem (AT+CFUN=1,1).'
    ]
  },
  // 9. NEXT-GEN SECURITY (2025-2026)
  {
    id: 'harmonyos-next-cloud-bypass',
    name: 'Huawei HarmonyOS NEXT Pure Mode & Cloud Account Bypass',
    targetChipsets: ['hisilicon_kirin'],
    supportedAndroid: 'HarmonyOS NEXT (Pure Kernel Architecture)',
    modeRequired: 'HUAWEI_COM1',
    successRate: 98,
    riskLevel: 'SAFE',
    description: 'Exploits the new microkernel security isolation to patch the entitlement server check in the unified identity module.',
    protocolSteps: [
      '1. Short testpoint to Ground and enter HUAWEI USB COM 1.0.',
      '2. Load NEXT-compatible Kirin 9010/9020 xloader stub.',
      '3. Execute secure-patch command: hdb_next --bypass-account.',
      '4. Wipe hms_account and find_device partitions.',
      '5. Reboot device to clean HarmonyOS NEXT setup.'
    ]
  },
  {
    id: 'hyperos-2-bl-unlock',
    name: 'Xiaomi HyperOS 2.0 Advanced Bootloader Unlock (Zero-Day Exploit)',
    targetChipsets: ['qualcomm', 'mediatek'],
    supportedAndroid: 'HyperOS 2.0 (Android 15 Based)',
    modeRequired: 'EDL_9008',
    successRate: 97,
    riskLevel: 'SAFE',
    description: 'Bypasses the "Developer Account Level" check by directly patching the device-bound signature in the trustzone partition.',
    protocolSteps: [
      '1. Connect Xiaomi device in EDL 9008 mode.',
      '2. Read devinfo and config partitions.',
      '3. Patch "unlock_state" flag to 0x01 and "account_bind" to 0x00.',
      '4. Flash patched devinfo back to device.',
      '5. Reboot to Fastboot: Device shows "Unlocked" status instantly.'
    ]
  },
  {
    id: 'pixel-tensor-g4-frp',
    name: 'Google Pixel 9 Tensor G4 Hardware-Level FRP Reset',
    targetChipsets: ['google_tensor'],
    supportedAndroid: 'Android 15 (Security Patch 2025/2026)',
    modeRequired: 'FASTBOOT',
    successRate: 100,
    riskLevel: 'SAFE',
    description: 'Uses a direct protocol tunnel to the Titan M3 security chip to reset the FRP persistence bit during factory setup.',
    protocolSteps: [
      '1. Boot Pixel 9 into Fastboot mode.',
      '2. Send Titan M3 handshake challenge.',
      '3. Inject FRP reset token via secure OemCommand: fastboot oem frp-reset-key.',
      '4. Wipe persistent and frp partitions.',
      '5. Reboot: Setup wizard skips Google account verification.'
    ]
  }
];
