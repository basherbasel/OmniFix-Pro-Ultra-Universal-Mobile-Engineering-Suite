#include "security/mandatory_backup.hpp"
#include <cstring>
#include <sstream>
#include <iomanip>
#include <ctime>

namespace OmniFix::Security {

// SHA-256 Constants (FIPS 180-4)
static const uint32_t K[64] = {
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
};

#define ROR(x, n) (((x) >> (n)) | ((x) << (32 - (n))))
#define CH(x, y, z) (((x) & (y)) ^ (~(x) & (z)))
#define MAJ(x, y, z) (((x) & (y)) ^ ((x) & (z)) ^ ((y) & (z)))
#define EP0(x) (ROR(x, 2) ^ ROR(x, 13) ^ ROR(x, 22))
#define EP1(x) (ROR(x, 6) ^ ROR(x, 11) ^ ROR(x, 25))
#define SIG0(x) (ROR(x, 7) ^ ROR(x, 18) ^ ((x) >> 3))
#define SIG1(x) (ROR(x, 17) ^ ROR(x, 19) ^ ((x) >> 10))

Sha256Engine::Sha256Engine() {
    Reset();
}

void Sha256Engine::Reset() {
    m_state[0] = 0x6a09e667;
    m_state[1] = 0xbb67ae85;
    m_state[2] = 0x3c6ef372;
    m_state[3] = 0xa54ff53a;
    m_state[4] = 0x510e527f;
    m_state[5] = 0x9b05688c;
    m_state[6] = 0x1f83d9ab;
    m_state[7] = 0x5be0cd19;
    m_count = 0;
}

void Sha256Engine::Transform(const uint8_t data[64]) {
    uint32_t a = m_state[0];
    uint32_t b = m_state[1];
    uint32_t c = m_state[2];
    uint32_t d = m_state[3];
    uint32_t e = m_state[4];
    uint32_t f = m_state[5];
    uint32_t g = m_state[6];
    uint32_t h = m_state[7];
    uint32_t m[64];

    for (int i = 0; i < 16; ++i) {
        m[i] = (static_cast<uint32_t>(data[i * 4]) << 24) |
               (static_cast<uint32_t>(data[i * 4 + 1]) << 16) |
               (static_cast<uint32_t>(data[i * 4 + 2]) << 8) |
               (static_cast<uint32_t>(data[i * 4 + 3]));
    }
    for (int i = 16; i < 64; ++i) {
        m[i] = SIG1(m[i - 2]) + m[i - 7] + SIG0(m[i - 15]) + m[i - 16];
    }

    for (int i = 0; i < 64; ++i) {
        uint32_t t1 = h + EP1(e) + CH(e, f, g) + K[i] + m[i];
        uint32_t t2 = EP0(a) + MAJ(a, b, c);
        h = g;
        g = f;
        f = e;
        e = d + t1;
        d = c;
        c = b;
        b = a;
        a = t1 + t2;
    }

    m_state[0] += a;
    m_state[1] += b;
    m_state[2] += c;
    m_state[3] += d;
    m_state[4] += e;
    m_state[5] += f;
    m_state[6] += g;
    m_state[7] += h;
}

void Sha256Engine::Update(const uint8_t* data, size_t length) {
    for (size_t i = 0; i < length; ++i) {
        m_buffer[m_count % 64] = data[i];
        m_count++;
        if (m_count % 64 == 0) {
            Transform(m_buffer);
        }
    }
}

void Sha256Engine::Final(std::array<uint8_t, 32>& digest) {
    uint64_t totalBits = m_count * 8;
    Update(reinterpret_cast<const uint8_t*>("\x80"), 1);

    while (m_count % 64 != 56) {
        Update(reinterpret_cast<const uint8_t*>("\0"), 1);
    }

    uint8_t lenBytes[8];
    for (int i = 0; i < 8; ++i) {
        lenBytes[i] = static_cast<uint8_t>((totalBits >> ((7 - i) * 8)) & 0xFF);
    }
    Update(lenBytes, 8);

    for (int i = 0; i < 8; ++i) {
        digest[i * 4] = static_cast<uint8_t>((m_state[i] >> 24) & 0xFF);
        digest[i * 4 + 1] = static_cast<uint8_t>((m_state[i] >> 16) & 0xFF);
        digest[i * 4 + 2] = static_cast<uint8_t>((m_state[i] >> 8) & 0xFF);
        digest[i * 4 + 3] = static_cast<uint8_t>(m_state[i] & 0xFF);
    }
}

std::string Sha256Engine::ComputeHex(const uint8_t* data, size_t length) {
    Sha256Engine engine;
    engine.Update(data, length);
    std::array<uint8_t, 32> digest;
    engine.Final(digest);

    std::ostringstream ss;
    ss << std::hex << std::setfill('0');
    for (uint8_t b : digest) {
        ss << std::setw(2) << static_cast<int>(b);
    }
    return ss.str();
}

std::string Sha256Engine::ComputeHex(const std::vector<uint8_t>& data) {
    return ComputeHex(data.data(), data.size());
}

// -----------------------------------------------------------------------------
// Mandatory Security Backup Engine
// -----------------------------------------------------------------------------
MandatoryBackupArchive MandatorySecurityBackupEngine::CreateBackup(
    const std::string& model,
    const std::string& chipset,
    const std::string& serial,
    const std::vector<std::pair<std::string, std::vector<uint8_t>>>& rawPartitions
) {
    MandatoryBackupArchive archive;
    archive.targetModel = model;
    archive.targetChipset = chipset;
    archive.createdAtUnixEpoch = std::time(nullptr);

    Sha256Engine compositeSha;
    compositeSha.Update(reinterpret_cast<const uint8_t*>(model.data()), model.size());
    compositeSha.Update(reinterpret_cast<const uint8_t*>(serial.data()), serial.size());

    for (const auto& [partName, data] : rawPartitions) {
        SecurityPartitionMetadata meta;
        meta.partitionName = partName;
        meta.sizeInBytes = data.size();
        meta.sha256Hex = Sha256Engine::ComputeHex(data);
        meta.originalDeviceSerial = serial;
        meta.timestampUtc = std::to_string(archive.createdAtUnixEpoch);
        meta.binaryBlob = data;

        compositeSha.Update(data.data(), data.size());
        archive.partitions.push_back(meta);
    }

    std::array<uint8_t, 32> compDigest;
    compositeSha.Final(compDigest);

    std::ostringstream compHex;
    compHex << std::hex << std::setfill('0');
    for (uint8_t b : compDigest) compHex << std::setw(2) << static_cast<int>(b);
    archive.compositeArchiveSha256 = compHex.str();
    archive.archiveId = "SEC_BKP_" + compHex.str().substr(0, 16);

    return archive;
}

bool MandatorySecurityBackupEngine::VerifyBackupIntegrity(const MandatoryBackupArchive& archive, std::string& outMismatchError) {
    for (const auto& part : archive.partitions) {
        std::string recalculated = Sha256Engine::ComputeHex(part.binaryBlob);
        if (recalculated != part.sha256Hex) {
            outMismatchError = "Partition integrity corruption detected in " + part.partitionName + 
                               " (Recorded SHA: " + part.sha256Hex + ", Calculated: " + recalculated + ")";
            return false;
        }
    }
    return true;
}

std::vector<uint8_t> MandatorySecurityBackupEngine::SerializeArchive(const MandatoryBackupArchive& archive) {
    std::vector<uint8_t> out;
    // Magic: OMNI_SEC (8 bytes)
    const char magic[8] = {'O','M','N','I','_','S','E','C'};
    out.insert(out.end(), magic, magic + 8);

    auto appendString = [&out](const std::string& str) {
        uint32_t len = str.size();
        out.push_back((len >> 24) & 0xFF);
        out.push_back((len >> 16) & 0xFF);
        out.push_back((len >> 8) & 0xFF);
        out.push_back(len & 0xFF);
        out.insert(out.end(), str.begin(), str.end());
    };

    appendString(archive.archiveId);
    appendString(archive.targetModel);
    appendString(archive.targetChipset);
    appendString(archive.compositeArchiveSha256);

    uint32_t partCount = archive.partitions.size();
    out.push_back((partCount >> 24) & 0xFF);
    out.push_back((partCount >> 16) & 0xFF);
    out.push_back((partCount >> 8) & 0xFF);
    out.push_back(partCount & 0xFF);

    for (const auto& part : archive.partitions) {
        appendString(part.partitionName);
        appendString(part.sha256Hex);
        appendString(part.originalDeviceSerial);
        uint32_t blobSize = part.binaryBlob.size();
        out.push_back((blobSize >> 24) & 0xFF);
        out.push_back((blobSize >> 16) & 0xFF);
        out.push_back((blobSize >> 8) & 0xFF);
        out.push_back(blobSize & 0xFF);
        out.insert(out.end(), part.binaryBlob.begin(), part.binaryBlob.end());
    }

    return out;
}

std::optional<MandatoryBackupArchive> MandatorySecurityBackupEngine::DeserializeArchive(const uint8_t* data, size_t length) {
    if (length < 8 || std::memcmp(data, "OMNI_SEC", 8) != 0) return std::nullopt;

    size_t offset = 8;
    auto readString = [data, length, &offset]() -> std::optional<std::string> {
        if (offset + 4 > length) return std::nullopt;
        uint32_t len = (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3];
        offset += 4;
        if (offset + len > length) return std::nullopt;
        std::string s(reinterpret_cast<const char*>(data + offset), len);
        offset += len;
        return s;
    };

    MandatoryBackupArchive arch;
    auto id = readString(); if (!id) return std::nullopt; arch.archiveId = *id;
    auto model = readString(); if (!model) return std::nullopt; arch.targetModel = *model;
    auto chip = readString(); if (!chip) return std::nullopt; arch.targetChipset = *chip;
    auto sha = readString(); if (!sha) return std::nullopt; arch.compositeArchiveSha256 = *sha;

    if (offset + 4 > length) return std::nullopt;
    uint32_t count = (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3];
    offset += 4;

    for (uint32_t i = 0; i < count; ++i) {
        SecurityPartitionMetadata part;
        auto pName = readString(); if (!pName) return std::nullopt; part.partitionName = *pName;
        auto pSha = readString(); if (!pSha) return std::nullopt; part.sha256Hex = *pSha;
        auto pSer = readString(); if (!pSer) return std::nullopt; part.originalDeviceSerial = *pSer;

        if (offset + 4 > length) return std::nullopt;
        uint32_t bSize = (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3];
        offset += 4;
        if (offset + bSize > length) return std::nullopt;
        part.binaryBlob.assign(data + offset, data + offset + bSize);
        part.sizeInBytes = bSize;
        offset += bSize;

        arch.partitions.push_back(part);
    }

    return arch;
}

} // namespace OmniFix::Security
