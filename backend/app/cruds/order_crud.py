from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import Response, HTTPException, status
from datetime import datetime
from app.models import order_model, seat_model, menu_model, user_model
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

# セッション終了
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

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return order_schema.OrderCreateResponse(
        id = db_order.id,
        seat_name = seat_name,
        menu_name = menu_name,
        quantity = db_order.quantity,
        user_name = current_user.name
    )

# オーダー一覧
def get_orders(session_id: int, db: Session) -> list[order_schema.OrderCreateResponse]:
    return db.execute(select(order_model.Order).where(
        order_model.Order.session_id == session_id
    )).scalars().all()

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
def update_order(new_order: order_schema.OrderUpdate, db: Session) -> str:
    stmt = select(order_model.Order).where(
        order_model.Order.id == new_order.id
    )
    db_order = db.execute(stmt).scalar_one_or_none()

    if not db_order:
        raise HTTPException(status_code=404, detail='該当する注文が見つかりません')
    
    if new_order.status not in ["waiting", "served"]:
        raise HTTPException(status_code=400, detail="不正なステータスです")
    
    db_order.status = new_order.status

    db.commit()
    db.refresh(db_order)

    return status

# 会計
def checkout(session_id: int, db: Session) -> int:
    stmt = select(
        order_model.Order.menu_id,
        order_model.Order.quantity
    ).where(
        order_model.Order.session_id == session_id
    )
    orders = db.execute(stmt).scalars().all()

    if not orders:
        raise HTTPException(status_code=404, detail='該当する注文が見つかりません')

    total = 0

    for menu_id, quantity in orders:
        price = db.execute(select(menu_model.Menu.price).where(
            menu_model.Menu.id == menu_id
        )).scalar_one_or_none()

        if price is None:
            raise HTTPException(status_code=400, detail='値段が設定されていない商品があります')

        total += price * quantity
    
    return total