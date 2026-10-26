# Fireworm battle-scene benchmark

Fireworm’s visual and interaction choreography is **approved by the owner**, following physical-phone testing on 2026-10-26. [Approval on PR #16](https://github.com/tamundrud/dragon-chess/pull/16#issuecomment-6428592082) resolves the Fireworm visual objections recorded on PRs #13–16. Earlier plans and reviews preserve the decisions and pending status at the time they were written; this document is the current acceptance reference.

## Quality standard for future battle scenes

- Keep the actual chessboard visible and darkened behind enlarged foreground combatants. Characters emerge, engage and return clearly to chess; the painted arena remains an optional comparison presentation.
- Face characters toward their opponent. Keep silhouettes and poses connected, expressive and legible at phone scale.
- Preserve continuity from anticipation through attack, impact, comic reaction and recovery. Fireworm demonstrates this with one mouth-anchored stream travelling in front of the defender, broadening into engulfment, then clearing to a soot-covered, dazed reveal.
- Use colourful, exaggerated, child-friendly effects with readable timing and a satisfying return. Preserve Normal/Fast/Instant, reduced motion and Skip, without rapid strobing or required sound.
- Preserve the lifecycle contract: one authoritative chess commit on completion/Skip, none on abort, input locking, cleanup and rotation without restarting the attack.

**Character-specific attacks remain flexible.** Future characters should express their own personality, anatomy and attack style. They do not need Fireworm’s flame stream, fireworks, timing or identical beat sequence. Match its staging, continuity, polish, legibility and lifecycle quality; obtain character-specific visual acceptance before treating another attack as approved.

## Scope and retained review tools

This approves the Fireworm prototype’s presentation, not all character portraits, board tokens, audio, devices or full-game release readiness. The temporary raider, other cast artwork and procedural Fire Dragon remain explicitly provisional. Quantitative phone frame-rate/memory measurements, broad iOS Safari/Android Chrome coverage, browser bars/safe areas, child usability and hardware audio acceptance remain open. No sound pack ships. Source artwork and provenance remain in [the asset manifest](ASSET_MANIFEST.md) and [provenance record](../public/art/fireworm/PROVENANCE.md).

The `/?preview=fireworm` replay view uses the production presenter, real board and an isolated legal chess fixture. Keep it for benchmark comparison and browser regression coverage; it does not alter the active game. Keep the arena option and recording script for the existing comparison matrix. Remove obsolete independently animated anatomical atlas-frame registrations; retain the original atlas because its flame and extracted raider are still used. Retain historical review evidence.

See [integration verification](reviews/fireworm-integration.md) for current checks and integration history. Owner approval does not replace technical gates or authorize deployment.
