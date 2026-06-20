from sqlalchemy.orm import Session
from sqlalchemy import select, func
from fastapi import Response, HTTPException, status
from datetime import date, time, datetime, timedelta
from app.utils.order_util import get_seat_name, create_order_response
from app.models import session_model, order_model, menu_model, user_model, seat_model
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

    seat_id = db.execute(select(session_model.SeatSession.seat_id).where(
        session_model.SeatSession.id == order.session_id,
        session_model.SeatSession.end_at.is_(None)
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

    seat_id = db.execute(select(session_model.SeatSession.seat_id).where(
        session_model.SeatSession.id == session_id,
        session_model.SeatSession.end_at.is_(None)
    )).scalar_one_or_none()

    if not seat_id:
        raise HTTPException(status_code=404, detail='該当するセッションが見つかりません')
    
    seat_name = get_seat_name(seat_id, db)

    for order in db_orders:
        res.append(create_order_response(order, seat_id, seat_name, db))

    return res

# 席ごとのオーダー一覧（ドリンクは除外）
def get_seat_orders(db: Session) -> list[order_schema.SeatOrderResponse]:
    stmt1 = select(seat_model.Seat).order_by(seat_model.Seat.id)
    db_seats = db.execute(stmt1).scalars().all()

    res = []

    # 各席について
    for seat in db_seats:
        stmt2 = select(session_model.SeatSession).where(
            session_model.SeatSession.seat_id == seat.id,
            session_model.SeatSession.end_at.is_(None)
        )
        db_session = db.execute(stmt2).scalar_one_or_none()

        orders = []

        # セッションがある場合、セッションごとのオーダー取得
        if db_session:
            session_orders = get_session_orders(db_session.id, db)

            # ドリンクを除外
            orders = [
                order for order in session_orders
                if not order.is_drink
            ]

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

# 任意の日付の売り上げを取得
def get_day_orders(
    target_date: date,
    db: Session,
) -> list[order_schema.DayOrderResponse]:

    start = datetime.combine(target_date, time(0, 0))
    end = datetime.combine(target_date + timedelta(days=1), time(0, 0))

    stmt = (
        select(
            session_model.SeatSession.id.label("session_id"),
            seat_model.Seat.name.label("seat_name"),
            menu_model.Menu.id.label("menu_id"),
            menu_model.Menu.name.label("menu_name"),
            func.sum(order_model.Order.quantity).label("quantity"),
            func.sum(
                order_model.Order.price * order_model.Order.quantity
            ).label("sales"),
        )
        .join(
            session_model.SeatSession,
            order_model.Order.session_id
            == session_model.SeatSession.id,
        )
        .join(
            seat_model.Seat,
            session_model.SeatSession.seat_id
            == seat_model.Seat.id,
        )
        .join(
            menu_model.Menu,
            order_model.Order.menu_id
            == menu_model.Menu.id,
        )
        .where(
            session_model.SeatSession.start_at >= start,
            session_model.SeatSession.start_at < end,
        )
        .group_by(
            session_model.SeatSession.id,
            seat_model.Seat.name,
            menu_model.Menu.id,
            menu_model.Menu.name,
        )
        .order_by(
            session_model.SeatSession.id
        )
    )

    rows = db.execute(stmt).mappings().all()

    sessions = {}

    for row in rows:
        session_id = row["session_id"]

        if session_id not in sessions:
            sessions[session_id] = {
                "session_id": session_id,
                "seat_name": row["seat_name"],
                "orders": [],
            }

        sessions[session_id]["orders"].append(
            {
                "menu_id": row["menu_id"],
                "menu_name": row["menu_name"],
                "quantity": row["quantity"],
                "sales": row["sales"],
            }
        )

    return [
        order_schema.DayOrderResponse(**session)
        for session in sessions.values()
    ]