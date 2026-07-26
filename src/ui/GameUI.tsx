import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, RotateCcw, Sliders, Undo2, Crown, ShieldAlert, Award } from 'lucide-react';
import { ChessGameController } from '../chess/ChessGameController';
import { ChessMoveRequest, GameStatus, PieceColor } from '../chess/chessTypes';
import { PhaserGameManager } from '../game/PhaserGameManager';
import { AttackDirector } from '../game/animation/AttackDirector';
import { AttackLifecycleState } from '../game/animation/attackTypes';

interface GameUIProps {
  controller: ChessGameController;
  onBackToMenu: () => void;
  onOpenSettings: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ controller, onBackToMenu, onOpenSettings }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<PhaserGameManager | null>(null);
  const [status, setStatus] = useState<GameStatus>(controller.getStatus());
  const [attackState, setAttackState] = useState<AttackLifecycleState>('idle');
  const isAttackActive = attackState !== 'idle' && attackState !== 'completing';
  const [promotionReq, setPromotionReq] = useState<{ request: ChessMoveRequest; turn: PieceColor } | null>(null);
  const [isGameReady, setIsGameReady] = useState(false);

  useEffect(() => {
    // Subscribe to chess controller status updates
    const unsubChess = controller.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    // Subscribe to attack director to disable undo/restart during animations
    const unsubAttack = AttackDirector.getInstance().subscribe((state) => {
      setAttackState(state);
    });

    return () => {
      unsubChess();
      unsubAttack();
    };
  }, [controller]);

  useEffect(() => {
    if (containerRef.current && !managerRef.current) {
      const manager = new PhaserGameManager(controller);
      const unsubscribeReady = manager.onReady(() => setIsGameReady(true));
      manager.init('phaser-container');
      managerRef.current = manager;

      manager.onPromotionRequired((request, turn) => {
        setPromotionReq({ request, turn });
      });

      return () => {
        unsubscribeReady();
        manager.destroy();
        managerRef.current = null;
      };
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
      }
    };
  }, [controller]);

  const handleUndo = () => {
    if (isAttackActive || controller.isInputLocked()) return;
    setPromotionReq(null);
    controller.undo();
  };

  const handleRestart = () => {
    if (isAttackActive || controller.isInputLocked()) return;
    setPromotionReq(null);
    controller.reset();
  };

  const getStatusText = () => {
    if (status.status === 'checkmate') {
      const winnerName = status.winner === 'w' ? 'White (Golden Vikings)' : 'Black (Obsidian Clan)';
      return `CHECKMATE! ${winnerName} WINS!`;
    }
    if (status.status === 'stalemate') return 'STALEMATE! GAME DRAWN.';
    if (status.status === 'draw' || status.status === 'threefold_repetition' || status.status === 'insufficient_material') {
      return 'GAME DRAWN.';
    }
    if (status.inCheck) {
      const turnName = status.turn === 'w' ? 'White' : 'Black';
      return `CHECK! (${turnName} TO MOVE)`;
    }
    return status.turn === 'w' ? "WHITE'S TURN (GOLDEN VIKINGS)" : "BLACK'S TURN (OBSIDIAN CLAN)";
  };

  return (
    <div
      id="game-ui"
      data-game-ready={isGameReady ? 'true' : 'false'}
      data-attack-state={attackState}
      className="flex min-h-screen w-full flex-col bg-[#080808] text-[#e0e0e0]"
    >
      {/* Header Bar */}
      <header className="flex items-center justify-between border-b gold-border bg-[#121212] px-4 sm:px-6 py-3 sm:py-4 shadow-md z-10">
        <button
          id="back-menu-btn"
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 rounded-sm px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-widest btn-ghost transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Menu</span>
        </button>

        {/* Turn & Status Indicator */}
        <div id="game-status-banner" className="surface flex items-center gap-2 rounded-sm px-4 sm:px-5 py-2 border border-[#222] shadow-inner text-center">
          {status.status === 'checkmate' ? (
            <Award className="h-5 w-5 text-[#b8860b] shrink-0" />
          ) : status.inCheck ? (
            <ShieldAlert className="h-5 w-5 text-red-400 animate-bounce shrink-0" />
          ) : (
            <Crown className={`h-5 w-5 shrink-0 ${status.turn === 'w' ? 'text-[#e0e0e0]' : 'text-gray-500'}`} />
          )}
          <span className="serif font-bold text-xs sm:text-sm md:text-base tracking-widest gold-text uppercase truncate">
            {getStatusText()}
          </span>
        </div>

        <button
          id="game-settings-btn"
          onClick={onOpenSettings}
          className="rounded-sm p-2 text-xs font-bold uppercase tracking-widest btn-ghost transition-colors"
          aria-label="Settings"
        >
          <Sliders className="h-5 w-5" />
        </button>
      </header>

      {/* Phaser Canvas Container & Promotion Overlay */}
      <main className="flex-1 w-full relative min-h-[340px] flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
        <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center relative">
          <div
            id="phaser-container"
            ref={containerRef}
            className="surface w-full h-full max-w-4xl max-h-[78vh] min-h-[300px] rounded-sm overflow-hidden border border-[#222] shadow-2xl bg-[#050505]"
          />
          <div className="w-full max-w-4xl px-2 py-1 text-center text-[10px] sm:text-[11px] uppercase tracking-wider text-[#718096] bg-[#121212]/80 border-t border-[#222] mt-1 rounded-b-sm">
            Temporary Vertical Slice Tokens — Final character art will replace these silhouettes in future phases.
          </div>

          {/* Promotion Selection Modal Overlay */}
          {promotionReq && (
            <div id="promotion-modal-overlay" className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="surface w-full max-w-sm rounded-sm border gold-border p-6 shadow-2xl bg-[#121212]">
                <h3 className="serif text-center text-lg font-bold uppercase tracking-widest gold-text mb-2">
                  Promote Pawn
                </h3>
                <p className="text-center text-xs text-[#a0aec0] mb-6 uppercase tracking-wider">
                  Choose your champion:
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    id="promote-q-btn"
                    onClick={() => {
                      managerRef.current?.completePromotion('q');
                      setPromotionReq(null);
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#333] hover:border-[#b8860b] bg-[#1a1a1a] hover:bg-[#222] transition-all active:scale-95"
                  >
                    <span className="text-2xl font-bold gold-text mb-1">Q</span>
                    <span className="text-xs font-bold tracking-wider uppercase">Queen</span>
                  </button>
                  <button
                    id="promote-r-btn"
                    onClick={() => {
                      managerRef.current?.completePromotion('r');
                      setPromotionReq(null);
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#333] hover:border-[#b8860b] bg-[#1a1a1a] hover:bg-[#222] transition-all active:scale-95"
                  >
                    <span className="text-2xl font-bold gold-text mb-1">R</span>
                    <span className="text-xs font-bold tracking-wider uppercase">Rook</span>
                  </button>
                  <button
                    id="promote-b-btn"
                    onClick={() => {
                      managerRef.current?.completePromotion('b');
                      setPromotionReq(null);
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#333] hover:border-[#b8860b] bg-[#1a1a1a] hover:bg-[#222] transition-all active:scale-95"
                  >
                    <span className="text-2xl font-bold gold-text mb-1">B</span>
                    <span className="text-xs font-bold tracking-wider uppercase">Bishop</span>
                  </button>
                  <button
                    id="promote-n-btn"
                    onClick={() => {
                      managerRef.current?.completePromotion('n');
                      setPromotionReq(null);
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#333] hover:border-[#b8860b] bg-[#1a1a1a] hover:bg-[#222] transition-all active:scale-95"
                  >
                    <span className="text-2xl font-bold gold-text mb-1">N</span>
                    <span className="text-xs font-bold tracking-wider uppercase">Knight</span>
                  </button>
                </div>
                <button
                  id="promote-cancel-btn"
                  onClick={() => {
                    managerRef.current?.cancelPromotion();
                    setPromotionReq(null);
                  }}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-widest text-[#a0aec0] hover:text-[#e0e0e0] border border-[#333] rounded-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="flex items-center justify-center gap-4 border-t gold-border bg-[#121212] px-6 py-3 sm:py-4 shadow-lg z-10">
        <button
          id="undo-btn"
          onClick={handleUndo}
          disabled={isAttackActive || status.isGameOver || controller.isInputLocked()}
          className="flex items-center gap-2 rounded-sm px-6 py-2.5 font-bold text-xs uppercase tracking-[0.2em] btn-ghost shadow disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
        >
          <Undo2 className="h-4 w-4" />
          <span>Undo</span>
        </button>

        <button
          id="restart-btn"
          onClick={handleRestart}
          disabled={isAttackActive}
          className="flex items-center gap-2 rounded-sm px-6 py-2.5 font-bold text-xs uppercase tracking-[0.2em] btn-ghost shadow disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Restart</span>
        </button>
      </footer>
    </div>
  );
};
