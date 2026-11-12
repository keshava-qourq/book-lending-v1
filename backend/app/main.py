"""Application entrypoint.

Generated from the approved architecture: one router per component that owns
endpoints, one route per endpoint the API spec declares. Every generated route
is a stub that returns a typed placeholder, so the service starts, serves its
OpenAPI document and passes its tests before a single handler is implemented.
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app import models  # noqa: F401 -- imported so the tables register on Base.metadata
from app.config import get_settings
from app.database import SessionLocal
from app.migrate import run_migrations
from app.routers.auth import router as auth_router
from app.seed import seed_users


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Apply migrations, then seed the first users (only when their settings are set).

    This runs on startup and not at import, so importing the application never opens a
    connection and a test can point `get_db` at a database of its own.
    """
    run_migrations()
    with SessionLocal() as db:
        seed_users(db)
    yield


app = FastAPI(
    title="Book lending - v1",
    description="Book Lending App \n\nEmail and password sign-up and sign-in.\nUsers add, edit and delete books (title, author, copies).\nUsers search and browse the books that are available.\nWhen a user borrows a book, the app sets a 14-day due date.\nThe user marks the book returned, and the copy count updates.\nOn the dashboard, users see their current loans and any overdue ones.\nThe app needs three tables: Users, Books and Loans.",  # noqa: E501
    version="0.1.0",
    lifespan=lifespan,
)

# The SPA runs on a different origin than the API, so the browser refuses its calls
# unless that origin is allowed here. In development that is the Vite dev server; when
# deployed, the platform injects the frontend's real URL as ALLOWED_ORIGINS (comma
# separated). Point ALLOWED_ORIGINS at the real thing and nothing else has to change.
_dev_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
_allowed_origins = get_settings().allowed_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins or _dev_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _error(status: int, detail: str, errors: list[dict[str, str]], headers=None) -> JSONResponse:
    return JSONResponse(
        status_code=status, content={"detail": detail, "errors": errors}, headers=headers
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = [
        {"field": str(e["loc"][-1]) if e.get("loc") else "", "message": str(e["msg"])}
        for e in exc.errors()
    ]
    return _error(422, "Validation failed", errors)


@app.exception_handler(StarletteHTTPException)
async def http_error_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return _error(exc.status_code, str(exc.detail), [], getattr(exc, "headers", None))


app.include_router(auth_router)


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness probe, and the only route here that is not a stub."""
    return {"status": "ok"}
