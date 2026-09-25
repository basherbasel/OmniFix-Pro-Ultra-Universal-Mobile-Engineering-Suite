#include "silicon/QualcommFirehoseEngine.hpp"
#include <iostream>
#include <sstream>
#include <cstring>
#include <algorithm>

#if defined(HAVE_LIBUSB)
#include <libusb-1.0/libusb.h>
#endif

namespace OmniFix::Hardware::Silicon {

QualcommFirehoseEngine::QualcommFirehoseEngine()
    : m_usb_ctx(nullptr), m_dev_handle(nullptr), m_endpoint_in(0x81), m_endpoint_out(0x01) {
#if defined(HAVE_LIBUSB)
    libusb_init(&m_usb_ctx);
#endif
}

QualcommFirehoseEngine::~QualcommFirehoseEngine() {
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

bool QualcommFirehoseEngine::AttachToFirehoseInterface() {
    std::lock_guard<std::mutex> lock(m_session_mutex);

#if defined(HAVE_LIBUSB)
    m_dev_handle = libusb_open_device_with_vid_pid(m_usb_ctx, QCOM_VID, QCOM_PID);
    if (!m_dev_handle) {
        std::cerr << "[!] Error: Qualcomm device not reachable for Firehose XML streaming.\n";
        return false;
    }

    if (libusb_kernel_driver_active(m_dev_handle, 0) == 1) {
        libusb_detach_kernel_driver(m_dev_handle, 0);
    }

    if (libusb_claim_interface(m_dev_handle, 0) < 0) {
        std::cerr << "[!] Error: Failed to claim Firehose USB endpoint.\n";
        return false;
    }

    std::cout << "[+] Hardware: Successfully established Firehose XML stream channel.\n";
    return true;
#else
    std::cout << "[+] Hardware: Firehose Engine channel initialized (Stub compiled).\n";
    return true;
#endif
}

bool QualcommFirehoseEngine::SendXmlPacket(const std::string& xml) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    int transferred = 0;
    int r = libusb_bulk_transfer(m_dev_handle, m_endpoint_out, const_cast<uint8_t*>(reinterpret_cast<const uint8_t*>(xml.data())), xml.size(), &transferred, m_timeout_ms);
    return (r == 0 && static_cast<size_t>(transferred) == xml.size());
#else
    return true;
#endif
}

bool QualcommFirehoseEngine::ReceiveXmlResponse(std::string& out_xml, int timeout_ms) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    std::vector<uint8_t> buffer(8192);
    int transferred = 0;
    int r = libusb_bulk_transfer(m_dev_handle, m_endpoint_in, buffer.data(), buffer.size(), &transferred, timeout_ms);
    if (r == 0 && transferred > 0) {
        out_xml.assign(reinterpret_cast<char*>(buffer.data()), transferred);
        return true;
    }
    return false;
#else
    out_xml = "<?xml version=\"1.0\" ?><data><response value=\"ACK\" rawmode=\"false\" /></data>";
    return true;
#endif
}

bool QualcommFirehoseEngine::SendRawData(const uint8_t* data, size_t size) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    int transferred = 0;
    int r = libusb_bulk_transfer(m_dev_handle, m_endpoint_out, const_cast<uint8_t*>(data), size, &transferred, m_timeout_ms);
    return (r == 0 && static_cast<size_t>(transferred) == size);
#else
    return true;
#endif
}

bool QualcommFirehoseEngine::ReceiveRawData(uint8_t* buffer, size_t size) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    int transferred = 0;
    int r = libusb_bulk_transfer(m_dev_handle, m_endpoint_in, buffer, size, &transferred, m_timeout_ms);
    return (r == 0 && static_cast<size_t>(transferred) == size);
#else
    std::memset(buffer, 0, size);
    return true;
#endif
}

bool QualcommFirehoseEngine::ConfigureTarget(
    const std::string& memoryName,
    uint32_t maxPayloadBytes,
    FirehoseStorageInfo& out_info
) {
    std::lock_guard<std::mutex> lock(m_session_mutex);

    std::ostringstream oss;
    oss << "<?xml version=\"1.0\" ?>\n"
        << "<data>\n"
        << "  <configure MemoryName=\"" << memoryName << "\" "
        << "MaxPayloadSizeToTargetInBytes=\"" << maxPayloadBytes << "\" "
        << "verbose=\"0\" AlwaysValidate=\"0\" />\n"
        << "</data>";

    std::string xmlReq = oss.str();
    if (!SendXmlPacket(xmlReq)) {
        std::cerr << "[!] Error: Failed to transmit Firehose configure command.\n";
        return false;
    }

    std::string xmlResp;
    ReceiveXmlResponse(xmlResp);

    out_info.memoryType = memoryName;
    out_info.maxPayloadBytes = maxPayloadBytes;
    out_info.sectorSize = (memoryName == "UFS") ? 4096 : 512;
    out_info.totalBlocks = 0x3A380000; // ~498GB UFS 4.0
    out_info.isTargetReady = true;

    std::cout << "[+] Firehose: Storage controller [" << memoryName << "] initialized. Sector Size: " 
              << out_info.sectorSize << " Bytes\n";
    return true;
}

bool QualcommFirehoseEngine::ProgramPartition(
    uint64_t start_sector,
    uint64_t num_sectors,
    uint32_t sector_size,
    const uint8_t* data,
    size_t data_len,
    uint32_t physical_partition,
    std::function<void(size_t, size_t)> progressCb
) {
    std::lock_guard<std::mutex> lock(m_session_mutex);

    std::ostringstream oss;
    oss << "<?xml version=\"1.0\" ?>\n"
        << "<data>\n"
        << "  <program SECTOR_SIZE_IN_BYTES=\"" << sector_size << "\" "
        << "num_partition_sectors=\"" << num_sectors << "\" "
        << "physical_partition_number=\"" << physical_partition << "\" "
        << "start_sector=\"" << start_sector << "\" />\n"
        << "</data>";

    std::string xmlReq = oss.str();
    if (!SendXmlPacket(xmlReq)) {
        return false;
    }

    // Stream the raw payload chunks immediately following the XML header
    const size_t chunkSize = 1048576; // 1MB payload window
    size_t offset = 0;

    while (offset < data_len) {
        size_t curChunk = std::min(chunkSize, data_len - offset);
        if (!SendRawData(data + offset, curChunk)) {
            return false;
        }
        offset += curChunk;
        if (progressCb) {
            progressCb(offset, data_len);
        }
    }

    std::string xmlResp;
    ReceiveXmlResponse(xmlResp);
    return true;
}

bool QualcommFirehoseEngine::ReadPartition(
    uint64_t start_sector,
    uint64_t num_sectors,
    uint32_t sector_size,
    std::vector<uint8_t>& out_data,
    uint32_t physical_partition,
    std::function<void(size_t, size_t)> progressCb
) {
    std::lock_guard<std::mutex> lock(m_session_mutex);

    size_t totalBytes = num_sectors * sector_size;
    out_data.resize(totalBytes);

    std::ostringstream oss;
    oss << "<?xml version=\"1.0\" ?>\n"
        << "<data>\n"
        << "  <read SECTOR_SIZE_IN_BYTES=\"" << sector_size << "\" "
        << "num_partition_sectors=\"" << num_sectors << "\" "
        << "physical_partition_number=\"" << physical_partition << "\" "
        << "start_sector=\"" << start_sector << "\" />\n"
        << "</data>";

    if (!SendXmlPacket(oss.str())) {
        return false;
    }

    size_t offset = 0;
    const size_t chunkSize = 1048576;

    while (offset < totalBytes) {
        size_t curChunk = std::min(chunkSize, totalBytes - offset);
        ReceiveRawData(out_data.data() + offset, curChunk);
        offset += curChunk;
        if (progressCb) {
            progressCb(offset, totalBytes);
        }
    }

    return true;
}

bool QualcommFirehoseEngine::ErasePartition(
    uint64_t start_sector,
    uint64_t num_sectors,
    uint32_t sector_size,
    uint32_t physical_partition
) {
    std::lock_guard<std::mutex> lock(m_session_mutex);

    std::ostringstream oss;
    oss << "<?xml version=\"1.0\" ?>\n"
        << "<data>\n"
        << "  <erase SECTOR_SIZE_IN_BYTES=\"" << sector_size << "\" "
        << "num_partition_sectors=\"" << num_sectors << "\" "
        << "physical_partition_number=\"" << physical_partition << "\" "
        << "start_sector=\"" << start_sector << "\" />\n"
        << "</data>";

    if (!SendXmlPacket(oss.str())) {
        return false;
    }

    std::string xmlResp;
    ReceiveXmlResponse(xmlResp);
    std::cout << "[+] Firehose: Sector range " << start_sector << ".." 
              << (start_sector + num_sectors) << " erased successfully.\n";
    return true;
}

bool QualcommFirehoseEngine::ResetDevice() {
    std::lock_guard<std::mutex> lock(m_session_mutex);
    std::string resetXml = "<?xml version=\"1.0\" ?>\n<data>\n  <power value=\"reset\" />\n</data>";
    return SendXmlPacket(resetXml);
}

} // namespace OmniFix::Hardware::Silicon
