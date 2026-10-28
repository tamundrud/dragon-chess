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

## Current implementation

`AttackScene` is registered with `AttackDirector`; it delegates Fireworm captures to `FirewormPresenter` and the four approved knight identities to `KnightPresenter`. The older procedural Fire Dragon remains as a technical presenter but is no longer assigned to starting knights. Other attack IDs use generic temporary graphics. Registry descriptions for axe smash, decisive arc, and shield bash are configuration intent, not separate implemented presenters. Audio calls use HTML Audio after user unlock, with missing-file/rejection tolerance; no sound files are shipped.

Leaving a game cancels its pending capture and presentation; it does not complete the move. Undo/Restart are disabled during attacks. Resizing updates labels and Skip in canvas coordinates and uniformly fits a shared 800 × 600 artwork space to the canvas. All presenters keep their existing timeline coordinates inside that space, including effects created after rotation; resize does not restart or complete the capture. See [the acceptance requirements](TEST_PLAN.md).

## Implemented Attack Presenters
### Fire Dragon Vertical Slice (`FireDragonPresenter`)
Implements the 11-beat storybook capture animation for `fire_stream_attack`:
1. **Brace & Crouch** (`preparing` phase): Dragon body and wings lower with anticipation.
2. **Inhale** (`preparing` phase): Head tilts back and jaw opens wide.
3. **Increasing Glow** (`preparing` phase): Internal throat/chest glow pulses orange and yellow.
4. **Smoke & Embers** (`preparing` phase): Small dark smoke circles and golden embers drift from jaws.
5. **Head Recoil** (`attacking` phase): Snaps back sharply before thrusting forward as wings spread.
6. **Flame Travel** (`attacking` phase): Layered orange cone and bright yellow core beam travel across stage to target.
7. **Embers & Smoke Trailing** (`attacking` phase): Travelling particle effects follow the flame stream with an optional low-rumble sound request (no sound pack shipped).
8. **Defender Silhouette** (`impact` phase): Normal defender graphics swap for a backlit silhouette against an expanding orange impact flash.
9. **Soot & Sparks Reaction** (`impact` phase): Comic soot cloud and golden spark burst envelope the wobbling/shrinking defender.
10. **Satisfied Recovery** (`recovering` phase): Glow fades, posture returns to upright, followed by a proud nod and playful nostril smoke ring.
11. **Clean Return** (`completing` phase): All temporary graphics, tweens, timers, and camera shakes clean up, restoring board input.

## Fireworm illustrated prototype

`fireworm_fireworks` routes through `AttackScene` to a separate `FirewormPresenter`; the procedural `FireDragonPresenter` remains for comparison. Fireworm is the starting a1 Hooligan rook. Hookfang is the h1 rook and retains generic temporary presentation. Other roster artwork is not rolled out.

`ChessGameController` owns a per-game `PieceIdentity` metadata map, seeded on reset and updated only from successful chess.js commits, including captures, en passant, castling and promotion. Undo restores the corresponding metadata snapshot. The manager passes attacker/defender IDs to the director before the capture commits; an aborted presentation never updates identities. This metadata does not determine chess legality. Arbitrary FEN positions have no historical named-piece identity; they are deterministically seeded by compatible home-square/class defaults.

The shared 800×600 stage supports Normal (3350ms candidate), Fast (0.35×), Instant/disabled (no presentation), and reduced motion (two poses, low-motion fade, static subdued sparks, 1000ms before speed scaling). There is one impact, no camera movement or strobe, and no required audio. Fireworm choreography is now owner-approved; see the [benchmark and acceptance scope](FIREWORM_BENCHMARK.md).

The `/?preview=fireworm` proof uses the same presenter, real BoardScene and a separate ChessGameController with legal starting-position fixtures. Replay resets that fixture; completion/Skip commits its prepared capture once. It never changes the active game. Select Flamehuffer (rook) or the temporary raider (pawn), board/arena, speed and reduced motion; changes apply on Replay. The normal game still requires legal captures.

See [the verification and owner-acceptance record](reviews/fireworm-animation-proof.md).

## Foreground refinement (owner feedback on PR #13)

Fireworm defaults to enlarged foreground combatants over the actual board, dimmed at 28% opacity. Settings retain the painted arena for comparison; each capture snapshots that choice. Complete connected ready/breath/proud illustrations replace independently transformed anatomical cutouts. The full character moves together. One mouth-anchored breath renders in front of both actors, tracks mouth and defender recoil, expands into engulfment, then clears to reveal soot, a slump and static dazed stars before the final fade. Rear/foreground layers carry fireworks and smoke, without a separate impact flame. Reduced motion retains subdued fades/static sparks without emergence travel.

The director carries the captured piece's actual class/colour alongside persistent identity. The a8 black rook is Flamehuffer; h8 is the distinct Common or Garden Dragon. Only Flamehuffer receives new defender art in this slice. Other unsupported targets use an explicit class/faction placeholder rather than pawn artwork. From a new game, `a2-a4 a7-a5 a1-a3 a8-a6 a3-b3 a6-b6 b3xb6` demonstrates a legal moved-rook capture and preserves identities through Undo.

See [the refinement evidence and historical owner feedback](reviews/fireworm-foreground-refinement.md). The earlier prototype record above remains historical.

The [PR #14 impact follow-up](reviews/fireworm-facing-impact.md) derives illustration flips from native heading and staged attack direction, preserving readable symmetrical class placeholders. Pawn extraction excludes a neighbouring flame tip in the atlas; PNG sources remain unchanged. [PR #16 continuity refinement](reviews/fireworm-continuity.md) supersedes the separate impact flames. [Owner approval](FIREWORM_BENCHMARK.md) resolves Fireworm’s prior visual objections; it does not approve all cast artwork or devices.

## Four knight scenes

Windwalker swoops, One Eye pounces, Driller-Dragon charges with its horn, and Poisonous Piffleworm blows a bubble. Shared staging, timing and cleanup preserve board/arena, resize, Skip and reduced-motion behavior. All four knight animations have owner visual approval (confirmed 2026-10-27); see the batch verification record.
