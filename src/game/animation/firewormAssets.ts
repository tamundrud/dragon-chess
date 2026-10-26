import Phaser from 'phaser';

export function preloadFireworm(scene: Phaser.Scene): void {
  scene.load.image('fireworm-sheet', '/art/fireworm/rig.png');
  scene.load.image('fireworm-cove', '/art/fireworm/cove.png');
  for (const pose of ['ready', 'breath', 'proud']) scene.load.image(`fireworm-${pose}`, `/art/fireworm/${pose}.png`);
  scene.load.image('flamehuffer', '/art/fireworm/flamehuffer.png');
}

/** Measured cutout bounds: the generator did not honour equal-cell spacing. */
export function frameFireworm(scene: Phaser.Scene): void {
  const texture = scene.textures.get('fireworm-sheet');
  const frames: [string, number, number, number, number][] = [
    ['flame', 1080, 570, 456, 350],
  ];
  for (const [name, x, y, width, height] of frames) {
    if (!texture.has(name)) texture.add(name, 0, x, y, width, height);
  }
  if (!scene.textures.exists('fireworm-raider')) {
    const raider = scene.textures.createCanvas('fireworm-raider', 545, 515)!;
    const ctx = raider.getContext();
    const source = texture.getSourceImage() as HTMLImageElement;
    // The atlas's neighbouring flame tip overlaps an empty corner of the pawn
    // frame. Extract around it without cropping the hand or the lower boot.
    for (const [x, y, width, height] of [[0, 0, 545, 220], [0, 220, 450, 90], [0, 310, 545, 205]]) {
      ctx.drawImage(source, 535 + x, 495 + y, width, height, x, y, width, height);
    }
    raider.add('defender', 0, 0, 0, 545, 515);
    raider.refresh();
  }
}
