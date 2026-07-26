import React from 'react';
import { Play, Sliders, Shield, Flame, Crown } from 'lucide-react';

interface StartMenuProps {
  onStartGame: () => void;
  onOpenSettings: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onStartGame, onOpenSettings }) => {
  return (
    <div id="start-menu" className="flex min-h-screen w-full flex-col items-center justify-center bg-[#080808] p-4 text-[#e0e0e0]">
      <div className="surface w-full max-w-md rounded-sm p-8 text-center shadow-2xl">
        {/* Title Badge */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-sm bg-[#151515] border border-[#b8860b]/30 shadow-inner">
          <Flame className="h-8 w-8 text-[#b8860b] animate-pulse" />
        </div>
        
        <h1 className="serif text-4xl font-bold tracking-widest gold-text uppercase">
          DRAGON CHESS
        </h1>
        <p className="mt-2 text-xs tracking-[0.2em] text-gray-500 uppercase font-mono">
          Standard Rules • Playful Character Battles
        </p>

        {/* Character Roster Highlights */}
        <div className="mt-6 rounded-sm bg-[#151515] p-4 border border-[#222]">
          <p className="text-xs font-bold uppercase tracking-tighter text-gray-400 mb-3">Featured Roster</p>
          <div className="grid grid-cols-2 gap-2 text-left text-[11px] font-mono text-[#e0e0e0]">
            <div className="flex items-center gap-2 rounded-sm bg-[#1a1a1a] p-2 border border-white/5">
              <Crown className="h-4 w-4 text-[#b8860b]" />
              <span>Stoick (King)</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm bg-[#1a1a1a] p-2 border border-white/5">
              <Crown className="h-4 w-4 text-gray-400" />
              <span>Valhallarama</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm bg-[#1f1a10] p-2 border border-[#b8860b]/40">
              <Flame className="h-4 w-4 text-[#b8860b]" />
              <span className="font-bold gold-text">Fire Dragon (N)</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm bg-[#1a1a1a] p-2 border border-white/5">
              <Shield className="h-4 w-4 text-gray-500" />
              <span>Viking Pawns</span>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            id="new-game-btn"
            onClick={onStartGame}
            className="flex w-full items-center justify-center gap-3 rounded-sm py-3.5 text-xs font-bold uppercase tracking-[0.3em] btn-active shadow-lg transition-transform active:scale-95"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>New Game</span>
          </button>

          <button
            id="open-settings-btn"
            onClick={onOpenSettings}
            className="flex w-full items-center justify-center gap-3 rounded-sm py-3.5 text-xs font-bold uppercase tracking-[0.3em] btn-ghost transition-colors"
          >
            <Sliders className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>

        <div className="mt-6 text-[10px] tracking-widest text-gray-600 uppercase font-mono">
          Phase 1 Scaffold • Local Pass-and-Play
        </div>
      </div>
    </div>
  );
};
