import { afterEach, describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import { Batch5Presenter } from '../game/animation/Batch5Presenter';
import { AttackRegistry } from '../game/animation/AttackRegistry';

afterEach(() => vi.useRealTimers());

describe.each(['mogadon', 'valhallarama', 'hairy_scary_librarian'] as const)('%s foreground staging', id => {
  it('keeps the actor on the near side and above the defender through contact', () => {
    vi.useFakeTimers();
    type Node = { x:number; y:number; children:Node[]; add:(nodes:Node|Node[])=>Node; bringToTop:(node:Node)=>Node; [key:string]:unknown };
    const containers:Node[]=[]; const moves:number[]=[];
    function node(x=0,y=0):Node {
      const value:Node={x,y,children:[],add(nodes) { this.children.push(...(Array.isArray(nodes)?nodes:[nodes]));return this; },
        bringToTop(child) {this.children=this.children.filter(c=>c!==child);this.children.push(child);return this;}};
      for (const name of ['destroy','setFlipX','setAngle','setRotation','setScale','setDisplaySize','setOrigin','setAlpha','setVisible','setText','setTint']) value[name]=()=>value;
      value.setPosition=(nx:number,ny:number)=>{value.x=nx;value.y=ny;return value;};
      return value;
    }
    const scene={add:{container:(x:number,y:number)=>{const n=node(x,y);containers.push(n);return n;},
      image:()=>node(),text:()=>node(),ellipse:()=>node(),star:()=>node()},
      time:{delayedCall:(delay:number,callback:()=>void)=>{const t=setTimeout(callback,delay);return {remove:()=>clearTimeout(t)};}},
      tweens:{add:(config:Record<string,unknown>)=>{const target=config.targets as Node;
        if(target===containers[1] && typeof config.x==='number') moves.push(config.x);
        if(target && typeof config.x==='number') target.x=config.x;
        if(target && typeof config.y==='number') target.y=config.y;
        return {remove:()=>{}};}}} as unknown as Phaser.Scene;
    const parent=node() as unknown as Phaser.GameObjects.Container;
    const presenter=new Batch5Presenter(scene,parent,node() as unknown as Phaser.GameObjects.Text,node() as unknown as Phaser.GameObjects.Text,node() as unknown as Phaser.GameObjects.Text);
    presenter.playAttack({moveFrom:'a1',moveTo:'a2',attackerCharacterId:id,defenderCharacterId:'rival_generic',defenderPieceType:'p',defenderColor:'b',attackDefinitionId:'generic_strike'},
      AttackRegistry.getInstance().getById('generic_strike')!,{durationScale:1,reducedMotion:false},()=>{},()=>{});
    const [root, actor, defender]=containers;
    for (const elapsed of [750, 450, 350, 150, 650]) {
      vi.advanceTimersByTime(elapsed);
      expect(root.children.indexOf(actor)).toBeGreaterThan(root.children.indexOf(defender));
      expect(actor.x).toBeLessThan(defender.x);
    }
    expect(moves.every(x=>x<defender.x)).toBe(true);
    presenter.cleanup();
  });
});

describe.each([
  ['mogadon','action'], ['valhallarama','contact'], ['hairy_scary_librarian','action'],
] as const)('%s reduced-motion contact', (id, contact) => {
  it('shows the contact pose at impact', () => {
    vi.useFakeTimers();
    const visible:string[]=[];
    function node(key='') {
      const o:Record<string,unknown>={key,x:0,y:0};
      for (const method of ['add','destroy','setFlipX','setScale','setDisplaySize','setOrigin','setAlpha','setVisible','setText','setPosition','setAngle']) o[method]=()=>o;
      return o;
    }
    const scene={add:{container:()=>node(),image:(_x:number,_y:number,key:string)=>node(key),text:()=>node(),ellipse:()=>node(),star:()=>node()},
      time:{delayedCall:(delay:number,callback:()=>void)=>{const t=setTimeout(callback,delay);return {remove:()=>clearTimeout(t)};}},
      tweens:{add:(config:Record<string,unknown>)=>{const target=config.targets as {key?:string};if(config.alpha===1 && target.key) visible.push(target.key);return {remove:()=>{}};}}} as unknown as Phaser.Scene;
    const presenter=new Batch5Presenter(scene,node() as unknown as Phaser.GameObjects.Container,node() as unknown as Phaser.GameObjects.Text,node() as unknown as Phaser.GameObjects.Text,node() as unknown as Phaser.GameObjects.Text);
    presenter.playAttack({moveFrom:'a1',moveTo:'a2',attackerCharacterId:id,defenderCharacterId:'rival_generic',defenderPieceType:'p',defenderColor:'b',attackDefinitionId:'generic_strike'},
      AttackRegistry.getInstance().getById('generic_strike')!,{durationScale:1,reducedMotion:true},()=>{},()=>{});
    vi.advanceTimersByTime(460);
    expect(visible).toContain(`batch5-${id}-${contact}`);
    presenter.cleanup();
  });
});
