# Character roster — tribe-grounded casting and design brief

**Status (2026-10-25):** Human King/Queen/Bishop casting and Toothless/Killer bishop assignments are selected. **All eight rook/knight dragon slots are open.** The prior Wodensfang/Green Death/Furious/Luna/Windwalker/Stormfly/One Eye/Typhoon table was **rejected by the owner** because it mixed dragons with no direct affiliation to their assigned tribe. A named dragon appearing in the books is **not** sufficient evidence of tribe membership. Do not implement that rejected roster.

## Rules for casting

1. **White = Hairy Hooligans; Black = Meatheads.** Each dragon must have a **direct book-grounded connection to its own tribe** (owned/trained by a tribe member, or explicitly used/kept by the tribe at its location). Being a book character, being friendly with Hiccup, or existing on a nearby island is not sufficient.
2. Prefer individually named, directly associated dragons. **If too few exist, use canon dragon species demonstrably kept/used by that tribe**, displayed as unnamed individuals rather than inventing a supposedly canonical name.
3. Do not repeat an individual dragon name between the sides. Keep Toothless and Killer in their already-assigned bishop slots.
4. **No additional Monstrous Nightmares**, because Killer already represents that species; this applies to both tribes.
5. **Both rooks must breathe fire**, and their species or specific book-supported fire power must be confirmed before their animated attack is committed. Not every species is fire-breathing; avoid taking film/TV powers as book canon.
6. All sixteen pieces on each side retain ordinary chess rules. Each tribe's pieces must be distinguishable on a 360px phone.

## Owner-selected pieces

| Chess role | White: Hairy Hooligans | Black: Meatheads | Status |
| --- | --- | --- | --- |
| King (1) | **Stoick the Vast** | **Mogadon the Meathead** | Selected |
| Queen (1) | **Valhallarama** | **Hairy Scary Librarian** | Selected; Librarian is male in the books |
| Bishop (2) | **Hiccup Horrendous Haddock III**, **Toothless** | **Thuggory**, **Killer** | Selected; Killer is Thuggory's Monstrous Nightmare |
| Rook (2) | **Unassigned** — two directly Hooligan-associated fire-breathing dragons | **Unassigned** — two directly Meathead-associated fire-breathing dragons | OPEN; fire is a required ability |
| Knight (2) | **Unassigned** — two directly Hooligan-associated dragons | **Unassigned** — two directly Meathead-associated dragons | OPEN; species fallback allowed |
| Pawn (8) | Barbarian Hooligan warriors | Barbarian Meathead warriors | Selected archetype |

## Research — directly associated dragon options (not an approved lineup)

### Hairy Hooligans — stronger direct connections

| Dragon | Connection | Constraint |
| --- | --- | --- |
| **Windwalker** | Hiccup's riding dragon; Hairy Hooligan faction | Especially suitable to explore as a fast knight; “Windwalker” is the species/identity used in the book, not an invented individual name |
| **Newtsbreath** (Gronckle) | One of chief Stoick's hunting dragons | Book-specific fire attack for this named individual not independently confirmed |
| **Seaslug** (Gronckle) | Dogsbreath the Duhbrain's dragon | Book-specific fire attack for this named individual not independently confirmed |
| **Horrorcow** (Basic Brown) | Fishlegs's hunting dragon | Cowardly/comic and nonaggressive; stronger fit as a quirky knight than a dramatic fire-breathing rook |
| **Bullheart** | Another dragon associated with Stoick | Dragon appearance/species/attacks need primary-book verification before assignment |

**Exclude** Stormfly (Camicazi is a Bog-Burglar, not a Hooligan), Green Death (enemy of Berk), and dragons merely allied with Hiccup who are not established Hooligan tribe dragons. Exclude Fireworm and Hookfang because both are Monstrous Nightmares.

### Meatheads — strong location/tribe links, sparse individual names

- **Killer** is a verified named Meathead dragon, but is **already cast as Bishop**. I could not verify four *additional* individually named Meathead dragons from available book references.
- The **Meathead Public Library** on Meathead Island is guarded or inhabited by **Driller-Dragons**, **Red-Hot Itchyworms** and **Poisonous Piffleworms**. These are genuine *species-level* Meathead-location connections, not individually named pets.
- **Driller-Dragons** have a direct guard function at the library and may suit a knight or specialized non-fire attack.
- **Poisonous Piffleworms** attack with venomous bites; **Red-Hot Itchyworms** use bites/heat. Their documented abilities do **not** establish dragon fire-breathing; do not assign them as fire-breathing rooks by assumption.
- The book describes Meathead boys owning/bringing dragons to the dragon initiation trial, but I have **not yet verified a fire-breathing non-Nightmare species individually tied to Meatheads**. Thus the two Meathead rook slots **must stay unresolved** until a suitable book-backed species is found (or the user explicitly approves a carefully labeled exception).

## Reference evidence and confidence

Secondary references reviewed on 2026-10-25; confirm against the user's books before final character art:
- [Meathead tribe (books)](https://howtotrainyourdragon.fandom.com/wiki/Meathead_Tribe_(Books)) and [Killer](https://howtotrainyourdragon.fandom.com/wiki/Killer)
- [Meathead Public Library](https://howtotrainyourdragon.fandom.com/wiki/Meathead_Public_Library), [Driller-Dragon](https://howtotrainyourdragon.fandom.com/wiki/Driller-Dragon), [Poisonous Piffleworm](https://howtotrainyourdragon.fandom.com/wiki/Poisonous_Piffleworm), [Red-Hot Itchyworm](https://howtotrainyourdragon.fandom.com/wiki/Red-Hot_Itchyworm)
- [Stoick's dragons](https://howtotrainyourdragon.fandom.com/wiki/Stoick_the_Vast_(Books)), [Hiccup's Windwalker](https://howtotrainyourdragon.fandom.com/wiki/Hiccup%27s_Windwalker_(Books)), [Fishlegs](https://howtotrainyourdragon.fandom.com/wiki/Fishlegs_No-Name), [Book-series characters](https://en.wikipedia.org/wiki/How_to_Train_Your_Dragon_(novel_series))
- [Book dragon fire overview](https://howtotrainyourdragon.fandom.com/wiki/Dragon_(Books)). Species-level fire generalization is **not** evidence of a named individual's powers.

## Next design decisions

1. Confirm the *specific tribe-grounded selections* for all eight rook/knight slots. For the Meatheads, explicit book-used species are preferable to unrelated named dragons.
2. Solve the Meathead **fire-breathing rook** evidence gap before signing off on a definitive roster. Do not treat poison/heat as fire without permission.
3. Decide whether a single book species may be represented by multiple different unnamed individuals in one army. Keep no individual cross-clan duplicates.
4. Verify the selected characters' book appearances and production references; then approve assets and one signature capture. **No registry, sprites or presentation implementation is authorized by this draft.**

## Current implementation (not the desired casting)

The playable build maps both white knights to a procedural generic `fire_dragon`; other characters mainly have placeholder board tokens and attack presenters. The above research is a **planning correction**, not an implementation report. See [art direction](ART_DIRECTION.md), [visual reset plan](plans/2026-10-25-book-visual-reset.md), and [architecture](ARCHITECTURE.md).
