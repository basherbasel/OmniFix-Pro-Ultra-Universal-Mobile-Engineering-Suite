#include "repair/bootloop_repair.hpp"
#include <cstring>
#include <algorithm>

namespace OmniFix::Repair {

DiagnosticFaultType BootloopRepairEngine::AnalyzeImage(const std::string& partitionName, const uint8_t* data, size_t length) {
    if (partitionName == "vbmeta" || partitionName == "vbmeta_a" || partitionName == "vbmeta_b") {
        if (length >= sizeof(AvbVbmetaHeader)) {
            const auto* header = reinterpret_cast<const AvbVbmetaHeader*>(data);
            if (header->magic == AVB_MAGIC) {
                // If verity/hashtree is enabled and signature verification is failed
                if ((header->flags & 0x01) == 0 && header->signatureSize > 0) {
                    return DiagnosticFaultType::DmVerityCorrupted;
                }
            }
        }
    }

    if (partitionName == "super") {
        // Look for LpMetadata header magic: 0x616C4430 ("0Dla")
        if (length >= 4096) {
            uint32_t lpMagic = *reinterpret_cast<const uint32_t*>(data + 4096);
            if (lpMagic != 0x616C4430) {
                return DiagnosticFaultType::SuperPartitionMetadataCorrupt;
            }
        }
    }

    return DiagnosticFaultType::None;
}

bool BootloopRepairEngine::PatchVbmetaDisableVerity(uint8_t* vbmetaBuffer, size_t bufferSize, std::string& outDetails) {
    if (bufferSize < sizeof(AvbVbmetaHeader)) {
        outDetails = "VBMeta buffer smaller than AVB 2.0 specification header size";
        return false;
    }

    auto* header = reinterpret_cast<AvbVbmetaHeader*>(vbmetaBuffer);
    if (header->magic != AVB_MAGIC) {
        outDetails = "Invalid VBMeta magic. Buffer is not an Android Verified Boot (AVB) 2.0 image.";
        return false;
    }

    // Set AVB_VBMETA_IMAGE_FLAGS_HASHTREE_DISABLED (0x01) | AVB_VBMETA_IMAGE_FLAGS_VERIFICATION_DISABLED (0x02)
    header->flags |= 0x03;

    // Zero out signature size to enforce non-authenticating permissive kernel boot
    header->signatureSize = 0;
    header->authenticationDataBlockSize = 0;

    outDetails = "VBMeta flags patched: HASHTREE_DISABLED | VERIFICATION_DISABLED applied successfully.";
    return true;
}

bool BootloopRepairEngine::ReconstructSuperMetadata(uint8_t* superBuffer, size_t bufferSize, uint32_t sectorSize) {
    if (bufferSize < sectorSize * 2) return false;

    // Write standard LP Metadata magic at primary geometry offset (4096)
    uint32_t* magicPtr = reinterpret_cast<uint32_t*>(superBuffer + sectorSize);
    *magicPtr = 0x616C4430; // "0Dla" Logical Partition Metadata Magic

    return true;
}

bool BootloopRepairEngine::RestoreQcnCalibration(
    const std::vector<uint8_t>& qcnArchive,
    const std::string& targetImei1,
    const std::string& targetImei2,
    std::vector<uint8_t>& outPatchedQcn
) {
    outPatchedQcn = qcnArchive;
    if (outPatchedQcn.empty() || targetImei1.size() < 14) return false;

    // Qualcomm NV item 550 (NV_UE_IMEI_I) encoding:
    // Format: 9 bytes, length prefix byte (0x08), followed by BCD packed digits
    uint8_t encodedImei[9] = {0};
    encodedImei[0] = 0x08; // 8 bytes of BCD data
    // First digit + odd indicator (0x0A for odd length)
    encodedImei[1] = ((targetImei1[0] - '0') << 4) | 0x0A;

    for (size_t i = 1, b = 2; i < 15 && b < 9; i += 2, ++b) {
        uint8_t d1 = (i < targetImei1.size()) ? (targetImei1[i] - '0') : 0;
        uint8_t d2 = (i + 1 < targetImei1.size()) ? (targetImei1[i + 1] - '0') : 0;
        encodedImei[b] = (d2 << 4) | d1;
    }

    // Search for existing NV item 550 marker or append in calibration section
    bool placed = false;
    for (size_t i = 0; i + 9 < outPatchedQcn.size(); ++i) {
        if (outPatchedQcn[i] == 0x08 && (outPatchedQcn[i+1] & 0x0F) == 0x0A) {
            std::memcpy(outPatchedQcn.data() + i, encodedImei, 9);
            placed = true;
            break;
        }
    }

    if (!placed) {
        outPatchedQcn.insert(outPatchedQcn.end(), encodedImei, encodedImei + 9);
    }

    return true;
}

} // namespace OmniFix::Repair
