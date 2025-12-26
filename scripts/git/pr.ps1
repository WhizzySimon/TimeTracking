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

# --------- Validation ---------

# Check we're in a git repo
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

Write-Host "Branch: $branch" -ForegroundColor Cyan

# Check for uncommitted changes
$status = git status --porcelain 2>$null
if ($status -and -not $AllowDirty) {
    Write-Host "ERROR: Uncommitted changes detected." -ForegroundColor Red
    Write-Host "Commit your changes first, or use -AllowDirty to proceed anyway." -ForegroundColor Yellow
    Write-Host "  git add -A; git commit -m 'your message'" -ForegroundColor Yellow
    exit 1
}

# Check gh CLI is available
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: GitHub CLI (gh) not found." -ForegroundColor Red
    Write-Host "Install from: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check gh is authenticated
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: GitHub CLI not authenticated." -ForegroundColor Red
    Write-Host "Run: gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "OK: Validation passed" -ForegroundColor Green

# --------- Push ---------

Write-Host ""
Write-Host "Pushing branch to origin..." -ForegroundColor Cyan
git push -u origin HEAD
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to push branch" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Branch pushed" -ForegroundColor Green

# --------- Create or Reuse PR ---------

Write-Host ""
Write-Host "Checking for existing PR..." -ForegroundColor Cyan

# Use try-catch because gh pr view writes to stderr when no PR exists,
# and $ErrorActionPreference = "Stop" would terminate the script
$prUrl = $null
$prExists = $false
try {
    $prUrl = gh pr view --json url --jq '.url' 2>&1
    if ($LASTEXITCODE -eq 0 -and $prUrl -and $prUrl -notmatch "no pull requests") {
        $prExists = $true
    }
} catch {
    $prExists = $false
}

if ($prExists) {
    Write-Host "OK: Reusing existing PR: $prUrl" -ForegroundColor Green
} else {
    Write-Host "Creating new PR..." -ForegroundColor Cyan
    gh pr create --fill --base main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create PR" -ForegroundColor Red
        exit 1
    }
    # Get the PR URL after creation
    try {
        $prUrl = gh pr view --json url --jq '.url' 2>&1
    } catch {
        $prUrl = "(URL not available)"
    }
    Write-Host "OK: PR created: $prUrl" -ForegroundColor Green
}

# --------- Enable Auto-Merge ---------

Write-Host ""
Write-Host "Enabling auto-merge (squash, delete-branch)..." -ForegroundColor Cyan
gh pr merge --auto --squash --delete-branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to enable auto-merge" -ForegroundColor Red
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "  - PR has merge conflicts" -ForegroundColor Yellow
    Write-Host "  - Required checks not configured correctly" -ForegroundColor Yellow
    exit 1
}

# --------- Summary ---------

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SUCCESS: PR workflow complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "PR URL:      $prUrl" -ForegroundColor Cyan
Write-Host "Merge mode:  squash (auto-merge enabled)" -ForegroundColor Cyan
Write-Host "Branch:      will be deleted after merge" -ForegroundColor Cyan
Write-Host ""
Write-Host "The PR will merge automatically when CI passes." -ForegroundColor Yellow
Write-Host "Check status: gh pr view" -ForegroundColor Yellow
