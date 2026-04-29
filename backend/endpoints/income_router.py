from fastapi import APIRouter, Request, Response
from config.settings import INCOME_TABLE
from config.db_config import get_connection
from datetime import date, datetime

income_router = APIRouter()


@income_router.post('/post-income')
async def post_income(request: Request):
    body = await request.json()
    user_id = body.get('user_id')
    amount = body.get('amount')
    reason = body.get('reason')

    if user_id is None or amount is None or reason is None:
        return {"code": 400, "message": "Missing required fields"}

    conn = get_connection()
    if conn is None:
        return {"code": 500, "message": "Database connection failed"}

    try:
        today = date.today()
        query = f"INSERT INTO {INCOME_TABLE}(user_id, income_date, amount, reason) VALUES (%s, %s, %s, %s)"
        cursor = conn.cursor()
        cursor.execute(query, (user_id, today, amount, reason))
        conn.commit()

    except Exception as e:
        print(e)
        return {"code": 400, "message": f"Error creating income entry: {e}"}

    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()

    return {"code": 200, "message": "Successfully Inserted"}


@income_router.get('/income-history')
async def get_income_details(user_id: int, page: int = 1):
    conn = get_connection()
    if conn is None:
        return {"code": 500, "message": "Database connection failed"}

    limit = 10
    offset = (page - 1) * limit

    try:
        cursor = conn.cursor()
        query = f"SELECT * FROM {INCOME_TABLE} WHERE user_id = %s ORDER BY income_date DESC OFFSET %s LIMIT %s"
        cursor.execute(query, (user_id, offset, limit))
        res = cursor.fetchall()

        total_query = f"SELECT COUNT(*) FROM {INCOME_TABLE} WHERE user_id = %s"
        cursor.execute(total_query, (user_id,))
        total_res = cursor.fetchone()
        total_pages = (total_res[0] + limit - 1) // limit

        result = []
        for row in res:
            result.append({
                "id": row[0],
                "user_id": row[1],
                "date": row[2],
                "amount": row[3],
                "reason": row[4]
            })

    except Exception as e:
        print(e)
        return {"code": 400, "message": "Error in fetching details"}

    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()

    return {"code": 200, "status": "success", "data": result, "totalPages": total_pages}


@income_router.delete('/delete-entry')
async def delete_entry(request: Request):
    body = await request.json()
    entry_id = body.get("id")
    user_id = body.get("user_id")

    if not entry_id or not user_id:
        return {"code": 400, "status": "error", "message": "Missing delete id or user_id"}

    conn = get_connection()
    if conn is None:
        return {"code": 500, "message": "Database connection failed"}

    try:
        cursor = conn.cursor()
        query = f"DELETE FROM {INCOME_TABLE} WHERE id = %s AND user_id = %s"
        cursor.execute(query, (entry_id, user_id))
        conn.commit()

        if cursor.rowcount == 0:
            return {"code": 404, "status": "error", "message": "Entry not found or unauthorized"}

    except Exception as e:
        print(e)
        return {"code": 400, "status": "error", "message": "Error deleting entry"}

    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()

    return {"code": 200, "message": "Successfully Deleted"}


@income_router.get('/total-income')
def get_total_salary(user_id: int):
    conn = get_connection()
    if conn is None:
        return {"code": 500, "message": "Database connection failed"}

    try:
        cursor = conn.cursor()
        query = f"SELECT SUM(amount) FROM {INCOME_TABLE} WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        res = cursor.fetchone()
        total = res[0] if res and res[0] is not None else 0

    except Exception as e:
        print(e)
        return {"code": 400, "status": "Not Found"}

    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()

    return {"code": 200, "message": "Success", "total": total}


@income_router.get('/this-month-income')
def get_this_month_salary(user_id: int):
    conn = get_connection()
    if conn is None:
        return {"code": 500, "message": "Database connection failed"}

    now = datetime.now()
    cur_mon = now.month
    cur_year = now.year

    try:
        cursor = conn.cursor()
        query = f"SELECT SUM(amount) FROM {INCOME_TABLE} WHERE EXTRACT(MONTH FROM income_date) = %s AND EXTRACT(YEAR FROM income_date) = %s AND user_id = %s"
        cursor.execute(query, (cur_mon, cur_year, user_id))
        res = cursor.fetchone()
        total = res[0] if res and res[0] is not None else 0

    except Exception as e:
        print(e)
        return {"code": 400, "status": "Not Found"}

    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()

    return {"code": 200, "message": "Success", "total": total}


@income_router.get('/each-month-income')
def get_each_month_income(user_id: int, year: int = 2026):
    conn = get_connection()
    if conn is None:
        return {"code": 500, "message": "Database connection failed"}

    try:
        cursor = conn.cursor()
        query = f"""
        SELECT
            TO_CHAR(income_date, 'FMMonth') AS month,
            SUM(amount) AS amount,
            EXTRACT(MONTH FROM income_date) AS month_num
        FROM {INCOME_TABLE}
        WHERE EXTRACT(YEAR FROM income_date) = %s AND user_id = %s
        GROUP BY month_num, month
        ORDER BY month_num
        """
        cursor.execute(query, (year, user_id))
        res = cursor.fetchall()

    except Exception as e:
        print(e)
        return {"code": 400, "status": "Not Found"}

    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()

    result = []
    month_order = []
    for row in res:
        month_name = row[0].strip()
        result.append({
            "month": month_name,
            "amount": row[1]
        })
        month_order.append(month_name)
    month_order.sort(key=lambda x: datetime.strptime(x, '%B').month)

    return {"code": 200, "message": "Success", "data": result, "monthOrder": month_order}


@income_router.get('/each-day-income')
def get_each_day_income(user_id: int, month: int, year: int):
    conn = get_connection()
    if conn is None:
        return {"code": 500, "message": "Database connection failed"}

    try:
        cursor = conn.cursor()
        query = f"""
        SELECT
            EXTRACT(DAY FROM income_date) AS day,
            SUM(amount) AS amount
        FROM {INCOME_TABLE}
        WHERE EXTRACT(YEAR FROM income_date) = %s AND EXTRACT(MONTH FROM income_date) = %s AND user_id = %s
        GROUP BY day
        ORDER BY day
        """
        cursor.execute(query, (year, month, user_id))
        res = cursor.fetchall()

        result = []
        for row in res:
            result.append({
                "day": int(row[0]),
                "amount": row[1]
            })

    except Exception as e:
        print(e)
        return {"code": 400, "status": "Not Found"}

    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()

    return {"code": 200, "message": "Success", "data": result}
