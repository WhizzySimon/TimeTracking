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

function Get-CurrentVersion {
    try {
        # Get all tags sorted by version, pick the latest
        $tags = git tag --sort=-version:refname
        if ($tags) {
            $tag = $tags | Select-Object -First 1
            if ($tag -match '^v?(\d+\.\d+\.\d+)$') {
                return $Matches[1]
            }
        }
    } catch {
        # No tags found
    }
    return '0.0.0'
}

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

function Main {
    Write-Host "`n=== TimeTracker Release Script ===`n" -ForegroundColor Cyan

    # Step 1: Validate current state and switch to dev if needed
    Write-Host "[ 1 / 8 ] Validating current state..." -ForegroundColor Yellow
    $currentBranch = Invoke-Command-Safe "git branch --show-current"
    
    if ($currentBranch -ne 'dev') {
        Write-Host "  Currently on: $currentBranch" -ForegroundColor Yellow
        Write-Host "  Switching to dev branch..." -ForegroundColor Yellow
        Invoke-Command-Safe "git checkout dev" | Out-Null
        Write-Host "  Switched to dev" -ForegroundColor Green
    }

    $status = Invoke-Command-Safe "git status --porcelain"
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

    # Step 4: Fetch and validate remote state
    Write-Host "`n[ 3 / 8 ] Fetching from remote..." -ForegroundColor Yellow
    Invoke-Command-Safe "git fetch origin" | Out-Null

    $localDev = git rev-parse dev
    $remoteDev = git rev-parse origin/dev 2>$null
    if ($remoteDev -and $localDev -ne $remoteDev) {
        Write-Host "  WARNING: Local dev differs from origin/dev" -ForegroundColor Yellow
        Write-Host "  Pushing dev to remote..." -ForegroundColor Yellow
        Invoke-Command-Safe "git push origin dev" | Out-Null
    }
    Write-Host "  OK - Remote is up to date" -ForegroundColor Green

    # Step 5: Switch to main and merge
    Write-Host "`n[ 4 / 8 ] Merging dev into main..." -ForegroundColor Yellow
    Invoke-Command-Safe "git checkout main" | Out-Null
    Invoke-Command-Safe "git pull origin main" | Out-Null

    # Try fast-forward first, fall back to regular merge if needed
    $ffResult = Invoke-Command-Safe "git merge dev --ff-only" -IgnoreError
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Merged (fast-forward)" -ForegroundColor Green
    } else {
        Write-Host "  Fast-forward not possible, performing regular merge..." -ForegroundColor Yellow
        Invoke-Command-Safe "git merge dev --no-ff -m `"Merge dev into main for release $tag`"" | Out-Null
        Write-Host "  Merged (no fast-forward)" -ForegroundColor Green
    }

    # Step 6: Create version tag ON MAIN (not on dev!)
    Write-Host "`n[ 5 / 8 ] Creating version tag on main..." -ForegroundColor Yellow
    Invoke-Command-Safe "git tag -a $tag -m `"Release $newVersion`"" | Out-Null
    Write-Host "  Created tag: $tag" -ForegroundColor Green

    # Step 7: Push to GitHub
    Write-Host "`n[ 6 / 8 ] Pushing to GitHub..." -ForegroundColor Yellow
    Invoke-Command-Safe "git push origin main" -Live
    Invoke-Command-Safe "git push origin $tag" -Live
    Write-Host "  Pushed main and tag $tag" -ForegroundColor Green

    # Step 8: Create GitHub release
    Write-Host "`n[ 7 / 8 ] Creating GitHub release..." -ForegroundColor Yellow
    $ghCheck = Invoke-Command-Safe "gh --version" -IgnoreError
    if (-not $ghCheck) {
        Write-Host "  WARNING: GitHub CLI (gh) not found. Skipping release creation." -ForegroundColor Yellow
        Write-Host "  Install gh: https://cli.github.com/" -ForegroundColor Gray
        Write-Host "  Manual release: https://github.com/WhizzySimon/TimeTracking/releases/new?tag=$tag" -ForegroundColor Gray
    } else {
        Invoke-Command-Safe "gh release create $tag --title `"Release $tag`" --generate-notes" -Live
        Write-Host "  Created GitHub release: $tag" -ForegroundColor Green
    }

    # Step 9: Switch back to dev
    Write-Host "`n[ 8 / 8 ] Switching back to dev..." -ForegroundColor Yellow
    Invoke-Command-Safe "git checkout dev" | Out-Null
    Write-Host "  Back on dev branch" -ForegroundColor Green

    # Success summary
    Write-Host "`n=== Release $tag Complete! ===`n" -ForegroundColor Cyan
    Write-Host "Version: $currentVersion → $newVersion" -ForegroundColor White
    Write-Host "`nWhat happened:" -ForegroundColor White
    Write-Host "  ✓ Merged dev into main" -ForegroundColor Green
    Write-Host "  ✓ Created tag $tag on main" -ForegroundColor Green
    Write-Host "  ✓ Pushed main and tag to GitHub" -ForegroundColor Green
    if ($ghCheck) {
        Write-Host "  ✓ Created GitHub release" -ForegroundColor Green
    }
    Write-Host "`nNext steps:" -ForegroundColor White
    Write-Host "  - Netlify will auto-deploy main to production" -ForegroundColor Gray
    Write-Host "  - View release: https://github.com/WhizzySimon/TimeTracking/releases/tag/$tag" -ForegroundColor Gray
    Write-Host ""
}

# Run main function
try {
    Main
} catch {
    Write-Host "Unexpected error: $_" -ForegroundColor Red
    exit 1
}
