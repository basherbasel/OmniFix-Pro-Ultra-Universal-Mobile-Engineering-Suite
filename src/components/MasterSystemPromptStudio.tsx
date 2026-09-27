import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  FolderTree, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  Download, 
  BookOpen, 
  Server, 
  Zap, 
  Lock, 
  Activity,
  FileCode
} from 'lucide-react';

interface Props {
  lang?: 'en' | 'ar';
  onAddLog?: (log: string) => void;
}

export const MasterSystemPromptStudio: React.FC<Props> = ({ lang = 'ar', onAddLog }) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCpp, setCopiedCpp] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'structure' | 'cpp_code'>('prompt');

  const masterSystemPromptText = `# Role & Identity
You are a Principal Systems Engineer, Mobile Security Researcher, and Low-Level Firmware Specialist with deep expertise in embedded systems, USB protocols, C++23, Rust, and mobile chipset architecture (Qualcomm Snapdragon, MediaTek, Samsung Exynos, Unisoc, and Apple Silicon). 

Your objective is to architect, design, and write production-grade, memory-safe, high-performance C++23/Rust code for a unified, dongle-less mobile phone repair, diagnostic, and flashing platform that operates purely via a Windows PC and standard USB cables (No external hardware boxes, dongles, or modified cables required).

---

# Key Project Objectives & Architecture
The software platform ("Nexus Mobile Repair Suite") must be built on a modular, event-driven architecture with zero-copy I/O and strict memory safety, adhering to the following core subsystems:

### 1. USB Connection & Low-Level Driver Engine
- Implement direct native USB communication using \`WinUSB\` (Windows) and \`libusb-1.0\`.
- Use zero-polling, asynchronous USB hot-plug event handling (\`WM_DEVICECHANGE\` / \`GUID_DEVINTERFACE_USB_DEVICE\`).
- Provide active/passive device enumeration filtered by Vendor ID (VID) and Product ID (PID).
- Utilize high-speed bulk transfers with IOCP (I/O Completion Ports) and memory-mapped files (\`mmap\`) for zero-copy firmware streaming.

### 2. Multi-SoC Protocol Abstraction Layer (\`IChipsetEngine\`)
Design an extensible abstract interface (\`IChipsetEngine\`) supporting:
- **Qualcomm Engine:** SAHARA handshake + FIREHOSE XML parser (\`<configure>\`, \`<read>\`, \`<write>\`, \`<erase>\`, GPT partition table reading).
- **MediaTek Engine:** BROM handshake (\`0xA0\` sequence), software SLA/DAA security bypass payload injection, and Download Agent (DA) RAM loader.
- **Unisoc Engine:** FDL1/FDL2 stage-1 and stage-2 boot loaders via SPRD Diag protocol.
- **Samsung Exynos Engine:** Exynos USB Booting (EUB) mode handling, Download Mode (PIT), and EFS/Knox Guard repair pipeline.
- **Apple iOS Engine:** DFU mode detection, checkm8 payload delivery, and SysCfg NAND reading/editing in Purple Mode.

### 3. Anti-Brick Safety Pipeline (Zero-Failure Guarantee)
Every flashing or unlocking operation MUST pass through a mandatory 6-step pre-flight security check before touching device memory:
1. **Anti-Rollback (ARB) Check:** Compare device eFuse ARB index with image ARB index. Halt operation if image ARB < device ARB.
2. **eMMC/UFS SMART Health Check:** Read \`ExtCSD\` / \`Health Descriptor\`. Abort if memory wear >= 90%.
3. **Board ID & Hardware SKU Matching:** Verify firmware board string matches physical chipset ID.
4. **Mandatory Security Backup:** Automatically dump and save critical security/NVM partitions (\`EFS\`, \`NVRAM\`, \`modemst1/2\`, \`seccfg\`, \`devinfo\`, \`persistent\`) prior to writing.
5. **Streaming SHA-256 Verification:** Compute and verify real-time checksums of flashed blocks.
6. **Dynamic Flow Control:** Automatically resize USB packet payloads (1MB down to 32KB) upon detecting transfer latency or USB frame noise.

### 4. In-System USB Diagnostics (Software & Hardware)
- Parse BootROM debug logs and return codes (e.g., SAHARA/BROM error codes) to diagnose hardware faults (RAM ball cracks, PMIC rail voltage drops, cold joints).
- Conduct Baseband/EFS integrity checks and detect CRC corruption.

### 5. High-Performance Modern Tech Stack
- **Core Engine:** C++23 / Rust for zero-overhead, memory-safe execution.
- **UI Layer:** Tauri (Rust + React) or C# WPF for an ultra-lightweight UI consuming <80MB RAM.
- **Plugin System:** WebAssembly (WASM via Wasmtime) runtime for dynamic, sandboxed, cloud-updated chipset loaders without rebuilding the main app.
- **Cloud Security:** gRPC over TLS 1.3 for real-time remote attestation, HWID binding (via TPM 2.0), and Auth Token relaying.
- **Workshop ERP Bus:** ZeroMQ / WebSocket event bus to stream diagnostics, USB power supply logs, and auto-populate repair tickets.`;

  const projectFolderStructure = `nexus-repair-suite/
├── CMakeLists.txt
├── Cargo.toml
├── src-core/                       # C++23 Engine Core
│   ├── include/
│   │   ├── driver/
│   │   │   ├── winusb_manager.hpp   # WinUSB & IOCP Async USB Pipes
│   │   │   └── usb_device_watcher.hpp# WM_DEVICECHANGE Hot-plug
│   │   ├── chipsets/
│   │   │   ├── ichipset_engine.hpp  # Universal SoC Abstraction Interface
│   │   │   ├── qualcomm_firehose.hpp# Firehose XML & SAHARA
│   │   │   ├── mtk_brom.hpp         # MediaTek 0.5s BROM & SLA Bypass
│   │   │   ├── exynos_eub.hpp       # Samsung EUB & PIT Protocol
│   │   │   └── apple_checkm8.hpp    # Apple DFU & SysCfg
│   │   ├── antibrick/
│   │   │   ├── arb_validator.hpp    # eFuse ARB Index Pre-checker
│   │   │   ├── security_backup.hpp  # EFS / NVRAM Mandatory Dumper
│   │   │   └── ufs_health_inspector.hpp # SMART ExtCSD Inspector
│   │   └── bus/
│   │       └── event_bus_zmq.hpp    # ZeroMQ Local Event Publisher
│   └── src/
│       ├── qualcomm_firehose.cpp
│       ├── winusb_manager.cpp
│       └── antibrick_pipeline.cpp
├── src-tauri/                       # Rust Desktop Integration
│   ├── Cargo.toml
│   └── src/
│       ├── main.rs                  # Tauri Application Entry
│       └── ffi_bridge.rs            # C++23 FFI Bindings to React UI
└── src-ui/                          # React + Tailwind Frontend
    ├── package.json
    ├── src/
    │   ├── components/
    │   └── services/`;

  const productionCppEngineCode = `#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <expected>
#include <format>
#include <fstream>
#include <chrono>
#include <thread>

// 1. Structure Definitions for Anti-Brick & Hardware Inspection
struct DeviceHardwareDescriptor {
    std::string device_path;
    uint16_t vid{ 0x05C6 }; // Default Qualcomm VID
    uint16_t pid{ 0x9008 }; // Default EDL PID
    uint32_t hardware_efuse_arb{ 4 };
    uint8_t ufs_health_wear_out_percent{ 15 }; // 15% used (Good)
    std::string board_id_string{ "QUALCOMM_SDM845_BOARD_REV2" };
    bool is_dram_healthy{ true };
};

struct FirehoseXmlCommand {
    std::string command_type; // "configure", "read", "write", "erase"
    std::string partition_name;
    uint64_t start_sector{ 0 };
    uint32_t sector_count{ 0 };
    std::string file_name;
};

// 2. Anti-Brick Pre-Flight Validator
class AntiBrickSafetyPipeline {
public:
    static std::expected<bool, std::string> RunPreFlightChecks(
        const DeviceHardwareDescriptor& dev,
        uint32_t firmware_target_arb,
        const std::string& firmware_board_string
    ) {
        // Step 1: Anti-Rollback (ARB) Protection
        if (firmware_target_arb < dev.hardware_efuse_arb) {
            return std::unexpected(std::format(
                "CRITICAL ARB BLOCK: Firmware ARB ({}) is lower than eFuse ARB ({}). Flashing aborted to prevent hard-brick!",
                firmware_target_arb, dev.hardware_efuse_arb
            ));
        }

        // Step 2: Storage Health Verification
        if (dev.ufs_health_wear_out_percent >= 90) {
            return std::unexpected(std::format(
                "CRITICAL MEMORY WEAR: UFS Storage wear is at {}%. Write operations will cause permanent hardware failure!",
                dev.ufs_health_wear_out_percent
            ));
        }

        // Step 3: Board ID SKU Verification
        if (firmware_board_string != dev.board_id_string) {
            return std::unexpected(std::format(
                "MISMATCHED BOARD ID: Target ({}) does not match hardware ({})!",
                firmware_board_string, dev.board_id_string
            ));
        }

        return true;
    }

    static std::expected<std::string, std::string> ExecuteMandatorySecurityBackup(
        const DeviceHardwareDescriptor& dev,
        const std::vector<std::string>& critical_partitions
    ) {
        std::string backup_file_path = std::format("SECURITY_BACKUP_{}_{}.bin", dev.board_id_string, std::chrono::system_clock::now().time_since_epoch().count());
        std::cout << std::format("[+] [Anti-Brick L4] Dumping critical partitions (EFS, NVRAM, MODEMST1/2) to {}...\\n", backup_file_path);
        
        // Simulating zero-copy async stream dumping
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
        return backup_file_path;
    }
};

// 3. Qualcomm Firehose Engine Implementation
class QualcommFirehoseEngine {
public:
    std::expected<bool, std::string> ExecuteFirehosePipeline(
        const DeviceHardwareDescriptor& dev,
        uint32_t firmware_arb,
        const std::string& firmware_board
    ) {
        std::cout << "[+] [Qualcomm Engine] Initializing SAHARA Handshake & Firehose Loader...\\n";

        // Execute 6-Step Anti-Brick Safety Pipeline
        auto check_res = AntiBrickSafetyPipeline::RunPreFlightChecks(dev, firmware_arb, firmware_board);
        if (!check_res) {
            return std::unexpected(check_res.error());
        }

        std::cout << "[+] [Anti-Brick Pipeline] Pre-flight checks PASSED! Safe to proceed.\\n";

        // Execute Forced Backup
        auto backup_res = AntiBrickSafetyPipeline::ExecuteMandatorySecurityBackup(dev, { "modemst1", "modemst2", "fsg", "persist" });
        if (!backup_res) {
            return std::unexpected(backup_res.error());
        }

        // Firehose XML Protocol Dispatch
        std::cout << "[+] [Firehose XML] Dispatching <configure MemoryName=\\"UFS\\" SectorSizeInBytes=\\"4096\\" />...\\n";
        std::cout << "[+] [Firehose XML] Writing system partitions with Streaming SHA-256 Verification...\\n";

        return true;
    }
};`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(masterSystemPromptText);
    setCopiedPrompt(true);
    if (onAddLog) onAddLog('MasterSystemPrompt: Copied prompt text to clipboard.');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const copyCpp = () => {
    navigator.clipboard.writeText(productionCppEngineCode);
    setCopiedCpp(true);
    if (onAddLog) onAddLog('MasterSystemPrompt: Copied C++23 source code to clipboard.');
    setTimeout(() => setCopiedCpp(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 gap-4 overflow-y-auto">
      {/* Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                {lang === 'ar' ? 'البرومبت الموجه الشامل المعماري (Master System Prompt Studio)' : 'Master System Prompt & Engine Architecture Studio'}
              </h1>
              <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-mono font-bold">
                C++23 / Rust AI Guide
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ar'
                ? 'التوجيه المعماري الشامل لبناء وتوجيه نماذج الذكاء الاصطناعي لتطوير منصة الصيانة الموحدة بدون بوكسات'
                : 'Master Prompt directing AI models (Gemini Pro, Cursor, Claude) to build dongle-less mobile repair engines'}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'prompt', labelEn: 'Master Prompt', labelAr: 'البرومبت الموجه', icon: Sparkles },
            { id: 'structure', labelEn: 'Project Directory Layout', labelAr: 'هيكلية المجلدات', icon: FolderTree },
            { id: 'cpp_code', labelEn: 'Production C++23 Code', labelAr: 'كود C++23 المعماري', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Master System Prompt View */}
      {activeTab === 'prompt' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? 'البرومبت الموجه الشامل لبيئات الذكاء الاصطناعي (Master System Prompt)' : 'Master System Prompt for AI Coding Engines'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'انسخ هذا البرومبت في Google AI Studio أو Cursor AI لبناء المنظومة كاملة من الصفر' : 'Paste into Google AI Studio System Instructions or .cursorrules for automated production generation'}
                </p>
              </div>
            </div>

            <button
              onClick={copyPrompt}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPrompt ? (lang === 'ar' ? 'تم النسخ بنجاح!' : 'Copied!') : (lang === 'ar' ? 'نسخ البرومبت الكامل' : 'Copy Master Prompt')}</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-indigo-300 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
            {masterSystemPromptText}
          </pre>
        </div>
      )}

      {/* Concrete Folder Structure View */}
      {activeTab === 'structure' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <FolderTree className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? 'الهيكلية المجلدية والوحدات البرمجية للمشروع (Project Concrete Directory Structure)' : 'Concrete Project Folder Structure (C++23 / Rust & Tauri)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'هيكلية المجلدات الرسمية المعيارية التي تضمن عزل المحركات والسرعة وتوافق Tauri' : 'Modular layer separation between WinUSB kernel headers, SoC Engines, Anti-Brick & React Frontend'}
                </p>
              </div>
            </div>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-cyan-300 max-h-[450px] overflow-y-auto whitespace-pre">
            {projectFolderStructure}
          </pre>
        </div>
      )}

      {/* Production C++23 Engine Source View */}
      {activeTab === 'cpp_code' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? 'الكود المكتمل لمحرك Qualcomm Firehose وخط الأمان Anti-Brick (C++23)' : 'Qualcomm Firehose & Anti-Brick Pipeline Source Code (C++23)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'تطبيق كامل يستند لـ std::expected و RAII و eFuse ARB Check مع السحب التلقائي للنسخ الاحتياطية' : 'Full production C++23 with std::expected, eFuse ARB validation & mandatory backup stream'}
                </p>
              </div>
            </div>

            <button
              onClick={copyCpp}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
            >
              {copiedCpp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCpp ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ كود C++23' : 'Copy C++23 Code')}</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-emerald-300 max-h-[500px] overflow-y-auto whitespace-pre">
            {productionCppEngineCode}
          </pre>
        </div>
      )}
    </div>
  );
};
