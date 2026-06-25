from pydantic import BaseModel, ConfigDict
from datetime import datetime

class OrderItem(BaseModel):
    menu_id: int
    quantity: int = 1
    remark: str | None = None

class OrderCreate(BaseModel):
    session_id: int
    orders: list[OrderItem]

class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    menu_name: str
    price: int | None
    quantity: int
    remark: str | None
    status: str
    user_name: str
    is_drink: bool

class OrderCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    seat_id: int
    seat_name: str
    orders: list[OrderItemResponse]

class DayOrderItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    menu_id: int
    menu_name: str
    remark: str | None
    quantity: int
    sales: int

class DayOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: int
    seat_name: str
    start_at: datetime
    end_at: datetime
    orders: list[DayOrderItem]
    total_sales: int