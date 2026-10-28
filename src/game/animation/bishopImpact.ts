import Phaser from 'phaser';
import type { BishopId } from './bishopAssets';

type Tween = (config: Phaser.Types.Tweens.TweenBuilderConfig) => unknown;

/** Small, non-flashing visual accents. Every object belongs to the presentation root. */
export function bishopImpact(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, id: BishopId, tween: Tween): void {
  const color: Record<BishopId, number> = {hiccup:0xe7ca86, toothless:0x9be386, thuggory:0xc7ad88, killer:0xb4d8ed};
  for (let i=0; i<7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const x = 625 + Math.cos(angle)*30, y = 365 + Math.sin(angle)*30;
    let mark: Phaser.GameObjects.Shape;
    if (id === 'thuggory') mark=scene.add.rectangle(x,y,12,9,0xc7ad88,0.9).setAngle(i*31);
    else if (id === 'hiccup') mark=scene.add.ellipse(x,y,12+i%3*3,12+i%3*3,color[id],0.65).setStrokeStyle(2,0xf3d8ff,0.8);
    else if (id === 'killer') mark=scene.add.ellipse(x,y,21,7,color[id],0.75).setAngle(angle*180/Math.PI);
    else mark=scene.add.star(x,y,4,3,11,color[id],0.9);
    parent.add(mark);
    tween({targets:mark, x:x+Math.cos(angle)*65, y:y+Math.sin(angle)*65, alpha:0,
      scaleX:0.65, scaleY:0.65, duration:550, ease:'Cubic.easeOut'});
  }
}
