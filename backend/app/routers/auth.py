"""Sign-up, sign-in and sign-out."""

import secrets
from datetime import UTC, datetime, timedelta
from typing import Annotated

from email_validator import EmailNotValidError, validate_email
from fastapi import APIRouter, Depends, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import get_settings
from app.database import get_db
from app.models import User
from app.security import hash_password, hash_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

DB = Annotated[Session, Depends(get_db)]
_DUMMY_HASH = hash_password("dummy-password-for-timing")


class Credentials(BaseModel):
    email: str
    password: str


def _error(status: int, detail: str, errors: list[dict[str, str]]) -> JSONResponse:
    return JSONResponse(status_code=status, content={"detail": detail, "errors": errors})


def normalise_email(email: str) -> str:
    return email.strip().lower()


@router.post("/signup", status_code=201)
def signup(body: Credentials, db: DB):
    email = normalise_email(body.email)
    errors: list[dict[str, str]] = []
    try:
        email = validate_email(email, check_deliverability=False).normalized.lower()
    except EmailNotValidError:
        errors.append({"field": "email", "message": "Enter a valid email address."})
    if not body.password.strip():
        errors.append({"field": "password", "message": "Enter a password."})
    if errors:
        return _error(422, "Validation failed", errors)
    exists = _error(409, "An account with this email already exists", [])
    if db.scalar(select(User.id).where(User.email == email)) is not None:
        return exists
    user = User(email=email, password_hash=hash_password(body.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return exists
    return {"id": str(user.id), "email": user.email}


@router.post("/signin")
def signin(body: Credentials, db: DB):
    user = db.scalar(select(User).where(User.email == normalise_email(body.email)))
    if user is None:
        verify_password(_DUMMY_HASH, body.password)
        ok = False
    else:
        ok = verify_password(user.password_hash, body.password)
    if user is None or not ok:
        return _error(401, "Invalid email or password", [])
    token = secrets.token_urlsafe(32)
    expires = datetime.now(UTC) + timedelta(hours=get_settings().session_ttl_hours)
    user.session_token_hash = hash_token(token)
    user.session_expires_at = expires
    db.commit()
    return {
        "token": token,
        "token_type": "bearer",
        "expires_at": expires.isoformat(),
        "user": {"id": str(user.id), "email": user.email},
    }


@router.post("/signout", status_code=204)
def signout(user: Annotated[User, Depends(get_current_user)], db: DB) -> Response:
    user.session_token_hash = None
    user.session_expires_at = None
    db.commit()
    return Response(status_code=204)
