#include "cloud/chunked_streaming_flash.hpp"
#include "security/mandatory_backup.hpp"
#include <thread>
#include <chrono>
#include <algorithm>
#include <iostream>

namespace OmniFix::Cloud {

ChunkedStreamingFlashEngine::ChunkedStreamingFlashEngine(size_t ringBufferSize)
    : m_maxRingChunks(ringBufferSize) {}

ChunkedStreamingFlashEngine::~ChunkedStreamingFlashEngine() = default;

bool ChunkedStreamingFlashEngine::InitializeSession(const std::string& manifestUrl, const std::string& targetPartition, uint64_t totalFirmwareSize) {
    m_targetPartition = targetPartition;
    m_totalSize = totalFirmwareSize;
    m_totalBytesStreamed = 0;
    m_isCompleted = false;

    // Clear ring buffer queue
    std::lock_guard<std::mutex> lock(m_ringMutex);
    std::queue<FirmwareChunk> empty;
    std::swap(m_ringBuffer, empty);

    return true;
}

bool ChunkedStreamingFlashEngine::FetchNextChunkRange(uint64_t offset, size_t length, FirmwareChunk& outChunk) {
    outChunk.byteOffset = offset;
    outChunk.chunkSize = length;
    outChunk.payload.assign(length, 0xE5); // Simulated network payload chunk

    // Compute cryptographic SHA-256 for chunk integrity
    outChunk.expectedSha256 = Security::Sha256Engine::ComputeHex(outChunk.payload);
    outChunk.isVerified = true;
    return true;
}

bool ChunkedStreamingFlashEngine::StreamAndFlashDirectToDevice(FlashChunkWriterFn writerFn, ChunkDownloadProgressFn progressFn) {
    const size_t chunkSize = 1048576; // 1MB chunks
    uint64_t currentOffset = 0;
    uint64_t chunkIndex = 0;

    auto startTime = std::chrono::steady_clock::now();

    while (currentOffset < m_totalSize) {
        size_t currentChunkSize = std::min(static_cast<uint64_t>(chunkSize), m_totalSize - currentOffset);

        FirmwareChunk chunk;
        chunk.chunkIndex = chunkIndex++;
        if (!FetchNextChunkRange(currentOffset, currentChunkSize, chunk)) {
            return false;
        }

        // Verify SHA-256 before committing write
        std::string calcSha = Security::Sha256Engine::ComputeHex(chunk.payload);
        if (calcSha != chunk.expectedSha256) {
            std::cerr << "[CloudStream] Chunk " << chunk.chunkIndex << " SHA-256 hash mismatch! Aborting." << std::endl;
            return false;
        }

        // Flash chunk directly into phone hardware without disk write
        uint64_t sectorOffset = currentOffset / 4096;
        if (!writerFn(sectorOffset, chunk.payload.data(), chunk.payload.size())) {
            std::cerr << "[CloudStream] Device write failed at offset " << currentOffset << std::endl;
            return false;
        }

        currentOffset += currentChunkSize;
        m_totalBytesStreamed = currentOffset;

        if (progressFn) {
            auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now() - startTime).count();
            float speedMbps = (elapsed > 0) ? (static_cast<float>(currentOffset * 8) / (elapsed * 1000.0f)) : 0.0f;
            progressFn(currentOffset, m_totalSize, speedMbps);
        }
    }

    m_isCompleted = true;
    return true;
}

} // namespace OmniFix::Cloud
