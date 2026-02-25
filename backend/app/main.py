from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import pymysql
import bcrypt
import os
import jwt
import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY", "chorehero-secret-key")  # Add this to your .env

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DATABASE CONNECTION ───────────────────────────────────────────────────────
def get_db():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT", 3306)),
        cursorclass=pymysql.cursors.DictCursor
    )

# ── JWT HELPERS ───────────────────────────────────────────────────────────────
def create_token(user_id: int, email: str):
    """Create a JWT token for the user with no expiry."""
    payload = {
        "user_id": user_id,
        "email": email,
        "iat": datetime.datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify the JWT token sent with a request."""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please log in again.")

# ── REQUEST MODELS ────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

# ── REGISTER ──────────────────────────────────────────────────────────────────
@app.post("/register")
def register(data: RegisterRequest):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s", (data.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")

            password_hash = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt())
            cursor.execute(
                "INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s)",
                (data.email, password_hash.decode("utf-8"), data.full_name)
            )
            new_user_id = cursor.lastrowid

        db.commit()

        # Create a session token on registration so they're logged in immediately
        token = create_token(new_user_id, data.email)

        return {
            "message": "User registered successfully",
            "token": token,
            "user": {
                "id": new_user_id,
                "email": data.email,
                "full_name": data.full_name
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# ── LOGIN ─────────────────────────────────────────────────────────────────────
@app.post("/login")
def login(data: LoginRequest):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "SELECT id, email, full_name, password_hash FROM users WHERE email = %s",
                (data.email,)
            )
            user = cursor.fetchone()

        if not user or not bcrypt.checkpw(data.password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Create a session token on login
        token = create_token(user["id"], user["email"])

        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"]
            }
        }

    finally:
        db.close()

# ── GET CURRENT USER (check if still logged in) ───────────────────────────────
@app.get("/me")
def get_me(token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "SELECT id, email, full_name FROM users WHERE id = %s",
                (token_data["user_id"],)
            )
            user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {"user": user}
    finally:
        db.close()

# ── GET USER'S GROUPS ─────────────────────────────────────────────────────────
@app.get("/my-groups")
def get_my_groups(token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT g.id, g.name, g.color, gm.role
                FROM groups g
                JOIN group_members gm ON g.id = gm.group_id
                WHERE gm.user_id = %s
            """, (token_data["user_id"],))
            groups = cursor.fetchall()

        return {"groups": groups}
    finally:
        db.close()

@app.get("/my-tasks")
def get_my_tasks(token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT t.id, t.title, t.due_date, t.group_id, ta.status
                FROM tasks t
                JOIN task_assignments ta ON t.id = ta.task_id
                WHERE ta.user_id = %s
            """, (token_data["user_id"],))
            tasks = cursor.fetchall()

        return {"tasks": tasks}
    finally:
        db.close()

@app.post("/logout")
def logout():
    # JWT is stateless so logout is handled on the frontend by deleting the token
    return {"message": "Logged out successfully"}