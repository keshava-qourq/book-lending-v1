import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch } from "@/lib/api";
import Books from "./Books";
import BookForm from "./BookForm";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiFetch: vi.fn() };
});
const mock = vi.mocked(apiFetch);

const hobbit = {
  id: 1,
  title: "The Hobbit",
  author: "Tolkien",
  total_copies: 3,
  available_copies: 1,
};

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/books" element={<Books />} />
        <Route path="/book-form" element={<BookForm />} />
        <Route path="/book-form/:id" element={<BookForm />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => mock.mockReset());

describe("Books list", () => {
  it("[AC-014] lists books with available copies", async () => {
    mock.mockResolvedValue([hobbit]);
    renderAt("/books");
    expect(await screen.findByText("The Hobbit")).toBeInTheDocument();
    expect(mock).toHaveBeenCalledWith("/books");
  });

  it("[AC-010] shows the empty state", async () => {
    mock.mockResolvedValue([]);
    renderAt("/books");
    expect(await screen.findByText("No books yet")).toBeInTheDocument();
  });

  it("[AC-016] shows an error when loading fails", async () => {
    mock.mockRejectedValueOnce(new ApiError(500, "Boom", []));
    renderAt("/books");
    expect(await screen.findByText("Boom")).toBeInTheDocument();
  });

  it("[AC-015] delete asks for confirmation then removes the row", async () => {
    mock.mockResolvedValueOnce([hobbit]).mockResolvedValueOnce(undefined);
    renderAt("/books");
    fireEvent.click(await screen.findByRole("button", { name: "Delete The Hobbit" }));
    expect(mock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
    await waitFor(() => expect(screen.queryByText("The Hobbit")).not.toBeInTheDocument());
    expect(mock).toHaveBeenCalledWith("/books/1", { method: "DELETE" });
  });

  it("[AC-016] delete 409 shows the server message and keeps the book", async () => {
    const msg = "This book is currently on loan and cannot be deleted";
    mock.mockResolvedValueOnce([hobbit]).mockRejectedValueOnce(new ApiError(409, msg, []));
    renderAt("/books");
    fireEvent.click(await screen.findByRole("button", { name: "Delete The Hobbit" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
    expect(await screen.findByText(msg)).toBeInTheDocument();
    expect(screen.getByText("The Hobbit")).toBeInTheDocument();
  });

  it("[AC-012] edit link opens the form at /book-form/:id", async () => {
    mock.mockResolvedValueOnce([hobbit]).mockResolvedValueOnce(hobbit);
    renderAt("/books");
    fireEvent.click(await screen.findByRole("button", { name: "Edit The Hobbit" }));
    expect(await screen.findByDisplayValue("The Hobbit")).toBeInTheDocument();
    expect(mock).toHaveBeenCalledWith("/books/1");
  });
});

describe("BookForm", () => {
  it("[AC-011] blocks invalid input with field messages and no call", () => {
    renderAt("/book-form");
    fireEvent.change(screen.getByLabelText("Number of copies"), { target: { value: "1.5" } });
    fireEvent.click(screen.getByRole("button", { name: "Save book" }));
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(screen.getByText("Author is required.")).toBeInTheDocument();
    expect(screen.getByText(/whole number/)).toBeInTheDocument();
    expect(mock).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Number of copies"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Save book" }));
    expect(screen.getByText(/at least 1 copy/)).toBeInTheDocument();
  });

  it("[AC-010] add posts the book and returns to the list", async () => {
    mock.mockResolvedValueOnce(hobbit).mockResolvedValueOnce([hobbit]);
    renderAt("/book-form");
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "The Hobbit" } });
    fireEvent.change(screen.getByLabelText("Author"), { target: { value: "Tolkien" } });
    fireEvent.change(screen.getByLabelText("Number of copies"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Save book" }));
    expect(await screen.findByText("Library books")).toBeInTheDocument();
    expect(mock).toHaveBeenCalledWith("/books", {
      method: "POST",
      body: JSON.stringify({ title: "The Hobbit", author: "Tolkien", total_copies: 3 }),
    });
  });

  it("[AC-011] maps 422 errors to fields", async () => {
    mock.mockRejectedValueOnce(
      new ApiError(422, "Invalid", [{ field: "body.title", message: "Too long" }]),
    );
    renderAt("/book-form");
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Author"), { target: { value: "y" } });
    fireEvent.click(screen.getByRole("button", { name: "Save book" }));
    expect(await screen.findByText("Too long")).toBeInTheDocument();
  });

  it("[AC-013] edit saves with PUT and shows a 409 message", async () => {
    const msg = "Copies cannot be below the number currently on loan";
    mock.mockResolvedValueOnce(hobbit).mockRejectedValueOnce(new ApiError(409, msg, []));
    renderAt("/book-form/1");
    fireEvent.change(await screen.findByLabelText("Number of copies"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Save book" }));
    expect(await screen.findByText(msg)).toBeInTheDocument();
    expect(mock).toHaveBeenLastCalledWith("/books/1", expect.objectContaining({ method: "PUT" }));
  });
});

describe("Books row actions", () => {
  it("[AC-012] Edit is the first action in a row, ahead of Borrow", async () => {
    mock.mockResolvedValueOnce([hobbit]);
    renderAt("/books");
    await screen.findByRole("button", { name: "Edit The Hobbit" });
    const row = screen.getByRole("row", { name: /The Hobbit/ });
    expect(within(row).getAllByRole("button")[0]).toHaveAccessibleName("Edit The Hobbit");
  });
});
