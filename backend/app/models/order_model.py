from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, DateTime, ForeignKey
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