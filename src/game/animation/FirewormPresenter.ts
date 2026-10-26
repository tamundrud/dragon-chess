import Phaser from 'phaser';
import type { AttackContext, AttackDefinition, AttackLifecycleState, AttackPlaybackSettings, AttackPresenter } from './attackTypes';
import { resolveFirewormDefender, defenderFlipX } from './firewormDefender';
import { createFirewormBreath, createFirewormImpact, FIREWORK_COLORS } from './firewormEffects';

export class FirewormPresenter implements AttackPresenter {
  private root: Phaser.GameObjects.Container | null = null;
  private timers: Phaser.Time.TimerEvent[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];
  private complete: (() => void) | null = null;

  constructor(private scene: Phaser.Scene, private parent: Phaser.GameObjects.Container,
    private status: Phaser.GameObjects.Text, private attacker: Phaser.GameObjects.Text,
    private defender: Phaser.GameObjects.Text) {}

  playAttack(context: AttackContext, _definition: AttackDefinition, settings: AttackPlaybackSettings,
    phase: (phase: AttackLifecycleState) => void, onComplete: () => void): void {
    this.cleanup(); this.complete = onComplete;
    const scene = this.scene;
    const root = this.root = scene.add.container(0, 0);
    this.parent.add(root);
    if (settings.presentation === 'arena') root.add(scene.add.image(400, 300, 'fireworm-cove').setDisplaySize(800, 600));
    const effects = scene.add.container(0, 0);
    const dragon = scene.add.container(245, 490);
    const poses = ['fireworm-ready','fireworm-breath','fireworm-proud'].map((key, i) =>
      scene.add.image(0, 0, key).setDisplaySize(410, 410).setOrigin(0.5, 0.94).setAlpha(i === 0 ? 1 : 0));
    dragon.add(poses);
    const appearance = resolveFirewormDefender(context);
    const target = scene.add.container(650, 490);
    const targetSize = appearance.type === 'r' ? 275 : 215;
    const attackSide = Math.sign(dragon.x - target.x) || -1;
    const rearImpact = scene.add.container(0, 0);
    target.add(rearImpact);
    let targetArt: Phaser.GameObjects.Image | null = null;
    if (appearance.texture) {
      targetArt = scene.add.image(0, 0, appearance.texture, appearance.frame)
        .setDisplaySize(targetSize, targetSize).setOrigin(0.5, 0.94)
        .setFlipX(defenderFlipX(appearance.facing!, dragon.x, target.x));
      target.add(targetArt);
    } else {
      target.add(scene.add.ellipse(0, -90, 140, 165, appearance.color === 'b' ? 0x345c75 : 0xc39647, 0.95));
      target.add(scene.add.text(0, -95, appearance.type.toUpperCase(), {fontSize:'72px', color:'#fff4da', fontFamily:'Georgia'}).setOrigin(0.5));
    }
    const soot = scene.add.container(0, 0).setVisible(false);
    for (const [x, y] of [[-0.12, -0.42], [0.14, -0.64], [0.05, -0.3]]) {
      soot.add(scene.add.ellipse(x * targetSize, y * targetSize, targetSize * 0.23, targetSize * 0.09, 0x242935, 0.55));
    }
    const dazed = scene.add.text(0, -targetSize, '✦  ·  ✦', {fontSize:'24px', color:'#ffe08b', stroke:'#283b48', strokeThickness:3}).setOrigin(0.5).setVisible(false);
    const foregroundImpact = scene.add.container(0, 0);
    target.add([soot, dazed, foregroundImpact]);
    root.add([effects, dragon, target]);
    this.attacker.setText('FIREWORM · ROOK'); this.defender.setText(appearance.label);
    const reduced = settings.reducedMotion;
    const at = (ms: number, fn: () => void) => this.timers.push(scene.time.delayedCall(ms * settings.durationScale, fn));
    const tween = (config: Phaser.Types.Tweens.TweenBuilderConfig) => {
      this.tweens.push(scene.tweens.add({...config, duration:Number(config.duration ?? 300) * settings.durationScale}));
    };
    const pose = (index: number) => poses.forEach((image, i) => tween({targets:image, alpha:i === index ? 1 : 0, duration:reduced ? 120 : 100}));
    const say = (state: AttackLifecycleState, text: string) => { phase(state); this.status.setText(text); };
    const mouth = () => {
      const angle = dragon.rotation;
      const x = 150 * dragon.scaleX; const y = -178 * dragon.scaleY;
      return { x:dragon.x + x * Math.cos(angle) - y * Math.sin(angle), y:dragon.y + x * Math.sin(angle) + y * Math.cos(angle) };
    };
    say('preparing', 'A little spark of mischief…');
    root.setAlpha(0); tween({targets:root, alpha:1, duration:180});
    if (reduced) {
      at(240, () => { say('attacking', 'Fireworm lets it glow'); pose(1); });
      at(460, () => {
        say('impact', 'A very surprised opponent!');
        const sparks = scene.add.graphics();
        FIREWORK_COLORS.forEach((color, i) => { sparks.fillStyle(color, 0.55); sparks.fillCircle(565 + i * 18, 290 - (i % 2) * 20, 5); });
        effects.add(sparks); targetArt?.setTint(0x81909c); soot.setVisible(true);
      });
      at(700, () => { say('recovering', 'A well-toasted opponent!'); pose(2); tween({targets:target, alpha:0.25, duration:200}); });
      at(1000, () => this.finish()); return;
    }
    const origins = settings.origins?.();
    if (settings.presentation !== 'arena' && origins) {
      for (const [actor, origin, end] of [[dragon, origins.attacker, {x:245,y:490}], [target,origins.defender,{x:650,y:490}]] as const) {
        actor.setPosition(origin.x, origin.y).setScale(0.16);
        tween({targets:actor, x:end.x, y:end.y, scaleX:1, scaleY:1, duration:500, ease:'Cubic.easeOut'});
      }
    }
    at(520, () => tween({targets:dragon, scaleY:0.96, angle:-2, duration:280, ease:'Sine.easeInOut'}));
    let stopBreath: (() => void) | undefined;
    let clearEngulfment: (() => void) | undefined;
    at(850, () => {
      say('attacking', 'Here comes the fire!'); pose(1);
      tween({targets:dragon, x:262, scaleY:1, angle:0, duration:210, ease:'Cubic.easeOut'});
      stopBreath = createFirewormBreath(scene, effects, tween, mouth, () => ({x:target.x + attackSide * targetSize * 0.3, y:target.y - targetSize * 0.6}));
    });
    at(1330, () => {
      say('impact', 'What a spectacular surprise!');
      clearEngulfment = createFirewormImpact(scene, rearImpact, foregroundImpact, tween, targetSize, attackSide);
      targetArt?.setTint(0x7b8491); soot.setVisible(true);
      tween({targets:target, x:670, angle:12, duration:210, ease:'Back.easeOut'});
    });
    at(1600, () => stopBreath?.());
    at(1680, () => clearEngulfment?.());
    at(1980, () => {
      say('recovering', 'A well-toasted opponent!'); pose(2);
      dazed.setVisible(true);
      tween({targets:target, scaleY:0.9, duration:180});
      tween({targets:dragon, angle:-3, y:483, duration:260, yoyo:true, ease:'Sine.easeInOut'});
    });
    at(2640, () => tween({targets:target, alpha:0, y:520, duration:300}));
    at(2980, () => {
      this.status.setText('Back to the board');
      if (settings.presentation !== 'arena' && settings.origins) {
        const start = {x:dragon.x, y:dragon.y};
        const motion = {t:0};
        tween({targets:dragon, scaleX:0.16, scaleY:0.16, duration:320});
        tween({targets:motion, t:1, duration:320, ease:'Cubic.easeInOut', onUpdate: () => {
          const destination = settings.origins!().destination;
          dragon.setPosition(start.x + (destination.x - start.x) * motion.t, start.y + (destination.y - start.y) * motion.t);
        }});
      }
      tween({targets:root, alpha:0, duration:320});
    });
    at(3350, () => this.finish());
  }

  private finish(): void { const callback = this.complete; this.cleanup(); callback?.(); }
  skip(): void { this.finish(); }
  cleanup(): void {
    this.complete = null;
    this.timers.splice(0).forEach(timer => timer.remove(false));
    this.tweens.splice(0).forEach(tween => tween.remove());
    this.root?.destroy(true); this.root = null;
  }
}
