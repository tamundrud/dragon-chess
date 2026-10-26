import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import { FirewormPresenter } from '../game/animation/FirewormPresenter';
import { AttackRegistry } from '../game/animation/AttackRegistry';
import type { AttackContext } from '../game/animation/attackTypes';

const context: AttackContext = { moveFrom: 'b3', moveTo: 'b4', attackerCharacterId: 'fireworm', defenderCharacterId: 'rival_generic', attackDefinitionId: 'fireworm_fireworks' };
const definition = AttackRegistry.getInstance().getById('fireworm_fireworks')!;

describe('Fireworm presentation lifecycle', () => {
  let presenter: FirewormPresenter;
  let removedTweens: ReturnType<typeof vi.fn>[];
  let destroyed: ReturnType<typeof vi.fn>[];
  beforeEach(() => {
    vi.useFakeTimers();
    removedTweens = []; destroyed = [];
    function object() {
      const destroy = vi.fn(); destroyed.push(destroy);
      const value: Record<string, unknown> = { scaleX: 1, scaleY: 1, destroy };
      for (const name of ['add','setDisplaySize','setOrigin','setAlpha','setVisible','setText','setTint','setFrame','setPosition','setRotation','fillStyle','fillCircle']) value[name] = () => value;
      return value;
    }
    const scene = {
      add: Object.fromEntries(['container','image','text','ellipse','rectangle','graphics'].map(name => [name, object])),
      time: { delayedCall: (delay: number, callback: () => void) => {
        const id = setTimeout(callback, delay);
        return { remove: () => clearTimeout(id) };
      } },
      tweens: { add: () => { const remove = vi.fn(); removedTweens.push(remove); return { remove }; } },
    } as unknown as Phaser.Scene;
    presenter = new FirewormPresenter(scene, object() as unknown as Phaser.GameObjects.Container,
      object() as unknown as Phaser.GameObjects.Text, object() as unknown as Phaser.GameObjects.Text, object() as unknown as Phaser.GameObjects.Text);
  });
  afterEach(() => { presenter.cleanup(); vi.useRealTimers(); });

  it.each([[1, false, 3350], [0.35, false, 1173], [1, true, 1000]] as const)('completes one ordered lifecycle at scale %s, reduced %s', (durationScale, reducedMotion, duration) => {
    const phases: string[] = [];
    const done = vi.fn();
    presenter.playAttack(context, definition, { durationScale, reducedMotion }, phase => phases.push(phase), done);
    vi.advanceTimersByTime(duration);
    expect(phases).toEqual(['preparing', 'attacking', 'impact', 'recovering']);
    expect(done).toHaveBeenCalledTimes(1);
    presenter.skip(); vi.runAllTimers();
    expect(done).toHaveBeenCalledTimes(1);
    expect(removedTweens.every(remove => remove.mock.calls.length === 1)).toBe(true);
  });

  it.each([200, 1000, 1500, 2400])('Skip at %s ms completes once and cancels remaining phases', ms => {
    const phase = vi.fn(); const done = vi.fn();
    presenter.playAttack(context, definition, { durationScale: 1, reducedMotion: false }, phase, done);
    vi.advanceTimersByTime(ms); presenter.skip();
    const count = phase.mock.calls.length;
    presenter.skip(); vi.runAllTimers();
    expect(done).toHaveBeenCalledTimes(1);
    expect(phase).toHaveBeenCalledTimes(count);
    expect(removedTweens.every(remove => remove.mock.calls.length === 1)).toBe(true);
  });

  it('abort cancels completion and its resources while leaving unrelated scene activity alone', () => {
    const unrelated = vi.fn(); setTimeout(unrelated, 4000);
    const done = vi.fn(); const phase = vi.fn();
    presenter.playAttack(context, definition, { durationScale: 1, reducedMotion: false }, phase, done);
    vi.advanceTimersByTime(1500); presenter.cleanup(); presenter.cleanup();
    const count = phase.mock.calls.length;
    vi.runAllTimers();
    expect(done).not.toHaveBeenCalled();
    expect(phase).toHaveBeenCalledTimes(count);
    expect(unrelated).toHaveBeenCalledTimes(1);
    expect(removedTweens.every(remove => remove.mock.calls.length === 1)).toBe(true);
    expect(destroyed.some(destroy => destroy.mock.calls.length === 1)).toBe(true);
  });

  it('replay abandons the prior callback and starts a fresh complete lifecycle', () => {
    const old = vi.fn(); const current = vi.fn();
    presenter.playAttack(context, definition, { durationScale: 1, reducedMotion: false }, () => {}, old);
    vi.advanceTimersByTime(1500);
    presenter.playAttack(context, definition, { durationScale: 1, reducedMotion: true }, () => {}, current);
    vi.runAllTimers();
    expect(old).not.toHaveBeenCalled(); expect(current).toHaveBeenCalledTimes(1);
  });
});
