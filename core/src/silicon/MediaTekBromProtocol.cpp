#include "silicon/MediaTekBromProtocol.hpp"
#include <thread>
#include <chrono>

#if defined(HAVE_LIBUSB)
#include <libusb-1.0/libusb.h>
#endif

namespace OmniFix::Hardware::Silicon {

MediaTekBromProtocol::MediaTekBromProtocol()
    : m_usb_ctx(nullptr), m_dev_handle(nullptr), m_endpoint_in(0x81), m_endpoint_out(0x02) {
#if defined(HAVE_LIBUSB)
    libusb_init(&m_usb_ctx);
#endif
}

MediaTekBromProtocol::~MediaTekBromProtocol() {
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

bool MediaTekBromProtocol::ConnectToDevice() {
    std::lock_guard<std::mutex> lock(m_session_mutex);

#if defined(HAVE_LIBUSB)
    m_dev_handle = libusb_open_device_with_vid_pid(m_usb_ctx, MTK_VID, MTK_PID);
    if (!m_dev_handle) {
        std::cerr << "[!] Error: MediaTek USB Port (BROM 0003) not detected on Bench.\n";
        return false;
    }

    if (libusb_kernel_driver_active(m_dev_handle, 0) == 1) {
        libusb_detach_kernel_driver(m_dev_handle, 0);
    }

    if (libusb_claim_interface(m_dev_handle, 0) < 0) {
        std::cerr << "[!] Error: Failed to claim MediaTek Silicon interface.\n";
        return false;
    }

    std::cout << "[+] Hardware: Anchored successfully to MediaTek BROM Interface.\n";
    return true;
#else
    std::cout << "[+] Hardware: MediaTek Endpoint Interface ready (Stub compiled).\n";
    return true;
#endif
}

bool MediaTekBromProtocol::SendByte(uint8_t byte) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    int transferred = 0;
    int r = libusb_bulk_transfer(m_dev_handle, m_endpoint_out, &byte, 1, &transferred, m_timeout_ms);
    return (r == 0 && transferred == 1);
#else
    return true;
#endif
}

bool MediaTekBromProtocol::SendBuffer(const uint8_t* data, size_t size) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    int transferred = 0;
    int r = libusb_bulk_transfer(m_dev_handle, m_endpoint_out, const_cast<uint8_t*>(data), size, &transferred, m_timeout_ms);
    return (r == 0 && static_cast<size_t>(transferred) == size);
#else
    return true;
#endif
}

bool MediaTekBromProtocol::ReadByte(uint8_t& byte) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    int transferred = 0;
    int r = libusb_bulk_transfer(m_dev_handle, m_endpoint_in, &byte, 1, &transferred, m_timeout_ms);
    return (r == 0 && transferred == 1);
#else
    byte = 0x0A;
    return true;
#endif
}

bool MediaTekBromProtocol::ReadBuffer(uint8_t* buffer, size_t size) {
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

bool MediaTekBromProtocol::VerifyEcho(uint8_t sent_byte) {
    uint8_t echo_byte = 0;
    if (!ReadByte(echo_byte)) return false;
    return (echo_byte == sent_byte);
}

bool MediaTekBromProtocol::ExecuteBromHandshake(const std::vector<uint8_t>& da_binary_stream) {
    std::lock_guard<std::mutex> lock(m_session_mutex);

#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) {
        std::cerr << "[!] Error: No active MTK hardware context.\n";
        return false;
    }
#endif

    if (da_binary_stream.empty()) {
        std::cerr << "[!] Safe Guard: Empty DA binary rejected from memory pool.\n";
        return false;
    }

    std::cout << "[*] MTK: Initiating Sync Handshake Sequence...\n";

    bool synced = false;
    uint8_t target_response = 0x0A;
    
    for (int attempts = 0; attempts < 100; ++attempts) {
        if (SendByte(static_cast<uint8_t>(BromCommand::CMD_START))) {
            uint8_t response = 0;
            if (ReadByte(response) && response == target_response) {
                synced = true;
                break;
            }
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }

    if (!synced) {
        std::cerr << "[!] Error: Silicon Synchronization failed. Device refused to sync.\n";
        return false;
    }

    std::cout << "[+] MTK: Core Synchronization achieved. Fetching Chip ID...\n";

    if (!SendByte(static_cast<uint8_t>(BromCommand::CMD_GET_CHIP_ID)) || !VerifyEcho(static_cast<uint8_t>(BromCommand::CMD_GET_CHIP_ID))) {
        std::cerr << "[!] Error: CMD_GET_CHIP_ID command failed or echo mismatched.\n";
        return false;
    }

    uint16_t chip_id = 0;
    if (!ReadBuffer(reinterpret_cast<uint8_t*>(&chip_id), sizeof(chip_id))) {
        std::cerr << "[!] Error: Failed to extract Hardware Chip ID.\n";
        return false;
    }
    std::cout << "[+] Silicon ID: MT" << std::hex << chip_id << " Successfully identified.\n";

    std::cout << "[*] MTK: Directing Processor to receive Download Agent (DA)...\n";
    if (!SendByte(static_cast<uint8_t>(BromCommand::CMD_SEND_DA)) || !VerifyEcho(static_cast<uint8_t>(BromCommand::CMD_SEND_DA))) {
        std::cerr << "[!] Error: CMD_SEND_DA handshake refused by SoC.\n";
        return false;
    }

    uint32_t da_address = 0x400000;
    uint32_t da_size = da_binary_stream.size();
    uint32_t sig_length = 0;

    SendBuffer(reinterpret_cast<const uint8_t*>(&da_address), sizeof(da_address));
    SendBuffer(reinterpret_cast<const uint8_t*>(&da_size), sizeof(da_size));
    SendBuffer(reinterpret_cast<const uint8_t*>(&sig_length), sizeof(sig_length));

    uint16_t status = 0;
    if (!ReadBuffer(reinterpret_cast<uint8_t*>(&status), sizeof(status)) || status != 0) {
        std::cerr << "[!] Error: Processor rejected the memory layout mapping.\n";
        return false;
    }

    std::cout << "[*] MTK: Streaming DA Binary Block (" << std::dec << da_size << " Bytes) to SRAM...\n";
    if (!SendBuffer(da_binary_stream.data(), da_size)) {
        std::cerr << "[!] Error: Block stream collapsed while writing DA binary.\n";
        return false;
    }

    if (!SendByte(static_cast<uint8_t>(BromCommand::CMD_RUN_DA)) || !VerifyEcho(static_cast<uint8_t>(BromCommand::CMD_RUN_DA))) {
        std::cerr << "[!] Error: Execution signal (CMD_RUN_DA) was not acknowledged.\n";
        return false;
    }

    if (!ReadBuffer(reinterpret_cast<uint8_t*>(&status), sizeof(status)) || status != 0) {
        std::cerr << "[!] Error: DA crashed or refused execution inside internal SRAM.\n";
        return false;
    }

    std::cout << "[🏁] MTK Success: DA is now running live in RAM. Device is prepared for Partition Modifications.\n";
    return true;
}

} // namespace OmniFix::Hardware::Silicon
