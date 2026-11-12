"""Password hashing (argon2). Session tokens are opaque and stored only as sha256."""

import hashlib

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerificationError, InvalidHashError):
        return False


def hash_token(token: str) -> str:
    """sha256 hex (64 chars) of a session token, the form stored in users.session_token_hash."""
    return hashlib.sha256(token.encode()).hexdigest()
