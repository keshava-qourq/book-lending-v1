"""Engine, session factory and the request-scoped session dependency.

PostgreSQL only: the migrations, the partial index and the tests all assume it.
`DATABASE_URL` must be set (see ENVIRONMENT.md).
"""

import os
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# Import never connects; without DATABASE_URL the engine is a placeholder that fails on first use.
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+psycopg://")

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Declarative base that every generated model inherits."""


def get_db() -> Iterator[Session]:
    """One session per request, closed even when the handler raises."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
