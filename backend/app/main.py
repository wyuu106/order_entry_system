import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.utils.auth import hash_password
from app.models.user_model import User
from app.routers import user_router, menu_router, seat_router
from app.db import get_db, Base, engine
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# .envを読み込む
load_dotenv()

# 初期化（admin作成）API
@app.post('/init')
def init(db: Session = Depends(get_db)):
    name = os.getenv("ADMIN_NAME")
    password = os.getenv("PASSWORD")
    admin = User(
        name = name,
        hashed_password = hash_password(password),
        role = 'admin'
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

app.include_router(user_router.router)
app.include_router(menu_router.router)
app.include_router(seat_router.router)