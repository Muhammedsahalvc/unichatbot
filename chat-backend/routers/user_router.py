from fastapi import APIRouter, HTTPException
from models.user import UserCreate, UserLogin
from database.connect import get_connection

from jose import jwt
from passlib.context import CryptContext




from auth.jwt_handler import get_current_user
from fastapi import Depends

from models.user import UserUpdate 
from models.user import EmailUpdate, PasswordUpdate   








router = APIRouter(prefix="/user", tags=["User"])

                                                                  # JWT & Password Settings


SECRET_KEY = "mysecretkey123"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


                                                               # SIGNUP API
##signup

@router.post("/signup")
def signup(user: UserCreate):
    conn = get_connection()
    cur = conn.cursor()

                                                                      # 1️ Check if email already exists
    cur.execute("SELECT id FROM users WHERE email = %s", (user.email,))
    existing = cur.fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

                                                                            # 2️ Hash Password
    hashed_pw = hash_password(user.password)

                                                                      # 3️ Insert new user
    query = """
        INSERT INTO users (name, email, password, college, register_no)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id;
    """
    cur.execute(query, (
        user.name,
        user.email,
        hashed_pw,                                                             # store hashed password
        user.college,
        user.register_no                                                                   # make sure model uses reg_no not register_no
    ))

    user_id = cur.fetchone()[0]
    conn.commit()
    conn.close()

    return {"message": "User created successfully", "user_id": user_id}



                                                                                        # LOGIN API
##login

@router.post("/login")
def login(user: UserLogin):
    conn = get_connection()
    cur = conn.cursor()

                                                                                # get user by email
    cur.execute("SELECT id, password FROM users WHERE email=%s", (user.email,))
    result = cur.fetchone()

    if not result:
        raise HTTPException(status_code=400, detail="Email not found")

    user_id, hashed_password = result

                                                                        # verify password
    if not verify_password(user.password, hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")

                                                               # create JWT token
    token = jwt.encode({"user_id": user_id}, SECRET_KEY, algorithm=ALGORITHM)

    conn.close()
    return {
        "message": "Login successful",
        "token": token
    }



###user-profile

@router.get("/profile")
def get_user_profile(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id, name, email, college, register_no FROM users WHERE id = %s",
            (user_id,)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "college": row[3],
            "register_no": row[4]
        }
    finally:
        cur.close()
        conn.close()


# PUT update profile
@router.put("/profile")
def update_user_profile(payload: UserUpdate, user_id: int = Depends(get_current_user)):
    # Build dynamic set clause so we only update provided fields
    fields = []
    values = []

    if payload.name is not None:
        fields.append("name = %s")
        values.append(payload.name)
    if payload.college is not None:
        fields.append("college = %s")
        values.append(payload.college)
    if payload.register_no is not None:
        fields.append("register_no = %s")
        values.append(payload.register_no)

    if not fields:
        raise HTTPException(status_code=400, detail="No data provided to update")

    # add user id to params
    values.append(user_id)
    set_clause = ", ".join(fields)
    query = f"UPDATE users SET {set_clause} WHERE id = %s"

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, tuple(values))
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return {"message": "Profile updated successfully"}

#delete account

@router.delete("/delete")
def delete_account(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
    finally:
        cur.close()
        conn.close()
    return {"message": "Account deleted"}

##update email

@router.put("/update-email")
def update_email(payload: EmailUpdate, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    # Check if new email already exists
    cur.execute("SELECT id FROM users WHERE email = %s", (payload.new_email,))
    existing = cur.fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    # Update email
    cur.execute("UPDATE users SET email=%s WHERE id=%s",
                (payload.new_email, user_id))
    conn.commit()
    conn.close()

    return {"message": "Email updated successfully. Please login again."}

##update password
@router.put("/update-password")
def update_password(payload: PasswordUpdate, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    # Get current hashed password
    cur.execute("SELECT password FROM users WHERE id=%s", (user_id,))
    result = cur.fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    current_hashed_password = result[0]

    # Check old password
    if not verify_password(payload.old_password, current_hashed_password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    # Hash new password
    new_hashed_pw = hash_password(payload.new_password)

    # Update password
    cur.execute("UPDATE users SET password=%s WHERE id=%s",
                (new_hashed_pw, user_id))
    conn.commit()
    conn.close()

    return {"message": "Password updated successfully"}




##

@router.get("/me")
def get_profile(user_id: int = Depends(get_current_user)):
    return {"message": "Authenticated", "user_id": user_id}