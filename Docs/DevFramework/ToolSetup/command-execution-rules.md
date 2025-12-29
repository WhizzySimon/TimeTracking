# Command Execution for Cascade

**Last Updated:** December 29, 2025

---

## ✅ Primary Method: Integrated Terminal (`run_command`)

**Cascade uses the integrated PowerShell terminal** via the `run_command` tool.

This is the default and preferred method:

- Commands execute in the IDE's integrated terminal
- Output is visible to Cascade
- Exit codes are reliable
- User approval required for potentially destructive commands

**Example usage:**

```
run_command("npm run verify", cwd="project-root", blocking=true)
```

---

## 🔄 Fallback: Cascade Watcher System

**If the integrated terminal doesn't work**, fall back to the watcher system.

**See `Docs/DevFramework/ToolSetup/CASCADE_WATCHER.md` for complete documentation.**

### Quick Reference

| File                                       | Purpose                                        |
| ------------------------------------------ | ---------------------------------------------- |
| `scripts/watcher/main-control.txt`         | Write control commands (SPAWN, KILL, SHUTDOWN) |
| `scripts/watcher/main-status.txt`          | Read active session IDs                        |
| `scripts/watcher/<session-id>/command.txt` | Write command to execute                       |
| `scripts/watcher/<session-id>/status.txt`  | Poll for DONE:SUCCESS/FAILED                   |
| `scripts/watcher/<session-id>/output.txt`  | Read command output                            |

### Watcher Workflow

1. Start main watcher: `powershell -File scripts/watcher-main.ps1`
2. Write `SPAWN` to `scripts/watcher/main-control.txt`
3. Read session ID from `scripts/watcher/main-status.txt`
4. Write command to `scripts/watcher/<session-id>/command.txt`
5. Poll `status.txt` until `DONE:SUCCESS` or `DONE:FAILED`
6. Read `output.txt` for results

### Command Chaining (cmd.exe syntax)

The watcher uses cmd.exe. Use `&&` not `;`:

```
git add -A && git commit -m "message"   # Correct
git add -A; git commit -m "message"     # WRONG
```

---

## 📦 Code Verification Script

**`npm run verify`** runs `scripts/verify-code.ps1` which:

1. Runs `npm run format` (auto-fix formatting)
2. Runs `npm run check` (TypeScript)
3. Runs `npm run lint` (Prettier + ESLint)
4. Writes all output to `scripts/verify-code-output.txt`
5. Returns exit code 0 (all passed) or 1 (failed)

---

## 🎭 MCP Playwright Testing

After code verification passes, Cascade uses MCP browser tools:

- `mcp0_browser_navigate` - Go to page
- `mcp0_browser_snapshot` - Get page structure
- `mcp0_browser_click` - Interact with elements
- `mcp0_browser_type` - Enter text
- `mcp0_browser_console_messages` - Check for errors

## **Requirement:** Dev server must be running (`npm run dev`)

## 📊 Task Completion Workflow

After completing a task:

1. **Run verification:** `npm run verify`
2. **Test UI:** Use MCP Playwright browser (`mcp1_browser_navigate` to `http://localhost:5173`)
3. **Commit:** `git add -A && git commit -m "feat: description"`
4. **Push:** `git push origin dev`

---

## 🔀 Git Commit Format

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

---

## 🔧 Efficient Editing

- Use `multi_edit` for batch changes to same file
- Never make multiple single-line edits when one batch edit works
