# Dragon Chess — AI Studio Agents Guide

## Project Overview
Dragon Chess is a child-friendly chess game that follows normal standard chess rules (`chess.js`) while making captures dramatic and playful with character-specific animated battle scenes (`Phaser 3`).
The primary user is an 8-year-old child who likes chess and dragons.

## Key Architectural Boundaries
1. **Authoritative Engine (`chess.js`)**: Never duplicate chess rules, legal move generation, turn order, or check/mate evaluation in Phaser or React. `chess.js` is the sole authority.
2. **Presentation Invariant**: Attack animations are presentation only. Whether animations are enabled, disabled, fast, instant, or skipped, the exact same final chess state must result.
3. **Phaser 3**: Manages board rendering (`BoardScene`), attack presentation (`AttackScene`), and audio/visual timelines.
4. **React**: Used only for surrounding menus, start screens, and settings overlays (`SettingsStore`). React must never own a second copy of board state.
5. **No Enormous Files**: Keep components, scenes, controllers, and registries modular and cleanly separated.

## Development Checklist
Before completing any task, run:
- `npm run dev` / preview verification
- `npm run test` (Vitest)
- `npm run typecheck` (`tsc --noEmit`)
- `npm run lint`
- `npm run build`

## Vertical Slice Status (Phase 4 Completed)
- **Authoritative Rules**: `ChessGameController` wraps `chess.js` and provides 100% legal chess rules, promotion overlays, undo, and restart.
- **Attack Lifecycle**: `AttackDirector` manages capture animations through strict phases (`idle` -> `preparing` -> `attacking` -> `impact` -> `recovering` -> `completing`). Input is locked during attacks.
- **Fire Dragon Slice**: Light Knight (`g1`/`b1`) is assigned `fire_dragon` (`fire_stream_attack`). Implemented in `FireDragonPresenter` with procedural wings, glowing belly, fire cones, ember particles, and soot/spark reaction silhouettes.
- **Verification Status**: All 46 Vitest unit tests pass. TypeScript and ESLint report zero errors.

## Continued Work (Codex & Claude Code Guidelines)
1. **Adding New Attack Presenters**:
   - Implement the `AttackPresenter` interface (see `FireDragonPresenter.ts` for reference).
   - Register the presenter in `AttackDirector.registerPresenter()`.
   - Ensure `skip()` and `cleanup()` remove all temporary Phaser containers, graphics, tweens, and timers.
   - Never mutate `chess.js` state inside a presenter.
2. **Replacing Temporary Art**:
   - The vertical slice uses procedural Phaser vector graphics. When replacing with illustrated sprite sheets or textures, load them in `PhaserGameManager.preload()` or scene loaders and reference by key in presenters.
3. **Audio Handling**:
   - All sound calls must go through `AudioController.getInstance().playSound()`, which safely tolerates missing audio files or autoplay restrictions.
