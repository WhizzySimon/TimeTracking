# CI Workflow Implementation Archive

**Archived:** 2025-12-26
**Reason:** Switching to simplified dev/main workflow without branch protection or PRs.

## Why This Was Built

The multi-branch CI workflow was implemented to:

1. Protect the `main` branch from direct pushes
2. Require all changes to go through Pull Requests
3. Run automated tests (CI) before merging
4. Auto-merge PRs when CI passes
5. Auto-delete remote branches after merge

## Why It Was Removed

For a single developer, this workflow caused more problems than it solved:

1. **Work loss risk:** Switching branches without committing/pushing caused work to be "forgotten"
2. **Complexity:** Many scripts, rules, and checks to maintain
3. **No real benefit:** The same tests run locally before push
4. **CI failures block work:** Instead of informing, they block
5. **Branch management overhead:** Creating, tracking, deleting branches

## The New Workflow

Simple dev/main model:

- `dev` branch: All work happens here, push directly
- `main` branch: Merge from dev when ready for release
- No PRs, no branch protection, no auto-merge complexity

---

## Archived Scripts

### scripts/git/pr.ps1 (147 lines)

Purpose: Push branch, create PR, enable auto-merge with squash strategy.

```powershell
<#
.SYNOPSIS
    Complete PR workflow: push -> create PR -> enable auto-merge.
.DESCRIPTION
    One command to handle the full GitHub PR workflow:
    1. Validates branch (not main) and git state
    2. Pushes current branch to origin
    3. Creates PR if none exists, reuses existing PR otherwise
    4. Enables auto-merge with squash strategy

    The PR will automatically merge when CI passes.
.PARAMETER AllowDirty
    Allow running with uncommitted changes (default: fail if dirty).
.EXAMPLE
    powershell -File scripts/pr.ps1
.EXAMPLE
    powershell -File scripts/pr.ps1 -AllowDirty
#>

param(
    [switch]$AllowDirty
)

$ErrorActionPreference = "Stop"

# Validation: Check we're in a git repo
$branch = git rev-parse --abbrev-ref HEAD 2>$null
if ($LASTEXITCODE -ne 0 -or -not $branch) {
    Write-Host "ERROR: Not in a git repository" -ForegroundColor Red
    exit 1
}

# Fail if on main
if ($branch -eq "main") {
    Write-Host "ERROR: Cannot create PR from main branch." -ForegroundColor Red
    Write-Host "Create a feature branch first:" -ForegroundColor Yellow
    Write-Host "  git checkout -b feat/your-feature" -ForegroundColor Yellow
    exit 1
}

# Check for uncommitted changes
$status = git status --porcelain 2>$null
if ($status -and -not $AllowDirty) {
    Write-Host "ERROR: Uncommitted changes detected." -ForegroundColor Red
    exit 1
}

# Check gh CLI is available and authenticated
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: GitHub CLI (gh) not found." -ForegroundColor Red
    exit 1
}

gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: GitHub CLI not authenticated." -ForegroundColor Red
    exit 1
}

# Push branch
git push -u origin HEAD

# Create or reuse PR
$prUrl = gh pr view --json url --jq '.url' 2>&1
if ($LASTEXITCODE -eq 0 -and $prUrl -notmatch "no pull requests") {
    Write-Host "Reusing existing PR: $prUrl"
} else {
    gh pr create --fill --base main
    $prUrl = gh pr view --json url --jq '.url' 2>&1
}

# Enable auto-merge
gh pr merge --auto --squash --delete-branch
```

### scripts/git/check-ci.ps1 (53 lines)

Purpose: Check GitHub Actions CI status, optionally wait for completion.

```powershell
param(
    [switch]$Wait,
    [switch]$Logs
)

# Get the latest workflow run
$runs = gh run list --limit 1 --json status,conclusion,name,headBranch,databaseId,createdAt | ConvertFrom-Json

if ($runs.Count -eq 0) {
    Write-Host "No workflow runs found."
    exit 0
}

$run = $runs[0]
$runId = $run.databaseId

if ($Wait -and $run.status -eq "in_progress") {
    gh run watch $runId
    # Refresh status
    $runs = gh run list --limit 1 --json status,conclusion,name,headBranch,databaseId | ConvertFrom-Json
    $run = $runs[0]
}

if ($run.status -eq "completed") {
    if ($run.conclusion -eq "success") {
        Write-Host "CI PASSED" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "CI FAILED: $($run.conclusion)" -ForegroundColor Red
        if ($Logs) {
            gh run view $runId --log-failed
        }
        exit 1
    }
}
```

### scripts/git/check-prs.ps1 (99 lines)

Purpose: List all open PRs with their CI status, warn about failed/conflicting PRs.

```powershell
# Get open PRs
$prs = gh pr list --json number,title,headRefName,state,statusCheckRollup,mergeable --limit 20 | ConvertFrom-Json

foreach ($pr in $prs) {
    # Determine CI status from statusCheckRollup
    # Determine merge status from mergeable field
    # Display with color coding
}
```

### scripts/git/cleanup-branches.ps1 (82 lines)

Purpose: Delete local branches that have been merged to main.

```powershell
param([switch]$DryRun)

# Switch to main for accurate merge detection
git checkout main
git pull origin main

# Get merged branches (excluding main)
$mergedBranches = git branch --merged main --format='%(refname:short)' | Where-Object { $_ -ne "main" }

foreach ($branch in $mergedBranches) {
    git branch -d $branch
}
```

### scripts/git/safe-switch.ps1 (137 lines)

Purpose: Block branch switching if uncommitted or un-PR'd work exists.

```powershell
# CHECK 1: Uncommitted changes
$status = git status --porcelain
if ($status) { exit 1 }

# CHECK 2: Unpushed commits
$unpushed = git log "origin/$currentBranch..$currentBranch" --oneline
if ($unpushed) { exit 1 }

# CHECK 3: Open PR status
$prJson = gh pr list --head $currentBranch --json number,state,mergeable
# Check for missing PR or conflicts
```

### scripts/manual-source-control/commit.ps1 (149 lines)

Purpose: Interactive commit workflow for humans - handles branching, staging, committing, PR creation.

Features:

- `-Quick` flag for auto-generated branch names
- Creates branch if on main
- Stages all changes
- Prompts for commit message
- Creates PR with auto-merge

### scripts/manual-source-control/new-branch.ps1 (97 lines)

Purpose: Create a new branch from main for manual work.

Features:

- `-Quick` flag for timestamp-based branch names (chore/quick-20251226-1430)
- `-Name` parameter for custom names
- Auto-prefixes with chore/ if no prefix specified

---

## Archived GitHub Actions Workflow

### .github/workflows/ci.yml (109 lines)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: windows-latest
    timeout-minutes: 15
    env:
      PUBLIC_SUPABASE_URL: 'https://example.supabase.co'
      PUBLIC_SUPABASE_ANON_KEY: 'dummy'
      CI: true
      PLAYWRIGHT_RETRIES: 2

    steps:
      - uses: actions/checkout@v4

      - name: Detect Node version
        # Reads .nvmrc if exists

      - name: Setup Node.js
        uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm ci

      - name: Cache Playwright browsers
        uses: actions/cache@v4

      - name: Install Playwright browsers
        if: cache miss
        run: npx playwright install --with-deps

      - name: Verify (format, check, lint)
        run: npm run verify

      - name: Run tests
        run: npm run test --if-present

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
```

---

## Archived Documentation References

These files contained CI/branch workflow documentation that was removed:

- `AGENTS.md` - Git workflow section, session-end rules
- `README.md` - Scripts table, manual source control section
- `Docs/DevFramework/ToolSetup
Framework/ToolSetup
/GIT_WORKFLOW.md` - Full PR workflow documentation
- `Docs/DevFramework/ToolSetup
Framework/ToolSetup
/BOOTSTRAP.md` - Watcher setup for CI checks
- `.windsurf/workflows/entrypoints/new-task.md` - Safe-switch check
- `.windsurf/workflows/entrypoints/continue-work.md` - Safe-switch check
- `.windsurf/workflows/entrypoints/new-feature.md` - Safe-switch check
- `.windsurf/workflows/helpers/check-orphaned-branches.md` - Branch health check
- `.windsurf/workflows/helpers/check-pending-prs.md` - PR status check

---

## How To Restore (If Needed)

If you ever want to restore this workflow:

1. Copy the scripts from this archive back to `scripts/git/`
2. Copy the CI workflow to `.github/workflows/ci.yml`
3. Enable branch protection on `main` in GitHub settings
4. Re-add the documentation to AGENTS.md and workflows

The key GitHub settings were:

- Branch protection rule on `main`
- Require status checks to pass (the `build` job)
- Require PR before merging
- Auto-delete head branches after merge
