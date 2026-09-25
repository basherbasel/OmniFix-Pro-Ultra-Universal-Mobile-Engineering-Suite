#include "protocols/spreadtrum_boot.hpp"
#include <algorithm>

namespace OmniFix::Protocols {

constexpr uint8_t HDLC_FLAG = 0x7E;
constexpr uint8_t HDLC_ESCAPE = 0x7D;
constexpr uint8_t HDLC_ESCAPE_MASK = 0x20;

SpreadtrumBootEngine::SpreadtrumBootEngine(SprdSendFn sendFn, SprdRecvFn recvFn)
    : m_sendFn(std::move(sendFn)), m_recvFn(std::move(recvFn)) {}

std::vector<uint8_t> SpreadtrumBootEngine::EncodeHdlcFrame(SprdCommand cmd, const uint8_t* payload, size_t payloadLen) {
    std::vector<uint8_t> frame;
    frame.push_back(HDLC_FLAG);

    auto appendEscaped = [&frame](uint8_t b) {
        if (b == HDLC_FLAG || b == HDLC_ESCAPE) {
            frame.push_back(HDLC_ESCAPE);
            frame.push_back(b ^ HDLC_ESCAPE_MASK);
        } else {
            frame.push_back(b);
        }
    };

    uint16_t cmdVal = static_cast<uint16_t>(cmd);
    appendEscaped((cmdVal >> 8) & 0xFF);
    appendEscaped(cmdVal & 0xFF);

    uint16_t lenVal = static_cast<uint16_t>(payloadLen);
    appendEscaped((lenVal >> 8) & 0xFF);
    appendEscaped(lenVal & 0xFF);

    for (size_t i = 0; i < payloadLen; ++i) {
        appendEscaped(payload[i]);
    }

    frame.push_back(HDLC_FLAG);
    return frame;
}

bool SpreadtrumBootEngine::DecodeHdlcFrame(const uint8_t* rawData, size_t rawLen, SprdCommand& outCmd, std::vector<uint8_t>& outPayload) {
    if (rawLen < 6 || rawData[0] != HDLC_FLAG || rawData[rawLen - 1] != HDLC_FLAG) {
        return false;
    }

    std::vector<uint8_t> unescaped;
    unescaped.reserve(rawLen);

    for (size_t i = 1; i < rawLen - 1; ++i) {
        if (rawData[i] == HDLC_ESCAPE && i + 1 < rawLen - 1) {
            unescaped.push_back(rawData[++i] ^ HDLC_ESCAPE_MASK);
        } else {
            unescaped.push_back(rawData[i]);
        }
    }

    if (unescaped.size() < 4) return false;

    outCmd = static_cast<SprdCommand>((unescaped[0] << 8) | unescaped[1]);
    uint16_t dataLen = (unescaped[2] << 8) | unescaped[3];

    outPayload.assign(unescaped.begin() + 4, unescaped.end());
    return outPayload.size() == dataLen;
}

bool SpreadtrumBootEngine::SendFrameAndVerifyAck(SprdCommand cmd, const uint8_t* data, size_t len, uint32_t timeoutMs) {
    auto frame = EncodeHdlcFrame(cmd, data, len);
    if (!m_sendFn(frame.data(), frame.size())) return false;

    uint8_t rxBuf[512];
    size_t rxLen = 0;
    if (!m_recvFn(rxBuf, sizeof(rxBuf), rxLen, timeoutMs)) return false;

    SprdCommand respCmd;
    std::vector<uint8_t> respPayload;
    if (!DecodeHdlcFrame(rxBuf, rxLen, respCmd, respPayload)) return false;

    return respCmd == SprdCommand::RepAck;
}

bool SpreadtrumBootEngine::HandshakeSync() {
    uint8_t connectData = 0;
    return SendFrameAndVerifyAck(SprdCommand::Connect, &connectData, 0, 1000);
}

bool SpreadtrumBootEngine::UploadFdl1(uint32_t loadAddress, const std::vector<uint8_t>& fdl1Payload) {
    uint8_t startPayload[8];
    startPayload[0] = (loadAddress >> 24) & 0xFF;
    startPayload[1] = (loadAddress >> 16) & 0xFF;
    startPayload[2] = (loadAddress >> 8) & 0xFF;
    startPayload[3] = loadAddress & 0xFF;

    uint32_t totalSize = fdl1Payload.size();
    startPayload[4] = (totalSize >> 24) & 0xFF;
    startPayload[5] = (totalSize >> 16) & 0xFF;
    startPayload[6] = (totalSize >> 8) & 0xFF;
    startPayload[7] = totalSize & 0xFF;

    if (!SendFrameAndVerifyAck(SprdCommand::StartData, startPayload, 8)) return false;

    const size_t chunkSize = 1024;
    for (size_t offset = 0; offset < totalSize; offset += chunkSize) {
        size_t currentChunk = std::min(chunkSize, totalSize - offset);
        if (!SendFrameAndVerifyAck(SprdCommand::MidData, fdl1Payload.data() + offset, currentChunk)) {
            return false;
        }
    }

    return SendFrameAndVerifyAck(SprdCommand::EndData, nullptr, 0);
}

bool SpreadtrumBootEngine::ExecuteFdl1(uint32_t execAddress) {
    return SendFrameAndVerifyAck(SprdCommand::ExecData, nullptr, 0, 3000);
}

bool SpreadtrumBootEngine::UploadFdl2(uint32_t loadAddress, const std::vector<uint8_t>& fdl2Payload) {
    return UploadFdl1(loadAddress, fdl2Payload);
}

} // namespace OmniFix::Protocols
