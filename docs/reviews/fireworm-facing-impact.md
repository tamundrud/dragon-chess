# Fireworm facing and engulfment — technical verification

> Historical implementation record. Fireworm visual objections are resolved by [owner approval on PR #16](../FIREWORM_BENCHMARK.md). See [current integration verification](fireworm-integration.md) for technical results.

2026-10-26. Narrow follow-up to the [owner's PR #14 review](https://github.com/tamundrud/dragon-chess/pull/14#issuecomment-6421755950). Branch `fix/fireworm-defender-impact` starts at fetched `feat/fireworm-foreground-refinement`, `6981b8720274827b89863cf36c825da6ea561d80`, and targets that branch in a separate stacked draft. No merge or deployment.

## Scope and implementation

The existing [foreground refinement plan](../plans/2026-10-26-fireworm-foreground-refinement-plan.md) remains the governing product/verification contract. This small, concrete follow-up entered `ce-work` directly. The latest owner direction supersedes the old U1 suggestion that all effects sit behind the defender. The approved darkened-board default, arena comparison, original PNG files, identities, chess authority and UI/accessibility controls remain intact.

- Facing is derived from staged attacker/defender positions plus each illustration's native heading. The right-facing pawn flips; the already left-facing Flamehuffer stays as drawn. Tests cover an attacker on either side. Symmetrical class/faction placeholders remain unmirrored so letters remain readable; they have no directional face.
- The pawn's atlas rectangle included a small tip from the neighbouring flame. Runtime sprite extraction omits that empty-corner contamination while preserving the hand and lower boot. The original atlas and all other PNGs are byte-for-byte unchanged. The pawn's decorative shield has no lettering or established handedness that the display flip would misrepresent.
- The main painted breath remains behind the actors for the approach, aiming at target height. Impact has target-local rear and foreground layers: a contact tongue and wrapping painted plumes pass across the defender's body; coloured sparks/trails are split around it. Sizes and attachment points derive from the actual pawn/rook display size, and the layers inherit recoil and resize through the same containers.
- Contact remains at 1330ms. Foreground engulfment rises over 160ms, begins receding at 1680ms and clears by 1940ms; the main breath clears by 1960ms. From 1980–2640ms the tinted, smudged, slumped defender remains visible under static dazed stars before fading. Normal remains 3350ms; every timer/tween uses the existing Fast 0.35× scale. Forty bounded coloured sparks, four smoke puffs and one brief luminous core remain; no strobe, camera shake or new sound.
- Reduced motion retains its short fade/static-spark alternative without travelling fire, enlargement, recoil or added reaction movement. All new objects live under the presenter-owned root; Skip/abort cleanup remains on the existing callback path.

## Rendered evidence

Each full recording includes setup, then **board Normal → board Fast → arena Normal → arena Fast**, with complete attacks and returns. Sixteen mobile combinations are retained across these four clips. Download/open MP4 if GitHub does not play it inline.

| Defender | Portrait 360×800 | Landscape 800×360 |
| --- | --- | --- |
| Meathead pawn | [Full recording](artifacts/fireworm-impact/portrait-pawn.mp4) | [Full recording](artifacts/fireworm-impact/landscape-pawn.mp4) |
| Flamehuffer rook | [Full recording](artifacts/fireworm-impact/portrait-rook.mp4) | [Full recording](artifacts/fireworm-impact/landscape-rook.mp4) |

[Recording observations](artifacts/fireworm-impact/motion-observations.json) record viewport, mode, wall-time offsets and page errors (none). MP4s are H.264 transcodes of full original browser recordings, without cuts or speed edits. The software-WebGL host stretches playback wall time; this is rendered evidence, not a physical-phone timing/frame-rate benchmark.

Agent inspection sampled all sixteen sequences at 4fps, checked ending sequences at 5fps, and inspected the exact-phase browser PNGs. Arrival/facing, foreground body coverage, dissipation, comic defeat and complete return are present. This is technical inspection rather than owner visual acceptance.

Normal board frames:

| Defender/view | Facing | Engulfed | Defeated reveal |
| --- | --- | --- | --- |
| pawn portrait | [Facing](artifacts/fireworm-impact/phone-360-portrait-pawn-board-normal-facing.png) | [Engulfed](artifacts/fireworm-impact/phone-360-portrait-pawn-board-normal-engulfed.png) | [Defeated](artifacts/fireworm-impact/phone-360-portrait-pawn-board-normal-defeated.png) |
| pawn landscape | [Facing](artifacts/fireworm-impact/phone-landscape-pawn-board-normal-facing.png) | [Engulfed](artifacts/fireworm-impact/phone-landscape-pawn-board-normal-engulfed.png) | [Defeated](artifacts/fireworm-impact/phone-landscape-pawn-board-normal-defeated.png) |
| rook portrait | [Facing](artifacts/fireworm-impact/phone-360-portrait-rook-board-normal-facing.png) | [Engulfed](artifacts/fireworm-impact/phone-360-portrait-rook-board-normal-engulfed.png) | [Defeated](artifacts/fireworm-impact/phone-360-portrait-rook-board-normal-defeated.png) |
| rook landscape | [Facing](artifacts/fireworm-impact/phone-landscape-rook-board-normal-facing.png) | [Engulfed](artifacts/fireworm-impact/phone-landscape-rook-board-normal-engulfed.png) | [Defeated](artifacts/fireworm-impact/phone-landscape-rook-board-normal-defeated.png) |

Arena comparison: [pawn portrait](artifacts/fireworm-impact/phone-360-portrait-pawn-arena-normal-engulfed.png) · [pawn landscape](artifacts/fireworm-impact/phone-landscape-pawn-arena-normal-engulfed.png) · [rook portrait](artifacts/fireworm-impact/phone-360-portrait-rook-arena-normal-engulfed.png) · [rook landscape](artifacts/fireworm-impact/phone-landscape-rook-arena-normal-engulfed.png).

Ending contact sheets include the final Fast sequence and its completed return: [portrait-pawn](artifacts/fireworm-impact/portrait-pawn-tail-sheet.png) · [portrait-rook](artifacts/fireworm-impact/portrait-rook-tail-sheet.png) · [landscape-pawn](artifacts/fireworm-impact/landscape-pawn-tail-sheet.png) · [landscape-rook](artifacts/fireworm-impact/landscape-rook-tail-sheet.png).

## Automated verification

Source commit: `578f110` ([build hashes](artifacts/fireworm-impact/build-manifest.json); [unchanged PNG hashes](artifacts/fireworm-impact/artwork-manifest.json)).

- `npm test`: **105 passed in 11 files**.
- `npm run typecheck`, `npm run lint`, `npm run build`: passed. The existing ~1.8MB JS bundle warning remains; no dependency or configuration change.
- **30 production-browser cases passed**, 0 failures/skips/flaky results, across desktop 1366×768, touch portrait 360×800 and touch landscape 800×360 (13m06s). [Per-case summary](artifacts/fireworm-impact/browser-summary.json).

```sh
DRAGON_CHESS_ARTIFACTS=/workspace/dragon-chess-artifacts/impact-final npx playwright test e2e/fireworm.spec.js e2e/fireworm_refinement.spec.js e2e/fireworm_impact.spec.js --config=/workspace/dragon-chess-playwright.config.mjs --project=chromium --project=phone-360-portrait --project=phone-landscape --workers=2 --grep 'faces Fireworm|moved rook capture, rotate|isolated proof|actual moved Flamehuffer|board remains visibly dimmed|cold artwork|leaving while art'
```

The new two browser cases each exercise four full board/arena × Normal/Fast sequences. Source heading tests cover facing; their screenshots retain the rendered orientation for inspection. The fire-pixel assertion checks an interior chest region after recoil at peak impact (>20% orange fire), then checks that it has cleared during the visible defeated hold (<5%). Unit assertions separately protect full defender opacity during that hold and the later fade.

Existing cases cover natural completion, touch/keyboard Skip, abort/menu/new-game, Undo/recapture, live-board dimming, rotation, Fast/Instant/reduced motion and cold readiness/cancellation. The page-error guard, phase/turn/input-lock and one-canvas assertions remain intact.

Production runtime: Vite preview, system Chromium, software WebGL. Raw HTML reports and traces remain under `/workspace/dragon-chess-artifacts/impact-final/`; selected media and compact results are retained here. The 390px/tablet projects and unrelated browser suites were not rerun locally. No physical-phone performance result is claimed.

The orientation proof first failed for both missing native-heading values. The rendered foreground-fire check failed against the unchanged PR #14 production build: **0%** of the sampled opaque chest region contained orange fire (required >20%). After the layering change, the phone pilot passed both defender cases in all four board/arena × Normal/Fast combinations. Neither source connectivity nor fire pixels establish owner acceptance of anatomy or spectacle.

An initial test invocation selected no cases because its title expression was anchored incorrectly; the next setup attempt stalled while auto-waiting for a dynamically imported proof under a paused clock. Matching the title and using the existing non-waiting readiness-count pattern allowed the intended baseline assertion to execute. These setup failures are not counted as product regressions or passes. Baseline red artifacts remain under `/workspace/dragon-chess-artifacts/impact-red` and pilot artifacts under `impact-pilot`.

## CE review

The bounded task followed the existing plan and current owner feedback through native inline `ce-work`, simplification and `ce-code-review`. [Completed focused review](artifacts/fireworm-impact/ce-code-review.json), [metadata](artifacts/fireworm-impact/ce-code-review-metadata.json): correctness/standards/requirements inspection plus a separate local adversarial read found **no actionable findings**. Its code-review verdict grants no permission to merge or deploy; this remains a draft with owner acceptance pending.

Only the same-family Codex CLI was installed; no independent cross-model review is claimed. No justified review finding remains unresolved. Final reconciliation preserves R1/R3–R6 and the accepted board default; the owner-directed layering/facing follow-up fulfils R2 in source and retains R7 evidence without claiming physical-phone acceptance.

## Owner visual acceptance — NOT RUN / NOT ACCEPTED

Technical verification and agent inspection do not approve the final depiction or motion. The owner still needs to watch full Normal/Fast captures for **both** the pawn and Flamehuffer, in portrait/landscape and board/arena. Judge facing, readable arrival, the blast visibly surrounding/engulfing the body, dissipation, soot-covered comic defeat, retained colourful fireworks, transitions and repetition comfort. Physical iOS Safari/Android Chrome, bars/safe areas, high density, rotation and reduced-motion comfort remain acceptance work. No physical-device frame-rate or memory result is claimed.

Full-roster art, new defender poses, audio, chess-rule changes and deployment remain outside this pass. The short crossfades and remaining temporary characters are inherited prototype limitations.
