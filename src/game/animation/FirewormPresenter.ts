import Phaser from 'phaser';
import type { AttackContext, AttackDefinition, AttackLifecycleState, AttackPresenter } from './attackTypes';

const COLORS = [0xffce50, 0xff7849, 0x67e6db, 0xf491df, 0xbca0ff];

export class FirewormPresenter implements AttackPresenter {
  private root: Phaser.GameObjects.Container | null = null;
  private timers: Phaser.Time.TimerEvent[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];
  private complete: (() => void) | null = null;

  constructor(private scene: Phaser.Scene, private parent: Phaser.GameObjects.Container,
    private status: Phaser.GameObjects.Text, private attacker: Phaser.GameObjects.Text,
    private defender: Phaser.GameObjects.Text) {}

  playAttack(context: AttackContext, _definition: AttackDefinition,
    settings: { durationScale: number; reducedMotion: boolean },
    phase: (phase: AttackLifecycleState) => void, onComplete: () => void): void {
    this.cleanup();
    this.complete = onComplete;
    const scene = this.scene;
    const root = this.root = scene.add.container(0, 0);
    this.parent.add(root);
    const background = scene.add.image(400, 300, 'fireworm-cove').setDisplaySize(800, 600);
    root.add(background);
    const dragon = scene.add.container(240, 418);
    const wing = scene.add.image(-25, -108, 'fireworm-sheet', 'wing').setDisplaySize(225, 225).setOrigin(0.5, 0.85);
    const body = scene.add.image(-37, -12, 'fireworm-sheet', 'body').setDisplaySize(290, 290);
    const bodyRestScaleY = body.scaleY;
    const head = scene.add.image(32, -20, 'fireworm-sheet', 'head').setDisplaySize(240, 240).setOrigin(0.4, 1);
    dragon.add([wing, body, head]);
    const target = scene.add.image(616, 390, 'fireworm-sheet', 'defender').setDisplaySize(205, 205);
    root.add([dragon, target]);
    const token = scene.add.text(235, 390, '♜', { fontSize: '70px', color: '#ffe6a7', stroke: '#783e23', strokeThickness: 4 }).setOrigin(0.5);
    root.add(token);
    this.attacker.setText('FIREWORM · ROOK');
    this.defender.setText(context.defenderCharacterId === 'rival_generic' ? 'MEATHEAD RAIDER' :
      context.defenderCharacterId.replaceAll('_', ' ').toUpperCase());
    const reduced = settings.reducedMotion;
    const scale = settings.durationScale;
    const at = (ms: number, fn: () => void) => {
      this.timers.push(scene.time.delayedCall(ms * scale, fn));
    };
    const tween = (config: Phaser.Types.Tweens.TweenBuilderConfig) => {
      this.tweens.push(scene.tweens.add({ ...config, duration: Number(config.duration ?? 300) * scale }));
    };
    const say = (state: AttackLifecycleState, text: string) => { phase(state); this.status.setText(text); };
    say('preparing', 'A little spark of mischief…');
    root.setAlpha(0);
    tween({ targets: root, alpha: 1, duration: reduced ? 150 : 220 });
    dragon.setAlpha(0);
    tween({ targets: dragon, alpha: 1, duration: reduced ? 180 : 360 });
    tween({ targets: token, alpha: 0, duration: reduced ? 180 : 360 });

    if (reduced) {
      at(240, () => { say('attacking', 'Fireworm lets it glow'); head.setFrame('release'); });
      at(460, () => {
        say('impact', 'A very surprised raider!');
        const sparks = scene.add.graphics();
        COLORS.forEach((color, i) => { sparks.fillStyle(color, 0.55); sparks.fillCircle(560 + i * 19, 295 - (i % 2) * 20, 5); });
        root.add(sparks);
        target.setTint(0x65727b);
        tween({ targets: target, alpha: 0.25, duration: 200 });
      });
      at(700, () => { say('recovering', 'Quite pleased with himself.'); head.setFrame('head'); });
      at(1000, () => this.finish());
      return;
    }

    tween({ targets: body, scaleY: body.scaleY * 0.88, y: 3, duration: 680, ease: 'Sine.easeInOut' });
    tween({ targets: wing, angle: -23, duration: 790, ease: 'Sine.easeOut' });
    tween({ targets: head, angle: -15, x: 14, duration: 760, ease: 'Sine.easeInOut' });
    const glow = scene.add.ellipse(301, 324, 34, 52, 0xffb84c, 0.15);
    root.add(glow);
    tween({ targets: glow, alpha: 0.65, duration: 730 });
    at(850, () => {
      say('attacking', 'Here comes the fire!');
      glow.setVisible(false);
      head.setFrame('release');
      tween({ targets: head, angle: 6, x: 44, duration: 210, ease: 'Back.easeOut' });
      tween({ targets: wing, angle: 12, duration: 240 });
      tween({ targets: body, scaleY: bodyRestScaleY, y: -12, duration: 230 });
      for (let i = 0; i < 3; i++) {
        const flame = scene.add.image(350, 274 + i * 9, 'fireworm-sheet', 'flame')
          .setOrigin(0.08, 0.5).setDisplaySize(300, 122 - i * 20).setAlpha(0);
        root.add(flame);
        const full = flame.scaleX;
        flame.scaleX = full * 0.05;
        tween({ targets: flame, scaleX: full, alpha: 0.9 - i * 0.12, duration: 350 + i * 70, ease: 'Cubic.easeOut' });
        at(700 + i * 80, () => tween({ targets: flame, alpha: 0, duration: 300 }));
      }
    });
    at(1330, () => {
      say('impact', 'What a spectacular surprise!');
      const core = scene.add.ellipse(590, 300, 105, 125, 0xffd770, 0.7);
      root.add(core);
      tween({ targets: core, alpha: 0, scaleX: 1.5, scaleY: 1.5, duration: 220 });
      for (let i = 0; i < 40; i++) {
        const angle = (i / 40) * Math.PI * 2;
        const radius = 90 + (i % 5) * 19;
        const spark = scene.add.rectangle(590, 304, i % 3 ? 7 : 12, i % 3 ? 18 : 8, COLORS[i % COLORS.length]);
        const trail = i % 3 === 0 ? scene.add.graphics() : null;
        if (trail) root.add(trail);
        root.add(spark);
        const motion = { t: 0 };
        tween({ targets: motion, t: 1, duration: 850 + (i % 4) * 100, ease: 'Sine.easeOut', onUpdate: () => {
          spark.setPosition(590 + Math.cos(angle) * radius * motion.t,
            304 + Math.sin(angle) * radius * motion.t + 70 * motion.t * motion.t);
          spark.setRotation(angle + motion.t * 2).setAlpha(1 - motion.t * 0.8);
          if (trail) {
            trail.clear().lineStyle(3, COLORS[i % COLORS.length], 0.8 * (1 - motion.t));
            const points = Array.from({ length: 5 }, (_, step) => {
              const t = Math.max(0, motion.t - 0.25 + step * 0.0625);
              return new Phaser.Math.Vector2(590 + Math.cos(angle) * radius * t,
                304 + Math.sin(angle) * radius * t + 70 * t * t);
            });
            trail.strokePoints(points);
          }
        }, onComplete: () => { spark.setVisible(false); trail?.clear(); }});
      }
      tween({ targets: target, x: 651, angle: 19, duration: 190, ease: 'Back.easeOut' });
      target.setTint(0x737b85);
      for (let i = 0; i < 5; i++) {
        const smoke = scene.add.ellipse(593 + i * 13, 345, 40, 48, 0x65778c, 0.25);
        root.add(smoke);
        tween({ targets: smoke, y: 240 - i * 12, alpha: 0, duration: 800 + i * 60 });
      }
    });
    at(1980, () => {
      say('recovering', 'Quite pleased with himself.');
      head.setFrame('head');
      tween({ targets: head, angle: -8, y: -30, duration: 260, yoyo: true, ease: 'Sine.easeInOut' });
      tween({ targets: wing, angle: -6, duration: 450, ease: 'Sine.easeInOut' });
      tween({ targets: target, y: 440, alpha: 0, duration: 520 });
      const ember = scene.add.ellipse(402, 270, 5, 8, 0xffca60);
      root.add(ember);
      tween({ targets: ember, x: 450, y: 220, alpha: 0, duration: 750 });
    });
    at(2980, () => { this.status.setText('Back to the board'); tween({ targets: root, alpha: 0, duration: 320 }); });
    at(3350, () => this.finish());
  }

  private finish(): void {
    const callback = this.complete;
    this.cleanup();
    callback?.();
  }

  skip(): void { this.finish(); }

  cleanup(): void {
    this.complete = null;
    this.timers.splice(0).forEach(timer => timer.remove(false));
    this.tweens.splice(0).forEach(tween => tween.remove());
    this.root?.destroy(true);
    this.root = null;
  }
}
