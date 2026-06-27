from sqlalchemy.orm import Session
from app.schemas import order_schema
from app.models import order_model
from app.utils.get_info_util import get_seat_info
    

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