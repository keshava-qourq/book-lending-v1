"""US-009: mark a loan returned (AC-026, AC-027, AC-028, NFR-003, NFR-005, NFR-007, NFR-008)."""

import secrets

from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

MISSING = "00000000-0000-0000-0000-000000000001"


def _auth(client: TestClient) -> dict:
    creds = {"email": f"qa-{secrets.token_hex(5)}@example.com", "password": secrets.token_urlsafe()}
    assert client.post("/auth/signup", json=creds).status_code == 201
    r = client.post("/auth/signin", json=creds)
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['token']}"}


def _book(client: TestClient, h: dict, copies: int = 2) -> str:
    r = client.post("/books", json={"title": "T", "author": "A", "total_copies": copies}, headers=h)
    assert r.status_code == 201
    return r.json()["id"]


def _avail(client: TestClient, h: dict, book_id: str) -> int:
    return client.get(f"/books/{book_id}", headers=h).json()["available_copies"]


def test_ac026_return_records_date_and_increases_available(
    client: TestClient, db_session: Session
) -> None:
    h = _auth(client)
    book = _book(client, h, 2)
    loan = client.post(f"/books/{book}/borrow", headers=h)
    assert loan.status_code == 201
    assert _avail(client, h, book) == 1
    r = client.post(f"/loans/{loan.json()['id']}/return", headers=h)
    assert r.status_code == 200
    assert _avail(client, h, book) == 2
    stored = db_session.execute(
        text("SELECT returned_at FROM loans WHERE id = :i"), {"i": loan.json()["id"]}
    ).scalar_one()
    assert stored is not None
    cur = client.get("/loans/me", headers=h).json()
    assert cur["current"] == []


def test_ac027_nfr008_second_return_does_not_add_copy_again(client: TestClient) -> None:
    h = _auth(client)
    book = _book(client, h, 2)
    loan_id = client.post(f"/books/{book}/borrow", headers=h).json()["id"]
    assert client.post(f"/loans/{loan_id}/return", headers=h).status_code == 200
    again = client.post(f"/loans/{loan_id}/return", headers=h)
    assert again.status_code in (200, 409)
    assert _avail(client, h, book) == 2


def test_ac028_nfr005_other_users_loan_refused_and_unchanged(
    client: TestClient, db_session: Session
) -> None:
    owner, other = _auth(client), _auth(client)
    book = _book(client, owner, 2)
    loan_id = client.post(f"/books/{book}/borrow", headers=owner).json()["id"]
    r = client.post(f"/loans/{loan_id}/return", headers=other)
    assert r.status_code in (403, 404)
    assert _avail(client, owner, book) == 1
    stored = db_session.execute(
        text("SELECT returned_at FROM loans WHERE id = :i"), {"i": loan_id}
    ).scalar_one()
    assert stored is None
    assert len(client.get("/loans/me", headers=owner).json()["current"]) == 1
    assert client.get("/loans/me", headers=other).json()["current"] == []


def test_ac026_unknown_loan_is_404(client: TestClient) -> None:
    h = _auth(client)
    assert client.post(f"/loans/{MISSING}/return", headers=h).status_code == 404


def test_nfr003_return_needs_sign_in_and_changes_nothing(client: TestClient) -> None:
    h = _auth(client)
    book = _book(client, h, 1)
    loan_id = client.post(f"/books/{book}/borrow", headers=h).json()["id"]
    assert client.post(f"/loans/{loan_id}/return").status_code == 401
    bad = {"Authorization": f"Bearer {secrets.token_urlsafe(16)}"}
    assert client.post(f"/loans/{loan_id}/return", headers=bad).status_code == 401
    assert _avail(client, h, book) == 0


def test_nfr007_many_loans_returned_side_by_side(client: TestClient) -> None:
    h = _auth(client)
    book = _book(client, h, 10)
    users = [_auth(client) for _ in range(10)]
    ids = [client.post(f"/books/{book}/borrow", headers=u).json()["id"] for u in users]
    assert _avail(client, h, book) == 0
    for u, i in zip(users, ids, strict=True):
        assert client.post(f"/loans/{i}/return", headers=u).status_code == 200
    assert _avail(client, h, book) == 10
