# Git Workflow (TimeTracker)

## Rule

**Never push directly to `main`.** All changes go through a pull request.

## Workflow

### 1. Create a feature branch

```bash
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

### 2. Make commits

```bash
git add -A
git commit -m "feat: short description"
```

Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`

### 3. Push branch to remote

```bash
git push -u origin feat/your-feature-name
```

### 4. Open a Pull Request

- Go to GitHub → repository → "Compare & pull request"
- Add a descriptive title and description
- Wait for CI checks to pass (green checkmark)

### 5. Merge the PR

- Once CI is green, click "Merge pull request"
- Use "Squash and merge" for cleaner history (optional)
- Delete the branch after merge (GitHub offers this automatically)

### 6. Clean up locally

```bash
git checkout main
git pull origin main
git branch -d feat/your-feature-name
```

## CI Requirements

- All PRs must pass the CI workflow before merging
- The `ci.yml` workflow runs: format check, lint, typecheck, and tests
- If CI fails, fix the issues and push again

## Branch Protection

The `main` branch is protected:
- Pull request required before merging
- CI status checks must pass
- Force pushes blocked
- Branch deletion blocked
- Rules apply to administrators too

## Quick Reference

| Action | Command |
|--------|---------|
| Create branch | `git checkout -b feat/name` |
| Push branch | `git push -u origin feat/name` |
| Switch to main | `git checkout main` |
| Update main | `git pull origin main` |
| Delete local branch | `git branch -d feat/name` |
