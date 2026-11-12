# Traceability Matrix

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start legend -->
Built from recorded links, not written by a model: requirement key → plan item (`source_stable_key`) → development ticket (`stable_key`) → the ticket's test steps → the last live deployment that started after the work finished. **AC tests** counts the story's acceptance criteria that have a test case, and those whose test cases all passed in the latest finished E2E run.
<!-- sdlc:auto:end legend -->

<!-- sdlc:auto:start matrix -->
| Requirement | Epic | Title | Plan items | Sprint | Design | Code | Commits | Ticket | Tests | AC tests | Deployed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| US-001 | EPIC-001 | Sign up with email and password | US-001 | 1 | POST /auth/signup, api, spa, users | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-002 | EPIC-001 | Sign in and sign out | US-002 | 1 | POST /auth/signin, POST /auth/signout, api, spa, users | — | — | not started | not run | 0/5 tested · 0/5 passing | — |
| US-003 | EPIC-002 | Add a book | US-003 | 1 | POST /books, api, books, spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-004 | EPIC-002 | Edit a book | US-004 | 1 | GET /books/{book_id}, PUT /books/{book_id}, api, books, loans, spa | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-005 | EPIC-002 | Delete a book | US-005 | 1 | DELETE /books/{book_id}, api, books, loans, spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-006 | EPIC-003 | Search books by title or author | US-006 | 2 | GET /books, api, books, spa | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-007 | EPIC-003 | Browse available books | US-007 | 2 | GET /books, api, books, spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-008 | EPIC-004 | Borrow a book | US-008 | 2 | POST /books/{book_id}/borrow, api, books, db, loans, spa | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-009 | EPIC-004 | Mark a loan returned | US-009 | 2 | POST /loans/{loan_id}/return, api, books, loans, spa | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-010 | EPIC-005 | See my current loans | US-010 | 2 | GET /loans/me, api, books, loans, spa | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-011 | EPIC-005 | See my overdue loans | US-011 | 2 | GET /loans/me, api, loans, spa | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-012 | EPIC-006 | Store users, books and loans | US-012 | 1 | api, books, db, loans, users | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-013 | EPIC-007 | Setup and usage guide | US-013 | 2 | — | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
<!-- sdlc:auto:end matrix -->
