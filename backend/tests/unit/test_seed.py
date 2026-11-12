import secrets

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import Settings
from app.models import User
from app.security import verify_password
from app.seed import seed_users


def _settings(**kw) -> Settings:
    base = dict(
        allowed_origins=[],
        bootstrap_admin_email=None,
        bootstrap_admin_password=None,
        smoke_test_email=None,
        smoke_test_password=None,
    )
    base.update(kw)
    return Settings(**base)


def test_seeds_nothing_without_settings(db_session: Session) -> None:
    seed_users(db_session, _settings())

    assert db_session.scalar(select(func.count()).select_from(User)) == 0


def test_seeds_each_user_once(db_session: Session) -> None:
    password = secrets.token_urlsafe()
    settings = _settings(
        bootstrap_admin_email="Admin@Example.com",
        bootstrap_admin_password=password,
        smoke_test_email="smoke@example.com",
        smoke_test_password=secrets.token_urlsafe(),
    )

    seed_users(db_session, settings)
    seed_users(db_session, settings)

    emails = set(db_session.scalars(select(User.email)))
    assert emails == {"admin@example.com", "smoke@example.com"}
    admin = db_session.scalar(select(User).where(User.email == "admin@example.com"))
    assert verify_password(admin.password_hash, password)
