import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";
import { deleteBookRows } from "./support/db";

const API = (process.env.E2E_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
const created: string[] = [];

async function newUser(request: APIRequestContext) {
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
  const r = await request.get(`${API}/books/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return (await r.json()).available_copies as number;
}

async function signIn(page: Page, u: { email: string; password: string }) {
  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(u.email);
  await page.getByLabel(/password/i).fill(u.password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.afterAll(async () => {
  for (const id of created.splice(0)) await deleteBookRows(id).catch(() => undefined);
});

test("[AC-026] marking a loan returned removes it from the dashboard and frees a copy", async ({
  page,
  request,
}) => {
  const title = `QA Return ${randomUUID().slice(0, 8)}`;
  const id = await apiBook(request, title, 2);
  const u = await newUser(request);
  await borrow(request, id, u.token);
  expect(await available(request, id, u.token)).toBe(1);
  await signIn(page, u);
  await expect(page.getByText(title).first()).toBeVisible();
  await page.getByRole("button", { name: `Mark returned: ${title}` }).click();
  await expect(page.getByRole("button", { name: `Mark returned: ${title}` })).toHaveCount(0);
  await expect.poll(() => available(request, id, u.token)).toBe(2);
});

test("[AC-027][NFR-008] returning twice does not add a copy twice", async ({ request }) => {
  const id = await apiBook(request, `QA Twice ${randomUUID().slice(0, 8)}`, 2);
  const u = await newUser(request);
  const loan = await borrow(request, id, u.token);
  const h = { Authorization: `Bearer ${u.token}` };
  expect((await request.post(`${API}/loans/${loan}/return`, { headers: h })).status()).toBe(200);
  await request.post(`${API}/loans/${loan}/return`, { headers: h });
  expect(await available(request, id, u.token)).toBe(2);
});

test("[AC-028][NFR-005] another user's loan cannot be returned and is not on their dashboard", async ({
  page,
  request,
}) => {
  const title = `QA Other ${randomUUID().slice(0, 8)}`;
  const id = await apiBook(request, title, 2);
  const owner = await newUser(request);
  const other = await newUser(request);
  const loan = await borrow(request, id, owner.token);
  await signIn(page, other);
  await expect(page.getByText(title)).toHaveCount(0);
  const r = await request.post(`${API}/loans/${loan}/return`, {
    headers: { Authorization: `Bearer ${other.token}` },
  });
  expect([403, 404]).toContain(r.status());
  expect(await available(request, id, owner.token)).toBe(1);
});

test("[NFR-003] return without a token is refused and changes nothing", async ({ request }) => {
  const id = await apiBook(request, `QA NoAuthRet ${randomUUID().slice(0, 8)}`, 1);
  const u = await newUser(request);
  const loan = await borrow(request, id, u.token);
  expect((await request.post(`${API}/loans/${loan}/return`)).status()).toBe(401);
  expect(await available(request, id, u.token)).toBe(0);
});
