from pydantic import BaseModel, ConfigDict

class UserCreate(BaseModel):
    name: str
    password: str

class UserCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str