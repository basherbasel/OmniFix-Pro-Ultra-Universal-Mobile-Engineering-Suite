#include "vid_pid_matrix.hpp"

namespace OmniFix::Core {

VidPidMatrix& VidPidMatrix::Instance() {
    static VidPidMatrix instance;
    static bool initialized = false;
    if (!initialized) {
        instance.Initialize();
        initialized = true;
    }
    return instance;
}

void VidPidMatrix::Initialize() {
    m_registry.clear();

    auto registerProfile = [this](HardwareProfile p) {
        uint32_t key = MakeKey(p.vid, p.pid);
        m_registry[key] = p;
    };

    // =========================================================================
    // 1. MEDIATEK (MTK) - Historical Feature Phones (2005) to Dimensity 9400 (2026)
    // =========================================================================
    registerProfile({
        0x0E8D, 0x0003, ChipsetVendor::MediaTek, "MediaTek Inc.",
        "MT62xx / MT65xx Legacy", "MediaTek BootROM USB Port (Legacy)",
        HardwareMode::BootROM, "BROM_LEGACY_CMD", false, "DA_SWSEC.bin", 115200, 2005
    });

    registerProfile({
        0x0E8D, 0x2000, ChipsetVendor::MediaTek, "MediaTek Inc.",
        "MT67xx / MT68xx / Dimensity", "MediaTek USB Port (Modern BROM)",
        HardwareMode::BootROM, "BROM_SLA_DAA_BYPASS", true, "MTK_AllInOne_DA_v5.bin", 921600, 2018
    });

    registerProfile({
        0x0E8D, 0x2001, ChipsetVendor::MediaTek, "MediaTek Inc.",
        "MTK Modern Core", "MediaTek DA USB VCOM Port",
        HardwareMode::Preloader, "DA_HIGH_SPEED_STREAM", false, "DA_BR.bin", 921600, 2021
    });

    registerProfile({
        0x0E8D, 0x0001, ChipsetVendor::MediaTek, "MediaTek Inc.",
        "MTK Preloader Core", "MediaTek Preloader USB VCOM Port",
        HardwareMode::Preloader, "PRELOADER_HANDSHAKE", false, "DA_PL.bin", 115200, 2012
    });

    // =========================================================================
    // 2. QUALCOMM - Snapdragon Legacy (2007) to Snapdragon 8 Elite / Gen 4 (2026)
    // =========================================================================
    registerProfile({
        0x05C6, 0x9008, ChipsetVendor::Qualcomm, "Qualcomm Technologies Inc.",
        "Snapdragon (MSM / SDM / SM Series)", "Qualcomm HS-USB QDLoader 9008 (EDL)",
        HardwareMode::BootROM, "SAHARA_FIREHOSE_XML", true, "prog_firehose_ddr.elf", 115200, 2010
    });

    registerProfile({
        0x05C6, 0x9006, ChipsetVendor::Qualcomm, "Qualcomm Technologies Inc.",
        "Snapdragon Raw Disk", "Qualcomm HS-USB Diagnostics 9006 (Direct Storage)",
        HardwareMode::BootROM, "RAW_EMMC_STREAM", false, "rawprogram0.xml", 115200, 2012
    });

    registerProfile({
        0x05C6, 0x900E, ChipsetVendor::Qualcomm, "Qualcomm Technologies Inc.",
        "Snapdragon Dump Emergency", "Qualcomm HS-USB DLOAD 900E",
        HardwareMode::BootROM, "DLOAD_DUMP_PROTOCOL", false, "dload_recovery.mbn", 115200, 2014
    });

    registerProfile({
        0x05C6, 0x9025, ChipsetVendor::Qualcomm, "Qualcomm Technologies Inc.",
        "Snapdragon 8 Gen 2/3/4 Diagnostics", "Qualcomm HS-USB Diagnostics 9025",
        HardwareMode::AdbDiagnostics, "DIAG_HDLC_ASYNC", false, "sec_diag.mbn", 921600, 2024
    });

    // =========================================================================
    // 3. SPREADTRUM / UNISOC - SC6531 (2009) to Tiger T820 / T900 (2026)
    // =========================================================================
    registerProfile({
        0x1782, 0x4D00, ChipsetVendor::SpreadtrumUnisoc, "Unisoc Technologies Inc.",
        "SC65xx / SC77xx / SC98xx", "Spreadtrum SCI USB2Serial BootROM",
        HardwareMode::BootROM, "FDL_SPI_HANDSHAKE", false, "fdl1_sc.bin", 115200, 2011
    });

    registerProfile({
        0x1782, 0x4002, ChipsetVendor::SpreadtrumUnisoc, "Unisoc Technologies Inc.",
        "Unisoc Tiger (T606 / T612 / T616 / T820)", "SPRD U2S Modern Diagnostic Port",
        HardwareMode::AdbDiagnostics, "UNISOC_DIAG_SEC", false, "fdl2_t6xx.bin", 921600, 2023
    });

    // =========================================================================
    // 4. SAMSUNG EXYNOS - S5PC110 (2010) to Exynos 2400 / 2500 (2026)
    // =========================================================================
    registerProfile({
        0x04E8, 0x685D, ChipsetVendor::SamsungExynos, "Samsung Electronics Co., Ltd.",
        "Exynos / Galaxy Modem Core", "Samsung Mobile USB Download Mode (Odin / Loke)",
        HardwareMode::DownloadOdin, "LOKE_ODIN_V4", false, "default.pit", 921600, 2011
    });

    registerProfile({
        0x04E8, 0x6860, ChipsetVendor::SamsungExynos, "Samsung Electronics Co., Ltd.",
        "Galaxy Unified Architecture", "SAMSUNG Mobile USB Composite Device (ADB + MTP + Modem)",
        HardwareMode::AdbDiagnostics, "SAMSUNG_AT_MODEM", false, "modem_sec.bin", 115200, 2013
    });

    registerProfile({
        0x04E8, 0x1234, ChipsetVendor::SamsungExynos, "Samsung Electronics Co., Ltd.",
        "Exynos BootROM Target", "Samsung Exynos Low-Level USB BootROM",
        HardwareMode::BootROM, "EXYNOS_ROM_EXPLOIT", true, "bl1_sec.bin", 115200, 2015
    });

    // =========================================================================
    // 5. HISILICON KIRIN - Kirin 620 (2014) to Kirin 9000s / 9010 (2026)
    // =========================================================================
    registerProfile({
        0x12D1, 0x3609, ChipsetVendor::HiSiliconKirin, "Huawei Technologies Co., Ltd.",
        "Kirin 710 / 980 / 990 / 9000 / 9010", "HUAWEI USB COM 1.0 (Hardware BootROM)",
        HardwareMode::BootROM, "BALONG_FASTBOOT_INJECT", true, "xloader_kirin.bin", 115200, 2018
    });

    registerProfile({
        0x12D1, 0x1037, ChipsetVendor::HiSiliconKirin, "Huawei Technologies Co., Ltd.",
        "Huawei Universal Fastboot", "Huawei Fastboot / Rescue Mode Interface",
        HardwareMode::Fastboot, "HUAWEI_SECURE_FASTBOOT", false, "fastboot_unlock.key", 921600, 2016
    });

    // =========================================================================
    // 6. APPLE SILICON - A4 (2010) to A18 Pro & M4 (2026)
    // =========================================================================
    registerProfile({
        0x05AC, 0x1227, ChipsetVendor::AppleSilicon, "Apple Inc.",
        "Apple A4 - A18 Pro / M1 - M4", "Apple Mobile Device (DFU Mode - SecureROM)",
        HardwareMode::BootROM, "APPLE_SECBOOT_DFU", true, "iBSS.img4", 115200, 2010
    });

    registerProfile({
        0x05AC, 0x1281, ChipsetVendor::AppleSilicon, "Apple Inc.",
        "Apple Mobile Architecture", "Apple Mobile Device (Recovery Mode - iBoot)",
        HardwareMode::Recovery, "IBOOT_RESTORE_PROTOCOL", false, "iBEC.img4", 115200, 2008
    });

    registerProfile({
        0x05AC, 0x12A8, ChipsetVendor::AppleSilicon, "Apple Inc.",
        "Apple Normal Operating System", "Apple Mobile Device (Standard iOS Composite)",
        HardwareMode::AdbDiagnostics, "APPLE_LOCKDOWN_USBMUX", false, "none", 115200, 2007
    });

    // =========================================================================
    // 7. ALLWINNER & ROCKCHIP & GOOGLE TENSOR
    // =========================================================================
    registerProfile({
        0x1F3A, 0xEFE8, ChipsetVendor::Allwinner, "Allwinner Technology Co., Ltd.",
        "A10 to A133 / T507", "Allwinner FEL Low-Level Boot Mode",
        HardwareMode::BootROM, "FEL_DIRECT_DRAM", false, "fes.bin", 115200, 2011
    });

    registerProfile({
        0x2207, 0x330C, ChipsetVendor::Rockchip, "Rockchip Electronics Co., Ltd.",
        "RK3288 / RK3399 / RK3588", "Rockchip MaskROM Hardware Mode",
        HardwareMode::BootROM, "ROCKCHIP_MASKROM_CMD", false, "rk3588_loader.bin", 115200, 2015
    });

    registerProfile({
        0x18D1, 0x4EE0, ChipsetVendor::GoogleTensor, "Google LLC",
        "Tensor G1 / G2 / G3 / G4", "Google Pixel Fastboot / FastbootD Mode",
        HardwareMode::Fastboot, "GOOGLE_AVB_FASTBOOT", false, "bootloader.img", 921600, 2021
    });
}

std::optional<HardwareProfile> VidPidMatrix::Lookup(uint16_t vid, uint16_t pid) const {
    uint32_t key = MakeKey(vid, pid);
    auto it = m_registry.find(key);
    if (it != m_registry.end()) {
        return it->second;
    }
    return std::nullopt;
}

std::vector<HardwareProfile> VidPidMatrix::GetProfilesByVendor(ChipsetVendor vendor) const {
    std::vector<HardwareProfile> result;
    for (const auto& [_, profile] : m_registry) {
        if (profile.vendor == vendor) {
            result.push_back(profile);
        }
    }
    return result;
}

std::vector<HardwareProfile> VidPidMatrix::GetAllProfiles() const {
    std::vector<HardwareProfile> result;
    result.reserve(m_registry.size());
    for (const auto& [_, profile] : m_registry) {
        result.push_back(profile);
    }
    return result;
}

} // namespace OmniFix::Core
