"""Books: list, create, get, update and delete, all behind sign-in."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field, StrictInt, StringConstraints
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Book, Loan

router = APIRouter(prefix="/books", tags=["books"], dependencies=[Depends(get_current_user)])

DB = Annotated[Session, Depends(get_db)]
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


def _find(db: Session, book_id: str) -> Book:
    try:
        book = db.get(Book, uuid.UUID(book_id))
    except ValueError:
        book = None
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.get("", response_model=list[BookOut])
def list_books(db: DB):
    return db.scalars(select(Book).order_by(Book.title, Book.id)).all()


@router.post("", status_code=201, response_model=BookOut)
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


@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: str, db: DB):
    return _find(db, book_id)


@router.put("/{book_id}", response_model=BookOut)
def update_book(book_id: str, body: BookIn, db: DB):
    book = _find(db, book_id)
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


@router.delete("/{book_id}", status_code=204)
def delete_book(book_id: str, db: DB) -> Response:
    book = _find(db, book_id)
    if _active_loans(db, book.id) > 0:
        raise HTTPException(
            status_code=409, detail="This book is currently on loan and cannot be deleted"
        )
    db.delete(book)
    db.commit()
    return Response(status_code=204)
