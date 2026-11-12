"""Sign-in, sign-out, route protection, expiry: AC-005..AC-009, NFR-001..004, NFR-007."""

import secrets

from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session


def _user() -> dict[str, str]:
    return {
        "email": f"qa-{secrets.token_hex(6)}@example.com",
        "password": secrets.token_urlsafe(16),
    }


def _signed_in(client: TestClient) -> tuple[dict[str, str], str]:
    u = _user()
    assert client.post("/auth/signup", json=u).status_code == 201
    r = client.post("/auth/signin", json=u)
    assert r.status_code == 200
    return u, r.json()["token"]


def _h(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_ac005_signin_returns_opaque_token_in_body(client: TestClient) -> None:
    u, token = _signed_in(client)
    assert token
    assert u["password"] not in token
    assert client.get("/books", headers=_h(token)).status_code == 200


def test_ac006_nfr004_wrong_password_and_unknown_email_identical(client: TestClient) -> None:
    u = _user()
    assert client.post("/auth/signup", json=u).status_code == 201
    wrong = client.post("/auth/signin", json={**u, "password": secrets.token_urlsafe(16)})
    unknown = client.post("/auth/signin", json=_user())
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()
    assert wrong.json()["detail"] == "Invalid email or password"
    assert "token" not in wrong.json()


def test_ac007_nfr002_signout_invalidates_token(client: TestClient) -> None:
    _, token = _signed_in(client)
    assert client.post("/auth/signout", headers=_h(token)).status_code == 204
    assert client.post("/auth/signout", headers=_h(token)).status_code == 401
    assert client.get("/books", headers=_h(token)).status_code == 401
    assert client.get("/loans/me", headers=_h(token)).status_code == 401


def test_ac008_nfr003_unauthenticated_requests_return_401(client: TestClient) -> None:
    some_id = "00000000-0000-0000-0000-000000000001"
    body = {"title": "t", "author": "a", "total_copies": 1}
    responses = [
        client.get("/books"),
        client.post("/books", json=body),
        client.post(f"/books/{some_id}/borrow"),
        client.post(f"/loans/{some_id}/return"),
        client.get("/loans/me"),
        client.post("/auth/signout"),
    ]
    assert [r.status_code for r in responses] == [401] * len(responses)


def test_ac008_nfr003_malformed_and_garbage_tokens_return_401(client: TestClient) -> None:
    assert client.get("/books", headers={"Authorization": "Bearer "}).status_code == 401
    assert client.get("/books", headers={"Authorization": "Basic abc"}).status_code == 401
    assert client.get("/books", headers=_h(secrets.token_urlsafe(24))).status_code == 401


def test_ac009_nfr002_expired_session_returns_401(client: TestClient, db_session: Session) -> None:
    u, token = _signed_in(client)
    assert client.get("/books", headers=_h(token)).status_code == 200
    db_session.execute(
        text(
            "UPDATE users SET session_expires_at = now() - interval '1 minute' "
            "WHERE email = :e"
        ),
        {"e": u["email"]},
    )
    db_session.commit()
    db_session.expire_all()
    assert client.get("/books", headers=_h(token)).status_code == 401
    assert client.get("/loans/me", headers=_h(token)).status_code == 401
    assert client.post("/auth/signout", headers=_h(token)).status_code == 401
    # signing in again gives a working session
    r = client.post("/auth/signin", json=u)
    assert r.status_code == 200
    assert client.get("/books", headers=_h(r.json()["token"])).status_code == 200


def test_nfr002_session_has_future_expiry(client: TestClient, db_session: Session) -> None:
    u, _ = _signed_in(client)
    ok = db_session.execute(
        text("SELECT session_expires_at > now() FROM users WHERE email = :e"), {"e": u["email"]}
    ).scalar_one()
    assert ok is True


def test_nfr001_token_and_password_not_stored_in_plain(
    client: TestClient, db_session: Session
) -> None:
    u, token = _signed_in(client)
    row = db_session.execute(
        text("SELECT password_hash, session_token_hash FROM users WHERE email = :e"),
        {"e": u["email"]},
    ).one()
    assert row[0].startswith("$argon2")
    assert u["password"] not in row[0]
    assert row[1] and row[1] != token and token not in row[1]


def test_nfr007_signin_for_several_users_keeps_sessions_independent(client: TestClient) -> None:
    pairs = [_signed_in(client) for _ in range(5)]
    # one user per row holds one session: the latest token of each works
    for _, token in pairs:
        assert client.get("/books", headers=_h(token)).status_code == 200
