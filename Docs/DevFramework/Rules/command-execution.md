# Command Execution Rules

**Trigger:** When executing commands

---

## Canary

**When you read this file, output exactly:**

> [CANARY] command-execution rules loaded

---

## CRITICAL: Verify Commands Worked

**After ANY command that modifies files or state:**

1. **Read the actual file** to verify changes were applied
2. **Do NOT trust command output alone** — output can show success while file is unchanged
3. **If verification fails → STOP** — do not proceed to next task

**This is mandatory.** Never skip verification for:

- File edits (git, file creation/deletion)
- Config changes
- Build/test commands that should produce output

---

## Primary Method: Direct Terminal (PowerShell)

The integrated terminal works with PowerShell (not cmd.exe).

**Requirement:** Windsurf settings → Terminal → Default Profile = **PowerShell**

### Terminal Test

Run this test at session start to verify terminal works:

```powershell
New-Item -Path "test-terminal.txt" -Value "test" -Force; Remove-Item "test-terminal.txt"; Write-Host "TERMINAL_OK"
```

**Expected output:** `TERMINAL_OK`

- If test passes → Use `run_command` tool with PowerShell syntax
- If test fails → Try Cascade Watcher fallback

---

## Fallback: Cascade Watcher

Use only if terminal test fails.

### Test if Watcher is Running

1. Check `scripts/watcher/main-status.txt` exists and has recent UPDATED timestamp
2. If no active sessions, write `new` to `scripts/watcher/main-control.txt`
3. Wait and check if session directory is created in `scripts/watcher/`

**If watcher is not running:** Inform user to start it manually (see `Docs/Tooling/BOOTSTRAP.md`)

### Watcher Usage

```
Write command to:   scripts/watcher/<session-id>/command.txt
Poll status from:   scripts/watcher/<session-id>/status.txt
Read output from:   scripts/watcher/<session-id>/output.txt
```

**Watcher uses cmd.exe:** Use `&&` not `;` to chain commands

---

## If Neither Works → STOP

**Do NOT proceed with tasks if commands cannot be executed.**

1. Inform user that command execution is not working
2. Ask user to fix terminal/watcher setup
3. Wait for user confirmation before continuing

**Rationale:** Proceeding without working commands leads to unverified work, silent failures, and wasted effort.

---

## Full Documentation

See `Docs/Tooling/CASCADE_WATCHER.md` for complete watcher setup.
