---
title: Resolve recovery render-check instability
type: fix
date: 2026-10-24
execution: code
---
# Resolve recovery render-check instability

## Goal and scope

Resolve the tablet blank-canvas timeout and generic Skip CI flakes identified in recovery PR #10. Base the focused draft PR on freshly fetched `recovery/2026-10-22` at `9899abcf6f2f810ef2d9ccaa4e0de289454d97f8`. Preserve gameplay, production rendering, visibility thresholds, lifecycle assertions, browser projects and uncaught-page-error checks. No merge or deployment.

## Evidence and decision

The unchanged generic Skip regression reproduces the original status-label timeout. Frame/resize instrumentation shows virtual time moving backward as the running Playwright clock is paused. The next animation frame remains queued in the future. Resize normally clears the canvas, but 32ms test advances do not reach that frame before the real-time assertion deadline. Advancing to the queued frame restores rendering on unchanged application code.

Use an exclusively test-driven clock from before app startup. Do not increase timeouts, retry artwork visibility, lower thresholds, force a different renderer, enable preserved drawing buffers, or change game timelines. Existing regression cases own the behavior and supply the red/green check.

## Work and dependencies

1. In `e2e/helpers.js`, add explicit paused-clock game startup; drive readiness with bounded virtual frames. In `e2e/attack_resize.spec.js`, use that startup and drive move input explicitly. Retain every resize, pixel, state, completion, Skip, Undo, recapture and late-callback assertion.
2. After the focused regression passes, migrate the two other mid-game clock pauses in `e2e/game.spec.js` to the same setup. Make CI reject flaky classifications while retaining retry evidence. No application or dependency changes.
3. Run the production matrix and repeated formerly flaky cases without retries. Use negative controls to show that blank rendering and missing artwork still fail the guard. Compare frame progression against the original stalled-clock observation.
4. Record the diagnosis, red/green evidence, negative controls, visual samples, review coverage and remaining risks. Complete CE simplification and code review on the fix-only diff; push and open a draft against recovery.

## Verification

- Current unit tests, typecheck, lint, production build and preview.
- All five production Chromium projects, with no retry-assisted pass counted as a clean result.
- Repeated generic Skip cases including tablet, desktop and both portrait phones.
- A deliberately blank render must fail readiness; the pre-artwork-fix recovery snapshot must still fail primary artwork visibility with the revised test setup.
- Verify source, manifests, lockfile, chess state ownership, timing and presentation remain unchanged.
- Inspect selected captures and keep physical Safari/Android, child usability, art/motion, actual audio and quantitative performance acceptance open.

## Completion

The original failure has a causal explanation and current regression evidence; coverage is preserved or strengthened; review findings are resolved or disclosed; documentation and a focused draft PR are delivered. Historical PR #10 results remain historical evidence and are not rewritten as passed.
