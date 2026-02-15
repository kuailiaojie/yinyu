import { test, expect } from '@playwright/test';

test('primary navigation works across core pages', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /音愈 Yinyu|Yinyu 音愈/ })).toBeVisible();
  await expect(page.getByText(/最近听过|Recently Played/)).toBeVisible();
  await expect(page.getByText(/推荐歌单|Recommended Playlists/)).toBeVisible();

  await page.getByRole('link', { name: /设置 Settings|Settings 设置/ }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole('heading', { name: /设置|Settings/ })).toBeVisible();

  await page.getByRole('link', { name: /榜单 Charts|Charts 榜单/ }).click();
  await expect(page).toHaveURL(/\/charts$/);
  await expect(page.getByRole('heading', { name: /热门榜单|Charts/ })).toBeVisible();

  await page.getByRole('link', { name: /首页 Home|Home 首页/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(/跨平台音乐体验|Cross-platform music experience/)).toBeVisible();
});
