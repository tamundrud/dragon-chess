import Phaser from 'phaser';
import { BISHOPS, bishopHeightRatio, type BishopId } from './bishopAssets';
import { BATCH5, type Batch5Id } from './batch5Assets';
import { defenderFlipX, resolveFirewormDefender } from './firewormDefender';
import type { AttackContext, AttackDefinition, AttackLifecycleState, AttackPlaybackSettings, AttackPresenter } from './attackTypes';

/** Complete poses remain attached to one actor, so no weapon or body part floats independently. */
export class Batch5Presenter implements AttackPresenter {
  private root: Phaser.GameObjects.Container | null = null;
  private timers: Phaser.Time.TimerEvent[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];
  private complete: (() => void) | null = null;
  constructor(private scene: Phaser.Scene, private parent: Phaser.GameObjects.Container,
    private status: Phaser.GameObjects.Text, private attacker: Phaser.GameObjects.Text, private defender: Phaser.GameObjects.Text) {}

  playAttack(context: AttackContext, _definition: AttackDefinition, settings: AttackPlaybackSettings,
    phase: (state: AttackLifecycleState) => void, onComplete: () => void): void {
    this.cleanup(); this.complete = onComplete;
    const id = context.attackerCharacterId as Batch5Id;
    if (!BATCH5.includes(id)) { this.finish(); return; }
    const scene = this.scene, root = this.root = scene.add.container(0, 0); this.parent.add(root);
    if (settings.presentation === 'arena') root.add(scene.add.image(400, 300, 'fireworm-cove').setDisplaySize(800, 600));
    const actorY = id === 'valhallarama' ? 380 : 350;
    const actor = scene.add.container(245, actorY);
    const names = id === 'mogadon' ? ['ready','action','proud'] : id === 'valhallarama'
      ? ['ready','action','contact','proud'] : ['ready','guard','blue','red','action','proud'];
    const ratio = (name:string) => id === 'valhallarama' && name !== 'action'
      ? name === 'ready' ? 1199/1312 : name === 'contact' ? 1199/1312 : 1182/1330
      : id === 'hairy_scary_librarian' && name === 'guard' ? 1199/1312 : 1024/1536;
    const poses = names.map((name, index) => scene.add.image(0, 0, `batch5-${id}-${name}`)
      .setDisplaySize(330 / ratio(name), 330).setOrigin(0.5).setAlpha(index === 0 ? 1 : 0));
    if (id === 'valhallarama') poses[2].setAngle(10);
    if (id === 'hairy_scary_librarian') poses[4].setAngle(16);
    actor.add(poses);
    const fallback = resolveFirewormDefender(context, scene.textures?.exists(`bishop-${context.defenderCharacterId}-ready`) ?? false, scene.textures?.exists(`batch5-${context.defenderCharacterId}-ready`) ?? false);
    const appearance = context.defenderCharacterId === 'fireworm' && fallback.type === 'r' && fallback.color === 'w'
      ? {...fallback, label:'FIREWORM · ROOK', texture:'fireworm-ready', frame:undefined, facing:1 as const}
      : context.defenderCharacterId === 'viking_warrior' && fallback.type === 'p' && fallback.color === 'w'
        ? {...fallback, label:'HOOLIGAN WARRIOR · PAWN', texture:'knight-hooligan', facing:1 as const} : fallback;
    const targetX = 600, target = scene.add.container(targetX, 490), size = appearance.type === 'r' ? 275 : 215;
    const contactY = appearance.texture ? actorY : actorY + 35;
    if (appearance.texture) { const targetArt = scene.add.image(0, 0, appearance.texture, appearance.frame)
      .setDisplaySize(size / (appearance.heightRatio ?? 1), appearance.type === 'b' && BISHOPS.some(x => x === context.defenderCharacterId)
        ? size * bishopHeightRatio(context.defenderCharacterId as BishopId) : size)
      .setOrigin(0.5, 0.94).setFlipX(defenderFlipX(appearance.facing!, 245, targetX)); target.add(targetArt); }
    else { target.add(scene.add.ellipse(0, -90, 140, 165, appearance.color === 'b' ? 0x345c75 : 0xc39647, 0.95));
      target.add(scene.add.text(0, -95, appearance.type.toUpperCase(), { fontSize:'72px', color:'#fff4da', fontFamily:'Georgia' }).setOrigin(0.5)); }
    const dazed = scene.add.text(0, -size, '✦  ·  ✦', { fontSize:'24px', color:'#ffe08b', stroke:'#283b48', strokeThickness:3 }).setOrigin(0.5).setVisible(false);
    target.add(dazed); const effects = scene.add.container(0, 0); root.add([target, actor, effects]);
    this.attacker.setText(`${id === 'hairy_scary_librarian' ? 'LIBRARIAN' : id.toUpperCase()} · ${id === 'mogadon' ? 'KING' : 'QUEEN'}`);
    this.defender.setText(appearance.label.replace('HOOLIGAN WARRIOR', 'HOOLIGAN').replace('MEATHEAD RAIDER', 'MEATHEAD'));
    const at = (ms:number, fn:()=>void) => this.timers.push(scene.time.delayedCall(ms * settings.durationScale, fn));
    const tween = (config:Phaser.Types.Tweens.TweenBuilderConfig) => this.tweens.push(scene.tweens.add({ ...config,
      duration:Number(config.duration ?? 300) * settings.durationScale, delay:Number(config.delay ?? 0) * settings.durationScale }));
    const pose = (n:number) => poses.forEach((image, i) => tween({targets:image, alpha:i === n ? 1 : 0, duration:100}));
    const say = (state:AttackLifecycleState, text:string) => { phase(state); this.status.setText(text); };
    say('preparing', 'Getting ready…'); root.setAlpha(0); tween({targets:root, alpha:1, duration:180});
    if (settings.reducedMotion) {
      at(240,()=>{ say('attacking','Here we go!'); });
      at(460,()=>{ say('impact','A surprise!'); pose(id === 'valhallarama' ? 2 : id === 'hairy_scary_librarian' ? 4 : 1);
        actor.setPosition(id === 'valhallarama' ? 470 : id === 'hairy_scary_librarian' ? 400 : 360, id === 'valhallarama' ? contactY : actorY); dazed.setVisible(true); });
      at(700,()=>{ say('recovering','Back to the board'); pose(poses.length-1); tween({targets:target,alpha:0.25,duration:200}); });
      at(1000,()=>this.finish()); return;
    }
    const origins = settings.origins?.();
    if (settings.presentation !== 'arena' && origins) {
      for (const [item, origin, end] of [[actor, origins.attacker, {x:245,y:actorY}], [target, origins.defender, {x:targetX,y:490}]] as const) {
        item.setPosition(origin.x, origin.y).setScale(0.16); tween({targets:item,x:end.x,y:end.y,scaleX:1,scaleY:1,duration:500,ease:'Cubic.easeOut'});
      }
    }
    at(750,()=>{ say('attacking', id === 'mogadon' ? 'A mighty charge!' : id === 'valhallarama' ? 'A careful approach!' : 'The Heart-Slicers!');
      if (id === 'valhallarama') tween({targets:actor,x:225,duration:150,ease:'Sine.easeOut'});
      else pose(1);
    });
    at(950,()=>{ if (id !== 'valhallarama') pose(1);
      tween({targets:actor,x:id === 'valhallarama' ? 330 : id === 'hairy_scary_librarian' ? 400 : 360,y:actorY,duration:500,ease:'Cubic.easeInOut'}); });
    if (id === 'hairy_scary_librarian') {
      at(1050,()=>{pose(2);tween({targets:actor,angle:-5,duration:180});});
      at(1300,()=>{pose(3);tween({targets:actor,angle:5,duration:180});});
      at(1550,()=>{pose(4);tween({targets:actor,angle:0,duration:120});});
    }
    if (id === 'valhallarama') at(1550,()=>{pose(2); tween({targets:actor,x:470,y:contactY,duration:150,ease:'Sine.easeOut'});});
    at(1700,()=>{ say('impact', id === 'mogadon' ? 'Shield bump!' : id === 'valhallarama' ? 'A cheeky tap!' : 'A dazzling flourish!');
      const star=scene.add.star(id === 'valhallarama' ? targetX+50 : targetX-35,id === 'valhallarama' ? (appearance.texture ? 320 : 355) : 390,5,4,12,0xffdf7c,0.95); effects.add(star);
      tween({targets:star,alpha:0,scaleX:1.5,scaleY:1.5,duration:320});
      tween({targets:target,x:targetX+35,angle:14,duration:240,ease:'Back.easeOut'}); });
    at(2350,()=>{ say('recovering',id === 'mogadon' ? 'Whoops!' : 'A dizzy opponent!'); pose(poses.length-1); dazed.setVisible(true);
      tween({targets:actor,x:245,y:actorY,angle:id === 'mogadon' ? -8 : 0,duration:400,ease:'Sine.easeOut'}); });
    if (id === 'mogadon') at(3000,()=>{ pose(0); this.status.setText('Just as planned!'); tween({targets:actor,angle:0,duration:200}); });
    at(3350,()=>tween({targets:target,alpha:0,y:520,duration:300}));
    at(3800,()=>{this.status.setText('Back to the board');
      if(settings.presentation !== 'arena' && settings.origins) { const start={x:actor.x,y:actor.y}, motion={t:0};
        tween({targets:actor,scaleX:0.16,scaleY:0.16,duration:320});
        tween({targets:motion,t:1,duration:320,ease:'Cubic.easeInOut',onUpdate:()=>{const end=settings.origins!().destination;actor.setPosition(start.x+(end.x-start.x)*motion.t,start.y+(end.y-start.y)*motion.t);}});
      } tween({targets:root,alpha:0,duration:320}); });
    at(4200,()=>this.finish());
  }
  private finish():void { const callback=this.complete; this.cleanup(); callback?.(); }
  skip():void { this.finish(); }
  cleanup():void { this.complete=null; this.timers.splice(0).forEach(t=>t.remove(false)); this.tweens.splice(0).forEach(t=>t.remove()); this.root?.destroy(true); this.root=null; }
}
