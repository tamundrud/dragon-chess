import { test, expect, openGame, tapSquare } from '../e2e/helpers.js';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import fs from 'node:fs';
test.describe.configure({timeout:900_000});
const cases=[
 ['hookfang',['h2','h4','a7','a5','h1','h3','a5','a4','h3','a3','d7','d5','a3','a4'],2],
 ['flamehuffer',['a2','a4','a7','a5','b2','b4','a8','a6','b4','b5','a6','b6','c2','c4','b6','b5'],2],
 ['common_or_garden',['g2','g4','h7','h5','g4','g5','h8','h6','a2','a3','h6','g6','b2','b3','g6','g5'],2],
 ['stoick',['e2','e4','d7','d5','e1','e2','d5','e4','e2','e3','g7','g6','e3','e4'],5],
];
for(const [name,squares,count] of cases)test(`record ${name}`,async({page},info)=>{
 await openGame(page,{pausedClock:true});const loaded=[];page.on('requestfinished',r=>{if(r.url().includes(`/art/batch4/${name}-`))loaded.push(r.url());});
 for(const [index,square] of squares.entries()){await tapSquare(page,square);await page.clock.runFor(32);if(index<squares.length-1 && await page.locator('#game-ui').getAttribute('data-attack-state')!=='idle'){await page.keyboard.press('Escape');await page.clock.runFor(32);}}
 await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','preparing');await expect.poll(()=>loaded.length,{timeout:30000}).toBe(count);await page.clock.runFor(64);await page.waitForTimeout(500);
 const dir=path.resolve('docs/reviews/artifacts/batch4-videos');fs.mkdirSync(dir,{recursive:true});
 const filename=path.join(dir,`${info.project.name}-${name}.mp4`);
 const encoder=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate','15','-vcodec','png','-i','-','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-pix_fmt','yuv420p','-crf','20',filename],{stdio:['pipe','ignore','pipe']});
 let error='';encoder.stderr.on('data',chunk=>{error+=chunk;});const phases=new Set();
 for(let t=0;t<=4350;t+=67){await page.clock.runFor(67);phases.add(await page.locator('#game-ui').getAttribute('data-attack-state'));const frame=await page.locator('#phaser-container canvas').screenshot({scale:'css'});if(!encoder.stdin.write(frame))await once(encoder.stdin,'drain');}
 expect(phases.has('attacking')).toBe(true);expect(phases.has('impact')).toBe(true);encoder.stdin.end();const [code]=await once(encoder,'close');expect(code,error).toBe(0);
 await expect(page.locator('#game-ui')).toHaveAttribute('data-attack-state','idle');
});
