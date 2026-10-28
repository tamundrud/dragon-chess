import { test, expect, openGame, tapSquare } from '../e2e/helpers.js';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import fs from 'node:fs';

test.describe.configure({timeout:900_000});
const cases = [
  ['hiccup',['d2','d4','e7','e5','c1','g5','f7','f6','g5','f6'],'black'],
  ['toothless',['e2','e4','d7','d5','f1','b5','c7','c6','b5','c6'],'black'],
  ['thuggory',['d2','d4','d7','d5','e2','e4','c8','g4','f2','f3','g4','f3'],'white'],
  ['killer',['e2','e4','e7','e5','d2','d3','f8','b4','c2','c3','b4','c3'],'white'],
];
for (const [name,squares] of cases) test(`record ${name}`, async ({page},info) => {
  await openGame(page,{pausedClock:true});
  const loaded = []; page.on('requestfinished', request => { if (request.url().includes(`/art/bishops/${name}-`)) loaded.push(request.url()); });
  for (const square of squares) { await tapSquare(page,square); await page.clock.runFor(32); }
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','preparing');
  await expect.poll(() => loaded.length, {timeout:30000}).toBe(name === 'hiccup' ? 5 : 3);
  await page.clock.runFor(64);
  await page.waitForTimeout(500);
  const dir=path.resolve('docs/reviews/artifacts/four-bishops'); fs.mkdirSync(dir,{recursive:true});
  const filename=path.join(dir,`${info.project.name}-${name}.mp4`);
  const encoder=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate','15','-vcodec','png','-i','-','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-pix_fmt','yuv420p','-crf','20',filename],{stdio:['pipe','ignore','pipe']});
  let error='';encoder.stderr.on('data',chunk=>{error+=chunk;});
  const phases = new Set();
  for(let t=0;t<=3500;t+=67) {
    await page.clock.runFor(67);
    phases.add(await page.locator('#game-ui').getAttribute('data-attack-state'));
    const frame=await page.locator('#phaser-container canvas').screenshot({scale:'css'});
    if(!encoder.stdin.write(frame)) await once(encoder.stdin,'drain');
  }
  expect(phases.has('attacking')).toBe(true); expect(phases.has('impact')).toBe(true);
  encoder.stdin.end(); const [code]=await once(encoder,'close'); expect(code,error).toBe(0);
  await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','idle');
});
