from fastapi import APIRouter, Request, Response
from config.settings import INCOME_TABLE,EXPENDITURE_TABLE
from config.db_config import get_connection
from datetime import date,datetime
import math

saving_router = APIRouter()

@saving_router.get('/total-savings')
async def get_total_savings(user_id:int):
    conn = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        query1=f"""
        select sum(amount) 
        from {INCOME_TABLE}
        WHERE userId = ?
        """
        income_res = cursor.execute(query1,[user_id]).fetchone()
        total_income = income_res[0] if income_res[0] is not None else 0

        query2 = f"""
        select sum(amount)
        from {EXPENDITURE_TABLE}
        WHERE user_id = ?
        """

        exp_res = cursor.execute(query2,[user_id]).fetchone()
        total_exp = exp_res[0] if exp_res[0] is not None else 0

        total_saving = total_income - total_exp

    except Exception as e:
        return {"code":400,"status":"Not Found"}                    
    finally:
        if conn:
                if cursor:
                    cursor.close()
                conn.close()
    return{"code":200,"message":"Success","total_saving":total_saving}

    
@saving_router.get('/')
def summa():
    return{"code":200,"message":"successfully Got"}     

@saving_router.get('/each-month-saving')
def get_total_savings_each_month(user_id: int, year: int):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = f"""
        SELECT 
            ISNULL(T1.Month_Name, DATENAME(MONTH, DATEFROMPARTS(?, T2.month_exp, 1))) AS month,
            ISNULL(T1.Income, 0) - ISNULL(T2.Expenditure, 0) AS amount,
            ISNULL(T1.month_inc, T2.month_exp) AS month_num
        FROM 
        (
            SELECT 
                SUM(i1.amount) AS Income,
                MONTH(i1.income_date) AS month_inc,
                DATENAME(MONTH, i1.income_date) AS Month_Name
            FROM {INCOME_TABLE} i1
            WHERE userId = ? AND YEAR(i1.income_date) = ?
            GROUP BY MONTH(i1.income_date), DATENAME(MONTH, i1.income_date)
        ) T1
        FULL OUTER JOIN 
        (
            SELECT 
                SUM(e2.amount) AS Expenditure,
                MONTH(e2.exp_date) AS month_exp
            FROM {EXPENDITURE_TABLE} e2
            WHERE user_id = ? AND YEAR(e2.exp_date) = ?
            GROUP BY MONTH(e2.exp_date)
        ) T2
        ON T1.month_inc = T2.month_exp
        ORDER BY ISNULL(T1.month_inc, T2.month_exp)
        """

        result = cursor.execute(
            query,
            [year, user_id, year, user_id, year]
        ).fetchall()

        savings = []
        month_order = []

        for row in result:
            savings.append({
                "month": row[0],
                "amount": row[1]
            })
            month_order.append(row[0])

        return {
            "code": 200,
            "message": "Success",
            "data": savings,
            "monthOrder": month_order
        }

    except Exception as e:
        print(e)
        return {"code": 400, "status": "Error"}

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()      

