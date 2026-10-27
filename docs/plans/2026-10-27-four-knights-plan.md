---
title: Four Knight Battle Scenes - Plan
type: feat
date: 2026-10-27
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-plan-bootstrap
---
# Four Knight Battle Scenes - Plan

## Goal Capsule
Deliver four distinctive knight capture scenes for visual acceptance while preserving legal chess and the approved Fireworm benchmark.

## Product Contract
### Problem Frame
Only Fireworm has an approved illustrated battle scene; the other approved knight identities currently use provisional generic or Fire Dragon presentation.

### Requirements
- R1. Implement Windwalker, One Eye, Driller-Dragon and Poisonous Piffleworm with original, expressive, connected illustrations and distinct flight, pounce, drill and poison sequences. Follow `docs/CHARACTER_ROSTER.md`, `docs/ART_DIRECTION.md` and `docs/FIREWORM_BENCHMARK.md`.
- R2. Preserve both factions, actual defender identity, board and arena presentation, orientations, resize, speed, reduced motion, skip, abort and single authoritative commit.
- R3. Provide automated lifecycle and gameplay coverage and mobile recordings for every character. Leave visual acceptance to the owner.
- R4. Deliver a reviewed draft PR against fetched main without merge or deployment; stop after this batch.

## Planning Contract
Use persistent piece identity to route each starting knight and deterministic same-class promotion. Share lifecycle, staging and cleanup, but give each character individual choreography and original artwork. Keep Fireworm unchanged. Reuse the existing defender resolver and board-space origins where applicable. The arena remains optional. No changes to chess rules.

## Implementation Units
1. Produce original character poses and provenance; inspect silhouettes and isolation. Add identities and attack definitions. Test initial assignment, movement, undo and promotion.
2. Build shared scene lifecycle and four distinct attack sequences with expressive anticipation, impact, reaction and return. Test completion, cancellation, orientations, defender types, resize and settings through existing interfaces.
3. Exercise real legal captures in browser, record each sequence at phone sizes, inspect results and complete CE adversarial review. Resolve actionable findings and run the repository checks before draft delivery.

## Verification Contract
Run unit tests, typecheck, lint, production build, runtime preview and appropriate Playwright tests with desktop, portrait and landscape. Capture mobile recordings for all four; inspect motion as well as still frames. Verify chess state and cleanup after completion, Skip and abort, including changed destination on resize. Document browser and device limitations; owner acceptance and physical-device checks remain separate.

## Definition of Done
All four attacks are reachable through normal play, tests pass, mobile recordings and review evidence are linked in the draft PR, and remaining acceptance gates are explicit. No merge, deployment or further characters.
