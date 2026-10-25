# Book-first visual reset — concept and acceptance plan

**Status:** Broad visual style selected 2026-10-25; factions and named King/Queen/Bishop casting selected; dragon-rook/knight species, individual character designs, storyboard and implementation are **not** approved.  
**Date:** 2026-10-25  
**Base:** Integrated, playable chess prototype on `main`.

## Decision and reason

The intended family game is based on **Cressida Cowell's *How to Train Your Dragon* books and illustrations**, not the film/TV adaptations. The original technical vertical slice established a working chess game, input/animation lifecycle, and a procedural Fire Dragon capture. Owner testing on a phone found the chess functionality broadly satisfactory but the dragon/book setting, artwork, and animations far below the desired experience.

**Do not mistake technical completion, screenshots, an 11-beat timeline, or passing tests for visual acceptance.** The next milestone is a creative-quality gate, not more rules or generic animation features.

## Creative goal

A child who knows the books should immediately recognize their unruly, funny, adventurous world: expressive, quirky Vikings and dragons; lively drawing; a sense of Berk; and playful, distinctive character behavior. The result should be *readable and inviting on a phone* and feel like an illustrated book come alive, rather than a dark generic fantasy game or a copy of the movies.

Use the original books and their illustrations as the source of truth for character identity and atmosphere. **Owner-selected visual language:** richly coloured, animated interpretations of book characters. Use expressive hand-drawn contours, generous colour, painterly shading and vivid but readable environments, exaggerated anatomy and comic timing; mix in maps, parchment and Viking textures where useful. Do not default to a near-monochrome ink imitation or generic dark fantasy. These cues define a direction, not approval of any individual concept. See `docs/ART_DIRECTION.md` for the living visual rules.

This is a private family project. No public distribution, monetization, or official affiliation is planned. Reassess rights and asset provenance if that changes.

## Owner feedback: preferred concept (2026-10-25)

The owner prefers **Concept 3: richly painted fairytale illustration**, as a **concept** rather than final art approval. Use it as the basis for the next detailed mockups: a full-size 360px mobile board and a single character-driven dragon-capture storyboard. Preserve colour, lighting, painterly atmosphere and a sense of adventure, while avoiding screen-adaptation designs, an overly solemn feel, or a visually crowded board. The characters, book fidelity, faction silhouettes, actual board legibility, visual rhythm, assets and animation still require explicit owner review. Concepts 1 and 2 remain rejected as the primary direction, but useful details can be borrowed if approved.

## Owner feedback: selected factions and casting (2026-10-25)

**Decisions recorded:** White = **Hairy Hooligans**, Black = **Meathead clan**. Both use barbarian warrior pawns and dragon-based rooks/knights. Rooks **must breathe fire**. Shared rook/knight book-dragon designs across both sides are acceptable **only if tribe-coded appearance is unmistakable**.

- White King **Stoick the Vast**; Queen **Valhallarama**; two Bishops **Hiccup** and the **small book Toothless**.
- Black King **Mogadon the Meathead**; Queen **Hairy Scary Librarian** (male book character); two Bishops **Thuggory the Meathead** and his dragon **Killer**, a silver Monstrous Nightmare.
- Correct book spelling **Thuggory**, not Thuggery. Named casting is selected, **not implemented**.
- [Character roster](../CHARACTER_ROSTER.md) now defines the authoritative piece matrix and which decisions remain open.

**Style note:** the owner likes the last richly painted coastal-Viking UI/environment concept, but **has not approved its individual character designs**. These should be redesigned around the casting above rather than treated as licensed or finished assets.

**Next visual pair:** (1) an 8×8 **mobile board** with Hooligan/Meathead faction colours and identifiable human/dragon roles, with room for gameplay controls; (2) a **faction roster sheet** mapping all six chess-piece classes and highlighting the separate book characters for the bishops. Both are concept art, not source assets, UI implementation, exact canon illustrations, or a substitute for measured phone legibility.

**Concept-image provenance:** The generated mobile board and faction roster mockups from this design review are *illustrative previews only*; they have not been committed as production assets. Generated labels/names attached to rook and knight dragons (for example “Stormfang,” “Blazewing,” “Cloudjumper,” or “Windrider”) are **NOT confirmed book-canon selections** and must not be written into the character registry on the strength of a generated picture. Actual book species and the four dragon roles remain to be selected. The images also do not certify a precise playable chess layout, accessible controls, or canonical portrait fidelity.

**Next animation storyboard:** after choosing specific fire-breathing rook dragons from the books, design their first signature capture. Do not silently continue treating the original generic knight Fire Dragon as a canonical character.

## Phase 5: approve the visual language *before* production implementation

1. **Reference/canon pass.** Assemble a short, explicit reference sheet from book-owned/user-provided pages or legitimate previews, citing which *book* character, creature, setting, or detail each reference establishes. Never use film designs as a substitute for book references.
2. **Complete dragon roster selection.** Preserve the already selected Hooligan and Meathead human/Bishop casting in `docs/CHARACTER_ROSTER.md`. Choose book-canon fire-breathing dragons for the rooks, and other book dragons for the knights; confirm how mirroring works across tribes. Keep the chess rules unchanged.
3. **Explore rich-colour style variants.** Produce 2–3 coherent variations **within the owner's selected richly coloured animated-storybook direction**, and compare (a) the opening screen, (b) a 360px-wide board with readable character tokens and opposing teams, and (c) one proposed book-dragon capture storyboard. Vary palette, hand-drawn linework, painted depth and motion personality; do not re-open ink-only versus coloured as the principal choice. Do not start by generating dozens of disconnected assets.
4. **Approve animation language.** Storyboard anticipation, character action, impact, comic reaction, and recovery for **one** capture. Specify pose changes, staging, timing, effects, sound intent, reduced-motion behavior, and when the result becomes readable again. Motion must convey personality, not just translate geometric shapes.
5. **Human visual gate.** The owner reviews variants within the already chosen rich-colour direction at actual phone size, including a short landscape layout, selects a concrete treatment, accepts/changes the roster and storyboard, and records specific concerns. Child feedback is valuable; screenshot/CI checks cannot replace this decision.

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
2. Which specific **book dragon designs** take the paired rook and knight slots? How do matching species differ between Hooligan and Meathead tokens?
3. Which palette, rendering approach and character-design variant best implements the **already selected richly coloured animated-book aesthetic**?
4. Which book **fire-breathing rook dragon** should perform the first signature capture?
5. What capture length feels enjoyable at Normal speed after repeated viewing?

## Existing references

- [Product brief](../PRODUCT_BRIEF.md)
- [Art direction](../ART_DIRECTION.md)
- [Character roster](../CHARACTER_ROSTER.md)
- [Attack system and implemented Fire Dragon](../ATTACK_SYSTEM.md)
- [Asset manifest](../ASSET_MANIFEST.md)
- [Test plan and manual acceptance](../TEST_PLAN.md)
- [Roadmap](../ROADMAP.md)
