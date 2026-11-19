import { test, expect } from '@playwright/test';
import { assertCustomerResponsiveLayouts } from './customer-layout';

let serverErrors: string[] = [];
let runtimeErrors: string[] = [];
test.beforeEach(async ({ page }) => {
  serverErrors = [];
  runtimeErrors = [];
  page.on('response', (response) => {
    if (response.url().startsWith('http://127.0.0.1:3108/api/v1/') && response.status() >= 500) {
      serverErrors.push(`${response.status()} ${new URL(response.url()).pathname}`);
    }
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
});
test.afterEach(() => {
  expect(serverErrors, 'API server failures during the browser flow').toEqual([]);
  expect(runtimeErrors, 'Uncaught browser exceptions').toEqual([]);
});

// Real local API + PostgreSQL fixtures from prepare-release-tests.cjs. No mocked
// authentication, production URLs, demo inventory or browser-storage tokens.
test('an available update preserves form work and can be dismissed without refreshing', async ({ page }) => {
  let version = process.env.NEXT_PUBLIC_BUILD_SHA || 'loaded-build';
  let versionResponses = 0;
  await page.route('**/api/version', async (route) => {
    await route.fulfill({ json: { version } });
    versionResponses++;
  });
  await page.clock.install();
  await page.goto('/auth/login');
  await page.getByRole('button', { name: 'Essential only', exact: true }).click();
  const email = page.locator('input[type="text"], input[type="email"]').first();
  await email.fill('unfinished@example.invalid');
  // Hydration installs the timer asynchronously; wait for an actual baseline
  // response before publishing the simulated update (including in Firefox).
  await expect.poll(async () => {
    await page.clock.fastForward(4_000);
    return versionResponses;
  }).toBeGreaterThan(0);
  version = 'next-release-build';
  const notice = page.getByRole('complementary', { name: 'Website update' });
  await expect.poll(async () => {
    await page.clock.fastForward(26_000);
    return notice.isVisible();
  }).toBe(true);
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await email.fill('still-working@example.invalid');
  await notice.getByRole('button', { name: 'Later', exact: true }).click();
  await page.clock.fastForward(26_000);
  await expect(notice).toHaveCount(0);
  await expect(email).toHaveValue('still-working@example.invalid');
  await expect(page).toHaveURL(/\/auth\/login$/);
});

test('homepage navigation reaches the seeded tour catalogue', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  await page.locator('header').getByRole('link', { name: 'Tours', exact: true }).first().click();
  await expect(page).toHaveURL(/\/tours$/);
  await expect(page.getByRole('heading', { name: 'Release Test Tour', exact: true })).toBeVisible();
});

test('homepage remains usable when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: any[]) {
      if (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl') return null;
      return original.apply(this, [type, ...args] as any);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.getByRole('img', { name: 'Travel destinations globe' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
});

test('newsletter keeps the address and shows a failure when submission cannot reach the server', async ({ page }) => {
  await page.route('**/api/v1/newsletter/subscribe', (route) => route.abort('failed'));
  await page.goto('/');
  const form = page.getByRole('form', { name: 'Newsletter signup' });
  await form.getByRole('textbox', { name: 'Newsletter email' }).fill('browser@example.invalid');
  await form.getByRole('checkbox').check();
  await form.getByRole('button', { name: 'Subscribe', exact: true }).click();
  await expect(form.getByRole('alert')).toBeVisible();
  await expect(form.getByRole('status')).toHaveCount(0);
  await expect(form.getByRole('textbox')).toHaveValue('browser@example.invalid');
});

test('confirmation links are noindex and do not change consent on page load', async ({ page }) => {
  let posts = 0;
  page.on('request', (request) => { if (request.url().endsWith('/api/v1/newsletter/confirm') && request.method() === 'POST') posts++; });
  await page.goto(`/newsletter/confirm#token=${'a'.repeat(64)}`);
  await expect(page.getByRole('button', { name: 'Confirm subscription', exact: true })).toBeEnabled();
  expect(posts).toBe(0);
  await expect(page).not.toHaveURL(/#/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.getByRole('button', { name: 'Confirm subscription', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'invalid or expired' })).toBeVisible();
  expect(posts).toBe(1);
});

test('every generated sitemap URL resolves and includes live seeded inventory', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  expect(urls).toContain('http://127.0.0.1:3108/tours/release-test-tour');
  expect(urls).not.toContain('http://127.0.0.1:3108/visa-countries');
  for (const url of urls) {
    expect(new URL(url).origin).toBe('http://127.0.0.1:3108');
    expect((await request.get(url)).status(), url).toBe(200);
  }
  expect((await request.get('/api/v1/newsletter/admin/subscriptions')).status()).toBe(401);
});

for (const path of ['destinations', 'hotels', 'flights', 'visa', 'hajj', 'umrah']) {
  test(`public /${path} loads without assuming demo inventory`, async ({ page }) => {
    const response = await page.goto(`/${path}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByText('Application error', { exact: false })).toHaveCount(0);
  });
}

test('real tour data opens the current preset booking flow', async ({ page }) => {
  await page.goto('/tours');
  await expect(page.getByRole('heading', { name: 'Release Test Tour' })).toBeVisible();
  await page.getByRole('button', { name: 'Book Now' }).first().click();
  await expect(page).toHaveURL(/\/booking\?type=tour&id=/);
  await expect(page.getByText('Your details', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeVisible();
});

test('search finds seeded inventory and opens its real detail page', async ({ page }) => {
  await page.goto('/search?q=Release%20Test%20Tour');
  await page.getByRole('link', { name: /Release Test Tour/ }).click();
  await expect(page).toHaveURL(/\/tours\/release-test-tour$/);
  await expect(page.getByRole('heading', { name: 'Release Test Tour', exact: true })).toBeVisible();
});

test('visa booking uses applicant/document steps', async ({ page }) => {
  await page.goto('/booking?type=visa&q=Release%20Test');
  await expect(page.getByText('Applicant', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Documents', { exact: true }).first()).toBeVisible();
});

test('anonymous users cannot view the admin customer table', async ({ page, request }) => {
  await page.goto('/admin/customers');
  await expect(page).toHaveURL(/\/auth\/login\?callbackUrl=/);
  await expect(page.getByPlaceholder('Email or phone number')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Created By' })).toHaveCount(0);
  expect((await request.get('/api/v1/users')).status()).toBe(401);
});

test('login accepts email or phone and rejects incorrect credentials', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByPlaceholder('Email or phone number').fill('missing@release.invalid');
  await page.getByPlaceholder('Password', { exact: true }).fill('Wrong-password-123!');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByText('Invalid credentials', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await expect(page).toHaveURL(/\/auth\/forgot-password$/);
});

test('missing Google credentials do not stop the API or password sign-in', async ({ request }) => {
  const health = await request.get('/api/v1/health');
  expect(health.status()).toBe(200);
  expect((await health.json()).database).toBe('connected');
  const google = await request.get('/api/v1/auth/google', { maxRedirects: 0 });
  expect(google.status()).toBe(302);
  expect(google.headers().location).toBe('http://127.0.0.1:3108/auth/callback?error=oauth_failed');
});

test('phone signup restores an HttpOnly session and cannot enter admin', async ({ page, context }, testInfo) => {
  await page.goto('/auth/register');
  await page.getByPlaceholder('Full name', { exact: true }).fill(`Browser Customer ${testInfo.project.name}`);
  await page.getByPlaceholder('e.g. 1712345678').fill(`17${Date.now().toString().slice(-8)}`);
  await page.getByPlaceholder('Password (min 8 characters)').fill('Browser-customer-123!');
  await page.getByRole('checkbox').check();
  const signup = page.waitForResponse((r) => r.url().endsWith('/api/v1/auth/register') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Create Account', exact: true }).click();
  const response = await signup;
  expect(response.status()).toBe(201);
  const body = await response.json();
  const tokens = body.data ?? body;
  expect(tokens.accessToken).toBeTruthy();
  expect(tokens.refreshToken).toBeUndefined();
  await expect(page).toHaveURL('http://127.0.0.1:3108/');
  expect((await context.cookies()).find((c) => c.name === 'flyngo-refresh')?.httpOnly).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain('flyngo-refresh');
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(tokens.accessToken);
  const restoration = page.waitForResponse((r) => r.url().endsWith('/api/v1/auth/session') && r.request().method() === 'POST');
  await page.reload();
  const restored = await restoration;
  expect(restored.status()).toBe(200);
  const restoredBody = await restored.json();
  const restoredTokens = restoredBody.data ?? restoredBody;
  expect(restoredTokens.accessToken).toBeTruthy();
  const intent = await context.request.post('/api/v1/payments/intent', { headers: { Authorization: `Bearer ${restoredTokens.accessToken}` }, data: { bookingId: 'test', method: 'stripe', amount: 1 } });
  expect(intent.status()).toBe(503);
  await page.goto('/admin/customers');
  await expect(page).toHaveURL(/\/auth\/login\?callbackUrl=/);
  expect((await context.request.post('/api/v1/auth/logout', { headers: { 'X-Requested-With': 'Flyngo', Origin: 'http://127.0.0.1:3108' } })).ok()).toBe(true);
  const signedOut = await context.request.post('/api/v1/auth/session', { headers: { 'X-Requested-With': 'Flyngo', Origin: 'http://127.0.0.1:3108' } });
  const signedOutBody = await signedOut.json();
  expect((signedOutBody.data ?? signedOutBody).authenticated).toBe(false);
});

test('admin login, customer creation, audit columns and logout work', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await page.goto('/auth/login?callbackUrl=%2Fadmin%2Fcustomers');
  await page.getByPlaceholder('Email or phone number').fill('admin@release.invalid');
  await page.getByPlaceholder('Password', { exact: true }).fill('Release-test-only-123!');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/customers$/);
  await expect(page.getByRole('columnheader', { name: 'Role', exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Created at', exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Created By', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add Customer', exact: true }).click();
  const name = `Created by browser ${testInfo.project.name} ${Date.now()}`;
  await page.getByPlaceholder('Full name', { exact: true }).fill(name);
  const created = page.waitForResponse((r) => r.url().endsWith('/api/v1/users') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Create Customer', exact: true }).click();
  expect((await created).status()).toBe(201);
  await expect(page.getByRole('row').filter({ hasText: name })).toContainText('Release Test Admin');
  await expect(page.getByRole('row').filter({ hasText: name }).locator('td[data-label="Role"]')).toHaveText('Customer');
  await test.step('Customer roles and controls fit phone, tablet and desktop layouts', async () => {
    await assertCustomerResponsiveLayouts(page, testInfo);
  });
  await page.locator('aside').getByRole('link', { name: 'CMS Pages', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/cms\/pages$/);
  await expect(page.getByRole('button', { name: 'New Page', exact: true })).toBeVisible();
  const logout = page.waitForResponse((r) => r.url().endsWith('/api/v1/auth/logout') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  expect((await logout).status()).toBe(200);
  await expect(page).not.toHaveURL(/\/admin\//);
  await page.goto('/admin/customers');
  await expect(page).toHaveURL(/\/auth\/login\?callbackUrl=/);
});
