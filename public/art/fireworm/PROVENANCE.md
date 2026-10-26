# Fireworm proof artwork provenance

Created for this repository on 2026-10-26 using OpenAI's `image_gen.imagegen` tool. These are newly generated illustrations, not scanned, traced, downloaded or licensed character artwork. The tool did not expose a model/version identifier. Names and chess casting follow the approved roster; the independent depiction is prototype artwork whose Fireworm choreography is now owner-approved (see [benchmark](../../../docs/FIREWORM_BENCHMARK.md)) and is not official franchise artwork.

| Shipped image | Production method | Runtime use |
| --- | --- | --- |
| `rig.png` | Original generated cutout atlas, followed by one image-tool edit requesting transparent background removal and separated parts. Transparent alpha was verified in the saved PNG. | Comic raider placeholder and painted flame. Obsolete anatomical frame registrations were removed during consolidation; the original source atlas is retained. `firewormAssets.ts` records measured frame bounds because equal-cell spacing was not honoured. No CPU image processing or borrowed sprites. |
| `cove.png` | Original image-tool generation without reference images. | Painterly coastal Viking sunset stage, uniformly fitted to the shared 800×600 logical space. |

No sound is shipped or requested by this presenter. Existing optional sound handling for other attacks remains separate.

## Creative instructions

The initial atlas prompt requested six cutouts in a 3×2 layout: orange-red dragon body with planted claws, curled tail and leather harness; separate elongated closed and open-mouthed neck/head poses with angular jaw, expressive amber eye and ivory thorn horns; burnt-orange/burgundy wing; surprised male Viking with teal wool, iron cap, orange beard and round shield; curling orange/gold flame ribbon. Direction: original painterly children's fantasy with dimensional shading, brush texture and ink contours, independent of existing film/book character art. No labels, borders, gore, reference artwork or copied composition.

The edit used only the newly generated atlas as input. It requested removal of the brown background, actual transparent alpha, 30px padding and six separate equal 512px cells. It preserved the painted art but did not deliver equal cells. Runtime frames were measured and inspected in Phaser; the original generated PNG is preserved unchanged as `rig.png`. The flame frame uses its clean central/right portion to exclude adjacent defender pixels.

The environment prompt requested an original 4:3 coastal cove at sunset: teal sea, indigo sea stacks, distant timber longhouse and carved boat prow on the left, gold/peach clouds, purple mountains, grassy rocky foreground terrace, quiet open centre for actors/effects, hand painted storybook colour and depth. No characters, dragons, text or source artwork.

## Acceptance and limits

Fireworm’s refined choreography is owner-approved after physical-phone testing. This is not blanket approval of all portraits or final roster designs. The original separated wing/body/head experiment is superseded by the connected full poses below. The raider is a common temporary defender, not a full set of approved named-piece portraits. Other board tokens/characters retain placeholders. A transparent cutout rig is not a frame-by-frame animation sheet; the refined animation uses connected ready/breath/proud illustrations and staged effects.

## Foreground refinement assets (2026-10-26)

The follow-up adds four original transparent 1254×1254 PNGs generated with OpenAI `image_gen.imagegen`. The original `rig.png` and cove remain intact for comparison; no source illustration, film model or third-party character asset was supplied.

- `ready.png`: uses only our original generated rig as the image-tool reference. The prompt asks for one complete, continuously connected dragon with four planted legs, a curled tail, long neck, leather harness and attached wings, in an expressive anticipation pose. All anatomy is painted together rather than assembled from separately transformed cutouts.
- `breath.png`: an image-tool edit of `ready.png`, preserving the character/design and foot baseline while thrusting the head/neck forward, opening the jaw and glowing throat, and bracing the wings/shoulders. No external flame is baked into the pose.
- `proud.png`: an image-tool edit of `ready.png`, preserving proportions, harness and baseline while settling the wings, lifting the chin and giving a pleased closed-mouth expression.
- `flamehuffer.png`: a new original image-tool generation without reference art. Prompt: a squat left-facing slate-blue/teal dragon, large bellows chest, short attached neck, round nostrils, four sturdy feet, small shoulder fins, curled tail, brass collar and teal cloth. It represents the approved unnamed Meathead Flamehuffer rook casting, not a newly invented named book character. No flames, smoke or backdrop were requested.

The generated images are copied unchanged from tool outputs. Their actual size is 1254×1254 rather than the requested 1280-square size; Phaser uniformly displays each complete pose in the same 410×410 artwork box and uses a shared foot baseline. Transparent alpha and solid-silhouette connectivity are technically checked. Fireworm’s presentation has since been accepted; this does not establish final character-art approval across the roster. Fire effects remain separately animated; no smoke conceals anatomical seams. No new sound is shipped.
