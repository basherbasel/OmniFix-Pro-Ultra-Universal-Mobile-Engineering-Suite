#pragma once

#include <windows.h>
#include <bcrypt.h>
#include <string>
#include <vector>

#pragma comment(lib, "bcrypt.lib")

class FirmwareIntegrityEngine {
public:
    FirmwareIntegrityEngine();
    ~FirmwareIntegrityEngine();

    /**
     * Calculates the SHA256 checksum of a firmware file using Windows Cryptography Next Generation (CNG).
     * Designed for high-performance bulk file streams with low memory footprint.
     * 
     * @param filePath The absolute system path to the target firmware image.
     * @param outHashHex The resulting hexadecimal representation of the calculated SHA256 hash.
     * @param progressCallback Optional callback invoked periodically with the current percentage of bytes processed.
     * @return True if the hash was calculated successfully; false otherwise.
     */
    bool CalculateSHA256(
        const std::wstring& filePath, 
        std::wstring& outHashHex, 
        void(*progressCallback)(double) = nullptr
    );

    /**
     * Verifies if the calculated checksum matches the expected secure manufacturer hash.
     * 
     * @param calculatedHash Hex string calculated locally.
     * @param expectedHash Secure manufacturer-signed expected hex string.
     * @return True if hashes match, preventing flash on corrupted image.
     */
    bool VerifyIntegrity(const std::wstring& calculatedHash, const std::wstring& expectedHash);

private:
    BCRYPT_ALG_HANDLE m_hAlg;
    bool m_initialized;

    // Helper to initialize the CNG algorithm provider
    bool InitializeAlgProvider();
};
