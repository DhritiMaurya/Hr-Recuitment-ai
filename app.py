from fastapi import FastAPI, Request, UploadFile, File
from fastapi.responses import HTMLResponse
import os
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import psycopg2
from ai_scanner import process_resume

backend = FastAPI()

backend.mount("/static", StaticFiles(directory="static"), name="static")

base_dir = os.path.dirname(__file__)
upload_dir = os.path.join(base_dir, "uploads")
os.makedirs(upload_dir, exist_ok=True)


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
            password="", 
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
        password="", 
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

@backend.post("/api/scan-resume")
async def scan_resume(resume: UploadFile = File(...)):
    required_skills = ["Bilingual", "Communication", "Customer Service"]
 
    saved_path = os.path.join(upload_dir, resume.filename)
    with open(saved_path, "wb") as f:
        f.write(await resume.read())
 
    analysis = process_resume(saved_path, required_skills)
    os.remove(saved_path)
 
    return analysis


