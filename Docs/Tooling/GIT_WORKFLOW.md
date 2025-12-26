# Git Workflow (TimeTracker)

## Simple dev/main Model

We use a simple two-branch model:

- **`dev` branch:** All work happens here. Push directly.
- **`main` branch:** Stable releases. Merge from dev when ready.

No PRs, no branch protection, no CI blocking.

## Daily Workflow

### 1. Ensure you're on dev

```bash
git checkout dev
git pull origin dev
```

### 2. Make changes and commit

```bash
# Edit files...
git add -A
git commit -m "feat: short description"
```

Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`

### 3. Push

```bash
git push
```

That's it. No PRs, no waiting for CI.

## Releasing to main

When you want to create a stable release:

```bash
git checkout main
git merge dev
git push origin main
git checkout dev
```

## Quick Reference

| Action        | Command                                         |
| ------------- | ----------------------------------------------- |
| Start work    | `git checkout dev && git pull origin dev`       |
| Commit        | `git add -A; git commit -m "feat: description"` |
| Push          | `git push`                                      |
| Release       | `git checkout main && git merge dev && git push origin main` |

## Parallel Chat Sessions

When running multiple Cascade chat sessions simultaneously:

- **Each chat uses its own watcher instance**
  - Chat A uses `scripts/watcher.ps1 -Instance A`
  - Chat B uses `scripts/watcher.ps1 -Instance B`
  - See [CASCADE_WATCHER.md](CASCADE_WATCHER.md) for details

- **Do not edit the same files in parallel** — this causes conflicts

## Git Stash is BANNED

**Never use `git stash`** in this project. It has caused data loss multiple times.

Instead of stashing:
1. Commit current work: `git add -A; git commit -m "WIP: description"`
2. Later: `git reset HEAD~1` to undo the WIP commit if needed

## Archive

The previous CI/branch workflow documentation is archived in:
`Docs/Archive/CI_WORKFLOW_IMPLEMENTATION.md`
