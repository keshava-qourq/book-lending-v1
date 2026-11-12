# Planning

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### EPIC-001 · approved · source: plan:EPIC-001

Account sign-up and sign-in. Users create an account and sign in with email and password.

- Goal: users sign up and sign in with email and password; all signed-in users are equal (no admin or librarian role).
- Assumption: authentication uses hashed email/password with sessions or tokens; the mechanism is left to implementation.
- Only email and password hash are stored as personal data.

**Related:** US-001, US-002, REQ-004, NFR-001, NFR-002, NFR-003, NFR-004

### EPIC-002 · approved · source: plan:EPIC-002

Book records and management. Any signed-in user can add, edit and delete books in the single shared library.

- Goal: manage books with a title, author and number of copies.
- Assumptions: a book with active loans cannot be deleted; copies cannot be set below the number currently on loan.

**Related:** US-003, US-004, US-005, REQ-005, NFR-010

### EPIC-003 · approved · source: plan:EPIC-003

Search and browse books. Signed-in users find books by title or author and browse currently available books.

- Goal: let users find and choose books.
- Assumption: search is case-insensitive on title and author.
- Scale is small (thousands of books).

**Related:** US-006, US-007, REQ-006, NFR-007, NFR-011

### EPIC-004 · approved · source: plan:EPIC-004

Borrowing and returning. Borrowing creates a loan due 14 days later and reduces available copies; returning restores the copy.

- Goal: borrow and return books with correct copy counts.
- Assumptions: borrowing only when available copies > 0; a user cannot hold two active loans of the same book; only the borrower can return their own loan.
- Out of scope: renewals, fines, reservations/waitlists, reminders.

**Related:** US-008, US-009, REQ-007, NFR-005, NFR-008

### EPIC-005 · approved · source: plan:EPIC-005

Dashboard of my loans. Shows only the signed-in user's own loans, including overdue ones.

- Goal: users see what they have borrowed and what is overdue.
- Overdue is computed when the dashboard is viewed: unreturned and past its due date.

**Related:** US-010, US-011, REQ-008, NFR-005, NFR-009

### EPIC-006 · approved · source: plan:EPIC-006

Data storage. Data is stored in exactly three tables: Users, Books and Loans.

- Goal: a simple, consistent data model.
- Assumptions: no external services or API keys; no payments.
- Database choice differs between inputs:
  - Planning assumption: relational database (PostgreSQL or SQLite).
  - Approved requirements stack: PostgreSQL 16 (see REQ-001).

**Related:** US-012, REQ-009, REQ-001, NFR-006, NFR-009

### EPIC-007 · approved · source: plan:EPIC-007

Setup and usage documentation. Basic documentation for running and using the app.

- Goal: a person can set up and use the app without help.
- Assumed standard managed hosting; no external services or API keys needed.

**Related:** US-013, REQ-009, NFR-012
<!-- sdlc:auto:end narrative -->
