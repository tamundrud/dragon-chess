# Recovery rendering and CI clock investigation

Date: 2026-10-24. [Plan](../plans/2026-10-24-fix-render-clock-plan.md). Addresses the intermittent failures identified in [recovery PR #10](https://github.com/tamundrud/dragon-chess/pull/10).

## Debug summary

**Problem:** tablet capture rotation and generic Skip CI cases intermittently timed out with a blank canvas.
**Root cause:** the old tests paused a running auto-advancing clock while a RAF tick was in flight; virtual time could rewind behind its queued next frame. Resize then cleared the canvas without a subsequent frame during the bounded pixel poll.
**Recommended tests:** retain the existing rotation and Skip cases, repeat the formerly flaky cases without retries, and use blank-render, known-clipping and forced-flake negative controls.
**Fix:** pause the test clock before navigation and explicitly advance readiness/input; use the same setup for all clocked cases.
**Prevention:** preserve all pixel/error/lifecycle guards and make CI reject flaky classifications even after a successful retry.
**Confidence:** high in the observed causal chain; final matrix and repetition results are recorded separately below.

## Scope and result

Started from freshly fetched `recovery/2026-10-22` at `9899abcf6f2f810ef2d9ccaa4e0de289454d97f8`, with a clean tree. The focused branch is `fix/recovery-render-qualification`. Application source, manifests, lockfile, game timings and rendering configuration remain unchanged. The built HTML/JS/CSS are byte-identical to the recovery candidate; [hashes](artifacts/render-clock/build-hashes.json).

The reproduced blank-canvas failure is caused by test-clock scheduling and requires no production rendering change. The full current browser matrix passes all 58 applicable cases without retries, including all 20 artwork-rotation cases. This does not establish that every possible hardware rendering defect has been ruled out; the separate full-page attachment limitation below remains explicit.

## Diagnosis and causal evidence

1. The old `e2e/attack_resize.spec.js` installed an auto-advancing Playwright clock, loaded Phaser and made moves, then called `pauseAt(new Date())` while the animation-frame loop was active. The two clocked Skip cases in `e2e/game.spec.js` used the same pattern.
2. In the installed Playwright 1.54.1 clock implementation, an auto-advance `_runTo` can be in flight when `pauseAt` starts another advancement. `_callFirstTimer` yields through a native timeout; `_runTo` finally assigns its original target with `_advanceNow(to)`. An older in-flight advance can therefore finish after the pause and move virtual time backward, while the next RAF retains its future due time. Relevant dependency functions are `ClockController._updateRealTimeTimer`, `_runTo`, `_callFirstTimer` and `pauseAt` in the generated clock source; no dependency is patched or upgraded here.
3. Frame and canvas-size instrumentation reproduced the original symptom on unchanged application code: the last rendered frame observed time 5807ms, then canvas resize occurred at virtual time 3063ms. Width/height changes normally clear the canvas. Fifteen 32ms probe advances captured zero status pixels and no new frames.
4. At the end of that stall, the clock was at 3643ms with 82 frames observed; its only queued timer was an animation frame due at 5808ms. Advancing 2197ms to 5840ms caused frames 83–85 to render, each with 2613 white status-label pixels. The attack was still `preparing`. No scene, artwork, renderer setting or gameplay code changed to restore the image.

[Compact frame/timer observations](artifacts/render-clock/clock-stall-probe.json), [stalled canvas](artifacts/render-clock/clock-stalled.png), and [render restored by reaching the queued frame](artifacts/render-clock/clock-resumed.png). The probes wrap RAF and canvas sizing and read pixels for diagnosis only; they are not production instrumentation or part of the committed test implementation.

The competing screenshot/compositor-only explanation is insufficient for this reproduction: the frame count itself stopped, and the clock's queued RAF explains why. The resize path cleared its backing store as expected and rendered correctly when the queued frame ran. Increasing a real-time timeout or preserving the WebGL drawing buffer would not correct ownership of virtual time.

## Focused fix and preserved coverage

`e2e/helpers.js:20` now supports explicitly paused-clock startup: install and pause before navigation, then drive game readiness with bounded 32ms advances. Navigation creates a fresh document whose clock setup is replayed before application timers/RAF are scheduled. The chosen fixed wall times precede application startup; they do not change game chronology. This avoids handing an already-running application from automatic to manual time advancement.

`e2e/attack_resize.spec.js` and the two clocked Skip cases in `e2e/game.spec.js` use that startup and advance a frame after move input. Other real-time tests retain ordinary startup. All prior assertions remain: status readiness, attacker/defender pixel thresholds, rotation and rotation back, the transient 4px resize, locked input, natural completion/Skip, one committed capture, Undo/recapture, one canvas and delayed-callback windows. The page-error fixture is unchanged. There is no retry of missing artwork and no timeout or pixel threshold increase.

`playwright.config.js:8` adds `failOnFlakyTests` in CI. Existing CI retries remain for diagnostics, but a retry-assisted pass now fails the job rather than hiding instability. Browser projects, renderer selection and the environment's system-Chromium wrapper are unchanged.

## Current verification and negative controls

Environment: Node 24.19.0, npm 11.9.0, Playwright 1.54.1, system Chromium 154.0.8037.57 on Debian 13. Production preview, not the development server, serves the tests.

| Check | Outcome |
| --- | --- |
| Unchanged recovery reproduction | Original status-label predicate timeout reproduced in generic Skip on desktop; fail-fast diagnostic run stopped remaining repetitions |
| Focused fixed desktop/tablet cases | 2 passed, no retries |
| Unit tests | 7 suites, 69 passed |
| Typecheck / lint | Passed without diagnostics |
| Build | Passed; existing large-bundle warning remains; app assets byte-identical |
| Full production matrix | **58 passed, 2 intentional desktop touch skips, 0 failed, 0 flaky**; all 60 cases attempted once, `CI=1`, two workers, `--retries=0`, 25.0 minutes |
| Additional repeated formerly flaky cases | **4 passed, 0 failed, 0 flaky**; separate desktop, phone-360, phone-390 and tablet generic Skip rerun, no retries, 2.6 minutes |
| CE simplification and code review | Completed; no findings or edits; scope and limitations below |

The negative controls run in separate artifact/source directories; their expected failures are not application regression failures:

- **Blank rendering:** the revised tablet generic Skip case runs against the current app while test-only init instrumentation suppresses WebGL draw calls. It still fails the unchanged five-second status-pixel readiness predicate.
- **Real artwork defect:** the revised helpers and rotation test run against a clean source archive of pre-PR #9 recovery `5b157d4a1abd4ea023c9a5be6430c1ab7e1fe26b`. The phone-landscape generic Skip case passes render readiness but fails the original defender threshold with **0 pixels**, where **more than 40** remain required. The clock correction does not hide the original clipping defect.
- **Flaky CI classification:** a separate deliberately flaky fixture fails once and passes on retry using the committed CI configuration. Playwright reports one flaky case and exits **1**, proving the stronger gate. No synthetic fixture is added to the real suite.

[Control-run statistics](artifacts/render-clock/controls.json). Raw JSON, traces, scripts and logs remain under `/workspace/dragon-chess-artifacts/render-investigation/`. The baseline fail-fast run includes interrupted/not-run cases; those are diagnostic stops, not new test skips in the project.

[Complete full-matrix case summary](artifacts/render-clock/full-matrix-summary.json): desktop 10 pass/2 skip; each phone project and tablet 12 pass. Every case has one attempt with retry index 0. The paused-clock migrations preserve ordinary-time navigation and capture tests as well as all rendered-pixel and exact-once lifecycle checks. [Phone-390 generic capture sample](artifacts/render-clock/generic-phone-390.png).

Agent inspection of the tablet generic Skip screenshots after rotation and rotation back found visible combatants, labels and Skip in both orientations; [rotated tablet sample](artifacts/render-clock/tablet-rotated.png). These sampled frames support the test result, not physical-device or motion-aesthetic acceptance.

[Additional repeat summary and exact command](artifacts/render-clock/repeated-skip-summary.json). These are four fresh executions after the full matrix, each with one attempt at retry index 0.

Full matrix command:

```bash
CI=1 DRAGON_CHESS_ARTIFACTS=/workspace/dragon-chess-artifacts/render-investigation/full-matrix \
  npx --no-install playwright test \
  --config=/workspace/dragon-chess-playwright.config.mjs --workers=2 --retries=0
```

## Review and delivery

CE-debug supplied the reproduction, hypothesis comparison, causal trace and counterfactual. The minimal test-only fix used native inline execution because setup and callers share the clock contract. [CE simplification](artifacts/render-clock/ce-simplify.json) completed five local reviewer contexts with no findings or edits and protected the proof tests/helper code. [Full code review](artifacts/render-clock/ce-code-review.json) covered correctness, AGENTS standards, testing, frontend races and adversarial verification fidelity on the four fix-owned test/config files against `9899abc`. Separate merge/report contexts completed the receipt; no findings required a validator. No review mutation occurred, so no review-driven retest was needed.

Only Codex CLI was installed; no different-provider cross-model route was available. These are separate local contexts, not cross-model corroboration. The review's code-gate verdict does not assert browser validation or human acceptance is complete. The added documentation was checked separately for link validity, evidence consistency and scope.

Post-fix quality scope: four fix-owned test/config files against the clean pre-fix `9899abc` tree. Simplification made no edits; code review retained no findings or residuals. Root-owned unit/static/build checks and browser validation are separate from those reviewer outcomes.

No gameplay changes, merge or deployment are part of delivery. The draft PR targets `recovery/2026-10-22`, not main or PR #10's documentation branch. New PR CI is separate from the local results above. CE PR babysitting is skipped because this delivery is explicitly a draft; merging and deployment remain excluded. After integration, recovery-to-main qualification must use the resulting recovery head.

## Remaining risks and acceptance

Pausing before bootstrap avoids the observed Playwright 1.54.1 scheduling race; it is not an upstream library patch or a guarantee about future versions. The virtual-time cases deterministically exercise an active capture; ordinary-time navigation and capture cases remain in the full suite as complementary coverage. Pixel thresholds check representative rendered frames, not every effect boundary or motion aesthetics. Future tests using this paused mode must explicitly drive startup/input rather than adding a mid-game auto-to-manual handoff. CI now deliberately fails on any newly exposed flaky classification; retries retain evidence rather than approving it.

Separate screenshot evidence limitation: the full run's phone-360 `Fire Dragon-Skip-rotated-back` full-page attachment is blank despite the preceding independently captured pixel check passing. This is a second capture, not the image judged by the pixel assertion. The [attachment](artifacts/render-clock/full-page-attachment-limitation.png) is retained and is not counted as visual acceptance. Its capture/compositor behavior is not conclusively diagnosed here; this fix addresses the demonstrated queued-RAF clock stall and does not certify every paused-clock full-page screenshot. Representative nonblank assertion-adjacent screenshots are inspected separately. No missing-artwork assertion is removed or retried to accommodate this limitation.

Physical iOS Safari/Android Chrome, safe areas/browser bars, high-density and thumb readability, short-landscape scrolling, child usability, promotion/status UI, motion/art quality, real audio assets/hardware and quantitative frame-rate/memory acceptance remain open as described in [the test plan](../TEST_PLAN.md). No sound pack ships. The production bundle still exceeds Vite's warning threshold. Resolving this test instability does not by itself complete final product or recovery-to-main acceptance.
