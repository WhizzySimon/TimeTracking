# Code Verification Script
# Runs devlog tag validation, format, TypeScript check, and lint, writing output to a file for Cascade to read.
#
# Called by: npm run verify
# Output: scripts/verify-code-output.txt

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)
Set-Location $projectRoot

$outputFile = Join-Path $projectRoot "scripts/verify-code-output.txt"

# Clear previous output
"" | Out-File -FilePath $outputFile -Encoding utf8

# Header
"=== TimeTracker Code Verification ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
"Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $outputFile -Append -Encoding utf8
"" | Out-File -FilePath $outputFile -Append -Encoding utf8

$allPassed = $true

# Step 0: Validate devlog tags
"--- Step 0: Validate devlog tags ---" | Out-File -FilePath $outputFile -Append -Encoding utf8
$tagOutput = node scripts/build/validate-devlog-tags.js 2>&1 | Out-String
$tagOutput | Out-File -FilePath $outputFile -Append -Encoding utf8
if ($LASTEXITCODE -ne 0) { $allPassed = $false }
"" | Out-File -FilePath $outputFile -Append -Encoding utf8

# Step 0.5: Validate naming conventions
"--- Step 0.5: Validate naming conventions ---" | Out-File -FilePath $outputFile -Append -Encoding utf8
$namingOutput = node scripts/build/validate-naming.js 2>&1 | Out-String
$namingOutput | Out-File -FilePath $outputFile -Append -Encoding utf8
if ($LASTEXITCODE -ne 0) { $allPassed = $false }
"" | Out-File -FilePath $outputFile -Append -Encoding utf8

# Step 1: Check format (without modifying files)
"--- Step 1: prettier --check ---" | Out-File -FilePath $outputFile -Append -Encoding utf8
$formatOutput = npx prettier --check . 2>&1 | Out-String
$formatOutput | Out-File -FilePath $outputFile -Append -Encoding utf8
if ($LASTEXITCODE -ne 0) { 
    "WARNING: Some files need formatting. Run 'npm run format' before committing." | Out-File -FilePath $outputFile -Append -Encoding utf8
    $allPassed = $false 
}
"" | Out-File -FilePath $outputFile -Append -Encoding utf8

# Step 2: Check (TypeScript)
"--- Step 2: npm run check ---" | Out-File -FilePath $outputFile -Append -Encoding utf8
$checkOutput = npm run check 2>&1 | Out-String
$checkOutput | Out-File -FilePath $outputFile -Append -Encoding utf8
if ($LASTEXITCODE -ne 0) { $allPassed = $false }
"" | Out-File -FilePath $outputFile -Append -Encoding utf8

# Step 3: Lint
"--- Step 3: npm run lint ---" | Out-File -FilePath $outputFile -Append -Encoding utf8
$lintOutput = npm run lint 2>&1 | Out-String
$lintOutput | Out-File -FilePath $outputFile -Append -Encoding utf8
if ($LASTEXITCODE -ne 0) { $allPassed = $false }
"" | Out-File -FilePath $outputFile -Append -Encoding utf8

# Final status
if ($allPassed) {
    "STATUS: ALL PASSED" | Out-File -FilePath $outputFile -Append -Encoding utf8
    Write-Host "Verification complete: ALL PASSED"
    exit 0
} else {
    "STATUS: FAILED" | Out-File -FilePath $outputFile -Append -Encoding utf8
    Write-Host "Verification complete: FAILED (see scripts/verify-code-output.txt)"
    exit 1
}
