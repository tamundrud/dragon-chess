# Fireworm proof artwork provenance

Created for this repository on 2026-10-26 using OpenAI's `image_gen.imagegen` tool. These are newly generated illustrations, not scanned, traced, downloaded or licensed character artwork. The tool did not expose a model/version identifier. Names and chess casting follow the approved roster; the independent depiction is an unaccepted prototype and is not official franchise artwork.

| Shipped image | Production method | Runtime use |
| --- | --- | --- |
| `rig.png` | Original generated cutout atlas, followed by one image-tool edit requesting transparent background removal and separated parts. Transparent alpha was verified in the saved PNG. | Body, closed/open head-and-neck poses, wing, comic raider placeholder, painted flame. `firewormAssets.ts` records measured frame bounds because equal-cell spacing was not honoured. No CPU image processing or borrowed sprites. |
| `cove.png` | Original image-tool generation without reference images. | Painterly coastal Viking sunset stage, uniformly fitted to the shared 800×600 logical space. |

No sound is shipped or requested by this presenter. Existing optional sound handling for other attacks remains separate.

## Creative instructions

The initial atlas prompt requested six cutouts in a 3×2 layout: orange-red dragon body with planted claws, curled tail and leather harness; separate elongated closed and open-mouthed neck/head poses with angular jaw, expressive amber eye and ivory thorn horns; burnt-orange/burgundy wing; surprised male Viking with teal wool, iron cap, orange beard and round shield; curling orange/gold flame ribbon. Direction: original painterly children's fantasy with dimensional shading, brush texture and ink contours, independent of existing film/book character art. No labels, borders, gore, reference artwork or copied composition.

The edit used only the newly generated atlas as input. It requested removal of the brown background, actual transparent alpha, 30px padding and six separate equal 512px cells. It preserved the painted art but did not deliver equal cells. Runtime frames were measured and inspected in Phaser; the original generated PNG is preserved unchanged as `rig.png`. The flame frame uses its clean central/right portion to exclude adjacent defender pixels.

The environment prompt requested an original 4:3 coastal cove at sunset: teal sea, indigo sea stacks, distant timber longhouse and carved boat prow on the left, gold/peach clouds, purple mountains, grassy rocky foreground terrace, quiet open centre for actors/effects, hand painted storybook colour and depth. No characters, dragons, text or source artwork.

## Acceptance and limits

These assets are prototype art, not owner-approved final designs. The wing/body/head seams, pose consistency, painterly quality, originality of the depiction and book-character interpretation need owner review on a physical phone. The raider is a common temporary defender, not a full set of approved named-piece portraits. Other board tokens/characters retain placeholders. A transparent cutout rig is not a frame-by-frame animation sheet; expressive motion comes from the independently animated parts, two head poses and staged effects.
