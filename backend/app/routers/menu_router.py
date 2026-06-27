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
@router.post('/admin/category', response_model=menu_schema.CategoryCreateResponse)
def create_category(
    category: menu_schema.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.create_category(category, db)

# カテゴリ一覧（管理者用）
@router.get('/admin/categories', response_model=list[menu_schema.CategoryCreateResponse])
def get_all_categories(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.get_all_categories(db)

# カテゴリ一覧（スタッフ用）
@router.get('/categories', response_model=list[menu_schema.CategoryCreateResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return menu_crud.get_categories(db)

# カテゴリ更新
@router.put('admin//category/{category_id}', response_model=menu_schema.CategoryCreateResponse)
def update_category(
    category_id: int,
    new_category: menu_schema.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.update_category(category_id, new_category, db)

# カテゴリ非表示
@router.put('/admin/category/{category_id}/inactive')
def inactive_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.inactive_category(category_id, db)

# カテゴリ復元
@router.put(
        '/admin/category/{category_id}/active',
        response_model=menu_schema.CategoryCreateResponse
)
def active_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.active_category(category_id, db)

# メニュー作成
@router.post('/admin/menu', response_model=menu_schema.MenuCreate)
def create_menu(
    menu: menu_schema.MenuCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")

    return menu_crud.create_menu(menu, db)

# メニュー一覧（非表示）
@router.get('/admin/inactive/menus', response_model=list[menu_schema.InactiveMenuResponse])
def get_inactive_menus(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.get_inactive_menus(db)

# メニュー一覧（販売中）
@router.get('/{category_id}/active/menus', response_model=list[menu_schema.MenuCreateResponse])
def get_active_menus(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return menu_crud.get_active_menus(category_id, db)

# メニュー更新
@router.put('/admin/menu/{menu_id}', response_model=menu_schema.MenuCreateResponse)
def update_menu(
    menu_id: int,
    new_menu: menu_schema.MenuCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.update_menu(menu_id, new_menu, db)

# メニュー非表示
@router.put('/admin/menu/{menu_id}/inactive')
def inactive_menu(
    menu_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.inactive_menu(menu_id, db)

# メニュー復元
@router.put('/admin/menu/{menu_id}/active', response_model=menu_schema.MenuCreateResponse)
def active_menu(
    menu_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.active_menu(menu_id, db)

# 日本酒情報作成
@router.post('/sake', response_model=menu_schema.SakeCreateResponse)
def create_sake(
    sake: menu_schema.SakeCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.create_sake(sake, db)

# 日本酒情報取得
@router.get('/sakes', response_model=list[menu_schema.SakeCreateResponse])
def get_sakes(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return menu_crud.get_sakes(db)

# 日本酒情報更新
@router.put('/sake/{sake_id}', response_model=menu_schema.SakeCreateResponse)
def update_sake(
    sake_id: int,
    new_sake: menu_schema.SakeCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.update_sake(sake_id, new_sake, db)

# 日本酒情報削除
@router.delete('/sake/{sake_id}')
def delete_sake(
    sake_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    if not current_user.role == 'admin':
        raise HTTPException(status_code=403, detail="権限がありません")
    
    return menu_crud.delete_sake(sake_id, db)