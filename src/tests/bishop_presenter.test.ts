import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import { BishopPresenter } from '../game/animation/BishopPresenter';
import { AttackRegistry } from '../game/animation/AttackRegistry';

const cases = [
  ['hiccup','generic_strike'], ['toothless','generic_strike'],
  ['thuggory','rival_strike'], ['killer','rival_strike'],
] as const;
describe.each(cases)('%s presentation', (id, attack) => {
  let presenter: BishopPresenter;
  let removals: ReturnType<typeof vi.fn>[];
  beforeEach(() => {
    vi.useFakeTimers(); removals=[];
    function object() {
      const value: Record<string, unknown> = { x:0, y:0, scaleX:1, scaleY:1 };
      for (const name of ['add','destroy','setFlipX','setAngle','setRotation','setScale','setDisplaySize','setOrigin','setAlpha','setVisible','setText','setPosition','setStrokeStyle']) value[name] = () => value;
      return value;
    }
    const scene = {
      add: Object.fromEntries(['container','image','text','ellipse','rectangle','star'].map(name=>[name,object])),
      time:{delayedCall:(delay:number, callback:()=>void)=>{ const timer=setTimeout(callback,delay); return {remove:()=>clearTimeout(timer)}; }},
      tweens:{add:()=>{const remove=vi.fn(); removals.push(remove); return {remove};}},
    } as unknown as Phaser.Scene;
    presenter=new BishopPresenter(scene,object() as unknown as Phaser.GameObjects.Container,
      object() as unknown as Phaser.GameObjects.Text,object() as unknown as Phaser.GameObjects.Text,object() as unknown as Phaser.GameObjects.Text);
  });
  afterEach(()=>{ presenter.cleanup(); vi.useRealTimers(); });
  const context={moveFrom:'b1',moveTo:'c3',attackerCharacterId:id,defenderCharacterId:'rival_generic',attackDefinitionId:attack};
  it.each([[1,false,3350],[0.35,false,1173],[1,true,1000]] as const)('completes once at speed %s reduced %s', (durationScale,reducedMotion,duration)=>{
    const phases:string[]=[]; const done=vi.fn();
    presenter.playAttack(context,AttackRegistry.getInstance().getById(attack)!,{durationScale,reducedMotion},phase=>phases.push(phase),done);
    vi.advanceTimersByTime(duration);
    expect(done).toHaveBeenCalledTimes(1);
    presenter.skip(); vi.runAllTimers();
    expect(phases).toEqual(['preparing','attacking','impact','recovering']);
    expect(done).toHaveBeenCalledTimes(1);
    expect(removals.every(remove=>remove.mock.calls.length===1)).toBe(true);
  });
  it.each([200,1000,1500,2400])('skip at %s completes once and cancels callbacks', ms=>{
    const done=vi.fn(); const phase=vi.fn();
    presenter.playAttack(context,AttackRegistry.getInstance().getById(attack)!,{durationScale:1,reducedMotion:false},phase,done);
    vi.advanceTimersByTime(ms); presenter.skip(); const count=phase.mock.calls.length;
    vi.runAllTimers(); expect(done).toHaveBeenCalledTimes(1); expect(phase).toHaveBeenCalledTimes(count);
  });
  it('abort cancels completion and pending phases',()=>{
    const done=vi.fn(); const phase=vi.fn();
    presenter.playAttack(context,AttackRegistry.getInstance().getById(attack)!,{durationScale:1,reducedMotion:false},phase,done);
    vi.advanceTimersByTime(1000); presenter.cleanup(); const count=phase.mock.calls.length;
    vi.runAllTimers(); expect(done).not.toHaveBeenCalled(); expect(phase).toHaveBeenCalledTimes(count);
  });
});

describe.each(cases)('%s board travel', (id, attack) => {
  let presenter: BishopPresenter;
  let actors: {x:number; y:number; scaleX:number; scaleY:number}[];
  let motions: {targets:unknown[]; returnMotion:boolean; advance:(fraction:number)=>void}[];
  beforeEach(() => {
    vi.useFakeTimers(); actors=[]; motions=[];
    function object(x=0,y=0) {
      const value={x,y,scaleX:1,scaleY:1,rotation:0,alpha:1,
        setPosition(x:number,y:number){this.x=x;this.y=y;return this;},
        setScale(x:number,y=x){this.scaleX=x;this.scaleY=y;return this;}} as Record<string,unknown>;
      for (const name of ['add','destroy','setFlipX','setAngle','setRotation','setDisplaySize','setOrigin','setAlpha','setVisible','setText','setStrokeStyle']) value[name]=()=>value;
      return value;
    }
    const scene={
      add:Object.fromEntries(['container','image','text','ellipse','rectangle','star'].map(name=>[name,(x?:number,y?:number)=>{
        const value=object(x,y); if(name==='container' && (x===245 || x===650 || x===580)) actors.push(value as unknown as typeof actors[number]); return value;
      }])),
      time:{delayedCall:(delay:number,callback:()=>void)=>{const timer=setTimeout(callback,delay);return {remove:()=>clearTimeout(timer)};}},
      tweens:{add:(config:Record<string,unknown>)=>{
        let removed=false; const targets=Array.isArray(config.targets)?config.targets:[config.targets];
        const properties=['x','y','scaleX','scaleY','angle','alpha','t'].filter(key=>typeof config[key]==='number');
        const initial=targets.map(target=>Object.fromEntries(properties.map(key=>[key,Number(target[key]??0)])));
        motions.push({targets,returnMotion:'t' in config && config.ease==='Cubic.easeInOut',advance:fraction=>{
          if(removed)return;
          targets.forEach((target,i)=>properties.forEach(key=>{target[key]=initial[i][key]+(Number(config[key])-initial[i][key])*fraction;}));
          (config.onUpdate as (()=>void)|undefined)?.();
        }});
        return {remove:()=>{removed=true;}};
      }},
    } as unknown as Phaser.Scene;
    presenter=new BishopPresenter(scene,object() as unknown as Phaser.GameObjects.Container,
      object() as unknown as Phaser.GameObjects.Text,object() as unknown as Phaser.GameObjects.Text,object() as unknown as Phaser.GameObjects.Text);
  });
  afterEach(()=>{presenter.cleanup();vi.useRealTimers();});
  const context={moveFrom:'b1',moveTo:'c3',attackerCharacterId:id,defenderCharacterId:'rival_generic',attackDefinitionId:attack};
  it('emerges from the actual squares and returns to a resized destination',()=>{
    let destination={x:720,y:90}; const done=vi.fn();
    presenter.playAttack(context,AttackRegistry.getInstance().getById(attack)!,{durationScale:1,reducedMotion:false,presentation:'board',
      origins:()=>({attacker:{x:40,y:70},defender:{x:720,y:90},destination})},()=>{},done);
    expect(actors.map(({x,y,scaleX})=>({x,y,scaleX}))).toEqual([{x:40,y:70,scaleX:0.16},{x:720,y:90,scaleX:0.16}]);
    motions.forEach(motion=>motion.advance(1)); vi.advanceTimersByTime(2980);
    const returning=motions.find(motion=>motion.returnMotion)!;
    destination={x:140,y:560}; returning.advance(1);
    expect(actors[0]).toMatchObject(destination); expect(done).not.toHaveBeenCalled();
    vi.advanceTimersByTime(370); expect(done).toHaveBeenCalledTimes(1);
  });
  it.each(['skip','cleanup'] as const)('%s during return cancels subsequent movement',finish=>{
    const done=vi.fn(); let destination={x:720,y:90};
    presenter.playAttack(context,AttackRegistry.getInstance().getById(attack)!,{durationScale:1,reducedMotion:false,presentation:'board',
      origins:()=>({attacker:{x:40,y:70},defender:{x:720,y:90},destination})},()=>{},done);
    vi.advanceTimersByTime(2980); const returning=motions.find(motion=>motion.returnMotion)!;
    returning.advance(0.5); const before={x:actors[0].x,y:actors[0].y}; presenter[finish](); destination={x:10,y:10}; returning.advance(1); vi.runAllTimers();
    expect(actors[0]).toMatchObject(before); expect(done).toHaveBeenCalledTimes(finish==='skip'?1:0);
  });
  it('keeps arena actors staged without return travel',()=>{
    presenter.playAttack(context,AttackRegistry.getInstance().getById(attack)!,{durationScale:1,reducedMotion:false,presentation:'arena',
      origins:()=>({attacker:{x:40,y:70},defender:{x:720,y:90},destination:{x:720,y:90}})},()=>{},()=>{});
    expect(actors.map(({x,y,scaleX})=>({x,y,scaleX}))).toEqual([{x:245,y:490,scaleX:1},{x:id === 'killer' ? 580 : 650,y:490,scaleX:1}]);
    vi.advanceTimersByTime(2980); expect(motions.some(motion=>motion.returnMotion)).toBe(false);
  });
});
