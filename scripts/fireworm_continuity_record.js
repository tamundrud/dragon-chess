import { test, expect, activate } from '../e2e/helpers.js';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import fs from 'node:fs';

test.describe.configure({timeout:900_000});
for (const defender of ['pawn','rook']) test(`record full ${defender} sequences`, async ({page}, info) => {
  const dir=path.resolve('docs/reviews/artifacts/fireworm-continuity'); fs.mkdirSync(dir,{recursive:true});
  await page.clock.install({time:new Date('2026-10-26T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
  await page.goto('/?preview=fireworm');
  await expect.poll(async()=>{await page.clock.runFor(32);return page.locator('main[data-ready="true"]').count();},{timeout:30000,intervals:[0]}).toBe(1);
  await activate(page.getByRole('button',{name:'Skip',exact:true}));
  await page.getByLabel('Defender').selectOption(defender);
  for(const presentation of ['board','arena']) for(const speed of ['normal','fast']) {
    await page.getByLabel('Presentation').selectOption(presentation);await page.getByLabel('Speed').selectOption(speed);
    await activate(page.getByRole('button',{name:'Replay capture'}));
    const filename=path.join(dir,`${info.project.name}-${defender}-${presentation}-${speed}.mp4`);
    const encoder=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate','30','-vcodec','png','-i','-','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-pix_fmt','yuv420p','-crf','20',filename],{stdio:['pipe','ignore','pipe']});
    let error='';encoder.stderr.on('data',chunk=>{error+=chunk;});
    const total=speed==='fast'?1200:3400;
    for(let t=0;t<=total;t+=33) {
      await page.clock.runFor(33);
      const frame=await page.locator('.fireworm-canvas canvas').screenshot({scale:'css'});
      if(!encoder.stdin.write(frame)) await once(encoder.stdin,'drain');
    }
    encoder.stdin.end(); const [code]=await once(encoder,'close');
    expect(code,error).toBe(0);
    await expect(page.locator('main.fireworm-proof')).toHaveAttribute('data-phase','idle');
  }
});
