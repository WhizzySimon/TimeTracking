# Manual Source Control Scripts

Scripts for humans who need to commit changes manually (not via Cascade).

## Quick Reference

### Trivial changes (one command)

```powershell
./scripts/manual-source-control/commit.ps1 -Quick -Message "chore: update workspace"
```

Auto-generates branch, commits, creates PR. Minimal interaction.

### Normal commit

```powershell
./scripts/manual-source-control/commit.ps1
```

Interactive mode - prompts for branch name (if on main) and commit message.

### Start a new branch first

```powershell
./scripts/manual-source-control/new-branch.ps1 -Name "update-config"
# Creates: chore/update-config

./scripts/manual-source-control/new-branch.ps1 -Quick
# Creates: chore/quick-20251226-1430
```

## Why branches are required

Main branch is protected. All changes must go through PRs with passing CI.

These scripts make this painless:
- `-Quick` flag auto-generates branch names
- PRs auto-merge when CI passes
- No manual GitHub interaction needed
