# Roadmap

For the refreshed recovery candidate after merged PR #11, see [the current reassessment](reviews/recovery-post-pr11-reassessment.md) and [practical manual gates](reviews/recovery-manual-acceptance.md). The original qualification remains historical.

The original development phases describe implementation milestones. They do not establish completed visual, performance, physical-device, or child acceptance. See [TEST_PLAN.md](TEST_PLAN.md) for those gates and [final recovery qualification](reviews/final-recovery-qualification.md) for integrated evidence and merge readiness. Earlier phase records remain historical.

## Original Phases 1-4: implemented vertical slice

- Foundation: TypeScript/Vite, Phaser, React, `chess.js`, Vitest, settings persistence, and architectural boundaries.
- Playable chess: local pass-and-play, legal moves, promotion, Undo/Restart, status, and responsive board.
- Attack framework: lifecycle, input lock, Skip, speed/reduced-motion preferences, cleanup, and duplicate-move coverage.
- Fire Dragon: dedicated procedural presenter and effects. Other characters retain generic temporary presentation. HTML Audio playback handles optional cues, but no sound pack is shipped.

The original claims of completed phone validation, visual-quality verification, and mobile performance tuning are not acceptance evidence. Frame-rate/memory measurements and broader human visual assessment remain outstanding; Fireworm’s later prototype acceptance is recorded below.

## Recovery milestones

- Phase 1: capture input and cancellation/lifecycle recovery with regression coverage.
- Phase 2: responsive menus, settings, resize/orientation behavior, production-build browser coverage, and retained CI artifacts. See [Phase 2 evidence](reviews/recovery-phase2.md).
- Phase 3: npm/runtime/configuration consolidation and documentation reconciliation. See [the Phase 3 plan](plans/2026-10-23-0500-chore-recovery-tooling-docs-plan.md) and [verification record](reviews/recovery-phase3.md).

## Remaining acceptance

Physical iOS Safari/Android Chrome, safe areas/browser bars, high-density readability, thumb comfort, child usability, promotion/status overlays, and animation aesthetics remain open. Capture artwork now fits the canvas during rotation using a shared logical space; composition and readability still need physical-device acceptance. Audible behavior requires real sound assets and hardware acceptance. These are not closed by Chromium emulation or passing unit tests.

## Deferred product work

Illustrated sprites and sound packs, dedicated Viking/other character presenters, and a single-player opponent require separate scope and acceptance. No roster expansion, gameplay changes, or bundle optimization is part of Recovery Phase 3.

## Book-first visual development

Before the Fireworm work, owner phone testing confirmed the game was broadly functional as chess but its animation quality and *How to Train Your Dragon* **book** setting were far below the target. Treat functional stability as a foundation, **not product/visual acceptance**. This is a change of priority, not a claim that the original visual vertical slice passed.

1. **Phase 5 — Rich-colour book visual concept and approval:** the broad creative direction and **complete starting-piece roster plus standard promotion with reused same-class artwork are selected**. Fireworm’s later showcase choreography is accepted; full-roster appearances and phone-scale board/menu and token designs remain open. [Plan](plans/2026-10-25-book-visual-reset.md).
2. **Phase 6 — One outstanding showcase capture:** Fireworm’s illustrated, expressive choreography is accepted after physical-phone viewing. Chess/lifecycle regression gates remain mandatory. Real sound is still absent.
3. **Phase 7 — Complete the themed experience:** board tokens, other character attacks, menu/setting treatment, book-setting environment, and cohesive audio, using the Phase 6 quality benchmark.
4. **Phase 8 — Family and device refinement:** assess clarity, repetition fatigue, comfort, child usability and performance across physical phones and play sessions.

**Current status (2026-10-26):** Fireworm’s showcase choreography is [owner-approved as the battle-scene benchmark](FIREWORM_BENCHMARK.md), resolving its earlier visual objections. One signature capture is now accepted. This does not approve all character designs, audio or release readiness. Additional character development requires separate scope and character-specific acceptance; it is not part of integration. Automated regression testing continues for every application change. Dedicated performance measurements and physical-device acceptance are still required.

This sequence supersedes the earlier implied visual-completion claims. Previous recovery documents remain an accurate historical technical record.
