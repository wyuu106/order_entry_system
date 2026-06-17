from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import Response, HTTPException, status
from app.utils.order_util import get_seat_name, create_order_response
from app.models import order_model, menu_model, user_model, seat_model
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
        remark = order.remark,
        user_id = current_user.id
    )

    seat_id = db.execute(select(order_model.SeatSession.seat_id).where(
        order_model.SeatSession.id == order.session_id,
        order_model.SeatSession.end_at.is_(None)
    )).scalar_one_or_none()

    if not seat_id:
        raise HTTPException(status_code=404, detail='該当するセッションが見つかりません')
    
    seat_name = get_seat_name(seat_id, db)

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    res = create_order_response(db_order, seat_id, seat_name, db)

    return res

# セッションごとのオーダー一覧
def get_session_orders(session_id: int, db: Session) -> list[order_schema.OrderCreateResponse]:
    stmt = select(order_model.Order).where(
        order_model.Order.session_id == session_id
    )
    db_orders = db.execute(stmt).scalars().all()

    res = []

    seat_id = db.execute(select(order_model.SeatSession.seat_id).where(
        order_model.SeatSession.id == session_id,
        order_model.SeatSession.end_at.is_(None)
    )).scalar_one_or_none()

    if not seat_id:
        raise HTTPException(status_code=404, detail='該当するセッションが見つかりません')
    
    seat_name = get_seat_name(seat_id, db)

    for order in db_orders:
        res.append(create_order_response(order, seat_id, seat_name, db))

    return res

# 席ごとのオーダー一覧
def get_seat_orders(db: Session) -> list[order_schema.SeatOrderResponse]:
    stmt1 = select(seat_model.Seat).order_by(seat_model.Seat.id)
    db_seats = db.execute(stmt1).scalars().all()

    res = []

    # 各席について
    for seat in db_seats:
        stmt2 = select(order_model.SeatSession).where(
            order_model.SeatSession.seat_id == seat.id,
            order_model.SeatSession.end_at.is_(None)
        )
        db_session = db.execute(stmt2).scalar_one_or_none()

        orders = []

        # セッションがある場合、セッションごとのオーダー取得
        if db_session:
            orders = get_session_orders(db_session.id, db)

        res.append(order_schema.SeatOrderResponse(
            seat_id = seat.id,
            seat_name = seat.name,
            orders = orders
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