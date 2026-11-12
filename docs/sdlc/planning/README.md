# Planning

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### EPIC-001 · approved · source: planning:EPIC-001

Users create an account and sign in with email and password. All signed-in users are equal, with no admin or librarian role.

- Goal: account sign-up and sign-in with email and password.
- Roles: all signed-in users are equal; no admin or librarian role.
- Assumption: authentication uses hashed email/password with sessions or tokens; the mechanism is left to implementation.
- Personal data stored: email and password hash only.
- Plan: stories US-001 (3 pts) and US-002 (5 pts), both backend-agent; epic total 8 pts.

**Related:** US-001, US-002

### EPIC-002 · approved · source: planning:EPIC-002

Any signed-in user can add, edit and delete books in a single shared library. A book has a title, author and number of copies.

- Goal: book record management in one shared library.
- Permissions: any signed-in user may add, edit or delete any book.
- Assumption: a book with active loans cannot be deleted.
- Assumption: copies cannot be set below the number currently on loan.
- Plan: stories US-003 (3 pts), US-004 (3 pts) and US-005 (2 pts), all backend-agent; epic total 8 pts.

**Related:** US-003, US-004, US-005

### EPIC-003 · approved · source: planning:EPIC-003

Signed-in users find books by title or author and browse the books that currently have copies available.

- Goal: search by title or author, and browse available books.
- Assumption: search is case-insensitive on title and author.
- Scale: small, thousands of books.
- Plan: stories US-006 (3 pts) and US-007 (2 pts), both frontend-agent; epic total 5 pts.

**Related:** US-006, US-007

### EPIC-004 · approved · source: planning:EPIC-004

Borrowing creates a loan due 14 days later and reduces available copies. The borrower marks the loan returned, which restores the copy.

- Goal: borrow and return flow with a 14-day loan period.
- Assumption: borrowing is allowed only when available copies > 0.
- Assumption: a user cannot hold two active loans of the same book.
- Assumption: only the borrower can return their own loan.
- Out of scope: renewals, fines, reservations/waitlists, reminders.
- Plan: stories US-008 (5 pts) and US-009 (3 pts), both backend-agent; epic total 8 pts.

**Related:** US-008, US-009

### EPIC-005 · approved · source: planning:EPIC-005

The dashboard shows only the signed-in user's own loans, including which of them are overdue.

- Goal: a personal loans dashboard with current and overdue loans.
- Scope: only the signed-in user's own loans are shown.
- Overdue rule: computed when the dashboard is viewed; a loan is overdue if it is unreturned and past its due date.
- Plan: stories US-010 (3 pts) and US-011 (2 pts), both frontend-agent; epic total 5 pts.

**Related:** US-010, US-011

### EPIC-006 · approved · source: planning:EPIC-006

Data is stored in exactly three tables: Users, Books and Loans.

- Goal: a simple, consistent data model with exactly three tables.
- Assumption: relational database (PostgreSQL or SQLite).
- Assumption: no external services or API keys; no payments.
- Plan: story US-012 (3 pts), backend-agent; epic total 3 pts.

**Related:** US-012

### EPIC-007 · approved · source: planning:EPIC-007

Basic documentation for running and using the app.

- Goal: written setup and usage instructions.
- Assumption: standard managed hosting; no external services or API keys needed.
- Plan: story US-013 (2 pts), devops-agent; epic total 2 pts.

**Related:** US-013

### SPRINT-1 · draft · source: plan:Sprint 1

Sprint 1 in plan v1 (status: generated). Goal: data model, authentication and book management are in place, so signed-in users can maintain the shared catalogue.

- Goal: data model, authentication and book management in place, so signed-in users can maintain the shared catalogue.
- Capacity: 20.
- Plan version: 1 (generated).
- Related epics (inferred from the goal wording, not from an explicit assignment): EPIC-006 (data model), EPIC-001 (authentication), EPIC-002 (book management).
- The input does not list which stories are assigned to this sprint.

**Related:** EPIC-001, EPIC-002, EPIC-006

### SPRINT-2 · draft · source: plan:Sprint 2

Sprint 2 in plan v1 (status: generated). Goal: users can find, borrow and return books and see their current and overdue loans, with setup and usage documentation.

- Goal: users can find, borrow and return books and see current and overdue loans, with setup and usage documentation.
- Capacity: 20.
- Plan version: 1 (generated).
- Related epics (inferred from the goal wording, not from an explicit assignment): EPIC-003 (find), EPIC-004 (borrow/return), EPIC-005 (dashboard), EPIC-007 (documentation).
- The input does not list which stories are assigned to this sprint.
- Across the plan, story points total 39 against combined capacity of 40 for both sprints.

**Related:** EPIC-003, EPIC-004, EPIC-005, EPIC-007
<!-- sdlc:auto:end narrative -->
