from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, Time, ForeignKey
from datetime import time
from app.db import Base

# 席情報
class Seat(Base):
    __tablename__ = 'seats'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True)
    status: Mapped[str] = mapped_column(String, default='available')