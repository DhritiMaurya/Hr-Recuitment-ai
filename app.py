from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import psycopg2

backend = FastAPI()

backend.mount("/static", StaticFiles(directory="static"), name="static")

@backend.get("/")
def home():
    return FileResponse("index.html")

@backend.post("/register")
async def register(request: Request):
    data = await request.json()
    
    name = data["name"]
    email = data["email"]
    password = data["password"]

    try:
        conn = psycopg2.connect(
            host="localhost",
            database="development",
            user="postgres",
            password="Jumpman$357", 
            port="5432"
        )
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO candidate (full_name, email, pass) VALUES (%s, %s, %s)",
            (name, email, password)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
    except Exception as e:
        return {"message": "Registration failed", "detail": str(e)}, 500

    return {"message": "Account created"}

@backend.post("/login")
async def login(request: Request):
    data = await request.json()

    email = data["email"]
    password = data["password"]

    
    conn = psycopg2.connect(
        host="localhost",
        database="development",
        user="postgres",
        password="", # I have password 
        port="5432"
    )
    
    cursor = conn.cursor()
    cursor.execute("SELECT full_name, email FROM candidate WHERE email = %s AND pass = %s", (email, password))   
        
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if row is None:
        return {"message": "Invalid email or password"}

    return {"message": "Login successful", "name": row[0], "email": row[1]}
