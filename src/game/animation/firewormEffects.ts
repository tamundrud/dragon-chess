import Phaser from 'phaser';
export type OwnedTween = (config: Phaser.Types.Tweens.TweenBuilderConfig) => void;
export const FIREWORK_COLORS = [0xffce50, 0xff7849, 0x67e6db, 0xf491df, 0xbca0ff];

export function createFirewormBreath(scene: Phaser.Scene, layer: Phaser.GameObjects.Container,
  tween: OwnedTween, mouth: () => { x: number; y: number }, contact: () => { x: number; y: number }) {
  const ribbons: Phaser.GameObjects.Image[] = [];
  for (let i = 0; i < 5; i++) {
    const point = mouth();
    const flame = scene.add.image(point.x, point.y, 'fireworm-sheet', 'flame')
      .setOrigin(0.025, 0.5).setDisplaySize(370 - i * 10, 270 - i * 38).setAlpha(0);
    layer.add(flame); ribbons.push(flame);
    const full = flame.scaleX;
    flame.scaleX = full * 0.02;
    tween({ targets: flame, scaleX: full, alpha: 0.96 - i * 0.08,
      duration: 330 + i * 45, ease: 'Cubic.easeOut', onUpdate: () => {
        const point = mouth(), end = contact();
        flame.setPosition(point.x, point.y + (i - 2) * 5).setRotation(Math.atan2(end.y - point.y, end.x - point.x));
      } });
  }
  return () => ribbons.forEach((ribbon, i) => tween({ targets: ribbon, alpha: 0, duration: 260 + i * 25 }));
}

export function createFirewormImpact(scene: Phaser.Scene, rear: Phaser.GameObjects.Container,
  front: Phaser.GameObjects.Container, tween: OwnedTween, size: number, attackSide: number) {
  const x = attackSide * size * 0.18, y = -size * 0.56;
  const plume = scene.add.image(x, y, 'fireworm-sheet', 'flame')
    .setDisplaySize(size * 0.85, size).setAngle(-65 * -attackSide).setAlpha(0.8);
  rear.add(plume);
  tween({ targets: plume, y:y - size * 0.15, alpha:0, duration:650, ease:'Sine.easeOut' });
  const engulfment = scene.add.container(0, 0).setAlpha(0);
  front.add(engulfment);
  for (const [angle, opacity] of [[-65, 0.9], [-110, 0.65]]) {
    const wrap = scene.add.image(x, y, 'fireworm-sheet', 'flame')
      .setDisplaySize(size * 0.68, size * 0.82).setAngle(angle * -attackSide).setAlpha(opacity);
    engulfment.add(wrap);
  }
  const strike = scene.add.image(attackSide * size * 0.5, y, 'fireworm-sheet', 'flame')
    .setOrigin(attackSide < 0 ? 0 : 1, 0.5).setFlipX(attackSide > 0)
    .setDisplaySize(size * 0.8, size * 0.6);
  engulfment.add(strike);
  tween({ targets:engulfment, alpha:0.92, duration:160, ease:'Cubic.easeOut' });
  const core = scene.add.ellipse(attackSide * size * 0.36, y, size * 0.28, size * 0.36, 0xffd770, 0.55);
  front.add(core);
  tween({ targets:core, alpha:0, duration:180 });
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2;
    const radius = size * (0.3 + (i % 5) * 0.025);
    const color = FIREWORK_COLORS[i % FIREWORK_COLORS.length];
    const layer = i % 2 ? front : rear;
    const trail = i % 3 === 0 ? scene.add.graphics() : null;
    if (trail) layer.add(trail);
    const spark = scene.add.rectangle(x, y, i % 3 ? 7 : 12, i % 3 ? 20 : 8, color);
    layer.add(spark);
    const motion = { t:0 };
    const point = (t: number) => new Phaser.Math.Vector2(x + Math.cos(angle) * radius * 0.65 * t,
      y + Math.sin(angle) * radius * t + size * 0.24 * t * t);
    tween({ targets:motion, t:1, duration:650 + (i % 4) * 70, ease:'Sine.easeOut', onUpdate:() => {
      const p = point(motion.t);
      spark.setPosition(p.x, p.y).setRotation(angle + motion.t * 2).setAlpha(1 - motion.t * 0.8);
      if (trail) {
        trail.clear().lineStyle(4, color, 0.9 * (1 - motion.t));
        trail.strokePoints(Array.from({length:5}, (_, step) => point(Math.max(0, motion.t - 0.3 + step * 0.075))));
      }
    }, onComplete:() => { spark.setVisible(false); trail?.clear(); } });
  }
  for (let i = 0; i < 4; i++) {
    const smoke = scene.add.ellipse(x + i * size * 0.04, y + size * 0.2, size * 0.16, size * 0.2, 0x65778c, 0.18);
    front.add(smoke);
    tween({ targets:smoke, y:y - size * (0.2 + i * 0.04), alpha:0, duration:600 + i * 40 });
  }
  return () => tween({ targets:engulfment, alpha:0, duration:260 });
}
