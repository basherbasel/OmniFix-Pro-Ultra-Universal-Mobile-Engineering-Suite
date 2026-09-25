#pragma once

#include <cstdint>
#include <vector>
#include <string>
#include <functional>
#include <optional>

namespace OmniFix::Protocols {

#pragma pack(push, 1)

// Standard Qualcomm Sahara Protocol Packet Definitions
enum class SaharaCommand : uint32_t {
    Hello = 0x01,
    HelloResponse = 0x02,
    ReadData = 0x03,
    EndImageTransfer = 0x04,
    Done = 0x05,
    DoneResponse = 0x06,
    Reset = 0x07,
    ResetResponse = 0x08,
    MemoryDebug = 0x09,
    MemoryRead = 0x0A,
    CommandReady = 0x0B,
    CommandExecute = 0x0C,
    CommandExecuteResponse = 0x0D,
    CommandExecuteData = 0x0E
};

enum class SaharaStatus : uint32_t {
    Success = 0x00,
    InvalidCmd = 0x01,
    ProtocolMismatch = 0x02,
    InvalidTargetProtocol = 0x03,
    InvalidParam = 0x04,
    InvalidPacketSize = 0x05,
    UnexpectedPacket = 0x06,
    InvalidData = 0x07,
    AuthFailed = 0x08,
    TimeoutRx = 0x09,
    TimeoutTx = 0x0A,
    InvalidMode = 0x0B,
    MemoryReadError = 0x0C,
    InvalidImgId = 0x0D
};

struct SaharaPacketHeader {
    SaharaCommand command;
    uint32_t length;
};

struct SaharaHelloPacket {
    SaharaPacketHeader header;
    uint32_t version;
    uint32_t versionSupported;
    uint32_t targetCommandPacketLength;
    uint32_t mode;
    uint32_t reserved[6];
};

struct SaharaHelloResponsePacket {
    SaharaPacketHeader header;
    uint32_t version;
    uint32_t versionSupported;
    SaharaStatus status;
    uint32_t mode;
    uint32_t reserved[6];
};

struct SaharaReadDataPacket {
    SaharaPacketHeader header;
    uint32_t imageId;
    uint32_t dataOffset;
    uint32_t dataLength;
};

struct SaharaDonePacket {
    SaharaPacketHeader header;
};

struct SaharaResetPacket {
    SaharaPacketHeader header;
};

#pragma pack(pop)

using SendRawPacketFn = std::function<bool(const uint8_t* data, size_t length)>;
using ReceiveRawPacketFn = std::function<bool(uint8_t* buffer, size_t bufferSize, size_t& bytesRead, uint32_t timeoutMs)>;

class QualcommSaharaEngine {
public:
    QualcommSaharaEngine(SendRawPacketFn sendFn, ReceiveRawPacketFn recvFn);

    bool ExecuteHandshake(uint32_t requestedMode = 0);
    bool SendProgrammer(uint32_t imageId, const std::vector<uint8_t>& elfPayload, std::function<void(size_t sent, size_t total)> progressCb = nullptr);
    bool SwitchToFirehose();
    bool ResetDevice();

    uint32_t GetTargetVersion() const { return m_targetVersion; }
    uint32_t GetTargetMode() const { return m_targetMode; }
    std::string GetLastStatusMessage() const { return m_statusMessage; }

private:
    SendRawPacketFn m_sendFn;
    ReceiveRawPacketFn m_recvFn;
    uint32_t m_targetVersion{0};
    uint32_t m_targetMaxPacketSize{1024};
    uint32_t m_targetMode{0};
    std::string m_statusMessage;

    bool ReadPacket(std::vector<uint8_t>& buffer, uint32_t timeoutMs = 3000);
};

// Qualcomm Firehose XML Command Generator
class QualcommFirehoseEngine {
public:
    static std::string BuildConfigureXml(uint32_t maxPayloadSizeToTargetInBytes = 1048576, const std::string& memoryType = "ufs", bool verbose = false);
    static std::string BuildSetBootableStorageDriveXml(uint32_t driveNumber = 0);
    static std::string BuildProgramXml(const std::string& partitionName, uint64_t startSector, uint64_t numPartitionSectors, uint32_t sectorSizeInBytes = 4096);
    static std::string BuildReadXml(const std::string& partitionName, uint64_t startSector, uint64_t numPartitionSectors, uint32_t sectorSizeInBytes = 4096);
    static std::string BuildEraseXml(uint64_t startSector, uint64_t numPartitionSectors, uint32_t sectorSizeInBytes = 4096);
    static std::string BuildResetXml();
    static std::string BuildNopXml();
    static bool ParseFirehoseResponse(const std::string& xmlResponse, std::string& outRawValue, bool& outSuccess);
};

} // namespace OmniFix::Protocols
