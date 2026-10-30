import Phaser from 'phaser';
import { CharacterRegistry } from '../characters/CharacterRegistry';
import { BISHOPS, bishopHeightRatio, type BishopId } from './bishopAssets';
import { BATCH4, type Batch4Id } from './batch4Assets';
import { resolveFirewormDefender, defenderFlipX } from './firewormDefender';
import { createFirewormImpact } from './firewormEffects';
import { batch4Fire } from './batch4Fire';
import type { AttackContext, AttackDefinition, AttackLifecycleState, AttackPlaybackSettings, AttackPresenter } from './attackTypes';

export class Batch4Presenter implements AttackPresenter {
  private root:Phaser.GameObjects.Container|null=null;
  private timers:Phaser.Time.TimerEvent[]=[];
  private tweens:Phaser.Tweens.Tween[]=[];
  private complete:(()=>void)|null=null;
  constructor(private scene:Phaser.Scene,private parent:Phaser.GameObjects.Container,
    private status:Phaser.GameObjects.Text,private attacker:Phaser.GameObjects.Text,private defender:Phaser.GameObjects.Text){}

  playAttack(context:AttackContext,_definition:AttackDefinition,settings:AttackPlaybackSettings,
    phase:(state:AttackLifecycleState)=>void,onComplete:()=>void):void {
    this.cleanup();this.complete=onComplete;
    const id=context.attackerCharacterId as Batch4Id;
    if(!BATCH4.includes(id)){this.finish();return;}
    const scene=this.scene,root=this.root=scene.add.container(0,0);this.parent.add(root);
    if(settings.presentation==='arena')root.add(scene.add.image(400,300,'fireworm-cove').setDisplaySize(800,600));
    const human=id==='stoick', actor=scene.add.container(245,human?350:490);
    const names=human?['charge','slip','tumble','confused','proud']:['ready','action'];
    const width=human?410:430, ratio=human?1145/1374:id==='flamehuffer'?1:1024/1536;
    const poses=names.map((name,i)=>scene.add.image(0,0,`batch4-${id}-${name}`)
      .setDisplaySize(width,width*(human && name==='tumble'?1024/1536:ratio)).setOrigin(0.5,human?0.5:0.94).setFlipX(id==='flamehuffer' && name==='ready').setAlpha(i===0?1:0));
    actor.add(poses);
    const fallback=resolveFirewormDefender(context,scene.textures?.exists(`bishop-${context.defenderCharacterId}-ready`)??false);
    const appearance=context.defenderCharacterId==='fireworm'&&fallback.type==='r'&&fallback.color==='w'
      ? {...fallback,label:'FIREWORM · ROOK',texture:'fireworm-ready',frame:undefined,facing:1 as const}
      : context.defenderCharacterId==='viking_warrior'&&fallback.type==='p'&&fallback.color==='w'
        ? {...fallback,label:'HOOLIGAN WARRIOR · PAWN',texture:'knight-hooligan',facing:1 as const} : fallback;
    const targetX=human?560:620, target=scene.add.container(targetX,490),size=appearance.type==='r'?275:215;
    if(appearance.texture)target.add(scene.add.image(0,0,appearance.texture,appearance.frame)
      .setDisplaySize(size,appearance.type==='b'&&BISHOPS.some(x=>x===context.defenderCharacterId)?size*bishopHeightRatio(context.defenderCharacterId as BishopId):size)
      .setOrigin(0.5,0.94).setFlipX(defenderFlipX(appearance.facing!,245,targetX)));
    else {target.add(scene.add.ellipse(0,-90,140,165,appearance.color==='b'?0x345c75:0xc39647,0.95));
      target.add(scene.add.text(0,-95,appearance.type.toUpperCase(),{fontSize:'72px',color:'#fff4da',fontFamily:'Georgia'}).setOrigin(0.5));}
    const rear=scene.add.container(0,0),front=scene.add.container(0,0),soot=scene.add.container(0,0).setVisible(false);
    for(const [x,y] of [[-0.12,-0.42],[0.14,-0.64],[0.05,-0.3]])soot.add(scene.add.ellipse(x*size,y*size,size*0.23,size*0.09,0x242935,0.55));
    const dazed=scene.add.text(0,-size,'✦  ·  ✦',{fontSize:'24px',color:'#ffe08b',stroke:'#283b48',strokeThickness:3}).setOrigin(0.5).setVisible(false);
    target.add([rear,soot,dazed,front]);const effects=scene.add.container(0,0);root.add([actor,target,effects]);
    this.attacker.setText(`${CharacterRegistry.getInstance().getById(id)!.displayName.toUpperCase()} · ${human?'KING':'ROOK'}`);this.defender.setText(appearance.label);
    const at=(ms:number,fn:()=>void)=>this.timers.push(scene.time.delayedCall(ms*settings.durationScale,fn));
    const tween=(config:Phaser.Types.Tweens.TweenBuilderConfig)=>this.tweens.push(scene.tweens.add({...config,
      duration:Number(config.duration??300)*settings.durationScale,delay:Number(config.delay??0)*settings.durationScale}));
    const pose=(index:number)=>poses.forEach((image,i)=>tween({targets:image,alpha:i===index?1:0,duration:100}));
    const say=(state:AttackLifecycleState,text:string)=>{phase(state);this.status.setText(text);};
    say('preparing','Getting ready…');root.setAlpha(0);tween({targets:root,alpha:1,duration:180});
    if(settings.reducedMotion){at(240,()=>{say('attacking','Here we go!');pose(1);});at(460,()=>{say('impact','A surprise!');dazed.setVisible(true);if(!human)soot.setVisible(true);});
      at(700,()=>{say('recovering','Back to the board');pose(human?4:0);tween({targets:target,alpha:0.25,duration:200});});at(1000,()=>this.finish());return;}
    const origins=settings.origins?.();
    if(settings.presentation!=='arena'&&origins){
      for(const [item,origin,end] of [[actor,origins.attacker,{x:245,y:human?350:490}],[target,origins.defender,{x:targetX,y:490}]] as const){
        item.setPosition(origin.x,origin.y).setScale(0.16);tween({targets:item,x:end.x,y:end.y,scaleX:1,scaleY:1,duration:500,ease:'Cubic.easeOut'});
      }
    }
    if(human){
      at(800,()=>{say('attacking','Stoick charges!');tween({targets:actor,x:400,duration:450,ease:'Cubic.easeIn'});});
      at(1250,()=>{pose(1);tween({targets:actor,angle:-12,duration:200,ease:'Sine.easeOut'});});
      at(1450,()=>{pose(2);const spin={t:0};actor.setAngle(0);
        tween({targets:spin,t:1,duration:1000,ease:'Linear',onUpdate:()=>{
          const t=spin.t;const x=t<0.5?400-65*t/0.5:335+65*(t-0.5)/0.5;
          const y=t<0.5?350+40*t/0.5:390-20*(t-0.5)/0.5;
          actor.setPosition(x,y).setRotation(4*Math.PI*t);
        }});});
      at(1950,()=>{say('impact','An accidental bonk!');
        const star=scene.add.star(targetX-65,390,5,4,12,0xffdf7c,0.95);effects.add(star);tween({targets:star,alpha:0,scaleX:1.5,scaleY:1.5,duration:320});
        tween({targets:target,x:targetX+35,angle:14,duration:240,ease:'Back.easeOut'});});
      at(2490,()=>{say('recovering','What just happened?');actor.setAngle(0);pose(3);dazed.setVisible(true);});
      at(3050,()=>{pose(4);this.status.setText('Just as planned!');tween({targets:actor,angle:-3,duration:180,yoyo:true});});
    } else {
      const dragonId=id as Exclude<Batch4Id,'stoick'>;
      let stop:(()=>void)|undefined;
      at(700,()=>tween({targets:actor,scaleY:id==='flamehuffer'?0.9:0.95,angle:id==='common_or_garden'?-7:-2,duration:320}));
      at(1050,()=>{say('attacking',id==='hookfang'?'Hookfang blasts off!':id==='flamehuffer'?'A fiery jet!':'Oh, what a muddle!');pose(1);
        tween({targets:actor,x:id==='common_or_garden'?275:260,angle:id==='common_or_garden'?5:0,scaleY:1,duration:240});
        const mouth=()=>{const x=(id==='flamehuffer'?155:172)*actor.scaleX,y=(id==='flamehuffer'?-225:id==='hookfang'?-165:-145)*actor.scaleY,a=actor.rotation;
          return {x:actor.x+x*Math.cos(a)-y*Math.sin(a),y:actor.y+x*Math.sin(a)+y*Math.cos(a)};};
        stop=batch4Fire(scene,effects,tween,dragonId,mouth,()=>({x:target.x,y:target.y-size*0.56}),size);
      });
      at(1530,()=>{say('impact','A fiery surprise!');soot.setVisible(true);
        if(id==='hookfang')createFirewormImpact(scene,rear,front,tween,size,-1);
        tween({targets:target,x:targetX+25,angle:12,duration:220,ease:'Back.easeOut'});});
      at(1900,()=>stop?.());
      at(2350,()=>{say('recovering','A dizzy opponent!');dazed.setVisible(true);pose(0);
        tween({targets:actor,x:245,angle:id==='common_or_garden'?8:-2,duration:300,yoyo:id==='common_or_garden'});});
    }
    at(3350,()=>tween({targets:target,alpha:0,y:520,duration:300}));
    at(3800,()=>{this.status.setText('Back to the board');
      if(settings.presentation!=='arena'&&settings.origins){const start={x:actor.x,y:actor.y},motion={t:0};
        tween({targets:actor,scaleX:0.16,scaleY:0.16,duration:320});
        tween({targets:motion,t:1,duration:320,ease:'Cubic.easeInOut',onUpdate:()=>{const end=settings.origins!().destination;actor.setPosition(start.x+(end.x-start.x)*motion.t,start.y+(end.y-start.y)*motion.t);}});
      }tween({targets:root,alpha:0,duration:320});});
    at(4200,()=>this.finish());
  }
  private finish():void{const callback=this.complete;this.cleanup();callback?.();}
  skip():void{this.finish();}
  cleanup():void{this.complete=null;this.timers.splice(0).forEach(t=>t.remove(false));this.tweens.splice(0).forEach(t=>t.remove());this.root?.destroy(true);this.root=null;}
}
