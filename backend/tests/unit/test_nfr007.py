import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import Base


def test_nfr007_small_library_plain_schema() -> None:
    """Sized for a small library: three tables, plain indexes, no extra infrastructure."""
    assert set(Base.metadata.tables) == {"users", "books", "loans"}
    for table in Base.metadata.tables.values():
        for index in table.indexes:
            if index.name != "uq_loans_active_user_book":
                assert not index.unique or len(index.columns) == 1


def test_ac009_invalid_token_is_rejected(db_session: Session) -> None:
    cred = HTTPAuthorizationCredentials(scheme="Bearer", credentials="not-a-real-token")
    with pytest.raises(HTTPException) as e:
        get_current_user(cred, db_session)
    assert e.value.status_code == 401
