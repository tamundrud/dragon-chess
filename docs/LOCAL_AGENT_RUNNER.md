# Local Agent Runner Pilot

This branch contains a deliberately local, sequential pilot for a recoverable agent workflow.
The Python runner is the durable authority; Codex and Claude are disposable worker processes.

## What the revised pilot proves

- one implementation ticket = one detached temporary Git worktree;
- every Codex attempt starts with fresh conversation context;
- Codex edits files but never owns commits, branches, integration, pushes, or worktrees;
- the runner validates allowed paths and runs the repository's deterministic verification gate;
- the runner commits inside the ticket worktree, fast-forwards the clean integration branch,
  and removes the worktree only after successful integration;
- an interrupted Codex attempt leaves its ticket worktree untouched and records a durable pause;
- `--resume` reconstructs progress from `.agent/state.json`, Git, and registered worktrees;
- Claude review output is temporary until the complete structured result is validated and
  atomically promoted for the exact integration `HEAD`.

The pilot remains intentionally sequential and local. It does **not** integrate Linear, run
browser QA, execute tickets in parallel, push, open pull requests, or merge to another branch.
The checked-in review configuration is scaffolding and is disabled for the two smoke tickets.

## Durable artifacts

The runner keeps three different kinds of durable progress:

| Concern | Durable source |
|---|---|
| Implementation bytes | the active ticket worktree or an integrated Git commit |
| Workflow position | `.agent/state.json` |
| Completed independent review | `.agent/reviews/review.json` |

Runtime state, review artifacts, and diagnostic logs are ignored by Git. The configuration,
branch contract, review schema, runner, and this documentation are tracked.

The state machine recognizes these explicit statuses:

```text
READY
IMPLEMENTING
VERIFYING
PAUSED_CODEX_USAGE
PAUSED_CLAUDE_USAGE
IMPLEMENTATION_COMPLETE
REVIEWING
REMEDIATING
RE_REVIEWING
NEEDS_HUMAN
READY_FOR_ACCEPTANCE
FAILED
```

`REMEDIATING` and `RE_REVIEWING` reserve the branch-review loop boundary. Automated review
triage/remediation is outside this smoke pilot; a valid review containing findings stops at
`NEEDS_HUMAN` with the authoritative artifact preserved.

## Prerequisites

From the clean integration checkout:

```bash
git switch agent-runner-pilot
git status --short
codex --version
node --version
npm --version
```

Install dependencies if needed without creating a package-lock file in this Bun-lock-based
repository:

```bash
npm install --package-lock=false
```

Confirm Codex is authenticated using the normal local Codex/ChatGPT sign-in flow. Claude is
needed only if `.agent/run.json` is deliberately changed to enable the review stage.

## Inspect the run without model usage

```bash
python3 scripts/branch_runner.py --dry-run
```

Dry-run mode prints the resolved ticket order, isolated worktree paths, model settings, prompts,
and review setting. It does not create state, worktrees, commits, or model sessions.

The checked-in `.agent/run.json` retains two harmless smoke-test tickets:

1. `RUNNER-001` adds the aggregate `npm run check` script.
2. `RUNNER-002` documents that command in the README.

## Execute the pilot

```bash
python3 scripts/branch_runner.py
```

For each ticket the runner:

1. confirms the integration branch and working tree match durable state;
2. records `IMPLEMENTING`, including the base SHA and intended worktree path;
3. creates a detached worktree from the current clean integration `HEAD`;
4. invokes a fresh ephemeral Codex session in that worktree;
5. verifies Codex did not change `HEAD` or attach/switch a branch;
6. validates all changed paths against the ticket boundary;
7. records `VERIFYING` and runs test, typecheck, lint, and build;
8. stages and commits the ticket in the detached worktree;
9. fast-forwards `agent-runner-pilot` to that exact commit;
10. removes the clean ticket worktree and records the ticket as completed.

By default, worktrees are siblings of the integration checkout under:

```text
../.agent-worktrees/dragon-chess/dragon-chess-agent-runner-pilot/<ticket-id>/
```

The checked-in `worktree_shared_paths` setting creates an ignored `node_modules/` directory in
each worktree whose top-level entries link to the integration checkout's installed dependencies.
This keeps the existing deterministic verification commands intact without reinstalling
dependencies for every ticket. The runner refuses to start a ticket if the documented dependency
prerequisite has not been completed.

Diagnostic output is retained under `.agent/runs/codex/`.

## Codex interruption and recovery

If Codex exits because of a detected usage/rate limit or an interrupt signal, the runner:

- does not validate, stage, commit, reset, clean, or remove the ticket worktree;
- records `PAUSED_CODEX_USAGE` plus the active ticket, worktree, and base SHA;
- exits with code `2`.

Resume later with:

```bash
python3 scripts/branch_runner.py --resume
```

The new Codex process receives no prior conversation. It is told to inspect the preserved diff
and complete the ticket using that filesystem state as its checkpoint.

The same resume command handles runner/computer interruption windows. It checks whether the
worktree still contains uncommitted edits, a runner-owned ticket commit is waiting to integrate,
or the integration branch already reached that commit before state persistence finished. Before
creating a commit, the runner records a durable commit-intent marker; a clean commit found without
that marker is treated as agent-owned or otherwise unexpected and is never integrated
automatically. Recovery never infers progress from an agent transcript.

Non-usage Codex failures also preserve the worktree and record `FAILED`. A deliberate `--resume`
starts a fresh Codex session in that same worktree so it can inspect and correct the remaining
work after the operator has reviewed the failure. An allowed-path violation stops at
`NEEDS_HUMAN`; no out-of-bound change is committed.

## Transactional Claude review scaffolding

To exercise the stage, first review the local Claude command and set `review.enabled` to `true`
in `.agent/run.json`. After all tickets integrate, the runner records `IMPLEMENTATION_COMPLETE`
and invokes a non-persistent Claude session in read-only plan mode against the complete branch
diff.

Claude must return a single JSON object conforming to `.agent/review-schema.json`. Output is
first written to:

```text
.agent/reviews/review.tmp.json
```

The runner promotes it atomically to `.agent/reviews/review.json` only when all of these are true:

1. Claude exits successfully.
2. The output parses and contains every required field.
3. `complete` is exactly `true`.
4. `reviewed_sha` exactly matches the current integration `HEAD`.
5. Claude left both Git `HEAD` and the integration working tree unchanged.

A usage-limited, interrupted, truncated, or incomplete review leaves only a timestamped
diagnostic log, removes the temporary artifact, and records `PAUSED_CLAUDE_USAGE`. On `--resume`,
the runner starts a completely fresh branch review; it never continues or promotes partial
findings. A valid passing review reaches `READY_FOR_ACCEPTANCE`. A valid review with findings is
authoritative but stops at `NEEDS_HUMAN` because automatic remediation is not part of this pilot.

## Safety boundaries

- Do not run two copies of the runner for the same state file.
- Do not move the integration branch while a ticket is active.
- Do not delete or manually reset a paused worktree before deciding whether its edits matter.
- Do not edit `.agent/run.json` after a run starts; its digest is stored in durable state.
- The runner never pushes, creates a PR, merges into another branch, or updates Linear.

When a run reaches `READY_FOR_ACCEPTANCE`, it is complete for this pilot. Human product review,
PR creation, and merge remain explicit later actions.
