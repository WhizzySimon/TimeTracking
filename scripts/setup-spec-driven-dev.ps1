# TimeTracker - Setup Spec-Driven Development Structure
# Idempotent script to normalize docs and create templates

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "=== TimeTracker Spec-Driven Dev Setup ===" -ForegroundColor Cyan
Write-Host ""

# Navigate to repo root (script should be run from repo root)
$repoRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $repoRoot "AGENTS.md"))) {
    Write-Error "AGENTS.md not found. Please run this script from repo root."
    exit 1
}

Set-Location $repoRoot
Write-Host "Working directory: $repoRoot" -ForegroundColor Green

# ============================================================================
# A) File renames - SKIP (already done)
# ============================================================================
Write-Host ""
Write-Host "[A] Checking file renames..." -ForegroundColor Yellow

$techGuideOld = 'Docs/Guidelines/Technical Guideline v1.md'
$techGuideNew = 'Docs/Guidelines/technical-guideline-v1.md'
$uiSpecOld = 'Docs/Guidelines/UI & Logik Spezifikation v1.md'
$uiSpecNew = 'Docs/Guidelines/ui-logic-spec-v1.md'

if (Test-Path $techGuideNew) {
    Write-Host "  OK: $techGuideNew already exists (skip rename)" -ForegroundColor Green
} elseif (Test-Path $techGuideOld) {
    Write-Host "  Renaming: $techGuideOld to $techGuideNew" -ForegroundColor Cyan
    Move-Item $techGuideOld $techGuideNew
} else {
    Write-Host "  WARNING: Neither old nor new technical guideline found" -ForegroundColor Yellow
}

if (Test-Path $uiSpecNew) {
    Write-Host "  OK: $uiSpecNew already exists (skip rename)" -ForegroundColor Green
} elseif (Test-Path $uiSpecOld) {
    Write-Host "  Renaming: $uiSpecOld to $uiSpecNew" -ForegroundColor Cyan
    Move-Item $uiSpecOld $uiSpecNew
} else {
    Write-Host "  WARNING: Neither old nor new UI spec found" -ForegroundColor Yellow
}

# ============================================================================
# B) Update Docs/INDEX.md references
# ============================================================================
Write-Host ""
Write-Host "[B] Updating Docs/INDEX.md..." -ForegroundColor Yellow

$indexPath = "Docs/INDEX.md"
if (Test-Path $indexPath) {
    $indexContent = Get-Content $indexPath -Raw -Encoding UTF8
    $originalContent = $indexContent
    
    # Fix reference to AGENTS.md (should be at repo root, not Docs/DevelopmentSpecs/)
    $indexContent = $indexContent -replace 'Docs/DevelopmentSpecs/AGENTS\.md', 'AGENTS.md (repo root)'
    
    # Fix old UI spec filename
    $indexContent = $indexContent -replace 'UI & Logik Spezifikation v1\.md', 'ui-logic-spec-v1.md'
    
    # Remove priority line referencing non-existent DevelopmentSpecs
    $indexContent = $indexContent -replace '1\) Docs/DevelopmentSpecs/AGENTS\.md \(principles \+ process\)', '1) AGENTS.md (repo root - principles + process)'
    
    if ($indexContent -ne $originalContent) {
        Set-Content $indexPath -Value $indexContent -Encoding UTF8 -NoNewline
        Write-Host "  OK: Updated Docs/INDEX.md references" -ForegroundColor Green
    } else {
        Write-Host "  OK: Docs/INDEX.md already correct" -ForegroundColor Green
    }
} else {
    Write-Host "  WARNING: Docs/INDEX.md not found" -ForegroundColor Yellow
}

# ============================================================================
# C) Ensure folders exist
# ============================================================================
Write-Host ""
Write-Host "[C] Ensuring folder structure..." -ForegroundColor Yellow

$folders = @("Docs/Specs", "Docs/Plans", "Docs/Tasks")
foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "  OK: Created $folder" -ForegroundColor Green
    } else {
        Write-Host "  OK: Exists $folder" -ForegroundColor Green
    }
}

# ============================================================================
# D) Create templates (only if missing)
# ============================================================================
Write-Host ""
Write-Host "[D] Creating templates..." -ForegroundColor Yellow

# Specs template
$specsTemplate = "Docs/Specs/_template.md"
if (-not (Test-Path $specsTemplate)) {
    $specsContent = @'
# <feature-slug> — Spec

## Problem
(1–3 sentences)

## Users / Journeys
- Who uses this?
- What are they trying to accomplish?

## Scope (in / out)
### In scope
- 

### Out of scope
- 

## Acceptance criteria
- [ ] 
- [ ] 

## Edge cases
- 

## Data & privacy
- What is stored?
- Where?
- Retention?

## Non-goals
- What we are NOT building
'@
    Set-Content $specsTemplate -Value $specsContent -Encoding UTF8
    Write-Host "  OK: Created $specsTemplate" -ForegroundColor Green
} else {
    Write-Host "  OK: Exists $specsTemplate (not modified)" -ForegroundColor Green
}

# Plans template
$plansTemplate = "Docs/Plans/_template.md"
if (-not (Test-Path $plansTemplate)) {
    $plansContent = @'
# <feature-slug> — Plan

## Architecture / modules
- Component/module responsibilities
- Dependencies

## Data model
- Tables/collections
- Fields
- Relationships

## UI state model
- What state exists?
- Where does it live?
- How is it synchronized?

## Error handling
- What can go wrong?
- How do we handle it?
- User feedback strategy

## Testing strategy
- Unit tests
- Integration tests
- E2E tests
- What is realistically automatable?

## Risks / constraints
- Performance concerns
- UX constraints
- Platform limitations
'@
    Set-Content $plansTemplate -Value $plansContent -Encoding UTF8
    Write-Host "  OK: Created $plansTemplate" -ForegroundColor Green
} else {
    Write-Host "  OK: Exists $plansTemplate (not modified)" -ForegroundColor Green
}

# Tasks template
$tasksTemplate = "Docs/Tasks/_template.md"
if (-not (Test-Path $tasksTemplate)) {
    $tasksContent = @'
# <feature-slug> — Tasks

## Task 1 — [Brief description]
- **Files:** 
  - `path/to/file.ts`
- **Done when:** 
  - Specific completion criteria
- **Verify:** 
  - `npm run check`
  - `npm run test`
- **Guardrails:** 
  - Must not change X
  - Must preserve Y

## Task 2 — [Brief description]
- **Files:** 
  - `path/to/file.ts`
- **Done when:** 
  - Specific completion criteria
- **Verify:** 
  - `npm run check`
- **Guardrails:** 
  - Must not change X
'@
    Set-Content $tasksTemplate -Value $tasksContent -Encoding UTF8
    Write-Host "  OK: Created $tasksTemplate" -ForegroundColor Green
} else {
    Write-Host "  OK: Exists $tasksTemplate (not modified)" -ForegroundColor Green
}

# ============================================================================
# E) Git operations
# ============================================================================
Write-Host ""
Write-Host "[E] Git operations..." -ForegroundColor Yellow

# Check if git is available
$gitAvailable = $null -ne (Get-Command git -ErrorAction SilentlyContinue)

if (-not $gitAvailable) {
    Write-Host "  WARNING: Git not found in PATH - skipping git operations" -ForegroundColor Yellow
} else {
    # Check if there are changes
    $gitStatus = git status --porcelain
    
    if ($gitStatus) {
        Write-Host "  Staging changes..." -ForegroundColor Cyan
        git add -A
        
        # Commit INDEX.md changes if present
        $indexChanged = git diff --cached --name-only | Select-String "Docs/INDEX.md"
        if ($indexChanged) {
            git commit -m "docs: normalize INDEX.md references" --no-verify
            Write-Host "  OK: Committed INDEX.md updates" -ForegroundColor Green
        }
        
        # Commit template changes if present
        $templatesChanged = git diff --cached --name-only | Select-String "_template.md"
        if ($templatesChanged) {
            git commit -m "docs: add spec/plan/task templates" --no-verify
            Write-Host "  OK: Committed template files" -ForegroundColor Green
        }
        
        # Commit any remaining changes
        $remainingChanges = git status --porcelain
        if ($remainingChanges) {
            git commit -m "docs: setup spec-driven development structure" --no-verify
            Write-Host "  OK: Committed remaining changes" -ForegroundColor Green
        }
    } else {
        Write-Host "  OK: No changes to commit" -ForegroundColor Green
    }
}

# ============================================================================
# F) Remote sync
# ============================================================================
Write-Host ""
Write-Host "[F] Remote sync..." -ForegroundColor Yellow

if (-not $gitAvailable) {
    Write-Host "  WARNING: Git not available - skipping remote sync" -ForegroundColor Yellow
} else {
    # Check if remote 'origin' exists
    $remoteOrigin = git remote | Select-String "^origin$"
    
    if ($remoteOrigin) {
        Write-Host "  Pulling from origin/main..." -ForegroundColor Cyan
        try {
            git pull origin main --allow-unrelated-histories 2>&1 | Out-Null
            Write-Host "  OK: Pulled from origin/main" -ForegroundColor Green
        } catch {
            Write-Host "  WARNING: Pull failed (may be up to date or have conflicts)" -ForegroundColor Yellow
            Write-Host "    Error: $_" -ForegroundColor Yellow
        }
        
        Write-Host "  Pushing to origin/main..." -ForegroundColor Cyan
        try {
            git push -u origin main 2>&1 | Out-Null
            Write-Host "  OK: Pushed to origin/main" -ForegroundColor Green
        } catch {
            Write-Host "  WARNING: Push failed" -ForegroundColor Yellow
            Write-Host "    Error: $_" -ForegroundColor Yellow
            Write-Host "    Hint: Check authentication (PAT/SSH) or run 'git status' for conflicts" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  WARNING: No 'origin' remote configured - skipping push/pull" -ForegroundColor Yellow
    }
}

# ============================================================================
# Summary
# ============================================================================
Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review Docs/INDEX.md to ensure all references are correct"
Write-Host "  2. Check git status: git status"
Write-Host "  3. Start creating specs in Docs/Specs/ using the template"
Write-Host ""
Write-Host "Templates created in:" -ForegroundColor Yellow
Write-Host "  - Docs/Specs/_template.md"
Write-Host "  - Docs/Plans/_template.md"
Write-Host "  - Docs/Tasks/_template.md"
Write-Host ""
