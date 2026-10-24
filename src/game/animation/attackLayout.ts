// Both presenters animate in this space. Only its parent transform changes on
// resize, so existing tweens and effects spawned later stay aligned.
export const ATTACK_ART_WIDTH = 800;
export const ATTACK_ART_HEIGHT = 600;

export function fitAttackArtwork(width: number, height: number) {
  const scale = Math.min(width / ATTACK_ART_WIDTH, height / ATTACK_ART_HEIGHT);
  return {
    x: (width - ATTACK_ART_WIDTH * scale) / 2,
    y: (height - ATTACK_ART_HEIGHT * scale) / 2,
    scale,
  };
}
