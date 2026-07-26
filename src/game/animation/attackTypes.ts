export type AttackLifecycleState =
  | 'idle'
  | 'preparing'
  | 'attacking'
  | 'impact'
  | 'recovering'
  | 'completing';

export interface AttackDefinition {
  id: string;
  displayName: string;
  description: string;
  totalDuration: number; // in ms
  anticipationDuration: number;
  strikeDuration: number;
  impactTime: number;
  recoveryDuration: number;
  screenShake: boolean;
  hitPause: boolean;
  soundCueIds: string[];
  effectIds: string[];
}

export interface AttackContext {
  moveFrom: string;
  moveTo: string;
  attackerCharacterId: string;
  defenderCharacterId: string;
  attackDefinitionId: string;
  isPromotion?: boolean;
}

export interface AttackPresenter {
  playAttack(
    context: AttackContext,
    definition: AttackDefinition,
    settings: { durationScale: number; reducedMotion: boolean },
    onPhaseChange: (phase: AttackLifecycleState) => void,
    onComplete: () => void
  ): void;
  skip(): void;
  cleanup(): void;
}
