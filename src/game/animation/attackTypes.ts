import type { PieceColor, PieceType } from '../../chess/chessTypes';
import type { AttackPresentation } from '../../settings/settingsTypes';

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
  defenderPieceType?: PieceType;
  defenderColor?: PieceColor;
}

export interface AttackPlaybackSettings {
  durationScale: number;
  reducedMotion: boolean;
  presentation?: AttackPresentation;
  origins?: () => { attacker: { x: number; y: number }; defender: { x: number; y: number }; destination: { x: number; y: number } };
}

export interface AttackPresenter {
  playAttack(
    context: AttackContext,
    definition: AttackDefinition,
    settings: AttackPlaybackSettings,
    onPhaseChange: (phase: AttackLifecycleState) => void,
    onComplete: () => void
  ): void;
  skip(): void;
  cleanup(): void;
}
