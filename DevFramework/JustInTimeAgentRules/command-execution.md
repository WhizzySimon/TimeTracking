# Command Execution Rules

**Trigger:** When executing commands

---

## Rule-Loaded Marker

**When you read this file, output exactly:**

> [RULE-LOADED] command-execution rules loaded

---

# Critical (Always Apply)

## Verify Commands Worked

**After ANY command that modifies files or state:**

1. **Read the actual file** to verify changes were applied
2. **Do NOT trust command output alone** — output can show success while file is unchanged
3. **If verification fails → STOP** — do not proceed to next task

**This is mandatory.** Never skip verification for:

- File edits (git, file creation/deletion)
- Config changes
- Build/test commands that should produce output

---

# Important (Context-Dependent)

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

# Standard (Good Practices)

## If Terminal Doesn't Work

If `run_command` fails consistently, inform user and wait for fix.

**Rationale:** Proceeding without working commands leads to unverified work and silent failures.

---

## Priority Guide

- **Critical:** Check at EVERY decision point. Never skip.
- **Important:** Check when context matches.
- **Standard:** Good practices. Can be deprioritized under time pressure.

**This file's priority breakdown:**
- **Critical:** Verify Commands Worked
- **Important:** Primary Method (run_command)
- **Standard:** If Terminal Doesn't Work
