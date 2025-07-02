import mysql.connector
from mysql.connector import connect
import os
from dotenv import load_dotenv
load_dotenv() 

__cnx = None

def get_sql_connection():
    global __cnx
    if __cnx is None or not __cnx.is_connected():
        __cnx = connect(
            host = os.getenv("DB_HOST"),
            user = os.getenv("DB_USER"),
            password = os.getenv("DB_PASS"),
            database = os.getenv("DB_NAME"),
            use_pure=True,  # <-- forces pure Python implementation
            ssl_disabled=True
        )
    return __cnx
