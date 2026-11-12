# Tests

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start summary -->
183 tests · Passed 175 · Failed 8 · Skipped 0 · Not run 0

Acceptance criteria covered: 38/40 · passing: 31/40
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
| NFR-007 | test_nfr007_small_library_plain_schema | Unit | Passed | `backend/tests/unit/test_nfr007.py` |
| AC-001 | auth > [AC-001] sign-up success goes to sign-in | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-002 | auth > [AC-002] sign-up 409 shows the server message | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-003 | auth > [AC-003] sign-up validates client-side without calling the API | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-005 | auth > [AC-005] sign-in stores the token and goes to the dashboard | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-006 | auth > [AC-006] sign-in 401 shows the generic message | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-007 | auth > [AC-007] sign out calls the API, clears the token and redirects | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-008 | auth > [AC-008] redirects protected routes to sign-in without a token | Unit | Passed | `frontend/src/auth.test.tsx` |
| AC-001 | test_ac001_signup_then_signin_returns_token | Integration | Passed | `backend/tests/integration/test_signup.py` |
| AC-002 | test_ac002_duplicate_email_other_case_rejected | Integration | Passed | `backend/tests/integration/test_signup.py` |
| AC-003 | test_ac003_both_invalid_names_both_fields | Integration | Passed | `backend/tests/integration/test_signup.py` |
| AC-003, NFR-010 | test_ac003_nfr010_empty_password_names_field | Integration | Passed | `backend/tests/integration/test_signup.py` |
| AC-003, NFR-010 | test_ac003_nfr010_invalid_email_names_field | Integration | Passed | `backend/tests/integration/test_signup.py` |
| AC-004, NFR-001 | test_ac004_nfr001_password_stored_as_argon2_hash | Integration | Passed | `backend/tests/integration/test_signup.py` |
| NFR-006 | test_nfr006_signup_response_only_id_and_email | Integration | Passed | `backend/tests/integration/test_signup.py` |
| NFR-006 | test_nfr006_users_table_holds_no_extra_personal_data | Integration | Passed | `backend/tests/integration/test_signup.py` |
| NFR-007 | test_nfr007_several_users_sign_up_and_sign_in_side_by_side | Integration | Passed | `backend/tests/integration/test_signup.py` |
| AC-035 | test_ac035_exact_table_set | Integration | Passed | `backend/tests/unit/test_data_model.py` |
| AC-036 | test_ac036_unique_email | Integration | Passed | `backend/tests/unit/test_data_model.py` |
| AC-037 | test_ac037_available_copies_check | Integration | Passed | `backend/tests/unit/test_data_model.py` |
| AC-037 | test_ac037_loan_indexes | Integration | Passed | `backend/tests/unit/test_data_model.py` |
| AC-038 | test_ac038_is_overdue | Integration | Passed | `backend/tests/unit/test_data_model.py` |
| NFR-010 | test_nfr010_error_shape | Integration | Passed | `backend/tests/unit/test_data_model.py` |
| AC-001 | [AC-001] new visitor signs up and then signs in | E2E | Passed | `frontend/e2e/auth.spec.ts` |
| AC-002 | [AC-002] duplicate email in other letter case shows already exists; original works | E2E | Passed | `frontend/e2e/auth.spec.ts` |
| AC-003, NFR-010 | [AC-003][NFR-010] invalid email and empty password show what to fix and create nothing | E2E | Passed | `frontend/e2e/auth.spec.ts` |
| AC-005 | [AC-005] correct credentials land on /dashboard (new user, admin, smoke user) | E2E | Passed | `frontend/e2e/auth.spec.ts` |
| AC-006, NFR-004 | [AC-006][NFR-004] wrong password and unknown email show identical generic message | E2E | Passed | `frontend/e2e/auth.spec.ts` |
| AC-007 | [AC-007] after sign-out the token is rejected and protected pages redirect | E2E | Passed | `frontend/e2e/auth.spec.ts` |
| AC-008, NFR-003 | [AC-008][NFR-003] unauthenticated visits redirect and API returns 401 | E2E | Passed | `frontend/e2e/auth.spec.ts` |
| AC-009 | [AC-009] invalid token in localStorage returns the user to /sign-in | E2E | Failed | `frontend/e2e/auth.spec.ts` |
| NFR-001, NFR-006 | [NFR-001][NFR-006] sign-up response exposes only id and email, never the password | E2E | Passed | `frontend/e2e/auth.spec.ts` |
| NFR-007 | [NFR-007] several users can sign up and sign in side by side | E2E | Passed | `frontend/e2e/auth.spec.ts` |

### US-002: Sign in and sign out

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-005 | test_ac005_signin_returns_opaque_token_in_body | Integration | Passed | `backend/tests/integration/test_auth_session.py` |
| AC-006, NFR-004 | test_ac006_nfr004_wrong_password_and_unknown_email_identical | Integration | Passed | `backend/tests/integration/test_auth_session.py` |
| AC-007, NFR-002 | test_ac007_nfr002_signout_invalidates_token | Integration | Passed | `backend/tests/integration/test_auth_session.py` |
| AC-008, NFR-003 | test_ac008_nfr003_malformed_and_garbage_tokens_return_401 | Integration | Passed | `backend/tests/integration/test_auth_session.py` |
| AC-008, NFR-003 | test_ac008_nfr003_unauthenticated_requests_return_401 | Integration | Passed | `backend/tests/integration/test_auth_session.py` |
| AC-009, NFR-002 | test_ac009_nfr002_expired_session_returns_401 | Integration | Passed | `backend/tests/integration/test_auth_session.py` |
| NFR-001 | test_nfr001_token_and_password_not_stored_in_plain | Integration | Passed | `backend/tests/integration/test_auth_session.py` |
| NFR-002 | test_nfr002_session_has_future_expiry | Integration | Passed | `backend/tests/integration/test_auth_session.py` |
| NFR-007 | test_nfr007_signin_for_several_users_keeps_sessions_independent | Integration | Passed | `backend/tests/integration/test_auth_session.py` |

### US-003: Add a book

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-010 | test_ac010_create_then_list_has_available_equal_total | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_bad_copies_rejected_and_nothing_saved[-1] | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_bad_copies_rejected_and_nothing_saved[0] | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_bad_copies_rejected_and_nothing_saved[2.5] | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_bad_copies_rejected_and_nothing_saved[3] | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_bad_copies_rejected_and_nothing_saved[None] | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_bad_copies_rejected_and_nothing_saved[x] | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_blank_text_rejected_and_nothing_saved[   -author] | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_blank_text_rejected_and_nothing_saved[   -title] | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_blank_text_rejected_and_nothing_saved[-author] | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_blank_text_rejected_and_nothing_saved[-title] | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| NFR-003 | test_nfr003_missing_or_invalid_token_is_401_and_saves_nothing[None] | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| NFR-003 | test_nfr003_missing_or_invalid_token_is_401_and_saves_nothing[] | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| NFR-003 | test_nfr003_missing_or_invalid_token_is_401_and_saves_nothing[not-a-valid-token] | Unit | Passed | `backend/tests/unit/test_add_book.py` |
| AC-011 | test_ac011_rejects_bad_total_copies[-1] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_rejects_bad_total_copies[0] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_rejects_bad_total_copies[2.5] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_rejects_bad_total_copies[2] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_rejects_bad_total_copies[True] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_rejects_blank_text[author] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_rejects_blank_text[title] | Unit | Passed | `backend/tests/unit/test_books.py` |
| AC-011 | test_ac011_valid_and_trimmed | Unit | Passed | `backend/tests/unit/test_books.py` |
| NFR-003 | non-functional requirements > [NFR-003] book screens redirect to sign-in without a token and load no data | Unit | Passed | `frontend/src/nfr.test.tsx` |
| NFR-007 | non-functional requirements > [NFR-007] a list of a thousand books renders | Unit | Passed | `frontend/src/nfr.test.tsx` |
| NFR-010 | non-functional requirements > [NFR-010] invalid book form shows a message beside each field | Unit | Passed | `frontend/src/nfr.test.tsx` |
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
| AC-010 | test_ac010_add_book_all_copies_available | Integration | Passed | `backend/tests/integration/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_invalid_book_names_field_and_saves_nothing[body0-title] | Integration | Passed | `backend/tests/integration/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_invalid_book_names_field_and_saves_nothing[body1-author] | Integration | Passed | `backend/tests/integration/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_invalid_book_names_field_and_saves_nothing[body2-total_copies] | Integration | Passed | `backend/tests/integration/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_invalid_book_names_field_and_saves_nothing[body3-total_copies] | Integration | Passed | `backend/tests/integration/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_invalid_book_names_field_and_saves_nothing[body4-total_copies] | Integration | Passed | `backend/tests/integration/test_add_book.py` |
| AC-011, NFR-010 | test_ac011_nfr010_invalid_book_names_field_and_saves_nothing[body5-total_copies] | Integration | Passed | `backend/tests/integration/test_add_book.py` |
| NFR-003 | test_nfr003_book_endpoints_need_sign_in | Integration | Passed | `backend/tests/integration/test_add_book.py` |
| NFR-007 | test_nfr007_hundreds_of_books_listed | Integration | Passed | `backend/tests/integration/test_add_book.py` |
| AC-010 | [AC-010] adding a book with 3 copies shows it with 3 available | E2E | Passed | `frontend/e2e/books.spec.ts` |
| AC-011, NFR-010 | [AC-011][NFR-010] invalid title, author and copies show a message and save nothing | E2E | Passed | `frontend/e2e/books.spec.ts` |
| AC-012 | [AC-012] editing title, author and copies saves the new values | E2E | Failed | `frontend/e2e/books.spec.ts` |
| AC-013, NFR-010 | [AC-013][NFR-010] total copies below the number on loan is rejected | E2E | Passed | `frontend/e2e/books.spec.ts` |
| AC-014 | [AC-014] raising total copies with active loans raises available by the same amount | E2E | Passed | `frontend/e2e/books.spec.ts` |
| AC-015 | [AC-015] deleting a book with no loans after confirming removes it | E2E | Passed | `frontend/e2e/books.spec.ts` |
| AC-016, NFR-010 | [AC-016][NFR-010] deleting a book on loan is refused and the book remains | E2E | Passed | `frontend/e2e/books.spec.ts` |
| NFR-003 | [NFR-003] unauthenticated book writes return 401 and visits redirect | E2E | Passed | `frontend/e2e/books.spec.ts` |

### US-004: Edit a book

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-012 | test_ac012_update_shows_in_get_list_and_search | Unit | Passed | `backend/tests/unit/test_edit_book.py` |
| AC-013, NFR-010 | test_ac013_nfr010_below_loaned_is_409_and_unchanged | Unit | Passed | `backend/tests/unit/test_edit_book.py` |
| AC-014 | test_ac014_raising_copies_raises_available_by_same_amount | Unit | Passed | `backend/tests/unit/test_edit_book.py` |
| NFR-003 | test_nfr003_edit_requires_valid_token | Unit | Passed | `backend/tests/unit/test_edit_book.py` |
| AC-012 | test_ac012_edit_saved_and_shown_in_list_and_search | Integration | Passed | `backend/tests/integration/test_edit_book.py` |
| AC-012, NFR-010 | test_ac012_nfr010_invalid_edit_names_field_and_changes_nothing | Integration | Passed | `backend/tests/integration/test_edit_book.py` |
| AC-013, NFR-010 | test_ac013_nfr010_copies_below_on_loan_rejected | Integration | Passed | `backend/tests/integration/test_edit_book.py` |
| AC-014 | test_ac014_increase_copies_raises_available_by_same_amount | Integration | Passed | `backend/tests/integration/test_edit_book.py` |
| NFR-003 | test_nfr003_edit_needs_sign_in_and_changes_nothing | Integration | Passed | `backend/tests/integration/test_edit_book.py` |
| NFR-007 | test_nfr007_edit_among_hundred_books | Integration | Passed | `backend/tests/integration/test_edit_book.py` |
| NFR-010 | test_nfr010_edit_unknown_book_is_404 | Integration | Passed | `backend/tests/integration/test_edit_book.py` |

### US-005: Delete a book

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-015 | test_ac015_delete_without_loans_removes_book_everywhere | Unit | Passed | `backend/tests/unit/test_delete_book.py` |
| AC-016, NFR-010 | test_ac016_nfr010_delete_on_loan_is_409_then_succeeds_after_return | Unit | Passed | `backend/tests/unit/test_delete_book.py` |
| NFR-003 | test_nfr003_delete_needs_valid_token_and_book_remains[None] | Unit | Passed | `backend/tests/unit/test_delete_book.py` |
| NFR-003 | test_nfr003_delete_needs_valid_token_and_book_remains[] | Unit | Passed | `backend/tests/unit/test_delete_book.py` |
| NFR-003 | test_nfr003_delete_needs_valid_token_and_book_remains[not-a-valid-token] | Unit | Passed | `backend/tests/unit/test_delete_book.py` |
| AC-015 | test_ac015_delete_after_return_is_allowed | Integration | Passed | `backend/tests/integration/test_delete_book.py` |
| AC-015 | test_ac015_delete_without_loans_removes_from_get_list_and_search | Integration | Passed | `backend/tests/integration/test_delete_book.py` |
| AC-016, NFR-010 | test_ac016_nfr010_delete_on_loan_refused_with_message_and_book_remains | Integration | Passed | `backend/tests/integration/test_delete_book.py` |
| NFR-003 | test_nfr003_delete_needs_sign_in_and_removes_nothing | Integration | Passed | `backend/tests/integration/test_delete_book.py` |
| NFR-007 | test_nfr007_delete_among_hundred_books | Integration | Passed | `backend/tests/integration/test_delete_book.py` |
| NFR-010 | test_nfr010_delete_unknown_or_malformed_id_is_404 | Integration | Passed | `backend/tests/integration/test_delete_book.py` |

### US-012: Store users, books and loans

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-036, NFR-006 | test_ac036_nfr006_users_only_email_and_password_hash_personal | Unit | Passed | `backend/tests/unit/test_data_model_columns.py` |
| AC-037 | test_ac037_books_and_loans_columns | Unit | Passed | `backend/tests/unit/test_data_model_columns.py` |
| AC-038, NFR-009 | test_ac038_nfr009_no_overdue_column_or_table | Unit | Passed | `backend/tests/unit/test_data_model_columns.py` |
| AC-035, NFR-009 | test_ac035_nfr009_exactly_three_tables | Integration | Passed | `backend/tests/integration/test_data_model_schema.py` |
| AC-036, NFR-006 | test_ac036_nfr006_users_personal_data_and_unique_email | Integration | Passed | `backend/tests/integration/test_data_model_schema.py` |
| AC-037 | test_ac037_books_and_loans_columns | Integration | Passed | `backend/tests/integration/test_data_model_schema.py` |
| AC-038, NFR-009 | test_ac038_nfr009_overdue_derived_at_read_time | Integration | Passed | `backend/tests/integration/test_data_model_schema.py` |
| NFR-007 | test_nfr007_thousand_books_listed | Integration | Passed | `backend/tests/integration/test_data_model_schema.py` |

## Sprint 2

### US-006: Search books by title or author

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-017, AC-019 | Books search and browse > [AC-017] search calls GET /books?q= and [AC-019] clearing restores the list | Unit | Passed | `frontend/src/screens/BooksSearch.test.tsx` |
| AC-018 | Books search and browse > [AC-018] no results shows No books found | Unit | Passed | `frontend/src/screens/BooksSearch.test.tsx` |
| AC-020 | Books search and browse > [AC-020] available toggle calls available_only=true and combines with search | Unit | Passed | `frontend/src/screens/BooksSearch.test.tsx` |
| NFR-010 | Books search and browse > [NFR-010] search failure shows an alert | Unit | Passed | `frontend/src/screens/BooksSearch.test.tsx` |
| AC-017, NFR-011 | [AC-017][NFR-011] search 'hobbit' then 'TOLKIEN' lists The Hobbit each time | E2E | Passed | `frontend/e2e/search.spec.ts` |
| AC-018 | [AC-018] searching a random string shows 'No books found' | E2E | Passed | `frontend/e2e/search.spec.ts` |
| AC-019, NFR-011 | [AC-019][NFR-011] partial fragments of a title and an author list the matches | E2E | Passed | `frontend/e2e/search.spec.ts` |
| AC-020 | [AC-020] available-only browse lists only the book with copies, with its details | E2E | Passed | `frontend/e2e/search.spec.ts` |
| AC-021 | [AC-021] after the last copy is borrowed, refreshing the browse view drops the book | E2E | Passed | `frontend/e2e/search.spec.ts` |
| NFR-003 | [NFR-003] visiting /books while signed out redirects to /sign-in | E2E | Passed | `frontend/e2e/search.spec.ts` |
| NFR-007 | [NFR-007] search lists many books at once | E2E | Passed | `frontend/e2e/search.spec.ts` |

### US-008: Borrow a book

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-022 | Borrow > [AC-022] borrow posts, drops available copies and shows the due date | Unit | Passed | `frontend/src/screens/Borrow.test.tsx` |
| AC-023 | Borrow > [AC-023] borrow is disabled with zero copies | Unit | Passed | `frontend/src/screens/Borrow.test.tsx` |
| AC-023 | Borrow > [AC-023] no-copies refusal shows an alert and list is unchanged | Unit | Passed | `frontend/src/screens/Borrow.test.tsx` |
| AC-024 | Borrow > [AC-024] already-borrowed refusal shows the detail in an alert | Unit | Passed | `frontend/src/screens/Borrow.test.tsx` |
| AC-022 | [AC-022] borrowing an available book shows due date in 14 days and drops available by one | E2E | Failed | `frontend/e2e/borrow.spec.ts` |
| AC-023, NFR-010 | [AC-023][NFR-010] a book with 0 available copies is refused with visible text and no loan | E2E | Failed | `frontend/e2e/borrow.spec.ts` |
| AC-024, NFR-010 | [AC-024][NFR-010] borrowing the same book twice shows already borrowed; one loan exists | E2E | Failed | `frontend/e2e/borrow.spec.ts` |
| AC-025, NFR-008 | [AC-025][NFR-008] two users borrowing the last copy concurrently: one 201, one 409, available 0 | E2E | Passed | `frontend/e2e/borrow.spec.ts` |
| NFR-003 | [NFR-003] borrow without a token returns 401 and unauthenticated visits redirect | E2E | Passed | `frontend/e2e/borrow.spec.ts` |
| NFR-007 | [NFR-007] several books and users borrow side by side | E2E | Failed | `frontend/e2e/borrow.spec.ts` |

### US-009: Mark a loan returned

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-026 | test_ac026_return_records_date_and_increases_available | Integration | Passed | `backend/tests/integration/test_return_loan.py` |
| AC-026 | test_ac026_unknown_loan_is_404 | Integration | Passed | `backend/tests/integration/test_return_loan.py` |
| AC-027, NFR-008 | test_ac027_nfr008_second_return_does_not_add_copy_again | Integration | Passed | `backend/tests/integration/test_return_loan.py` |
| AC-028, NFR-005 | test_ac028_nfr005_other_users_loan_refused_and_unchanged | Integration | Passed | `backend/tests/integration/test_return_loan.py` |
| NFR-003 | test_nfr003_return_needs_sign_in_and_changes_nothing | Integration | Passed | `backend/tests/integration/test_return_loan.py` |
| NFR-007 | test_nfr007_many_loans_returned_side_by_side | Integration | Passed | `backend/tests/integration/test_return_loan.py` |
| AC-026 | [AC-026] marking a loan returned removes it from the dashboard and frees a copy | E2E | Failed | `frontend/e2e/return.spec.ts` |
| AC-027, NFR-008 | [AC-027][NFR-008] returning twice does not add a copy twice | E2E | Passed | `frontend/e2e/return.spec.ts` |
| AC-028, NFR-005 | [AC-028][NFR-005] another user's loan cannot be returned and is not on their dashboard | E2E | Failed | `frontend/e2e/return.spec.ts` |
| NFR-003 | [NFR-003] return without a token is refused and changes nothing | E2E | Passed | `frontend/e2e/return.spec.ts` |

### US-010: See my current loans

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-029 | Dashboard > [AC-029] lists current loans from the API | Unit | Passed | `frontend/src/screens/Dashboard.test.tsx` |
| AC-031 | Dashboard > [AC-031] shows the empty message | Unit | Passed | `frontend/src/screens/Dashboard.test.tsx` |
| AC-032, AC-033 | Dashboard > [AC-032] overdue loans show an Overdue badge; [AC-033] others do not | Unit | Passed | `frontend/src/screens/Dashboard.test.tsx` |
| AC-034 | Dashboard > [AC-034] return posts, confirms and refetches | Unit | Passed | `frontend/src/screens/Dashboard.test.tsx` |
| NFR-010 | Dashboard > [NFR-010] failed load shows an alert | Unit | Passed | `frontend/src/screens/Dashboard.test.tsx` |
| NFR-010 | Dashboard > [NFR-010] failed return shows an alert and keeps the loan | Unit | Passed | `frontend/src/screens/Dashboard.test.tsx` |
| AC-026 | [AC-026] marking a current loan returned shows it as returned and frees a copy | E2E | Passed | `frontend/e2e/dashboard.spec.ts` |
| AC-027, NFR-008 | [AC-027][NFR-008] replaying a return is refused and copies do not increase again | E2E | Passed | `frontend/e2e/dashboard.spec.ts` |
| AC-028, NFR-005 | [AC-028][NFR-005] another user's return is refused with 403 and the loan stays | E2E | Passed | `frontend/e2e/dashboard.spec.ts` |
| AC-029 | [AC-029] two borrowed books are listed with title, author, dates and Mark returned | E2E | Passed | `frontend/e2e/dashboard.spec.ts` |
| AC-030, NFR-005 | [AC-030][NFR-005] another user's loans never appear on my dashboard | E2E | Passed | `frontend/e2e/dashboard.spec.ts` |
| AC-031 | [AC-031] a user with no loans sees 'You have no current loans' | E2E | Passed | `frontend/e2e/dashboard.spec.ts` |
| AC-032 | [AC-032] a loan with a past due date appears in the overdue list | E2E | Passed | `frontend/e2e/dashboard.spec.ts` |
| AC-033 | [AC-033] loans due today or later are not in the overdue list | E2E | Passed | `frontend/e2e/dashboard.spec.ts` |
| AC-034 | [AC-034] returning an overdue loan removes it from both lists and frees a copy | E2E | Passed | `frontend/e2e/dashboard.spec.ts` |
| NFR-003 | [NFR-003] visiting /dashboard while signed out redirects to /sign-in | E2E | Passed | `frontend/e2e/dashboard.spec.ts` |
| NFR-007 | [NFR-007] the dashboard lists many loans for one user | E2E | Passed | `frontend/e2e/dashboard.spec.ts` |

## Project setup

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| — | test_seeds_each_user_once | Unit | Passed | `backend/tests/unit/test_seed.py` |
| — | test_seeds_nothing_without_settings | Unit | Passed | `backend/tests/unit/test_seed.py` |
| AC-008 | App > [AC-008] redirects an unauthenticated visit to the dashboard to sign in | Unit | Passed | `frontend/src/App.test.tsx` |
| — | App > renders a screen inside the app shell and shows its menu | Unit | Passed | `frontend/src/App.test.tsx` |
| — | test_health_reports_ok | Integration | Passed | `backend/tests/integration/test_health.py` |
| — | test_the_openapi_document_builds | Integration | Passed | `backend/tests/integration/test_health.py` |
| — | the app loads | E2E | Passed | `frontend/e2e/example.spec.ts` |
<!-- sdlc:auto:end tests -->
