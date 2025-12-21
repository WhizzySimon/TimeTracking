# Milestone 1 Verification Script
# Installs deps if needed, runs checks and tests, commits on green.

$ErrorActionPreference = "Stop"

Write-Host "=== Milestone 1 Verification ===" -ForegroundColor Cyan

# Check if node_modules exists, install if not
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED: npm install" -ForegroundColor Red
        exit 1
    }
}

# Install Playwright browsers if needed
Write-Host "`n--- Installing Playwright browsers ---" -ForegroundColor Yellow
npx playwright install
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: npx playwright install" -ForegroundColor Red
    exit 1
}
Write-Host "PASSED: Playwright browsers installed" -ForegroundColor Green

# TypeScript check
Write-Host "`n--- Running: npm run check ---" -ForegroundColor Yellow
npm run check
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: npm run check" -ForegroundColor Red
    exit 1
}
Write-Host "PASSED: npm run check" -ForegroundColor Green

# Format code
Write-Host "`n--- Running: npm run format ---" -ForegroundColor Yellow
npm run format
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: npm run format" -ForegroundColor Red
    exit 1
}
Write-Host "PASSED: npm run format" -ForegroundColor Green

# Lint check
Write-Host "`n--- Running: npm run lint ---" -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: npm run lint" -ForegroundColor Red
    exit 1
}
Write-Host "PASSED: npm run lint" -ForegroundColor Green

# E2E tests
Write-Host "`n--- Running: npm run test:e2e ---" -ForegroundColor Yellow
npm run test:e2e
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: npm run test:e2e" -ForegroundColor Red
    exit 1
}
Write-Host "PASSED: npm run test:e2e" -ForegroundColor Green

# All green - commit
Write-Host "`n=== All checks passed! Committing... ===" -ForegroundColor Cyan
git add -A
git commit -m "M1: persistence + default categories + smoke test"
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: git commit failed (maybe nothing to commit?)" -ForegroundColor Yellow
} else {
    Write-Host "Committed successfully!" -ForegroundColor Green
}

Write-Host "`n=== Milestone 1 Complete ===" -ForegroundColor Cyan
