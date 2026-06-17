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
    print(len(active_connections))

    for conn in active_connections:
        try:
            await conn.send_json({
                "type": "new_order",
                "order": {
                    "id": order.id,
                    "seat_id": order.seat_id,
                    "seat_name": order.seat_name,
                    "menu_name": order.menu_name,
                    "quantity": order.quantity,
                    "remark": order.remark,
                }
            })
            print('sent')
        except:
            # 切れてるやつは無視（安全対策）
            pass