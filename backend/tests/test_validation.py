import unittest

from pydantic import ValidationError

from app.schemas.order_schema import OrderCreate, OrderItem
from app.schemas.user_schema import UserCreate


class ValidationTest(unittest.TestCase):
    def test_order_quantity_accepts_one_through_nineteen(self):
        self.assertEqual(OrderItem(menu_id=1, quantity=1).quantity, 1)
        self.assertEqual(OrderItem(menu_id=1, quantity=19).quantity, 19)

    def test_order_quantity_rejects_out_of_range_values(self):
        for quantity in (0, -1, 20):
            with self.subTest(quantity=quantity), self.assertRaises(ValidationError):
                OrderItem(menu_id=1, quantity=quantity)

    def test_order_rejects_empty_items(self):
        with self.assertRaises(ValidationError):
            OrderCreate(session_id=1, orders=[])

    def test_registration_rejects_short_password(self):
        with self.assertRaises(ValidationError):
            UserCreate(login_id="staff", name="Staff", password="short")


if __name__ == "__main__":
    unittest.main()
