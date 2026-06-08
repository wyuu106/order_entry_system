from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import Response, HTTPException, status
from datetime import datetime
from app.models import order_model, seat_model, menu_model, user_model
from app.schemas import order_schema
from app.cruds import seat_crud

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
    
    db_session = order_model.SeatSession(
        seat_id = seat_session.seat_id
    )

    db.add(db_session)

    seat_crud.update_seat_status(seat_session.seat_id, 'occupied', db)

    db.refresh(db_session)

    seat_name = db.execute(select(seat_model.Seat.name).where(
        seat_model.Seat.id == seat_session.seat_id
    )).scalar_one_or_none()

    return order_schema.SessionCreateResponse(
        id = db_session.id,
        seat_name = seat_name,
        start_at = db_session.start_at
    )

def end_session(session_id: int, db: Session) -> order_schema.SessionResponse:
    stmt = select(order_model.SeatSession).where(
        order_model.SeatSession.id == session_id
    )
    db_session = db.execute(stmt).scalar_one_or_none()

    if not db_session:
        raise HTTPException(status_code=404, detail='該当するセッションが見つかりません')
    
    if db_session.end_at is not None:
        raise HTTPException(status_code=400, detail="このセッションは既に終了しています")

    db_session.end_at = datetime.utcnow()

    db.commit()
    db.refresh(db_session)

    seat_name = db.execute(select(seat_model.Seat.name).where(
        seat_model.Seat.id == db_session.seat_id
    )).scalar_one_or_none()

    return order_schema.SessionResponse(
        seat_name = seat_name,
        message = 'お会計'
    )
    
def create_order(
        order: order_schema.OrderCreate,
        db: Session
) -> order_schema.OrderCreateResponse:
    db_order = order_model.Order(
        session_id = order.session_id,
        menu_id = order.menu_id,
        quantity = order.quantity,
        user_id = order.user_id
    )

    seat_id = db.execute(select(order_model.SeatSession.seat_id).where(
        order_model.SeatSession.id == order.session_id,
        order_model.SeatSession.end_at.is_(None)
    )).scalar_one_or_none()

    if not seat_id:
        raise HTTPException(status_code=404, detail='該当するセッションが見つかりません')
    
    seat_name = db.execute(select(seat_model.Seat.name).where(
        seat_model.Seat.id == seat_id
    )).scalar_one_or_none()

    if not seat_name:
        raise HTTPException(status_code=404, detail='該当する席が見つかりません')

    menu_name = db.execute(select(menu_model.Menu.name).where(
        menu_model.Menu.id == order.menu_id
    )).scalar_one_or_none()

    if not menu_name:
        raise HTTPException(status_code=404, detail='該当するメニューが見つかりません')

    user_name = db.execute(select(user_model.User.name).where(
        user_model.User.id == order.user_id
    )).scalar_one_or_none()

    if not user_name:
        raise HTTPException(status_code=404, detail='該当するユーザーが見つかりません')

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return order_schema.OrderCreateResponse(
        id = db_order.id,
        seat_name = seat_name,
        menu_name = menu_name,
        quantity = db_order.quantity,
        user_name = user_name
    )


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