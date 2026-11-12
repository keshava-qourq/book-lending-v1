import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";
import { deleteBookRows, seedLoanDue } from "./support/db";

const API = (process.env.E2E_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
const created: string[] = [];

type User = { email: string; password: string; token: string };

function dayOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function newUser(request: APIRequestContext): Promise<User> {
  const u = { email: `qa-${randomUUID().slice(0, 12)}@example.com`, password: randomUUID() };
  expect((await request.post(`${API}/auth/signup`, { data: u })).status()).toBe(201);
  const res = await request.post(`${API}/auth/signin`, { data: u });
  expect(res.status()).toBe(200);
  return { ...u, token: (await res.json()).token as string };
}

async function apiBook(request: APIRequestContext, title: string, copies: number) {
  const res = await request.post(`${API}/auth/signin`, { data: adminCredentials() });
  const admin = (await res.json()).token as string;
  const b = await request.post(`${API}/books`, {
    headers: { Authorization: `Bearer ${admin}` },
    data: { title, author: "QA Author", total_copies: copies },
  });
  expect(b.status()).toBe(201);
  const id = (await b.json()).id as string;
  created.push(id);
  return id;
}

async function borrow(request: APIRequestContext, id: string, token: string): Promise<string> {
  const r = await request.post(`${API}/books/${id}/borrow`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(r.status()).toBe(201);
  return (await r.json()).id as string;
}

async function available(request: APIRequestContext, id: string, token: string) {
  const r = await request.get(`${API}/books/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (await r.json()).available_copies as number;
}

async function availableAsAdmin(request: APIRequestContext, id: string): Promise<number> {
  const res = await request.post(`${API}/auth/signin`, { data: adminCredentials() });
  const admin = (await res.json()).token as string;
  return available(request, id, admin);
}

async function signIn(page: Page, u: { email: string; password: string }) {
  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(u.email);
  await page.getByLabel(/password/i).fill(u.password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

const overdueTable = (page: Page) => page.getByRole("table", { name: "Overdue loans" });
const currentTable = (page: Page) => page.getByRole("table", { name: "Current loans" });

test.afterAll(async () => {
  for (const id of created.splice(0)) await deleteBookRows(id).catch(() => undefined);
});

test("[AC-029] two borrowed books are listed with title, author, dates and Mark returned", async ({
  page,
  request,
}) => {
  const t1 = `QA Dash A ${randomUUID().slice(0, 8)}`;
  const t2 = `QA Dash B ${randomUUID().slice(0, 8)}`;
  const id1 = await apiBook(request, t1, 2);
  const id2 = await apiBook(request, t2, 2);
  const u = await newUser(request);
  await borrow(request, id1, u.token);
  await borrow(request, id2, u.token);
  await signIn(page, u);
  for (const t of [t1, t2]) {
    const r = currentTable(page).getByRole("row").filter({ hasText: t });
    await expect(r).toHaveCount(1);
    await expect(r).toContainText("QA Author");
    await expect(r).toContainText(/\d{2} [A-Z][a-z]{2} \d{4}/);
    await expect(r.getByRole("button", { name: `Mark returned: ${t}` })).toBeVisible();
  }
  const due = new Date(dayOffset(14) + "T00:00:00Z");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dueText = `${String(due.getUTCDate()).padStart(2, "0")} ${months[due.getUTCMonth()]} ${due.getUTCFullYear()}`;
  await expect(currentTable(page).getByRole("row").filter({ hasText: t1 })).toContainText(dueText);
});

test("[AC-030][NFR-005] another user's loans never appear on my dashboard", async ({
  page,
  request,
}) => {
  const title = `QA Private ${randomUUID().slice(0, 8)}`;
  const id = await apiBook(request, title, 2);
  const owner = await newUser(request);
  const me = await newUser(request);
  await borrow(request, id, owner.token);
  await signIn(page, me);
  await expect(page.getByText("My dashboard")).toBeVisible();
  await expect(page.getByText(title)).toHaveCount(0);
});

test("[AC-031] a user with no loans sees 'You have no current loans'", async ({
  page,
  request,
}) => {
  const u = await newUser(request);
  await signIn(page, u);
  await expect(page.getByText(/You have no current loans/)).toBeVisible();
});

test("[AC-032] a loan with a past due date appears in the overdue list", async ({
  page,
  request,
}) => {
  const title = `QA Late ${randomUUID().slice(0, 8)}`;
  const id = await apiBook(request, title, 2);
  const u = await newUser(request);
  await seedLoanDue(id, u.email, dayOffset(-5));
  await signIn(page, u);
  await expect(overdueTable(page).getByRole("row").filter({ hasText: title })).toHaveCount(1);
});

test("[AC-033] loans due today or later are not in the overdue list", async ({ page, request }) => {
  const tToday = `QA DueToday ${randomUUID().slice(0, 8)}`;
  const tLater = `QA DueLater ${randomUUID().slice(0, 8)}`;
  const id1 = await apiBook(request, tToday, 2);
  const id2 = await apiBook(request, tLater, 2);
  const u = await newUser(request);
  await seedLoanDue(id1, u.email, dayOffset(0));
  await seedLoanDue(id2, u.email, dayOffset(3));
  await signIn(page, u);
  await expect(currentTable(page).getByText(tToday)).toHaveCount(1);
  await expect(currentTable(page).getByText(tLater)).toHaveCount(1);
  await expect(overdueTable(page).getByText(tToday)).toHaveCount(0);
  await expect(overdueTable(page).getByText(tLater)).toHaveCount(0);
});

test("[AC-034] returning an overdue loan removes it from both lists and frees a copy", async ({
  page,
  request,
}) => {
  const title = `QA LateRet ${randomUUID().slice(0, 8)}`;
  const id = await apiBook(request, title, 2);
  const u = await newUser(request);
  await seedLoanDue(id, u.email, dayOffset(-4));
  await signIn(page, u);
  await expect(overdueTable(page).getByText(title)).toHaveCount(1);
  await overdueTable(page)
    .getByRole("button", { name: `Mark returned: ${title}` })
    .click();
  await expect.poll(() => availableAsAdmin(request, id)).toBe(2);
  await page.reload();
  await expect(overdueTable(page)).toBeVisible();
  await expect(overdueTable(page).getByText(title)).toHaveCount(0);
  await expect(currentTable(page).getByText(title)).toHaveCount(0);
  await page.goto("/books");
  await expect(
    page.getByRole("row").filter({ hasText: title }).getByRole("cell").nth(2),
  ).toHaveText("2");
});

test("[AC-026] marking a current loan returned shows it as returned and frees a copy", async ({
  page,
  request,
}) => {
  const title = `QA RetNow ${randomUUID().slice(0, 8)}`;
  const id = await apiBook(request, title, 2);
  const u = await newUser(request);
  await borrow(request, id, u.token);
  await signIn(page, u);
  await page.getByRole("button", { name: `Mark returned: ${title}` }).click();
  await expect(page.getByRole("status")).toContainText(new RegExp(`${title}.*marked returned`));
  await expect.poll(() => availableAsAdmin(request, id)).toBe(2);
});

test("[AC-027][NFR-008] replaying a return is refused and copies do not increase again", async ({
  request,
}) => {
  const id = await apiBook(request, `QA Replay ${randomUUID().slice(0, 8)}`, 2);
  const u = await newUser(request);
  const loan = await borrow(request, id, u.token);
  const h = { Authorization: `Bearer ${u.token}` };
  expect((await request.post(`${API}/loans/${loan}/return`, { headers: h })).status()).toBe(200);
  const again = await request.post(`${API}/loans/${loan}/return`, { headers: h });
  expect(again.status()).toBeGreaterThanOrEqual(400);
  expect(await available(request, id, u.token)).toBe(2);
});

test("[AC-028][NFR-005] another user's return is refused with 403 and the loan stays", async ({
  page,
  request,
}) => {
  const title = `QA NotYours ${randomUUID().slice(0, 8)}`;
  const id = await apiBook(request, title, 2);
  const owner = await newUser(request);
  const other = await newUser(request);
  const loan = await borrow(request, id, owner.token);
  const r = await request.post(`${API}/loans/${loan}/return`, {
    headers: { Authorization: `Bearer ${other.token}` },
  });
  expect(r.status()).toBe(403);
  expect(await available(request, id, owner.token)).toBe(1);
  await signIn(page, owner);
  await expect(currentTable(page).getByText(title)).toHaveCount(1);
});

test("[NFR-003] visiting /dashboard while signed out redirects to /sign-in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("table")).toHaveCount(0);
});

test("[NFR-007] the dashboard lists many loans for one user", async ({ page, request }) => {
  const u = await newUser(request);
  const titles: string[] = [];
  for (let i = 0; i < 6; i++) {
    const t = `QA Many ${i} ${randomUUID().slice(0, 6)}`;
    titles.push(t);
    await borrow(request, await apiBook(request, t, 3), u.token);
  }
  await signIn(page, u);
  for (const t of titles) await expect(currentTable(page).getByText(t)).toHaveCount(1);
});
