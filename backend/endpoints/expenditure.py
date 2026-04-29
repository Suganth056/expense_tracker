from fastapi import APIRouter, Request, Response
from config.db_config import get_connection
from config.settings import EXPENDITURE_TABLE
from datetime import date,datetime
import math

expenditure_router = APIRouter()

@expenditure_router.post('/post-expenditure')
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
            query = f"INSERT INTO {EXPENDITURE_TABLE}(user_id,exp_date,amount,reason) VALUES (?,?,?,?)"
            cursor = conn.cursor()
            cursor.execute(query,[userId,today,amount,reason])

            conn.commit()

    except Exception as e:
        print(e)
        return {"code":400,"message":f"Error With Creating {e}"}
    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()

    return{"code":200,"message":"Successfully Inserted"}

@expenditure_router.get('/expenditure-history')
async def get_income_details(user_id: int, page: int = 1):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        limit = 10
        offset = (page - 1) * limit

        # ✅ Get paginated data
        data_query = f"""
            SELECT *
            FROM {EXPENDITURE_TABLE}
            WHERE user_id = ?
            ORDER BY exp_date DESC
            OFFSET ? ROWS
            FETCH NEXT ? ROWS ONLY
        """

        res = cursor.execute(data_query, [user_id, offset, limit]).fetchall()

        # ✅ Get total count
        count_query = f"""
            SELECT COUNT(*)
            FROM {EXPENDITURE_TABLE}
            WHERE user_id = ?
        """

        total_count = cursor.execute(count_query, [user_id]).fetchone()[0]

        total_pages = math.ceil(total_count / limit)

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
        print("ERROR:", e)   # 🔥 add this for debugging
        return {"code": 400, "message": "Error in Fetching Details"}

    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()

    return {
        "code": 200,
        "status": "success",
        "data": result,
        "total_pages": total_pages
    }

@expenditure_router.delete('/delete-entry')
async def delete_entry(request:Request):
    body =await request.json()
    id = body.get("id")
    user_id = body.get("user_id")

    if not id or not user_id:
        return {"code":400,"status":"error","message":"Missing delete id or user_id"}

    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = f"delete from {EXPENDITURE_TABLE} where id = ? and user_id = ?"
        res = cursor.execute(query,[id, user_id])
        conn.commit()

        if cursor.rowcount == 0:
            return {"code":404,"status":"error","message":"Entry not found or unauthorized"}
    except Exception as e:
        return {"code":400,"status":"error","message":"Error deleting entry"}
    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()
    return{"code":200,"message":"successfully Deleted"}


@expenditure_router.get('/total-expenditure')
def get_total_salary(user_id:int):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = f"select sum(amount) from {EXPENDITURE_TABLE} where user_id=?"
        res = cursor.execute(query,[user_id]).fetchone()
        if(res[0] is None):
            return {"code":200,"message":"Success","total":0}

    except Exception as e:
        return {"code":400,"status":"Not Found"}

    finally:
        if conn:
                if cursor:
                    cursor.close()
                conn.close()
    return{"code":200,"message":"Success","total":res[0]}


@expenditure_router.get('/this-month-expenditure')
def get_this_month_salary(user_id:int):
    conn = None
    now = datetime.now()
    cur_mon = now.month
    cur_year = now.year

    print(cur_mon,cur_year)
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = f"""
        select sum(amount) 
        from (
        select amount
        from {EXPENDITURE_TABLE}
        where month(exp_date) = ? and year(exp_date) = ? and user_id = ?
        )as thismonth
        
        """
        res = cursor.execute(query,[cur_mon,cur_year,user_id]).fetchone()
        print(res)

    except Exception as e:
        return {"code":400,"status":"Not Found"}

    finally:
        if conn:
                if cursor:
                    cursor.close()
                conn.close()
    return{"code":200,"message":"Success","total":res[0]}


@expenditure_router.get('/each-month-expenditure')
def get_each_month_expenditure(user_id:int,year:int=2026):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = f"""
        select DATENAME(MONTH,exp_date) as month, sum(amount) as Amount
        from {EXPENDITURE_TABLE}
        where year(exp_date) = ? and user_id = ?
        group by DATENAME(MONTH,exp_date),MONTH(exp_date)
        order by DATENAME(MONTH,exp_date)
        """
        res = cursor.execute(query,[year,user_id]).fetchall()

    except Exception as e:
        return {"code":400,"status":"Not Found"}
    finally:
        if conn:
                if cursor:
                    cursor.close()
                conn.close()
    result = []
    month_order = []
    for row in res:
        result.append({
            "month": row[0],
            "amount": row[1]
        })   
        month_order.append(row[0])
    month_order.sort(key=lambda x: datetime.strptime(x, '%B').month)
    
    return{"code":200,"message":"Success","data":result,"monthOrder":month_order}


@expenditure_router.get('/each-day-expenditure')
def get_each_day_expenditure(user_id:int, month:int, year:int):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = f"""
        select day(exp_date) as day, sum(amount) as Amount
        from {EXPENDITURE_TABLE}
        where year(exp_date) = ? and month(exp_date) = ? and user_id = ?
        group by day(exp_date)
        order by day(exp_date)
        """
        res = cursor.execute(query,[year,month,user_id]).fetchall()

        result = []
        for row in res:
            result.append({
                "day": row[0],
                "amount": row[1]
            })

    except Exception as e:
        print("ERROR:", e)
        return {"code":400,"status":"Not Found"}

    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()

    return {"code":200,"message":"Success","data":result}
        