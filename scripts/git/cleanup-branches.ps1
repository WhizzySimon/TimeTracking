<#
.SYNOPSIS
    Delete local branches that have been merged to main.

.DESCRIPTION
    Safely cleans up local branches after their PRs have merged.
    Only deletes branches that are fully merged to main.
    Never deletes main or the current branch.

.PARAMETER DryRun
    Show what would be deleted without actually deleting.

.EXAMPLE
    powershell -File scripts/git/cleanup-branches.ps1
    # Delete all merged local branches

.EXAMPLE
    powershell -File scripts/git/cleanup-branches.ps1 -DryRun
    # Preview what would be deleted
#>

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cleanup Merged Branches" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Gray

# Make sure we're on main for accurate merge detection
if ($currentBranch -ne "main") {
    Write-Host ""
    Write-Host "Switching to main for accurate merge detection..." -ForegroundColor Yellow
    git checkout main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to switch to main" -ForegroundColor Red
        exit 1
    }
    git pull origin main
}

# Get merged branches (excluding main)
$mergedBranches = git branch --merged main --format='%(refname:short)' | Where-Object { $_ -ne "main" -and $_ -ne "" }

if (-not $mergedBranches -or $mergedBranches.Count -eq 0) {
    Write-Host ""
    Write-Host "No merged branches to clean up." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "Merged branches found: $($mergedBranches.Count)" -ForegroundColor Yellow

foreach ($branch in $mergedBranches) {
    if ($DryRun) {
        Write-Host "  [DRY RUN] Would delete: $branch" -ForegroundColor Gray
    } else {
        Write-Host "  Deleting: $branch" -NoNewline
        git branch -d $branch 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host " OK" -ForegroundColor Green
        } else {
            Write-Host " FAILED (may have unmerged commits)" -ForegroundColor Red
        }
    }
}

Write-Host ""
if ($DryRun) {
    Write-Host "DRY RUN complete. Use without -DryRun to actually delete." -ForegroundColor Yellow
} else {
    Write-Host "Cleanup complete." -ForegroundColor Green
}
