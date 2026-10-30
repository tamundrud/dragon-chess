# Batch 4 scenes — verification and review

Hookfang launches an explosive fire blast, Flamehuffer a narrow jet, Common or Garden Dragon a wavering comic plume, and Stoick charges, slips, spins with his axe, accidentally contacts the defender, lands confused and celebrates. These are candidate animations pending owner visual acceptance. The owner approved the preceding Stoick and Flamehuffer artwork studies on 2026-10-29; that approval does not cover motion or physical-device performance. See [artwork review](batch4-artwork-gate.md) and [provenance](../../public/art/batch4/PROVENANCE.md).

## Review

The [CE review receipt](artifacts/batch4-ce-review/review.json), [metadata](artifacts/batch4-ce-review/metadata.json), and [validator verdicts](artifacts/batch4-ce-review/validator-verdicts.json) describe the pre-fix work. Seven local review lenses and a separate local validator returned “Ready with fixes.” A different-provider reviewer was unavailable. The report notes that reviewer prompts referred to local rubric files rather than embedding them, and that untracked recordings were excluded. Three confirmed findings were addressed: illustrated Fireworm defender handling; destination-aware return and cancellation tests; and required-artwork failure while a Bishop defender load is pending.

## Verification and limitations

- After the review fixes: 270 unit tests, TypeScript, lint and production build passed. Vite retains its existing large-bundle warning.
- Before the narrow Fireworm defender fix, 12 production-preview Playwright capture cases passed across desktop, 360 × 800 portrait, and 800 × 360 landscape, covering all four characters, rotation, Undo and Skip. Cold-load Skip, cancellation followed by a legal move, and concurrent attacker/defender loading passed on desktop. After the Fireworm defender fix, four follow-up browser cases passed on desktop and 360 × 800 portrait: failed required artwork while a Bishop defender request was pending, and a legal Flamehuffer capture of Fireworm. The captured Fireworm views were visually inspected; [portrait evidence](artifacts/batch4-artwork/flamehuffer-fireworm-capture.png).
- All eight final-build recording cases passed. Each recording is a legal capture in Chromium, clock-stepped at 15 frames per second. The videos capture the game canvas within the named emulated viewport; they do not measure physical frame rate. They are not owner visual approval.
- The eleven Batch 4 WebP images total about 3.3 MB and load on demand. Download, image decoding, memory, battery and frame-rate costs on real devices are not measured. iOS Safari, Android Chrome, safe areas and browser bars, real touch usability and child testing remain open. No sound pack ships.

## Recordings

| Character | 360 × 800 portrait viewport | 800 × 360 landscape viewport |
| --- | --- | --- |
| Hookfang | [Portrait](artifacts/batch4-videos/phone-360-portrait-hookfang.mp4) | [Landscape](artifacts/batch4-videos/phone-landscape-hookfang.mp4) |
| Flamehuffer | [Portrait](artifacts/batch4-videos/phone-360-portrait-flamehuffer.mp4) | [Landscape](artifacts/batch4-videos/phone-landscape-flamehuffer.mp4) |
| Common or Garden Dragon | [Portrait](artifacts/batch4-videos/phone-360-portrait-common_or_garden.mp4) | [Landscape](artifacts/batch4-videos/phone-landscape-common_or_garden.mp4) |
| Stoick | [Portrait](artifacts/batch4-videos/phone-360-portrait-stoick.mp4) | [Landscape](artifacts/batch4-videos/phone-landscape-stoick.mp4) |

The axe is visible at contact in the inspected emulated frames, but the speed of the spin, pose transitions and contact readability on a physical phone remain for owner judgment. In landscape, the character labels overlap portions of the artwork and merit physical-phone review. The dragon fire origins and foreground layering were inspected in the recordings; continuity and engulfment require the same owner review.
