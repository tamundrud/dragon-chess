import { test, expect, openGame, tapSquare, activate, expectTurn, captureScreenshot, expectCanvasSized } from './helpers.js';
test.describe.configure({timeout:240_000});
const cases = [
  ['windwalker',['b1','c3','d7','d5','c3','d5'],'black'],
  ['one-eye',['g1','f3','e7','e5','f3','e5'],'black'],
  ['driller',['a2','a3','b8','c6','d2','d4','c6','d4'],'white'],
  ['piffleworm',['a2','a3','g8','f6','e2','e4','f6','e4'],'white'],
];
for (const [name, squares, next] of cases) test(`${name} capture completes, undo and skip`, async ({page}, info) => {
  await openGame(page,{pausedClock:true});
  for (const square of squares) { await tapSquare(page,square); await page.clock.runFor(32); }
  const ui=page.locator('#game-ui');
  await expect(ui).toHaveAttribute('data-attack-state','preparing');
  await expect(page.getByRole('button',{name:'Undo',exact:true})).toBeDisabled();
  const original = page.viewportSize();
  await page.setViewportSize({width:original.height,height:original.width});
  await page.clock.runFor(1500); await expectCanvasSized(page); await captureScreenshot(page,info,`${name}-impact-rotated`);
  await page.setViewportSize(original); await page.clock.runFor(64); await expectCanvasSized(page);
  await page.clock.runFor(3000); await expect(ui).toHaveAttribute('data-attack-state','idle'); await expectTurn(page,next);
  await activate(page.getByRole('button',{name:'Undo',exact:true}));
  for (const square of squares.slice(-2)) { await tapSquare(page,square); await page.clock.runFor(32); }
  await expect(ui).toHaveAttribute('data-attack-state','preparing');
  await page.keyboard.press('Escape'); await page.clock.runFor(5000);
  await expect(ui).toHaveAttribute('data-attack-state','idle'); await expectTurn(page,next);
});

for (const [name, squares] of cases) test(`${name} abort leaves a new game playable`, async ({page}) => {
  await openGame(page,{pausedClock:true});
  for (const square of squares) { await tapSquare(page,square); await page.clock.runFor(32); }
  const ui=page.locator('#game-ui');
  await expect(ui).toHaveAttribute('data-attack-state','preparing');
  await page.clock.runFor(1000);
  await activate(page.getByRole('button',{name:'Back to menu'}));
  await activate(page.getByRole('button',{name:'New Game'}));
  await expect.poll(async()=>{await page.clock.runFor(32);return ui.getAttribute('data-game-ready');},{timeout:30_000,intervals:[0]}).toBe('true');
  await page.clock.runFor(5000); await expect(ui).toHaveAttribute('data-attack-state','idle'); await expectTurn(page,'white');
  for (const square of ['e2','e4']) { await tapSquare(page,square); await page.clock.runFor(32); }
  await expectTurn(page,'black');
});

test('a knight captures an illustrated opposing knight', async ({page}, info) => {
  await openGame(page,{pausedClock:true});
  for (const square of ['b1','c3','b8','c6','c3','d5','c6','b4','d5','b4']) {
    await tapSquare(page,square); await page.clock.runFor(32);
  }
  const ui=page.locator('#game-ui'); await expect(ui).toHaveAttribute('data-attack-state','preparing');
  await page.clock.runFor(700); await captureScreenshot(page,info,'knight-defender');
  await page.clock.runFor(4000); await expect(ui).toHaveAttribute('data-attack-state','idle'); await expectTurn(page,'black');
  await activate(page.getByRole('button',{name:'Undo',exact:true})); await expectTurn(page,'white');
});
