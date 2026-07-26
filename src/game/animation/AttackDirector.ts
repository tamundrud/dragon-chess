import { ChessMoveResult } from '../../chess/chessTypes';
import { SettingsStore } from '../../settings/SettingsStore';
import { AudioController } from '../audio/AudioController';
import { CharacterRegistry } from '../characters/CharacterRegistry';
import { AttackContext, AttackDefinition, AttackLifecycleState, AttackPresenter } from './attackTypes';
import { AttackRegistry } from './AttackRegistry';

export type AttackLifecycleListener = (state: AttackLifecycleState, context: AttackContext | null) => void;
export type AttackCompletionCallback = () => void;

export class AttackDirector {
  private static instance: AttackDirector;
  private state: AttackLifecycleState = 'idle';
  private currentContext: AttackContext | null = null;
  private currentDefinition: AttackDefinition | null = null;
  private listeners: Set<AttackLifecycleListener> = new Set();
  private timerIds: Set<number | NodeJS.Timeout> = new Set();
  private onCompleteCallback: AttackCompletionCallback | null = null;
  private presenter: AttackPresenter | null = null;

  private constructor() {}

  public static getInstance(): AttackDirector {
    if (!AttackDirector.instance) {
      AttackDirector.instance = new AttackDirector();
    }
    return AttackDirector.instance;
  }

  public registerPresenter(presenter: AttackPresenter): void {
    this.presenter = presenter;
  }

  public unregisterPresenter(presenter: AttackPresenter): void {
    if (this.presenter === presenter) {
      this.presenter = null;
    }
  }

  public getState(): AttackLifecycleState {
    return this.state;
  }

  public getCurrentContext(): AttackContext | null {
    return this.currentContext;
  }

  public getCurrentDefinition(): AttackDefinition | null {
    return this.currentDefinition;
  }

  /**
   * Starts an attack sequence for a capture or special move.
   * Prevents overlapping concurrent attacks.
   */
  public startAttack(move: ChessMoveResult, onComplete: AttackCompletionCallback): boolean {
    if (this.state !== 'idle') {
      console.warn('Concurrent attack requested while director is not idle. Rejecting.');
      return false;
    }

    const settings = SettingsStore.getInstance().get();
    const characterReg = CharacterRegistry.getInstance();
    const attackReg = AttackRegistry.getInstance();

    const attackerChar = characterReg.getByPiece(move.color, move.piece, move.from);
    const defenderColor = move.color === 'w' ? 'b' : 'w';
    const defenderChar = move.captured ? characterReg.getByPiece(defenderColor, move.captured, move.to) : characterReg.getByPiece(defenderColor, 'p', move.to);
    
    const attackDef = attackReg.getById(attackerChar.defaultAttackId) || attackReg.getById('generic_strike')!;

    this.currentContext = {
      moveFrom: move.from,
      moveTo: move.to,
      attackerCharacterId: attackerChar.id,
      defenderCharacterId: defenderChar.id,
      attackDefinitionId: attackDef.id,
      isPromotion: !!move.promotion,
    };
    this.currentDefinition = attackDef;
    this.onCompleteCallback = onComplete;

    // Handle Instant mode or disabled animation immediately
    if (!settings.animationEnabled || settings.animationMode === 'instant') {
      this.completeImmediately();
      return true;
    }

    // Begin lifecycle
    this.transitionTo('preparing');

    const durationScale = settings.animationMode === 'fast' ? 0.35 : 1.0;
    const reducedMotion = settings.reducedMotion;

    // If an AttackPresenter (like AttackScene) is registered, delegate timeline and animation timing to it.
    if (this.presenter) {
      this.presenter.playAttack(
        this.currentContext,
        attackDef,
        { durationScale, reducedMotion },
        (phase: AttackLifecycleState) => {
          this.transitionTo(phase);
        },
        () => {
          this.transitionTo('completing');
          this.finishCleanup();
        }
      );
      return true;
    }

    // Fallback timer schedule for headless testing when no presenter is registered
    const audio = AudioController.getInstance();
    if (attackDef.soundCueIds && attackDef.soundCueIds.length > 0) {
      audio.playSound(attackDef.soundCueIds[0]);
    }

    const prepDuration = Math.max(100, Math.floor(attackDef.anticipationDuration * durationScale));
    const strikeDuration = Math.max(100, Math.floor(attackDef.strikeDuration * durationScale));
    const recoveryDuration = Math.max(100, Math.floor(attackDef.recoveryDuration * (reducedMotion ? 0.5 : durationScale)));

    this.scheduleTimeout(() => {
      if (this.state === 'preparing') {
        this.transitionTo('attacking');
        if (attackDef.soundCueIds[1]) audio.playSound(attackDef.soundCueIds[1]);
      }
    }, prepDuration);

    this.scheduleTimeout(() => {
      if (this.state === 'attacking') {
        this.transitionTo('impact');
        if (attackDef.soundCueIds[2]) audio.playSound(attackDef.soundCueIds[2]);
      }
    }, prepDuration + strikeDuration);

    this.scheduleTimeout(() => {
      if (this.state === 'impact') {
        this.transitionTo('recovering');
      }
    }, prepDuration + strikeDuration + Math.min(400, Math.floor(attackDef.impactTime * durationScale * 0.4)));

    this.scheduleTimeout(() => {
      if (this.state === 'recovering') {
        this.transitionTo('completing');
        this.finishCleanup();
      }
    }, prepDuration + strikeDuration + recoveryDuration + 200);

    return true;
  }

  /**
   * Skips the currently running attack, cleaning up timelines and advancing immediately to completion.
   */
  public skip(): void {
    if (this.state === 'idle') {
      return;
    }
    this.clearScheduledTimeouts();
    AudioController.getInstance().stopAll();
    if (this.presenter) {
      try {
        this.presenter.skip();
        return;
      } catch (e) {
        console.warn('Presenter skip failed, falling back to direct cleanup:', e);
      }
    }
    this.transitionTo('completing');
    this.finishCleanup();
  }

  private completeImmediately(): void {
    this.state = 'completing';
    this.notifyListeners();
    this.finishCleanup();
  }

  private finishCleanup(): void {
    this.clearScheduledTimeouts();
    const callback = this.onCompleteCallback;
    this.onCompleteCallback = null;
    this.currentContext = null;
    this.currentDefinition = null;
    this.state = 'idle';
    this.notifyListeners();
    if (callback) {
      callback();
    }
  }

  private transitionTo(newState: AttackLifecycleState): void {
    this.state = newState;
    this.notifyListeners();
  }

  private scheduleTimeout(fn: () => void, ms: number): void {
    const id = setTimeout(() => {
      this.timerIds.delete(id);
      fn();
    }, ms);
    this.timerIds.add(id);
  }

  private clearScheduledTimeouts(): void {
    this.timerIds.forEach((id) => clearTimeout(id));
    this.timerIds.clear();
  }

  public subscribe(listener: AttackLifecycleListener): () => void {
    this.listeners.add(listener);
    listener(this.state, this.currentContext);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state, this.currentContext));
  }
}
