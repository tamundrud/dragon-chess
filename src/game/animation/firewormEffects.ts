import Phaser from 'phaser';
export type OwnedTween = (config: Phaser.Types.Tweens.TweenBuilderConfig) => void;
export const FIREWORK_COLORS = [0xffce50, 0xff7849, 0x67e6db, 0xf491df, 0xbca0ff];

export function createFirewormBreath(scene: Phaser.Scene, layer: Phaser.GameObjects.Container,
  tween: OwnedTween, mouth: () => { x: number; y: number }, contact: () => { x: number; y: number }, size: number) {
  const ribbons: Phaser.GameObjects.Image[] = [];
  const motion = { travel: 0, engulf: 0 };
  for (let i = 0; i < 5; i++) {
    const flame = scene.add.image(0, 0, 'fireworm-sheet', 'flame')
      .setOrigin(0.025, 0.5).setAlpha(0.96 - i * 0.08);
    layer.add(flame); ribbons.push(flame);
  }
  const draw = () => {
    const start = mouth(), end = contact();
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const distance = Math.hypot(end.x - start.x, end.y - start.y) + size * 0.25 * motion.engulf;
    ribbons.forEach((flame, i) => {
      const width = ((210 - i * 30) + size * 0.55 * motion.engulf) * (0.2 + 0.8 * motion.travel);
      flame.setPosition(start.x, start.y + (i - 2) * 3).setRotation(angle)
        .setDisplaySize(Math.max(1, distance * motion.travel), width);
    });
  };
  draw();
  tween({targets:motion, travel:1, duration:480, ease:'Linear', onUpdate:draw});
  // The same ribbons broaden from contact; no additional foreground flame is introduced.
  tween({targets:motion, engulf:1, delay:480, duration:270, ease:'Sine.easeOut', onUpdate:draw});
  return () => ribbons.forEach((ribbon, i) => tween({targets:ribbon, alpha:0, duration:260 + i * 25}));
}

export function createFirewormImpact(scene: Phaser.Scene, rear: Phaser.GameObjects.Container,
  front: Phaser.GameObjects.Container, tween: OwnedTween, size: number, attackSide: number) {
  const x = attackSide * size * 0.18, y = -size * 0.56;
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
}
