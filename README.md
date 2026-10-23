# Dragon Chess

Dragon Chess is a child-friendly, local pass-and-play chess game with animated capture scenes. `chess.js` owns the rules, Phaser renders the board and battles, and React supplies menus and settings. The current vertical slice uses procedural graphics and one dedicated Fire Dragon presenter; visual quality and physical-device acceptance remain open.

## Setup and verification

Use **Node 24.x and npm 11.x**. `.nvmrc` selects the Node line used by CI; `package.json` declares the supported ranges. With nvm installed, run `nvm install` and `nvm use`. npm 11.9.0 is the recorded package-manager version. npm is the only supported package manager, and `package-lock.json` is the sole lockfile.

From a fresh checkout:

```bash
npm ci --include=dev
npm run dev
```

Open `http://localhost:3000`. No API keys, environment file, backend, or Cloud helper is required. Settings persist in the browser's local storage; games do not persist across reloads.

Run the quality checks:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Run browser coverage against the production build:

```bash
npm run test:e2e:install
npm run build
npm run test:e2e
```

The install command downloads Playwright Chromium and installs its OS dependencies (Linux may request administrator access). It needs network access to Playwright's browser distribution hosts. It runs once per browser version/environment. Afterward, `npm run test:e2e` uses the committed configuration without external files. Playwright owns port 4173 and refuses to reuse an existing server. To inspect the build yourself, run `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`, then stop it before running browser tests.

CI reads `.nvmrc`, installs the lockfile including development dependencies, runs every quality check and all five Playwright projects, and uploads screenshots/traces in `playwright-report/` and `test-results/` for 14 days. These generated directories are ignored by git.

### Optional Codex Cloud setup

The managed environment may supply a dependency fingerprint helper and a Playwright wrapper using `/usr/bin/chromium`. These remain supported environment conveniences:

```bash
bash /workspace/dragon-chess-refresh-deps.sh "$PWD"
npm run build
npx --no-install playwright test --config=/workspace/dragon-chess-playwright.config.mjs
```

Run from the repository root. If those files are absent, use the ordinary setup above. Keep system-browser selection in the external wrapper; the repository defaults to Playwright's installed Chromium. `DISABLE_HMR=true` remains an optional managed-environment switch that disables development HMR and file watching. It is unnecessary for ordinary local development or production preview.

## Implemented functionality

- Standard chess through `ChessGameController` and `chess.js`: legal moves, captures, castling, en passant, promotion, check, checkmate, supported draw conditions, Undo, and Restart.
- Local two-player play with touch/mouse input, move highlighting, promotion selection, menus, and persistent preferences.
- Capture lifecycle: `idle -> preparing -> attacking -> impact -> recovering -> completing -> idle`, input locking, Skip, animation enable/disable, Normal/Fast/Instant speed, and reduced motion.
- Fire Dragon capture presentation for light knights, with procedural wings, glow, flame, embers, and defender reaction. Other pieces use the generic temporary presentation even when their registry entries name bespoke attacks.
- Capture cancellation when leaving a game and cleanup of presentation resources. Restart/Undo stay disabled during an active capture.

## Architecture and extension boundaries

`chess.js` is the sole authority for board state, legal moves, turn order, and game status. React and Phaser consume that state. Attack presenters never mutate chess state; the same legal capture must commit once whether played, skipped, disabled, or instant. Leaving a game aborts presentation without committing its pending capture.

Character and attack registries provide identities and timing definitions. Dedicated character choreography requires an `AttackPresenter` implementation plus routing in `AttackScene`; adding registry data alone uses the generic presenter. Audio calls go through `AudioController`, which unlocks after interaction, plays optional `/assets/audio/<cue>.mp3` files through HTML Audio, and tolerates missing files or playback rejection. No sound pack is shipped.

See [AGENTS.md](AGENTS.md), [architecture](docs/ARCHITECTURE.md), and [attack system](docs/ATTACK_SYSTEM.md) before changing these boundaries.

## Evidence and remaining acceptance

The recovered baseline contains six Vitest suites (61 tests) and 40 Playwright cases across desktop, two phone portrait sizes, phone landscape, and tablet. Two desktop cases intentionally skip touch-only scenarios. Chromium iPhone/iPad emulation does not verify Safari. Current commands, results, and CE review limitations are recorded in [the Phase 3 verification record](docs/reviews/recovery-phase3.md); [Phase 2](docs/reviews/recovery-phase2.md) remains historical evidence.

[The test plan](docs/TEST_PLAN.md) separates existing coverage from required acceptance. Remaining gates include physical iOS Safari and Android Chrome, browser bars/safe areas, tap and scroll comfort, promotion/status readability, animation quality, audible behavior with real assets, and intended-child usability. Rotating mid-capture updates the board, labels, and Skip, but in-flight artwork can retain its original coordinates until completion.

The Cloud browser run also exposed an intermittent capture-resize text-wrapping page error, reproduced on the unchanged recovery base; see the verification record for counts and evidence.

The production JavaScript bundle still exceeds Vite's 500 kB warning threshold. Bundle optimization, illustrated assets, dedicated remaining-character presenters, sound assets, and a single-player opponent are outside this tooling recovery phase. See [the roadmap](docs/ROADMAP.md).
