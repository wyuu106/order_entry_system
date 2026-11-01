import unittest
from unittest.mock import Mock

from fastapi import HTTPException

from app.cruds import order_crud, seat_crud
from app.schemas.order_schema import OrderCreate, OrderItem


class CrudGuardTest(unittest.TestCase):
    def test_unavailable_menu_is_rejected(self):
        db = Mock()
        db.execute.return_value.scalars.return_value = []
        order = OrderCreate(
            session_id=1,
            orders=[OrderItem(menu_id=10, quantity=1)],
        )

        with self.assertRaises(HTTPException) as error:
            order_crud.create_order(order, Mock(id=1, name="Staff"), db)

        self.assertEqual(error.exception.status_code, 404)
        db.add.assert_not_called()
        db.commit.assert_not_called()

    def test_seat_with_history_cannot_be_deleted(self):
        db = Mock()
        db.execute.side_effect = [
            Mock(scalar_one_or_none=Mock(return_value=Mock(id=1))),
            Mock(first=Mock(return_value=(1,))),
        ]

        with self.assertRaises(HTTPException) as error:
            seat_crud.delete_seat(1, db)

        self.assertEqual(error.exception.status_code, 409)
        db.delete.assert_not_called()
        db.commit.assert_not_called()


if __name__ == "__main__":
    unittest.main()
