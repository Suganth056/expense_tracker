from fastapi import APIRouter, Request, Response
from config.settings import INCOME_TABLE
from config.db_config import get_connection
from datetime import date,datetime

income_router = APIRouter()


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
        return {"code":400,"message":f"Error With Creating {e}"}
    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()

    return{"code":200,"message":"Successfully Inserted"}


@income_router.get('/income-history')
async def get_income_details(user_id:int,page:int=1):
    conn = None
    limit = 10
    offset = (page - 1) * limit
    try:
        conn = get_connection()
        query = f"""
        select * 
        from {INCOME_TABLE} 
        where userId = ?
        order by income_date desc
        offset ? rows
        fetch next ? rows only
        """
        cursor = conn.cursor()

        res = cursor.execute(query,[user_id,offset,limit]).fetchall()

        total_query = f"select count(*) from {INCOME_TABLE} where userId = ?"
        total_res = cursor.execute(total_query,[user_id]).fetchone()
        total_pages = (total_res[0] + limit - 1) // limit  # Calculate total pages
        

        result = []
        for row in res:
            result.append({
                "id": row[0],
                "user_id": row[1],
                "date": row[2],  # convert date to string
                "amount": row[3],
                "reason": row[4]
            })

    except Exception as e:
        return {"code":400,"message":"Error in Fetching Details"}

    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close
    return {"code":200,"status":"success","data":result,"totalPages":total_pages}

@income_router.delete('/delete-entry')
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
        query = f"delete from {INCOME_TABLE} where id = ? and userId = ?"
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

@income_router.get('/total-income')
def get_total_salary(user_id:int):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = f"select sum(amount) from {INCOME_TABLE} where userId=?"
        res = cursor.execute(query,[user_id]).fetchone()
        print(res)

    except Exception as e:
        return {"code":400,"status":"Not Found"}

    finally:
        if conn:
                if cursor:
                    cursor.close()
                conn.close()
    return{"code":200,"message":"Success","total":res[0]}

@income_router.get('/this-month-income')
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
        from {INCOME_TABLE}
        where month(income_date) = ? and year(income_date) = ? and userId = ?
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


#  API FOR GRAPHS

@income_router.get('/each-month-income')
def get_each_month_income(user_id:int,year:int=2026):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = f"""
        select DATENAME(MONTH,income_date) as month, sum(amount) as Amount
        from {INCOME_TABLE}
        where year(income_date) = ? and userId = ?
        group by DATENAME(MONTH,income_date),MONTH(INCOME_DATE)
        order by DATENAME(MONTH,income_date)
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
        