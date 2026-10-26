import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChessGameController } from '../chess/ChessGameController';
import { InputController } from '../game/input/InputController';
import { AttackDirector } from '../game/animation/AttackDirector';
import { AttackPresenter } from '../game/animation/attackTypes';
import { PhaserGameManager } from '../game/PhaserGameManager';
import { SettingsStore } from '../settings/SettingsStore';

// Mock only the Phaser host; use real manager, input, chess, and director.
vi.mock('../game/scenes/BoardScene', () => ({ BoardScene: class {} }));
vi.mock('../game/scenes/AttackScene', () => ({ AttackScene: class {} }));
vi.mock('phaser', () => ({ default: {
  AUTO: 0, Scale: { RESIZE: 0, CENTER_BOTH: 0 }, Core: { Events: { READY: 'ready' } },
  Scenes: { Events: { CREATE: 'create' } },
  Game: class {
    events = host.events;
    canvas = host.canvas;
    scale = { updateBounds: host.updateBounds, setParentSize: host.setParentSize };
    scene = {
      getScene: (key: string) => key === 'AttackScene'
        ? { isPresentationReady: () => host.presentationReady, events: host.attackEvents } : host.board,
      isSleeping: () => false, isActive: () => true,
      getScenes: () => [], stop: vi.fn(),
    };
    destroy = host.destroy;
  },
} }));
const host = vi.hoisted(() => ({
  events: null as unknown as EventEmitter,
  attackEvents: null as unknown as EventEmitter,
  presentationReady: true,
  board: null as unknown as {
    getInputController: () => InputController;
    updateBoardState: ReturnType<typeof vi.fn>;
    updateSelection: ReturnType<typeof vi.fn>;
  },
  destroy: vi.fn(),
  canvas: null as unknown as HTMLCanvasElement,
  updateBounds: vi.fn(),
  setParentSize: vi.fn(),
}));

describe('PhaserGameManager lifecycle', () => {
  const director = AttackDirector.getInstance();
  const managers: PhaserGameManager[] = [];
  let complete: () => void;
  let presenter: AttackPresenter;

  function mount(controller = new ChessGameController(), ready = true) {
    const input = new InputController();
    host.events = new EventEmitter();
    host.canvas = document.createElement('canvas');
    host.board = { getInputController: () => input, updateBoardState: vi.fn(), updateSelection: vi.fn() };
    const manager = new PhaserGameManager(controller);
    managers.push(manager);
    manager.init('test');
    if (ready) host.events.emit('ready');
    const move = (from: string, to: string) => {
      input.handleSquareSelect(from);
      input.handleSquareSelect(to);
    };
    return { manager, controller, input, move, events: host.events, board: host.board, canvas: host.canvas };
  }

  function capture() {
    const game = mount();
    game.move('e2', 'e4');
    game.move('d7', 'd5');
    game.move('e4', 'd5');
    expect(game.controller.isInputLocked()).toBe(true);
    return game;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    host.presentationReady = true;
    host.attackEvents = new EventEmitter();
    SettingsStore.getInstance().reset();
    presenter = {
      playAttack: (_ctx, _def, _settings, _phase, callback) => { complete = callback; },
      skip: () => complete(), cleanup: vi.fn(),
    };
    director.registerPresenter(presenter);
    host.destroy.mockClear();
    host.updateBounds.mockReset();
  });

  afterEach(() => {
    managers.splice(0).forEach((manager) => manager.destroy());
    director.abort();
    director.unregisterPresenter(presenter);
    vi.useRealTimers();
  });

  it('waits for the illustrated presentation before advertising readiness or accepting moves', () => {
    host.presentationReady = false;
    const game = mount();
    const ready = vi.fn(); game.manager.onReady(ready);
    game.move('e2', 'e4');
    expect(game.controller.getTurn()).toBe('w');
    expect(ready).not.toHaveBeenCalled();
    host.presentationReady = true; host.attackEvents.emit('create');
    expect(ready).toHaveBeenCalledTimes(1);
    game.move('e2', 'e4');
    expect(game.controller.getTurn()).toBe('b');
  });

  it('destroy while art is loading removes the deferred readiness callback', () => {
    host.presentationReady = false;
    const game = mount(); const ready = vi.fn(); game.manager.onReady(ready);
    game.manager.destroy();
    host.presentationReady = true; host.attackEvents.emit('create');
    expect(ready).not.toHaveBeenCalled();
    expect(host.attackEvents.listenerCount('create')).toBe(0);
    expect(game.controller.getTurn()).toBe('w');
  });

  it('preserves a moved Hookfang defender and restores both identities after Undo', () => {
    const game = mount(new ChessGameController('4k3/8/7r/8/8/8/8/R3K2R w KQ - 0 1'));
    game.move('h1', 'h3');
    game.move('h6', 'h3');
    expect(director.getCurrentContext()?.defenderCharacterId).toBe('hookfang');
    const before = game.controller.getFen();
    const attacker = game.controller.getCharacterId('h6');
    director.skip();
    expect(game.controller.getCharacterId('h3')).toBe(attacker);
    game.controller.undo();
    expect(game.controller.getFen()).toBe(before);
    expect(game.controller.getCharacterId('h3')).toBe('hookfang');
    expect(game.controller.getCharacterId('h6')).toBe(attacker);
  });

  it.each([
    ['fireworm', 'a1', 'a3', 'h7', 'h6', 'a6'],
    ['hookfang', 'h1', 'h3', 'a6', 'a5', 'h7'],
  ])('routes the moved %s rook by its identity and commits only once', (id, from, via, replyFrom, replyTo, to) => {
    const game = mount(new ChessGameController('4k3/7p/p7/8/8/8/8/R3K2R w KQ - 0 1'));
    game.move(from, via);
    game.move(replyFrom, replyTo);
    const before = game.controller.getFen();
    game.move(via, to);
    expect(director.getCurrentContext()?.attackerCharacterId).toBe(id);
    expect(game.controller.getFen()).toBe(before);
    const stale = complete;
    director.skip();
    stale();
    expect(game.controller.getPieceAt(to)).toEqual({ type: 'r', color: 'w' });
    expect(game.controller.getCharacterId(to)).toBe(id);
    expect(game.controller.getTurn()).toBe('b');
    game.controller.undo();
    expect(game.controller.getFen()).toBe(before);
    expect(game.controller.getCharacterId(via)).toBe(id);
  });

  it('leaving cancels the pending move, releases locks and allows a new game', () => {
    const old = capture();
    const fen = old.controller.getFen();
    const staleComplete = complete;
    old.manager.destroy();
    expect(old.controller.getFen()).toBe(fen);
    expect(old.controller.isInputLocked()).toBe(false);
    expect(old.input.isLocked()).toBe(false);
    expect(director.getState()).toBe('idle');
    const next = capture();
    old.manager.destroy();
    staleComplete();
    old.move('g1', 'f3');
    expect(next.controller.isInputLocked()).toBe(true);
    expect(director.getState()).toBe('preparing');
    expect(old.controller.getFen()).toBe(fen);
    complete();
    expect(next.controller.getPieceAt('d5')?.color).toBe('w');
  });

  it.each(['natural', 'skip'])('%s completion commits once through the manager', (mode) => {
    const game = capture();
    const commit = vi.spyOn(game.controller, 'commitMove');
    if (mode === 'skip') director.skip();
    else complete();
    complete();
    director.skip();
    expect(commit).toHaveBeenCalledTimes(1);
    expect(game.controller.isInputLocked()).toBe(false);
    expect(game.input.isLocked()).toBe(false);
    expect(game.controller.getPieceAt('d5')?.color).toBe('w');
  });

  it('scene presenter removal cancels the move and unlocks input', () => {
    const game = capture();
    const fen = game.controller.getFen();
    director.unregisterPresenter(presenter);
    complete();
    expect(game.controller.getFen()).toBe(fen);
    expect(game.controller.isInputLocked()).toBe(false);
    expect(game.input.isLocked()).toBe(false);
  });

  it('clears promotion callbacks and subscriptions on repeated destroy', () => {
    const controller = new ChessGameController('8/P7/8/8/8/8/8/4K2k w - - 0 1');
    const game = mount(controller);
    const promote = vi.fn();
    game.manager.onPromotionRequired(promote);
    game.move('a7', 'a8');
    expect(promote).toHaveBeenCalledTimes(1);
    const fen = controller.getFen();
    game.manager.destroy();
    game.manager.destroy();
    game.manager.completePromotion('q');
    game.move('a7', 'a8');
    expect(controller.getFen()).toBe(fen);
    expect(promote).toHaveBeenCalledTimes(1);
    expect(host.destroy).toHaveBeenCalledTimes(1);
    game.board.updateBoardState.mockClear();
    controller.reset();
    expect(game.board.updateBoardState).not.toHaveBeenCalled();
  });

  it('refreshes moved canvas bounds before Phaser input and removes native listeners on destroy', () => {
    const game = mount(undefined, false);
    const order: string[] = [];
    // Phaser installs its bubble listener during boot, before manager readiness.
    game.canvas.addEventListener('mousedown', () => order.push('phaser'));
    game.canvas.addEventListener('touchstart', () => order.push('phaser'));
    host.updateBounds.mockImplementation(() => order.push('bounds'));
    game.events.emit('ready');
    game.canvas.dispatchEvent(new MouseEvent('mousedown'));
    game.canvas.dispatchEvent(new Event('touchstart'));
    expect(order).toEqual(['bounds', 'phaser', 'bounds', 'phaser']);
    game.manager.destroy();
    order.length = 0;
    game.canvas.dispatchEvent(new MouseEvent('mousedown'));
    game.canvas.dispatchEvent(new Event('touchstart'));
    expect(order).toEqual(['phaser', 'phaser']);
  });

  it('ignores delayed ready events and init after destruction', () => {
    const game = mount(undefined, false);
    const ready = vi.fn();
    game.manager.onReady(ready);
    const delayedReady = game.events.listeners('ready')[0];
    game.manager.destroy();
    delayedReady();
    game.events.emit('ready');
    game.manager.init('test');
    game.manager.onReady(ready);
    expect(ready).not.toHaveBeenCalled();
    expect(game.events.listenerCount('ready')).toBe(0);
  });

  it('tracks settled parent size and ignores resize callbacks after destruction', () => {
    let notify!: ResizeObserverCallback;
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: ResizeObserverCallback) { notify = callback; }
      observe = observe;
      disconnect = disconnect;
    });
    try {
      const { manager, events, canvas } = mount(new ChessGameController(), false);
      const parent = document.createElement('div');
      parent.append(canvas);
      vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({ width: 800, height: 300 } as DOMRect);
      events.emit('ready');
      expect(observe).toHaveBeenCalledWith(parent);
      host.setParentSize.mockClear();
      notify([], {} as ResizeObserver);
      expect(host.setParentSize).toHaveBeenCalledWith(800, 300);
      manager.destroy();
      expect(disconnect).toHaveBeenCalledOnce();
      host.setParentSize.mockClear();
      notify([], {} as ResizeObserver);
      expect(host.setParentSize).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

});
