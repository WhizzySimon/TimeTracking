<#
.SYNOPSIS
    Creates a GitHub PR from the current branch into main.
.DESCRIPTION
    Pushes the current branch and creates a PR using GitHub CLI.
    Fails if on main branch or if gh is not authenticated.
.EXAMPLE
    powershell -File scripts/pr-create.ps1
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
    Write-Host "ERROR: Cannot create PR from main branch." -ForegroundColor Red
    Write-Host "Create a feature branch first: git checkout -b feat/your-feature" -ForegroundColor Yellow
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

# Push branch
Write-Host "Pushing branch to origin..." -ForegroundColor Cyan
git push -u origin HEAD
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to push branch" -ForegroundColor Red
    exit 1
}

# Create PR
Write-Host "Creating PR..." -ForegroundColor Cyan
gh pr create --fill
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create PR" -ForegroundColor Red
    exit 1
}

Write-Host "PR created successfully!" -ForegroundColor Green
Write-Host "Next: Run 'powershell -File scripts/pr-merge-auto.ps1' to enable auto-merge" -ForegroundColor Yellow
