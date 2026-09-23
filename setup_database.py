import sqlite3
import json

def setup_devices_database(json_file_path="mobile_devices.json", db_path="apex_devices.db"):
    # إنشاء أو فتح قاعدة البيانات المحلية SQLite
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # إنشاء جدول الشركات
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS brands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            country TEXT
        )
    ''')

    # إنشاء جدول الموديلات
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand_id INTEGER,
            series_name TEXT,
            model_name TEXT NOT NULL,
            model_number TEXT,
            chipset_vendor TEXT,
            chipset TEXT,
            FOREIGN KEY (brand_id) REFERENCES brands (id)
        )
    ''')

    # قراءة بيانات ملف الـ JSON
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"خطأ: لم يتم العثور على الملف {json_file_path}!")
        return

    # إدخال البيانات في الجدول
    for brand_info in data['manufacturers']:
        cursor.execute('''
            INSERT OR IGNORE INTO brands (name, country) 
            VALUES (?, ?)
        ''', (brand_info['brand'], brand_info.get('country', 'Unknown')))
        
        cursor.execute('SELECT id FROM brands WHERE name = ?', (brand_info['brand'],))
        brand_id = cursor.fetchone()[0]

        for series in brand_info['series']:
            series_name = series['name']
            for model in series['models']:
                cursor.execute('''
                    INSERT INTO models (brand_id, series_name, model_name, model_number, chipset_vendor, chipset)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    brand_id,
                    series_name,
                    model['model_name'],
                    model['model_number'],
                    model['chipset_vendor'],
                    model['chipset']
                ))

    conn.commit()
    conn.close()
    print("تم بناء قاعدة البيانات وتغذيتها بنجاح في الملف apex_devices.db!")

if __name__ == "__main__":
    setup_devices_database()
