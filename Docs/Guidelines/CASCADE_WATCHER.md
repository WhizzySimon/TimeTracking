# Cascade Watcher — Usage Guide

**Last Updated:** 2025-12-25

---

## Overview

The Cascade Watcher enables autonomous command execution. Cascade writes commands to a file, the watcher executes them, and Cascade reads the output.

---

## Folder Structure

```
scripts/
├── watcher/
│   ├── watcher.ps1          # The watcher script (one script, multiple instances)
│   ├── A/                   # Instance A files
│   │   ├── command.txt
│   │   ├── status.txt
│   │   └── output.txt
│   └── B/                   # Instance B files
│       ├── command.txt
│       ├── status.txt
│       └── output.txt
├── cascade-watcher.ps1      # Legacy single-instance watcher (still works)
├── cascade-command.txt      # Legacy files for single-instance
├── cascade-status.txt
└── cascade-output.txt
```

---

## Single Chat Session (Legacy)

For backward compatibility, the old single-instance watcher still works:

```powershell
powershell -File scripts/cascade-watcher.ps1
```

Uses files directly in `scripts/` folder.

---

## Multiple Chat Sessions (Recommended)

When running multiple Cascade chats simultaneously, each chat MUST use its own watcher instance.

### Setup

**Terminal 1 (Chat A):**
```powershell
powershell -File scripts/watcher/watcher.ps1 -Instance A
```

**Terminal 2 (Chat B):**
```powershell
powershell -File scripts/watcher/watcher.ps1 -Instance B
```

### Files per Instance

| Instance | Command File | Status File | Output File |
|----------|--------------|-------------|-------------|
| A | `scripts/watcher/A/command.txt` | `scripts/watcher/A/status.txt` | `scripts/watcher/A/output.txt` |
| B | `scripts/watcher/B/command.txt` | `scripts/watcher/B/status.txt` | `scripts/watcher/B/output.txt` |

### How Cascade Knows Which Instance to Use

At the start of each chat session, the user tells Cascade which instance to use:

> "Use watcher instance A for this chat."

Cascade then uses the corresponding files:
- Write to `scripts/watcher/A/command.txt`
- Poll `scripts/watcher/A/status.txt`
- Read from `scripts/watcher/A/output.txt`

### Why This Matters

Without separate instances:
- Both chats write to the same command file
- Commands get overwritten or mixed
- One chat's command runs instead of the other's
- Confusion and wasted time

With separate instances:
- Each chat has isolated command/status/output files
- No interference between chats
- Both can run commands simultaneously

---

## Workflow

1. Cascade writes command to `scripts/cascade-command.txt`
2. Watcher detects and executes it
3. Output written to `scripts/cascade-output.txt`
4. Status written to `scripts/cascade-status.txt`
5. Cascade polls status until DONE
6. Cascade reads output and continues

---

## CRITICAL: Command Syntax Rules

### Rule 1: NO command chaining with semicolons

The watcher executes commands via `cmd.exe`, not PowerShell directly. Semicolons are NOT interpreted as command separators.

**BAD:**
```
git stash; git checkout main; git stash pop
```
Error: `git: 'stash;' is not a git command`

**GOOD:**
Execute commands one at a time:
```
# Command 1
git stash

# Command 2
git checkout main

# Command 3
git stash pop
```

### Rule 2: NO `&&` for chaining either

PowerShell does not support `&&` for command chaining (older versions).

**BAD:**
```
git add -A && git commit -m "message"
```

**GOOD:**
```
git add -A
```
Then separately:
```
git commit -m "message"
```

### Rule 3: One command per execution

Always write a single, complete command. Wait for it to finish before writing the next.

---

## Common Pitfalls and Solutions

### Pitfall 1: Uncommitted changes block branch switch

**Error:**
```
fatal: Cannot update paths and switch to branch 'feat/xyz' at the same time.
```

**Cause:** You have uncommitted changes and tried to switch branches.

**Solution:** Stash first, then switch, then pop:
```
# Step 1
git stash

# Step 2
git checkout main

# Step 3
git checkout -b feat/new-branch

# Step 4
git stash pop
```

### Pitfall 2: PR script fails on new branch

**Error:**
```
gh : no pull requests found for branch "feat/xyz"
```

**Cause:** The `pr.ps1` script checks for existing PR before creating one.

**Solution:** Create PR manually:
```
gh pr create --fill
```
Then enable auto-merge:
```
gh pr merge --auto --squash --delete-branch
```

### Pitfall 3: Forgetting to poll status

**Symptom:** Cascade reads old output from previous command.

**Solution:** Always poll `scripts/cascade-status.txt` until it shows `DONE:SUCCESS` or `DONE:FAILED` before reading output.

---

## Git Workflow via Watcher

### Creating a feature branch (from main)

```
# 1. Stash any uncommitted changes
git stash

# 2. Switch to main
git checkout main

# 3. Pull latest
git pull origin main

# 4. Create new branch
git checkout -b feat/your-feature

# 5. Restore stashed changes (if any)
git stash pop
```

### Committing changes

```
# 1. Stage all changes
git add -A

# 2. Commit
git commit -m "feat: description"
```

### Creating PR with auto-merge

```
# 1. Create PR
gh pr create --fill

# 2. Enable auto-merge
gh pr merge --auto --squash --delete-branch
```

---

## Verification Commands

### Code verification

```
npm run verify
```

Runs format, typecheck, and lint. Output goes to `scripts/verify-code-output.txt`.

### Unit tests

```
npm run test:unit
```

### E2E tests

```
npm run test:e2e
```

---

## Troubleshooting

### Watcher not responding

1. Check if watcher terminal is still running
2. Check `scripts/cascade-status.txt` — should show IDLE when ready
3. Restart watcher if needed

### Command hangs

1. Check if command requires user input (avoid interactive commands)
2. Check if command has infinite output (add limits, e.g., `git log -n 10`)

### Output truncated

The watcher captures all output. If output seems incomplete, the command may still be running. Wait for status to show DONE.

---

## Summary

- **One command at a time** — no chaining
- **Poll status before reading output**
- **Use git stash** when switching branches with uncommitted changes
- **Create PR manually** if `pr.ps1` fails on new branch
