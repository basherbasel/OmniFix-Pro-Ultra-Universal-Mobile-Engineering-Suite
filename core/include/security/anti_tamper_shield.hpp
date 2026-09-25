#pragma once

#include <string>
#include <vector>
#include <cstdint>

namespace OmniFix::Security {

enum class IntegrityThreatLevel {
    SecureClean,
    DebuggerDetected,
    BreakpointTrapped,
    HardwareIdMismatch,
    SignatureInvalid,
    TokenExpired
};

struct MachineHardwareBinding {
    std::string machineHwid;
    std::string cpuModel;
    std::string motherboardSerial;
    std::string generatedAt;
};

struct JwtLicensingPayload {
    std::string subject;            // Licensee ID
    std::string licenseeEmail;
    std::string boundHwid;
    uint64_t validUntilUnix;
    std::vector<std::string> authorizedFeatures;
    bool isExpired;
    bool isHwidMatched;
};

class AntiTamperShield {
public:
    static MachineHardwareBinding GenerateHardwareBinding();
    static IntegrityThreatLevel PerformSelfIntegrityCheck();

    static bool DetectDebugger();
    static bool ScanCodeSectionForBreakpoints(const void* funcPtr, size_t scanRange = 256);

    // Central OAuth 2.0 / JWT Licensing Validator
    static bool ValidateLicenseToken(
        const std::string& jwtToken,
        const std::string& currentHwid,
        JwtLicensingPayload& outPayload
    );

    // Memory string decryption helper (Anti-strings extraction)
    static std::string DecryptSecureString(const uint8_t* encryptedBytes, size_t length, uint8_t xorKey = 0xAA);
};

} // namespace OmniFix::Security
