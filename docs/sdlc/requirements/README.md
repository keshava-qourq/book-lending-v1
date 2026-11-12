# Product Requirements

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
## Summary

### REQ-001 · approved · source: requirements:technology_stack

The product owner approved the technology stack. Design must use exactly these technologies, with no substitutions.

- Backend: FastAPI 0.115
  - Rationale: the business rules are small and exact and fit clear server-side checks.
  - Rules named: borrow only if copies are available; no duplicate active loan; due date 14 days out; only the borrower can return; no deleting a book that is on loan.
  - Also covers email/password sign-up with hashed passwords and sessions or tokens.
  - Data volume (hundreds of users) is far below any performance concern.
- Frontend: React 19
  - Rationale: a handful of screens (sign up/sign in, book list with search, book form, loans dashboard).
  - Instant search and borrow/return buttons that update counts on screen suit React.
  - Kept as the platform default because no assumption pointed elsewhere.
- Database: PostgreSQL 16
  - Offered as a choice between PostgreSQL and SQLite for the three tables.
  - PostgreSQL chosen so copy counts stay correct when two people borrow the last copy at the same moment.
  - Runs well on managed hosting; case-insensitive title/author search is built in.
- Cloud: AWS (see REQ-002).

**Related:** REQ-002

### REQ-002 · approved · source: requirements:services

The app is hosted on AWS using standard managed services. No external services receive user data.

- Cloud: AWS, chosen as standard managed hosting with no regulatory or deadline constraints.
- AWS offers managed PostgreSQL and simple ways to run the API and host the React site.
- AWS is the platform default, so the build can deploy there directly.
- No external services or API keys are needed, and there are no payments.
- No email/SMS reminder service (out of scope).

**Related:** REQ-001, NFR-006

### REQ-003 · approved · source: requirements:scope

Scope is a lightweight delivery: a single shared library with equal signed-in users. Reminders, fines, renewals and reservations are excluded.

In scope:
- Email and password sign-up and sign-in
- Book records (title, author, number of copies)
- Add, edit and delete book screens
- Search books by title or author (ignores letter case)
- Browse available books
- Borrowing a book with a 14-day due date
- Available copy count that drops on borrow
- Marking a loan returned and restoring the copy
- Dashboard of my current loans
- Dashboard of my overdue loans (overdue worked out when the dashboard is viewed)
- Borrowing only when copies are available
- Users, Books and Loans data storage
- Basic setup and usage documentation
- All signed-in users are equal, with no admin or librarian role
- Dashboard shows only the signed-in user's own loans

Out of scope (do not design or build):
- Email/SMS overdue reminders
- Fines
- Renewals
- Reservations/waitlists

Delivery scope: lightweight. Requirements version: 1.

### REQ-004 · approved · source: requirements:functional:sign-in-and-accounts

Visitors create accounts and sign in or out with email and password. Protected areas are open only to signed-in users.

- Create an account: a visitor signs up with an email and password.
  - Duplicate emails (in any letter case), invalid emails and empty passwords are rejected with a clear message.
- Sign in and out: a registered user signs in with email and password and lands on their dashboard.
  - Signing out ends the session.
  - Expired sessions ask the user to sign in again.
- Sign-in required: dashboard, book screens and borrow and return actions are only open to signed-in users.
  - Everyone else is redirected to sign in.

**Related:** NFR-001, NFR-002, NFR-003, NFR-004

### REQ-005 · approved · source: requirements:functional:managing-books

Signed-in users add, edit and delete books in the shared library. Rules protect copies that are on loan.

- Add a book: a signed-in user adds a book with a title, author and number of copies (a whole number of 1 or more).
  - The new book appears in the list with all copies available.
- Edit a book: a signed-in user changes a book's title, author or copies.
  - Copies cannot be set below the number on loan.
  - Adding copies raises the available count by the same amount.
- Delete a book: a signed-in user deletes a book after confirming.
  - Deletion is refused with a message if the book is currently on loan.

**Related:** NFR-010

### REQ-006 · approved · source: requirements:functional:finding-books

Signed-in users search books by title or author and browse the books that currently have copies available.

- Search books: a signed-in user searches by title or author.
  - Matching ignores letter case and finds partial text.
  - A message shows when nothing matches.
- Browse available books: a list shows only books with at least one copy available, with title, author and available copies.
  - A book drops off the list when its last copy is borrowed.

**Related:** NFR-011

### REQ-007 · approved · source: requirements:functional:borrowing-and-returning

Users borrow available books with a 14-day due date and return their own loans, which restores the copy.

- Borrow a book: a signed-in user borrows an available book.
  - A loan is created with a due date 14 days away.
  - Available copies drop by one.
  - Refused if no copies are left or the user already has that book on loan.
- Return a book: a borrower marks their own loan as returned.
  - The return date is recorded and the copy becomes available again.
  - Returning twice, or returning someone else's loan, changes nothing.

**Related:** NFR-005, NFR-008

### REQ-008 · approved · source: requirements:functional:my-dashboard

The dashboard shows the signed-in user's current and overdue loans, with a way to mark each returned.

- See my current loans: lists the user's unreturned loans with title, author, borrow date and due date.
  - Each loan has a button to mark it returned.
  - Shows a message if there are none.
- See my overdue loans: shows which of the user's unreturned loans are past their due date.
  - Overdue is worked out when the dashboard is opened.
  - Returned loans disappear from the list.

**Related:** NFR-005, NFR-009

### REQ-009 · approved · source: requirements:functional:data-and-guide

Library data is kept in three tables, and written setup and usage instructions are provided.

- Store library data: users, books and loans are kept in three tables.
  - Books track total and available copies.
  - Loans link a user and a book with borrow, due and returned dates.
- Setup and usage guide: written instructions explain how to set up and start the app.
  - They also explain how to sign up, manage books, search, borrow, return and read the dashboard.

**Related:** NFR-009, NFR-012

### NFR-001 · approved · source: requirements:NFR-001

Security: passwords are stored only as one-way hashes, never as plain text.

- Inspecting the stored user records must not reveal any password.

**Related:** REQ-004

### NFR-002 · approved · source: requirements:NFR-002

Security: sessions end on sign-out and also expire after a set time.

- After sign-out or expiry, protected pages and actions require the user to sign in again.

**Related:** REQ-004

### NFR-003 · approved · source: requirements:NFR-003

Security: protected pages and actions need sign-in.

- Anyone not signed in is sent to the sign-in page when opening the dashboard, book screens or borrow and return actions.
- No data is shown or changed for them.

**Related:** REQ-004

### NFR-004 · approved · source: requirements:NFR-004

Security: sign-in errors do not reveal which part was wrong.

- A wrong password or an unknown email gives the same generic message.
- The message does not reveal whether the email is registered.

**Related:** REQ-004

### NFR-005 · approved · source: requirements:NFR-005

Privacy: users see and change only their own loans.

- The dashboard and loan actions only show or change the signed-in user's own loans.
- Other users' loans are never shown.
- Only the borrower can mark a loan returned.

**Related:** REQ-007, REQ-008

### NFR-006 · approved · source: requirements:NFR-006

Privacy: minimal personal data is stored.

- The only personal data stored about a user is their email address and password hash.
- No external services receive user data.

**Related:** REQ-002

### NFR-007 · approved · source: requirements:NFR-007

Scalability: sized for a small library; no larger scale is needed.

- Target: tens to low hundreds of users; thousands of books.

### NFR-008 · approved · source: requirements:NFR-008

Availability: copy counts stay correct under simultaneous borrowing.

- When two people borrow the last copy at the same moment, only one loan is created.
- Available copies never fall below zero.
- Returning a loan twice never adds a copy twice.

**Related:** REQ-007

### NFR-009 · approved · source: requirements:NFR-009

Maintainability: a simple three-table data model.

- Data is held in exactly three tables (Users, Books and Loans).
- Email is unique.
- Overdue status is worked out when it is read, not stored.

**Related:** REQ-008, REQ-009

### NFR-010 · approved · source: requirements:NFR-010

Usability: invalid or refused actions give clear messages.

- When a form entry is invalid or an action is refused, the user sees a clear message saying what to fix or why.
- Covers sign-up, book forms, borrowing, deleting and editing copies.

**Related:** REQ-004, REQ-005, REQ-007

### NFR-011 · approved · source: requirements:NFR-011

Usability: search is case-insensitive and matches partial text.

- Search finds books whose title or author contains the typed text, whatever the letter case.

**Related:** REQ-006

### NFR-012 · approved · source: requirements:NFR-012

Maintainability: setup and usage documentation leaves no undocumented steps.

- Written instructions let a new person install, configure the database, start and use the app.
- They state the 14-day loan period.
- They state that renewals, fines, reservations and reminders are not supported.

**Related:** REQ-009
<!-- sdlc:auto:end narrative -->

<!-- sdlc:auto:start summary -->
**Requirements version:** v1  
**Delivery scope:** lightweight  
**Approved:** 2026-11-12

**Capabilities in scope:** Email and password sign-up and sign-in, Book records (title, author, number of copies), Add, edit and delete book screens, Search books by title or author, Browse available books, Borrowing a book with a 14-day due date, Available copy count that drops on borrow, Marking a loan returned and restoring the copy, Dashboard of my current loans, Dashboard of my overdue loans, Borrowing only when copies are available, Users, Books and Loans data storage, Basic setup and usage documentation, All signed-in users are equal, with no admin or librarian role, Search ignores upper and lower case, Overdue worked out when the dashboard is viewed, Dashboard shows only the signed-in user's own loans, No renewals, fines, reservations or reminder emails

**Approved technology stack:**

| Layer | Choice | Rationale |
|---|---|---|
| backend | FastAPI | Your rules are small and exact: borrow only if copies are available, no duplicate active loan, due date 14 days out, only the borrower can return, no deleting a book that is on loan. FastAPI lets us write these as clear server-side checks. It also covers email/password sign-up with hashed passwords and sessions or tokens, and the data volume (hundreds of users) is far below any performance concern. |
| cloud | AWS | You asked for standard managed hosting and have no regulatory or deadline constraints. AWS offers managed PostgreSQL and simple ways to run the API and host the React site, and it is the platform default, so the build can deploy there directly. |
| database | PostgreSQL | The analyst offered PostgreSQL or SQLite for your three tables (Users, Books, Loans). I chose PostgreSQL because copy counts must stay correct when two people borrow the last copy at the same moment, and it handles that safely. It also runs well on managed hosting and case-insensitive title/author search is built in. |
| frontend | React | The app has a handful of screens: sign up/sign in, a book list with search, a book form, and a dashboard of your loans. React handles these well, and the instant search and 'borrow' and 'return' buttons that update counts on screen are what it is good at. No assumption pointed elsewhere, so I kept the platform default. |
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start epics -->
## EPIC-001: Account sign-up and sign-in

Users create an account and sign in with email and password. All signed-in users are equal; there is no admin or librarian role. Assumption: authentication uses hashed email/password with sessions or tokens (mechanism left to implementation). Only email and password hash are stored as personal data.

### US-001: Sign up with email and password

**Priority:** critical

> As a visitor, I want to create an account with my email and a password, so that I can use the library.

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | I am not signed in and the email is not registered | I submit a valid email and password on the sign-up screen | an account is created and I can sign in with those credentials |
| AC-002 | an account already exists for an email | I try to sign up with the same email (any letter case) | sign-up is rejected with a clear message and no second account is created |
| AC-003 | I am on the sign-up screen | I submit an invalid email or an empty password | the account is not created and I see a message explaining what to fix |
| AC-004 | an account has been created | the stored user record is inspected | the password is stored only as a hash, never as plain text |

### US-002: Sign in and sign out

**Priority:** critical

> As a registered user, I want to sign in and out with my email and password, so that my loans and actions are tied to me and my account is protected.

| ID | Given | When | Then |
|---|---|---|---|
| AC-005 | I have an account | I sign in with the correct email and password | I am taken to my dashboard as a signed-in user |
| AC-006 | I have an account | I sign in with a wrong password or unknown email | sign-in fails with a generic message that does not reveal which part was wrong |
| AC-007 | I am signed in | I sign out | my session ends and protected pages and actions require me to sign in again |
| AC-008 | I am not signed in | I try to open the dashboard, book screens or borrow/return actions | I am redirected to sign in and no data is shown or changed |
| AC-009 | I am signed in and my session has passed its expiry time | I make a request | I am asked to sign in again |

## EPIC-002: Book records and management

Any signed-in user can add, edit and delete any book in the single shared library. A book has a title, author and number of copies. Assumptions: a book with active loans cannot be deleted, and copies cannot be set below the number currently on loan.

### US-003: Add a book

**Priority:** high

> As a signed-in user, I want to add a book with title, author and number of copies, so that it is available in the library.

| ID | Given | When | Then |
|---|---|---|---|
| AC-010 | I am signed in | I submit the add-book form with a title, author and a whole number of copies of 1 or more | the book is saved and appears in the book list with all copies available |
| AC-011 | I am on the add-book form | I leave title or author empty, or give a non-numeric, negative or fractional copy count | the book is not saved and I see which field is invalid |

### US-004: Edit a book

**Priority:** medium

> As a signed-in user, I want to edit a book's title, author and number of copies, so that the catalogue stays accurate.

| ID | Given | When | Then |
|---|---|---|---|
| AC-012 | a book exists | I change its title, author or copies to valid values and save | the changes are saved and shown in lists and search results |
| AC-013 | a book has 2 copies currently on loan | I try to set total copies to 1 | the change is rejected with a message that copies cannot be below the number on loan |
| AC-014 | a book has active loans | I increase its total copies | available copies increase by the same amount |

### US-005: Delete a book

**Priority:** medium

> As a signed-in user, I want to delete a book, so that books no longer in the library are removed.

| ID | Given | When | Then |
|---|---|---|---|
| AC-015 | a book has no active loans | I confirm deletion | the book is removed and no longer appears in lists or search |
| AC-016 | a book has one or more active (unreturned) loans | I try to delete it | deletion is refused with a message explaining that it is currently on loan, and the book remains |

## EPIC-003: Search and browse books

Signed-in users find books by title or author and browse books that are currently available. Assumption: search is case-insensitive on title and author. Scale is small (thousands of books).

### US-006: Search books by title or author

**Priority:** high

> As a signed-in user, I want to search books by title or author, so that I can quickly find a book.

| ID | Given | When | Then |
|---|---|---|---|
| AC-017 | a book titled "The Hobbit" by "J.R.R. Tolkien" exists | I search "hobbit" or "TOLKIEN" | the book appears in the results regardless of letter case |
| AC-018 | no book matches my search text | I search | I see a message that no books were found |
| AC-019 | a search term matches part of a title or author | I search | books whose title or author contains the text are returned |

### US-007: Browse available books

**Priority:** high

> As a signed-in user, I want to browse the books that currently have copies available, so that I can choose something to borrow.

| ID | Given | When | Then |
|---|---|---|---|
| AC-020 | some books have available copies and others have none | I open the browse list | only books with at least one available copy are listed, each showing title, author and available copies |
| AC-021 | the last available copy of a book is borrowed | I refresh the browse list | that book no longer appears in it |

## EPIC-004: Borrowing and returning

Borrowing creates a loan due 14 days later and reduces available copies; the borrower marks it returned, restoring the copy. Assumptions: borrowing only when available copies > 0; a user cannot hold two active loans of the same book; only the borrower can return their own loan. Out of scope: renewals, fines, reservations/waitlists, reminders.

### US-008: Borrow a book

**Priority:** critical

> As a signed-in user, I want to borrow an available book, so that I can read it for 14 days.

| ID | Given | When | Then |
|---|---|---|---|
| AC-022 | a book has at least one available copy and I have no active loan of it | I borrow it | a loan is created for me with a due date 14 days after today and the book's available copies drop by one |
| AC-023 | a book has zero available copies | I try to borrow it | the borrow is refused with a message and no loan is created |
| AC-024 | I already have an active loan of a book | I try to borrow the same book again | the borrow is refused with a message and no second loan is created |
| AC-025 | one copy remains and two users borrow at the same moment | both requests are processed | only one loan is created and available copies never go below zero |

### US-009: Mark a loan returned

**Priority:** critical

> As a borrower, I want to mark my loan as returned, so that the copy becomes available to others.

| ID | Given | When | Then |
|---|---|---|---|
| AC-026 | I have an active loan | I mark it returned | the loan is recorded as returned with the return date and the book's available copies increase by one |
| AC-027 | a loan is already returned | I try to mark it returned again | available copies are not increased a second time |
| AC-028 | a loan belongs to another user | I try to mark it returned | the action is refused and the loan is unchanged |

## EPIC-005: Dashboard of my loans

The dashboard shows only the signed-in user's own loans. Overdue is computed when the dashboard is viewed: unreturned and past its due date.

### US-010: See my current loans

**Priority:** high

> As a signed-in user, I want to see my current loans on my dashboard, so that I know what I have borrowed and when it is due.

| ID | Given | When | Then |
|---|---|---|---|
| AC-029 | I have unreturned loans | I open the dashboard | each is listed with book title, author, borrow date and due date, with an option to mark it returned |
| AC-030 | other users have loans | I open the dashboard | none of their loans are shown |
| AC-031 | I have no active loans | I open the dashboard | I see a message that I have no current loans |

### US-011: See my overdue loans

**Priority:** high

> As a signed-in user, I want to see which of my loans are overdue, so that I can return them promptly.

| ID | Given | When | Then |
|---|---|---|---|
| AC-032 | I have an unreturned loan whose due date is before today | I view the dashboard | it is shown in the overdue list |
| AC-033 | I have an unreturned loan due today or later | I view the dashboard | it is not shown as overdue |
| AC-034 | an overdue loan is marked returned | I view the dashboard again | it no longer appears as current or overdue |

## EPIC-006: Data storage

Data is stored in exactly three tables: Users, Books and Loans. Assumption: relational database (PostgreSQL or SQLite); no external services or API keys; no payments.

### US-012: Store users, books and loans

**Priority:** high

> As a product owner, I want data held in exactly three tables: Users, Books and Loans, so that the data model stays simple and consistent.

| ID | Given | When | Then |
|---|---|---|---|
| AC-035 | the app is set up | the database schema is inspected | it contains exactly the tables Users, Books and Loans |
| AC-036 | the schema is inspected | I look at the Users table | it holds email and password hash only as personal data, with email unique |
| AC-037 | the schema is inspected | I look at Books and Loans | Books hold title, author, total and available copies, and Loans link a user and a book with borrow date, due date and returned date |
| AC-038 | a loan exists | overdue status is needed | it is derived from due date and return status at read time and not stored as a separate table or status |

## EPIC-007: Setup and usage documentation

Basic documentation for running and using the app. Assumed standard managed hosting; no external services or API keys needed.

### US-013: Setup and usage guide

**Priority:** medium

> As a person setting up or using the app, I want basic written setup and usage instructions, so that I can run the app and use its features without help.

| ID | Given | When | Then |
|---|---|---|---|
| AC-039 | a new person has the project files | they follow the setup instructions | they can install, configure the database and start the app without extra undocumented steps |
| AC-040 | a new user reads the usage guide | they look for how to sign up, manage books, search, borrow, return and read the dashboard | each is described, including the 14-day loan period and that renewals, fines, reservations and reminders are not supported |
<!-- sdlc:auto:end epics -->
