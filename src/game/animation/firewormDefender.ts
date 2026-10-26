import type { AttackContext } from './attackTypes';
import type { PieceColor, PieceType } from '../../chess/chessTypes';
import { CharacterRegistry } from '../characters/CharacterRegistry';

const CLASS_NAMES: Record<PieceType, string> = { p:'PAWN', r:'ROOK', n:'KNIGHT', b:'BISHOP', q:'QUEEN', k:'KING' };

export function resolveFirewormDefender(context: AttackContext): {
  type: PieceType; color: PieceColor; label: string; texture?: string; frame?: string; facing?: -1 | 1;
} {
  const character = CharacterRegistry.getInstance().getById(context.defenderCharacterId);
  const type = context.defenderPieceType ?? character?.pieceType ?? 'p';
  const color = context.defenderColor ?? (character?.faction === 'light' ? 'w' : 'b');
  const matches = character?.pieceType === type && character.faction === (color === 'w' ? 'light' : 'dark');
  if (context.defenderCharacterId === 'flamehuffer' && type === 'r' && color === 'b') {
    return { type, color, label:'FLAMEHUFFER · ROOK', texture:'flamehuffer', facing:-1 };
  }
  if (context.defenderCharacterId === 'rival_generic' && type === 'p' && color === 'b') {
    return { type, color, label:'MEATHEAD RAIDER · PAWN', texture:'fireworm-raider', frame:'defender', facing:1 };
  }
  const name = matches && !context.defenderCharacterId.includes('generic') ? character!.displayName.toUpperCase()
    : color === 'b' ? 'MEATHEAD' : 'HOOLIGAN';
  return { type, color, label:`${name} · ${CLASS_NAMES[type]}\nART PLACEHOLDER` };
}

export function defenderFlipX(sourceFacing: -1 | 1, attackerX: number, defenderX: number): boolean {
  return sourceFacing !== (Math.sign(attackerX - defenderX) || sourceFacing);
}
