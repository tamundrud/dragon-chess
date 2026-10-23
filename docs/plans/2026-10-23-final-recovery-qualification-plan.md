# Final recovery qualification plan
Created: 2026-10-23

## Goal and boundaries

Qualify integrated `recovery/2026-10-22` after PR #9 for a draft recovery PR against `main`. Produce current evidence and a clear merge-readiness decision. No gameplay, dependency, application configuration, merge, or deployment changes are authorized.

## Qualification sequence

1. Verify PR #9 is merged, fetch both branch tips, record full SHAs, and prove that main and the PR #9 merge are ancestors of the candidate. Audit the complete recovery diff and prior recovery records for integration risks.
2. Refresh dependencies through the Cloud helper using the committed npm lockfile. Run current unit tests, typecheck, lint, and production build. Retain command logs and report warnings separately from failures.
3. Run the unchanged production Playwright suite across desktop, both phone portrait sizes, phone landscape, and tablet with system Chromium. Retain JSON, HTML, traces, and screenshots; inspect failures without weakening assertions. Verify production preview readiness.
4. Inspect representative menu, board, settings, and generic/Fire Dragon capture screenshots, including rotation. Compare against the product/art direction and acceptance checklist. Separate agent inspection from physical-device and child acceptance.
5. Perform CE integration code review against main, covering authoritative chess state, cancellation and delayed callbacks, resize behavior, browser error guards, tooling/CI, and regression gaps. Record reviewer coverage and capability limits.
6. Write a final qualification record with exact candidate and base, current counts, coverage map, risks, outstanding manual acceptance requirements, and an explicit readiness verdict. Preserve historical evidence as historical.
7. If results support review, commit only qualification documentation and selected evidence on a task branch based on the verified recovery tip, push it, and open a draft PR against main. Verify its base/head and CI status. Leave it draft; do not merge or deploy.

## Decision rules

- A failing required check, unexplained browser error, or retained material integration defect prevents a positive technical readiness recommendation. Record it without expanding into gameplay fixes.
- Passing emulated Chromium checks supports technical review, not final visual, Safari/Android hardware, audio, performance, or child-usability acceptance.
- Outstanding human gates keep final merge acceptance conditional. Missing capabilities must be disclosed rather than counted as passed.
- Recheck remote tips before delivery; new application changes invalidate the candidate evidence and require reassessment.

## Deliverables

- `docs/reviews/final-recovery-qualification.md`: evidence, coverage, risks, and acceptance checklist.
- Selected screenshots and a portable results summary under `docs/reviews/artifacts/final-recovery/`.
- Complete Cloud evidence archive for remote inspection and a draft recovery PR against main if appropriate.

The user already authorized planning, execution, documentation, and a conditional draft PR. Execution follows this plan without another approval checkpoint.
