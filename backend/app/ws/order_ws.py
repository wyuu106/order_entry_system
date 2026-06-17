from fastapi import APIRouter, WebSocket
from app.utils.websocket import connect, disconnect

router = APIRouter()

@router.websocket("/ws/orders")
async def orders_ws(websocket: WebSocket):
    print("WS request received")

    await websocket.accept()

    print("WS accepted")

    connect(websocket)

    try:
        while True:
            await websocket.receive_text()

    except Exception as e:
        print("WS disconnected", e)
        disconnect(websocket)