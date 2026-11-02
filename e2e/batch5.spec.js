import { test, expect, openGame, tapSquare, activate, expectTurn, expectCanvasSized, captureScreenshot } from './helpers.js';
test.describe.configure({timeout:240_000});
const cases=[
 ['mogadon',['e2','e4','d7','d5','e4','d5','e8','d7','a2','a3','d7','d6','a3','a4','d6','d5'],'white',3],
 ['valhallarama',['e2','e4','d7','d5','d1','h5','a7','a6','h5','d5'],'black',4],
 ['hairy_scary_librarian',['e2','e4','e7','e5','g1','f3','d8','h4','g2','g3','h4','g3'],'white',6],
];
for(const [name,squares,next,count] of cases) test(`${name} capture, rotation, undo and skip`,async({page})=>{
 await openGame(page,{pausedClock:true});const loaded=[];page.on('requestfinished',r=>{if(r.url().includes(`/art/batch5/${name}-`))loaded.push(r.url());});
 for(const [index,square] of squares.entries()){await tapSquare(page,square);await page.clock.runFor(32);if(index<squares.length-1 && await page.locator('#game-ui').getAttribute('data-attack-state')!=='idle'){await page.keyboard.press('Escape');await page.clock.runFor(32);}}
 const ui=page.locator('#game-ui');await expect(ui).toHaveAttribute('data-attack-state','preparing');
 await expect.poll(()=>loaded.length,{timeout:30000}).toBe(count);await page.clock.runFor(64);
 const original=page.viewportSize();await page.setViewportSize({width:original.height,height:original.width});
 await page.clock.runFor(1200);await expect(ui).toHaveAttribute('data-attack-state','attacking');
 await page.clock.runFor(500);await expect(ui).toHaveAttribute('data-attack-state','impact');await expectCanvasSized(page);
 await page.setViewportSize(original);await page.clock.runFor(4000);await expect(ui).toHaveAttribute('data-attack-state','idle');await expectTurn(page,next);
 await activate(page.getByRole('button',{name:'Undo',exact:true}));
 for(const square of squares.slice(-2)){await tapSquare(page,square);await page.clock.runFor(32);}
 await expect(ui).toHaveAttribute('data-attack-state','preparing');await page.keyboard.press('Escape');await page.clock.runFor(5000);
 await expect(ui).toHaveAttribute('data-attack-state','idle');await expectTurn(page,next);
});

test('Valhallarama captures the illustrated Librarian', async ({page},info) => {
 await openGame(page,{pausedClock:true}); const loaded=[];
 page.on('requestfinished',r=>{if(r.url().includes('/art/batch5/hairy_scary_librarian-ready.webp'))loaded.push(r.url());});
 for(const square of ['e2','e4','e7','e5','d1','h5','d8','h4','h5','h4']) { await tapSquare(page,square); await page.clock.runFor(32); }
 await expect.poll(()=>loaded.length,{timeout:30000}).toBe(1);
 await page.clock.runFor(1200); await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','attacking');
 await captureScreenshot(page,info,'valhallarama-librarian');
 if (info.project.name === 'chromium') {
   // WebGL may expose a cleared buffer between frames; capture immediately after
   // advancing the game until a rendered frame is available.
   let frame;
   for (let attempt=0; attempt<12; attempt++) {
     await page.clock.runFor(16);
     frame=await page.screenshot();
     if (frame.length > 60_000) break;
   }
   expect(frame.length).toBeGreaterThan(60_000);
   expect(frame).toMatchSnapshot('librarian-defender-page.png',{maxDiffPixelRatio:0.03});
 }
 await page.clock.runFor(4000); await expectTurn(page,'black');
});

test('cold-load Skip does not restart after late artwork responses', async ({page}) => {
 await openGame(page,{pausedClock:true}); const held=[];
 await page.route('**/art/batch5/mogadon-*.webp',route=>{held.push(route);});
 for(const [index,square] of cases[0][1].entries()) { await tapSquare(page,square); await page.clock.runFor(32);
   if(index<cases[0][1].length-1 && await page.locator('#game-ui').getAttribute('data-attack-state')!=='idle') {await page.keyboard.press('Escape');await page.clock.runFor(32);} }
 await expect.poll(()=>held.length,{timeout:30000}).toBe(3); await page.keyboard.press('Escape');
 await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','idle'); await expectTurn(page,'white');
 await Promise.allSettled(held.map(route=>route.continue())); await page.clock.runFor(5000);
 await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','idle');
 await activate(page.getByRole('button',{name:'Undo',exact:true})); await expectTurn(page,'black');
});

test('attacker artwork failure cancels pending Librarian defender load', async ({page}) => {
 await openGame(page,{pausedClock:true}); const held=[];
 await page.route('**/art/batch5/hairy_scary_librarian-ready.webp',route=>{held.push(route);});
 await page.route('**/art/batch5/valhallarama-contact.webp',route=>route.abort());
 for(const square of ['e2','e4','e7','e5','d1','h5','d8','h4','h5','h4']) {await tapSquare(page,square);await page.clock.runFor(32);}
 await expect.poll(()=>held.length,{timeout:30000}).toBe(1);
 const ui=page.locator('#game-ui'); await expect.poll(async()=>{await page.clock.runFor(32);return ui.getAttribute('data-attack-state');},{timeout:30000}).toBe('idle');
 await expectTurn(page,'black'); await Promise.allSettled(held.map(route=>route.continue())); await page.clock.runFor(5000);
 await expect(ui).toHaveAttribute('data-attack-state','idle'); await activate(page.getByRole('button',{name:'Undo',exact:true})); await expectTurn(page,'white');
});

test('abort during cold artwork load leaves the next game playable', async ({page}) => {
 await openGame(page,{pausedClock:true}); const held=[];
 await page.route('**/art/batch5/mogadon-*.webp',route=>{held.push(route);});
 for(const [index,square] of cases[0][1].entries()) {await tapSquare(page,square);await page.clock.runFor(32);
   if(index<cases[0][1].length-1 && await page.locator('#game-ui').getAttribute('data-attack-state')!=='idle'){await page.keyboard.press('Escape');await page.clock.runFor(32);} }
 await expect.poll(()=>held.length,{timeout:30000}).toBe(3);
 await activate(page.getByRole('button',{name:'Back to menu'})); await Promise.allSettled(held.map(route=>route.continue()));
 await activate(page.getByRole('button',{name:'New Game'}));
 await expect.poll(async()=>{await page.clock.runFor(32);return page.locator('#game-ui').getAttribute('data-game-ready');},{timeout:30000}).toBe('true');
 await page.clock.runFor(5000); await expectTurn(page,'white');
 for(const square of ['e2','e4']) {await tapSquare(page,square);await page.clock.runFor(32);} await expectTurn(page,'black');
});
