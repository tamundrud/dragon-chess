import { PieceType } from '../../chess/chessTypes';

export type Faction = 'light' | 'dark';
export type ArtStatus = 'temporary' | 'final';

export interface CharacterDefinition {
  id: string;
  displayName: string;
  faction: Faction;
  pieceType: PieceType;
  boardTokenAsset: string;
  attackStageAsset: string;
  defaultAttackId: string;
  artStatus: ArtStatus;
  personalityTags: string[];
}
