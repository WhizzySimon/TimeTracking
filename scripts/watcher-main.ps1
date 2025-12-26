<#
.SYNOPSIS
    Main Cascade Watcher - orchestrates child watcher instances.
.DESCRIPTION
    Single-instance watcher that spawns and manages child watchers for Cascade sessions.
    Provides SPAWN/KILL/LIST/SHUTDOWN commands via control file.
.EXAMPLE
    powershell -File scripts/watcher-main.ps1
#>

$ErrorActionPreference = "Stop"

# Calculate paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$watcherDir = Join-Path $scriptDir "watcher"
$lockFile = Join-Path $watcherDir "main.lock"
$controlFile = Join-Path $watcherDir "main-control.txt"
$statusFile = Join-Path $watcherDir "main-status.txt"
$logsDir = Join-Path $watcherDir "logs"

# Ensure directories exist
if (-not (Test-Path $watcherDir)) {
    New-Item -ItemType Directory -Path $watcherDir -Force | Out-Null
}
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# Session tracking
$script:sessions = @{}
$script:shuttingDown = $false
$script:maxSessions = 10

# --------- START: Session Functions ---------

function New-SessionId {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $random = -join ((48..57) + (97..122) | Get-Random -Count 4 | ForEach-Object { [char]$_ })
    return "$timestamp-$random"
}

function New-Session {
    if ($script:sessions.Count -ge $script:maxSessions) {
        Write-Host "  ERROR: Max sessions ($script:maxSessions) reached" -ForegroundColor Red
        return $null
    }
    
    $sessionId = New-SessionId
    $sessionDir = Join-Path $watcherDir $sessionId
    
    # Create session directory
    New-Item -ItemType Directory -Path $sessionDir -Force | Out-Null
    
    # Initialize session files
    "" | Out-File -FilePath (Join-Path $sessionDir "command.txt") -Encoding utf8 -NoNewline
    "IDLE" | Out-File -FilePath (Join-Path $sessionDir "status.txt") -Encoding utf8 -NoNewline
    "" | Out-File -FilePath (Join-Path $sessionDir "output.txt") -Encoding utf8
    
    # Spawn child watcher
    $childScript = Join-Path $scriptDir "watcher.ps1"
    $logFile = Join-Path $logsDir "$sessionId.log"
    
    try {
        $process = Start-Process -FilePath "powershell.exe" `
            -ArgumentList "-ExecutionPolicy", "Bypass", "-File", $childScript, "-SessionId", $sessionId `
            -WorkingDirectory $repoRoot `
            -PassThru `
            -WindowStyle Normal
        
        # Track session
        $script:sessions[$sessionId] = @{
            PID = $process.Id
            Process = $process
            Dir = $sessionDir
            LogFile = $logFile
            Started = Get-Date
        }
        
        Write-Host "  Spawned session '$sessionId' (PID $($process.Id))" -ForegroundColor Green
        
        # Write session ID to status file for Cascade to read
        "SPAWNED:$sessionId" | Out-File -FilePath $statusFile -Encoding utf8
        
        return $sessionId
    } catch {
        Write-Host "  ERROR: Failed to spawn session: $_" -ForegroundColor Red
        # Cleanup directory on failure
        if (Test-Path $sessionDir) {
            Remove-Item $sessionDir -Recurse -Force -ErrorAction SilentlyContinue
        }
        return $null
    }
}

function Stop-Session {
    param([string]$SessionId)
    
    if (-not $script:sessions.ContainsKey($SessionId)) {
        Write-Host "  ERROR: Session '$SessionId' not found" -ForegroundColor Red
        return $false
    }
    
    $session = $script:sessions[$SessionId]
    
    # Stop the process
    if ($null -ne $session.Process -and -not $session.Process.HasExited) {
        Write-Host "  Stopping session '$SessionId' (PID $($session.PID))..." -ForegroundColor Yellow
        try {
            Stop-Process -Id $session.PID -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "  WARNING: Could not stop PID $($session.PID): $_" -ForegroundColor Yellow
        }
    }
    
    # Remove from tracking
    $script:sessions.Remove($SessionId)
    
    # Optionally cleanup session directory (keep for debugging)
    # Remove-Item $session.Dir -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Host "  Session '$SessionId' stopped" -ForegroundColor Green
    return $true
}

function Get-SessionList {
    $list = @()
    foreach ($key in $script:sessions.Keys) {
        $session = $script:sessions[$key]
        $status = "UNKNOWN"
        if ($null -ne $session.Process) {
            if ($session.Process.HasExited) {
                $status = "DEAD"
            } else {
                $status = "RUNNING"
            }
        }
        $list += "$key (PID $($session.PID), $status)"
    }
    return $list
}

# --------- END: Session Functions ---------

# --------- START: Lockfile Functions ---------

function Test-StaleLock {
    if (-not (Test-Path $lockFile)) { return $false }
    
    $lockContent = Get-Content $lockFile -Raw -ErrorAction SilentlyContinue
    if ($lockContent -match "PID=(\d+)") {
        $lockedPid = [int]$matches[1]
        $process = Get-Process -Id $lockedPid -ErrorAction SilentlyContinue
        if ($null -eq $process) {
            Write-Host "  Stale lockfile detected (PID $lockedPid not running). Cleaning up..." -ForegroundColor Yellow
            Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
            return $false
        }
        return $true
    }
    return $false
}

function New-Lock {
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    "PID=$PID`nSTARTED=$timestamp" | Out-File -FilePath $lockFile -Encoding utf8 -NoNewline
}

function Remove-Lock {
    if (Test-Path $lockFile) {
        Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    }
}

# --------- END: Lockfile Functions ---------

# --------- START: Status Functions ---------

function Update-Status {
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    $content = "MAIN_PID=$PID`nUPDATED=$timestamp`nSESSIONS:"
    
    if ($script:sessions.Count -eq 0) {
        $content += "`n  (none)"
    } else {
        foreach ($key in $script:sessions.Keys) {
            $session = $script:sessions[$key]
            $status = "UNKNOWN"
            if ($null -ne $session.Process) {
                if ($session.Process.HasExited) {
                    $status = "DEAD"
                } else {
                    $status = "RUNNING"
                }
            }
            $content += "`n  - ID=$key PID=$($session.PID) STATUS=$status"
        }
    }
    
    $content | Out-File -FilePath $statusFile -Encoding utf8
}

function Initialize-ControlFile {
    "" | Out-File -FilePath $controlFile -Encoding utf8 -NoNewline
}

# --------- END: Status Functions ---------

# --------- START: Cleanup Function ---------

function Stop-AllSessions {
    Write-Host "`n  Stopping all sessions..." -ForegroundColor Yellow
    foreach ($key in @($script:sessions.Keys)) {
        $session = $script:sessions[$key]
        if ($null -ne $session.Process -and -not $session.Process.HasExited) {
            Write-Host "    Stopping session '$key' (PID $($session.PID))..." -ForegroundColor Gray
            try {
                Stop-Process -Id $session.PID -Force -ErrorAction SilentlyContinue
            } catch {
                Write-Host "    WARNING: Could not stop PID $($session.PID)" -ForegroundColor Yellow
            }
        }
    }
    $script:sessions.Clear()
}

function Invoke-Cleanup {
    $script:shuttingDown = $true
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Shutting down Main Watcher..." -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Stop-AllSessions
    Remove-Lock
    Update-Status
    Write-Host "  Cleanup complete. Goodbye!" -ForegroundColor Green
}

# --------- END: Cleanup Function ---------

# --------- START: Main Entry Point ---------

# Check for existing instance
if (Test-StaleLock) {
    $lockContent = Get-Content $lockFile -Raw
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: Main Watcher already running!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host $lockContent -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If this is incorrect, delete: $lockFile" -ForegroundColor Gray
    exit 1
}

# Create lock
New-Lock

# Register cleanup on Ctrl+C
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Invoke-Cleanup }
try {
    [Console]::TreatControlCAsInput = $false
} catch {}

# Show banner
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cascade Main Watcher Started" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PID:         $PID" -ForegroundColor White
Write-Host "Lock:        $lockFile" -ForegroundColor White
Write-Host "Control:     $controlFile" -ForegroundColor White
Write-Host "Status:      $statusFile" -ForegroundColor White
Write-Host "Logs:        $logsDir" -ForegroundColor White
Write-Host "Working dir: $repoRoot" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commands: SPAWN, KILL:<id>, LIST, SHUTDOWN" -ForegroundColor Yellow
Write-Host "Write commands to: $controlFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

# Initialize files
Initialize-ControlFile
Update-Status

$lastCommand = ""

# Main loop
while (-not $script:shuttingDown) {
    # Read control file
    $command = ""
    if (Test-Path $controlFile) {
        $command = Get-Content $controlFile -Raw -ErrorAction SilentlyContinue
        $command = if ($command) { $command.Trim() } else { "" }
    }
    
    # Process new command
    if ($command -and $command -ne $lastCommand -and $command -ne "") {
        $lastCommand = $command
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Command: $command" -ForegroundColor Yellow
        
        # Clear control file
        "" | Out-File -FilePath $controlFile -Encoding utf8 -NoNewline
        
        switch -Regex ($command) {
            "^SPAWN$" {
                $sessionId = New-Session
                if ($null -eq $sessionId) {
                    "ERROR:SPAWN_FAILED" | Out-File -FilePath $statusFile -Encoding utf8
                }
            }
            "^KILL:(.+)$" {
                $targetId = $matches[1].Trim()
                $result = Stop-Session -SessionId $targetId
                if ($result) {
                    "KILLED:$targetId" | Out-File -FilePath $statusFile -Encoding utf8
                } else {
                    "ERROR:SESSION_NOT_FOUND:$targetId" | Out-File -FilePath $statusFile -Encoding utf8
                }
            }
            "^LIST$" {
                $sessionList = Get-SessionList
                Write-Host "  Active sessions: $($script:sessions.Count)" -ForegroundColor Cyan
                foreach ($s in $sessionList) {
                    Write-Host "    - $s" -ForegroundColor White
                }
                Update-Status
            }
            "^SHUTDOWN$" {
                Write-Host "  SHUTDOWN requested" -ForegroundColor Cyan
                Invoke-Cleanup
                exit 0
            }
            default {
                Write-Host "  Unknown command: $command" -ForegroundColor Red
            }
        }
        
        Update-Status
    }
    
    # Health check for sessions - detect dead children
    $deadSessions = @()
    foreach ($key in $script:sessions.Keys) {
        $session = $script:sessions[$key]
        if ($null -ne $session.Process -and $session.Process.HasExited) {
            $deadSessions += $key
        }
    }
    foreach ($deadId in $deadSessions) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Session '$deadId' died unexpectedly" -ForegroundColor Red
        $script:sessions.Remove($deadId)
        Update-Status
    }
    
    Start-Sleep -Milliseconds 500
}

# --------- END: Main Entry Point ---------
