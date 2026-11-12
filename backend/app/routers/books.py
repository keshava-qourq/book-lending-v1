"""Books and loans: CRUD, search, borrow, return and the loans dashboard, all behind sign-in."""

import uuid
from datetime import UTC, date, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field, StrictInt, StringConstraints
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Book, Loan, User, is_overdue

router = APIRouter(tags=["books"], dependencies=[Depends(get_current_user)])

DB = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]
Title = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=300)]
Author = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]


class BookIn(BaseModel):
    title: Title
    author: Author
    total_copies: Annotated[StrictInt, Field(ge=1)]


class BookOut(BaseModel):
    id: uuid.UUID
    title: str
    author: str
    total_copies: int
    available_copies: int


def _active_loans(db: Session, book_id: uuid.UUID) -> int:
    return db.scalar(
        select(func.count())
        .select_from(Loan)
        .where(Loan.book_id == book_id, Loan.returned_at.is_(None))
    )


def _find(db: Session, book_id: str, lock: bool = False) -> Book:
    """Fetch a book; lock=True takes SELECT ... FOR UPDATE on its row."""
    try:
        book = db.get(Book, uuid.UUID(book_id), with_for_update=lock)
    except ValueError:
        book = None
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.get("/books", response_model=list[BookOut])
def list_books(db: DB, q: str | None = None, available_only: bool = False):
    stmt = select(Book).order_by(Book.title, Book.id)
    if q and q.strip():
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(Book.title.ilike(like), Book.author.ilike(like)))
    if available_only:
        stmt = stmt.where(Book.available_copies > 0)
    return db.scalars(stmt).all()


@router.post("/books", status_code=201, response_model=BookOut)
def create_book(body: BookIn, db: DB):
    book = Book(
        title=body.title,
        author=body.author,
        total_copies=body.total_copies,
        available_copies=body.total_copies,
    )
    db.add(book)
    db.commit()
    return book


@router.get("/books/{book_id}", response_model=BookOut)
def get_book(book_id: str, db: DB):
    return _find(db, book_id)


@router.put("/books/{book_id}", response_model=BookOut)
def update_book(book_id: str, body: BookIn, db: DB):
    book = _find(db, book_id, lock=True)
    active = _active_loans(db, book.id)
    if body.total_copies < active:
        raise HTTPException(
            status_code=409, detail="Copies cannot be below the number currently on loan"
        )
    book.title = body.title
    book.author = body.author
    book.total_copies = body.total_copies
    book.available_copies = body.total_copies - active
    book.updated_at = func.now()
    db.commit()
    db.refresh(book)
    return book


@router.delete("/books/{book_id}", status_code=204)
def delete_book(book_id: str, db: DB) -> Response:
    book = _find(db, book_id, lock=True)
    if _active_loans(db, book.id) > 0:
        raise HTTPException(
            status_code=409, detail="This book is currently on loan and cannot be deleted"
        )
    db.delete(book)
    db.commit()
    return Response(status_code=204)


@router.post("/books/{book_id}/borrow", status_code=201)
def borrow_book(book_id: str, db: DB, user: CurrentUser):
    book = _find(db, book_id, lock=True)
    if book.available_copies < 1:
        raise HTTPException(status_code=409, detail="No copies available")
    loan = Loan(user_id=user.id, book_id=book.id, due_date=date.today() + timedelta(days=14))
    book.available_copies -= 1
    db.add(loan)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="You have already borrowed this book"
        ) from None
    db.refresh(loan)
    return {
        "id": str(loan.id),
        "book_id": str(loan.book_id),
        "borrowed_at": loan.borrowed_at.isoformat(),
        "due_date": loan.due_date.isoformat(),
    }


@router.get("/loans/me")
def my_loans(db: DB, user: CurrentUser):
    rows = db.execute(
        select(Loan, Book)
        .join(Book, Book.id == Loan.book_id)
        .where(Loan.user_id == user.id, Loan.returned_at.is_(None))
        .order_by(Loan.due_date, Loan.id)
    ).all()
    now = datetime.now(UTC)
    current = [
        {
            "id": str(loan.id),
            "book_id": str(book.id),
            "title": book.title,
            "author": book.author,
            "borrowed_at": loan.borrowed_at.isoformat(),
            "due_date": loan.due_date.isoformat(),
            "is_overdue": is_overdue(loan, now),
        }
        for loan, book in rows
    ]
    return {"current": current, "overdue": [c for c in current if c["is_overdue"]]}


@router.post("/loans/{loan_id}/return")
def return_loan(loan_id: str, db: DB, user: CurrentUser):
    try:
        loan = db.get(Loan, uuid.UUID(loan_id), with_for_update=True)
    except ValueError:
        loan = None
    if loan is None:
        raise HTTPException(status_code=404, detail="Loan not found")
    if loan.user_id != user.id:
        raise HTTPException(status_code=403, detail="This loan belongs to another user")
    if loan.returned_at is not None:
        raise HTTPException(status_code=409, detail="This loan has already been returned")
    book = db.get(Book, loan.book_id, with_for_update=True)
    loan.returned_at = datetime.now(UTC)
    book.available_copies += 1
    db.commit()
    return {"id": str(loan.id), "returned_at": loan.returned_at.isoformat()}
