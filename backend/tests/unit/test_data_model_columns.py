from sqlalchemy import inspect

from app.database import engine


def _cols(table: str) -> set[str]:
    return {c["name"] for c in inspect(engine).get_columns(table)}


def test_ac036_nfr006_users_only_email_and_password_hash_personal() -> None:
    assert _cols("users") == {
        "id",
        "email",
        "password_hash",
        "session_token_hash",
        "session_expires_at",
        "created_at",
    }
    uniques = inspect(engine).get_unique_constraints("users")
    assert ["email"] in [u["column_names"] for u in uniques]


def test_ac037_books_and_loans_columns() -> None:
    assert {"title", "author", "total_copies", "available_copies"} <= _cols("books")
    assert {"user_id", "book_id", "borrowed_at", "due_date", "returned_at"} <= _cols("loans")
    fks = {
        fk["constrained_columns"][0]: fk["referred_table"]
        for fk in inspect(engine).get_foreign_keys("loans")
    }
    assert fks == {"user_id": "users", "book_id": "books"}


def test_ac038_nfr009_no_overdue_column_or_table() -> None:
    insp = inspect(engine)
    for table in ("users", "books", "loans"):
        assert not any("overdue" in c for c in _cols(table))
    assert not any("overdue" in t for t in insp.get_table_names())
