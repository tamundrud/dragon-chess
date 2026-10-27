import Phaser from 'phaser';

export const KNIGHTS = ['windwalker', 'one_eye', 'driller_dragon', 'poisonous_piffleworm'] as const;
export type KnightId = typeof KNIGHTS[number];

export function preloadKnights(scene: Phaser.Scene): void {
  scene.load.image('knight-piffle-release', '/art/knights/piffle-release.png');
  scene.load.image('knight-hooligan', '/art/knights/hooligan.png');
  for (const id of KNIGHTS) scene.load.image(`knight-${id}`, `/art/knights/${id}.png`);
}

export function frameKnights(scene: Phaser.Scene): void {
  const frames: Record<KnightId, [number, number, number, number][]> = {
    windwalker: [[0, 0, 770, 725], [770, 0, 767, 725], [1537, 0, 630, 725]],
    one_eye: [[0, 0, 780, 724], [780, 0, 740, 724], [1520, 0, 652, 724]],
    driller_dragon: [[0, 0, 720, 724], [720, 0, 810, 724], [1530, 0, 642, 724]],
    poisonous_piffleworm: [[0, 0, 625, 836], [625, 0, 700, 836], [1325, 0, 556, 836]],
  };
  // Two sheets have overlapping horizontal bounds, but the silhouettes are
  // separated vertically. Extract their rectangular regions without including
  // a neighbour's tail or claw (as with the Fireworm raider atlas).
  for (const [id, left, boundary, right, split, height] of [
    ['one_eye', 780, 1510, 1534, 480, 724],
    ['windwalker', 770, 1535, 1540, 550, 725],
  ] as const) {
    const source = scene.textures.get(`knight-${id}`).getSourceImage() as HTMLImageElement;
    for (const [index, start, width] of [[1, left, right-left], [2, boundary, source.width-boundary]] as const) {
      const key = `knight-${id}-${index}`;
      if (scene.textures.exists(key)) continue;
      const canvas = scene.textures.createCanvas(key, width, height)!;
      const ctx = canvas.getContext();
      if (index === 1) {
        ctx.drawImage(source, start, 0, boundary-start, split, 0, 0, boundary-start, split);
        ctx.drawImage(source, start, split, right-start, height-split, 0, split, right-start, height-split);
      } else {
        ctx.drawImage(source, start, 0, width, split, 0, 0, width, split);
        ctx.drawImage(source, right, split, source.width-right, height-split, right-start, split, source.width-right, height-split);
      }
      canvas.refresh();
    }
  }
  for (const id of KNIGHTS) {
    const texture = scene.textures.get(`knight-${id}`);
    frames[id].forEach(([x, y, width, height], i) => {
      if (!texture.has(String(i))) texture.add(String(i), 0, x, y, width, height);
    });
  }
}
