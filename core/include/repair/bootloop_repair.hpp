#pragma once

#include <cstdint>
#include <string>
#include <vector>
#include <optional>

namespace OmniFix::Repair {

#pragma pack(push, 1)

// AVB 2.0 VBMeta Header Structure
constexpr uint32_t AVB_MAGIC = 0x30425641; // "AVB0"

struct AvbVbmetaHeader {
    uint32_t magic;                      // 0x30425641
    uint32_t requiredLibavbVersionMajor;
    uint32_t requiredLibavbVersionMinor;
    uint32_t authenticationDataBlockSize;
    uint32_t auxiliaryDataBlockSize;
    uint32_t algorithmType;
    uint64_t hashOffset;
    uint64_t hashSize;
    uint64_t signatureOffset;
    uint64_t signatureSize;
    uint64_t publicKeyOffset;
    uint64_t publicKeySize;
    uint64_t publicKeyMetadataOffset;
    uint64_t publicKeyMetadataSize;
    uint64_t descriptorsOffset;
    uint64_t descriptorsSize;
    uint64_t rollbackIndex;
    uint32_t flags;                      // 0x01: AVB_VBMETA_IMAGE_FLAGS_HASHTREE_DISABLED
    uint32_t rollbackIndexLocation;
    uint8_t releaseString[48];
    uint8_t reserved[80];
};

#pragma pack(pop)

enum class DiagnosticFaultType {
    DmVerityCorrupted,
    BootImageHeaderMismatch,
    SuperPartitionMetadataCorrupt,
    BasebandRadioMissing,
    HardBrickEdlFallback,
    None
};

struct RepairInstruction {
    std::string stepName;
    std::string targetPartition;
    bool requiresReboot;
    std::vector<uint8_t> patchData;
    std::string diagnosticDetails;
};

class BootloopRepairEngine {
public:
    static DiagnosticFaultType AnalyzeImage(const std::string& partitionName, const uint8_t* data, size_t length);

    // Disable dm-verity flag safely to cure bootloops caused by modified partitions
    static bool PatchVbmetaDisableVerity(uint8_t* vbmetaBuffer, size_t bufferSize, std::string& outDetails);

    // Reconstruct corrupted dynamic partitions (super) metadata
    static bool ReconstructSuperMetadata(uint8_t* superBuffer, size_t bufferSize, uint32_t sectorSize = 4096);

    // Restore Qualcomm QCN / Modem Radio calibration
    static bool RestoreQcnCalibration(
        const std::vector<uint8_t>& qcnArchive,
        const std::string& targetImei1,
        const std::string& targetImei2,
        std::vector<uint8_t>& outPatchedQcn
    );
};

} // namespace OmniFix::Repair
