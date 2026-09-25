#pragma once

#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <cstdint>
#include <memory>
#include <mutex>
#include <functional>

#if defined(HAVE_LIBUSB)
#include <libusb-1.0/libusb.h>
#else
typedef struct libusb_context libusb_context;
typedef struct libusb_device_handle libusb_device_handle;
#endif

namespace OmniFix::Hardware::Silicon {

#pragma pack(push, 1)

// Standard USB DFU Request Codes (USB Device Class Specification for DFU v1.1)
enum class DfuRequest : uint8_t {
    DFU_DETACH    = 0,
    DFU_DNLOAD    = 1,
    DFU_UPLOAD    = 2,
    DFU_GETSTATUS = 3,
    DFU_CLRSTATUS = 4,
    DFU_GETSTATE  = 5,
    DFU_ABORT     = 6
};

struct DfuStatusResponse {
    uint8_t status;
    uint8_t poll_timeout[3];
    uint8_t state;
    uint8_t string_index;
};

#pragma pack(pop)

struct AppleDeviceInfo {
    uint16_t cpid;              // Chip ID (e.g., 0x8960 for A7, 0x8030 for A13, 0x8130 for A17/A18)
    uint8_t  cprv;              // Chip Revision
    uint8_t  bdid;              // Board ID
    uint64_t ecid;              // Exclusive Chip ID (64-bit hardware serial)
    uint32_t ibfl;              // iBoot flags
    std::string srtc;           // Secure ROM certificate / nonce
    std::string serialNumber;   // Raw USB serial string
    std::string mode;           // "DFU", "Recovery", "Restore", "Normal"
    bool isPwned;               // checkm8 / pwned DFU state
};

class AppleDfuRecoveryProtocol {
public:
    AppleDfuRecoveryProtocol();
    ~AppleDfuRecoveryProtocol();

    AppleDfuRecoveryProtocol(const AppleDfuRecoveryProtocol&) = delete;
    AppleDfuRecoveryProtocol& operator=(const AppleDfuRecoveryProtocol&) = delete;

    // Connect to Apple Device via libusb (DFU: 05AC:1227 or Recovery: 05AC:1281)
    bool ConnectToDevice();

    // Query hardware parameters from USB descriptor (CPID, CPRV, BDID, ECID, IBFL, PWND)
    bool QueryHardwareParameters(AppleDeviceInfo& out_info);

    // Send payload chunk via DFU_DNLOAD control transfers
    bool DfuSendChunk(uint16_t block_num, const uint8_t* data, size_t size);

    // Send zero-length block to terminate DFU_DNLOAD sequence and trigger execution
    bool DfuFinishTransfer();

    // Get current DFU state and status
    bool DfuGetStatus(DfuStatusResponse& out_status);

    // Reset USB device to boot into normal/recovery mode
    bool DfuResetDevice();

    // Upload custom SSH Ramdisk kernel & filesystem for offline forensic acquisition / repair
    bool StreamRamdiskPayload(
        const std::vector<uint8_t>& ibss_img,
        const std::vector<uint8_t>& ibec_img,
        const std::vector<uint8_t>& ramdisk_img,
        const std::vector<uint8_t>& devicetree_img,
        const std::vector<uint8_t>& trustcache_img,
        const std::vector<uint8_t>& kernel_img,
        std::function<void(const std::string& stage, size_t current, size_t total)> progressCb = nullptr
    );

private:
    bool ParseSerialDescriptor(const std::string& serial_desc, AppleDeviceInfo& out_info);

    libusb_context* m_usb_ctx;
    libusb_device_handle* m_dev_handle;
    std::mutex m_session_mutex;

    const uint16_t APPLE_VID = 0x05AC;
    const uint16_t APPLE_PID_DFU = 0x1227;
    const uint16_t APPLE_PID_RECOVERY = 0x1281;
    const int m_control_timeout_ms = 5000;
};

} // namespace OmniFix::Hardware::Silicon
