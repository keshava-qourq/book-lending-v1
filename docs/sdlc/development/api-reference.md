# API Reference

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start endpoints -->
| Method | Path | Handler | Source | Summary |
|---|---|---|---|---|
| GET | /_t_http | _h | `backend/tests/unit/test_data_model.py:64` | — |
| POST | /_t_validate | _v | `backend/tests/unit/test_data_model.py:60` | — |
| POST | /auth/signin | signin | `backend/app/routers/auth.py:65` | — |
| POST | /auth/signout | signout | `backend/app/routers/auth.py:88` | — |
| POST | /auth/signup | signup | `backend/app/routers/auth.py:40` | — |
| GET | /books | list_books | `backend/app/routers/books.py:58` | — |
| POST | /books | create_book | `backend/app/routers/books.py:72` | — |
| DELETE | /books/{book_id} | delete_book | `backend/app/routers/books.py:108` | — |
| GET | /books/{book_id} | get_book | `backend/app/routers/books.py:85` | — |
| PUT | /books/{book_id} | update_book | `backend/app/routers/books.py:90` | — |
| POST | /books/{book_id}/borrow | borrow_book | `backend/app/routers/books.py:120` | — |
| GET | /health | health | `backend/app/main.py:80` | Liveness probe. |
| GET | /loans/me | my_loans | `backend/app/routers/books.py:143` | — |
| POST | /loans/{loan_id}/return | return_loan | `backend/app/routers/books.py:167` | — |
<!-- sdlc:auto:end endpoints -->

<!-- sdlc:auto:start drift -->
**Code only:**

- GET /_t_http
- POST /_t_validate
<!-- sdlc:auto:end drift -->

<!-- sdlc:auto:start source -->
Generated from commit `17142b5`
<!-- sdlc:auto:end source -->
