# Fireworm capture prototype — technical evidence and visual acceptance

> Historical implementation record. Fireworm visual objections are resolved by [owner approval on PR #16](../FIREWORM_BENCHMARK.md). See [current integration verification](fireworm-integration.md) for technical results.

2026-10-26. Prototype implementation on `feat/fireworm-animation-proof`, based on fetched `docs/book-visual-reset-2026-10-25` at `d4937d234e569d977faaa2ff063fe6329bae40c9`. Parent documentation PR #12 remains an open draft. No merge or deployment is part of this work.

## What can be reviewed

Run `npm ci --include=dev`, `npm run build`, then `npm run preview`. Open `/?preview=fireworm`, or choose **Watch Fireworm capture prototype** from the menu. This isolated proof uses the same Phaser presenter and source art as actual gameplay. Replay, Skip, Normal/Fast/Instant and reduced motion are available; it owns no chess state.

In a normal new game, play `a2-a4 b7-b5 a1-a3 b5-b4 a3-b3 h7-h6 b3xb4`. All are legal moves. Fireworm moves twice before its rook capture. The move is committed through the existing manager/director path once after completion/Skip, and never on navigation abort.

- [Portrait recording](artifacts/fireworm/proof-portrait.webm) and [landscape recording](artifacts/fireworm/proof-landscape.webm): actual production-build Chromium capture, including Normal replay and reduced motion. Download/open the WebM if GitHub does not play it inline.
- [Portrait anticipation](artifacts/fireworm/proof-portrait-anticipation.png), [portrait fireworks](artifacts/fireworm/proof-portrait-fireworks.png), [landscape anticipation](artifacts/fireworm/proof-landscape-anticipation.png), [landscape fireworks](artifacts/fireworm/proof-landscape-fireworks.png).
- [Actual legal capture](artifacts/fireworm/fireworm-fireworks.png), [rotated launch](artifacts/fireworm/fireworm-launch-rotated.png), [rotated recovery](artifacts/fireworm/fireworm-recovery-rotated.png), [staging](artifacts/fireworm/fireworm-staging.png).
- [Original source atlas](../../public/art/fireworm/rig.png), [painted cove](../../public/art/fireworm/cove.png), [production method/provenance](../../public/art/fireworm/PROVENANCE.md).

The illustrated body, wing and head/neck animate independently. Anticipation compresses shoulders and opens the wing, release switches head pose and sends overlapping painted ribbons towards the raider, one luminous core accompanies coloured spark trajectories/trails, and recoil/soot, a pleased nod and one drifting ember lead to reset. Normal is a 3350ms candidate; Fast is 0.35×. Reduced motion uses a short two-pose fade/static subdued burst with no shake, zoom or travelling particles. No sound asset ships.

## Technical verification

Broad local browser matrix (before the final neck-pivot correction): **64 passed, 2 intentional touch-only skips, 0 failures, 0 flaky results** across desktop, 360px portrait and short landscape. A subsequent visual-only correction anchors the neck at its base during launch and adjusts the victory nod; **all 6 affected completion/rotation and replay/mode cases passed again in all three viewports** on final source commit `42b3a5b`. [Post-correction summary](artifacts/fireworm/browser-post-visual-summary.json). Runtime: 22m04s on the 2-CPU software-WebGL host. [Per-case summary](artifacts/fireworm/browser-summary.json).

Command (production build, Cloud wrapper):

```sh
DRAGON_CHESS_ARTIFACTS=/workspace/dragon-chess-artifacts/fireworm-verified npx playwright test --config=/workspace/dragon-chess-playwright.config.mjs --project=chromium --project=phone-360-portrait --project=phone-landscape --workers=2
```

The selected viewports are 1366×768 desktop, 360×800 touch portrait and 800×360 touch landscape. The 390px phone and tablet projects are not included in this final local run; the unchanged repository CI configuration runs all five projects. Raw HTML reports, screenshots and traces remain under the corresponding `/workspace/dragon-chess-artifacts/` run directories. Compact [run history](artifacts/fireworm/browser-run-history.json) preserves preliminary outcomes without embedding screenshot payloads.

- `npm test`: **91 tests passed in 9 files** after readiness/body-scale fixes. The subsequently extended existing en-passant identity/Undo case also passed in its 15-test rules suite. After the final visual transform correction, the 9 Fireworm presenter tests, typecheck, lint and production build passed again.
- `npm run typecheck`, `npm run lint`: passed. `npm run build`: passed; Vite retains the existing large-bundle warning (about 1.8MB minified JS), with no dependency or bundle-configuration changes in this task.
- Runtime: production preview exercised through the browser wrapper and directly for recordings. System Chromium at `/usr/bin/chromium`; recording used system ffmpeg via a local Playwright cache selector. No repository browser configuration changed.
- Eight initial Fireworm browser cases passed at 360×800. The later cold-artwork and leave-during-loading cases passed 2/2 after fixes. These preliminary results do not replace the final matrix below.
- Unit evidence covers per-game identity, moved Fireworm/Hookfang attackers, moved Hookfang defender, capture/Undo/reset, both white castlings, all standard promotion choices, en-passant identity removal/Undo, exact-once completion, stale callbacks, abort, replay and unrelated activity surviving cleanup.

Browser assertions check lifecycle, turn/Undo/recapture, input locks, readiness, one canvas, fitting/resizing and uncaught page errors. Fireworm screenshots are retained for inspection; they are **not golden-image or quantitative pose/pixel-visibility assertions**. The older procedural/generic resize suite retains its own pixel assertions. No mobile frame-rate or memory benchmark is claimed.

### Execution and CE review

`ce-plan` intake checked the supplied implementation-ready plan; its scope and gates were retained without rewriting it. Execution proceeded through `ce-work` using native implementation. `ce-simplify-code` completed five review passes and pruned narration comments. `ce-code-review` completed six local lenses plus validation, with a [complete review receipt](artifacts/fireworm/ce-code-review.json) and [run metadata](artifacts/fireworm/ce-code-review-metadata.json), run `fireworm-20261026`.

The receipt captures the reviewed snapshot and says **Ready with fixes**; follow-up fixes and verification are recorded here rather than rewriting that historical receipt:

1. **#1 cold-load race:** reproduced with two failing manager tests and a real browser test holding `rig.png`. Gameplay now waits for AttackScene CREATE, locks board input while loading, removes deferred readiness callbacks on destroy, and synchronously stops the loading scene. The held-art and loading-navigation browser regressions subsequently passed.
2. **#2 body proportions:** release now restores captured original Y scale rather than X scale. Final anticipation/release/recovery frames were inspected after this correction.
3. Final retained-image inspection exposed a neck/body gap during rotated launch. The head/neck now pivots about its base, and the nod uses the corresponding resting position; refreshed preview images/recordings show the connected silhouette. This changes only artwork transforms, with no timing, chess or lifecycle changes.
4. Moved-Hookfang defender coverage was added during review and the candidate finding was closed by its validator. The suggested en-passant metadata assertions were also added to the existing rules case.

No separate-provider review was available: only the same-family Codex CLI was installed. The adversarial lens used the documented local fallback. **No independent cross-model review is claimed.** No actionable code-review finding remains deferred; screenshot-only Fireworm visual assertions remain a stated coverage limit.

An initial three-worker, five-project run on this 2-CPU software-WebGL host produced 6 passes, 1 desktop wall-time timeout, 1 skip, 3 interrupted and 89 unrun cases before it was deliberately stopped for the readiness fix. Its trace showed the capture had committed; this was not a pass and is not used as final evidence. The first cold-ready red run and the interrupted loading-overlay debugging run are likewise excluded from final pass totals. Final runs use bounded concurrency; Fireworm tests allow 240s wall time without changing phase or turn assertions.

## Owner visual acceptance — NOT RUN / NOT ACCEPTED

Agent inspection of rendered PNGs and representative recording frames established that the illustrated rig, flame direction, target recoil, coloured burst and controls render at emulated phone sizes. This is technical/artifact inspection, **not owner acceptance** of artwork, personality, motion, pacing or phone usability.

The owner still needs to watch repeated Normal/Fast/reduced-motion captures on physical 360px-class portrait and short-landscape phones, including iOS Safari/Android Chrome, browser-bar changes, safe areas, high density and rotation mid-capture. Judge connected anatomy, expression, comic reaction, the colourful fireworks impact, comfort and replay fatigue. Tune the candidate duration from that viewing. Neither a final Fireworm depiction nor exact choreography is approved by this PR.

The board/UI and remaining cast retain deliberate placeholders. Hookfang retains a generic attack and distinct identity. The common raider defender is temporary art, not a complete set of named defender portraits. Promotion keeps standard chess choices and deterministic current class art reuse; the full approved roster skins are not implemented here. Arbitrary FEN loads cannot encode historical named-piece identity and seed deterministically by compatible home square/class. The source PNG pack is about 5MB; first-game readiness waits for it. Audible/hardware acceptance remains outside this silent slice.
