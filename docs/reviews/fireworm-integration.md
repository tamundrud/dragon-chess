# Fireworm integration and consolidation

The integration candidate combines [#12](https://github.com/tamundrud/dragon-chess/pull/12) → [#13](https://github.com/tamundrud/dragon-chess/pull/13) → [#14](https://github.com/tamundrud/dragon-chess/pull/14) → [#15](https://github.com/tamundrud/dragon-chess/pull/15) → [#16](https://github.com/tamundrud/dragon-chess/pull/16), starting from fetched `main` at `3b02ce782775e1d7832b887a9e4399493c23c9ec`. Each original head is an ancestor of the next; local integration fast-forwards through all five without cherry-picking or replaying changes. Merge commits preserve ancestry. Retarget each child PR to `main` only after its parent is merged; do not squash the stack and then reapply parent commits.

## Approval and consolidation

[Owner physical-phone approval on PR #16](https://github.com/tamundrud/dragon-chess/pull/16#issuecomment-6428592082) resolves the earlier Fireworm visual objections. [The benchmark](../FIREWORM_BENCHMARK.md) captures the accepted staging, continuity, comic effects and lifecycle standard while explicitly allowing different attacks for different characters. It is not full-roster or release acceptance.

Current product, architecture, attack, art, asset, roster, roadmap, testing and contributor documents now reference that scope; previous review bodies and plans remain historical evidence. The replay footer no longer asks for approval already granted. Obsolete body/head/release/wing and raw defender atlas-frame registrations are removed; the atlas remains required for painted flame and cleaned raider extraction. The production presenter, replay fixture, arena comparison, recorder and historical evidence remain useful and are retained. No character development or deployment is included.

## Technical evidence and review

The integrated candidate passed `npm test` (11 suites / 105 tests), `npm run typecheck`, `npm run lint` and `npm run build` using Node 24 / npm 11 and the locked dependencies. Vite retains its existing large-bundle warning. Consolidation changes do not alter the approved choreography or chess state behavior.

[CE review](artifacts/fireworm-integration/ce-code-review.json) and [metadata](artifacts/fireworm-integration/ce-code-review-metadata.json) record six completed local passes: correctness, project standards, testing, maintainability, adversarial composition and frontend races, plus independent validation of the one finding. No different-provider CLI was installed, so no cross-model review is claimed.

Finding #1 identified touch-Skip tests that could pass through natural completion before checking the result. The consolidation adds idle/committed-turn assertions after one 32ms input frame, before the existing 4000/5000ms advances; later checks still detect stale callbacks. Production Skip behavior is unchanged. The review receipt describes the tree before this caller-owned resolution; the consolidation PR carries the final verification results.

The required final browser gate is the complete production-build Playwright suite (140 discovered cases, five projects), including chess controls, cold-art readiness/cancellation, generic/Fire Dragon/Fireworm lifecycle, natural completion, immediate Skip, abort, Undo/recapture, speed/reduced motion, arena/board, impact coverage/clearing, resize and mobile orientation. Cloud uses the external `/workspace/dragon-chess-playwright.config.mjs` wrapper and system Chromium; fresh-checkout CI uses the committed configuration and installed Chromium. Neither substitutes for physical Safari/Android acceptance. The consolidation PR records the completed results, exact candidate SHA, CI links and final main confirmation; do not treat discovery counts or the review's in-progress browser note as a passing result. CI retains screenshots/traces under its `playwright-report` artifact for 14 days.

Before merge, require all current candidate technical gates to pass without unresolved failures/flaky classifications. After merging, fetch `main`, verify its tree equals the qualified candidate, and confirm production preview/gameplay from that main checkout. This preserves the relevance of the full candidate matrix without claiming a second whole-suite run.

## Remaining limits

Most board tokens and character portraits remain temporary; the procedural knight Fire Dragon is still a technical example. No audio pack ships. The approximately 13MB PNG pack and large JavaScript bundle have no quantitative physical-phone memory/frame-rate benchmark. Broader physical browsers, safe areas/browser bars, child usability, promotion/status readability and other characters’ visual acceptance remain separate work. Fireworm approval and passing Chromium emulation do not close those gates.
