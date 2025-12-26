<#
.SYNOPSIS
    Cascade Child Watcher - watches for commands and executes them.
.DESCRIPTION
    Watches scripts/watcher/<SessionId>/command.txt for new commands.
    Executes commands and writes output to scripts/watcher/<SessionId>/output.txt.
    Status is written to scripts/watcher/<SessionId>/status.txt.
.PARAMETER SessionId
    The session identifier (e.g., 20251226-210530-x7k9). Spawned by main watcher.
.EXAMPLE
    powershell -File scripts/watcher.ps1 -SessionId 20251226-210530-x7k9
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$SessionId
)

$ErrorActionPreference = "Continue"

# Calculate paths relative to script location
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$sessionDir = Join-Path $scriptDir "watcher\$SessionId"
$logsDir = Join-Path $scriptDir "watcher\logs"
$logFile = Join-Path $logsDir "$SessionId.log"

# Create directories if needed
if (-not (Test-Path $sessionDir)) {
    New-Item -ItemType Directory -Path $sessionDir -Force | Out-Null
}
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

$requestFile = Join-Path $sessionDir "command.txt"
$outputFile = Join-Path $sessionDir "output.txt"
$statusFile = Join-Path $sessionDir "status.txt"

# Set window title for easy identification
$host.UI.RawUI.WindowTitle = "Cascade Watcher [$SessionId]"

# Log function
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "[$timestamp] $Message" | Out-File -FilePath $logFile -Append -Encoding utf8
}

# Initialize files
if (-not (Test-Path $requestFile)) {
    "" | Out-File -FilePath $requestFile -Encoding utf8 -NoNewline
}
"IDLE" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
"" | Out-File -FilePath $outputFile -Encoding utf8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cascade Watcher [$SessionId] Started" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Session:     $SessionId" -ForegroundColor White
Write-Host "Command:     $requestFile" -ForegroundColor White
Write-Host "Output:      $outputFile" -ForegroundColor White
Write-Host "Status:      $statusFile" -ForegroundColor White
Write-Host "Log:         $logFile" -ForegroundColor White
Write-Host "Working dir: $repoRoot" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Waiting for commands..." -ForegroundColor Yellow
Write-Host ""

Write-Log "Session started (PID: $PID)"

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
            
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [$SessionId] Running: $command" -ForegroundColor Yellow
            Write-Log "Running: $command"
            
            # Mark as running
            "RUNNING" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
            
            # Clear output file and start streaming header
            "=== Command: $command ===" | Out-File -FilePath $outputFile -Encoding utf8
            "=== Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
            "=== Output (streaming) ===" | Out-File -FilePath $outputFile -Append -Encoding utf8
            
            # Execute command and capture output
            try {
                # Use system TEMP folder to avoid git conflicts
                $tempOut = Join-Path $env:TEMP "cascade-watcher-$SessionId-$PID.txt"
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
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [$SessionId] DONE:SUCCESS" -ForegroundColor Green
                    Write-Log "DONE:SUCCESS (exit code 0)"
                } else {
                    "DONE:FAILED" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [$SessionId] DONE:FAILED (exit code $exitCode)" -ForegroundColor Red
                    Write-Log "DONE:FAILED (exit code $exitCode)"
                }
            } catch {
                $errorMsg = $_.Exception.Message
                "ERROR: $errorMsg" | Out-File -FilePath $outputFile -Append -Encoding utf8
                "DONE:FAILED" | Out-File -FilePath $statusFile -Encoding utf8 -NoNewline
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [$SessionId] ERROR: $errorMsg" -ForegroundColor Red
                Write-Log "ERROR: $errorMsg"
            }
        }
    }
    
    Start-Sleep -Milliseconds 500
}
