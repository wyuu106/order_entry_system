from pydantic import BaseModel, ConfigDict, Field

class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class CategoryCreateResponse(BaseModel):
    id: int
    name: str
    is_active: bool

class MenuCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: int | None = Field(default=None, ge=0)
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

class InactiveMenuResponse(BaseModel):
    id: int
    name: str
    price: int | None
    is_active: bool
    category_id: int
    category_name: str


class SakeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    remark: str = Field(max_length=500)

class SakeCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    remark: str
