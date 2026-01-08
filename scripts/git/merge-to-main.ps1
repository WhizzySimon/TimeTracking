# Merge dev to main and push
# Usage: .\scripts\git\merge-to-main.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n=== Merge Dev to Main ===" -ForegroundColor Cyan

# Check we're on dev
$branch = git branch --show-current
if ($branch -ne "dev") {
    Write-Host "ERROR: Must be on dev branch. Currently on: $branch" -ForegroundColor Red
    exit 1
}

# Check clean working tree
$status = git status --porcelain
if ($status) {
    Write-Host "ERROR: Working tree not clean:" -ForegroundColor Red
    Write-Host $status
    exit 1
}

# Check dev is pushed
Write-Host "`n[1/5] Fetching from remote..." -ForegroundColor Yellow
git fetch origin

$localDev = git rev-parse dev
$remoteDev = git rev-parse origin/dev
if ($localDev -ne $remoteDev) {
    Write-Host "ERROR: Local dev differs from origin/dev. Push dev first." -ForegroundColor Red
    exit 1
}
Write-Host "  Dev is up to date with origin." -ForegroundColor Green

# Switch to main
Write-Host "`n[2/5] Switching to main..." -ForegroundColor Yellow
git checkout main
git pull origin main

# Merge dev
Write-Host "`n[3/5] Merging dev into main (fast-forward)..." -ForegroundColor Yellow
git merge dev --ff-only

# Push main
Write-Host "`n[4/5] Pushing main to origin..." -ForegroundColor Yellow
git push origin main

# Switch back to dev
Write-Host "`n[5/5] Switching back to dev..." -ForegroundColor Yellow
git checkout dev

Write-Host "`n=== Done! Main is now up to date with dev ===" -ForegroundColor Green
