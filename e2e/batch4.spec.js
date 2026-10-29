import { test, expect, openGame, tapSquare, activate, expectTurn, expectCanvasSized, captureScreenshot } from './helpers.js';
test.describe.configure({timeout:240_000});
const cases=[
 ['hookfang',['h2','h4','a7','a5','h1','h3','a5','a4','h3','a3','d7','d5','a3','a4'],'black',2],
 ['flamehuffer',['a2','a4','a7','a5','b2','b4','a8','a6','b4','b5','a6','b6','c2','c4','b6','b5'],'white',2],
 ['common_or_garden',['g2','g4','h7','h5','g4','g5','h8','h6','a2','a3','h6','g6','b2','b3','g6','g5'],'white',2],
 ['stoick',['e2','e4','d7','d5','e1','e2','d5','e4','e2','e3','g7','g6','e3','e4'],'black',5],
];
for(const [name,squares,next,count] of cases) test(`${name} capture, rotation, undo and skip`,async({page})=>{
 await openGame(page,{pausedClock:true});const loaded=[];page.on('requestfinished',r=>{if(r.url().includes(`/art/batch4/${name}-`))loaded.push(r.url());});
 for(const [index,square] of squares.entries()){await tapSquare(page,square);await page.clock.runFor(32);if(index<squares.length-1 && await page.locator('#game-ui').getAttribute('data-attack-state')!=='idle'){await page.keyboard.press('Escape');await page.clock.runFor(32);}}
 const ui=page.locator('#game-ui');await expect(ui).toHaveAttribute('data-attack-state','preparing');
 await expect.poll(()=>loaded.length,{timeout:30000}).toBe(count);await page.clock.runFor(64);
 const original=page.viewportSize();await page.setViewportSize({width:original.height,height:original.width});
 await page.clock.runFor(1200);await expect(ui).toHaveAttribute('data-attack-state','attacking');
 await page.clock.runFor(name==='stoick'?850:500);await expect(ui).toHaveAttribute('data-attack-state','impact');await expectCanvasSized(page);
 await page.setViewportSize(original);await page.clock.runFor(4000);await expect(ui).toHaveAttribute('data-attack-state','idle');await expectTurn(page,next);
 await activate(page.getByRole('button',{name:'Undo',exact:true}));
 for(const square of squares.slice(-2)){await tapSquare(page,square);await page.clock.runFor(32);}
 await expect(ui).toHaveAttribute('data-attack-state','preparing');await page.keyboard.press('Escape');await page.clock.runFor(5000);
 await expect(ui).toHaveAttribute('data-attack-state','idle');await expectTurn(page,next);
});
test('cancel during a Batch 4 attack leaves a new game playable',async({page})=>{
 await openGame(page,{pausedClock:true});
 for(const square of cases[0][1]){await tapSquare(page,square);await page.clock.runFor(32);}
 await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','preparing');await page.clock.runFor(1000);
 await activate(page.getByRole('button',{name:'Back to menu'}));await activate(page.getByRole('button',{name:'New Game'}));
 await expect.poll(async()=>{await page.clock.runFor(32);return page.locator('#game-ui').getAttribute('data-game-ready');},{timeout:30000}).toBe('true');
 await page.clock.runFor(5000);await expectTurn(page,'white');
 for(const square of ['e2','e4']){await tapSquare(page,square);await page.clock.runFor(32);}
 await expectTurn(page,'black');
});
test('skip during a cold Batch 4 load completes once without late restart',async({page})=>{
 await openGame(page,{pausedClock:true});const held=[];
 await page.route('**/art/batch4/hookfang-*.webp',route=>{held.push(route);});
 for(const square of cases[0][1]){await tapSquare(page,square);await page.clock.runFor(32);}
 const ui=page.locator('#game-ui');await expect.poll(()=>held.length).toBe(2);await page.keyboard.press('Escape');
 await expect(ui).toHaveAttribute('data-attack-state','idle');await expectTurn(page,'black');
 await Promise.allSettled(held.map(route=>route.continue()));await page.clock.runFor(5000);
 await expect(ui).toHaveAttribute('data-attack-state','idle');await activate(page.getByRole('button',{name:'Undo',exact:true}));await expectTurn(page,'white');
});
test('Batch 4 artwork starts loading while an optional Bishop defender is delayed',async({page})=>{
 await openGame(page,{pausedClock:true});const held=[],requested=[];
 await page.route('**/art/bishops/killer-ready.webp',route=>{held.push(route);});
 page.on('request',request=>{if(request.url().includes('/art/batch4/hookfang-'))requested.push(request.url());});
 for(const square of ['h2','h4','e7','e5','h1','h3','f8','b4','h3','b3','a7','a6','b3','b4']){await tapSquare(page,square);await page.clock.runFor(32);}
 await expect.poll(()=>held.length).toBe(1);await expect.poll(()=>requested.length,{timeout:5000}).toBe(2);
 await page.keyboard.press('Escape');await expectTurn(page,'black');await Promise.allSettled(held.map(route=>route.continue()));
 await page.clock.runFor(5000);await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','idle');
});
test('required artwork failure cancels a pending optional defender load',async({page})=>{
 await openGame(page,{pausedClock:true});const held=[];
 await page.route('**/art/bishops/killer-ready.webp',route=>{held.push(route);});
 await page.route('**/art/batch4/hookfang-action.webp',route=>route.abort());
 for(const square of ['h2','h4','e7','e5','h1','h3','f8','b4','h3','b3','a7','a6','b3','b4']){await tapSquare(page,square);await page.clock.runFor(32);}
 const ui=page.locator('#game-ui');await expect.poll(()=>held.length).toBe(1);
 await expect.poll(async()=>{await page.clock.runFor(32);return ui.getAttribute('data-attack-state');},{timeout:30000}).toBe('idle');
 await expectTurn(page,'black');await Promise.allSettled(held.map(route=>route.continue()));await page.clock.runFor(5000);
 await expect(ui).toHaveAttribute('data-attack-state','idle');await activate(page.getByRole('button',{name:'Undo',exact:true}));await expectTurn(page,'white');
});

test('Flamehuffer captures the illustrated Fireworm',async({page},info)=>{
 await openGame(page,{pausedClock:true});const loaded=[];
 page.on('requestfinished',r=>{if(r.url().includes('/art/batch4/flamehuffer-'))loaded.push(r.url());});
 for(const square of ['a2','a4','a7','a5','a1','a3','a8','a6','a3','b3','a6','b6','c2','c4','b6','b3']){await tapSquare(page,square);await page.clock.runFor(32);}
 await expect.poll(()=>loaded.length,{timeout:30000}).toBe(2);await page.clock.runFor(1200);
 await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','attacking');await captureScreenshot(page,info,'flamehuffer-fireworm');
 await page.clock.runFor(4000);await expectTurn(page,'white');
});
