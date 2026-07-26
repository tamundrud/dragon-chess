# Game Rules

## Standard chess
Use unmodified standard chess rules:
- Normal piece movement.
- Legal captures.
- Check and checkmate.
- Stalemate and supported draw conditions.
- Castling.
- En passant.
- Pawn promotion.
- Turn order.
- Illegal-move rejection.

## Authoritative engine
Use `chess.js` as the only authority for:
- Board position.
- Turn.
- Legal move generation.
- Move validation.
- Captures.
- Check and checkmate.
- Stalemate and draw status.
- Castling.
- En passant.
- Promotion.
- Move history.

Do not duplicate these rules in React, Phaser, or custom helpers.

## Presentation invariant
Attack animations are presentation only. The same legal move must produce the same final chess state when:
- Animation is enabled.
- Animation is disabled.
- Animation is skipped immediately.
- Animation is skipped at impact.
- Reduced motion is enabled.
- Audio is unavailable.

## Move lifecycle
Use one explicit move path:
1. User requests a move.
2. `ChessGameController` validates it through `chess.js`.
3. The controller identifies captures and promotion.
4. The final move is prepared.
5. If animation is enabled, the attack system presents the capture.
6. The authoritative final state is committed or revealed exactly once.
7. Board rendering synchronizes.
8. Input unlocks.
9. Game status updates.

The exact timing may differ, but no move may be applied twice.

## Input during attacks
During an attack:
- Board input is locked.
- Controls that could corrupt state are disabled or safely handled.
- Skip remains available.
- Restart or undo either remains disabled or performs full cleanup first.
