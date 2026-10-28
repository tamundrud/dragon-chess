import Phaser from 'phaser';

export const BISHOPS = ['hiccup', 'toothless', 'thuggory', 'killer'] as const;
export type BishopId = typeof BISHOPS[number];
const POSES = ['ready', 'action', 'proud'] as const;
const LOAD_TIMEOUT_MS = 15000;

export function bishopHeightRatio(id: BishopId): number {
  return id === 'hiccup' ? 1199 / 1312 : id === 'toothless' ? 1145 / 1374 : 1024 / 1536;
}

/** Independent requests prevent an abandoned capture from blocking a later one. */
export function loadBishop(scene: Phaser.Scene, id: BishopId | null, done: (available: boolean) => void,
  defender?: BishopId): () => void {
  const names: string[] = id ? (id === 'hiccup' ? [...POSES, 'release', 'glider'] : [...POSES]).map(pose => `${id}-${pose}`) : [];
  const required = new Set(names);
  if (defender) names.push(`${defender}-ready`);
  const missing = [...new Set(names)].filter(name => !scene.textures.exists(`bishop-${name}`));
  if (!missing.length) { done(true); return () => {}; }
  let active = true;
  let remaining = missing.length;
  let requiredRemaining = missing.filter(name => required.has(name)).length;
  const images: HTMLImageElement[] = [];
  const completed = new Set<HTMLImageElement>();
  const cancel = () => {
    if (!active) return;
    active = false; clearTimeout(timeout);
    for (const image of images) {
      image.onload = null; image.onerror = null;
      if (!completed.has(image)) image.src = '';
    }
  };
  const settle = (available: boolean) => { cancel(); done(available); };
  const timeout = setTimeout(() => settle(requiredRemaining === 0), LOAD_TIMEOUT_MS);
  for (const name of missing) {
    const image = new Image(); images.push(image);
    image.onload = () => {
      if (!active) return;
      completed.add(image);
      const key = `bishop-${name}`;
      if (!scene.textures.exists(key)) scene.textures.addImage(key, image);
      if (required.has(name)) requiredRemaining--;
      if (--remaining === 0) settle(true);
    };
    image.onerror = () => {
      if (!active) return;
      if (required.has(name)) settle(false);
      else if (--remaining === 0) settle(true);
    };
    image.src = `/art/bishops/${name}.webp`;
  }
  return cancel;
}
