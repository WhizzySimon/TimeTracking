---
description: Start a new task - reads rules and governance docs, ready for any instruction
---

## Cascade Workflow

### Step 1: Read rules and docs

1. /rules-read-all
2. /read-governance

### Step 2: SAFE SWITCH CHECK (MANDATORY - BLOCKS if work would be lost)

Run via watcher:
```
powershell -File scripts/git/safe-switch.ps1
```

**If exit code is 1 (FAILED):**
- DO NOT proceed
- DO NOT switch branches
- Fix the issues shown (commit, push, create PR)
- Run safe-switch.ps1 again until it passes

**If exit code is 0 (SUCCESS):**
- Safe to proceed to Step 3

### Step 3: Clean up and prepare

Run via watcher:
```
git checkout main
git pull origin main
powershell -File scripts/git/cleanup-branches.ps1
```

This automatically:
- Switches to main
- Pulls latest changes
- Deletes local branches that have been merged (cleanup after previous sessions)

### Step 4: Ask for task

Say: "Ready on main. What would you like me to do?"

### Branch Rule (CRITICAL)

Before starting any work:

- If on `main`: Create a new feature branch for this task (e.g., `feat/P10-task-name`)
- If on a feature branch: Verify no other chat is using this branch
- **Each chat session MUST use its own unique branch**
- See `Docs/Tooling/GIT_WORKFLOW.md` section "Parallel Chat Sessions" for details

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

See AGENTS.md "Definition of done for a task" for the commit & push workflow.

### 4. Check CI Status (OPTIONAL but recommended)

After push, check if CI passes:

```
powershell -File scripts/git/check-ci.ps1 -Wait -Logs
# See Docs/Tooling/GIT_WORKFLOW.md for script locations
```

This will:

- Wait for the GitHub Actions run to complete
- Show PASSED/FAILED status
- Display failed job logs if CI fails

If CI fails, read the logs and fix the issues before ending the session.

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
