import { describe, expect, it } from 'vitest';
import { fitAttackArtwork } from '../game/animation/attackLayout';

describe('capture artwork containment', () => {
  it.each([[1366, 768], [360, 800], [390, 844], [800, 360], [768, 1024], [4, 300], [0, 300]])(
    'contains the full composition at %i by %i', (width, height) => {
      const { x, y, scale } = fitAttackArtwork(width, height);
      expect(Number.isFinite(scale)).toBe(true);
      expect(scale).toBeGreaterThanOrEqual(0);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x + 800 * scale).toBeLessThanOrEqual(width);
      expect(y + 600 * scale).toBeLessThanOrEqual(height);
      expect(x + 400 * scale).toBeCloseTo(width / 2);
      expect(y + 300 * scale).toBeCloseTo(height / 2);
    }
  );
});
