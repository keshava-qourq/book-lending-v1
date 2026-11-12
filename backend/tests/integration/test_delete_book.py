"""US-005: delete a book (AC-015, AC-016, NFR-003, NFR-007, NFR-010)."""

import secrets

from fastapi.testclient import TestClient

MISSING = "00000000-0000-0000-0000-000000000001"


def _auth(client: TestClient) -> dict:
    creds = {"email": f"qa-{secrets.token_hex(4)}@example.com", "password": secrets.token_urlsafe()}
    assert client.post("/auth/signup", json=creds).status_code == 201
    r = client.post("/auth/signin", json=creds)
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['token']}"}


def _book(client: TestClient, h: dict, copies: int = 2, title: str = "Gone") -> dict:
    r = client.post(
        "/books", json={"title": title, "author": "Au", "total_copies": copies}, headers=h
    )
    assert r.status_code == 201
    return r.json()


def test_ac015_delete_without_loans_removes_from_get_list_and_search(client: TestClient) -> None:
    h = _auth(client)
    marker = f"Zq{secrets.token_hex(4)}"
    b = _book(client, h, title=f"Title {marker}")
    other = _book(client, h, title="Keeper")
    assert client.delete(f"/books/{b['id']}", headers=h).status_code == 204
    assert client.get(f"/books/{b['id']}", headers=h).status_code == 404
    assert [x["id"] for x in client.get("/books", headers=h).json()] == [other["id"]]
    assert client.get("/books", params={"q": marker}, headers=h).json() == []
    # deleting again is a clear 404
    assert client.delete(f"/books/{b['id']}", headers=h).status_code == 404


def test_ac015_delete_after_return_is_allowed(client: TestClient) -> None:
    h = _auth(client)
    b = _book(client, h)
    borrower = _auth(client)
    loan = client.post(f"/books/{b['id']}/borrow", headers=borrower)
    assert loan.status_code == 201
    assert client.delete(f"/books/{b['id']}", headers=h).status_code == 409
    assert client.post(f"/loans/{loan.json()['id']}/return", headers=borrower).status_code == 200
    assert client.delete(f"/books/{b['id']}", headers=h).status_code == 204
    assert client.get(f"/books/{b['id']}", headers=h).status_code == 404


def test_ac016_nfr010_delete_on_loan_refused_with_message_and_book_remains(
    client: TestClient,
) -> None:
    h = _auth(client)
    b = _book(client, h, copies=3)
    for _ in range(2):
        assert client.post(f"/books/{b['id']}/borrow", headers=_auth(client)).status_code == 201
    r = client.delete(f"/books/{b['id']}", headers=h)
    assert r.status_code == 409
    assert "on loan" in r.json()["detail"].lower()
    got = client.get(f"/books/{b['id']}", headers=h)
    assert got.status_code == 200
    assert (got.json()["total_copies"], got.json()["available_copies"]) == (3, 1)
    assert [x["id"] for x in client.get("/books", headers=h).json()] == [b["id"]]


def test_nfr010_delete_unknown_or_malformed_id_is_404(client: TestClient) -> None:
    h = _auth(client)
    r = client.delete(f"/books/{MISSING}", headers=h)
    assert r.status_code == 404
    assert r.json()["detail"]


def test_nfr003_delete_needs_sign_in_and_removes_nothing(client: TestClient) -> None:
    h = _auth(client)
    b = _book(client, h)
    assert client.delete(f"/books/{b['id']}").status_code == 401
    bad = {"Authorization": f"Bearer {secrets.token_urlsafe(16)}"}
    assert client.delete(f"/books/{b['id']}", headers=bad).status_code == 401
    assert client.get(f"/books/{b['id']}", headers=h).status_code == 200


def test_nfr007_delete_among_hundred_books(client: TestClient) -> None:
    h = _auth(client)
    ids = [_book(client, h, 1, f"B{i:03}")["id"] for i in range(100)]
    assert client.delete(f"/books/{ids[50]}", headers=h).status_code == 204
    listed = client.get("/books", headers=h).json()
    assert len(listed) == 99 and ids[50] not in [b["id"] for b in listed]
