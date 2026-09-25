#include "silicon/UnisocFdlProtocol.hpp"
#include <thread>
#include <chrono>
#include <iostream>

#if defined(HAVE_LIBUSB)
#include <libusb-1.0/libusb.h>
#endif

namespace OmniFix::Hardware::Silicon {

constexpr uint8_t HDLC_FLAG = 0x7E;
constexpr uint8_t HDLC_ESCAPE = 0x7D;
constexpr uint8_t HDLC_ESCAPE_MASK = 0x20;

UnisocFdlProtocol::UnisocFdlProtocol()
    : m_usb_ctx(nullptr), m_dev_handle(nullptr), m_endpoint_in(0x81), m_endpoint_out(0x02) {
#if defined(HAVE_LIBUSB)
    libusb_init(&m_usb_ctx);
#endif
}

UnisocFdlProtocol::~UnisocFdlProtocol() {
#if defined(HAVE_LIBUSB)
    if (m_dev_handle) {
        libusb_release_interface(m_dev_handle, 0);
        libusb_close(m_dev_handle);
    }
    if (m_usb_ctx) {
        libusb_exit(m_usb_ctx);
    }
#endif
}

bool UnisocFdlProtocol::ConnectToDevice() {
    std::lock_guard<std::mutex> lock(m_session_mutex);

#if defined(HAVE_LIBUSB)
    m_dev_handle = libusb_open_device_with_vid_pid(m_usb_ctx, SPRD_VID, SPRD_PID);
    if (!m_dev_handle) {
        std::cerr << "[!] Error: Unisoc/Spreadtrum Boot device (1782:4D00) not detected on Bench.\n";
        return false;
    }

    if (libusb_kernel_driver_active(m_dev_handle, 0) == 1) {
        libusb_detach_kernel_driver(m_dev_handle, 0);
    }

    if (libusb_claim_interface(m_dev_handle, 0) < 0) {
        std::cerr << "[!] Error: Failed to claim Unisoc USB Bulk interface.\n";
        return false;
    }

    std::cout << "[+] Hardware: Anchored successfully to Unisoc Silicon Endpoint (1782:4D00).\n";
    return true;
#else
    std::cout << "[+] Hardware: Unisoc USB Endpoint Interface ready (Stub compiled).\n";
    return true;
#endif
}

std::vector<uint8_t> UnisocFdlProtocol::PackHdlcFrame(SprdBootCmd cmd, const uint8_t* payload, size_t payload_len) {
    std::vector<uint8_t> unescaped;
    uint16_t cmdVal = static_cast<uint16_t>(cmd);
    
    // Header: Type (Big Endian) + Length (Big Endian)
    unescaped.push_back(static_cast<uint8_t>((cmdVal >> 8) & 0xFF));
    unescaped.push_back(static_cast<uint8_t>(cmdVal & 0xFF));
    unescaped.push_back(static_cast<uint8_t>((payload_len >> 8) & 0xFF));
    unescaped.push_back(static_cast<uint8_t>(payload_len & 0xFF));

    if (payload && payload_len > 0) {
        unescaped.insert(unescaped.end(), payload, payload + payload_len);
    }

    // HDLC Byte Stuffing
    std::vector<uint8_t> framed;
    framed.push_back(HDLC_FLAG);
    for (uint8_t b : unescaped) {
        if (b == HDLC_FLAG || b == HDLC_ESCAPE) {
            framed.push_back(HDLC_ESCAPE);
            framed.push_back(b ^ HDLC_ESCAPE_MASK);
        } else {
            framed.push_back(b);
        }
    }
    framed.push_back(HDLC_FLAG);
    return framed;
}

bool UnisocFdlProtocol::UnpackHdlcFrame(const uint8_t* raw_buf, size_t raw_len, SprdBootCmd& out_cmd, std::vector<uint8_t>& out_payload) {
    if (raw_len < 6) return false;

    // Remove HDLC framing and unstuff bytes
    std::vector<uint8_t> unstuffed;
    bool in_escape = false;

    for (size_t i = 0; i < raw_len; ++i) {
        uint8_t b = raw_buf[i];
        if (b == HDLC_FLAG) continue;

        if (b == HDLC_ESCAPE) {
            in_escape = true;
            continue;
        }

        if (in_escape) {
            unstuffed.push_back(b ^ HDLC_ESCAPE_MASK);
            in_escape = false;
        } else {
            unstuffed.push_back(b);
        }
    }

    if (unstuffed.size() < 4) return false;

    uint16_t cmdVal = (static_cast<uint16_t>(unstuffed[0]) << 8) | unstuffed[1];
    uint16_t dataLen = (static_cast<uint16_t>(unstuffed[2]) << 8) | unstuffed[3];

    out_cmd = static_cast<SprdBootCmd>(cmdVal);
    out_payload.clear();
    if (unstuffed.size() >= 4 + dataLen) {
        out_payload.assign(unstuffed.begin() + 4, unstuffed.begin() + 4 + dataLen);
    }
    return true;
}

bool UnisocFdlProtocol::SendFrame(const std::vector<uint8_t>& frame) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    int transferred = 0;
    int r = libusb_bulk_transfer(m_dev_handle, m_endpoint_out, const_cast<uint8_t*>(frame.data()), frame.size(), &transferred, m_timeout_ms);
    return (r == 0 && static_cast<size_t>(transferred) == frame.size());
#else
    return true;
#endif
}

bool UnisocFdlProtocol::ReceiveFrame(SprdBootCmd& out_cmd, std::vector<uint8_t>& out_payload, int timeout_ms) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    std::vector<uint8_t> rx_buf(4096);
    int transferred = 0;
    int r = libusb_bulk_transfer(m_dev_handle, m_endpoint_in, rx_buf.data(), rx_buf.size(), &transferred, timeout_ms);
    if (r != 0 || transferred < 6) return false;

    return UnpackHdlcFrame(rx_buf.data(), transferred, out_cmd, out_payload);
#else
    out_cmd = SprdBootCmd::BSL_REP_ACK;
    return true;
#endif
}

bool UnisocFdlProtocol::ExecuteFdl1Handshake(const std::vector<uint8_t>& fdl1_binary, uint32_t ram_exec_address, std::function<void(size_t, size_t)> progressCb) {
    std::lock_guard<std::mutex> lock(m_session_mutex);

    std::cout << "[*] Unisoc: Initiating BSL_CMD_CONNECT Handshake...\n";

    // 1. Send Check Baud Sequence (0x7E repeated)
    std::vector<uint8_t> baudSeq(32, HDLC_FLAG);
    SendFrame(baudSeq);
    std::this_thread::sleep_for(std::chrono::milliseconds(50));

    // 2. Connect command
    auto connectFrame = PackHdlcFrame(SprdBootCmd::BSL_CMD_CONNECT, nullptr, 0);
    if (!SendFrame(connectFrame)) {
        std::cerr << "[!] Error: Failed to transmit BSL_CMD_CONNECT.\n";
        return false;
    }

    SprdBootCmd respCmd;
    std::vector<uint8_t> respPayload;
    if (!ReceiveFrame(respCmd, respPayload) || respCmd != SprdBootCmd::BSL_REP_ACK) {
        std::cerr << "[!] Error: Device did not acknowledge BSL_CMD_CONNECT.\n";
        return false;
    }
    std::cout << "[+] Unisoc BSL: Connection confirmed by BROM hardware.\n";

    // 3. Start Data command with RAM base address & total size
    uint8_t startPayload[8];
    startPayload[0] = (ram_exec_address >> 24) & 0xFF;
    startPayload[1] = (ram_exec_address >> 16) & 0xFF;
    startPayload[2] = (ram_exec_address >> 8) & 0xFF;
    startPayload[3] = ram_exec_address & 0xFF;

    uint32_t fdlSize = fdl1_binary.size();
    startPayload[4] = (fdlSize >> 24) & 0xFF;
    startPayload[5] = (fdlSize >> 16) & 0xFF;
    startPayload[6] = (fdlSize >> 8) & 0xFF;
    startPayload[7] = fdlSize & 0xFF;

    auto startFrame = PackHdlcFrame(SprdBootCmd::BSL_CMD_START_DATA, startPayload, 8);
    SendFrame(startFrame);
    if (!ReceiveFrame(respCmd, respPayload) || respCmd != SprdBootCmd::BSL_REP_ACK) {
        std::cerr << "[!] Error: Start Data layout rejected by BROM.\n";
        return false;
    }

    // 4. Stream FDL1 in chunks of 1024 bytes (BSL_CMD_MID_DATA)
    const size_t chunkSize = 1024;
    size_t offset = 0;
    while (offset < fdlSize) {
        size_t currentLen = std::min(chunkSize, fdlSize - offset);
        auto midFrame = PackHdlcFrame(SprdBootCmd::BSL_CMD_MID_DATA, fdl1_binary.data() + offset, currentLen);
        if (!SendFrame(midFrame)) return false;

        if (!ReceiveFrame(respCmd, respPayload) || respCmd != SprdBootCmd::BSL_REP_ACK) {
            std::cerr << "[!] Error: MID_DATA chunk rejected at offset " << offset << "\n";
            return false;
        }

        offset += currentLen;
        if (progressCb) progressCb(offset, fdlSize);
    }

    // 5. End Data
    auto endFrame = PackHdlcFrame(SprdBootCmd::BSL_CMD_END_DATA, nullptr, 0);
    SendFrame(endFrame);
    if (!ReceiveFrame(respCmd, respPayload) || respCmd != SprdBootCmd::BSL_REP_ACK) {
        std::cerr << "[!] Error: END_DATA rejected.\n";
        return false;
    }

    // 6. Execute FDL1 from SRAM
    auto execFrame = PackHdlcFrame(SprdBootCmd::BSL_CMD_EXEC_DATA, nullptr, 0);
    SendFrame(execFrame);
    if (!ReceiveFrame(respCmd, respPayload) || respCmd != SprdBootCmd::BSL_REP_ACK) {
        std::cerr << "[!] Error: FDL1 execution failed.\n";
        return false;
    }

    std::cout << "[🏁] Unisoc Success: FDL1 is active in SRAM. Ready for high-speed FDL2 Flasher agent.\n";
    return true;
}

bool UnisocFdlProtocol::ExecuteFdl2Handshake(const std::vector<uint8_t>& fdl2_binary, uint32_t ram_exec_address, std::function<void(size_t, size_t)> progressCb) {
    // The FDL2 upload follows the same packet protocol through FDL1 memory coordinator
    return ExecuteFdl1Handshake(fdl2_binary, ram_exec_address, progressCb);
}

} // namespace OmniFix::Hardware::Silicon
