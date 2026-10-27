import { expect, test, activate, openGame, tapSquare, tapCanvas, expectCanvasSized, captureScreenshot } from './helpers.js';

test('a capture tap starts an attack instead of immediately skipping it', async ({ page }, testInfo) => {
  await openGame(page);

  for (const square of ['e2', 'e4', 'd7', 'd5', 'e4', 'd5']) {
    await tapSquare(page, square);
  }

  await expect(page.locator('#game-ui')).not.toHaveAttribute('data-attack-state', 'idle');
  await expect(page.getByRole('button', { name: 'Undo' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Restart' })).toBeDisabled();
  await captureScreenshot(page, testInfo, 'capture-active');
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state', 'idle', { timeout: 15_000 });
  await expect(page.getByText("BLACK'S TURN (OBSIDIAN CLAN)")).toBeVisible();
});

async function startCapture(page, { pausedClock = false } = {}) {
  for (const square of ['e2', 'e4', 'd7', 'd5', 'e4', 'd5']) {
    await tapSquare(page, square);
    if (pausedClock) await page.clock.runFor(32);
  }
  await expect(page.locator('#game-ui')).not.toHaveAttribute('data-attack-state', 'idle');
}

test('leaving during capture repeatedly allows legal moves in the next game', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openGame(page);
  for (let cycle = 0; cycle < 3; cycle++) {
    await startCapture(page);
    await activate(page.getByRole('button', { name: 'Back to menu' }));
    await activate(page.getByRole('button', { name: 'New Game' }));
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
  await openGame(page, { pausedClock: true });
  await startCapture(page, { pausedClock: true });
  const canvas = page.locator('#phaser-container canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Missing canvas');
  await tapCanvas(page, { x: box.width / 2, y: box.height * 0.9 });
  await page.clock.runFor(32);
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state', 'idle');
  await expect(page.getByText("BLACK'S TURN (OBSIDIAN CLAN)")).toBeVisible();
  await activate(page.getByRole('button', { name: 'Undo' }));
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

test('leaving a One Eye capture cancels its nested presentation timeline', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openGame(page);
  for (const square of ['e2', 'e4', 'e7', 'e5', 'g1', 'f3', 'b8', 'c6', 'f3', 'e5']) {
    await tapSquare(page, square);
  }
  await expect(page.locator('#game-ui')).not.toHaveAttribute('data-attack-state', 'idle');
  await activate(page.getByRole('button', { name: 'Back to menu' }));
  await activate(page.getByRole('button', { name: 'New Game' }));
  await expect(page.locator('#game-ui')).toHaveAttribute('data-game-ready', 'true');
  await tapSquare(page, 'e2');
  await tapSquare(page, 'e4');
  await page.waitForTimeout(3500);
  await expect(page.getByText("BLACK'S TURN (OBSIDIAN CLAN)")).toBeVisible();
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state', 'idle');
  expect(errors).toEqual([]);
});


test('touch Skip remains reachable after resizing an active capture', async ({ page, isMobile }, testInfo) => {
  test.skip(!isMobile, 'Touch capture resize runs on emulated phones and tablet.');
  await openGame(page, { pausedClock: true });
  await startCapture(page, { pausedClock: true });
  const original = page.viewportSize();
  await page.setViewportSize({ width: original.height, height: original.width });
  await page.clock.runFor(600);
  await expectCanvasSized(page);
  await expect(page.locator('#game-ui')).not.toHaveAttribute('data-attack-state', 'idle');
  await captureScreenshot(page, testInfo, 'capture-after-resize');
  const box = await page.locator('#phaser-container canvas').boundingBox();
  await tapCanvas(page, { x: box.width / 2, y: box.height * 0.9 });
  await page.clock.runFor(32);
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state', 'idle');
  await activate(page.getByRole('button', { name: 'Undo', exact: true }));
  await expect(page.locator('#game-status-banner')).toHaveText("WHITE'S TURN (GOLDEN VIKINGS)");
  await tapSquare(page, 'e4');
  await page.clock.runFor(32);
  await tapSquare(page, 'd5');
  await page.clock.runFor(32);
  await expect(page.locator('#game-ui')).not.toHaveAttribute('data-attack-state', 'idle');
});
