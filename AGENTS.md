# Dragon Chess — Agents Guide

## Project Overview

Dragon Chess is a child-friendly chess game that follows normal standard chess rules (`chess.js`) while making captures dramatic and playful with character-specific animated battle scenes (`Phaser 3`).
The primary user is an 8-year-old child who likes chess and dragons.

## Key Architectural Boundaries

1. **Authoritative Engine (`chess.js`)**: Never duplicate chess rules, legal move generation, turn order, or check/mate evaluation in Phaser or React. `chess.js` is the sole authority.
2. **Presentation Invariant**: Attack animations are presentation only. Whether animations are enabled, disabled, fast, instant, or skipped, the exact same final chess state must result.
3. **Phaser 3**: Manages board rendering (`BoardScene`), attack presentation (`AttackScene`), and audio/visual timelines.
4. **React**: Used only for surrounding menus, start screens, and settings overlays (`SettingsStore`). React must never own a second copy of board state.
5. **No Enormous Files**: Keep components, scenes, controllers, and registries modular and cleanly separated.

## Task Workflow

- Check `git status --short --branch` and the remote before editing. Verify the user’s intended base branch and its current commit; do not assume `main` or rely on a stale local ref. Explicitly fetch it when starting work, e.g. `git fetch origin refs/heads/<base>:refs/remotes/origin/<base>`, then `git rev-parse origin/<base>`.
- Create a separate task branch from that fetched base (`git switch --no-track -c <task-branch> origin/<base>`). Preserve existing task branches, commits, and uncommitted work; use a separate checkout if switching would disturb them. The recovery stack has been integrated; normal follow-up work targets `main` unless the task explicitly selects another base. Confirm and fetch the requested base each task.
- Before related changes, read [product scope](docs/PRODUCT_BRIEF.md), [game rules](docs/GAME_RULES.md), [architecture](docs/ARCHITECTURE.md), [attack system](docs/ATTACK_SYSTEM.md), [roadmap](docs/ROADMAP.md), and [test plan](docs/TEST_PLAN.md). Read the roster, art, and asset documents in `docs/` when those areas are affected.
- Keep each task and commit scoped. Avoid unrelated recovery fixes, dependency upgrades, or configuration changes.

## Dependencies

- Use Node 24.x and npm 11.x (`.nvmrc` and `package.json`). npm is the only supported package manager; `package-lock.json` is the sole lockfile. Use clean installs without opportunistic dependency upgrades.
- **Codex Cloud only:** when available, run `bash /workspace/dragon-chess-refresh-deps.sh "$PWD"` from the repository root before checks and after branch changes. It refreshes dependencies when the manifests or Node runtime differ, otherwise it reuses the matching installation.
- **Other environments or missing Cloud helper:** use `npm ci --include=dev` from the repository root. Refresh after branch changes that alter `package.json` or `package-lock.json`, or if the installation is missing or stale. Report install failures without silently upgrading dependencies.

## Compound Engineering

- When available, explicitly open `$HOME/.agents/skills/<skill>/SKILL.md`: use `ce-plan` for substantial planning, `ce-work` for implementation, and `ce-code-review` before delivery. A small, clear task can go straight to `ce-work`.
- Read each skill’s required reference files from its own directory at the phase that requires them (including references under `references/`); do not rely on native skill discovery or reconstruct instructions from memory.
- Check actual tool support. Do not assume cross-model reviewers or browser drivers are available. Report missing skills, references, and unsupported capabilities; follow documented fallbacks where allowed and distinguish a local review from an independent cross-model review. Never claim a skill, reviewer, or browser check ran without evidence.

## Development Checklist

For application changes, run from the repository root and report current results:

- `npm run dev` or `npm run preview` for runtime verification
- `npm run test` (Vitest)
- `npm run typecheck` (`tsc --noEmit`)
- `npm run lint`
- `npm run build`

- For gameplay or UI changes, build first, then run appropriate Playwright coverage from `e2e/`. Include capture/skip/cleanup scenarios for attack changes, and phone portrait/landscape plus desktop coverage for UI changes. Capture useful screenshots or traces and link accessible artifacts in the PR.
- **Codex Cloud only:** when present, use `npx playwright test --config=/workspace/dragon-chess-playwright.config.mjs` (optionally selecting relevant tests). This saved wrapper uses system Chromium at `/usr/bin/chromium` and captures screenshots/traces. Do not assume Playwright’s bundled browser is installed. If the wrapper or browser is unavailable, report the limitation before choosing a supported alternative.
- **Outside Cloud:** use `npm run test:e2e:install` once to install Chromium and OS dependencies, then `npm run build` and `npm run test:e2e` with the repository configuration and a browser installed for that environment. Do not change repository browser configuration merely to match Cloud.
- Current tooling and verification evidence: [Phase 3 record](docs/reviews/recovery-phase3.md). No environment file or API key is required.
- Automated assertions and captured artifacts are not manual visual acceptance. Inspect relevant views against `docs/TEST_PLAN.md` when possible; report what was visually inspected and what still needs human acceptance, especially animation quality and phone usability.
- Documentation-only changes may use `git diff --check`, path/command checks, and a contradiction/scope review instead of local application runs. CI requirements still apply. State skipped checks and reasons; historical results are not current verification.

## Delivery (Phone-Friendly)

- Commit only task-owned files, push the task branch, and open a **draft** PR with an explicit base (e.g. `gh pr create --draft --base <base> ...`). Verify the PR’s base and changed files before handing it over.
- Keep updates and the final handoff easy to scan on a phone: PR link, short description, exact checks and outcomes, artifact links, and remaining risks or blocked checks. Distinguish local results, CI status, and manual acceptance; never reuse old test results as proof.
- Leave merging and deployment to explicit user approval. Do not merge, enable auto-merge, or deploy as part of ordinary task delivery.

## Historical Vertical Slice Status (Phase 4)

- **Authoritative Rules**: `ChessGameController` wraps `chess.js` and provides 100% legal chess rules, promotion overlays, undo, and restart.
- **Attack Lifecycle**: `AttackDirector` manages capture animations through strict phases (`idle` -> `preparing` -> `attacking` -> `impact` -> `recovering` -> `completing`). Input is locked during attacks.
- **Fire Dragon Slice**: Light Knight (`g1`/`b1`) is assigned `fire_dragon` (`fire_stream_attack`). Implemented in `FireDragonPresenter` with procedural wings, glowing belly, fire cones, ember particles, and soot/spark reaction silhouettes.
- **Historical Verification**: The Phase 4 record reported 46 passing Vitest tests and zero TypeScript/ESLint errors. This is background only; verify the current task independently.

## Continued Work (Codex & Claude Code Guidelines)

1. **Adding New Attack Presenters**:
   - Implement the `AttackPresenter` interface. [Fireworm is the owner-approved visual/animation benchmark](docs/FIREWORM_BENCHMARK.md); preserve its staging, continuity, polish and lifecycle standard while allowing character-specific attacks. See `FirewormPresenter.ts` for illustrated presentation and `FireDragonPresenter.ts` for the older procedural example.
   - `AttackScene` is the presenter registered with `AttackDirector`. Route dedicated presenters from `AttackScene.playAttack()` as it does for `FirewormPresenter` and `FireDragonPresenter`; registry data alone uses the generic presentation.
   - Ensure `skip()` and `cleanup()` remove all temporary Phaser containers, graphics, tweens, and timers.
   - Never mutate `chess.js` state inside a presenter.
2. **Replacing Temporary Art**:
   - The vertical slice uses procedural Phaser vector graphics. When replacing with illustrated sprite sheets or textures, add loading to the relevant Phaser scene’s `preload()` and reference texture keys in presenters (`PhaserGameManager` currently defines no `preload()` method).
3. **Audio Handling**:
   - All sound calls must go through `AudioController.getInstance().playSound()`, which uses HTML Audio and tolerates missing files or autoplay rejection. No sound pack is shipped; audible output still needs asset and hardware acceptance.
