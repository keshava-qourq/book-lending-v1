import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("[AC-008] redirects an unauthenticated visit to the dashboard to sign in", async () => {
    localStorage.clear();
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );
    expect((await screen.findAllByText(/sign in/i)).length).toBeGreaterThan(0);
  });

  it("renders a screen inside the app shell and shows its menu", () => {
    localStorage.setItem("session_token", "test-session");
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );
    // getAllByText, not getByText: the page may repeat its menu item's text.
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
  });
});
