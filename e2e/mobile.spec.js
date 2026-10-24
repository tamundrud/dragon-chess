import { test, expect, activate, openGame, tapSquare, expectTurn, expectFits, expectCanvasSized, captureScreenshot } from './helpers.js';

test('menu, game and settings fit the viewport with reachable controls', async ({ page }, testInfo) => {
  await page.goto('/');
  await expectFits(page);
  await captureScreenshot(page, testInfo, 'menu');
  await activate(page.getByRole('button', { name: 'Settings', exact: true }));
  await expectFits(page);
  await activate(page.getByRole('button', { name: 'Done', exact: true }));
  await activate(page.getByRole('button', { name: 'New Game' }));
  await expect(page.locator('#game-ui')).toHaveAttribute('data-game-ready', 'true');
  await expectFits(page);
  await expect(page.locator('#game-status-banner')).toBeVisible();
  await captureScreenshot(page, testInfo, 'board');
  for (const selector of ['#back-menu-btn', '#game-settings-btn', '#undo-btn', '#restart-btn']) {
    const box = await page.locator(selector).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
  }
  await activate(page.getByRole('button', { name: 'Settings', exact: true }));
  await expectFits(page);
  await activate(page.getByRole('button', { name: 'Done', exact: true }));
  await expect(page.locator('#settings-modal')).toHaveCount(0);
  await activate(page.locator('#game-settings-btn'));
  await captureScreenshot(page, testInfo, 'settings');
  await activate(page.getByRole('button', { name: 'Close settings' }));
  await expect(page.locator('#settings-modal')).toHaveCount(0);
});

test('legal moves, Undo, Restart and settings remain usable', async ({ page }) => {
  await openGame(page);
  await tapSquare(page, 'e2');
  await tapSquare(page, 'e5'); // Illegal pawn move must not advance the turn.
  await expectTurn(page, 'white');
  await tapSquare(page, 'e2');
  await tapSquare(page, 'e4');
  await expectTurn(page, 'black');
  await activate(page.getByRole('button', { name: 'Undo', exact: true }));
  await expectTurn(page, 'white');
  await tapSquare(page, 'e2');
  await tapSquare(page, 'e4');
  await expectTurn(page, 'black');
  await activate(page.getByRole('button', { name: 'Restart', exact: true }));
  await expectTurn(page, 'white');
  // This pawn can move again only if Restart restored the initial position.
  await tapSquare(page, 'e2');
  await tapSquare(page, 'e4');
  await expectTurn(page, 'black');
  await tapSquare(page, 'd7');
  await tapSquare(page, 'd5');
  await expectTurn(page, 'white');

  await activate(page.getByRole('button', { name: 'Settings', exact: true }));
  await activate(page.getByRole('button', { name: 'instant', exact: true }));
  await activate(page.getByLabel('Reduced Motion', { exact: true }));
  await activate(page.getByRole('button', { name: 'Done', exact: true }));
  await tapSquare(page, 'e4');
  await tapSquare(page, 'd5');
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state', 'idle');
  await expectTurn(page, 'black');
  await activate(page.getByRole('button', { name: 'Undo', exact: true }));
  await expectTurn(page, 'white');
  await activate(page.getByRole('button', { name: 'Settings', exact: true }));
  await expect(page.getByRole('button', { name: 'instant', exact: true })).toHaveClass(/btn-active/);
  await expect(page.getByLabel('Reduced Motion', { exact: true })).toBeChecked();
  await activate(page.getByRole('button', { name: 'Reset Defaults' }));
  await expect(page.getByRole('button', { name: 'normal', exact: true })).toHaveClass(/btn-active/);
  await expect(page.getByLabel('Reduced Motion', { exact: true })).not.toBeChecked();
  await activate(page.getByRole('button', { name: 'Done', exact: true }));
  await activate(page.getByRole('button', { name: 'Back to menu' }));
  await activate(page.getByRole('button', { name: 'New Game' }));
  await expect(page.locator('#game-ui')).toHaveAttribute('data-game-ready', 'true');
  await tapSquare(page, 'e2');
  await tapSquare(page, 'e4');
  await expectTurn(page, 'black');
});

test('touch input survives portrait and landscape rotation without a second canvas', async ({ page, isMobile }, testInfo) => {
  test.skip(!isMobile, 'Touch orientation coverage runs on emulated phones and tablet.');
  await page.addInitScript(() => {
    window.canvasTouches = 0;
    document.addEventListener('touchstart', event => {
      if (event.isTrusted && event.target instanceof HTMLCanvasElement) window.canvasTouches++;
    }, true);
  });
  await openGame(page);
  await tapSquare(page, 'e2');
  await tapSquare(page, 'e4');
  await expectTurn(page, 'black');
  expect(await page.evaluate(() => window.canvasTouches)).toBe(2);
  const original = page.viewportSize();
  await page.setViewportSize({ width: original.height, height: original.width });
  await expectFits(page);
  await expectCanvasSized(page);
  await expect(page.locator('#phaser-container canvas')).toHaveCount(1);
  await tapSquare(page, 'd7');
  await tapSquare(page, 'd5');
  await expectTurn(page, 'white');
  await captureScreenshot(page, testInfo, 'rotated-board');
  await page.setViewportSize(original);
  await expectFits(page);
  await expectCanvasSized(page);
  await tapSquare(page, 'g1');
  await tapSquare(page, 'f3');
  await expectTurn(page, 'black');
  expect(await page.evaluate(() => window.canvasTouches)).toBe(6);
  await expect(page.locator('#phaser-container canvas')).toHaveCount(1);
});
