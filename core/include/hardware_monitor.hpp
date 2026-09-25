#pragma once

#include "vid_pid_matrix.hpp"
#include <functional>
#include <thread>
#include <atomic>
#include <mutex>
#include <condition_variable>
#include <queue>
#include <chrono>
#include <memory>

// Forward declaration of libusb types to keep header lean
struct libusb_context;
struct libusb_device;

namespace OmniFix::Core {

enum class DeviceEventType {
    Connected,
    Disconnected
};

struct DeviceEvent {
    DeviceEventType type;
    uint16_t vid;
    uint16_t pid;
    std::string portPath;
    std::string serialNumber;
    uint64_t timestampUs; // Microsecond precision
    std::optional<HardwareProfile> profile;
};

using DeviceEventCallback = std::function<void(const DeviceEvent&)>;

class HardwareMonitor {
public:
    HardwareMonitor();
    ~HardwareMonitor();

    // Lifecycle
    bool Start();
    void Stop();
    bool IsRunning() const { return m_isRunning; }

    // Event Subscription
    void RegisterCallback(DeviceEventCallback callback);

    // Manual instant probe
    std::vector<DeviceEvent> ScanCurrentDevices();

private:
    void EventWorkerLoop();
    void UsbHotplugLoop();
    void SerialPortScanLoop();

    std::atomic<bool> m_isRunning{false};
    std::thread m_usbThread;
    std::thread m_serialThread;
    std::thread m_workerThread;

    libusb_context* m_libusbContext{nullptr};

    std::mutex m_queueMutex;
    std::condition_variable m_cv;
    std::queue<DeviceEvent> m_eventQueue;

    std::vector<DeviceEventCallback> m_callbacks;
    std::mutex m_callbackMutex;

    // Track active devices to detect disconnects accurately
    std::unordered_map<std::string, DeviceEvent> m_activeDevices;
    std::mutex m_deviceMutex;
};

} // namespace OmniFix::Core
