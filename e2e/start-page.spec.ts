import { test, expect } from '@playwright/test';

test('first load shows widgets with no login', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/today's focus/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /themes/i })).toBeVisible();
});

test('adding a bookmark persists after reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /add bookmark/i }).click();
  await page.getByPlaceholder('label').fill('GitHub');
  await page.getByPlaceholder('https://...').fill('https://github.com');
  await page.getByRole('button', { name: 'save' }).click();
  await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible();
});

test('switching theme changes the background variable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /themes/i }).click();
  await page.getByRole('button', { name: /paper calm/i }).click();
  await expect
    .poll(async () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--glance-bg').trim(),
      ),
    )
    .toBe('#f4f1ec');
});
