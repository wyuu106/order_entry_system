from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.db import get_db
from app.utils.auth import get_current_user
from app.models import user_model
from app.schemas import order_schema
from app.cruds import session_crud, order_crud

router = APIRouter()

# セッション作成
@router.post('/seat_session', response_model=order_schema.SessionCreateResponse)
def create_session(
    seat_session: order_schema.SessionCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return session_crud.create_session(seat_session, db)

# 席ごとのセッションの有無を判定
@router.get('/seat_session/{seat_id}', response_model=order_schema.SessionCreateResponse | None)
def get_session(
    seat_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return session_crud.get_session(seat_id, db)

# セッション終了
@router.put('/seat_session/{session_id}', response_model=order_schema.SessionResponse)
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

# オーダー作成
@router.post('/order', response_model=order_schema.OrderCreateResponse)
def create_order(
    order: order_schema.OrderCreate,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return order_crud.create_order(order, current_user, db)

# オーダー一覧
@router.get('/orders/{session_id}', response_model=list[order_schema.OrderCreateResponse])
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
@router.put('/order/status/{order_id}', response_model=str)
def update_order(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return order_crud.update_order(order_id, status, db)

# オーダーの金額変更（アドミンのみ）
@router.put('/order/price/{order_id}', response_model=int)
def update_price(
    order_id: int,
    price: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return order_crud.update_price(order_id, price, db)
