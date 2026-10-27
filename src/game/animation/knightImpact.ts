import Phaser from 'phaser';
import type { KnightId } from './knightAssets';

type Tween = (config: Phaser.Types.Tweens.TweenBuilderConfig) => unknown;

/** Small, non-flashing visual accents. Every object belongs to the presentation root. */
export function knightImpact(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, id: KnightId, tween: Tween): void {
  const color: Record<KnightId, number> = {windwalker:0x9debe2, one_eye:0xffd377, driller_dragon:0xc6b4ef, poisonous_piffleworm:0xb974df};
  for (let i=0; i<7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const x = 625 + Math.cos(angle)*30, y = 365 + Math.sin(angle)*30;
    let mark: Phaser.GameObjects.Shape;
    if (id === 'driller_dragon') mark=scene.add.rectangle(x,y,12,9,0xc7ad88,0.9).setAngle(i*31);
    else if (id === 'poisonous_piffleworm') mark=scene.add.ellipse(x,y,12+i%3*3,12+i%3*3,color[id],0.65).setStrokeStyle(2,0xf3d8ff,0.8);
    else if (id === 'windwalker') mark=scene.add.ellipse(x,y,21,7,color[id],0.75).setAngle(angle*180/Math.PI);
    else mark=scene.add.star(x,y,4,3,11,color[id],0.9);
    parent.add(mark);
    tween({targets:mark, x:x+Math.cos(angle)*65, y:y+Math.sin(angle)*65, alpha:0,
      scaleX:0.65, scaleY:0.65, duration:550, ease:'Cubic.easeOut'});
  }
}
