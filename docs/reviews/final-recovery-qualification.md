# Final recovery qualification

Date: 2026-10-23. [Qualification plan](../plans/2026-10-23-final-recovery-qualification-plan.md).

**Outcome: not ready to merge.** A current tablet render-check failure and matching retried failures in exact-tip Ubuntu CI leave visual/regression qualification unresolved. A draft PR is suitable for review and tracking these gates; it must remain draft pending resolution and acceptance decisions.

## Candidate and integration

- Recovery candidate: `9899abcf6f2f810ef2d9ccaa4e0de289454d97f8` on `recovery/2026-10-22`, the merged PR #9 result.
- Main baseline: `c6a254fda2378e0fd4706f6afbea8d9a7e9f30b0`.
- PRs #4, #5, #6, #7, #8, and #9 are merged into recovery. Their changes cover Cloud guidance, attack cancellation/navigation, mobile layout and browser coverage, npm/tooling consolidation, near-zero-width text wrapping, and capture-artwork containment during rotation.
- Main is an ancestor of the candidate. The integrated recovery diff is 52 files before qualification documentation; the authoritative `src/chess/` implementation is unchanged from main.
- Qualification began with a clean checkout and uses `qualification/recovery-2026-10-23`, based on that exact recovery tip. This task changes documentation and retained evidence only. Application source, tests, manifests, lockfile, and configuration remain byte-identical to the candidate.

## Current checks

Local commands below were executed for this qualification; the CI row separately records an inspected exact-tip run, rather than relying on earlier PR prose. Environment: Node 24.19.0, npm 11.9.0, Vite 6.4.3, system Chromium 154.0.8037.57 on Debian 13.

| Check | Result |
| --- | --- |
| Cloud dependency refresh | Clean npm lockfile install succeeded; matching fingerprint reused after task-branch creation |
| `npm test` | 7 suites, 69 tests passed |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed without diagnostics |
| `npm run build` | Passed; JavaScript 1,788.17 kB / 432.60 kB gzip |
| Production preview | HTTP 200; HTML references built JS/CSS assets |
| Full production Playwright matrix | **57 passed, 2 intentional desktop touch skips, 1 failed**, 0 flaky classifications, no retries; 60 cases, 26.2 minutes |
| Isolated tablet failure characterization | Same case unchanged, `--repeat-each=3 --workers=1`: 3 passed in 2.5 minutes; does not replace the failed full run |
| CE integrated code review against main | Complete; no retained application defects; one P3 README finding corrected and independently checked |
| Exact recovery-tip CI | [Workflow succeeded on `9899abc`](https://github.com/tamundrud/dragon-chess/actions/runs/40006294640), but Playwright reported **55 passed, 3 flaky, 2 skipped**; green status includes retries |
| Qualification documentation checks | Relative Markdown targets, retained JSON, whitespace and unchanged application/test/tooling scope checks passed |

Browser command, run from the repository root after building:

```bash
DRAGON_CHESS_ARTIFACTS=/workspace/dragon-chess-artifacts/final-qualification/browser \
  npx --no-install playwright test \
  --config=/workspace/dragon-chess-playwright.config.mjs --workers=1
```

The external Cloud wrapper selects system Chromium, preserves all committed projects and assertions, owns production preview on port 4173, and retains screenshots/traces. This is the project's Playwright suite, not CE's browser-driver workflow. The separate exact-recovery-tip CI result above verifies bundled-browser/Ubuntu execution. iPhone/iPad project names still use Chromium, not Safari.

## Blocking render-check instability

The current full local matrix failed the tablet `generic capture survives a transient narrow resize and Skip` case. After the first rotation to 1024 × 768, `expectCombatantsVisible` timed out waiting for rendered status-label pixels (`counts.status > 40`, 5-second poll). The [failure screenshot](artifacts/final-recovery/tablet-render-failure.png) has a blank canvas while React still shows the white turn and disabled Undo/Restart. The test did not reach its combatant assertions, narrow-width step, or Skip action. Do not describe this as a failed Skip implementation or dismiss it as proven screenshot-only behavior. The [complete case summary](artifacts/final-recovery/browser-summary.json) records desktop 10 pass/2 skip, all three phone projects 12 pass each, and tablet 11 pass/1 fail. Nineteen of twenty capture-artwork rotation cases passed. The failed predicate is the only recorded full-run test failure; no uncaught application page-error failure was reported.

Inspection of the exact-tip Ubuntu CI job log found the same status-label predicate timeout in generic Skip rotation cases on desktop, phone-360 and phone-390. CI retries allowed those three cases to finish as flaky; the workflow's green status is not a clean first-attempt browser pass. [Retained CI excerpt](artifacts/final-recovery/recovery-ci-render-excerpt.txt). This makes the instability broader than a single Cloud tablet observation, although its root cause remains unproven.

An isolated unchanged rerun passed all three repetitions in 2.5 minutes ([rerun summary](artifacts/final-recovery/tablet-rerun-summary.json)). Command: the same Cloud wrapper with a separate `tablet-rerun` artifact directory, `--project=tablet --grep 'generic capture survives a transient narrow resize and Skip' --repeat-each=3 --workers=1`. Together with the original failure, this establishes intermittency in this environment, not resolution.

Required follow-up: distinguish an application render/resize defect from paused-clock, WebGL readback or synchronization behavior; retain the current visibility/error assertions; add or repair a regression only with evidence that its render-ready condition is independent of the artwork being judged; rerun the affected production cases and full matrix with no unexplained failures. No gameplay or test-harness fix is made in this qualification task. The targeted rerun cannot replace the failed full-run result.

## Regression coverage and limits

| Concern | Current evidence | Limit |
| --- | --- | --- |
| Authoritative chess state | Existing controller tests cover representative moves/captures, illegal rejection, kingside castling, castling-through-check rejection, en passant, queen promotion, knight capturing promotion, check/mate/stalemate, insufficient material, Undo/Restart | Test names overstate all castling/promotion choices; queenside, other promotion choices, repetition and fifty-move behavior are not exhaustively asserted |
| Capture commitment | Director and manager tests cover lock/unlock, single callback, completion, Skip, disabled/Instant, reduced motion, duplicate rejection and presenter cleanup | Mocked tests do not prove every rendered frame or every settings combination; production animated reduced-motion/Fast rotation and exact-once behavior when presenter Skip/cleanup throws lack dedicated regressions |
| Navigation/cancellation | Manager/director tests cover stale callbacks, owner-scoped abort, destroy-before-ready and detached resize callbacks; browser cases leave generic and Fire Dragon attacks and start new games | Browser repetition is bounded, not a long-session memory proof |
| Phone interaction | Five production projects cover menu/settings widths, legal and illegal input, Undo/Restart, persistent settings state, trusted touch, rotation and one canvas | No real Safari/Android hardware, safe-area/browser-bar behavior, or physical tap comfort |
| Capture resize | Both presenters, natural completion and Skip, rotation and rotation back, transient 4px parent width, primary artwork pixel assertions, delayed-callback window, Undo and recapture | Pixel assertions check selected combatant frames, not all effects or animation aesthetics; zero-size geometry is unit evidence |
| Promotion and status UI | Controller/unit evidence and existing UI implementation | No production-browser promotion choice/cancellation or long check/checkmate status assertions on phones; capturing-promotion attack context assertion remains permissive |
| Audio and performance | Missing/rejected optional audio tolerated; lifecycle cleanup assertions | No shipped sound pack, audible-hardware acceptance, quantitative frame-rate/memory measurements, or representative mobile load budget |

No tests were added, removed, skipped beyond existing declarations, or weakened during qualification. Historical Phase 3 failures remain historical evidence; their follow-up fixes are documented in [active-capture resize](active-capture-resize.md) and [board rotation](board-rotation-artwork.md).

## CE review evidence

[Full integrated review receipt](artifacts/final-recovery/ce-integration-review.json): eight separately dispatched local reviewer contexts covered correctness, AGENTS standards, testing, maintainability, frontend races, reliability, adversarial review, and agent-facing guidance. An independent validator and separate merge/report contexts completed the review. No application defect was retained.

The original `9899abc` snapshot received **Ready with fixes** because README still reported Phase 3 counts and resize defects subsequently fixed by #8/#9. This task corrects that prose and current evidence pointers in README, roadmap and test plan. The [independent README correction follow-up](artifacts/final-recovery/readme-correction-followup.md) confirms the correction while preserving the original finding in its receipt. The qualification link now resolves to this report.

[Plan document review](artifacts/final-recovery/ce-plan-review.json) completed with no findings across coherence, feasibility, design, scope and adversarial local reviewers. Different-provider cross-model review was unavailable; only the Codex CLI was installed. These are separate local contexts on the session model family, not cross-model corroboration. The integration review did not execute tests; the current command results above are separate evidence.

## Visual inspection

Agent inspection covered desktop and phone-360 menu, board and settings, phone-390 settings, phone-landscape board/settings, tablet board, generic capture preparation/impact after resize, Fire Dragon preparation/flame after resize, and phone-360 generic/Fire Dragon rotation samples. The inspected nonblank capture frames contain primary combatants, labels and Skip. Short landscape uses vertical scrolling; lower settings controls are below the initial modal scroll position. Temporary art is visibly marked; lettered tokens, a dark board palette, and smaller uniformly fitted capture artwork remain readability/art-direction acceptance concerns. Screenshots do not establish the intended illustrated storybook target or motion comfort.

Selected current examples: [phone board](artifacts/final-recovery/phone-360-board.png), [phone settings](artifacts/final-recovery/phone-360-settings.png), [Fire Dragon landscape flame](artifacts/final-recovery/fire-dragon-landscape.png), and [generic portrait recovery](artifacts/final-recovery/generic-portrait.png). [Ordinary-clock observations](artifacts/final-recovery/natural-rotation-observations.json) record phase transitions rather than implying every screenshot captures the same phase.

One paused-clock Fire Dragon phone-360 portrait attachment (`Fire Dragon-complete-rotated-back`) contains a blank WebGL canvas even though the independently synchronized pixel assertion immediately before it passed. It is retained in the full evidence, not treated as a visual pass. A supplemental ordinary-clock browser observation rotated both capture flows from 360 × 800 to 800 × 360 and back: generic preparation/recovery and Fire Dragon flame frames rendered, both flows returned to the black turn with one canvas and no page errors, and the final Fire Dragon portrait screenshot showed the completed board. That last screenshot is a completion frame, not proof of active Fire Dragon portrait composition. This did not reproduce a persistent blank canvas in normal time; paused-clock attachments are limited evidence and do not settle hardware rendering acceptance.

The supplementary script and its state/error observations are retained outside the repository with the full Cloud evidence. It changes no application or committed test code and does not add cases to the Playwright matrix count.

## Outstanding manual acceptance

All items below remain **open**. A human tester/product owner should record device/browser version, tested candidate SHA, result, evidence, and sign-off before treating the corresponding requirement as accepted. No owner or completion date has been invented.

| Gate | Required acceptance |
| --- | --- |
| Physical devices | Play on iOS Safari and Android Chrome, portrait/landscape, browser bars expanded/collapsed, notches/safe areas, high-density screens; retain readable board/status/labels and reachable controls |
| Touch comfort and scrolling | Verify thumb selection/deselection, moves, Skip, settings, Undo/Restart; verify page and settings-modal scrolling on short landscape screens with the retained 300px canvas minimum |
| Intended child user | The intended child completes moves, Undo/Restart, settings, promotion selection/cancellation, capture Skip, and return to menu without assistance |
| Promotion and game status | Reach promotion, capturing promotion, check, checkmate and draw in real games on phones; verify choices, cancellation, status wrapping, and unobscured controls |
| Motion and visual quality | Judge generic and Fire Dragon captures at Normal/Fast/Instant and reduced motion; rotate during preparation/strike/impact/recovery; assess composition, label readability, impact comfort and smaller fitted art |
| Art direction | Decide whether temporary lettered tokens and procedural capture artwork are acceptable for this recovery milestone; illustrated storybook assets and remaining bespoke presenters are deferred product work |
| Audio | Add/approve actual sound assets in a separate scoped task, then verify hardware unlock, mute, volume and interruption behavior; absence of audible playback cannot be accepted from the current asset-free build |
| Performance | Measure frame rate, responsiveness and memory over repeated captures/navigation on representative phones; define the acceptance budget before sign-off |

## Risks and readiness

**Not ready to merge:** resolve or conclusively explain the render-check instability above and obtain fresh regression evidence. The completed static CE review and passing unit/static/build checks do not override the failed runtime gate. Keep the recovery PR draft; record human acceptance or explicit milestone deferral of the open product/device gates before a final merge decision. No merge or deployment is performed by qualification.

Known risks: the production bundle exceeds Vite's 500 kB warning threshold; fitting the fixed artwork space makes combatants smaller on narrow/short canvases; temporary art is not the final storybook design; quantitative mobile performance is unmeasured; no sound pack ships. These are disclosed limitations, not passed acceptance gates.

## Evidence and delivery

Complete Cloud command logs, full Playwright JSON/HTML reports, all screenshots and traces live under `/workspace/dragon-chess-artifacts/final-qualification/`. Selected screenshots, case-level results, CI failure excerpts and CE receipts are committed under `docs/reviews/artifacts/final-recovery/`; build hashes and unchanged-source evidence are in [the candidate record](artifacts/final-recovery/candidate.json).

A compact downloadable handoff archive contains the full result JSON, logs, review artifacts, ordinary-clock observations and selected traces (including the failed tablet case). It is a selected-evidence bundle, not the entire HTML report. The draft recovery PR targets `main` from `qualification/recovery-2026-10-23`, carrying the verified recovery candidate plus qualification documentation/evidence only. Its actual URL and live CI status accompany the handoff. New CI success does not erase the local failure or exact-tip flaky history above.
