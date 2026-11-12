"""US-004: edit a book (AC-012, AC-013, AC-014, NFR-003, NFR-007, NFR-010)."""

import secrets

from fastapi.testclient import TestClient


def _auth(client: TestClient) -> dict:
    creds = {"email": f"qa-{secrets.token_hex(4)}@example.com", "password": secrets.token_urlsafe()}
    assert client.post("/auth/signup", json=creds).status_code == 201
    r = client.post("/auth/signin", json=creds)
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['token']}"}


def _book(client: TestClient, h: dict, copies: int = 3, title: str = "Old") -> dict:
    body = {"title": title, "author": "Au", "total_copies": copies}
    r = client.post("/books", json=body, headers=h)
    assert r.status_code == 201
    return r.json()


def _borrow(client: TestClient, book_id: str, n: int) -> None:
    for _ in range(n):
        assert client.post(f"/books/{book_id}/borrow", headers=_auth(client)).status_code == 201


def test_ac012_edit_saved_and_shown_in_list_and_search(client: TestClient) -> None:
    h = _auth(client)
    b = _book(client, h)
    marker = f"Zq{secrets.token_hex(4)}"
    body = {"title": f"New {marker}", "author": "Other Author", "total_copies": 5}
    r = client.put(f"/books/{b['id']}", json=body, headers=h)
    assert r.status_code == 200
    assert (r.json()["title"], r.json()["author"], r.json()["total_copies"]) == (
        body["title"],
        "Other Author",
        5,
    )
    assert r.json()["available_copies"] == 5
    got = client.get(f"/books/{b['id']}", headers=h).json()
    assert got["title"] == body["title"]
    listed = client.get("/books", headers=h).json()
    assert [x["title"] for x in listed] == [body["title"]]
    found = client.get("/books", params={"q": marker}, headers=h).json()
    assert [x["id"] for x in found] == [b["id"]]


def test_ac013_nfr010_copies_below_on_loan_rejected(client: TestClient) -> None:
    h = _auth(client)
    b = _book(client, h, copies=3)
    _borrow(client, b["id"], 2)
    r = client.put(
        f"/books/{b['id']}", json={"title": "X", "author": "Y", "total_copies": 1}, headers=h
    )
    assert r.status_code == 409
    msg = r.json()["detail"].lower()
    assert "copies" in msg and "below" in msg and "on loan" in msg
    got = client.get(f"/books/{b['id']}", headers=h).json()
    assert (got["title"], got["total_copies"], got["available_copies"]) == ("Old", 3, 1)
    # equal to the number on loan is allowed
    r = client.put(
        f"/books/{b['id']}", json={"title": "Old", "author": "Au", "total_copies": 2}, headers=h
    )
    assert r.status_code == 200 and r.json()["available_copies"] == 0


def test_ac014_increase_copies_raises_available_by_same_amount(client: TestClient) -> None:
    h = _auth(client)
    b = _book(client, h, copies=3)
    _borrow(client, b["id"], 2)
    r = client.put(
        f"/books/{b['id']}", json={"title": "Old", "author": "Au", "total_copies": 6}, headers=h
    )
    assert r.status_code == 200
    assert r.json()["total_copies"] == 6 and r.json()["available_copies"] == 4


def test_ac012_nfr010_invalid_edit_names_field_and_changes_nothing(client: TestClient) -> None:
    h = _auth(client)
    b = _book(client, h)
    for body, field in [
        ({"title": "", "author": "A", "total_copies": 1}, "title"),
        ({"title": "T", "author": "", "total_copies": 1}, "author"),
        ({"title": "T", "author": "A", "total_copies": 0}, "total_copies"),
        ({"title": "T", "author": "A", "total_copies": "abc"}, "total_copies"),
    ]:
        r = client.put(f"/books/{b['id']}", json=body, headers=h)
        assert r.status_code == 422
        assert field in [e["field"] for e in r.json()["errors"]]
    assert client.get(f"/books/{b['id']}", headers=h).json()["title"] == "Old"


def test_nfr010_edit_unknown_book_is_404(client: TestClient) -> None:
    h = _auth(client)
    r = client.put(
        "/books/00000000-0000-0000-0000-000000000001",
        json={"title": "T", "author": "A", "total_copies": 1},
        headers=h,
    )
    assert r.status_code == 404


def test_nfr003_edit_needs_sign_in_and_changes_nothing(client: TestClient) -> None:
    h = _auth(client)
    b = _book(client, h)
    body = {"title": "Hacked", "author": "A", "total_copies": 9}
    assert client.put(f"/books/{b['id']}", json=body).status_code == 401
    bad = {"Authorization": f"Bearer {secrets.token_urlsafe(16)}"}
    assert client.put(f"/books/{b['id']}", json=body, headers=bad).status_code == 401
    assert client.get(f"/books/{b['id']}", headers=h).json()["title"] == "Old"


def test_nfr007_edit_among_hundred_books(client: TestClient) -> None:
    h = _auth(client)
    ids = [_book(client, h, 1, f"B{i:03}")["id"] for i in range(100)]
    r = client.put(
        f"/books/{ids[50]}", json={"title": "Edited", "author": "A", "total_copies": 2}, headers=h
    )
    assert r.status_code == 200
    listed = client.get("/books", headers=h).json()
    assert len(listed) == 100 and "Edited" in [b["title"] for b in listed]
