# Batch 4 artwork gate — owner review

Status: **owner approved the artwork studies on 2026-10-29.** The notes below record the pre-implementation review; that approval does not establish acceptance of animation or device performance.

## Evidence

- [Responsive review sheet](artifacts/batch4-artwork/review.html) shows every cutout over light and dark backgrounds and compares Flamehuffer with the existing defender. It is a static local HTML review aid, not a game render.
- [Desktop](artifacts/batch4-artwork/desktop.png), [360 × 800 portrait](artifacts/batch4-artwork/phone-portrait.png), and [800 × 360 landscape](artifacts/batch4-artwork/phone-landscape.png) are full-page Chromium screenshots of that sheet. The named dimensions are viewport sizes; the screenshots extend vertically. The phone views are emulated, not physical-device tests.
- Full-size Stoick cutouts: [charge](artifacts/batch4-artwork/stoick-charge.png), [slip](artifacts/batch4-artwork/stoick-slip.png), [tumble](artifacts/batch4-artwork/stoick-tumble.png), [confused landing](artifacts/batch4-artwork/stoick-confused.png), [celebration](artifacts/batch4-artwork/stoick-proud.png). Two non-transparent contact concepts: [initial](artifacts/batch4-artwork/stoick-contact-study.png) and [revised](artifacts/batch4-artwork/stoick-contact-revised.png). [Flamehuffer action](artifacts/batch4-artwork/flamehuffer-action.png) is transparent.

## Inspection and concerns

The complete cutouts were inspected individually, on light and dark backgrounds in Chromium at desktop and emulated phone sizes. No obvious coloured halo appeared in those rendered views. Each Stoick silhouette and axe has at least 119 pixels of canvas margin at alpha >= 128. Flamehuffer has 14 pixels at the narrowest edge; no opaque silhouette touches the canvas edge at that threshold. These are technical checks, not proof that all edge pixels are perfect under every background or scaling algorithm.

Stoick's costume, hair, general proportions and axe are recognizably consistent across poses; the axe stays connected to his hand, and the landing expression is distinct from his celebration. The poses are individually generated and differ in anatomy and exact axe position: they are not registered animation frames. No continuous spin or transition between poses has been demonstrated. The first contact study's star obscures part of the contact point; the revised study removes it, but axe and shield overlap, leaving the exact touch point ambiguous at phone scale. Neither study establishes a reeling defender or comic timing. These are open concerns for the owner and for later motion proof.

The Flamehuffer revision preserves the defender's blue-grey colouring, turquoise wing membranes and scarf, gold collar and broad muzzle. The action pose opens the mouth and changes the stance, proportions and apparent teeth; it is a related interpretation rather than a pixel-matched pose. Its mouth is readable in the sample but no jet, mouth anchor, foreground layering or engulfment is shown. Phone screenshots show static images at illustrative scales, not actual in-game composition.

## Provenance and verification

The candidate images were generated with OpenAI image generation using the previous original Stoick study and the project's existing Flamehuffer defender as references. The contact pictures are studies with backgrounds, not cutout assets. Original generated sources are retained in `/workspace/generated_images/`; copies here preserve the unmodified outputs. The review page and screenshots are new evidence only.

Local review covered silhouettes, visual consistency, transparency on contrasting backgrounds, and responsive screenshots. The gallery loaded all 16 images at each viewport. No application tests or animation recordings were run because this pass contains no application changes. This local art review is not an independent CE code review, owner acceptance, physical iOS/Android testing, or proof of frame rate and memory use.
