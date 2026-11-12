import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch } from "@/lib/api";
import Books from "./Books";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiFetch: vi.fn() };
});
const mock = vi.mocked(apiFetch);

const hobbit = {
  id: "1",
  title: "The Hobbit",
  author: "Tolkien",
  total_copies: 3,
  available_copies: 2,
};

function renderBooks() {
  return render(
    <MemoryRouter initialEntries={["/books"]}>
      <Routes>
        <Route path="/books" element={<Books />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => mock.mockReset());

describe("Borrow", () => {
  it("[AC-022] borrow posts, drops available copies and shows the due date", async () => {
    mock
      .mockResolvedValueOnce([hobbit])
      .mockResolvedValueOnce({ id: "l1", book_id: "1", borrowed_at: "x", due_date: "2026-11-26" });
    renderBooks();
    fireEvent.click(await screen.findByRole("button", { name: "Borrow The Hobbit" }));
    expect(await screen.findByText(/2026-11-26/)).toBeInTheDocument();
    expect(mock).toHaveBeenCalledWith("/books/1/borrow", { method: "POST" });
  });

  it("[AC-023] no-copies refusal shows an alert and list is unchanged", async () => {
    mock
      .mockResolvedValueOnce([hobbit])
      .mockRejectedValueOnce(new ApiError(409, "No copies available", []));
    renderBooks();
    fireEvent.click(await screen.findByRole("button", { name: "Borrow The Hobbit" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No copies available");
    expect(screen.getByText("The Hobbit")).toBeInTheDocument();
  });

  it("[AC-023] borrow is disabled with zero copies", async () => {
    mock.mockResolvedValueOnce([{ ...hobbit, available_copies: 0 }]);
    renderBooks();
    expect(await screen.findByRole("button", { name: "Borrow The Hobbit" })).toBeDisabled();
  });

  it("[AC-024] already-borrowed refusal shows the detail in an alert", async () => {
    const msg = "You have already borrowed this book";
    mock.mockResolvedValueOnce([hobbit]).mockRejectedValueOnce(new ApiError(409, msg, []));
    renderBooks();
    fireEvent.click(await screen.findByRole("button", { name: "Borrow The Hobbit" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(msg);
  });
});
