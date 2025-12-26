---
description: Check for pending or failed PRs that need attention (called by entry points)
---

## Purpose

This helper checks for PRs that didn't auto-merge (CI failed, merge conflicts, etc.).

## How to Use

Use watcher to run:
```
powershell -File scripts/git/check-prs.ps1
```

## Interpretation

- **No pending PRs:** Continue normally.
- **Pending PRs listed:** These need attention before starting new work.

## Action

If pending PRs exist:

1. Show the list to the user
2. For each pending PR, explain the status (CI failed, conflicts, etc.)
3. Ask: "Should I fix these first?"
4. If yes:
   - Checkout the branch
   - Fix the issue (re-run tests, resolve conflicts, etc.)
   - Push and wait for CI
5. Then continue with the main task

## Why This Matters

PRs with failed CI will never auto-merge. If not caught, work is effectively lost.
