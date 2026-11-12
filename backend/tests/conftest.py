"""Test fixtures: the real database `DATABASE_URL` names, emptied around every test.

The schema is built by the migrations (the only way it changes), once per run. Each
test then starts from empty tables, so no test depends on another's rows or on the
order they run in. The `get_db` override makes the application use the test's session.
"""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session, sessionmaker

from app import models  # noqa: F401 -- imported so the tables register on Base.metadata
from app.database import Base, engine, get_db
from app.main import app
from app.migrate import run_migrations


@pytest.fixture(scope="session", autouse=True)
def _schema() -> None:
    run_migrations()


def _empty_tables() -> None:
    names = ", ".join(f'"{t.name}"' for t in reversed(Base.metadata.sorted_tables))
    with engine.begin() as conn:
        if engine.dialect.name == "postgresql":
            conn.execute(text(f"TRUNCATE {names} CASCADE"))
        else:
            for table in reversed(Base.metadata.sorted_tables):
                conn.execute(table.delete())


@pytest.fixture
def db_session() -> Iterator[Session]:
    """An empty database around one test."""
    _empty_tables()
    session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)()
    try:
        yield session
    finally:
        session.close()
        _empty_tables()


@pytest.fixture
def client(db_session: Session) -> Iterator[TestClient]:
    """The application, talking to this test's database and nothing else."""

    def _get_db() -> Iterator[Session]:
        yield db_session

    app.dependency_overrides[get_db] = _get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()
