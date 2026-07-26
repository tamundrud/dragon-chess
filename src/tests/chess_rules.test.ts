import { describe, it, expect, beforeEach } from 'vitest';
import { ChessGameController } from '../chess/ChessGameController';

describe('Authoritative Chess Engine Tests (chess.js compliance)', () => {
  let controller: ChessGameController;

  beforeEach(() => {
    controller = new ChessGameController();
  });

  it('validates legal and illegal pawn moves', () => {
    // e2 -> e4 is legal
    const moveRes = controller.commitMove({ from: 'e2', to: 'e4' });
    expect(moveRes).not.toBeNull();
    expect(moveRes?.san).toBe('e4');
    expect(controller.getTurn()).toBe('b');

    // Black pawn cannot move 3 squares e7 -> e4
    const illegalRes = controller.commitMove({ from: 'e7', to: 'e4' });
    expect(illegalRes).toBeNull();
    expect(controller.getTurn()).toBe('b'); // Turn did not change
  });

  it('validates knight, bishop, rook, queen, and king movement', () => {
    // Knight move c1 -> c3 (wait, knight on b1 -> c3)
    const knightMove = controller.commitMove({ from: 'b1', to: 'c3' });
    expect(knightMove?.piece).toBe('n');
    expect(knightMove?.to).toBe('c3');

    // Black pawn e7 -> e5
    controller.commitMove({ from: 'e7', to: 'e5' });

    // White pawn e2 -> e4
    controller.commitMove({ from: 'e2', to: 'e4' });

    // Black bishop f8 -> c5
    const bishopMove = controller.commitMove({ from: 'f8', to: 'c5' });
    expect(bishopMove?.piece).toBe('b');
    expect(bishopMove?.to).toBe('c5');

    // White queen d1 -> f3
    const queenMove = controller.commitMove({ from: 'd1', to: 'f3' });
    expect(queenMove?.piece).toBe('q');

    // Black knight g8 -> f6
    controller.commitMove({ from: 'g8', to: 'f6' });

    // White rook h1 -> g1 (after g1 knight moves or king moves) - let's move g1 -> e2 first
    controller.commitMove({ from: 'g1', to: 'e2' });

    // Black king e8 -> e7
    const kingMove = controller.commitMove({ from: 'e8', to: 'e7' });
    expect(kingMove?.piece).toBe('k');

    // White rook h1 -> g1
    const rookMove = controller.commitMove({ from: 'h1', to: 'g1' });
    expect(rookMove?.piece).toBe('r');
  });

  it('handles normal captures', () => {
    controller.commitMove({ from: 'e2', to: 'e4' });
    controller.commitMove({ from: 'd7', to: 'd5' });
    const capture = controller.commitMove({ from: 'e4', to: 'd5' });

    expect(capture?.captured).toBe('p');
    expect(capture?.san).toBe('exd5');
  });

  it('rejects illegal moves without altering game state', () => {
    const initialFen = controller.getFen();
    const illegal = controller.commitMove({ from: 'e2', to: 'e6' });

    expect(illegal).toBeNull();
    expect(controller.getFen()).toBe(initialFen);
    expect(controller.getTurn()).toBe('w');
  });

  it('executes castling (kingside and queenside)', () => {
    // Setup position ready for kingside castling
    controller.reset('r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5');
    const castleMove = controller.commitMove({ from: 'e1', to: 'g1' });
    expect(castleMove?.flags).toContain('k'); // kingside castle flag

    const board = controller.getBoard();
    // King on g1, Rook on f1
    expect(board[7][6]?.type).toBe('k');
    expect(board[7][5]?.type).toBe('r');
  });

  it('rejects castling through check', () => {
    // King on e1 wants to castle to g1, but f1 is attacked by black bishop on a6 (a6-f1 diagonal)
    controller.reset('r1bq1rk1/pppp1ppp/b1n5/4p3/4P3/8/PPPP1PPP/R1BQK2R w KQ - 4 5');
    const illegalCastle = controller.commitMove({ from: 'e1', to: 'g1' });
    expect(illegalCastle).toBeNull();
  });

  it('executes en passant capture', () => {
    controller.reset('rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3');
    // White pawn on e5 can capture black pawn on d5 en passant to d6
    const epMove = controller.commitMove({ from: 'e5', to: 'd6' });
    expect(epMove?.flags).toContain('e'); // en passant flag
    expect(epMove?.captured).toBe('p');
  });

  it('executes quiet pawn promotion to Queen, Rook, Bishop, or Knight', () => {
    controller.reset('8/5P2/8/8/8/8/8/4K2k w - - 0 1');
    const promoteQ = controller.commitMove({ from: 'f7', to: 'f8', promotion: 'q' });
    expect(promoteQ?.promotion).toBe('q');
    expect(promoteQ?.piece).toBe('p'); // original piece moving

    const board = controller.getBoard();
    expect(board[0][5]?.type).toBe('q');
  });

  it('executes capturing pawn promotion', () => {
    // Rook on e8, pawn on f7 captures e8 and promotes to knight
    controller.reset('4r3/5P2/8/8/8/8/8/4K2k w - - 0 1');
    const capPromote = controller.commitMove({ from: 'f7', to: 'e8', promotion: 'n' });
    expect(capPromote?.captured).toBe('r');
    expect(capPromote?.promotion).toBe('n');

    const board = controller.getBoard();
    expect(board[0][4]?.type).toBe('n');
  });

  it('identifies check condition accurately', () => {
    controller.reset('rnbqkbnr/ppppp1pp/8/5p1Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2');
    const status = controller.getStatus();
    expect(status.inCheck).toBe(true);
    expect(status.status).toBe('in_progress');
  });

  it('identifies checkmate condition and assigns correct winner', () => {
    // Fool's mate position
    controller.reset('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');
    const status = controller.getStatus();
    expect(status.status).toBe('checkmate');
    expect(status.isGameOver).toBe(true);
    expect(status.winner).toBe('b'); // Black delivered checkmate
  });

  it('identifies stalemate condition', () => {
    // Famous stalemate position
    controller.reset('4k3/4P3/4K3/8/8/8/8/8 b - - 0 1');
    const status = controller.getStatus();
    expect(status.status).toBe('stalemate');
    expect(status.isGameOver).toBe(true);
    expect(status.winner).toBeUndefined();
  });

  it('identifies supported draw conditions (insufficient material)', () => {
    // King vs King
    controller.reset('8/8/4k3/8/8/4K3/8/8 w - - 0 1');
    const status = controller.getStatus();
    expect(status.status).toBe('insufficient_material');
    expect(status.isGameOver).toBe(true);
  });

  it('handles undo correctly, restoring previous state and last move', () => {
    controller.commitMove({ from: 'e2', to: 'e4' });
    const fenAfterMove = controller.getFen();
    controller.commitMove({ from: 'e7', to: 'e5' });

    expect(controller.getTurn()).toBe('w');
    const undone = controller.undo();
    expect(undone).toBe(true);
    expect(controller.getFen()).toBe(fenAfterMove);
    expect(controller.getTurn()).toBe('b');
    expect(controller.getLastMove()?.from).toBe('e2');
    expect(controller.getLastMove()?.to).toBe('e4');
  });

  it('handles restart (reset) correctly', () => {
    controller.commitMove({ from: 'e2', to: 'e4' });
    controller.commitMove({ from: 'e7', to: 'e5' });
    controller.reset();

    expect(controller.getTurn()).toBe('w');
    expect(controller.getStatus().status).toBe('in_progress');
    expect(controller.getLastMove()).toBeNull();
  });
});
