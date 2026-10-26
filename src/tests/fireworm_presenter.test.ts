import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import { FirewormPresenter } from '../game/animation/FirewormPresenter';
import { AttackRegistry } from '../game/animation/AttackRegistry';
import type { AttackContext } from '../game/animation/attackTypes';

const context: AttackContext = { moveFrom: 'b3', moveTo: 'b4', attackerCharacterId: 'fireworm', defenderCharacterId: 'rival_generic', attackDefinitionId: 'fireworm_fireworks' };
const definition = AttackRegistry.getInstance().getById('fireworm_fireworks')!;

describe('Fireworm presentation lifecycle', () => {
  let presenter: FirewormPresenter;
  let removedTweens: ReturnType<typeof vi.fn>[];
  let destroyed: ReturnType<typeof vi.fn>[];
  beforeEach(() => {
    vi.useFakeTimers();
    removedTweens = []; destroyed = [];
    function object() {
      const destroy = vi.fn(); destroyed.push(destroy);
      const value: Record<string, unknown> = { scaleX: 1, scaleY: 1, destroy };
      for (const name of ['add','setFlipX','setAngle','setScale','setDisplaySize','setOrigin','setAlpha','setVisible','setText','setTint','setFrame','setPosition','setRotation','fillStyle','fillCircle']) value[name] = () => value;
      return value;
    }
    const scene = {
      add: Object.fromEntries(['container','image','text','ellipse','rectangle','graphics'].map(name => [name, object])),
      time: { delayedCall: (delay: number, callback: () => void) => {
        const id = setTimeout(callback, delay);
        return { remove: () => clearTimeout(id) };
      } },
      tweens: { add: () => { const remove = vi.fn(); removedTweens.push(remove); return { remove }; } },
    } as unknown as Phaser.Scene;
    presenter = new FirewormPresenter(scene, object() as unknown as Phaser.GameObjects.Container,
      object() as unknown as Phaser.GameObjects.Text, object() as unknown as Phaser.GameObjects.Text, object() as unknown as Phaser.GameObjects.Text);
  });
  afterEach(() => { presenter.cleanup(); vi.useRealTimers(); });

  it.each([[1, false, 3350], [0.35, false, 1173], [1, true, 1000]] as const)('completes one ordered lifecycle at scale %s, reduced %s', (durationScale, reducedMotion, duration) => {
    const phases: string[] = [];
    const done = vi.fn();
    presenter.playAttack(context, definition, { durationScale, reducedMotion }, phase => phases.push(phase), done);
    vi.advanceTimersByTime(duration);
    expect(phases).toEqual(['preparing', 'attacking', 'impact', 'recovering']);
    expect(done).toHaveBeenCalledTimes(1);
    presenter.skip(); vi.runAllTimers();
    expect(done).toHaveBeenCalledTimes(1);
    expect(removedTweens.every(remove => remove.mock.calls.length === 1)).toBe(true);
  });

  it.each([200, 1000, 1500, 2400])('Skip at %s ms completes once and cancels remaining phases', ms => {
    const phase = vi.fn(); const done = vi.fn();
    presenter.playAttack(context, definition, { durationScale: 1, reducedMotion: false }, phase, done);
    vi.advanceTimersByTime(ms); presenter.skip();
    const count = phase.mock.calls.length;
    presenter.skip(); vi.runAllTimers();
    expect(done).toHaveBeenCalledTimes(1);
    expect(phase).toHaveBeenCalledTimes(count);
    expect(removedTweens.every(remove => remove.mock.calls.length === 1)).toBe(true);
  });

  it('abort cancels completion and its resources while leaving unrelated scene activity alone', () => {
    const unrelated = vi.fn(); setTimeout(unrelated, 4000);
    const done = vi.fn(); const phase = vi.fn();
    presenter.playAttack(context, definition, { durationScale: 1, reducedMotion: false }, phase, done);
    vi.advanceTimersByTime(1500); presenter.cleanup(); presenter.cleanup();
    const count = phase.mock.calls.length;
    vi.runAllTimers();
    expect(done).not.toHaveBeenCalled();
    expect(phase).toHaveBeenCalledTimes(count);
    expect(unrelated).toHaveBeenCalledTimes(1);
    expect(removedTweens.every(remove => remove.mock.calls.length === 1)).toBe(true);
    expect(destroyed.some(destroy => destroy.mock.calls.length === 1)).toBe(true);
  });

  it('replay abandons the prior callback and starts a fresh complete lifecycle', () => {
    const old = vi.fn(); const current = vi.fn();
    presenter.playAttack(context, definition, { durationScale: 1, reducedMotion: false }, () => {}, old);
    vi.advanceTimersByTime(1500);
    presenter.playAttack(context, definition, { durationScale: 1, reducedMotion: true }, () => {}, current);
    vi.runAllTimers();
    expect(old).not.toHaveBeenCalled(); expect(current).toHaveBeenCalledTimes(1);
  });
});

describe('Fireworm board connection', () => {
  let presenter: FirewormPresenter;
  let actors: { x: number; y: number; scaleX: number; scaleY: number; alpha: number }[];
  let motions: { advance: (fraction: number) => void; hasReturn: boolean; targets: unknown[] }[];
  beforeEach(() => {
    vi.useFakeTimers(); actors = []; motions = [];
    function object(x = 0, y = 0) {
      const value = { x, y, scaleX: 1, scaleY: 1, rotation: 0, alpha: 1,
        setPosition(x: number, y: number) { this.x=x; this.y=y; return this; },
        setScale(x: number, y = x) { this.scaleX=x; this.scaleY=y; return this; },
      } as Record<string, unknown>;
      for (const name of ['add','setFlipX','destroy','setAngle','setDisplaySize','setOrigin','setAlpha','setVisible','setText','setTint','setFrame','setRotation','fillStyle','fillCircle']) value[name] = () => value;
      return value;
    }
    const scene = {
      add: Object.fromEntries(['container','image','text','ellipse','rectangle','graphics'].map(name => [name, (x?: number,y?: number) => {
        const value=object(x,y);
        if(name==='container' && (x===245 || x===650)) actors.push(value as unknown as typeof actors[number]);
        return value;
      }])),
      time: { delayedCall: (delay: number, callback: () => void) => {
        const id=setTimeout(callback,delay); return {remove:()=>clearTimeout(id)};
      } },
      tweens: { add: (config: Record<string, unknown>) => {
        let removed=false;
        const targets=Array.isArray(config.targets)?config.targets:[config.targets];
        const properties=['x','y','scaleX','scaleY','angle','alpha','t'].filter(key=>typeof config[key]==='number');
        const initial=targets.map(target=>Object.fromEntries(properties.map(key=>[key,Number(target[key]??0)])));
        motions.push({targets, hasReturn:'t' in config && config.ease==='Cubic.easeInOut', advance:fraction=>{
          if(removed)return;
          targets.forEach((target,i)=>properties.forEach(key=>{target[key]=initial[i][key]+(Number(config[key])-initial[i][key])*fraction;}));
          (config.onUpdate as (()=>void)|undefined)?.();
        }});
        return {remove:()=>{removed=true;}};
      } },
    } as unknown as Phaser.Scene;
    presenter=new FirewormPresenter(scene,object() as unknown as Phaser.GameObjects.Container,
      object() as unknown as Phaser.GameObjects.Text,object() as unknown as Phaser.GameObjects.Text,object() as unknown as Phaser.GameObjects.Text);
  });
  afterEach(()=>{presenter.cleanup();vi.useRealTimers();});
  const origins=()=>({attacker:{x:40,y:70},defender:{x:720,y:90},destination:{x:720,y:90}});

  it('emerges from the actual source/victim squares and follows a resized destination during return',()=>{
    let destination={x:720,y:90};const done=vi.fn();
    presenter.playAttack(context,definition,{durationScale:1,reducedMotion:false,presentation:'board',origins:()=>({...origins(),destination})},()=>{},done);
    expect(actors.map(({x,y,scaleX})=>({x,y,scaleX}))).toEqual([{x:40,y:70,scaleX:.16},{x:720,y:90,scaleX:.16}]);
    motions.forEach(motion=>motion.advance(1));
    expect(actors.map(({x,y})=>({x,y}))).toEqual([{x:245,y:490},{x:650,y:490}]);
    vi.advanceTimersByTime(2980);
    const returning=motions.find(motion=>motion.hasReturn)!;
    returning.advance(.5);
    expect(actors[0]).toMatchObject({x:482.5,y:290});
    destination={x:140,y:560};returning.advance(1);
    expect(actors[0]).toMatchObject(destination);
    expect(done).not.toHaveBeenCalled();vi.advanceTimersByTime(370);expect(done).toHaveBeenCalledTimes(1);
  });


  it('holds the defeated defender visibly after fire clears before the final fade',()=>{
    presenter.playAttack(context,definition,{durationScale:1,reducedMotion:false,presentation:'board'},()=>{},()=>{});
    vi.advanceTimersByTime(2350);
    motions.filter(motion=>motion.targets.includes(actors[1])).forEach(motion=>motion.advance(1));
    expect(actors[1]).toMatchObject({alpha:1,scaleY:0.9});
    vi.advanceTimersByTime(400);
    motions.filter(motion=>motion.targets.includes(actors[1])).forEach(motion=>motion.advance(1));
    expect(actors[1].alpha).toBe(0);
  });
  it('arena actors remain staged and never acquire board travel',()=>{
    presenter.playAttack(context,definition,{durationScale:1,reducedMotion:false,presentation:'arena',origins},()=>{},()=>{});
    expect(actors.map(({x,y,scaleX})=>({x,y,scaleX}))).toEqual([{x:245,y:490,scaleX:1},{x:650,y:490,scaleX:1}]);
    vi.advanceTimersByTime(2980);
    expect(motions.some(motion=>motion.hasReturn)).toBe(false);
  });

  it.each(['skip','cleanup'] as const)('%s during return cancels movement and never completes again',finish=>{
    const done=vi.fn();
    presenter.playAttack(context,definition,{durationScale:1,reducedMotion:false,presentation:'board',origins},()=>{},done);
    vi.advanceTimersByTime(2980);const returning=motions.find(motion=>motion.hasReturn)!;
    returning.advance(.25);const position={x:actors[0].x,y:actors[0].y};
    presenter[finish]();returning.advance(1);vi.runAllTimers();presenter.skip();
    expect(actors[0]).toMatchObject(position);expect(done).toHaveBeenCalledTimes(finish==='skip'?1:0);
  });
});
