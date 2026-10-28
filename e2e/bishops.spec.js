import { test, expect, openGame, tapSquare, activate, expectTurn, captureScreenshot, expectCanvasSized } from './helpers.js';
test.describe.configure({timeout:240_000});
const cases = [
  ['hiccup',['d2','d4','e7','e5','c1','g5','f7','f6','g5','f6'],'black'],
  ['toothless',['e2','e4','d7','d5','f1','b5','c7','c6','b5','c6'],'black'],
  ['thuggory',['d2','d4','d7','d5','e2','e4','c8','g4','f2','f3','g4','f3'],'white'],
  ['killer',['e2','e4','e7','e5','d2','d3','f8','b4','c2','c3','b4','c3'],'white'],
];
for (const [name, squares, next] of cases) test(`${name} capture completes, undo and skip`, async ({page}, info) => {
  await openGame(page,{pausedClock:true});
  const loaded = []; page.on('requestfinished', request => { if (request.url().includes(`/art/bishops/${name}-`)) loaded.push(request.url()); });
  for (const square of squares) { await tapSquare(page,square); await page.clock.runFor(32); }
  const ui=page.locator('#game-ui');
  await expect(ui).toHaveAttribute('data-attack-state','preparing');
  await expect(page.getByRole('button',{name:'Undo',exact:true})).toBeDisabled();
  await expect.poll(() => loaded.length, {timeout:30000}).toBe(name === 'hiccup' ? 5 : 3);
  await page.clock.runFor(64);
  const original = page.viewportSize();
  await page.setViewportSize({width:original.height,height:original.width});
  await page.clock.runFor(900); await expect(ui).toHaveAttribute('data-attack-state','attacking');
  await page.clock.runFor(600); await expect(ui).toHaveAttribute('data-attack-state','impact'); await expectCanvasSized(page); await captureScreenshot(page,info,`${name}-impact-rotated`);
  await page.setViewportSize(original); await page.clock.runFor(64); await expectCanvasSized(page);
  await page.clock.runFor(3000); await expect(ui).toHaveAttribute('data-attack-state','idle');
  if (name === 'toothless' || name === 'killer') await expect(page.locator('#game-status-banner')).toHaveText(`CHECK! (${next === 'black' ? 'Black' : 'White'} TO MOVE)`);
  else await expectTurn(page,next);
  await activate(page.getByRole('button',{name:'Undo',exact:true}));
  for (const square of squares.slice(-2)) { await tapSquare(page,square); await page.clock.runFor(32); }
  await expect(ui).toHaveAttribute('data-attack-state','preparing');
  await page.keyboard.press('Escape'); await page.clock.runFor(5000);
  await expect(ui).toHaveAttribute('data-attack-state','idle');
  if (name === 'toothless' || name === 'killer') await expect(page.locator('#game-status-banner')).toHaveText(`CHECK! (${next === 'black' ? 'Black' : 'White'} TO MOVE)`);
  else await expectTurn(page,next);
});

for (const [name, squares] of cases) test(`${name} abort leaves a new game playable`, async ({page}) => {
  await openGame(page,{pausedClock:true});
  const loaded = []; page.on('requestfinished', request => { if (request.url().includes(`/art/bishops/${name}-`)) loaded.push(request.url()); });
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


test('skip during cold artwork loading completes once and late responses do not restart the scene', async ({page}) => {
  await openGame(page,{pausedClock:true});
  const held = [];
  await page.route('**/art/bishops/hiccup-*.webp', route => { held.push(route); });
  for (const square of ['d2','d4','e7','e5','c1','g5','f7','f6','g5','f6']) {
    await tapSquare(page,square); await page.clock.runFor(32);
  }
  const ui = page.locator('#game-ui');
  await expect(ui).toHaveAttribute('data-attack-state','preparing');
  await expect.poll(() => held.length).toBe(5);
  await page.keyboard.press('Escape');
  await expect(ui).toHaveAttribute('data-attack-state','idle');
  await expectTurn(page,'black');
  await Promise.allSettled(held.map(route => route.continue()));
  await page.clock.runFor(5000);
  await expect(ui).toHaveAttribute('data-attack-state','idle');
  await activate(page.getByRole('button',{name:'Undo',exact:true}));
  await expectTurn(page,'white');
});


test('a Bishop captures an illustrated opposing Bishop', async ({page}, info) => {
  await openGame(page,{pausedClock:true});
  const loaded = []; page.on('requestfinished', request => { if (request.url().includes('/art/bishops/')) loaded.push(request.url()); });
  for (const square of ['e2','e4','e7','e6','d2','d4','d7','d5','c1','f4','f8','d6','f4','d6']) {
    await tapSquare(page,square); await page.clock.runFor(32);
  }
  await expect.poll(() => loaded.length).toBe(6);
  await page.clock.runFor(950);
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','attacking');
  await captureScreenshot(page,info,'bishop-defender');
  await page.clock.runFor(2500); await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','idle');
});

test('a later Bishop scene does not wait for an abandoned download', async ({page}) => {
  await openGame(page,{pausedClock:true});
  const held = []; const later = [];
  page.on('requestfinished', request => {
    if (request.url().includes('/art/bishops/killer-')) later.push(request.url());
  });
  await page.route('**/art/bishops/hiccup-*.webp', route => { held.push(route); });
  for (const square of ['d2','d4','e7','e5','c1','g5','f7','f6','g5','f6']) {
    await tapSquare(page,square); await page.clock.runFor(32);
  }
  await expect.poll(() => held.length).toBe(5);
  await page.keyboard.press('Escape'); await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','idle');
  for (const square of ['f8','b4','c2','c3','b4','c3']) {
    await tapSquare(page,square); await page.clock.runFor(32);
  }
  await expect.poll(() => later.length).toBe(3);
  await page.clock.runFor(1000);
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','attacking');
  await page.keyboard.press('Escape');
  await Promise.allSettled(held.map(route => route.continue()));
  await page.clock.runFor(5000);
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','idle');
});

test('an unavailable Bishop defender does not suppress a knight attack', async ({page}) => {
  await openGame(page,{pausedClock:true});
  await page.route('**/art/bishops/killer-ready.webp', route => route.abort());
  for (const square of ['e2','e4','e7','e5','b1','c3','f8','c5','c3','a4','a7','a6','a4','c5']) {
    await tapSquare(page,square); await page.clock.runFor(32);
  }
  const ui = page.locator('#game-ui');
  await expect.poll(async () => { await page.clock.runFor(32); return ui.getAttribute('data-attack-state'); }, {timeout:30000}).toBe('attacking');
  await page.clock.runFor(2500); await expect(ui).toHaveAttribute('data-attack-state','idle');
  await expectTurn(page,'black');
});

test('Bishop artwork is not fetched during game startup', async ({page}) => {
  const requests = []; page.on('request', request => { if (request.url().includes('/art/bishops/')) requests.push(request.url()); });
  await openGame(page, {pausedClock:true}); await page.clock.runFor(1000);
  expect(requests).toEqual([]);
});
