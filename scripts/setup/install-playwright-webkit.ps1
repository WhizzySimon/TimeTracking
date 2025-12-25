# Install Playwright WebKit Browser
# Installs WebKit browser for Safari-like testing in Playwright.
#
# Run via watcher: Write "powershell -ExecutionPolicy Bypass -File scripts/install-playwright-webkit.ps1" to scripts/cascade-command.txt
# Or directly: powershell -ExecutionPolicy Bypass -File scripts/install-playwright-webkit.ps1

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

Write-Host "=== Installing Playwright WebKit ===" -ForegroundColor Cyan
Write-Host "Project root: $projectRoot"
Write-Host ""

# Install WebKit browser (idempotent - safe to re-run)
Write-Host "Running: npx playwright install webkit" -ForegroundColor Yellow
$output = npx playwright install webkit 2>&1 | Out-String
Write-Host $output

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "WebKit installation complete!" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "WebKit installation failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
    exit $LASTEXITCODE
}
