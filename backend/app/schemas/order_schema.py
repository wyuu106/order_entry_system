from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class OrderItem(BaseModel):
    menu_id: int
    quantity: int = Field(default=1, ge=1, lt=20)
    remark: str | None = Field(default=None, max_length=500)

class OrderCreate(BaseModel):
    session_id: int
    orders: list[OrderItem] = Field(min_length=1)

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
    created_at: datetime

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
    end_at: datetime | None
    orders: list[DayOrderItem]
    total_sales: int


class OrderNotificationResponse(BaseModel):
    id: int
    order: OrderCreateResponse
    created_at: datetime
