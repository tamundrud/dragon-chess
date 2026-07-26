import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { ChessGameController } from '../chess/ChessGameController';
import { SettingsStore } from '../settings/SettingsStore';
import { CharacterRegistry } from '../game/characters/CharacterRegistry';
import { AttackRegistry } from '../game/animation/AttackRegistry';
import { AttackDirector } from '../game/animation/AttackDirector';

describe('Dragon Chess Phase 1 Scaffold Smoke Tests', () => {
  beforeEach(() => {
    SettingsStore.getInstance().reset();
  });

  it('renders the application shell and start menu without errors', () => {
    render(<App />);
    expect(screen.getByText('DRAGON CHESS')).toBeInTheDocument();
    expect(screen.getByText('New Game')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('can open and close the settings modal from start menu', () => {
    render(<App />);
    const settingsBtn = screen.getByText('Settings');
    fireEvent.click(settingsBtn);

    expect(screen.getByText('Game Settings')).toBeInTheDocument();
    expect(screen.getByText('Battle Animations')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close settings');
    fireEvent.click(closeBtn);
  });

  it('can start a new game and transition to GameUI', () => {
    render(<App />);
    const newGameBtn = screen.getByText('New Game');
    fireEvent.click(newGameBtn);

    // Verify Game UI elements
    expect(screen.getByText("WHITE'S TURN (GOLDEN VIKINGS)")).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Restart')).toBeInTheDocument();
  });

  it('initializes CharacterRegistry with temporary and final vertical slice targets', () => {
    const charReg = CharacterRegistry.getInstance();
    const stoick = charReg.getById('stoick');
    const fireDragon = charReg.getById('fire_dragon');

    expect(stoick).toBeDefined();
    expect(stoick?.artStatus).toBe('temporary');
    expect(fireDragon).toBeDefined();
    expect(fireDragon?.artStatus).toBe('final');
  });

  it('initializes AttackRegistry with fire dragon attack definition', () => {
    const attackReg = AttackRegistry.getInstance();
    const fireStream = attackReg.getById('fire_stream_attack');

    expect(fireStream).toBeDefined();
    expect(fireStream?.displayName).toBe('Fire Stream');
    expect(fireStream?.effectIds).toContain('flame_core');
  });

  it('verifies authoritative chess engine rules in ChessGameController', () => {
    const controller = new ChessGameController();
    expect(controller.getTurn()).toBe('w');
    expect(controller.getStatus().status).toBe('in_progress');

    // Make standard e2->e4 move
    const legalMoves = controller.getLegalMoves('e2');
    expect(legalMoves.some((m) => m.to === 'e4')).toBe(true);

    const commitResult = controller.commitMove({ from: 'e2', to: 'e4' });
    expect(commitResult).not.toBeNull();
    expect(controller.getTurn()).toBe('b');

    // Undo move returns to initial state
    const undone = controller.undo();
    expect(undone).toBe(true);
    expect(controller.getTurn()).toBe('w');
  });

  it('verifies AttackDirector instant completion when animation is disabled', () => {
    SettingsStore.getInstance().update({ animationEnabled: false });
    const director = AttackDirector.getInstance();

    let callbackCalled = false;
    const move = {
      from: 'e4',
      to: 'd5',
      color: 'w' as const,
      piece: 'p' as const,
      captured: 'p' as const,
      san: 'exd5',
      flags: 'c',
    };

    const started = director.startAttack(move, () => {
      callbackCalled = true;
    });

    expect(started).toBe(true);
    expect(callbackCalled).toBe(true);
    expect(director.getState()).toBe('idle');
  });
});
