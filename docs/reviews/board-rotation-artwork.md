# Board rotation artwork verification

## Scope and approach

Based on the explicitly fetched `recovery/2026-10-22` tip `5b157d4a1abd4ea023c9a5be6430c1ab7e1fe26b`.
Both presenters now animate inside a shared 800 × 600 artwork container. Resize uniformly fits and centers that container while labels and Skip retain their canvas layout. Existing objects, future effects, and tween destinations share the same space. The Fire Dragon impact flash draws around its own local origin so its expansion remains centered on the defender.

No changes to chess.js, ChessGameController, AttackDirector, attack timings, settings semantics, or input/capture commitment paths. The implementation uses the existing stage visibility and cleanup ownership.

## Regression evidence

Before changing production code, the strengthened production-browser test failed on the unchanged recovery code in `phone-landscape`: the restored capture had zero visible attacker pixels in the artwork band. The new Fire Dragon unit regression also failed because the expanding flash had no defender-local position. These were expected failures, not suppressed page errors. After finalizing screenshot synchronization, the final browser test was rerun against a clean `git archive` source snapshot of the same recovery SHA: `phone-landscape` failed in 3.1s with zero visible defender pixels after the status label had rendered. The current task checkout was untouched by that base proof.

The browser regression waits for the separate status label to render after a canvas resize, then checks combatant colors once after rotation and rotation back, retains the transient 4px parent resize case, and exercises both presenters with natural completion and Skip. Existing turn, input lock, single canvas, delayed callback, Undo, and recapture assertions remain. The Fire Dragon regression starts on a portrait canvas, changes dimensions before late effect timers fire, and verifies logical coordinates and a centered flash. Layout tests check finite uniform containment and centering across desktop, both phone orientations, tablet, 4px, and zero width.

## Current local checks

- `npm test`: 7 suites, 69 tests passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed; existing large-bundle warning remains.
- Production preview: served by Playwright on port 4173; HTTP readiness verified with curl.
- `git diff --check`: passed.
- Full production Playwright matrix: 58 passed, 2 intentionally skipped desktop touch-only cases, 0 failures (60 cases across all five projects; 17.1 minutes). All 20 rotation regression cases passed.

Cloud browser command: `DRAGON_CHESS_ARTIFACTS=/workspace/dragon-chess-artifacts/rotation-complete npx --no-install playwright test --config=/workspace/dragon-chess-playwright.config.mjs --workers=1`.
Initial browser runs were stopped after the new pixel assertion exposed blank WebGL frames immediately after resize. A fixed 32ms step was insufficient. The final check waits for status-label rendering independently of artwork visibility and checks combatants before their intentional impact fade. No application behavior or visibility threshold was changed to resolve these test synchronization failures.

The wrapper uses system Chromium at `/usr/bin/chromium`, production Vite preview, screenshots, and traces. It is separate from CE's browser-driver skill.

## Review and visual inspection

CE plan review: five local reviewer contexts completed with no findings; see [plan review](board-rotation-plan-review.md).
CE simplification: five local reviewer contexts completed; no production edits warranted. Protected regression tests were retained.
CE code review: full review with five local reviewer contexts completed with no retained findings; see [code review](board-rotation-code-review.md). The workflow receipt is retained with the review artifacts.

Agent screenshot inspection: generic capture after desktop-to-portrait rotation and rotation back, including an impact frame; Fire Dragon preparation and a post-resize flame frame. Combatants, impact, and the newly spawned flame stayed inside the canvas; labels and Skip were visible. Phone-360 portrait and landscape screenshots were also inspected: both combatants stayed within the canvas after rotation and back.

Committed examples: [Fire Dragon in landscape](artifacts/board-rotation/fire-dragon-landscape.png) and [generic capture in portrait](artifacts/board-rotation/generic-portrait.png).

Full browser evidence is retained under `/workspace/dragon-chess-artifacts/rotation-complete/`: `results.json`, the HTML report, screenshots, and traces. The handoff archive includes the complete JSON report plus selected rotation traces and screenshots.

## Remaining limitations

Uniform containment makes artwork smaller on narrow or short canvases; this is an intentional composition tradeoff. A transient near-zero canvas cannot display readable artwork, but the transform remains finite and restores without restarting the capture.
Pixel assertions prove primary combatant visibility in the tested frames, not every animated effect boundary or aesthetic quality. Unit geometry checks and the shared transform support containment; Chromium screenshots are not golden-image acceptance.
Physical iOS Safari/Android Chrome, safe areas/browser bars, high-density readability, child usability, motion comfort, and quantitative frame-rate/memory measurements remain human or separate follow-up acceptance. No sound pack is shipped. Cross-model review is unavailable in this environment; separately dispatched local reviewers are not a different-model opinion.

CI results belong to the draft PR and are separate from the local checks above. No merge or deployment is part of this task.
