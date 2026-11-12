import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { getSessionToken, setSessionToken } from "@/lib/api";

function json(status: number, body: unknown) {
  return Promise.resolve(new Response(status === 204 ? null : JSON.stringify(body), { status }));
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

const pw = crypto.randomUUID();

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe("auth", () => {
  it("[AC-008] redirects protected routes to sign-in without a token", () => {
    renderAt("/dashboard");
    expect(screen.queryByText("My dashboard")).not.toBeInTheDocument();
    expect(screen.getByText("No account? Sign up")).toBeInTheDocument();
  });

  it("[AC-007] sign out calls the API, clears the token and redirects", async () => {
    const fetchMock = vi.fn(() => json(204, null));
    vi.stubGlobal("fetch", fetchMock);
    setSessionToken(crypto.randomUUID());
    renderAt("/dashboard");
    fireEvent.click(screen.getAllByText("Sign out")[0]);
    await waitFor(() => expect(screen.getByText("No account? Sign up")).toBeInTheDocument());
    expect(getSessionToken()).toBeNull();
    expect(fetchMock).toHaveBeenCalled();
  });

  it("[AC-005] sign-in stores the token and goes to the dashboard", async () => {
    const token = crypto.randomUUID();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => json(200, { token, token_type: "bearer" })),
    );
    renderAt("/sign-in");
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "a@b.co" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: pw } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(getSessionToken()).toBe(token));
    await waitFor(() => expect(screen.getByText("My dashboard")).toBeInTheDocument());
  });

  it("[AC-006] sign-in 401 shows the generic message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => json(401, { detail: "Invalid email or password", errors: [] })),
    );
    renderAt("/sign-in");
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "a@b.co" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: pw } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(getSessionToken()).toBeNull();
  });

  it("[AC-003] sign-up validates client-side without calling the API", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderAt("/sign-up");
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "nope" } });
    fireEvent.click(screen.getByRole("button", { name: /Sign up/ }));
    expect(screen.getByText(/does not look like an email/)).toBeInTheDocument();
    expect(screen.getByText(/cannot be empty/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("[AC-002] sign-up 409 shows the server message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => json(409, { detail: "Email already registered", errors: [] })),
    );
    renderAt("/sign-up");
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "a@b.co" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: pw } });
    fireEvent.click(screen.getByRole("button", { name: /Sign up/ }));
    expect(await screen.findByText(/Email already registered/)).toBeInTheDocument();
  });

  it("[AC-001] sign-up success goes to sign-in", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => json(201, { id: 1, email: "a@b.co" })),
    );
    renderAt("/sign-up");
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "a@b.co" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: pw } });
    fireEvent.click(screen.getByRole("button", { name: /Sign up/ }));
    expect(await screen.findByText("No account? Sign up")).toBeInTheDocument();
  });
});
