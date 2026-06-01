from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import Response, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.utils.auth import hash_password, verify_password, create_access_token
from app.models import user_model
from app.schemas import user_schema

# ユーザー登録
def create_user(user: user_schema.UserCreate, db: Session) -> user_schema.UserCreateResponse:
    exist_user = db.execute(select(user_model.User).where(
        user_model.User.name == user.name
    )).scalar_one_or_none()

    if exist_user:
        raise HTTPException(status_code=400, detail='このユーザー名は既に使われています')

    db_user = user_model.User(
        name = user.name,
        hashed_password = hash_password(user.password)
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

# ユーザー一覧
def get_users(db: Session) -> list[user_schema.UserCreateResponse]:
    return db.execute(select(user_model.User)).scalars().all()

# ログイン
def login(form_data: OAuth2PasswordRequestForm, db: Session) -> dict[str, str]:
    stmt = select(user_model.User).where(user_model.User.name == form_data.username)
    user = db.execute(stmt).scalar_one_or_none()

    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="IDまたはパスワードが違います")

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# ユーザー削除
def delete_user(user_id: str, db: Session):
    stmt = select(user_model.User).where(
        user_model.User.id == user_id
    )
    db_user = db.execute(stmt).scalar_one_or_none()

    if not db_user:
        raise HTTPException(status_code=404, detail="該当するユーザーが見つかりませんでした")
    
    db.delete(db_user)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)