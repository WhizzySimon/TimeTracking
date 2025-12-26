# Cascade Watcher System

This is the **single source of truth** for the Cascade Watcher system.

## Overview

The Cascade Watcher allows Cascade to execute terminal commands without using the broken `run_command` tool. A main watcher orchestrates child watchers that execute commands.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Main Watcher (watcher-main.ps1)                        │
│  - Single instance (lockfile protected)                 │
│  - Spawns/kills child watchers on demand                │
│  - Monitors child health                                │
└─────────────────────────────────────────────────────────┘
         │ SPAWN/KILL/LIST/SHUTDOWN
         ▼
┌─────────────────────────────────────────────────────────┐
│  Child Watcher (watcher.ps1 -SessionId <id>)            │
│  - Executes commands for one Cascade session            │
│  - Writes output to session folder                      │
│  - Logs to dedicated log file                           │
└─────────────────────────────────────────────────────────┘
```

## How to Run

### Start Main Watcher (once)

```powershell
powershell -File scripts/watcher-main.ps1
```

Leave this running. It will manage all sessions automatically.

### How to Stop

- **Ctrl+C** in the main watcher terminal, OR
- Write `SHUTDOWN` to `scripts/watcher/main-control.txt`

Both methods cleanly terminate all child sessions.

## How Cascade Uses the Watcher

### 1. Request a Session

Write `SPAWN` to `scripts/watcher/main-control.txt`:

```
SPAWN
```

Poll `scripts/watcher/main-status.txt` until it shows `SPAWNED:<session-id>`.

### 2. Execute Commands

Use the session ID to write commands:

```
scripts/watcher/<session-id>/command.txt   # Write command here
scripts/watcher/<session-id>/status.txt    # Poll until DONE:*
scripts/watcher/<session-id>/output.txt    # Read output
```

### 3. End Session (optional)

Write `KILL:<session-id>` to `scripts/watcher/main-control.txt`.

## Control Commands

| Command             | Effect                               |
| ------------------- | ------------------------------------ |
| `SPAWN`             | Create new session, returns ID       |
| `KILL:<session-id>` | Terminate specific session           |
| `LIST`              | Update status file with all sessions |
| `SHUTDOWN`          | Stop all sessions and main watcher   |

## Status Values

| Status         | Meaning                                   |
| -------------- | ----------------------------------------- |
| `IDLE`         | Watcher is waiting for commands           |
| `RUNNING`      | Command is currently executing            |
| `DONE:SUCCESS` | Command completed with exit code 0        |
| `DONE:FAILED`  | Command completed with non-zero exit code |

## Folder Structure

```
scripts/
├── watcher-main.ps1      # Main watcher orchestrator
├── watcher.ps1           # Child watcher script
└── watcher/
    ├── main.lock         # Lockfile (prevents duplicate main)
    ├── main-control.txt  # Control commands
    ├── main-status.txt   # Main watcher status
    ├── logs/             # Per-session log files
    │   └── <session-id>.log
    └── <session-id>/     # Session folders (dynamic)
        ├── command.txt
        ├── status.txt
        └── output.txt
```

## Important Notes

- **Single main watcher** — protected by lockfile, cannot start twice
- **Session IDs** — format `YYYYMMDD-HHmmss-xxxx` (timestamp + random)
- **Temp files** — written to `$env:TEMP`, not the scripts folder
- **Logs** — each session has a dedicated log in `scripts/watcher/logs/`
- **Max sessions** — 10 concurrent (configurable in script)

## Why cmd.exe (not PowerShell)?

The watcher script is PowerShell, but it executes commands via **cmd.exe**:

```powershell
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $command ...
```

**Reasons:**

- Simpler output capture with redirects
- Consistent behavior with standard Windows commands
- Avoids PowerShell encoding quirks

**Consequence:** Use `&&` (not `;`) for command chaining:

```
git add -A && git commit -m "message"   # Correct (cmd.exe)
git add -A; git commit -m "message"     # WRONG (PowerShell syntax)
```

## Troubleshooting

### "Main Watcher already running" error

Another main watcher is running. Either:

- Use the existing one, OR
- If it crashed, delete `scripts/watcher/main.lock` and restart

### Session died unexpectedly

Main watcher detects and reports dead sessions. Check the session log:

```
scripts/watcher/logs/<session-id>.log
```

### Command not executing

1. Check main watcher terminal is running
2. Verify session ID is correct
3. Check `scripts/watcher/<session-id>/status.txt`

### Edit tool fails on command.txt

The watcher may have already consumed the command. Wait and try again with a different command string.
