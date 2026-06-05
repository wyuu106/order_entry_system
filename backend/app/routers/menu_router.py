from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.db import get_db
from app.utils.auth import get_current_user
from app.models import user_model
from app.schemas import menu_schema
from app.cruds import menu_crud

router = APIRouter()

# カテゴリ作成
@router.post('/category', response_model=menu_schema.CategoryCreateResponse)
def create_category(
    category: menu_schema.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.create_category(category, db)

# カテゴリ一覧
@router.get('/categories', response_model=list[menu_schema.CategoryCreateResponse])
def get_categories(db: Session = Depends(get_db)):
    return menu_crud.get_categories(db)

# カテゴリ更新
@router.put('/category/{category_id}', response_model=menu_schema.CategoryCreateResponse)
def update_category(
    category_id: int,
    new_category: menu_schema.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.update_category(category_id, new_category, db)

# カテゴリ削除
@router.delete('/category/{category_id}')
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.delete_category(category_id, db)

# メニュー作成
@router.post('/menu', response_model=menu_schema.MenuCreate)
def create_menu(
    menu: menu_schema.MenuCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")

    return menu_crud.create_menu(menu, db)

# メニュー一覧
@router.get('/{category_id}/menus', response_model=list[menu_schema.MenuCreateResponse])
def get_menus(category_id: int, db: Session = Depends(get_db)):
    return menu_crud.get_menus(category_id, db)

# メニュー更新
@router.put('/menu/{menu_id}', response_model=menu_schema.MenuCreateResponse)
def update_menu(
    menu_id: int,
    new_menu: menu_schema.MenuCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.update_menu(menu_id, new_menu, db)

# メニュー削除
@router.delete('/menu/{menu_id}')
def delete_menu(
    menu_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.delete_menu(menu_id, db)