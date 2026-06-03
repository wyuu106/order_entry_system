from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, ForeignKey
from app.db import Base

class Order(Base):
    __tablename__ = 'orders'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    menu_id: Mapped[int] = mapped_column(Integer, ForeignKey('menus'))
    seat_id = Mapped[int] = mapped_column(Integer, ForeignKey('setas'))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users'))