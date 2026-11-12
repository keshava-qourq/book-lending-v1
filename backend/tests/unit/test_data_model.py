import uuid
from datetime import UTC, date, datetime, timedelta

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel
from sqlalchemy import inspect
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import Base, engine
from app.main import app
from app.models import Book, Loan, User, is_overdue


def test_ac035_exact_table_set() -> None:
    assert set(Base.metadata.tables) == {"users", "books", "loans"}
    names = set(inspect(engine).get_table_names()) - {"alembic_version"}
    assert names == {"users", "books", "loans"}


def test_ac036_unique_email(db_session: Session) -> None:
    db_session.add(User(email="a@example.com", password_hash="h"))
    db_session.commit()
    db_session.add(User(email="a@example.com", password_hash="h"))
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_ac037_available_copies_check(db_session: Session) -> None:
    db_session.add(Book(title="t", author="a", total_copies=1, available_copies=2))
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_ac037_loan_indexes() -> None:
    cols = [i["column_names"] for i in inspect(engine).get_indexes("loans")]
    indexed = {c for cs in cols for c in cs}
    assert {"book_id", "user_id"} <= indexed


def _loan(due, returned=None) -> Loan:
    return Loan(user_id=uuid.uuid4(), book_id=uuid.uuid4(), due_date=due, returned_at=returned)


def test_ac038_is_overdue() -> None:
    now = datetime.now(UTC)
    past = date.today() - timedelta(days=1)
    assert is_overdue(_loan(past), now)
    assert not is_overdue(_loan(past, returned=now), now)
    assert not is_overdue(_loan(date.today() + timedelta(days=1)), now)


class _Body(BaseModel):
    email: str


def test_nfr010_error_shape() -> None:
    @app.post("/_t_validate")
    def _v(body: _Body) -> dict:
        return {}

    @app.get("/_t_http")
    def _h() -> dict:
        raise HTTPException(status_code=409, detail="nope")

    c = TestClient(app)
    r = c.post("/_t_validate", json={})
    assert r.status_code == 422
    assert r.json()["errors"][0]["field"] == "email"
    assert isinstance(r.json()["detail"], str)
    r = c.get("/_t_http")
    assert r.status_code == 409
    assert r.json() == {"detail": "nope", "errors": []}
    r = c.get("/missing")
    assert r.status_code == 404 and r.json()["errors"] == []
