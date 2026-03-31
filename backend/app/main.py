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
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
    payload = {
        "user_id": user_id,
        "email": email,
        "iat": datetime.datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
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

class UpdateGroupColorRequest(BaseModel):
    group_id: int
    color: str

class AssignTaskRequest(BaseModel):
    task_id: int
    user_id: int
    due_date: str
    group_id: int

class UpdateTaskStatusRequest(BaseModel):
    task_id: int
    status: str

class SendInviteRequest(BaseModel):
    group_id: int
    email: str

class JoinGroupRequest(BaseModel):
    invite_code: str

class UpdateMemberRoleRequest(BaseModel):
    group_id: int
    user_id: int
    role: str
    
class RemoveMemberRequest(BaseModel):
    group_id: int
    user_id: int

class LeaveGroupRequest(BaseModel):
    group_id: int

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

@app.get("/my-tasks/all")
def get_all_my_tasks(token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT t.id, t.title, ta.due_date, t.group_id,
                    ta.status, ta.user_id,
                    g.name AS group_name,
                    gm.color
                FROM tasks t
                JOIN task_assignments ta ON t.id = ta.task_id
                JOIN groups_existing g ON t.group_id = g.id
                JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = ta.user_id
                WHERE ta.user_id = %s
            """, (token_data["user_id"],))            
            tasks = cursor.fetchall()

        return {"tasks": tasks}
    finally:
        db.close()

@app.get("/my-tasks/{group_id}")
def get_my_tasks_for_group(group_id: int, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT t.id, t.title, ta.due_date, t.group_id, ta.status, ta.user_id
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
                SELECT t.id, t.title, ta.due_date, t.created_by,
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
@app.get("/group/{group_id}/admins")
def get_group_admins(group_id: int, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "SELECT created_by FROM groups_existing WHERE id = %s",
                (group_id,)
            )
            group = cursor.fetchone()

            cursor.execute("""
                SELECT u.id, u.full_name, gm.role
                FROM users u
                JOIN group_members gm ON u.id = gm.user_id
                WHERE gm.group_id = %s AND gm.role = 'admin'
            """, (group_id,))
            admins = cursor.fetchall()

        return {"admins": admins, "created_by": group["created_by"]}
    finally:
        db.close()

@app.post("/update-member-role")
def update_member_role(data: UpdateMemberRoleRequest, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "UPDATE group_members SET role = %s WHERE group_id = %s AND user_id = %s",
                (data.role, data.group_id, data.user_id)
            )
        db.commit()
        return {"message": "Role updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
        
@app.post("/remove-member")
def remove_member(data: RemoveMemberRequest, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            # Remove their task assignments for this group
            cursor.execute(
                "DELETE FROM task_assignments WHERE user_id = %s AND group_id = %s",
                (data.user_id, data.group_id)
            )
            # Remove them from the group
            cursor.execute(
                "DELETE FROM group_members WHERE group_id = %s AND user_id = %s",
                (data.group_id, data.user_id)
            )
        db.commit()
        return {"message": "Member removed successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/leave-group")
def leave_group(data: LeaveGroupRequest, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "DELETE FROM task_assignments WHERE user_id = %s AND group_id = %s",
                (token_data["user_id"], data.group_id)
            )
            cursor.execute(
                "DELETE FROM group_members WHERE group_id = %s AND user_id = %s",
                (data.group_id, token_data["user_id"])
            )
        db.commit()
        return {"message": "Left group successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/group/{group_id}/invite-code")
def get_invite_code(group_id: int, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "SELECT invite_code, name FROM groups_existing WHERE id = %s",
                (group_id,)
            )
            group = cursor.fetchone()

        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

        return {"invite_code": group["invite_code"], "group_name": group["name"]}
    finally:
        db.close()

def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

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
                "INSERT INTO group_members (group_id, user_id, role, color) VALUES (%s, %s, %s, %s)",
                (new_group_id, token_data["user_id"], "admin", "#ec9597")
            )

        db.commit()

        return {
            "message": "Group created successfully",
            "group": {
                "id": new_group_id,
                "name": data.name,
                "invite_code": invite_code
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/join-group")
def join_group(data: JoinGroupRequest, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "SELECT id, name FROM groups_existing WHERE invite_code = %s",
                (data.invite_code,)
            )
            group = cursor.fetchone()

            if not group:
                raise HTTPException(status_code=404, detail="Invalid invite code.")

            cursor.execute(
                "SELECT * FROM group_members WHERE group_id = %s AND user_id = %s",
                (group["id"], token_data["user_id"])
            )
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="You are already a member of this group.")

            cursor.execute(
                "INSERT INTO group_members (group_id, user_id, role) VALUES (%s, %s, %s)",
                (group["id"], token_data["user_id"], "member")
            )

        db.commit()
        return {"message": "Successfully joined group", "group": {"id": group["id"], "name": group["name"]}}

    except HTTPException:
        raise
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

@app.post("/assign-task")
def assign_task(data: AssignTaskRequest, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        due_date = datetime.datetime.strptime(data.due_date, "%Y-%m-%d").date()
        if due_date < datetime.date.today():
            raise HTTPException(status_code=400, detail="Due date cannot be in the past.")

        with db.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM task_assignments WHERE task_id = %s AND user_id = %s AND due_date = %s",
                (data.task_id, data.user_id, data.due_date)
            )
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="This task is already assigned to this member on the same date.")

            cursor.execute(
                "INSERT INTO task_assignments (task_id, user_id, group_id, status, due_date) VALUES (%s, %s, %s, 'incomplete', %s)",
                (data.task_id, data.user_id, data.group_id, data.due_date)
            )

        db.commit()
        return {"message": "Task assigned successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

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

@app.post("/update-group-color")
def update_group_color(data: UpdateGroupColorRequest, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "UPDATE group_members SET color = %s WHERE group_id = %s AND user_id = %s",
                (data.color, data.group_id, token_data["user_id"])
            )
        db.commit()
        return {"message": "Color updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/send-invite")
def send_invite(data: SendInviteRequest, token_data: dict = Depends(verify_token)):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "SELECT invite_code, name FROM groups_existing WHERE id = %s",
                (data.group_id,)
            )
            group = cursor.fetchone()

            cursor.execute(
                "SELECT full_name FROM users WHERE id = %s",
                (token_data["user_id"],)
            )
            sender = cursor.fetchone()

        if not group or not sender:
            raise HTTPException(status_code=404, detail="Group or user not found")

        sender_name = sender["full_name"]
        group_name = group["name"]
        invite_code = group["invite_code"]

        msg = MIMEMultipart()
        msg["From"] = os.getenv("EMAIL_USER")
        msg["To"] = data.email
        msg["Subject"] = f"You've been invited to join {group_name} on ChoreHero"

        body = f"""Hello,

You have been invited by {sender_name} to join their group '{group_name}' on ChoreHero.

Use the invite code below to join:

    {invite_code}

See you there!

— The ChoreHero Team"""

        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASSWORD"))
            server.sendmail(os.getenv("EMAIL_USER"), data.email, msg.as_string())

        return {"message": f"Invite sent to {data.email}"}

    except smtplib.SMTPException as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
    finally:
        db.close()

@app.post("/logout")
def logout():
    return {"message": "Logged out successfully"}