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
- **Implementation Status**: Implemented in `CharacterRegistry` (`id: 'fire_dragon'`, `defaultAttackId: 'fire_stream_attack'`). Configured and assigned by default to the light-side knight on square `g1` via square assignment mapping (`assignToSquare('g1', 'fire_dragon')`).

### Pawns — Viking warriors
- Brave, determined, smaller-scale, slightly comic but competent.

## Dark-side faction
Use a generic rival Viking clan with clearly contrasting palette and readable silhouettes.
