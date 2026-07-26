export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface ChessPiece {
  color: PieceColor;
  type: PieceType;
}

export interface ChessMoveRequest {
  from: string;
  to: string;
  promotion?: PieceType;
}

export interface ChessMoveResult {
  from: string;
  to: string;
  color: PieceColor;
  piece: PieceType;
  captured?: PieceType;
  promotion?: PieceType;
  san: string;
  flags: string;
}

export type GameStatusType = 'in_progress' | 'checkmate' | 'stalemate' | 'draw' | 'threefold_repetition' | 'insufficient_material';

export interface GameStatus {
  status: GameStatusType;
  turn: PieceColor;
  inCheck: boolean;
  isGameOver: boolean;
  winner?: PieceColor;
  fen: string;
}

export type ChessStateListener = (status: GameStatus, board: (ChessPiece | null)[][], lastMove: { from: string; to: string } | null) => void;
