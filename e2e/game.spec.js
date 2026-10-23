import { expect, test } from '@playwright/test';

async function openGame(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'New Game' }).click();
  await expect(page.locator('#game-ui')).toHaveAttribute('data-game-ready', 'true');
}

async function tapSquare(page, square) {
  const canvas = page.locator('#phaser-container canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Phaser canvas does not have a bounding box');

  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  const boardSize = Math.floor(Math.min(box.width * 0.94, box.height * 0.94, 640) / 8) * 8;
  const left = (box.width - boardSize) / 2;
  const top = (box.height - boardSize) / 2;
  const squareSize = boardSize / 8;

  await canvas.click({
    position: {
      x: left + (file + 0.5) * squareSize,
      y: top + (8 - rank + 0.5) * squareSize,
    },
  });
}

test('a capture tap starts an attack instead of immediately skipping it', async ({ page }) => {
  await openGame(page);

  for (const square of ['e2', 'e4', 'd7', 'd5', 'e4', 'd5']) {
    await tapSquare(page, square);
  }

  await expect(page.locator('#game-ui')).not.toHaveAttribute('data-attack-state', 'idle');
  await expect(page.getByRole('button', { name: 'Undo' })).toBeDisabled();
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state', 'idle', { timeout: 15_000 });
  await expect(page.getByText("BLACK'S TURN (OBSIDIAN CLAN)")).toBeVisible();
});

async function startCapture(page) {
  for (const square of ['e2', 'e4', 'd7', 'd5', 'e4', 'd5']) {
    await tapSquare(page, square);
  }
  await expect(page.locator('#game-ui')).not.toHaveAttribute('data-attack-state', 'idle');
}

test('leaving during capture repeatedly allows legal moves in the next game', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openGame(page);
  for (let cycle = 0; cycle < 3; cycle++) {
    await startCapture(page);
    await page.locator('#back-menu-btn').click();
    await page.getByRole('button', { name: 'New Game' }).click();
    await expect(page.locator('#game-ui')).toHaveAttribute('data-game-ready', 'true');
    await expect(page.locator('#phaser-container canvas')).toHaveCount(1);
    await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state', 'idle');
  }
  await tapSquare(page, 'e2');
  await tapSquare(page, 'e4');
  await expect(page.getByText("BLACK'S TURN (OBSIDIAN CLAN)")).toBeVisible();
  // Run past the abandoned timeline; a late completion must not change this turn.
  await page.waitForTimeout(3500);
  await expect(page.getByText("BLACK'S TURN (OBSIDIAN CLAN)")).toBeVisible();
  await tapSquare(page, 'd7');
  await tapSquare(page, 'd5');
  await expect(page.getByText("WHITE'S TURN (GOLDEN VIKINGS)")).toBeVisible();
  expect(errors).toEqual([]);
});

test('deliberate Skip completes a capture and Undo restores exactly one move', async ({ page }) => {
  await page.clock.install();
  await openGame(page);
  await startCapture(page);
  await page.clock.pauseAt(new Date());
  const canvas = page.locator('#phaser-container canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Missing canvas');
  await canvas.click({ position: { x: box.width / 2, y: box.height * 0.85 } });
  await page.clock.runFor(32);
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state', 'idle');
  await expect(page.getByText("BLACK'S TURN (OBSIDIAN CLAN)")).toBeVisible();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByText("WHITE'S TURN (GOLDEN VIKINGS)")).toBeVisible();
  await tapSquare(page, 'e4');
  await page.clock.runFor(32);
  await tapSquare(page, 'd5');
  await page.clock.runFor(32);
  await expect(page.locator('#game-ui')).not.toHaveAttribute('data-attack-state', 'idle');
  await page.keyboard.press('Escape');
  await page.clock.runFor(32);
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state', 'idle');
});

test('leaving a Fire Dragon capture cancels its nested presentation timeline', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openGame(page);
  for (const square of ['e2', 'e4', 'e7', 'e5', 'g1', 'f3', 'b8', 'c6', 'f3', 'e5']) {
    await tapSquare(page, square);
  }
  await expect(page.locator('#game-ui')).not.toHaveAttribute('data-attack-state', 'idle');
  await page.locator('#back-menu-btn').click();
  await page.getByRole('button', { name: 'New Game' }).click();
  await expect(page.locator('#game-ui')).toHaveAttribute('data-game-ready', 'true');
  await tapSquare(page, 'e2');
  await tapSquare(page, 'e4');
  await page.waitForTimeout(3500);
  await expect(page.getByText("BLACK'S TURN (OBSIDIAN CLAN)")).toBeVisible();
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state', 'idle');
  expect(errors).toEqual([]);
});
