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

- Read the specified docs from `Docs/AppDocs/DevFramework/DevFramework/DeveloperGuidesAndStandards
/` or `Docs/AppDocs/Features/Specs/`
- Add them to your Doc Inventory

### If no specific docs requested

Proceed directly with the user's task. Use `code_search` or `grep_search` to find relevant code as needed.

---

## After task completion (MANDATORY - DO NOT SKIP)

### 1. Verification

Use watcher to run `npm run verify`, poll status, fix any errors until ALL PASSED. See `Docs/DevFramework/DevFramework/ToolSetup/CASCADE_WATCHER.md`.

### 2. UI Testing

Use MCP Playwright browser (`mcp1_browser_navigate` to `http://localhost:5173`) to test the implemented functionality.

### 3. Git Commit & Push (REQUIRED - NEVER SKIP THIS)

**Follow `Docs/DevFramework/DevFramework/JustInTimeAgentRules/pre-commit.md`** — includes changelog update, commit, and push.

---

## Report format

Start your response with:

```
# Doc Inventory
- .windsurf/rules/* (all rules)
- RULE_MAP.md
- .windsurf/cascade.md
- Docs/DevFramework/DevFramework/DeveloperGuidesAndStandards/IMPLEMENTATION_SPECIFICATION_RULES.md
- [any additional docs the user requested]

Ready for your task.
```
