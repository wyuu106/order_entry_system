from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import Response, HTTPException, status
from datetime import datetime
from app.schemas import order_schema

def create_session(
         session: order_schema.SessionCreate,
         db: Session
) -> order_schema.SessionCreateResponse:
    pass

def end_session(
        session_id: int,
        end_at: datetime,
        db: Session
) -> order_schema.SessionCreateResponse:
    pass
    

def create_order(
        order: order_schema.OrderCreate,
        db: Session
) -> order_schema.OrderCreateResponse:
    pass

def delete_order(order_id: int, db: Session):
    pass