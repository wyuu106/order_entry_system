from pydantic import BaseModel, ConfigDict

# ユーザー登録に関する入力
class UserCreate(BaseModel):
    name: str
    password: str

# 登録申請をした時のレスポンス
class RequestResponse(BaseModel):
    id: int
    name: str
    message: str

# ユーザー登録のレスポンス
class UserCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    role: str

# 申請データ
class RequestData(BaseModel):
    id: int
    name: str