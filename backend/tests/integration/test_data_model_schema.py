"""US-012: stored data model (AC-035..AC-038, NFR-006, NFR-007, NFR-009)."""

import secrets

from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session


def _cols(db: Session, table: str) -> set[str]:
    rows = db.execute(
        text("SELECT column_name FROM information_schema.columns WHERE table_name = :t"),
        {"t": table},
    )
    return {r[0] for r in rows}


def _auth(client: TestClient) -> tuple[dict, dict]:
    creds = {"email": f"qa-{secrets.token_hex(5)}@example.com", "password": secrets.token_urlsafe()}
    assert client.post("/auth/signup", json=creds).status_code == 201
    r = client.post("/auth/signin", json=creds)
    assert r.status_code == 200
    return creds, {"Authorization": f"Bearer {r.json()['token']}"}


def test_ac035_nfr009_exactly_three_tables(db_session: Session) -> None:
    names = {
        r[0]
        for r in db_session.execute(
            text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        )
    } - {"alembic_version"}
    assert names == {"users", "books", "loans"}


def test_ac036_nfr006_users_personal_data_and_unique_email(
    client: TestClient, db_session: Session
) -> None:
    cols = _cols(db_session, "users")
    assert {"email", "password_hash"} <= cols
    personal = {"name", "first_name", "last_name", "phone", "address", "birthdate", "ip_address"}
    assert not (cols & personal)
    creds, _ = _auth(client)
    dup = client.post(
        "/auth/signup", json={"email": creds["email"].upper(), "password": secrets.token_urlsafe()}
    )
    assert dup.status_code == 409
    count = db_session.execute(
        text("SELECT count(*) FROM users WHERE lower(email) = :e"), {"e": creds["email"]}
    ).scalar_one()
    assert count == 1


def test_ac037_books_and_loans_columns(db_session: Session) -> None:
    assert {"title", "author", "total_copies", "available_copies"} <= _cols(db_session, "books")
    assert {"user_id", "book_id", "due_date", "returned_at"} <= _cols(db_session, "loans")
    loans = _cols(db_session, "loans")
    assert any(c in loans for c in ("borrowed_at", "borrow_date", "created_at"))


def test_ac038_nfr009_overdue_derived_at_read_time(
    client: TestClient, db_session: Session
) -> None:
    loans = _cols(db_session, "loans")
    assert not any("overdue" in c or c == "status" for c in loans)
    for t in ("users", "books"):
        assert not any("overdue" in c for c in _cols(db_session, t))

    _, h = _auth(client)
    b = client.post("/books", json={"title": "T", "author": "A", "total_copies": 1}, headers=h)
    assert b.status_code == 201
    loan = client.post(f"/books/{b.json()['id']}/borrow", headers=h)
    assert loan.status_code == 201
    cur = client.get("/loans/me", headers=h).json()
    assert [x["is_overdue"] for x in cur["current"]] == [False]
    assert cur["overdue"] == []

    db_session.execute(text("UPDATE loans SET due_date = CURRENT_DATE - 3"))
    db_session.commit()
    cur = client.get("/loans/me", headers=h).json()
    assert [x["is_overdue"] for x in cur["current"]] == [True]
    assert len(cur["overdue"]) == 1

    assert client.post(f"/loans/{loan.json()['id']}/return", headers=h).status_code == 200
    cur = client.get("/loans/me", headers=h).json()
    assert cur["overdue"] == []


def test_nfr007_thousand_books_listed(client: TestClient, db_session: Session) -> None:
    _, h = _auth(client)
    db_session.execute(
        text(
            "INSERT INTO books (id, title, author, total_copies, available_copies) "
            "SELECT gen_random_uuid(), 'Bulk ' || g, 'A', 1, 1 FROM generate_series(1, 1000) g"
        )
    )
    db_session.commit()
    r = client.get("/books", headers=h)
    assert r.status_code == 200
    assert len(r.json()) == 1000
