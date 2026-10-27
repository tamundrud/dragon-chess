import { test, expect, activate, openGame, tapSquare, tapCanvas, expectTurn, expectCanvasSized, captureScreenshot } from './helpers.js';

// Inspect rendered pixels rather than adding a production debug API. The
// attacker may advance, while the defender stays in the right artwork half.
async function expectCombatantsVisible(page, presenter) {
  // A resized WebGL canvas is blank until Phaser renders again. Wait for the
  // status label to render, then judge artwork independently (no artwork retry).
  let counts;
  await expect.poll(async () => {
    await page.clock.runFor(32);
    const clip = await page.locator('#phaser-container canvas').boundingBox();
    const png = await page.screenshot({ clip });
    counts = await page.evaluate(async ({ data, presenter }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const { width, height } = canvas;
      const pixels = ctx.getImageData(0, 0, width, height).data;
      const counts = { attacker: 0, defender: 0, status: 0 };
      const artScale = Math.min(width / 800, height / 600);
      const statusY = presenter === 'generic' ? height * 0.22 : Math.max(16, (height - 600 * artScale) / 2 + 28 * artScale);
      for (let y = 0; y < height * 0.64; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const [r, g, b] = pixels.slice(i, i + 3);
          if (Math.abs(y - statusY) < 22 * artScale && x > width * 0.2 && x < width * 0.8 && r > 180 && g > 180 && b > 180) counts.status++;
          if (y < height * 0.32) continue;
          if ((presenter === 'generic'
            ? r > 160 && g > 110 && g < 190 && b < 70
            : r > 160 && g > 65 && g < 185 && b < 55)) counts.attacker++;
          if (x > width / 2 && r > 190 && g < 95 && b < 100) counts.defender++;
        }
      }
      return counts;
    }, { data: png.toString('base64'), presenter });
    return counts.status > 40;
  }, { timeout: 5000, intervals: [0] }).toBe(true);
  expect(counts.attacker, 'visible attacker artwork').toBeGreaterThan(40);
  expect(counts.defender, 'visible defender artwork').toBeGreaterThan(40);
}

for (const [presenter, moves, from, to] of [
  ['generic', ['e2', 'e4', 'd7', 'd5', 'e4', 'd5'], 'e4', 'd5'],
  ['One Eye', ['e2', 'e4', 'e7', 'e5', 'g1', 'f3', 'b8', 'c6', 'f3', 'e5'], 'f3', 'e5'],
]) {
  for (const finish of ['complete', 'Skip']) {
    test(`${presenter} capture survives a transient narrow resize and ${finish}`, async ({ page }, testInfo) => {
      test.setTimeout(180_000);
      await openGame(page, { pausedClock: true });
      for (const square of moves) {
        await tapSquare(page, square);
        await page.clock.runFor(32);
      }
      const ui = page.locator('#game-ui');
      await expect(ui).not.toHaveAttribute('data-attack-state', 'idle');
      const original = page.viewportSize();
      await page.setViewportSize({ width: original.height, height: original.width });
      await page.clock.runFor(100);
      await expectCanvasSized(page);
      await expectCombatantsVisible(page, presenter);
      await captureScreenshot(page, testInfo, `${presenter}-${finish}-rotated`);
      await page.setViewportSize(original);
      await page.clock.runFor(100);
      await expectCanvasSized(page);
      await expectCombatantsVisible(page, presenter);
      await captureScreenshot(page, testInfo, `${presenter}-${finish}-rotated-back`);

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
