from pydantic import BaseModel, ConfigDict
from datetime import datetime

class SessionCreate(BaseModel):
    seat_id: int

class SessionCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seat_name: str
    start_at: datetime
    end_at: datetime | None = None

class OrderCreate(BaseModel):
    session_id: int
    menu_id: int
    quantity: int = 1
    user_id: int

class OrderCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seat_name: str
    menu_name: str
    quantity: int
    user_name: str

