# Local Agent Runner Pilot

This branch contains a deliberately small first version of a local agent orchestrator.

## What v1 proves

- one ticket = one fresh Codex process;
- model and reasoning effort are selected per ticket;
- Codex edits only the working tree;
- the runner, not Codex, owns verification and commits;
- ticket path boundaries are checked before verification;
- failures stop the run instead of being silently carried into the next ticket.

The pilot intentionally does **not** integrate Linear, Claude, browser QA, parallel workers,
pushes, pull requests, or automatic merges.

## Prerequisites

From the repository root:

```bash
git switch agent-runner-pilot
git status --short
codex --version
node --version
npm --version
```

The working tree must be clean before the runner starts. Install dependencies if needed
without creating a package-lock file in this Bun-lock-based repository:

```bash
npm install --package-lock=false
```

Confirm Codex is authenticated using the normal local Codex/ChatGPT sign-in flow.

## Inspect the planned run without spending model usage

```bash
python3 scripts/branch_runner.py --dry-run
```

The checked-in `.agent/run.json` contains two low-risk smoke-test tickets.

## Execute the pilot

```bash
python3 scripts/branch_runner.py
```

For each ticket the runner:

1. verifies the working tree is clean;
2. starts a new ephemeral `codex exec` process;
3. gives it the ticket plus `.agent/branch-contract.md`;
4. checks that only the ticket's allowed paths changed;
5. runs `npm run test`, `npm run typecheck`, `npm run lint`, and `npm run build`;
6. commits the ticket;
7. starts the next ticket in another fresh Codex process.

Agent output is written to `.agent/runs/`, which is ignored by Git.

## Recovery

The runner stops on the first failure and does not auto-discard the working tree. Inspect the
changes and logs before deciding what to do.

After fixing or reverting the failed ticket, resume at a specific ticket with:

```bash
python3 scripts/branch_runner.py --from-ticket RUNNER-002
```

This is intentionally conservative. Automatic repair/retry behavior belongs in a later version
after the basic state transitions are proven reliable.
