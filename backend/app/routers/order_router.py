from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import date
from app.db import get_db
from app.utils.auth import get_current_user
from app.models import user_model
from app.schemas import order_schema
from app.cruds import order_crud
from app.utils.websocket import broadcast_new_order
from app.utils.push_notification import send_new_order_notifications

router = APIRouter()

# オーダー作成
@router.post('/order', response_model=order_schema.OrderCreateResponse)
async def create_order(
    orders: order_schema.OrderCreate,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = order_crud.create_order(orders, current_user, db)
    notification_id = order_crud.create_notification(res, db)

    await broadcast_new_order(res, notification_id)
    await send_new_order_notifications(db, res)

    return res

# セッションごとのオーダー一覧
@router.get('/orders/{session_id}', response_model=list[order_schema.OrderItemResponse])
def get_session_orders(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return order_crud.get_session_orders(session_id, db)

# 席ごとのオーダー一覧
@router.get('/seat_orders', response_model=list[order_schema.OrderCreateResponse])
def get_seat_orders(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return order_crud.get_seat_orders(db)

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
@router.put('/order/{order_id}/status', response_model=str)
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

@router.get('/day_orders', response_model=list[order_schema.DayOrderResponse])
def get_day_orders(
    target_date: date,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return order_crud.get_day_orders(target_date, db)


# 未確認の新規注文通知を取得（アドミンのみ）
@router.get(
    '/notifications/unread',
    response_model=list[order_schema.OrderNotificationResponse],
)
def get_unread_notifications(
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="権限がありません")

    return order_crud.get_unread_notifications(current_user.id, db)


# 新規注文通知を確認済みに更新（アドミンのみ）
@router.put(
    '/notifications/{notification_id}/read',
    status_code=status.HTTP_204_NO_CONTENT,
)
def mark_notification_read(
    notification_id: int,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="権限がありません")

    return order_crud.mark_notification_read(notification_id, current_user.id, db)
