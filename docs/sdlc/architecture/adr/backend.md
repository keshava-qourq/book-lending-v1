<!-- sdlc:auto:start adr -->
# ADR-0002: Use FastAPI 0.115 for Backend

Status: Accepted  
Date: 2026-11-12

## Context and Problem Statement

Which Backend technology does the project use? Decided in architecture v1.

## Considered Options

- FastAPI 0.115
- Django
- Flask

## Decision Outcome

Chosen option: FastAPI 0.115, because Approved stack. The rules (copies available, no duplicate loan, 14-day due date, borrower-only return, no deleting a book on loan) are small server-side checks. Pydantic gives request validation with clear field errors, and FastAPI dependencies give a simple bearer-session guard.

## Consequences

Auth, password hashing and sessions are written by hand rather than provided by a full framework. This stays small at three tables.
<!-- sdlc:auto:end adr -->