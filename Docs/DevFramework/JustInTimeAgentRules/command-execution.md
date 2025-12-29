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

## Primary Method: Integrated Terminal (run_command)

**Use the `run_command` tool** for all command execution. The integrated PowerShell terminal works directly.

### Key Points

- Use PowerShell syntax
- Set `Blocking: true` for short commands (verify, git status, etc.)
- Set `Blocking: false` for long-running commands (dev server, tests)
- Always specify `Cwd` (current working directory) - **never use `cd` in commands**

### Example

```
run_command with:
  CommandLine: "npm run verify"
  Cwd: "e:\Private\Dev\Timekeeping\TimeTracker"
  Blocking: true
```

---

## Fallback: Cascade Watcher (deprecated)

Use only if the integrated terminal doesn't work.

**If watcher is needed:** See `Docs/DevFramework/DevFramework/ToolSetup/CASCADE_WATCHER.md` for setup.

**Watcher uses cmd.exe:** Use `&&` not `;` to chain commands

---

## If Terminal Doesn't Work → Try Watcher

If `run_command` fails consistently:

1. Ask user to start the watcher: `powershell -File scripts/watcher-main.ps1`
2. Use watcher file-based command execution (see CASCADE_WATCHER.md)
3. If watcher also fails, inform user and wait for fix

**Rationale:** Proceeding without working commands leads to unverified work and silent failures.

---

## Full Documentation

See `Docs/DevFramework/DevFramework/ToolSetup/CASCADE_WATCHER.md` for watcher fallback setup.
