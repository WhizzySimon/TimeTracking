<#
.SYNOPSIS
    Multi-instance Cascade Watcher - watches for commands and executes them.
.DESCRIPTION
    Watches scripts/watcher/<Instance>/command.txt for new commands.
    Executes commands and writes output to scripts/watcher/<Instance>/output.txt.
    Status is written to scripts/watcher/<Instance>/status.txt.
.PARAMETER Instance
    The instance identifier (e.g., A, B). Each chat session should use a different instance.
.EXAMPLE
    powershell -File scripts/watcher.ps1 -Instance A
    powershell -File scripts/watcher.ps1 -Instance B
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Instance
)

$ErrorActionPreference = "Continue"

# Calculate paths relative to script location
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$instanceDir = Join-Path $scriptDir "watcher\$Instance"

# Create instance directory if it doesn't exist
if (-not (Test-Path $instanceDir)) {
    New-Item -ItemType Directory -Path $instanceDir -Force | Out-Null
}

$requestFile = Join-Path $instanceDir "command.txt"
$outputFile = Join-Path $instanceDir "output.txt"
$statusFile = Join-Path $instanceDir "status.txt"

# Initialize files
if (-not (Test-Path $requestFile)) {
    "" | Out-File -FilePath $requestFile -Encoding utf8 -NoNewline
}
"IDLE" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
"" | Out-File -FilePath $outputFile -Encoding utf8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cascade Watcher [$Instance] Started" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Instance:    $Instance" -ForegroundColor White
Write-Host "Command:     $requestFile" -ForegroundColor White
Write-Host "Output:      $outputFile" -ForegroundColor White
Write-Host "Status:      $statusFile" -ForegroundColor White
Write-Host "Working dir: $repoRoot" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Waiting for commands..." -ForegroundColor Yellow
Write-Host ""

$lastCommand = ""

# Check if there's a stale command from previous session
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
                $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $command -Wait -PassThru -NoNewWindow -RedirectStandardOutput $tempOut -RedirectStandardError "$tempOut.err" -WorkingDirectory $repoRoot
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
                if ($output) {
                    $output | Out-File -FilePath $outputFile -Append -Encoding utf8
                }
                
                # Write footer
                "" | Out-File -FilePath $outputFile -Append -Encoding utf8
                "=== Exit Code: $exitCode ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
                "=== Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
                
                # Update status
                if ($exitCode -eq 0) {
                    "DONE:SUCCESS" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [$Instance] DONE:SUCCESS" -ForegroundColor Green
                } else {
                    "DONE:FAILED" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [$Instance] DONE:FAILED (exit code $exitCode)" -ForegroundColor Red
                }
            } catch {
                $errorMsg = $_.Exception.Message
                "ERROR: $errorMsg" | Out-File -FilePath $outputFile -Append -Encoding utf8
                "DONE:FAILED" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [$Instance] ERROR: $errorMsg" -ForegroundColor Red
            }
        }
    }
    
    Start-Sleep -Milliseconds 500
}
