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

namespace OmniFix::Protocols {

enum class FastbootResponseType {
    OKAY,
    FAIL,
    DATA,
    INFO,
    UNKNOWN
};

struct FastbootDeviceState {
    std::string product;
    std::string serialno;
    std::string currentSlot;
    std::string bootloaderVersion;
    std::string basebandVersion;
    bool isUserspace;          // true = Fastbootd (Dynamic Partitions active)
    bool isUnlocked;           // OEM bootloader unlocked
    bool hasSlotSupport;       // A/B seamless update support
    uint64_t maxDownloadSize;  // e.g. 536870912 (512MB)
    std::map<std::string, std::string> allVariables;
};

class UniversalFastbootEngine {
public:
    UniversalFastbootEngine();
    ~UniversalFastbootEngine();

    UniversalFastbootEngine(const UniversalFastbootEngine&) = delete;
    UniversalFastbootEngine& operator=(const UniversalFastbootEngine&) = delete;

    // Scan USB bus for any device advertising Fastboot interface (Class 0xFF, SubClass 0x42, Protocol 0x03)
    bool ConnectAnyFastbootDevice();

    // Specific VID/PID connect
    bool Connect(uint16_t vid, uint16_t pid);

    // Query device state by calling "getvar:all"
    bool QueryDeviceState(FastbootDeviceState& out_state);

    // Send generic fastboot command (e.g. "oem unlock", "flashing unlock", "reboot-fastboot")
    bool ExecuteCommand(const std::string& cmd, std::string& out_response);

    // Download payload to device RAM
    bool DownloadPayload(
        const uint8_t* data,
        size_t size,
        std::function<void(size_t transferred, size_t total)> progressCb = nullptr
    );

    // Flash partition (combines download + flash:partition)
    bool FlashPartition(
        const std::string& partition_name,
        const uint8_t* data,
        size_t size,
        std::function<void(size_t transferred, size_t total)> progressCb = nullptr
    );

    // Erase partition (e.g., "userdata", "frp", "misc", "metadata")
    bool ErasePartition(const std::string& partition_name);

    // Reboot modes
    bool Reboot();
    bool RebootBootloader();
    bool RebootFastbootd();
    bool RebootRecovery();

    // A/B active slot selection ("a" or "b")
    bool SetActiveSlot(const std::string& slot);

private:
    FastbootResponseType SendCommandAndReadResponse(const std::string& cmd, std::string& out_payload);
    bool SendRawBulk(const uint8_t* data, size_t size);
    bool ReceiveRawBulk(uint8_t* buffer, size_t max_size, int& transferred);

    libusb_context* m_usb_ctx;
    libusb_device_handle* m_dev_handle;
    std::mutex m_session_mutex;

    uint8_t m_endpoint_in;
    uint8_t m_endpoint_out;
    const int m_timeout_ms = 10000;
};

} // namespace OmniFix::Protocols
