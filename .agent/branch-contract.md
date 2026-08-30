# Agent Runner Pilot — Branch Contract

## Goal

Validate a local, sequential, interruption-safe agent-development runner in the Dragon Chess
repository. The runner is the durable workflow authority; Codex and Claude are disposable
workers whose conversation history is never a recovery dependency.

The pilot must prove that two bounded tickets can be executed in isolated worktrees without
carrying conversation context from one ticket to the next. The runner alone validates, verifies,
commits, integrates, removes successful worktrees, and promotes complete review artifacts.

## Acceptance criteria

1. `RUNNER-001` adds an aggregate `npm run check` script without changing dependencies or application code.
2. `RUNNER-002` documents the aggregate command in the README without changing product behavior.
3. Each ticket starts from the clean integration `HEAD` in a separate detached temporary worktree
   and a fresh ephemeral Codex execution.
4. Codex never commits, pushes, changes branches, or manages worktrees.
5. The runner validates allowed paths and executes repository test, typecheck, lint, and build
   commands after each ticket.
6. The runner creates one coherent commit in the ticket worktree, fast-forwards the integration
   branch, and removes the worktree only after successful integration.
7. Interrupted Codex work is preserved unchanged with durable paused state and can be resumed in
   the same worktree by a fresh Codex session.
8. `--resume` reconstructs progress from durable state, Git, and registered worktrees rather than
   agent conversation history.
9. Claude review scaffolding never promotes partial output: only a complete valid review for the
   current integration SHA becomes authoritative.
10. Interrupted or usage-limited Claude review retains diagnostics only, pauses durably, and
    restarts the whole review from scratch on resume.

## Non-goals

- No gameplay changes.
- No Phaser, React, chess rules, animation, or UI changes.
- No Linear integration yet.
- No automated Claude remediation loop yet; only the transactional review boundary is scaffolded.
- No parallel agents yet.
- No remote push, PR creation, or merging the integration branch into another branch.

## Pilot decision rule

If this smoke test succeeds, later stages may replace the embedded ticket list with Linear-sourced
tickets and add automated review triage/remediation. Browser QA, remote Git operations, and
parallel execution remain separate later decisions.
