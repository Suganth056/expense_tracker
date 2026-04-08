import pyodbc
from config.settings import DATABASE_NAME,SERVER_NAME


def get_connection():
    try:
        conn = pyodbc.connect(
            f"DRIVER=ODBC Driver 17 for SQL Server;"
            f"SERVER={SERVER_NAME};"   # e.g., localhost\\SQLEXPRESS
            f"DATABASE={DATABASE_NAME};"
            f"Trusted_Connection=yes;"
        )
        return conn
    except Exception as e:
        print("Database connection error:", e)
        return None