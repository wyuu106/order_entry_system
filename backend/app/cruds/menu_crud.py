from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from fastapi import Response, HTTPException, status
from app.models import menu_model
from app.schemas import menu_schema

# カテゴリ作成
def create_category(
        category: menu_schema.CategoryCreate,
        db: Session
) -> menu_schema.CategoryCreateResponse:
    stmt = select(menu_model.Category).where(menu_model.Category.name == category.name)
    exist_category = db.execute(stmt).scalar_one_or_none()

    if exist_category:
        raise HTTPException(status_code=400, detail='このカテゴリは既に存在しています')
    
    db_category = menu_model.Category(name = category.name)

    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return db_category

# カテゴリ一覧（管理者用）
def get_all_categories(db: Session) -> list[menu_schema.CategoryCreateResponse]:
    return db.execute(select(menu_model.Category)).scalars().all()

# カテゴリ一覧（スタッフ用
def get_categories(db: Session) -> list[menu_schema.CategoryCreateResponse]:
    return db.execute(select(menu_model.Category).where(
        menu_model.Category.is_active == True
    )).scalars().all()

# カテゴリ更新
def update_category(
        category_id: int,
        new_category: menu_schema.CategoryCreate,
        db: Session
) -> menu_schema.CategoryCreateResponse:
    stmt = select(menu_model.Category).where(
        menu_model.Category.id == category_id
    )
    db_category = db.execute(stmt).scalar_one_or_none()

    if not db_category:
        raise HTTPException(status_code=404, detail="該当するカテゴリが存在しません")
    
    db_category.name = new_category.name

    db.commit()
    db.refresh(db_category)

    return db_category

# カテゴリ削除
def delete_category(category_id: int, db: Session):
    stmt = select(menu_model.Category).where(menu_model.Category.id == category_id)
    db_category = db.execute(stmt).scalar_one_or_none()

    if not db_category:
        raise HTTPException(status_code=404, detail="該当するカテゴリが存在しません")

    db_category.is_active = False

    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)

# カテゴリ復元
def restore_category(category_id: int, db: Session) -> menu_schema.CategoryCreateResponse:
    stmt = select(menu_model.Category).where(menu_model.Category.id == category_id)
    db_category = db.execute(stmt).scalar_one_or_none()

    if not db_category:
        raise HTTPException(status_code=404, detail="該当するカテゴリが存在しません")

    db_category.is_active = True

    db.commit()

    return db_category


# メニュー作成
def create_menu(menu: menu_schema.MenuCreate, db: Session) -> menu_schema.MenuCreateResponse:
    stmt1 = select(menu_model.Category).where(menu_model.Category.id == menu.category_id)
    category = db.execute(stmt1).scalar_one_or_none()

    if not category:
        raise HTTPException(status_code=404, detail="カテゴリが存在しません")
    
    stmt2 = select(menu_model.Menu).where(menu_model.Menu.name == menu.name)
    exist_menu = db.execute(stmt2).scalar_one_or_none()

    if exist_menu:
        raise HTTPException(status_code=400, detail='このメニューは既に存在しています')
    
    db_menu = menu_model.Menu(
        name = menu.name,
        price = menu.price,
        is_drink = menu.is_drink,
        category_id = menu.category_id
    )

    db.add(db_menu)
    db.commit()
    db.refresh(db_menu)

    return db_menu

# メニュー一覧（管理者用）
def get_all_menus(category_id: int, db: Session) -> list[menu_schema.MenuCreateResponse]:
    return db.execute(select(menu_model.Menu).where(
        menu_model.Menu.category_id == category_id
    )).scalars().all()

# メニュー一覧（スタッフ用）
def get_menus(category_id: int, db: Session) -> list[menu_schema.MenuCreateResponse]:
    return db.execute(select(menu_model.Menu).where(
        menu_model.Menu.category_id == category_id,
        menu_model.Menu.is_active == True
    )).scalars().all()

# メニュー更新
def update_menu(
        menu_id: int,
        new_menu: menu_schema.MenuCreate,
        db: Session
) -> menu_schema.MenuCreateResponse:
    stmt = select(menu_model.Menu).where(menu_model.Menu.id == menu_id)
    db_menu = db.execute(stmt).scalar_one_or_none()

    if not db_menu:
        raise HTTPException(status_code=404, detail="該当するメニューが存在しません")

    db_menu.name = new_menu.name
    db_menu.price = new_menu.price
    db_menu.is_drink = new_menu.is_drink

    db.commit()
    db.refresh(db_menu)

    return db_menu

# メニュー削除
def delete_menu(menu_id: int, db: Session):
    stmt = select(menu_model.Menu).where(menu_model.Menu.id == menu_id)
    db_menu = db.execute(stmt).scalar_one_or_none()

    if not db_menu:
        raise HTTPException(status_code=404, detail="該当するメニューが見つかりませんでした")

    db_menu.is_active = False

    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)

# メニュー復元
def restore_menu(menu_id: int, db: Session) -> menu_schema.MenuCreateResponse:
    stmt = select(menu_model.Menu).where(menu_model.Menu.id == menu_id)
    db_menu = db.execute(stmt).scalar_one_or_none()

    if not db_menu:
        raise HTTPException(status_code=404, detail="該当するメニューが見つかりませんでした")

    db_menu.is_active = True
    
    db.commit()

    return db_menu

# 日本酒情報作成
def create_sake(
        sake: menu_schema.SakeCreateResponse,
        db: Session
) -> menu_schema.SakeCreateResponse:
    exist_sake = db.execute(select(menu_model.Sake).where(
        menu_model.Sake.name == sake.name
    )).scalar_one_or_none()

    if exist_sake:
        raise HTTPException(status_code=400, detail='この日本酒は既に存在しています')
    
    db_sake = menu_model.Sake(
        name = sake.name,
        remark = sake.remark
    )

    db.add(db_sake)
    db.commit()
    db.refresh(db_sake)

    return db_sake

# 日本酒情報取得
def get_sakes(db: Session) -> list[menu_schema.SakeCreateResponse]:
    return db.execute(select(menu_model.Sake)).scalars().all()

# 日本酒情報更新
def update_sake(
        sake_id: int,
        new_sake: menu_schema.SakeCreate,
        db: Session
) -> menu_schema.SakeCreateResponse:
    stmt = select(menu_model.Sake).where(
        menu_model.Sake.id == sake_id
    )
    db_sake = db.execute(stmt).scalar_one_or_none()

    if not db_sake:
        raise HTTPException(status_code=404, detail="該当する日本酒が見つかりませんでした")
    
    db_sake.name = new_sake.name
    db_sake.remark = new_sake.remark

    db.commit()
    db.refresh(db_sake)

    return db_sake

# 日本酒情報削除
def delete_sake(sake_id: int, db: Session):
    stmt = select(menu_model.Sake).where(
        menu_model.Sake.id == sake_id
    )
    db_sake = db.execute(stmt).scalar_one_or_none()

    if not db_sake:
        raise HTTPException(status_code=404, detail="該当する日本酒が見つかりませんでした")
    
    db.delete(db_sake)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)