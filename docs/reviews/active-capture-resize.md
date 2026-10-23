# Active-capture resize recovery

Date: 2026-10-23. PR #7 is **MERGED** into `recovery/2026-10-22`, at `4ab948ccd391d7dc07ff24768352dbbe87b81ff0` (merged 07:12:08 UTC). Explicitly fetched that branch before creating `fix/active-capture-resize-wrap`; checkout was clean. No merge or deployment is authorized for this task.

## Investigation and scope

Followed root `AGENTS.md`, the product/rules/architecture/attack/test documentation, the [Phase 2 plan](../plans/2026-10-23-0210-fix-recovery-mobile-usability-plan.md), and the [Phase 3 plan](../plans/2026-10-23-0500-chore-recovery-tooling-docs-plan.md). Those plans provide the recovery constraints; this is the separately requested follow-up to Phase 3's reproduced runtime defect. CE `ce-work` classified the concrete prompt as small/medium and used native inline execution; no new substantial planning or separate `ce-plan` run was needed. No CE configuration or solutions corpus exists; artifact root defaults to `docs`.

The first five baseline repetitions of the existing phone-390 touch-resize test all passed, illustrating why a single rerun is insufficient. A diagnostic-only test then repeated it 15 times: **13 passed, 2 failed**. Canvas measurement instrumentation captured the failing sequence: Chromium briefly reported `innerWidth === 4` during orientation change. Phaser's advanced wrapper reduced the first emoji/character to an empty string and threw `wordWrapWidth < a single character`. Later label updates also threw against the retained narrow width, including while restoring the desktop font size before updating the wrap width. Diagnostic code was removed before delivery.

`AttackScene.layoutStage()` now applies font size and advanced wrap width together with `setStyle()`, with a minimum width of two font sizes. This accommodates the shipped label glyphs during transient tiny dimensions; ordinary phone/tablet/desktop proportional widths, text, placement, and font sizes are preserved. The minimum is a rendering safety floor, not a claim that a 4px stage is usable. No changes to chess rules/state, animation timings, presenter choreography, controller, director, input, dependencies, or browser configuration.

## Regression proof and checks

Added `e2e/attack_resize.spec.js`, exercising real Phaser text and the existing parent ResizeObserver against production preview. It forces the parent to 4px while a capture is active, advances into another presentation phase, restores it, and swaps viewport dimensions. Generic and Fire Dragon captures each exercise natural completion and deliberate Skip, input lock/turn preservation during attack, immediate Skip/Escape completion, a single canvas, Undo/recapture, and advancement beyond original timelines without duplicate effects. The shared page-error fixture remains unchanged and still fails on every uncaught application error. Browser-level coverage is used because the existing jsdom canvas stub reports zero text widths and presenter mocks bypass real Phaser wrapping.

Before the production fix, the new generic/Skip phone-390 test failed with the exact word-wrap exception both from the timeline callback and the page-error fixture (**1 failed**). After the fix, all four new phone-390 scenarios passed (**4 passed**, 1.4m), before the review tightened immediate Skip assertions.

Runtime: Node **24.19.0**, npm **11.9.0**, lockfile unchanged. Cloud dependency refresh installed 262 packages successfully.

| Check | Current outcome |
| --- | --- |
| `npm test` | 6 suites, 61 tests passed |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed, including updated browser assertions |
| `npm run build` | Passed; retained large-chunk warning, JavaScript 1,787.89 kB / 432.51 kB gzip |
| `npm run dev -- --strictPort` | Served root HTML and transformed `/src/main.tsx` on port 3000 |
| Existing browser coverage across five projects | 38 passed, 2 intentional desktop skips |
| Corrected new resize cases across five projects | 20 passed, 0 failed, 0 skipped, 0 flaky; 10.0m |
| Original intermittent phone-390 resize scenario, repeated ten times | 10 passed, 0 failed, 0 skipped, 0 flaky; 56.3s; no retries |
| `git diff --check` | Passed |

All browser runs use the repository's production-preview configuration through the existing Cloud wrapper selecting `/usr/bin/chromium`. No bundled-browser or physical-device pass is claimed locally. Commands for the completed full run, corrected resize suite, and repeated original scenario:

```bash
DRAGON_CHESS_ARTIFACTS=/workspace/dragon-chess-artifacts/resize-final-matrix \
  npx --no-install playwright test --config=/workspace/dragon-chess-playwright.config.mjs --workers=2
DRAGON_CHESS_ARTIFACTS=/workspace/dragon-chess-artifacts/resize-corrected \
  npx --no-install playwright test --config=/workspace/dragon-chess-playwright.config.mjs attack_resize --workers=2
DRAGON_CHESS_ARTIFACTS=/workspace/dragon-chess-artifacts/resize-repeated \
  npx --no-install playwright test --config=/workspace/dragon-chess-playwright.config.mjs \
  --project=phone-390-portrait --grep 'touch Skip' --repeat-each=10 --workers=2
```

An initial four-worker full-matrix attempt was stopped after 10.0m: **26 passed, 6 timed out**, with 4 cases interrupted and the remaining cases unexecuted/intentionally skipped. All six timeouts were new resize cases exceeding the original 120-second budget; inspection of traces showed no word-wrap exceptions. This is not a passing matrix. The next full run reduced worker contention to two and used a 180-second budget consistent with existing long lifecycle coverage. It completed **56 passed, 2 intentional desktop skips, 2 failed, 0 flaky**, 13.3m. All **38 existing browser cases passed**. The two failures were the new Fire Dragon natural-completion assertions on phone-390 and tablet: after a fixed 3000ms browser-clock advance, Phaser still reported `attacking`. Phaser independently smooths frame deltas (`TimeStep.smoothDelta`), so browser-clock duration is not a reliable completion signal. Completed traces contain zero word-wrap exceptions.

Corrected the test to advance in 200ms steps until the observable state is idle, with a 90-second wall-clock bound. Immediate Skip/Escape assertions remain separate, followed by 6000ms of clock advancement for stale callbacks. Reran all 20 affected resize cases across the same five projects rather than repeating the unchanged 40 browser cases again. The final evidence combines the unchanged suite from the completed full run with the corrected new cases; no single all-green 60-case invocation is claimed.

## CE review and follow-up

Completed `ce-code-review`, run `20261023-active-capture-resize`, [saved receipt](active-capture-resize-ce-review.json). Full review used fresh correctness, project-standards, and testing contexts; root `AGENTS.md` was the instruction-file criteria fallback. Binary screenshots triggered the full scope path. No cross-model pass was selected for this small synchronous rendering change; no specialist, learnings/packs, agent-native, or deployment review ran. These independent contexts use the same serving family.

Review found **one P2 test weakness**, independently validated: advancing the entire animation before checking Skip could mask an ignored Skip tap or Escape key. Applied finding #1 inline: assert idle and black's turn after 32ms, then advance beyond the original timeline and assert again. No production-code findings. The receipt accurately preserves the pre-follow-up verdict `Ready with fixes`; the current verification table establishes the applied result. A [narrow testing-review follow-up](active-capture-resize-review-followup.json) verified the immediate assertions and bounded natural-completion wait by inspection; it did not execute tests. The follow-up's pending runtime evidence is now closed by the corrected 20-case pass and ten successful repetitions. No justified review finding is intentionally deferred. Simplification inspection found no useful abstraction for the small text-style change; no separate simplification skill ran.

## Visual evidence and remaining limitations

Inspected these actual restored phone-390 landscape captures:

- [Generic capture and reachable Skip](assets/resize-generic-restored.png)
- [Fire Dragon capture](assets/resize-fire-dragon-restored.png)

Labels and Skip are readable in the inspected phone captures. Also inspected the corrected desktop post-capture board (resized to 768x1366): pieces, turn banner, and Undo/Restart were visible. One paused-clock desktop attachment taken immediately after resize was blank before a subsequent Phaser redraw; it does not establish active-stage visual acceptance. The screenshots also show the existing limitation: in-flight artwork retains its initial timeline coordinates and can overlap labels or be clipped after rotation. This fix does not reposition animated artwork or change choreography. A 4px transient canvas itself is not a usable layout. The two-font-size floor covers current shipped labels/fonts; future fonts or substantially different glyphs need verification.

Local JSON, HTML reports, screenshots, and traces are under `/workspace/dragon-chess-artifacts/resize-{baseline,diagnostic,red,green,matrix,final-matrix,corrected,repeated}/`. Those workspace reports are not GitHub-hosted downloads. Committed screenshots above remain reviewable in the PR; CI's `playwright-report` artifact retains portable traces/screenshots for 14 days when its run completes. CI status must be reported separately from local checks.

Physical iOS Safari/Android Chrome, browser bars/safe areas, child/thumb comfort, animation aesthetics, audio with real assets, and quantitative performance/memory acceptance remain outstanding. Existing bundle size and artwork-coordinate limitations remain. No merge, auto-merge, or deployment.
