from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from app.models import session_model, seat_model

def get_seat_name(seat_id: int, db: Session):
    seat_name = db.execute(select(seat_model.Seat.name).where(
        seat_model.Seat.id == seat_id
    )).scalar_one_or_none()

    if not seat_name:
        raise HTTPException(status_code=404, detail='該当する席が見つかりません')
    
    return seat_name

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