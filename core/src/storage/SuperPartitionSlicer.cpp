#include "storage/SuperPartitionSlicer.hpp"
#include <cstring>
#include <iostream>

namespace OmniFix::Storage {

// Magic constants for Linux/Android Filesystems
constexpr uint32_t EROFS_MAGIC = 0xE0F5E1E2; // Enhanced Read-Only File System
constexpr uint16_t EXT4_MAGIC  = 0xEF53;     // Second/Third/Fourth Extended Filesystem
constexpr uint32_t F2FS_MAGIC  = 0xF2F52010; // Flash-Friendly File System

std::string SuperPartitionSlicer::DetectFilesystem(const uint8_t* data, size_t len) {
    if (len >= 1024 + sizeof(uint16_t)) {
        // EXT4 magic resides at offset 0x438 (1080)
        uint16_t extMagic = *reinterpret_cast<const uint16_t*>(data + 1080);
        if (extMagic == EXT4_MAGIC) {
            return "ext4";
        }
    }

    if (len >= 1024 + sizeof(uint32_t)) {
        // F2FS superblock magic at offset 1024
        uint32_t f2fsMagic = *reinterpret_cast<const uint32_t*>(data + 1024);
        if (f2fsMagic == F2FS_MAGIC) {
            return "f2fs";
        }
    }

    if (len >= 1024 + sizeof(uint32_t)) {
        // EROFS superblock magic at offset 1024
        uint32_t erofsMagic = *reinterpret_cast<const uint32_t*>(data + 1024);
        if (erofsMagic == EROFS_MAGIC) {
            return "erofs";
        }
    }

    return "raw_binary";
}

bool SuperPartitionSlicer::ParseSuperImage(
    const uint8_t* super_buffer,
    size_t buffer_size,
    std::vector<SubPartitionSlice>& out_slices,
    std::string& out_error
) {
    out_slices.clear();

    // Primary geometry block offset is 4096 (1 LP Block)
    if (buffer_size < 8192) {
        out_error = "Super image smaller than minimum LP geometry boundary (8192 bytes)";
        return false;
    }

    const auto* geometry = reinterpret_cast<const LpMetadataGeometry*>(super_buffer + 4096);
    if (geometry->magic != LP_METADATA_GEOMETRY_MAGIC) {
        out_error = "Invalid LP Metadata Geometry magic. Image is not an Android dynamic super.img";
        return false;
    }

    // Header offset is typically at 4096 + geometry->struct_size (or 8192)
    size_t header_offset = 8192;
    if (buffer_size < header_offset + sizeof(LpMetadataHeader)) {
        out_error = "Image truncated before LP Metadata Header";
        return false;
    }

    const auto* header = reinterpret_cast<const LpMetadataHeader*>(super_buffer + header_offset);
    if (header->magic != LP_METADATA_HEADER_MAGIC) {
        out_error = "Invalid LP Metadata Header signature";
        return false;
    }

    // Tables base offset
    size_t tables_base = header_offset + header->header_size;
    const uint8_t* part_table = super_buffer + tables_base + header->partitions_offset;
    const uint8_t* extent_table = super_buffer + tables_base + header->extents_offset;

    for (uint32_t i = 0; i < header->partitions_num_entries; ++i) {
        const auto* part = reinterpret_cast<const LpMetadataPartition*>(part_table + (i * header->partitions_entry_size));
        if (part->num_extents == 0 || part->name[0] == '\0') continue;

        SubPartitionSlice slice;
        char name_buf[37] = {0};
        std::memcpy(name_buf, part->name, 36);
        slice.name = name_buf;
        slice.sector_start = 0;
        slice.sector_count = 0;

        for (uint32_t e = 0; e < part->num_extents; ++e) {
            uint32_t extent_idx = part->first_extent_index + e;
            const auto* extent = reinterpret_cast<const LpMetadataExtent*>(extent_table + (extent_idx * header->extents_entry_size));
            if (e == 0) {
                slice.sector_start = extent->target_data;
            }
            slice.sector_count += extent->num_sectors;
        }

        slice.byte_size = slice.sector_count * 512;

        // Detect filesystem
        size_t byte_start = slice.sector_start * 512;
        if (byte_start + 4096 <= buffer_size) {
            slice.fs_type = DetectFilesystem(super_buffer + byte_start, 4096);
        } else {
            slice.fs_type = "unknown";
        }

        out_slices.push_back(slice);
    }

    return !out_slices.empty();
}

bool SuperPartitionSlicer::ExtractSubPartition(
    const uint8_t* super_buffer,
    size_t buffer_size,
    const SubPartitionSlice& slice,
    std::vector<uint8_t>& out_sub_image
) {
    size_t byte_start = slice.sector_start * 512;
    size_t byte_len = slice.byte_size;

    if (byte_start + byte_len > buffer_size) {
        return false;
    }

    out_sub_image.assign(super_buffer + byte_start, super_buffer + byte_start + byte_len);
    return true;
}

} // namespace OmniFix::Storage
