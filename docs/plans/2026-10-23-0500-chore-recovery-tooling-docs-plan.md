---
title: Recovery Phase 3 Tooling and Documentation - Plan
type: chore
date: 2026-10-23
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-plan-bootstrap
execution: code
---
# Recovery Phase 3 Tooling and Documentation - Plan

## Goal Capsule

Contributors can install, build, and verify Dragon Chess from a fresh checkout using documented tooling. The user authorizes implementation, testing, review, and a draft PR against `recovery/2026-10-22`. Stop before merge or deployment.

## Product Contract

### Summary and Problem Frame

The recovery branch has npm and Bun lockfiles, redundant Vite declarations/configuration, unused server/AI scaffold packages, and CI on Node 20 while Cloud runs Node 24. Some documentation treats implemented functionality as completed visual acceptance. Consolidation must preserve the recovered application and its coverage.

### Requirements

**Tooling**

- R1. Use npm and `package-lock.json` exclusively, with compatible Node/npm requirements shared by local setup and CI.
- R2. Remove only confirmed unused scaffold dependencies and duplicate configuration, retaining locked versions of surviving dependencies.
- R3. A fresh checkout builds and runs all committed Playwright projects without external Cloud helper files.
- R4. Preserve the working Cloud helper path and all existing unit and browser coverage.

**Documentation and delivery**

- R5. Distinguish implemented functionality, current automated evidence, known limits, and outstanding human acceptance.
- R6. Save current verification and CE review evidence and deliver a draft PR against the requested base.

### Scope Boundaries

No gameplay, UI, attack choreography, new features, dependency upgrades, deployment, or speculative bundle work. The existing bundle warning remains documented. Physical-device and child acceptance remain human work.

## Planning Contract

- KTD1. Use Node 24.x and npm 11.x with `.nvmrc`, package engines, and CI reading `.nvmrc`; these match the working Cloud runtime and satisfy current ESLint/jsdom requirements. Covers R1/R4.
- KTD2. Keep npm's existing dependency resolutions while pruning unused direct packages. Preserve Tailwind's Vite plugin and Phaser's debug dependency unless source evidence proves otherwise. Covers R2.
- KTD3. Share Vite plugins and resolution with Vitest through configuration composition. Keep Playwright's portable bundled-browser default, production preview, strict port ownership, projects, and evidence retention. Covers R2-R4.
- KTD4. Retain optional external Cloud wrappers unchanged. Prove portable operation in an isolated checkout with standard npm/Playwright commands; if browser downloads are blocked, report that separately from system-Chromium coverage. Covers R3/R4.

Assumption: Node 24 is the supported contributor/CI line; support for older Node versions is outside this task. No blocking product questions remain.

## Implementation Units

### U1. Consolidate dependency and runtime contracts

**Requirements:** R1/R2/R4; KTD1/KTD2.

**Files:** `package.json`, `package-lock.json`, `bun.lock`, `.nvmrc`, `.github/workflows/ci.yml`, `.env.example`, `metadata.json`.

Audit imports, scripts, configuration, and library requirements before pruning. Remove stale AI/server configuration claims. Declare build tooling once under development dependencies. Preserve existing application packages and avoid unrelated upgrades.

**Test expectation:** No new unit tests for manifest/configuration edits. Verify clean npm installation under the supported runtime and compare surviving lockfile versions against the base.

### U2. Consolidate configuration and prove portable checks

**Requirements:** R2-R4; KTD3/KTD4. Depends on U1.

**Files:** `vite.config.ts`, `vitest.config.ts`, `.gitignore`, `playwright.config.js` if evidence requires a change. Existing test paths: `src/tests/`, `e2e/game.spec.js`, `e2e/mobile.spec.js`, `e2e/helpers.js`.

Reuse Vite configuration in Vitest without duplicate plugins/aliases. Add portable browser script entry points and ignore generated browser artifacts. Retain the Cloud HMR environment switch.

**Execution note:** Prefer clean-install/build/runtime smoke verification to tests that merely restate configuration.

**Verification scenarios:**

- Fresh isolated checkout with no helper files or installed dependencies installs with npm and builds successfully.
- Standard Playwright configuration discovers all five projects and runs against production preview using its installed Chromium.
- Existing Cloud dependency helper and system-Chromium wrapper still run against the consolidated configuration.
- Existing six unit suites and all browser assertions remain intact.

### U3. Reconcile documentation and record review

**Requirements:** R5/R6. Depends on U1/U2 evidence.

**Files:** `README.md`, `AGENTS.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/ATTACK_SYSTEM.md`, `docs/TEST_PLAN.md`, `docs/reviews/recovery-phase3.md`; other project docs only where confirmed contradictions occur.

Document exact setup commands, runtime requirements, current functionality, temporary assets/audio, fallback presenters, acceptance gaps, and retained warnings. Preserve earlier verification records as historical evidence.

**Test expectation:** No new tests for prose. Check paths/commands, contradictions, scope, and whitespace. Record exact current outcomes and review limitations.

## Verification Contract

Run `npm ci --include=dev`, `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` under Node 24/npm 11. Verify `npm run dev` serves the application. Build before running the full five-project Playwright matrix using both the portable configuration and the supported Cloud wrapper where available. Use `git diff --check`, dependency-reference searches, and a lockfile version comparison. Record browser installation restrictions explicitly; do not present system-browser runs as bundled-browser proof. Complete `ce-code-review` and resolve actionable findings before delivery.

## Definition of Done

R1-R6 are supported by changes and current evidence. All relevant checks pass or carry a specific externally blocked explanation. The PR remains draft with the correct base and scoped changed files. No merge or deployment occurs. Human visual/device acceptance is explicitly outstanding.
