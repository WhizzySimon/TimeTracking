# Check GitHub Actions CI status
# Usage: powershell -File scripts/check-ci.ps1 [--wait] [--logs]

param(
    [switch]$Wait,
    [switch]$Logs
)

Write-Host "Checking GitHub Actions CI status..." -ForegroundColor Cyan

# Get the latest workflow run
$runs = gh run list --limit 1 --json status,conclusion,name,headBranch,databaseId,createdAt | ConvertFrom-Json

if ($runs.Count -eq 0) {
    Write-Host "No workflow runs found." -ForegroundColor Yellow
    exit 0
}

$run = $runs[0]
$runId = $run.databaseId

Write-Host "Latest run: $($run.name) on branch '$($run.headBranch)'" -ForegroundColor White
Write-Host "Created: $($run.createdAt)" -ForegroundColor Gray

if ($Wait -and $run.status -eq "in_progress") {
    Write-Host "Waiting for run to complete..." -ForegroundColor Yellow
    gh run watch $runId
    # Refresh status after watch
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
            Write-Host "`n--- Failed Job Logs ---" -ForegroundColor Yellow
            gh run view $runId --log-failed
        } else {
            Write-Host "Run with -Logs to see failure details" -ForegroundColor Gray
        }
        exit 1
    }
} else {
    Write-Host "Status: $($run.status)" -ForegroundColor Yellow
    Write-Host "Run with -Wait to wait for completion" -ForegroundColor Gray
    exit 0
}
