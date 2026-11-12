<!-- sdlc:auto:start adr -->
# ADR-0003: Use PostgreSQL 16 for Database

Status: Accepted  
Date: 2026-11-12

## Context and Problem Statement

Which Database technology does the project use? Decided in architecture v1.

## Considered Options

- PostgreSQL 16
- SQLite

## Decision Outcome

Chosen option: PostgreSQL 16, because Approved stack. Row locks and atomic conditional updates keep copy counts correct when two people borrow the last copy. CHECK constraints and a partial unique index enforce the rules in the database, and ILIKE covers case-insensitive partial search with no extra search service.

## Consequences

Needs a managed instance rather than a file. Sequential-scan ILIKE is fine at thousands of books and would need an index only at much larger scale.
<!-- sdlc:auto:end adr -->