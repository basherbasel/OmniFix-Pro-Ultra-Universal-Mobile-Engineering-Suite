#pragma once

#include <string>
#include <vector>
#include <cstdint>
#include <memory>
#include <map>

namespace OmniFix::Storage {

#pragma pack(push, 1)

// Dynamic Partition (super.img) LP Metadata structures (Android 10 - Android 16)
constexpr uint32_t LP_METADATA_GEOMETRY_MAGIC = 0x616C4467; // "gDla"
constexpr uint32_t LP_METADATA_HEADER_MAGIC   = 0x414C5030; // "0PLA"

struct LpMetadataGeometry {
    uint32_t magic;              // 0x616C4467
    uint16_t struct_size;
    uint8_t checksum[32];        // SHA-256 of geometry
    uint32_t metadata_max_size;
    uint32_t metadata_slot_count;
    uint32_t logical_block_size;
};

struct LpMetadataHeader {
    uint32_t magic;              // 0x414C5030
    uint16_t major_version;
    uint16_t minor_version;
    uint32_t header_size;
    uint8_t header_checksum[32]; // SHA-256 of header
    uint32_t tables_size;
    uint8_t tables_checksum[32];
    // Table descriptors
    uint32_t partitions_offset;
    uint32_t partitions_num_entries;
    uint32_t partitions_entry_size;
    uint32_t extents_offset;
    uint32_t extents_num_entries;
    uint32_t extents_entry_size;
    uint32_t groups_offset;
    uint32_t groups_num_entries;
    uint32_t groups_entry_size;
    uint32_t block_devices_offset;
    uint32_t block_devices_num_entries;
    uint32_t block_devices_entry_size;
};

struct LpMetadataPartition {
    char name[36];
    uint32_t attributes;
    uint32_t first_extent_index;
    uint32_t num_extents;
    uint32_t group_index;
};

struct LpMetadataExtent {
    uint64_t num_sectors;
    uint32_t target_type; // 0 = linear, 1 = zero
    uint64_t target_data; // physical sector offset
    uint32_t target_source;
};

#pragma pack(pop)

struct SubPartitionSlice {
    std::string name;
    uint64_t sector_start;
    uint64_t sector_count;
    uint64_t byte_size;
    std::string fs_type; // "erofs", "ext4", "f2fs", "unknown"
};

class SuperPartitionSlicer {
public:
    static bool ParseSuperImage(
        const uint8_t* super_buffer,
        size_t buffer_size,
        std::vector<SubPartitionSlice>& out_slices,
        std::string& out_error
    );

    // Carve out a sub-partition (e.g. "system_a" or "vendor") into independent raw image
    static bool ExtractSubPartition(
        const uint8_t* super_buffer,
        size_t buffer_size,
        const SubPartitionSlice& slice,
        std::vector<uint8_t>& out_sub_image
    );

    // Identify underlying filesystem (EROFS, EXT4, F2FS)
    static std::string DetectFilesystem(const uint8_t* partition_start, size_t sample_len);
};

} // namespace OmniFix::Storage
