#pragma once

#include <string>
#include <vector>
#include <functional>
#include <cstdint>
#include <memory>
#include <queue>
#include <mutex>
#include <condition_variable>

namespace OmniFix::Cloud {

struct FirmwareChunk {
    uint64_t chunkIndex;
    uint64_t byteOffset;
    size_t chunkSize;
    std::string expectedSha256;
    std::vector<uint8_t> payload;
    bool isVerified;
};

using FlashChunkWriterFn = std::function<bool(uint64_t sectorOffset, const uint8_t* data, size_t size)>;
using ChunkDownloadProgressFn = std::function<void(uint64_t downloadedBytes, uint64_t totalBytes, float speedMbps)>;

class ChunkedStreamingFlashEngine {
public:
    ChunkedStreamingFlashEngine(size_t ringBufferSize = 4);
    ~ChunkedStreamingFlashEngine();

    bool InitializeSession(const std::string& manifestUrl, const std::string& targetPartition, uint64_t totalFirmwareSize);
    bool StreamAndFlashDirectToDevice(FlashChunkWriterFn writerFn, ChunkDownloadProgressFn progressFn);

    uint64_t GetTotalBytesStreamed() const { return m_totalBytesStreamed; }
    bool IsCompleted() const { return m_isCompleted; }

private:
    std::string m_targetPartition;
    uint64_t m_totalSize{0};
    uint64_t m_totalBytesStreamed{0};
    bool m_isCompleted{false};
    size_t m_maxRingChunks;

    std::queue<FirmwareChunk> m_ringBuffer;
    std::mutex m_ringMutex;
    std::condition_variable m_cvBufferNotFull;
    std::condition_variable m_cvBufferNotEmpty;

    bool FetchNextChunkRange(uint64_t offset, size_t length, FirmwareChunk& outChunk);
};

} // namespace OmniFix::Cloud
