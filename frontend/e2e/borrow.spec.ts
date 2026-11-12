import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";
import { deleteBookRows } from "./support/db";

const API = (process.env.E2E_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
const created: string[] = [];

type Creds = { email: string; password: string };

async function adminToken(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API}/auth/signin`, { data: adminCredentials() });
  expect(res.status()).toBe(200);
  return (await res.json()).token as string;
}

async function newUser(request: APIRequestContext): Promise<Creds & { token: string }> {
  const u = { email: `qa-${randomUUID().slice(0, 12)}@example.com`, password: randomUUID() };
  expect((await request.post(`${API}/auth/signup`, { data: u })).status()).toBe(201);
  const res = await request.post(`${API}/auth/signin`, { data: u });
  expect(res.status()).toBe(200);
  return { ...u, token: (await res.json()).token };
}

async function apiBook(request: APIRequestContext, title: string, copies: number) {
  const token = await adminToken(request);
  const res = await request.post(`${API}/books`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title, author: "QA Author", total_copies: copies },
  });
  expect(res.status()).toBe(201);
  const id = (await res.json()).id as string;
  created.push(id);
  return id;
}

async function signIn(page: Page, u: Creds) {
  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(u.email);
  await page.getByLabel(/password/i).fill(u.password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

function row(page: Page, title: string) {
  return page.getByRole("row").filter({ hasText: title });
}

function borrowButton(page: Page, title: string) {
  const r = row(page, title);
  return r.getByRole("button", { name: /borrow/i }).first();
}

async function myLoans(request: APIRequestContext, token: string) {
  const res = await request.get(`${API}/loans/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  return (body.current ?? []) as Array<{ title: string; due_date: string }>;
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

test.afterAll(async () => {
  for (const id of created.splice(0)) await deleteBookRows(id).catch(() => undefined);
});

test("[AC-022] borrowing an available book shows due date in 14 days and drops available by one", async ({
  page,
  request,
}) => {
  const title = `QA Borrow ${randomUUID().slice(0, 8)}`;
  await apiBook(request, title, 3);
  const u = await newUser(request);
  await signIn(page, u);
  await page.goto("/books");
  await expect(row(page, title).getByRole("cell").nth(2)).toHaveText("3");
  await borrowButton(page, title).click();
  await expect(row(page, title).getByRole("cell").nth(2)).toHaveText("2");
  await expect(page.getByText(/due/i).first()).toBeVisible();
  const loans = await myLoans(request, u.token);
  const mine = loans.filter((l) => l.title === title);
  expect(mine).toHaveLength(1);
  expect(mine[0].due_date.slice(0, 10)).toBe(todayPlus(14));
});

test("[AC-023][NFR-010] a book with 0 available copies is refused with visible text and no loan", async ({
  page,
  request,
}) => {
  const title = `QA Zero ${randomUUID().slice(0, 8)}`;
  await apiBook(request, title, 1);
  const first = await newUser(request);
  const bookId = created[created.length - 1];
  expect(
    (
      await request.post(`${API}/books/${bookId}/borrow`, {
        headers: { Authorization: `Bearer ${first.token}` },
      })
    ).status(),
  ).toBe(201);

  const u = await newUser(request);
  await signIn(page, u);
  await page.goto("/books");
  await expect(row(page, title).getByRole("cell").nth(2)).toHaveText("0");
  const btn = borrowButton(page, title);
  if (await btn.isEnabled()) await btn.click();
  await expect(page.getByText(/no copies available|not available|unavailable/i).first()).toBeVisible();
  await expect(row(page, title).getByRole("cell").nth(2)).toHaveText("0");
  await page.goto("/dashboard");
  await expect(page.getByText(title)).toHaveCount(0);
  expect((await myLoans(request, u.token)).filter((l) => l.title === title)).toHaveLength(0);
});

test("[AC-024][NFR-010] borrowing the same book twice shows already borrowed; one loan exists", async ({
  page,
  request,
}) => {
  const title = `QA Twice ${randomUUID().slice(0, 8)}`;
  await apiBook(request, title, 3);
  const u = await newUser(request);
  await signIn(page, u);
  await page.goto("/books");
  await borrowButton(page, title).click();
  await expect(row(page, title).getByRole("cell").nth(2)).toHaveText("2");
  const again = borrowButton(page, title);
  if (await again.isEnabled()) await again.click();
  await expect(page.getByText(/already borrowed/i).first()).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByText(title)).toHaveCount(1);
  expect((await myLoans(request, u.token)).filter((l) => l.title === title)).toHaveLength(1);
});

test("[AC-025][NFR-008] two users borrowing the last copy concurrently: one 201, one 409, available 0", async ({
  request,
}) => {
  const title = `QA Race ${randomUUID().slice(0, 8)}`;
  const id = await apiBook(request, title, 1);
  const [a, b] = await Promise.all([newUser(request), newUser(request)]);
  const results = await Promise.all(
    [a, b].map((u) =>
      request.post(`${API}/books/${id}/borrow`, {
        headers: { Authorization: `Bearer ${u.token}` },
      }),
    ),
  );
  expect(results.map((r) => r.status()).sort()).toEqual([201, 409]);
  const res = await request.get(`${API}/books/${id}`, {
    headers: { Authorization: `Bearer ${a.token}` },
  });
  expect((await res.json()).available_copies).toBe(0);
});

test("[NFR-003] borrow without a token returns 401 and unauthenticated visits redirect", async ({
  page,
  request,
}) => {
  const title = `QA NoAuth ${randomUUID().slice(0, 8)}`;
  const id = await apiBook(request, title, 1);
  expect((await request.post(`${API}/books/${id}/borrow`)).status()).toBe(401);
  const token = await adminToken(request);
  const res = await request.get(`${API}/books/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect((await res.json()).available_copies).toBe(1);
  for (const p of ["/dashboard", "/books"]) {
    await page.goto(p);
    await expect(page).toHaveURL(/\/sign-in$/);
  }
});

test("[NFR-007] several books and users borrow side by side", async ({ request }) => {
  const ids = await Promise.all(
    Array.from({ length: 5 }, (_, i) => apiBook(request, `QA Many ${i} ${randomUUID().slice(0, 6)}`, 5)),
  );
  const users = await Promise.all(Array.from({ length: 5 }, () => newUser(request)));
  for (const u of users) {
    for (const id of ids) {
      const r = await request.post(`${API}/books/${id}/borrow`, {
        headers: { Authorization: `Bearer ${u.token}` },
      });
      expect(r.status()).toBe(201);
    }
  }
});
