import { test, expect } from '@playwright/test';

test('smoke: search from home and play a song with linked player state', async ({ page }) => {
  await page.route('**/api/tune/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'n1', platform: 'netease', title: '夜曲', artist: '周杰伦' },
          { id: 'q1', platform: 'qq', title: '夜曲', artist: '周杰伦' },
          { id: 'n2', platform: 'netease', title: '晴天', artist: '周杰伦' },
        ],
      }),
    });
  });

  await page.goto('/');
  await page.getByRole('link', { name: /搜索 Search|Search 搜索/ }).click();
  await expect(page).toHaveURL(/\/search$/);

  const searchBox = page.getByRole('textbox', { name: /搜索歌曲|Search music/i });
  await searchBox.fill('周杰伦');
  await searchBox.press('Enter');

  await expect(page.getByText('夜曲')).toBeVisible();
  await expect(page.getByText('晴天')).toBeVisible();

  await page.getByRole('button', { name: /夜曲/ }).click();
  await expect(page).toHaveURL(/\/player\/n1$/);
  await expect(page.getByText(/夜曲 · 周杰伦/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();

  await page.getByRole('button', { name: /next track/i }).click();
  await expect(page.getByText(/晴天 · 周杰伦/)).toBeVisible();
});
