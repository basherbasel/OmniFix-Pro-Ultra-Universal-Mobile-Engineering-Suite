#pragma once

#include <cstdint>
#include <vector>
#include <string>
#include <functional>

namespace OmniFix::Protocols {

enum class SprdCommand : uint16_t {
    CheckBaud = 0x00,
    Connect = 0x01,
    StartData = 0x02,
    MidData = 0x03,
    EndData = 0x04,
    ExecData = 0x05,
    NormalReset = 0x06,
    ReadFlash = 0x07,
    RepAck = 0x80,
    RepVer = 0x81
};

using SprdSendFn = std::function<bool(const uint8_t*, size_t)>;
using SprdRecvFn = std::function<bool(uint8_t*, size_t, size_t&, uint32_t)>;

class SpreadtrumBootEngine {
public:
    SpreadtrumBootEngine(SprdSendFn sendFn, SprdRecvFn recvFn);

    bool HandshakeSync();
    bool UploadFdl1(uint32_t loadAddress, const std::vector<uint8_t>& fdl1Payload);
    bool ExecuteFdl1(uint32_t execAddress);
    bool UploadFdl2(uint32_t loadAddress, const std::vector<uint8_t>& fdl2Payload);

    static std::vector<uint8_t> EncodeHdlcFrame(SprdCommand cmd, const uint8_t* payload, size_t payloadLen);
    static bool DecodeHdlcFrame(const uint8_t* rawData, size_t rawLen, SprdCommand& outCmd, std::vector<uint8_t>& outPayload);

private:
    SprdSendFn m_sendFn;
    SprdRecvFn m_recvFn;
    std::string m_lastError;

    bool SendFrameAndVerifyAck(SprdCommand cmd, const uint8_t* data, size_t len, uint32_t timeoutMs = 2000);
};

} // namespace OmniFix::Protocols
