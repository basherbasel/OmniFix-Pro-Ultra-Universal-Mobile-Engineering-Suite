cmake_minimum_required(VERSION 3.16)
project(OmniFixCoreEngine VERSION 5.4.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

# Complete Source files including Silicon direct hardware, Firehose XML, Apple DFU, & Fastboot
set(CORE_SOURCES
    src/vid_pid_matrix.cpp
    src/hardware_monitor.cpp
    src/encrypted_db.cpp
    src/protocols/qualcomm_sahara.cpp
    src/protocols/mediatek_brom.cpp
    src/protocols/spreadtrum_boot.cpp
    src/protocols/UniversalFastbootEngine.cpp
    src/firmware/gpt_parser.cpp
    src/firmware/universal_unpacker.cpp
    src/security/mandatory_backup.cpp
    src/repair/bootloop_repair.cpp
    src/ai/logcat_analyzer.cpp
    src/cloud/chunked_streaming_flash.cpp
    src/security/anti_tamper_shield.cpp
    src/silicon/SaharaProtocol.cpp
    src/silicon/MediaTekBromProtocol.cpp
    src/silicon/UnisocFdlProtocol.cpp
    src/silicon/SamsungLokeProtocol.cpp
    src/silicon/QualcommFirehoseEngine.cpp
    src/silicon/AppleDfuRecoveryProtocol.cpp
    src/storage/SuperPartitionSlicer.cpp
    src/main_core.cpp
)

find_package(PkgConfig QUIET)
if (PKG_CONFIG_FOUND)
    pkg_check_modules(LIBUSB libusb-1.0)
    pkg_check_modules(SQLCIPHER sqlcipher)
endif()

add_executable(omnifix_core ${CORE_SOURCES})

if (LIBUSB_FOUND)
    target_include_directories(omnifix_core PRIVATE ${LIBUSB_INCLUDE_DIRS})
    target_link_libraries(omnifix_core PRIVATE ${LIBUSB_LIBRARIES})
    target_compile_definitions(omnifix_core PRIVATE HAVE_LIBUSB=1)
endif()

if (SQLCIPHER_FOUND)
    target_include_directories(omnifix_core PRIVATE ${SQLCIPHER_INCLUDE_DIRS})
    target_link_libraries(omnifix_core PRIVATE ${SQLCIPHER_LIBRARIES})
    target_compile_definitions(omnifix_core PRIVATE HAVE_SQLCIPHER=1)
else()
    find_package(SQLite3 QUIET)
    if (SQLite3_FOUND)
        target_link_libraries(omnifix_core PRIVATE SQLite::SQLite3)
        target_compile_definitions(omnifix_core PRIVATE HAVE_SQLITE=1)
    endif()
endif()

target_link_libraries(omnifix_core PRIVATE pthread)
