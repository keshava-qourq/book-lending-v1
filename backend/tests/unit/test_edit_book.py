import secrets
from datetime import date

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.models import Book, Loan, User
from app.routers.books import BookIn, create_book, get_book, list_books, update_book


def _book(db: Session, copies: int = 3) -> Book:
    return create_book(BookIn(title="Dune", author="Herbert", total_copies=copies), db)


def _loans(db: Session, book: Book, n: int) -> None:
    for _ in range(n):
        user = User(email=f"u-{secrets.token_hex(4)}@example.com", password_hash="x")
        db.add(user)
        db.flush()
        db.add(Loan(user_id=user.id, book_id=book.id, due_date=date.today()))
        book.available_copies -= 1
    db.commit()


def test_ac012_update_shows_in_get_list_and_search(db_session: Session) -> None:
    book = _book(db_session)
    out = update_book(
        str(book.id), BookIn(title=" Emma ", author="Austen", total_copies=5), db_session
    )
    assert (out.title, out.author, out.total_copies, out.available_copies) == (
        "Emma",
        "Austen",
        5,
        5,
    )
    assert get_book(str(book.id), db_session).title == "Emma"
    assert [b.title for b in list_books(db_session)] == ["Emma"]
    assert [b.id for b in list_books(db_session, q="austen")] == [book.id]
    assert list_books(db_session, q="Dune") == []


def test_ac013_nfr010_below_loaned_is_409_and_unchanged(db_session: Session) -> None:
    book = _book(db_session)
    _loans(db_session, book, 2)
    with pytest.raises(HTTPException) as e:
        update_book(str(book.id), BookIn(title="New", author="N", total_copies=1), db_session)
    assert e.value.status_code == 409
    assert "below the number currently on loan" in e.value.detail
    db_session.refresh(book)
    assert (book.title, book.author, book.total_copies, book.available_copies) == (
        "Dune",
        "Herbert",
        3,
        1,
    )


def test_ac014_raising_copies_raises_available_by_same_amount(db_session: Session) -> None:
    book = _book(db_session)
    _loans(db_session, book, 2)
    out = update_book(
        str(book.id), BookIn(title="Dune", author="Herbert", total_copies=7), db_session
    )
    assert out.total_copies == 7
    assert out.available_copies == 5


def test_nfr003_edit_requires_valid_token(db_session: Session) -> None:
    with pytest.raises(HTTPException) as e:
        get_current_user(None, db_session)
    assert e.value.status_code == 401
