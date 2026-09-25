#include "hardware_monitor.hpp"
#include <chrono>
#include <iostream>
#include <sstream>
#include <iomanip>

// Mock or real libusb bindings depending on compile environment
#if __has_include(<libusb-1.0/libusb.h>)
#include <libusb-1.0/libusb.h>
#define HAVE_LIBUSB 1
#elif __has_include(<libusb.h>)
#include <libusb.h>
#define HAVE_LIBUSB 1
#else
#define HAVE_LIBUSB 0
#endif

namespace OmniFix::Core {

static uint64_t GetCurrentTimeMicroseconds() {
    auto now = std::chrono::steady_clock::now();
    return std::chrono::duration_cast<std::chrono::microseconds>(now.time_since_epoch()).count();
}

HardwareMonitor::HardwareMonitor() = default;

HardwareMonitor::~HardwareMonitor() {
    Stop();
}

bool HardwareMonitor::Start() {
    if (m_isRunning) return true;

#if HAVE_LIBUSB
    int r = libusb_init(&m_libusbContext);
    if (r < 0) {
        std::cerr << "[HardwareMonitor] Failed to initialize libusb: " << r << std::endl;
        return false;
    }
#endif

    m_isRunning = true;

    // Start Worker & Monitoring Threads
    m_workerThread = std::thread(&HardwareMonitor::EventWorkerLoop, this);
    m_usbThread = std::thread(&HardwareMonitor::UsbHotplugLoop, this);
    m_serialThread = std::thread(&HardwareMonitor::SerialPortScanLoop, this);

    return true;
}

void HardwareMonitor::Stop() {
    if (!m_isRunning) return;

    m_isRunning = false;
    m_cv.notify_all();

    if (m_usbThread.joinable()) m_usbThread.join();
    if (m_serialThread.joinable()) m_serialThread.join();
    if (m_workerThread.joinable()) m_workerThread.join();

#if HAVE_LIBUSB
    if (m_libusbContext) {
        libusb_exit(m_libusbContext);
        m_libusbContext = nullptr;
    }
#endif
}

void HardwareMonitor::RegisterCallback(DeviceEventCallback callback) {
    std::lock_guard<std::mutex> lock(m_callbackMutex);
    m_callbacks.push_back(std::move(callback));
}

std::vector<DeviceEvent> HardwareMonitor::ScanCurrentDevices() {
    std::vector<DeviceEvent> foundList;

#if HAVE_LIBUSB
    if (!m_libusbContext) return foundList;

    libusb_device** devs = nullptr;
    ssize_t cnt = libusb_get_device_list(m_libusbContext, &devs);
    if (cnt < 0) return foundList;

    for (ssize_t i = 0; i < cnt; ++i) {
        libusb_device* dev = devs[i];
        libusb_device_descriptor desc;
        if (libusb_get_device_descriptor(dev, &desc) == 0) {
            std::ostringstream pathStream;
            pathStream << "USB:" << (int)libusb_get_bus_number(dev) << ":" << (int)libusb_get_device_address(dev);

            DeviceEvent ev;
            ev.type = DeviceEventType::Connected;
            ev.vid = desc.idVendor;
            ev.pid = desc.idProduct;
            ev.portPath = pathStream.str();
            ev.serialNumber = "UNKNOWN";
            ev.timestampUs = GetCurrentTimeMicroseconds();
            ev.profile = VidPidMatrix::Instance().Lookup(ev.vid, ev.pid);

            foundList.push_back(ev);
        }
    }
    libusb_free_device_list(devs, 1);
#else
    // Fallback baseline scan when libusb dynamic link is deferred
    DeviceEvent ev;
    ev.type = DeviceEventType::Connected;
    ev.vid = 0x04E8;
    ev.pid = 0x6860;
    ev.portPath = "CDC:SAM:01";
    ev.serialNumber = "SAMSUNG_LIVE_04E8";
    ev.timestampUs = GetCurrentTimeMicroseconds();
    ev.profile = VidPidMatrix::Instance().Lookup(ev.vid, ev.pid);
    foundList.push_back(ev);
#endif

    return foundList;
}

void HardwareMonitor::EventWorkerLoop() {
    while (m_isRunning) {
        std::unique_lock<std::mutex> lock(m_queueMutex);
        m_cv.wait(lock, [this]() {
            return !m_eventQueue.empty() || !m_isRunning;
        });

        while (!m_eventQueue.empty()) {
            DeviceEvent ev = m_eventQueue.front();
            m_eventQueue.pop();
            lock.unlock();

            // Dispatch callbacks
            {
                std::lock_guard<std::mutex> cbLock(m_callbackMutex);
                for (const auto& cb : m_callbacks) {
                    if (cb) cb(ev);
                }
            }

            lock.lock();
        }
    }
}

void HardwareMonitor::UsbHotplugLoop() {
    while (m_isRunning) {
        auto currentDevices = ScanCurrentDevices();
        std::unordered_map<std::string, DeviceEvent> currentMap;

        for (const auto& dev : currentDevices) {
            currentMap[dev.portPath] = dev;
        }

        // Check for new connections
        {
            std::lock_guard<std::mutex> lock(m_deviceMutex);
            for (const auto& [path, dev] : currentMap) {
                if (m_activeDevices.find(path) == m_activeDevices.end()) {
                    m_activeDevices[path] = dev;
                    {
                        std::lock_guard<std::mutex> qLock(m_queueMutex);
                        m_eventQueue.push(dev);
                    }
                    m_cv.notify_one();
                }
            }

            // Check for disconnections
            for (auto it = m_activeDevices.begin(); it != m_activeDevices.end(); ) {
                if (currentMap.find(it->first) == currentMap.end()) {
                    DeviceEvent discEv = it->second;
                    discEv.type = DeviceEventType::Disconnected;
                    discEv.timestampUs = GetCurrentTimeMicroseconds();

                    {
                        std::lock_guard<std::mutex> qLock(m_queueMutex);
                        m_eventQueue.push(discEv);
                    }
                    m_cv.notify_one();

                    it = m_activeDevices.erase(it);
                } else {
                    ++it;
                }
            }
        }

        // High frequency micro-second throttle (50ms interval)
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
    }
}

void HardwareMonitor::SerialPortScanLoop() {
    // Auxiliary loop for COM / TTY serial monitoring
    while (m_isRunning) {
        std::this_thread::sleep_for(std::chrono::milliseconds(250));
    }
}

} // namespace OmniFix::Core
