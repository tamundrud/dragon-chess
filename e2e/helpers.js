import { expect, test as base } from '@playwright/test';

// Every browser scenario must finish without an uncaught application error.
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await use(page);
    expect(errors).toEqual([]);
  },
});
export { expect };

export async function activate(locator, options = {}) {
  const hasTouch = test.info().project.use.hasTouch;
  if (hasTouch) await locator.tap(options);
  else await locator.click(options);
}

export async function openGame(page, { pausedClock = false } = {}) {
  if (pausedClock) {
    // Pause before app startup. Pausing an auto-advancing clock mid-RAF can
    // leave its next frame ahead of the clock after an in-flight tick ends.
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  }
  await page.goto('/');
  await activate(page.getByRole('button', { name: 'New Game' }));
  if (pausedClock) {
    await expect.poll(async () => {
      await page.clock.runFor(32);
      return page.locator('#game-ui').getAttribute('data-game-ready');
    }).toBe('true');
  } else {
    await expect(page.locator('#game-ui')).toHaveAttribute('data-game-ready', 'true');
  }
}

export async function tapCanvas(page, position) {
  const canvas = page.locator('#phaser-container canvas');
  await activate(canvas, { position });
}

export async function tapSquare(page, square) {
  const canvas = page.locator('#phaser-container canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Phaser canvas does not have a bounding box');
  const boardSize = Math.floor(Math.min(box.width * 0.94, box.height * 0.94, 640) / 8) * 8;
  const squareSize = boardSize / 8;
  await tapCanvas(page, {
    x: Math.floor((box.width - boardSize) / 2) + (square.charCodeAt(0) - 97 + 0.5) * squareSize,
    y: Math.floor((box.height - boardSize) / 2) + (8 - Number(square[1]) + 0.5) * squareSize,
  });
}

export async function expectTurn(page, color) {
  await expect(page.locator('#game-status-banner')).toHaveText(
    color === 'white' ? "WHITE'S TURN (GOLDEN VIKINGS)" : "BLACK'S TURN (OBSIDIAN CLAN)",
  );
}

export async function expectFits(page) {
  const viewport = page.viewportSize();
  await expect.poll(() => page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }))).toEqual({ document: viewport.width, body: viewport.width });
}

export async function captureScreenshot(page, testInfo, name) {
  await testInfo.attach(name, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
}

export async function expectCanvasSized(page) {
  await expect.poll(() => page.locator('#phaser-container canvas').evaluate(canvas => {
    const box = canvas.getBoundingClientRect();
    const parent = canvas.parentElement.getBoundingClientRect();
    // Phaser measures the parent including its 1px borders.
    return Math.max(Math.abs(box.width - parent.width), Math.abs(box.height - parent.height));
  })).toBeLessThanOrEqual(2);
}
