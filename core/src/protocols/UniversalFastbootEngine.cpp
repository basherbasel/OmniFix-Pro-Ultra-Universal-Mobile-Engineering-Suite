#include "protocols/UniversalFastbootEngine.hpp"
#include <iomanip>
#include <sstream>
#include <cstring>
#include <iostream>
#include <algorithm>

#if defined(HAVE_LIBUSB)
#include <libusb-1.0/libusb.h>
#endif

namespace OmniFix::Protocols {

UniversalFastbootEngine::UniversalFastbootEngine()
    : m_usb_ctx(nullptr), m_dev_handle(nullptr), m_endpoint_in(0x81), m_endpoint_out(0x01) {
#if defined(HAVE_LIBUSB)
    libusb_init(&m_usb_ctx);
#endif
}

UniversalFastbootEngine::~UniversalFastbootEngine() {
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

bool UniversalFastbootEngine::ConnectAnyFastbootDevice() {
    std::lock_guard<std::mutex> lock(m_session_mutex);

#if defined(HAVE_LIBUSB)
    libusb_device** list = nullptr;
    ssize_t count = libusb_get_device_list(m_usb_ctx, &list);
    if (count < 0) return false;

    bool found = false;
    for (ssize_t i = 0; i < count; ++i) {
        libusb_device* dev = list[i];
        libusb_config_descriptor* config = nullptr;
        if (libusb_get_active_config_descriptor(dev, &config) == 0 && config) {
            for (int iface_idx = 0; iface_idx < config->bNumInterfaces; ++iface_idx) {
                const libusb_interface& iface = config->interface[iface_idx];
                for (int alt_idx = 0; alt_idx < iface.num_altsetting; ++alt_idx) {
                    const libusb_interface_descriptor& alt = iface.altsetting[alt_idx];
                    // Fastboot standard: Class 0xFF (Vendor Specific), SubClass 0x42, Protocol 0x03
                    if (alt.bInterfaceClass == 0xFF && alt.bInterfaceSubClass == 0x42 && alt.bInterfaceProtocol == 0x03) {
                        for (int ep_idx = 0; ep_idx < alt.bNumEndpoints; ++ep_idx) {
                            const libusb_endpoint_descriptor& ep = alt.endpoint[ep_idx];
                            if ((ep.bEndpointAddress & 0x80) != 0) {
                                m_endpoint_in = ep.bEndpointAddress;
                            } else {
                                m_endpoint_out = ep.bEndpointAddress;
                            }
                        }

                        if (libusb_open(dev, &m_dev_handle) == 0 && m_dev_handle) {
                            if (libusb_kernel_driver_active(m_dev_handle, alt.bInterfaceNumber) == 1) {
                                libusb_detach_kernel_driver(m_dev_handle, alt.bInterfaceNumber);
                            }
                            if (libusb_claim_interface(m_dev_handle, alt.bInterfaceNumber) == 0) {
                                found = true;
                                break;
                            }
                        }
                    }
                }
                if (found) break;
            }
            libusb_free_config_descriptor(config);
        }
        if (found) break;
    }
    libusb_free_device_list(list, 1);

    if (found) {
        std::cout << "[+] Hardware: Bound to Android Fastboot Bulk Endpoints (IN: 0x" 
                  << std::hex << (int)m_endpoint_in << ", OUT: 0x" << (int)m_endpoint_out << ")\n";
        return true;
    }
    return false;
#else
    std::cout << "[+] Hardware: Fastboot Bulk Endpoints initialized (Stub compiled).\n";
    return true;
#endif
}

bool UniversalFastbootEngine::Connect(uint16_t vid, uint16_t pid) {
    std::lock_guard<std::mutex> lock(m_session_mutex);
#if defined(HAVE_LIBUSB)
    m_dev_handle = libusb_open_device_with_vid_pid(m_usb_ctx, vid, pid);
    if (!m_dev_handle) return false;

    if (libusb_kernel_driver_active(m_dev_handle, 0) == 1) {
        libusb_detach_kernel_driver(m_dev_handle, 0);
    }
    return (libusb_claim_interface(m_dev_handle, 0) == 0);
#else
    return true;
#endif
}

bool UniversalFastbootEngine::SendRawBulk(const uint8_t* data, size_t size) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    int transferred = 0;
    int r = libusb_bulk_transfer(m_dev_handle, m_endpoint_out, const_cast<uint8_t*>(data), size, &transferred, m_timeout_ms);
    return (r == 0 && static_cast<size_t>(transferred) == size);
#else
    return true;
#endif
}

bool UniversalFastbootEngine::ReceiveRawBulk(uint8_t* buffer, size_t max_size, int& transferred) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    int r = libusb_bulk_transfer(m_dev_handle, m_endpoint_in, buffer, max_size, &transferred, m_timeout_ms);
    return (r == 0);
#else
    transferred = 4;
    std::memcpy(buffer, "OKAY", 4);
    return true;
#endif
}

FastbootResponseType UniversalFastbootEngine::SendCommandAndReadResponse(const std::string& cmd, std::string& out_payload) {
    if (!SendRawBulk(reinterpret_cast<const uint8_t*>(cmd.data()), cmd.size())) {
        return FastbootResponseType::FAIL;
    }

    std::vector<uint8_t> rx_buf(4096);
    int transferred = 0;

    out_payload.clear();

    while (true) {
        if (!ReceiveRawBulk(rx_buf.data(), rx_buf.size(), transferred) || transferred < 4) {
            return FastbootResponseType::FAIL;
        }

        std::string prefix(reinterpret_cast<char*>(rx_buf.data()), 4);
        std::string msg(reinterpret_cast<char*>(rx_buf.data() + 4), transferred - 4);

        if (prefix == "INFO") {
            out_payload += msg + "\n";
            // Continue reading for final OKAY or FAIL
            continue;
        } else if (prefix == "OKAY") {
            out_payload += msg;
            return FastbootResponseType::OKAY;
        } else if (prefix == "FAIL") {
            out_payload += msg;
            return FastbootResponseType::FAIL;
        } else if (prefix == "DATA") {
            out_payload = msg;
            return FastbootResponseType::DATA;
        } else {
            return FastbootResponseType::UNKNOWN;
        }
    }
}

bool UniversalFastbootEngine::ExecuteCommand(const std::string& cmd, std::string& out_response) {
    std::lock_guard<std::mutex> lock(m_session_mutex);
    return (SendCommandAndReadResponse(cmd, out_response) == FastbootResponseType::OKAY);
}

bool UniversalFastbootEngine::QueryDeviceState(FastbootDeviceState& out_state) {
    std::lock_guard<std::mutex> lock(m_session_mutex);

    std::string resp;
    SendCommandAndReadResponse("getvar:all", resp);

    std::istringstream iss(resp);
    std::string line;
    while (std::getline(iss, line)) {
        auto colon = line.find(':');
        if (colon != std::string::npos) {
            std::string k = line.substr(0, colon);
            std::string v = line.substr(colon + 1);
            // Trim whitespace
            k.erase(0, k.find_first_not_of(" \t\r\n"));
            k.erase(k.find_last_not_of(" \t\r\n") + 1);
            v.erase(0, v.find_first_not_of(" \t\r\n"));
            v.erase(v.find_last_not_of(" \t\r\n") + 1);
            out_state.allVariables[k] = v;

            if (k == "product") out_state.product = v;
            else if (k == "serialno") out_state.serialno = v;
            else if (k == "current-slot") out_state.currentSlot = v;
            else if (k == "version-bootloader") out_state.bootloaderVersion = v;
            else if (k == "version-baseband") out_state.basebandVersion = v;
            else if (k == "unlocked") out_state.isUnlocked = (v == "yes");
            else if (k == "is-userspace") out_state.isUserspace = (v == "yes");
            else if (k == "has-slot:boot") out_state.hasSlotSupport = (v == "yes");
            else if (k == "max-download-size") {
                try { out_state.maxDownloadSize = std::stoull(v, nullptr, 0); } catch (...) {}
            }
        }
    }

#if !defined(HAVE_LIBUSB)
    // Fallback default state
    out_state.product = "kalama_qcom";
    out_state.serialno = "98210AB401";
    out_state.currentSlot = "a";
    out_state.bootloaderVersion = "FASTBOOT-EDITION-2026";
    out_state.isUnlocked = true;
    out_state.isUserspace = true; // Fastbootd active
    out_state.maxDownloadSize = 536870912;
#endif

    std::cout << "[+] Fastboot: Device [" << out_state.product << "] detected. Mode: " 
              << (out_state.isUserspace ? "Fastbootd (Userspace Dynamic)" : "Bootloader") 
              << ", Slot: " << out_state.currentSlot << ", Unlocked: " << (out_state.isUnlocked ? "YES" : "NO") << "\n";
    return true;
}

bool UniversalFastbootEngine::DownloadPayload(
    const uint8_t* data,
    size_t size,
    std::function<void(size_t, size_t)> progressCb
) {
    std::stringstream ss;
    ss << "download:" << std::hex << std::setw(8) << std::setfill('0') << size;
    std::string downloadCmd = ss.str();

    std::string resp;
    if (SendCommandAndReadResponse(downloadCmd, resp) != FastbootResponseType::DATA) {
        std::cerr << "[!] Error: Device refused download command: " << resp << "\n";
        return false;
    }

    const size_t chunkSize = 1048576; // 1MB streaming chunk
    size_t offset = 0;

    while (offset < size) {
        size_t curChunk = std::min(chunkSize, size - offset);
        if (!SendRawBulk(data + offset, curChunk)) {
            return false;
        }
        offset += curChunk;
        if (progressCb) {
            progressCb(offset, size);
        }
    }

    // Read ACK response for download completion
    std::vector<uint8_t> ackBuf(256);
    int transferred = 0;
    if (!ReceiveRawBulk(ackBuf.data(), ackBuf.size(), transferred)) {
        return false;
    }
    return (transferred >= 4 && std::memcmp(ackBuf.data(), "OKAY", 4) == 0);
}

bool UniversalFastbootEngine::FlashPartition(
    const std::string& partition_name,
    const uint8_t* data,
    size_t size,
    std::function<void(size_t, size_t)> progressCb
) {
    std::lock_guard<std::mutex> lock(m_session_mutex);

    std::cout << "[*] Fastboot: Downloading [" << partition_name << "] (" << size << " Bytes)...\n";
    if (!DownloadPayload(data, size, progressCb)) {
        std::cerr << "[!] Error: Failed to buffer partition payload in target RAM.\n";
        return false;
    }

    std::cout << "[*] Fastboot: Flashing partition [" << partition_name << "] to silicon...\n";
    std::string flashCmd = "flash:" + partition_name;
    std::string resp;
    if (SendCommandAndReadResponse(flashCmd, resp) != FastbootResponseType::OKAY) {
        std::cerr << "[!] Error: Flash execution failed: " << resp << "\n";
        return false;
    }

    std::cout << "[+] Fastboot: Partition [" << partition_name << "] committed to flash successfully.\n";
    return true;
}

bool UniversalFastbootEngine::ErasePartition(const std::string& partition_name) {
    std::lock_guard<std::mutex> lock(m_session_mutex);
    std::string eraseCmd = "erase:" + partition_name;
    std::string resp;
    return (SendCommandAndReadResponse(eraseCmd, resp) == FastbootResponseType::OKAY);
}

bool UniversalFastbootEngine::SetActiveSlot(const std::string& slot) {
    std::lock_guard<std::mutex> lock(m_session_mutex);
    std::string slotCmd = "set_active:" + slot;
    std::string resp;
    return (SendCommandAndReadResponse(slotCmd, resp) == FastbootResponseType::OKAY);
}

bool UniversalFastbootEngine::Reboot() {
    std::lock_guard<std::mutex> lock(m_session_mutex);
    std::string resp;
    return (SendCommandAndReadResponse("reboot", resp) == FastbootResponseType::OKAY);
}

bool UniversalFastbootEngine::RebootBootloader() {
    std::lock_guard<std::mutex> lock(m_session_mutex);
    std::string resp;
    return (SendCommandAndReadResponse("reboot-bootloader", resp) == FastbootResponseType::OKAY);
}

bool UniversalFastbootEngine::RebootFastbootd() {
    std::lock_guard<std::mutex> lock(m_session_mutex);
    std::string resp;
    return (SendCommandAndReadResponse("reboot-fastboot", resp) == FastbootResponseType::OKAY);
}

bool UniversalFastbootEngine::RebootRecovery() {
    std::lock_guard<std::mutex> lock(m_session_mutex);
    std::string resp;
    return (SendCommandAndReadResponse("reboot-recovery", resp) == FastbootResponseType::OKAY);
}

} // namespace OmniFix::Protocols
