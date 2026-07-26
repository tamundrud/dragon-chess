# Test Plan

## Automated unit coverage (Vitest)

The unit suite covers representative legal and illegal moves, special moves and status evaluation through `ChessGameController`; settings and registry scaffolding; attack phase progression, locking, skip completion, abort cancellation, duplicate prevention and presenter cleanup; and Fire Dragon presenter behavior.

This demonstrates tested behavior for the included cases. It does not constitute an independent exhaustive proof of every chess position; `chess.js` remains the rules authority.

## Automated browser smoke coverage (Playwright)

Chromium runs at an emulated 390 × 844 viewport. Tests cover:

1. Start screen rendering.
2. Starting a game.
3. A legal quiet move through canvas taps.
4. A capture entering attack presentation.
5. Skip committing the capture and advancing the turn.
6. Navigation during attack aborting the move and leaving a fresh game unlocked.
7. Restart after a skipped capture.
8. No document-level horizontal overflow.

These are functional smoke tests, not screenshot/art approval or physical-device verification.

## Manual phone checklist

On at least one physical phone, in both portrait and landscape where possible:

1. Run `npm ci && npm run dev`, then open the displayed LAN URL.
2. Confirm the menu and all controls fit without sideways scrolling.
3. Start a game and tap `e2`, then `e4`; confirm Black is next.
4. Play `d7-d5`, then `e4xd5`; confirm the presentation is readable and Skip commits the capture.
5. Repeat the capture, press Menu before completion, start a new game, and confirm `e2-e4` works.
6. Skip a capture, press Restart, and confirm the initial position and White turn return.
7. Rotate during the board and during an attack; confirm controls remain usable and temporary effects disappear afterward.
8. Check touch targets, status text readability, reduced-motion mode, mute/volume controls, and browser console errors.

Record device model, OS/browser versions, orientation, viewport, date, and observed issues. No physical-device result is currently committed.

## Completion commands

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npx playwright test
```

The development server or production preview should also be opened for a basic manual verification. CI performs the complete automated list on Node.js 22 and Chromium.
