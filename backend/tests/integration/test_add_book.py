"""US-003: add a book (AC-010, AC-011, NFR-003, NFR-007, NFR-010)."""

import secrets

import pytest
from fastapi.testclient import TestClient


def _auth(client: TestClient) -> dict:
    creds = {"email": f"qa-{secrets.token_hex(4)}@example.com", "password": secrets.token_urlsafe()}
    assert client.post("/auth/signup", json=creds).status_code == 201
    r = client.post("/auth/signin", json=creds)
    assert r.status_code == 200
    token = r.json().get("token") or r.json().get("session_token") or r.json().get("access_token")
    assert token
    return {"Authorization": f"Bearer {token}"}


def test_ac010_add_book_all_copies_available(client: TestClient) -> None:
    h = _auth(client)
    r = client.post("/books", json={"title": "T", "author": "A", "total_copies": 3}, headers=h)
    assert r.status_code == 201
    assert r.json()["total_copies"] == 3 and r.json()["available_copies"] == 3
    listed = client.get("/books", headers=h).json()
    assert [b["title"] for b in listed] == ["T"]
    assert listed[0]["available_copies"] == 3


@pytest.mark.parametrize(
    ("body", "field"),
    [
        ({"title": "", "author": "A", "total_copies": 1}, "title"),
        ({"title": "T", "author": "", "total_copies": 1}, "author"),
        ({"title": "T", "author": "A", "total_copies": "abc"}, "total_copies"),
        ({"title": "T", "author": "A", "total_copies": -1}, "total_copies"),
        ({"title": "T", "author": "A", "total_copies": 0}, "total_copies"),
        ({"title": "T", "author": "A", "total_copies": 1.5}, "total_copies"),
    ],
)
def test_ac011_nfr010_invalid_book_names_field_and_saves_nothing(client, body, field) -> None:
    h = _auth(client)
    r = client.post("/books", json=body, headers=h)
    assert r.status_code == 422
    assert field in [e["field"] for e in r.json()["errors"]]
    assert client.get("/books", headers=h).json() == []


def test_nfr003_book_endpoints_need_sign_in(client: TestClient) -> None:
    body = {"title": "T", "author": "A", "total_copies": 1}
    assert client.post("/books", json=body).status_code == 401
    assert client.get("/books").status_code == 401


def test_nfr007_hundreds_of_books_listed(client: TestClient) -> None:
    h = _auth(client)
    for i in range(100):
        r = client.post(
            "/books", json={"title": f"B{i:03}", "author": "A", "total_copies": 1}, headers=h
        )
        assert r.status_code == 201
    assert len(client.get("/books", headers=h).json()) == 100
