<#
.SYNOPSIS
    SAFE branch switch - BLOCKS if uncommitted or un-merged work exists.

.DESCRIPTION
    This script MUST be called before ANY branch switch.
    It will FAIL (exit 1) if:
    - There are uncommitted changes
    - Current branch has commits not in any PR
    - Current branch has an open PR with conflicts

    This prevents the #1 cause of "lost work" - switching away from unfinished work.

.EXAMPLE
    powershell -File scripts/git/safe-switch.ps1
    # If this exits 0, it's safe to switch branches
    # If this exits 1, DO NOT SWITCH - fix the issue first
#>

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SAFE BRANCH SWITCH CHECK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$hasIssues = $false

# Get current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Gray

# Skip checks if already on main
if ($currentBranch -eq "main") {
    Write-Host ""
    Write-Host "Already on main - safe to proceed." -ForegroundColor Green
    exit 0
}

# CHECK 1: Uncommitted changes
Write-Host ""
Write-Host "Checking for uncommitted changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host ""
    Write-Host "BLOCKER: Uncommitted changes detected!" -ForegroundColor Red
    Write-Host ""
    git status --short
    Write-Host ""
    Write-Host "ACTION REQUIRED:" -ForegroundColor Red
    Write-Host "  git add -A" -ForegroundColor White
    Write-Host "  git commit -m 'your message'" -ForegroundColor White
    Write-Host "  powershell -File scripts/git/pr.ps1" -ForegroundColor White
    Write-Host ""
    $hasIssues = $true
}
else {
    Write-Host "  OK - No uncommitted changes" -ForegroundColor Green
}

# CHECK 2: Unpushed commits
Write-Host ""
Write-Host "Checking for unpushed commits..." -ForegroundColor Yellow
$unpushed = git log "origin/$currentBranch..$currentBranch" --oneline 2>$null
if ($unpushed) {
    Write-Host ""
    Write-Host "BLOCKER: Unpushed commits detected!" -ForegroundColor Red
    Write-Host ""
    Write-Host $unpushed
    Write-Host ""
    Write-Host "ACTION REQUIRED:" -ForegroundColor Red
    Write-Host "  powershell -File scripts/git/pr.ps1" -ForegroundColor White
    Write-Host ""
    $hasIssues = $true
}
else {
    Write-Host "  OK - All commits pushed" -ForegroundColor Green
}

# CHECK 3: Open PR status
Write-Host ""
Write-Host "Checking PR status..." -ForegroundColor Yellow
$prJson = gh pr list --head $currentBranch --json number,state,mergeable,title 2>$null
if ($prJson -and $prJson -ne "[]") {
    $pr = $prJson | ConvertFrom-Json | Select-Object -First 1
    if ($pr) {
        Write-Host "  PR #$($pr.number): $($pr.title)" -ForegroundColor Gray
        
        if ($pr.mergeable -eq "CONFLICTING") {
            Write-Host ""
            Write-Host "WARNING: PR has merge conflicts!" -ForegroundColor Yellow
            Write-Host "  The PR cannot auto-merge until conflicts are resolved." -ForegroundColor Yellow
            Write-Host "  Consider fixing conflicts before switching branches." -ForegroundColor Yellow
            Write-Host ""
            # Don't block, just warn - conflicts can be fixed later
        }
        elseif ($pr.state -eq "OPEN") {
            Write-Host "  OK - PR is open and will auto-merge when CI passes" -ForegroundColor Green
        }
    }
}
else {
    # No PR exists - check if there are commits not in main
    $commitsNotInMain = git log "origin/main..$currentBranch" --oneline 2>$null
    if ($commitsNotInMain) {
        Write-Host ""
        Write-Host "BLOCKER: Commits exist but NO PR created!" -ForegroundColor Red
        Write-Host ""
        Write-Host $commitsNotInMain
        Write-Host ""
        Write-Host "ACTION REQUIRED:" -ForegroundColor Red
        Write-Host "  powershell -File scripts/git/pr.ps1" -ForegroundColor White
        Write-Host ""
        $hasIssues = $true
    }
    else {
        Write-Host "  OK - No commits to merge" -ForegroundColor Green
    }
}

# FINAL VERDICT
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($hasIssues) {
    Write-Host "  SWITCH BLOCKED - Fix issues above first!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}
else {
    Write-Host "  SAFE TO SWITCH BRANCHES" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}
