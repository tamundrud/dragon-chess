import { PieceColor, PieceType } from '../../chess/chessTypes';
import { CharacterDefinition } from './characterTypes';

export class CharacterRegistry {
  private static instance: CharacterRegistry;
  private characters: Map<string, CharacterDefinition> = new Map();
  private squareAssignments: Map<string, string> = new Map([
    ['g1', 'fire_dragon'], // Assigned to one light-side knight
  ]);
  private pieceTypeAssignments: Map<string, string> = new Map([
    ['w_n', 'fire_dragon'],
    ['w_k', 'stoick'],
    ['w_q', 'valhallarama'],
    ['w_p', 'viking_warrior'],
    ['w_r', 'light_generic'],
    ['w_b', 'light_generic'],
    ['b_p', 'rival_generic'],
  ]);

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): CharacterRegistry {
    if (!CharacterRegistry.instance) {
      CharacterRegistry.instance = new CharacterRegistry();
    }
    return CharacterRegistry.instance;
  }

  private registerDefaults(): void {
    // Light Faction (Berk)
    this.register({
      id: 'stoick',
      displayName: 'Stoick the Vast',
      faction: 'light',
      pieceType: 'k',
      boardTokenAsset: 'token_stoick_temp',
      attackStageAsset: 'stage_stoick_temp',
      defaultAttackId: 'axe_smash',
      artStatus: 'temporary',
      personalityTags: ['immensely_strong', 'confident', 'protective', 'heroic'],
    });

    this.register({
      id: 'valhallarama',
      displayName: 'Valhallarama',
      faction: 'light',
      pieceType: 'q',
      boardTokenAsset: 'token_valhallarama_temp',
      attackStageAsset: 'stage_valhallarama_temp',
      defaultAttackId: 'decisive_arc',
      artStatus: 'temporary',
      personalityTags: ['direct', 'heroic', 'controlled', 'efficient'],
    });

    this.register({
      id: 'fire_dragon',
      displayName: 'Fire Dragon',
      faction: 'light',
      pieceType: 'n',
      boardTokenAsset: 'token_fire_dragon',
      attackStageAsset: 'stage_fire_dragon',
      defaultAttackId: 'fire_stream_attack',
      artStatus: 'final', // Vertical slice target
      personalityTags: ['powerful', 'expressive', 'mischievous', 'proud_of_fire'],
    });

    this.register({
      id: 'viking_warrior',
      displayName: 'Viking Warrior',
      faction: 'light',
      pieceType: 'p',
      boardTokenAsset: 'token_viking_pawn_temp',
      attackStageAsset: 'stage_viking_pawn_temp',
      defaultAttackId: 'shield_bash',
      artStatus: 'temporary',
      personalityTags: ['brave', 'determined', 'smaller_scale'],
    });

    this.register({
      id: 'light_generic',
      displayName: 'Berk Defender',
      faction: 'light',
      pieceType: 'r',
      boardTokenAsset: 'token_light_generic_temp',
      attackStageAsset: 'stage_light_generic_temp',
      defaultAttackId: 'generic_strike',
      artStatus: 'temporary',
      personalityTags: ['heroic'],
    });

    // Dark Faction (Rival Clan)
    this.register({
      id: 'rival_generic',
      displayName: 'Rival Raider',
      faction: 'dark',
      pieceType: 'p',
      boardTokenAsset: 'token_rival_generic_temp',
      attackStageAsset: 'stage_rival_generic_temp',
      defaultAttackId: 'rival_strike',
      artStatus: 'temporary',
      personalityTags: ['contrasting', 'aggressive'],
    });
  }

  public register(definition: CharacterDefinition): void {
    this.characters.set(definition.id, definition);
  }

  public assignToSquare(square: string, characterId: string): void {
    this.squareAssignments.set(square, characterId);
  }

  public assignToPieceType(color: PieceColor, type: PieceType, characterId: string): void {
    this.pieceTypeAssignments.set(`${color}_${type}`, characterId);
  }

  public getById(id: string): CharacterDefinition | undefined {
    return this.characters.get(id);
  }

  public getByPiece(color: PieceColor, type: PieceType, square?: string): CharacterDefinition {
    if (square && this.squareAssignments.has(square)) {
      const charId = this.squareAssignments.get(square)!;
      const char = this.characters.get(charId);
      if (char) return char;
    }
    const key = `${color}_${type}`;
    if (this.pieceTypeAssignments.has(key)) {
      const charId = this.pieceTypeAssignments.get(key)!;
      const char = this.characters.get(charId);
      if (char) return char;
    }
    const faction = color === 'w' ? 'light' : 'dark';
    if (faction === 'dark') {
      return this.characters.get('rival_generic')!;
    }
    switch (type) {
      case 'k': return this.characters.get('stoick')!;
      case 'q': return this.characters.get('valhallarama')!;
      case 'n': return this.characters.get('fire_dragon')!;
      case 'p': return this.characters.get('viking_warrior')!;
      default: return this.characters.get('light_generic')!;
    }
  }

  public getAll(): CharacterDefinition[] {
    return Array.from(this.characters.values());
  }
}
