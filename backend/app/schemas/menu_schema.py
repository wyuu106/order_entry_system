from pydantic import BaseModel, ConfigDict

class CategoryCreate(BaseModel):
    name: str

class CategoryCreateResponse(BaseModel):
    id: int
    name: str

class MenuCreate(BaseModel):
    name: str
    price: int
    category_id: str

class MenuCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    price: int
    category_name: str