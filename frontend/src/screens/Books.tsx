import React from "react";

import { ApiError, apiFetch } from "@/lib/api";
import { useNavigate } from "@/lib/navigate";
import * as UI from "@/lib/ui";

const { Button, Table, THead, TBody, TR, TH, TD, Empty } = UI;

type Book = {
  id: string;
  title: string;
  author: string;
  total_copies: number;
  available_copies: number;
};

export default function Screen() {
  const navigate = useNavigate();
  const [books, setBooks] = React.useState<Book[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState("");
  const [borrowError, setBorrowError] = React.useState("");
  const [borrowNote, setBorrowNote] = React.useState("");

  const [q, setQ] = React.useState("");
  const [availableOnly, setAvailableOnly] = React.useState(false);

  React.useEffect(() => {
    let live = true;
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (availableOnly) params.set("available_only", "true");
    const qs = params.toString();
    (async () => {
      try {
        const list = await apiFetch<Book[]>(qs ? `/books?${qs}` : "/books");
        if (live) {
          setBooks(list);
          setLoadError("");
        }
      } catch (err) {
        if (live) setLoadError(err instanceof ApiError ? err.detail : "Could not load books.");
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [q, availableOnly]);

  const filtering = q.trim() !== "" || availableOnly;

  const confirmDelete = async (book: Book) => {
    setDeleteError("");
    try {
      await apiFetch<void>(`/books/${book.id}`, { method: "DELETE" });
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
      setPendingId(null);
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.detail : "Could not delete the book. Please try again.",
      );
    }
  };

  const borrow = async (book: Book) => {
    setBorrowError("");
    setBorrowNote("");
    try {
      const loan = await apiFetch<{ due_date: string }>(`/books/${book.id}/borrow`, {
        method: "POST",
      });
      setBooks((prev) =>
        prev.map((b) =>
          b.id === book.id ? { ...b, available_copies: Math.max(0, b.available_copies - 1) } : b,
        ),
      );
      setBorrowNote(`You borrowed “${book.title}”. Due back on ${loan.due_date}.`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate("sign-in");
        return;
      }
      setBorrowError(
        err instanceof ApiError ? err.detail : "Could not borrow the book. Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold" style={{ fontFamily: "var(--brand-font-heading)" }}>
          Library books
        </h1>
        <Button type="button" onClick={() => navigate("book-form")}>
          Add book
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <UI.Label htmlFor="book-search">Search</UI.Label>
          <UI.Input
            id="book-search"
            type="search"
            value={q}
            autoComplete="off"
            placeholder="Title or author"
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <UI.Checkbox
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
          />
          Available to borrow
        </label>
      </div>

      {deleteError && (
        <p role="alert" className="mb-4 border-2 p-3 text-sm font-bold">
          {deleteError}
        </p>
      )}

      {borrowError && (
        <p role="alert" className="mb-4 border-2 p-3 text-sm font-bold">
          {borrowError}
        </p>
      )}
      {borrowNote && (
        <p role="status" className="mb-4 border-2 p-3 text-sm font-bold">
          {borrowNote}
        </p>
      )}

      {loading ? (
        <p role="status">Loading books…</p>
      ) : loadError ? (
        <p role="alert" className="text-sm font-bold">
          {loadError}
        </p>
      ) : books.length === 0 && filtering ? (
        <Empty title="No books found" description="Try different search text." />
      ) : books.length === 0 ? (
        <Empty
          title="No books yet"
          description="Add the first book and it will show up here with every copy available."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Author</TH>
              <TH>Available copies</TH>
              <TH>Total copies</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {books.map((b) => (
              <TR key={b.id}>
                <TD>{b.title}</TD>
                <TD>{b.author}</TD>
                <TD>{b.available_copies}</TD>
                <TD>{b.total_copies}</TD>
                <TD>
                  {pendingId === b.id ? (
                    <span
                      role="alertdialog"
                      aria-label={`Confirm delete ${b.title}`}
                      className="flex gap-2"
                    >
                      <span className="text-sm">Delete “{b.title}”?</span>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => confirmDelete(b)}
                      >
                        Confirm delete
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setPendingId(null);
                          setDeleteError("");
                        }}
                      >
                        Cancel
                      </Button>
                    </span>
                  ) : (
                    <span className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        aria-label="Edit"
                        onClick={() => navigate(`book-form/${b.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        aria-label={`Borrow ${b.title}`}
                        disabled={b.available_copies <= 0}
                        onClick={() => borrow(b)}
                      >
                        Borrow
                      </Button>
                      {b.available_copies <= 0 && (
                        <span className="self-center text-xs">No copies available</span>
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        aria-label={`Delete ${b.title}`}
                        onClick={() => {
                          setDeleteError("");
                          setPendingId(b.id);
                        }}
                      >
                        Delete
                      </Button>
                    </span>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
