# Start Cascade Development Session
# Run this before starting a new chat with /continue-work
#
# Opens two windows:
# 1. Dev server (npm run dev)
# 2. Cascade watcher (for autonomous command execution)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

Write-Host "=== Starting Cascade Development Session ===" -ForegroundColor Cyan
Write-Host "Project: $projectRoot"
Write-Host ""

# Start dev server in new window
Write-Host "Starting dev server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; Write-Host 'DEV SERVER' -ForegroundColor Green; npm run dev"

# Small delay to avoid race conditions
Start-Sleep -Seconds 1

# Start watcher in new window
Write-Host "Starting cascade watcher..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; powershell -File scripts/cascade-watcher.ps1"

Write-Host ""
Write-Host "=== Session Ready ===" -ForegroundColor Green
Write-Host "Two windows opened:"
Write-Host "  1. Dev server (npm run dev)"
Write-Host "  2. Cascade watcher"
Write-Host ""
Write-Host "Now start a new chat with: /continue-work"
