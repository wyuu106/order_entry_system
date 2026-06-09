from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import Response, HTTPException, status
from app.models import seat_model
from app.schemas import seat_schema

# 席情報作成
def create_seat(seat: seat_schema.SeatCreate, db: Session) -> seat_schema.SeatCreateResponse:
    stmt = select(seat_model.Seat).where(seat_model.Seat.name == seat.name)
    exist_seat = db.execute(stmt).scalar_one_or_none()

    if exist_seat:
        raise HTTPException(status_code=400, detail='この席は既に存在します')
    
    db_seat = seat_model.Seat(name = seat.name)

    db.add(db_seat)
    db.commit()
    db.refresh(db_seat)

    return db_seat

# 席情報一覧
def get_seats(db: Session) -> list[seat_schema.SeatCreateResponse]:
    return db.execute(select(seat_model.Seat)).scalars().all()

# 席の状態更新
def update_seat_status(seat_id: int, status: str, db: Session) -> seat_schema.SeatCreateResponse:
    stmt = select(seat_model.Seat).where(seat_model.Seat.id == seat_id)
    db_seat = db.execute(stmt).scalar_one_or_none()

    if not db_seat:
        raise HTTPException(status_code=404, detail='該当する席がありません')
    
    if status not in ['available', 'occupied', 'empty']:
        raise HTTPException(status_code=400, detail="不正なステータスです")
    
    db_seat.status = status

    db.commit()
    db.refresh(db_seat)

    return db_seat

# 席情報削除
def delete_seat(seat_id: int, db: Session):
    stmt = select(seat_model.Seat).where(seat_model.Seat.id == seat_id)
    db_seat = db.execute(stmt).scalar_one_or_none()

    if not db_seat:
        raise HTTPException(status_code=404, detail='該当する席がありません')
    
    db.delete(db_seat)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)

