from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, UniqueConstraint
from datetime import datetime
from zoneinfo import ZoneInfo
from app.db import Base

class Order(Base):
    __tablename__ = 'orders'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey('seat_sessions.id'))
    menu_id: Mapped[int] = mapped_column(Integer, ForeignKey('menus.id'))
    menu_name: Mapped[str] = mapped_column(String)
    price: Mapped[int] = mapped_column(Integer, nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    remark: Mapped[str] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default='waiting')
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(ZoneInfo("Asia/Tokyo"))
    )


class OrderNotification(Base):
    __tablename__ = "order_notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(ZoneInfo("Asia/Tokyo")),
    )


class OrderNotificationReceipt(Base):
    __tablename__ = "order_notification_receipts"
    __table_args__ = (
        UniqueConstraint("notification_id", "user_id", name="uq_notification_user"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    notification_id: Mapped[int] = mapped_column(
        ForeignKey("order_notifications.id", ondelete="CASCADE"),
        index=True,
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
