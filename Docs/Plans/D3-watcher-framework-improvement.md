# D3: Watcher Framework Improvement — Plan

**Phase:** D3  
**Created:** 2025-12-26  
**Last Updated:** 2025-12-26  
**Based on Spec:** `Docs/Specs/D3-watcher-framework-improvement.md`

---

## Architecture / modules

### File Structure

```
scripts/
├── watcher.ps1              # Child watcher (existing, minor updates)
├── watcher-main.ps1         # NEW: Main watcher orchestrator
└── watcher/
    ├── main.lock            # Lockfile for single-instance protection
    ├── main-control.txt     # Control commands: SPAWN, KILL, LIST, SHUTDOWN
    ├── main-status.txt      # Status output from main watcher
    ├── logs/                # Per-session log files
    │   └── <session-id>.log
    └── <session-id>/        # Dynamic session folders
        ├── command.txt
        ├── status.txt
        └── output.txt
```

### Components

| Component          | Responsibility                                                     |
| ------------------ | ------------------------------------------------------------------ |
| `watcher-main.ps1` | Single-instance protection, spawn/kill children, control interface |
| `watcher.ps1`      | Execute commands for a session, write output (existing behavior)   |
| Lockfile system    | Prevent duplicate main watchers, detect stale locks                |
| Control interface  | File-based commands for Cascade to manage sessions                 |

### Main Watcher Loop

1. Check lockfile → exit if already running
2. Create lockfile with PID
3. Initialize control/status files
4. Loop:
   - Poll `main-control.txt` for commands
   - Process: SPAWN, KILL, LIST, SHUTDOWN
   - Poll child processes for health
   - Update `main-status.txt`
5. On exit: kill all children, remove lockfile

### Child Watcher Changes

- Accept optional `-SessionId` parameter (for logging/title)
- Set process title to include session ID
- Write startup/shutdown to session log file
- Otherwise unchanged behavior

## Data model

### Lockfile (`main.lock`)

```
PID=12345
STARTED=2025-12-26T21:00:00
```

### Control File (`main-control.txt`)

Single line, consumed and cleared after processing:

```
SPAWN
KILL:20251226-210530-x7k9
LIST
SHUTDOWN
```

### Status File (`main-status.txt`)

```
MAIN_PID=12345
STARTED=2025-12-26T21:00:00
SESSIONS:
  - ID=20251226-210530-x7k9 PID=12346 STATUS=IDLE
  - ID=20251226-211045-m3p2 PID=12347 STATUS=RUNNING
```

### Session Folder Structure

Same as existing:

- `command.txt` — Cascade writes commands here
- `status.txt` — IDLE/RUNNING/DONE:SUCCESS/DONE:FAILED
- `output.txt` — Command output

## UI state model

N/A — this is a CLI/tooling feature, no UI.

## Error handling

| Error                        | Handling                                               |
| ---------------------------- | ------------------------------------------------------ |
| Main watcher already running | Print error, exit with code 1                          |
| Stale lockfile               | Check if PID exists, if not → remove lock and continue |
| Child crash                  | Detect via process polling, mark DEAD, log error       |
| Invalid session ID           | Write error to output, return DONE:FAILED              |
| Max sessions (10)            | Write error "Max sessions reached"                     |
| SPAWN during spawn           | Queue, process sequentially                            |

## Testing strategy

### Manual Testing

1. Start main watcher → verify lockfile created
2. Start second main watcher → verify error shown
3. Send SPAWN → verify child created with session ID
4. Send command to session → verify execution
5. Send KILL → verify child terminated
6. Ctrl+C main → verify all children terminated
7. Kill main (Task Manager) → verify stale lock handled on restart
8. Test legacy A/B instances still work

### Automated Testing

- Unit tests not practical for PowerShell process management
- E2E tests could verify file creation/content but complex
- **Decision:** Manual testing is sufficient for this tooling feature

## Risks / constraints

| Risk                        | Mitigation                                      |
| --------------------------- | ----------------------------------------------- |
| PowerShell process handling | Use `Start-Process` with `-PassThru` for PID    |
| Stale lock detection        | Check `Get-Process -Id $pid` existence          |
| Child cleanup on crash      | Main watcher polls children every 2 seconds     |
| File locking conflicts      | Use `-Force` and retry pattern for file writes  |
| Windows-only                | Acceptable — project is Windows-focused for now |

---

## Plan Completeness Checklist

- [x] Architecture / modules defined
- [x] Data model specified
- [x] Error handling strategy complete
- [x] Testing approach defined
- [x] Risks identified with mitigations
- [x] No open architecture questions
