import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Phaser from 'phaser';
import { FireDragonPresenter } from '../game/animation/FireDragonPresenter';
import { AttackContext, AttackDefinition } from '../game/animation/attackTypes';
import { AudioController } from '../game/audio/AudioController';

describe('FireDragonPresenter Unit Tests', () => {
  let scene: Phaser.Scene;
  let stageContainer: Phaser.GameObjects.Container;
  let statusText: Phaser.GameObjects.Text;
  let attackerText: Phaser.GameObjects.Text;
  let defenderText: Phaser.GameObjects.Text;
  let presenter: FireDragonPresenter;

  beforeEach(() => {
    vi.useFakeTimers();
    // Create mock Phaser scene and objects
    scene = {
      add: {
        container: vi.fn().mockImplementation(() => ({
          add: vi.fn(),
          setPosition: vi.fn(),
          setScale: vi.fn(),
          setAlpha: vi.fn(),
          setAngle: vi.fn(),
          setVisible: vi.fn(),
          removeAll: vi.fn(),
          destroy: vi.fn(),
        })),
        graphics: vi.fn().mockImplementation(() => ({
          fillStyle: vi.fn(),
          fillTriangle: vi.fn(),
          fillRoundedRect: vi.fn(),
          fillCircle: vi.fn(),
          lineStyle: vi.fn(),
          strokeTriangle: vi.fn(),
          strokeRoundedRect: vi.fn(),
          setAlpha: vi.fn(),
          setAngle: vi.fn(),
          setPosition: vi.fn(),
          setVisible: vi.fn(),
          destroy: vi.fn(),
        })),
        text: vi.fn().mockImplementation(() => ({
          setOrigin: vi.fn(),
          setText: vi.fn(),
          destroy: vi.fn(),
        })),
      },
      scale: {
        width: 800,
        height: 600,
      },
      tweens: {
        add: vi.fn().mockImplementation((config) => {
          if (config && config.onComplete) {
            // Store for simulated completion if needed
          }
          return {
            isPlaying: () => true,
            stop: vi.fn(),
          };
        }),
        killAll: vi.fn(),
      },
      time: {
        delayedCall: vi.fn().mockImplementation((delay, cb) => {
          setTimeout(cb, delay);
          return {
            remove: vi.fn(),
          };
        }),
      },
      cameras: {
        main: {
          shake: vi.fn(),
          resetFX: vi.fn(),
          setZoom: vi.fn(),
          setAngle: vi.fn(),
        },
      },
    } as unknown as Phaser.Scene;

    stageContainer = {
      add: vi.fn(),
      setVisible: vi.fn(),
    } as unknown as Phaser.GameObjects.Container;

    statusText = { setText: vi.fn() } as unknown as Phaser.GameObjects.Text;
    attackerText = { setText: vi.fn() } as unknown as Phaser.GameObjects.Text;
    defenderText = { setText: vi.fn() } as unknown as Phaser.GameObjects.Text;

    presenter = new FireDragonPresenter(scene, stageContainer, statusText, attackerText, defenderText);
  });

  afterEach(() => {
    presenter.cleanup();
    vi.useRealTimers();
  });

  it('initializes and plays fire dragon attack sequence', () => {
    const context: AttackContext = {
      moveFrom: 'g1',
      moveTo: 'f3',
      attackerCharacterId: 'fire_dragon',
      defenderCharacterId: 'rival_generic',
      attackDefinitionId: 'fire_stream_attack',
      isPromotion: false,
    };
    const definition: AttackDefinition = {
      id: 'fire_stream_attack',
      displayName: 'Fire Stream Attack',
      description: 'Test Fire Stream',
      totalDuration: 2600,
      anticipationDuration: 800,
      strikeDuration: 800,
      impactTime: 1600,
      recoveryDuration: 1000,
      soundCueIds: ['dragon_inhale', 'fire_ignite', 'fire_stream', 'fire_impact', 'dragon_rumble'],
      effectIds: ['flame_stream', 'ember_particles', 'soot_cloud'],
      screenShake: true,
      hitPause: false,
    };

    const phases: string[] = [];
    let completed = false;

    const playSoundSpy = vi.spyOn(AudioController.getInstance(), 'playSound').mockImplementation(() => {});

    presenter.playAttack(
      context,
      definition,
      { durationScale: 1.0, reducedMotion: false },
      (phase) => phases.push(phase),
      () => { completed = true; }
    );

    expect(phases).toContain('preparing');
    expect(statusText.setText).toHaveBeenCalled();
    expect(playSoundSpy).toHaveBeenCalledWith('dragon_inhale');

    // Advance through inhale to attack phase
    vi.advanceTimersByTime(800);
    expect(phases).toContain('attacking');
    expect(playSoundSpy).toHaveBeenCalledWith('fire_ignite');
    expect(playSoundSpy).toHaveBeenCalledWith('fire_stream');

    // Advance to impact phase
    vi.advanceTimersByTime(800);
    expect(phases).toContain('impact');
    expect(playSoundSpy).toHaveBeenCalledWith('fire_impact');
    expect(scene.cameras.main.shake).toHaveBeenCalled();

    // Advance to recovery and completion
    vi.advanceTimersByTime(1000);
    expect(phases).toContain('recovering');
    expect(completed).toBe(true);

    playSoundSpy.mockRestore();
  });

  it('skips attack cleanly and calls onComplete immediately', () => {
    const context: AttackContext = {
      moveFrom: 'g1',
      moveTo: 'f3',
      attackerCharacterId: 'fire_dragon',
      defenderCharacterId: 'rival_generic',
      attackDefinitionId: 'fire_stream_attack',
      isPromotion: false,
    };
    const definition: AttackDefinition = {
      id: 'fire_stream_attack',
      displayName: 'Fire Stream Attack',
      description: 'Test Fire Stream',
      totalDuration: 2600,
      anticipationDuration: 800,
      strikeDuration: 800,
      impactTime: 1600,
      recoveryDuration: 1000,
      soundCueIds: [],
      effectIds: [],
      screenShake: false,
      hitPause: false,
    };

    let completed = false;
    presenter.playAttack(
      context,
      definition,
      { durationScale: 1.0, reducedMotion: false },
      () => {},
      () => { completed = true; }
    );

    presenter.skip();
    expect(completed).toBe(true);
    expect(scene.cameras.main.resetFX).toHaveBeenCalled();
  });

  it('respects reducedMotion by suppressing camera shake and intense tweens', () => {
    const context: AttackContext = {
      moveFrom: 'g1',
      moveTo: 'f3',
      attackerCharacterId: 'fire_dragon',
      defenderCharacterId: 'rival_generic',
      attackDefinitionId: 'fire_stream_attack',
      isPromotion: false,
    };
    const definition: AttackDefinition = {
      id: 'fire_stream_attack',
      displayName: 'Fire Stream Attack',
      description: 'Test Fire Stream',
      totalDuration: 2600,
      anticipationDuration: 800,
      strikeDuration: 800,
      impactTime: 1600,
      recoveryDuration: 1000,
      soundCueIds: [],
      effectIds: [],
      screenShake: true,
      hitPause: false,
    };

    presenter.playAttack(
      context,
      definition,
      { durationScale: 1.0, reducedMotion: true },
      () => {},
      () => {}
    );

    vi.advanceTimersByTime(1600);
    expect(scene.cameras.main.shake).not.toHaveBeenCalled();
  });
});
