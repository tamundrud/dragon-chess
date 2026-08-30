#!/usr/bin/env python3
"""Run a sequence of bounded Codex tickets with fresh context per ticket.

Version 1 intentionally does only four things:
1. reads a local JSON run plan;
2. invokes a fresh `codex exec` process for each ticket;
3. runs deterministic repository verification;
4. commits each successful ticket as a coherent Git commit.

It stops immediately on agent failure, verification failure, an unexpected dirty
working tree, or a ticket that produces no repository changes.
"""

from __future__ import annotations

import argparse
import json
import os
import shlex
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from fnmatch import fnmatch


@dataclass(frozen=True)
class Ticket:
    ticket_id: str
    title: str
    instructions: str
    model: str
    effort: str
    allowed_paths: tuple[str, ...]


def run_command(
    args: list[str] | str,
    *,
    cwd: Path,
    check: bool = True,
    capture: bool = False,
    stdin_text: str | None = None,
    shell: bool = False,
) -> subprocess.CompletedProcess[str]:
    printable = args if isinstance(args, str) else " ".join(shlex.quote(a) for a in args)
    print(f"\n$ {printable}", flush=True)
    result = subprocess.run(
        args,
        cwd=cwd,
        check=False,
        text=True,
        input=stdin_text,
        capture_output=capture,
        shell=shell,
    )
    if check and result.returncode != 0:
        if capture:
            if result.stdout:
                print(result.stdout, file=sys.stdout)
            if result.stderr:
                print(result.stderr, file=sys.stderr)
        raise RuntimeError(f"Command failed with exit code {result.returncode}: {printable}")
    return result


def git_output(repo: Path, *args: str) -> str:
    result = run_command(["git", *args], cwd=repo, capture=True)
    return result.stdout.strip()


def ensure_clean(repo: Path) -> None:
    status = git_output(repo, "status", "--porcelain")
    if status:
        raise RuntimeError(
            "Working tree is not clean. Commit, stash, or discard changes before starting.\n"
            + status
        )


def read_plan(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RuntimeError(f"Run plan not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Invalid JSON in {path}: {exc}") from exc


def parse_tickets(plan: dict[str, Any]) -> list[Ticket]:
    tickets: list[Ticket] = []
    for raw in plan.get("tickets", []):
        worker = raw.get("worker", "codex")
        if worker != "codex":
            raise RuntimeError(
                f"Unsupported worker {worker!r} for {raw.get('id', '<unknown>')}. "
                "Runner v1 supports only Codex."
            )
        tickets.append(
            Ticket(
                ticket_id=raw["id"],
                title=raw["title"],
                instructions=raw["instructions"],
                model=raw["model"],
                effort=raw.get("effort", "medium"),
                allowed_paths=tuple(raw.get("allowed_paths", [])),
            )
        )
    if not tickets:
        raise RuntimeError("Run plan contains no tickets.")
    return tickets


def build_prompt(ticket: Ticket, contract_path: str) -> str:
    return f"""You are implementing exactly one bounded ticket in an existing repository.

Ticket: {ticket.ticket_id} — {ticket.title}

Before editing:
1. Read AGENTS.md and obey it.
2. Read {contract_path} for branch-level intent and non-goals.
3. Inspect the current repository state. Previous tickets may already have changed it.

Task:
{ticket.instructions}

Rules:
- Implement only this ticket. Do not start later tickets.
- Preserve the architecture and invariants in AGENTS.md.
- Do not commit, push, open a PR, or change branches; the local runner owns Git workflow.
- Run focused tests/checks if useful while implementing.
- Leave the working tree containing only the coherent changes required for this ticket.
- If the ticket cannot be completed safely, make no speculative broad changes and explain the blocker.
"""


def invoke_codex(repo: Path, ticket: Ticket, prompt: str, log_dir: Path) -> None:
    log_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    log_path = log_dir / f"{stamp}-{ticket.ticket_id}.log"

    cmd = [
        "codex",
        "exec",
        "--ephemeral",
        "--sandbox",
        "workspace-write",
        "--color",
        "never",
        "--model",
        ticket.model,
        "-c",
        f'model_reasoning_effort="{ticket.effort}"',
        "-",
    ]
    print(
        f"\n=== {ticket.ticket_id}: {ticket.title} "
        f"[{ticket.model}, effort={ticket.effort}] ===",
        flush=True,
    )
    print(f"Agent log: {log_path}", flush=True)

    with log_path.open("w", encoding="utf-8") as log_file:
        process = subprocess.Popen(
            cmd,
            cwd=repo,
            text=True,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            bufsize=1,
        )
        assert process.stdin is not None
        assert process.stdout is not None
        process.stdin.write(prompt)
        process.stdin.close()

        for line in process.stdout:
            print(line, end="")
            log_file.write(line)

        returncode = process.wait()

    if returncode != 0:
        raise RuntimeError(
            f"Codex failed for {ticket.ticket_id} with exit code {returncode}. "
            f"See {log_path}."
        )


def validate_changed_paths(repo: Path, ticket: Ticket) -> None:
    changed = [
        line
        for line in git_output(repo, "status", "--porcelain").splitlines()
        if line.strip()
    ]
    if not changed:
        raise RuntimeError(
            f"{ticket.ticket_id} completed without producing repository changes."
        )

    paths: list[str] = []
    for line in changed:
        # Porcelain v1: two status columns, a space, then path. Renames use "old -> new".
        raw_path = line[3:] if len(line) >= 4 else line
        if " -> " in raw_path:
            raw_path = raw_path.split(" -> ", 1)[1]
        paths.append(raw_path)

    if not ticket.allowed_paths:
        return

    unexpected = [
        path
        for path in paths
        if not any(fnmatch(path, pattern) for pattern in ticket.allowed_paths)
    ]
    if unexpected:
        raise RuntimeError(
            f"{ticket.ticket_id} changed paths outside its allowed boundary: "
            + ", ".join(unexpected)
        )


def run_verification(repo: Path, commands: list[str]) -> None:
    print("\n=== Deterministic verification ===", flush=True)
    for command in commands:
        run_command(command, cwd=repo, shell=True)


def commit_ticket(repo: Path, ticket: Ticket) -> str:
    status = git_output(repo, "status", "--porcelain")
    if not status:
        raise RuntimeError(
            f"{ticket.ticket_id} completed without producing repository changes."
        )

    run_command(["git", "add", "-A"], cwd=repo)
    staged = git_output(repo, "diff", "--cached", "--name-only")
    if not staged:
        raise RuntimeError(f"{ticket.ticket_id} has no staged changes to commit.")

    message = f"{ticket.ticket_id}: {ticket.title}"
    run_command(["git", "commit", "-m", message], cwd=repo)
    sha = git_output(repo, "rev-parse", "--short", "HEAD")
    print(f"Committed {ticket.ticket_id} as {sha}", flush=True)
    return sha


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--config",
        default=".agent/run.json",
        help="Path to run plan JSON relative to repository root.",
    )
    parser.add_argument(
        "--from-ticket",
        help="Start at this ticket ID, skipping earlier tickets in the plan.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the resolved plan and prompts without invoking Codex or changing Git.",
    )
    args = parser.parse_args()

    repo = Path(
        git_output(Path.cwd(), "rev-parse", "--show-toplevel")
    ).resolve()
    config_path = (repo / args.config).resolve()
    plan = read_plan(config_path)
    tickets = parse_tickets(plan)

    expected_branch = plan.get("branch")
    current_branch = git_output(repo, "branch", "--show-current")
    if expected_branch and current_branch != expected_branch:
        raise RuntimeError(
            f"Run plan expects branch {expected_branch!r}, but current branch is "
            f"{current_branch!r}."
        )

    contract_path = plan.get("contract", ".agent/branch-contract.md")
    verification = plan.get(
        "verification",
        ["npm run test", "npm run typecheck", "npm run lint", "npm run build"],
    )

    if args.from_ticket:
        ids = [ticket.ticket_id for ticket in tickets]
        if args.from_ticket not in ids:
            raise RuntimeError(f"Unknown --from-ticket ID: {args.from_ticket}")
        tickets = tickets[ids.index(args.from_ticket) :]

    print(f"Repository: {repo}")
    print(f"Branch: {current_branch}")
    print(f"Tickets: {', '.join(t.ticket_id for t in tickets)}")

    if args.dry_run:
        for ticket in tickets:
            print("\n" + "-" * 72)
            print(
                f"{ticket.ticket_id}: {ticket.title} "
                f"[{ticket.model}, effort={ticket.effort}]"
            )
            print(build_prompt(ticket, contract_path))
        return 0

    ensure_clean(repo)
    run_command(["codex", "--version"], cwd=repo)

    log_dir = repo / ".agent" / "runs"

    for ticket in tickets:
        ensure_clean(repo)
        prompt = build_prompt(ticket, contract_path)
        invoke_codex(repo, ticket, prompt, log_dir)
        validate_changed_paths(repo, ticket)
        run_verification(repo, verification)
        commit_ticket(repo, ticket)
        ensure_clean(repo)

    print("\n=== Run complete ===")
    print(f"Completed {len(tickets)} ticket(s).")
    print(f"HEAD: {git_output(repo, 'rev-parse', '--short', 'HEAD')}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, KeyError) as exc:
        print(f"\nERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
