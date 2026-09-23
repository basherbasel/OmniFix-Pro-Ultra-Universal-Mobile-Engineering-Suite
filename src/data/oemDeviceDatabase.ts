import { OemDeviceRecord } from '../types';

export const OEM_DEVICE_DATABASE: OemDeviceRecord[] = [
  // ==========================================
  // 1. SAMSUNG (Galaxy S, A, M, Note, Z Series - 2018-2026)
  // ==========================================
  {
    brand: "Samsung",
    model: "Galaxy S26 Ultra / S26+ / S26 (2026 flagship series)",
    code_name: "SM-S948B / SM-S946B / SM-S941B",
    chipset: "Qualcomm Snapdragon 8 Gen 5 for Galaxy / Exynos 2600",
    supported_operations: [
      "FRP Bypass (Emergency *#0*# & Knox MTP)",
      "Factory Reset / Safe Format (Data Retained)",
      "Flash Official Firmware (Odin / Binary U1)",
      "Read Info & Knox Status Reset",
      "KG Guard Lock Bypass",
      "CSC Change Without Data Loss"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy S25 Ultra / S25+ / S25 (2025 flagship series)",
    code_name: "SM-S938B / SM-S936B / SM-S931B",
    chipset: "Qualcomm Snapdragon 8 Elite / Samsung Exynos 2500",
    supported_operations: [
      "FRP Bypass (MTP & EDL)",
      "Factory Reset / Safe Format",
      "Flash Official Firmware (Odin)",
      "Read Info",
      "KG Guard Unlock",
      "Patch Cert / IMEI Repair"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy S6 / S6 Edge (2015 flagship series)",
    code_name: "SM-G920F / SM-G925F",
    chipset: "Samsung Exynos 7420",
    supported_operations: [
      "Flash Official Firmware (Odin)",
      "Read Info",
      "Factory Reset"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy S5 (2014 flagship series)",
    code_name: "SM-G900F",
    chipset: "Qualcomm Snapdragon 801",
    supported_operations: [
      "Flash Official Firmware (Odin)",
      "Read Info",
      "Factory Reset"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy S24 Ultra / S24+ / S24 / S24 FE (S24 series)",
    code_name: "SM-S928B / SM-S926B / SM-S921B / SM-S721B",
    chipset: "Qualcomm Snapdragon 8 Gen 3 / Exynos 2400",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info",
      "Knox Guard Bypass",
      "CSC Switch"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy S23 Ultra / S23+ / S23 / S23 FE (S23 series)",
    code_name: "SM-S918B / SM-S916B / SM-S911B / SM-S711B",
    chipset: "Qualcomm Snapdragon 8 Gen 2 / Exynos 2200",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info",
      "Direct Network SIM Unlock",
      "EFS Backup/Restore"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy S22 Ultra / S22+ / S22 (S22 series)",
    code_name: "SM-S908B / SM-S906B / SM-S901B",
    chipset: "Samsung Exynos 2200 / Snapdragon 8 Gen 1",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info",
      "IMEI Repair & Patch Cert"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy S21 Ultra / S21+ / S21 / S21 FE",
    code_name: "SM-G998B / SM-G996B / SM-G991B / SM-G990B",
    chipset: "Samsung Exynos 2100 / Snapdragon 888",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info",
      "EFS Backup / Restore"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy S20 Ultra / S20+ / S20 / S20 FE",
    code_name: "SM-G988B / SM-G986B / SM-G981B / SM-G781B",
    chipset: "Samsung Exynos 990 / Qualcomm Snapdragon 865",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info",
      "UFS Memory Read"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy S10+ / S10 / S10e / S10 Lite",
    code_name: "SM-G975F / SM-G973F / SM-G970F / SM-G770F",
    chipset: "Samsung Exynos 9820 / Snapdragon 855",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info",
      "Root & Patch Cert"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy S9+ / S9",
    code_name: "SM-G965F / SM-G960F",
    chipset: "Samsung Exynos 9810",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info",
      "Direct Unlock"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy S8+ / S8",
    code_name: "SM-G955F / SM-G950F",
    chipset: "Samsung Exynos 8895",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info",
      "EFS Reset"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy S7 Edge / S7",
    code_name: "SM-G935F / SM-G930F",
    chipset: "Samsung Exynos 8890",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info",
      "Root & Repair IMEI"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy S6 Edge / S6 / S5 / S4 / S3 / S2 / S1 (Legacy S series)",
    code_name: "SM-G925F / SM-G920F / SM-G900F / GT-I9500 / GT-I9300",
    chipset: "Exynos 7420 / Snapdragon 801 / Exynos 4412",
    supported_operations: [
      "Factory Reset (No Data Loss for older models)",
      "Odin Flash Recovery",
      "Direct Unlock",
      "Read Info"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy Z Fold7 / Z Fold6 / Z Fold5 / Z Fold4 / Z Fold3 / Z Fold2 / Galaxy Fold (Foldable series)",
    code_name: "SM-F966B / SM-F956B / SM-F946B / SM-F936B / SM-F926B / SM-F916B / SM-F900F",
    chipset: "Qualcomm Snapdragon 8 Gen 4 / Gen 3 / Gen 2 / Gen 1",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info",
      "Knox Guard Override"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy Z Flip7 / Z Flip6 / Z Flip5 / Z Flip4 / Z Flip3 / Z Flip1 (Clamshell foldable series)",
    code_name: "SM-F751B / SM-F741B / SM-F731B / SM-F721B / SM-F711B / SM-F700F",
    chipset: "Qualcomm Snapdragon 8 Gen 4 / Gen 3 / Gen 2 / Snapdragon 888",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy A57 5G / A37 5G / A56 5G / A36 5G / A26 5G / A16 5G / A06 (2025/2026 Modern A series)",
    code_name: "SM-A576B / SM-A376B / SM-A566B / SM-A366B / SM-A266B / SM-A166B / SM-A065F",
    chipset: "Samsung Exynos 1580 / Dimensity 6300 / Helio G99",
    supported_operations: [
      "FRP Bypass (Knox Custom Exploit)",
      "Factory Reset / Safe Format",
      "Flash Firmware",
      "BROM Direct Read/Write",
      "Read Info"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy A55 / A54 / A53 / A52s / A52 / A51 / A50 / A73 / A72 / A71 / A70 (A50, A70 series)",
    code_name: "SM-A556B / SM-A546B / SM-A536B / SM-A528B / SM-A525F / SM-A515F / SM-A505F / SM-A736B / SM-A725F / SM-A715F",
    chipset: "Samsung Exynos 1480 / Exynos 1380 / Snapdragon 778G / Exynos 9611",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset / Safe Format",
      "Flash Firmware",
      "Read Info"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy A35 / A34 / A33 / A32 / A31 / A30 (A30 series)",
    code_name: "SM-A356B / SM-A346B / SM-A336B / SM-A325F / SM-A315F / SM-A305F",
    chipset: "Samsung Exynos 1380 / Dimensity 1080 / Helio G80",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Meta Mode Unlock",
      "Read Info"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy A25 / A24 / A23 / A22 / A21s / A20 / A15 / A14 / A13 / A12 / A11 / A10 / A05 / A05s / A04 / A04e / A03 / A02 / A01 (Budget A series & Core)",
    code_name: "SM-A256B / SM-A245F / SM-A156B / SM-A146B / SM-A125F / SM-A035F",
    chipset: "Exynos 1280 / Dimensity 700 / MediaTek Helio P35 / Unisoc SC9863A",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "BROM Direct Unlock",
      "Read Info"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy M55 / M35 / M15 / M54 / M34 / M23 / M12 / M62 / M51 (Battery beast M series)",
    code_name: "SM-M556B / SM-M356B / SM-M156B / SM-M546B / SM-M127F / SM-M515F",
    chipset: "Snapdragon 7 Gen 1 / Exynos 1380 / Exynos 1280 / Snapdragon 730G",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info",
      "EFS Reset"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy F55 / F34 / F15 / F54 / F23 (F series)",
    code_name: "SM-F556B / SM-F346B / SM-F156B / SM-F546B / SM-F236B",
    chipset: "Snapdragon 7 Gen 1 / Exynos 1380 / Snapdragon 750G",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy Note 20 Ultra 5G / Note 20 / Note 10+ / Note 10 (Premium Note series)",
    code_name: "SM-N986B / SM-N980F / SM-N975F / SM-N970F",
    chipset: "Samsung Exynos 990 / Snapdragon 865+ / Exynos 9825",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Firmware",
      "Read Info",
      "IMEI Repair & Patch Cert",
      "EFS Backup/Restore"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy Note 9 / Note 8 / Note 7 / Note 5 / Note 4 / Note 3 / Note 2 / Note 1 (Legacy Note series)",
    code_name: "SM-N960F / SM-N950F / SM-N930F / SM-N920F / SM-N910F / GT-N7100",
    chipset: "Exynos 9810 / Exynos 8895 / Exynos 7420 / Snapdragon 805",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Flash Stock ROM via Odin",
      "Direct Network Unlock",
      "Read Info"
    ]
  },
  {
    brand: "Samsung",
    model: "Galaxy J7 / J5 / J3 / J1 (Symmetric legacy J series)",
    code_name: "SM-J730F / SM-J700F / SM-J530F / SM-J500F / SM-J320F / SM-J120F",
    chipset: "Samsung Exynos 7870 / Exynos 7580 / Spreadtrum SC7731",
    supported_operations: [
      "FRP Bypass (Legacy Talkback / ODIN Method)",
      "Factory Reset",
      "Odin Stock Flashing",
      "Read Info",
      "Direct SIM Unlock"
    ]
  },

  // ==========================================
  // 2. XIAOMI / REDMI / POCO (2018-2026)
  // ==========================================
  {
    brand: "Xiaomi",
    model: "Xiaomi 15 Ultra 5G",
    code_name: "25030PN60G (Haotian)",
    chipset: "Qualcomm Snapdragon 8 Elite",
    supported_operations: [
      "Mi Cloud Bypass",
      "FRP Bypass",
      "Fastboot Flashing (HyperOS 2.0)",
      "EDL 9008 Flashing",
      "Read Info",
      "Anti-Relock Firewall"
    ]
  },
  {
    brand: "Xiaomi",
    model: "Xiaomi 14 Ultra 5G",
    code_name: "24030PN60G (Aurora)",
    chipset: "Qualcomm Snapdragon 8 Gen 3",
    supported_operations: [
      "Mi Cloud Bypass",
      "FRP Bypass",
      "Fastboot Flashing",
      "EDL Auth Flashing",
      "Read Info"
    ]
  },
  {
    brand: "Xiaomi",
    model: "Xiaomi 14T Pro 5G",
    code_name: "2407FPN8EG (Rothko)",
    chipset: "MediaTek Dimensity 9300+",
    supported_operations: [
      "Mi Cloud Bypass",
      "FRP Bypass",
      "BROM Direct Flash",
      "Safe Format",
      "Read Info"
    ]
  },
  {
    brand: "Xiaomi",
    model: "Xiaomi 17 Ultra / 17 Pro / 17 (2026 Flagship Series)",
    code_name: "26012RP29G (Aristotle)",
    chipset: "Qualcomm Snapdragon 8 Gen 5 / Elite 2",
    supported_operations: [
      "HyperOS 2.0 Bootloader Unlock Bypass",
      "Mi Cloud Account Bypass",
      "FRP Bypass (EDL & Sidekey)",
      "FastbootD Flashing",
      "Read Info"
    ]
  },
  {
    brand: "Xiaomi",
    model: "Xiaomi 16 Ultra / 16 Pro / 16 (2025 Series)",
    code_name: "24115RA29G (Socrates)",
    chipset: "Qualcomm Snapdragon 8 Gen 4 / Elite",
    supported_operations: [
      "HyperOS Lockscreen Bypass",
      "Mi Cloud Reset",
      "FRP Bypass",
      "EDL 9008 Flashing",
      "Read Info"
    ]
  },
  {
    brand: "Xiaomi",
    model: "Xiaomi 15T Pro / 14T Pro / 13T Pro (T series)",
    code_name: "2407FPN8EG / 23078PND5G (Corot)",
    chipset: "MediaTek Dimensity 9300+ / 9200+",
    supported_operations: [
      "Mi Cloud Bypass",
      "FRP Bypass",
      "BROM Auth Bypass & Flash",
      "Read Info",
      "Factory Reset"
    ]
  },
  {
    brand: "Xiaomi",
    model: "Xiaomi 12 Pro / Mi 11 Ultra (Legacy flagships)",
    code_name: "2201122G / M2102K1G",
    chipset: "Qualcomm Snapdragon 8 Gen 1 / 888",
    supported_operations: [
      "Mi Cloud Bypass",
      "FRP Bypass",
      "EDL 9008 Flash",
      "Read Info",
      "Dual IMEI Write"
    ]
  },
  {
    brand: "Xiaomi",
    model: "Redmi Note 16 Pro+ / Note 16 Pro / Note 16 (2026 Series)",
    code_name: "26090RA39G (Ruby-S)",
    chipset: "MediaTek Dimensity 7500 / Dimensity 7300-Ultra",
    supported_operations: [
      "FRP Bypass",
      "HyperOS Account Bypass",
      "BROM Direct Unlock & Format",
      "Flash Fastboot ROM",
      "Read Info"
    ]
  },
  {
    brand: "Xiaomi",
    model: "Redmi Note 15 Pro+ / Note 15 Pro / Note 15 (2025 Series)",
    code_name: "25090RA29G (Jade)",
    chipset: "Qualcomm Snapdragon 7s Gen 4 / Dimensity 7200",
    supported_operations: [
      "FRP Bypass",
      "Mi Cloud Reset",
      "Fastboot Flashing",
      "Safe Format",
      "Read Info"
    ]
  },
  {
    brand: "Xiaomi",
    model: "Redmi Note 14 Pro+ / Note 13 Pro+ / Note 12 Pro 5G",
    code_name: "24090RA29G / 2312DRA50G / 22101316G",
    chipset: "Snapdragon 7s Gen 3 / Dimensity 7200-Ultra / Dimensity 1080",
    supported_operations: [
      "FRP Bypass",
      "Mi Cloud Bypass",
      "BROM SLA / DAA Auth Bypass",
      "Flash TGZ Firmware",
      "Read Info"
    ]
  },
  {
    brand: "Xiaomi",
    model: "Redmi Note 11 / Note 10 Pro / Note 9 Pro (Legacy Note series)",
    code_name: "2201117TG / M2101K6G / M2003J6B2G",
    chipset: "Snapdragon 680 / Snapdragon 732G / Snapdragon 720G",
    supported_operations: [
      "FRP Bypass",
      "Mi Cloud Bypass",
      "EDL 9008 Flashing",
      "Dual SIM IMEI Repair",
      "Read Info"
    ]
  },
  {
    brand: "Xiaomi",
    model: "Redmi 15 / 15C / 14C / 13C / 12 / 10 (Budget Redmi series)",
    code_name: "2510FPCA4G / 2411FPCA4G / 2310FPCA4G",
    chipset: "MediaTek Helio G91 / Helio G85 / Snapdragon 680",
    supported_operations: [
      "FRP Bypass",
      "Mi Cloud Reset",
      "BROM Direct Unlock",
      "Read Info",
      "Safe Format"
    ]
  },
  {
    brand: "POCO",
    model: "POCO F8 Pro / F7 Pro / F6 Pro (POCO Gaming Flagships)",
    code_name: "26113RKC6G / 23113RKC6G (Vermeer)",
    chipset: "Qualcomm Snapdragon 8 Gen 4 / Gen 3 / Gen 2",
    supported_operations: [
      "Mi Cloud Bypass",
      "FRP Bypass",
      "FastbootD Flashing",
      "Read Info",
      "Safe Format"
    ]
  },
  {
    brand: "POCO",
    model: "POCO X7 Pro / X6 Pro / X3 Pro (POCO X series)",
    code_name: "2611DRK48G / 2311DRK48G / M2102J20SG",
    chipset: "Dimensity 8400 / Dimensity 8300-Ultra / Snapdragon 860",
    supported_operations: [
      "Mi Cloud Bypass",
      "FRP Bypass",
      "BROM Auth Flash & Format",
      "EDL 9008 Flash",
      "Read Info",
      "PMIC Reboot Fix"
    ]
  },
  {
    brand: "POCO",
    model: "POCO M6 Pro / M5 / C65 / C51 (POCO M & C series)",
    code_name: "2312FPCA4G / 2212ARNC4L",
    chipset: "Helio G99 / Helio G85 / Helio G36",
    supported_operations: [
      "FRP Bypass",
      "Mi Cloud Reset",
      "BROM Direct Format",
      "Read Info"
    ]
  },

  // ==========================================
  // 3. OPPO & REALME (2018-2026)
  // ==========================================
  {
    brand: "Oppo",
    model: "Oppo Find X9 Ultra / Find X8 / Find X7 / Find X6 / Find X5 (Find X flagship series)",
    code_name: "PHY110 / CPH2501",
    chipset: "Qualcomm Snapdragon 8 Gen 5 / Gen 4 / Gen 3",
    supported_operations: [
      "Oppo ID Bypass",
      "FRP Bypass",
      "EDL 9008 Flashing",
      "Read Info",
      "Safe Format"
    ]
  },
  {
    brand: "Oppo",
    model: "Oppo Find N5 / Find N3 / Find N3 Flip (Foldable series)",
    code_name: "CPH2499 / CPH2519",
    chipset: "Snapdragon 8 Gen 4 / Gen 2 / Dimensity 9200",
    supported_operations: [
      "Oppo ID / HeyTap Reset",
      "FRP Bypass",
      "EDL 9008 Flash",
      "Read Info"
    ]
  },
  {
    brand: "Oppo",
    model: "Oppo Reno 16 Pro+ / Reno 15 Pro / Reno 14 Pro / Reno 12 / Reno 11 / Reno 10 (Reno Series)",
    code_name: "CPH2629 / CPH2521 / CPH2357",
    chipset: "Dimensity 9300+ / Dimensity 7300 / Snapdragon 8+ Gen 1",
    supported_operations: [
      "FRP Bypass",
      "Oppo Account Removal",
      "BROM SLA / DAA Auth Bypass",
      "Safe Format (Keep Photos)",
      "Read Info"
    ]
  },
  {
    brand: "Oppo",
    model: "Oppo A6 Pro / A60 / A58 / A78 / A98 / A38 / A54 / A16 (Budget A series)",
    code_name: "CPH2483 / CPH2565 / CPH2387 / CPH2577",
    chipset: "Helio G99 / Snapdragon 680 / Dimensity 700 / Helio G35",
    supported_operations: [
      "FRP Bypass",
      "Oppo ID / Account Removal",
      "BROM Safe Format & Direct Flash",
      "Read Info"
    ]
  },
  {
    brand: "Oppo",
    model: "Oppo F27 Pro+ / F25 Pro / K12 / K11 (K & F series)",
    code_name: "CPH2633 / CPH2603 / PJD110",
    chipset: "Dimensity 7050 / Snapdragon 7 Gen 3",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset / Safe Format",
      "BROM / EDL Auth Flash",
      "Read Info"
    ]
  },
  {
    brand: "Realme",
    model: "Realme GT6 / GT5 Pro / GT Neo 6 (GT Flagship Gaming series)",
    code_name: "RMX3888 / RMX3851",
    chipset: "Qualcomm Snapdragon 8 Gen 3 / Snapdragon 8s Gen 3 / Snapdragon 7+ Gen 3",
    supported_operations: [
      "FRP Bypass",
      "HeyTap ID Bypass",
      "EDL 9008 Flashing",
      "Bootloader Unlock",
      "OFP Flash Extract",
      "Read Info"
    ]
  },
  {
    brand: "Realme",
    model: "Realme 16 Pro+ / 15 Pro+ / 14 Pro / 12 Pro+ / 11 Pro+ / 10 (Number & Pro series)",
    code_name: "RMX3840 / RMX3741 / RMX3989",
    chipset: "Qualcomm Snapdragon 7s Gen 2 / Dimensity 7050 / Dimensity 7300 / Snapdragon 6 Gen 1",
    supported_operations: [
      "FRP Bypass",
      "Safe Format / Screenlock Bypass",
      "BROM SLA / DAA Auth Bypass",
      "FastbootD Flashing",
      "Read Info"
    ]
  },
  {
    brand: "Realme",
    model: "Realme C67 / C65 / C55 / C53 / C30 (C budget series)",
    code_name: "RMX3710 / RMX3760 / RMX3890",
    chipset: "Qualcomm Snapdragon 685 / MediaTek Helio G88 / UNISOC T612",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset / Safe Format",
      "BROM Direct Safe Format",
      "SPD Diag PAC Flash",
      "Read Info"
    ]
  },
  {
    brand: "Realme",
    model: "Realme P4s / Narzo 70 Pro / Narzo 70 (P & Narzo online series)",
    code_name: "RMX3869 / RMX3970",
    chipset: "MediaTek Dimensity 7050 / Dimensity 6080",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "BROM Auth Bypass & Safe Format",
      "Read Info"
    ]
  },

  // ==========================================
  // 4. VIVO & IQOO (2018-2026)
  // ==========================================
  {
    brand: "Vivo",
    model: "Vivo X200 Pro / X100 Pro / X Fold 3 (Flagship & Fold series)",
    code_name: "V2415A / V2324A",
    chipset: "MediaTek Dimensity 9400 / Dimensity 9300 / Snapdragon 8 Gen 3",
    supported_operations: [
      "FRP Bypass",
      "Vivo Account Removal / Cloud Bypass",
      "BROM Preloader / SLA Flash",
      "Safe Format (Keep Gallery)",
      "Read Info"
    ]
  },
  {
    brand: "Vivo",
    model: "Vivo V70 Pro / V50 Pro / V40 / V30 / V29 (V & S series)",
    code_name: "V2319 / V2250",
    chipset: "Dimensity 8300 / Snapdragon 7 Gen 3 / Dimensity 8200",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset & Screenlock Bypass",
      "EDL 9008 / Meta Mode Flash",
      "Read Info"
    ]
  },
  {
    brand: "Vivo",
    model: "Vivo Y31T / Y100 / Y28 / Y17 / Y36 / Y27 (Budget Y series)",
    code_name: "V2247 / V2249",
    chipset: "Qualcomm Snapdragon 680 / Helio G85 / Snapdragon 4 Gen 2",
    supported_operations: [
      "FRP Bypass",
      "Safe Format & Factory Reset",
      "BROM / EDL Direct Boot Unlock",
      "Read Info"
    ]
  },
  {
    brand: "iQOO",
    model: "iQOO 13 / iQOO Neo 9 / iQOO 12 (Gaming series)",
    code_name: "V2407A / V2307A",
    chipset: "Qualcomm Snapdragon 8 Elite / Gen 3 / Dimensity 9300",
    supported_operations: [
      "FRP Bypass",
      "Vivo / iQOO Cloud Bypass",
      "EDL 9008 Secure Flashing",
      "Read Info",
      "Bootloader Unlock Bypass"
    ]
  },

  // ==========================================
  // 5. INFINIX, TECNO, & ITEL (TRANSSION - 2018-2026)
  // ==========================================
  {
    brand: "Infinix",
    model: "Infinix Zero 45 / Zero 40 (Zero Curved & Foldable Flip series)",
    code_name: "X6880 / X6731B",
    chipset: "MediaTek Dimensity 8200 / Dimensity 8020",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "BROM Flash / Secure SLA Unlock",
      "Read Info",
      "Safe Format"
    ]
  },
  {
    brand: "Infinix",
    model: "Infinix GT 30 Pro / GT 20 Pro (GT Gaming series)",
    code_name: "X6871",
    chipset: "MediaTek Dimensity 8200 Ultimate / Dimensity 8200",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "BROM SLA / DAA Auth Bypass",
      "Flash Stock Firmware",
      "Read Info",
      "Meow Gaming UI Reset"
    ]
  },
  {
    brand: "Infinix",
    model: "Infinix Note 50 / Note 40 Pro+ 5G (Note High-speed Charge series)",
    code_name: "X6851B",
    chipset: "MediaTek Dimensity 7020 / Dimensity 6080",
    supported_operations: [
      "FRP Bypass",
      "Safe Format / Screenlock Reset",
      "BROM Direct Unlock",
      "Read Info",
      "Write NVRAM backup"
    ]
  },
  {
    brand: "Infinix",
    model: "Infinix Hot 60 / Hot 50 / Hot 40 Pro / Hot 30 (Hot series)",
    code_name: "X6837 / X6831",
    chipset: "MediaTek Helio G99 / Helio G88 / Dimensity 6300",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset / Safe Format",
      "BROM Auth Bypass",
      "Read Info"
    ]
  },
  {
    brand: "Infinix",
    model: "Infinix Smart 9 / Smart 8 / Smart 7 (Smart budget series)",
    code_name: "X6525 / X6515",
    chipset: "UNISOC T606 / Helio G36",
    supported_operations: [
      "FRP Bypass",
      "Unisoc Factory Reset & Diag Mode",
      "Flash Stock PAC ROM",
      "Read Info"
    ]
  },
  {
    brand: "Tecno",
    model: "Tecno Camon 30 Pro / Spark 20 Pro+ / Pop 8",
    code_name: "CL8 / KJ7 / BG6",
    chipset: "MediaTek Dimensity 8200 / Helio G99 / UNISOC T606",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset & BROM Auth Bypass",
      "SPD Diag Flash PAC",
      "Read Info"
    ]
  },
  {
    brand: "Itel",
    model: "Itel S25 Pro / S25 / S24 / S23 (Color & S design series with AMOLED)",
    code_name: "it5626 / it5622",
    chipset: "UNISOC Tiger T616 / MediaTek Helio G91 / UNISOC T606",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset / Passcode Reset",
      "BROM Safe Format",
      "SPD Diag PAC Flash",
      "Read Info"
    ]
  },
  {
    brand: "Itel",
    model: "Itel P65 / P55 5G / P55 Turbo (Power & Big Battery series)",
    code_name: "it5630 / it5631",
    chipset: "UNISOC Tiger T606 / MediaTek Dimensity 6080",
    supported_operations: [
      "FRP Bypass",
      "Unisoc Factory Reset & Diag Mode",
      "BROM Direct Unlock",
      "Read Info"
    ]
  },
  {
    brand: "Itel",
    model: "Itel A80 / A70 / A60 / A50 (A-series entry-level budget series)",
    code_name: "it5611 / it5606",
    chipset: "UNISOC T603 / UNISOC SC9863A",
    supported_operations: [
      "FRP Bypass",
      "SPD Diag Factory Reset",
      "Flash Stock PAC ROM",
      "Read Info"
    ]
  },

  // ==========================================
  // 6. HUAWEI & HONOR (2018-2026)
  // ==========================================
  {
    brand: "Huawei",
    model: "Huawei Pura 80 Ultra / Pura 70 Ultra / P60 Pro (Pura & P flagship series)",
    code_name: "HBP-LX9 / JAD-LX9",
    chipset: "HiSilicon Kirin 9020 / Kirin 9010 / Snapdragon 8+ Gen 1 4G",
    supported_operations: [
      "Huawei ID Bypass (HarmonyOS 5.0 / 4.2)",
      "FRP Reset",
      "COM 1.0 Testpoint Bootloader",
      "USB COM 1.0 Flashing & Secure Restore",
      "Read Info"
    ]
  },
  {
    brand: "Huawei",
    model: "Huawei Mate 80 / Mate 70 / Mate 60 Pro (Mate Premium business series)",
    code_name: "ALN-AL00",
    chipset: "HiSilicon Kirin 9100 / Kirin 9010 / Kirin 9000s",
    supported_operations: [
      "Huawei ID Bypass",
      "FRP Reset",
      "Testpoint USB COM 1.0 Flashing",
      "HarmonyOS Next Downgrade / Upgrade",
      "RS Master Design Calibration",
      "Read Info"
    ]
  },
  {
    brand: "Huawei",
    model: "Huawei Mate XT Ultimate / Mate X5 / Mate X3 (Mate X foldable series)",
    code_name: "TGL-AL00 / ALT-AL00",
    chipset: "HiSilicon Kirin 9010 / Kirin 9000s",
    supported_operations: [
      "Huawei ID Account Unlock",
      "FRP Account Reset",
      "COM 1.0 Testpoint Flashing",
      "Read Info"
    ]
  },
  {
    brand: "Huawei",
    model: "Huawei Nova 14 / Nova 13 / Nova 11 / Nova 10 (Nova Youth series)",
    code_name: "FOA-LX9 / NCO-LX9",
    chipset: "Kirin 830 / Kirin 8000 / Snapdragon 778G 4G",
    supported_operations: [
      "FRP Reset",
      "Huawei ID Bypass",
      "EDL / Kirin COM 1.0 Flash",
      "Read Info"
    ]
  },
  {
    brand: "Huawei",
    model: "Huawei Enjoy 70 / Enjoy 60 (Enjoy budget series)",
    code_name: "MGA-AL00",
    chipset: "Kirin 710A / Kirin 710",
    supported_operations: [
      "FRP Bypass",
      "Huawei ID Reset",
      "Kirin Flash via USB COM 1.0",
      "Read Info"
    ]
  },
  {
    brand: "Honor",
    model: "Honor Magic6 Pro 5G",
    code_name: "BVL-N49",
    chipset: "Qualcomm Snapdragon 8 Gen 3",
    supported_operations: [
      "Honor ID Reset",
      "FRP Bypass",
      "HDB / Fastboot Flashing",
      "Read Info"
    ]
  },
  {
    brand: "Honor",
    model: "Honor 90 5G",
    code_name: "REA-NX9",
    chipset: "Qualcomm Snapdragon 7 Gen 1 Accelerated",
    supported_operations: [
      "FRP Bypass",
      "Honor Account Bypass",
      "EDL Flashing",
      "Read Info"
    ]
  },

  // ==========================================
  // 7. MOTOROLA & NOKIA (2018-2026)
  // ==========================================
  {
    brand: "Motorola",
    model: "Moto Edge 50 Ultra",
    code_name: "XT2403-1",
    chipset: "Qualcomm Snapdragon 8s Gen 3",
    supported_operations: [
      "FRP Bypass",
      "Bootloader Unlock",
      "Fastboot Flashing",
      "Blankflash EDL Recovery",
      "Read Info"
    ]
  },
  {
    brand: "Motorola",
    model: "Moto G84 5G",
    code_name: "XT2347-2",
    chipset: "Qualcomm Snapdragon 695 5G",
    supported_operations: [
      "FRP Bypass",
      "Factory Reset",
      "Blankflash Recovery",
      "Read Info"
    ]
  },
  {
    brand: "Nokia",
    model: "Nokia G60 5G",
    code_name: "TA-1479",
    chipset: "Qualcomm Snapdragon 695 5G",
    supported_operations: [
      "FRP Bypass",
      "Nokia HMD Security Token Reset",
      "EDL 9008 Flashing",
      "Read Info"
    ]
  },
  {
    brand: "Nokia",
    model: "Nokia XR21 Rugged 5G",
    code_name: "TA-1486",
    chipset: "Qualcomm Snapdragon 695 5G",
    supported_operations: [
      "FRP Bypass",
      "HMD Account Unlock",
      "Fastboot Flashing",
      "Read Info"
    ]
  },
  {
    brand: "Nokia",
    model: "Nokia G21 / C32",
    code_name: "TA-1418 / TA-1534",
    chipset: "UNISOC Tiger T606 / T606",
    supported_operations: [
      "FRP Bypass",
      "SPD Diag Factory Reset",
      "Flash Stock PAC Firmware",
      "Read Info"
    ]
  },

  // ==========================================
  // 8. APPLE IPHONE & GOOGLE PIXEL
  // ==========================================
  {
    brand: "Apple",
    model: "iPhone 17 Pro Max / 17 Pro / 17 Slim (Air) / 17 (2025/2026 series)",
    code_name: "A3400 / iPhone18,2",
    chipset: "Apple A19 Pro (t8150) / A19",
    supported_operations: [
      "DFU Mode Hardware Diagnostics",
      "IPSW Stock Restore & Secure Flashing",
      "Read Device Info & ECID",
      "Battery Cycle Calibration",
      "SysCfg Serial Custom Read/Write"
    ]
  },
  {
    brand: "Apple",
    model: "iPhone 16 Pro Max / 16 Pro / 16 Plus / 16",
    code_name: "A3296 / A3293 / A3289 / iPhone17,2",
    chipset: "Apple A18 Pro (t8140) / A18",
    supported_operations: [
      "DFU Mode Diagnostics",
      "IPSW Restore & Flashing",
      "Read Device Info & ECID",
      "Battery Health Repair & Calibration",
      "Serial / SysCfg Read"
    ]
  },
  {
    brand: "Apple",
    model: "iPhone 15 Pro Max / 15 Pro / 15 Plus / 15",
    code_name: "A3106 / A3102 / A3094 / iPhone16,2",
    chipset: "Apple A17 Pro (t8130) / A16 Bionic",
    supported_operations: [
      "DFU Restore & Flash",
      "IPSW Flash",
      "Read ECID / Serial / UDID",
      "Recovery Sideload Diagnostic",
      "Panic Log Analyzer"
    ]
  },
  {
    brand: "Apple",
    model: "iPhone 14 Pro Max / 14 Pro / 14 Plus / 14",
    code_name: "A2894 / A2890 / A2882 / iPhone15,3",
    chipset: "Apple A16 Bionic / A15 Bionic",
    supported_operations: [
      "DFU / Recovery Flashing",
      "IPSW Local Restore",
      "Read Device Model and ECID",
      "FMI iCloud Status Query"
    ]
  },
  {
    brand: "Apple",
    model: "iPhone 13 Pro Max / 13 Pro / 13 / 13 Mini",
    code_name: "A2643 / A2638 / A2633 / A2628 / iPhone14,2",
    chipset: "Apple A15 Bionic (t8110)",
    supported_operations: [
      "IPSW Firmware Update/Restore",
      "Read Serial / IMEI / WiFi MAC",
      "Diagnostic Mode Tunnel",
      "Recovery Force Reboot"
    ]
  },
  {
    brand: "Apple",
    model: "iPhone SE (4th Gen / 3rd Gen 2022 / 2nd Gen 2020 / 1st Gen 2016)",
    code_name: "A2783 / A2275 / A1723 / iPhone14,6",
    chipset: "Apple A15 Bionic / A13 Bionic / A9",
    supported_operations: [
      "IPSW Secure Restore",
      "Read ECID / Serial",
      "DFU Diagnostic Flash",
      "Enter/Exit Recovery Mode"
    ]
  },
  {
    brand: "Apple",
    model: "iPhone 12 Pro Max / 12 Pro / 12 / 12 Mini",
    code_name: "A2411 / A2407 / A2403 / A2399 / iPhone13,4",
    chipset: "Apple A14 Bionic (t8101)",
    supported_operations: [
      "IPSW Update/Restore",
      "Read Device Identifiers",
      "DFU Hard Reset",
      "Baseband Firmware Query"
    ]
  },
  {
    brand: "Apple",
    model: "iPhone 11 Pro Max / 11 Pro / 11",
    code_name: "A2218 / A2215 / A2111 / iPhone12,5",
    chipset: "Apple A13 Bionic (t8030)",
    supported_operations: [
      "DFU/Recovery Flash",
      "SysCfg Diagnostics",
      "Read Serial Number / Battery Health",
      "NFC Controller Diagnostic"
    ]
  },
  {
    brand: "Apple",
    model: "iPhone XS Max / XS / XR",
    code_name: "A2101 / A1920 / A2105 / iPhone11,6",
    chipset: "Apple A12 Bionic (t8020)",
    supported_operations: [
      "DFU Restore",
      "IPSW Flashing",
      "Read ECID / Serial",
      "Baseband Diagnostic Boot"
    ]
  },
  {
    brand: "Apple",
    model: "iPhone X / 8 Plus / 8 (Checkm8 Vulnerable)",
    code_name: "A1865 / A1897 / A1863 / iPhone10,6",
    chipset: "Apple A11 Bionic (t8015)",
    supported_operations: [
      "Checkm8 Pwnd DFU Exploit",
      "Ramdisk Custom Activation",
      "iCloud Screen Pass / Bypass",
      "Read SysCfg & Write Bluetooth/WiFi MAC",
      "Read Info & ECID"
    ]
  },
  {
    brand: "Apple",
    model: "iPhone 7 Plus / 7 / 6s Plus / 6s / 6 Plus / 6 (Legacy FaceID/HomeButton series)",
    code_name: "A1661 / A1660 / A1687 / A1688 / A1524 / A1586",
    chipset: "Apple A10 Fusion / A9 / A8",
    supported_operations: [
      "PwndDFU Checkm8 Exploit Mode",
      "iCloud Activation Screen Pass",
      "Read/Write SysCfg in Purple Mode",
      "Flash via iTunes/3uTools API",
      "Read ECID / Serial"
    ]
  },
  {
    brand: "Apple",
    model: "iPhone 5s / 5c / 5 / 4s / 4 / 3GS / 3G / 2G (Classic legacy generations)",
    code_name: "A1457 / A1507 / A1428 / A1387 / A1332 / A1303 / A1241 / A1203",
    chipset: "Apple A7 / A6 / A5 / A4 / Samsung ARM11",
    supported_operations: [
      "Limb1 DFU Exploit Mode",
      "Direct iCloud Activation Lock Bypass (Legacy iOS)",
      "Read NAND Partition Layout",
      "DFU Restore / Custom IPSW Flash",
      "Read ECID / Serial & Unlock Baseband"
    ]
  },
  {
    brand: "Google",
    model: "Pixel 9 Pro XL",
    code_name: "GEC77 (Komodo)",
    chipset: "Google Tensor G4",
    supported_operations: [
      "FRP Bypass",
      "Bootloader Unlock",
      "Fastboot Slot A/B Flashing",
      "Read Info"
    ]
  },
  {
    brand: "Google",
    model: "Pixel 7 Pro / 6 Pro / 5 / 4 XL / 3 XL / 2 XL / Pixel (Pixel series legacy)",
    code_name: "Cheetah / Raven / Redfin / Coral / Crosshatch / Taimen / Sailfish",
    chipset: "Google Tensor G2 / G1 / Snapdragon 765G / 855 / 845 / 835 / 821",
    supported_operations: [
      "FRP Bypass (Setup Wizard Exploit)",
      "Fastboot Sideload OTA",
      "Flash Factory Images (Slot A/B)",
      "Read Info",
      "Bootloader Unlock (Google Edition Only)"
    ]
  },
  {
    brand: "OnePlus",
    model: "OnePlus 13 / 12 / 11 / 10 Pro / 9 Pro / 8 Pro / 7 Pro / 6T / 5T / 3T / One (OnePlus series)",
    code_name: "CPH2581 / CPH2447 / NE2213 / LE2123 / IN2023 / GM1913 / A6013",
    chipset: "Qualcomm Snapdragon 8 Gen 4 / Gen 3 / Gen 2 / 8 Gen 1 / 888 / 865 / 855 / 845",
    supported_operations: [
      "FRP Bypass",
      "MSM Download Tool Recovery (EDL 9008)",
      "FastbootD Flashing",
      "OxygenOS / ColorOS Switch",
      "Read Info",
      "Bootloader Unlock Bypass"
    ]
  },
  {
    brand: "Sony",
    model: "Xperia 1 VI / 1 V / 1 IV / 1 III / 1 II / 1 (Xperia 1 series)",
    code_name: "XQ-EC54 / XQ-DQ54",
    chipset: "Snapdragon 8 Gen 3 / Gen 2 / Gen 1",
    supported_operations: [
      "FRP Bypass",
      "Emma Official Flash Tool Support",
      "Fastboot Flashing",
      "Newflasher Custom Flash",
      "Read Info"
    ]
  },
  {
    brand: "LG",
    model: "LG V60 ThinQ / V50 / V40 / V30 / G8 / G7 / G6 (LG legacy flagship series)",
    code_name: "LM-V600 / LM-V450",
    chipset: "Snapdragon 865 / 855 / 845 / 835",
    supported_operations: [
      "FRP Bypass (Accessibility Exploit)",
      "LGUP KDZ Flashing",
      "9008 EDL Recovery (Cross-flash)",
      "Network Unlock via Diag",
      "Read Info"
    ]
  },
  {
    brand: "Asus",
    model: "ROG Phone 9 / 8 / 7 / 6 / 5 / Zenfone 11 / 10 / 9 (Gaming & Zenfone series)",
    code_name: "AI2401 / AI2201",
    chipset: "Snapdragon 8 Gen 3 / Gen 2 / Gen 1",
    supported_operations: [
      "FRP Bypass",
      "RAW Firmware Flashing",
      "Fastboot Slot A/B Recovery",
      "Read Info"
    ]
  }
];
