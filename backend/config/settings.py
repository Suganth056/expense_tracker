import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "db.uikfvimesinoxgzqlxdj.supabase.co")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_NAME = os.getenv("DB_NAME", "postgres")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "O0MEJ4JA5SYiyobd")

USER_TABLES = "UserDetails"

INCOME_TABLE = "Income_Entry"

EXPENDITURE_TABLE = "exp_entry"
