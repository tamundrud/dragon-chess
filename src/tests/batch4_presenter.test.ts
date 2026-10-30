import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import { Batch4Presenter } from '../game/animation/Batch4Presenter';
import { AttackRegistry } from '../game/animation/AttackRegistry';

const cases = ['hookfang', 'flamehuffer', 'common_or_garden', 'stoick'] as const;
describe.each(cases)('%s capture lifecycle', id => {
  let presenter: Batch4Presenter;
  beforeEach(() => {
    vi.useFakeTimers();
    function object() {
      const value: Record<string, unknown> = { x:0, y:0, scaleX:1, scaleY:1, rotation:0 };
      for (const name of ['add','destroy','setFlipX','setAngle','setRotation','setScale','setDisplaySize','setOrigin','setAlpha','setVisible','setText','setPosition','setTint','clear','lineStyle','strokePoints','fillStyle','fillCircle']) value[name] = () => value;
      return value;
    }
    const scene = {
      add: Object.fromEntries(['container','image','text','ellipse','rectangle','star','graphics'].map(name => [name,object])),
      time:{delayedCall:(delay:number,callback:()=>void)=>{const timer=setTimeout(callback,delay);return {remove:()=>clearTimeout(timer)};}},
      tweens:{add:()=>({remove:()=>{}})},
    } as unknown as Phaser.Scene;
    presenter = new Batch4Presenter(scene, object() as unknown as Phaser.GameObjects.Container,
      object() as unknown as Phaser.GameObjects.Text, object() as unknown as Phaser.GameObjects.Text, object() as unknown as Phaser.GameObjects.Text);
  });
  afterEach(()=>{presenter?.cleanup();vi.useRealTimers();});
  const context={moveFrom:'a1',moveTo:'a2',attackerCharacterId:id,defenderCharacterId:'rival_generic',defenderPieceType:'p' as const,defenderColor:'b' as const,attackDefinitionId:'generic_strike'};
  it.each([[1,false,4200],[0.35,false,1470],[1,true,1000]] as const)('completes once at speed %s reduced %s',(durationScale,reducedMotion,duration)=>{
    const phases:string[]=[];const done=vi.fn();
    presenter.playAttack(context,AttackRegistry.getInstance().getById('generic_strike')!,{durationScale,reducedMotion},p=>phases.push(p),done);
    vi.advanceTimersByTime(duration); expect(phases).toEqual(['preparing','attacking','impact','recovering']);expect(done).toHaveBeenCalledTimes(1);
    presenter.skip();vi.runAllTimers();expect(done).toHaveBeenCalledTimes(1);
  });
  it.each([200,1200,1900,3300])('skip at %s completes once',ms=>{
    const done=vi.fn(),phase=vi.fn();presenter.playAttack(context,AttackRegistry.getInstance().getById('generic_strike')!,{durationScale:1,reducedMotion:false},phase,done);
    vi.advanceTimersByTime(ms);presenter.skip();const count=phase.mock.calls.length;vi.runAllTimers();expect(done).toHaveBeenCalledTimes(1);expect(phase).toHaveBeenCalledTimes(count);
  });
  it('cancellation never completes the move',()=>{
    const done=vi.fn(),phase=vi.fn();presenter.playAttack(context,AttackRegistry.getInstance().getById('generic_strike')!,{durationScale:1,reducedMotion:false},phase,done);
    vi.advanceTimersByTime(1200);presenter.cleanup();const count=phase.mock.calls.length;vi.runAllTimers();expect(done).not.toHaveBeenCalled();expect(phase).toHaveBeenCalledTimes(count);
  });
});

describe.each(cases)('%s return after resize', id => {
  let presenter:Batch4Presenter;
  let actors:{x:number;y:number;scaleX:number;scaleY:number}[];
  let motions:{returnMotion:boolean;advance:(fraction:number)=>void}[];
  beforeEach(()=>{
    vi.useFakeTimers();actors=[];motions=[];
    function object(x=0,y=0){
      const value={x,y,scaleX:1,scaleY:1,rotation:0,alpha:1,
        setPosition(x:number,y:number){this.x=x;this.y=y;return this;},
        setScale(x:number,y=x){this.scaleX=x;this.scaleY=y;return this;}} as Record<string,unknown>;
      for(const name of ['add','destroy','setFlipX','setAngle','setRotation','setDisplaySize','setOrigin','setAlpha','setVisible','setText','setTint','clear','lineStyle','strokePoints','fillStyle','fillCircle'])value[name]=()=>value;
      return value;
    }
    const scene={add:Object.fromEntries(['container','image','text','ellipse','rectangle','star','graphics'].map(name=>[name,(x?:number,y?:number)=>{
      const value=object(x,y);if(name==='container'&&x===245)actors.push(value as unknown as typeof actors[number]);return value;
    }])),time:{delayedCall:(delay:number,callback:()=>void)=>{const timer=setTimeout(callback,delay);return {remove:()=>clearTimeout(timer)};}},
    tweens:{add:(config:Record<string,unknown>)=>{
      let removed=false;const targets=Array.isArray(config.targets)?config.targets:[config.targets];
      const props=['x','y','scaleX','scaleY','angle','alpha','t'].filter(key=>typeof config[key]==='number');
      const initial=targets.map(target=>Object.fromEntries(props.map(key=>[key,Number(target[key]??0)])));
      motions.push({returnMotion:'t' in config&&config.ease==='Cubic.easeInOut',advance:fraction=>{
        if(removed)return;targets.forEach((target,i)=>props.forEach(key=>{target[key]=initial[i][key]+(Number(config[key])-initial[i][key])*fraction;}));
        (config.onUpdate as (()=>void)|undefined)?.();
      }});return {remove:()=>{removed=true;}};
    }}} as unknown as Phaser.Scene;
    presenter=new Batch4Presenter(scene,object() as unknown as Phaser.GameObjects.Container,object() as unknown as Phaser.GameObjects.Text,
      object() as unknown as Phaser.GameObjects.Text,object() as unknown as Phaser.GameObjects.Text);
  });
  afterEach(()=>{presenter.cleanup();vi.useRealTimers();});
  it.each(['complete','skip','cleanup'] as const)('%s uses the new destination or stops the return',action=>{
    let destination={x:720,y:90};const done=vi.fn();
    presenter.playAttack({moveFrom:'a1',moveTo:'a2',attackerCharacterId:id,defenderCharacterId:'rival_generic',attackDefinitionId:'generic_strike'},
      AttackRegistry.getInstance().getById('generic_strike')!,{durationScale:1,reducedMotion:false,presentation:'board',
        origins:()=>({attacker:{x:40,y:70},defender:{x:720,y:90},destination})},()=>{},done);
    expect(actors[0]).toMatchObject({x:40,y:70,scaleX:0.16});
    vi.advanceTimersByTime(3800);const returning=motions.find(m=>m.returnMotion)!;
    expect(returning).toBeDefined();returning.advance(0.5);const before={x:actors[0].x,y:actors[0].y};destination={x:140,y:560};
    if(action!=='complete')presenter[action]();returning.advance(1);
    expect(actors[0]).toMatchObject(action==='complete'?destination:before);
    vi.runAllTimers();expect(done).toHaveBeenCalledTimes(action==='cleanup'?0:1);
  });
});

describe('illustrated Fireworm defender',()=>{
  it('uses Fireworm art for the matching white rook',()=>{
    vi.useFakeTimers();const images:string[]=[];
    function object(){const value:Record<string,unknown>={x:0,y:0,scaleX:1,scaleY:1,rotation:0};
      for(const method of ['add','destroy','setFlipX','setAngle','setRotation','setScale','setDisplaySize','setOrigin','setAlpha','setVisible','setText','setPosition','setTint','clear','lineStyle','strokePoints','fillStyle','fillCircle'])value[method]=()=>value;
      return value;}
    const scene={add:{...Object.fromEntries(['container','text','ellipse','rectangle','star','graphics'].map(name=>[name,object])),
      image:(_x:number,_y:number,key:string)=>{images.push(key);return object();}},
      time:{delayedCall:(delay:number,callback:()=>void)=>{const timer=setTimeout(callback,delay);return {remove:()=>clearTimeout(timer)};}},
      tweens:{add:()=>({remove:()=>{}})}} as unknown as Phaser.Scene;
    const presenter=new Batch4Presenter(scene,object() as unknown as Phaser.GameObjects.Container,object() as unknown as Phaser.GameObjects.Text,
      object() as unknown as Phaser.GameObjects.Text,object() as unknown as Phaser.GameObjects.Text);
    presenter.playAttack({moveFrom:'b6',moveTo:'b3',attackerCharacterId:'flamehuffer',defenderCharacterId:'fireworm',defenderPieceType:'r',defenderColor:'w',attackDefinitionId:'generic_strike'},
      AttackRegistry.getInstance().getById('generic_strike')!,{durationScale:1,reducedMotion:false},()=>{},()=>{});
    expect(images).toContain('fireworm-ready');presenter.cleanup();vi.useRealTimers();
  });
});
