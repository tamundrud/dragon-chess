import { test, expect, openGame, tapSquare } from '../e2e/helpers.js';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import fs from 'node:fs';

test.describe.configure({timeout:900_000});
const cases = [
  ['windwalker',['b1','c3','d7','d5','c3','d5']],
  ['one-eye',['g1','f3','e7','e5','f3','e5']],
  ['driller',['a2','a3','b8','c6','d2','d4','c6','d4']],
  ['piffleworm',['a2','a3','g8','f6','e2','e4','f6','e4']],
];
for (const [name,squares] of cases) test(`record ${name}`, async ({page},info) => {
  await openGame(page,{pausedClock:true});
  for (const square of squares) { await tapSquare(page,square); await page.clock.runFor(32); }
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','preparing');
  const dir=path.resolve('docs/reviews/artifacts/four-knights'); fs.mkdirSync(dir,{recursive:true});
  const filename=path.join(dir,`${info.project.name}-${name}.mp4`);
  const encoder=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate','15','-vcodec','png','-i','-','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-pix_fmt','yuv420p','-crf','20',filename],{stdio:['pipe','ignore','pipe']});
  let error='';encoder.stderr.on('data',chunk=>{error+=chunk;});
  for(let t=0;t<=3500;t+=67) {
    await page.clock.runFor(67);
    const frame=await page.locator('#phaser-container canvas').screenshot({scale:'css'});
    if(!encoder.stdin.write(frame)) await once(encoder.stdin,'drain');
  }
  encoder.stdin.end(); const [code]=await once(encoder,'close'); expect(code,error).toBe(0);
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','idle');
});
