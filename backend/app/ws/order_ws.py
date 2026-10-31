import asyncio

from fastapi import APIRouter, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session

from app.db import get_db
from app.utils.auth import get_user_from_token
from app.utils.websocket import connect, disconnect

router = APIRouter()

@router.websocket("/ws/orders")
async def orders_ws(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()

    try:
        token = await asyncio.wait_for(websocket.receive_text(), timeout=5)
        get_user_from_token(token, db)
        connect(websocket)

        while True:
            await websocket.receive_text()
    except (HTTPException, asyncio.TimeoutError):
        await websocket.close(code=1008)
    except Exception:
        pass
    finally:
        disconnect(websocket)
