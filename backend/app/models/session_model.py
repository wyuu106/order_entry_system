from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, DateTime, ForeignKey, Index, text
from datetime import datetime
from zoneinfo import ZoneInfo
from app.db import Base

class SeatSession(Base):
    __tablename__ = 'seat_sessions'
    __table_args__ = (
        Index("uq_active_session_per_seat", "seat_id", unique=True,
              postgresql_where=text("end_at IS NULL"),
              sqlite_where=text("end_at IS NULL")),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    seat_id: Mapped[int] = mapped_column(Integer, ForeignKey('seats.id'))
    start_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(ZoneInfo("Asia/Tokyo"))
    )
    end_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
