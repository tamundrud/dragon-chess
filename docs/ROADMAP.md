# Roadmap

## Phase 1 — Foundation [COMPLETED]
- Create project structure and documents.
- Configure TypeScript, Vite, Phaser, React, `chess.js`, and Vitest.
- Create clean boundaries.
- Add settings persistence.

## Phase 2 — Playable chess [COMPLETED]
- Full legal chess.
- Mobile-first board.
- Local pass-and-play.
- Undo and restart.
- Promotion selection.
- Phone and desktop validation.

## Phase 3 — Attack framework [COMPLETED]
- Lifecycle and director.
- Battle-stage layer.
- Skip and speed modes.
- Reduced motion.
- Cleanup and duplicate-move tests.

## Phase 4 — Fire-dragon vertical slice [COMPLETED]
- Layered dragon asset (`FireDragonPresenter`).
- Fire effects (`flame_stream`, `ember_particles`, `soot_cloud`).
- Defender reaction (`defSilhouette`).
- Optional audio hooks (`AudioController` with missing file tolerance).
- Mobile performance tuning & responsive board.
- Visual-quality verification & 100% test pass rate.

## Phase 5 — Roster Expansion & Art Production [DEFERRED / NEXT STEPS]
- Replace procedural vector graphics with 2D illustrated character sprites and custom sound packs.
- Implement `VikingWarriorPresenter` for Pawn captures (Spear thrust / shield bash).
- Implement `ObsidianDragonPresenter` for Black Knight / Rook captures (Shadow / lightning attacks).
- Add single-player AI opponent (Minimax / Stockfish API integration).
