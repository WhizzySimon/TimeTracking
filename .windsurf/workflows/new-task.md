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

## After task completion (MANDATORY - DO NOT SKIP)

### 1. Verification
Write `npm run verify` to `scripts/cascade-command.txt`, poll status, fix any errors until ALL PASSED.

### 2. UI Testing
Use MCP Playwright browser (`mcp1_browser_navigate` to `http://localhost:5173`) to test the implemented functionality.

### 3. Git Commit (REQUIRED - NEVER SKIP THIS)
```
git add -A; git commit -m "feat: description of changes"
```
Write this to `scripts/cascade-command.txt` and confirm success.

**⚠️ CRITICAL: Never end a session without committing completed work. This is the most commonly forgotten step.**

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
