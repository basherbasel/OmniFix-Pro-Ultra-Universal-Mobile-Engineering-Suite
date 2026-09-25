#pragma once

#include "vid_pid_matrix.hpp"
#include <string>
#include <vector>
#include <memory>
#include <cstdint>

struct sqlite3;

namespace OmniFix::Core {

struct LoaderRecord {
    std::string loaderName;
    std::string chipFamily;
    std::string targetSoc;
    uint64_t fileSize;
    std::string sha256Hash;
    std::vector<uint8_t> payloadBlob;
};

class EncryptedDatabase {
public:
    EncryptedDatabase();
    ~EncryptedDatabase();

    bool Open(const std::string& dbPath, const std::string& encryptionKey);
    void Close();
    bool IsOpen() const { return m_db != nullptr; }

    bool InitializeSchema();
    bool SeedHardwareMatrix(const std::vector<HardwareProfile>& profiles);
    bool StoreLoader(const LoaderRecord& loader);
    std::optional<LoaderRecord> GetLoader(const std::string& loaderName);
    std::vector<LoaderRecord> ListLoadersForFamily(const std::string& chipFamily);

private:
    sqlite3* m_db{nullptr};
    std::string m_currentKey;
};

} // namespace OmniFix::Core
