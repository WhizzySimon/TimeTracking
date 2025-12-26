<#
.SYNOPSIS
    Check for pending or failed PRs that need attention.

.DESCRIPTION
    Lists all open PRs for this repo with their CI status.
    Used at session start to catch PRs that didn't auto-merge.

.EXAMPLE
    powershell -File scripts/git/check-prs.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Checking for pending PRs..." -ForegroundColor Cyan
Write-Host ""

# Check if gh CLI is available
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: GitHub CLI (gh) not installed." -ForegroundColor Red
    Write-Host "Install from: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Get open PRs
$prs = gh pr list --json number,title,headRefName,state,statusCheckRollup,mergeable --limit 20 2>$null | ConvertFrom-Json

if (-not $prs -or $prs.Count -eq 0) {
    Write-Host "No open PRs." -ForegroundColor Green
    exit 0
}

Write-Host "Open PRs:" -ForegroundColor Yellow
Write-Host ""

$hasIssues = $false

foreach ($pr in $prs) {
    $number = $pr.number
    $title = $pr.title
    $branch = $pr.headRefName
    $mergeable = $pr.mergeable
    
    # Determine CI status
    $ciStatus = "UNKNOWN"
    $ciColor = "Gray"
    
    if ($pr.statusCheckRollup) {
        $checks = $pr.statusCheckRollup
        $failed = $checks | Where-Object { $_.conclusion -eq "FAILURE" }
        $pending = $checks | Where-Object { $_.status -eq "IN_PROGRESS" -or $_.status -eq "QUEUED" }
        $success = $checks | Where-Object { $_.conclusion -eq "SUCCESS" }
        
        if ($failed.Count -gt 0) {
            $ciStatus = "FAILED"
            $ciColor = "Red"
            $hasIssues = $true
        } elseif ($pending.Count -gt 0) {
            $ciStatus = "PENDING"
            $ciColor = "Yellow"
        } elseif ($success.Count -gt 0) {
            $ciStatus = "PASSED"
            $ciColor = "Green"
        }
    }
    
    # Determine merge status
    $mergeStatus = ""
    if ($mergeable -eq "CONFLICTING") {
        $mergeStatus = " [CONFLICTS]"
        $hasIssues = $true
    } elseif ($mergeable -eq "UNKNOWN") {
        $mergeStatus = " [MERGE STATUS UNKNOWN]"
    }
    
    Write-Host "  #$number " -NoNewline -ForegroundColor White
    Write-Host "[$ciStatus]" -NoNewline -ForegroundColor $ciColor
    Write-Host "$mergeStatus" -NoNewline -ForegroundColor Red
    Write-Host " $title" -ForegroundColor Gray
    Write-Host "         Branch: $branch" -ForegroundColor DarkGray
}

Write-Host ""

if ($hasIssues) {
    Write-Host "WARNING: Some PRs need attention!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix a failed PR:" -ForegroundColor Yellow
    Write-Host "  1. git checkout <branch-name>" -ForegroundColor Gray
    Write-Host "  2. Fix the issue" -ForegroundColor Gray
    Write-Host "  3. git add -A && git commit -m 'fix: ...' && git push" -ForegroundColor Gray
    Write-Host ""
    exit 1
} else {
    Write-Host "All PRs are OK." -ForegroundColor Green
    exit 0
}
