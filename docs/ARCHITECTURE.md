# Architecture

## Stack
- TypeScript.
- Vite.
- Phaser 3.
- `chess.js`.
- React only for surrounding UI where useful.
- Vitest.
- Local storage.
- No backend or API keys for the vertical slice.
- Node 24.x / npm 11.x for tooling; npm lockfile and `.nvmrc` drive clean installs and CI.
- Playwright tests the production preview with installed Chromium; Cloud may select system Chromium through its optional external wrapper.
- Vitest composes the shared Vite plugins and resolution settings, then adds its jsdom test configuration.

## Separation of concerns
Keep separate:
1. Chess rules and authoritative state.
2. Board rendering.
3. Input.
4. Attack presentation.
5. Character configuration.
6. Audio.
7. Settings.
8. React UI.

## Core responsibilities

### ChessGameController
- Own the `chess.js` instance.
- Expose legal moves.
- Validate requested moves.
- Prepare and commit moves exactly once.
- Report game status.
- Undo and restart.
- Synchronize presentation.
Must not animate sprites.

### BoardScene
- Draw board and tokens.
- Show selection, legal moves, last move, and check.
- Manage board camera.
- Forward input.
Must not validate chess rules manually.

### AttackScene or AttackOverlay
- Present enlarged attacker and defender.
- Render effects and temporary camera motion.
- Run timelines.
- Clean visual state.
Must not own chess rules.

### AttackDirector
- Resolve character and attack.
- Start one attack.
- Manage lifecycle.
- Prevent overlap.
- Handle skip and cleanup.
- Report completion.

### CharacterRegistry
- Map faction and piece identity to character definitions.
- Return assets and attack IDs.
- Provide explicit fallbacks.

### AttackRegistry
- Store and resolve attack definitions.

### InputController
- Normalize touch and mouse.
- Handle selection and move requests.
- Lock input.
- Handle skip.

### AudioController
- Unlock audio after user interaction.
- Play sounds.
- Manage volume and mute.
- Tolerate missing assets.
- Clean up.

### SettingsStore
- Animation enabled.
- Normal/Fast/Instant.
- Reduced motion.
- Audio settings.
- Local persistence.

## Current Vertical Slice Implementation
- **FireDragonPresenter**: Implements the `AttackPresenter` interface for `fire_stream_attack`. Renders procedural dragon graphics, flame cones, ember particles, and defender reaction silhouettes across all 6 attack lifecycle phases.
- **Single Entry Point**: Captures in `ChessGameController` are routed through `PhaserGameManager.handleMoveRequest()`, which initiates `AttackDirector.startAttack()`. The move commit to `chess.js` occurs via the callback when the attack reaches the `completing` phase.
- **Cancellation**: Leaving a game aborts the presentation, removes callbacks/timers, and does not commit the pending capture. Destroy also disconnects the board parent ResizeObserver.
- **State Protection**: When an attack starts, `ChessGameController.setInputLocked(true)` prevents duplicate moves or UI actions (undo/restart) until the lifecycle completes.
- **Presenter Routing**: `AttackScene` registers with `AttackDirector` and delegates Fireworm rook captures to `FirewormPresenter` and procedural Fire Dragon captures to `FireDragonPresenter`. Other attack definitions use generic temporary art and motion; registry entries do not imply dedicated choreography.
- **Audio Status**: `AudioController.playSound()` checks preferences/unlock state and plays optional MP3 cues through HTML Audio with missing-file/rejection tolerance. No sound pack is shipped.
- **Data-Driven Registries**: Both `CharacterRegistry` and `AttackRegistry` provide clean decoupling between piece types, character identities, and presentation choreography.

## Export & Continued Work
- The architecture supports extension by adding and routing new `AttackPresenter` implementations for remaining pieces (using the approved Hairy Hooligans and Meatheads roster) without touching core chess engine rules or React overlays.
