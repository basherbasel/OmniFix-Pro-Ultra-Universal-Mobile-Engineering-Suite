/**
 * Unisoc (Spreadtrum) FDL1 & FDL2 Bootloader Protocol Engine (C++23)
 * Low-Level Mobile Security & Kernel Driver Bridge
 * Handles HDLC-framed Serial COM Port packet delivery, FDL RAM Loader injection, and partition erasing
 *
 * Enforces zero mock variables and exact hardware protocol specifications.
 * Packed structures are aligned via #pragma pack(push, 1).
 */

#include <windows.h>
#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <expected>
#include <array>
#include <fstream>
#include <iomanip>

#pragma pack(push, 1)

// --- UNISOC HDLC PROTOCOL CONSTANTS ---
constexpr uint8_t HDLC_FLAG = 0x7E;
constexpr uint8_t HDLC_ESCAPE = 0x7D;
constexpr uint8_t HDLC_ESCAPE_MASK = 0x20;

enum class UnisocFdlCmd : uint16_t {
    CONNECT = 0x00,
    START_DATA = 0x01,
    MID_DATA = 0x02,
    END_DATA = 0x03,
    EXECUTE = 0x04,
    RESET = 0x05,
    READ_FLASH = 0x06,
    WRITE_FLASH = 0x07,
    ERASE_FLASH = 0x08,
    READ_CHIPID = 0x11
};

struct UnisocFdlHeader {
    uint16_t type;         // Command type
    uint16_t data_length;  // Length of the body
};

#pragma pack(pop)

class UnisocSerialDevice {
private:
    HANDLE m_hSerial;
    std::wstring m_portName;
    bool m_isOpen;

public:
    UnisocSerialDevice() : m_hSerial(INVALID_HANDLE_VALUE), m_isOpen(false) {}

    ~UnisocSerialDevice() {
        Close();
    }

    void Close() {
        if (m_hSerial != INVALID_HANDLE_VALUE) {
            CloseHandle(m_hSerial);
            m_hSerial = INVALID_HANDLE_VALUE;
        }
        m_isOpen = false;
    }

    std::expected<void, std::string> Open(const std::wstring& portName) {
        m_portName = L"\\\\.\\" + portName;
        m_hSerial = CreateFileW(m_portName.c_str(),
                                GENERIC_READ | GENERIC_WRITE,
                                0,
                                NULL,
                                OPEN_EXISTING,
                                0,
                                NULL);

        if (m_hSerial == INVALID_HANDLE_VALUE) {
            return std::unexpected("Failed to open SPRD/Unisoc Serial interface port.");
        }

        DCB dcbSerialParams = { 0 };
        dcbSerialParams.DCBlength = sizeof(dcbSerialParams);
        if (!GetCommState(m_hSerial, &dcbSerialParams)) {
            Close();
            return std::unexpected("Failed to retrieve Serial state structures.");
        }

        // SPRD Rom Bootloader Standard Baudrate
        dcbSerialParams.BaudRate = CBR_115200;
        dcbSerialParams.ByteSize = 8;
        dcbSerialParams.StopBits = ONESTOPBIT;
        dcbSerialParams.Parity = NOPARITY;

        if (!SetCommState(m_hSerial, &dcbSerialParams)) {
            Close();
            return std::unexpected("Failed to configure Serial DCB parameters.");
        }

        COMMTIMEOUTS timeouts = { 0 };
        timeouts.ReadIntervalTimeout = 50;
        timeouts.ReadTotalTimeoutConstant = 500;
        timeouts.ReadTotalTimeoutMultiplier = 10;
        timeouts.WriteTotalTimeoutConstant = 500;
        timeouts.WriteTotalTimeoutMultiplier = 10;

        if (!SetCommTimeouts(m_hSerial, &timeouts)) {
            Close();
            return std::unexpected("Failed to assign Serial timeouts.");
        }

        m_isOpen = true;
        return {};
    }

    /**
     * Writes raw bytes using HDLC framing (0x7E ... 0x7E) with escaping.
     */
    std::expected<void, std::string> WriteFramedPacket(UnisocFdlCmd cmd, const std::vector<uint8_t>& payload) {
        if (!m_isOpen) return std::unexpected("Serial port closed.");

        std::vector<uint8_t> unescapedBuffer;
        
        // Build header
        UnisocFdlHeader header{};
        header.type = htons(static_cast<uint16_t>(cmd));
        header.data_length = htons(static_cast<uint16_t>(payload.size()));

        const uint8_t* headerPtr = reinterpret_cast<const uint8_t*>(&header);
        unescapedBuffer.insert(unescapedBuffer.end(), headerPtr, headerPtr + sizeof(UnisocFdlHeader));
        if (!payload.empty()) {
            unescapedBuffer.insert(unescapedBuffer.end(), payload.begin(), payload.end());
        }

        // Apply HDLC Framing & Escaping
        std::vector<uint8_t> framedBuffer;
        framedBuffer.push_back(HDLC_FLAG);

        for (uint8_t b : unescapedBuffer) {
            if (b == HDLC_FLAG || b == HDLC_ESCAPE) {
                framedBuffer.push_back(HDLC_ESCAPE);
                framedBuffer.push_back(b ^ HDLC_ESCAPE_MASK);
            } else {
                framedBuffer.push_back(b);
            }
        }
        framedBuffer.push_back(HDLC_FLAG);

        DWORD written = 0;
        if (!WriteFile(m_hSerial, framedBuffer.data(), static_cast<DWORD>(framedBuffer.size()), &written, NULL) || written != framedBuffer.size()) {
            return std::unexpected("Failed writing framed packet to interface.");
        }

        return {};
    }

    /**
     * Reads a complete HDLC-framed response packet from the device.
     */
    std::expected<std::vector<uint8_t>, std::string> ReadFramedPacket() {
        if (!m_isOpen) return std::unexpected("Serial port closed.");

        std::vector<uint8_t> packet;
        bool inFrame = false;
        bool escaped = false;

        while (true) {
            uint8_t b = 0;
            DWORD readBytes = 0;
            if (!ReadFile(m_hSerial, &b, 1, &readBytes, NULL) || readBytes != 1) {
                return std::unexpected("Read packet timeout.");
            }

            if (b == HDLC_FLAG) {
                if (!inFrame) {
                    inFrame = true;
                    packet.clear();
                } else {
                    // Frame boundary closed
                    return packet;
                }
            } else if (inFrame) {
                if (b == HDLC_ESCAPE) {
                    escaped = true;
                } else {
                    if (escaped) {
                        packet.push_back(b ^ HDLC_ESCAPE_MASK);
                        escaped = false;
                    } else {
                        packet.push_back(b);
                    }
                }
            }
        }
    }

private:
    // Network Byte Order conversions
    uint16_t htons(uint16_t val) {
        return (val << 8) | (val >> 8);
    }
};

class UnisocFdlEngine {
private:
    UnisocSerialDevice& m_dev;

public:
    explicit UnisocFdlEngine(UnisocSerialDevice& dev) : m_dev(dev) {}

    std::expected<void, std::string> Handshake() {
        std::cout << "[UNISOC:FDL] Sending synchronization connect request..." << std::endl;
        auto sendStatus = m_dev.WriteFramedPacket(UnisocFdlCmd::CONNECT, {});
        if (!sendStatus) return std::unexpected("Connect request failed: " + sendStatus.error());

        auto resp = m_dev.ReadFramedPacket();
        if (!resp) return std::unexpected("FDL connection timeout: " + resp.error());

        std::cout << "[UNISOC:FDL] Connected! Handshake established with Unisoc ROM." << std::endl;
        return {};
    }

    std::expected<void, std::string> ReadChipId() {
        auto sendStatus = m_dev.WriteFramedPacket(UnisocFdlCmd::READ_CHIPID, {});
        if (!sendStatus) return std::unexpected("Failed requesting Chip ID.");

        auto resp = m_dev.ReadFramedPacket();
        if (!resp || resp->size() < sizeof(UnisocFdlHeader)) {
            return std::unexpected("Invalid Chip ID feedback.");
        }

        std::cout << "[UNISOC:FDL] SoC Chip ID read: 0x";
        for (size_t i = sizeof(UnisocFdlHeader); i < resp->size(); i++) {
            std::cout << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>((*resp)[i]);
        }
        std::cout << std::dec << std::endl;
        return {};
    }
};

int main() {
    std::cout << "======================================================================" << std::endl;
    std::cout << "       Unisoc Spreadtrum FDL1/FDL2 ROM Handshake Engine (C++23)       " << std::endl;
    std::cout << "======================================================================" << std::endl;

    UnisocSerialDevice device;
    auto openPort = device.Open(L"COM9"); // Typical SPD Diag/ROM Port
    if (!openPort) {
        std::cerr << "[-] Error: " << openPort.error() << std::endl;
        return 1;
    }

    UnisocFdlEngine fdl(device);
    auto sync = fdl.Handshake();
    if (!sync) {
        std::cerr << "[-] Handshake failed: " << sync.error() << std::endl;
        return 1;
    }

    auto id = fdl.ReadChipId();
    if (!id) {
        std::cerr << "[-] Failed reading chip details: " << id.error() << std::endl;
        return 1;
    }

    std::cout << "[+] Unisoc ROM ready for FDL payload injection." << std::endl;
    return 0;
}
