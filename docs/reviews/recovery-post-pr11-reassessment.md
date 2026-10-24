# Recovery reassessment after PR #11

Date: 2026-10-24. Target: draft [PR #10](https://github.com/tamundrud/dragon-chess/pull/10), against `main`. [Practical manual acceptance checklist](recovery-manual-acceptance.md).

**Decision: retain draft status pending human acceptance or explicit milestone deferrals.** PR #11 supplies a causal explanation and a test-only correction for the former render-check blocker. That automated instability is distinct from the unresolved screenshot-attachment limitation and from physical-device/product acceptance. Neither passing CI nor this reassessment grants merge or deployment approval.

## Refreshed candidate

- PR #11 merged at `2026-10-24T16:02:39Z` into `recovery/2026-10-22`: `30f94421a5259246c209b4384787db7254ac27bd`.
- Original PR #10 head: `c4a81f4aa75d7352f0501b7edc87a762487aace6`; recovery/main common integration baseline: `c6a254fda2378e0fd4706f6afbea8d9a7e9f30b0` on main.
- Clean integration commit in the existing qualification branch: `baf6baad8c04edf67f447620a14555bf5733c8c0`. Both the original qualification head and current recovery tip are ancestors. The original checkout was preserved; reassessment used a separate checkout.
- Against latest recovery, the refreshed qualification adds documentation and evidence only. `src/`, `e2e/`, dependencies/lockfile, CI and runtime/test configuration match recovery exactly. No new application development, dependency upgrade or weakened assertion was made.
- The [2026-10-23 qualification](final-recovery-qualification.md) remains historical evidence of a real failed run. Its failure is not rewritten as passed. This reassessment supersedes its current-readiness statement.

## Verified evidence and its limits

| Evidence | Result and interpretation |
| --- | --- |
| Fresh unit tests on integrated candidate | `npm test`: **7 suites / 69 tests passed** |
| Fresh static checks | `npm run typecheck` and `npm run lint` passed without diagnostics |
| Fresh production build/preview | Build passed; preview returned built HTML/assets. Existing JS bundle warning remains: 1,788.17 kB / 432.60 kB gzip |
| CI on exact merged recovery tip | [Run 40109728108](https://github.com/tamundrud/dragon-chess/actions/runs/40109728108), push event, head `30f94421a5259246c209b4384787db7254ac27bd`: completed successfully at 16:17:35Z. API inspection confirms install, unit, typecheck, lint, build and Playwright steps succeeded |
| CI fidelity | Committed CI builds before production-preview Playwright execution. `failOnFlakyTests: !!process.env.CI` rejects retry-assisted success while retaining retries for diagnostics. A successful Playwright step under this gate cannot be credited as a tolerated flaky result |
| CI access limit | API status/job/step metadata was inspected. Raw log download redirected to a host denied by the environment; no raw CI test count or screenshot inspection is claimed from that metadata |
| Fresh qualification-branch browser evidence | Executed separately against the production build with system Chromium and the unchanged committed suite, `CI=true`, `--workers=1 --retries=0`. Final counts and downloadable evidence accompany PR #10's refreshed handoff; do not substitute historical counts below for that result |
| Refreshed PR #10 CI | Separate from recovery-tip CI and historical PR #10 runs. The PR handoff records the exact new head and its live push/PR checks; old green checks on `c4a81f4` do not validate the refreshed head |
| Prior #11 evidence, inspected as historical support | [Investigation](recovery-render-clock.md): 58 passed / 2 intentional desktop touch skips / 0 failed or flaky in its full matrix; four additional formerly flaky generic-Skip executions passed without retries. These are #11's recorded runs, not newly executed reassessment counts |
| Negative controls, historical #11 evidence | Blank draw suppression still failed status readiness; pre-#9 artwork still failed the combatant threshold; forced retry-assisted success exited 1. Controls were inspected, not newly rerun in this documentation/integration task |

Environment for fresh local checks: Node 24.19.0, npm 11.9.0, Playwright 1.54.1, Debian 13 system Chromium 154.0.8037.57. iPhone/iPad viewport projects use Chromium; they do not test Safari. The project Playwright run is separate from CE's browser-driver workflow. No physical-device testing was performed.

## Reconciliation of outstanding risks

| Previous concern | Reassessment | Disposition |
| --- | --- | --- |
| Tablet/CI status-pixel timeout before Skip | #11 reproduced backward virtual-time movement during the old running-clock `pauseAt` handoff; the queued RAF stayed ahead of the paused clock. Advancing to it restored drawing on unchanged app source. Pausing before startup and driving input/readiness removes that handoff | Earlier automatic render-check blocker has a supported cause/fix and clean merged-tip CI. Fresh qualification results remain separately required; a new unexplained failure would reopen the gate |
| Retry-assisted CI looked green | `failOnFlakyTests` now rejects flaky classifications; no thresholds, error guards, timeouts or renderer settings were relaxed | Corrected for future CI. Old 55-pass/3-flaky results remain historical failures of qualification |
| Blank phone-360 full-page attachment after passing independent pixel assertion | Separate capture/compositor behavior remains unexplained. The image being asserted and the later attachment are distinct | Open evidence limitation. Do not count a blank attachment as visual acceptance, or infer every frame is valid from sampled pixels; require direct observation/screen video and reproducible-device triage if it occurs in real use |
| Capture state, cancellation and resize regressions | Previous application integration review remains applicable because app source is unchanged; fresh unit/static checks and production regressions supplement it | Automated coverage only: bounded navigation cycles and selected frame checks do not prove every effect boundary or long-session stability |
| Phone promotion/status and exhaustive chess cases | Existing controller coverage is representative, with a permissive capturing-promotion context assertion; production-phone overlay/end-state acceptance and exhaustive queenside/draw/promotion combinations remain incomplete | Keep explicit gaps. Checklist provides legal quiet/capturing promotion, mate and repetition setups; it does not claim exhaustive rule acceptance |
| Physical Safari/Android, safe areas, thumb/child usability and motion/art | No actual hardware or child session was performed | NOT RUN. Checklist gates 1–9 require evidence or a recorded owner milestone decision; no automatic deferral |
| Audio | No sound pack ships; missing/rejected-file tolerance is not audible acceptance | Audible acceptance BLOCKED until assets are separately authorized and available; then test hardware unlock/mute/volume/interruption |
| Performance/bundle | Large bundle remains; quantitative device frame-time/input/memory data and approved budgets are absent | Open risk/BLOCKED acceptance. Do not introduce optimization work during reassessment; define a budget and measure representative phones before sign-off |
| Temporary art and bespoke presenters | Lettered/procedural art remains; generic presentation is used for other characters | Product owner must accept or explicitly defer for the milestone; no illustrated art or additional choreography is claimed |

## CE review and final acceptance boundary

The fresh [CE review receipt](artifacts/post-pr11/ce-refresh-review.json) covers the newly integrated #11 delta against the original qualification head. Correctness, AGENTS standards, testing and adversarial harness/CI-fidelity reviewers ran in separate contexts; merge and report contexts completed the receipt. No findings required fixes or a validator. This is a fresh delta review, **not** a rerun of the earlier eight-lens full application review against main. The earlier integration receipt remains historical support.

No cross-model peer was started for the remote-ref review; the local adversarial fallback ran. Same-family reviewer agreement is not cross-model corroboration. Review verdicts concern the reviewed code delta, not overall product/device acceptance. The new qualification documents were checked separately for consistency, links, scope and legal move recipes.

Before a later merge decision: confirm recovery has not advanced, confirm PR #10 includes its current tip, inspect successful checks on the exact refreshed head/PR candidate, reconcile the fresh regression result, and record PASS/FAIL/BLOCKED or explicit owner deferral for every manual gate. Wrong/double moves, a reproducible crash, persistent blank rendering, stuck input, or an unreachable required control are blocking defects. Leave PR #10 draft while those decisions are open.

No merge, auto-merge, deployment, or physical-device acceptance was performed.
