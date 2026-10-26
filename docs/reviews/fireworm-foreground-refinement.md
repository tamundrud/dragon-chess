# Fireworm foreground refinement — verification and acceptance

> Historical implementation record. Fireworm visual objections are resolved by [owner approval on PR #16](../FIREWORM_BENCHMARK.md). See [current integration verification](fireworm-integration.md) for technical results.

2026-10-26. Follow-up to the owner's [PR #13 feedback](https://github.com/tamundrud/dragon-chess/pull/13#issuecomment-6409635177), on `feat/fireworm-foreground-refinement`, based on fetched parent `feat/fireworm-animation-proof` at `a969d1730956a47b301ceaa5d998d8ee418ccf36`. This is a stacked draft; the parent prototype and its earlier evidence remain unchanged. No merge or deployment.

## What changed

Fireworm now uses three complete connected original illustrations: ready, breathing and proud. The entire character shares its transform, with short pose crossfades, anticipation compression, a lunge and recovery nod. Separate rotating neck/body/wing cutouts no longer create open joints. Effects sit behind the characters, so smoke does not conceal anatomy. The [asset provenance](../../public/art/fireworm/PROVENANCE.md) records generation, owned references and actual dimensions.

The largest painted breath ribbon is 370×270 logical pixels, compared with 300×122 in the parent (about 2.7× the rectangular area; this is a size comparison, not measured perceived intensity). Five overlapping ribbons and a rising impact plume surround the existing forty coloured sparks/trails. There is one brief translucent core; no strobe, camera shake or required sound. Breath fades before the closed-mouth recovery pose. Normal remains a 3350ms candidate, Fast 0.35×; reduced motion uses subdued static sparks/fades without travelling actors.

The default keeps the actual pending chess position visible under a 28% dark overlay. Enlarged actors emerge from their board squares and Fireworm returns to the destination. Settings retain the painted arena for comparison; each capture snapshots the choice. Dynamic destination lookup keeps return coordinates current during resize. The original chess.js commit/Skip/abort path remains authoritative.

Flamehuffer is the a8 black rook, with a distinct original illustration and actual rook/faction metadata. The h8 Common or Garden Dragon keeps its own identity and temporary art. Only the named black Flamehuffer rook uses that portrait. Unsupported targets show their actual class/faction and honest placeholder label instead of adopting pawn art. Full-roster artwork is out of scope.

## Reproduce and compare

Build and run `npm run preview`, then open `/?preview=fireworm` or the menu's prototype link. Select board/arena, Flamehuffer rook/raider pawn, Normal/Fast/Instant or reduced motion; choices apply on Replay. The proof uses the real BoardScene plus a separate controller with legal moves from the normal starting position. Replay resets that fixture; natural completion/Skip commits its pending move once. It does not alter the active game.

In an actual new game play `a2-a4 a7-a5 a1-a3 a8-a6 a3-b3 a6-b6 b3xb6`. This demonstrates both moved rooks and correct Flamehuffer capture; Undo restores both identities. The pawn comparison is `a2-a4 b7-b5 a1-a3 b5-b4 a3-b3 h7-h6 b3xb4`.

## Rendered evidence

Full original browser recordings include setup, Replay, the attack and return. They are not retimed. Download/open WebM if GitHub does not play it inline.

| Presentation | Portrait Normal / Fast | Landscape Normal / Fast |
| --- | --- | --- |
| Board foreground | [Normal](artifacts/fireworm-refinement/portrait-board-normal.webm) · [Fast](artifacts/fireworm-refinement/portrait-board-fast.webm) | [Normal](artifacts/fireworm-refinement/landscape-board-normal.webm) · [Fast](artifacts/fireworm-refinement/landscape-board-fast.webm) |
| Painted arena | [Normal](artifacts/fireworm-refinement/portrait-arena-normal.webm) · [Fast](artifacts/fireworm-refinement/portrait-arena-fast.webm) | [Normal](artifacts/fireworm-refinement/landscape-arena-normal.webm) · [Fast](artifacts/fireworm-refinement/landscape-arena-fast.webm) |

[Recording observations](artifacts/fireworm-refinement/motion-observations.json) retain exact viewport/mode, natural playback and page-error results (none). The software-WebGL host stretches wall-clock playback; these clips establish rendered behavior, not physical-phone frame rate or pacing. The 3350ms duration is logical animation time.

- Actual moved Flamehuffer capture: [portrait](artifacts/fireworm-refinement/phone-360-portrait-actual-moved-flamehuffer-impact.png), [landscape](artifacts/fireworm-refinement/phone-landscape-actual-moved-flamehuffer-impact.png).
- Live board and connected preparation: [portrait](artifacts/fireworm-refinement/phone-360-portrait-foreground-board-connected-pose.png), [landscape](artifacts/fireworm-refinement/phone-landscape-foreground-board-connected-pose.png).
- Arena comparison: [portrait](artifacts/fireworm-refinement/phone-360-portrait-arena-comparison-connected-pose.png), [landscape](artifacts/fireworm-refinement/phone-landscape-arena-comparison-connected-pose.png).
- Actual pawn comparison: [portrait impact](artifacts/fireworm-refinement/phone-360-portrait-fireworm-fireworks.png), [landscape impact](artifacts/fireworm-refinement/phone-landscape-fireworm-fireworks.png).
- Rotation: [launch](artifacts/fireworm-refinement/phone-360-portrait-fireworm-launch-rotated.png), [recovery](artifacts/fireworm-refinement/phone-landscape-fireworm-recovery-rotated.png).
- [Normal release without effects](artifacts/fireworm-refinement/effects-hidden-normal-940.png), [recovery transition](artifacts/fireworm-refinement/effects-hidden-normal-2010.png), [Fast transition](artifacts/fireworm-refinement/effects-hidden-fast-2010.png), [all diagnostic sample times](artifacts/fireworm-refinement/effects-hidden-observations.json). This browser-only diagnostic instantiates the unchanged production presenter, then hides its effects container through Phaser's object API. No product control or source image was altered.

Agent inspection sampled all eight video sequences at 3fps across their full duration, plus the sixteen effects-hidden Normal/Fast transition samples. Connected whole poses, breath direction, coloured impact, distinct target, board emergence and return render. Short pose crossfades can show double contours; the owner must judge that transition style. [Portrait sequence sheet](artifacts/fireworm-refinement/portrait-board-normal-motion-sheet.png) and [landscape sequence sheet](artifacts/fireworm-refinement/landscape-board-normal-motion-sheet.png) are derived inspection samples; they do not replace the full recordings.

## Technical verification

Verified production source: `952e894` (the following evidence/documentation commit changes no runtime source). [Build/asset hashes](artifacts/fireworm-refinement/build-manifest.json).

- `npm test`: **102 passed in 11 files**, including the four review-follow-up board-position/cancellation cases.
- `npm run typecheck`, `npm run lint`, `npm run build`: passed. Vite retains the existing ~1.8MB JS bundle warning; no dependency/configuration change.
- Production Playwright: **42 passed, 0 failures, 0 skipped, 0 flaky**, 12m33s. Desktop 1366×768, touch portrait 360×800 and touch landscape 800×360. [Per-case summary](artifacts/fireworm-refinement/browser-summary.json).

```sh
DRAGON_CHESS_ARTIFACTS=/workspace/dragon-chess-artifacts/refinement-final npx playwright test e2e/fireworm.spec.js e2e/fireworm_refinement.spec.js --config=/workspace/dragon-chess-playwright.config.mjs --project=chromium --project=phone-360-portrait --project=phone-landscape --workers=2
```

The runtime was Vite production preview using system Chromium and software WebGL. Raw HTML reports, screenshots and traces remain at `/workspace/dragon-chess-artifacts/refinement-final/`; selected portable images and compact results are retained here. The 390px phone/tablet projects and the entire unrelated browser suite were not rerun locally; no physical-device/browser-engine performance result is claimed.

Automated source-alpha connectivity verifies the opaque silhouette in each decoded PNG. Pixel sampling verifies the real underlying board survives the dimmer and differs from the opaque comparison arena. Neither assertion judges artistic anatomy, expression or whole-motion quality. Browser fixtures also retain the page-error guard, input locks, turn/Undo/recapture, readiness, one-canvas, resize and completion assertions. No threshold or page-error assertion was weakened.

The first refinement browser pilot exposed two issues: a stale pre-dimming reference screenshot taken before Skip had rendered, and an absent accessible capture description. The reference now waits for two rendered frames; GameUI now announces the actual named target and class. The phone pilot subsequently passed 4/4. Earlier failed artifacts remain in `/workspace/dragon-chess-artifacts/refinement-first`; preliminary results are not added to final totals.

## Compound Engineering

CE planning produced the [refinement plan](../plans/2026-10-26-fireworm-foreground-refinement-plan.md), with local feasibility/design/scope/adversarial document reviews and lead coherence fallback after agent capacity failure. Implementation followed `ce-work`; five simplification lenses removed only narration comments. A visual timing concern was corrected so breath has faded by the proud pose.

`ce-code-review` completed six local lenses and finding validation: [complete receipt](artifacts/fireworm-refinement/ce-code-review.json), [metadata](artifacts/fireworm-refinement/ce-code-review-metadata.json). Its recorded verdict is **Ready with fixes**. Confirmed finding **#1** requested observable emergence/return coverage. The caller applied it inline: four new tests assert source/victim coordinates, a changed destination during return, fixed arena staging, and Skip/abort cancellation without later movement or duplicate completion. All 13 presenter tests and then the full 102-test suite passed, along with typecheck/lint. Production source did not change after review. [Resolution receipt](artifacts/fireworm-refinement/review-followup.json). No justified finding remains unresolved.

The [planning review receipt](artifacts/fireworm-refinement/ce-plan-review.json) and retained plan preserve the planning gate. Final requirements reconciliation: U1/R1–R2 are implemented and have rendered evidence; U2/R3 has board/arena pixel and position checks; U3/R4 has legal moved-rook identity and distinct art; R5 lifecycle/accessibility/mode checks passed; R6 remains scoped; U4/R7 retains current portrait/landscape evidence and a draft-only handoff. Owner visual acceptance remains a separate open gate.

Only the Codex CLI was installed for peer routing. The adversarial review used the documented local fallback; no independent cross-model review is claimed.

## Owner visual acceptance — NOT RUN / NOT ACCEPTED

Agent inspection of rendered frames and sampled recording sequences can establish what was drawn and whether transitions, fire and controls are present. It cannot approve the character, perceived anatomy, expressive motion, fire spectacle, pacing or repeated-play comfort for the owner.

The owner still needs to watch full Normal and Fast sequences in board and arena presentations on physical portrait and landscape phones, then judge pose continuity/crossfade ghosting, connected anatomy at every beat, mouth/fire connection, larger breath, colourful impact, target readability, emergence/return and replay fatigue. Reduced motion also needs comfort review. Verify iOS Safari and Android Chrome, browser bars/safe areas, high density, mid-capture rotation and thumb access to controls.

The PNG pack is approximately 13MB on disk; cold readiness/cancellation is tested, but physical-device frame rate, memory and download/decode comfort are unmeasured. The board/UI and other characters retain deliberate placeholders; no full-roster implementation, new chess rules or sound pack is claimed. Owner approval of final artwork/choreography remains open.
