import { test, expect } from '@playwright/test';

test('customer roles, long account data and controls fit phone, tablet and desktop layouts', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const email = 'responsive.layout.long.customer.account@example.invalid';
  const name = 'Customer with a very long name for corporate travel account management';
  const assignedRole = 'Regional Corporate Travel Operations Supervisor';

  await page.goto('/auth/login?callbackUrl=%2Fadmin%2Fcustomers');
  await page.getByPlaceholder('Email or phone number').fill('admin@release.invalid');
  await page.getByPlaceholder('Password', { exact: true }).fill('Release-test-only-123!');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/customers$/);
  const consent = page.getByRole('button', { name: 'Essential only', exact: true });
  if (await consent.isVisible()) await consent.click();
  const search = page.getByRole('textbox', { name: 'Search customers', exact: true });
  await search.fill(email);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const row = page.getByRole('row').filter({ hasText: email });
  const roleCell = row.locator('td[data-label="Role"]');
  await expect(roleCell).toHaveText(assignedRole);
  await expect(page.getByRole('button', { name: 'Chat on WhatsApp', exact: true })).toHaveCount(0);

  for (const width of [320, 375, 390, 640, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(roleCell).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth), { message: `page overflow at ${width}px after responsive transitions` }).toBeLessThanOrEqual(width);
    const layout = await page.evaluate(() => {
      const root = document.documentElement;
      const table = document.querySelector('.customers-table')!;
      const role = table.querySelector('td[data-label="Role"]')!;
      const badge = role.firstElementChild!;
      const bounds = role.getBoundingClientRect();
      const badgeBounds = badge.getBoundingClientRect();
      return { pageWidth: root.scrollWidth, viewport: innerWidth,
        badgeFits: badgeBounds.right <= bounds.right + 1 && badgeBounds.left >= bounds.left - 1 };
    });
    expect(layout.pageWidth, `page overflow at ${width}px`).toBeLessThanOrEqual(layout.viewport);
    expect(layout.badgeFits, `role badge overflow at ${width}px`).toBe(true);
    const edit = row.getByRole('button', { name: `Edit ${name}`, exact: true });
    const box = await edit.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    if (width < 1024) {
      await expect(page.getByRole('columnheader', { name: 'Role', exact: true })).toBeHidden();
      await edit.click();
      const dialog = page.getByRole('dialog', { name: 'Edit Customer', exact: true });
      await expect(dialog).toBeVisible();
      const bounds = await dialog.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      await dialog.getByRole('button', { name: 'Close Edit Customer', exact: true }).click();
    } else {
      await expect(page.getByRole('columnheader', { name: 'Role', exact: true })).toBeVisible();
      expect((await row.boundingBox())!.height, `desktop row height at ${width}px`).toBeLessThan(240);
      expect((await roleCell.boundingBox())!.width).toBeGreaterThanOrEqual(192);
    }
    if ([320, 390, 768, 1440].includes(width)) {
      await page.screenshot({ path: testInfo.outputPath(`customers-${width}.png`), fullPage: true });
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  const toggle = page.getByRole('button', { name: 'Toggle theme', exact: true });
  if (!await page.locator('html').evaluate((element) => element.classList.contains('dark'))) await toggle.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.screenshot({ path: testInfo.outputPath('customers-390-dark.png'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await search.fill('no-such-customer-layout-test');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const empty = page.getByRole('cell', { name: 'No customers found', exact: true });
  await expect(empty).toHaveAttribute('colspan', '11');
  expect(errors).toEqual([]);
});
