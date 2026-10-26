import { describe, expect, it } from 'vitest';
import { ChessGameController } from '../chess/ChessGameController';

// Identity is presentation state. Every move below is validated by chess.js.
describe('named rook presentation identity', () => {
  it('follows Fireworm through quiet moves, capture, undo and restart without changing Hookfang', () => {
    const game = new ChessGameController();
    expect(game.getCharacterId('a1')).toBe('fireworm');
    expect(game.getCharacterId('h1')).toBe('hookfang');
    for (const [from, to] of [['a2','a4'], ['b7','b5'], ['a1','a3'], ['b5','b4']]) {
      expect(game.commitMove({ from, to })).not.toBeNull();
    }
    expect(game.getCharacterId('a3')).toBe('fireworm');
    expect(game.getCharacterId('a1')).toBeUndefined();
    const before = game.getFen();
    expect(game.prepareMove({ from: 'a3', to: 'b3' })).not.toBeNull();
    expect(game.getCharacterId('a3')).toBe('fireworm');
    expect(game.getFen()).toBe(before);
    game.commitMove({ from: 'a3', to: 'b3' });
    game.commitMove({ from: 'h7', to: 'h6' });
    const victim = game.getCharacterId('b4');
    expect(game.commitMove({ from: 'b3', to: 'b4' })?.captured).toBe('p');
    expect(game.getCharacterId('b4')).toBe('fireworm');
    expect(game.getCharacterId('h1')).toBe('hookfang');
    game.undo();
    expect(game.getCharacterId('b3')).toBe('fireworm');
    expect(game.getCharacterId('b4')).toBe(victim);
    game.reset();
    expect(game.getCharacterId('a1')).toBe('fireworm');
    expect(game.getCharacterId('h1')).toBe('hookfang');
  });

  it.each([['e1','g1','h1','f1','hookfang'], ['e1','c1','a1','d1','fireworm']])('tracks castling %s to %s and Undo', (from,to,rookFrom,rookTo,id) => {
    const game = new ChessGameController('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    expect(game.commitMove({ from, to })).not.toBeNull();
    expect(game.getCharacterId(rookTo)).toBe(id);
    expect(game.getCharacterId(rookFrom)).toBeUndefined();
    game.undo();
    expect(game.getCharacterId(rookFrom)).toBe(id);
  });

  it('removes captured identities, restores them on Undo, and isolates games', () => {
    const game = new ChessGameController('r3k3/8/8/8/8/8/8/R3K2R b KQ - 0 1');
    const other = new ChessGameController();
    game.commitMove({ from: 'a8', to: 'a1' });
    expect(game.getCharacterId('a1')).not.toBe('fireworm');
    expect(other.getCharacterId('a1')).toBe('fireworm');
    game.undo();
    expect(game.getCharacterId('a1')).toBe('fireworm');
  });

  it.each(['q','r','b','n'] as const)('uses deterministic same-class art for promotion to %s and restores pawn on Undo', promotion => {
    const game = new ChessGameController('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
    const pawn = game.getCharacterId('a7');
    expect(game.commitMove({ from:'a7', to:'a8', promotion })?.promotion).toBe(promotion);
    const promoted = game.getCharacterId('a8');
    expect(promoted).not.toBe(pawn);
    if (promotion === 'r') expect(promoted).toBe('fireworm');
    game.undo();
    expect(game.getCharacterId('a7')).toBe(pawn);
  });
});
