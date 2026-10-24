# Recovery Phase 2 verification and review

Date: 2026-10-23. Base: `recovery/2026-10-22` at `05f3a132144575a1ad53274fdaffea059222c792`. PR #5 was verified merged at that commit (2026-10-23 02:07:06 UTC) before creating `codex/recovery-phase2-mobile`. The remote recovery tip was checked again before delivery and remained unchanged. The checkout was initially clean.

Plan: [Phase 2 implementation plan](../plans/2026-10-23-0210-fix-recovery-mobile-usability-plan.md).

## Changes and evidence

- U1 / R1: A production-build regression test first measured document/body width **399px at a 360px viewport**, and a separate browser probe showed the turn banner intercepting Settings taps. Flexible header constraints, readable status wrapping, non-shrinking navigation controls, smaller mobile menu padding, and a scrollable settings panel resolve the source rather than suppressing document overflow.
- U2 / R2: The new orientation test exposed a **344x600 canvas retained inside a 768x300 parent** after rotation. Phaser's viewport event refreshed before responsive CSS settled. A parent ResizeObserver now supplies the settled size without creating a new game. The observer disconnects on destroy and ignores late callbacks; the added lifecycle unit test covers those properties.
- U2 / R3-R5: Shared browser helpers choose mouse clicks or touchscreen taps from the project profile. Trusted canvas touch events are counted in browser tests. Legal/illegal moves, Undo/Restart restoration, settings, menu/new game, natural capture completion, deliberate Skip/Undo/recapture, repeated capture navigation, and Fire Dragon cancellation retain observable chess-state assertions. Original Phase 1 lifecycle unit tests remain intact.
- U2 / R1, R4: Screenshot inspection exposed overlapping capture labels, so AttackScene text now wraps within its columns and Skip tracks the resized stage. The active-capture resize regression failed before the canvas fix and passes with it. This is an evidence-driven extension into PhaserGameManager and AttackScene beyond the UI-focused file list anticipated in U1.
- U3 / R6-R7: CI retains the HTML report, screenshots, and traces on success and failure. README and TEST_PLAN no longer present historical 46-test counts or emulation as completed physical-device acceptance.

## Required checks

- `npm test`: **6 suites, 61 tests passed**.
- `npm run typecheck`: passed.
- `npm run lint`: passed with no lint diagnostics.
- `npm run build`: passed. Existing large-bundle warning remains (approximately 1.79 MB JavaScript before gzip).
- `npm run dev -- --strictPort`: Vite ready on port 3000; HTTP checks returned root HTML and transformed `/src/main.tsx`.
- Production preview: Playwright owns port 4173 with strict port selection and server reuse disabled.

Browser command in this managed environment:

```bash
DRAGON_CHESS_ARTIFACTS=/workspace/dragon-chess-artifacts/phase2-final \
  npx --no-install playwright test \
  --config=/workspace/dragon-chess-playwright.config.mjs --workers=1
```

The wrapper preserves the committed projects and preview command and selects `/usr/bin/chromium`. This verifies Chromium, including Chromium touch/device emulation; it does not verify WebKit/Safari or physical hardware. Final JSON: **38 expected/passed, 2 skipped, 0 unexpected failures, 0 flaky**, 40 cases across five projects (10.6 minutes). Desktop: 6 passed / 2 touch-only skips. Each phone project and tablet: 8 passed. No retries were configured for this local run. The final JSON result is included in the accompanying browser evidence archive.

## Compound Engineering review

`ce-plan` produced the saved plan and its confidence check passed. The plan handoff recorded `ce-doc-review` as skipped (`skill_unreachable`): the separate normal invocation mechanism was unavailable, so that workflow did not run. Prerequisites and plan coherence were checked against repository source before executing the plan.

`ce-work` used native inline execution because U1-U3 form a dependency chain. The simplification pass consolidated shared browser input, viewport, screenshot, and error-checking helpers without changing production chess state.

`ce-code-review` used the **focused** path: correctness, AGENTS.md criteria, explicit-plan requirements, and test sufficiency in the parent context, plus an independent adversarial read in a fresh agent context. The final independent read returned no findings. No different-provider CLI was installed, so the cross-model pass did not run; the local adversarial fallback uses the same serving family. No specialist roster or validator batch ran. Compound Packs, learnings, agent-native gaps, and deployment review were not assessed. The code-review receipt is saved with the accompanying review artifacts (`review.json`, `metadata.json`, and `stages.jsonl`); there are no actionable code-review findings to apply.

## Remaining human acceptance and known visual limit

- Physical iOS Safari and Android Chrome: browser chrome, safe areas/notches, high-density readability, audio unlock, and actual orientation behavior.
- Thumb comfort and scrolling, especially vertical page scrolling on short landscape screens; the minimum 300px canvas intentionally preserves board-square size.
- Child usability of moves, Undo, Restart, settings, promotion/cancel, capture Skip, and menu navigation. Promotion and long check/checkmate banners still need phone UX acceptance.
- Animation aesthetics and motion comfort across Normal/Fast/Instant/reduced-motion settings. **Known limit:** rotating mid-capture resizes the board and repositions labels/Skip, but in-flight artwork can retain its original timeline coordinates until completion. The screenshot `capture-after-resize` makes this visible. Skip, move commitment, cancellation, and subsequent play are automated regressions; seamless artwork reflow is not claimed.

No chess rules, attack timing, character registry, or capture commitment/cancellation behavior was intentionally changed. No merge or deployment is part of this delivery.
