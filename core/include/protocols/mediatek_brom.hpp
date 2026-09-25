#pragma once

#include <cstdint>
#include <vector>
#include <string>
#include <functional>

namespace OmniFix::Protocols {

enum class MtkBromCommand : uint8_t {
    GetHwCode = 0xFD,
    GetHwSubCode = 0xFC,
    GetHwVer = 0xFF,
    GetSwVer = 0xFE,
    SendDa = 0xD7,
    JumpDa = 0xD5,
    Write16 = 0xD2,
    Read16 = 0xD0,
    Write32 = 0xD4,
    Read32 = 0xD1
};

struct MtkChipIdentity {
    uint16_t hwCode;
    uint16_t hwSubCode;
    uint16_t hwVer;
    uint16_t swVer;
    std::string chipName;
    bool isSlaProtected;
};

using MtkSendByteFn = std::function<bool(const uint8_t* data, size_t length)>;
using MtkRecvByteFn = std::function<bool(uint8_t* buffer, size_t length, uint32_t timeoutMs)>;

class MediaTekBromEngine {
public:
    MediaTekBromEngine(MtkSendByteFn sendFn, MtkRecvByteFn recvFn);

    bool ConnectBromHandshake(uint32_t maxAttempts = 10);
    bool QueryChipIdentity(MtkChipIdentity& outIdentity);
    bool DisableWatchdogTimer(uint32_t wdtBaseAddress = 0x10007000);
    bool UploadDownloadAgent(uint32_t loadAddress, const std::vector<uint8_t>& daPayload, std::function<void(size_t, size_t)> progressCb = nullptr);
    bool JumpToDownloadAgent(uint32_t jumpAddress);

    std::string GetLastError() const { return m_lastError; }

private:
    MtkSendByteFn m_sendFn;
    MtkRecvByteFn m_recvFn;
    std::string m_lastError;

    bool SendCommand(MtkBromCommand cmd);
    bool ReadWord16(uint16_t& outVal);
    bool WriteReg32(uint32_t address, uint32_t value);
};

} // namespace OmniFix::Protocols
