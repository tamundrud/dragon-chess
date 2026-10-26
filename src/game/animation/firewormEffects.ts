import Phaser from 'phaser';
export type OwnedTween = (config: Phaser.Types.Tweens.TweenBuilderConfig) => void;
export const FIREWORK_COLORS = [0xffce50, 0xff7849, 0x67e6db, 0xf491df, 0xbca0ff];

export function createFirewormBreath(scene: Phaser.Scene, layer: Phaser.GameObjects.Container,
  tween: OwnedTween, mouth: () => { x: number; y: number }) {
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
        const point = mouth(); flame.setPosition(point.x, point.y + (i - 2) * 5);
      } });
  }
  return () => ribbons.forEach((ribbon, i) => tween({ targets: ribbon, alpha: 0, duration: 260 + i * 25 }));
}

export function createFirewormImpact(scene: Phaser.Scene, layer: Phaser.GameObjects.Container, tween: OwnedTween) {
  const plume = scene.add.image(602, 292, 'fireworm-sheet', 'flame')
    .setDisplaySize(250, 280).setAngle(-65).setAlpha(0.9);
  layer.add(plume);
  tween({ targets: plume, y: 252, alpha: 0, duration: 900, ease: 'Sine.easeOut' });
  const core = scene.add.ellipse(602, 286, 80, 100, 0xffd770, 0.55);
  layer.add(core);
  tween({ targets: core, alpha: 0, duration: 180 });
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2;
    const radius = 100 + (i % 5) * 15;
    const color = FIREWORK_COLORS[i % FIREWORK_COLORS.length];
    const trail = i % 3 === 0 ? scene.add.graphics() : null;
    if (trail) layer.add(trail);
    const spark = scene.add.rectangle(600, 285, i % 3 ? 7 : 12, i % 3 ? 20 : 8, color);
    layer.add(spark);
    const motion = { t: 0 };
    const point = (t: number) => new Phaser.Math.Vector2(600 + Math.cos(angle) * radius * t,
      285 + Math.sin(angle) * radius * t + 65 * t * t);
    tween({ targets: motion, t: 1, duration: 900 + (i % 4) * 90, ease: 'Sine.easeOut', onUpdate: () => {
      const p = point(motion.t);
      spark.setPosition(p.x, p.y).setRotation(angle + motion.t * 2).setAlpha(1 - motion.t * 0.8);
      if (trail) {
        trail.clear().lineStyle(4, color, 0.9 * (1 - motion.t));
        trail.strokePoints(Array.from({length:5}, (_, step) => point(Math.max(0, motion.t - 0.3 + step * 0.075))));
      }
    }, onComplete: () => { spark.setVisible(false); trail?.clear(); } });
  }
  for (let i = 0; i < 4; i++) {
    const smoke = scene.add.ellipse(600 + i * 12, 350, 45, 56, 0x65778c, 0.18);
    layer.add(smoke);
    tween({ targets: smoke, y: 220 - i * 12, alpha: 0, duration: 800 + i * 70 });
  }
}
