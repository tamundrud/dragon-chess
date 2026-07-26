import Phaser from 'phaser';
import { ChessGameController } from '../chess/ChessGameController';
import { ChessMoveRequest, GameStatus, PieceColor, PieceType } from '../chess/chessTypes';
import { AttackDirector } from './animation/AttackDirector';
import { BoardScene } from './scenes/BoardScene';
import { AttackScene } from './scenes/AttackScene';
import { AudioController } from './audio/AudioController';

export class PhaserGameManager {
  private game: Phaser.Game | null = null;
  private boardScene: BoardScene | null = null;
  private attackScene: AttackScene | null = null;
  private controller: ChessGameController;
  private unsubscribeChess: (() => void) | null = null;
  private unsubscribeInputMove: (() => void) | null = null;
  private unsubscribeInputSelect: (() => void) | null = null;
  private onPromotionCallback: ((request: ChessMoveRequest, turn: PieceColor) => void) | null = null;
  private pendingPromotionRequest: ChessMoveRequest | null = null;
  private onReadyCallback: (() => void) | null = null;
  private isReady = false;

  constructor(controller: ChessGameController) {
    this.controller = controller;
  }

  public init(containerId: string): void {
    if (this.game) {
      return;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerId,
      width: '100%',
      height: '100%',
      backgroundColor: '#050505',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [BoardScene, AttackScene],
    };

    this.game = new Phaser.Game(config);

    this.game.events.on(Phaser.Core.Events.READY, () => {
      this.setupScenes();
    });
  }

  private setupScenes(): void {
    if (!this.game) return;

    this.boardScene = this.game.scene.getScene('BoardScene') as BoardScene;
    this.attackScene = this.game.scene.getScene('AttackScene') as AttackScene;

    // Launch AttackScene as an active overlay scene above BoardScene
    if (this.game.scene.isSleeping('AttackScene') || !this.game.scene.isActive('AttackScene')) {
      this.game.scene.run('AttackScene');
    }

    // Connect ChessGameController to BoardScene
    this.unsubscribeChess = this.controller.subscribe((status: GameStatus, board, lastMove) => {
      if (this.boardScene) {
        const legalMoves = this.boardScene.getInputController().getSelectedSquare()
          ? this.controller.getLegalMoves(this.boardScene.getInputController().getSelectedSquare()!).map((m) => m.to)
          : [];
        this.boardScene.updateBoardState(board, legalMoves, lastMove, status);
      }
    });

    // Connect InputController from BoardScene to ChessGameController and AttackDirector
    const inputController = this.boardScene.getInputController();
    
    this.unsubscribeInputSelect = inputController.onSelectionChange((square) => {
      if (this.boardScene) {
        const legalTargets = square ? this.controller.getLegalMoves(square).map((m) => m.to) : [];
        this.boardScene.updateSelection(square, legalTargets);
      }
    });

    this.unsubscribeInputMove = inputController.onMoveRequest((request: ChessMoveRequest) => {
      this.handleMoveRequest(request);
    });

    // The canvas is created before scene input and controller subscriptions are
    // connected. Only advertise readiness after the complete integration setup.
    this.isReady = true;
    this.onReadyCallback?.();
  }

  public onReady(callback: () => void): () => void {
    this.onReadyCallback = callback;
    if (this.isReady) callback();

    return () => {
      if (this.onReadyCallback === callback) this.onReadyCallback = null;
    };
  }

  private handleMoveRequest(request: ChessMoveRequest): void {
    if (this.controller.isInputLocked() || AttackDirector.getInstance().getState() !== 'idle') {
      return;
    }

    const legalMoves = this.controller.getLegalMoves(request.from);
    const matchingMoves = legalMoves.filter((m) => m.to === request.to);

    if (matchingMoves.length === 0) {
      // Check if user clicked another friendly piece to switch selection instead of making an illegal move
      const board = this.controller.getBoard();
      const col = request.to.charCodeAt(0) - 97;
      const row = 8 - parseInt(request.to.charAt(1), 10);
      const pieceAtDest = board[row]?.[col];
      if (pieceAtDest && pieceAtDest.color === this.controller.getTurn()) {
        AudioController.getInstance().playSound('ui_select');
        if (this.boardScene) {
          this.boardScene.getInputController().handleSquareSelect(request.to);
        }
        return;
      }

      // Illegal move rejected
      AudioController.getInstance().playSound('ui_select');
      if (this.boardScene) {
        this.boardScene.getInputController().clearSelection();
      }
      return;
    }

    // Check if this move requires promotion and promotion piece is not yet selected
    const isPromotion = matchingMoves.some((m) => m.promotion !== undefined);
    if (isPromotion && !request.promotion) {
      this.pendingPromotionRequest = request;
      if (this.onPromotionCallback) {
        this.onPromotionCallback(request, this.controller.getTurn());
      }
      return;
    }

    // 1. Prepare move without applying
    const prepared = this.controller.prepareMove(request);
    if (!prepared) {
      // Illegal move rejected
      AudioController.getInstance().playSound('ui_select');
      if (this.boardScene) {
        this.boardScene.getInputController().clearSelection();
      }
      return;
    }

    // Lock input during processing
    this.controller.setInputLocked(true);
    if (this.boardScene) {
      this.boardScene.getInputController().setLocked(true);
    }

    // 2. Identify captures and present attack scene if applicable
    if (prepared.captured) {
      const director = AttackDirector.getInstance();
      const started = director.startAttack(prepared, () => {
        // Authoritative commit exactly once after attack scene completes or skips
        this.controller.setInputLocked(false);
        if (this.boardScene) {
          this.boardScene.getInputController().setLocked(false);
        }
        this.controller.commitMove(request);
      });

      if (!started) {
        // If director rejected concurrent start, unlock input without committing the move
        this.controller.setInputLocked(false);
        if (this.boardScene) {
          this.boardScene.getInputController().setLocked(false);
        }
      }
    } else {
      // Normal quiet move: commit immediately
      this.controller.setInputLocked(false);
      if (this.boardScene) {
        this.boardScene.getInputController().setLocked(false);
      }
      this.controller.commitMove(request);
    }
  }

  public onPromotionRequired(callback: (request: ChessMoveRequest, turn: PieceColor) => void): () => void {
    this.onPromotionCallback = callback;
    return () => {
      this.onPromotionCallback = null;
    };
  }

  public completePromotion(piece: PieceType): void {
    if (!this.pendingPromotionRequest) return;
    const req = { ...this.pendingPromotionRequest, promotion: piece };
    this.pendingPromotionRequest = null;
    this.handleMoveRequest(req);
  }

  public cancelPromotion(): void {
    this.pendingPromotionRequest = null;
    if (this.boardScene) {
      this.boardScene.getInputController().clearSelection();
    }
  }

  public destroy(): void {
    if (this.unsubscribeChess) this.unsubscribeChess();
    if (this.unsubscribeInputMove) this.unsubscribeInputMove();
    if (this.unsubscribeInputSelect) this.unsubscribeInputSelect();
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
    this.boardScene = null;
    this.attackScene = null;
    this.isReady = false;
    this.onReadyCallback = null;
  }
}
