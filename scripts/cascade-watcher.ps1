# Cascade Command Watcher
# Enables Cascade to execute commands autonomously by watching a request file.
#
# Start: powershell -ExecutionPolicy Bypass -File scripts/cascade-watcher.ps1
#
# How it works:
# 1. Cascade writes a command to scripts/cascade-command.txt
# 2. This watcher detects the change and executes the command
# 3. Output is written to scripts/cascade-output.txt
# 4. Status is written to scripts/cascade-status.txt (IDLE/RUNNING/DONE:SUCCESS/DONE:FAILED)
# 5. Cascade reads the output and continues

# Get script directory and set paths relative to project root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

$requestFile = Join-Path $projectRoot "scripts/cascade-command.txt"
$outputFile = Join-Path $projectRoot "scripts/cascade-output.txt"
$statusFile = Join-Path $projectRoot "scripts/cascade-status.txt"

Write-Host "=== Cascade Command Watcher ===" -ForegroundColor Cyan
Write-Host "Project root: $projectRoot"
Write-Host "Watching: $requestFile"
Write-Host "Output: $outputFile"
Write-Host "Status: $statusFile"
Write-Host ""
Write-Host "Press Ctrl+C to stop"
Write-Host ""

# Initialize files
"IDLE" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
"" | Out-File -FilePath $outputFile -Encoding utf8

$lastCommand = ""

while ($true) {
    if (Test-Path $requestFile) {
        $command = Get-Content $requestFile -Raw -ErrorAction SilentlyContinue
        $command = if ($command) { $command.Trim() } else { "" }
        
        if ($command -and $command -ne $lastCommand -and $command -ne "") {
            $lastCommand = $command
            
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Running: $command" -ForegroundColor Yellow
            
            # Mark as running
            "RUNNING" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
            
            # Clear output file
            "" | Out-File -FilePath $outputFile -Encoding utf8
            
            # Execute command and capture output
            try {
                $output = Invoke-Expression $command 2>&1 | Out-String
                $exitCode = $LASTEXITCODE
                if ($null -eq $exitCode) { $exitCode = 0 }
                
                # Write output
                "=== Command: $command ===" | Out-File -FilePath $outputFile -Encoding utf8
                "=== Exit Code: $exitCode ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
                "=== Output ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
                $output | Out-File -FilePath $outputFile -Append -Encoding utf8
                
                if ($exitCode -eq 0) {
                    "DONE:SUCCESS" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Completed: SUCCESS" -ForegroundColor Green
                } else {
                    "DONE:FAILED" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Completed: FAILED (exit $exitCode)" -ForegroundColor Red
                }
            }
            catch {
                "=== Command: $command ===" | Out-File -FilePath $outputFile -Encoding utf8
                "=== Error ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
                $_.Exception.Message | Out-File -FilePath $outputFile -Append -Encoding utf8
                "DONE:ERROR" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Error: $_" -ForegroundColor Red
            }
        }
    }
    
    Start-Sleep -Milliseconds 500
}
