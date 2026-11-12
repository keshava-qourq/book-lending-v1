# Behaviour rules

How this app behaves where the requirements and the API contract do not say. QA's
tests and the code both follow these rules. The platform keeps this file: the first
rules come from the contract and the code, and each later rule from a decision made
when a test and the code disagreed.

- A sign-in returns a JSON body {token, token_type: "bearer", expires_at, user: {id, email}} with status 200, and the token is a random URL-safe opaque string.
- Only the sha256 hash of a session token is stored, on the user row, so each user has at most one session at a time.
- A new sign-in by the same user replaces the previous token, so the earlier token immediately returns 401.
- A session lasts 8 hours from sign-in by default (SESSION_TTL_HOURS overrides it), with no sliding renewal, and an expired token returns 401.
- Sign-out returns 204 with no body, clears the user's token so it returns 401 afterwards, and signing out with a missing or invalid token returns 401.
- Every route except /auth/signup, /auth/signin and /health requires a valid bearer token, and a missing, malformed, unknown, signed-out or expired token returns 401 with detail "Authentication required. Please sign in." and a WWW-Authenticate: Bearer header.
- A wrong password and an unknown email both return the same 401 with detail "Invalid email or password", so the response does not reveal whether the account exists.
- Emails are trimmed and lowercased before sign-up and sign-in, so they are case-insensitive, and they are stored lowercase and unique.
- Sign-up returns 201 with {id, email} and no token, so the user must then sign in; a duplicate email returns 409 with detail "An account with this email already exists".
- Passwords must be at least 8 characters, have no maximum or complexity rule in the code, and are stored only as argon2 hashes.
- Every error response is JSON {detail: string, errors: [{field, message}]}, and errors is an empty list except for 422.
- Invalid input returns 422 with detail "Validation failed" and one errors entry per problem, where field is the last part of the field's location (for example email, password, title, total_copies).
- A book's title and author are trimmed, must be non-empty after trimming, and are at most 300 and 200 characters; total_copies must be an integer of at least 1, and a string or float is rejected with 422.
- A book_id or loan_id that is not a valid UUID, or that does not exist, returns 404 with detail "Book not found" or "Loan not found" and never 422.
- All IDs are server-generated UUID v4 values returned as strings, and a client cannot choose them.
- Conflicts return 409 with a plain detail: "No copies available", "You have already borrowed this book", "Copies cannot be below the number currently on loan", "This book is currently on loan and cannot be deleted" and "This loan has already been returned".
- Returning another user's loan returns 403 with detail "This loan belongs to another user", and that check comes before the already-returned check.
- Any signed-in user can create, edit and delete any book, because there are no roles or book owners.
- GET /books returns a plain JSON array with no paging or limit, ordered by title and then id (ordinal, case-sensitive Postgres order).
- GET /books supports an optional q, a case-insensitive substring match on title or author where % and _ are treated literally and a blank q is ignored, and available_only=true keeps only books with available_copies > 0.
- Editing a book sets available_copies to the new total_copies minus the number of unreturned loans.
- A loan's due_date is a date (YYYY-MM-DD) 14 days after today's UTC date, and all timestamps are UTC ISO 8601 strings.
- A loan counts as overdue only when it is unreturned and its due_date is before today's UTC date, so a loan due today is not overdue.
- GET /loans/me returns {current, overdue} and lists only the caller's unreturned loans ordered by due_date and then id; returned loans never appear, and overdue is the subset of current with is_overdue true.
- A user can hold only one unreturned loan per book but may borrow it again after returning it, and borrow, return, edit and delete lock the book row so concurrent requests cannot oversell copies.
- Each test creates its own users and data through the API (sign-up then sign-in, then POST /books), never by writing to the database directly, and the test fixtures truncate all tables around every test so tests share no state and use unique emails.
