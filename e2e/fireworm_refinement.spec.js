import { test, expect, activate, openGame, tapSquare, tapCanvas, expectTurn, captureScreenshot } from './helpers.js';
test.describe.configure({timeout:240_000});

async function until(page, locator, attribute, value) {
  await expect.poll(async()=>{await page.clock.runFor(32);return locator.getAttribute(attribute);},{timeout:30000,intervals:[0]}).toBe(value);
}
async function proof(page) {
  await page.clock.install({time:new Date('2026-10-26T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
  await page.goto('/?preview=fireworm');
  await expect.poll(async()=>{await page.clock.runFor(32);return page.locator('main[data-ready="true"]').count();},{timeout:30000,intervals:[0]}).toBe(1);
  return page.locator('main.fireworm-proof');
}

// Read rendered pixels from an unobscured part of the real h8 board token.
// A dimmed live board preserves these pixels; an opaque arena cannot.
async function boardPixelMatch(page, reference) {
  const current=await page.locator('.fireworm-canvas canvas').screenshot({scale:'css'});
  return page.evaluate(async({reference,current})=>{
    async function pixels(data){const im=new Image();im.src=`data:image/png;base64,${data}`;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);return {width:im.width,height:im.height,data:ctx.getImageData(0,0,im.width,im.height).data};}
    const a=await pixels(reference),b=await pixels(current);
    const size=Math.floor(Math.min(a.width*.94,a.height*.94,640)/8)*8,square=size/8;
    const left=Math.floor((a.width-size)/2)+square*7,top=Math.floor((a.height-size)/2);
    let selected=0,matched=0;
    for(let y=Math.ceil(top+square*.6);y<top+square*.94;y++)for(let x=Math.ceil(left+square*.1);x<left+square*.9;x++){
      const i=(y*a.width+x)*4;
      if(Math.max(...a.data.slice(i,i+3))<80)continue;
      selected++;
      if([0,1,2].every(c=>Math.abs(b.data[i+c]-(a.data[i+c]*.72+8*.28))<18))matched++;
    }
    return {selected,ratio:matched/Math.max(1,selected)};
  },{reference:reference.toString('base64'),current:current.toString('base64')});
}

test('complete character poses are connected transparent silhouettes', async({page})=>{
  await page.goto('/');
  const results=await page.evaluate(async()=>{
    const results=[];
    for(const name of ['ready','breath','proud','flamehuffer']){
      const im=new Image();im.src=`/art/fireworm/${name}.png`;await im.decode();
      const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);
      const rgba=ctx.getImageData(0,0,c.width,c.height).data,n=c.width*c.height,solid=new Uint8Array(n),queue=new Int32Array(n);
      let count=0,largest=0;
      for(let i=0;i<n;i++)if(rgba[i*4+3]>128){solid[i]=1;count++;}
      for(let i=0;i<n;i++)if(solid[i]){
        let head=0,tail=0;queue[tail++]=i;solid[i]=0;
        while(head<tail){const p=queue[head++],x=p%c.width;for(const q of [x>0?p-1:-1,x<c.width-1?p+1:-1,p-c.width,p+c.width])if(q>=0&&q<n&&solid[q]){solid[q]=0;queue[tail++]=q;}}
        largest=Math.max(largest,tail);
      }
      results.push({name,count,ratio:largest/count,transparentCorner:rgba[3]});
    }return results;
  });
  for(const result of results){expect(result.count,result.name).toBeGreaterThan(200000);expect(result.ratio,result.name).toBeGreaterThan(.995);expect(result.transparentCorner,result.name).toBe(0);}
});

test('board remains visibly dimmed behind a named rook and arena remains selectable', async({page},info)=>{
  const main=await proof(page);
  await activate(page.getByRole('button',{name:'Skip',exact:true}));
  await page.clock.runFor(64);
  const reference=await page.locator('.fireworm-canvas canvas').screenshot({scale:'css'});
  await activate(page.getByRole('button',{name:'Replay capture'}));await page.clock.runFor(650);
  await expect(page.locator('.fireworm-note')).toContainText('flamehuffer · rook');
  const board=await boardPixelMatch(page,reference);expect(board.selected).toBeGreaterThan(10);expect(board.ratio).toBeGreaterThan(.7);
  await captureScreenshot(page,info,'foreground-board-connected-pose');
  await page.getByLabel('Presentation').selectOption('arena');await activate(page.getByRole('button',{name:'Replay capture'}));await page.clock.runFor(650);
  const arena=await boardPixelMatch(page,reference);expect(arena.ratio).toBeLessThan(.4);
  await captureScreenshot(page,info,'arena-comparison-connected-pose');
  const original=page.viewportSize();await page.setViewportSize({width:original.height,height:original.width});await page.clock.runFor(96);
  await until(page,main,'data-phase','impact');await captureScreenshot(page,info,'arena-rook-impact-rotated');
  await activate(page.getByRole('button',{name:'Skip',exact:true}));await expect(main).toHaveAttribute('data-phase','idle');
  await page.getByLabel('Presentation').selectOption('board');await page.getByLabel('Speed').selectOption('fast');
  await activate(page.getByRole('button',{name:'Replay capture'}));await until(page,main,'data-phase','idle');
});

test('actual moved Flamehuffer capture supports touch Skip, Undo, recapture and abort', async({page},info)=>{
  await openGame(page,{pausedClock:true});
  for(const square of ['a2','a4','a7','a5','a1','a3','a8','a6','a3','b3','a6','b6','b3','b6']){await tapSquare(page,square);await page.clock.runFor(32);}
  const ui=page.locator('#game-ui');await expect(ui).toHaveAttribute('data-attack-state','preparing');
  await expect(page.getByRole('status')).toHaveText(/Fireworm captures flamehuffer · rook/i);
  await until(page,ui,'data-attack-state','impact');await page.clock.runFor(150);await captureScreenshot(page,info,'actual-moved-flamehuffer-impact');
  const box=await page.locator('#phaser-container canvas').boundingBox();
  await tapCanvas(page,{x:box.width/2,y:box.height*.9});await page.clock.runFor(4000);await expectTurn(page,'black');
  await activate(page.getByRole('button',{name:'Undo',exact:true}));await expectTurn(page,'white');
  await tapSquare(page,'b3');await page.clock.runFor(32);await tapSquare(page,'b6');await page.clock.runFor(32);
  await expect(page.getByRole('status')).toHaveText(/Fireworm captures flamehuffer · rook/i);
  await activate(page.getByRole('button',{name:'Back to menu'}));await activate(page.getByRole('button',{name:'New Game'}));
  await until(page,ui,'data-game-ready','true');await page.clock.runFor(4000);await expectTurn(page,'white');await expect(page.locator('canvas')).toHaveCount(1);
});

test('arena preference persists and board preference remains the reset default', async({page})=>{
  await openGame(page);
  await activate(page.getByRole('button',{name:'Settings',exact:true}));
  await expect(page.getByLabel('Capture presentation')).toHaveValue('board');
  await page.getByLabel('Capture presentation').selectOption('arena');await activate(page.getByRole('button',{name:'Done',exact:true}));
  await page.reload();await activate(page.getByRole('button',{name:'Settings',exact:true}));
  await expect(page.getByLabel('Capture presentation')).toHaveValue('arena');await activate(page.getByRole('button',{name:'Reset Defaults'}));
  await expect(page.getByLabel('Capture presentation')).toHaveValue('board');
});
