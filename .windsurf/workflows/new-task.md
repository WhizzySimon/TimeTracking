---
description: Start a new task - reads rules and governance docs, ready for any instruction
---

## Cascade Workflow

### Step 0: Watcher Instance (CRITICAL)

If the user specified an instance (e.g., `/new-task A`), use that instance.
Otherwise, ask: **"Which watcher instance are you using? (A or B)"**

Remember the instance for this entire session:

- Instance A: `scripts/watcher/A/command.txt`, `scripts/watcher/A/status.txt`, `scripts/watcher/A/output.txt`
- Instance B: `scripts/watcher/B/command.txt`, `scripts/watcher/B/status.txt`, `scripts/watcher/B/output.txt`

### Step 1: Setup

Run these steps:

1. /rules-read-all
2. /read-governance
3. **Check current branch** - Use watcher to run `git branch --show-current`

### Step 2: Branch Decision (CRITICAL)

**New chat session = new branch.** Create a branch directly from current position:

```
git checkout -b feat/<task-name>
```

**Do NOT go to main first.** See `Docs/Tooling/GIT_WORKFLOW.md` section "Anti-Pattern 1" for why.

**Exception:** If continuing related work in the same chat, you may stay on the current branch and make multiple PRs.

Then:

4. Ask the user: "What would you like me to do? If specific docs are relevant, tell me which ones to read first."

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
