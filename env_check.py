import shutil
import subprocess
import sys
import os

def check_command(command_name, display_name):
    path = shutil.which(command_name)
    if path:
        print(f"[✔] {display_name} found at: {path}")
        return True
    else:
        print(f"[❌] {display_name} NOT found in system PATH.")
        return False

def main():
    print("=== OmniFix Pro Ultra - Environment Health Check ===")
    
    # 1. التحقق من أدوات الأندرويد الأساسية
    adb_ok = check_command("adb", "Android Debug Bridge (ADB)")
    fastboot_ok = check_command("fastboot", "Fastboot Tool")
    
    # 2. التحقق من توفر بايثون ومكتبات الوساطة
    print(f"[✔] Python Environment: {sys.version.split()[0]}")
    
    try:
        import serial
        print("[✔] PySerial library is installed.")
    except ImportError:
        print("[❌] PySerial library is missing. Run: pip install pyserial")

    try:
        import usb.core
        print("[✔] PyUSB library is installed.")
    except ImportError:
        print("[❌] PyUSB library is missing. Run: pip install pyusb")

    # 3. التحقق من وجود أداة mtkclient لمعالجات ميدياتك
    mtk_ok = check_command("mtk", "MediaTek Client (mtk-client)")
    if not mtk_ok:
        print("    -> Tip: You can install it via: pip install mtkclient")

    print("=====================================================")
    if adb_ok and fastboot_ok:
        print("Status: Core environment is ready for mobile operations.")
    else:
        print("Status: Action required! Please install missing tools and add them to PATH.")

if __name__ == "__main__":
    main()
