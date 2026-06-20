from pydantic import BaseModel, ConfigDict
from datetime import datetime

class OrderCreate(BaseModel):
    session_id: int
    menu_id: int
    quantity: int = 1
    remark: str | None = None

class OrderCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seat_id: int
    seat_name: str
    menu_name: str
    price: int | None
    quantity: int
    remark: str | None
    user_name: str
    status: str
    is_drink: bool

class SeatOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    seat_id: int
    seat_name: str
    orders: list[OrderCreateResponse]

class DayOrderItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    menu_id: int
    menu_name: str
    quantity: int
    sales: int

class DayOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: int
    seat_name: str
    orders: list[DayOrderItem]