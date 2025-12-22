---
description: Start a new task - reads rules and governance docs, ready for any instruction
---

## Cascade Workflow

Run these steps:

1. /rules-read-all
2. /read-governance

Then:

3. Ask the user: "What would you like me to do? If specific docs are relevant, tell me which ones to read first."

### Optional doc loading

If the user specifies docs to read (e.g., "read the UI spec" or "read the backup spec"):

- Read the specified docs from `Docs/Guidelines/` or `Docs/Specs/`
- Add them to your Doc Inventory

### If no specific docs requested

Proceed directly with the user's task. Use `code_search` or `grep_search` to find relevant code as needed.

---

## After task completion (mandatory)

Follow the verification workflow from `COMMAND_EXECUTION_RULES.md`:

1. **Run verification via Cascade Watcher:**
   - Write `npm run verify` to `scripts/cascade-command.txt`
   - Poll `scripts/cascade-status.txt` until `DONE:SUCCESS` or `DONE:FAILED`
   - Read output from `scripts/cascade-output.txt`
   - Fix any errors and repeat until ALL PASSED

2. **Test UI with MCP Playwright browser:**
   - Use `mcp0_browser_navigate` to open `http://localhost:5173`
   - Use `mcp0_browser_snapshot` to verify UI renders correctly
   - Test the specific functionality that was implemented
   - Check browser console for errors via `mcp0_browser_console_messages`

3. **Commit changes via Cascade Watcher:**
   - Write `git add -A; git commit -m "feat: description"` to `scripts/cascade-command.txt`
   - Poll until `DONE:SUCCESS`
   - Confirm commit succeeded

---

## Report format

Start your response with:

```
# Doc Inventory
- .windsurf/rules/* (all rules)
- Docs/INDEX.md
- AGENTS.md
- .windsurf/cascade.md
- Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md
- [any additional docs the user requested]

Ready for your task.
```
