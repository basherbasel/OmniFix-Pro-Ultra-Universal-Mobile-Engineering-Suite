#include "protocols/mediatek_brom.hpp"
#include <thread>
#include <chrono>
#include <sstream>
#include <iomanip>

namespace OmniFix::Protocols {

MediaTekBromEngine::MediaTekBromEngine(MtkSendByteFn sendFn, MtkRecvByteFn recvFn)
    : m_sendFn(std::move(sendFn)), m_recvFn(std::move(recvFn)) {}

bool MediaTekBromEngine::ConnectBromHandshake(uint32_t maxAttempts) {
    const uint8_t handshakePattern[4] = {0xA0, 0x0A, 0x50, 0x05};

    for (uint32_t attempt = 0; attempt < maxAttempts; ++attempt) {
        bool patternSuccess = true;
        for (int i = 0; i < 4; ++i) {
            uint8_t byteToSend = handshakePattern[i];
            if (!m_sendFn(&byteToSend, 1)) {
                patternSuccess = false;
                break;
            }

            uint8_t echoByte = 0;
            if (!m_recvFn(&echoByte, 1, 300) || echoByte != static_cast<uint8_t>(~byteToSend)) {
                patternSuccess = false;
                break;
            }
        }

        if (patternSuccess) {
            return true;
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(20));
    }

    m_lastError = "MediaTek BROM synchronization handshake sequence timed out";
    return false;
}

bool MediaTekBromEngine::SendCommand(MtkBromCommand cmd) {
    uint8_t byte = static_cast<uint8_t>(cmd);
    if (!m_sendFn(&byte, 1)) return false;

    uint8_t echo = 0;
    return m_recvFn(&echo, 1, 500) && echo == byte;
}

bool MediaTekBromEngine::ReadWord16(uint16_t& outVal) {
    uint8_t raw[2] = {0};
    if (!m_recvFn(raw, 2, 500)) return false;
    outVal = (static_cast<uint16_t>(raw[0]) << 8) | raw[1];
    return true;
}

bool MediaTekBromEngine::QueryChipIdentity(MtkChipIdentity& outIdentity) {
    if (!SendCommand(MtkBromCommand::GetHwCode)) {
        m_lastError = "Failed to query CMD_GET_HW_CODE";
        return false;
    }
    if (!ReadWord16(outIdentity.hwCode)) return false;

    if (!SendCommand(MtkBromCommand::GetHwSubCode)) return false;
    if (!ReadWord16(outIdentity.hwSubCode)) return false;

    if (!SendCommand(MtkBromCommand::GetHwVer)) return false;
    if (!ReadWord16(outIdentity.hwVer)) return false;

    if (!SendCommand(MtkBromCommand::GetSwVer)) return false;
    if (!ReadWord16(outIdentity.swVer)) return false;

    // Translate SoC Hardware Code
    std::ostringstream ss;
    switch (outIdentity.hwCode) {
        case 0x6765: ss << "MediaTek Helio G35/P35 (MT6765)"; outIdentity.isSlaProtected = true; break;
        case 0x6768: ss << "MediaTek Helio G80/G85 (MT6768)"; outIdentity.isSlaProtected = true; break;
        case 0x6785: ss << "MediaTek Helio G90/G95 (MT6785)"; outIdentity.isSlaProtected = true; break;
        case 0x6877: ss << "MediaTek Dimensity 900/1080 (MT6877)"; outIdentity.isSlaProtected = true; break;
        case 0x6895: ss << "MediaTek Dimensity 8100/8200 (MT6895)"; outIdentity.isSlaProtected = true; break;
        case 0x6989: ss << "MediaTek Dimensity 9300/9400 (MT6989)"; outIdentity.isSlaProtected = true; break;
        default:
            ss << "MediaTek Unknown SoC (0x" << std::hex << std::uppercase << outIdentity.hwCode << ")";
            outIdentity.isSlaProtected = false;
            break;
    }
    outIdentity.chipName = ss.str();
    return true;
}

bool MediaTekBromEngine::WriteReg32(uint32_t address, uint32_t value) {
    uint8_t cmdPacket[9];
    cmdPacket[0] = static_cast<uint8_t>(MtkBromCommand::Write32);
    cmdPacket[1] = (address >> 24) & 0xFF;
    cmdPacket[2] = (address >> 16) & 0xFF;
    cmdPacket[3] = (address >> 8) & 0xFF;
    cmdPacket[4] = address & 0xFF;
    cmdPacket[5] = (value >> 24) & 0xFF;
    cmdPacket[6] = (value >> 16) & 0xFF;
    cmdPacket[7] = (value >> 8) & 0xFF;
    cmdPacket[8] = value & 0xFF;

    if (!m_sendFn(cmdPacket, 9)) return false;

    uint8_t status = 0xFF;
    return m_recvFn(&status, 1, 500) && status == 0x00;
}

bool MediaTekBromEngine::DisableWatchdogTimer(uint32_t wdtBaseAddress) {
    // MediaTek WDT disable pattern: write 0x2200 to WDT_MODE register
    return WriteReg32(wdtBaseAddress, 0x22000000);
}

bool MediaTekBromEngine::UploadDownloadAgent(uint32_t loadAddress, const std::vector<uint8_t>& daPayload, std::function<void(size_t, size_t)> progressCb) {
    uint8_t cmd[9];
    cmd[0] = static_cast<uint8_t>(MtkBromCommand::SendDa);
    cmd[1] = (loadAddress >> 24) & 0xFF;
    cmd[2] = (loadAddress >> 16) & 0xFF;
    cmd[3] = (loadAddress >> 8) & 0xFF;
    cmd[4] = loadAddress & 0xFF;

    uint32_t size = daPayload.size();
    cmd[5] = (size >> 24) & 0xFF;
    cmd[6] = (size >> 16) & 0xFF;
    cmd[7] = (size >> 8) & 0xFF;
    cmd[8] = size & 0xFF;

    if (!m_sendFn(cmd, 9)) {
        m_lastError = "Failed to dispatch CMD_SEND_DA";
        return false;
    }

    uint8_t ack = 0xFF;
    if (!m_recvFn(&ack, 1, 1000) || ack != 0x00) {
        m_lastError = "Target rejected CMD_SEND_DA parameters";
        return false;
    }

    // Stream DA bytes
    const size_t chunkSize = 4096;
    for (size_t offset = 0; offset < size; offset += chunkSize) {
        size_t currentChunk = std::min(chunkSize, size - offset);
        if (!m_sendFn(daPayload.data() + offset, currentChunk)) {
            m_lastError = "Transmission failed during DA payload streaming";
            return false;
        }
        if (progressCb) {
            progressCb(offset + currentChunk, size);
        }
    }

    // Receive checksum validation
    uint16_t checksum = 0;
    if (!ReadWord16(checksum)) {
        m_lastError = "Target failed to acknowledge DA checksum";
        return false;
    }

    return true;
}

bool MediaTekBromEngine::JumpToDownloadAgent(uint32_t jumpAddress) {
    uint8_t cmd[5];
    cmd[0] = static_cast<uint8_t>(MtkBromCommand::JumpDa);
    cmd[1] = (jumpAddress >> 24) & 0xFF;
    cmd[2] = (jumpAddress >> 16) & 0xFF;
    cmd[3] = (jumpAddress >> 8) & 0xFF;
    cmd[4] = jumpAddress & 0xFF;

    if (!m_sendFn(cmd, 5)) return false;

    uint8_t ack = 0xFF;
    return m_recvFn(&ack, 1, 2000) && ack == 0x00;
}

} // namespace OmniFix::Protocols
