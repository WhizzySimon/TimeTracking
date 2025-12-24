<#
.SYNOPSIS
    Enables auto-merge for the current PR.
.DESCRIPTION
    Enables auto-merge with squash strategy and branch deletion for the PR
    associated with the current branch. Merges automatically when CI passes.
.EXAMPLE
    powershell -File scripts/pr-merge-auto.ps1
#>

$ErrorActionPreference = "Stop"

# Get current branch
$branch = git rev-parse --abbrev-ref HEAD 2>$null
if (-not $branch) {
    Write-Host "ERROR: Not in a git repository" -ForegroundColor Red
    exit 1
}

# Fail if on main
if ($branch -eq "main") {
    Write-Host "ERROR: Cannot enable auto-merge from main branch." -ForegroundColor Red
    exit 1
}

Write-Host "Branch: $branch" -ForegroundColor Cyan

# Check gh is available
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: GitHub CLI (gh) not found. Install from https://cli.github.com/" -ForegroundColor Red
    exit 1
}

# Check gh is authenticated
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: GitHub CLI not authenticated. Run: gh auth login" -ForegroundColor Red
    exit 1
}

# Check PR exists for this branch
$prNumber = gh pr view --json number --jq '.number' 2>$null
if ($LASTEXITCODE -ne 0 -or -not $prNumber) {
    Write-Host "ERROR: No PR found for branch '$branch'" -ForegroundColor Red
    Write-Host "Create a PR first: powershell -File scripts/pr-create.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "PR #$prNumber found" -ForegroundColor Cyan

# Enable auto-merge
Write-Host "Enabling auto-merge (squash, delete-branch)..." -ForegroundColor Cyan
gh pr merge --auto --squash --delete-branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to enable auto-merge" -ForegroundColor Red
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "  - Auto-merge not enabled for repo (Settings > General > Allow auto-merge)" -ForegroundColor Yellow
    Write-Host "  - PR has merge conflicts" -ForegroundColor Yellow
    Write-Host "  - Required checks not configured correctly" -ForegroundColor Yellow
    exit 1
}

Write-Host "Auto-merge enabled! PR will merge when CI passes." -ForegroundColor Green
Write-Host "Check status: gh pr view" -ForegroundColor Cyan
