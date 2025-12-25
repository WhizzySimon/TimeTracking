# Cascade Watcher System

This is the **single source of truth** for the Cascade Watcher system.

## Overview

The Cascade Watcher allows Cascade to execute terminal commands without using the broken `run_command` tool. It watches for commands written to a file and executes them.

## Multi-Instance System

Each chat session uses its own watcher instance to avoid conflicts:

| Instance | Command File | Status File | Output File |
|----------|--------------|-------------|-------------|
| A | `scripts/watcher/A/command.txt` | `scripts/watcher/A/status.txt` | `scripts/watcher/A/output.txt` |
| B | `scripts/watcher/B/command.txt` | `scripts/watcher/B/status.txt` | `scripts/watcher/B/output.txt` |

## User Setup

Start the watcher in a terminal before beginning a Cascade session:

**For Chat A:**
```powershell
powershell -File scripts/watcher.ps1 -Instance A
```

**For Chat B (parallel session):**
```powershell
powershell -File scripts/watcher.ps1 -Instance B
```

## How Cascade Uses the Watcher

1. **Write command** to `scripts/watcher/<Instance>/command.txt` using edit tool
2. **Poll** `scripts/watcher/<Instance>/status.txt` until `DONE:SUCCESS` or `DONE:FAILED`
3. **Read output** from `scripts/watcher/<Instance>/output.txt`
4. **Act on results** - fix errors if any, continue if passed

### Status Values

| Status | Meaning |
|--------|---------|
| `IDLE` | Watcher is waiting for commands |
| `RUNNING` | Command is currently executing |
| `DONE:SUCCESS` | Command completed with exit code 0 |
| `DONE:FAILED` | Command completed with non-zero exit code |

## Folder Structure

```
scripts/
├── watcher.ps1           # Main watcher script
└── watcher/
    ├── A/                # Instance A files
    │   ├── command.txt   # Write commands here
    │   ├── status.txt    # Poll this for status
    │   └── output.txt    # Read command output
    └── B/                # Instance B files
        ├── command.txt
        ├── status.txt
        └── output.txt
```

## Important Notes

- **Temp files** are written to `$env:TEMP`, not the scripts folder (avoids git conflicts)
- **Instance files** are gitignored (see `.gitignore`)
- **Each chat** must tell Cascade which instance to use at the start of the session

## Troubleshooting

### Command not executing

- Check that the watcher terminal is running
- Verify you're writing to the correct instance folder

### Edit tool fails on command.txt

The watcher may have already consumed the command. Wait a moment and try again with a different command string.

### Stale command from previous session

The watcher ignores commands that were present when it started. This prevents re-executing old commands.
