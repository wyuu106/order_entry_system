from pydantic import BaseModel, ConfigDict

class CategoryCreate(BaseModel):
    name: str

class CategoryCreateResponse(BaseModel):
    id: int
    name: str
    is_active: bool

class MenuCreate(BaseModel):
    name: str
    price: int | None = None
    is_drink: bool
    category_id: int

class MenuCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    price: int | None
    is_drink: bool
    is_active: bool
    category_id: int


class SakeCreate(BaseModel):
    name: str
    remark: str

class SakeCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    remark: str