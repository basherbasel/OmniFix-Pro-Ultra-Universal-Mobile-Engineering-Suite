#include "FirmwareIntegrityEngine.h"
#include <iostream>
#include <fstream>
#include <iomanip>
#include <sstream>

FirmwareIntegrityEngine::FirmwareIntegrityEngine() : m_hAlg(NULL), m_initialized(false) {
    m_initialized = InitializeAlgProvider();
}

FirmwareIntegrityEngine::~FirmwareIntegrityEngine() {
    if (m_hAlg) {
        BCryptCloseAlgorithmProvider(m_hAlg, 0);
        m_hAlg = NULL;
    }
}

bool FirmwareIntegrityEngine::InitializeAlgProvider() {
    // Open an algorithm handle for SHA256 using Microsoft Cryptographic Provider
    NTSTATUS status = BCryptOpenAlgorithmProvider(
        &m_hAlg, 
        BCRYPT_SHA256_ALGORITHM, 
        MS_PRIMITIVE_PROVIDER, 
        0
    );
    return BCRYPT_SUCCESS(status);
}

bool FirmwareIntegrityEngine::CalculateSHA256(
    const std::wstring& filePath, 
    std::wstring& outHashHex, 
    void(*progressCallback)(double)
) {
    if (!m_initialized || !m_hAlg) {
        return false;
    }

    // Open file using high-performance binary file stream
    std::ifstream file(filePath, std::ios::binary | std::ios::ate);
    if (!file.is_open()) {
        return false;
    }

    std::streamsize fileSize = file.tellg();
    file.seekg(0, std::ios::beg);

    BCRYPT_HASH_HANDLE hHash = NULL;
    DWORD cbHashObject = 0;
    DWORD cbData = 0;
    NTSTATUS status;

    // Determine the size of the buffer needed for the hash object
    status = BCryptGetProperty(
        m_hAlg, 
        BCRYPT_OBJECT_LENGTH, 
        (PBYTE)&cbHashObject, 
        sizeof(DWORD), 
        &cbData, 
        0
    );

    if (!BCRYPT_SUCCESS(status)) {
        return false;
    }

    // Allocate memory for the hash object on heap
    std::vector<BYTE> hashObject(cbHashObject);

    // Create the active hashing session
    status = BCryptCreateHash(
        m_hAlg, 
        &hHash, 
        hashObject.data(), 
        cbHashObject, 
        NULL, 
        0, 
        0
    );

    if (!BCRYPT_SUCCESS(status)) {
        return false;
    }

    // Determine the hash size (32 bytes for SHA256)
    DWORD cbHash = 0;
    status = BCryptGetProperty(
        m_hAlg, 
        BCRYPT_HASH_LENGTH, 
        (PBYTE)&cbHash, 
        sizeof(DWORD), 
        &cbData, 
        0
    );

    if (!BCRYPT_SUCCESS(status) || cbHash != 32) {
        BCryptDestroyHash(hHash);
        return false;
    }

    // Define a 1MB buffer for high-throughput stream ingestion
    const size_t bufferSize = 1048576; // 1MB
    std::vector<char> buffer(bufferSize);
    std::streamsize bytesReadTotal = 0;

    while (file.good()) {
        file.read(buffer.data(), bufferSize);
        std::streamsize bytesRead = file.gcount();
        if (bytesRead <= 0) {
            break;
        }

        // Digest chunk block using Windows CNG BCryptHashData
        status = BCryptHashData(
            hHash, 
            reinterpret_cast<PBYTE>(buffer.data()), 
            static_cast<ULONG>(bytesRead), 
            0
        );

        if (!BCRYPT_SUCCESS(status)) {
            BCryptDestroyHash(hHash);
            return false;
        }

        bytesReadTotal += bytesRead;

        // Dispatch progress metrics
        if (progressCallback && fileSize > 0) {
            double percent = (static_cast<double>(bytesReadTotal) / static_cast<double>(fileSize)) * 100.0;
            progressCallback(percent);
        }
    }

    // Allocate buffer for resulting binary digest
    std::vector<BYTE> hashResult(cbHash);
    status = BCryptFinishHash(hHash, hashResult.data(), cbHash, 0);
    BCryptDestroyHash(hHash);

    if (!BCRYPT_SUCCESS(status)) {
        return false;
    }

    // Convert binary hash output to a clean hexadecimal wide-string representation
    std::wostringstream hexStream;
    for (DWORD i = 0; i < cbHash; ++i) {
        hexStream << std::setfill(L'0') << std::setw(2) << std::hex << (int)hashResult[i];
    }

    outHashHex = hexStream.str();
    return true;
}

bool FirmwareIntegrityEngine::VerifyIntegrity(const std::wstring& calculatedHash, const std::wstring& expectedHash) {
    if (calculatedHash.empty() || expectedHash.empty()) {
        return false;
    }
    // Simple constant-time comparison helper would be best here to mitigate timing attacks, 
    // but standard comparisons are highly performant for UI verification.
    return (calculatedHash == expectedHash);
}
