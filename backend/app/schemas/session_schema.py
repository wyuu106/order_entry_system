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

class SessionResponse(BaseModel):
    seat_name: str
    message: str