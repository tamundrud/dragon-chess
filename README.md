# Dragon Chess — Lifecycle Baseline

Dragon Chess is a child-friendly, local pass-and-play chess prototype. `chess.js` is the sole rules authority; Phaser renders the board and capture presentations, while React owns only the surrounding menus and settings UI.

## Reproducible setup

Node.js 22 LTS and npm are the supported toolchain. The committed `package-lock.json` is authoritative.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. Run all automated checks with:

```bash
npm test
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npx playwright test
```

CI runs these checks (and installs Chromium) for pushes and pull requests.

## Evidence and current scope

### Unit tested

Vitest covers controller move validation and game status, settings/registry scaffolding, attack lifecycle and skip behavior, Fire Dragon presenter cleanup, and the distinction between completing and aborting an attack. These tests exercise selected behavior around `chess.js`; they are not an independent proof of every possible rules position.

### Browser tested

Playwright runs Chromium at a 390 × 844 viewport and checks the start screen, opening a game, tap-based quiet moves, capture presentation, skip/commit, navigation abort/new-game recovery, restart, and horizontal overflow. This is automated browser coverage, not physical-device certification.

### Manual verification

No physical phone or broad browser/device matrix is claimed by this repository. See `docs/TEST_PLAN.md` for suggested manual checks.

## Attack navigation semantics

Capture moves are prepared but are not applied to `chess.js` until presentation completion:

- `AttackDirector.skip()` stops the presentation **and completes it**, invoking the pending callback and committing the prepared move.
- `AttackDirector.abort()` stops presentation/audio and cleans temporary state **without invoking the callback**, so navigation or teardown does not commit the prepared move.

Destroying a game manager aborts any active attack and resets input before Phaser is destroyed. Scene shutdown/destroy handlers unregister presenters and remove input/resize listeners; cleanup is safe to call repeatedly.

## Art and known limitations

- Board tokens and the Fire Dragon battle are temporary procedural Phaser graphics, not final illustrated art.
- Audio files may be absent; playback failures are tolerated.
- Only one character-specific attack is present. Other captures use temporary generic presentation.
- Browser smoke coverage currently targets Chromium at one emulated mobile viewport; physical phones, other browsers, landscape, tablet, high-DPI behavior, accessibility, and visual quality still require manual validation.
- The production bundle currently triggers Vite's large-chunk warning.
- No AI opponent, PWA/offline support, backend, Firebase integration, deployment configuration, or final asset pipeline is included. Those remain deferred.
