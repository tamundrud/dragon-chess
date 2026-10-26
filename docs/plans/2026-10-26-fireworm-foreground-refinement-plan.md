---
title: Fireworm Foreground Refinement - Plan
type: feat
date: 2026-10-26
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-plan-bootstrap
execution: code
---

# Fireworm Foreground Refinement - Plan

## Goal Capsule

**Objective:** A child sees a connected, expressive Fireworm deliver a spectacular capture while keeping the chess position understandable.

**Means:** Coherent illustrated poses, a larger painted fire effect, and foreground presentation over the live board (KTD1–KTD3).

**Authority:** The owner's [PR #13 feedback](https://github.com/tamundrud/dragon-chess/pull/13#issuecomment-6409635177), this follow-up request, the approved art/casting documents, and `AGENTS.md` govern this slice. The original `docs/plans/2026-10-25-fireworm-animation-proof-plan.md` remains the broader prototype constraint; this plan changes its default staging according to R3.

**Execution:** Native implementation with local automated/browser verification, CE code review, and a stacked draft PR against `feat/fireworm-animation-proof`. No merge or deployment. Stop if a required source asset cannot be made credible; report that limitation instead of claiming visual completion.

---

## Product Contract

### Summary

Refine the existing Fireworm prototype in four areas: connected anatomy, dramatic fire volume, foreground fighting over the darkened board, and one distinct non-pawn defender. Keep the painted arena available for comparison and retain the existing chess integration.

### Problem Frame

The owner's first real-phone review did not grant visual acceptance. Independently moving cutouts exposed anatomy gaps, the fire lacked scale, the raider represented every target, and the arena obscured the preferred connection to the board.

### Key Decisions

- **Board remains visible by default** (session-settled: user-directed — chosen over the arena-only presentation after real-phone review; the arena stays available for comparison). Governs R3.
- **One attack and one non-pawn art example** preserve the focused quality gate rather than expanding the cast. Governs R4, R6.

### Requirements

- R1. Fireworm's anatomy stays connected throughout anticipation, release, recovery and transitions in Normal/Fast and during rotation; genuine pose continuity or cutout overlap must solve gaps rather than smoke masking.
- R2. The flame reads as a substantially larger, forceful character action with a large colourful fireworks impact, while the defender remains legible and flash exposure stays restrained.
- R3. The default presentation keeps the actual chessboard visible but darkened while enlarged combatants emerge in the foreground and resolve back to it; the existing arena remains selectable for comparison.
- R4. At least one non-pawn target has a distinct illustration and correct faction, class and persistent identity, and unsupported targets are identified honestly instead of reusing pawn art as a named character.
- R5. Preserve chess.js authority, existing identity tracking, exactly-once completion/Skip, zero-commit abort, cleanup, speed modes, reduced motion, optional audio and phone compatibility.
- R6. Keep full-roster art, new chess rules, board redesign, production release and deployment out of scope.
- R7. Retain fresh rendered Normal/Fast evidence in portrait and landscape, including board/arena comparison and non-pawn capture; distinguish technical verification from owner physical-phone acceptance.

### Acceptance Examples

- AE1. Covers R1, R2, R7. Watching the full motion at phone scale shows no open anatomy joint before, during or after the larger breath, including Fast playback and rotation.
- AE2. Covers R3, R5. During a legal capture the original pending position remains visible beneath the foreground fight; completion commits once, Skip resolves once, and navigation abort leaves the position unchanged.
- AE3. Covers R4, R5. From a new game play `a2-a4 a7-a5 a1-a3 a8-a6 a3-b3 a6-b6 b3xb6`. Fireworm captures the moved a8 Flamehuffer rook, whose image and label stay distinct from pawn art and from the h8 rook; Undo restores both identities.

---

## Planning Contract

### Key Technical Decisions

- KTD1. **Use complete connected illustrated poses.** Replace fragile body/neck/wing sibling motion with consistent anticipation, breathing and proud-recovery silhouettes. Align the same anatomical/root anchor across poses, use short pose transitions and coherent squash/lunge, and keep fire as a separate layer. This addresses R1 without hiding joints and still requires expressive pose changes rather than moving one static image. Source: `src/game/animation/FirewormPresenter.ts` currently rotates/translates independent cutouts and changes frames with different widths.
- KTD2. **Retain the live BoardScene underneath AttackScene.** Add a board/arena presentation choice to existing settings and snapshot it for each capture. Board mode omits the opaque cove image and uses a lighter dimmer; arena mode keeps the cove comparison. Actor emergence/return uses current board-square positions translated into the shared artwork coordinates, so resize preserves staging. Covers R3, R5.
- KTD3. **Share the presenter across gameplay and proof.** The proof uses the real `BoardScene` and `ChessGameController` fixture, not a painted board or a second rules implementation. Existing `fitAttackArtwork` and owned timeline cleanup remain the layout/lifecycle patterns. Covers R3, R5, R7.
- KTD4. **Separate target metadata from art identity.** Carry authoritative captured piece type and colour in `AttackContext` alongside the persistent character ID. Register a8 Flamehuffer and a distinct h8 Common or Garden identity; add only the Flamehuffer illustration. Select that art only for the matching identity, with explicit class/faction placeholders for unillustrated targets. Covers R4, R5. Current `rival_generic` fallback is a pawn, so its registry class must not stand in for captured chess class.
- KTD5. **Keep fire effects modular and owned.** Enlarge overlapping painted ribbons/plume and extend colourful spark arcs around the hit, with a single brief luminous core. Retain a clear target silhouette and a subdued static low-motion alternative; avoid camera shake, strobe sequences and unbounded particle growth. Covers R2, R5.

### High-Level Technical Design

**Data flow:** authoritative prepared move → persistent identity plus captured class/colour → attack context and presentation preference → shared Fireworm presenter → completion or abort callback → existing manager commit path.

**Scene composition:** the actual board is the bottom layer; a translucent dimmer sits above it; enlarged character poses, flame and impact sit above the dimmer; labels and Skip remain above effects. Arena selection inserts the existing cove below the combatants instead of changing chess state.

**Lifecycle:** preparing/emergence → attacking/release → one impact → recovering/return → existing completion. Skip removes owned temporary state and completes; abort removes it without completing. This keeps the lifecycle in R5 unchanged.

**Mode combinations:** board and arena use the same Normal/Fast timelines; Instant/disabled bypass presentation; reduced motion replaces travelling/enlarging effects with short fades and subdued key poses. Preference changes apply to the next replay/capture rather than replacing a running timeline.

### Assumptions and execution-time details

The root-selected full-pose approach is an implementation choice, not an owner-approved final character depiction. Exact pose anchors, fire volume, contrast and timing are tuned from rendered evidence. Existing code and Phaser patterns are sufficient; no external technology research or new rendering dependency is needed. No CE packs, solutions corpus or root strategy/glossary files were found.

### Scope Boundaries

Preserve the original asset originality/provenance requirements in `docs/ART_DIRECTION.md` and `public/art/fireworm/PROVENANCE.md`. Full-roster assets, a general animation editor, a second chess model, new attack types and unrelated UI/dependency refactors are not built. Owner art approval, physical-device smoothness, browser bars/safe areas and child usability remain acceptance work after this draft handoff.

---

## Implementation Units

### U1. Connected poses and dramatic breath

**Goal:** Deliver continuous anatomy and substantially stronger fire staging (R1, R2; KTD1, KTD5).

**Dependencies:** None.

**Files:** `public/art/fireworm/`, `src/game/animation/firewormAssets.ts`, `src/game/animation/FirewormPresenter.ts`, a small pose/effects helper if needed, `src/tests/fireworm_presenter.test.ts`, `e2e/fireworm.spec.js`.

**Approach:** Produce consistent original transparent complete poses, record provenance, align root anchors, replace disjoint transforms and tune the painted plume/fireworks against the retained PR #13 evidence. Keep the target in front of obscuring smoke/plume where required for legibility.

**Patterns to follow:** Presenter-owned timers/tweens/root container, `fitAttackArtwork`, and the existing reduced-motion branch.

**Test scenarios:**
1. Covers AE1. Normal/Fast traverse every pose without a disconnected silhouette in full-motion portrait/landscape evidence; inspect transitions with effects hidden as well as enabled.
2. Covers AE1. Compare the old and new plume at the same viewport/speed to show greater volume and travel direction while the target remains readable.
3. Covers AE2. Complete/Skip/cleanup cancel all owned pose/effect activity without affecting unrelated scene activity or firing twice.
4. Reduced motion contains no travelling particles or aggressive enlargement; Instant remains immediate through the director.

**Verification:** Updated presenter tests pass and fresh rendered sequences support R1/R2 without claiming owner acceptance.

### U2. Board foreground and arena comparison

**Goal:** Implement R3 using KTD2/KTD3.

**Dependencies:** U1's presenter/asset contract.

**Files:** `src/settings/settingsTypes.ts`, `src/settings/SettingsStore.ts`, `src/ui/SettingsModal.tsx`, `src/game/animation/attackTypes.ts`, `src/game/animation/AttackDirector.ts`, `src/game/scenes/AttackScene.ts`, `src/game/scenes/BoardScene.ts`, `src/game/preview/FirewormPreview.tsx`, `src/tests/smoke.test.tsx`, `src/tests/game_manager_lifecycle.test.ts`, `e2e/fireworm.spec.js`.

**Approach:** Add the preference with a board default and compatible loading of old stored settings, keep the chosen mode stable during playback, retain arena mode, and reuse real board rendering in the proof. Derive emergence/return anchors from actual square layout rather than stale viewport coordinates.

**Execution note:** Strengthen settings/context and integration assertions before changing behavior; use actual browser rendering for the compositing result.

**Patterns to follow:** Existing settings persistence, scene layering, resize handling and per-capture settings snapshot.

**Test scenarios:**
1. Covers AE2. Fresh and old saved settings select board mode; changing to arena persists and affects the next capture/replay.
2. Covers AE2. Board mode visibly retains the original board below enlarged actors; arena uses the cove with the same move and phase timing.
3. Covers AE2. Rotate during emergence, release and return in both modes; labels/Skip remain reachable, and final board state/canvas count stay correct.
4. Covers AE2. Skip, navigation abort, Undo and Restart retain the existing semantics in board mode; preference changes during play do not create a second attack.

**Verification:** Settings/context tests and production browser coverage pass with fresh board/arena comparison evidence.

### U3. Non-pawn defender identity and art

**Goal:** Prove correct target selection for R4 with KTD4.

**Dependencies:** U1's rendering contract; U2 for final board-mode evidence.

**Files:** `src/game/animation/attackTypes.ts`, `src/game/animation/AttackDirector.ts`, `src/game/characters/CharacterRegistry.ts`, defender selection helper if needed, `src/game/animation/FirewormPresenter.ts`, `src/game/animation/firewormAssets.ts`, `public/art/fireworm/`, `src/game/preview/FirewormPreview.tsx`, `src/tests/attack_system.test.ts`, `src/tests/piece_identity.test.ts`, `src/tests/game_manager_lifecycle.test.ts`, `e2e/fireworm.spec.js`.

**Approach:** Add the narrow rook identities and one original Flamehuffer asset, carry authoritative target metadata through the existing prepared-move path, and let the proof choose a pawn or rook fixture. Keep unsupported targets visibly marked as class placeholders.

**Execution note:** First assert that a moved a8 rook produces a rook/black/Flamehuffer context rather than pawn metadata.

**Test scenarios:**
1. Covers AE3. Both rooks move before Fireworm captures Flamehuffer in the legal starting-position fixture; context, illustrated target and label agree.
2. Covers AE3. Undo restores the rook and both persistent identities; h8 is never reclassified as a8 Flamehuffer.
3. Covers AE3. Pawn selection retains pawn art, while an unsupported bishop/knight/queen target receives its actual class/faction placeholder rather than pawn illustration.
4. Covers AE2. Non-pawn completion/Skip commits once and abort commits zero times across board/arena and speed settings.

**Verification:** Identity/director/manager tests and actual rendered pawn-versus-rook comparison pass without a roster rollout.

### U4. Qualification and owner handoff

**Goal:** Deliver R7 and preserve R5 through final integration.

**Dependencies:** U1–U3.

**Files:** `docs/reviews/`, retained media/summary artifacts, `docs/ATTACK_SYSTEM.md`, `docs/ASSET_MANIFEST.md`, `docs/TEST_PLAN.md`, `public/art/fireworm/PROVENANCE.md`, relevant existing tests under `src/tests/` and `e2e/`.

**Approach:** Run current project checks, inspect entire Normal/Fast motion in both orientations and both presentations, retain clips/contact-sheet frames, apply justified CE code-review findings, and publish only the authorized draft change set.

**Test scenarios:**
1. Exercise the capture/Skip/abort/repeat/Undo/reset/resize matrix with fresh production rendering and uncaught-page-error checks.
2. Covers AE1–AE3. Retain connected-pose, large-fire, board/arena and pawn/non-pawn evidence with exact source/check results.
3. Verify the draft PR base, changed files and clean task checkout; keep owner acceptance explicitly pending.

**Verification:** The contracts below are satisfied and no abandoned attempt remains in the shipped diff.

---

## Verification Contract

- Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and a real `npm run preview` or development runtime according to `AGENTS.md`; report current outcomes rather than reusing PR #13 results.
- Run relevant production-build Playwright coverage from `e2e/` on desktop, 360px portrait and short landscape, using the Cloud wrapper when available as `AGENTS.md` requires.
- Preserve exactly-once/abort and identity assertions, plus settings/context/defender selection coverage; broaden checks only when a change or failure justifies it.
- Inspect actual animated Normal/Fast sequences and transitions in both orientations, including rotation, board/arena and the moved non-pawn fixture. Static frames alone cannot qualify R1/R2.
- Retain source artwork provenance, screen recordings and useful frames with a compact evidence record. Automated/agent inspection does not grant owner physical-phone acceptance.

---

## Definition of Done

R1–R7 have concrete implementation/evidence or an explicitly reported art/technical blocker. Current relevant automated checks pass, justified code-review findings are resolved, and source assets plus actual rendered comparison clips are accessible from the draft PR. No experimental dead-end code is left in the diff. The PR remains draft, no merge/deployment occurs, and the owner still must judge anatomy, spectacle, repetition comfort and device usability on a real phone.
