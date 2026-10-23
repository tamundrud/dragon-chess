import { test, expect, activate, openGame, tapSquare, tapCanvas, expectTurn, expectCanvasSized, captureScreenshot } from './helpers.js';

for (const [presenter, moves, from, to] of [
  ['generic', ['e2', 'e4', 'd7', 'd5', 'e4', 'd5'], 'e4', 'd5'],
  ['Fire Dragon', ['e2', 'e4', 'e7', 'e5', 'g1', 'f3', 'b8', 'c6', 'f3', 'e5'], 'f3', 'e5'],
]) {
  for (const finish of ['complete', 'Skip']) {
    test(`${presenter} capture survives a transient narrow resize and ${finish}`, async ({ page }, testInfo) => {
      test.setTimeout(180_000);
      await page.clock.install();
      await openGame(page);
      for (const square of moves) await tapSquare(page, square);
      const ui = page.locator('#game-ui');
      await expect(ui).not.toHaveAttribute('data-attack-state', 'idle');
      await page.clock.pauseAt(new Date());

      // Rotation can briefly report a 4px viewport. Force that parent size so
      // this regression does not depend on Chromium's orientation timing.
      const parent = page.locator('#phaser-container');
      const originalStyle = await parent.getAttribute('style');
      await parent.evaluate(element => {
        element.style.width = '4px';
        element.style.minWidth = '0';
      });
      await page.clock.runFor(600);
      await expect.poll(() => page.locator('#phaser-container canvas').evaluate(canvas => canvas.width)).toBe(4);
      await expect(ui).not.toHaveAttribute('data-attack-state', 'idle');
      await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
      await expectTurn(page, 'white');

      await parent.evaluate((element, style) => {
        if (style === null) element.removeAttribute('style');
        else element.setAttribute('style', style);
      }, originalStyle);
      const original = page.viewportSize();
      await page.setViewportSize({ width: original.height, height: original.width });
      await page.clock.runFor(200);
      await expectCanvasSized(page);
      await captureScreenshot(page, testInfo, `${presenter}-${finish}-restored`);

      if (finish === 'Skip') {
        const box = await page.locator('#phaser-container canvas').boundingBox();
        await tapCanvas(page, { x: box.width / 2, y: box.height * 0.9 });
        await page.clock.runFor(32);
        await expect(ui).toHaveAttribute('data-attack-state', 'idle');
        await expectTurn(page, 'black');
      } else {
        // Phaser smooths frame deltas independently of the browser clock.
        // Advance in bounded steps until its natural timeline actually ends.
        await expect.poll(async () => {
          await page.clock.runFor(200);
          return ui.getAttribute('data-attack-state');
        }, { timeout: 90_000, intervals: [0] }).toBe('idle');
      }
      // Continue beyond the abandoned timeline after completion or Skip.
      await page.clock.runFor(6000);
      await expect(ui).toHaveAttribute('data-attack-state', 'idle');
      await expectTurn(page, 'black');
      await expect(page.locator('#phaser-container canvas')).toHaveCount(1);
      await activate(page.getByRole('button', { name: 'Undo', exact: true }));
      await expectTurn(page, 'white');
      // Recapture proves Undo restored the capturing piece and its victim.
      await tapSquare(page, from);
      await page.clock.runFor(32);
      await tapSquare(page, to);
      await page.clock.runFor(32);
      await expect(ui).not.toHaveAttribute('data-attack-state', 'idle');
      await page.keyboard.press('Escape');
      await page.clock.runFor(32);
      await expect(ui).toHaveAttribute('data-attack-state', 'idle');
      await expectTurn(page, 'black');
      await page.clock.runFor(6000);
      await expect(ui).toHaveAttribute('data-attack-state', 'idle');
      await expectTurn(page, 'black');
    });
  }
}
