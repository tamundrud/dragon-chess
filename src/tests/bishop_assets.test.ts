import { afterEach, describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import { loadBishop } from '../game/animation/bishopAssets';

function fixture() {
  const existing = new Set<string>(); const images: FakeImage[] = [];
  class FakeImage {
    src = ''; onload: (() => void) | null = null; onerror: (() => void) | null = null;
    constructor() { images.push(this); }
  }
  vi.stubGlobal('Image', FakeImage);
  const scene = { textures: { exists: (key: string) => existing.has(key),
    addImage: (key: string) => existing.add(key) } } as unknown as Phaser.Scene;
  return {scene, images};
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('on-demand Bishop artwork', () => {
  it('waits only for requested poses and includes a Bishop defender', () => {
    const f = fixture(); const done = vi.fn();
    loadBishop(f.scene, 'toothless', done, 'killer');
    expect(f.images).toHaveLength(4);
    f.images.forEach(image => image.onload?.());
    expect(done).toHaveBeenCalledOnce(); expect(done).toHaveBeenCalledWith(true);
    expect(f.images.every(image => image.src.startsWith('/art/bishops/'))).toBe(true);
    loadBishop(f.scene, 'toothless', done, 'killer');
    expect(f.images).toHaveLength(4); expect(done).toHaveBeenCalledTimes(2);
  });
  it('cancels callbacks and bounds stalled loads', () => {
    vi.useFakeTimers(); const f = fixture(); const done = vi.fn();
    const cancel = loadBishop(f.scene, 'killer', done); const old = f.images[0].onload; cancel();
    old?.(); vi.advanceTimersByTime(15000); expect(done).not.toHaveBeenCalled();
    loadBishop(f.scene, 'killer', done); vi.advanceTimersByTime(15000);
    expect(done).toHaveBeenCalledOnce(); expect(done).toHaveBeenCalledWith(false);
    f.images[3].onload?.(); expect(done).toHaveBeenCalledOnce();
  });
  it('falls back when only the optional defender art fails', () => {
    const f = fixture(); const done = vi.fn(); loadBishop(f.scene, 'killer', done, 'hiccup');
    f.images[3].onerror?.(); f.images.slice(0, 3).forEach(image => image.onload?.());
    expect(done).toHaveBeenCalledOnce(); expect(done).toHaveBeenCalledWith(true);
  });
  it('settles once when an image fails', () => {
    const f = fixture(); const done = vi.fn(); loadBishop(f.scene, 'killer', done);
    f.images[0].onerror?.(); f.images[1].onerror?.(); expect(done).toHaveBeenCalledOnce(); expect(done).toHaveBeenCalledWith(false);
  });
});
