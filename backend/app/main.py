import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from app.utils.auth import hash_password
from app.models.user_model import User
from app.routers import(
    user_router,
    menu_router,
    seat_router,
    session_router,
    order_router
)
from app.ws import order_ws
from app.db import get_db, Base, engine
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

# .envを読み込む
load_dotenv()

origins = os.getenv("ALLOW_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初期化（admin作成）API
@app.post('/init', response_model=str)
def init(db: Session = Depends(get_db)) -> str:
    exist_admin = db.execute(select(User).where(User.role == 'admin')).scalar_one_or_none()

    if exist_admin:
        raise HTTPException(status_code=400, detail='作成済みです')
    
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

    return '管理者作成'

app.include_router(user_router.router)
app.include_router(menu_router.router)
app.include_router(seat_router.router)
app.include_router(session_router.router)
app.include_router(order_router.router)
app.include_router(order_ws.router)