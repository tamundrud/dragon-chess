# Batch 5 foreground corrections

The owner rejected the prior videos and approved the [schematic staging](artifacts/batch5-choreography/storyboard.png) on November 4. This revision keeps the attacker in front of the defender, with a grounded approach and sword contact for Valhallarama. Her right-facing contact cutout is a new generated pose. Mogadon leads with his shield; the Librarian's crossed blades are tilted into the foreground contact. Reduced-motion impact now uses the relevant contact pose.

## Rendered evidence

Each recording uses the production presenter, a legal game capture, a stepped clock at 15 fps and emulated Chromium phone viewports. They are not physical-device performance measurements. Original rejected recordings are retained under their original filenames.

| Attack | 360 × 800 portrait | 800 × 360 landscape | Consecutive portrait contact frames |
| --- | --- | --- | --- |
| Mogadon | [Video](artifacts/batch5-videos/phone-360-portrait-mogadon-corrected.mp4) | [Video](artifacts/batch5-videos/phone-landscape-mogadon-corrected.mp4) | [Frames](artifacts/batch5-choreography/mogadon-contact-frames.png) |
| Valhallarama | [Video](artifacts/batch5-videos/phone-360-portrait-valhallarama-corrected.mp4) | [Video](artifacts/batch5-videos/phone-landscape-valhallarama-corrected.mp4) | [Frames](artifacts/batch5-choreography/valhallarama-contact-frames.png) |
| Hairy Scary Librarian | [Video](artifacts/batch5-videos/phone-360-portrait-hairy_scary_librarian-corrected.mp4) | [Video](artifacts/batch5-videos/phone-landscape-hairy_scary_librarian-corrected.mp4) | [Frames](artifacts/batch5-choreography/hairy_scary_librarian-contact-frames.png) |

The frame sheets show 12 successive frames from 1.40 to 2.13 seconds of the recorded files. Visual inspection found the shield overlapping the Hooligan for Mogadon, the two crossed blades over its shield for the Librarian, and Valhallarama's blade at its head. Additional legal portrait captures show Valhallarama against [illustrated Flamehuffer](artifacts/batch5-choreography/valhallarama-flamehuffer-contact.png) and the [Common or Garden fallback](artifacts/batch5-choreography/valhallarama-fallback-contact.png); these are representative frames, not proof for every possible defender. Owner visual acceptance of the final production motion remains open.

## Review and screenshot diagnosis

The [CE review](artifacts/batch5-foreground-ce/review.json) examined the earlier correction candidate and returned Ready with fixes. Five local lenses and a separate validator confirmed three findings: the fixed Valhallarama strike missed the fallback defender, one Librarian blade missed, and reduced motion omitted the contact poses. No different-provider reviewer was available. The follow-up adjusts contact height for the fallback, tilts the Librarian's crossed pose, and uses contact poses in reduced motion. The frame evidence above and presenter tests exercise those changes; the receipt predates those follow-up edits.

The defender screenshot test's old crop failed locally after restaging, cutting off the defender. The revised crop shows the full figure, and retains screenshot comparisons during preparation and attack, the nonblank size assertion, and the attacking-state assertion. The earlier PR CI Playwright failure has not been attributed: the job's detailed logs were inaccessible from the cloud network and its artifact was approximately 19 GB. Local repeats alone cannot establish that the earlier CI instability is fixed. No screenshot threshold was relaxed.

## Local checks

- Vitest: 314 tests passed; typecheck and lint passed. The production build passed with Vite's existing large-bundle warning.
- Nine Chromium capture/rotation/Undo/Skip cases passed serially across desktop, 360 × 800 portrait, and 800 × 360 landscape. Six corrected phone recordings completed; Mogadon's files precede the final changes confined to Valhallarama and the Librarian.
- The revised illustrated-defender snapshot case passed twice without updating either baseline after their generation. Those runs used system Chromium on Debian, not CI's bundled browser on Ubuntu.
- Three cold-load Skip, failure and abort cases and the Fireworm replay/Skip/Fast/Instant/reduced-motion case passed on desktop Chromium.
