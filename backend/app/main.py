from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pymysql
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with your Railway frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT", 3306)),
        cursorclass=pymysql.cursors.DictCursor
    )

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/register")
def register(data: RegisterRequest):
    db = get_db()
    try:
        with db.cursor() as cursor:
            # Check if email is already in use
            cursor.execute("SELECT id FROM users WHERE email = %s", (data.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")

            # Hash password and insert new user
            password_hash = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt())
            cursor.execute(
                "INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s)",
                (data.email, password_hash.decode("utf-8"), data.full_name)
            )
            new_user_id = cursor.lastrowid

        db.commit()

        # Return user info so the frontend can save it to localStorage
        return {
            "message": "User registered successfully",
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

        return {
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"]
            }
        }

    finally:
        db.close()