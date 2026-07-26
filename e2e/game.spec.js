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
