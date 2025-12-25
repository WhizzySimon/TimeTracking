# Cascade Command Watcher (Multi-Instance)
# Enables multiple Cascade chats to run commands in parallel.
#
# Usage:
#   powershell -File scripts/watcher.ps1 -Instance A
#   powershell -File scripts/watcher.ps1 -Instance B
#
# Each instance uses its own folder:
#   - scripts/watcher/A/command.txt
#   - scripts/watcher/A/status.txt
#   - scripts/watcher/A/output.txt

param(
    [Parameter(Mandatory=$true)]
    [ValidatePattern("^[A-Z]$")]
    [string]$Instance
)

# Get script directory and set paths relative to project root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

$watcherDir = Join-Path $scriptDir "watcher"
$instanceDir = Join-Path $watcherDir $Instance
$requestFile = Join-Path $instanceDir "command.txt"
$outputFile = Join-Path $instanceDir "output.txt"
$statusFile = Join-Path $instanceDir "status.txt"

# Create instance directory if it doesn't exist
if (-not (Test-Path $instanceDir)) {
    New-Item -ItemType Directory -Path $instanceDir -Force | Out-Null
}

Write-Host "=== Cascade Watcher (Instance $Instance) ===" -ForegroundColor Cyan
Write-Host "Project root: $projectRoot"
Write-Host "Instance dir: $instanceDir"
Write-Host ""
Write-Host "Files:"
Write-Host "  Command: $requestFile"
Write-Host "  Output:  $outputFile"
Write-Host "  Status:  $statusFile"
Write-Host ""
Write-Host "Press Ctrl+C to stop"
Write-Host ""

# Create files if they don't exist
if (-not (Test-Path $requestFile)) {
    "" | Out-File -FilePath $requestFile -Encoding utf8
}

# Initialize status
"IDLE" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
"" | Out-File -FilePath $outputFile -Encoding utf8

# Initialize lastCommand with existing content to avoid re-running stale commands on startup
$lastCommand = ""
if (Test-Path $requestFile) {
    $existingCommand = Get-Content $requestFile -Raw -ErrorAction SilentlyContinue
    if ($existingCommand) {
        $lastCommand = $existingCommand.Trim()
        Write-Host "Ignoring stale command from previous session" -ForegroundColor DarkGray
    }
}

while ($true) {
    if (Test-Path $requestFile) {
        $command = Get-Content $requestFile -Raw -ErrorAction SilentlyContinue
        $command = if ($command) { $command.Trim() } else { "" }
        
        if ($command -and $command -ne $lastCommand -and $command -ne "") {
            $lastCommand = $command
            
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [$Instance] Running: $command" -ForegroundColor Yellow
            
            # Mark as running
            "RUNNING" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
            
            # Clear output file and start streaming header
            "=== Command: $command ===" | Out-File -FilePath $outputFile -Encoding utf8
            "=== Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
            "=== Output (streaming) ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
            
            # Execute command and capture output
            try {
                # Use system TEMP folder to avoid git conflicts
                $tempOut = Join-Path $env:TEMP "cascade-watcher-$Instance-$PID.txt"
                $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $command -Wait -PassThru -NoNewWindow -RedirectStandardOutput $tempOut -RedirectStandardError "$tempOut.err"
                $exitCode = $process.ExitCode
                
                # Read captured output
                $output = ""
                if (Test-Path $tempOut) {
                    $output = Get-Content $tempOut -Raw -ErrorAction SilentlyContinue
                    Remove-Item $tempOut -Force -ErrorAction SilentlyContinue
                }
                if (Test-Path "$tempOut.err") {
                    $errOutput = Get-Content "$tempOut.err" -Raw -ErrorAction SilentlyContinue
                    if ($errOutput) { $output += "`n$errOutput" }
                    Remove-Item "$tempOut.err" -Force -ErrorAction SilentlyContinue
                }
                
                # Append output to file
                $output | Out-File -FilePath $outputFile -Append -Encoding utf8
                "" | Out-File -FilePath $outputFile -Append -Encoding utf8
                "=== Exit Code: $exitCode ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
                "=== Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
                
                if ($exitCode -eq 0) {
                    "DONE:SUCCESS" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [$Instance] Completed: SUCCESS" -ForegroundColor Green
                } else {
                    "DONE:FAILED" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [$Instance] Completed: FAILED (exit $exitCode)" -ForegroundColor Red
                }
            }
            catch {
                "=== Error ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
                $_.Exception.Message | Out-File -FilePath $outputFile -Append -Encoding utf8
                "DONE:ERROR" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [$Instance] Error: $_" -ForegroundColor Red
            }
        }
    }
    
    Start-Sleep -Milliseconds 500
}
