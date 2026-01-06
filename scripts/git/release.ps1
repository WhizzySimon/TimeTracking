#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Complete release script for TimeTracker

.DESCRIPTION
    Automated release workflow:
      1. Validates you're on dev branch with clean working tree
      2. Shows current version and prompts for new version (major/minor/patch)
      3. Creates new version tag on dev
      4. Pulls latest from dev and main
      5. Merges dev into main
      6. Pushes main and tags to GitHub
      7. Creates GitHub release using gh CLI
      8. Switches back to dev branch

.PARAMETER BumpType
    Version bump type: major, minor, or patch (optional - will prompt if not provided)

.PARAMETER Force
    Skip confirmation prompts

.EXAMPLE
    .\scripts\git\release.ps1
    .\scripts\git\release.ps1 -BumpType patch
    .\scripts\git\release.ps1 -BumpType minor -Force

.NOTES
    Prerequisites:
      - GitHub CLI (gh) installed and authenticated (optional, for auto-release creation)
      - Clean working tree
      - On dev branch
#>

param(
    [ValidateSet('major', 'minor', 'patch')]
    [string]$BumpType,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

# Helper function to get current version from git tags
function Get-CurrentVersion {
    try {
        $tag = git describe --tags --abbrev=0 2>$null
        if ($tag -match '^v?(\d+\.\d+\.\d+)$') {
            return $Matches[1]
        }
    } catch {
        # No tags found
    }
    return '0.0.0'
}

# Helper function to bump version
function Get-BumpedVersion {
    param(
        [string]$CurrentVersion,
        [string]$BumpType
    )
    
    $parts = $CurrentVersion.Split('.')
    $major = [int]$parts[0]
    $minor = [int]$parts[1]
    $patch = [int]$parts[2]
    
    switch ($BumpType) {
        'major' { return "$($major + 1).0.0" }
        'minor' { return "$major.$($minor + 1).0" }
        'patch' { return "$major.$minor.$($patch + 1)" }
    }
}

# Main script
Write-Host "`n=== TimeTracker Release Script ===`n" -ForegroundColor Cyan

# Step 1: Validate current state and switch to dev if needed
Write-Host "`n[ 1 / 8 ] Validating current state..." -ForegroundColor Yellow
$currentBranch = git branch --show-current

if ($currentBranch -ne 'dev') {
    Write-Host "  Currently on: $currentBranch" -ForegroundColor Yellow
    Write-Host "  Switching to dev branch..." -ForegroundColor Yellow
    git checkout dev 2>&1 | Out-Null
    Write-Host "  Switched to dev" -ForegroundColor Green
}

$status = git status --porcelain
if ($status) {
    Write-Host "  ERROR: Working tree not clean. Commit or discard changes first." -ForegroundColor Red
    Write-Host "  $status" -ForegroundColor Red
    exit 1
}
Write-Host "  OK - On dev branch with clean working tree" -ForegroundColor Green

# Step 2: Get current version and determine new version
Write-Host "`n[ 2 / 8 ] Determining version..." -ForegroundColor Yellow
$currentVersion = Get-CurrentVersion
Write-Host "  Current version: $currentVersion" -ForegroundColor White

# Prompt for bump type if not provided
if (-not $BumpType) {
    Write-Host "`n  Bump types:" -ForegroundColor White
    Write-Host "    major - Breaking changes ($currentVersion → $((Get-BumpedVersion $currentVersion 'major')))" -ForegroundColor Gray
    Write-Host "    minor - New features ($currentVersion → $((Get-BumpedVersion $currentVersion 'minor')))" -ForegroundColor Gray
    Write-Host "    patch - Bug fixes ($currentVersion → $((Get-BumpedVersion $currentVersion 'patch')))" -ForegroundColor Gray
    
    do {
        $BumpType = Read-Host "`n  Enter bump type (major/minor/patch)"
        $BumpType = $BumpType.ToLower().Trim()
    } while ($BumpType -notin @('major', 'minor', 'patch'))
}

$newVersion = Get-BumpedVersion $currentVersion $BumpType
$tag = "v$newVersion"

Write-Host "  New version: $newVersion (tag: $tag)" -ForegroundColor Green

# Check if tag already exists
$existingTag = git tag -l $tag
if ($existingTag) {
    Write-Host "  ERROR: Tag $tag already exists." -ForegroundColor Red
    exit 1
}

# Step 3: Confirm release
if (-not $Force) {
    Write-Host "`n" -NoNewline
    $confirm = Read-Host "Create release $tag and deploy to production? (y/n)"
    if ($confirm -ne 'y' -and $confirm -ne 'yes') {
        Write-Host "Aborted." -ForegroundColor Yellow
        exit 0
    }
}

# Step 4: Create version tag
Write-Host "`n[ 3 / 8 ] Creating version tag..." -ForegroundColor Yellow
git tag -a $tag -m "Release $newVersion"
Write-Host "  Created tag: $tag" -ForegroundColor Green

# Step 5: Fetch and validate remote state
Write-Host "`n[ 4 / 8 ] Fetching from remote..." -ForegroundColor Yellow
git fetch origin 2>&1 | Out-Null

$localDev = git rev-parse dev
$remoteDev = git rev-parse origin/dev 2>$null
if ($remoteDev -and $localDev -ne $remoteDev) {
    Write-Host "  WARNING: Local dev differs from origin/dev" -ForegroundColor Yellow
    Write-Host "  Pushing dev to remote..." -ForegroundColor Yellow
    git push origin dev 2>&1 | Out-Null
}
Write-Host "  OK - Remote is up to date" -ForegroundColor Green

# Step 6: Switch to main and merge
Write-Host "`n[ 5 / 8 ] Merging dev into main..." -ForegroundColor Yellow
git checkout main 2>&1 | Out-Null
git pull origin main 2>&1 | Out-Null

# Try fast-forward first, fall back to regular merge if needed
try {
    git merge dev --ff-only 2>&1 | Out-Null
    Write-Host "  Merged (fast-forward)" -ForegroundColor Green
} catch {
    Write-Host "  Fast-forward not possible, performing regular merge..." -ForegroundColor Yellow
    git merge dev --no-ff -m "Merge dev into main for release $tag" 2>&1 | Out-Null
    Write-Host "  Merged (no fast-forward)" -ForegroundColor Green
}

# Step 7: Push to GitHub
Write-Host "`n[ 6 / 8 ] Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
git push origin $tag
Write-Host "  Pushed main and tag $tag" -ForegroundColor Green

# Step 8: Create GitHub release
Write-Host "`n[ 7 / 8 ] Creating GitHub release..." -ForegroundColor Yellow
$ghVersion = gh --version 2>$null
if (-not $ghVersion) {
    Write-Host "  WARNING: GitHub CLI (gh) not found. Skipping release creation." -ForegroundColor Yellow
    Write-Host "  Install gh: https://cli.github.com/" -ForegroundColor Gray
    Write-Host "  Manual release: https://github.com/WhizzySimon/TimeTracking/releases/new?tag=$tag" -ForegroundColor Gray
} else {
    gh release create $tag --title "Release $tag" --generate-notes 2>&1 | Out-Null
    Write-Host "  Created GitHub release: $tag" -ForegroundColor Green
}

# Step 9: Switch back to dev
Write-Host "`n[ 8 / 8 ] Switching back to dev..." -ForegroundColor Yellow
git checkout dev 2>&1 | Out-Null
Write-Host "  Back on dev branch" -ForegroundColor Green

# Success summary
Write-Host "`n=== Release $tag Complete! ===`n" -ForegroundColor Cyan
Write-Host "Version: $currentVersion → $newVersion" -ForegroundColor White
Write-Host "`nWhat happened:" -ForegroundColor White
Write-Host "  ✓ Created tag $tag on dev" -ForegroundColor Green
Write-Host "  ✓ Merged dev into main" -ForegroundColor Green
Write-Host "  ✓ Pushed main and tag to GitHub" -ForegroundColor Green
if ($ghVersion) {
    Write-Host "  ✓ Created GitHub release" -ForegroundColor Green
}
Write-Host "`nNext steps:" -ForegroundColor White
Write-Host "  - Netlify will auto-deploy main to production" -ForegroundColor Gray
Write-Host "  - View release: https://github.com/WhizzySimon/TimeTracking/releases/tag/$tag" -ForegroundColor Gray
Write-Host ""
