from pydantic import BaseModel, ConfigDict, Field
from datetime import time

class SeatCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class SeatCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    status: str
