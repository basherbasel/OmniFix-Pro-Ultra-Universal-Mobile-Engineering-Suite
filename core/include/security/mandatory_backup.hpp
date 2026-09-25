#pragma once

#include <cstdint>
#include <string>
#include <vector>
#include <array>
#include <optional>
#include <chrono>

namespace OmniFix::Security {

// Complete Cryptographic SHA-256 implementation adhering to FIPS 180-4
class Sha256Engine {
public:
    Sha256Engine();
    void Reset();
    void Update(const uint8_t* data, size_t length);
    void Final(std::array<uint8_t, 32>& digest);

    static std::string ComputeHex(const uint8_t* data, size_t length);
    static std::string ComputeHex(const std::vector<uint8_t>& data);

private:
    uint32_t m_state[8];
    uint64_t m_count;
    uint8_t m_buffer[64];

    void Transform(const uint8_t data[64]);
};

struct SecurityPartitionMetadata {
    std::string partitionName;     // nvram, nvdata, efs, sec_efs, qcn, secro, protect1, protect2
    uint64_t sizeInBytes;
    std::string sha256Hex;
    std::string originalDeviceSerial;
    std::string timestampUtc;
    std::vector<uint8_t> binaryBlob;
};

struct MandatoryBackupArchive {
    std::string archiveId;
    std::string targetModel;
    std::string targetChipset;
    std::string compositeArchiveSha256;
    std::vector<SecurityPartitionMetadata> partitions;
    uint64_t createdAtUnixEpoch;
};

class MandatorySecurityBackupEngine {
public:
    static MandatoryBackupArchive CreateBackup(
        const std::string& model,
        const std::string& chipset,
        const std::string& serial,
        const std::vector<std::pair<std::string, std::vector<uint8_t>>>& rawPartitions
    );

    static bool VerifyBackupIntegrity(const MandatoryBackupArchive& archive, std::string& outMismatchError);
    static std::vector<uint8_t> SerializeArchive(const MandatoryBackupArchive& archive);
    static std::optional<MandatoryBackupArchive> DeserializeArchive(const uint8_t* data, size_t length);
};

} // namespace OmniFix::Security
