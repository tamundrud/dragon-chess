import Phaser from 'phaser';
import type { OwnedTween } from './firewormEffects';
import type { Batch4Id } from './batch4Assets';

/** One connected foreground plume: every ribbon begins at the moving mouth. */
export function batch4Fire(scene:Phaser.Scene, layer:Phaser.GameObjects.Container, tween:OwnedTween,
  id:Exclude<Batch4Id,'stoick'>, mouth:()=>{x:number;y:number}, target:()=>{x:number;y:number}, size:number) {
  const ribbons=Array.from({length:4},(_,i)=>scene.add.image(0,0,'fireworm-sheet','flame')
    .setOrigin(0.025,0.5).setAlpha(0.94-i*0.1));
  layer.add(ribbons);
  const motion={travel:0,engulf:0,wave:0};
  const draw=()=>{
    const start=mouth(), end=target(); const angle=Math.atan2(end.y-start.y,end.x-start.x);
    const distance=Math.hypot(end.x-start.x,end.y-start.y)+size*0.3*motion.engulf;
    const base=id==='flamehuffer'?95:id==='hookfang'?185:145;
    ribbons.forEach((ribbon,i)=>{
      const spread=(base-i*17+size*(id==='hookfang'?0.8:0.5)*motion.engulf)*(0.2+0.8*motion.travel);
      ribbon.setPosition(start.x,start.y+(i-1.5)*2).setRotation(angle+(id==='common_or_garden'?motion.wave*(i+1)*0.012:0))
        .setDisplaySize(Math.max(1,distance*motion.travel),spread);
    });
  };
  draw(); tween({targets:motion,travel:1,duration:id==='flamehuffer'?360:480,ease:'Linear',onUpdate:draw});
  tween({targets:motion,engulf:1,delay:id==='flamehuffer'?360:480,duration:300,onUpdate:draw});
  if(id==='common_or_garden')tween({targets:motion,wave:1,duration:170,yoyo:true,repeat:4,onUpdate:draw});
  return ()=>ribbons.forEach((ribbon,i)=>tween({targets:ribbon,alpha:0,duration:220+i*30}));
}
