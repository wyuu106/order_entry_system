from pydantic import BaseModel, ConfigDict, Field

# ユーザー登録に関する入力
class UserCreate(BaseModel):
    login_id: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8, max_length=72)

# 登録申請をした時のレスポンス
class RequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    login_id: str
    name: str

# ユーザー登録のレスポンス
class UserCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    login_id: str
    name: str
    role: str

# 申請データ
class RequestData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    login_id: str
    name: str
