# Verification script that writes output to a file for Cascade to read
# Called by: npm run verify

$outputFile = "scripts/verify-output.txt"

# Clear previous output
"" | Out-File -FilePath $outputFile -Encoding utf8

# Header
"=== TimeTracker Verification ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
"Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $outputFile -Append -Encoding utf8
"" | Out-File -FilePath $outputFile -Append -Encoding utf8

$allPassed = $true

# Step 1: Format
"--- Step 1: npm run format ---" | Out-File -FilePath $outputFile -Append -Encoding utf8
$formatOutput = npm run format 2>&1 | Out-String
$formatOutput | Out-File -FilePath $outputFile -Append -Encoding utf8
if ($LASTEXITCODE -ne 0) { $allPassed = $false }
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
    Write-Host "Verification complete: FAILED (see scripts/verify-output.txt)"
    exit 1
}
