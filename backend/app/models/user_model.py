from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String
from app.db import Base

class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True)
    hashed_password: Mapped[str] = mapped_column(String)

    role: Mapped[str] = mapped_column(String, default='staff')