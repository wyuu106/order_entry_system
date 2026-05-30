from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.orm import Session

# SQLiteの接続URL
DATABASE_URL = "sqlite:///./test.db"

# DBエンジン作成
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# セッション作成
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# モデルのベース
Base = declarative_base()

# FastAPIの依存注入用。yieldで返し、リクエスト終了時に必ずclose
# 使い方：def endpoint(db: Session = Depends(get_db)):
def get_db():
    db: Session = SessionLocal()  # 新しいセッション
    try:
        yield db
    finally:
        db.close()