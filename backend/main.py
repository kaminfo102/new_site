from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import sqlite3
import bcrypt
from datetime import datetime, timedelta
from typing import Annotated, List
from fastapi.middleware.cors import CORSMiddleware
import jwt
import os
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database initialization and setup
DATABASE_DIR = 'data'
DATABASE_FILE = os.path.join(DATABASE_DIR, 'database.sqlite')

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")  # Use an environment variable in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def init_db():
    print('Starting init_db...')
    if not os.path.exists(DATABASE_DIR):
        os.makedirs(DATABASE_DIR)
        print(f"Created directory: {DATABASE_DIR}")
    with sqlite3.connect(DATABASE_FILE) as conn:
        print(f"Connected to database: {DATABASE_FILE}")
        c = conn.cursor()
        # Create users table with better structure
        c.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                is_admin BOOLEAN NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        ''')
        print("Created 'users' table (if not exists).")

        # Create initial admin user if not exists
        c.execute('SELECT * FROM users WHERE username = ?', ('kaminfo',))
        if not c.fetchone():
            hashed_password = bcrypt.hashpw('123'.encode('utf-8'), bcrypt.gensalt())
            c.execute(
                'INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)',
                ('kaminfo', hashed_password, True)
            )
            print("Created default admin user.")

        conn.commit()
        print("Commited database changes")
    print('Finished init_db.')

@contextmanager
def get_db():
    print('Getting database connection...')
    conn = sqlite3.connect(DATABASE_FILE)
    try:
        print("Database connection successful")
        yield conn
    finally:
        print("Closing database connection...")
        conn.close()

# Pydantic models
class User(BaseModel):
    id: int
    username: str
    is_admin: bool
    created_at: datetime
    last_login: datetime | None


class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    username: str | None = None
    password: str | None = None
    
# Security setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Function to create a hashed password
def hash_password(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Function to verify the password
def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Function to create access token
def create_access_token(data: dict, expires_delta: int | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Function to authenticate the user
def authenticate_user(username: str, password: str, conn: sqlite3.Connection):
    print(f"Authenticating user: {username}")
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = c.fetchone()
    if not user:
        print("User not found")
        return None
    if not verify_password(password, user[2]):
        print("Invalid Password")
        return None
    print(f"User {username} authenticated")
    return User(id=user[0], username=user[1], is_admin=bool(user[3]), created_at=datetime.fromisoformat(user[4]),
                last_login=datetime.fromisoformat(user[5]) if user[5] else None)

def get_current_user(token: str = Depends(oauth2_scheme)):
    print(f"Validating token: {token}")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            print("Token is invalid")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    except jwt.PyJWTError:
        print("Token is invalid")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    with get_db() as conn:
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = c.fetchone()
        if not user:
            print("Token is invalid")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

        return User(id=user[0], username=user[1], is_admin=bool(user[3]), created_at=datetime.fromisoformat(user[4]),
                    last_login=datetime.fromisoformat(user[5]) if user[5] else None)


def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        print("User is not an admin")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not an admin user")
    return current_user


# Routes
@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    print(f"Login attempt for user: {form_data.username}")
    with get_db() as conn:
        user = authenticate_user(form_data.username, form_data.password, conn)

    if not user:
        print("Login failed: Incorrect username or password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.username})

    print(f"Login successful for user: {user.username}. Token issued.")
    return Token(access_token=access_token, token_type="bearer")

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    print(f"Get user info for: {current_user.username}")
    return current_user

@app.get("/users", response_model=List[User])
async def read_all_users(current_user: User = Depends(get_admin_user)):
    print(f"Get all users by: {current_user.username}")
    with get_db() as conn:
        c = conn.cursor()
        c.execute('SELECT * FROM users')
        users = c.fetchall()

    return [
        User(id=user[0], username=user[1], is_admin=bool(user[3]), created_at=datetime.fromisoformat(user[4]),
             last_login=datetime.fromisoformat(user[5]) if user[5] else None)
        for user in users
    ]

@app.post("/users", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, current_user: User = Depends(get_admin_user)):
    print(f"Creating user by: {current_user.username}")
    if len(user_data.username) > 50 or not user_data.username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username must not be empty or longer than 50 characters")
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE username = ?", (user_data.username,))
        if c.fetchone():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this username already exists")
        hashed_password = hash_password(user_data.password)
        c.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (user_data.username, hashed_password)
        )
        conn.commit()
        c.execute("SELECT * FROM users WHERE username = ?", (user_data.username,))
        new_user = c.fetchone()
        if not new_user:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create user")
        return User(id=new_user[0], username=new_user[1], is_admin=bool(new_user[3]), created_at=datetime.fromisoformat(new_user[4]),
                    last_login=datetime.fromisoformat(new_user[5]) if new_user[5] else None)

@app.put("/users/{user_id}", response_model=User)
async def update_user(user_id: int, user_data: UserUpdate, current_user: User = Depends(get_admin_user)):
    print(f"Updating user by: {current_user.username}")
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = c.fetchone()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        if user_data.username:
            if len(user_data.username) > 50 or not user_data.username:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username must not be empty or longer than 50 characters")
            c.execute("SELECT * FROM users WHERE username = ? AND id != ?", (user_data.username, user_id))
            if c.fetchone():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this username already exists")

        update_fields = []
        if user_data.username:
            update_fields.append(f"username = '{user_data.username}'")
        if user_data.password:
            hashed_password = hash_password(user_data.password)
            update_fields.append(f"password = '{hashed_password}'")
        if update_fields:
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = {user_id}"
            c.execute(query)
            conn.commit()

        c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        updated_user = c.fetchone()
        if not updated_user:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update user")
        return User(id=updated_user[0], username=updated_user[1], is_admin=bool(updated_user[3]), created_at=datetime.fromisoformat(updated_user[4]),
            last_login=datetime.fromisoformat(updated_user[5]) if updated_user[5] else None)


@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, current_user: User = Depends(get_admin_user)):
    print(f"Deleting user by: {current_user.username}")
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = c.fetchone()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        c.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
    return

init_db()

@app.on_event("startup")
async def startup_event():
    print("Starting up FastAPI application...")
    init_db()
    print("FastAPI application started successfully.")


if __name__ == "__main__":
    import uvicorn

    print("Running app with uvicorn")
    uvicorn.run(app, host="localhost", port=8000, reload=True)

