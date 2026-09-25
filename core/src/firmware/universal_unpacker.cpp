#include "firmware/universal_unpacker.hpp"
#include <cstring>
#include <algorithm>

namespace OmniFix::Firmware {

FirmwareContainerType UniversalUnpacker::IdentifyContainer(const uint8_t* buf, size_t size) {
    if (size >= sizeof(SparseHeader)) {
        const auto* sparse = reinterpret_cast<const SparseHeader*>(buf);
        if (sparse->magic == SPARSE_HEADER_MAGIC) {
            return FirmwareContainerType::AndroidSparse;
        }
    }

    // TAR header magic check at offset 257 ("ustar")
    if (size >= 512) {
        if (std::memcmp(buf + 257, "ustar", 5) == 0) {
            return FirmwareContainerType::SamsungTarMd5;
        }
    }

    // Spreadtrum PAC magic (Unicode "B\0P\0A\0C\0" or "BPAC")
    if (size >= 8) {
        if (std::memcmp(buf, "B\0P\0A\0C\0", 8) == 0 || std::memcmp(buf, "BPAC", 4) == 0) {
            return FirmwareContainerType::SpreadtrumPac;
        }
    }

    return FirmwareContainerType::Unknown;
}

bool UniversalUnpacker::UnpackSparseImage(
    const uint8_t* sparseBuffer,
    size_t bufferSize,
    std::vector<uint8_t>& outRawImage,
    std::function<void(size_t, size_t)> progressCb
) {
    if (bufferSize < sizeof(SparseHeader)) return false;

    const auto* header = reinterpret_cast<const SparseHeader*>(sparseBuffer);
    if (header->magic != SPARSE_HEADER_MAGIC) return false;

    uint64_t totalOutputBytes = static_cast<uint64_t>(header->totalBlocks) * header->blockSize;
    outRawImage.assign(totalOutputBytes, 0);

    const uint8_t* ptr = sparseBuffer + header->fileHeaderSize;
    const uint8_t* endPtr = sparseBuffer + bufferSize;

    uint64_t currentBlock = 0;

    for (uint32_t c = 0; c < header->totalChunks; ++c) {
        if (ptr + sizeof(ChunkHeader) > endPtr) return false;

        const auto* chunk = reinterpret_cast<const ChunkHeader*>(ptr);
        ptr += header->chunkHeaderSize;

        uint64_t chunkOutputBytes = static_cast<uint64_t>(chunk->chunkBlocks) * header->blockSize;
        uint64_t outOffset = currentBlock * header->blockSize;

        if (chunk->chunkType == CHUNK_TYPE_RAW) {
            uint32_t dataBytes = chunk->totalBytes - header->chunkHeaderSize;
            if (ptr + dataBytes > endPtr || outOffset + dataBytes > totalOutputBytes) {
                return false;
            }
            std::memcpy(outRawImage.data() + outOffset, ptr, dataBytes);
            ptr += dataBytes;
        } 
        else if (chunk->chunkType == CHUNK_TYPE_FILL) {
            if (ptr + 4 > endPtr) return false;
            uint32_t fillVal = *reinterpret_cast<const uint32_t*>(ptr);
            ptr += 4;

            uint32_t* dst32 = reinterpret_cast<uint32_t*>(outRawImage.data() + outOffset);
            size_t count32 = chunkOutputBytes / 4;
            std::fill(dst32, dst32 + count32, fillVal);
        } 
        else if (chunk->chunkType == CHUNK_TYPE_DONT_CARE) {
            // Unallocated blocks, already zeroed
        } 
        else if (chunk->chunkType == CHUNK_TYPE_CRC32) {
            if (ptr + 4 > endPtr) return false;
            ptr += 4;
        }

        currentBlock += chunk->chunkBlocks;
        if (progressCb) {
            progressCb(currentBlock, header->totalBlocks);
        }
    }

    return true;
}

bool UniversalUnpacker::ParseSamsungTarArchive(
    const uint8_t* archiveBuffer,
    size_t bufferSize,
    std::vector<FirmwareArchiveEntry>& outEntries,
    std::string& outError
) {
    outEntries.clear();
    size_t offset = 0;

    while (offset + 512 <= bufferSize) {
        const uint8_t* block = archiveBuffer + offset;

        // Two consecutive empty blocks indicate end of TAR
        bool isZeroBlock = true;
        for (int i = 0; i < 512; ++i) {
            if (block[i] != 0) {
                isZeroBlock = false;
                break;
            }
        }
        if (isZeroBlock) break;

        char nameBuf[101] = {0};
        std::memcpy(nameBuf, block, 100);

        char sizeBuf[13] = {0};
        std::memcpy(sizeBuf, block + 124, 12);
        uint64_t fileSize = std::strtoull(sizeBuf, nullptr, 8); // Octal format

        FirmwareArchiveEntry entry;
        entry.filename = nameBuf;
        entry.fileOffset = offset + 512;
        entry.fileSize = fileSize;
        entry.isCompressed = false;
        entry.compressionType = "NONE";

        if (entry.filename.find(".lz4") != std::string::npos) {
            entry.isCompressed = true;
            entry.compressionType = "LZ4";
        }

        outEntries.push_back(entry);

        // Advance past header + padded payload blocks (512-byte aligned)
        size_t paddedSize = (fileSize + 511) & ~511;
        offset += 512 + paddedSize;
    }

    return !outEntries.empty();
}

bool UniversalUnpacker::ParseSpreadtrumPacArchive(
    const uint8_t* pacBuffer,
    size_t bufferSize,
    std::vector<FirmwareArchiveEntry>& outEntries,
    std::string& outError
) {
    // PAC container structure header
    if (bufferSize < 48) {
        outError = "Spreadtrum PAC archive too small";
        return false;
    }

    uint32_t fileCount = *reinterpret_cast<const uint32_t*>(pacBuffer + 24);
    if (fileCount == 0 || fileCount > 100) {
        outError = "Invalid PAC partition item count";
        return false;
    }

    return true;
}

} // namespace OmniFix::Firmware
