from fastapi import APIRouter, Request, Response
from config.settings import INCOME_TABLE, EXPENDITURE_TABLE
from config.db_config import get_connection
from datetime import date, datetime
import math

saving_router = APIRouter()


@saving_router.get('/total-savings')
async def get_total_savings(user_id: int):
    conn = get_connection()
    if conn is None:
        return {"code": 500, "message": "Database connection failed"}

    try:
        cursor = conn.cursor()

        query1 = f"SELECT SUM(amount) FROM {INCOME_TABLE} WHERE user_id = %s"
        cursor.execute(query1, (user_id,))
        income_res = cursor.fetchone()
        total_income = income_res[0] if income_res and income_res[0] is not None else 0

        query2 = f"SELECT SUM(amount) FROM {EXPENDITURE_TABLE} WHERE user_id = %s"
        cursor.execute(query2, (user_id,))
        exp_res = cursor.fetchone()
        total_exp = exp_res[0] if exp_res and exp_res[0] is not None else 0

        total_saving = total_income - total_exp

    except Exception as e:
        print(e)
        return {"code": 400, "status": "Not Found"}

    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()

    return {"code": 200, "message": "Success", "total_saving": total_saving}


@saving_router.get('/')
def summa():
    return {"code": 200, "message": "successfully Got"}


@saving_router.get('/each-month-saving')
def get_total_savings_each_month(user_id: int, year: int):
    conn = get_connection()
    if conn is None:
        return {"code": 500, "message": "Database connection failed"}

    cursor = None
    try:
        cursor = conn.cursor()

        query = f"""
        SELECT
            COALESCE(T1.month_name, T2.month_name) AS month,
            COALESCE(T1.income, 0) - COALESCE(T2.expenditure, 0) AS amount,
            COALESCE(T1.month_num, T2.month_num) AS month_num
        FROM
        (
            SELECT
                SUM(i1.amount) AS income,
                EXTRACT(MONTH FROM i1.income_date)::int AS month_num,
                TO_CHAR(i1.income_date, 'FMMonth') AS month_name
            FROM {INCOME_TABLE} i1
            WHERE user_id = %s AND EXTRACT(YEAR FROM i1.income_date) = %s
            GROUP BY month_num, month_name
        ) T1
        FULL OUTER JOIN
        (
            SELECT
                SUM(e2.amount) AS expenditure,
                EXTRACT(MONTH FROM e2.exp_date)::int AS month_num,
                TO_CHAR(e2.exp_date, 'FMMonth') AS month_name
            FROM {EXPENDITURE_TABLE} e2
            WHERE user_id = %s AND EXTRACT(YEAR FROM e2.exp_date) = %s
            GROUP BY month_num, month_name
        ) T2
        ON T1.month_num = T2.month_num
        ORDER BY COALESCE(T1.month_num, T2.month_num)
        """

        cursor.execute(query, (user_id, year, user_id, year))
        result = cursor.fetchall()

        savings = []
        month_order = []
        for row in result:
            month_name = row[0].strip()
            savings.append({
                "month": month_name,
                "amount": row[1]
            })
            month_order.append(month_name)

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

