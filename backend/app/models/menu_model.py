from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, Boolean, ForeignKey
from app.db import Base

class Category(Base):
    __tablename__ = 'categories'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Menu(Base):
    __tablename__ = 'menus'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True)
    price: Mapped[int] = mapped_column(Integer, nullable=True)
    is_drink: Mapped[bool] = mapped_column(Boolean)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    category_id: Mapped[int] = mapped_column(Integer, ForeignKey('categories.id'))

class Sake(Base):
    __tablename__ = "sakes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True)
    remark: Mapped[str] = mapped_column(String)
