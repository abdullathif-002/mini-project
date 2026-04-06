import sqlite3

path = 'd:/Mini project/backend/students.db'
conn = sqlite3.connect(path)
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
print('tables:', cur.fetchall())
for table in ['users','students']:
    try:
        cur.execute(f"SELECT * FROM {table};")
        rows = cur.fetchall()
        print(table, rows)
    except Exception as e:
        print('error', table, e)
conn.close()
