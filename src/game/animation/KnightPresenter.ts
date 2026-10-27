import Phaser from 'phaser';
import { CharacterRegistry } from '../characters/CharacterRegistry';
import { defenderFlipX, resolveFirewormDefender } from './firewormDefender';
import { knightImpact } from './knightImpact';
import { KNIGHTS, type KnightId } from './knightAssets';
import type { AttackContext, AttackDefinition, AttackLifecycleState, AttackPlaybackSettings, AttackPresenter } from './attackTypes';

export class KnightPresenter implements AttackPresenter {
  private root: Phaser.GameObjects.Container | null = null;
  private timers: Phaser.Time.TimerEvent[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];
  private complete: (() => void) | null = null;
  constructor(private scene: Phaser.Scene, private parent: Phaser.GameObjects.Container,
    private status: Phaser.GameObjects.Text, private attacker: Phaser.GameObjects.Text, private defender: Phaser.GameObjects.Text) {}

  playAttack(context: AttackContext, _definition: AttackDefinition, settings: AttackPlaybackSettings,
    phase: (phase: AttackLifecycleState) => void, onComplete: () => void): void {
    this.cleanup(); this.complete = onComplete;
    const id = context.attackerCharacterId as KnightId;
    if (!KNIGHTS.includes(id)) { this.finish(); return; }
    const scene = this.scene;
    const root = this.root = scene.add.container(0, 0); this.parent.add(root);
    if (settings.presentation === 'arena') root.add(scene.add.image(400, 300, 'fireworm-cove').setDisplaySize(800, 600));
    const dragon = scene.add.container(245, 490);
    const poses = [0, 1, 2].map(i => scene.add.image(0, 0,
      id === 'poisonous_piffleworm' && i === 1 ? 'knight-piffle-release' :
        (id === 'one_eye' || id === 'windwalker') && i > 0 ? `knight-${id}-${i}` : `knight-${id}`,
      (id === 'poisonous_piffleworm' && i === 1) || ((id === 'one_eye' || id === 'windwalker') && i > 0) ? undefined : String(i))
      .setDisplaySize(id === 'poisonous_piffleworm' ? 300 : 410, id === 'poisonous_piffleworm' ? 300 : 410)
      .setOrigin(0.5, 0.94).setAlpha(i === 0 ? 1 : 0));
    dragon.add(poses);
    const fallback = resolveFirewormDefender(context);
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
      .setDisplaySize(targetSize, targetSize).setOrigin(0.5, 0.94).setFlipX(defenderFlipX(appearance.facing!, 245, 650)));
    else {
      target.add(scene.add.ellipse(0, -90, 140, 165, appearance.color === 'b' ? 0x345c75 : 0xc39647, 0.95));
      target.add(scene.add.text(0, -95, appearance.type.toUpperCase(), { fontSize:'72px', color:'#fff4da', fontFamily:'Georgia' }).setOrigin(0.5));
    }
    const dazed = scene.add.text(0, -targetSize, '✦  ·  ✦', {fontSize:'24px', color:'#ffe08b', stroke:'#283b48', strokeThickness:3}).setOrigin(0.5).setVisible(false);
    target.add(dazed);
    const effects = scene.add.container(0, 0);
    root.add([dragon, target, effects]);
    this.attacker.setText(`${CharacterRegistry.getInstance().getById(id)!.displayName.toUpperCase()} · KNIGHT`);
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
    let bubble: Phaser.GameObjects.Ellipse | undefined;
    at(850, () => {
      const messages: Record<KnightId, string> = { windwalker:'A swooping dive!', one_eye:'A toothy pounce!', driller_dragon:'A drilling charge!', poisonous_piffleworm:'A peculiar bubble!' };
      say('attacking', messages[id]);
      pose(1);
      if (id === 'windwalker') {
        tween({targets:dragon, x:365, y:300, angle:8, scaleY:1, duration:220, ease:'Sine.easeOut'});
        tween({targets:dragon, x:405, y:430, angle:15, duration:250, delay:220, ease:'Sine.easeIn'});
      } else if (id === 'one_eye') {
        tween({targets:dragon, x:395, y:385, angle:8, scaleY:1, duration:250, ease:'Cubic.easeOut'});
        tween({targets:dragon, x:410, y:460, duration:200, delay:250, ease:'Cubic.easeIn'});
      } else if (id === 'driller_dragon') {
        tween({targets:dragon, x:430, angle:8, scaleY:1, duration:460, ease:'Cubic.easeIn'});
        for (let i=0; i<3; i++) {
          const ring=scene.add.ellipse(360 + i*35, 385, 30, 70).setStrokeStyle(4, 0xc6b4ef, 0.8).setAlpha(0);
          effects.add(ring); tween({targets:ring, alpha:0.8, scaleX:1.4, duration:250, delay:i*65, yoyo:true});
        }
      } else {
        tween({targets:dragon, scaleY:1, angle:2, duration:250});
        const mouth = () => {
          const x=97*dragon.scaleX, y=-176*dragon.scaleY, angle=dragon.rotation;
          return {x:dragon.x+x*Math.cos(angle)-y*Math.sin(angle), y:dragon.y+x*Math.sin(angle)+y*Math.cos(angle)};
        };
        const start=mouth(); const travel={t:0};
        bubble=scene.add.ellipse(start.x,start.y,38,38,0xb974df,0.75).setStrokeStyle(3,0xf5dbff,0.9).setScale(0.2);
        effects.add(bubble);
        tween({targets:bubble, scaleX:2.5, scaleY:2.5, duration:480});
        tween({targets:travel, t:1, duration:320, delay:160, ease:'Sine.easeInOut', onUpdate:()=>{
          const point=mouth(); bubble?.setPosition(point.x+(625-point.x)*travel.t,point.y+(360-point.y)*travel.t);
        }});
      }
    });
    at(1330, () => {
      say('impact', 'What a surprise!');
      if (bubble) tween({targets:bubble, alpha:0, scaleX:3, scaleY:3, duration:350});
      knightImpact(scene, effects, id, tween);
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
