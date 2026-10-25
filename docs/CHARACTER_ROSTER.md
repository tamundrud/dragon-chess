# Character roster — faction casting and design brief

**Casting status (owner, 2026-10-25):** Factions and named King/Queen/Bishop roles are **chosen**. Rook/knight dragon species, individual appearances, and animations are **not yet approved**. This is a design brief; the current playable build still uses prototype registries, lettered tokens and mostly generic presenters.

## Chess factions

- **White: Hairy Hooligans**, from Berk. A warmer, more welcoming visual family; distinguish with banners, warm light, distinctive Viking accents and token frames. Palette values are candidates, not locked.
- **Black: Meathead clan / Merciless Meatheads**, a rival Viking tribe. Contrasting darker/cooler or earthier tones, shapes, banners and markings; avoid equating the tribe with inherent evil.
- **Both sides:** eight barbarian Viking warrior pawns; primarily dragon-based rooks and knights; clear light/dark allegiance on every piece, including species repeated across sides.
- The user selects the named *book* characters, while art should be an original richly coloured 2D animated-storybook interpretation, not designs from film/television adaptations.

## Selected chess-piece casting

| Chess piece | White — Hairy Hooligans | Black — Meatheads | Casting/design status |
| --- | --- | --- | --- |
| King (1) | **Stoick the Vast** | **Mogadon the Meathead** (Meathead chief) | Named characters selected |
| Queen (1) | **Valhallarama** | **Hairy Scary Librarian** | Named characters selected; the Librarian is a male character in the books, notwithstanding the chess piece name |
| Bishop (2) | **Hiccup Horrendous Haddock III** and **Toothless** (one piece each) | **Thuggory the Meathead** and **Killer**, Thuggory's dragon (one piece each) | Named characters selected; name is **Thuggory**, not “Thuggery” |
| Rook (2) | **Fire-breathing dragons from the books** | **Same selected dragon types/designs as White**, with Meathead visual identity | Require specific dragon choices; both rooks must read as fire-breathers |
| Knight (2) | **Other dragons from the books** | **Same selected dragon types/designs as White**, with Meathead visual identity | Require specific dragon choices |
| Pawn (8) | **Barbarian Hairy Hooligan warriors** | **Barbarian Meathead warriors** | Uniform per tribe with optional individual variety |

“Same dragons” for Black rooks/knights means **matching roster/species archetypes across the two armies**, not identical-looking tokens with no team distinction. Exact duplication versus colour/armour variants can be determined in concept review. Preserve the standard piece counts and chess moves.

## Book-canon and character notes

- **Stoick / Valhallarama:** commanding Viking leaders, with different posture and personality, not interchangeable crowns.
- **Mogadon:** named chief of the Meatheads, rival of Stoick.
- **Hairy Scary Librarian:** a feared, formidable **male** Meathead librarian. A chess “queen” is the most mobile game piece; its actor need not be female.
- **Hiccup:** the smaller, clever young Viking of the *books*, not his screen-adaptation model.
- **Toothless:** a **small book dragon**; not the movie Night Fury. Distinctive silhouette and expressive character matter more than matching a large-dragon power fantasy. His inclusion as a bishop does **not** imply fire-breathing rook abilities.
- **Thuggory:** son of Mogadon and young Meathead warrior; spell the name **Thuggory**. He is paired here with his dragon **Killer**, a huge silver **Monstrous Nightmare** in the books.
- **Dragon rooks:** choose book-derived dragons that can plausibly fire-breathe; make their attacks their signature. **Dragon knights:** different agile or other distinctive book dragons. Do not invent final species or powers without reviewing book references.
- **Two-tribe expression:** silhouettes must signal *piece type* first and *faction* second, with tribe-coded colour trims, armour/saddles, banners or frames, and accessible contrast on both square colours.
- **Fictional casting vs chess semantics:** humans can occupy queen/bishop roles regardless of gender or fighting style, and role casting does not change legal chess movement.

### Reference verification

The book-world role identifications were checked against book-series character summaries, including that Mogadon is Meathead chief; Thuggory is his son and Killer is a silver Monstrous Nightmare; the Hairy Scary Librarian is male. References for further review:

- https://en.wikipedia.org/wiki/How_to_Train_Your_Dragon_(novel_series)
- https://howtotrainyourdragon.fandom.com/wiki/Meathead_Tribe_(Books)
- https://howtotrainyourdragon.fandom.com/wiki/Hairy_Scary_Librarian

Use book text and original book art as ultimate reference before illustrating particular characters.

## Design work still needed

1. Select two identifiable **book fire-breathing dragon designs** for the white rooks (mirrored for Meatheads).
2. Select two other **book dragon designs** for white knights (mirrored for Meatheads).
3. Define token size, framing, species silhouette, faction palette and clear four-corner square contrast at a **360px phone width**.
4. Choose a first **signature capture** performer for production. Prefer a fire-breathing **rook** given the confirmed casting; the old generic Fire Dragon knight sequence is a technical prototype, not the final character or assigned piece.
5. Review appearance references and approve concepts before changing `CharacterRegistry`, `BoardScene` or presenters.

## Implementation reality (not target casting)

The code currently maps light `w_k` to `stoick`, `w_q` to `valhallarama`, **both white knights** to the generic `fire_dragon`, white pawns to `viking_warrior`, and most other pieces to `light_generic`/`rival_generic`. The generic fire dragon is procedural. The board uses temporary lettered circles. There is no approved new character art, token pack or dedicated animation for the other cast members. **Do not report this document's selected casting as implemented.**

See [visual reset plan](plans/2026-10-25-book-visual-reset.md), [art direction](ART_DIRECTION.md), and [architecture](ARCHITECTURE.md).
