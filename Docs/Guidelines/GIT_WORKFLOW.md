# Git Workflow (TimeTracker)

## Rule

**Never push directly to `main`.** All changes go through a pull request.

## Workflow (CLI-based, no GitHub UI required)

### 1. Create a feature branch

```powershell
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

Branch naming conventions:
- `feat/` — new feature
- `fix/` — bug fix
- `docs/` — documentation only
- `refactor/` — code refactoring
- `chore/` — maintenance tasks
- `test/` — test changes

### 2. Make commits

```powershell
git add -A
git commit -m "feat: short description"
```

Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`

### 3. Push branch to remote

```powershell
git push -u origin HEAD
```

### 4. Create PR via GitHub CLI

```powershell
gh pr create --fill
```

Or with custom title/body:

```powershell
gh pr create --title "feat: your feature" --body "Description here"
```

### 5. Enable auto-merge (merges when CI passes)

```powershell
gh pr merge --auto --squash --delete-branch
```

This command:
- Enables auto-merge for the PR
- Uses squash merge for clean history
- Deletes the remote branch after merge

### 6. Clean up locally (after merge)

```powershell
git checkout main
git pull origin main
git branch -d feat/your-feature-name
```

## One-liner workflow

For quick changes, use the helper scripts:

```powershell
# After committing and pushing your branch:
powershell -File scripts/pr-create.ps1
powershell -File scripts/pr-merge-auto.ps1
```

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

| Action | Command |
|--------|---------|
| Create branch | `git checkout -b feat/name` |
| Push branch | `git push -u origin HEAD` |
| Create PR | `gh pr create --fill` |
| Auto-merge PR | `gh pr merge --auto --squash --delete-branch` |
| Switch to main | `git checkout main` |
| Update main | `git pull origin main` |
| Delete local branch | `git branch -d feat/name` |
