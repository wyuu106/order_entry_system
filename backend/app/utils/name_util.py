from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from app.models import seat_model, menu_model, user_model

def get_seat_name(seat_id: int, db: Session) -> str:
    seat_name = db.execute(select(seat_model.Seat.name).where(
        seat_model.Seat.id == seat_id
    )).scalar_one_or_none()

    if not seat_name:
        raise HTTPException(status_code=404, detail='該当する席が見つかりません')
    
    return seat_name

def get_menu_name(menu_id, db) -> str:
    menu_name = db.execute(select(menu_model.Menu.name).where(
        menu_model.Menu.id == menu_id
    )).scalar_one_or_none()

    if not menu_name:
        raise HTTPException(status_code=404, detail='該当するメニューが見つかりません')
    
    return menu_name

def get_user_name(user_id: int, db: Session) -> str:
    user_name = db.execute(select(user_model.User.name).where(
            user_model.User.id == user_id
        )).scalar_one_or_none()
    
    if not user_name:
        raise HTTPException(status_code=404, detail='該当するユーザーが見つかりません')
    
    return user_name