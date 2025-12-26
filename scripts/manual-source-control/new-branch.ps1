<#
.SYNOPSIS
    Create a new branch from main for manual work.

.DESCRIPTION
    Use this when you want to start working on something manually but haven't made changes yet.
    Creates a chore branch and switches to it.

.PARAMETER Name
    Branch name suffix (will be prefixed with chore/)

.PARAMETER Quick
    Auto-generate branch name with timestamp (chore/quick-20251226-1430)

.EXAMPLE
    ./scripts/manual-source-control/new-branch.ps1 -Name "update-config"
    # Creates: chore/update-config

.EXAMPLE
    ./scripts/manual-source-control/new-branch.ps1 -Quick
    # Creates: chore/quick-20251226-1430
#>

param(
    [string]$Name,
    [switch]$Quick
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Create New Branch" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: " -NoNewline
Write-Host $currentBranch -ForegroundColor Yellow

# If not on main, warn
if ($currentBranch -ne "main") {
    Write-Host ""
    Write-Host "WARNING: You're not on main." -ForegroundColor Yellow
    Write-Host "New branch will be created from '$currentBranch'" -ForegroundColor Yellow
    $continue = Read-Host "Continue? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Cancelled." -ForegroundColor Gray
        exit 0
    }
}

# Determine branch name
if ($Quick) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmm"
    $BranchName = "chore/quick-$timestamp"
} elseif ($Name) {
    # Add chore/ prefix if not already prefixed
    if ($Name -match "^(feat|fix|docs|chore|refactor|test)/") {
        $BranchName = $Name
    } else {
        $BranchName = "chore/$Name"
    }
} else {
    Write-Host ""
    Write-Host "Branch naming:" -ForegroundColor Gray
    Write-Host "  -Name 'description'  -> chore/description" -ForegroundColor Gray
    Write-Host "  -Quick               -> chore/quick-timestamp" -ForegroundColor Gray
    Write-Host ""
    $Name = Read-Host "Enter branch name (or use -Quick)"
    if (-not $Name) {
        Write-Host "ERROR: Branch name is required." -ForegroundColor Red
        exit 1
    }
    if ($Name -match "^(feat|fix|docs|chore|refactor|test)/") {
        $BranchName = $Name
    } else {
        $BranchName = "chore/$Name"
    }
}

# Create branch
Write-Host ""
Write-Host "Creating branch: $BranchName" -ForegroundColor Green
git checkout -b $BranchName
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create branch." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Ready to work on '$BranchName'" -ForegroundColor Green
Write-Host ""
Write-Host "When done, use:" -ForegroundColor Gray
Write-Host "  ./scripts/manual-source-control/commit.ps1" -ForegroundColor White
