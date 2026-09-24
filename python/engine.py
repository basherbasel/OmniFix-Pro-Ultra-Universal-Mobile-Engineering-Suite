import sys
import json
import serial.tools.list_ports
import time

def scan_hardware():
    ports = serial.tools.list_ports.comports()
    devices = []
    for port in ports:
        if port.vid:
            devices.append({
                "port": port.device,
                "vid": f"{port.vid:04X}",
                "pid": f"{port.pid:04X}",
                "description": port.description
            })
    return devices

def handle_command(command, args):
    if command == "SCAN":
        return {"status": "SUCCESS", "devices": scan_hardware()}
    elif command == "CONNECT":
        # هنا يتم استدعاء مكاتب mtkclient أو أدوات Firehose
        return {"status": "CONNECTING", "port": args.get("port")}
    return {"status": "ERROR", "message": "Unknown command"}

# الحلقة الرئيسية للتنصت على الأوامر
def main():
    while True:
        try:
            line = sys.stdin.readline()
            if not line: break
            data = json.loads(line)
            
            result = handle_command(data.get("command"), data.get("args", {}))
            
            # إرسال النتيجة إلى Node.js عبر stdout
            print(json.dumps(result))
            sys.stdout.flush()
        except Exception as e:
            print(json.dumps({"status": "ERROR", "message": str(e)}))
            sys.stdout.flush()

if __name__ == "__main__":
    main()
