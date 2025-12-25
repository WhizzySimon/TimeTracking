# Cascade Watcher — Usage Guide

**Last Updated:** 2025-12-25

---

## Overview

The Cascade Watcher enables autonomous command execution. Cascade writes commands to a file, the watcher executes them, and Cascade reads the output.

---

## Folder Structure

```
scripts/
├── watcher.ps1              # The watcher script (one script, multiple instances)
└── watcher/                 # Instance files
    ├── A/                   # Instance A files
    │   ├── command.txt
    │   ├── status.txt
    │   └── output.txt
    └── B/                   # Instance B files
        ├── command.txt
        ├── status.txt
        └── output.txt
```

---

## Usage

Start a watcher instance for each Cascade chat session.

### Setup

**Terminal 1 (Chat A):**
```powershell
powershell -File scripts/watcher.ps1 -Instance A
```

**Terminal 2 (Chat B):**
```powershell
powershell -File scripts/watcher.ps1 -Instance B
```

### Files per Instance

| Instance | Command File | Status File | Output File |
|----------|--------------|-------------|-------------|
| A | `scripts/watcher/A/command.txt` | `scripts/watcher/A/status.txt` | `scripts/watcher/A/output.txt` |
| B | `scripts/watcher/B/command.txt` | `scripts/watcher/B/status.txt` | `scripts/watcher/B/output.txt` |

### How Cascade Knows Which Instance to Use

At the start of each chat session, the user tells Cascade which instance to use:

> "Use watcher instance A for this chat."

Cascade then uses the corresponding files:
- Write to `scripts/watcher/A/command.txt`
- Poll `scripts/watcher/A/status.txt`
- Read from `scripts/watcher/A/output.txt`

### Why This Matters

Without separate instances:
- Both chats write to the same command file
- Commands get overwritten or mixed
- One chat's command runs instead of the other's
- Confusion and wasted time

With separate instances:
- Each chat has isolated command/status/output files
- No interference between chats
- Both can run commands simultaneously

---

## Workflow

1. Cascade writes command to `scripts/watcher/A/command.txt`
2. Watcher detects and executes it
3. Output written to `scripts/watcher/A/output.txt`
4. Status written to `scripts/watcher/A/status.txt`
5. Cascade polls status until DONE:SUCCESS or DONE:FAILED
6. Cascade reads output and continues

---

## Command Syntax Rules

### One command per execution

The watcher executes one command at a time. Do not chain commands with `;` or `&&`.

**BAD:**
```
git add -A; git commit -m "message"
```

**GOOD:**
```
git add -A
```
(then wait for completion, then write next command)

### No semicolons

Semicolons are PowerShell statement separators, not cmd.exe. The watcher uses `cmd.exe /c`.

### Status values

| Status | Meaning |
|--------|---------|
| `IDLE` | Watcher is waiting for a command |
| `RUNNING` | Command is currently executing |
| `DONE:SUCCESS` | Command completed with exit code 0 |
| `DONE:FAILED` | Command completed with non-zero exit code |

---

## Common Pitfalls

### 1. Editing command.txt while watcher is processing

Wait for status to be `DONE:*` before writing the next command.

### 2. Forgetting to check status

Always poll `status.txt` before reading `output.txt`.

### 3. Long-running commands

E2E tests can take minutes. The watcher will show `RUNNING` until complete.

---

## Troubleshooting

### Watcher not picking up commands

- Check if watcher is running (look for terminal output)
- Restart watcher if needed

### Command fails silently

- Check `output.txt` for error messages
- Check exit code in output

### Cache issues with edit tool

If Cascade's edit tool says the file is empty but it's not:
- Restart Windsurf (Reload Window)
- The edit tool caches file contents
