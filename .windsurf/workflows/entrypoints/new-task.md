---
description: Start a new task - reads rules and governance docs, ready for any instruction
---

## Cascade Workflow

### Step 1: Read rules and docs

1. /rules-read-all
2. /read-governance

### Step 2: Ensure on dev branch

Run via watcher:
```
git checkout dev
git pull origin dev
```

### Step 3: Ask for task

Say: "Ready on dev. What would you like me to do?"

### Optional doc loading

If the user specifies docs to read (e.g., "read the UI spec" or "read the backup spec"):

- Read the specified docs from `Docs/Guidelines/` or `Docs/Specs/`
- Add them to your Doc Inventory

### If no specific docs requested

Proceed directly with the user's task. Use `code_search` or `grep_search` to find relevant code as needed.

---

## After task completion (MANDATORY - DO NOT SKIP)

### 1. Verification

Use watcher to run `npm run verify`, poll status, fix any errors until ALL PASSED. See `Docs/Tooling/CASCADE_WATCHER.md`.

### 2. UI Testing

Use MCP Playwright browser (`mcp1_browser_navigate` to `http://localhost:5173`) to test the implemented functionality.

### 3. Git Commit & Push (REQUIRED - NEVER SKIP THIS)

See AGENTS.md "Git workflow" section:
```
git add -A
git commit -m "feat: description"
git push
```

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
