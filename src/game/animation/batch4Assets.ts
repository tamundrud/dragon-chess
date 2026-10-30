import Phaser from 'phaser';

export const BATCH4 = ['hookfang', 'flamehuffer', 'common_or_garden', 'stoick'] as const;
export type Batch4Id = typeof BATCH4[number];
const poses: Record<Batch4Id, readonly string[]> = {
  hookfang:['ready','action'], flamehuffer:['ready','action'], common_or_garden:['ready','action'],
  stoick:['charge','slip','tumble','confused','proud'],
};

/** Cancellable, independent loads keep abandoned captures from blocking later ones. */
export function loadBatch4(scene: Phaser.Scene, id: Batch4Id, done: (available:boolean)=>void): () => void {
  const missing=poses[id].map(p=>`${id}-${p}`).filter(name=>!scene.textures.exists(`batch4-${name}`));
  if (!missing.length) { done(true); return () => {}; }
  let active=true, remaining=missing.length;
  const images:HTMLImageElement[]=[]; const complete=new Set<HTMLImageElement>();
  const cancel=()=>{ if(!active)return; active=false;clearTimeout(timeout);for(const image of images){
    image.onload=null;image.onerror=null;if(!complete.has(image))image.src='';
  }};
  const settle=(ok:boolean)=>{cancel();done(ok);};
  const timeout=setTimeout(()=>settle(false),15000);
  for(const name of missing){
    const image=new Image();images.push(image);
    image.onload=()=>{if(!active)return;complete.add(image);const key=`batch4-${name}`;
      if(!scene.textures.exists(key))scene.textures.addImage(key,image);
      if(--remaining===0)settle(true);
    };
    image.onerror=()=>{if(active)settle(false);};image.src=`/art/batch4/${name}.webp`;
  }
  return cancel;
}
