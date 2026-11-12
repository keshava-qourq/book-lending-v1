"""Apply migrations programmatically (used at startup and by the test suite)."""

from pathlib import Path

from alembic import command
from alembic.config import Config

_BACKEND = Path(__file__).resolve().parent.parent


def run_migrations() -> None:
    cfg = Config(str(_BACKEND / "alembic.ini"))
    cfg.set_main_option("script_location", str(_BACKEND / "migrations"))
    command.upgrade(cfg, "head")
