import unittest
from unittest.mock import AsyncMock, Mock, patch

from fastapi import HTTPException

from app.ws.order_ws import orders_ws


class WebSocketAuthTest(unittest.IsolatedAsyncioTestCase):
    async def test_authenticated_socket_is_registered(self):
        websocket = Mock()
        websocket.accept = AsyncMock()
        websocket.receive_text = AsyncMock(
            side_effect=["valid-token", RuntimeError("disconnect")]
        )

        with (
            patch("app.ws.order_ws.get_user_from_token") as authenticate,
            patch("app.ws.order_ws.connect") as connect,
            patch("app.ws.order_ws.disconnect") as disconnect,
        ):
            await orders_ws(websocket, Mock())

        websocket.accept.assert_awaited_once_with()
        authenticate.assert_called_once()
        connect.assert_called_once_with(websocket)
        disconnect.assert_called_once_with(websocket)

    async def test_invalid_token_is_closed_and_not_registered(self):
        websocket = Mock()
        websocket.accept = AsyncMock()
        websocket.receive_text = AsyncMock(return_value="invalid-token")
        websocket.close = AsyncMock()

        with (
            patch(
                "app.ws.order_ws.get_user_from_token",
                side_effect=HTTPException(status_code=401),
            ),
            patch("app.ws.order_ws.connect") as connect,
            patch("app.ws.order_ws.disconnect"),
        ):
            await orders_ws(websocket, Mock())

        connect.assert_not_called()
        websocket.close.assert_awaited_once_with(code=1008)


if __name__ == "__main__":
    unittest.main()
