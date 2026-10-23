---
title: Dragon Chess Recovery Phase 2 - Plan
type: fix
date: 2026-10-23
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-plan-bootstrap
execution: code
---
# Dragon Chess Recovery Phase 2 - Plan

## Goal Capsule

- Objective: Players can play and navigate Dragon Chess on phone screens without sideways scrolling or unreachable controls.
- Means: Correct responsive UI constraints and expand production-preview browser coverage (KTD1, KTD2).
- Authority: User request, AGENTS.md, Product Contract, then technical decisions.
- Execution: Implement and verify in the existing checkout; deliver a draft PR against recovery/2026-10-22. Do not merge or deploy.
- Stop conditions: Preserve user changes and report any blocking regression rather than weakening lifecycle guarantees.

## Product Contract

### Summary

Repair mobile layouts and exercise real browser touch events, gameplay controls, and capture navigation against the production build.

### Problem Frame

The recovery game has known mobile horizontal overflow and predominantly desktop browser coverage. Phase 1 fixed capture cancellation and stale lifecycle callbacks; mobile changes must retain that behavior.

### Requirements

**Responsive usability**

- R1. Menu, game, and settings fit mobile portrait and landscape without document horizontal overflow or clipped essential controls.
- R2. Board selection and legal moves work using browser touchscreen input, including after viewport rotation.

**Regression coverage**

- R3. Production-build Playwright tests exercise Undo, Restart, settings changes, and return to menu/new game.
- R4. Capture input remains locked until completion or deliberate skip, commits exactly once, and cancels safely on navigation, including Fire Dragon captures.
- R5. Preserve chess.js authority and Phase 1 lifecycle tests without changing chess behavior.

**Evidence and delivery**

- R6. Record responsive screenshots, traces, exact check outcomes, and remaining human UX acceptance tasks.
- R7. Verify PR #5 merged, start from latest recovery tip, save the plan, implement, review, and create a draft PR against recovery/2026-10-22.

### Scope Boundaries

No new chess rules, characters, artwork, AI opponent, or animation choreography. Do not hide document overflow to mask layout defects. Physical-device and child usability acceptance remain human tasks because emulation cannot establish them.

## Planning Contract

### Key Technical Decisions

- KTD1. Keep fixes in React layout constraints and CSS. Inspect actual overflowing elements during execution; constrain flexible header content, allow readable status wrapping, and keep short-viewport overlays scrollable.
- KTD2. Extend the existing Playwright production-preview setup with desktop, phone portrait/landscape, and tablet projects. Use touchscreen taps for touch projects and mouse input for desktop. Retain existing lifecycle coverage across the matrix.
- KTD3. Keep browser helpers outside production code. Derive board hit coordinates from the rendered canvas and assert observable legal move/turn behavior; do not introduce a second chess state or test-only production API.
- KTD4. Save useful named screenshots as test attachments and keep traces available for remote review. Document engine/device limits rather than equating emulated touch with physical-device acceptance.

### Grounding and Assumptions

PR #5 merged at 05f3a132144575a1ad53274fdaffea059222c792, also the fetched recovery tip. Existing patterns: e2e/game.spec.js, playwright.config.js, src/ui/GameUI.tsx, src/ui/SettingsModal.tsx, docs/TEST_PLAN.md. No CE config, packs, prior plan, or solutions store exists. Local patterns suffice; external research is unnecessary. Runtime confirmation of overflow sources and exact useful canvas height is deferred to execution.

## Implementation Units

### U1. Responsive UI corrections

**Goal:** Satisfy R1 while retaining R5.
**Dependencies:** None.
**Files:** src/ui/GameUI.tsx, src/ui/StartMenu.tsx, src/ui/SettingsModal.tsx, src/index.css as needed; e2e/mobile.spec.js.
**Approach:** Apply KTD1. Follow current Tailwind styling and retain lifecycle effects untouched. Add accessible names to icon controls needed for reliable navigation.
**Execution note:** First reproduce overflow in production-preview browser measurements, then fix its source.
**Test scenarios:**
- At 360x800 and 390x844, menu/game/settings fit the viewport and status text remains readable.
- At 800x360 and 844x390, settings can scroll to Done and close, and board and footer controls remain reachable.
- Tablet and 1366x768 desktop retain usable board and control layouts.
**Verification:** Browser geometry checks find no horizontal overflow, visual screenshots are inspected, and control interactions succeed.

### U2. Touch and gameplay regression coverage

**Goal:** Satisfy R2-R5 using KTD2 and KTD3.
**Dependencies:** U1.
**Files:** playwright.config.js, e2e/game.spec.js, e2e/helpers.js, e2e/mobile.spec.js, .github/workflows/ci.yml if artifact retention needs adjustment.
**Approach:** Share input helpers, retain all Phase 1 browser cases, and add touch/orientation and gameplay flows with turn assertions. Ensure production preview owns its server and tests cannot silently reuse a dev build.
**Test scenarios:**
- Touch e2-e4, undo, replay, restart, and a black legal move prove input and control behavior.
- Rotate a running game, retain one canvas, and make legal moves using recalculated coordinates.
- Capturing tap starts an animation; Undo/Restart lock; deliberate skip commits once and Undo enables recapture.
- Leave normal and Fire Dragon captures, start another game, and wait beyond abandoned timelines without turn changes or runtime errors.
- Change animation settings through the UI, close/reopen settings, and verify capture behavior matches the selected mode.
**Verification:** All projects pass against a freshly built preview with real touchscreen event delivery in touch contexts.

### U3. Evidence, review, and delivery

**Goal:** Satisfy R6-R7.
**Dependencies:** U1, U2.
**Files:** docs/TEST_PLAN.md, README.md, docs/reviews/recovery-phase2.md; browser artifacts are generated outside tracked source.
**Approach:** Apply KTD4, update stale verification claims, run required checks, review the final diff and requirement trace, then deliver the authorized draft PR.
**Test expectation:** No additional unit tests for documentation; evidence comes from full project checks and browser scenarios.
**Verification:** Record current result counts, inspect representative screenshots/traces, and explicitly list remaining manual UX checks.

## Verification Contract

Run npm test, npm run typecheck, npm run lint, and npm run build. Verify npm run dev HTTP readiness and production preview. Build before Playwright; use the configured system-Chromium wrapper in this environment. Run all desktop/mobile/tablet projects with screenshots and traces, inspect current JSON results, and archive the report for remote review. Existing chess and lifecycle tests must continue to pass. Browser errors are failures; do not replace behavioral assertions with screenshots alone.

## Definition of Done

All requirements map to implemented changes or explicit human acceptance limits. Required checks pass, the final diff is reviewed, experimental code is removed, useful browser evidence is saved, and a draft PR targets the recovery branch. Human acceptance still covers physical iOS Safari/Android browsers, thumb comfort, high-density readability, animation quality/performance, and child usability.
