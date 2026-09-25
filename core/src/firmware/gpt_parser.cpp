#include "firmware/gpt_parser.hpp"
#include <cstring>
#include <sstream>
#include <iomanip>

namespace OmniFix::Firmware {

constexpr uint64_t GPT_SIGNATURE = 0x5452415020494645ULL; // "EFI PART"

uint32_t GptParser::CalculateCrc32(const uint8_t* data, size_t length) {
    uint32_t crc = 0xFFFFFFFF;
    for (size_t i = 0; i < length; ++i) {
        crc ^= data[i];
        for (int j = 0; j < 8; ++j) {
            if (crc & 1) {
                crc = (crc >> 1) ^ 0xEDB88320;
            } else {
                crc >>= 1;
            }
        }
    }
    return ~crc;
}

std::string GptParser::GuidToString(const uint8_t* g) {
    std::ostringstream ss;
    ss << std::hex << std::setfill('0');
    // Data1 (4 bytes, little-endian)
    ss << std::setw(2) << (int)g[3] << std::setw(2) << (int)g[2]
       << std::setw(2) << (int)g[1] << std::setw(2) << (int)g[0] << "-";
    // Data2 (2 bytes, little-endian)
    ss << std::setw(2) << (int)g[5] << std::setw(2) << (int)g[4] << "-";
    // Data3 (2 bytes, little-endian)
    ss << std::setw(2) << (int)g[7] << std::setw(2) << (int)g[6] << "-";
    // Data4 (2 bytes, big-endian)
    ss << std::setw(2) << (int)g[8] << std::setw(2) << (int)g[9] << "-";
    // Data4 (6 bytes, big-endian)
    for (int i = 10; i < 16; ++i) {
        ss << std::setw(2) << (int)g[i];
    }
    return ss.str();
}

std::string GptParser::Utf16LeToString(const uint16_t* utf16, size_t maxChars) {
    std::string result;
    for (size_t i = 0; i < maxChars; ++i) {
        if (utf16[i] == 0) break;
        if (utf16[i] < 128) {
            result.push_back(static_cast<char>(utf16[i]));
        } else {
            result.push_back('?');
        }
    }
    return result;
}

bool GptParser::Parse(const uint8_t* diskBuffer, size_t bufferSize, uint32_t sectorSize, std::vector<ParsedPartition>& outPartitions, std::string& outError) {
    outPartitions.clear();

    // GPT Header resides at LBA 1
    size_t headerOffset = sectorSize;
    if (bufferSize < headerOffset + sizeof(GptHeader)) {
        outError = "Buffer too small to contain LBA 1 GPT Header";
        return false;
    }

    const auto* header = reinterpret_cast<const GptHeader*>(diskBuffer + headerOffset);
    if (header->signature != GPT_SIGNATURE) {
        outError = "Invalid GPT signature. Header signature does not match 'EFI PART'";
        return false;
    }

    // Verify Header CRC32
    std::vector<uint8_t> headerCopy(reinterpret_cast<const uint8_t*>(header), reinterpret_cast<const uint8_t*>(header) + header->headerSize);
    auto* modHeader = reinterpret_cast<GptHeader*>(headerCopy.data());
    modHeader->headerCrc32 = 0;
    uint32_t calculatedCrc = CalculateCrc32(headerCopy.data(), header->headerSize);

    if (calculatedCrc != header->headerCrc32) {
        outError = "GPT Header CRC32 checksum mismatch (Corrupt partition table)";
        return false;
    }

    // Parse Partition Array
    size_t arrayOffset = header->partitionEntryLba * sectorSize;
    size_t arrayTotalSize = header->numberOfPartitionEntries * header->sizeOfPartitionEntry;

    if (bufferSize < arrayOffset + arrayTotalSize) {
        outError = "Buffer truncated before all GPT partition entries could be read";
        return false;
    }

    // Verify Partition Array CRC32
    uint32_t arrayCrc = CalculateCrc32(diskBuffer + arrayOffset, arrayTotalSize);
    if (arrayCrc != header->partitionEntryArrayCrc32) {
        outError = "GPT Partition Entries Array CRC32 mismatch";
        return false;
    }

    const uint8_t* entryPtr = diskBuffer + arrayOffset;
    for (uint32_t i = 0; i < header->numberOfPartitionEntries; ++i) {
        const auto* rawEntry = reinterpret_cast<const GptPartitionEntryRaw*>(entryPtr + (i * header->sizeOfPartitionEntry));

        // Skip unused entry (Type GUID all zeros)
        bool isZeroGuid = true;
        for (int b = 0; b < 16; ++b) {
            if (rawEntry->partitionTypeGuid[b] != 0) {
                isZeroGuid = false;
                break;
            }
        }
        if (isZeroGuid) continue;

        ParsedPartition part;
        part.name = Utf16LeToString(rawEntry->partitionNameUtf16, 36);
        part.startingLba = rawEntry->startingLba;
        part.endingLba = rawEntry->endingLba;
        part.sectorCount = (part.endingLba >= part.startingLba) ? (part.endingLba - part.startingLba + 1) : 0;
        part.sizeInBytes = part.sectorCount * sectorSize;
        part.attributes = rawEntry->attributes;
        part.typeGuid = GuidToString(rawEntry->partitionTypeGuid);
        part.uniqueGuid = GuidToString(rawEntry->uniquePartitionGuid);
        part.isBootable = (part.attributes & (1ULL << 2)) != 0;
        part.isReadOnly = (part.attributes & (1ULL << 60)) != 0;

        outPartitions.push_back(part);
    }

    return true;
}

} // namespace OmniFix::Firmware
