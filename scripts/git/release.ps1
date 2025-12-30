# Release: merge dev to main, push, and create GitHub release
# Usage: .\scripts\git\release.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n=== TimeTracker Release Script ===" -ForegroundColor Cyan

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

# Get latest version tag
try {
    $tag = git describe --tags --abbrev=0 2>$null
    if (-not ($tag -match '^v?\d+\.\d+\.\d+$')) {
        throw "Invalid tag"
    }
    if (-not $tag.StartsWith("v")) {
        $tag = "v$tag"
    }
} catch {
    Write-Host "ERROR: No version tag found." -ForegroundColor Red
    Write-Host "Run 'node scripts/git/bump-version.js' first to create a version tag."
    exit 1
}

$version = $tag -replace '^v', ''
Write-Host "`nReleasing version: $version (tag: $tag)" -ForegroundColor White

# Confirm
$confirm = Read-Host "Release $tag to production? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "yes") {
    Write-Host "Aborted."
    exit 0
}

# Check dev is pushed
Write-Host "`n[1/7] Fetching from remote..." -ForegroundColor Yellow
git fetch origin

$localDev = git rev-parse dev
$remoteDev = git rev-parse origin/dev
if ($localDev -ne $remoteDev) {
    Write-Host "ERROR: Local dev differs from origin/dev. Push dev first." -ForegroundColor Red
    exit 1
}
Write-Host "  Dev is up to date with origin." -ForegroundColor Green

# Switch to main
Write-Host "`n[2/7] Switching to main..." -ForegroundColor Yellow
git checkout main
git pull origin main

# Merge dev
Write-Host "`n[3/7] Merging dev into main (fast-forward)..." -ForegroundColor Yellow
git merge dev --ff-only

# Push main
Write-Host "`n[4/7] Pushing main to origin..." -ForegroundColor Yellow
git push origin main

# Push tags
Write-Host "`n[5/7] Pushing tags to origin..." -ForegroundColor Yellow
git push origin --tags

# Create GitHub release
Write-Host "`n[6/7] Creating GitHub release..." -ForegroundColor Yellow
$ghVersion = gh --version 2>$null
if (-not $ghVersion) {
    Write-Host "  WARNING: GitHub CLI (gh) not found. Skipping release creation." -ForegroundColor Yellow
    Write-Host "  Install gh: https://cli.github.com/"
    Write-Host "  Manual: https://github.com/WhizzySimon/TimeTracking/releases/new?tag=$tag"
} else {
    gh release create $tag --title "Release $tag" --generate-notes
    Write-Host "  Release created." -ForegroundColor Green
}

# Switch back to dev
Write-Host "`n[7/7] Switching back to dev..." -ForegroundColor Yellow
git checkout dev

Write-Host "`n=== Release $tag complete! ===" -ForegroundColor Green
Write-Host "`nNext steps:"
Write-Host "  - Netlify will auto-deploy main to production"
Write-Host "  - View release: https://github.com/WhizzySimon/TimeTracking/releases/tag/$tag"
