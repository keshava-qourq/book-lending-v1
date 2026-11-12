"""Startup seeding of the first users, from settings; nothing is seeded when unset."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.models import User
from app.security import hash_password


def _ensure_user(db: Session, email: str | None, password: str | None) -> None:
    if not email or not password:
        return
    email = email.strip().lower()
    if db.scalar(select(User.id).where(User.email == email)) is None:
        db.add(User(email=email, password_hash=hash_password(password)))
        db.commit()


def seed_users(db: Session, settings: Settings | None = None) -> None:
    """Create the bootstrap admin and the smoke-test user, each only when missing.

    The app has no roles, so both are ordinary users.
    """
    settings = settings or get_settings()
    _ensure_user(db, settings.bootstrap_admin_email, settings.bootstrap_admin_password)
    _ensure_user(db, settings.smoke_test_email, settings.smoke_test_password)
