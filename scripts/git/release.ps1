#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Release script for TimeTracker

.DESCRIPTION
    What it does:
      1. Validates you're on dev branch with clean working tree
      2. Gets the latest version tag from dev
      3. Pulls latest from dev and main
      4. Merges dev into main (fast-forward)
      5. Pushes main and tags to GitHub
      6. Creates GitHub release using gh CLI
      7. Switches back to dev branch

.PARAMETER Force
    Skip confirmation prompt

.EXAMPLE
    .\scripts\git\release.ps1
    .\scripts\git\release.ps1 -Force

.NOTES
    Prerequisites:
      - Run `node scripts/git/bump-version.js` first to create a version tag
      - GitHub CLI (gh) installed and authenticated
      - Clean working tree
      - On dev branch
#>

param(
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

function Invoke-Command-Safe {
    param(
        [string]$Command,
        [switch]$IgnoreError,
        [switch]$Live
    )
    
    Write-Host "  `$ $Command" -ForegroundColor DarkGray
    
    try {
        if ($Live) {
            Invoke-Expression $Command
            if ($LASTEXITCODE -ne 0) {
                throw "Command failed with exit code $LASTEXITCODE"
            }
        } else {
            $output = Invoke-Expression $Command 2>&1
            if ($LASTEXITCODE -ne 0 -and -not $IgnoreError) {
                throw "Command failed: $output"
            }
            return ($output | Out-String).Trim()
        }
    } catch {
        if ($IgnoreError) {
            return ''
        }
        Write-Host "  ERROR: $_" -ForegroundColor Red
        exit 1
    }
}

function Get-LatestTag {
    try {
        $tag = git describe --tags --abbrev=0 2>$null
        if ($tag -match '^v?\d+\.\d+\.\d+$') {
            if ($tag.StartsWith('v')) {
                return $tag
            } else {
                return "v$tag"
            }
        }
    } catch {
        # No tags found
    }
    return $null
}

function Main {
    Write-Host "`n=== TimeTracker Release Script ===`n" -ForegroundColor Cyan

    # Get latest version tag
    $tag = Get-LatestTag
    if (-not $tag) {
        Write-Host "ERROR: No version tag found." -ForegroundColor Red
        Write-Host "Run ``node scripts/git/bump-version.js`` first to create a version tag." -ForegroundColor Red
        exit 1
    }

    $version = $tag -replace '^v', ''
    Write-Host "Releasing version: $version (tag: $tag)`n" -ForegroundColor Green

    # Step 1: Validate current state
    Write-Host "[ 1 / 6 ] Validating current state..." -ForegroundColor Yellow
    $currentBranch = Invoke-Command-Safe "git branch --show-current"
    if ($currentBranch -ne 'dev') {
        Write-Host "  ERROR: Must be on dev branch. Currently on: $currentBranch" -ForegroundColor Red
        exit 1
    }

    $status = Invoke-Command-Safe "git status --porcelain"
    if ($status) {
        Write-Host "  ERROR: Working tree not clean. Commit or discard changes first." -ForegroundColor Red
        Write-Host "  $status" -ForegroundColor Red
        exit 1
    }
    Write-Host "  OK." -ForegroundColor Green

    # Confirm release
    if (-not $Force) {
        $confirm = Read-Host "Release $tag to production? (y/n)"
        if ($confirm -ne 'y' -and $confirm -ne 'yes') {
            Write-Host "Aborted." -ForegroundColor Yellow
            exit 0
        }
    }

    # Step 2: Pull latest
    Write-Host "[ 2 / 6 ] Pulling latest from remote..." -ForegroundColor Yellow
    Invoke-Command-Safe "git fetch origin" | Out-Null
    Invoke-Command-Safe "git pull origin dev" | Out-Null
    Write-Host "  OK." -ForegroundColor Green

    # Step 3: Switch to main and merge
    Write-Host "[ 3 / 6 ] Merging dev into main..." -ForegroundColor Yellow
    Invoke-Command-Safe "git checkout main" | Out-Null
    Invoke-Command-Safe "git pull origin main" | Out-Null
    Invoke-Command-Safe "git merge dev --ff-only" | Out-Null
    Write-Host "  OK." -ForegroundColor Green

    # Step 4: Push to GitHub
    Write-Host "[ 4 / 6 ] Pushing main and tags to GitHub..." -ForegroundColor Yellow
    Invoke-Command-Safe "git push origin main" -Live
    Invoke-Command-Safe "git push origin --tags" -Live
    Write-Host "  OK." -ForegroundColor Green

    # Step 5: Create GitHub release
    Write-Host "[ 5 / 6 ] Creating GitHub release..." -ForegroundColor Yellow
    $ghCheck = Invoke-Command-Safe "gh --version" -IgnoreError
    if (-not $ghCheck) {
        Write-Host "  WARNING: GitHub CLI (gh) not found. Skipping release creation." -ForegroundColor Yellow
        Write-Host "  Install gh: https://cli.github.com/" -ForegroundColor Yellow
        Write-Host "  Manual: https://github.com/WhizzySimon/TimeTracking/releases/new?tag=$tag" -ForegroundColor Yellow
    } else {
        Invoke-Command-Safe "gh release create $tag --title `"Release $tag`" --generate-notes" -Live
        Write-Host "  OK." -ForegroundColor Green
    }

    # Step 6: Switch back to dev
    Write-Host "[ 6 / 6 ] Switching back to dev branch..." -ForegroundColor Yellow
    Invoke-Command-Safe "git checkout dev" | Out-Null
    Write-Host "  OK." -ForegroundColor Green

    Write-Host "`n=== Release $tag complete! ===`n" -ForegroundColor Cyan
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  - Netlify will auto-deploy main to production" -ForegroundColor White
    Write-Host "  - View release: https://github.com/WhizzySimon/TimeTracking/releases/tag/$tag" -ForegroundColor White
    Write-Host ""
}

# Run main function
try {
    Main
} catch {
    Write-Host "Unexpected error: $_" -ForegroundColor Red
    exit 1
}
