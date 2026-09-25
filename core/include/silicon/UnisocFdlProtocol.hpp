#pragma once

#include <iostream>
#include <vector>
#include <cstdint>
#include <memory>
#include <mutex>
#include <cstring>
#include <stdexcept>
#include <functional>

#if defined(HAVE_LIBUSB)
#include <libusb-1.0/libusb.h>
#else
typedef struct libusb_context libusb_context;
typedef struct libusb_device_handle libusb_device_handle;
#endif

namespace OmniFix::Hardware::Silicon {

#pragma pack(push, 1)

// Standard Spreadtrum / Unisoc Boot ROM Protocol Commands (2026 specification)
enum class SprdBootCmd : uint16_t {
    BSL_CMD_CHECK_BAUD       = 0x7E,
    BSL_CMD_CONNECT          = 0x00,
    BSL_CMD_START_DATA       = 0x01,
    BSL_CMD_MID_DATA         = 0x02,
    BSL_CMD_END_DATA         = 0x03,
    BSL_CMD_EXEC_DATA        = 0x04,
    BSL_REP_ACK              = 0x80,
    BSL_REP_VER              = 0x81,
    BSL_REP_INCOMPATIBLE_VER = 0x9B,
    BSL_CMD_READ_FLASH       = 0x06,
    BSL_CMD_READ_PARTITION   = 0x12,
    BSL_CMD_POWER_OFF        = 0x10
};

struct SprdPacketHeader {
    uint16_t type;    // Little-endian SprdBootCmd
    uint16_t length;  // Length of payload
};

#pragma pack(pop)

class UnisocFdlProtocol {
public:
    UnisocFdlProtocol();
    ~UnisocFdlProtocol();

    UnisocFdlProtocol(const UnisocFdlProtocol&) = delete;
    UnisocFdlProtocol& operator=(const UnisocFdlProtocol&) = delete;

    // Connect to Unisoc USB Serial (VID: 0x1782, PID: 0x4D00)
    bool ConnectToDevice();

    // Handshake and upload FDL1 into internal SRAM, then transfer execution
    bool ExecuteFdl1Handshake(
        const std::vector<uint8_t>& fdl1_binary,
        uint32_t ram_exec_address = 0x50000000,
        std::function<void(size_t written, size_t total)> progressCb = nullptr
    );

    // Handshake and upload FDL2 (NAND/eMMC/UFS flasher agent) into high memory
    bool ExecuteFdl2Handshake(
        const std::vector<uint8_t>& fdl2_binary,
        uint32_t ram_exec_address = 0x9F000000,
        std::function<void(size_t written, size_t total)> progressCb = nullptr
    );

private:
    std::vector<uint8_t> PackHdlcFrame(SprdBootCmd cmd, const uint8_t* payload, size_t payload_len);
    bool UnpackHdlcFrame(const uint8_t* raw_buf, size_t raw_len, SprdBootCmd& out_cmd, std::vector<uint8_t>& out_payload);

    bool SendFrame(const std::vector<uint8_t>& frame);
    bool ReceiveFrame(SprdBootCmd& out_cmd, std::vector<uint8_t>& out_payload, int timeout_ms = 3000);

    libusb_context* m_usb_ctx;
    libusb_device_handle* m_dev_handle;
    std::mutex m_session_mutex;

    uint8_t m_endpoint_in;
    uint8_t m_endpoint_out;
    const int m_timeout_ms = 4000;
    const uint16_t SPRD_VID = 0x1782;
    const uint16_t SPRD_PID = 0x4D00; // Unisoc USB Serial / Boot mode
};

} // namespace OmniFix::Hardware::Silicon
