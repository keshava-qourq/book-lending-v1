# Sprint Plan

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start sprints -->
## Sprint 1: Sprint 1

Data model, authentication and book management are in place, so signed-in users can maintain the shared catalogue.

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-001 | Story | Sign up with email and password | 3 | backend-agent | US-012 |
| US-002 | Story | Sign in and sign out | 5 | backend-agent | US-001 |
| US-003 | Story | Add a book | 3 | backend-agent | US-002, US-012 |
| US-004 | Story | Edit a book | 3 | backend-agent | US-003 |
| US-005 | Story | Delete a book | 2 | backend-agent | US-003 |
| US-012 | Story | Store users, books and loans | 3 | backend-agent | — |

## Sprint 2: Sprint 2

Users can find, borrow and return books and see their current and overdue loans, with setup and usage documentation.

Capacity: 20 points · Committed: 20

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-006 | Story | Search books by title or author | 3 | frontend-agent | US-003 |
| US-007 | Story | Browse available books | 2 | frontend-agent | US-003 |
| US-008 | Story | Borrow a book | 5 | backend-agent | US-002, US-003, US-012 |
| US-009 | Story | Mark a loan returned | 3 | backend-agent | US-008 |
| US-010 | Story | See my current loans | 3 | frontend-agent | US-008, US-009 |
| US-011 | Story | See my overdue loans | 2 | frontend-agent | US-010 |
| US-013 | Story | Setup and usage guide | 2 | devops-agent | US-011 |

## Unscheduled

_Nothing unscheduled._
<!-- sdlc:auto:end sprints -->
