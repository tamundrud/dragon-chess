import { ChessGameController } from '../../chess/ChessGameController';
import type { AttackContext } from '../animation/attackTypes';

export type ProofDefender = 'rook' | 'pawn';

export function createFirewormProofFixture(target: ProofDefender) {
  const controller = new ChessGameController();
  const moves = target === 'rook'
    ? [['a2','a4'],['a7','a5'],['a1','a3'],['a8','a6'],['a3','b3'],['a6','b6']]
    : [['a2','a4'],['b7','b5'],['a1','a3'],['b5','b4'],['a3','b3'],['h7','h6']];
  for (const [from,to] of moves) {
    if (!controller.commitMove({from,to})) throw new Error('Invalid Fireworm proof fixture');
  }
  const request = {from:'b3',to:target === 'rook' ? 'b6' : 'b4'};
  const move = controller.prepareMove(request);
  if (!move?.captured) throw new Error('Fireworm proof must prepare a legal capture');
  const context: AttackContext = {
    moveFrom:move.from, moveTo:move.to, attackerCharacterId:controller.getCharacterId(move.from)!,
    defenderCharacterId:controller.getCharacterId(move.to)!, defenderPieceType:move.captured,
    defenderColor:move.color === 'w' ? 'b' : 'w', attackDefinitionId:'fireworm_fireworks',
  };
  return {controller,request,context};
}
