---
title: Board Rotation Artwork - Plan
type: fix
date: 2026-10-23
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-plan-bootstrap
execution: code
---
# Board Rotation Artwork - Plan

## Goal Capsule

Keep active capture artwork visible when the board canvas changes size. Work from recovery/2026-10-22 at 5b157d4 and deliver a draft PR only. Chess state remains owned by chess.js.

## Product Contract

### Summary and Problem Frame

AttackScene relayouts labels and Skip on resize, but both generic timelines and FireDragonPresenter close over old canvas dimensions. Rotation to a narrower canvas clips the artwork. Fire Dragon impact graphics also scale geometry drawn at world coordinates, moving the flash away from its target.

### Requirements

- R1. Generic and Fire Dragon capture artwork fits the current canvas before and after rotation, including effects created after resize.
- R2. Rotation preserves the active phase and timeline; completion and Skip commit the same legal move exactly once, restore input, and clean presentation objects.
- R3. Labels and Skip remain responsive and reachable, including recovery from transient near-zero dimensions.
- R4. Regression evidence covers desktop and phone portrait/landscape, and the delivery documents limits honestly.

### Scope Boundaries

Gameplay, timing, settings semantics, roster, assets, audio, and dependencies are outside scope. No per-tween resize rewriting or timeline restart is needed: a parent transform preserves the existing choreography. Physical device acceptance and animation aesthetics remain human acceptance work.

## Planning Contract

- KTD1. Keep artwork in a fixed 800 by 600 logical space inside a dedicated container, uniformly contained and centered in the current canvas. UI remains outside this transform. Covers R1 and R3.
- KTD2. Both presenters create their effects under that container and use logical dimensions for positions and tween destinations. Draw the Fire Dragon impact flash at its own local origin so expansion stays centered. Covers R1.
- KTD3. Resize only changes the parent transform; leave director/controller callbacks, timers, input locks, and cleanup ownership intact. Covers R2.

## Implementation Units

### U1. Fit the artwork independently of UI

**Goal:** Implement KTD1-KTD3 for R1-R3.

**Files:** src/game/scenes/AttackScene.ts, src/game/animation/FireDragonPresenter.ts, src/game/animation/attackLayout.ts, src/tests/attack_layout.test.ts, src/tests/fire_dragon_presenter.test.ts.

**Dependencies:** None.

**Approach:** Add a small shared layout helper and artwork container, preserving existing stage visibility and cleanup. Route generic art and all Fire Dragon temporary effects through it. Keep the UI in canvas coordinates.

**Patterns:** Existing scene resize listener and presenter cleanup ownership.

**Test scenarios:**
- Fit desktop, portrait, landscape, and transient 4px canvas dimensions with uniform scale and finite centered bounds.
- Resize while an attack is active without changing its local artwork or timeline targets.
- Confirm the Fire Dragon flash scales around the defender position.

**Verification:** Unit regressions and existing lifecycle suites pass.

### U2. Prove rotation and record limitations

**Goal:** Cover R1-R4 in production Chromium and document delivery evidence.

**Dependencies:** U1.

**Files:** e2e/attack_resize.spec.js, docs/ATTACK_SYSTEM.md, docs/ROADMAP.md, docs/TEST_PLAN.md, docs/reviews/board-rotation-artwork.md.

**Approach:** Extend real-canvas regression evidence to assert artwork placement across opposite orientations, including effects spawned after resize. Exercise both completion and Skip and retain Undo/recapture checks. Inspect screenshots and record exact results and remaining limitations.

**Test scenarios:**
- Both presenters rotate from portrait to landscape and back without off-canvas primary artwork.
- Natural completion and Skip each leave one playable board and one committed capture.
- Transient narrow resize recovers without page errors, and cleanup prevents late commits.

**Verification:** Required repository checks plus production Playwright across all five configured projects.

## Verification Contract

Run npm test, npm run typecheck, npm run lint, npm run build, and runtime preview verification. Use the Cloud Playwright wrapper with system Chromium after building. Verify a failing regression on the unchanged base when feasible. Inspect captured artwork at representative phases; screenshots alone are not golden-image tests.

## Definition of Done

R1-R4 have current evidence, CE review findings are resolved or documented, only task-owned files are committed, and a draft PR targets recovery/2026-10-22. No merge or deployment. Physical Safari/Android, quantitative performance, and child usability remain outside automated Chromium evidence.
