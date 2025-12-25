# Git Workflow (TimeTracker)

## Rules

- **Never push directly to `main`.** The `main` branch is protected; direct pushes will be rejected.
- **Never merge via GitHub UI.** Always use `scripts/git/pr.ps1` for consistent workflow.
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
powershell -File scripts/git/pr.ps1
```

The script handles:

- Pushing the branch to origin
- Creating a PR (or reusing existing one)
- Enabling auto-merge with squash strategy
- Branch deletion after merge

The PR will merge automatically when CI passes.

### 4. Clean up locally

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

## Cascade Session Start (CRITICAL)

**Every new chat session = new branch.** At the start of each chat:

1. **Create branch directly from current position:**

   ```
   git checkout -b feat/<task-name>
   ```

2. **Do NOT go to main first.** See "Anti-Pattern 1" below for why.

3. **Exception:** Within the same chat, you may stay on the current branch and make multiple related PRs.

This rule exists because:

- Going to main requires stashing uncommitted changes from other chats
- Stashing causes data loss (see Anti-Pattern 1)
- Creating directly from current position preserves all uncommitted work

## Parallel Chat Sessions (CRITICAL)

When running multiple Cascade chat sessions simultaneously:

### Rules

1. **Each chat MUST work on its own branch**
   - Branch name should match the task (e.g., `feat/P10-monetising`)
   - Never share branches between chats

2. **Each chat MUST use its own watcher instance**
   - Chat A uses `scripts/watcher.ps1 -Instance A` → writes to `scripts/watcher/A/command.txt`
   - Chat B uses `scripts/watcher.ps1 -Instance B` → writes to `scripts/watcher/B/command.txt`
   - See [CASCADE_WATCHER.md](CASCADE_WATCHER.md) for details

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

## GitHub Repository Settings

### Repository Settings (current state)

| Setting                  | Value    | Meaning                                               |
| ------------------------ | -------- | ----------------------------------------------------- |
| `allow_auto_merge`       | ✅ true  | `gh pr merge --auto` works                            |
| `delete_branch_on_merge` | ❌ false | Branches are NOT auto-deleted (use `--delete-branch`) |
| `allow_squash_merge`     | ✅ true  | Squash merge allowed                                  |
| `allow_merge_commit`     | ✅ true  | Merge commit allowed                                  |
| `allow_rebase_merge`     | ✅ true  | Rebase merge allowed                                  |

### Branch Protection (Ruleset "protect-main")

The `main` branch is protected by a GitHub Ruleset:

| Rule                  | Status                            |
| --------------------- | --------------------------------- |
| Restrict deletions    | ✅ Enabled                        |
| Require pull request  | ✅ Enabled (0 approvals required) |
| Require status checks | ✅ Enabled (`build` check)        |
| Block force pushes    | ✅ Enabled                        |
| Bypass list           | Empty (no one can bypass)         |

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

### Auto-merge enabled

**Current state:** Auto-merge is enabled for this repository.

**How it works:**

- `gh pr merge --auto --squash --delete-branch` queues the PR for auto-merge
- PR merges automatically when CI passes
- `scripts/git/pr.ps1` uses this by default

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
| **Full PR workflow** | `powershell -File scripts/git/pr.ps1`           |
| Switch to main       | `git checkout main`                             |
| Update main          | `git pull origin main`                          |
| Delete local branch  | `git branch -d feat/name`                       |

## Manual Steps (if needed)

For step-by-step control:

```powershell
# 1. Push branch
git push -u origin HEAD

# 2. Create PR
gh pr create --fill

# 3. Wait for CI to pass, then merge
gh pr merge --squash --delete-branch
```

Or use the individual helper scripts:

```powershell
powershell -File scripts/pr-create.ps1    # Steps 1-2
# Wait for CI...
gh pr merge --squash --delete-branch       # Step 3
```

**Note:** `scripts/pr-merge-auto.ps1` also uses `--auto` and works correctly.

---

## Anti-Patterns: Was man NICHT tun sollte

Diese Sektion dokumentiert Fehler, die passiert sind, und wie man sie vermeidet.

### Anti-Pattern 1: Stash bei parallelen Chats

**Was passiert ist:**

1. Chat A hatte uncommitted Änderungen (Phase 11 Docs)
2. Chat B wollte auf `main` wechseln für neuen Feature-Branch
3. Git verweigert Branch-Wechsel wegen uncommitted changes
4. Chat B führte `git stash` aus → Änderungen von Chat A verschwinden aus Explorer
5. User sieht die Änderungen nicht mehr und vergisst sie

**Warum das schlecht ist:**

- Änderungen sind "versteckt" und nicht mehr sichtbar
- Der andere Chat weiß nicht, dass seine Änderungen gestasht wurden
- Hohe Wahrscheinlichkeit, dass `git stash pop` vergessen wird
- Änderungen können verloren gehen

**Richtige Lösung:**

```powershell
# FALSCH: Auf main wechseln (erfordert stash)
git checkout main
git pull origin main
git checkout -b feat/new-feature

# RICHTIG: Direkt vom aktuellen Branch neuen Branch erstellen
git checkout -b feat/new-feature
# Uncommitted changes bleiben sichtbar!
```

### Anti-Pattern 2: Änderungen anderer Chats committen

**Was passiert ist:**

- Chat B sieht uncommitted files von Chat A
- Chat B führt `git add -A` aus und committed alles
- Chat A's Änderungen landen im falschen Branch/PR

**Warum das schlecht ist:**

- Vermischung von Features in einem Commit
- Falscher Autor/Kontext für die Änderungen
- Schwer nachzuvollziehen wer was gemacht hat

**Richtige Lösung:**

```powershell
# FALSCH: Alles stagen
git add -A

# RICHTIG: Nur eigene Dateien stagen
git add src/lib/components/MyComponent.svelte
git add src/routes/mypage/+page.svelte
# NICHT: git add Docs/  (wenn das vom anderen Chat ist)
```

### Anti-Pattern 3: Auf main wechseln mit uncommitted changes

**Problem:** Git erlaubt keinen Branch-Wechsel wenn uncommitted changes existieren, die mit dem Ziel-Branch konfligieren könnten.

**Falsche Reaktionen:**

- `git stash` (versteckt Änderungen anderer)
- `git checkout --force` (verwirft Änderungen!)
- `git reset --hard` (verwirft Änderungen!)

**Richtige Lösung:**

- Direkt vom aktuellen Branch neuen Branch erstellen
- ODER: Den anderen Chat bitten, zuerst zu committen

### Checkliste: Vor jedem Branch-Wechsel

- [ ] `git status` ausführen
- [ ] Prüfen: Sind uncommitted changes von MIR oder von einem anderen Chat?
- [ ] Wenn von anderem Chat: **NICHT** auf main wechseln
- [ ] Stattdessen: `git checkout -b <neuer-branch>` direkt ausführen

### Checkliste: Vor jedem Commit

- [ ] `git status` ausführen
- [ ] Prüfen: Welche Dateien gehören zu MEINEM Task?
- [ ] Nur eigene Dateien stagen: `git add <datei1> <datei2>`
- [ ] NICHT: `git add -A` wenn fremde Änderungen existieren

### Git Begriffe Kurzreferenz

| Begriff       | Bedeutung                       | Sichtbar im Explorer?    |
| ------------- | ------------------------------- | ------------------------ |
| **Untracked** | Neue Datei, Git kennt sie nicht | Ja                       |
| **Modified**  | Bekannte Datei wurde geändert   | Ja                       |
| **Staged**    | Für nächsten Commit vorgemerkt  | Ja (als "staged")        |
| **Committed** | In Git-Historie gespeichert     | Nein (Teil des Branches) |
| **Stashed**   | Temporär versteckt              | **NEIN** (unsichtbar!)   |

### Goldene Regel für parallele Chats

> **Jeder Chat fasst NUR seine eigenen Dateien an.**
>
> - Nicht stagen was dir nicht gehört
> - Nicht stashen was dir nicht gehört
> - Nicht committen was dir nicht gehört
> - Im Zweifel: `git status` und nachdenken
