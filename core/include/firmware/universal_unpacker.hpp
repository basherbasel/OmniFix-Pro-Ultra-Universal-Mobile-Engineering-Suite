#pragma once

#include <cstdint>
#include <vector>
#include <string>
#include <memory>
#include <functional>

namespace OmniFix::Firmware {

#pragma pack(push, 1)

// Android Sparse Image Protocol Structures
constexpr uint32_t SPARSE_HEADER_MAGIC = 0xED26FF3A;
constexpr uint16_t CHUNK_TYPE_RAW = 0xCAC1;
constexpr uint16_t CHUNK_TYPE_FILL = 0xCAC2;
constexpr uint16_t CHUNK_TYPE_DONT_CARE = 0xCAC3;
constexpr uint16_t CHUNK_TYPE_CRC32 = 0xCAC4;

struct SparseHeader {
    uint32_t magic;          // 0xED26FF3A
    uint16_t majorVersion;   // (0x1)
    uint16_t minorVersion;   // (0x0)
    uint16_t fileHeaderSize; // 28 bytes
    uint16_t chunkHeaderSize;// 12 bytes
    uint32_t blockSize;      // block size in bytes, must be multiple of 4 (e.g. 4096)
    uint32_t totalBlocks;    // total blocks in output image
    uint32_t totalChunks;    // total chunks in input image
    uint32_t imageChecksum;  // CRC32 checksum
};

struct ChunkHeader {
    uint16_t chunkType;      // 0xCAC1, 0xCAC2, 0xCAC3, 0xCAC4
    uint16_t reserved1;
    uint32_t chunkBlocks;    // total number of blocks in output image
    uint32_t totalBytes;     // total size in bytes of chunk input file including chunk header
};

#pragma pack(pop)

struct FirmwareArchiveEntry {
    std::string filename;
    uint64_t fileOffset;
    uint64_t fileSize;
    bool isCompressed;
    std::string compressionType; // "NONE", "GZIP", "LZ4", "ZSTD"
};

enum class FirmwareContainerType {
    SamsungTarMd5,
    SpreadtrumPac,
    AndroidSparse,
    QualcommPayloadRaw,
    Unknown
};

class UniversalUnpacker {
public:
    static FirmwareContainerType IdentifyContainer(const uint8_t* headerBuffer, size_t bufferSize);

    // Android Sparse to Raw Extractor
    static bool UnpackSparseImage(
        const uint8_t* sparseBuffer,
        size_t bufferSize,
        std::vector<uint8_t>& outRawImage,
        std::function<void(size_t blocksProcessed, size_t totalBlocks)> progressCb = nullptr
    );

    // Samsung TAR / TAR.MD5 Parser
    static bool ParseSamsungTarArchive(
        const uint8_t* archiveBuffer,
        size_t bufferSize,
        std::vector<FirmwareArchiveEntry>& outEntries,
        std::string& outError
    );

    // Spreadtrum PAC Container Parser
    static bool ParseSpreadtrumPacArchive(
        const uint8_t* pacBuffer,
        size_t bufferSize,
        std::vector<FirmwareArchiveEntry>& outEntries,
        std::string& outError
    );
};

} // namespace OmniFix::Firmware
