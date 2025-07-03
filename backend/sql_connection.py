import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

__cnx = None

def get_sql_connection():
    global __cnx
    if __cnx is None or __cnx.closed != 0:
        __cnx = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASS"),
            dbname=os.getenv("DB_NAME"),
            sslmode="require",  # required for Neon
            channel_binding="require"
        )

        cursor = __cnx.cursor()
        cursor.execute("SET TIME ZONE 'Asia/Kolkata'")
        cursor.close()

    return __cnx
