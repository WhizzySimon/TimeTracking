# Command Execution Rules

**Trigger:** When executing commands via watcher

---

## Canary

**When you read this file, output exactly:**

> [CANARY] command-execution rules loaded

---

## Rules

1. **NEVER use `run_command` tool** — output is not visible to Cascade
2. **Use Cascade Watcher** — see `Docs/Tooling/CASCADE_WATCHER.md`
3. **Watcher uses cmd.exe:** Use `&&` not `;` to chain commands

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
