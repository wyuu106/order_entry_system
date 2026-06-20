from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from fastapi import Response, HTTPException, status
from app.models import menu_model
from app.schemas import menu_schema

# カテゴリ作成
def create_category(category: menu_schema.CategoryCreate,
                    db: Session) -> menu_schema.CategoryCreateResponse:
    stmt = select(menu_model.Category).where(menu_model.Category.name == category.name)
    exist_category = db.execute(stmt).scalar_one_or_none()

    if exist_category:
        raise HTTPException(status_code=400, detail='このカテゴリは既に存在しています')
    
    db_category = menu_model.Category(name = category.name)

    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return db_category

# カテゴリ一覧
def get_categories(db: Session) -> list[menu_schema.CategoryCreateResponse]:
    return db.execute(select(menu_model.Category)).scalars().all()

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
    stmt1 = select(menu_model.Category).where(menu_model.Category.id == category_id)
    db_category = db.execute(stmt1).scalar_one_or_none()

    if not db_category:
        raise HTTPException(status_code=404, detail="該当するカテゴリが存在しません")

    db.execute(delete(menu_model.Menu).where(menu_model.Menu.category_id == category_id))

    db.delete(db_category)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)



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

# メニュー一覧
def get_menus(category_id: int, db: Session) -> list[menu_schema.MenuCreateResponse]:
    return db.execute(select(menu_model.Menu).where(
        menu_model.Menu.category_id == category_id
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
        raise HTTPException(status_code=404, detail="該当するユーザーが見つかりませんでした")

    db.delete(db_menu)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)