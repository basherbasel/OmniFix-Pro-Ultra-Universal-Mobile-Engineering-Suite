#include "FirmwareIntegrityEngine.h"
#include <windows.h>
#include <bcrypt.h>
#include <chrono>
#include <fstream>
#include <sstream>
#include <iomanip>

#ifndef NT_SUCCESS
#define NT_SUCCESS(Status) (((NTSTATUS)(Status)) >= 0)
#endif

std::future<IntegrityReport> FirmwareIntegrityEngine::VerifyFirmwareAsync(
    const std::wstring& filePath, 
    const std::string& expectedHash) 
{
    // Execute verification in background thread to avoid stalling main application UI thread
    return std::async(std::launch::async, [filePath, expectedHash]() {
        return VerifyFirmwareSync(filePath, expectedHash);
    });
}

IntegrityReport FirmwareIntegrityEngine::VerifyFirmwareSync(
    const std::wstring& filePath, 
    const std::string& expectedHash) 
{
    IntegrityReport report = { false, "", "", 0, 0.0 };
    
    auto startTime = std::chrono::high_resolution_clock::now();

    uint64_t fileSize = 0;
    std::string computedHash = ComputeWindowsCngSha256(filePath, fileSize);

    auto endTime = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> elapsed = endTime - startTime;

    report.fileSizeInBytes = fileSize;
    report.calculatedSha256 = computedHash;
    report.expectedSha256 = expectedHash;
    report.processingTimeMs = elapsed.count();

    if (expectedHash.empty()) {
        report.isValid = (!computedHash.empty()); 
    } else {
        report.isValid = (computedHash == expectedHash);
    }

    return report;
}

std::string FirmwareIntegrityEngine::ComputeWindowsCngSha256(const std::wstring& filePath, uint64_t& outSize) {
    std::string hashHex = "";
    BCRYPT_ALG_HANDLE hAlg = NULL;
    BCRYPT_HASH_HANDLE hHash = NULL;
    NTSTATUS status;

    // Open CNG Alg Provider for SHA256
    status = BCryptOpenAlgorithmProvider(&hAlg, BCRYPT_SHA256_ALGORITHM, NULL, 0);
    if (!NT_SUCCESS(status)) return "";

    DWORD hashObjectSize = 0, data = 0;
    status = BCryptGetProperty(hAlg, BCRYPT_OBJECT_LENGTH, (PBYTE)&hashObjectSize, sizeof(DWORD), &data, 0);
    if (!NT_SUCCESS(status)) {
        BCryptCloseAlgorithmProvider(hAlg, 0);
        return "";
    }

    std::vector<BYTE> hashObject(hashObjectSize);
    DWORD hashLen = 0;
    status = BCryptGetProperty(hAlg, BCRYPT_HASH_LENGTH, (PBYTE)&hashLen, sizeof(DWORD), &data, 0);
    if (!NT_SUCCESS(status)) {
        BCryptCloseAlgorithmProvider(hAlg, 0);
        return "";
    }

    status = BCryptCreateHash(hAlg, &hHash, hashObject.data(), hashObjectSize, NULL, 0, 0);
    if (!NT_SUCCESS(status)) {
        BCryptCloseAlgorithmProvider(hAlg, 0);
        return "";
    }

    // Open target firmware file stream (buffered binary mode)
    std::ifstream file(filePath, std::ios::binary);
    if (!file.is_open()) {
        BCryptDestroyHash(hHash);
        BCryptCloseAlgorithmProvider(hAlg, 0);
        return "";
    }

    file.seekg(0, std::ios::end);
    outSize = file.tellg();
    file.seekg(0, std::ios::beg);

    // SSD-Optimized buffer reading block (1 MB chunks for extreme I/O throughput)
    const size_t bufferSize = 1024 * 1024;
    std::vector<BYTE> buffer(bufferSize);

    while (file.read(reinterpret_cast<char*>(buffer.data()), bufferSize) || file.gcount() > 0) {
        DWORD bytesRead = static_cast<DWORD>(file.gcount());
        if (bytesRead > 0) {
            BCryptHashData(hHash, buffer.data(), bytesRead, 0);
        }
    }

    std::vector<BYTE> hash(hashLen);
    status = BCryptFinishHash(hHash, hash.data(), hashLen, 0);

    if (NT_SUCCESS(status)) {
        std::stringstream ss;
        for (DWORD i = 0; i < hashLen; ++i) {
            ss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(hash[i]);
        }
        hashHex = ss.str();
    }

    file.close();
    BCryptDestroyHash(hHash);
    BCryptCloseAlgorithmProvider(hAlg, 0);

    return hashHex;
}
