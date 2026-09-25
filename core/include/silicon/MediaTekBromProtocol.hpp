#pragma once

#include <iostream>
#include <vector>
#include <cstdint>
#include <memory>
#include <mutex>
#include <cstring>
#include <stdexcept>

#if defined(HAVE_LIBUSB)
#include <libusb-1.0/libusb.h>
#else
typedef struct libusb_context libusb_context;
typedef struct libusb_device_handle libusb_device_handle;
#endif

namespace OmniFix::Hardware::Silicon {

enum class BromCommand : uint8_t {
    CMD_START             = 0xA0,
    CMD_READ16            = 0xA2,
    CMD_WRITE16           = 0xA1,
    CMD_SEND_DA           = 0xD0,
    CMD_GET_CHIP_ID       = 0xE3,
    CMD_RUN_DA            = 0x7E
};

class MediaTekBromProtocol {
public:
    MediaTekBromProtocol();
    ~MediaTekBromProtocol();

    MediaTekBromProtocol(const MediaTekBromProtocol&) = delete;
    MediaTekBromProtocol& operator=(const MediaTekBromProtocol&) = delete;

    bool ConnectToDevice();
    bool ExecuteBromHandshake(const std::vector<uint8_t>& da_binary_stream);

private:
    bool SendByte(uint8_t byte);
    bool SendBuffer(const uint8_t* data, size_t size);
    bool ReadByte(uint8_t& byte);
    bool ReadBuffer(uint8_t* buffer, size_t size);
    bool VerifyEcho(uint8_t sent_byte);

    libusb_context* m_usb_ctx;
    libusb_device_handle* m_dev_handle;
    std::mutex m_session_mutex;

    uint8_t m_endpoint_in;
    uint8_t m_endpoint_out;
    const int m_timeout_ms = 3000;
    const uint16_t MTK_VID = 0x0E8D;
    const uint16_t MTK_PID = 0x0003;
};

} // namespace OmniFix::Hardware::Silicon
