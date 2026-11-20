import { expect, type Page, type TestInfo } from '@playwright/test';

// Reuse the real customer-management session: duplicate logins across browser
// projects would exceed the API's five-attempt per-minute login limit.
export async function assertCustomerResponsiveLayouts(page: Page, testInfo: TestInfo) {
  const viewport = page.viewportSize();
  const email = 'responsive.layout.long.customer.account@example.invalid';
  const name = 'Customer with a very long name for corporate travel account management';
  const assignedRole = 'Regional Corporate Travel Operations Supervisor';

  const consent = page.getByRole('button', { name: 'Essential only', exact: true });
  if (await consent.isVisible()) await consent.click();
  const search = page.getByRole('textbox', { name: 'Search customers', exact: true });
  await search.fill(email);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const row = page.getByRole('row').filter({ hasText: email });
  const roleCell = row.locator('td[data-label="Role"]');
  await expect(roleCell).toHaveText(assignedRole);
  await expect(page.getByRole('button', { name: 'Chat on WhatsApp', exact: true })).toHaveCount(0);

  for (const width of [320, 375, 390, 640, 768, 1024, 1280, 1440, 1536, 1920]) {
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
    if (width < 1536) {
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
      expect((await roleCell.boundingBox())!.width).toBeGreaterThanOrEqual(128);
    }
    if ([320, 390, 768, 1024, 1440].includes(width)) {
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
  if (viewport) await page.setViewportSize(viewport);
}
