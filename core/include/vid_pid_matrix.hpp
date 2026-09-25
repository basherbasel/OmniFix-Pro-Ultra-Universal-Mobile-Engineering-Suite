#pragma once

#include <string>
#include <vector>
#include <cstdint>
#include <optional>
#include <unordered_map>

namespace OmniFix::Core {

enum class ChipsetVendor {
    MediaTek,
    Qualcomm,
    SpreadtrumUnisoc,
    SamsungExynos,
    HiSiliconKirin,
    AppleSilicon,
    Allwinner,
    Rockchip,
    GoogleTensor,
    Unknown
};

enum class HardwareMode {
    BootROM,            // Raw hardware fallback (BROM, EDL 9008, DFU, MaskROM)
    Preloader,          // First-stage bootloader (MTK Preloader, FDL1)
    DownloadOdin,       // Samsung Loke/Odin mode
    Fastboot,           // ABL/U-Boot fastboot interface
    AdbDiagnostics,     // ADB + Modem COM + Diag
    Recovery,           // Stock/Custom Recovery
    Unknown
};

struct HardwareProfile {
    uint16_t vid;
    uint16_t pid;
    ChipsetVendor vendor;
    std::string vendorName;
    std::string chipFamily;
    std::string marketingName;
    HardwareMode mode;
    std::string defaultProtocol;      // "BROM_SLA", "SAHARA_FIREHOSE", "FDL_PROTOCOL", "LOKE_ODIN", "DFU_APX"
    bool requiresAuthBypass;
    std::string recommendedLoader;    // e.g. "prog_firehose_ddr.elf", "DA_PL.bin", "FDL1.bin"
    uint32_t supportedBaudRate;       // 115200, 921600, etc.
    uint32_t generationYear;          // 2005 - 2026
};

class VidPidMatrix {
public:
    static VidPidMatrix& Instance();

    void Initialize();
    std::optional<HardwareProfile> Lookup(uint16_t vid, uint16_t pid) const;
    std::vector<HardwareProfile> GetProfilesByVendor(ChipsetVendor vendor) const;
    std::vector<HardwareProfile> GetAllProfiles() const;

private:
    VidPidMatrix() = default;
    std::unordered_map<uint32_t, HardwareProfile> m_registry;
    static uint32_t MakeKey(uint16_t vid, uint16_t pid) {
        return (static_cast<uint32_t>(vid) << 16) | pid;
    }
};

} // namespace OmniFix::Core
