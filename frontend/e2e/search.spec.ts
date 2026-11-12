import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";
import { deleteBookRows, seedActiveLoans } from "./support/db";

const API = (process.env.E2E_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
const created: string[] = [];

type User = { email: string; password: string; token: string };

async function adminToken(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API}/auth/signin`, { data: adminCredentials() });
  expect(res.status()).toBe(200);
  return (await res.json()).token as string;
}

async function newUser(request: APIRequestContext): Promise<User> {
  const u = { email: `qa-${randomUUID().slice(0, 12)}@example.com`, password: randomUUID() };
  expect((await request.post(`${API}/auth/signup`, { data: u })).status()).toBe(201);
  const res = await request.post(`${API}/auth/signin`, { data: u });
  expect(res.status()).toBe(200);
  return { ...u, token: (await res.json()).token as string };
}

async function apiBook(
  request: APIRequestContext,
  title: string,
  author: string,
  copies: number,
): Promise<string> {
  const token = await adminToken(request);
  const res = await request.post(`${API}/books`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title, author, total_copies: copies },
  });
  expect(res.status()).toBe(201);
  const id = (await res.json()).id as string;
  created.push(id);
  return id;
}

async function signInAdmin(page: Page) {
  const a = adminCredentials();
  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(a.email);
  await page.getByLabel(/password/i).fill(a.password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

function row(page: Page, text: string) {
  return page.getByRole("row").filter({ hasText: text });
}

function searchBox(page: Page) {
  return page
    .getByRole("searchbox")
    .or(page.getByRole("textbox", { name: /search/i }))
    .first();
}

async function search(page: Page, text: string) {
  const box = searchBox(page);
  await box.fill(text);
  await box.press("Enter");
}

async function openBooks(page: Page) {
  await page.goto("/books");
  await expect(searchBox(page)).toBeVisible();
}

function availableToggle(page: Page) {
  return page
    .getByRole("checkbox", { name: /available/i })
    .or(page.getByRole("switch", { name: /available/i }))
    .or(page.getByRole("button", { name: /available/i }))
    .or(page.getByRole("link", { name: /available/i }))
    .first();
}

async function openAvailableOnly(page: Page) {
  await openBooks(page);
  const t = availableToggle(page);
  const role = await t.getAttribute("role");
  const type = await t.getAttribute("type");
  if (type === "checkbox" || role === "switch") {
    if (!(await t.isChecked())) await t.check();
  } else {
    await t.click();
  }
}

test.afterAll(async () => {
  for (const id of created.splice(0)) await deleteBookRows(id).catch(() => undefined);
});

test("[AC-017][NFR-011] search 'hobbit' then 'TOLKIEN' lists The Hobbit each time", async ({
  page,
  request,
}) => {
  const title = `The Hobbit ${randomUUID().slice(0, 8)}`;
  await apiBook(request, title, "J.R.R. Tolkien", 2);
  await signInAdmin(page);
  await openBooks(page);
  await search(page, "hobbit");
  await expect(row(page, title)).toBeVisible();
  await search(page, "TOLKIEN");
  await expect(row(page, title)).toBeVisible();
});

test("[AC-018] searching a random string shows 'No books found'", async ({ page }) => {
  await signInAdmin(page);
  await openBooks(page);
  await search(page, `zz${randomUUID()}`);
  await expect(page.getByText(/No books found/i).first()).toBeVisible();
});

test("[AC-019][NFR-011] partial fragments of a title and an author list the matches", async ({
  page,
  request,
}) => {
  const tag = randomUUID().slice(0, 8);
  const title = `Zanzibar Chronicle ${tag}`;
  const author = `Quillfeather${tag}`;
  await apiBook(request, title, author, 1);
  await signInAdmin(page);
  await openBooks(page);
  await search(page, "anziba");
  await expect(row(page, title)).toBeVisible();
  await search(page, `illfeather${tag}`.toUpperCase());
  await expect(row(page, title)).toBeVisible();
});

test("[AC-020] available-only browse lists only the book with copies, with its details", async ({
  page,
  request,
}) => {
  const tag = randomUUID().slice(0, 8);
  const free = `QA Free ${tag}`;
  const gone = `QA Gone ${tag}`;
  await apiBook(request, free, "QA Author", 2);
  const goneId = await apiBook(request, gone, "QA Author", 1);
  const u = await newUser(request);
  await seedActiveLoans(goneId, [u.email]);
  await signInAdmin(page);
  await openAvailableOnly(page);
  const r = row(page, free);
  await expect(r).toBeVisible();
  await expect(r).toContainText("QA Author");
  await expect(r.getByRole("cell").nth(2)).toHaveText("2");
  await expect(row(page, gone)).toHaveCount(0);
});

test("[AC-021] after the last copy is borrowed, refreshing the browse view drops the book", async ({
  page,
  request,
}) => {
  const title = `QA Last ${randomUUID().slice(0, 8)}`;
  const id = await apiBook(request, title, "QA Author", 1);
  await signInAdmin(page);
  await openAvailableOnly(page);
  await expect(row(page, title)).toBeVisible();
  const u = await newUser(request);
  const res = await request.post(`${API}/books/${id}/borrow`, {
    headers: { Authorization: `Bearer ${u.token}` },
  });
  expect(res.status()).toBe(201);
  await page.reload();
  await expect(searchBox(page)).toBeVisible();
  // Reload may keep or reset the filter; make sure it is on.
  const t = availableToggle(page);
  const type = await t.getAttribute("type");
  const role = await t.getAttribute("role");
  if ((type === "checkbox" || role === "switch") && !(await t.isChecked())) await t.check();
  await expect(row(page, title)).toHaveCount(0);
});

test("[NFR-007] search lists many books at once", async ({ page, request }) => {
  const tag = randomUUID().slice(0, 8);
  const titles = Array.from({ length: 8 }, (_, i) => `QA Bulk ${i} ${tag}`);
  for (const t of titles) await apiBook(request, t, "QA Author", 2);
  await signInAdmin(page);
  await openBooks(page);
  await search(page, `bulk`);
  for (const t of titles) await expect(row(page, t)).toBeVisible();
});

test("[NFR-003] visiting /books while signed out redirects to /sign-in", async ({ page }) => {
  await page.goto("/books");
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("table")).toHaveCount(0);
});
