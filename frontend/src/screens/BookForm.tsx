import React from "react";
import { useParams } from "react-router-dom";

import { ApiError, apiFetch } from "@/lib/api";
import { useNavigate } from "@/lib/navigate";
import * as UI from "@/lib/ui";

const { Button, Input, Label } = UI;

type Book = { id: number; title: string; author: string; total_copies: number };
type Errors = Partial<Record<"title" | "author" | "total_copies", string>>;

function validate(title: string, author: string, copies: string): Errors {
  const e: Errors = {};
  if (!title.trim()) e.title = "Title is required.";
  if (!author.trim()) e.author = "Author is required.";
  const c = copies.trim();
  if (!c) e.total_copies = "Enter how many copies the library owns.";
  else if (!/^\d+$/.test(c))
    e.total_copies = "Use a whole number such as 1, 2 or 5. No decimals, signs or letters.";
  else if (parseInt(c, 10) < 1) e.total_copies = "A book needs at least 1 copy.";
  return e;
}

export default function Screen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [copies, setCopies] = React.useState("1");
  const [errors, setErrors] = React.useState<Errors>({});
  const [formError, setFormError] = React.useState("");
  const [loading, setLoading] = React.useState(!!id);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    let live = true;
    apiFetch<Book>(`/books/${id}`)
      .then((b) => {
        if (!live) return;
        setTitle(b.title);
        setAuthor(b.author);
        setCopies(String(b.total_copies));
      })
      .catch(
        (err) =>
          live && setFormError(err instanceof ApiError ? err.detail : "Could not load the book."),
      )
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [id]);

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError("");
    const e = validate(title, author, copies);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSaving(true);
    try {
      await apiFetch(id ? `/books/${id}` : "/books", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          total_copies: parseInt(copies.trim(), 10),
        }),
      });
      navigate("books");
    } catch (err) {
      setSaving(false);
      if (err instanceof ApiError && err.status === 422) {
        const fields: Errors = {};
        for (const item of err.errors) {
          fields[String(item.field).split(".").pop() as keyof Errors] = item.message;
        }
        setErrors(fields);
        if (Object.keys(fields).length === 0) setFormError(err.detail);
      } else {
        setFormError(
          err instanceof ApiError ? err.detail : "Could not save the book. Please try again.",
        );
      }
    }
  };

  const field = (key: keyof Errors, label: string, value: string, set: (v: string) => void) => (
    <div className="flex flex-col gap-1">
      <Label htmlFor={`field-${key}`}>{label}</Label>
      <Input
        id={`field-${key}`}
        value={value}
        autoComplete="off"
        aria-invalid={errors[key] ? "true" : "false"}
        aria-describedby={errors[key] ? `err-${key}` : undefined}
        onChange={(e) => {
          set(e.target.value);
          setErrors((p) => ({ ...p, [key]: undefined }));
        }}
      />
      {errors[key] && (
        <p id={`err-${key}`} role="alert" className="text-sm font-bold">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-8">
      <h1
        className="mb-6 text-4xl font-extrabold"
        style={{ fontFamily: "var(--brand-font-heading)" }}
      >
        {id ? "Edit book" : "Add book"}
      </h1>
      {loading ? (
        <p role="status">Loading book…</p>
      ) : (
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
          {formError && (
            <p role="alert" className="border-2 p-3 text-sm font-bold">
              {formError}
            </p>
          )}
          {field("title", "Title", title, setTitle)}
          {field("author", "Author", author, setAuthor)}
          {field("total_copies", "Number of copies", copies, setCopies)}
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              Save book
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate("books")}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
