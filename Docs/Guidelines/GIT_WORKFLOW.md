# Git Workflow (TimeTracker)

## Rules

- **Never push directly to `main`.** The `main` branch is protected; direct pushes will be rejected.
- **Never merge via GitHub UI.** Always use `scripts/pr.ps1` for consistent workflow.
- **Short-lived branches.** Create a branch, make changes, merge via PR, delete branch.

## Daily Workflow

### 1. Create a feature branch

```powershell
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

### 2. Make changes and commit

```powershell
# Edit files...
git add -A
git commit -m "feat: short description"
```

Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`

### 3. Push, create PR, enable auto-merge (ONE command)

```powershell
powershell -File scripts/pr.ps1
```

That's it! The script handles:

- Pushing the branch to origin
- Creating a PR (or reusing existing one)
- Enabling auto-merge with squash strategy
- Branch deletion after merge

### 4. Wait for CI, then clean up locally

After the PR merges automatically:

```powershell
git checkout main
git pull origin main
git branch -d feat/your-feature-name
```

## Branch Naming

Use prefixes: `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`, `test/`

**Use task-specific names** to avoid collisions between parallel work:
- `feat/P10-monetising` (not just `feat/monetising`)
- `refactor/P08-code-quality` (not just `refactor/cleanup`)

## Parallel Chat Sessions (CRITICAL)

When running multiple Cascade chat sessions simultaneously:

### Rules

1. **Each chat MUST work on its own branch**
   - Branch name should match the task (e.g., `feat/P10-monetising`)
   - Never share branches between chats

2. **Only ONE chat uses the cascade-watcher at a time**
   - `scripts/cascade-command.txt` is a shared resource
   - If both chats write to it simultaneously, commands get lost or corrupted
   - Coordinate: finish one chat's command sequence before the other starts

3. **Do not edit the same files in parallel**
   - This causes merge conflicts
   - If both chats need the same file, finish and merge one first

### Safest Workflow

- **Sequential:** Chat A finishes and merges → Chat B starts
- **Parallel (careful):** Chat A on `feat/A`, Chat B on `feat/B`, completely separate files

### Before Starting a New Chat

1. Check: Is another chat currently using the cascade-watcher?
2. Check: Will this chat touch files the other chat is editing?
3. If conflicts possible: Wait for the other chat to finish, or work without watcher

## CI Requirements

- All PRs must pass the CI workflow before merging
- The `ci.yml` workflow runs: format check, lint, typecheck, and tests
- If CI fails, fix the issues and push again

### Required status check

- **Check name:** `build`
- **Full name in GitHub UI:** `CI / build` (on pull_request events)
- This is the **job name** in `.github/workflows/ci.yml`, not the workflow name

### Checks NOT required for merge

- Netlify deploy previews — informational only, not blocking

## Branch Protection

The `main` branch is protected by a GitHub Ruleset:

- Pull request required before merging
- CI status check `build` must pass
- Force pushes blocked
- Branch deletion blocked
- Rules apply to administrators too

## Troubleshooting

### "CI — Expected" or "Waiting for status to be reported"

**Cause:** The required status check name in the ruleset doesn't match the actual job name.

**Fix:** In GitHub → Settings → Rules → Rulesets → edit the ruleset:

- Required check must be `build` (the job name)
- NOT `CI` (the workflow name)
- Select from the dropdown, don't type free text

### Netlify preview failed but I want to merge

Netlify previews are **not** required checks. If `build` passes, you can merge.
If Netlify is blocking, check that it's not accidentally added as a required check.

### Auto-merge not working

1. Ensure auto-merge is enabled for the repo (Settings → General → Allow auto-merge)
2. Ensure the PR has no merge conflicts
3. Ensure all required checks are passing (just `build`)

### gh CLI not authenticated

```powershell
gh auth login
```

Follow the prompts to authenticate with GitHub.

## Quick Reference

| Action               | Command                                         |
| -------------------- | ----------------------------------------------- |
| Create branch        | `git checkout -b feat/name`                     |
| Commit               | `git add -A; git commit -m "feat: description"` |
| **Full PR workflow** | `powershell -File scripts/pr.ps1`               |
| Switch to main       | `git checkout main`                             |
| Update main          | `git pull origin main`                          |
| Delete local branch  | `git branch -d feat/name`                       |

## Manual Steps (if needed)

For step-by-step control, you can also use:

```powershell
# Push branch
git push -u origin HEAD

# Create PR
gh pr create --fill

# Enable auto-merge
gh pr merge --auto --squash --delete-branch
```

Or the individual helper scripts:

```powershell
powershell -File scripts/pr-create.ps1
powershell -File scripts/pr-merge-auto.ps1
```
