#include "FirmwareIntegrityEngine.h"
#include <iostream>

bool ValidateAndDispatchFirmware(const std::wstring& firmwarePath, const std::string& expectedSha256) {
    std::cout << "[IntegrityGate] Verifying firmware file integrity using PC hardware acceleration...\n";

    // Run async verification
    auto futureReport = FirmwareIntegrityEngine::VerifyFirmwareAsync(firmwarePath, expectedSha256);
    
    // Stalling wait (simulating progress callback checking)
    IntegrityReport report = futureReport.get();

    std::cout << "[IntegrityGate] File Size: " << (report.fileSizeInBytes / (1024 * 1024)) << " MB\n";
    std::cout << "[IntegrityGate] Computed SHA256: " << report.calculatedSha256 << "\n";
    std::cout << "[IntegrityGate] Processing Time: " << report.processingTimeMs << " ms\n";

    if (!report.isValid) {
        std::cerr << "[IntegrityGate ERROR] Checksum mismatch! Firmware file is corrupted. USB transfer aborted to prevent bricking.\n";
        return false;
    }

    std::cout << "[IntegrityGate SUCCESS] Firmware verified successfully. Safe to transmit via USB.\n";
    return true;
}

int main() {
    std::cout << "==========================================================" << std::endl;
    std::cout << "  IntegrityGate: Fast SSD-Optimized Verifier (C++ Native) " << std::endl;
    std::cout << "==========================================================" << std::endl;
    
    // Simulated path verification check
    bool result = ValidateAndDispatchFirmware(L"super.img", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    std::cout << "[IntegrityGate] Validation Dispatch Status: " << (result ? "SAFE TO FLASH" : "BLOCKED") << std::endl;
    
    return 0;
}
