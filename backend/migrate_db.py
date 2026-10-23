import sqlite3
import os

db_paths = [
    r'C:\Users\DELL\OneDrive\Desktop\ExamVault\backend\database\examvault.db',
    r'C:\Users\DELL\.gemini\antigravity\scratch\ExamVault\backend\database\examvault.db'
]

for db_path in db_paths:
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(users)")
        cols = [r[1] for r in cur.fetchall()]
        print(f"Current columns in {db_path}: {cols}")
        
        if 'phone' not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20)")
            print("Added phone column")
        if 'is_approved' not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT 1")
            print("Added is_approved column")
        if 'approval_status' not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN approval_status VARCHAR(20) DEFAULT 'APPROVED'")
            print("Added approval_status column")
            
        conn.commit()
        conn.close()
        print(f"Migration completed for {db_path}")
