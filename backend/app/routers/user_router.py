from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.db import get_db
from app.utils.auth import get_current_user
from app.models import user_model
from app.schemas import user_schema
from app.cruds import user_crud

router = APIRouter()

# ユーザー登録
@router.post('/register', response_model = user_schema.UserCreateResponse)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    return user_crud.create_user(user, db)

# ユーザー一覧
@router.get('/users', response_model = list[user_schema.UserCreateResponse])
def get_users(db: Session = Depends(get_db)):
    return user_crud.get_users(db)

# ログイン
@router.post('/login')
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    return user_crud.login(form_data, db)

# ユーザー削除
@router.delete('/delete/{user_id}')
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return user_crud.delete_user(user_id, db)