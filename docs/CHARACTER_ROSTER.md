# Character Roster

## Scope
This roster is intentionally incomplete. Prove the system before building the full cast.

## Light-side faction: Berk
### King — Stoick the Vast
- Immensely strong, confident, protective, heroic.
- Slightly bumbling in motion, never cowardly.

### Queen — Valhallarama
- Direct, heroic, controlled, efficient, fearless, decisive.

### Knight — Fire dragon
- Powerful, expressive, slightly mischievous, proud of its fire.
- Configurable `fire_dragon` identity for the vertical slice.
- **Implementation Status**: Implemented in `CharacterRegistry` (`id: 'fire_dragon'`, `defaultAttackId: 'fire_stream_attack'`). Both light knights resolve to Fire Dragon via the `w_n` piece-type mapping; an initial `g1` square mapping also exists. Other roster entries use generic temporary presentation rather than dedicated character presenters.

### Pawns — Viking warriors
- Brave, determined, smaller-scale, slightly comic but competent.

## Dark-side faction
Use a generic rival Viking clan with clearly contrasting palette and readable silhouettes.

## Book-canon casting is pending

The final cast must use **the books by Cressida Cowell**, not the film adaptations. Existing piece mappings above reflect prototype implementation, **not approved canonical casting or artwork**. In particular:

- **Hiccup Horrendous Haddock III** and the **small book version of Toothless** are central to the source material but are not represented by dedicated registered characters yet. Their roles must be considered explicitly rather than left off the board.
- The `fire_dragon` knight is a *generic prototype character*, **not automatically Toothless**. Two white knights currently resolve to it, and the Fire Dragon implementation still uses procedural illustration. A registry art-status flag does not establish final visual quality.
- Stoick and Valhallarama are provisional chess-role choices; retain or change them on creative review, not as a side effect of implementation.
- Rival clan, supporting Vikings and dragons should be selected from or plausibly grounded in the book setting after references are approved; don't substitute movie-only appearances.
- Decide whether two pieces of a given type share a character or have distinct identities. Maintain a clear, instantly readable difference between chess piece types regardless.

**Pending owner decisions:** prioritised book characters, source volume(s) or pages, light/dark sides, chess piece roles (especially Hiccup/Toothless), and which book dragon/character anchors the first showcase capture. Document approved casting here before commissioning final tokens or attack animation.

See [the visual reset plan](plans/2026-10-25-book-visual-reset.md).
