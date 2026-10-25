# Book-first visual reset — concept and acceptance plan

**Status:** Proposed creative direction; no artwork, character mapping, or implementation approval is implied.  
**Date:** 2026-10-25  
**Base:** Integrated, playable chess prototype on `main`.

## Decision and reason

The intended family game is based on **Cressida Cowell's *How to Train Your Dragon* books and illustrations**, not the film/TV adaptations. The original technical vertical slice established a working chess game, input/animation lifecycle, and a procedural Fire Dragon capture. Owner testing on a phone found the chess functionality broadly satisfactory but the dragon/book setting, artwork, and animations far below the desired experience.

**Do not mistake technical completion, screenshots, an 11-beat timeline, or passing tests for visual acceptance.** The next milestone is a creative-quality gate, not more rules or generic animation features.

## Creative goal

A child who knows the books should immediately recognize their unruly, funny, adventurous world: expressive, quirky Vikings and dragons; lively drawing; a sense of Berk; and playful, distinctive character behavior. The result should be *readable and inviting on a phone* and feel like an illustrated book come alive, rather than a dark generic fantasy game or a copy of the movies.

Use the original books and their illustrations as the source of truth for character identity and atmosphere. Illustrative keywords for concept exploration: energetic ink lines, deliberately exaggerated expressions and anatomy, comic timing, map marginalia, rough parchment/wood textures, and a restrained but lively palette. These are **concept candidates**, not approved final art specifications. See `docs/ART_DIRECTION.md` for the living visual rules.

This is a private family project. No public distribution, monetization, or official affiliation is planned. Reassess rights and asset provenance if that changes.

## Phase 5: approve the visual language *before* production implementation

1. **Reference/canon pass.** Assemble a short, explicit reference sheet from book-owned/user-provided pages or legitimate previews, citing which *book* character, creature, setting, or detail each reference establishes. Never use film designs as a substitute for book references.
2. **Resolve character priority.** Present a provisional chess-piece map that includes deliberate consideration of Hiccup and book Toothless. Existing Stoick/Valhallarama/Viking/Fire Dragon IDs are implementation history, not approved final casting. Determine whether two pieces of one type share a character or need unique identities; keep the chess rules unchanged.
3. **Explore two coherent visual treatments.** Produce comparable concepts of (a) the opening screen, (b) a 360px-wide board with readable character tokens and opposing teams, and (c) a Fire Dragon capture storyboard. One treatment may be ink-first with selective color; another may be richly colored but retain playful book-like exaggeration. Do not start by generating dozens of disconnected assets.
4. **Approve animation language.** Storyboard anticipation, character action, impact, comic reaction, and recovery for **one** capture. Specify pose changes, staging, timing, effects, sound intent, reduced-motion behavior, and when the result becomes readable again. Motion must convey personality, not just translate geometric shapes.
5. **Human visual gate.** The owner reviews concepts at actual phone size, including a short landscape layout, chooses a direction, accepts/changes the roster and storyboard, and records specific concerns. Child feedback is valuable; screenshot/CI checks cannot replace this decision.

**Phase 5 deliverable:** reviewed concept sheets, proposed asset/animation production approach, approved roster for the first vertical slice, and a written owner decision. Documentation and reference images may be maintained in this plan or linked from it. Keep rejected alternatives and rationale succinct.

### Phase 5 acceptance — all required

- Book-first characters and world are recognizable **without relying on text labels**; book Toothless must not inherit the movie Night Fury design by default.
- White/dark factions and all piece classes are distinguishable at an actual 360px phone viewport; board interaction remains legible.
- The attack storyboard has clear poses, action direction, unmistakable impact, comic reaction, and intentional return to the board.
- The visual style is cohesive across menu, board, tokens and attack scene; procedural circles/letter badges are explicitly temporary.
- Character assignment, design references, performance constraints, and approved asset-production approach are documented; the owner signs off. Passing tests alone does not pass this gate.

## Phase 6: make **one** capture excellent

Only after Phase 5 approval, replace the current procedural Fire Dragon presentation with an asset-driven or similarly art-directed, expressive capture (subject to the approved character/casting decision). Add real sound cues, mobile staging, comic reaction, and quality/length tuning. Maintain the existing `chess.js` authority, AttackDirector lifecycle, single-commit invariant, Skip/instant/reduced-motion behavior, and responsive/rotation correctness.

The owner must watch and accept a complete **real-device** animation, including Normal and Fast, before the same approach scales to remaining characters. Test the visual result with an intended child where practical. Existing automated regression tests remain mandatory but are not an aesthetic verdict.

## Later phases

- **Phase 7:** complete character tokens, distinct capture personalities, menus, environment and coherent audio with the approved visual system.
- **Phase 8:** family playtesting, animation repetition/Skip tuning, real-device performance, accessibility/readability and final fit-and-finish.

## Deliberately out of scope now

- New chess rules, an AI opponent, backend features, a large roster roll-out, and broad tooling refactors.
- Calling temporary assets “final” solely because they were sufficient for the previous technical vertical slice.
- Designing assets from the DreamWorks film/TV character models.
- Starting a large implementation PR before the visual concepts have been approved.

## Decisions requiring owner approval

1. Which book volume(s) / specific character depictions should anchor the visual reference?
2. Who takes the central chess roles (particularly Hiccup and Toothless), and are duplicate character pieces acceptable?
3. Which of the proposed visual treatments best matches the intended game?
4. Is the first signature capture still a fire-breathing dragon attack, and which *book character* performs it?
5. What capture length feels enjoyable at Normal speed after repeated viewing?

## Existing references

- [Product brief](../PRODUCT_BRIEF.md)
- [Art direction](../ART_DIRECTION.md)
- [Character roster](../CHARACTER_ROSTER.md)
- [Attack system and implemented Fire Dragon](../ATTACK_SYSTEM.md)
- [Asset manifest](../ASSET_MANIFEST.md)
- [Test plan and manual acceptance](../TEST_PLAN.md)
- [Roadmap](../ROADMAP.md)
