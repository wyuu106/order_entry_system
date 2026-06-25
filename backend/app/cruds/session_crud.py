from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from datetime import datetime
from zoneinfo import ZoneInfo
from app.utils.get_info_util import get_seat_name
from app.models import session_model, order_model
from app.schemas import session_schema
from app.cruds import seat_crud

# セッション作成
def create_session(
        seat_session: session_schema.SessionCreate,
        db: Session
) -> session_schema.SessionCreateResponse:
    stmt = select(session_model.SeatSession).where(
        session_model.SeatSession.seat_id == seat_session.seat_id,
        session_model.SeatSession.end_at.is_(None)
    )
    exist_session = db.execute(stmt).scalar_one_or_none()

    if exist_session:
        raise HTTPException(status_code=400, detail='この席は使用中です')
    
    seat_name = get_seat_name(seat_session.seat_id, db)
    
    db_session = session_model.SeatSession(
        seat_id = seat_session.seat_id
    )

    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    seat_crud.update_seat_status(seat_session.seat_id, 'occupied', db)

    return session_schema.SessionCreateResponse(
        id = db_session.id,
        seat_name = seat_name,
        start_at = db_session.start_at
    )

# 席ごとのセッションの有無を判定
def get_session(seat_id: int, db: Session) -> session_schema.SessionCreateResponse | None:
    stmt = select(session_model.SeatSession).where(
        session_model.SeatSession.seat_id == seat_id,
        session_model.SeatSession.end_at.is_(None)
    )
    db_session = db.execute(stmt).scalar_one_or_none()

    if not db_session:
        return None
    
    seat_name = get_seat_name(seat_id, db)
    
    return session_schema.SessionCreateResponse(
        id = db_session.id,
        seat_name = seat_name,
        start_at = db_session.start_at
    )

# セッション終了
def end_session(session_id: int, db: Session) -> session_schema.SessionResponse:
    stmt1 = select(session_model.SeatSession).where(
        session_model.SeatSession.id == session_id,
        session_model.SeatSession.end_at.is_(None)
    )
    db_session = db.execute(stmt1).scalar_one_or_none()

    if not db_session:
        raise HTTPException(status_code=404, detail='該当するセッションが見つかりません')
    
    stmt2 = select(order_model.Order).where(
        order_model.Order.session_id == session_id,
        order_model.Order.price.is_(None)
    )
    noprice_order = db.execute(stmt2).scalar_one_or_none()

    if noprice_order:
        raise HTTPException(status_code=400, detail='値段が未設定の商品があります')

    db_session.end_at = datetime.now(ZoneInfo("Asia/Tokyo"))

    db.commit()
    db.refresh(db_session)

    seat_name = get_seat_name(db_session.seat_id, db)

    return session_schema.SessionResponse(
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