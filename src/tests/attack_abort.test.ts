import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AttackDirector } from '../game/animation/AttackDirector';
import { AttackLifecycleState, AttackPresenter } from '../game/animation/attackTypes';
import { SettingsStore } from '../settings/SettingsStore';

const capture = { from: 'e4', to: 'd5', piece: 'p' as const, color: 'w' as const, captured: 'p' as const, san: 'exd5', flags: 'c' };

describe('attack cancellation and stale presenter callbacks', () => {
  const director = AttackDirector.getInstance();
  let phase: (state: AttackLifecycleState) => void;
  let complete: () => void;
  let presenter: AttackPresenter;

  beforeEach(() => {
    vi.useFakeTimers();
    SettingsStore.getInstance().reset();
    presenter = {
      playAttack: (_context, _definition, _settings, onPhase, onComplete) => {
        phase = onPhase;
        complete = onComplete;
      },
      skip: vi.fn(() => complete()),
      // Even a presenter that calls completion during cleanup cannot commit an abort.
      cleanup: vi.fn(() => complete?.()),
    };
    director.registerPresenter(presenter);
  });

  afterEach(() => {
    director.abort();
    director.unregisterPresenter(presenter);
    vi.useRealTimers();
  });

  it('aborts repeatedly without committing and clears capture context', () => {
    const commit = vi.fn();
    director.startAttack(capture, commit);
    director.abort();
    director.abort();
    complete();
    phase('impact');
    vi.runAllTimers();
    expect(commit).not.toHaveBeenCalled();
    expect(director.getState()).toBe('idle');
    expect(director.getCurrentContext()).toBeNull();
    expect(director.getCurrentDefinition()).toBeNull();
  });

  it('ignores stale phase and completion callbacks during a later attack', () => {
    const oldCommit = vi.fn();
    const newCommit = vi.fn();
    director.startAttack(capture, oldCommit);
    const oldComplete = complete;
    const oldPhase = phase;
    director.abort();
    director.startAttack(capture, newCommit);
    oldPhase('impact');
    oldComplete();
    expect(director.getState()).toBe('preparing');
    expect(newCommit).not.toHaveBeenCalled();
    complete();
    complete();
    phase('recovering');
    expect(oldCommit).not.toHaveBeenCalled();
    expect(newCommit).toHaveBeenCalledTimes(1);
    expect(director.getState()).toBe('idle');
  });

  it('cancels headless timers without committing', () => {
    director.unregisterPresenter(presenter);
    const commit = vi.fn();
    const abort = vi.fn();
    director.startAttack(capture, commit, abort);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    director.abort();
    director.abort();
    vi.runAllTimers();
    expect(commit).not.toHaveBeenCalled();
    expect(abort).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    expect(director.getState()).toBe('idle');
  });

  it('ignores an old owner abort and old presenter removal in a later attack', () => {
    const oldCommit = vi.fn();
    director.startAttack(capture, oldCommit);
    director.abort(oldCommit);
    const replacement = { ...presenter };
    director.registerPresenter(replacement);
    const commit = vi.fn();
    director.startAttack(capture, commit);
    director.abort(oldCommit);
    director.unregisterPresenter(presenter);
    expect(director.getState()).toBe('preparing');
    complete();
    expect(commit).toHaveBeenCalledTimes(1);
    director.unregisterPresenter(replacement);
  });

  it.each(['natural', 'skip'])('%s completion commits exactly once', (mode) => {
    const commit = vi.fn();
    director.startAttack(capture, commit);
    if (mode === 'skip') director.skip();
    else complete();
    director.skip();
    complete();
    phase('impact');
    expect(commit).toHaveBeenCalledTimes(1);
    expect(director.getState()).toBe('idle');
  });
});
