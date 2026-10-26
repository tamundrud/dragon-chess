import { test, expect, activate, captureScreenshot } from './helpers.js';
test.describe.configure({timeout:240_000});

async function fireOnBody(page, size) {
  const png=await page.locator('.fireworm-canvas canvas').screenshot({scale:'css'});
  return page.evaluate(async({png,size})=>{
    const im=new Image();im.src=`data:image/png;base64,${png}`;await im.decode();
    const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
    const ctx=c.getContext('2d');ctx.drawImage(im,0,0);const pixels=ctx.getImageData(0,0,c.width,c.height).data;
    const scale=Math.min(c.width/800,c.height/600),ox=(c.width-800*scale)/2,oy=(c.height-600*scale)/2;
    let hot=0,total=0;
    // Sample the interior chest after the shared recoil, away from silhouette edges.
    for(let x=-size*.08;x<size*.08;x+=2)for(let y=-size*.47;y<-size*.33;y+=2){
      const angle=12*Math.PI/180,px=Math.round(ox+(670+x*Math.cos(angle)-y*Math.sin(angle))*scale),py=Math.round(oy+(490+x*Math.sin(angle)+y*Math.cos(angle))*scale);
      const i=(py*c.width+px)*4;const [r,g,b]=pixels.slice(i,i+3);
      total++;if(r>150&&r>g*1.15&&g>b*1.3)hot++;
    }return hot/total;
  },{png:png.toString('base64'),size});
}

for(const [defender,size]of[['pawn',215],['rook',275]])test(`${defender} faces Fireworm, is engulfed, and is revealed in Normal/Fast board/arena`,async({page},info)=>{
  await page.clock.install({time:new Date('2026-10-26T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
  await page.goto('/?preview=fireworm');
  const main=page.locator('main.fireworm-proof');
  await expect.poll(async()=>{await page.clock.runFor(32);return page.locator('main[data-ready="true"]').count();},{timeout:30000,intervals:[0]}).toBe(1);
  await activate(page.getByRole('button',{name:'Skip',exact:true}));
  await page.getByLabel('Defender').selectOption(defender);
  for(const presentation of ['board','arena'])for(const speed of ['normal','fast']){
    const factor=speed==='fast'?.35:1;
    await page.getByLabel('Presentation').selectOption(presentation);await page.getByLabel('Speed').selectOption(speed);
    await activate(page.getByRole('button',{name:'Replay capture'}));
    await page.clock.runFor(650*factor);await captureScreenshot(page,info,`${defender}-${presentation}-${speed}-facing`);
    for (const [name, delta] of [['launch',250],['approach',200],['precontact',190],['contact',80],['expanding',110]]) {
      await page.clock.runFor(delta*factor);
      await captureScreenshot(page,info,`${defender}-${presentation}-${speed}-${name}`);
    }
    await page.clock.runFor(100*factor);const engulfed=await fireOnBody(page,size);
    await captureScreenshot(page,info,`${defender}-${presentation}-${speed}-engulfed`);
    expect(engulfed,'painted fire must cover the opaque interior of the defender').toBeGreaterThan(.2);
    await page.clock.runFor(770*factor);await captureScreenshot(page,info,`${defender}-${presentation}-${speed}-defeated`);
    expect(await fireOnBody(page,size),'front fire must dissipate before the defeated hold').toBeLessThan(.05);
    await page.clock.runFor(1100*factor);await expect(main).toHaveAttribute('data-phase','idle');
    await expect(page.locator('canvas')).toHaveCount(1);
  }
});
