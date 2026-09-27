#pragma once
#include <string>
#include <vector>
#include <cstdint>
#include <future>

struct IntegrityReport {
    bool isValid;
    std::string calculatedSha256;
    std::string expectedSha256;
    uint64_t fileSizeInBytes;
    double processingTimeMs;
};

class FirmwareIntegrityEngine {
public:
    // Fast asynchronous verification utilizing multi-threading
    static std::future<IntegrityReport> VerifyFirmwareAsync(
        const std::wstring& filePath, 
        const std::string& expectedHash
    );

    // Direct synchronous verification using buffered file reading and CNG
    static IntegrityReport VerifyFirmwareSync(
        const std::wstring& filePath, 
        const std::string& expectedHash
    );

private:
    static std::string ComputeWindowsCngSha256(const std::wstring& filePath, uint64_t& outSize);
};
