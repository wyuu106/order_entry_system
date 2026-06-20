from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, DateTime, ForeignKey
from datetime import datetime
from zoneinfo import ZoneInfo
from app.db import Base

class SeatSession(Base):
    __tablename__ = 'seat_sessions'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    seat_id: Mapped[int] = mapped_column(Integer, ForeignKey('seats.id'))
    start_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(ZoneInfo("Asia/Tokyo"))
    )
    end_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)