# verify_windsurf_setup.ps1
# Verifies that the .windsurf folder structure is correct

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "=== .windsurf folder tree ===" -ForegroundColor Cyan
Get-ChildItem -Path "$repoRoot\.windsurf" -Recurse | ForEach-Object {
    $indent = "  " * ($_.FullName.Split('\').Count - $repoRoot.Split('\').Count - 1)
    Write-Host "$indent$($_.Name)"
}

Write-Host "`n=== Required files check ===" -ForegroundColor Cyan
$requiredFiles = @(
    ".windsurf\workflows\project-start.md",
    ".windsurf\workflows\rules-read-all.md",
    ".windsurf\workflows\read-governance.md",
    ".windsurf\workflows\read-core-docs-and-code.md",
    ".windsurf\rules\implementation-specification-rules.md",
    ".windsurf\cascade.md",
    "AGENTS.md",
    "Docs\INDEX.md"
)

$missing = @()
foreach ($file in $requiredFiles) {
    $fullPath = Join-Path $repoRoot $file
    if (Test-Path $fullPath) {
        Write-Host "[OK] $file" -ForegroundColor Green
    } else {
        Write-Host "[MISSING] $file" -ForegroundColor Red
        $missing += $file
    }
}

if ($missing.Count -gt 0) {
    Write-Host "`nERROR: $($missing.Count) required file(s) missing!" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Git status (if available) ===" -ForegroundColor Cyan
try {
    Push-Location $repoRoot
    git status --short 2>$null
    Pop-Location
} catch {
    Write-Host "(git not available or not a git repo)" -ForegroundColor Yellow
}

Write-Host "`nAll checks passed." -ForegroundColor Green
exit 0
