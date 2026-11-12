"""Opaque bearer-token sessions: the get_current_user dependency protected routes use."""

from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.security import hash_token

_bearer = HTTPBearer(auto_error=False)


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=401,
        detail="Authentication required. Please sign in.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """401 for a missing, malformed, unknown, signed-out or expired token."""
    if credentials is None or not credentials.credentials:
        raise _unauthorized()
    user = db.scalar(
        select(User).where(User.session_token_hash == hash_token(credentials.credentials))
    )
    if user is None or user.session_expires_at is None:
        raise _unauthorized()
    expires = user.session_expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=UTC)
    if expires <= datetime.now(UTC):
        raise _unauthorized()
    return user
