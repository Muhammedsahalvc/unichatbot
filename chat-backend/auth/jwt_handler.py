from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer
from jose import jwt, JWTError

SECRET_KEY = "mysecretkey123"
ALGORITHM = "HS256"

security = HTTPBearer()

def get_current_user(credentials = Depends(security)):
    try:
        token = credentials.credentials   # <-- VERY IMPORTANT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        return user_id

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
