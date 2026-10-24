# Recovery Phase 3 verification and review

Date: 2026-10-23. Base: `recovery/2026-10-22` at `8d65b02cde3ecc7c7e2bf52212faaf03dce3bc26`, freshly fetched before creating `recovery/phase-3-tooling-docs`. Initial checkout was clean. Plan: [tooling and documentation consolidation](../plans/2026-10-23-0500-chore-recovery-tooling-docs-plan.md).

## Changes and dependency evidence

- U1 / R1-R2: npm is the sole package manager; removed `bun.lock`. Node 24.x/npm 11.x are declared in package engines; `.nvmrc` selects the CI Node line. Local runtime: Node **24.19.0**, npm **11.9.0**. Vite is declared once, alongside its build plugins in development dependencies.
- U1 / R2: Import/config/script searches confirmed no callers for `@google/genai`, `dotenv`, `express`, `motion`, `@types/express`, `autoprefixer`, direct `esbuild`, or `tsx`. Removed those direct dependencies. Vite still owns its required transitive esbuild/dotenv. Tailwind v4's Vite integration remains. `phaser3spectorjs` remains because Phaser's WebGLRenderer requires it (Phaser lists it as a development dependency, so relying on Phaser to install it would be unsafe).
- U1 / R2: Removed the unused AI/server `.env.example`, false Gemini capability metadata, and stale `server.js` cleanup target. No application API keys/backend are required.
- Lockfile reconciliation: **486 -> 336** package entries, **156 removed**, **6 added**, and **zero version changes at surviving paths**. npm filled the already-declared optional Tailwind WASI subtree with five previously absent runtime dependencies plus nested `tslib` (the existing 2.8.1 version). This is lockfile completion during pruning, not an application dependency upgrade. A subsequent fresh `npm ci` left the lockfile byte-identical.
- U2 / R2-R4: Vitest composes Vite's plugins/resolution rather than duplicating them. Kept the `DISABLE_HMR` switch, external dependency helper, external system-Chromium wrapper, all five browser projects, strict production-preview port ownership, screenshot/trace retention, and every existing test unchanged. Added npm browser setup/run scripts and ignored generated browser artifacts.
- U3 / R5: README, agent guidance, roadmap, architecture, attack/asset/roster documentation, and test plan distinguish implementation from acceptance. Documented generic presenter fallback, actual HTML Audio support without shipped sounds, initial knight assignments, coverage limits, and the existing mid-capture rotation limit. Historical Phase 2 evidence remains unchanged.

## Local and clean-checkout checks

Current canonical checkout:

| Check | Result |
| --- | --- |
| Cloud dependency refresh helper | Clean install succeeded, 262 installed packages |
| `npm test` | 6 suites, 61 tests passed |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed without diagnostics |
| `npm run build` | Passed; 1,787.82 kB JavaScript / 432.49 kB gzip |
| `npm run dev -- --strictPort` | Served root HTML and transformed `/src/main.tsx` on port 3000 |
| `git diff --check` and Markdown link targets | Passed |
| Vite HMR/watch switch | Ordinary mode enabled and `DISABLE_HMR=true` disabled, both verified |
| Cloud helper repeat call | Matching dependency fingerprint reused successfully |
| Application/test/config scope comparison | `src/`, `e2e/`, and `playwright.config.js` unchanged |

An isolated directory reconstructed from the base plus task changes, without `node_modules`, `dist`, environment files, or Cloud helper files, passed:

```bash
npm ci --include=dev --no-audit --no-fund
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e -- --list
```

The clean run passed all **61 unit tests** and discovered **40 browser cases in five projects**. Build artifacts have the same hashes/sizes as the canonical build. No tests were added or weakened: configuration changes use clean installation, existing coverage, and runtime smoke verification rather than tests mirroring manifests.

## Browser verification and environment limits

The standard configuration defaults to Playwright's bundled Chromium and needs no external helper. CI runs the documented fresh-checkout install/build/browser sequence on Ubuntu and retains the HTML report and traces for 14 days.

On this managed Debian 13 host, `npm run test:e2e:install` failed when its OS-dependency step attempted unavailable root authentication. A browser-only `npx --no-install playwright install chromium` then failed with **HTTP 403 `Domain forbidden`** from `cdn.playwright.dev` and `playwright.download.prss.microsoft.com`. Bundled-browser execution is therefore blocked locally; discovery is not claimed as an executed browser pass. No proxy/network bypass or repository browser-path change was made.

The preserved Cloud command ran against production preview:

```bash
DRAGON_CHESS_ARTIFACTS=/workspace/dragon-chess-artifacts/phase3-cloud \
  npx --no-install playwright test \
  --config=/workspace/dragon-chess-playwright.config.mjs --workers=2
```

The two-worker matrix exposed `wordWrapWidth < a single character` page errors in the phone-390 active-capture resize case. Its trace records three page errors at `e2e/helpers.js:9`; the fixture correctly failed instead of ignoring them. Full matrix: **37 passed, 2 intentional desktop touch-only skips, 1 failed, 0 flaky**, 40 cases, 10.0 minutes, no retries. The isolated task rerun of that case with one worker **passed (1 test, 6.9 seconds)**. That rerun does not erase the full-matrix failure. This path verifies system Chromium and touch emulation, not Safari or physical devices.

A separate build of the exact recovery base, using the same installed versions, produced **byte-identical HTML, CSS, and JavaScript** to this task. Application source, browser tests, and committed Playwright configuration are also unchanged. The resize error is therefore a remaining baseline/runtime issue, not a changed game bundle. A targeted baseline run repeated the phone-390 resize case three times: **2 passed, 1 failed with the same three word-wrap page errors**. It used the unchanged base source and the existing system-browser wrapper with only the preview port changed to 4183 in a temporary external wrapper. This reproduces the intermittent baseline defect; no assertions were suppressed and no gameplay fix was added to this tooling task.

## Compound Engineering coverage

`ce-plan` saved the linked plan and passed its confidence check. `ce-doc-review` did not run: `skipped_reason: skill_unreachable`, because the separate normal skill-invocation mechanism was unavailable. Stand-in result: zero fixes/proposals/decisions/FYIs; this is not a review pass. A local coherence and repository-evidence check established prerequisites before implementation.

`ce-work` selected native inline execution because U1-U3 form a dependency chain. The simplification pass retained shared Vite configuration and avoided extra abstractions or speculative optimization. Existing tests prove preserved behavior; no gameplay source or test changes were required.

`ce-code-review` completed the focused path: correctness, root `AGENTS.md` criteria, explicit-plan requirements, and test sufficiency locally, plus a fresh-context adversarial read and a narrow follow-up on final documentation. **Zero actionable findings.** No different-provider CLI is installed, so no cross-model pass ran. The independent read uses the same serving family. No specialist roster or validator batch ran; Compound Packs, learnings, agent-native gaps, and deployment review were not assessed. The reviewer identified the externally blocked bundled-browser check as an evidence gap to close in CI. [The saved receipt](recovery-phase3-ce-review.json) records `status: complete` and run ID `20261023-045925-338fa253`; raw reviewer and stage-log artifacts are in its recorded run directory. No findings required code fixes. Subsequent browser execution exposed and reproduced the baseline resize error described above; application artifacts were byte-identical, so this evidence adds a documented baseline limitation without changing the reviewed tooling.

Diagnostic evidence is retained locally at `/workspace/dragon-chess-artifacts/phase3-diagnostics.zip` (full-matrix/baseline JSON, both failed traces/screenshots, and CE receipts). Complete Cloud HTML reports and traces remain under `/workspace/dragon-chess-artifacts/phase3-cloud/`, `phase3-baseline-resize/`, and `phase3-resize-rerun/`. Those workspace paths are local artifacts, not GitHub-hosted downloads; the PR CI artifacts provide portable browser evidence when available. No new manual visual acceptance is claimed.

## Remaining acceptance and retained limits

Physical iOS Safari/Android Chrome, browser bars/safe areas, high-density readability, thumb comfort, child usability, promotion/status UX, animation aesthetics, and audible behavior with actual assets remain human acceptance. Automated acceptance gaps are listed in [TEST_PLAN.md](../TEST_PLAN.md), including stronger capturing-promotion assertions and exhaustive special-rule cases. No new gameplay verification is claimed.

Rotating mid-capture can leave artwork at its initial timeline coordinates until completion; labels/Skip and subsequent play resize correctly. The existing Vite bundle-size warning remains. No merge or deployment is part of this delivery.
