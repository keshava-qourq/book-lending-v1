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

  React.useEffect(() => {
    let live = true;
    (async () => {
      try {
        const list = await apiFetch<Book[]>("/books");
        if (live) setBooks(list);
      } catch (err) {
        if (live) setLoadError(err instanceof ApiError ? err.detail : "Could not load books.");
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

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

      {deleteError && (
        <p role="alert" className="mb-4 border-2 p-3 text-sm font-bold">
          {deleteError}
        </p>
      )}

      {loading ? (
        <p role="status">Loading books…</p>
      ) : loadError ? (
        <p role="alert" className="text-sm font-bold">
          {loadError}
        </p>
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
                        aria-label={`Edit ${b.title}`}
                        onClick={() => navigate(`book-form/${b.id}`)}
                      >
                        Edit
                      </Button>
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
