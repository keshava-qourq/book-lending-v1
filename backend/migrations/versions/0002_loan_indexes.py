"""Ensure plain indexes on loans.user_id and loans.book_id exist."""

import sqlalchemy as sa
from alembic import op

revision = "0002_loan_indexes"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    existing = {i["name"] for i in sa.inspect(op.get_bind()).get_indexes("loans")}
    if "ix_loans_user_id" not in existing:
        op.create_index("ix_loans_user_id", "loans", ["user_id"])
    if "ix_loans_book_id" not in existing:
        op.create_index("ix_loans_book_id", "loans", ["book_id"])


def downgrade() -> None:
    pass
