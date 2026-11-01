import unittest
from unittest.mock import Mock, patch

from fastapi import HTTPException

from app.utils.auth import get_user_from_token


class AuthTest(unittest.TestCase):
    def test_valid_token_returns_database_user(self):
        user = Mock(id=7)
        db = Mock()
        db.execute.return_value.scalar_one_or_none.return_value = user

        with patch("app.utils.auth.jwt.decode", return_value={"sub": "7"}):
            result = get_user_from_token("token", db)

        self.assertIs(result, user)

    def test_token_without_numeric_subject_is_rejected(self):
        db = Mock()

        with (
            patch("app.utils.auth.jwt.decode", return_value={"sub": "invalid"}),
            self.assertRaises(HTTPException) as error,
        ):
            get_user_from_token("token", db)

        self.assertEqual(error.exception.status_code, 401)
        db.execute.assert_not_called()


if __name__ == "__main__":
    unittest.main()
