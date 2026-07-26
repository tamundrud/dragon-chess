import Phaser from 'phaser';
import { ChessPiece, GameStatus } from '../../chess/chessTypes';
import { CharacterRegistry } from '../characters/CharacterRegistry';
import { InputController } from '../input/InputController';

export class BoardScene extends Phaser.Scene {
  private boardGraphics!: Phaser.GameObjects.Graphics;
  private highlightGraphics!: Phaser.GameObjects.Graphics;
  private pieceContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private squareSize: number = 64;
  private boardOffsetX: number = 0;
  private boardOffsetY: number = 0;
  private currentBoard: (ChessPiece | null)[][] = [];
  private selectedSquare: string | null = null;
  private legalTargets: string[] = [];
  private lastMove: { from: string; to: string } | null = null;
  private gameStatus?: GameStatus;
  private inputController!: InputController;

  constructor() {
    super({ key: 'BoardScene' });
  }

  create(): void {
    this.boardGraphics = this.add.graphics();
    this.highlightGraphics = this.add.graphics();
    this.inputController = new InputController();

    this.calculateBoardDimensions();
    this.drawBoard();
    this.setupInputHandling();

    this.scale.on('resize', this.handleResize, this);
  }

  private calculateBoardDimensions(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const maxBoardSize = Math.min(width * 0.94, height * 0.94, 640);
    this.squareSize = Math.floor(maxBoardSize / 8);
    this.boardOffsetX = Math.floor((width - this.squareSize * 8) / 2);
    this.boardOffsetY = Math.floor((height - this.squareSize * 8) / 2);
  }

  private drawBoard(): void {
    this.boardGraphics.clear();
    const lightColor = 0x1a1a1a; // Elegant dark light square
    const darkColor = 0x151515;  // Elegant dark dark square
    const borderColor = 0x222222;

    // Draw border
    this.boardGraphics.lineStyle(4, borderColor);
    this.boardGraphics.strokeRect(this.boardOffsetX - 2, this.boardOffsetY - 2, this.squareSize * 8 + 4, this.squareSize * 8 + 4);

    // Draw 8x8 squares
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        this.boardGraphics.fillStyle(isLight ? lightColor : darkColor, 1);
        const x = this.boardOffsetX + col * this.squareSize;
        const y = this.boardOffsetY + row * this.squareSize;
        this.boardGraphics.fillRect(x, y, this.squareSize, this.squareSize);
      }
    }
  }

  private setupInputHandling(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.inputController.isLocked()) return;

      const col = Math.floor((pointer.x - this.boardOffsetX) / this.squareSize);
      const row = Math.floor((pointer.y - this.boardOffsetY) / this.squareSize);

      if (col >= 0 && col < 8 && row >= 0 && row < 8) {
        const file = String.fromCharCode(97 + col);
        const rank = (8 - row).toString();
        const square = `${file}${rank}`;
        this.inputController.handleSquareSelect(square);
      }
    });
  }

  public getInputController(): InputController {
    return this.inputController;
  }

  public updateBoardState(
    board: (ChessPiece | null)[][],
    legalTargetSquares: string[] = [],
    lastMove: { from: string; to: string } | null = null,
    status?: GameStatus
  ): void {
    this.currentBoard = board;
    this.legalTargets = legalTargetSquares;
    this.lastMove = lastMove;
    this.gameStatus = status;
    this.renderPieces();
    this.renderHighlights();
  }

  public updateSelection(square: string | null, legalTargetSquares: string[] = []): void {
    this.selectedSquare = square;
    this.legalTargets = legalTargetSquares;
    this.renderHighlights();
  }

  private renderHighlights(): void {
    if (!this.highlightGraphics) return;
    this.highlightGraphics.clear();

    // Render last move highlight
    if (this.lastMove) {
      [this.lastMove.from, this.lastMove.to].forEach((sq) => {
        const { col, row } = this.squareToCoords(sq);
        const x = this.boardOffsetX + col * this.squareSize;
        const y = this.boardOffsetY + row * this.squareSize;
        this.highlightGraphics.fillStyle(0xb8860b, 0.22);
        this.highlightGraphics.fillRect(x, y, this.squareSize, this.squareSize);
      });
    }

    // Render check highlight
    if (this.gameStatus?.inCheck) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = this.currentBoard[r]?.[c];
          if (piece && piece.type === 'k' && piece.color === this.gameStatus.turn) {
            const x = this.boardOffsetX + c * this.squareSize;
            const y = this.boardOffsetY + r * this.squareSize;
            // Glowing red ruby highlight
            this.highlightGraphics.fillStyle(0xef4444, 0.35);
            this.highlightGraphics.fillRect(x, y, this.squareSize, this.squareSize);
            this.highlightGraphics.lineStyle(3, 0xef4444, 1);
            this.highlightGraphics.strokeRect(x + 1, y + 1, this.squareSize - 2, this.squareSize - 2);
          }
        }
      }
    }

    // Render selected square highlight
    if (this.selectedSquare) {
      const { col, row } = this.squareToCoords(this.selectedSquare);
      const x = this.boardOffsetX + col * this.squareSize;
      const y = this.boardOffsetY + row * this.squareSize;
      this.highlightGraphics.lineStyle(3, 0xb8860b, 1);
      this.highlightGraphics.strokeRect(x + 1, y + 1, this.squareSize - 2, this.squareSize - 2);
      this.highlightGraphics.fillStyle(0xb8860b, 0.35);
      this.highlightGraphics.fillRect(x, y, this.squareSize, this.squareSize);
    }

    // Render legal targets (temporary circles/dots vs capture indicators)
    this.legalTargets.forEach((square) => {
      const { col, row } = this.squareToCoords(square);
      const x = this.boardOffsetX + col * this.squareSize;
      const y = this.boardOffsetY + row * this.squareSize;
      const centerX = x + this.squareSize * 0.5;
      const centerY = y + this.squareSize * 0.5;

      const targetPiece = this.currentBoard[row]?.[col];
      let isCapture = targetPiece !== null && targetPiece !== undefined;

      // Check en passant
      if (!isCapture && this.selectedSquare) {
        const selCoords = this.squareToCoords(this.selectedSquare);
        const selPiece = this.currentBoard[selCoords.row]?.[selCoords.col];
        if (selPiece?.type === 'p' && col !== selCoords.col) {
          isCapture = true;
        }
      }

      if (isCapture) {
        // Draw distinct capture ring around opponent piece
        this.highlightGraphics.lineStyle(3, 0xb8860b, 0.85);
        const r = this.squareSize * 0.44;
        this.highlightGraphics.strokeCircle(centerX, centerY, r);
        this.highlightGraphics.fillStyle(0xb8860b, 0.25);
        this.highlightGraphics.fillCircle(centerX, centerY, r);
      } else {
        // Quiet destination dot
        this.highlightGraphics.fillStyle(0xb8860b, 0.7);
        this.highlightGraphics.fillCircle(centerX, centerY, Math.max(4, this.squareSize * 0.16));
      }
    });
  }

  private renderPieces(): void {
    // Clear old containers
    this.pieceContainers.forEach((container) => container.destroy());
    this.pieceContainers.clear();

    const charReg = CharacterRegistry.getInstance();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.currentBoard[row]?.[col];
        if (piece) {
          const file = String.fromCharCode(97 + col);
          const rank = (8 - row).toString();
          const square = `${file}${rank}`;

          const centerX = this.boardOffsetX + (col + 0.5) * this.squareSize;
          const centerY = this.boardOffsetY + (row + 0.5) * this.squareSize;

          const container = this.add.container(centerX, centerY);
          
          // Temporary placeholder circle for piece
          const isWhite = piece.color === 'w';
          const circleColor = isWhite ? 0xb8860b : 0x151515;
          const textColor = isWhite ? '#080808' : '#e0e0e0';
          const strokeColor = isWhite ? 0xd4af37 : 0x718096;

          const bgCircle = this.add.graphics();
          bgCircle.lineStyle(2, strokeColor, 1);
          bgCircle.fillStyle(circleColor, 1);
          bgCircle.fillCircle(0, 0, this.squareSize * 0.38);
          bgCircle.strokeCircle(0, 0, this.squareSize * 0.38);
          container.add(bgCircle);

          // Get character definition (verify registry integration)
          charReg.getByPiece(piece.color, piece.type);
          const label = piece.type.toUpperCase();
          const sublabel = piece.color === 'w' ? 'W' : 'B';

          const fontSize = Math.max(12, Math.floor(this.squareSize * 0.34));
          const text = this.add.text(0, -Math.floor(this.squareSize * 0.03), label, {
            fontSize: `${fontSize}px`,
            fontFamily: 'sans-serif',
            fontStyle: 'bold',
            color: textColor,
          });
          text.setOrigin(0.5, 0.5);
          container.add(text);

          const subSize = Math.max(8, Math.floor(this.squareSize * 0.16));
          const subText = this.add.text(0, Math.floor(this.squareSize * 0.22), `[${sublabel}]`, {
            fontSize: `${subSize}px`,
            fontFamily: 'monospace',
            fontStyle: 'bold',
            color: isWhite ? '#222222' : '#a0aec0',
          });
          subText.setOrigin(0.5, 0.5);
          container.add(subText);

          this.pieceContainers.set(square, container);
        }
      }
    }
  }

  private squareToCoords(square: string): { col: number; row: number } {
    const col = square.charCodeAt(0) - 97;
    const row = 8 - parseInt(square.charAt(1), 10);
    return { col, row };
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
    this.calculateBoardDimensions();
    this.drawBoard();
    this.renderPieces();
    this.renderHighlights();
  }
}
