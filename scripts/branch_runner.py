#!/usr/bin/env python3
"""Run bounded Codex tickets through isolated worktrees and durable state.

The runner is the workflow authority. Codex and Claude are disposable workers:
Codex may edit only its ticket worktree, while Claude may only review. Git commits,
integration, verification, recovery, and review promotion are runner-owned.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shlex
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from fnmatch import fnmatch
from pathlib import Path
from typing import Any


class Status(str, Enum):
    READY = "READY"
    IMPLEMENTING = "IMPLEMENTING"
    VERIFYING = "VERIFYING"
    PAUSED_CODEX_USAGE = "PAUSED_CODEX_USAGE"
    PAUSED_CLAUDE_USAGE = "PAUSED_CLAUDE_USAGE"
    IMPLEMENTATION_COMPLETE = "IMPLEMENTATION_COMPLETE"
    REVIEWING = "REVIEWING"
    REMEDIATING = "REMEDIATING"
    RE_REVIEWING = "RE_REVIEWING"
    NEEDS_HUMAN = "NEEDS_HUMAN"
    READY_FOR_ACCEPTANCE = "READY_FOR_ACCEPTANCE"
    FAILED = "FAILED"


ALLOWED_TRANSITIONS: dict[Status, set[Status]] = {
    Status.READY: {Status.IMPLEMENTING, Status.IMPLEMENTATION_COMPLETE, Status.FAILED},
    Status.IMPLEMENTING: {
        Status.VERIFYING,
        Status.PAUSED_CODEX_USAGE,
        Status.NEEDS_HUMAN,
        Status.FAILED,
    },
    Status.VERIFYING: {
        Status.READY,
        Status.IMPLEMENTING,
        Status.NEEDS_HUMAN,
        Status.FAILED,
    },
    Status.PAUSED_CODEX_USAGE: {Status.IMPLEMENTING, Status.FAILED},
    Status.IMPLEMENTATION_COMPLETE: {
        Status.REVIEWING,
        Status.READY_FOR_ACCEPTANCE,
        Status.FAILED,
    },
    Status.REVIEWING: {
        Status.PAUSED_CLAUDE_USAGE,
        Status.NEEDS_HUMAN,
        Status.READY_FOR_ACCEPTANCE,
        Status.FAILED,
    },
    Status.PAUSED_CLAUDE_USAGE: {
        Status.REVIEWING,
        Status.RE_REVIEWING,
        Status.FAILED,
    },
    Status.REMEDIATING: {
        Status.VERIFYING,
        Status.PAUSED_CODEX_USAGE,
        Status.NEEDS_HUMAN,
        Status.FAILED,
    },
    Status.RE_REVIEWING: {
        Status.PAUSED_CLAUDE_USAGE,
        Status.NEEDS_HUMAN,
        Status.READY_FOR_ACCEPTANCE,
        Status.FAILED,
    },
    Status.NEEDS_HUMAN: {
        Status.READY,
        Status.IMPLEMENTING,
        Status.REMEDIATING,
        Status.RE_REVIEWING,
        Status.FAILED,
    },
    Status.FAILED: {
        Status.IMPLEMENTING,
        Status.REVIEWING,
        Status.RE_REVIEWING,
        Status.FAILED,
    },
    Status.READY_FOR_ACCEPTANCE: set(),
}

USAGE_LIMIT_PATTERN = re.compile(
    r"(?:you(?:'ve| have)?\s+(?:hit|reached)\s+(?:your\s+)?usage limit)"
    r"|(?:(?:usage|rate)[ -]?limit\s+(?:reached|exceeded))"
    r"|(?:quota\s+(?:reached|exceeded|exhausted))"
    r"|(?:too many requests|resource exhausted|http\s*429|try again\s+(?:at|later))",
    re.IGNORECASE | re.DOTALL,
)
INTERRUPTED_RETURN_CODES = {124, 130, 137, 143}


class RunPaused(RuntimeError):
    """A disposable worker stopped and durable state is ready for --resume."""


@dataclass(frozen=True)
class Ticket:
    ticket_id: str
    title: str
    instructions: str
    model: str
    effort: str
    allowed_paths: tuple[str, ...]


@dataclass(frozen=True)
class WorkerResult:
    returncode: int
    stdout: str
    stderr: str

    @property
    def usage_limited(self) -> bool:
        combined = f"{self.stdout}\n{self.stderr}"
        return bool(USAGE_LIMIT_PATTERN.search(combined))

    @property
    def interrupted(self) -> bool:
        return self.returncode < 0 or self.returncode in INTERRUPTED_RETURN_CODES


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def run_command(
    args: list[str],
    *,
    cwd: Path,
    check: bool = True,
    capture: bool = False,
    stdin_text: str | None = None,
) -> subprocess.CompletedProcess[str]:
    printable = " ".join(shlex.quote(arg) for arg in args)
    print(f"\n$ {printable}", flush=True)
    result = subprocess.run(
        args,
        cwd=cwd,
        check=False,
        text=True,
        input=stdin_text,
        capture_output=capture,
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


def git_head(repo: Path) -> str:
    return git_output(repo, "rev-parse", "HEAD")


def git_status(repo: Path) -> str:
    return git_output(repo, "status", "--porcelain")


def ensure_clean(repo: Path, label: str = "Integration working tree") -> None:
    status = git_status(repo)
    if status:
        raise RuntimeError(f"{label} is not clean:\n{status}")


def ensure_integration_branch(repo: Path, expected_branch: str) -> None:
    current_branch = git_output(repo, "branch", "--show-current")
    if current_branch != expected_branch:
        raise RuntimeError(
            f"Run plan expects integration branch {expected_branch!r}, but current branch is "
            f"{current_branch!r}."
        )


def read_plan(path: Path) -> dict[str, Any]:
    try:
        plan = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RuntimeError(f"Run plan not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Invalid JSON in {path}: {exc}") from exc
    if not isinstance(plan, dict):
        raise RuntimeError(f"Run plan must contain a JSON object: {path}")
    return plan


def config_digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parse_tickets(plan: dict[str, Any]) -> list[Ticket]:
    tickets: list[Ticket] = []
    seen: set[str] = set()
    for raw in plan.get("tickets", []):
        worker = raw.get("worker", "codex")
        if worker != "codex":
            raise RuntimeError(
                f"Unsupported worker {worker!r} for {raw.get('id', '<unknown>')}. "
                "This pilot supports Codex implementation tickets only."
            )
        ticket_id = raw["id"]
        if ticket_id in seen:
            raise RuntimeError(f"Duplicate ticket ID in run plan: {ticket_id}")
        seen.add(ticket_id)
        tickets.append(
            Ticket(
                ticket_id=ticket_id,
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


def safe_repo_path(repo: Path, raw_path: str, label: str) -> Path:
    path = (repo / raw_path).resolve()
    try:
        path.relative_to(repo)
    except ValueError as exc:
        raise RuntimeError(f"{label} must stay inside the repository: {raw_path}") from exc
    return path


def sanitize(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip("-.")
    if not cleaned:
        raise RuntimeError(f"Cannot derive a safe path component from {value!r}")
    return cleaned


class StateStore:
    def __init__(self, path: Path):
        self.path = path

    def exists(self) -> bool:
        return self.path.exists()

    def load(self) -> dict[str, Any]:
        try:
            state = json.loads(self.path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise RuntimeError(f"Runner state not found: {self.path}") from exc
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"Runner state is invalid JSON: {exc}") from exc
        try:
            Status(state["status"])
        except (KeyError, ValueError) as exc:
            raise RuntimeError("Runner state has an unknown or missing status.") from exc
        return state

    def save(self, state: dict[str, Any]) -> None:
        state["updated_at"] = utc_now()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary = self.path.with_suffix(self.path.suffix + ".tmp")
        temporary.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")
        os.replace(temporary, self.path)

    def transition(
        self,
        state: dict[str, Any],
        target: Status,
        *,
        error: str | None = None,
    ) -> None:
        current = Status(state["status"])
        if target != current and target not in ALLOWED_TRANSITIONS[current]:
            raise RuntimeError(f"Invalid runner transition: {current.value} -> {target.value}")
        state["status"] = target.value
        state["last_error"] = error
        self.save(state)


def initial_state(
    *,
    plan: dict[str, Any],
    config_path: Path,
    repo: Path,
) -> dict[str, Any]:
    head = git_head(repo)
    return {
        "schema_version": 1,
        "run_id": plan.get("run_id", "local-agent-runner"),
        "config_path": str(config_path.relative_to(repo)),
        "config_sha256": config_digest(config_path),
        "branch": plan["branch"],
        "run_base_sha": head,
        "integration_head": head,
        "status": Status.READY.value,
        "completed_tickets": [],
        "ticket_commits": {},
        "active_ticket": None,
        "active_worktree": None,
        "active_base_sha": None,
        "commit_intent": False,
        "pending_commit": None,
        "reviewed_sha": None,
        "review_cycle": 0,
        "authoritative_review": None,
        "last_error": None,
        "created_at": utc_now(),
        "updated_at": utc_now(),
    }


def validate_state(
    state: dict[str, Any],
    *,
    plan: dict[str, Any],
    config_path: Path,
    repo: Path,
) -> None:
    if state.get("schema_version") != 1:
        raise RuntimeError("Unsupported runner state schema version.")
    if state.get("branch") != plan.get("branch"):
        raise RuntimeError("Runner state branch does not match the run plan.")
    if state.get("config_sha256") != config_digest(config_path):
        raise RuntimeError(
            "Run configuration changed after state was created. Restore the original config "
            "or start a separately identified run."
        )
    completed = state.get("completed_tickets")
    if not isinstance(completed, list) or len(completed) != len(set(completed)):
        raise RuntimeError("Runner state has invalid completed_tickets data.")
    planned_ids = {ticket.ticket_id for ticket in parse_tickets(plan)}
    if not set(completed).issubset(planned_ids):
        raise RuntimeError("Runner state references a completed ticket not present in the plan.")
    if not isinstance(state.get("commit_intent"), bool):
        raise RuntimeError("Runner state has invalid commit_intent data.")
    ensure_integration_branch(repo, state["branch"])


def build_codex_prompt(ticket: Ticket, contract_path: str, *, resume: bool) -> str:
    recovery = (
        "This is a fresh Codex session resuming an interrupted ticket. Treat the existing "
        "worktree contents as the only checkpoint: inspect the current diff, determine what "
        "is complete, and finish or correct the ticket. Do not rely on prior conversation history."
        if resume
        else "This is a fresh Codex session for a new ticket."
    )
    return f"""You are implementing exactly one bounded ticket in an isolated Git worktree.

Ticket: {ticket.ticket_id} — {ticket.title}

Before editing:
1. Read AGENTS.md completely and obey it.
2. Read {contract_path} for branch-level intent and non-goals.
3. Inspect the current files and Git diff. Previous ticket commits are already in the base.

Recovery context:
{recovery}

Task:
{ticket.instructions}

Rules:
- Implement only this ticket. Do not start later tickets.
- Preserve the architecture and invariants in AGENTS.md.
- You may inspect Git state, but do not run any Git command that mutates refs, the index,
  branches, commits, remotes, or worktrees. Never commit, push, switch branches, merge,
  reset, restore, clean, stash, or add files to the index. The runner owns all Git changes.
- Run focused tests/checks if useful while implementing; the runner performs the required gate.
- Leave only the coherent filesystem changes required for this ticket.
- If completion is unsafe, avoid speculative broad changes and explain the blocker.
"""


def invoke_codex(
    worktree: Path,
    ticket: Ticket,
    prompt: str,
    log_dir: Path,
) -> WorkerResult:
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / f"{timestamp()}-{sanitize(ticket.ticket_id)}.log"
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
    print(f"Ticket worktree: {worktree}", flush=True)
    print(f"Codex diagnostic log: {log_path}", flush=True)

    process = subprocess.Popen(
        cmd,
        cwd=worktree,
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

    output: list[str] = []
    with log_path.open("w", encoding="utf-8") as log_file:
        for line in process.stdout:
            print(line, end="")
            log_file.write(line)
            output.append(line)
    return WorkerResult(process.wait(), "".join(output), "")


def changed_paths(repo: Path, base_sha: str) -> list[str]:
    paths: set[str] = set()
    commands = [
        ("diff", "--name-only", f"{base_sha}..HEAD"),
        ("diff", "--name-only"),
        ("diff", "--cached", "--name-only"),
        ("ls-files", "--others", "--exclude-standard"),
    ]
    for args in commands:
        output = git_output(repo, *args)
        paths.update(line for line in output.splitlines() if line)
    return sorted(paths)


def validate_changed_paths(repo: Path, ticket: Ticket, base_sha: str) -> list[str]:
    paths = changed_paths(repo, base_sha)
    if not paths:
        raise RuntimeError(
            f"{ticket.ticket_id} completed without producing repository changes."
        )
    if ticket.allowed_paths:
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
    return paths


def ensure_codex_did_not_mutate_git(worktree: Path, base_sha: str) -> None:
    if git_head(worktree) != base_sha:
        raise RuntimeError(
            "Codex changed Git HEAD. The worktree was preserved for human inspection; "
            "the runner will not integrate agent-owned commits."
        )
    if git_output(worktree, "branch", "--show-current"):
        raise RuntimeError("Codex attached or switched the isolated worktree to a branch.")
    if git_output(worktree, "diff", "--cached", "--name-only"):
        raise RuntimeError(
            "Codex changed the Git index. The worktree was preserved; only the runner may stage."
        )


def run_verification(repo: Path, commands: list[str]) -> None:
    print("\n=== Deterministic verification ===", flush=True)
    for command in commands:
        args = shlex.split(command)
        if not args:
            raise RuntimeError("Verification commands may not be empty.")
        run_command(args, cwd=repo)


def commit_ticket(repo: Path, ticket: Ticket, base_sha: str) -> str:
    if git_head(repo) != base_sha:
        raise RuntimeError("Ticket worktree HEAD changed before the runner-owned commit.")
    run_command(["git", "add", "-A"], cwd=repo)
    staged = git_output(repo, "diff", "--cached", "--name-only")
    if not staged:
        raise RuntimeError(f"{ticket.ticket_id} has no staged changes to commit.")
    run_command(["git", "commit", "-m", f"{ticket.ticket_id}: {ticket.title}"], cwd=repo)
    commit_sha = git_head(repo)
    parent_sha = git_output(repo, "rev-parse", "HEAD^")
    if parent_sha != base_sha:
        raise RuntimeError("Runner-owned ticket commit does not have the expected base parent.")
    ensure_clean(repo, "Ticket worktree")
    print(f"Runner committed {ticket.ticket_id} as {commit_sha[:12]}", flush=True)
    return commit_sha


def registered_worktrees(repo: Path) -> set[Path]:
    paths: set[Path] = set()
    for line in git_output(repo, "worktree", "list", "--porcelain").splitlines():
        if line.startswith("worktree "):
            paths.add(Path(line.removeprefix("worktree ")).resolve())
    return paths


def worktree_path(repo: Path, plan: dict[str, Any], ticket: Ticket) -> Path:
    configured_root = plan.get("worktree_root")
    if configured_root:
        root = Path(configured_root)
        if not root.is_absolute():
            root = (repo / root).resolve()
    else:
        root = repo.parent / ".agent-worktrees" / sanitize(repo.name)
    run_id = sanitize(plan.get("run_id", "local-agent-runner"))
    return (root / run_id / sanitize(ticket.ticket_id)).resolve()


def create_ticket_worktree(repo: Path, path: Path, base_sha: str) -> None:
    registered = registered_worktrees(repo)
    if path in registered:
        return
    if path.exists():
        raise RuntimeError(
            f"Worktree path exists but is not registered with Git; refusing to overwrite it: {path}"
        )
    path.parent.mkdir(parents=True, exist_ok=True)
    run_command(["git", "worktree", "add", "--detach", str(path), base_sha], cwd=repo)


def prepare_worktree(repo: Path, path: Path, plan: dict[str, Any]) -> None:
    shared_paths = plan.get("worktree_shared_paths", [])
    if not isinstance(shared_paths, list) or not all(
        isinstance(raw_path, str) and raw_path for raw_path in shared_paths
    ):
        raise RuntimeError("worktree_shared_paths must be a JSON list of relative paths.")
    for raw_path in shared_paths:
        relative = Path(raw_path)
        if relative.is_absolute() or ".." in relative.parts:
            raise RuntimeError(f"Invalid shared worktree path: {raw_path}")
        source = safe_repo_path(repo, raw_path, "Shared worktree source")
        if not source.exists():
            raise RuntimeError(
                f"Shared worktree source does not exist: {source}. "
                "Complete the documented prerequisites in the integration checkout."
            )
        target = path / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if source.is_dir():
            if target.is_symlink() or (target.exists() and not target.is_dir()):
                raise RuntimeError(f"Worktree shared-path target has the wrong type: {target}")
            target.mkdir(exist_ok=True)
            for source_child in source.iterdir():
                target_child = target / source_child.name
                if target_child.is_symlink():
                    if target_child.resolve() != source_child.resolve():
                        raise RuntimeError(
                            f"Worktree shared-path link points elsewhere: {target_child}"
                        )
                    continue
                if target_child.exists():
                    raise RuntimeError(
                        f"Worktree shared-path entry already exists: {target_child}"
                    )
                target_child.symlink_to(
                    source_child, target_is_directory=source_child.is_dir()
                )
        elif target.is_symlink():
            if target.resolve() != source:
                raise RuntimeError(f"Worktree shared-path link points elsewhere: {target}")
        elif target.exists():
            raise RuntimeError(f"Worktree shared-path target already exists: {target}")
        else:
            target.symlink_to(source)


def remove_ticket_worktree(repo: Path, path: Path) -> None:
    if path in registered_worktrees(repo):
        run_command(["git", "worktree", "remove", str(path)], cwd=repo)
    elif path.exists():
        raise RuntimeError(
            f"Ticket worktree is no longer registered but its path still exists: {path}"
        )


def begin_ticket(
    repo: Path,
    plan: dict[str, Any],
    ticket: Ticket,
    state: dict[str, Any],
    store: StateStore,
) -> None:
    ensure_clean(repo)
    base_sha = git_head(repo)
    if base_sha != state["integration_head"]:
        raise RuntimeError("Integration HEAD diverged from durable runner state.")
    path = worktree_path(repo, plan, ticket)
    state.update(
        {
            "active_ticket": ticket.ticket_id,
            "active_worktree": str(path),
            "active_base_sha": base_sha,
            "commit_intent": False,
            "pending_commit": None,
        }
    )
    store.transition(state, Status.IMPLEMENTING)
    create_ticket_worktree(repo, path, base_sha)
    prepare_worktree(repo, path, plan)


def integrate_ticket_commit(
    repo: Path,
    ticket: Ticket,
    commit_sha: str,
    state: dict[str, Any],
    store: StateStore,
) -> None:
    ensure_clean(repo)
    base_sha = state["active_base_sha"]
    current_head = git_head(repo)
    if current_head == base_sha:
        run_command(["git", "merge", "--ff-only", commit_sha], cwd=repo)
    elif current_head != commit_sha:
        store.transition(
            state,
            Status.NEEDS_HUMAN,
            error="Integration branch moved while a ticket was active.",
        )
        raise RuntimeError("Integration branch moved while a ticket was active.")

    path = Path(state["active_worktree"]).resolve()
    remove_ticket_worktree(repo, path)
    if ticket.ticket_id not in state["completed_tickets"]:
        state["completed_tickets"].append(ticket.ticket_id)
    state["ticket_commits"][ticket.ticket_id] = commit_sha
    state.update(
        {
            "integration_head": commit_sha,
            "active_ticket": None,
            "active_worktree": None,
            "active_base_sha": None,
            "commit_intent": False,
            "pending_commit": None,
        }
    )
    store.transition(state, Status.READY)


def recover_pending_commit(
    repo: Path,
    ticket: Ticket,
    state: dict[str, Any],
    store: StateStore,
) -> bool:
    base_sha = state["active_base_sha"]
    pending = state.get("pending_commit")
    path = Path(state["active_worktree"]).resolve()
    registered = path in registered_worktrees(repo)

    if pending:
        if registered and git_head(path) != pending:
            raise RuntimeError("Ticket worktree does not match the pending runner commit.")
        integrate_ticket_commit(repo, ticket, pending, state, store)
        return True

    if registered and git_head(path) != base_sha:
        worktree_head = git_head(path)
        parent = git_output(path, "rev-parse", "HEAD^")
        if not state.get("commit_intent"):
            message = (
                "Ticket worktree contains a commit without a durable runner commit marker; "
                "it will not be integrated automatically."
            )
            store.transition(state, Status.NEEDS_HUMAN, error=message)
            raise RuntimeError(message)
        if parent != base_sha or git_status(path):
            raise RuntimeError(
                "Ticket worktree has an unexpected committed or mixed state; human inspection is required."
            )
        validate_changed_paths(path, ticket, base_sha)
        state["pending_commit"] = worktree_head
        store.save(state)
        integrate_ticket_commit(repo, ticket, worktree_head, state, store)
        return True

    if not registered and git_head(repo) != base_sha:
        commit_sha = git_head(repo)
        recorded = state.get("ticket_commits", {}).get(ticket.ticket_id)
        if recorded == commit_sha:
            state["pending_commit"] = commit_sha
            store.save(state)
            integrate_ticket_commit(repo, ticket, commit_sha, state, store)
            return True
    return False


def execute_active_ticket(
    repo: Path,
    plan: dict[str, Any],
    ticket: Ticket,
    state: dict[str, Any],
    store: StateStore,
    verification: list[str],
    contract_path: str,
    *,
    resume: bool,
) -> None:
    if recover_pending_commit(repo, ticket, state, store):
        return

    base_sha = state["active_base_sha"]
    path = Path(state["active_worktree"]).resolve()
    create_ticket_worktree(repo, path, base_sha)
    prepare_worktree(repo, path, plan)
    if git_head(path) != base_sha:
        raise RuntimeError("Active ticket worktree is not based on the recorded integration HEAD.")

    prior_status = Status(state["status"])
    should_invoke_codex = prior_status != Status.VERIFYING
    if should_invoke_codex:
        if prior_status != Status.IMPLEMENTING:
            store.transition(state, Status.IMPLEMENTING)
        try:
            result = invoke_codex(
                path,
                ticket,
                build_codex_prompt(ticket, contract_path, resume=resume),
                repo / ".agent" / "runs" / "codex",
            )
        except OSError as exc:
            message = f"Codex could not be started; ticket worktree preserved: {exc}"
            store.transition(state, Status.FAILED, error=message)
            raise RuntimeError(message) from exc
        if result.usage_limited:
            message = (
                f"Codex reported a usage limit; ticket worktree preserved at {path}."
            )
            store.transition(state, Status.PAUSED_CODEX_USAGE, error=message)
            raise RunPaused(message)
        if result.returncode != 0:
            message = (
                f"Codex exited with code {result.returncode}; ticket worktree preserved at {path}."
            )
            if result.interrupted:
                store.transition(state, Status.PAUSED_CODEX_USAGE, error=message)
                raise RunPaused(message)
            store.transition(state, Status.FAILED, error=message)
            raise RuntimeError(message)
        try:
            ensure_codex_did_not_mutate_git(path, base_sha)
        except RuntimeError as exc:
            store.transition(state, Status.NEEDS_HUMAN, error=str(exc))
            raise
        store.transition(state, Status.VERIFYING)

    try:
        validate_changed_paths(path, ticket, base_sha)
        run_verification(path, verification)
        state["commit_intent"] = True
        store.save(state)
        commit_sha = commit_ticket(path, ticket, base_sha)
    except RuntimeError as exc:
        target = (
            Status.NEEDS_HUMAN
            if "outside its allowed boundary" in str(exc)
            else Status.FAILED
        )
        store.transition(state, target, error=str(exc))
        raise

    state["pending_commit"] = commit_sha
    store.save(state)
    integrate_ticket_commit(repo, ticket, commit_sha, state, store)


def review_paths(repo: Path, plan: dict[str, Any]) -> tuple[Path, Path]:
    review = plan.get("review", {})
    temporary = safe_repo_path(
        repo,
        review.get("temporary_output", ".agent/reviews/review.tmp.json"),
        "Temporary review path",
    )
    authoritative = safe_repo_path(
        repo,
        review.get("authoritative_output", ".agent/reviews/review.json"),
        "Authoritative review path",
    )
    if temporary == authoritative:
        raise RuntimeError("Temporary and authoritative review paths must be different.")
    return temporary, authoritative


def build_review_prompt(
    state: dict[str, Any],
    contract_path: str,
    schema_path: str,
) -> str:
    return f"""Perform a complete, independent, read-only code review of this branch.

Inputs and authority:
- Read AGENTS.md completely.
- Review against {contract_path}.
- Review the diff from base {state['run_base_sha']} to current {state['integration_head']}.
- The required output contract is documented in {schema_path}.

Rules:
- Do not edit files or run Git commands that mutate any repository state.
- Review the entire branch diff; do not publish findings incrementally.
- Return exactly one JSON object and no Markdown fences or surrounding commentary.
- Set `reviewed_sha` to {state['integration_head']} exactly.
- Set `complete` to true only after reviewing the complete diff.
- Every finding must be specific, evidence-based, and actionable.
"""


def invoke_claude(
    repo: Path,
    command: list[str],
    prompt: str,
    temporary_path: Path,
    diagnostics_dir: Path,
) -> WorkerResult:
    diagnostics_dir.mkdir(parents=True, exist_ok=True)
    temporary_path.parent.mkdir(parents=True, exist_ok=True)
    diagnostic_path = diagnostics_dir / f"{timestamp()}-claude-review.log"
    print("\n=== Transactional Claude review ===", flush=True)
    print(f"Temporary output: {temporary_path}", flush=True)
    print(f"Diagnostic log: {diagnostic_path}", flush=True)
    result = subprocess.run(
        command,
        cwd=repo,
        check=False,
        text=True,
        input=prompt,
        capture_output=True,
    )
    temporary_path.write_text(result.stdout, encoding="utf-8")
    diagnostic_path.write_text(
        f"command: {' '.join(shlex.quote(part) for part in command)}\n"
        f"returncode: {result.returncode}\n\n"
        f"--- stdout ---\n{result.stdout}\n"
        f"--- stderr ---\n{result.stderr}\n",
        encoding="utf-8",
    )
    return WorkerResult(result.returncode, result.stdout, result.stderr)


def validate_review(document: Any, expected_sha: str) -> dict[str, Any]:
    if not isinstance(document, dict):
        raise RuntimeError("Claude review output must be a JSON object.")
    required = {
        "schema_version",
        "complete",
        "reviewed_sha",
        "verdict",
        "findings",
        "re_review_required",
    }
    missing = sorted(required - document.keys())
    if missing:
        raise RuntimeError("Claude review output is missing fields: " + ", ".join(missing))
    unexpected = sorted(document.keys() - required)
    if unexpected:
        raise RuntimeError(
            "Claude review output has unexpected fields: " + ", ".join(unexpected)
        )
    if document["schema_version"] != 1 or document["complete"] is not True:
        raise RuntimeError("Claude review output is not marked complete with schema version 1.")
    if document["reviewed_sha"] != expected_sha:
        raise RuntimeError(
            "Claude reviewed SHA does not match the current integration HEAD."
        )
    if document["verdict"] not in {"pass", "changes_required", "needs_human"}:
        raise RuntimeError("Claude review output has an unsupported verdict.")
    if not isinstance(document["findings"], list):
        raise RuntimeError("Claude review findings must be a list.")
    if not isinstance(document["re_review_required"], bool):
        raise RuntimeError("Claude review re_review_required must be boolean.")
    for index, finding in enumerate(document["findings"]):
        if not isinstance(finding, dict):
            raise RuntimeError(f"Claude review finding {index} must be an object.")
        finding_fields = {
            "severity",
            "title",
            "path",
            "line",
            "description",
            "recommendation",
        }
        missing_finding_fields = sorted(finding_fields - finding.keys())
        unexpected_finding_fields = sorted(finding.keys() - finding_fields)
        if missing_finding_fields or unexpected_finding_fields:
            raise RuntimeError(
                f"Claude review finding {index} does not match the required fields."
            )
        if finding.get("severity") not in {"critical", "major", "minor"}:
            raise RuntimeError(f"Claude review finding {index} has invalid severity.")
        for field in ("title", "path", "description", "recommendation"):
            if not isinstance(finding.get(field), str) or not finding[field].strip():
                raise RuntimeError(
                    f"Claude review finding {index} has invalid or missing {field}."
                )
        line = finding.get("line")
        if line is not None and (not isinstance(line, int) or line < 1):
            raise RuntimeError(f"Claude review finding {index} has an invalid line.")
    if document["verdict"] == "pass" and document["findings"]:
        raise RuntimeError("A passing Claude review may not contain findings.")
    return document


def run_transactional_review(
    repo: Path,
    plan: dict[str, Any],
    state: dict[str, Any],
    store: StateStore,
) -> None:
    review = plan.get("review", {})
    if not review.get("enabled", False):
        store.transition(state, Status.READY_FOR_ACCEPTANCE)
        return

    ensure_clean(repo)
    expected_sha = git_head(repo)
    if expected_sha != state["integration_head"]:
        raise RuntimeError("Integration HEAD changed before Claude review.")
    temporary, authoritative = review_paths(repo, plan)
    if temporary.exists():
        temporary.unlink()

    prior = Status(state["status"])
    target = (
        Status.RE_REVIEWING
        if prior == Status.RE_REVIEWING or state["review_cycle"] > 0
        else Status.REVIEWING
    )
    store.transition(state, target)
    contract_path = plan.get("contract", ".agent/branch-contract.md")
    schema_path = review.get("schema", ".agent/review-schema.json")
    command = review.get(
        "command",
        [
            "claude",
            "--print",
            "--no-session-persistence",
            "--permission-mode",
            "plan",
        ],
    )
    if not isinstance(command, list) or not command or not all(
        isinstance(part, str) and part for part in command
    ):
        raise RuntimeError("review.command must be a non-empty JSON list of strings.")

    try:
        result = invoke_claude(
            repo,
            command,
            build_review_prompt(state, contract_path, schema_path),
            temporary,
            repo / ".agent" / "runs" / "claude",
        )
    except OSError as exc:
        message = f"Claude review could not be started; no review was promoted: {exc}"
        store.transition(state, Status.FAILED, error=message)
        raise RuntimeError(message) from exc
    if git_head(repo) != expected_sha or git_status(repo):
        if temporary.exists():
            temporary.unlink()
        message = "Claude review changed repository state; no review was promoted."
        store.transition(state, Status.NEEDS_HUMAN, error=message)
        raise RuntimeError(message)

    if result.usage_limited:
        if temporary.exists():
            temporary.unlink()
        message = "Claude reported a usage limit; diagnostics retained."
        store.transition(state, Status.PAUSED_CLAUDE_USAGE, error=message)
        raise RunPaused(message)

    if result.returncode != 0:
        if temporary.exists():
            temporary.unlink()
        message = f"Claude review exited with code {result.returncode}; diagnostics retained."
        if result.interrupted:
            store.transition(state, Status.PAUSED_CLAUDE_USAGE, error=message)
            raise RunPaused(message)
        store.transition(state, Status.FAILED, error=message)
        raise RuntimeError(message)

    try:
        document = json.loads(temporary.read_text(encoding="utf-8"))
        validate_review(document, expected_sha)
    except (json.JSONDecodeError, RuntimeError) as exc:
        if temporary.exists():
            temporary.unlink()
        message = f"Claude review was incomplete or invalid; diagnostics retained: {exc}"
        store.transition(state, Status.PAUSED_CLAUDE_USAGE, error=message)
        raise RunPaused(message) from exc

    authoritative.parent.mkdir(parents=True, exist_ok=True)
    os.replace(temporary, authoritative)
    state["review_cycle"] += 1
    state["reviewed_sha"] = expected_sha
    state["authoritative_review"] = str(authoritative.relative_to(repo))
    verdict = document["verdict"]
    if verdict == "pass":
        store.transition(state, Status.READY_FOR_ACCEPTANCE)
    else:
        store.transition(
            state,
            Status.NEEDS_HUMAN,
            error="Authoritative Claude review contains findings requiring triage.",
        )


def print_dry_run(
    repo: Path,
    plan: dict[str, Any],
    tickets: list[Ticket],
) -> None:
    contract_path = plan.get("contract", ".agent/branch-contract.md")
    print(f"Repository: {repo}")
    print(f"Integration branch: {plan['branch']}")
    print(f"Run ID: {plan.get('run_id', 'local-agent-runner')}")
    print(f"Tickets: {', '.join(ticket.ticket_id for ticket in tickets)}")
    print(f"Review enabled: {bool(plan.get('review', {}).get('enabled', False))}")
    for ticket in tickets:
        print("\n" + "-" * 72)
        print(
            f"{ticket.ticket_id}: {ticket.title} "
            f"[{ticket.model}, effort={ticket.effort}]"
        )
        print(f"Worktree: {worktree_path(repo, plan, ticket)}")
        print(build_codex_prompt(ticket, contract_path, resume=False))


def run_workflow(
    repo: Path,
    plan: dict[str, Any],
    tickets: list[Ticket],
    state: dict[str, Any],
    store: StateStore,
) -> None:
    verification = plan.get(
        "verification",
        ["npm run test", "npm run typecheck", "npm run lint", "npm run build"],
    )
    if not isinstance(verification, list) or not all(
        isinstance(command, str) for command in verification
    ):
        raise RuntimeError("verification must be a JSON list of command strings.")
    contract_path = plan.get("contract", ".agent/branch-contract.md")
    ticket_by_id = {ticket.ticket_id: ticket for ticket in tickets}

    active_id = state.get("active_ticket")
    if active_id:
        ticket = ticket_by_id.get(active_id)
        if ticket is None:
            raise RuntimeError(f"Active ticket {active_id} is missing from the run plan.")
        execute_active_ticket(
            repo,
            plan,
            ticket,
            state,
            store,
            verification,
            contract_path,
            resume=True,
        )

    for ticket in tickets:
        if ticket.ticket_id in state["completed_tickets"]:
            continue
        begin_ticket(repo, plan, ticket, state, store)
        execute_active_ticket(
            repo,
            plan,
            ticket,
            state,
            store,
            verification,
            contract_path,
            resume=False,
        )

    current = Status(state["status"])
    if current == Status.READY:
        store.transition(state, Status.IMPLEMENTATION_COMPLETE)
        current = Status.IMPLEMENTATION_COMPLETE
    review_enabled = bool(plan.get("review", {}).get("enabled", False))
    if current in {
        Status.IMPLEMENTATION_COMPLETE,
        Status.PAUSED_CLAUDE_USAGE,
        Status.REVIEWING,
        Status.RE_REVIEWING,
    } or (current == Status.FAILED and review_enabled):
        run_transactional_review(repo, plan, state, store)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--config",
        default=".agent/run.json",
        help="Path to run plan JSON relative to the integration repository root.",
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Resume from durable state, Git commits, and registered worktrees.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print resolved worktrees and prompts without invoking models or changing state/Git.",
    )
    args = parser.parse_args()
    if args.resume and args.dry_run:
        raise RuntimeError("--resume and --dry-run cannot be combined.")

    repo = Path(git_output(Path.cwd(), "rev-parse", "--show-toplevel")).resolve()
    config_path = safe_repo_path(repo, args.config, "Run configuration path")
    plan = read_plan(config_path)
    tickets = parse_tickets(plan)
    if not isinstance(plan.get("branch"), str) or not plan["branch"]:
        raise RuntimeError("Run plan must define a non-empty integration branch.")
    ensure_integration_branch(repo, plan["branch"])

    if args.dry_run:
        print_dry_run(repo, plan, tickets)
        return 0

    state_path = safe_repo_path(
        repo, plan.get("state", ".agent/state.json"), "Runner state path"
    )
    store = StateStore(state_path)
    if args.resume:
        state = store.load()
        validate_state(state, plan=plan, config_path=config_path, repo=repo)
        if Status(state["status"]) == Status.READY_FOR_ACCEPTANCE:
            print("Run is already READY_FOR_ACCEPTANCE; nothing to resume.")
            return 0
    else:
        if store.exists():
            state = store.load()
            raise RuntimeError(
                f"Durable state already exists with status {state['status']}. "
                "Use --resume; do not start a second run over existing state."
            )
        ensure_clean(repo)
        run_command(["codex", "--version"], cwd=repo)
        state = initial_state(plan=plan, config_path=config_path, repo=repo)
        store.save(state)

    print(f"Repository: {repo}")
    print(f"Integration branch: {state['branch']}")
    print(f"Durable state: {state_path}")
    print(f"Current status: {state['status']}")
    run_workflow(repo, plan, tickets, state, store)
    print("\n=== Runner stopped at a durable gate ===")
    print(f"Status: {state['status']}")
    print(f"Integration HEAD: {git_head(repo)}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RunPaused as exc:
        print(f"\nPAUSED: {exc}", file=sys.stderr)
        print("Resume later with: python3 scripts/branch_runner.py --resume", file=sys.stderr)
        raise SystemExit(2)
    except (RuntimeError, KeyError, OSError) as exc:
        print(f"\nERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
