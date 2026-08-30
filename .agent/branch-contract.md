# Agent Runner Pilot — Branch Contract

## Goal

Validate a local, sequential agent-development runner in the Dragon Chess repository.

The pilot must prove that two bounded tickets can be executed without carrying conversation
context from one ticket to the next. Each ticket is handled by a fresh `codex exec` process,
then verified deterministically and committed by the runner.

## Acceptance criteria

1. `RUNNER-001` adds an aggregate `npm run check` script without changing dependencies or application code.
2. `RUNNER-002` documents the aggregate command in the README without changing product behavior.
3. Each ticket runs in a separate ephemeral Codex execution.
4. The runner executes the repository test, typecheck, lint, and build commands after each ticket.
5. The runner creates one coherent Git commit per successful ticket.
6. The runner stops rather than committing when Codex fails, verification fails, or a ticket changes files outside its declared path boundary.

## Non-goals

- No gameplay changes.
- No Phaser, React, chess rules, animation, or UI changes.
- No Linear integration yet.
- No Claude review yet.
- No parallel agents yet.
- No automatic push, PR creation, or merge.

## Pilot decision rule

If this smoke test succeeds, the next stage is to replace the embedded JSON ticket list with
Linear-sourced tickets and add Claude as a branch-level review/remediation gate. Parallel
execution comes later.
