from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.db import get_db
from app.utils.auth import get_current_user
from app.models import user_model
from app.schemas import session_schema
from app.cruds import session_crud
from app.utils.websocket import broadcast_new_order

router = APIRouter()

# セッション作成
@router.post('/seat_session', response_model=session_schema.SessionCreateResponse)
def create_session(
    seat_session: session_schema.SessionCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return session_crud.create_session(seat_session, db)

# 席ごとのセッションの有無を判定
@router.get('/seat_session/{seat_id}', response_model=session_schema.SessionCreateResponse | None)
def get_session(
    seat_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return session_crud.get_session(seat_id, db)

# セッション終了
@router.put('/seat_session/{session_id}', response_model=session_schema.SessionResponse)
def end_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return session_crud.end_session(session_id, db)

# 合計金額取得
@router.get('/total/{session_id}', response_model=int)
def get_total(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return session_crud.get_total(session_id, db)