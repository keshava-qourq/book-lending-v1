"""Settings read from the environment, each with a working local default."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    allowed_origins: list[str]
    bootstrap_admin_email: str | None
    bootstrap_admin_password: str | None
    smoke_test_email: str | None
    smoke_test_password: str | None
    session_ttl_hours: float = 8


def get_settings() -> Settings:
    """Read at call time so a test can set the variables after import."""
    origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
    return Settings(
        allowed_origins=origins,
        bootstrap_admin_email=os.getenv("BOOTSTRAP_ADMIN_EMAIL") or None,
        bootstrap_admin_password=os.getenv("BOOTSTRAP_ADMIN_PASSWORD") or None,
        smoke_test_email=os.getenv("SMOKE_TEST_EMAIL") or None,
        smoke_test_password=os.getenv("SMOKE_TEST_PASSWORD") or None,
        session_ttl_hours=float(os.getenv("SESSION_TTL_HOURS") or 8),
    )
