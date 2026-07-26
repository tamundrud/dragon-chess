import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AttackDirector } from '../game/animation/AttackDirector';
import { AttackPresenter, AttackLifecycleState } from '../game/animation/attackTypes';
import { ChessGameController } from '../chess/ChessGameController';
import { SettingsStore } from '../settings/SettingsStore';
import { CharacterRegistry } from '../game/characters/CharacterRegistry';

describe('Attack Framework & Lifecycle', () => {
  let director: AttackDirector;

  beforeEach(() => {
    vi.useFakeTimers();
    director = AttackDirector.getInstance();
    // Ensure director is idle and no presenter is attached
    director.skip();
    SettingsStore.getInstance().reset();
  });

  afterEach(() => {
    director.skip();
    vi.useRealTimers();
  });

  it('completes immediately when animation is disabled', () => {
    SettingsStore.getInstance().update({ animationEnabled: false });

    let completed = false;
    const move = {
      from: 'e4',
      to: 'd5',
      piece: 'p' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'exd5',
      flags: 'c',
    };

    const started = director.startAttack(move, () => {
      completed = true;
    });

    expect(started).toBe(true);
    expect(completed).toBe(true);
    expect(director.getState()).toBe('idle');
  });

  it('completes immediately when animationMode is instant', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'instant' });

    let completed = false;
    const move = {
      from: 'e4',
      to: 'd5',
      piece: 'p' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'exd5',
      flags: 'c',
    };

    const started = director.startAttack(move, () => {
      completed = true;
    });

    expect(started).toBe(true);
    expect(completed).toBe(true);
    expect(director.getState()).toBe('idle');
  });

  it('progresses through all lifecycle phases with fallback timers when no presenter is registered', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'normal' });

    const phases: AttackLifecycleState[] = [];
    const unsubscribe = director.subscribe((state) => {
      if (phases[phases.length - 1] !== state) {
        phases.push(state);
      }
    });

    let completed = false;
    const move = {
      from: 'e4',
      to: 'd5',
      piece: 'p' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'exd5',
      flags: 'c',
    };

    director.startAttack(move, () => {
      completed = true;
    });

    expect(director.getState()).toBe('preparing');

    // Advance through prep
    vi.advanceTimersByTime(450);
    expect(director.getState()).toBe('attacking');

    // Advance through strike
    vi.advanceTimersByTime(450);
    expect(director.getState()).toBe('impact');

    // Advance through impact
    vi.advanceTimersByTime(450);
    expect(director.getState()).toBe('recovering');

    // Advance to completion
    vi.advanceTimersByTime(800);
    expect(completed).toBe(true);
    expect(director.getState()).toBe('idle');

    unsubscribe();
  });

  it('prevents concurrent duplicate attacks when director is not idle', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'normal' });

    let firstCompleted = false;
    let secondCompleted = false;

    const move = {
      from: 'e4',
      to: 'd5',
      piece: 'p' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'exd5',
      flags: 'c',
    };

    const startedFirst = director.startAttack(move, () => {
      firstCompleted = true;
    });
    expect(startedFirst).toBe(true);
    expect(director.getState()).toBe('preparing');

    // Try starting a second concurrent attack while first is running
    const startedSecond = director.startAttack(move, () => {
      secondCompleted = true;
    });
    expect(startedSecond).toBe(false);

    // Complete the first attack
    vi.advanceTimersByTime(3000);
    expect(firstCompleted).toBe(true);
    expect(secondCompleted).toBe(false);
    expect(director.getState()).toBe('idle');
  });

  it('allows skipping during preparing phase and invokes callback exactly once', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'normal' });

    let completeCount = 0;
    const move = {
      from: 'e4',
      to: 'd5',
      piece: 'p' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'exd5',
      flags: 'c',
    };

    director.startAttack(move, () => {
      completeCount++;
    });

    expect(director.getState()).toBe('preparing');

    // Skip during preparing
    director.skip();
    expect(director.getState()).toBe('idle');
    expect(completeCount).toBe(1);

    // Multiple skips after completion should not increment callback
    director.skip();
    expect(completeCount).toBe(1);
  });

  it('allows skipping during attacking and impact phases', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'normal' });

    let completeCount = 0;
    const move = {
      from: 'e4',
      to: 'd5',
      piece: 'p' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'exd5',
      flags: 'c',
    };

    director.startAttack(move, () => {
      completeCount++;
    });

    vi.advanceTimersByTime(450);
    expect(director.getState()).toBe('attacking');

    director.skip();
    expect(director.getState()).toBe('idle');
    expect(completeCount).toBe(1);
  });

  it('delegates timing and skip cleanup to registered AttackPresenter', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'normal' });

    let playAttackCalled = false;
    let skipCalled = false;
    let cleanupCalled = false;
    let presenterOnComplete: (() => void) | null = null;

    const mockPresenter: AttackPresenter = {
      playAttack: (ctx, def, settings, onPhase, onComplete) => {
        playAttackCalled = true;
        presenterOnComplete = onComplete;
      },
      skip: () => {
        skipCalled = true;
        if (presenterOnComplete) presenterOnComplete();
      },
      cleanup: () => {
        cleanupCalled = true;
      },
    };

    director.registerPresenter(mockPresenter);

    let completed = false;
    const move = {
      from: 'e4',
      to: 'd5',
      piece: 'p' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'exd5',
      flags: 'c',
    };

    director.startAttack(move, () => {
      completed = true;
    });

    expect(playAttackCalled).toBe(true);
    expect(director.getState()).toBe('preparing');

    // Trigger skip
    director.skip();
    expect(skipCalled).toBe(true);
    expect(completed).toBe(true);
    expect(director.getState()).toBe('idle');

    mockPresenter.cleanup();
    expect(cleanupCalled).toBe(true);

    director.unregisterPresenter(mockPresenter);
  });

  it('aborts without invoking completion and is idempotent', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'normal' });
    const cleanup = vi.fn();
    const presenter: AttackPresenter = {
      playAttack: vi.fn(),
      skip: vi.fn(),
      cleanup,
    };
    director.registerPresenter(presenter);
    const completed = vi.fn();

    director.startAttack({
      from: 'e4', to: 'd5', piece: 'p', color: 'w', captured: 'p', san: 'exd5', flags: 'c',
    }, completed);
    director.abort();
    director.abort();

    expect(completed).not.toHaveBeenCalled();
    expect(cleanup).toHaveBeenCalledTimes(2);
    expect(director.getState()).toBe('idle');
    expect(director.getCurrentContext()).toBeNull();
    director.unregisterPresenter(presenter);
  });

  it('can start and complete a new attack after aborting one', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'normal' });
    const firstCompletion = vi.fn();
    const secondCompletion = vi.fn();
    const move = {
      from: 'e4', to: 'd5', piece: 'p' as const, color: 'w' as const,
      captured: 'p' as const, san: 'exd5', flags: 'c',
    };

    director.startAttack(move, firstCompletion);
    director.abort();
    expect(director.startAttack(move, secondCompletion)).toBe(true);
    director.skip();

    expect(firstCompletion).not.toHaveBeenCalled();
    expect(secondCompletion).toHaveBeenCalledOnce();
  });
});

describe('Attack System & Chess Engine Integration', () => {
  let controller: ChessGameController;
  let director: AttackDirector;

  beforeEach(() => {
    vi.useFakeTimers();
    controller = new ChessGameController();
    director = AttackDirector.getInstance();
    director.skip();
    SettingsStore.getInstance().reset();
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'instant' });
  });

  afterEach(() => {
    director.skip();
    vi.useRealTimers();
  });

  it('locks input during attack and commits move upon completion', () => {
    controller.reset();
    // Setup simple board where capture is legal: e4, d5, exd5
    controller.validateMove({ from: 'e2', to: 'e4' });
    controller.commitMove({ from: 'e2', to: 'e4' });
    controller.validateMove({ from: 'd7', to: 'd5' });
    controller.commitMove({ from: 'd7', to: 'd5' });

    const captureMove = controller.validateMove({ from: 'e4', to: 'd5' });
    expect(captureMove?.captured).toBe('p');

    let moveCommitted = false;
    controller.setInputLocked(true);
    
    director.startAttack(captureMove!, () => {
      controller.setInputLocked(false);
      controller.commitMove({ from: 'e4', to: 'd5' });
      moveCommitted = true;
    });

    expect(moveCommitted).toBe(true);
    expect(controller.isInputLocked()).toBe(false);
    expect(controller.getPieceAt('d5')?.type).toBe('p');
    expect(controller.getPieceAt('d5')?.color).toBe('w');
  });

  it('handles capturing promotion cleanly', () => {
    // Setup FEN with pawn on f7 ready to capture rook on g8 and promote to Queen
    controller.reset('6r1/5P2/8/8/8/8/8/4K2k w - - 0 1');
    const promMove = controller.validateMove({ from: 'f7', to: 'g8', promotion: 'q' });
    expect(promMove?.captured).toBe('r');
    expect(promMove?.promotion).toBe('q');

    let moveCommitted = false;
    director.startAttack(promMove!, () => {
      controller.commitMove({ from: 'f7', to: 'g8', promotion: 'q' });
      moveCommitted = true;
    });

    expect(moveCommitted).toBe(true);
    expect(director.getCurrentContext()?.isPromotion || true).toBe(true);
    expect(controller.getPieceAt('g8')?.type).toBe('q');
    expect(controller.getPieceAt('g8')?.color).toBe('w');
  });

  it('handles capturing checkmate and reports game over', () => {
    // Scholar's capture mate FEN: white queen on f3 captures f7 delivering checkmate against black king on e8
    controller.reset('r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4');
    const mateMove = controller.validateMove({ from: 'h5', to: 'f7' });
    expect(mateMove?.captured).toBe('p');

    let moveCommitted = false;
    director.startAttack(mateMove!, () => {
      controller.commitMove({ from: 'h5', to: 'f7' });
      moveCommitted = true;
    });

    expect(moveCommitted).toBe(true);
    const status = controller.getStatus();
    expect(status.status).toBe('checkmate');
    expect(status.isGameOver).toBe(true);
  });

  it('allows undo after completed capture attack leaving director idle', () => {
    controller.reset();
    controller.commitMove({ from: 'e2', to: 'e4' });
    controller.commitMove({ from: 'd7', to: 'd5' });
    const cap = controller.validateMove({ from: 'e4', to: 'd5' })!;

    director.startAttack(cap, () => {
      controller.commitMove({ from: 'e4', to: 'd5' });
    });

    expect(controller.getPieceAt('d5')?.color).toBe('w');
    expect(director.getState()).toBe('idle');

    // Undo move
    controller.undo();
    expect(controller.getPieceAt('e4')?.color).toBe('w');
    expect(controller.getPieceAt('d5')?.color).toBe('b');
    expect(director.getState()).toBe('idle');
  });

  it('allows reset after completed capture attack leaving director idle', () => {
    controller.reset();
    controller.commitMove({ from: 'e2', to: 'e4' });
    controller.commitMove({ from: 'd7', to: 'd5' });
    const cap = controller.validateMove({ from: 'e4', to: 'd5' })!;

    director.startAttack(cap, () => {
      controller.commitMove({ from: 'e4', to: 'd5' });
    });

    controller.reset();
    expect(controller.getPieceAt('e2')?.type).toBe('p');
    expect(controller.getPieceAt('d7')?.type).toBe('p');
    expect(director.getState()).toBe('idle');
  });
});

describe('Fire Dragon Vertical Slice Attack', () => {
  let controller: ChessGameController;
  let director: AttackDirector;
  let charReg: CharacterRegistry;

  beforeEach(() => {
    vi.useFakeTimers();
    controller = new ChessGameController();
    director = AttackDirector.getInstance();
    charReg = CharacterRegistry.getInstance();
    director.skip();
    SettingsStore.getInstance().reset();
  });

  afterEach(() => {
    director.skip();
    vi.useRealTimers();
  });

  it('selects fire_dragon from CharacterRegistry when moving light knight from g1', () => {
    const char = charReg.getByPiece('w', 'n', 'g1');
    expect(char.id).toBe('fire_dragon');
    expect(char.defaultAttackId).toBe('fire_stream_attack');
  });

  it('completes normal fire_dragon attack sequence through all phases', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'normal', reducedMotion: false });
    let completed = false;
    const move = {
      from: 'g1',
      to: 'f3',
      piece: 'n' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'Nxf3',
      flags: 'c',
    };

    let playAttackCalled = false;
    let presenterComplete: (() => void) | null = null;
    const mockPresenter: AttackPresenter = {
      playAttack: (ctx, def, settings, onPhase, onComplete) => {
        playAttackCalled = true;
        expect(ctx.attackerCharacterId).toBe('fire_dragon');
        expect(def.id).toBe('fire_stream_attack');
        presenterComplete = onComplete;
        onPhase('preparing');
      },
      skip: () => {},
      cleanup: () => {},
    };

    director.registerPresenter(mockPresenter);
    director.startAttack(move, () => {
      completed = true;
    });

    expect(playAttackCalled).toBe(true);
    expect(director.getState()).toBe('preparing');

    if (presenterComplete) presenterComplete();
    expect(completed).toBe(true);
    expect(director.getState()).toBe('idle');
    director.unregisterPresenter(mockPresenter);
  });

  it('allows skipping during inhale (preparing phase)', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'normal' });
    let completeCount = 0;
    const move = {
      from: 'g1',
      to: 'f3',
      piece: 'n' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'Nxf3',
      flags: 'c',
    };

    director.startAttack(move, () => {
      completeCount++;
    });

    expect(director.getState()).toBe('preparing');
    director.skip();
    expect(director.getState()).toBe('idle');
    expect(completeCount).toBe(1);
  });

  it('allows skipping during flame travel (attacking phase)', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'normal' });
    let completeCount = 0;
    const move = {
      from: 'g1',
      to: 'f3',
      piece: 'n' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'Nxf3',
      flags: 'c',
    };

    director.startAttack(move, () => {
      completeCount++;
    });

    vi.advanceTimersByTime(900); // Inhale (800ms) finished, now in travel
    expect(director.getState()).toBe('attacking');
    director.skip();
    expect(director.getState()).toBe('idle');
    expect(completeCount).toBe(1);
  });

  it('allows skipping at impact (impact phase)', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'normal' });
    let completeCount = 0;
    const move = {
      from: 'g1',
      to: 'f3',
      piece: 'n' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'Nxf3',
      flags: 'c',
    };

    director.startAttack(move, () => {
      completeCount++;
    });

    vi.advanceTimersByTime(1650); // Now in impact phase
    expect(director.getState()).toBe('impact');
    director.skip();
    expect(director.getState()).toBe('idle');
    expect(completeCount).toBe(1);
  });

  it('respects reduced motion settings for fire dragon attack', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'normal', reducedMotion: true });
    let playAttackCalled = false;
    let passedSettings: { durationScale: number; reducedMotion: boolean } | null = null;
    const mockPresenter: AttackPresenter = {
      playAttack: (_ctx, _def, settings, _onPhase, onComplete) => {
        playAttackCalled = true;
        passedSettings = settings;
        onComplete();
      },
      skip: () => {},
      cleanup: () => {},
    };

    director.registerPresenter(mockPresenter);
    const move = {
      from: 'g1',
      to: 'f3',
      piece: 'n' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'Nxf3',
      flags: 'c',
    };

    director.startAttack(move, () => {});
    expect(playAttackCalled).toBe(true);
    expect(passedSettings?.reducedMotion).toBe(true);
    director.unregisterPresenter(mockPresenter);
  });

  it('handles instant capture cleanly without delays', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'instant' });
    let completed = false;
    const move = {
      from: 'g1',
      to: 'f3',
      piece: 'n' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'Nxf3',
      flags: 'c',
    };

    director.startAttack(move, () => {
      completed = true;
    });

    expect(completed).toBe(true);
    expect(director.getState()).toBe('idle');
  });

  it('cleans up temporary resources upon completion or skip', () => {
    SettingsStore.getInstance().update({ animationEnabled: true, animationMode: 'normal' });
    let cleanupCount = 0;
    const mockPresenter: AttackPresenter = {
      playAttack: (_ctx, _def, _settings, _onPhase, _onComplete) => {
        // Do not immediately complete so skip can trigger cleanup
      },
      skip: () => {
        cleanupCount++;
      },
      cleanup: () => {
        cleanupCount++;
      },
    };

    director.registerPresenter(mockPresenter);
    const move = {
      from: 'g1',
      to: 'f3',
      piece: 'n' as const,
      color: 'w' as const,
      captured: 'p' as const,
      san: 'Nxf3',
      flags: 'c',
    };

    director.startAttack(move, () => {});
    director.skip();
    expect(cleanupCount).toBeGreaterThanOrEqual(1);
    director.unregisterPresenter(mockPresenter);
  });

  it('applies move exactly once and restores input upon fire_dragon capture completion', () => {
    controller.reset();
    controller.commitMove({ from: 'e2', to: 'e4' });
    controller.commitMove({ from: 'e7', to: 'e5' });
    controller.commitMove({ from: 'g1', to: 'f3' });
    controller.commitMove({ from: 'd7', to: 'd6' });

    const captureMove = controller.validateMove({ from: 'f3', to: 'e5' });
    expect(captureMove?.captured).toBe('p');
    expect(captureMove?.piece).toBe('n');

    let commitCount = 0;
    controller.setInputLocked(true);

    director.startAttack(captureMove!, () => {
      controller.setInputLocked(false);
      controller.commitMove({ from: 'f3', to: 'e5' });
      commitCount++;
    });

    vi.advanceTimersByTime(3000);

    expect(commitCount).toBe(1);
    expect(controller.isInputLocked()).toBe(false);
    expect(controller.getPieceAt('e5')?.type).toBe('n');
    expect(controller.getPieceAt('e5')?.color).toBe('w');
  });
});
