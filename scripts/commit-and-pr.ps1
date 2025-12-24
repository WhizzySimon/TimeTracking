<#
.SYNOPSIS
    All-in-one workflow: create branch, commit, push, create PR, enable auto-merge.
.DESCRIPTION
    Complete git workflow in one command:
    1. Prompts for commit message
    2. Creates feature branch from commit message (or uses provided name)
    3. Stages all changes
    4. Commits with the message
    5. Pushes to origin
    6. Creates PR
    7. Enables auto-merge with squash strategy
    
    The PR will automatically merge when CI passes.
.PARAMETER BranchName
    Optional branch name. If not provided, derives from commit message.
.PARAMETER Message
    Optional commit message. If not provided, prompts interactively.
.EXAMPLE
    powershell -File scripts/commit-and-pr.ps1
.EXAMPLE
    powershell -File scripts/commit-and-pr.ps1 -Message "feat: add new feature"
.EXAMPLE
    powershell -File scripts/commit-and-pr.ps1 -BranchName "feat/my-feature" -Message "feat: add new feature"
#>

param(
    [string]$BranchName,
    [string]$Message
)

$ErrorActionPreference = "Stop"

# --------- Validation ---------

# Check we're in a git repo
$currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
if ($LASTEXITCODE -ne 0 -or -not $currentBranch) {
    Write-Host "ERROR: Not in a git repository" -ForegroundColor Red
    exit 1
}

# Check for changes to commit
$status = git status --porcelain 2>$null
if (-not $status) {
    Write-Host "ERROR: No changes to commit" -ForegroundColor Red
    exit 1
}

Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
Write-Host "Changes detected:" -ForegroundColor Cyan
git status --short

# Check gh CLI is available
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: GitHub CLI (gh) not found." -ForegroundColor Red
    Write-Host "Install from: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check gh is authenticated
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: GitHub CLI not authenticated." -ForegroundColor Red
    Write-Host "Run: gh auth login" -ForegroundColor Yellow
    exit 1
}

# --------- Get Commit Message ---------

Write-Host ""
if (-not $Message) {
    Write-Host "Enter commit message (e.g., 'feat: add new feature'):" -ForegroundColor Yellow
    $Message = Read-Host "Message"
    if (-not $Message) {
        Write-Host "ERROR: Commit message is required" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Commit message: $Message" -ForegroundColor Cyan

# --------- Derive Branch Name ---------

if (-not $BranchName) {
    # Extract prefix and create branch name from commit message
    # "feat: add new feature" -> "feat/add-new-feature"
    # "fix(auth): resolve login issue" -> "fix/resolve-login-issue"
    
    $prefix = "feat"
    $slug = $Message
    
    # Extract conventional commit prefix
    if ($Message -match "^(feat|fix|docs|refactor|chore|test)(\([^)]+\))?:\s*(.+)$") {
        $prefix = $Matches[1]
        $slug = $Matches[3]
    } elseif ($Message -match "^(feat|fix|docs|refactor|chore|test):\s*(.+)$") {
        $prefix = $Matches[1]
        $slug = $Matches[2]
    }
    
    # Convert to branch-friendly slug
    $slug = $slug.ToLower() -replace '[^a-z0-9]+', '-' -replace '^-|-$', ''
    $slug = $slug.Substring(0, [Math]::Min(40, $slug.Length))  # Limit length
    
    $BranchName = "$prefix/$slug"
}

Write-Host "Branch name: $BranchName" -ForegroundColor Cyan

# --------- Create Branch (if needed) ---------

Write-Host ""
if ($currentBranch -eq "main") {
    Write-Host "Creating feature branch..." -ForegroundColor Cyan
    git checkout -b $BranchName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create branch" -ForegroundColor Red
        exit 1
    }
    Write-Host "OK: Created branch $BranchName" -ForegroundColor Green
} elseif ($currentBranch -ne $BranchName) {
    Write-Host "Already on feature branch: $currentBranch" -ForegroundColor Yellow
    $BranchName = $currentBranch
}

# --------- Stage and Commit ---------

Write-Host ""
Write-Host "Staging all changes..." -ForegroundColor Cyan
git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to stage changes" -ForegroundColor Red
    exit 1
}

Write-Host "Committing..." -ForegroundColor Cyan
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to commit" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Changes committed" -ForegroundColor Green

# --------- Push ---------

Write-Host ""
Write-Host "Pushing branch to origin..." -ForegroundColor Cyan
git push -u origin HEAD
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to push branch" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Branch pushed" -ForegroundColor Green

# --------- Create or Reuse PR ---------

Write-Host ""
Write-Host "Checking for existing PR..." -ForegroundColor Cyan

$prUrl = gh pr view --json url --jq '.url' 2>$null
$prExists = $LASTEXITCODE -eq 0 -and $prUrl

if ($prExists) {
    Write-Host "OK: Reusing existing PR: $prUrl" -ForegroundColor Green
} else {
    Write-Host "Creating new PR..." -ForegroundColor Cyan
    gh pr create --fill
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create PR" -ForegroundColor Red
        exit 1
    }
    $prUrl = gh pr view --json url --jq '.url' 2>$null
    Write-Host "OK: PR created: $prUrl" -ForegroundColor Green
}

# --------- Enable Auto-Merge ---------

Write-Host ""
Write-Host "Enabling auto-merge (squash, delete-branch)..." -ForegroundColor Cyan
gh pr merge --auto --squash --delete-branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to enable auto-merge" -ForegroundColor Red
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "  - Auto-merge not enabled for repo (Settings > General > Allow auto-merge)" -ForegroundColor Yellow
    Write-Host "  - PR has merge conflicts" -ForegroundColor Yellow
    Write-Host "  - Required checks not configured correctly" -ForegroundColor Yellow
    exit 1
}

# --------- Summary ---------

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SUCCESS: Complete workflow finished" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Branch:      $BranchName" -ForegroundColor Cyan
Write-Host "Commit:      $Message" -ForegroundColor Cyan
Write-Host "PR URL:      $prUrl" -ForegroundColor Cyan
Write-Host "Merge mode:  squash (auto-merge enabled)" -ForegroundColor Cyan
Write-Host ""
Write-Host "The PR will merge automatically when CI passes." -ForegroundColor Yellow
Write-Host "Check status: gh pr view" -ForegroundColor Yellow
