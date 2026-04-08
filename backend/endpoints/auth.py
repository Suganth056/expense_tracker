from fastapi import APIRouter, Request
from utils.security import hash_password, verify_password, create_access_token, create_refresh_token
from config.db_config import get_connection
from config.settings import USER_TABLES

auth_router = APIRouter()



@auth_router.post('/sign-up')
async def postSignUpDetails(request: Request):
    body = await request.json()

    name = body.get("name")
    phone_no = body.get("phone_no")
    pwd = body.get("pwd")

    if not name or not phone_no or not pwd:
        return {"code": 400, "message": "All fields required"}

    hashed_pwd = hash_password(pwd)

    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = f"""
        INSERT INTO {USER_TABLES} (user_name, phone_no, pwd)
        VALUES (?, ?, ?)
        """

        cursor.execute(query, (name, phone_no, hashed_pwd))
        conn.commit()

        return {"code": 200, "status": "Account Created"}

    except Exception as e:
        print(e)
        return {"code": 400, "message": str(e)}

    finally:
        if conn:
            conn.close()


# 🔐 LOGIN
@auth_router.post('/login')
async def getLoginDetails(request: Request):
    body = await request.json()

    user_name = body.get("user_name")
    phoneNo = body.get("phone_no")
    pwd = body.get("pwd")

    if not phoneNo or not pwd:
        return {"code": 400, "message": "Phone and password required"}

    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = f"SELECT TOP 1 * FROM {USER_TABLES} WHERE phone_no = ?"
        user = cursor.execute(query, (phoneNo,)).fetchone()

        if not user:
            return {"code": 404, "message": "User not found"}

        if user[1] != user_name:
            return {"code": 401, "message": "Invalid UserName"}

        stored_hash = user[3]

        # 🔐 Verify password
        if not verify_password(pwd, stored_hash):
            return {"code": 401, "message": "Invalid password"}

        # 🔑 Generate tokens
        payload = {
            "user_id": user[0],
            "phone_no": user[2]
        }

        access_token = create_access_token(payload)
        refresh_token = create_refresh_token(payload)

        return {
            "code": 200,
            "status": "Login Success",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user[0],
                "name": user[1],
                "phone_no": user[2]
            }
        }

    except Exception as e:
        print(e)
        return {"code": 400, "message": str(e)}

    finally:
        if conn:
            conn.close()


# Add this endpoint
@auth_router.post('/refresh')
async def refresh_token(request: Request):
    body = await request.json()
    refresh_token = body.get("refresh_token")

    if not refresh_token:
        return {"code": 400, "message": "Refresh token required"}

    try:
        payload = decode_token(refresh_token)
        
        if not payload or payload.get("type") != "refresh":
            return {"code": 401, "message": "Invalid refresh token"}

        # Optional: Check if user still exists in DB
        user_id = payload.get("user_id")
        
        # Generate new access token
        new_access_token = create_access_token({
            "user_id": user_id,
            "phone_no": payload.get("phone_no")
        })

        return {
            "code": 200,
            "access_token": new_access_token,
            "status": "Token refreshed"
        }

    except Exception as e:
        return {"code": 401, "message": "Invalid or expired refresh token"}