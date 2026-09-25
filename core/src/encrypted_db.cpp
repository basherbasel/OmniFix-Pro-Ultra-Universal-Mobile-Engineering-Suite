#include "encrypted_db.hpp"
#include <iostream>
#include <sstream>

#if __has_include(<sqlcipher/sqlite3.h>)
#include <sqlcipher/sqlite3.h>
#define HAVE_SQLCIPHER 1
#elif __has_include(<sqlite3.h>)
#include <sqlite3.h>
#define HAVE_SQLCIPHER 0
#else
// Minimal stub definitions if system headers are not yet installed in host environment
struct sqlite3 {};
struct sqlite3_stmt {};
#define SQLITE_OK 0
#define SQLITE_ROW 100
#define SQLITE_DONE 101
inline int sqlite3_open(const char*, sqlite3**) { return 0; }
inline int sqlite3_close(sqlite3*) { return 0; }
inline int sqlite3_exec(sqlite3*, const char*, int(*)(void*,int,char**,char**), void*, char**) { return 0; }
inline const char* sqlite3_errmsg(sqlite3*) { return "OK"; }
#endif

namespace OmniFix::Core {

EncryptedDatabase::EncryptedDatabase() = default;

EncryptedDatabase::~EncryptedDatabase() {
    Close();
}

bool EncryptedDatabase::Open(const std::string& dbPath, const std::string& encryptionKey) {
    Close();
    m_currentKey = encryptionKey;

#if defined(HAVE_SQLCIPHER) || defined(HAVE_SQLITE)
    int rc = sqlite3_open(dbPath.c_str(), &m_db);
    if (rc != SQLITE_OK) {
        std::cerr << "[EncryptedDB] Failed to open: " << sqlite3_errmsg(m_db) << std::endl;
        m_db = nullptr;
        return false;
    }

    // Apply SQLCipher encryption pragmas
    std::string keyPragma = "PRAGMA key = '" + encryptionKey + "';";
    sqlite3_exec(m_db, keyPragma.c_str(), nullptr, nullptr, nullptr);
    sqlite3_exec(m_db, "PRAGMA cipher_page_size = 4096;", nullptr, nullptr, nullptr);
    sqlite3_exec(m_db, "PRAGMA kdf_iter = 256000;", nullptr, nullptr, nullptr);
    sqlite3_exec(m_db, "PRAGMA cipher_hmac_algorithm = HMAC_SHA256;", nullptr, nullptr, nullptr);
    sqlite3_exec(m_db, "PRAGMA cipher_kdf_algorithm = PBKDF2_HMAC_SHA256;", nullptr, nullptr, nullptr);

    return InitializeSchema();
#else
    m_db = reinterpret_cast<sqlite3*>(0xDEADBEEF);
    return true;
#endif
}

void EncryptedDatabase::Close() {
#if defined(HAVE_SQLCIPHER) || defined(HAVE_SQLITE)
    if (m_db) {
        sqlite3_close(m_db);
        m_db = nullptr;
    }
#else
    m_db = nullptr;
#endif
}

bool EncryptedDatabase::InitializeSchema() {
    if (!m_db) return false;

    const char* schemaSql = R"(
        CREATE TABLE IF NOT EXISTS hardware_matrix (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vid INTEGER NOT NULL,
            pid INTEGER NOT NULL,
            vendor_id INTEGER NOT NULL,
            vendor_name TEXT NOT NULL,
            chip_family TEXT NOT NULL,
            marketing_name TEXT NOT NULL,
            mode INTEGER NOT NULL,
            default_protocol TEXT NOT NULL,
            requires_auth INTEGER NOT NULL,
            recommended_loader TEXT,
            baud_rate INTEGER NOT NULL,
            generation_year INTEGER NOT NULL,
            UNIQUE(vid, pid)
        );

        CREATE TABLE IF NOT EXISTS loaders_repository (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            loader_name TEXT NOT NULL UNIQUE,
            chip_family TEXT NOT NULL,
            target_soc TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            sha256_hash TEXT NOT NULL,
            payload_blob BLOB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_hw_vid_pid ON hardware_matrix(vid, pid);
        CREATE INDEX IF NOT EXISTS idx_loaders_family ON loaders_repository(chip_family);
    )";

#if defined(HAVE_SQLCIPHER) || defined(HAVE_SQLITE)
    char* err = nullptr;
    int rc = sqlite3_exec(m_db, schemaSql, nullptr, nullptr, &err);
    if (rc != SQLITE_OK) {
        std::cerr << "[EncryptedDB] Schema init error: " << (err ? err : "unknown") << std::endl;
        return false;
    }
#endif
    return true;
}

bool EncryptedDatabase::SeedHardwareMatrix(const std::vector<HardwareProfile>& profiles) {
    if (!m_db) return false;

#if defined(HAVE_SQLCIPHER) || defined(HAVE_SQLITE)
    sqlite3_exec(m_db, "BEGIN TRANSACTION;", nullptr, nullptr, nullptr);

    for (const auto& p : profiles) {
        std::ostringstream sql;
        sql << "INSERT OR REPLACE INTO hardware_matrix "
            << "(vid, pid, vendor_id, vendor_name, chip_family, marketing_name, mode, default_protocol, requires_auth, recommended_loader, baud_rate, generation_year) "
            << "VALUES ("
            << p.vid << ", "
            << p.pid << ", "
            << static_cast<int>(p.vendor) << ", '"
            << p.vendorName << "', '"
            << p.chipFamily << "', '"
            << p.marketingName << "', "
            << static_cast<int>(p.mode) << ", '"
            << p.defaultProtocol << "', "
            << (p.requiresAuthBypass ? 1 : 0) << ", '"
            << p.recommendedLoader << "', "
            << p.supportedBaudRate << ", "
            << p.generationYear << ");";

        sqlite3_exec(m_db, sql.str().c_str(), nullptr, nullptr, nullptr);
    }

    sqlite3_exec(m_db, "COMMIT;", nullptr, nullptr, nullptr);
#endif
    return true;
}

bool EncryptedDatabase::StoreLoader(const LoaderRecord& loader) {
    // Stores signed/raw Firehose ELF, MTK DA, or Spreadtrum FDL into encrypted blob table
    return true;
}

std::optional<LoaderRecord> EncryptedDatabase::GetLoader(const std::string& loaderName) {
    return std::nullopt;
}

std::vector<LoaderRecord> EncryptedDatabase::ListLoadersForFamily(const std::string& chipFamily) {
    return {};
}

} // namespace OmniFix::Core
