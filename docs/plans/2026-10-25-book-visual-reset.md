# Book-first visual reset — concept and acceptance plan

**Status:** Broad visual style selected 2026-10-25; factions and named King/Queen/Bishop casting plus **One Eye as White Knight 2** selected; the other seven rook/knight slots, individual character designs, storyboard and implementation are **not** approved.  
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

**Decisions recorded:** White = **Hairy Hooligans**, Black = **Meathead clan**. Both use barbarian warrior pawns and dragon-based rooks/knights. Rooks **must breathe fire**. The sides cannot reuse the same individual dragon names. Distinct named **book-connected** Hooligan characters are preferred; Meathead rook characters may be **plausibly invented unnamed members of verified book fire-breathing species** where no explicitly owned named dragon exists. Monstrous Nightmares may be used if required, although **another Meathead Nightmare is a last resort** because Killer already occupies a bishop slot.

- White King **Stoick the Vast**; Queen **Valhallarama**; two Bishops **Hiccup** and the **small book Toothless**.
- Black King **Mogadon the Meathead**; Queen **Hairy Scary Librarian** (male book character); two Bishops **Thuggory the Meathead** and his dragon **Killer**, a silver Monstrous Nightmare.
- Correct book spelling **Thuggory**, not Thuggery. Named casting is selected, **not implemented**.
- [Character roster](../CHARACTER_ROSTER.md) now defines the authoritative piece matrix and which decisions remain open.

**Style note:** the owner likes the last richly painted coastal-Viking UI/environment concept, but **has not approved its individual character designs**. These should be redesigned around the casting above rather than treated as licensed or finished assets.

**Owner rejection of initial rook/knight roster (2026-10-25):** The Wodensfang/Green Death/Furious/Luna/Windwalker/Stormfly/One Eye/Typhoon cross-tribe proposal was **not approved** because most choices have no direct clan affiliation. **Withdraw this as a candidate set.** A valid assignment requires a book-backed link to the correct tribe: belonging to a tribe member or explicitly used/kept by that tribe. Mere book existence, friendliness with a Hooligan, or broad regional presence is insufficient. The existing human/Bishop casting remains selected. **All eight rook and knight slots are open.**

**Updated research and constraints (2026-10-25):** The owner explicitly **excluded Seaslug** and suggested Hookfang or One Eye as alternatives. **Fireworm**, Snotlout's flame-red Monstrous Nightmare, is the likely forgotten named dragon; she demonstrably sets fire to books. Book **Hookfang** is Stoick's Monstrous Nightmare (not Snotlout's, as in the adaptation). Hooligan rooks can therefore be Fireworm and Hookfang, with Windwalker and One Eye as knights. **Owner decision (2026-10-25): choose One Eye instead of Newtsbreath** for greater visual and character variety. His temporary association with the Hooligans is considered sufficient for this family-game assignment. Meathead rooks can plausibly be *unnamed* Flamehuffer and Common or Garden Dragon individuals: both are genuine fire-breathing book species, but direct Meathead ownership is **not book-canon**. Meathead knights can use the Driller-Dragons and Poisonous Piffleworms known to guard/inhabit the Meathead Public Library. The lineup as a whole is **not approved**; **One Eye's White Knight 2 position is selected**, while the other seven dragon positions remain proposals; [character roster](../CHARACTER_ROSTER.md) records the exact evidence, caveats and links.

**Next visual pair:** (1) an 8×8 **mobile board** with Hooligan/Meathead faction colours and identifiable human/dragon roles, with room for gameplay controls; (2) a **faction roster sheet** mapping all six chess-piece classes and highlighting the separate book characters for the bishops. Both are concept art, not source assets, UI implementation, exact canon illustrations, or a substitute for measured phone legibility.

**Concept-image provenance:** The generated mobile board and faction roster mockups from this design review are *illustrative previews only*; they have not been committed as production assets. Generated labels/names attached to rook and knight dragons (for example “Stormfang,” “Blazewing,” “Cloudjumper,” or “Windrider”) are **NOT confirmed book-canon selections** and must not be written into the character registry on the strength of a generated picture. The rejected eight-name proposal stays withdrawn. A replacement with clan-connected names and plausible unnamed Meathead fire-breathing species is now documented **for owner review only**, not approved. The images also do not certify a precise playable chess layout, accessible controls, or canonical portrait fidelity.

**Casting decision (2026-10-25):** White Knight 2 = **One Eye** is approved, superseding the Newtsbreath alternative. Seven rook/knight slots remain provisional. The choice concerns identity only, not final art or attack choreography.

**Next animation storyboard:** after selecting and verifying a specifically Hooligan- or Meathead-affiliated fire-breathing rook dragon, design its first signature capture. Do not silently continue treating the original generic knight Fire Dragon as a canonical character.

## Phase 5: approve the visual language *before* production implementation

1. **Reference/canon pass.** Assemble a short, explicit reference sheet from book-owned/user-provided pages or legitimate previews, citing which *book* character, creature, setting, or detail each reference establishes. Never use film designs as a substitute for book references.
2. **Review clan-consistent dragon candidate lineup.** Preserve approved King/Queen/Bishop casting; compare the directly Hooligan-connected Fireworm/Hookfang/Windwalker/One Eye with the two book-verified fire-breathing species *plausibly* owned by Meatheads and their library-linked Driller-Dragon/Piffleworm. One Eye is owner-selected despite not being a permanently Hooligan-owned dragon; do **not** replace him with Newtsbreath absent a new owner decision. Permit Monstrous Nightmares (Meathead only as last resort), avoid Seaslug, never invent a canonical named dragon, and state every difference between direct book evidence and game interpretation. Keep chess rules unchanged.
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
2. Accept or revise the **new eight-slot dragon candidate table** in the roster. Specifically: approve/reject Fireworm + Hookfang (both Nightmares) as Hooligan rooks; One Eye is selected (no further One Eye vs Newtsbreath decision); and *plausibly owned* Flamehuffer and Common or Garden as unnamed Meathead fire-breathing rooks. Do not revive the rejected unrelated named-dragon roster.
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
