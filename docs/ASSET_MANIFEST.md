# Asset Manifest

## Directory structure
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

## Implemented Assets & Identifiers
### Fire Dragon Vertical Slice
- **Character Art**: Implemented via layered procedural Phaser graphics (`FireDragonPresenter`) with storybook styling (wings, body, glowing belly, horned head, jaw with teeth).
- **Defender Art**: Standard faction badge with backlit silhouette reaction mode (`defSilhouette`).
- **Visual Effects**:
  - `flame_stream`: Layered orange cone and yellow core beam.
  - `ember_particles`: Gold and orange floating squares.
  - `soot_cloud`: Fluffy overlapping grey circles.
- **Audio Cues** (managed via `AudioController` with missing file tolerance):
  - `dragon_inhale`: Anticipation breathing sound.
  - `fire_ignite`: Initial flame ignition.
  - `fire_stream`: Directed flame travel roar.
  - `fire_impact`: Collision blast sound.
  - `dragon_rumble`: Low-frequency rumble during flame travel.
