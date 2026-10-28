import Phaser from 'phaser';
import { CharacterRegistry } from '../characters/CharacterRegistry';
import { defenderFlipX, resolveFirewormDefender } from './firewormDefender';
import { bishopImpact } from './bishopImpact';
import { KNIGHTS } from './knightAssets';
import { BISHOPS, bishopHeightRatio, type BishopId } from './bishopAssets';
import type { AttackContext, AttackDefinition, AttackLifecycleState, AttackPlaybackSettings, AttackPresenter } from './attackTypes';

export class BishopPresenter implements AttackPresenter {
  private root: Phaser.GameObjects.Container | null = null;
  private timers: Phaser.Time.TimerEvent[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];
  private complete: (() => void) | null = null;
  constructor(private scene: Phaser.Scene, private parent: Phaser.GameObjects.Container,
    private status: Phaser.GameObjects.Text, private attacker: Phaser.GameObjects.Text, private defender: Phaser.GameObjects.Text) {}

  playAttack(context: AttackContext, _definition: AttackDefinition, settings: AttackPlaybackSettings,
    phase: (phase: AttackLifecycleState) => void, onComplete: () => void): void {
    this.cleanup(); this.complete = onComplete;
    const id = context.attackerCharacterId as BishopId;
    if (!BISHOPS.includes(id)) { this.finish(); return; }
    const scene = this.scene;
    const root = this.root = scene.add.container(0, 0); this.parent.add(root);
    if (settings.presentation === 'arena') root.add(scene.add.image(400, 300, 'fireworm-cove').setDisplaySize(800, 600));
    const dragon = scene.add.container(245, 490);
    const width = id === 'toothless' ? 290 : 410;
    const ratio = bishopHeightRatio(id);
    const poseNames = id === 'hiccup' ? ['ready', 'action', 'proud', 'release'] : ['ready', 'action', 'proud'];
    const poses = poseNames.map((pose, i) => scene.add.image(0, 0, `bishop-${id}-${pose}`)
      .setDisplaySize(width, width * ratio).setOrigin(0.5, 0.94).setAlpha(i === 0 ? 1 : 0));
    dragon.add(poses);
    const fallback = resolveFirewormDefender(context, scene.textures?.exists(`bishop-${context.defenderCharacterId}-ready`) ?? false);
    const defenderCharacter = CharacterRegistry.getInstance().getById(context.defenderCharacterId);
    const matchingDefender = defenderCharacter?.pieceType === fallback.type &&
      defenderCharacter.faction === (fallback.color === 'w' ? 'light' : 'dark');
    const knightDefender = KNIGHTS.some(knight => knight === context.defenderCharacterId) && matchingDefender && fallback.type === 'n';
    const appearance = matchingDefender && context.defenderCharacterId === 'fireworm'
      ? { ...fallback, label:'FIREWORM · ROOK', texture:'fireworm-ready', frame:undefined, facing:1 as const }
      : context.defenderCharacterId === 'viking_warrior' && fallback.type === 'p' && fallback.color === 'w'
        ? { ...fallback, label:'HOOLIGAN WARRIOR · PAWN', texture:'knight-hooligan', facing:1 as const } : fallback;
    const target = scene.add.container(650, 490);
    const targetSize = appearance.type === 'r' || (appearance.type === 'n' && knightDefender) ? 275 : 215;
    if (appearance.texture) target.add(scene.add.image(0, 0, appearance.texture, appearance.frame)
      .setDisplaySize(targetSize, appearance.type === 'b' && BISHOPS.some(id => id === context.defenderCharacterId)
        ? targetSize * bishopHeightRatio(context.defenderCharacterId as BishopId) : targetSize).setOrigin(0.5, 0.94).setFlipX(defenderFlipX(appearance.facing!, 245, 650)));
    else {
      target.add(scene.add.ellipse(0, -90, 140, 165, appearance.color === 'b' ? 0x345c75 : 0xc39647, 0.95));
      target.add(scene.add.text(0, -95, appearance.type.toUpperCase(), { fontSize:'72px', color:'#fff4da', fontFamily:'Georgia' }).setOrigin(0.5));
    }
    const dazed = scene.add.text(0, -targetSize, '✦  ·  ✦', {fontSize:'24px', color:'#ffe08b', stroke:'#283b48', strokeThickness:3}).setOrigin(0.5).setVisible(false);
    target.add(dazed);
    const effects = scene.add.container(0, 0);
    root.add([dragon, target, effects]);
    this.attacker.setText(`${CharacterRegistry.getInstance().getById(id)!.displayName.toUpperCase()} · BISHOP`);
    this.defender.setText(appearance.label);
    const at = (ms: number, fn: () => void) => this.timers.push(scene.time.delayedCall(ms * settings.durationScale, fn));
    const tween = (config: Phaser.Types.Tweens.TweenBuilderConfig) => this.tweens.push(scene.tweens.add({ ...config,
      duration: Number(config.duration ?? 300) * settings.durationScale, delay:Number(config.delay ?? 0) * settings.durationScale }));
    const pose = (index: number) => poses.forEach((image, i) => tween({targets:image, alpha:i === index ? 1 : 0, duration:100}));
    const say = (state: AttackLifecycleState, text: string) => { phase(state); this.status.setText(text); };
    say('preparing', 'Getting ready…');
    root.setAlpha(0); tween({targets:root, alpha:1, duration:180});
    const origins = settings.origins?.();
    if (!settings.reducedMotion && settings.presentation !== 'arena' && origins) {
      for (const [actor, origin, end] of [[dragon, origins.attacker, {x:245,y:490}], [target, origins.defender, {x:650,y:490}]] as const) {
        actor.setPosition(origin.x, origin.y).setScale(0.16);
        tween({targets:actor, x:end.x, y:end.y, scaleX:1, scaleY:1, duration:500, ease:'Cubic.easeOut'});
      }
    }
    if (settings.reducedMotion) {
      at(240, () => { say('attacking', 'Here we go!'); pose(1); });
      at(460, () => { say('impact', 'A surprise!'); dazed.setVisible(true); });
      at(700, () => { say('recovering', 'Back to the board'); pose(2); tween({targets:target, alpha:0.25, duration:200}); });
      at(1000, () => this.finish()); return;
    }
    at(520, () => tween({targets:dragon, scaleY:0.94, angle:-3, duration:280, ease:'Sine.easeInOut'}));
    let glider: Phaser.GameObjects.Image | undefined;
    at(850, () => {
      const messages: Record<BishopId, string> = { hiccup:'A clever invention!', toothless:'A tiny dragon pounce!', thuggory:'A shield charge!', killer:'A silver swoop!' };
      say('attacking', messages[id]); pose(1);
      if (id === 'hiccup') {
        tween({targets:dragon, x:285, angle:4, scaleY:1, duration:300});
        at(100, () => {
          pose(3);
          glider = scene.add.image(410, 255, 'bishop-hiccup-glider').setDisplaySize(105, 70);
          effects.add(glider); tween({targets:glider, x:620, y:365, angle:14, duration:380, ease:'Sine.easeInOut'});
        });
      } else if (id === 'toothless') {
        tween({targets:dragon, x:350, y:330, angle:-12, scaleY:1, duration:230, ease:'Sine.easeOut'});
        tween({targets:dragon, x:455, y:460, angle:12, duration:250, delay:230, ease:'Sine.easeIn'});
      } else if (id === 'thuggory') {
        tween({targets:dragon, x:455, angle:5, scaleY:1, duration:480, ease:'Cubic.easeIn'});
      } else {
        tween({targets:dragon, x:340, y:270, angle:-7, scaleY:1, duration:220, ease:'Sine.easeOut'});
        tween({targets:dragon, x:445, y:435, angle:14, duration:260, delay:220, ease:'Sine.easeIn'});
      }
    });
    at(1330, () => {
      say('impact', 'What a surprise!');
      if (glider) tween({targets:glider, alpha:0, y:410, duration:350});
      bishopImpact(scene, effects, id, tween);
      tween({targets:target, x:675, angle:12, duration:220, ease:'Back.easeOut'});
    });
    at(1900, () => {
      say('recovering', 'A dizzy opponent!'); dazed.setVisible(true); pose(2);
      tween({targets:target, scaleY:0.9, duration:180});
      tween({targets:dragon, x:245, y:490, angle:-2, duration:400, ease:'Cubic.easeOut'});
    });
    at(2640, () => tween({targets:target, alpha:0, y:520, duration:300}));
    at(2980, () => {
      this.status.setText('Back to the board');
      if (settings.presentation !== 'arena' && settings.origins) {
        const start={x:dragon.x,y:dragon.y}; const motion={t:0};
        tween({targets:dragon, scaleX:0.16, scaleY:0.16, duration:320});
        tween({targets:motion, t:1, duration:320, ease:'Cubic.easeInOut', onUpdate:() => {
          const destination=settings.origins!().destination;
          dragon.setPosition(start.x+(destination.x-start.x)*motion.t, start.y+(destination.y-start.y)*motion.t);
        }});
      }
      tween({targets:root, alpha:0, duration:320});
    });
    at(3350, () => this.finish());
  }
  private finish(): void { const callback=this.complete; this.cleanup(); callback?.(); }
  skip(): void { this.finish(); }
  cleanup(): void {
    this.complete=null;
    this.timers.splice(0).forEach(timer=>timer.remove(false));
    this.tweens.splice(0).forEach(tween=>tween.remove());
    this.root?.destroy(true); this.root=null;
  }
}
