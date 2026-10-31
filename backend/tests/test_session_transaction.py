import unittest
from unittest.mock import Mock, patch

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from app.cruds.session_crud import create_session, end_session
from app.schemas.session_schema import SessionCreate


class SessionTransactionTest(unittest.TestCase):
    def test_concurrent_session_conflict_rolls_back(self):
        db = Mock()
        db.execute.return_value.scalar_one_or_none.return_value = None
        db.get.return_value = Mock(status="empty")
        db.commit.side_effect = IntegrityError("insert", {}, Exception("duplicate"))

        with (
            patch("app.cruds.session_crud.get_seat_name", return_value="A1"),
            self.assertRaises(HTTPException) as error,
        ):
            create_session(SessionCreate(seat_id=1), db)

        self.assertEqual(error.exception.status_code, 409)
        db.rollback.assert_called_once_with()

    def test_ending_session_updates_seat_in_same_commit(self):
        session = Mock(id=3, seat_id=1, end_at=None)
        seat = Mock(status="occupied")
        db = Mock()
        db.execute.side_effect = [
            Mock(scalar_one_or_none=Mock(return_value=session)),
            Mock(scalars=Mock(return_value=Mock(first=Mock(return_value=None)))),
        ]
        db.get.return_value = seat

        with patch("app.cruds.session_crud.get_seat_name", return_value="A1"):
            result = end_session(3, db)

        self.assertIsNotNone(session.end_at)
        self.assertEqual(seat.status, "empty")
        self.assertEqual(result.message, "終了")
        db.commit.assert_called_once_with()


if __name__ == "__main__":
    unittest.main()
