from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import pymysql
import bcrypt
import os
import jwt
import datetime
import random
import string
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY", "chorehero-secret-key")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CreateGroupRequest(BaseModel):
    name: str

class CreateTaskRequest(BaseModel):
    group_id: int
    title: str

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

@app.get("/my-groups")
def get_my_groups(token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT g.id, g.name, gm.role, gm.color
                FROM groups_existing g
                JOIN group_members gm ON g.id = gm.group_id
                WHERE gm.user_id = %s
            """, (token_data["user_id"],))
            groups = cursor.fetchall()

        return {"groups": groups}
    finally:
        db.close()

@app.get("/my-tasks/{group_id}")
def get_my_tasks_for_group(group_id: int, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT t.id, t.title, t.due_date, t.group_id, ta.status, ta.user_id
                FROM tasks t
                JOIN task_assignments ta ON t.id = ta.task_id
                WHERE ta.user_id = %s AND t.group_id = %s
            """, (token_data["user_id"], group_id))
            tasks = cursor.fetchall()

        return {"tasks": tasks}
    finally:
        db.close()
        
@app.get("/group/{group_id}/tasks")
def get_group_tasks(group_id: int, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT t.id, t.title, t.due_date, t.created_by,
                       u.full_name AS assigned_to, ta.status, ta.user_id
                FROM tasks t
                JOIN task_assignments ta ON t.id = ta.task_id
                JOIN users u ON ta.user_id = u.id
                WHERE t.group_id = %s
            """, (group_id,))
            tasks = cursor.fetchall()

        return {"tasks": tasks}
    finally:
        db.close()

def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

@app.post("/create-group")
def create_group(data: CreateGroupRequest, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        invite_code = generate_invite_code()

        with db.cursor() as cursor:
            cursor.execute(
                "INSERT INTO groups_existing (name, created_by, invite_code) VALUES (%s, %s, %s)",
                (data.name, token_data["user_id"], invite_code)
            )
            new_group_id = cursor.lastrowid

            cursor.execute(
                "INSERT INTO group_members (group_id, user_id, role) VALUES (%s, %s, %s)",
                (new_group_id, token_data["user_id"], "admin")
            )

        db.commit()

        return {
            "message": "Group created successfully",
            "group": {
                "id": new_group_id,
                "name": data.name,
                "color": data.color,
                "invite_code": invite_code
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/create-task")
def create_task(data: CreateTaskRequest, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tasks (group_id, title, created_by) VALUES (%s, %s, %s)",
                (data.group_id, data.title, token_data["user_id"])
            )
            new_task_id = cursor.lastrowid

        db.commit()

        return {
            "message": "Task created successfully",
            "task": {
                "id": new_task_id,
                "group_id": data.group_id,
                "title": data.title
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/logout")
def logout():
    return {"message": "Logged out successfully"}

@app.get("/group/{group_id}/members")
def get_group_members(group_id: int, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT u.id, u.full_name, gm.role
                FROM users u
                JOIN group_members gm ON u.id = gm.user_id
                WHERE gm.group_id = %s
            """, (group_id,))
            members = cursor.fetchall()

        return {"members": members}
    finally:
        db.close()

@app.get("/group/{group_id}/all-tasks")
def get_all_group_tasks(group_id: int, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT id, title, due_date, created_by
                FROM tasks
                WHERE group_id = %s
            """, (group_id,))
            tasks = cursor.fetchall()

        return {"tasks": tasks}
    finally:
        db.close()

class AssignTaskRequest(BaseModel):
    task_id: int
    user_id: int
    due_date: str

class AssignTaskRequest(BaseModel):
    task_id: int
    user_id: int
    due_date: str
    group_id: int

@app.post("/assign-task")
def assign_task(data: AssignTaskRequest, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "UPDATE tasks SET due_date = %s WHERE id = %s",
                (data.due_date, data.task_id)
            )
            cursor.execute(
                "REPLACE INTO task_assignments (task_id, user_id, group_id, status) VALUES (%s, %s, %s, 'incomplete')",
                (data.task_id, data.user_id, data.group_id)
            )
        db.commit()

        return {"message": "Task assigned successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

class UpdateTaskStatusRequest(BaseModel):
    task_id: int
    status: str

@app.post("/update-task-status")
def update_task_status(data: UpdateTaskStatusRequest, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "UPDATE task_assignments SET status = %s WHERE task_id = %s AND user_id = %s",
                (data.status, data.task_id, token_data["user_id"])
            )
        db.commit()
        return {"message": "Status updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()