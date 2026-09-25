#pragma once

#include <cstdint>
#include <vector>
#include <string>
#include <optional>

namespace OmniFix::Firmware {

#pragma pack(push, 1)

struct GptHeader {
    uint64_t signature;              // "EFI PART" (0x5452415020494645ULL)
    uint32_t revision;               // 0x00010000
    uint32_t headerSize;             // 92 bytes
    uint32_t headerCrc32;            // CRC32 of header with this field zeroed
    uint32_t reserved;               // Must be zero
    uint64_t myLba;                  // LBA 1
    uint64_t alternateLba;           // Backup LBA (last sector of drive)
    uint64_t firstUsableLba;         // First usable block for partitions
    uint64_t lastUsableLba;          // Last usable block
    uint8_t diskGuid[16];            // Unique disk GUID
    uint64_t partitionEntryLba;      // Starting LBA of partition entries (usually 2)
    uint32_t numberOfPartitionEntries; // Usually 128
    uint32_t sizeOfPartitionEntry;   // Usually 128 bytes
    uint32_t partitionEntryArrayCrc32; // CRC32 of partition array
};

struct GptPartitionEntryRaw {
    uint8_t partitionTypeGuid[16];
    uint8_t uniquePartitionGuid[16];
    uint64_t startingLba;
    uint64_t endingLba;
    uint64_t attributes;
    uint16_t partitionNameUtf16[36]; // 36 UTF-16LE characters
};

#pragma pack(pop)

struct ParsedPartition {
    std::string name;
    uint64_t startingLba;
    uint64_t endingLba;
    uint64_t sectorCount;
    uint64_t sizeInBytes;
    uint64_t attributes;
    std::string typeGuid;
    std::string uniqueGuid;
    bool isBootable;
    bool isReadOnly;
};

class GptParser {
public:
    static bool Parse(const uint8_t* diskBuffer, size_t bufferSize, uint32_t sectorSize, std::vector<ParsedPartition>& outPartitions, std::string& outError);
    static uint32_t CalculateCrc32(const uint8_t* data, size_t length);
    static std::string GuidToString(const uint8_t* guidBytes);

private:
    static std::string Utf16LeToString(const uint16_t* utf16, size_t maxChars);
};

} // namespace OmniFix::Firmware
