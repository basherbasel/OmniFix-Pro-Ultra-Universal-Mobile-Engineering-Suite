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

constexpr uint32_t SAMSUNG_PIT_MAGIC = 0x12349876;

struct PitHeader {
    uint32_t magic;           // 0x12349876
    uint32_t entry_count;
    char file_type[8];        // e.g. "PIT"
    char phone_model[8];      // e.g. "SM-S928B"
};

struct PitEntry {
    uint32_t binary_type;     // 0 = AP, 1 = CP, 2 = CSC
    uint32_t device_type;     // 0 = OneNAND, 1 = eMMC/UFS
    uint32_t partition_id;
    uint32_t partition_attributes;
    uint32_t update_attributes;
    uint32_t block_size_or_offset;
    uint32_t partition_block_count;
    char partition_name[32];
    char flash_filename[32];
    char fota_filename[32];
};

#pragma pack(pop)

class SamsungLokeProtocol {
public:
    SamsungLokeProtocol();
    ~SamsungLokeProtocol();

    SamsungLokeProtocol(const SamsungLokeProtocol&) = delete;
    SamsungLokeProtocol& operator=(const SamsungLokeProtocol&) = delete;

    // Connect to Samsung USB device in Download / Odin Mode (04E8:685D / 04E8:6860)
    bool ConnectToDevice();

    // Perform Loke session initialization handshake
    bool InitializeLokeSession(std::string& out_device_info);

    // Dump PIT (Partition Information Table) from phone
    bool ReadPitBinary(std::vector<uint8_t>& out_pit_data);

    // Parse raw PIT binary into structured entries
    static bool ParsePitEntries(
        const std::vector<uint8_t>& pit_data,
        std::vector<PitEntry>& out_entries,
        std::string& out_model
    );

    // Stream a partition image (e.g., boot.img, recovery.img) via Loke bulk transfer
    bool StreamPartitionFile(
        const std::string& partition_name,
        const uint8_t* data,
        size_t size,
        std::function<void(size_t sent, size_t total)> progressCb = nullptr
    );

    // Reboot phone back into normal mode
    bool RebootDevice();

private:
    bool SendBulkPacket(const uint8_t* data, size_t size);
    bool ReceiveBulkPacket(uint8_t* buffer, size_t max_size, int& bytes_transferred);

    libusb_context* m_usb_ctx;
    libusb_device_handle* m_dev_handle;
    std::mutex m_session_mutex;

    uint8_t m_endpoint_in;
    uint8_t m_endpoint_out;
    const int m_timeout_ms = 8000;
    const uint16_t SAMSUNG_VID = 0x04E8;
    const uint16_t SAMSUNG_PID_DOWNLOAD = 0x685D;
    const uint16_t SAMSUNG_PID_COMPOSITE = 0x6860;
};

} // namespace OmniFix::Hardware::Silicon
