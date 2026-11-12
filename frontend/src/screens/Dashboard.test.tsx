import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch } from "@/lib/api";
import Dashboard from "./Dashboard";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiFetch: vi.fn() };
});
const mock = vi.mocked(apiFetch);

const loan = (over = {}) => ({
  id: "l1",
  book_id: "b1",
  title: "The Hobbit",
  author: "Tolkien",
  borrowed_at: "2026-11-01T10:00:00Z",
  due_date: "2026-11-15",
  is_overdue: false,
  ...over,
});

function renderIt() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

beforeEach(() => mock.mockReset());

describe("Dashboard", () => {
  it("[AC-029] lists current loans from the API", async () => {
    mock.mockResolvedValue({ current: [loan()], overdue: [] });
    renderIt();
    expect(await screen.findByText("The Hobbit")).toBeInTheDocument();
    expect(screen.getByText("Tolkien")).toBeInTheDocument();
    expect(screen.getByText("01 Nov 2026")).toBeInTheDocument();
    expect(screen.getByText("15 Nov 2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mark returned/ })).toBeInTheDocument();
    expect(mock).toHaveBeenCalledWith("/loans/me");
  });

  it("[AC-031] shows the empty message", async () => {
    mock.mockResolvedValue({ current: [], overdue: [] });
    renderIt();
    expect(await screen.findByText("You have no current loans")).toBeInTheDocument();
  });

  it("[AC-032] overdue loans show an Overdue badge; [AC-033] others do not", async () => {
    const late = loan({ id: "l2", title: "Dune", is_overdue: true, due_date: "2020-01-01" });
    mock.mockResolvedValue({ current: [loan(), late], overdue: [late] });
    renderIt();
    await screen.findAllByText("Dune");
    const section = screen.getByRole("region", { name: "Overdue loans" });
    expect(within(section).getByText("Dune")).toBeInTheDocument();
    expect(within(section).getByText("Overdue")).toBeInTheDocument();
    expect(within(section).queryByText("The Hobbit")).not.toBeInTheDocument();
  });

  it("[AC-034] return posts, confirms and refetches", async () => {
    mock
      .mockResolvedValueOnce({ current: [loan()], overdue: [] })
      .mockResolvedValueOnce({ id: "l1", returned_at: "x" })
      .mockResolvedValueOnce({ current: [], overdue: [] });
    renderIt();
    fireEvent.click(await screen.findByRole("button", { name: /Mark returned/ }));
    expect(await screen.findByText(/marked returned/)).toBeInTheDocument();
    expect(await screen.findByText("You have no current loans")).toBeInTheDocument();
    expect(mock).toHaveBeenCalledWith("/loans/l1/return", { method: "POST" });
    expect(screen.queryByText("Tolkien")).not.toBeInTheDocument();
  });

  it("[NFR-010] failed return shows an alert and keeps the loan", async () => {
    mock
      .mockResolvedValueOnce({ current: [loan()], overdue: [] })
      .mockRejectedValueOnce(new ApiError(409, "Already returned", []));
    renderIt();
    fireEvent.click(await screen.findByRole("button", { name: /Mark returned/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Already returned");
    expect(screen.getByText("The Hobbit")).toBeInTheDocument();
  });

  it("[NFR-010] failed load shows an alert", async () => {
    mock.mockRejectedValueOnce(new ApiError(500, "Boom", []));
    renderIt();
    expect(await screen.findByRole("alert")).toHaveTextContent("Boom");
  });
});
