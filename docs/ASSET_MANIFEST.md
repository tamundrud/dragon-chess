# Asset Manifest

## Planned asset directory structure

This is the intended production layout, not a directory tree shipped by the current build. Current art is procedural; audio files are not shipped.
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
