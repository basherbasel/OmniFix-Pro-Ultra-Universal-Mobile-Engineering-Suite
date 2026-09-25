#include "silicon/SaharaProtocol.hpp"
#include <iostream>

#if defined(HAVE_LIBUSB)
#include <libusb-1.0/libusb.h>
#endif

namespace OmniFix::Hardware::Silicon {

SaharaProtocol::SaharaProtocol() 
    : m_usb_ctx(nullptr), m_dev_handle(nullptr), m_endpoint_in(0x81), m_endpoint_out(0x01) {
#if defined(HAVE_LIBUSB)
    libusb_init(&m_usb_ctx);
#endif
}

SaharaProtocol::~SaharaProtocol() {
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

bool SaharaProtocol::ConnectToDevice() {
    std::lock_guard<std::mutex> lock(m_session_mutex);
#if defined(HAVE_LIBUSB)
    m_dev_handle = libusb_open_device_with_vid_pid(m_usb_ctx, QCOM_VID, QCOM_PID);
    if (!m_dev_handle) {
        std::cerr << "[!] Error: Qualcomm QDLoader 9008 Device not found on USB Bench.\n";
        return false;
    }

    if (libusb_kernel_driver_active(m_dev_handle, 0) == 1) {
        libusb_detach_kernel_driver(m_dev_handle, 0);
    }

    int r = libusb_claim_interface(m_dev_handle, 0);
    if (r < 0) {
        std::cerr << "[!] Error: Failed to claim USB bulk interface.\n";
        return false;
    }

    std::cout << "[+] Hardware: Successfully anchored to Qualcomm 9008 Silicon Endpoint.\n";
    return true;
#else
    std::cout << "[+] Hardware: USB Endpoint Interface ready (Stub compiled).\n";
    return true;
#endif
}

bool SaharaProtocol::SendRawPacket(const uint8_t* data, size_t size) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    int transferred = 0;
    int r = libusb_bulk_transfer(m_dev_handle, m_endpoint_out, const_cast<uint8_t*>(data), size, &transferred, m_timeout_ms);
    return (r == 0 && static_cast<size_t>(transferred) == size);
#else
    return true;
#endif
}

bool SaharaProtocol::ReceiveRawPacket(uint8_t* buffer, size_t max_size, int& bytes_transferred) {
#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) return false;
    int r = libusb_bulk_transfer(m_dev_handle, m_endpoint_in, buffer, max_size, &bytes_transferred, m_timeout_ms);
    return (r == 0);
#else
    bytes_transferred = 0;
    return true;
#endif
}

void SaharaProtocol::HandleReadRequest(const SaharaReadDataPacket& read_req, const std::vector<uint8_t>& loader) {
    uint32_t offset = read_req.data_offset;
    uint32_t length = read_req.data_length;

    if (offset + length > loader.size()) {
        throw std::out_of_range("Sahara Safety Guard: Processor requested chunk outside memory bounds.");
    }

    const uint8_t* chunk_ptr = loader.data() + offset;
    if (!SendRawPacket(chunk_ptr, length)) {
        throw std::runtime_error("Sahara Pipeline: Failed to stream byte chunk to silicon.");
    }
}

bool SaharaProtocol::ExecuteSiliconHandshake(const std::vector<uint8_t>& raw_loader_stream, std::function<void(size_t, size_t)> progressCb) {
    std::lock_guard<std::mutex> lock(m_session_mutex);

#if defined(HAVE_LIBUSB)
    if (!m_dev_handle) {
        std::cerr << "[!] Error: No active hardware pipeline context.\n";
        return false;
    }
#endif

    std::cout << "[*] Sahara: Initializing Handshake Pipeline...\n";

    std::vector<uint8_t> rx_buffer(1024);
    int bytes_received = 0;
    
    if (!ReceiveRawPacket(rx_buffer.data(), rx_buffer.size(), bytes_received) || bytes_received < (int)sizeof(SaharaHelloPacket)) {
        std::cerr << "[!] Note: Live USB bus awaiting QDLoader 9008 packet.\n";
        return false;
    }

    SaharaHelloPacket hello_pkt;
    std::memcpy(&hello_pkt, rx_buffer.data(), sizeof(SaharaHelloPacket));

    if (hello_pkt.header.command != SaharaCommand::CMD_HELLO) {
        std::cerr << "[!] Error: Protocol mismatch. Received command: " << (int)hello_pkt.header.command << "\n";
        return false;
    }

    std::cout << "[+] SoC Detected Mode: " << hello_pkt.mode << " | Max Command Len: " << hello_pkt.max_command_length << " Bytes\n";

    SaharaHelloResponsePacket resp_pkt{};
    resp_pkt.header.command = SaharaCommand::CMD_HELLO_RESPONSE;
    resp_pkt.header.length = sizeof(SaharaHelloResponsePacket);
    resp_pkt.version = hello_pkt.version;
    resp_pkt.min_version = hello_pkt.min_version;
    resp_pkt.status = 0x00; // 0 = OK
    resp_pkt.mode = 0x00;   // Mode 0 = Image Transfer

    if (!SendRawPacket(reinterpret_cast<const uint8_t*>(&resp_pkt), sizeof(resp_pkt))) {
        std::cerr << "[!] Error: Handshake rejected. Pipeline severed.\n";
        return false;
    }

    std::cout << "[*] Sahara: Streaming Firehose Loader into Processor SRAM...\n";
    while (true) {
        if (!ReceiveRawPacket(rx_buffer.data(), rx_buffer.size(), bytes_received) || bytes_received < (int)sizeof(SaharaHeader)) {
            std::cerr << "[!] Error: Link lost during streaming loop.\n";
            return false;
        }

        SaharaHeader incoming_header;
        std::memcpy(&incoming_header, rx_buffer.data(), sizeof(SaharaHeader));

        if (incoming_header.command == SaharaCommand::CMD_READ_DATA) {
            SaharaReadDataPacket read_req;
            std::memcpy(&read_req, rx_buffer.data(), sizeof(SaharaReadDataPacket));
            
            try {
                HandleReadRequest(read_req, raw_loader_stream);
                if (progressCb) {
                    progressCb(read_req.data_offset + read_req.data_length, raw_loader_stream.size());
                }
            } catch (const std::exception& ex) {
                std::cerr << "[!] Emergency Halt: " << ex.what() << "\n";
                return false;
            }
        } 
        else if (incoming_header.command == SaharaCommand::CMD_END_IMAGE_TX) {
            std::cout << "[+] Success: Firehose binary fully injected. Initializing execution environment...\n";
            break;
        } 
        else {
            std::cerr << "[!] Error: Unexpected silicon state command received: " << (int)incoming_header.command << "\n";
            return false;
        }
    }

    SaharaHeader done_pkt{};
    done_pkt.command = SaharaCommand::CMD_DONE;
    done_pkt.length = sizeof(SaharaHeader);
    SendRawPacket(reinterpret_cast<const uint8_t*>(&done_pkt), sizeof(done_pkt));

    std::cout << "[🏁] Pipeline Active: Phone is now controlled by Firehose. Awaiting XML input.\n";
    return true;
}

} // namespace OmniFix::Hardware::Silicon
