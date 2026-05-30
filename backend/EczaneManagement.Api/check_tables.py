import psycopg2

conn_str = "host=***GIZLI_HOST*** dbname=postgres user=postgres password=***GIZLI_SIFRE*** sslmode=require"
try:
    conn = psycopg2.connect(conn_str)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
    """)
    tables = cursor.fetchall()
    
    # Also check if there's any data
    if tables:
        print("Row counts:")
        for table in tables:
            cursor.execute(f'SELECT count(*) FROM "{table[0]}";')
            count = cursor.fetchone()[0]
            print(f"- {table[0]}: {count} rows")
            
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
