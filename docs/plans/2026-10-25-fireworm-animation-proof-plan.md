# Fireworm signature capture — animated proof-of-style plan

**Date:** 2026-10-25
**Status:** Implementation-ready plan. **No rendered animation, final character sprite, or code implementation is claimed or approved yet.**
**Base for next work:** `docs/book-visual-reset-2026-10-25` / draft PR #12. The current production implementation still uses a generic white-knight Fire Dragon animation, and `main` does not yet contain the documentation branch.
**Approvals already granted:** All 32 chess piece identities/species and standard promotion/art-reuse behaviour; rich 2D painterly fantasy-Viking direction; Fireworm (Hooligan **rook**) is a cast character; energetic fireworks-like fire impact as the desired *effect language*. Neither a final Fireworm depiction nor exact choreography is approved.

## Outcome / narrow scope

Produce **one compelling original 2D Fireworm capture prototype**, watchable on phone and compatible with eventual `AttackDirector` / `AttackScene` integration. First prove visual quality and pacing, then integrate into an actual legal **rook** capture and test the full lifecycle. **Do not roll out all characters** or refactor unrelated gameplay.

A child should recognize the attacking dragon, understand wind-up -> launch -> fiery impact -> comic defender reaction -> triumphant recovery -> return to the board, and want to watch it again. The concept storyboard that received favourable owner feedback uses a vibrant fireworks-like impact. It is a **mood/staging reference**, not a sprite sheet or frame-exact production instruction; the original images remain in the user conversation, not tracked game assets.

### Originality and provenance gate

- Draw/generate **original** dragon and environment artwork in a broadly painterly fantasy/Viking vocabulary. Use an independent Fireworm silhouette (e.g., distinct elongated neck, orange-red scale palette, angular jaw and expressive brows), clothing, framing, lighting and composition; **do not reproduce book illustrations, film dragons, known fan art, or another artist's card/scene**.
- Book **name** and approved character/casting role can identify the piece, but visual resemblance to a particular copyrighted depiction is neither required nor desired. Do not claim official affiliation.
- Record the production method and provenance of **every** shipped image or sound. Concept boards/screenshots alone are not appropriate sprite atlases. If good expressive transparent artwork cannot be produced within this slice, deliver the proof-of-concept plus a clearly reported art blocker; **do not describe primitive shapes as finished art**.
- Prefer layered illustrated transparent assets (character body/wing/head/jaw, poses, effects) over reusing the existing procedural dragon graphics as the hero sprite. Effects may combine textures and a small number of Phaser particles.

## Presentation and animation specification

Target orientation: a readable `800 × 600` logical attack stage fitted into portrait `360 px` and short landscape phones via the existing `fitAttackArtwork` path. Keep the primary attacker and defender within the safe central area. Don't crowd controls or status.

**Storyboard stages (art direction, not hardcoded tick values):**

1. **Board -> arena / staging:** Fireworm's rook token clearly transforms or leads into a large illustrated fiery dragon emerging into a coastal-Viking stage. The defender is immediately distinguishable. Avoid a second, false chess move animation.
2. **Anticipation:** Fireworm plants claws, shoulders compress, wings open, neck pulls back, cheeks/throat warm, sparks sputter. Expression is mischievous and confident.
3. **Wind-up and release:** visible head/throat pose change followed by one decisive lunging flame stream, with several overlapping illustrated layers and a visible travel direction; flame reads as a character action, not a static geometric cone.
4. **Fireworks impact (owner's strongest preference):** bright orange/gold flame plume, coloured sparks bursting radially, a little smoke and confetti-like embers, and a clear hit. Use a **brief** luminous core and layered particle arcs, not rapid strobing. Keep defender visible through an amusing recoil or soot silhouette, with no injury/gore.
5. **Comic reaction / triumph:** defender's defeat is unmistakable; Fireworm's exuberant self-satisfied nod or tail swish gives it personality, with one last drifting ember.
6. **Return / reset:** all effects, stage geometry, input lock, audio, cameras, labels and temporary objects return to normal. Captured piece is removed only by the normal authoritative chess commit, **exactly once**.

The storyboard sketches approx. five seconds as an illustrative dramatic maximum. **Do not lock five seconds** as the default: tune Normal with real repeated phone viewing (candidate ~3–4 seconds), Fast significantly shorter, Instant immediate. Keep a single conspicuous impact beat, not repetitive flashes.

**Reduced motion:** short low-motion crossfade or two key poses plus a subdued static spark burst, with no camera shake, rapid flash, aggressive zoom or required particles. **Skip:** cleanup immediately and commit the legal capture once. Audio is optional, muted/off controls still work, and missing sound assets never block gameplay.

## Architecture and staged implementation

### A. Art + animated standalone proof

- Produce source character art/poses and an animated demonstration view (standalone canvas/Phaser scene or isolated preview route) using the **actual intended game rendering technology**, with a stable replay control. This is a *review artefact*, not an alternate chess rules system.
- Show initial board/arena composition and at least anticipation, flame launch, fireworks impact, reaction and clean reset, both portrait and landscape. No new chess mechanics.
- If art generation is limited in Codex Cloud, record the constraint and separate the reusable choreography/effect code from the missing final-quality sprite pack. Never silently substitute a crude procedural dragon and claim the visual gate is satisfied.

### B. Actual capture integration (only after the proof is visually credible)

- Keep `chess.js` as sole move authority; use `AttackDirector` and `AttackScene` with a **new** `FirewormPresenter` implementing `AttackPresenter`. Do not overwrite the existing technical Fire Dragon presenter until comparison is complete.
- Register a **Fireworm** character with `pieceType: 'r'` and a unique attack ID. **Do not map Fireworm to a knight.**
- **Critical: preserve named-piece identity as it moves.** Current `CharacterRegistry` uses a `squareAssignments` map without move tracking; an `a1` assignment alone is insufficient once Fireworm moves. Design a minimal piece-identity tracker or movement-aware mapping that correctly handles legal move commit, undo, captures, castling, reset and promotion. Do not infer identity merely from the current square or conflate the two white rooks (Fireworm on `a1`, Hookfang on `h1`, unless owner later changes orientation). Keep this as presentation identity alongside—not within—a duplicate chess-rules engine.
- Introduce stable preview/test fixtures allowing a **legal real rook capture**, after the rook has moved at least once. Do not create gameplay backdoors or test-only production buttons.
- Avoid an all-roster implementation at this milestone. Other pieces can retain presentational placeholders, but be explicit that the full cast is not yet wired in.
- Ensure exactly one normal chess move commit on completion/Skip and zero on abort. Retain separate defender/attacker identities after moves and Undo.
- Keep `AttackScene` and presenters modular. Avoid global `time.removeAllEvents()` / `tweens.killAll()` changes that could destroy unrelated activity beyond what cleanup intentionally already handles.

## Acceptance evidence / test matrix

1. **Visual owner review:** physically view the attack on a phone at ~360 px portrait and landscape (including address bars, safe areas and rotation mid-capture). Owner accepts expressive character staging, intended fireworks-style impact, legibility and timing. Automated tests alone cannot pass this.
2. **Gameplay & identity:** Fireworm on starting `a1`, move then capture on a new square, Hookfang `h1` does not invoke Fireworm; identity survives quiet moves, capture, Undo, Restart and changing turns; pawn promotion reuses an existing class character art and standard `Q/R/B/N` logic.
3. **Lifecycle:** complete/Skip/Instant/Fast/Normal/reduced-motion; abort from navigation; repeated captures; rotation/resizing during anticipation, launch and late effect; no double commit, duplicate completion, stale display, input lock, orphan timer/tween, camera jitter, or offscreen particles.
4. **Quality:** distinct expressive poses (not just moving whole graphics); effects intentionally staged; readable target reaction; audio optional and nonblocking; no rapid flashes. Static 360px frames **and** an actual motion capture/video or directly runnable preview should be reviewable.
5. **Checks:** run `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build`, production-build Playwright capture and cleanup/resize matrix, plus runtime/dev or preview. Follow `AGENTS.md` and Compound Engineering (`ce-plan` if plan needs refinement; `ce-work`; `ce-code-review`), recording actual evidence and limitations.

## Delivery and governance

- Treat `docs/CHARACTER_ROSTER.md`, `docs/ART_DIRECTION.md`, `docs/ATTACK_SYSTEM.md`, and this plan as constraints. The roster is approved; a character redesign is not a casting decision.
- Implement on a **separate feature branch** from the current **documentation PR #12 branch**, with a **draft PR targeting that branch** while PR #12 remains unmerged. Alternatively wait until #12 is merged and use `main` as the base. Do not silently retarget, merge, publish or deploy.
- Deliver a phone-friendly PR report: what is actually implemented, access to preview/screen recording and source artwork, CI/test results, unaddressed assets/quality risks, and explicit manual acceptance status. **No visual acceptance without a real-device watch.**
- Do not commission eight more attacks until this one meets the owner's quality bar.
