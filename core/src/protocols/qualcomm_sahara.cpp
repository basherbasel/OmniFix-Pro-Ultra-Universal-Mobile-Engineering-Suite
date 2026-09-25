#include "protocols/qualcomm_sahara.hpp"
#include <cstring>
#include <iostream>
#include <sstream>

namespace OmniFix::Protocols {

QualcommSaharaEngine::QualcommSaharaEngine(SendRawPacketFn sendFn, ReceiveRawPacketFn recvFn)
    : m_sendFn(std::move(sendFn)), m_recvFn(std::move(recvFn)) {}

bool QualcommSaharaEngine::ReadPacket(std::vector<uint8_t>& buffer, uint32_t timeoutMs) {
    buffer.resize(4096);
    size_t bytesRead = 0;
    if (!m_recvFn(buffer.data(), buffer.size(), bytesRead, timeoutMs) || bytesRead < sizeof(SaharaPacketHeader)) {
        return false;
    }
    buffer.resize(bytesRead);
    return true;
}

bool QualcommSaharaEngine::ExecuteHandshake(uint32_t requestedMode) {
    std::vector<uint8_t> buffer;
    if (!ReadPacket(buffer, 5000)) {
        m_statusMessage = "Target did not initiate Sahara HELLO packet";
        return false;
    }

    auto* hello = reinterpret_cast<const SaharaHelloPacket*>(buffer.data());
    if (hello->header.command != SaharaCommand::Hello) {
        m_statusMessage = "Unexpected initial packet command";
        return false;
    }

    m_targetVersion = hello->version;
    m_targetMaxPacketSize = hello->targetCommandPacketLength;
    m_targetMode = hello->mode;

    // Send Hello Response
    SaharaHelloResponsePacket resp{};
    resp.header.command = SaharaCommand::HelloResponse;
    resp.header.length = sizeof(SaharaHelloResponsePacket);
    resp.version = m_targetVersion;
    resp.versionSupported = 1;
    resp.status = SaharaStatus::Success;
    resp.mode = requestedMode;

    if (!m_sendFn(reinterpret_cast<const uint8_t*>(&resp), sizeof(resp))) {
        m_statusMessage = "Failed to send Sahara HELLO_RESPONSE";
        return false;
    }

    m_statusMessage = "Sahara Handshake successfully established";
    return true;
}

bool QualcommSaharaEngine::SendProgrammer(uint32_t imageId, const std::vector<uint8_t>& elfPayload, std::function<void(size_t sent, size_t total)> progressCb) {
    std::vector<uint8_t> buffer;

    while (true) {
        if (!ReadPacket(buffer, 10000)) {
            m_statusMessage = "Timeout awaiting Sahara READ_DATA or END_IMAGE_TX";
            return false;
        }

        const auto* header = reinterpret_cast<const SaharaPacketHeader*>(buffer.data());
        if (header->command == SaharaCommand::ReadData) {
            const auto* readData = reinterpret_cast<const SaharaReadDataPacket*>(buffer.data());
            
            if (readData->dataOffset + readData->dataLength > elfPayload.size()) {
                m_statusMessage = "Target requested payload range exceeding binary size";
                return false;
            }

            const uint8_t* chunkPtr = elfPayload.data() + readData->dataOffset;
            if (!m_sendFn(chunkPtr, readData->dataLength)) {
                m_statusMessage = "Failed to transmit payload chunk to target";
                return false;
            }

            if (progressCb) {
                progressCb(readData->dataOffset + readData->dataLength, elfPayload.size());
            }
        } 
        else if (header->command == SaharaCommand::EndImageTransfer) {
            // Target accepted image
            SaharaDonePacket done{};
            done.header.command = SaharaCommand::Done;
            done.header.length = sizeof(SaharaDonePacket);
            m_sendFn(reinterpret_cast<const uint8_t*>(&done), sizeof(done));
            m_statusMessage = "Programmer transferred successfully. Target executing loader.";
            return true;
        }
        else if (header->command == SaharaCommand::Reset) {
            m_statusMessage = "Target triggered Sahara RESET sequence";
            return false;
        }
        else {
            m_statusMessage = "Unexpected command during image transfer";
            return false;
        }
    }
}

bool QualcommSaharaEngine::ResetDevice() {
    SaharaResetPacket reset{};
    reset.header.command = SaharaCommand::Reset;
    reset.header.length = sizeof(SaharaResetPacket);
    return m_sendFn(reinterpret_cast<const uint8_t*>(&reset), sizeof(reset));
}

// -----------------------------------------------------------------------------
// Qualcomm Firehose XML Engine Implementation
// -----------------------------------------------------------------------------
std::string QualcommFirehoseEngine::BuildConfigureXml(uint32_t maxPayloadSizeToTargetInBytes, const std::string& memoryType, bool verbose) {
    std::ostringstream ss;
    ss << "<?xml version=\"1.0\" ?>\n"
       << "<data>\n"
       << "  <configure MemoryName=\"" << memoryType << "\""
       << " Verbose=\"" << (verbose ? "1" : "0") << "\""
       << " AlwaysValidate=\"0\""
       << " MaxPayloadSizeToTargetInBytes=\"" << maxPayloadSizeToTargetInBytes << "\""
       << " />\n"
       << "</data>";
    return ss.str();
}

std::string QualcommFirehoseEngine::BuildSetBootableStorageDriveXml(uint32_t driveNumber) {
    std::ostringstream ss;
    ss << "<?xml version=\"1.0\" ?>\n"
       << "<data>\n"
       << "  <setbootablestoragedrive value=\"" << driveNumber << "\" />\n"
       << "</data>";
    return ss.str();
}

std::string QualcommFirehoseEngine::BuildProgramXml(const std::string& partitionName, uint64_t startSector, uint64_t numPartitionSectors, uint32_t sectorSizeInBytes) {
    std::ostringstream ss;
    ss << "<?xml version=\"1.0\" ?>\n"
       << "<data>\n"
       << "  <program"
       << " SECTOR_SIZE_IN_BYTES=\"" << sectorSizeInBytes << "\""
       << " num_partition_sectors=\"" << numPartitionSectors << "\""
       << " start_sector=\"" << startSector << "\""
       << " filename=\"" << partitionName << "\""
       << " />\n"
       << "</data>";
    return ss.str();
}

std::string QualcommFirehoseEngine::BuildReadXml(const std::string& partitionName, uint64_t startSector, uint64_t numPartitionSectors, uint32_t sectorSizeInBytes) {
    std::ostringstream ss;
    ss << "<?xml version=\"1.0\" ?>\n"
       << "<data>\n"
       << "  <read"
       << " SECTOR_SIZE_IN_BYTES=\"" << sectorSizeInBytes << "\""
       << " num_partition_sectors=\"" << numPartitionSectors << "\""
       << " start_sector=\"" << startSector << "\""
       << " filename=\"" << partitionName << ".bin\""
       << " />\n"
       << "</data>";
    return ss.str();
}

std::string QualcommFirehoseEngine::BuildEraseXml(uint64_t startSector, uint64_t numPartitionSectors, uint32_t sectorSizeInBytes) {
    std::ostringstream ss;
    ss << "<?xml version=\"1.0\" ?>\n"
       << "<data>\n"
       << "  <erase"
       << " SECTOR_SIZE_IN_BYTES=\"" << sectorSizeInBytes << "\""
       << " num_partition_sectors=\"" << numPartitionSectors << "\""
       << " start_sector=\"" << startSector << "\""
       << " />\n"
       << "</data>";
    return ss.str();
}

std::string QualcommFirehoseEngine::BuildResetXml() {
    return "<?xml version=\"1.0\" ?>\n<data>\n  <power value=\"reset\" />\n</data>";
}

std::string QualcommFirehoseEngine::BuildNopXml() {
    return "<?xml version=\"1.0\" ?>\n<data>\n  <nop />\n</data>";
}

bool QualcommFirehoseEngine::ParseFirehoseResponse(const std::string& xmlResponse, std::string& outRawValue, bool& outSuccess) {
    outRawValue = xmlResponse;
    if (xmlResponse.find("value=\"ACK\"") != std::string::npos || xmlResponse.find("value=\"true\"") != std::string::npos) {
        outSuccess = true;
        return true;
    }
    if (xmlResponse.find("value=\"NAK\"") != std::string::npos || xmlResponse.find("value=\"false\"") != std::string::npos) {
        outSuccess = false;
        return true;
    }
    outSuccess = false;
    return false;
}

} // namespace OmniFix::Protocols
