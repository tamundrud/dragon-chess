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
