from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.db import get_db
from app.utils.auth import get_current_user
from app.models import user_model
from app.schemas import seat_schema
from app.cruds import seat_crud

router = APIRouter()

# 席情報作成
@router.post('/seat', response_model = seat_schema.SeatCreateResponse)
def create_seat(
    seat: seat_schema.SeatCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return seat_crud.create_seat(seat, db)

# 席情報一覧
@router.get('/seats', response_model = list[seat_schema.SeatCreateResponse])
def get_seats(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return seat_crud.get_seats(db)

# 席の状態更新
@router.put('/seat/{seat_id}', response_model = seat_schema.SeatCreateResponse)
def update_seat_status(
    seat_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return seat_crud.update_seat_status(seat_id, status, db)

# 席情報削除
@router.delete('/seat/{seat_id}')
def delete_seat(
    seat_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return seat_crud.delete_seat(seat_id, db)