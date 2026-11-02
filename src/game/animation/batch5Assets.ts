import Phaser from 'phaser';

export const BATCH5 = ['mogadon', 'valhallarama', 'hairy_scary_librarian'] as const;
export type Batch5Id = typeof BATCH5[number];
const poses: Record<Batch5Id, readonly string[]> = {
  mogadon:['ready','action','proud'], valhallarama:['ready','action','contact','proud'],
  hairy_scary_librarian:['ready','guard','blue','red','action','proud'],
};

/** Cancellable, independent loads keep abandoned captures from blocking later ones. */
export function loadBatch5(scene: Phaser.Scene, id: Batch5Id, done: (available:boolean)=>void, readyOnly = false): () => void {
  const missing=(readyOnly ? ['ready'] : poses[id]).map(p=>`${id}-${p}`).filter(name=>!scene.textures.exists(`batch5-${name}`));
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
    image.onload=()=>{if(!active)return;complete.add(image);const key=`batch5-${name}`;
      if(!scene.textures.exists(key))scene.textures.addImage(key,image);
      if(--remaining===0)settle(true);
    };
    image.onerror=()=>{if(active)settle(false);};image.src=`/art/batch5/${name}.webp`;
  }
  return cancel;
}
