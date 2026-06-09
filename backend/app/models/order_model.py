from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.db import Base

class SeatSession(Base):
    __tablename__ = 'seat_sessions'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    seat_id = Mapped[int] = mapped_column(Integer, ForeignKey('seats.id'))
    start_at = Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow())
    end_at = Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

class Order(Base):
    __tablename__ = 'orders'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id = Mapped[int] = mapped_column(Integer, ForeignKey('seat_sessions.id'))
    menu_id: Mapped[int] = mapped_column(Integer, ForeignKey('menus'))
    price: Mapped[int] = mapped_column(Integer, nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users'))
    status: Mapped[str] = mapped_column(String, default='waiting')