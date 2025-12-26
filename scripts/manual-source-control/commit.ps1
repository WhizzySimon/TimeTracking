<#
.SYNOPSIS
    Interactive git commit workflow - handles branching, staging, committing, and PR creation.

.DESCRIPTION
    This script guides you through the full git workflow:
    1. Checks if you're on main (creates branch if needed)
    2. Shows changed files
    3. Stages all changes
    4. Prompts for commit message
    5. Commits and pushes
    6. Creates PR with auto-merge

.EXAMPLE
    ./scripts/manual-source-control/commit.ps1
    # Interactive mode - prompts for everything

.EXAMPLE
    ./scripts/manual-source-control/commit.ps1 -Message "chore: update workspace"
    # With commit message - if on main, prompts for branch name

.EXAMPLE
    ./scripts/manual-source-control/commit.ps1 -Quick -Message "chore: update workspace"
    # Quick mode: auto-generates branch, commits, creates PR - minimal interaction
#>

param(
    [string]$Message,
    [string]$BranchName,
    [switch]$Quick
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Git Commit Workflow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: " -NoNewline
Write-Host $currentBranch -ForegroundColor Yellow

# Step 2: If on main, create a new branch
if ($currentBranch -eq "main") {
    Write-Host ""
    Write-Host "You're on main. A new branch is required." -ForegroundColor Yellow
    
    if (-not $BranchName) {
        Write-Host ""
        Write-Host "Branch naming convention:" -ForegroundColor Gray
        Write-Host "  feat/description  - new feature" -ForegroundColor Gray
        Write-Host "  fix/description   - bug fix" -ForegroundColor Gray
        Write-Host "  docs/description  - documentation" -ForegroundColor Gray
        Write-Host "  refactor/description - refactoring" -ForegroundColor Gray
        Write-Host ""
        $BranchName = Read-Host "Enter branch name (e.g., feat/my-feature)"
    }
    
    if (-not $BranchName) {
        Write-Host "ERROR: Branch name is required." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Creating branch: $BranchName" -ForegroundColor Green
    git checkout -b $BranchName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create branch." -ForegroundColor Red
        exit 1
    }
    $currentBranch = $BranchName
}

# Step 3: Show status
Write-Host ""
Write-Host "Changed files:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Check if there are changes to commit
$status = git status --porcelain
if (-not $status) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    Write-Host ""
    
    # Check if there are unpushed commits
    $unpushed = git log "origin/$currentBranch..$currentBranch" --oneline 2>$null
    if ($unpushed) {
        Write-Host "You have unpushed commits:" -ForegroundColor Yellow
        Write-Host $unpushed
        Write-Host ""
        $push = Read-Host "Push and create PR? (Y/n)"
        if ($push -ne "n" -and $push -ne "N") {
            & "$PSScriptRoot\..\git\pr.ps1"
        }
    }
    exit 0
}

# Step 4: Stage all changes
Write-Host "Staging all changes..." -ForegroundColor Green
git add -A

# Step 5: Get commit message
if (-not $Message) {
    Write-Host ""
    Write-Host "Commit message format:" -ForegroundColor Gray
    Write-Host "  feat: add new feature" -ForegroundColor Gray
    Write-Host "  fix: fix bug" -ForegroundColor Gray
    Write-Host "  docs: update documentation" -ForegroundColor Gray
    Write-Host "  refactor: refactor code" -ForegroundColor Gray
    Write-Host "  test: add tests" -ForegroundColor Gray
    Write-Host "  chore: maintenance" -ForegroundColor Gray
    Write-Host ""
    $Message = Read-Host "Enter commit message"
}

if (-not $Message) {
    Write-Host "ERROR: Commit message is required." -ForegroundColor Red
    exit 1
}

# Step 6: Commit
Write-Host ""
Write-Host "Committing..." -ForegroundColor Green
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Commit failed." -ForegroundColor Red
    exit 1
}

# Step 7: Push and create PR
Write-Host ""
if ($Quick) {
    # Quick mode: auto-create PR without asking
    Write-Host "Quick mode: creating PR automatically..." -ForegroundColor Cyan
    & "$PSScriptRoot\..\git\pr.ps1"
} else {
    $createPR = Read-Host "Push and create PR? (Y/n)"
    if ($createPR -ne "n" -and $createPR -ne "N") {
        & "$PSScriptRoot\..\git\pr.ps1"
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
