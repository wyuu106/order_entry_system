from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import Response, HTTPException, status
from datetime import datetime
from app.utils.name_util import get_seat_name, get_menu_name, get_user_name
from app.models import order_model, menu_model, user_model
from app.schemas import order_schema
from app.cruds import seat_crud

# セッション作成
def create_session(
        seat_session: order_schema.SessionCreate,
        db: Session
) -> order_schema.SessionCreateResponse:
    stmt = select(order_model.SeatSession).where(
        order_model.SeatSession.seat_id == seat_session.seat_id,
        order_model.SeatSession.end_at.is_(None)
    )
    exist_session = db.execute(stmt).scalar_one_or_none()
    if exist_session:
        raise HTTPException(status_code=400, detail='この席は使用中です')
    
    seat_name = get_seat_name(seat_session.seat_id, db)
    
    db_session = order_model.SeatSession(
        seat_id = seat_session.seat_id
    )

    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    seat_crud.update_seat_status(seat_session.seat_id, 'occupied', db)

    return order_schema.SessionCreateResponse(
        id = db_session.id,
        seat_name = seat_name,
        start_at = db_session.start_at
    )

# 席ごとのセッションの有無を判定
def get_session(seat_id: int, db: Session) -> order_schema.SessionCreateResponse | None:
    stmt = select(order_model.SeatSession).where(
        order_model.SeatSession.seat_id == seat_id,
        order_model.SeatSession.end_at.is_(None)
    )
    db_session = db.execute(stmt).scalar_one_or_none()

    if not db_session:
        return None
    
    seat_name = get_seat_name(seat_id, db)
    
    return order_schema.SessionCreateResponse(
        id = db_session.id,
        seat_name = seat_name,
        start_at = db_session.start_at
    )

# セッション終了
def end_session(session_id: int, db: Session) -> order_schema.SessionResponse:
    stmt = select(order_model.SeatSession).where(
        order_model.SeatSession.id == session_id,
        order_model.SeatSession.end_at.is_(None)
    )
    db_session = db.execute(stmt).scalar_one_or_none()

    if not db_session:
        raise HTTPException(status_code=404, detail='該当するセッションが見つかりません')

    db_session.end_at = datetime.utcnow()

    db.commit()
    db.refresh(db_session)

    seat_name = get_seat_name(db_session.seat_id, db)

    return order_schema.SessionResponse(
        seat_name = seat_name,
        message = '終了'
    )

# 合計金額取得
def get_total(session_id: int, db: Session) -> int:
    stmt = select(
        order_model.Order.price,
        order_model.Order.quantity
    ).where(
        order_model.Order.session_id == session_id
    )
    db_orders = db.execute(stmt).all()

    total = 0

    for price, quantity in db_orders:
        if price is None:
            raise HTTPException(status_code=400, detail='値段が設定されていない商品があります')

        total += price * quantity

    return total