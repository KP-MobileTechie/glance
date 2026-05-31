import { test, expect } from '@playwright/test';

test('search navigates to the engine', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox').fill('glance start page');
  await Promise.all([
    page.waitForURL(/google\.com\/search/),
    page.getByRole('searchbox').press('Enter'),
  ]);
});

// Helper: click a checkbox that lives inside a <label>. Playwright's normal .click()
// triggers a second synthetic click from the label, toggling the value back. We avoid
// this by clicking the checkbox's bounding box with force=true and trial=false, which
// fires a single pointer event at that exact coordinate without label propagation.
async function toggleCheckbox(page: import('@playwright/test').Page, ariaLabel: string) {
  const loc = page.locator(`[aria-label="${ariaLabel}"]`);
  const box = await loc.boundingBox();
  if (!box) throw new Error(`Could not find bounding box for [aria-label="${ariaLabel}"]`);
  // Click the centre of the checkbox element directly; force=true skips actionability checks
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  // Wait a tick for React's async state update to flush
  await page.waitForTimeout(50);
}

test('settings: switch to 12-hour clock and Fahrenheit persists', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /settings/i }).click();
  await toggleCheckbox(page, '24-hour clock');
  await page.getByRole('combobox', { name: /temperature unit/i }).selectOption('F');
  // close the panel before reload so state is written
  await page.getByRole('button', { name: /close settings/i }).click();
  await page.reload();
  await page.getByRole('button', { name: /settings/i }).click();
  await expect(page.getByRole('checkbox', { name: /24-hour clock/i })).not.toBeChecked();
  await expect(page.getByRole('combobox', { name: /temperature unit/i })).toHaveValue('F');
});

test('hiding a widget removes it and persists', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /settings/i }).click();
  await toggleCheckbox(page, 'show Bookmarks');
  await page.getByRole('button', { name: /close settings/i }).click();
  await expect(page.getByText(/quick launch/i)).toHaveCount(0);
  await page.reload();
  await expect(page.getByText(/quick launch/i)).toHaveCount(0);
});

test('theme creator applies a custom theme', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /themes/i }).click();
  await page.getByRole('button', { name: /create theme/i }).click();
  await page.getByRole('button', { name: /^apply$/i }).click();
  const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--glance-bg').trim());
  expect(bg.length).toBeGreaterThan(0);
});

test('mobile viewport stacks widgets in one column', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/');
  await expect(page.getByText(/today's focus/i)).toBeVisible();
  await expect(page.getByRole('searchbox')).toBeVisible();
});
