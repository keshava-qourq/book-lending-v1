import { expect, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";

const API = (process.env.E2E_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");

function uniqueUser() {
  const id = randomUUID().slice(0, 12);
  return { email: `qa-${id}@example.com`, password: `pw-${randomUUID()}` };
}

function smokeCredentials() {
  const email = process.env.SMOKE_TEST_EMAIL;
  const password = process.env.SMOKE_TEST_PASSWORD;
  if (!email || !password) {
    throw new Error("SMOKE_TEST_EMAIL and SMOKE_TEST_PASSWORD are not set.");
  }
  return { email, password };
}

async function signUpUi(page: Page, email: string, password: string) {
  await page.goto("/sign-up");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign up/i }).click();
}

async function signInUi(page: Page, email: string, password: string) {
  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
}

async function apiSignUp(request: import("@playwright/test").APIRequestContext, u: { email: string; password: string }) {
  return request.post(`${API}/auth/signup`, { data: u });
}

async function apiSignIn(request: import("@playwright/test").APIRequestContext, u: { email: string; password: string }) {
  return request.post(`${API}/auth/signin`, { data: u });
}

test("[AC-001] new visitor signs up and then signs in", async ({ page, request }) => {
  const u = uniqueUser();
  await signUpUi(page, u.email, u.password);
  await page.waitForTimeout(1500);
  // The account must really exist: the credentials sign in.
  const res = await apiSignIn(request, u);
  expect(res.status()).toBe(200);
  await signInUi(page, u.email, u.password);
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("[AC-002] duplicate email in other letter case shows already exists; original works", async ({ page, request }) => {
  const u = uniqueUser();
  expect((await apiSignUp(request, u)).status()).toBe(201);
  await signUpUi(page, u.email.toUpperCase(), `pw-${randomUUID()}`);
  await expect(page.getByText(/already exists|already registered/i).first()).toBeVisible();
  const res = await apiSignIn(request, u);
  expect(res.status()).toBe(200);
});

test("[AC-003][NFR-010] invalid email and empty password show what to fix and create nothing", async ({ page, request }) => {
  const bad = uniqueUser();
  await page.goto("/sign-up");
  await page.getByLabel(/email/i).fill("not-an-email");
  await page.getByLabel(/password/i).fill(bad.password);
  await page.getByRole("button", { name: /sign up/i }).click();
  await expect(page.getByText(/email/i).filter({ hasText: /fix|valid|look like/i }).first()).toBeVisible();
  expect((await apiSignIn(request, { email: "not-an-email", password: bad.password })).status()).not.toBe(200);

  const empty = uniqueUser();
  await page.goto("/sign-up");
  await page.getByLabel(/email/i).fill(empty.email);
  await page.getByRole("button", { name: /sign up/i }).click();
  await expect(page.getByText(/password/i).filter({ hasText: /fix|empty|enter|required/i }).first()).toBeVisible();
  expect((await apiSignIn(request, { email: empty.email, password: "" })).status()).not.toBe(200);
  await expect(page).toHaveURL(/\/sign-up$/);
});

test("[AC-005] correct credentials land on /dashboard (new user, admin, smoke user)", async ({ page, request }) => {
  const u = uniqueUser();
  expect((await apiSignUp(request, u)).status()).toBe(201);
  for (const creds of [u, adminCredentials(), smokeCredentials()]) {
    await page.goto("/sign-in");
    await page.evaluate(() => localStorage.clear());
    await signInUi(page, creds.email, creds.password);
    await expect(page).toHaveURL(/\/dashboard$/);
    expect(await page.evaluate(() => localStorage.getItem("session_token"))).toBeTruthy();
  }
});

test("[AC-006][NFR-004] wrong password and unknown email show identical generic message", async ({ page, request }) => {
  const u = uniqueUser();
  expect((await apiSignUp(request, u)).status()).toBe(201);

  await signInUi(page, u.email, `wrong-${randomUUID()}`);
  const alert1 = page.getByRole("alert").first();
  await expect(alert1).toBeVisible();
  const wrongPw = (await alert1.innerText()).trim();

  await signInUi(page, uniqueUser().email, `wrong-${randomUUID()}`);
  const alert2 = page.getByRole("alert").first();
  await expect(alert2).toBeVisible();
  const unknown = (await alert2.innerText()).trim();

  expect(wrongPw).toBe(unknown);
  expect(wrongPw).toMatch(/invalid email or password/i);
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("[AC-007] after sign-out the token is rejected and protected pages redirect", async ({ page, request }) => {
  const u = uniqueUser();
  expect((await apiSignUp(request, u)).status()).toBe(201);
  await signInUi(page, u.email, u.password);
  await expect(page).toHaveURL(/\/dashboard$/);
  const token = await page.evaluate(() => localStorage.getItem("session_token"));
  expect(token).toBeTruthy();

  const out = await page.getByRole("button", { name: /sign out/i }).or(page.getByRole("link", { name: /sign out/i }));
  await out.first().click();
  await expect(page).toHaveURL(/\/sign-in$/);

  const res = await request.post(`${API}/auth/signout`, { headers: { Authorization: `Bearer ${token}` } });
  expect(res.status()).toBe(401);
  for (const path of ["/dashboard", "/books"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/sign-in$/);
  }
});

test("[AC-008][NFR-003] unauthenticated visits redirect and API returns 401", async ({ page, request }) => {
  for (const path of ["/dashboard", "/books", "/book-form"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole("table")).toHaveCount(0);
  }
  const out = await request.post(`${API}/auth/signout`);
  expect(out.status()).toBe(401);
});

test("[AC-009] invalid token in localStorage returns the user to /sign-in", async ({ page, request }) => {
  const bad = `expired-${randomUUID()}`;
  const res = await request.post(`${API}/auth/signout`, {
    headers: { Authorization: `Bearer ${bad}` },
  });
  expect(res.status()).toBe(401);

  await page.goto("/sign-in");
  await page.evaluate((t) => localStorage.setItem("session_token", t), bad);
  await page.goto("/dashboard");
  // The next protected request (sign-out) is rejected, so the session is dropped.
  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  expect(await page.evaluate(() => localStorage.getItem("session_token"))).toBeNull();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("[NFR-007] several users can sign up and sign in side by side", async ({ request }) => {
  const users = Array.from({ length: 10 }, () => uniqueUser());
  for (const u of users) {
    expect((await apiSignUp(request, u)).status()).toBe(201);
  }
  for (const u of users) {
    expect((await apiSignIn(request, u)).status()).toBe(200);
  }
});

test("[NFR-001][NFR-006] sign-up response exposes only id and email, never the password", async ({ request }) => {
  const u = uniqueUser();
  const res = await apiSignUp(request, u);
  expect(res.status()).toBe(201);
  const body = await res.json();
  expect(Object.keys(body).sort()).toEqual(["email", "id"]);
  expect(JSON.stringify(body)).not.toContain(u.password);
});
