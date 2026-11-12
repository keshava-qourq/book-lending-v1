"""Sign-up through POST /auth/signup: AC-001..AC-004, NFR-001, NFR-006, NFR-010."""

import secrets

from fastapi.testclient import TestClient
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.models import User


def _user() -> dict[str, str]:
    return {
        "email": f"qa-{secrets.token_hex(6)}@example.com",
        "password": secrets.token_urlsafe(16),
    }


def _count(db: Session) -> int:
    return db.scalar(select(func.count()).select_from(User))


def test_ac001_signup_then_signin_returns_token(client: TestClient) -> None:
    u = _user()
    assert client.post("/auth/signup", json=u).status_code == 201
    r = client.post("/auth/signin", json=u)
    assert r.status_code == 200
    assert r.json()["token"]


def test_ac002_duplicate_email_other_case_rejected(client: TestClient, db_session: Session) -> None:
    u = _user()
    assert client.post("/auth/signup", json=u).status_code == 201
    other = {"email": u["email"].upper(), "password": secrets.token_urlsafe(16)}
    r = client.post("/auth/signup", json=other)
    assert r.status_code == 409
    assert "already exists" in r.json()["detail"]
    assert _count(db_session) == 1
    assert client.post("/auth/signin", json=u).status_code == 200
    assert client.post("/auth/signin", json=other).status_code == 401


def test_ac003_nfr010_invalid_email_names_field(client: TestClient, db_session: Session) -> None:
    r = client.post(
        "/auth/signup", json={"email": "not-an-email", "password": secrets.token_urlsafe(16)}
    )
    assert r.status_code == 422
    fields = [e["field"] for e in r.json()["errors"]]
    assert fields == ["email"]
    assert all(e["message"] for e in r.json()["errors"])
    assert _count(db_session) == 0


def test_ac003_nfr010_empty_password_names_field(client: TestClient, db_session: Session) -> None:
    for pw in ("", "   "):
        r = client.post("/auth/signup", json={"email": _user()["email"], "password": pw})
        assert r.status_code == 422
        assert [e["field"] for e in r.json()["errors"]] == ["password"]
    assert _count(db_session) == 0


def test_ac003_both_invalid_names_both_fields(client: TestClient, db_session: Session) -> None:
    r = client.post("/auth/signup", json={"email": "x", "password": ""})
    assert r.status_code == 422
    assert sorted(e["field"] for e in r.json()["errors"]) == ["email", "password"]
    assert _count(db_session) == 0


def test_ac004_nfr001_password_stored_as_argon2_hash(
    client: TestClient, db_session: Session
) -> None:
    u = _user()
    assert client.post("/auth/signup", json=u).status_code == 201
    stored = db_session.execute(
        text("SELECT password_hash FROM users WHERE email = :e"), {"e": u["email"]}
    ).scalar_one()
    assert stored.startswith("$argon2")
    assert stored != u["password"]
    assert u["password"] not in stored


def test_nfr006_signup_response_only_id_and_email(client: TestClient) -> None:
    u = _user()
    r = client.post("/auth/signup", json=u)
    assert r.status_code == 201
    body = r.json()
    assert sorted(body) == ["email", "id"]
    assert body["email"] == u["email"]
    assert u["password"] not in r.text


def test_nfr007_several_users_sign_up_and_sign_in_side_by_side(
    client: TestClient, db_session: Session
) -> None:
    """NFR-007: a small library's handful of users coexist (no load test)."""
    users = [_user() for _ in range(5)]
    for u in users:
        assert client.post("/auth/signup", json=u).status_code == 201
    assert _count(db_session) == 5
    for u in users:
        assert client.post("/auth/signin", json=u).status_code == 200


def test_nfr006_users_table_holds_no_extra_personal_data(db_session: Session) -> None:
    cols = {
        row[0]
        for row in db_session.execute(
            text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name = 'users'"
            )
        )
    }
    assert cols == {
        "id",
        "email",
        "password_hash",
        "session_token_hash",
        "session_expires_at",
        "created_at",
    }
