# Asset Manifest

## Planned asset directory structure

This is the intended production layout, not a directory tree shipped by the current build. The Fireworm prototype ships original generated PNG artwork under `public/art/fireworm/`; the four provisional knight pose sheets and Hooligan defender ship under `public/art/knights/`; Bishop and Batch 4 pose packs are also shipped as documented below; remaining art is procedural or temporary. Audio files are not shipped.
```text
public/assets/
  board/
  characters/
    stoick/
    valhallarama/
    dragons/
      fire_dragon/
    vikings/
    rivals/
  effects/
    fire/
    smoke/
    impacts/
    motion/
  audio/
    attacks/
    impacts/
    ambience/
    ui/
```

## Rules
- Prefer transparent PNG, WebP, or sprite sheets for characters.
- Use SVG for UI or simple effects.
- Mark every temporary asset.
- Tolerate missing optional audio.

## Procedural visuals and sound hook identifiers
### Fire Dragon Vertical Slice
- **Character Art**: Implemented via layered procedural Phaser graphics (`FireDragonPresenter`) with storybook styling (wings, body, glowing belly, horned head, jaw with teeth).
- **Defender Art**: Standard faction badge with backlit silhouette reaction mode (`defSilhouette`).
- **Visual Effects**:
  - `flame_stream`: Layered orange cone and yellow core beam.
  - `ember_particles`: Gold and orange floating squares.
  - `soot_cloud`: Fluffy overlapping grey circles.
- **Sound requests** (played through HTML Audio by `AudioController` when optional files are available):
  - `dragon_inhale`: Anticipation breathing sound.
  - `fire_ignite`: Initial flame ignition.
  - `fire_stream`: Directed flame travel roar.
  - `fire_impact`: Collision blast sound.
  - `dragon_rumble`: Low-frequency rumble during flame travel.

## Fireworm capture prototype (2026-10-26)

- `public/art/fireworm/rig.png`: original generated transparent cutout atlas; retained original rig source, painted flame and temporary raider defender. The refinement uses complete character poses instead of its independent anatomical cutouts.
- `public/art/fireworm/cove.png`: original generated painted coastal stage.
- [Production method, creative prompts and limitations](../public/art/fireworm/PROVENANCE.md). Fireworm prototype choreography is [owner-approved](FIREWORM_BENCHMARK.md); this does not approve every portrait or full-game release.
- `firewormAssets.ts` preloads images and defines measured texture-frame bounds. `FirewormPresenter` owns its timers/tweens/objects; effects use modest coloured spark trajectories with trails and translucent smoke. No Fireworm sound cue or audio file ships.

### Foreground refinement additions

- `public/art/fireworm/ready.png`, `breath.png`, `proud.png`: original complete transparent Fireworm poses (1254×1254); all character parts share one actor transform.
- `public/art/fireworm/flamehuffer.png`: original transparent non-pawn defender (1254×1254), selected only for the black Flamehuffer rook identity.
- The cove remains the comparison arena. The default board presentation draws no painted background. Other defenders remain temporary; full-roster artwork is out of scope.
- The prototype PNG pack is now approximately 13MB on disk; loading readiness is tested, physical-phone memory/frame-rate acceptance remains open. See [refinement verification](reviews/fireworm-foreground-refinement.md) and the provenance document above.

The [facing/impact follow-up](reviews/fireworm-facing-impact.md) changes no source PNGs. `frameFireworm` extracts a clean pawn texture around a neighbouring flame-tip fragment in the atlas; the presenter flips that right-facing pawn toward its attacker while retaining Flamehuffer's native left-facing artwork.

## Bishop candidate artwork

Original connected Bishop poses and Hiccup’s glider are encoded as WebP under `public/art/bishops/`. The active Bishop's images load on demand instead of adding to the existing startup download. See [provenance and inspection](../public/art/bishops/PROVENANCE.md). The owner approved all four Bishop animations on 2026-10-28, including Killer’s revised fire-breathing attack. Physical-device performance remains unmeasured.

## Batch 4 candidate artwork

Original connected poses for three rook dragons and Stoick are encoded as on-demand WebP under `public/art/batch4/`. The artwork provenance and inspection are recorded in [the batch provenance](../public/art/batch4/PROVENANCE.md). Animation approval and physical-device performance remain open; see [Batch 4 verification](reviews/batch4-scenes.md).
