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
// Fallback stub definitions if libusb headers are not present on host
typedef struct libusb_context libusb_context;
typedef struct libusb_device_handle libusb_device_handle;
#endif

namespace OmniFix::Hardware::Silicon {

#pragma pack(push, 1)

enum class SaharaCommand : uint32_t {
    CMD_HELLO             = 0x01,
    CMD_HELLO_RESPONSE    = 0x02,
    CMD_READ_DATA         = 0x03,
    CMD_END_IMAGE_TX      = 0x04,
    CMD_DONE              = 0x05,
    CMD_DONE_RESPONSE     = 0x06,
    CMD_RESET             = 0x07
};

struct SaharaHeader {
    SaharaCommand command;
    uint32_t length;
};

struct SaharaHelloPacket {
    SaharaHeader header;
    uint32_t version;
    uint32_t min_version;
    uint32_t max_command_length;
    uint32_t mode;
    uint32_t reserved;
};

struct SaharaHelloResponsePacket {
    SaharaHeader header;
    uint32_t version;
    uint32_t min_version;
    uint32_t status; 
    uint32_t mode;
    uint32_t reserved;
};

struct SaharaReadDataPacket {
    SaharaHeader header;
    uint32_t image_id;
    uint32_t data_offset;
    uint32_t data_length;
};

#pragma pack(pop)

class SaharaProtocol {
public:
    SaharaProtocol();
    ~SaharaProtocol();

    SaharaProtocol(const SaharaProtocol&) = delete;
    SaharaProtocol& operator=(const SaharaProtocol&) = delete;

    bool ConnectToDevice();
    bool ExecuteSiliconHandshake(const std::vector<uint8_t>& raw_loader_stream, std::function<void(size_t, size_t)> progressCb = nullptr);

private:
    bool SendRawPacket(const uint8_t* data, size_t size);
    bool ReceiveRawPacket(uint8_t* buffer, size_t max_size, int& bytes_transferred);
    void HandleReadRequest(const SaharaReadDataPacket& read_req, const std::vector<uint8_t>& loader);

    libusb_context* m_usb_ctx;
    libusb_device_handle* m_dev_handle;
    std::mutex m_session_mutex;
    
    uint8_t m_endpoint_in;
    uint8_t m_endpoint_out;
    const int m_timeout_ms = 5000;
    const uint16_t QCOM_VID = 0x05C6;
    const uint16_t QCOM_PID = 0x9008;
};

} // namespace OmniFix::Hardware::Silicon
