import { ChessMoveRequest } from '../../chess/chessTypes';

export type MoveRequestListener = (request: ChessMoveRequest) => void;
export type SelectionListener = (square: string | null) => void;
export type SkipRequestListener = () => void;

export class InputController {
  private selectedSquare: string | null = null;
  private inputLocked: boolean = false;
  private moveListeners: Set<MoveRequestListener> = new Set();
  private selectionListeners: Set<SelectionListener> = new Set();
  private skipListeners: Set<SkipRequestListener> = new Set();

  constructor() {}

  public isLocked(): boolean {
    return this.inputLocked;
  }

  public setLocked(locked: boolean): void {
    this.inputLocked = locked;
    if (locked && this.selectedSquare) {
      this.clearSelection();
    }
  }

  public getSelectedSquare(): string | null {
    return this.selectedSquare;
  }

  public clearSelection(): void {
    if (this.selectedSquare !== null) {
      this.selectedSquare = null;
      this.notifySelectionListeners();
    }
  }

  /**
   * Called by board scene or touch handler when a square is clicked/tapped.
   */
  public handleSquareSelect(square: string): void {
    if (this.inputLocked) {
      return;
    }

    if (!this.selectedSquare) {
      // First square click selects the piece
      this.selectedSquare = square;
      this.notifySelectionListeners();
    } else if (this.selectedSquare === square) {
      // Clicking same square deselects
      this.clearSelection();
    } else {
      // Second square click requests a move
      const from = this.selectedSquare;
      this.clearSelection();
      this.notifyMoveListeners({ from, to: square });
    }
  }

  /**
   * Called when the user clicks the "Skip" button during an attack.
   */
  public requestSkip(): void {
    this.skipListeners.forEach((listener) => listener());
  }

  public onMoveRequest(listener: MoveRequestListener): () => void {
    this.moveListeners.add(listener);
    return () => {
      this.moveListeners.delete(listener);
    };
  }

  public onSelectionChange(listener: SelectionListener): () => void {
    this.selectionListeners.add(listener);
    return () => {
      this.selectionListeners.delete(listener);
    };
  }

  public onSkipRequest(listener: SkipRequestListener): () => void {
    this.skipListeners.add(listener);
    return () => {
      this.skipListeners.delete(listener);
    };
  }

  private notifySelectionListeners(): void {
    this.selectionListeners.forEach((listener) => listener(this.selectedSquare));
  }

  private notifyMoveListeners(request: ChessMoveRequest): void {
    this.moveListeners.forEach((listener) => listener(request));
  }
}
