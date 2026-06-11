from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import Response, HTTPException, status
from datetime import datetime
from app.utils.name_util import get_seat_name, get_menu_name, get_user_name
from app.models import order_model, menu_model, user_model
from app.schemas import order_schema

# オーダー作成
def create_order(
        order: order_schema.OrderCreate,
        current_user: user_model.User,
        db: Session
) -> order_schema.OrderCreateResponse:
    
    price = db.execute(select(menu_model.Menu.price).where(
        menu_model.Menu.id == order.menu_id
    )).scalar_one_or_none()
    
    db_order = order_model.Order(
        session_id = order.session_id,
        menu_id = order.menu_id,
        price = price,
        quantity = order.quantity,
        user_id = current_user.id
    )

    seat_id = db.execute(select(order_model.SeatSession.seat_id).where(
        order_model.SeatSession.id == order.session_id,
        order_model.SeatSession.end_at.is_(None)
    )).scalar_one_or_none()

    if not seat_id:
        raise HTTPException(status_code=404, detail='該当するセッションが見つかりません')
    
    seat_name = get_seat_name(seat_id, db)

    menu_name = get_menu_name(db_order.menu_id, db)

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return order_schema.OrderCreateResponse(
        id = db_order.id,
        seat_name = seat_name,
        menu_name = menu_name,
        price = price,
        quantity = db_order.quantity,
        user_name = current_user.name
    )

# オーダー一覧
def get_orders(session_id: int, db: Session) -> list[order_schema.OrderCreateResponse]:
    stmt = select(order_model.Order).where(
        order_model.Order.session_id == session_id
    )
    db_orders = db.execute(stmt).scalars().all()

    res = []

    seat_id = db.execute(select(order_model.SeatSession.seat_id).where(
        order_model.SeatSession.id == session_id,
        order_model.SeatSession.end_at.is_(None)
    )).scalar_one_or_none()

    seat_name = get_seat_name(seat_id, db)

    for order in db_orders:
        menu_name = get_menu_name(order.menu_id, db)
        
        user_name = get_user_name(order.user_id, db)

        res.append(order_schema.OrderCreateResponse(
            id = order.id,
            seat_name = seat_name,
            menu_name = menu_name,
            price = order.price,
            quantity = order.quantity,
            user_name = user_name
        ))

    return res

# オーダー取り消し
def delete_order(order_id: int, db: Session):
    stmt = select(order_model.Order).where(
        order_model.Order.id == order_id
    )
    db_order = db.execute(stmt).scalar_one_or_none()

    if not db_order:
        raise HTTPException(status_code=404, detail='該当する注文が見つかりません')

    db.delete(db_order)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)

# 提供状況変更
def update_order(order_id: int, status: str, db: Session) -> str:
    stmt = select(order_model.Order).where(
        order_model.Order.id == order_id
    )
    db_order = db.execute(stmt).scalar_one_or_none()

    if not db_order:
        raise HTTPException(status_code=404, detail='該当する注文が見つかりません')
    
    if status not in ["waiting", "served"]:
        raise HTTPException(status_code=400, detail="不正なステータスです")
    
    db_order.status = status

    db.commit()
    db.refresh(db_order)

    return status

# オーダーの金額変更
def update_price(order_id: int, price: int, db: Session) -> int:
    stmt = select(order_model.Order).where(
        order_model.Order.id == order_id
    )
    db_order = db.execute(stmt).scalar_one_or_none()

    if not db_order:
        raise HTTPException(status_code=404, detail='該当する注文が見つかりません')

    db_order.price = price

    db.commit()
    db.refresh(db_order)

    return price