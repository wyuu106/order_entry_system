from typing import List
from fastapi import WebSocket

# 接続中のWebSocket一覧
active_connections: List[WebSocket] = []

def connect(websocket: WebSocket):
    active_connections.append(websocket)


def disconnect(websocket: WebSocket):
    if websocket in active_connections:
        active_connections.remove(websocket)

async def broadcast_new_order(order):
    print("broadcast")
    print(order)

    payload = order.model_dump()

    # ドリンク除外
    payload["orders"] = [
        o for o in payload["orders"]
        if not o.get("is_drink", False)
    ]

    for conn in active_connections:
        try:
            await conn.send_json({
                "type": "new_order",
                "order": payload
            })
            print("sent")

        except Exception as e:
            print("ws error:", e)
            active_connections.remove(conn)