import { test, expect, activate, openGame, tapSquare, tapCanvas, expectTurn, expectCanvasSized, captureScreenshot, expectFits } from './helpers.js';

// Software WebGL on the Cloud host is slower than the animation's logical clock.
test.describe.configure({ timeout: 240_000 });

async function rookCapture(page) {
  for (const square of ['a2','a4','b7','b5','a1','a3','b5','b4','a3','b3','h7','h6','b3','b4']) {
    await tapSquare(page, square); await page.clock.runFor(32);
  }
}

async function advanceUntil(page, locator, attribute, value) {
  await expect.poll(async () => {
    await page.clock.runFor(64);
    return locator.getAttribute(attribute);
  }, { timeout: 30_000, intervals: [0] }).toBe(value);
}

for (const finish of ['complete','Skip','abort']) {
  test(`Fireworm moved rook capture, rotate across phases, ${finish}`, async ({ page }, info) => {
    await openGame(page, { pausedClock: true });
    await rookCapture(page);
    const ui = page.locator('#game-ui');
    await expect(ui).toHaveAttribute('data-attack-state','preparing');
    await expect(page.getByRole('button',{name:'Undo',exact:true})).toBeDisabled();
    const original = page.viewportSize();
    await captureScreenshot(page,info,'fireworm-staging');
    await page.setViewportSize({width:original.height,height:original.width});
    await page.clock.runFor(128); await expectCanvasSized(page);
    await advanceUntil(page,ui,'data-attack-state','attacking');
    await captureScreenshot(page,info,'fireworm-launch-rotated');
    await page.setViewportSize(original); await page.clock.runFor(96);
    await advanceUntil(page,ui,'data-attack-state','impact');
    await page.clock.runFor(220);
    await captureScreenshot(page,info,'fireworm-fireworks');
    await advanceUntil(page,ui,'data-attack-state','recovering');
    await page.setViewportSize({width:original.height,height:original.width});
    await page.clock.runFor(96); await expectCanvasSized(page);
    await captureScreenshot(page,info,'fireworm-recovery-rotated');
    if (finish === 'abort') {
      await activate(page.getByRole('button',{name:'Back to menu'}));
      await activate(page.getByRole('button',{name:'New Game'}));
      await advanceUntil(page,ui,'data-game-ready','true');
      await page.clock.runFor(5000);
      await expect(ui).toHaveAttribute('data-attack-state','idle'); await expectTurn(page,'white');
      await tapSquare(page,'e2'); await page.clock.runFor(32); await tapSquare(page,'e4'); await page.clock.runFor(32);
      await expectTurn(page,'black');
      return;
    }
    if (finish === 'Skip') {
      const box = await page.locator('#phaser-container canvas').boundingBox();
      await tapCanvas(page,{x:box.width/2,y:box.height*0.9}); await page.clock.runFor(32);
    } else await advanceUntil(page,ui,'data-attack-state','idle');
    await page.clock.runFor(5000); await expectTurn(page,'black');
    await expect(ui).toHaveAttribute('data-attack-state','idle');
    await activate(page.getByRole('button',{name:'Undo',exact:true})); await expectTurn(page,'white');
    await tapSquare(page,'b3'); await page.clock.runFor(32); await tapSquare(page,'b4'); await page.clock.runFor(32);
    await expect(ui).toHaveAttribute('data-attack-state','preparing');
    await page.keyboard.press('Escape'); await page.clock.runFor(32); await expectTurn(page,'black');
    await expect(page.locator('#phaser-container canvas')).toHaveCount(1);
    await activate(page.getByRole('button',{name:'Restart',exact:true})); await expectTurn(page,'white');
  });
}

for (const [mode,reduced,enabled] of [['fast',false,true],['normal',true,true],['instant',false,true],['normal',false,false]]) {
  test(`Fireworm actual rook capture mode=${mode}, reduced=${reduced}, enabled=${enabled}`, async ({ page }) => {
    await page.addInitScript(({mode,reduced,enabled}) => localStorage.setItem('dragon_chess_settings_v1',JSON.stringify({animationMode:mode,reducedMotion:reduced,animationEnabled:enabled,mute:true})), {mode,reduced,enabled});
    await openGame(page,{pausedClock:true}); await rookCapture(page);
    const ui = page.locator('#game-ui');
    if (enabled && mode !== 'instant') await expect(ui).not.toHaveAttribute('data-attack-state','idle');
    await advanceUntil(page,ui,'data-attack-state','idle');
    await page.clock.runFor(5000); await expectTurn(page,'black');
    await activate(page.getByRole('button',{name:'Undo',exact:true})); await expectTurn(page,'white');
    await tapSquare(page,'b3'); await page.clock.runFor(32); await tapSquare(page,'b4'); await page.clock.runFor(32);
    if (enabled && mode !== 'instant') { await page.keyboard.press('Escape'); await page.clock.runFor(32); }
    await expectTurn(page,'black');
  });
}

test('isolated proof supports stable replay, Skip, Fast, Instant and reduced motion', async ({ page }, info) => {
  await page.clock.install({time:new Date('2026-10-26T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
  await page.goto('/?preview=fireworm');
  const proof=page.locator('main.fireworm-proof');
  // Dynamic imports and Phaser startup both need frames before the proof exists.
  await expect.poll(async()=>{await page.clock.runFor(32);return page.locator('main[data-ready="true"]').count();},{timeout:30_000,intervals:[0]}).toBe(1);
  await advanceUntil(page,proof,'data-phase','impact'); await page.clock.runFor(300);
  await captureScreenshot(page,info,'proof-impact'); await expectFits(page);
  await activate(page.getByRole('button',{name:'Skip',exact:true})); await expect(proof).toHaveAttribute('data-phase','idle');
  await page.getByLabel('Speed').selectOption('fast');
  await activate(page.getByRole('button',{name:'Replay capture'}));
  await advanceUntil(page,proof,'data-phase','idle');
  await page.getByLabel('Speed').selectOption('normal'); await page.getByLabel('Reduced motion').check();
  await activate(page.getByRole('button',{name:'Replay capture'}));
  await advanceUntil(page,proof,'data-phase','impact'); await captureScreenshot(page,info,'proof-reduced-motion');
  await advanceUntil(page,proof,'data-phase','idle');
  await page.getByLabel('Speed').selectOption('instant'); await activate(page.getByRole('button',{name:'Replay capture'}));
  await expect(proof).toHaveAttribute('data-phase','idle');
  await expect(page.locator('canvas')).toHaveCount(1);
});

test('cold artwork keeps gameplay unready until the attack presenter is available', async ({ page }) => {
  const held = [];
  await page.route('**/art/fireworm/rig.png', route => { held.push(route); });
  await page.clock.install({time:new Date('2026-10-26T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
  await page.goto('/'); await activate(page.getByRole('button',{name:'New Game'}));
  await expect.poll(async()=>{await page.clock.runFor(32);return held.length;},{intervals:[0]}).toBe(1);
  const ui = page.locator('#game-ui');
  await expect(ui).toHaveAttribute('data-game-ready','false');
  await tapSquare(page,'e2'); await page.clock.runFor(32);
  await tapSquare(page,'e4'); await page.clock.runFor(32); await expectTurn(page,'white');
  await held[0].continue();
  await advanceUntil(page,ui,'data-game-ready','true');
  await rookCapture(page);
  await expect(ui).toHaveAttribute('data-attack-state','preparing');
  await page.keyboard.press('Escape'); await page.clock.runFor(32);
  await expectTurn(page,'black');
});

test('leaving while art loads cannot attach a stale presenter to the next game', async ({ page }) => {
  let held;
  await page.route('**/art/fireworm/rig.png', route => {
    if (!held) held = route;
    else return route.continue();
  });
  await page.clock.install({time:new Date('2026-10-26T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
  await page.goto('/'); await activate(page.getByRole('button',{name:'New Game'}));
  await expect.poll(async()=>{await page.clock.runFor(32);return !!held;},{intervals:[0]}).toBe(true);
  await expect(page.locator('#game-ui')).toHaveAttribute('data-game-ready','false');
  await activate(page.getByRole('button',{name:'Back to menu'}));
  await held.continue();
  await activate(page.getByRole('button',{name:'New Game'}));
  await advanceUntil(page,page.locator('#game-ui'),'data-game-ready','true');
  await rookCapture(page);
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','preparing');
  await page.keyboard.press('Escape'); await page.clock.runFor(5000);
  await expectTurn(page,'black'); await expect(page.locator('canvas')).toHaveCount(1);
});
