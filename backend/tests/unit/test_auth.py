import secrets
from datetime import UTC, datetime, timedelta

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.models import User
from app.routers.auth import Credentials, signin, signout, signup
from app.security import verify_password


def _creds(email: str, password: str):
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=password)


def test_ac001_ac002_ac004_signup_hashes_and_rejects_duplicates(db_session: Session) -> None:
    pw = secrets.token_urlsafe()
    r = signup(Credentials(email=" A@Example.com ", password=pw), db_session)
    assert r["email"] == "a@example.com"
    row = db_session.scalar(select(User))
    assert row.password_hash != pw and verify_password(row.password_hash, pw)
    dup = signup(Credentials(email="a@EXAMPLE.com", password=pw), db_session)
    assert dup.status_code == 409
    assert db_session.scalar(select(func.count()).select_from(User)) == 1


def test_ac003_invalid_input_422(db_session: Session) -> None:
    r = signup(Credentials(email="nope", password="  "), db_session)
    assert r.status_code == 422
    assert db_session.scalar(select(func.count()).select_from(User)) == 0


def test_ac005_ac006_ac007_ac008_ac009_session_lifecycle(db_session: Session) -> None:
    pw = secrets.token_urlsafe()
    signup(Credentials(email="a@example.com", password=pw), db_session)
    bad = signin(Credentials(email="a@example.com", password="x" + pw), db_session)
    unknown = signin(Credentials(email="z@example.com", password=pw), db_session)
    assert bad.status_code == unknown.status_code == 401
    assert bad.body == unknown.body
    out = signin(Credentials(email="A@example.com", password=pw), db_session)
    token = out["token"]
    row = db_session.scalar(select(User))
    assert row.session_token_hash != token
    cred = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    user = get_current_user(cred, db_session)
    row.session_expires_at = datetime.now(UTC) - timedelta(seconds=1)
    db_session.commit()
    with pytest.raises(HTTPException) as e:
        get_current_user(cred, db_session)
    assert e.value.status_code == 401
    row.session_expires_at = datetime.now(UTC) + timedelta(hours=1)
    db_session.commit()
    assert signout(user, db_session).status_code == 204
    for c in (cred, None):
        with pytest.raises(HTTPException) as e:
            get_current_user(c, db_session)
        assert e.value.status_code == 401
