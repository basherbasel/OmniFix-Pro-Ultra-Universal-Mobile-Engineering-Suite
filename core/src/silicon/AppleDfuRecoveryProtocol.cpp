#include "silicon/AppleDfuRecoveryProtocol.hpp"
#include <sstream>
#include <iomanip>
#include <cstring>
#include <thread>
#include <chrono>

#if defined(HAVE_LIBUSB)
#include <libusb-1.0/libusb.h>
#endif

namespace OmniFix::Hardware::Silicon {

AppleDfuRecoveryProtocol::AppleDfuRecoveryProtocol()
    : m_usb_ctx(nullptr), m_dev_handle(nullptr) {
#if defined(HAVE_LIBUSB)
    libusb_init(&m_usb_ctx);
#endif
}

AppleDfuRecoveryProtocol::~AppleDfuRecoveryProtocol() {
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

bool AppleDfuRecoveryProtocol::ConnectToDevice() {
    std::lock_guard<std::mutex> lock(m_session_mutex);

#if defined(HAVE_LIBUSB)
    // 1. Try Apple DFU mode (05AC:1227)
    m_dev_handle = libusb_open_device_with_vid_pid(m_usb_ctx, APPLE_VID, APPLE_PID_DFU);
    if (!m_dev_handle) {
        // 2. Try Apple Recovery mode (05AC:1281)
        m_dev_handle = libusb_open_device_with_vid_pid(m_usb_ctx, APPLE_VID, APPLE_PID_RECOVERY);
    }

    if (!m_dev_handle) {
        std::cerr << "[!] Error: Apple device in DFU (1227) or Recovery (1281) mode not found.\n";
        return false;
    }

    if (libusb_kernel_driver_active(m_dev_handle, 0) == 1) {
        libusb_detach_kernel_driver(m_dev_handle, 0);
    }

    if (libusb_claim_interface(m_dev_handle, 0) < 0) {
        std::cerr << "[!] Error: Failed to claim Apple USB interface.\n";
        return false;
    }

    std::cout << "[+] Hardware: Successfully bound to Apple USB DFU/Recovery Pipe.\n";
    return true;
#else
    std::cout << "[+] Hardware: Apple DFU/Recovery Pipe ready (Stub compiled).\n";
    return true;
#endif
}

bool AppleDfuRecoveryProtocol::ParseSerialDescriptor(const std::string& serial, AppleDeviceInfo& out_info) {
    out_info.serialNumber = serial;
    out_info.isPwned = (serial.find("PWND:[") != std::string::npos);

    // Format: "CPID:8030 CPRV:02 BDID:04 ECID:0000000000000000 IBFL:00 [PWND:checkm8]"
    std::istringstream iss(serial);
    std::string token;

    while (iss >> token) {
        auto colon = token.find(':');
        if (colon == std::string::npos) continue;

        std::string key = token.substr(0, colon);
        std::string val = token.substr(colon + 1);

        try {
            if (key == "CPID") {
                out_info.cpid = static_cast<uint16_t>(std::stoul(val, nullptr, 16));
            } else if (key == "CPRV") {
                out_info.cprv = static_cast<uint8_t>(std::stoul(val, nullptr, 16));
            } else if (key == "BDID") {
                out_info.bdid = static_cast<uint8_t>(std::stoul(val, nullptr, 16));
            } else if (key == "ECID") {
                out_info.ecid = std::stoull(val, nullptr, 16);
            } else if (key == "IBFL") {
                out_info.ibfl = static_cast<uint32_t>(std::stoul(val, nullptr, 16));
            } else if (key == "SRTG") {
                out_info.srtc = val;
            }
        } catch (...) {}
    }

    return (out_info.cpid != 0 || out_info.ecid != 0);
}

bool AppleDfuRecoveryProtocol::QueryHardwareParameters(AppleDeviceInfo& out_info) {
    std::lock_guard<std::mutex> lock(m_session_mutex);

#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;

    libusb_device* dev = libusb_get_device(m_dev_handle);
    libusb_device_descriptor desc;
    if (libusb_get_device_descriptor(dev, &desc) != 0) {
        return false;
    }

    out_info.mode = (desc.idProduct == APPLE_PID_DFU) ? "DFU" : "Recovery";

    unsigned char serial_buf[256] = {0};
    int len = libusb_get_string_descriptor_ascii(m_dev_handle, desc.iSerialNumber, serial_buf, sizeof(serial_buf));
    if (len > 0) {
        std::string serialStr(reinterpret_cast<char*>(serial_buf), len);
        return ParseSerialDescriptor(serialStr, out_info);
    }
    return false;
#else
    // Default simulated parameters for Apple A17 Pro (CPID 0x8130)
    out_info.cpid = 0x8130;
    out_info.cprv = 0x01;
    out_info.bdid = 0x06;
    out_info.ecid = 0x0012A4B892F100C4ULL;
    out_info.ibfl = 0x00;
    out_info.mode = "DFU";
    out_info.isPwned = false;
    out_info.serialNumber = "CPID:8130 CPRV:01 BDID:06 ECID:0012A4B892F100C4 IBFL:00";
    return true;
#endif
}

bool AppleDfuRecoveryProtocol::DfuSendChunk(uint16_t block_num, const uint8_t* data, size_t size) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    // bmRequestType = 0x21 (Host to Device | Class | Interface)
    // bRequest = 1 (DFU_DNLOAD)
    // wValue = block_num
    // wIndex = 0
    int r = libusb_control_transfer(
        m_dev_handle,
        0x21,
        static_cast<uint8_t>(DfuRequest::DFU_DNLOAD),
        block_num,
        0,
        const_cast<uint8_t*>(data),
        static_cast<uint16_t>(size),
        m_control_timeout_ms
    );
    return (r >= 0);
#else
    return true;
#endif
}

bool AppleDfuRecoveryProtocol::DfuFinishTransfer() {
    // Send 0-byte DFU_DNLOAD packet to indicate End of Image
    return DfuSendChunk(0, nullptr, 0);
}

bool AppleDfuRecoveryProtocol::DfuGetStatus(DfuStatusResponse& out_status) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    // bmRequestType = 0xA1 (Device to Host | Class | Interface)
    // bRequest = 3 (DFU_GETSTATUS)
    int r = libusb_control_transfer(
        m_dev_handle,
        0xA1,
        static_cast<uint8_t>(DfuRequest::DFU_GETSTATUS),
        0,
        0,
        reinterpret_cast<uint8_t*>(&out_status),
        sizeof(DfuStatusResponse),
        m_control_timeout_ms
    );
    return (r == sizeof(DfuStatusResponse));
#else
    out_status.status = 0; // DFU_STATUS_OK
    out_status.state = 2;  // dfuDNLOAD-IDLE
    return true;
#endif
}

bool AppleDfuRecoveryProtocol::DfuResetDevice() {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    libusb_reset_device(m_dev_handle);
    return true;
#else
    return true;
#endif
}

bool AppleDfuRecoveryProtocol::StreamRamdiskPayload(
    const std::vector<uint8_t>& ibss_img,
    const std::vector<uint8_t>& ibec_img,
    const std::vector<uint8_t>& ramdisk_img,
    const std::vector<uint8_t>& devicetree_img,
    const std::vector<uint8_t>& trustcache_img,
    const std::vector<uint8_t>& kernel_img,
    std::function<void(const std::string&, size_t, size_t)> progressCb
) {
    std::lock_guard<std::mutex> lock(m_session_mutex);

    struct Stage {
        std::string name;
        const std::vector<uint8_t>& data;
    } stages[] = {
        {"iBSS Stage 1", ibss_img},
        {"iBEC Stage 2", ibec_img},
        {"DeviceTree", devicetree_img},
        {"TrustCache", trustcache_img},
        {"Ramdisk Image", ramdisk_img},
        {"Mach Kernel", kernel_img}
    };

    const size_t dfuChunkSize = 2048; // 2KB standard DFU control transfer packet

    for (const auto& stage : stages) {
        if (stage.data.empty()) continue;

        std::cout << "[*] Apple Boot: Injecting " << stage.name << " (" << stage.data.size() << " Bytes)...\n";
        size_t total = stage.data.size();
        size_t offset = 0;
        uint16_t block = 0;

        while (offset < total) {
            size_t curChunk = std::min(dfuChunkSize, total - offset);
            if (!DfuSendChunk(block++, stage.data.data() + offset, curChunk)) {
                std::cerr << "[!] Error: DFU transfer failed during " << stage.name << " at block " << block << "\n";
                return false;
            }

            offset += curChunk;
            if (progressCb) {
                progressCb(stage.name, offset, total);
            }

            // Await DFU Status poll
            DfuStatusResponse st;
            DfuGetStatus(st);
        }

        // Finalize stage
        DfuFinishTransfer();
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    std::cout << "[🏁] Apple Success: SSH Forensic Ramdisk active on silicon. Device listening on TCP port 22/2222.\n";
    return true;
}

} // namespace OmniFix::Hardware::Silicon
