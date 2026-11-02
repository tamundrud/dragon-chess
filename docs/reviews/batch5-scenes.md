# Batch 5 scenes — review and verification

Mogadon makes a pompous shield charge, overbalances and recovers; Valhallarama vaults over her opponent and gives a playful broadside head tap; the Hairy Scary Librarian uses both Heart-Slicers in a crossed guard, alternating sword poses and crossed-blade contact. These are candidate scenes pending owner visual acceptance. The owner approved the concept directions on October 29; the generated production poses and recorded motion require their own acceptance.

## Review

The [CE review receipt](artifacts/batch5-ce-review/review.json) and [metadata](artifacts/batch5-ce-review/metadata.json) cover the earlier pre-fix snapshot and returned **Ready with fixes**. Seven local lenses reviewed it; a different-provider reviewer was unavailable, so a local adversarial reviewer covered that lens. The three confirmed findings were addressed with a visual regression assertion for the illustrated Librarian defender, cold-load Skip/abort and required-artwork failure coverage, and a defender turn after Valhallarama vaults. A separate local follow-up inspected the final Valhallarama phone recordings after the drawing-order and contact-height changes: the defender turns and the blade is visible at the top of the head. The recorded opponent is bareheaded, so this demonstrates a head tap; it does not prove a helmet tap. Owner review remains necessary, including whether separately generated poses transition smoothly enough.

## Recordings

| Character | Portrait (360 × 800 viewport) | Landscape (800 × 360 viewport) |
| --- | --- | --- |
| Mogadon | [Portrait](artifacts/batch5-videos/phone-360-portrait-mogadon.mp4) | [Landscape](artifacts/batch5-videos/phone-landscape-mogadon.mp4) |
| Valhallarama | [Portrait](artifacts/batch5-videos/phone-360-portrait-valhallarama.mp4) | [Landscape](artifacts/batch5-videos/phone-landscape-valhallarama.mp4) |
| Hairy Scary Librarian | [Portrait](artifacts/batch5-videos/phone-360-portrait-hairy_scary_librarian.mp4) | [Landscape](artifacts/batch5-videos/phone-landscape-hairy_scary_librarian.mp4) |

These are legal captures using the production presenter in Chromium, with a stepped clock at 15 frames per second. They show the game canvas within emulated phone viewports, not physical-device performance or owner acceptance. The final Valhallarama videos were regenerated after the drawing-order and contact-height adjustments; the other videos precede those Valhallarama-only changes. The [queen-capture reference image](artifacts/batch5-tests/queen-capture.png) is an earlier diagnostic; the maintained screenshot baseline in `e2e/batch5.spec.js-snapshots/` validates the current defender rendering.

The artwork loads on demand. Actual iOS/Android frame rate, decoding, memory, safe areas, touch interaction and child usability are unmeasured. No sound pack ships. Automated checks and emulated footage do not establish those properties.

## Checks on the recovery branch

- The complete Vitest suite passed: 308 tests in 16 files. This run preceded the final contact-height-only change; afterward all 34 Batch 5 presenter tests, typecheck, lint and the production build passed. Vite emitted its existing large-bundle warning.
- Final Chromium run: nine focused cases passed, covering all three Batch 5 captures with rotation, Undo and Skip; the illustrated Librarian defender; Skip and abort while artwork is held; required artwork failure with the optional defender held; Fireworm's moved-rook capture; and Fireworm's cold startup. The new defender crop baseline was then generated, inspected and passed in a separate run without updating it.
- Final emulated 360 × 800 portrait and 800 × 360 landscape Valhallarama capture, rotation, Undo and Skip cases passed. Her two final-build recordings also completed and were inspected. Earlier in the same recovery session, Hookfang, Flamehuffer and Common or Garden capture, rotation, Undo and Skip cases passed before the broader browser run was intentionally stopped in favor of focused coverage. During the prior session, all three Batch 5 phone capture cases passed in both orientations before the final Valhallarama-only staging adjustment.
- Earlier browser attempts had startup timeouts under concurrent load, and a WebGL comparison once produced a blank frame. These were not counted as passes; the subsequent serial checks above passed. The screenshot test rejects blank frames before comparing the cropped defender region.
