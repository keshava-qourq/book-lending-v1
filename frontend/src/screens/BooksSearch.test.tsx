import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  available_copies: 1,
};
const dune = { ...hobbit, id: "2", title: "Dune" };

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

describe("Books search and browse", () => {
  it("[AC-017] search calls GET /books?q= and [AC-019] clearing restores the list", async () => {
    mock.mockResolvedValueOnce([hobbit, dune]);
    mock.mockResolvedValueOnce([hobbit]);
    mock.mockResolvedValueOnce([hobbit, dune]);
    renderBooks();
    await screen.findByText("Dune");
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "TOLKIEN" } });
    await waitFor(() => expect(mock).toHaveBeenCalledWith("/books?q=TOLKIEN"));
    await waitFor(() => expect(screen.queryByText("Dune")).not.toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "" } });
    expect(await screen.findByText("Dune")).toBeInTheDocument();
  });

  it("[AC-018] no results shows No books found", async () => {
    mock.mockResolvedValueOnce([hobbit]).mockResolvedValueOnce([]);
    renderBooks();
    await screen.findByText("The Hobbit");
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "zzz" } });
    expect(await screen.findByText("No books found")).toBeInTheDocument();
    expect(screen.queryByText("No books yet")).not.toBeInTheDocument();
  });

  it("[AC-020] available toggle calls available_only=true and combines with search", async () => {
    mock.mockResolvedValue([hobbit]);
    renderBooks();
    await screen.findByText("The Hobbit");
    fireEvent.click(screen.getByLabelText("Available to borrow"));
    await waitFor(() => expect(mock).toHaveBeenCalledWith("/books?available_only=true"));
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "hob" } });
    await waitFor(() => expect(mock).toHaveBeenCalledWith("/books?q=hob&available_only=true"));
  });

  it("[NFR-010] search failure shows an alert", async () => {
    mock.mockResolvedValueOnce([hobbit]).mockRejectedValueOnce(new ApiError(500, "Boom", []));
    renderBooks();
    await screen.findByText("The Hobbit");
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "x" } });
    expect(await screen.findByRole("alert")).toHaveTextContent("Boom");
  });
});
