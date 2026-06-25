from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from app.schemas import order_schema
from app.models import order_model, session_model, seat_model, menu_model, user_model

def get_menu_info(menu_id: int, db: Session):
    menu_info = db.execute(
        select(
            menu_model.Menu.name,
            menu_model.Menu.price
        ).where(
            menu_model.Menu.id == menu_id
        )).one_or_none()

    if not menu_info:
        raise HTTPException(status_code=404, detail='該当するメニューが見つかりません')
    
    return menu_info

def get_seat_info(session_id: int, db: Session):
    seat_info = db.execute(
        select(
            seat_model.Seat.id,
            seat_model.Seat.name
        )
        .join(
            session_model.SeatSession,
            session_model.SeatSession.seat_id == seat_model.Seat.id
        )
        .where(
            session_model.SeatSession.id == session_id,
            session_model.SeatSession.end_at.is_(None)
        )
    ).one_or_none()

    if not seat_info:
        raise HTTPException(status_code=404, detail="該当するセッションが見つかりません")

    return seat_info

def create_order_item_response(
    db_order: order_model.Order,
    user_name: str,
    is_drink: bool
) -> order_schema.OrderItemResponse:

    return order_schema.OrderItemResponse(
        id = db_order.id,
        menu_name = db_order.menu_name,
        price = db_order.price,
        quantity = db_order.quantity,
        remark = db_order.remark,
        status = db_order.status,
        user_name = user_name,
        is_drink = is_drink,
    )

def create_order_response(
        session_id: int,
        orders: order_schema.OrderItemResponse,
        db: Session
) -> order_schema.OrderCreateResponse:
    
    seat_id, seat_name = get_seat_info(session_id, db)

    return order_schema.OrderCreateResponse(
        seat_id = seat_id,
        seat_name = seat_name,
        orders = orders
    )