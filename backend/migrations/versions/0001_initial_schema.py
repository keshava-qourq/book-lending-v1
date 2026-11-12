"""Initial schema: users, books and loans.

Revision ID: 0001
Revises:
Create Date: 2026-11-12
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("email", sa.String(254), nullable=False, unique=True),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("session_token_hash", sa.CHAR(64), nullable=True, unique=True),
        sa.Column("session_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.CheckConstraint("email = lower(email)", name="ck_users_email_lowercase"),
    )
    op.create_table(
        "books",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("author", sa.String(200), nullable=False),
        sa.Column("total_copies", sa.Integer(), nullable=False),
        sa.Column("available_copies", sa.Integer(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.CheckConstraint("total_copies >= 1", name="ck_books_total_copies"),
        sa.CheckConstraint(
            "available_copies >= 0 AND available_copies <= total_copies",
            name="ck_books_available_copies",
        ),
    )
    op.create_table(
        "loans",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "book_id", sa.Uuid(), sa.ForeignKey("books.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column(
            "borrowed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("returned_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "uq_loans_active_user_book",
        "loans",
        ["user_id", "book_id"],
        unique=True,
        postgresql_where=sa.text("returned_at IS NULL"),
        sqlite_where=sa.text("returned_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("uq_loans_active_user_book", table_name="loans")
    op.drop_table("loans")
    op.drop_table("books")
    op.drop_table("users")
