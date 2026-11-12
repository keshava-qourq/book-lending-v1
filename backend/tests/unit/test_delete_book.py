import secrets

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.models import User
from app.routers.books import (
    BookIn,
    borrow_book,
    create_book,
    delete_book,
    get_book,
    list_books,
    return_loan,
)
from app.security import hash_password


def _user(db: Session) -> User:
    user = User(
        email=f"u-{secrets.token_hex(4)}@example.com",
        password_hash=hash_password(secrets.token_urlsafe()),
    )
    db.add(user)
    db.commit()
    return user


def test_ac015_delete_without_loans_removes_book_everywhere(db_session: Session) -> None:
    book = create_book(BookIn(title="Gone Title", author="A", total_copies=2), db_session)
    keep = create_book(BookIn(title="Kept", author="A", total_copies=1), db_session)
    assert delete_book(str(book.id), db_session).status_code == 204
    assert [b.id for b in list_books(db_session)] == [keep.id]
    assert list_books(db_session, q="Gone") == []
    with pytest.raises(HTTPException) as e:
        get_book(str(book.id), db_session)
    assert e.value.status_code == 404


def test_ac016_nfr010_delete_on_loan_is_409_then_succeeds_after_return(
    db_session: Session,
) -> None:
    user = _user(db_session)
    book = create_book(BookIn(title="T", author="A", total_copies=1), db_session)
    loan = borrow_book(str(book.id), db_session, user)
    with pytest.raises(HTTPException) as e:
        delete_book(str(book.id), db_session)
    assert e.value.status_code == 409
    assert "on loan" in e.value.detail
    assert get_book(str(book.id), db_session).id == book.id
    return_loan(loan["id"], db_session, user)
    assert delete_book(str(book.id), db_session).status_code == 204
    assert list_books(db_session) == []


@pytest.mark.parametrize("token", [None, "", "not-a-valid-token"])
def test_nfr003_delete_needs_valid_token_and_book_remains(db_session: Session, token) -> None:
    from fastapi.security import HTTPAuthorizationCredentials

    book = create_book(BookIn(title="T", author="A", total_copies=1), db_session)
    cred = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token) if token else None
    with pytest.raises(HTTPException) as e:
        get_current_user(cred, db_session)
    assert e.value.status_code == 401
    assert [b.id for b in list_books(db_session)] == [book.id]
