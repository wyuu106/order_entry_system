import unittest
from unittest.mock import AsyncMock, Mock, patch

from app.routers.order_router import create_order


class OrderTransactionTest(unittest.IsolatedAsyncioTestCase):
    async def test_rolls_back_when_notification_record_fails(self):
        db = Mock()

        with (
            patch("app.routers.order_router.order_crud.create_order", return_value=Mock()),
            patch(
                "app.routers.order_router.order_crud.create_notification",
                side_effect=RuntimeError("db error"),
            ),
            self.assertRaises(RuntimeError),
        ):
            await create_order(Mock(), Mock(), db)

        db.rollback.assert_called_once_with()
        db.commit.assert_not_called()

    async def test_delivery_failure_does_not_turn_saved_order_into_error(self):
        db = Mock()
        response = Mock()

        with (
            patch("app.routers.order_router.order_crud.create_order", return_value=response),
            patch("app.routers.order_router.order_crud.create_notification", return_value=1),
            patch(
                "app.routers.order_router.broadcast_new_order",
                new=AsyncMock(side_effect=RuntimeError("delivery error")),
            ),
            patch("app.routers.order_router.send_new_order_notifications", new=AsyncMock()),
        ):
            result = await create_order(Mock(), Mock(), db)

        self.assertIs(result, response)
        db.commit.assert_called_once_with()
        db.rollback.assert_not_called()


if __name__ == "__main__":
    unittest.main()
