from pydantic import BaseModel, ConfigDict
from datetime import time

class SeatCreate(BaseModel):
    name: str

class SeatCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    status: str

class SeatUpdate(BaseModel):
    id: int
    status: str