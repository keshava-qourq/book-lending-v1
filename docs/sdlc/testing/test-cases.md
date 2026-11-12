# Tests

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start summary -->
64 tests · Passed 45 · Failed 0 · Skipped 0 · Not run 19

Acceptance criteria covered: 20/40 · passing: 5/40
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start tests -->
## Sprint 1

### US-001: Sign up with email and password

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-001, AC-002, AC-004 | test_ac001_ac002_ac004_signup_hashes_and_rejects_duplicates | Unit | Passed | `backend/tests/unit/test_auth.py` |
| AC-003 | test_ac003_invalid_input_422 | Unit | Passed | `backend/tests/unit/test_auth.py` |
| AC-005, AC-006, AC-007, AC-008, AC-009 | test_ac005_ac006_ac007_ac008_ac009_session_lifecycle | Unit | Passed | `backend/tests/unit/test_auth.py` |
| AC-009 | test_ac009_invalid_token_is_rejected | Unit | Passed | `backend/tests/unit/test_nfr007.py` |
| — | test_nfr007_small_library_plain_schema | Unit | Passed | `backend/tests/unit/test_nfr007.py` |
| AC-001 | auth > [AC-001] sign-up success goes to sign-in | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-002 | auth > [AC-002] sign-up 409 shows the server message | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-003 | auth > [AC-003] sign-up validates client-side without calling the API | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-005 | auth > [AC-005] sign-in stores the token and goes to the dashboard | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-006 | auth > [AC-006] sign-in 401 shows the generic message | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-007 | auth > [AC-007] sign out calls the API, clears the token and redirects | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-008 | auth > [AC-008] redirects protected routes to sign-in without a token | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-035 | test_ac035_exact_table_set | Integration | Passed | `backend/tests/unit/test_data_model.py` |
| AC-036 | test_ac036_unique_email | Integration | Passed | `backend/tests/unit/test_data_model.py` |
| AC-037 | test_ac037_available_copies_check | Integration | Passed | `backend/tests/unit/test_data_model.py` |
| AC-037 | test_ac037_loan_indexes | Integration | Passed | `backend/tests/unit/test_data_model.py` |
| AC-038 | test_ac038_is_overdue | Integration | Passed | `backend/tests/unit/test_data_model.py` |
| — | test_nfr010_error_shape | Integration | Passed | `backend/tests/unit/test_data_model.py` |
| AC-001 | [AC-001] new visitor signs up and then signs in | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-002 | [AC-002] duplicate email in other letter case shows already exists; original works | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-003 | [AC-003][NFR-010] invalid email and empty password show what to fix and create nothing | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-005 | [AC-005] correct credentials land on /dashboard (new user, admin, smoke user) | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-006 | [AC-006][NFR-004] wrong password and unknown email show identical generic message | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-007 | [AC-007] after sign-out the token is rejected and protected pages redirect | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-008 | [AC-008][NFR-003] unauthenticated visits redirect and API returns 401 | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-009 | [AC-009] invalid token in localStorage returns the user to /sign-in | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| — | [NFR-001][NFR-006] sign-up response exposes only id and email, never the password | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| — | [NFR-007] several users can sign up and sign in side by side | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |

### US-003: Add a book

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-011 | test_ac011_rejects_bad_total_copies[-1] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_rejects_bad_total_copies[0] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_rejects_bad_total_copies[2.5] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_rejects_bad_total_copies[2] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_rejects_bad_total_copies[True] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_rejects_blank_text[author] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_rejects_blank_text[title] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_valid_and_trimmed | Unit | Passed | `backend/tests/unit/test_books.py` |
| — | non-functional requirements > [NFR-003] book screens redirect to sign-in without a token and load no data | Unit | Passed | `frontend/src/nfr.test.tsx` |
| — | non-functional requirements > [NFR-007] a list of a thousand books renders | Unit | Passed | `frontend/src/nfr.test.tsx` |
| — | non-functional requirements > [NFR-010] invalid book form shows a message beside each field | Unit | Passed | `frontend/src/nfr.test.tsx` |
| AC-010 | BookForm > [AC-010] add posts the book and returns to the list | Unit | Passed | `frontend/src/screens/Books.test.tsx` |
| AC-011 | BookForm > [AC-011] blocks invalid input with field messages and no call | Unit | Passed | `frontend/src/screens/Books.test.tsx` |
| AC-011 | BookForm > [AC-011] maps 422 errors to fields | Unit | Passed | `frontend/src/screens/Books.test.tsx` |
| AC-013 | BookForm > [AC-013] edit saves with PUT and shows a 409 message | Unit | Passed | `frontend/src/screens/Books.test.tsx` |
| AC-010 | Books list > [AC-010] shows the empty state | Unit | Passed | `frontend/src/screens/Books.test.tsx` |
| AC-012 | Books list > [AC-012] edit link opens the form at /book-form/:id | Unit | Passed | `frontend/src/screens/Books.test.tsx` |
| AC-014 | Books list > [AC-014] lists books with available copies | Unit | Passed | `frontend/src/screens/Books.test.tsx` |
| AC-015 | Books list > [AC-015] delete asks for confirmation then removes the row | Unit | Passed | `frontend/src/screens/Books.test.tsx` |
| AC-016 | Books list > [AC-016] delete 409 shows the server message and keeps the book | Unit | Passed | `frontend/src/screens/Books.test.tsx` |
| AC-016 | Books list > [AC-016] shows an error when loading fails | Unit | Passed | `frontend/src/screens/Books.test.tsx` |
| AC-010 | [AC-010] adding a book with 3 copies shows it with 3 available | E2E | Not run yet | `frontend/e2e/books.spec.ts` |
| AC-011 | [AC-011][NFR-010] invalid title, author and copies show a message and save nothing | E2E | Not run yet | `frontend/e2e/books.spec.ts` |
| AC-012 | [AC-012] editing title, author and copies saves the new values | E2E | Not run yet | `frontend/e2e/books.spec.ts` |
| AC-013 | [AC-013][NFR-010] total copies below the number on loan is rejected | E2E | Not run yet | `frontend/e2e/books.spec.ts` |
| AC-014 | [AC-014] raising total copies with active loans raises available by the same amount | E2E | Not run yet | `frontend/e2e/books.spec.ts` |
| AC-015 | [AC-015] deleting a book with no loans after confirming removes it | E2E | Not run yet | `frontend/e2e/books.spec.ts` |
| AC-016 | [AC-016][NFR-010] deleting a book on loan is refused and the book remains | E2E | Not run yet | `frontend/e2e/books.spec.ts` |
| — | [NFR-003] unauthenticated book writes return 401 and visits redirect | E2E | Not run yet | `frontend/e2e/books.spec.ts` |

## Project setup

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| — | test_seeds_each_user_once | Unit | Passed | `backend/tests/unit/test_seed.py` |
| — | test_seeds_nothing_without_settings | Unit | Passed | `backend/tests/unit/test_seed.py` |
| AC-008 | App > [AC-008] redirects an unauthenticated visit to the dashboard to sign in | Unit | Passed | `frontend/src/App.test.tsx` |
| — | App > renders a screen inside the app shell and shows its menu | Unit | Passed | `frontend/src/App.test.tsx` |
| — | test_health_reports_ok | Integration | Passed | `backend/tests/integration/test_health.py` |
| — | test_the_openapi_document_builds | Integration | Passed | `backend/tests/integration/test_health.py` |
| — | the app loads | E2E | Not run yet | `frontend/e2e/example.spec.ts` |
<!-- sdlc:auto:end tests -->
