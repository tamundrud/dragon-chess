# Dragon Chess — Vertical Slice

Dragon Chess is an animated, child-friendly chess game that combines standard chess rules with dramatic, storybook-style animated capture battles. Built specifically for an 8-year-old child who loves chess and dragons, the project ensures 100% rules compliance while making every piece capture feel like a playful fantasy adventure.

---

## 🚀 Fresh-Clone Startup Instructions

To set up and run the project locally from a fresh clone:

1. **Install Dependencies**:
   ```bash
   npm ci
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Run Verification & Quality Checks**:
   ```bash
   # Run all automated unit tests (Vitest)
   npm test -- --run

   # Run TypeScript type checking
   npm run typecheck

   # Run ESLint
   npm run lint

   # Build production bundle
   npm run build
   ```

To run browser coverage locally (production preview, not the development server):

```bash
npx playwright install chromium
npm run build
npx playwright test
```

Playwright owns port 4173 and refuses to reuse an existing server. Traces and named menu/board/settings/capture screenshots are retained in the HTML report; CI uploads browser evidence on success and failure. Managed Cloud uses its configured system-Chromium wrapper; see the current verification record in `docs/reviews/recovery-phase2.md`.

---

## 🏛️ Architectural Boundaries & Invariants

The project enforces strict separation of concerns to guarantee reliability and maintainability:

1. **Authoritative Engine (`chess.js`)**:
   `chess.js` (managed inside `ChessGameController`) is the sole rules authority. It generates legal moves, validates move attempts, tracks turns, and evaluates check, checkmate, and draw conditions. Neither Phaser nor React ever duplicate or calculate chess rules.
2. **Presentation Invariant**:
   Attack animations are purely presentation. Whether animations are enabled, disabled, set to fast/instant, or skipped mid-flight, the exact same final chess state is committed to `chess.js` and rendered on the board.
3. **Phaser 3 Rendering & Timeline Management**:
   Phaser manages board rendering (`BoardScene`) and animated battle scenes (`AttackScene`). It derives all visual piece positions from the authoritative controller.
4. **React UI**:
   React provides surrounding application menus (`StartMenu`), game status headers (`GameUI`), and settings modals (`SettingsModal`). React never stores a second copy of the chess board state.
5. **Data-Driven Registries**:
   Characters (`CharacterRegistry`) and attack choreographies (`AttackRegistry`) are decoupled from gameplay logic. Adding new characters or attacks requires adding data definitions, without altering the chess engine or board scenes.

---

## ✅ Completed Features (Phases 1–4)

- **Phase 1 (Foundation)**: Complete project structure, TypeScript/Vite/Phaser/React setup, and local persistence for user settings (`SettingsStore`).
- **Phase 2 (Playable Chess)**: Full standard chess rules, mobile-first responsive board, local pass-and-play, promotion modal overlay, check/checkmate/stalemate indicators, undo, and restart.
- **Phase 3 (Attack Framework)**: `AttackDirector` lifecycle (`idle` -> `preparing` -> `attacking` -> `impact` -> `recovering` -> `completing`), input locking during battle, skip handling, speed multiplier support (Normal, Fast, Instant), reduced motion mode, and duplicate-move prevention.
- **Phase 4 (Fire Dragon Vertical Slice)**: Storybook 11-beat capture choreography for the Light Knight (`fire_dragon` character executing `fire_stream_attack`). Features layered procedural graphics (wings, glowing belly, jaw articulation), travelling flame cones, ember particles, soot/spark reaction on defender silhouettes, and missing-audio tolerance.

---

## 🎨 Asset Strategy & Temporary Tokens

- **Temporary Procedural Assets**: For the vertical slice, piece graphics and battle scenes are generated using high-quality procedural Phaser vector shapes (`Phaser.GameObjects.Graphics`). Standard faction badges and backlit silhouettes are used for defenders.
- **Missing Audio Tolerance**: `AudioController` safely catches missing audio files or browser autoplay restrictions without crashing or breaking animations.
- **Deferred Features**: Custom 2D illustrated sprite sheets, additional character choreographies (Vikings, Obsidian Clan dragons), and AI single-player opponents are deferred to future development phases.
- **Private Fan-Project Constraints**: All assets are cleanly generated or procedural. No copyrighted book, movie, or proprietary artwork is included. Designed strictly as a safe, family-friendly game.

---

## 🐛 Known Defects & Technical Debt

- **Recovery Phase 2**: Header/status wrapping, reachable settings on short screens, canvas resizing after rotation, and responsive capture labels are covered by production-build browser tests. The unit suite contains 61 tests across 6 suites.
- **Browser coverage**: Chromium at 360x800, 390x844, 800x360, 768x1024, and 1366x768; phone/tablet projects send touchscreen events. Emulating an iPhone viewport in Chromium does not test Safari.
- **Human acceptance remains**: Physical iOS Safari and Android Chrome, browser chrome/safe areas, thumb scrolling and tap comfort, high-density readability, animation quality, and child usability. Short landscape screens intentionally allow vertical page scrolling to retain usable board squares. See [the test plan](docs/TEST_PLAN.md).
- **Build warning**: The existing production JavaScript bundle exceeds Vite's 500 kB warning threshold.

---

## 🤖 Continued Work (Codex / Claude Code)

This repository is stabilized and ready for automated AI development tools:
- **Recommended First Codex Task**: Implement `VikingWarriorPresenter` for Pawn captures, adding a simple spear-thrust or shield-bash animation following the `FireDragonPresenter` template in `src/game/animation/`.
- **Reference Documentation**: Refer to `AGENTS.md` and `docs/ARCHITECTURE.md` for guidelines on adding new data-driven character presenters without violating chess state boundaries.
