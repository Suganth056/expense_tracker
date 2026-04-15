from fastapi import APIRouter, Request, Response
from utils.security import hash_password, verify_password, create_access_token, create_refresh_token,decode_token
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


@auth_router.post('/login')
async def getLoginDetails(request: Request, response: Response):
    body = await request.json()

    user_name = body.get("user_name")
    phoneNo = body.get("phone_no")
    pwd = body.get("pwd")

    conn = get_connection()
    cursor = conn.cursor()

    user = cursor.execute(
        f"SELECT TOP 1 * FROM {USER_TABLES} WHERE phone_no = ?",
        (phoneNo,)
    ).fetchone()

    if not user:
        return {"code": 404, "message": "User not found"}
    
    if user_name != user[1]:
        return {"code": 404, "message": "User name Invalid !!!"}

    if not verify_password(pwd, user[3]):
        return {"code": 401, "message": "Invalid password"}

    payload = {
        "user_id": user[0],
        "phone_no": user[2]
    }

    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)

    # ✅ Store refresh token in HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # True in production (HTTPS)
        samesite="lax"
    )

    return {
        "code": 200,
        "access_token": access_token,
        "user": {
            "id": user[0],
            "name": user[1],
            "phone_no": user[2]
        }
    }

# Add this endpoint
@auth_router.post('/refresh')
async def refresh_token(request: Request):

    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        return {"code": 401, "message": "No refresh token"}

    payload = decode_token(refresh_token)

    if not payload or payload.get("type") != "refresh":
        return {"code": 401, "message": "Invalid refresh token"}

    new_access_token = create_access_token({
        "user_id": payload["user_id"],
        "phone_no": payload["phone_no"]
    })

    return {
        "code": 200,
        "access_token": new_access_token
    }
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

@auth_router.post('/logout')
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"code": 200, "message": "Logged out"}