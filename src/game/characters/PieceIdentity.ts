import type { ChessMoveResult, ChessPiece } from '../../chess/chessTypes';
import { CharacterRegistry } from './CharacterRegistry';

/** Presentation metadata only: consumes authoritative moves, never decides legality. */
export class PieceIdentity {
  private squares = new Map<string, string>();
  private history: Map<string, string>[] = [];

  reset(board: (ChessPiece | null)[][]): void {
    this.squares.clear();
    this.history = [];
    const registry = CharacterRegistry.getInstance();
    board.forEach((rank, row) => rank.forEach((piece, col) => {
      if (!piece) return;
      const square = `${String.fromCharCode(97 + col)}${8 - row}`;
      this.squares.set(square, registry.getByPiece(piece.color, piece.type, square).id);
    }));
  }

  get(square: string): string | undefined { return this.squares.get(square); }

  commit(move: ChessMoveResult): void {
    this.history.push(new Map(this.squares));
    const id = this.squares.get(move.from);
    this.squares.delete(move.from);
    this.squares.delete(move.to);
    if (move.flags.includes('e')) this.squares.delete(`${move.to[0]}${move.from[1]}`);
    const promoted = move.promotion
      ? CharacterRegistry.getInstance().getByPiece(move.color, move.promotion).id : id;
    if (promoted) this.squares.set(move.to, promoted);
    // Castling flags come from chess.js; these are only the rook's art locations.
    if (move.flags.includes('k') || move.flags.includes('q')) {
      const rank = move.from[1];
      const from = `${move.flags.includes('k') ? 'h' : 'a'}${rank}`;
      const to = `${move.flags.includes('k') ? 'f' : 'd'}${rank}`;
      const rook = this.squares.get(from);
      this.squares.delete(from);
      if (rook) this.squares.set(to, rook);
    }
  }

  undo(): void {
    const previous = this.history.pop();
    if (previous) this.squares = previous;
  }
}
