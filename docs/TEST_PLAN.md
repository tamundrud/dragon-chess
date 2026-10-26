# Test Plan

Current recovery review: [post-PR #11 reassessment](reviews/recovery-post-pr11-reassessment.md). Execute [the manual acceptance checklist](reviews/recovery-manual-acceptance.md) to record actual device/product results; all its manual gates are currently NOT RUN.

## Required chess acceptance coverage

The following is a target checklist, not a claim that every item has a strong automated assertion. Current tests are in `src/tests/chess_rules.test.ts`; they exercise representative pieces, kingside castling, en passant, quiet queen promotion, capturing knight promotion, check/mate/stalemate, insufficient material, Undo, and Restart. Test names do not establish exhaustive queenside castling, all promotion choices, repetition, or fifty-move coverage.

Required coverage:
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

## Required attack acceptance coverage

Existing unit tests in `src/tests/attack_system.test.ts`, `src/tests/attack_abort.test.ts`, `src/tests/fire_dragon_presenter.test.ts`, and `src/tests/game_manager_lifecycle.test.ts` cover director/presenter lifecycle, cancellation, input unlocking, callback cleanup, and manager resize/destroy behavior using mocks. Browser coverage below exercises real input and production rendering. These layers do not establish every checklist item or visual quality; the capturing-promotion test includes a permissive context assertion, and missing-file tolerance does not prove audible playback.

Required coverage:
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

## Historical Verification Results (Original Vertical Slice)
The original vertical-slice run reported the following results; these counts are historical, not the current recovery acceptance record:
- `npm test -- --run`: **4 passed test suites, 46 passed tests** (100% pass rate).
  - `smoke.test.tsx` (7 tests): Scaffold and component rendering.
  - `chess_rules.test.ts` (15 tests): `chess.js` authoritative engine compliance, illegal move rejection, castling, promotion, checkmate, stalemate, draw conditions.
  - `attack_system.test.ts` (21 tests): Lifecycle state transitions, input locking, skip in all phases, reduced motion, speed multipliers, duplicate attack prevention, and timer/tween cleanup.
  - `fire_dragon_presenter.test.ts` (3 tests): Fire dragon storybook beat execution, skip handling without memory leaks, and sound cue configuration.
- `npm run typecheck`: **0 errors** (`tsc --noEmit`).
- `npm run lint`: **0 errors, 0 warnings** (`eslint .`).
- `npm run build`: **Production build succeeded** in ~14s (`vite build`).


## Committed Browser Coverage (introduced in Recovery Phase 2)

Use Node 24.x/npm 11.x and `npm ci --include=dev`. Install Playwright Chromium and OS dependencies once with `npm run test:e2e:install`, build with `npm run build`, then run `npm run test:e2e`. No Cloud helper is required. On Linux the dependency installer may require administrator access; browser distribution hosts must be reachable. The committed configuration serves production `dist` through Vite preview on port 4173 with strict port ownership. It never starts the development server or silently reuses an existing listener.

| Project | Viewport | Input / engine |
| --- | --- | --- |
| chromium | 1366 x 768 | Mouse / Chromium |
| phone-360-portrait | 360 x 800 | Touch / Chromium |
| phone-390-portrait | 390 x 844 | Touch / Chromium, iPhone emulation |
| phone-landscape | 800 x 360 | Touch / Chromium |
| tablet | 768 x 1024 | Touch / Chromium |

Every project runs the Phase 1 capture-start, repeated capture/menu/new-game, deliberate Skip/Undo/recapture, and Fire Dragon cancellation scenarios. Additional cases check document/body widths, reachable settings and controls, illegal move rejection, Undo/Restart state restoration, instant/reduced-motion settings, and return to a playable new game. Touch projects also verify trusted canvas touch events, legal moves across both viewport orientations with one canvas, and touch Skip after resizing an active capture. The two touch-specific cases intentionally skip desktop.

Screenshots are evidence for visual review, not golden-image pass/fail assertions. Named menu, board, settings, active capture, resized capture, and rotated board attachments accompany the HTML report. Every test records a trace and checks uncaught page errors. CI uploads `playwright-report/` and `test-results/` even on success, retaining them for 14 days. Optional managed runs use `/workspace/dragon-chess-playwright.config.mjs` with `/usr/bin/chromium`. That wrapper is an environment convenience, not a fresh-checkout requirement. See the current verification record for exact commands and counts.

## Remaining Manual UX Acceptance

Automation and agent screenshot inspection do not close these gates:

- Play on physical iOS Safari and Android Chrome, including browser bar expansion/collapse, safe areas/notches, rotation, and high-density screens.
- Check thumb tap comfort, selection/deselection feedback, and vertical scrolling around the canvas on short landscape screens. The layout retains a 300px canvas minimum and allows vertical page scrolling.
- Have the intended child user complete moves, Undo, Restart, settings, promotion selection/cancellation, capture Skip, and return to menu without assistance.
- Judge normal/Fast/Instant/reduced-motion capture readability and comfort, especially Fire Dragon composition during rotation, plus audio unlock/mute behavior on hardware.
- Assess long check/checkmate status messages and promotion overlays on phones using real games. Chess-rule correctness remains covered by the unit suite; these are visual/interaction acceptance checks.

Current integrated results, review coverage, risks and manual acceptance requirements live in [final recovery qualification](reviews/final-recovery-qualification.md). [The Phase 3 record](reviews/recovery-phase3.md) and [Phase 2 record](reviews/recovery-phase2.md) preserve earlier recovery evidence.

No new gameplay coverage is claimed in Phase 3. Remaining automated acceptance gaps include exhaustive special-rule cases, stronger capturing-promotion assertions, phone promotion/status flows, and quantitative mobile frame-rate/memory measurements. These require separate scoped follow-up. No sound pack is shipped; hardware audio acceptance requires real assets. Rotation during an active capture fits both presenters and late effects through a shared logical artwork space. The resize regression checks rendered combatant pixels after rotation and back, along with natural completion, Skip, Undo, and recapture. It does not establish every effect boundary or animation aesthetics.

Phase 3 verification additionally reproduced an intermittent `wordWrapWidth < a single character` page error during the phone-390 capture-resize case on both the task and unchanged recovery base. The page-error fixture correctly fails on it. See the Phase 3 record for exact historical counts; no assertion was weakened there. The follow-up [active-capture resize record](reviews/active-capture-resize.md) documents the fix and current regression evidence.

Current artwork rotation results and remaining acceptance limits: [board rotation verification](reviews/board-rotation-artwork.md).

The [render-clock investigation](reviews/recovery-render-clock.md) diagnoses the intermittent tablet and CI render-readiness failures from recovery PR #10. Clocked browser cases pause before application startup and explicitly drive readiness/input; pixel thresholds, error guards and capture-state assertions remain intact. CI rejects flaky classifications even when retries eventually pass. Historical failures remain in their original verification records.

## Fireworm prototype coverage

See [the Fireworm verification record](reviews/fireworm-animation-proof.md) for current command results, CE findings/fixes, source artwork, recordings and screenshots. New coverage exercises named-rook identity and defender restoration, presentation-owned cleanup, cold-art readiness/cancellation, legal moved-rook captures and portrait/landscape rotation across phases. Those technical checks do not establish owner visual acceptance, physical-device smoothness or completed roster artwork.

### Fireworm foreground refinement

`e2e/fireworm_refinement.spec.js` checks decoded source silhouette connectivity, rendered live-board dimming versus the arena, actual moved Flamehuffer identity/class, touch Skip/Undo/recapture/abort, and presentation-setting persistence/reset. Existing Fireworm cases retain rotation, completion, keyboard Skip, speed/reduced-motion, disabled animation and cold-load cancellation coverage. Source alpha connectivity and sampled board pixels are quantitative technical checks; they cannot establish expressive motion or owner visual acceptance.

[Fresh refinement recordings, matrix results and CE review](reviews/fireworm-foreground-refinement.md) supplement the original prototype evidence. The owner must still inspect whole Normal/Fast sequences, transitions, fire scale and repeated-play comfort on physical portrait/landscape phones. Full-roster artwork and mobile performance benchmarks are not complete.

`e2e/fireworm_impact.spec.js` checks Normal/Fast board/arena sequences for both pawn and Flamehuffer. It samples painted fire over the opaque interior chest at peak impact, then checks dissipation during the defeated-character hold. Unit coverage checks each illustration's native heading against attackers on either side and protects the visible defeat hold before fading. [Current technical results and remaining owner acceptance](reviews/fireworm-facing-impact.md) are separate from visual approval.
