import Phaser from 'phaser';
import { ChessGameController } from '../chess/ChessGameController';
import { ChessMoveRequest, GameStatus, PieceColor, PieceType } from '../chess/chessTypes';
import { AttackDirector } from './animation/AttackDirector';
import { BoardScene } from './scenes/BoardScene';
import { AttackScene } from './scenes/AttackScene';
import { AudioController } from './audio/AudioController';

export class PhaserGameManager {
  private game: Phaser.Game | null = null;
  private resizeObserver: ResizeObserver | null = null;
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
  private destroyed = false;
  private pendingAttack: (() => void) | null = null;
  private readonly handleReady = () => this.setupScenes();
  private readonly refreshInputBounds = () => {
    if (!this.destroyed) this.game?.scale.updateBounds();
  };

  constructor(controller: ChessGameController) {
    this.controller = controller;
  }

  public init(containerId: string): void {
    if (this.destroyed || this.game) {
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

    this.game.events.once(Phaser.Core.Events.READY, this.handleReady);
  }

  private setupScenes(): void {
    if (this.destroyed || !this.game || this.isReady) return;

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

    // Phaser polls canvas bounds; refresh before its native input listeners
    // normalize page coordinates after navigation or scrolling.
    this.game.canvas.addEventListener('mousedown', this.refreshInputBounds, true);
    this.game.canvas.addEventListener('touchstart', this.refreshInputBounds, true);

    const parent = this.game.canvas.parentElement;
    if (parent) {
      // A viewport event can arrive before responsive CSS has settled. Observe
      // the actual parent size so Phaser does not retain the previous canvas.
      this.resizeObserver = new ResizeObserver(() => {
        if (this.destroyed) return;
        const { width, height } = parent.getBoundingClientRect();
        if (width > 0 && height > 0) this.game?.scale.setParentSize(width, height);
      });
      this.resizeObserver.observe(parent);
    }

    // The canvas is created before scene input and controller subscriptions are
    // connected. Only advertise readiness after the complete integration setup.
    this.isReady = true;
    this.onReadyCallback?.();
  }

  public onReady(callback: () => void): () => void {
    if (this.destroyed) return () => {};
    this.onReadyCallback = callback;
    if (this.isReady) callback();

    return () => {
      if (this.onReadyCallback === callback) this.onReadyCallback = null;
    };
  }

  private handleMoveRequest(request: ChessMoveRequest): void {
    if (this.destroyed || this.controller.isInputLocked() || AttackDirector.getInstance().getState() !== 'idle') {
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
      const complete = () => {
        if (this.destroyed || this.pendingAttack !== complete) return;
        this.pendingAttack = null;
        // Authoritative commit exactly once after attack scene completes or skips
        this.controller.setInputLocked(false);
        if (this.boardScene) {
          this.boardScene.getInputController().setLocked(false);
        }
        this.controller.commitMove(request);
      };
      this.pendingAttack = complete;
      const started = director.startAttack(prepared, complete, () => {
        if (this.pendingAttack !== complete) return;
        this.pendingAttack = null;
        this.controller.setInputLocked(false);
        this.boardScene?.getInputController().setLocked(false);
      });

      if (!started) {
        this.pendingAttack = null;
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
    if (this.destroyed) return () => {};
    this.onPromotionCallback = callback;
    return () => {
      if (this.onPromotionCallback === callback) this.onPromotionCallback = null;
    };
  }

  public completePromotion(piece: PieceType): void {
    if (this.destroyed || !this.pendingPromotionRequest) return;
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
    if (this.destroyed) return;
    this.destroyed = true;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.pendingAttack) AttackDirector.getInstance().abort(this.pendingAttack);
    this.pendingAttack = null;
    this.pendingPromotionRequest = null;
    this.onPromotionCallback = null;
    this.controller.setInputLocked(false);
    this.boardScene?.getInputController().setLocked(false);
    if (this.unsubscribeChess) this.unsubscribeChess();
    if (this.unsubscribeInputMove) this.unsubscribeInputMove();
    if (this.unsubscribeInputSelect) this.unsubscribeInputSelect();
    if (this.game) {
      this.game.canvas?.removeEventListener('mousedown', this.refreshInputBounds, true);
      this.game.canvas?.removeEventListener('touchstart', this.refreshInputBounds, true);
      this.game.events.off(Phaser.Core.Events.READY, this.handleReady);
      // Phaser destruction is deferred to a frame. Stop scenes synchronously so
      // an old overlay cannot remain registered during a Strict Mode remount.
      this.game.scene.getScenes(true).forEach((scene) => this.game?.scene.stop(scene));
      this.game.destroy(true);
      this.game = null;
    }
    this.unsubscribeChess = null;
    this.unsubscribeInputMove = null;
    this.unsubscribeInputSelect = null;
    this.boardScene = null;
    this.attackScene = null;
    this.isReady = false;
    this.onReadyCallback = null;
  }
}
