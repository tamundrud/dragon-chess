# Test Plan

## Automated chess tests
Cover:
- Legal and illegal pawn moves.
- Knight, bishop, rook, queen, and king movement.
- Normal capture.
- Illegal move rejection.
- Castling.
- Rejection of castling through check.
- En passant.
- Pawn promotion.
- Capturing promotion.
- Check.
- Checkmate.
- Stalemate.
- Supported draw conditions.
- Undo.
- Restart.

## Attack lifecycle tests
Cover:
- Capture starts one attack.
- Input locks.
- Concurrent attack is rejected.
- Impact occurs once.
- Move applies once.
- Completion cleans temporary state.
- Input unlocks.
- Skip in preparation.
- Skip during strike.
- Skip at impact.
- Skip during recovery.
- Disabled animation.
- Reduced motion.
- Missing audio.
- Restart after completion.
- Undo after completion.
- Capturing checkmate.
- Capturing promotion.
- Resize after attack.
- Resize during attack if supported.

## Manual viewport tests
Validate at least:
- 360 × 800 portrait.
- 390 × 844 portrait.
- Mobile landscape.
- Tablet.
- 1366 × 768 desktop.
- High-density display.

## Completion commands
Before a task is complete, run project equivalents of:
- Development start or preview.
- Unit tests.
- Type checking.
- Linting.
- Production build.
Report exact results.

## Verification Results (Vertical Slice)
All verification commands have been executed and passed with 0 defects:
- `npm test -- --run`: **4 passed test suites, 46 passed tests** (100% pass rate).
  - `smoke.test.tsx` (7 tests): Scaffold and component rendering.
  - `chess_rules.test.ts` (15 tests): `chess.js` authoritative engine compliance, illegal move rejection, castling, promotion, checkmate, stalemate, draw conditions.
  - `attack_system.test.ts` (21 tests): Lifecycle state transitions, input locking, skip in all phases, reduced motion, speed multipliers, duplicate attack prevention, and timer/tween cleanup.
  - `fire_dragon_presenter.test.ts` (3 tests): Fire dragon storybook beat execution, skip handling without memory leaks, and sound cue configuration.
- `npm run typecheck`: **0 errors** (`tsc --noEmit`).
- `npm run lint`: **0 errors, 0 warnings** (`eslint .`).
- `npm run build`: **Production build succeeded** in ~14s (`vite build`).
