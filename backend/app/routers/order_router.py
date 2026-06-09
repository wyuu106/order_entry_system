from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.db import get_db
from app.utils.auth import get_current_user
from app.models import user_model
from app.schemas import order_schema
from app.cruds import order_crud

router = APIRouter()

# セッション作成
@router.post('/seat_session', response_model=order_schema.SessionCreateResponse)
def create_session(
    seat_session: order_schema.SessionCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return order_crud.create_session(seat_session, db)

# セッション終了
@router.put('seat_session', response_model=order_schema.SessionResponse)
def end_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return order_crud.end_session(session_id, db)

# オーダー作成
@router.post('/order', response_model=order_schema.OrderCreateResponse)
def create_order(
    order: order_schema.OrderCreate,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return order_crud.create_user(order, current_user, db)

# オーダー一覧
@router.get('/orders', response_model=list[order_schema.OrderCreateResponse])
def get_orders(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return order_crud.get_orders(session_id, db)

# オーダー取り消し（アドミンのみ）
@router.delete('/order')
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return order_crud.delete_order(order_id, db)

# 提供状況変更
@router.put('/order', response_model=str)
def update_order(
    new_order: order_schema.OrderUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return order_crud.update_order(new_order, db)

# 会計（アドミンのみ）
@router.post('/checkout', response_model=int)
def checkout(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return order_crud.checkout(session_id, db)
