import pg from "pg";

const { Client } = pg;

function url(): string {
  const u = process.env.DATABASE_URL;
  if (!u) throw new Error("DATABASE_URL is not set.");
  // SQLAlchemy URL -> libpq URL
  return u.replace(/^postgresql\+\w+:/, "postgresql:");
}

// Borrow is not built this sprint: seed active loans with a direct insert, one per
// given user email, and lower the book's available_copies to match.
export async function seedActiveLoans(bookId: string, emails: string[]): Promise<void> {
  const c = new Client({ connectionString: url() });
  await c.connect();
  try {
    await c.query("BEGIN");
    for (const email of emails) {
      const u = await c.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
      if (u.rows.length !== 1) throw new Error(`user ${email} not found`);
      await c.query(
        "INSERT INTO loans (id, user_id, book_id, due_date) VALUES (gen_random_uuid(), $1, $2, CURRENT_DATE + 14)",
        [u.rows[0].id, bookId],
      );
    }
    await c.query("UPDATE books SET available_copies = available_copies - $2 WHERE id = $1", [
      bookId,
      emails.length,
    ]);
    await c.query("COMMIT");
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    await c.end();
  }
}

// Insert one active loan with an explicit due date (YYYY-MM-DD) and lower available_copies.
export async function seedLoanDue(bookId: string, email: string, dueDate: string): Promise<void> {
  const c = new Client({ connectionString: url() });
  await c.connect();
  try {
    await c.query("BEGIN");
    const u = await c.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (u.rows.length !== 1) throw new Error(`user ${email} not found`);
    await c.query(
      "INSERT INTO loans (id, user_id, book_id, due_date) VALUES (gen_random_uuid(), $1, $2, $3::date)",
      [u.rows[0].id, bookId, dueDate],
    );
    await c.query("UPDATE books SET available_copies = available_copies - 1 WHERE id = $1", [
      bookId,
    ]);
    await c.query("COMMIT");
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    await c.end();
  }
}

export async function deleteBookRows(bookId: string): Promise<void> {
  const c = new Client({ connectionString: url() });
  await c.connect();
  try {
    await c.query("DELETE FROM loans WHERE book_id = $1", [bookId]);
    await c.query("DELETE FROM books WHERE id = $1", [bookId]);
  } finally {
    await c.end();
  }
}
