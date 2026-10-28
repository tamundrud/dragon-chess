# Four Bishop scenes — verification and owner acceptance

Hiccup launches a glider, Toothless pounces, Thuggory charges with a shield, and Killer swoops. Their starting-square identities follow the pieces through play and Undo, and Bishop promotion selects the first approved design for the faction. The artwork is original fantasy/Viking-inspired work; its generation and inspection are described in [art provenance](../../public/art/bishops/PROVENANCE.md). The four Bishop scenes await owner visual acceptance.

## Review

The [CE code review](artifacts/four-bishops-review/ce-code-review.json) and [metadata](artifacts/four-bishops-review/ce-code-review-metadata.json) record seven local review lenses and an independent validator. The report describes the pre-fix work and returned “Ready with fixes.” Its four validated findings were addressed: tests now assert actual attack and impact phases, Bishop defenders can use their illustrated pose, artwork loading has a timeout, and cancelled downloads cannot block subsequent scenes. A follow-up also identified that an unavailable optional Bishop defender image could suppress another character's attack; the scene now falls back to the placeholder and has a browser regression. A different-provider reviewer was unavailable. Artwork and video were inspected separately from code review.

## Verification

- `npm test`: 225 tests passed; typecheck, lint, build and `git diff --check` passed. Vite reported its existing large-bundle warning.
- Eight final portrait/landscape recording cases passed. Five final desktop Chromium cases passed, covering all four captures and confirming Bishop artwork is not fetched at startup. Production-preview Chromium tests exercise legal captures, attack and impact phases, rotation, Undo, Skip, cancellation, illustrated Bishop defenders and interrupted or failed artwork requests. An earlier 24-case desktop and phone run had 23 passes and one trace-archive error; the affected scenarios passed in a nine-case rerun. Subsequent focused phone tests passed for the revised loader and defender fallback. The full browser suite has not been shown to pass locally; CI is a separate gate.
- The fourteen Bishop WebP assets total about 3.4 MB compressed. They are requested on capture rather than game startup, cached for reuse, and loading is bounded and cancellable. Physical-device download, decode, memory and frame-rate costs remain unmeasured.

## Recordings

These clips show actual legal captures using the production presenter in Chromium emulation. They are clock-stepped at 15 frames per second and show the logical sequence, rather than physical-device timing or frame rate.

| Character | 360 × 800 portrait | 800 × 360 landscape |
| --- | --- | --- |
| Hiccup | [Portrait](artifacts/four-bishops/phone-360-portrait-hiccup.mp4) | [Landscape](artifacts/four-bishops/phone-landscape-hiccup.mp4) |
| Toothless | [Portrait](artifacts/four-bishops/phone-360-portrait-toothless.mp4) | [Landscape](artifacts/four-bishops/phone-landscape-toothless.mp4) |
| Thuggory | [Portrait](artifacts/four-bishops/phone-360-portrait-thuggory.mp4) | [Landscape](artifacts/four-bishops/phone-landscape-thuggory.mp4) |
| Killer | [Portrait](artifacts/four-bishops/phone-360-portrait-killer.mp4) | [Landscape](artifacts/four-bishops/phone-landscape-killer.mp4) |

Owner acceptance is outstanding for all four Bishops. Chromium emulation does not establish physical iOS Safari or Android behavior, safe-area handling, physical performance or child usability. No sound pack ships.
