# Roadmap

For the refreshed recovery candidate after merged PR #11, see [the current reassessment](reviews/recovery-post-pr11-reassessment.md) and [practical manual gates](reviews/recovery-manual-acceptance.md). The original qualification remains historical.

The original development phases describe implementation milestones. They do not establish completed visual, performance, physical-device, or child acceptance. See [TEST_PLAN.md](TEST_PLAN.md) for those gates and [final recovery qualification](reviews/final-recovery-qualification.md) for integrated evidence and merge readiness. Earlier phase records remain historical.

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

Physical iOS Safari/Android Chrome, safe areas/browser bars, high-density readability, thumb comfort, child usability, promotion/status overlays, and animation aesthetics remain open. Capture artwork now fits the canvas during rotation using a shared logical space; composition and readability still need physical-device acceptance. Audible behavior requires real sound assets and hardware acceptance. These are not closed by Chromium emulation or passing unit tests.

## Deferred product work

Illustrated sprites and sound packs, dedicated Viking/other character presenters, and a single-player opponent require separate scope and acceptance. No roster expansion, gameplay changes, or bundle optimization is part of Recovery Phase 3.

## Book-first visual development (proposed after recovery)

Owner phone testing confirmed the game is broadly functional as chess but the animation quality and *How to Train Your Dragon* **book** setting are far below the target. Treat functional stability as a foundation, **not product/visual acceptance**. This is a change of priority, not a claim that the original visual vertical slice passed.

1. **Phase 5 — Rich-colour book visual concept and approval (next):** the broad creative direction is **selected**: richly coloured, animated interpretations of Cressida Cowell's book characters (not the films). Next: book-canon reference selection, proposed chess-piece/character casting, 2–3 coherent variations *within* that direction, phone-scale board/menu concepts, and a storyboard for one signature dragon capture. Specific concepts and casting still require explicit owner approval. [Plan](plans/2026-10-25-book-visual-reset.md).
2. **Phase 6 — One outstanding showcase capture:** produce approved character assets, real sound and expressive pose-driven choreography for one attack. Preserve the existing chess engine and capture lifecycle; accept the result by watching it on a real phone, not merely automated tests.
3. **Phase 7 — Complete the themed experience:** board tokens, other character attacks, menu/setting treatment, book-setting environment, and cohesive audio, using the Phase 6 quality benchmark.
4. **Phase 8 — Family and device refinement:** assess clarity, repetition fatigue, comfort, child usability and performance across physical phones and play sessions.

**Do not commission broad animation/roster implementation until Phase 5 visual direction and piece casting are approved.** Automated regression testing continues for every application change. Dedicated performance measurements and physical-device acceptance are still required.

This sequence supersedes the earlier implied visual-completion claims. Previous recovery documents remain an accurate historical technical record.
