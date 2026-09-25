#pragma once

#include <iostream>
#include <vector>
#include <string>
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

struct FirehoseStorageInfo {
    std::string memoryType;      // "eMMC" or "UFS"
    uint64_t totalBlocks;
    uint32_t sectorSize;
    uint32_t maxPayloadBytes;
    bool isTargetReady;
};

class QualcommFirehoseEngine {
public:
    QualcommFirehoseEngine();
    ~QualcommFirehoseEngine();

    QualcommFirehoseEngine(const QualcommFirehoseEngine&) = delete;
    QualcommFirehoseEngine& operator=(const QualcommFirehoseEngine&) = delete;

    // Attach to active Firehose interface on USB
    bool AttachToFirehoseInterface();

    // Send XML Configuration command to Firehose and negotiate memory controller
    bool ConfigureTarget(
        const std::string& memoryName, // "eMMC" or "UFS"
        uint32_t maxPayloadBytes,
        FirehoseStorageInfo& out_info
    );

    // Write/Flash raw binary partition to sector offset
    bool ProgramPartition(
        uint64_t start_sector,
        uint64_t num_sectors,
        uint32_t sector_size,
        const uint8_t* data,
        size_t data_len,
        uint32_t physical_partition = 0,
        std::function<void(size_t written, size_t total)> progressCb = nullptr
    );

    // Read/Dump raw partition sectors (Forensics / Backup)
    bool ReadPartition(
        uint64_t start_sector,
        uint64_t num_sectors,
        uint32_t sector_size,
        std::vector<uint8_t>& out_data,
        uint32_t physical_partition = 0,
        std::function<void(size_t read_bytes, size_t total)> progressCb = nullptr
    );

    // Erase partition sectors (e.g. 1-click FRP erase)
    bool ErasePartition(
        uint64_t start_sector,
        uint64_t num_sectors,
        uint32_t sector_size,
        uint32_t physical_partition = 0
    );

    // Reset / Reboot phone
    bool ResetDevice();

private:
    bool SendXmlPacket(const std::string& xml);
    bool ReceiveXmlResponse(std::string& out_xml, int timeout_ms = 4000);
    bool SendRawData(const uint8_t* data, size_t size);
    bool ReceiveRawData(uint8_t* buffer, size_t size);

    libusb_context* m_usb_ctx;
    libusb_device_handle* m_dev_handle;
    std::mutex m_session_mutex;

    uint8_t m_endpoint_in;
    uint8_t m_endpoint_out;
    const int m_timeout_ms = 6000;
    const uint16_t QCOM_VID = 0x05C6;
    const uint16_t QCOM_PID = 0x9008;
};

} // namespace OmniFix::Hardware::Silicon
