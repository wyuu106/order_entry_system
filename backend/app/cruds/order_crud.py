from sqlalchemy.orm import Session
from sqlalchemy import select, func
from fastapi import Response, HTTPException, status
from datetime import date, time, datetime, timedelta
from zoneinfo import ZoneInfo
from app.utils.create_response_util import(
    create_order_item_response,
    create_order_response
)
from app.models import(
    session_model,
    order_model,
    menu_model,
    user_model,
    seat_model
)
from app.schemas import order_schema

# オーダー作成
def create_order(
        order: order_schema.OrderCreate,
        current_user: user_model.User,
        db: Session
) -> order_schema.OrderCreateResponse:
    
    menu_ids = [item.menu_id for item in order.orders]

    stmt = select(menu_model.Menu).where(
        menu_model.Menu.id.in_(menu_ids)
    )
    
    menus = {
        menu.id: menu
        for menu in db.execute(stmt).scalars()
    }

    orders = []
    
    for item in order.orders:
        menu = menus.get(item.menu_id)

        if not menu:
            raise HTTPException(status_code=404, detail='該当するメニューが見つかりません')
        
        db_order = order_model.Order(
            session_id = order.session_id,
            menu_id = item.menu_id,
            menu_name = menu.name,
            price = menu.price,
            quantity = item.quantity,
            remark = item.remark,
            user_id = current_user.id
        )

        db.add(db_order)
        db.flush()

        orders.append(
            create_order_item_response(
                db_order,
                current_user.name,
                menu.is_drink
            )
        )
        
    res = create_order_response(order.session_id, orders, db)

    db.commit()
        
    return res

# セッションごとのオーダー一覧
def get_session_orders(session_id: int, db: Session) -> list[order_schema.OrderItemResponse]:
    stmt = (
        select(
            order_model.Order,
            menu_model.Menu.is_drink,
            user_model.User.name
        )
        .join(
            menu_model.Menu,
            order_model.Order.menu_id == menu_model.Menu.id
        )
        .join(
            user_model.User,
            order_model.Order.user_id == user_model.User.id
        )
        .where(
            order_model.Order.session_id == session_id
        )
        .order_by(
            order_model.Order.created_at,
            order_model.Order.id
        )
    )
     
    rows = db.execute(stmt).all()

    res = []

    for db_order, is_drink, user_name in rows:
        res.append(
            create_order_item_response(db_order, user_name, is_drink)
        )

    return res

# 席ごとのオーダー一覧（ドリンクは除外）
def get_seat_orders(db: Session) -> list[order_schema.OrderCreateResponse]:
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

        res.append(
            order_schema.OrderCreateResponse(
                seat_id = seat.id,
                seat_name = seat.name,
                orders = orders
            )
        )

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
            session_model.SeatSession.start_at.label("start_at"),
            session_model.SeatSession.end_at.label("end_at"),
            order_model.Order.menu_id.label("menu_id"),
            order_model.Order.menu_name.label("menu_name"),
            order_model.Order.remark.label("remark"),
            func.sum(order_model.Order.quantity).label("quantity"),
            func.sum(order_model.Order.price * order_model.Order.quantity).label("sales")
        )
        .join(
            session_model.SeatSession,
            order_model.Order.session_id == session_model.SeatSession.id
        )
        .join(
            seat_model.Seat,
            session_model.SeatSession.seat_id == seat_model.Seat.id
        )
        .where(
            session_model.SeatSession.start_at >= start,
            session_model.SeatSession.start_at < end
        )
        .group_by(
            session_model.SeatSession.id,
            seat_model.Seat.name,
            session_model.SeatSession.start_at,
            session_model.SeatSession.end_at,
            order_model.Order.menu_id,
            order_model.Order.menu_name,
            order_model.Order.remark
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
                "start_at": row["start_at"],
                "end_at": row["end_at"],
                "orders": [],
                "total_sales": 0
            }

        sessions[session_id]["orders"].append(
            {
                "menu_id": row["menu_id"],
                "menu_name": row["menu_name"],
                "remark": row["remark"],
                "quantity": row["quantity"],
                "sales": row["sales"],
            }
        )

        sessions[session_id]["total_sales"] += row["sales"] or 0

    return [
        order_schema.DayOrderResponse(**session)
        for session in sessions.values()
    ]


# 新規注文の通知履歴を作成
def create_notification(
    order_group: order_schema.OrderCreateResponse,
    db: Session
) -> int | None:
    payload = order_group.model_dump(mode="json")
    payload["orders"] = [
        order for order in payload["orders"] if not order.get("is_drink", False)
    ]

    if not payload["orders"]:
        return None

    admin_ids = db.execute(
        select(user_model.User.id).where(user_model.User.role == "admin")
    ).scalars().all()

    notification = order_model.OrderNotification(payload=payload)
    db.add(notification)
    db.flush()

    db.add_all(
        order_model.OrderNotificationReceipt(
            notification_id=notification.id,
            user_id=user_id,
        )
        for user_id in admin_ids
    )
    db.commit()
    return notification.id


# 管理者ごとの未確認注文通知を取得
def get_unread_notifications(user_id: int, db: Session):
    notifications = db.execute(
        select(order_model.OrderNotification)
        .join(
            order_model.OrderNotificationReceipt,
            order_model.OrderNotificationReceipt.notification_id
            == order_model.OrderNotification.id,
        )
        .where(
            order_model.OrderNotificationReceipt.user_id == user_id,
            order_model.OrderNotificationReceipt.read_at.is_(None),
        )
        .order_by(
            order_model.OrderNotification.created_at,
            order_model.OrderNotification.id,
        )
    ).scalars().all()

    return [
        {
            "id": notification.id,
            "order": notification.payload,
            "created_at": notification.created_at,
        }
        for notification in notifications
    ]


# 注文通知を確認済みに更新
def mark_notification_read(notification_id: int, user_id: int, db: Session):
    receipt = db.execute(
        select(order_model.OrderNotificationReceipt).where(
            order_model.OrderNotificationReceipt.notification_id == notification_id,
            order_model.OrderNotificationReceipt.user_id == user_id,
        )
    ).scalar_one_or_none()

    if receipt is None:
        raise HTTPException(status_code=404, detail="通知履歴が見つかりません")

    if receipt.read_at is None:
        receipt.read_at = datetime.now(ZoneInfo("Asia/Tokyo"))
        db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
