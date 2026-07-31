import { test, expect } from '@playwright/test';

test.describe('Flyngo Public Site', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Extraordinary Journey');
    await expect(page.locator('text=Explore Tours')).toBeVisible();
    await expect(page.locator('text=View Destinations')).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Destinations');
    await expect(page).toHaveURL('/destinations');
    await expect(page.locator('h1')).toContainText('Explore Destinations');
  });

  test('tours page shows cards', async ({ page }) => {
    await page.goto('/tours');
    await expect(page.locator('h1')).toContainText('Explore Our Tours');
    await expect(page.locator('text=Bali Paradise Explorer')).toBeVisible();
    await expect(page.locator('text=Dubai Luxury Experience')).toBeVisible();
  });

  test('hotels page loads', async ({ page }) => {
    await page.goto('/hotels');
    await expect(page.locator('h1')).toContainText('Find Your Perfect Stay');
  });

  test('flights page loads', async ({ page }) => {
    await page.goto('/flights');
    await expect(page.locator('h1')).toContainText('Find & Book Flights');
  });

  test('auth pages work', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    await page.goto('/auth/register');
    await expect(page.locator('text=Create Your Account')).toBeVisible();
  });

  test('booking flow renders steps', async ({ page }) => {
    await page.goto('/booking');
    await expect(page.locator('text=Details')).toBeVisible();
    await expect(page.locator('text=Review')).toBeVisible();
    await expect(page.locator('text=Payment')).toBeVisible();
    await expect(page.locator('text=Continue')).toBeVisible();
  });
});

test.describe('Flyngo Admin Panel', () => {
  test('admin dashboard loads', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.locator('text=Flyngo Admin')).toBeVisible();
    await expect(page.locator('text=Total Bookings')).toBeVisible();
  });

  test('admin sidebar navigation', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.click('text=Bookings');
    await expect(page).toHaveURL('/admin/bookings');
    await page.click('text=Customers');
    await expect(page).toHaveURL('/admin/customers');
  });

  test('admin CRUD tables render', async ({ page }) => {
    for (const pagePath of ['bookings', 'tours', 'hotels', 'flights', 'coupons']) {
      await page.goto(`/admin/${pagePath}`);
      await expect(page.locator('table')).toBeVisible();
    }
  });

  test('CMS pages load', async ({ page }) => {
    await page.goto('/admin/cms/pages');
    await expect(page.locator('text=New Page')).toBeVisible();

    await page.goto('/admin/cms/blogs');
    await expect(page.locator('text=New Post')).toBeVisible();

    await page.goto('/admin/cms/media');
    await expect(page.locator('text=Upload')).toBeVisible();
  });
});
