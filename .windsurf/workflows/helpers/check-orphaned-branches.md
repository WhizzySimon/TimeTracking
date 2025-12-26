---
description: Check for orphaned branches with unmerged work (called by entry points)
---

## Purpose

This helper checks for branches that have unmerged commits. Called automatically by entry point workflows.

## How to Use

Use watcher to run:
```
git branch --no-merged main
```

## Interpretation

- **Empty output:** No orphaned branches. Continue normally.
- **Branches listed:** These have unmerged work that will be LOST if not merged.

## Action (depends on calling workflow)

### For interactive workflows (continue-work, new-feature, new-task)

1. List the orphaned branches to the user
2. For each branch, show what work is there: `git log main..<branch> --oneline`
3. Ask: "These branches have unmerged work. Should I merge them first?"
4. If yes, for each branch:
   - `git checkout <branch>`
   - `powershell -File scripts/git/pr.ps1`
   - Wait for CI to pass
5. Then return to the original task

### For autonomous workflows (continue-work-auto-continue)

1. Merge all orphaned branches without asking
2. For each branch:
   - `git checkout <branch>`
   - `powershell -File scripts/git/pr.ps1`
   - Wait for CI to pass
3. Then continue with the main task

## Why This Matters

Work on unmerged branches gets LOST when the next session starts from `main`. This check prevents that.
