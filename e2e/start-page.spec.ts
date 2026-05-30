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
  const paperCalmBtn = page.getByRole('button', { name: /paper calm/i });
  await expect(paperCalmBtn).toBeVisible();
  // The theme dropdown sits below the react-grid-layout overlay; trigger click via JS
  await paperCalmBtn.dispatchEvent('click');
  await expect(async () => {
    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--glance-bg').trim(),
    );
    expect(bg).toBe('#f4f1ec');
  }).toPass({ timeout: 5000 });
});
