import { test, expect } from '@playwright/test';

test('primary navigation works across core pages', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Yinyu' })).toBeVisible();

  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

  await page.getByRole('link', { name: 'Charts' }).click();
  await expect(page).toHaveURL(/\/charts$/);
  await expect(page.getByRole('heading', { name: /charts/i })).toBeVisible();

  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('Modern cross-platform music experience.')).toBeVisible();
});
