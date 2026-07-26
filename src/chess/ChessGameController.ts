import { Chess, Move, Square } from 'chess.js';
import { ChessMoveRequest, ChessMoveResult, ChessPiece, ChessStateListener, GameStatus, PieceColor, PieceType } from './chessTypes';

export class ChessGameController {
  private chess: Chess;
  private listeners: Set<ChessStateListener> = new Set();
  private inputLocked: boolean = false;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  public reset(fen?: string): void {
    this.chess = new Chess(fen);
    this.inputLocked = false;
    this.notifyListeners();
  }

  public isInputLocked(): boolean {
    return this.inputLocked;
  }

  public setInputLocked(locked: boolean): void {
    this.inputLocked = locked;
  }

  public getTurn(): PieceColor {
    return this.chess.turn() as PieceColor;
  }

  public getFen(): string {
    return this.chess.fen();
  }

  public getBoard(): (ChessPiece | null)[][] {
    return this.chess.board() as (ChessPiece | null)[][];
  }

  public getPieceAt(square: string): ChessPiece | null {
    try {
      return (this.chess.get(square as Square) as ChessPiece) || null;
    } catch {
      return null;
    }
  }

  public getLegalMoves(square?: string): ChessMoveResult[] {
    const options = square ? { square: square as Square, verbose: true } : { verbose: true };
    const moves = this.chess.moves(options) as Move[];
    return moves.map(this.formatMove);
  }

  public validateMove(request: ChessMoveRequest): ChessMoveResult | null {
    if (this.inputLocked) {
      return null;
    }
    const legalMoves = this.getLegalMoves(request.from);
    return legalMoves.find((m) => m.to === request.to && (!request.promotion || m.promotion === request.promotion)) || null;
  }

  /**
   * Prepares a move without applying it to the board, returning capture/promotion details.
   */
  public prepareMove(request: ChessMoveRequest): ChessMoveResult | null {
    return this.validateMove(request);
  }

  /**
   * Authoritative final state application. Applies the move exactly once.
   */
  public commitMove(request: ChessMoveRequest): ChessMoveResult | null {
    if (this.inputLocked) {
      console.warn('Cannot commit move while input is locked.');
      return null;
    }
    try {
      const move = this.chess.move({
        from: request.from,
        to: request.to,
        promotion: request.promotion || 'q',
      });
      if (move) {
        const result = this.formatMove(move);
        this.notifyListeners();
        return result;
      }
    } catch (e) {
      console.warn('Invalid chess move attempted:', e);
    }
    return null;
  }

  public undo(): boolean {
    if (this.inputLocked) {
      return false;
    }
    const undone = this.chess.undo();
    if (undone) {
      this.notifyListeners();
      return true;
    }
    return false;
  }

  public getStatus(): GameStatus {
    let status: GameStatus['status'] = 'in_progress';
    let winner: PieceColor | undefined = undefined;

    if (this.chess.isCheckmate()) {
      status = 'checkmate';
      // If turn is white, black just delivered checkmate, so black wins
      winner = this.chess.turn() === 'w' ? 'b' : 'w';
    } else if (this.chess.isStalemate()) {
      status = 'stalemate';
    } else if (this.chess.isThreefoldRepetition()) {
      status = 'threefold_repetition';
    } else if (this.chess.isInsufficientMaterial()) {
      status = 'insufficient_material';
    } else if (this.chess.isDraw()) {
      status = 'draw';
    }

    return {
      status,
      turn: this.getTurn(),
      inCheck: this.chess.inCheck(),
      isGameOver: this.chess.isGameOver(),
      winner,
      fen: this.getFen(),
    };
  }

  public getLastMove(): { from: string; to: string } | null {
    const history = this.chess.history({ verbose: true });
    if (history.length === 0) return null;
    const last = history[history.length - 1];
    return { from: last.from, to: last.to };
  }

  public subscribe(listener: ChessStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus(), this.getBoard(), this.getLastMove());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const status = this.getStatus();
    const board = this.getBoard();
    const lastMove = this.getLastMove();
    this.listeners.forEach((listener) => listener(status, board, lastMove));
  }

  private formatMove = (m: Move): ChessMoveResult => ({
    from: m.from,
    to: m.to,
    color: m.color as PieceColor,
    piece: m.piece as PieceType,
    captured: m.captured as PieceType | undefined,
    promotion: m.promotion as PieceType | undefined,
    san: m.san,
    flags: m.flags,
  });
}
