import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";
import { deleteBookRows, seedActiveLoans } from "./support/db";

const API = (process.env.E2E_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
const created: string[] = [];

async function signIn(page: Page): Promise<string> {
  const a = adminCredentials();
  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(a.email);
  await page.getByLabel(/password/i).fill(a.password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const t = await page.evaluate(() => localStorage.getItem("session_token"));
  expect(t).toBeTruthy();
  return t as string;
}

async function apiBook(request: APIRequestContext, token: string, title: string, copies: number) {
  const res = await request.post(`${API}/books`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title, author: "QA Author", total_copies: copies },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  created.push(body.id);
  return body.id as string;
}

async function newUsers(request: APIRequestContext, n: number) {
  const users = Array.from({ length: n }, () => ({
    email: `qa-${randomUUID().slice(0, 12)}@example.com`,
    password: randomUUID(),
  }));
  for (const u of users) {
    expect((await request.post(`${API}/auth/signup`, { data: u })).status()).toBe(201);
  }
  return users;
}

async function fillForm(page: Page, title: string, author: string, copies: string) {
  await page.getByLabel(/title/i).fill(title);
  await page.getByLabel(/author/i).fill(author);
  await page.getByLabel(/copies/i).fill(copies);
}

function row(page: Page, title: string) {
  return page.getByRole("row").filter({ hasText: title });
}

async function openAll(page: Page) {
  await page.goto("/books");
}

async function clickEdit(page: Page, title: string) {
  const r = row(page, title);
  await r
    .getByRole("link", { name: /edit/i })
    .or(r.getByRole("button", { name: /edit/i }))
    .first()
    .click();
}

test.afterAll(async () => {
  for (const id of created.splice(0)) await deleteBookRows(id).catch(() => undefined);
});

test("[AC-010] adding a book with 3 copies shows it with 3 available", async ({
  page,
  request,
}) => {
  const token = await signIn(page);
  const title = `QA Add ${randomUUID().slice(0, 8)}`;
  await page.goto("/books");
  await page.getByRole("button", { name: /add book/i }).click();
  await fillForm(page, title, "QA Author", "3");
  await page.getByRole("button", { name: /save book/i }).click();
  await expect(page).toHaveURL(/\/books$/);
  const r = row(page, title);
  await expect(r).toBeVisible();
  await expect(r.getByRole("cell").nth(2)).toHaveText("3");
  await expect(r.getByRole("cell").nth(3)).toHaveText("3");
  const res = await request.get(`${API}/books`, { headers: { Authorization: `Bearer ${token}` } });
  const list = await res.json();
  const arr = Array.isArray(list) ? list : (list.items ?? []);
  const hit = arr.find((b: { title: string }) => b.title === title);
  if (hit) created.push(hit.id);
});

test("[AC-011][NFR-010] invalid title, author and copies show a message and save nothing", async ({
  page,
  request,
}) => {
  const token = await signIn(page);
  const marker = `QA Invalid ${randomUUID().slice(0, 8)}`;
  const cases: Array<[string, string, string, string]> = [
    ["", "QA Author", "2", "title"],
    [marker, "", "2", "author"],
    [marker, "QA Author", "abc", "copies"],
    [marker, "QA Author", "-1", "copies"],
    [marker, "QA Author", "0", "copies"],
    [marker, "QA Author", "1.5", "copies"],
  ];
  for (const [t, a, c, f] of cases) {
    await page.goto("/book-form");
    await fillForm(page, t, a, c);
    await page.getByRole("button", { name: /save book/i }).click();
    await expect(page.locator(`#err-${f === "copies" ? "total_copies" : f}`)).toBeVisible();
    await expect(page).toHaveURL(/\/book-form$/);
  }
  const res = await request.get(`${API}/books`, { headers: { Authorization: `Bearer ${token}` } });
  expect(JSON.stringify(await res.json())).not.toContain(marker);
});

test("[AC-012] editing title, author and copies saves the new values", async ({
  page,
  request,
}) => {
  const token = await signIn(page);
  const title = `QA Edit ${randomUUID().slice(0, 8)}`;
  await apiBook(request, token, title, 2);
  await openAll(page);
  await clickEdit(page, title);
  const newTitle = `${title} v2`;
  await fillForm(page, newTitle, "QA Author Two", "5");
  await page.getByRole("button", { name: /save book/i }).click();
  await expect(page).toHaveURL(/\/books$/);
  const r = row(page, newTitle);
  await expect(r).toBeVisible();
  await expect(r).toContainText("QA Author Two");
  await expect(r.getByRole("cell").nth(3)).toHaveText("5");
});

test("[AC-013][NFR-010] total copies below the number on loan is rejected", async ({
  page,
  request,
}) => {
  const token = await signIn(page);
  const title = `QA Loan ${randomUUID().slice(0, 8)}`;
  const id = await apiBook(request, token, title, 3);
  const users = await newUsers(request, 2);
  await seedActiveLoans(
    id,
    users.map((u) => u.email),
  );
  await openAll(page);
  await clickEdit(page, title);
  await page.getByLabel(/copies/i).fill("1");
  await page.getByRole("button", { name: /save book/i }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: /on loan/i })
      .first(),
  ).toContainText(/cannot be below the .*on loan/i);
  await expect(page).toHaveURL(/\/book-form(\/[^/]+)?$/);
});

test("[AC-014] raising total copies with active loans raises available by the same amount", async ({
  page,
  request,
}) => {
  const token = await signIn(page);
  const title = `QA Raise ${randomUUID().slice(0, 8)}`;
  const id = await apiBook(request, token, title, 3);
  const users = await newUsers(request, 2);
  await seedActiveLoans(
    id,
    users.map((u) => u.email),
  );
  await openAll(page);
  await expect(row(page, title).getByRole("cell").nth(2)).toHaveText("1");
  await clickEdit(page, title);
  await page.getByLabel(/copies/i).fill("6");
  await page.getByRole("button", { name: /save book/i }).click();
  await expect(page).toHaveURL(/\/books$/);
  const r = row(page, title);
  await expect(r.getByRole("cell").nth(3)).toHaveText("6");
  await expect(r.getByRole("cell").nth(2)).toHaveText("4");
});

test("[AC-015] deleting a book with no loans after confirming removes it", async ({
  page,
  request,
}) => {
  const token = await signIn(page);
  const title = `QA Del ${randomUUID().slice(0, 8)}`;
  await apiBook(request, token, title, 1);
  await openAll(page);
  await page.getByRole("button", { name: `Delete ${title}` }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: /confirm delete/i })
    .click();
  await expect(row(page, title)).toHaveCount(0);
  await page.reload();
  await expect(row(page, title)).toHaveCount(0);
});

test("[AC-016][NFR-010] deleting a book on loan is refused and the book remains", async ({
  page,
  request,
}) => {
  const token = await signIn(page);
  const title = `QA Keep ${randomUUID().slice(0, 8)}`;
  const id = await apiBook(request, token, title, 2);
  const users = await newUsers(request, 1);
  await seedActiveLoans(id, [users[0].email]);
  await openAll(page);
  await page.getByRole("button", { name: `Delete ${title}` }).click();
  const dlg = page.getByRole("alertdialog");
  await dlg.getByRole("button", { name: /confirm delete/i }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: /on loan/i })
      .first(),
  ).toBeVisible();
  await dlg.getByRole("button", { name: /cancel/i }).click();
  await page.reload();
  await expect(row(page, title)).toBeVisible();
});

test("[NFR-003] unauthenticated book writes return 401 and visits redirect", async ({
  page,
  request,
}) => {
  const title = `QA Unauth ${randomUUID().slice(0, 8)}`;
  const body = { title, author: "x", total_copies: 1 };
  expect((await request.post(`${API}/books`, { data: body })).status()).toBe(401);
  const id = randomUUID();
  expect((await request.put(`${API}/books/${id}`, { data: body })).status()).toBe(401);
  expect((await request.delete(`${API}/books/${id}`)).status()).toBe(401);
  for (const p of ["/books", "/book-form"]) {
    await page.goto(p);
    await expect(page).toHaveURL(/\/sign-in$/);
  }
});
