import React, { useState } from 'react';
import { ChessGameController } from '../chess/ChessGameController';
import { StartMenu } from '../ui/StartMenu';
import { SettingsModal } from '../ui/SettingsModal';
import { GameUI } from '../ui/GameUI';

export const GameShell: React.FC = () => {
  const [screen, setScreen] = useState<'menu' | 'game'>('menu');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [controller] = useState(() => new ChessGameController());

  const handleStartGame = () => {
    controller.reset();
    setScreen('game');
  };

  const handleBackToMenu = () => {
    setScreen('menu');
  };

  return (
    <div id="game-shell" className="min-h-screen w-full bg-[#080808] font-sans selection:bg-[#b8860b] selection:text-[#080808]">
      {screen === 'menu' ? (
        <StartMenu
          onStartGame={handleStartGame}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        <GameUI
          controller={controller}
          onBackToMenu={handleBackToMenu}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
