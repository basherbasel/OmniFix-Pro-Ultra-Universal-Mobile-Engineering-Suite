#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

namespace OmniFix::AI {

enum class DiagnosticSeverity {
    Info,
    Warning,
    CriticalPanic,
    FatalHardwareFailure
};

struct DiagnosticInference {
    std::string faultCategory;        // e.g. "KERNEL_PANIC", "DM_VERITY_CORRUPTION", "PMIC_POWER_COLLAPSE", "SELINUX_DENIAL"
    DiagnosticSeverity severity;
    std::string rootCauseExplanation;
    std::string recommendedRepairAction;
    std::vector<std::string> implicatedPartitions;
    float confidenceScore;            // 0.0 to 1.0
};

class LocalLogcatAiEngine {
public:
    LocalLogcatAiEngine();
    ~LocalLogcatAiEngine();

    bool LoadModel(const std::string& onnxModelPath);
    DiagnosticInference AnalyzeLogBuffer(const std::string& rawLogText);
    DiagnosticInference AnalyzeKernelPanic(const std::string& dmesgText);

private:
    bool m_modelLoaded{false};
    std::unordered_map<std::string, std::string> m_knownFaultSignatures;

    void InitializeKnowledgeGraph();
};

} // namespace OmniFix::AI
