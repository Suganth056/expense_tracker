from fastapi import APIRouter, Request, Response
from config.settings import INCOME_TABLE
from config.db_config import get_connection
from datetime import date

income_router = APIRouter()

@income_router.get('/')
def get_income_details():
    return {"status":"from Income"}


@income_router.post('/post-income')
async def post_income(request:Request):
    body =await request.json()
    userId = body.get('user_id')
    amount = body.get('amount')
    reason = body.get('reason')

    conn = None
    try:
        conn = get_connection()
        today = date.today()
        if(conn):
            query = f"INSERT INTO {INCOME_TABLE}(userId,income_date,amount,reason) VALUES (?,?,?,?)"
            cursor = conn.cursor()
            cursor.execute(query,[userId,today,amount,reason])

            conn.commit()

    except Exception as e:
        print(e)
    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()




    return{"Good":"haa"}