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
    ['body', 0, 20, 615, 465], ['head', 630, 12, 415, 480],
    ['release', 1080, 10, 456, 480], ['wing', 15, 490, 520, 515],
    ['defender', 535, 495, 545, 515], ['flame', 1080, 570, 456, 350],
  ];
  for (const [name, x, y, width, height] of frames) {
    if (!texture.has(name)) texture.add(name, 0, x, y, width, height);
  }
}
