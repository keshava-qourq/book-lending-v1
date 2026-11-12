import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.models import Book
from app.routers.books import BookIn, create_book, list_books


def _count(db: Session) -> int:
    return db.scalar(select(func.count()).select_from(Book))


def test_ac010_create_then_list_has_available_equal_total(db_session: Session) -> None:
    created = create_book(BookIn(title=" Dune ", author="Herbert", total_copies=3), db_session)
    assert created.available_copies == created.total_copies == 3
    listed = list_books(db_session)
    assert [(b.id, b.title, b.available_copies) for b in listed] == [(created.id, "Dune", 3)]


@pytest.mark.parametrize("copies", ["x", "3", -1, 0, 2.5, None])
def test_ac011_nfr010_bad_copies_rejected_and_nothing_saved(db_session: Session, copies) -> None:
    with pytest.raises(ValidationError) as e:
        BookIn(title="T", author="A", total_copies=copies)
    assert e.value.errors()[0]["loc"] == ("total_copies",)
    assert _count(db_session) == 0


@pytest.mark.parametrize("field", ["title", "author"])
@pytest.mark.parametrize("value", ["", "   "])
def test_ac011_nfr010_blank_text_rejected_and_nothing_saved(
    db_session: Session, field, value
) -> None:
    data = {"title": "T", "author": "A", "total_copies": 1, field: value}
    with pytest.raises(ValidationError) as e:
        BookIn(**data)
    assert e.value.errors()[0]["loc"] == (field,)
    assert _count(db_session) == 0


@pytest.mark.parametrize("token", [None, "", "not-a-valid-token"])
def test_nfr003_missing_or_invalid_token_is_401_and_saves_nothing(
    db_session: Session, token
) -> None:
    cred = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token) if token else None
    with pytest.raises(HTTPException) as e:
        get_current_user(cred, db_session)
    assert e.value.status_code == 401
    assert _count(db_session) == 0
