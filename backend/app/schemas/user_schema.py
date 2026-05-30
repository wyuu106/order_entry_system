from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    password: str

class UserCreateResponse(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True