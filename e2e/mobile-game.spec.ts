import { expect, Page, test } from '@playwright/test';

async function openGame(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('#new-game-btn').click();
  await expect(page.locator('#game-ui')).toBeVisible();
  await expect(page.locator('#phaser-container canvas')).toBeVisible();
}

async function tapSquare(page: Page, square: string): Promise<void> {
  const canvas = page.locator('#phaser-container canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Chess canvas has no bounding box');
  const boardSize = Math.floor(Math.min(box.width * 0.94, box.height * 0.94, 640) / 8) * 8;
  const squareSize = boardSize / 8;
  const col = square.charCodeAt(0) - 97;
  const row = 8 - Number(square[1]);
  await page.mouse.click(
    box.x + (box.width - boardSize) / 2 + (col + 0.5) * squareSize,
    box.y + (box.height - boardSize) / 2 + (row + 0.5) * squareSize,
  );
}

async function move(page: Page, from: string, to: string): Promise<void> {
  await tapSquare(page, from);
  await tapSquare(page, to);
}

async function reachCapture(page: Page): Promise<void> {
  await move(page, 'e2', 'e4');
  await expect(page.locator('#game-status-banner')).toContainText("BLACK'S TURN");
  await move(page, 'd7', 'd5');
  await expect(page.locator('#game-status-banner')).toContainText("WHITE'S TURN");
  await move(page, 'e4', 'd5');
  await expect(page.locator('#game-ui')).not.toHaveAttribute('data-attack-state', 'idle');
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dragon_chess_settings_v1', JSON.stringify({
    animationEnabled: true, animationMode: 'normal', reducedMotion: true, mute: true, volume: 0,
  })));
});

test('start screen loads and fits a mobile viewport', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'DRAGON CHESS' })).toBeVisible();
  await expect(page.locator('#new-game-btn')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('opens a new game and accepts a legal quiet move by tapping squares', async ({ page }) => {
  await openGame(page);
  await move(page, 'e2', 'e4');
  await expect(page.locator('#game-status-banner')).toContainText("BLACK'S TURN");
});

test('capture presentation can be skipped and restart remains usable', async ({ page }) => {
  await openGame(page);
  await reachCapture(page);
  await page.keyboard.press('Space');
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state', 'idle');
  await expect(page.locator('#game-status-banner')).toContainText("BLACK'S TURN");
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-status-banner')).toContainText("WHITE'S TURN");
});

test('leaving during an attack aborts it and a new game is unlocked', async ({ page }) => {
  await openGame(page);
  await reachCapture(page);
  await page.locator('#back-menu-btn').click();
  await expect(page.locator('#start-menu')).toBeVisible();
  await page.locator('#new-game-btn').click();
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state', 'idle');
  await move(page, 'e2', 'e4');
  await expect(page.locator('#game-status-banner')).toContainText("BLACK'S TURN");
});
