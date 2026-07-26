# Attack System

## Purpose
The attack system presents a short character-specific scene for captures. It is not a chess-rules engine.

## Required behaviour
Every animated capture must:
- Begin from a legal move.
- Lock board input.
- Present a readable attack.
- Reach one defined impact moment.
- Apply or reveal the final board state exactly once.
- Clean temporary objects.
- Restore camera and interface.
- Unlock input.
- Support skip, disabled animation, reduced motion, speed modes, and absent audio.

## Lifecycle
Use one explicit lifecycle:
`idle -> preparing -> attacking -> impact -> recovering -> completing -> idle`

Only one attack may run at a time.

## Implemented Attack Presenters
### Fire Dragon Vertical Slice (`FireDragonPresenter`)
Implements the 11-beat storybook capture animation for `fire_stream_attack`:
1. **Brace & Crouch** (`preparing` phase): Dragon body and wings lower with anticipation.
2. **Inhale** (`preparing` phase): Head tilts back and jaw opens wide.
3. **Increasing Glow** (`preparing` phase): Internal throat/chest glow pulses orange and yellow.
4. **Smoke & Embers** (`preparing` phase): Small dark smoke circles and golden embers drift from jaws.
5. **Head Recoil** (`attacking` phase): Snaps back sharply before thrusting forward as wings spread.
6. **Flame Travel** (`attacking` phase): Layered orange cone and bright yellow core beam travel across stage to target.
7. **Embers & Smoke Trailing** (`attacking` phase): Travelling particle effects follow the flame stream with optional low rumble audio.
8. **Defender Silhouette** (`impact` phase): Normal defender graphics swap for a backlit silhouette against an expanding orange impact flash.
9. **Soot & Sparks Reaction** (`impact` phase): Comic soot cloud and golden spark burst envelope the wobbling/shrinking defender.
10. **Satisfied Recovery** (`recovering` phase): Glow fades, posture returns to upright, followed by a proud nod and playful nostril smoke ring.
11. **Clean Return** (`completing` phase): All temporary graphics, tweens, timers, and camera shakes clean up, restoring board input.
