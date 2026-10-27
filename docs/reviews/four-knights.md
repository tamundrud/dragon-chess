# Four knight scenes — draft verification

The batch selects the four approved knight identities: Windwalker (swoop), One Eye (pounce), Driller-Dragon (horn charge) and Poisonous Piffleworm (bubble). Starting-square identity follows the piece through legal moves, capture and Undo; knight promotion uses the first approved design for each faction. Board tokens and unsupported defender classes remain placeholders. The new art and choreography require individual owner acceptance; see [art provenance](../../public/art/knights/PROVENANCE.md) and [the Fireworm benchmark](../FIREWORM_BENCHMARK.md).

## Review

[CE code review](artifacts/four-knights-review/ce-code-review.json) and [metadata](artifacts/four-knights-review/ce-code-review-metadata.json) record five local lenses and an independent validator. The pre-fix review confirmed three findings: illustrated knight defenders, Piffleworm release continuity, and natural-completion/resize-return tests. All were addressed; a separate follow-up checked the fixes and also prompted shared Fireworm defender routing. No different-provider reviewer was available. Artwork and recordings were excluded from the code-review diff and inspected separately. CE plan document review could not be invoked through a normal skill-invocation mechanism; it did not run. A local plan coherence and repository check preceded work. Simplification was inspected locally; a separate CE simplification invocation was unavailable.

## Local verification

- `npm test`: 166 tests passed. `npm run typecheck`, `npm run lint`, `git diff --check`, and `npm run build` passed. Vite reported its existing large-bundle warning.
- Production preview with system Chromium: `e2e/knights.spec.js` passed all 27 cases across desktop, 360 × 800 portrait and 800 × 360 landscape. These exercise all four legal captures, rotation, normal completion, Undo, Skip, abort/new game and knight-versus-knight capture. The recordings ran as eight additional browser cases.
- The desktop resize regression passed all four cases after its status-pixel sampling was updated to match the illustrated stage. This run preceded the final label-only layout adjustment; the final gameplay cases rotate all four presenters. The browser suite uses Chromium emulation rather than Safari.
- An earlier full 185-case browser run was interrupted after three startup readiness timeouts while browser workers, unit tests and TypeScript checks ran together; 178 cases did not run. A subsequent isolated desktop resize run passed the generic cases and exposed the obsolete One Eye status-sampling assumption, which was corrected. The complete suite has not been shown to pass locally. CI is a separate gate; its result must be checked on the draft PR.

## Recordings

The clips are generated from the production presenter and actual legal game captures, in Chromium emulation. They are clock-stepped at 15 frames per second and encode the full logical sequence. They show rendered motion, not physical-device frame rate or timing.

| Character | 360 × 800 portrait | 800 × 360 landscape |
| --- | --- | --- |
| Windwalker | [Portrait](artifacts/four-knights/phone-360-portrait-windwalker.mp4) | [Landscape](artifacts/four-knights/phone-landscape-windwalker.mp4) |
| One Eye | [Portrait](artifacts/four-knights/phone-360-portrait-one-eye.mp4) | [Landscape](artifacts/four-knights/phone-landscape-one-eye.mp4) |
| Driller-Dragon | [Portrait](artifacts/four-knights/phone-360-portrait-driller.mp4) | [Landscape](artifacts/four-knights/phone-landscape-driller.mp4) |
| Poisonous Piffleworm | [Portrait](artifacts/four-knights/phone-360-portrait-piffleworm.mp4) | [Landscape](artifacts/four-knights/phone-landscape-piffleworm.mp4) |

## Acceptance boundary

Owner visual acceptance of all four designs, transitions, timing, impact and phone composition remains open. The landscape labels are small and should be judged on a physical phone. Physical iOS Safari/Android, safe areas, performance and memory, and child usability are not established by Chromium emulation. No sound pack ships. The six new PNG files total approximately 10 MB compressed and are loaded during scene startup; physical-phone download, decode and memory costs need measurement.
