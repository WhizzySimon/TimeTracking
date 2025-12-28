# Command Execution Rules

**Trigger:** When executing commands

---

## Canary

**When you read this file, output exactly:**

> [CANARY] command-execution rules loaded

---

## Terminal Test (Run First)

Before executing commands, run this safe test to verify terminal works:

```powershell
New-Item -Path "test-terminal.txt" -Value "test" -Force; Remove-Item "test-terminal.txt"; Write-Host "TERMINAL_OK"
```

**Expected output:** `TERMINAL_OK`

- If test passes → Use `run_command` tool directly
- If test fails or no output → Use Cascade Watcher (fallback)

---

## Rules

### Primary: Direct Terminal (PowerShell)

1. **Test terminal first** using the test above
2. **If working:** Use `run_command` tool with PowerShell syntax
3. **Requires:** Windsurf settings → Terminal → Default Profile = PowerShell

### Fallback: Cascade Watcher

Use watcher if terminal test fails:

1. **Use Cascade Watcher** — see `Docs/Tooling/CASCADE_WATCHER.md`
2. **Watcher uses cmd.exe:** Use `&&` not `;` to chain commands

---

## Watcher Usage

Write command to:

```
scripts/watcher/<session-id>/command.txt
```

Poll status from:

```
scripts/watcher/<session-id>/status.txt
```

Read output from:

```
scripts/watcher/<session-id>/output.txt
```

For verification, also check:

```
scripts/verify-code-output.txt
```

---

## Full Documentation

See `Docs/Tooling/CASCADE_WATCHER.md` for complete watcher setup and usage.
