# Roadmap

The original development phases describe implementation milestones. They do not establish completed visual, performance, physical-device, or child acceptance. See [TEST_PLAN.md](TEST_PLAN.md) for those gates and [the current verification record](reviews/recovery-phase3.md) for evidence.

## Original Phases 1-4: implemented vertical slice

- Foundation: TypeScript/Vite, Phaser, React, `chess.js`, Vitest, settings persistence, and architectural boundaries.
- Playable chess: local pass-and-play, legal moves, promotion, Undo/Restart, status, and responsive board.
- Attack framework: lifecycle, input lock, Skip, speed/reduced-motion preferences, cleanup, and duplicate-move coverage.
- Fire Dragon: dedicated procedural presenter and effects. Other characters retain generic temporary presentation. HTML Audio playback handles optional cues, but no sound pack is shipped.

The original claims of completed phone validation, visual-quality verification, and mobile performance tuning are not acceptance evidence. Frame-rate/memory measurements and human visual assessment remain outstanding.

## Recovery milestones

- Phase 1: capture input and cancellation/lifecycle recovery with regression coverage.
- Phase 2: responsive menus, settings, resize/orientation behavior, production-build browser coverage, and retained CI artifacts. See [Phase 2 evidence](reviews/recovery-phase2.md).
- Phase 3: npm/runtime/configuration consolidation and documentation reconciliation. See [the Phase 3 plan](plans/2026-10-23-0500-chore-recovery-tooling-docs-plan.md) and [verification record](reviews/recovery-phase3.md).

## Remaining acceptance

Physical iOS Safari/Android Chrome, safe areas/browser bars, high-density readability, thumb comfort, child usability, promotion/status overlays, and animation aesthetics remain open. Rotation during a capture can leave artwork at original timeline coordinates until completion. Audible behavior requires real sound assets and hardware acceptance. These are not closed by Chromium emulation or passing unit tests.

## Deferred product work

Illustrated sprites and sound packs, dedicated Viking/other character presenters, and a single-player opponent require separate scope and acceptance. No roster expansion, gameplay changes, or bundle optimization is part of Recovery Phase 3.
