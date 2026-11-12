import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { apiFetch, setSessionToken } from "@/lib/api";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiFetch: vi.fn() };
});
const mock = vi.mocked(apiFetch);

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  mock.mockReset();
});

describe("non-functional requirements", () => {
  it("[NFR-003] book screens redirect to sign-in without a token and load no data", () => {
    renderAt("/books");
    expect(screen.getByText("No account? Sign up")).toBeInTheDocument();
    renderAt("/book-form/1");
    expect(mock).not.toHaveBeenCalled();
  });

  it("[NFR-007] a list of a thousand books renders", async () => {
    setSessionToken(crypto.randomUUID());
    const books = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      title: `Book ${i + 1}`,
      author: "A",
      total_copies: 1,
      available_copies: 1,
    }));
    mock.mockResolvedValue(books);
    renderAt("/books");
    expect(await screen.findByText("Book 1000")).toBeInTheDocument();
  });

  it("[NFR-010] invalid book form shows a message beside each field", () => {
    setSessionToken(crypto.randomUUID());
    renderAt("/book-form");
    fireEvent.click(screen.getByRole("button", { name: "Save book" }));
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(screen.getByText("Author is required.")).toBeInTheDocument();
    expect(mock).not.toHaveBeenCalled();
  });
});
