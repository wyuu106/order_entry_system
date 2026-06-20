from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from app.schemas import order_schema
from app.models import order_model, seat_model, menu_model, user_model

def get_seat_name(seat_id: int, db: Session) -> str:
    seat_name = db.execute(select(seat_model.Seat.name).where(
        seat_model.Seat.id == seat_id
    )).scalar_one_or_none()

    if not seat_name:
        raise HTTPException(status_code=404, detail='該当する席が見つかりません')
    
    return seat_name

def get_menu_info(menu_id, db) -> str:
    menu_info = db.execute(select(
        menu_model.Menu.name,
        menu_model.Menu.is_drink
    ).where(
        menu_model.Menu.id == menu_id
    )).one_or_none()

    if not menu_info:
        raise HTTPException(status_code=404, detail='該当するメニューが見つかりません')
    
    return menu_info

def get_user_name(user_id: int, db: Session) -> str:
    user_name = db.execute(select(user_model.User.name).where(
            user_model.User.id == user_id
        )).scalar_one_or_none()
    
    if not user_name:
        raise HTTPException(status_code=404, detail='該当するユーザーが見つかりません')
    
    return user_name

def create_order_response(
    order: order_model.Order,
    seat_id: int,
    seat_name: str,
    db: Session
) -> order_schema.OrderCreateResponse:
    
    menu_name, is_drink = get_menu_info(order.menu_id, db)

    user_name = get_user_name(order.user_id, db)

    return order_schema.OrderCreateResponse(
        id = order.id,
        seat_id = seat_id,
        seat_name = seat_name,
        menu_name = menu_name,
        price = order.price,
        quantity = order.quantity,
        remark = order.remark,
        user_name = user_name,
        status = order.status,
        is_drink = is_drink
    )